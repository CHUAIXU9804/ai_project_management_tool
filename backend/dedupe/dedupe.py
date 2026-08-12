"""Stage 3 orchestrator: Clean & Deduplicate.

Consumes normalized rows (normalized_at set, deduped_at NULL) and decides, for
each, whether it proceeds to AI grouping. Excluded rows are kept and retrievable
but flagged out of grouping with a reason:

  - noise               newsletters / automated notifications (per-row rule)
  - recurring_instance  extra instances of a recurring calendar series
  - duplicate           same content_hash as an earlier kept item

Precedence when several apply: noise > recurring_instance > duplicate. One
representative per recurring series / duplicate group stays included.

Commands:
  python3 backend/dedupe/dedupe.py run       [--user-id <uuid>] [--limit N]
  python3 backend/dedupe/dedupe.py preview    [--user-id <uuid>] [--limit N]
  python3 backend/dedupe/dedupe.py status     [--user-id <uuid>]
"""

from __future__ import annotations

import argparse
import os
import sys
from collections import defaultdict
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
sys.path.insert(0, str(HERE.parent / "auth"))

import classification as cl
import config as config_mod
import dedupe_repo
import relevance_gate


def _resolve_user_id(cfg, explicit: str | None) -> str | None:
    user_id = (explicit or cfg.default_test_user_id or "").strip()
    if not user_id or user_id == "00000000-0000-0000-0000-000000000000":
        return None
    return user_id


def _rep_key(row):
    """Sort key to choose a group's representative: earliest occurrence wins."""
    if row.occurred_at is not None:
        return (0, row.occurred_at, str(row.id))
    return (1, row.created_at, str(row.id))


def decide(rows, noise_override: set | None = None) -> tuple[dict, dict]:
    """Compute per-row (hash, reason). Returns (hash_by_id, reason_by_id).

    reason_by_id only contains excluded rows; absence means included.
    `noise_override` holds ids the LLM gate cleared as relevant -- they are
    treated as not-noise even if the deterministic rule flags them.
    """
    override = noise_override or set()
    hash_by_id: dict = {}
    reason_by_id: dict = {}

    # 1) Per-row noise (highest precedence), unless the gate cleared it.
    for row in rows:
        hash_by_id[row.id] = cl.content_hash(
            row.source_type, row.title, row.extracted_text
        )
        if row.id not in override and cl.is_noise(
            row.sender, row.title, row.extracted_text
        ):
            reason_by_id[row.id] = "noise"

    # 2) Collapse recurring calendar series (keep one representative).
    series = defaultdict(list)
    for row in rows:
        if row.source_type == "google_calendar" and row.external_thread_id:
            series[(row.connection_id, row.external_thread_id)].append(row)
    for group in series.values():
        if len(group) < 2:
            continue
        rep = min(group, key=_rep_key)
        for row in group:
            if row.id != rep.id and row.id not in reason_by_id:
                reason_by_id[row.id] = "recurring_instance"

    # 3) Content-hash duplicates (keep the earliest representative).
    by_hash = defaultdict(list)
    for row in rows:
        h = hash_by_id.get(row.id)
        if h:
            by_hash[h].append(row)
    for group in by_hash.values():
        if len(group) < 2:
            continue
        rep = min(group, key=_rep_key)
        for row in group:
            if row.id != rep.id and row.id not in reason_by_id:
                reason_by_id[row.id] = "duplicate"

    return hash_by_id, reason_by_id


def _gate_clear(rows, smart: bool) -> set:
    """Return ids the LLM gate keeps: borderline (noise-flagged) but relevant.

    Only runs when `smart` is set and an API key is present, and only on rows the
    deterministic rule would drop -- so cost is bounded to borderline items.
    """
    if not smart:
        return set()
    api_key = os.getenv("ANTHROPIC_API_KEY", "").strip()
    if not api_key or api_key.endswith("REPLACE_ME"):
        print("--smart set but no ANTHROPIC_API_KEY; skipping the LLM gate.")
        return set()
    model = os.getenv("ANTHROPIC_GATE_MODEL", relevance_gate.DEFAULT_GATE_MODEL).strip()
    borderline = [
        r for r in rows if cl.is_noise(r.sender, r.title, r.extracted_text)
    ]
    if not borderline:
        return set()
    print(f"LLM gate: reviewing {len(borderline)} borderline item(s) with {model} ...")
    cleared = set()
    for row in borderline:
        if relevance_gate.is_relevant(
            row.sender, row.title, row.extracted_text, api_key=api_key, model=model
        ):
            cleared.add(row.id)
    print(f"LLM gate: kept {len(cleared)} of {len(borderline)} as relevant.")
    return cleared


def cmd_run(args, cfg) -> int:
    cfg.require_complete()
    user_id = _resolve_user_id(cfg, args.user_id)
    rows = dedupe_repo.fetch_queue(cfg.database_url, user_id, limit=args.limit)
    if not rows:
        print("Nothing to deduplicate. Queue is empty.")
        return 0

    cleared = _gate_clear(rows, args.smart)
    hash_by_id, reason_by_id = decide(rows, noise_override=cleared)
    tally = {"included": 0, "noise": 0, "recurring_instance": 0, "duplicate": 0}
    for row in rows:
        reason = reason_by_id.get(row.id)
        dedupe_repo.apply_decision(
            cfg.database_url,
            row.id,
            content_hash=hash_by_id.get(row.id),
            include_in_grouping=reason is None,
            exclusion_reason=reason,
        )
        tally[reason or "included"] += 1

    print(f"Processed {len(rows)} row(s):")
    print(f"  included (ready for grouping): {tally['included']}")
    print(f"  excluded - noise:              {tally['noise']}")
    print(f"  excluded - recurring_instance: {tally['recurring_instance']}")
    print(f"  excluded - duplicate:          {tally['duplicate']}")
    return 0


def cmd_preview(args, cfg) -> int:
    """Dry run: show the decision for each queued row without writing."""
    cfg.require_complete()
    user_id = _resolve_user_id(cfg, args.user_id)
    rows = dedupe_repo.fetch_queue(cfg.database_url, user_id, limit=args.limit)
    if not rows:
        print("Nothing pending to preview.")
        return 0
    cleared = _gate_clear(rows, args.smart)
    _, reason_by_id = decide(rows, noise_override=cleared)
    for row in rows:
        reason = reason_by_id.get(row.id) or "INCLUDE"
        who = row.sender or "(no sender)"
        print(f"  {reason:<18} [{row.source_type}] {who:<34} {row.title[:44]!r}")
    print("\n(preview only - no rows were modified)")
    return 0


def cmd_status(args, cfg) -> int:
    cfg.require_complete()
    user_id = _resolve_user_id(cfg, args.user_id)
    counts = dedupe_repo.progress(cfg.database_url, user_id)
    print("Stage 3 dedupe/clean progress")
    print("-" * 34)
    print(f"  queued (not yet deduped): {counts['queued']}")
    print(f"  included for grouping:    {counts['included']}")
    print(f"  excluded - duplicate:     {counts['duplicate']}")
    print(f"  excluded - recurring:     {counts['recurring_instance']}")
    print(f"  excluded - noise:         {counts['noise']}")
    return 0


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Stage 3 Clean & Deduplicate.")
    sub = parser.add_subparsers(dest="command", required=True)
    for name, help_text in [
        ("run", "Apply dedupe/clean decisions to the queue."),
        ("preview", "Dry-run the decisions (no writes)."),
        ("status", "Show dedupe counts."),
    ]:
        p = sub.add_parser(name, help=help_text)
        p.add_argument("--user-id", dest="user_id", default=None)
        if name in ("run", "preview"):
            p.add_argument("--limit", type=int, default=1000)
            p.add_argument("--smart", action="store_true",
                           help="Use the LLM gate (Haiku 4.5) on borderline "
                                "noise items to keep genuine tasks/opportunities.")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    cfg = config_mod.load_config()
    return {
        "run": cmd_run,
        "preview": cmd_preview,
        "status": cmd_status,
    }[args.command](args, cfg)


if __name__ == "__main__":
    raise SystemExit(main())
