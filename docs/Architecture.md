# Backend Workflow Architecture

## Purpose

Let an authorized user connect **Gmail** and **Google Calendar**, then have the
system automatically turn scattered messages and events into **projects**,
**timelines**, and **action items** — without the user searching manually.

Concretely, once a user is logged in and has integrated Gmail / Google Calendar,
the app should:

- Scan emails and calendar events.
- Group semantically related items into the same project — using deterministic
  rules first (same sender, shared project name/keywords, thread, participants,
  time window) and an LLM second for meaning-based relationships across
  messages that are **not** necessarily in the same thread.
- Reconstruct a project **timeline**: progress by day, most recent action
  items, and who the conversations were with.

This document defines the backend **stages** that carry data from a connected
account to the dashboard. The stages follow the pipeline recommended in
`Formatted_AI_Project_Memory_Four_Phase_Planning_Guide.txt` (Phase 2):

> ingestion → extraction/normalization → relationship detection → project
> grouping → event/action extraction → timeline generation → user review →
> dashboard

and are aligned with the existing Supabase schema in
`backend/database/supabase_queries.json`.

## Guiding principles (from Phase 2)

- **Deterministic first, LLM second.** Use sender, participants, thread IDs,
  timestamps, and explicit project names to pre-filter; use embeddings + LLM
  only to decide semantic relationships the rules cannot.
- **Everything stays source-linked.** Every event, action, and match keeps a
  `source_item_id` and a `source_url` so the user can open the original.
- **Every AI decision carries a confidence and an explanation** (`confidence`,
  `explanation` columns) and is presented for review before it is trusted.
- **User corrections are captured as feedback** (`user_corrections`) and used
  for evaluation before changing model behavior — never applied silently.
- **Gmail is added first, Google Calendar second**, because Gmail supplies
  content, participants, timestamps, threads, and attachments in one source.

---

## Stage map

| # | Stage | Reads | Writes | Main tech |
|---|-------|-------|--------|-----------|
| 0 | Connect & authorize | user request | `source_connections` | Google OAuth 2.0 |
| 1 | Ingest / sync | `source_connections` | raw payloads (queue) | Gmail API, Calendar API |
| 2 | Extract & normalize | raw payloads | `source_items` (`pending`) | parsers, MIME/text extraction |
| 3 | Clean & deduplicate | `source_items` | `source_items` (`processing`) | rules, hashing |
| 4 | Embed & detect relationships | `source_items` | vector store + candidates | embeddings, similarity |
| 5 | Group & link to projects | candidates | `projects`, `project_source_links` | rules + LLM |
| 6 | Extract events & actions | `source_items`, links | `project_events`, `project_actions` | LLM extraction |
| 7 | Assemble timeline | events, actions, links | dashboard read models | SQL queries |
| 8 | User review & feedback | dashboard edits | `user_corrections`, updates | app + RLS |
| 9 | Scheduling, retry, errors | all of the above | status columns | worker/cron |

---

## Stage 0 — Connect & authorize

**Goal:** obtain and store per-user permission to read Gmail and Calendar.

- User initiates OAuth from the dashboard; request read-only scopes
  (`gmail.readonly`, `calendar.readonly` / `calendar.events.readonly`).
- Store **non-secret** connection metadata in `source_connections`
  (`provider`, `provider_account_id`, `account_email`, `status`).
- Store OAuth **refresh/access tokens as secrets in the backend only**
  (never in the browser or in `source_connections`), keyed by connection id.
- Set `status = 'active'`; on token failure set `'expired'` / `'error'` and
  surface a reconnect prompt.

**Done when:** an `active` row exists per connected provider for the user.

## Stage 1 — Ingest / sync

**Goal:** pull new and changed items from each connected account, incrementally.

- **Gmail:** first run does a bounded backfill (e.g. last N days); later runs use
  the Gmail **History API** with the stored `sync_cursor` (historyId) to fetch
  only deltas. Capture message id, thread id, headers, body, attachments.
- **Google Calendar:** use `syncToken` (also stored in `sync_cursor`) for
  incremental sync; capture event id, title, description, attendees,
  start/end times, location, and recurrence.
- Persist `last_synced_at`; advance `sync_cursor` only after a batch is safely
  handed to Stage 2. On sync error, record `last_error` and keep the old cursor.

**Done when:** raw payloads for new/changed items are queued for normalization.

## Stage 2 — Extract & normalize

**Goal:** turn heterogeneous payloads into one uniform row shape.

- Write one `source_items` row per message/event with
  `processing_status = 'pending'`:
  - Gmail → `source_type = 'gmail'`, fill `sender`, `participants`,
    `external_thread_id`, `occurred_at`, attachment refs.
  - Calendar → `source_type = 'google_calendar'`, fill `participants`
    (attendees), `occurred_at`/`ends_at`, `location`.
- Extract plain text into `extracted_text`; strip signatures, quoted reply
  chains, and HTML boilerplate. Store a short `text_excerpt` (≤ 2000 chars).
- Preserve `external_id` + `source_url` for source-linking and idempotency
  (the `unique (connection_id, external_id)` constraint prevents duplicates).

**Done when:** every ingested item is a normalized `source_items` row.

## Stage 3 — Clean & deduplicate

**Goal:** avoid double-counting and reduce noise before AI work.

- Set `processing_status = 'processing'` while a worker owns the row.
- Deduplicate forwarded/quoted email history and re-synced items by
  `(connection_id, external_id)` and by content hash of `extracted_text`.
- Collapse recurring calendar events into a series with instances so a weekly
  standup does not create dozens of unrelated timeline entries.
- Drop obvious non-project noise (newsletters, automated notifications) via
  simple rules; keep them retrievable but out of grouping by default.

**Done when:** clean, de-duplicated text is ready for embedding.

## Stage 4 — Embed & detect relationships

**Goal:** find which items are candidates for the same project.

- **Deterministic signals first** (cheap, high-precision):
  same `external_thread_id`, overlapping `participants`/`sender`, shared
  explicit project name/keyword, close `occurred_at` windows.
- **Semantic signals second:** compute an embedding of `extracted_text`, store
  it in a vector store (Supabase `pgvector`), and retrieve nearest neighbors.
- Combine both into scored **candidate pairs/clusters**. Deterministic matches
  raise confidence; embeddings catch related items that use different wording
  or live in separate threads/tools (messages need not be in one thread).

**Done when:** each item has a ranked set of candidate relationships + scores.

## Stage 5 — Group & link to projects

**Goal:** assign items to a project, creating projects as needed.

- Cluster candidates into project groups. For ambiguous clusters, ask the LLM
  to confirm/split and to **name and summarize** the project.
- Upsert into `projects`; link each item via `project_source_links` with:
  - `match_method` = `rule` | `ai` | `manual`,
  - `confidence` (0–1) and a short `explanation`,
  - `review_status = 'pending'` for AI/rule matches.
- **Multi-project items:** allowed — write multiple `project_source_links`
  rows (per Phase 1: "update the information in both project lists").
- Low-confidence links are still written but flagged for Stage 8 review.

**Done when:** every processed item links to at least one project with a score.

## Stage 6 — Extract events & actions

**Goal:** populate the timeline and the task list.

- For each item (with project context), run LLM extraction to produce:
  - `project_events` rows typed as `email` / `file` / `meeting` / `decision`
    / `deadline` / `status` / `note`, each with `event_date`, `title`, `body`,
    `person`, `confidence`, and its `source_item_id`. `event_date` + `person`
    are what drive "progress by day" and "who we talked with".
  - `project_actions` rows with `title`, `assignee`, `due_date`, `completed`,
    `confidence`, and `source_item_id` — the "most recent action items".
- Set `source_items.processing_status = 'processed'`.
- Keep `user_edited = false` so later re-processing knows it may overwrite
  AI-generated (but not user-edited) rows.

**Done when:** the project has timeline events and action items, all
source-linked.

## Stage 7 — Assemble timeline (dashboard read)

**Goal:** serve a chronological, filterable project view.

- Read models (via `create_mvp_indexes`): events ordered by
  `event_date desc`, actions by `due_date`, links by project.
- Per project expose: summary, participants, timeline (progress by day), open
  vs. done actions, next deadline, and a confidence/uncertainty indicator.
- Every entry links back to its `source_url` for one-click verification.

**Done when:** the dashboard can render a project without re-running the pipeline.

## Stage 8 — User review & correction feedback

**Goal:** let users trust and correct the output; capture that as signal.

- User actions map to `user_corrections.correction_type`:
  `confirm_match`, `reject_match`, `move_project`, `edit_event`, `edit_action`.
- On confirm/reject, update `project_source_links.review_status`.
- On edit, update the `project_events` / `project_actions` row and set
  `user_edited = true` so re-processing will not overwrite it.
- Store `previous_value` / `corrected_value` as JSONB for evaluation. Use these
  to measure accuracy and tune rules/prompts **before** changing behavior
  automatically (Phase 2 principle).

**Done when:** corrections are persisted and protected from being overwritten.

## Stage 9 — Scheduling, retry & error handling (cross-cutting)

**Goal:** keep the pipeline reliable and current.

- **Scheduling:** periodic incremental sync per active connection (Stage 1);
  optional Gmail push (Pub/Sub) later.
- **Idempotency:** all stages are safe to re-run — keyed by `external_id`,
  content hash, and `processing_status`.
- **Retry:** transient API/model failures back off and retry; on repeated
  failure set `source_items.processing_status = 'failed'` +
  `processing_error`, or `source_connections.status = 'error'` + `last_error`.
- **Isolation:** a single bad item never blocks the batch; failures are
  quarantined and surfaced, not silently dropped.

**Done when:** failures are visible, recoverable, and non-blocking.

---

## MVP sequencing (what to build first)

Aligned with Phase 3 ("add one integration first; Gmail is the strongest
initial candidate"):

1. **Stages 2–8 on uploaded/exported email first** — validate normalization,
   grouping, extraction, timeline, and review with no live auth.
2. **Add Stage 0–1 for Gmail** once the core pipeline passes evaluation.
3. **Add Google Calendar** to enrich meetings and dates.
4. **Defer** Slack/Discord and images/audio until the text workflow is reliable.

## Data model reference

Backing tables (see `backend/database/supabase_queries.json`):
`source_connections`, `source_items`, `projects`, `project_source_links`,
`project_events`, `project_actions`, `user_corrections`, `profiles` — all
user-scoped and protected by Row Level Security.
