"""Stage 5 orchestrator: Group & Link to Projects.

Builds project clusters from the Stage 4 relationship graph, asks Claude
(Sonnet 5) to name + summarize each cluster, creates AI projects, and links
their items via project_source_links (match_method='ai', review_status='pending').

  preview  cluster only, show groups + proposed sizes (no writes, no LLM cost)
  run      name clusters and write projects + links   [--reset] [--min-size N]
  status   AI project / link counts
  show     list AI projects with linked-item counts

Commands:
  python3 backend/grouping/group.py preview --user-id <uuid>
  python3 backend/grouping/group.py run --user-id <uuid> --reset
  python3 backend/grouping/group.py status --user-id <uuid>
  python3 backend/grouping/group.py show --user-id <uuid>
"""

from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
sys.path.insert(0, str(HERE.parent / "auth"))

import clustering
import config as config_mod
import grouping_repo as repo
import llm_namer

# A small palette for AI-created project cards.
_PALETTE = [
    ("#4263eb", "#eef2ff"), ("#0ca678", "#e6fcf5"), ("#f76707", "#fff4e6"),
    ("#ae3ec9", "#f8f0fc"), ("#e64980", "#fff0f6"), ("#1c7ed6", "#e7f5ff"),
    ("#f59f00", "#fff9db"), ("#37b24d", "#ebfbee"),
]


def _resolve_user_id(cfg, explicit: str | None) -> str | None:
    user_id = (explicit or cfg.default_test_user_id or "").strip()
    if not user_id or user_id == "00000000-0000-0000-0000-000000000000":
        return None
    return user_id


def _member_initials(items) -> list[str]:
    seen: list[str] = []
    for item in items:
        people = list(item.participants or [])
        if item.sender:
            people.append(item.sender)
        for email in people:
            local = (email or "").split("@")[0]
            initials = "".join(part[:1] for part in local.replace(".", " ").split()[:2]).upper()
            if initials and initials not in seen:
                seen.append(initials)
            if len(seen) >= 5:
                return seen
    return seen


def _build_clusters(cfg, user_id, min_score, min_size):
    items = repo.fetch_included(cfg.database_url, user_id)
    edges = repo.fetch_edges(cfg.database_url, user_id, min_score)
    components = clustering.connected_components(list(items), edges, min_score)
    clusters = [c for c in components if len(c) >= min_size]
    return items, edges, clusters


def cmd_preview(args, cfg) -> int:
    user_id = _resolve_user_id(cfg, args.user_id)
    if not user_id:
        print("Need a user. Pass --user-id or set DEFAULT_TEST_USER_ID.")
        return 1
    items, edges, clusters = _build_clusters(cfg, user_id, args.threshold, args.min_size)
    if not clusters:
        print(f"No clusters of size >= {args.min_size} at threshold {args.threshold}.")
        return 0
    print(f"{len(clusters)} cluster(s) of size >= {args.min_size} "
          f"(threshold {args.threshold}); no writes, no LLM calls:\n")
    for i, member_ids in enumerate(clusters, 1):
        members = [items[mid] for mid in member_ids]
        cohesion = clustering.cluster_cohesion(set(member_ids), edges)
        print(f"  Cluster {i}: {len(members)} items, cohesion {cohesion:.2f}")
        for m in members[:6]:
            print(f"     - [{m.source_type}] {(m.title or '(no title)')[:60]}")
        if len(members) > 6:
            print(f"     ... and {len(members) - 6} more")
    return 0


def cmd_run(args, cfg) -> int:
    user_id = _resolve_user_id(cfg, args.user_id)
    if not user_id:
        print("Need a user. Pass --user-id or set DEFAULT_TEST_USER_ID.")
        return 1

    existing = repo.ai_projects_exist(cfg.database_url, user_id)
    if existing and not args.reset:
        print(f"{existing} AI project(s) already exist. Re-run with --reset to "
              "rebuild them (user-created projects are left untouched).")
        return 1
    if args.reset and existing:
        removed = repo.delete_ai_projects(cfg.database_url, user_id)
        print(f"Reset: removed {removed} AI project(s) and their links.")

    items, edges, clusters = _build_clusters(cfg, user_id, args.threshold, args.min_size)
    if not clusters:
        print(f"No clusters of size >= {args.min_size} to group.")
        return 0

    api_key = os.getenv("ANTHROPIC_API_KEY", "").strip()
    model = os.getenv("ANTHROPIC_MODEL", llm_namer.DEFAULT_MODEL).strip() or llm_namer.DEFAULT_MODEL
    if api_key and not api_key.endswith("REPLACE_ME"):
        print(f"Naming {len(clusters)} cluster(s) with {model} ...")
    else:
        api_key = ""
        print(f"No ANTHROPIC_API_KEY set - using offline keyword names for "
              f"{len(clusters)} cluster(s).")

    created = 0
    for idx, member_ids in enumerate(clusters):
        members = [items[mid] for mid in member_ids]
        cohesion = clustering.cluster_cohesion(set(member_ids), edges)
        item_dicts = [
            {
                "source_type": m.source_type, "title": m.title,
                "sender": m.sender, "occurred_at": str(m.occurred_at or ""),
                "excerpt": m.excerpt,
            }
            for m in members
        ]
        named = llm_namer.name_project(item_dicts, api_key=api_key, model=model)
        color, soft = _PALETTE[idx % len(_PALETTE)]
        project_id = repo.create_project(
            cfg.database_url, user_id,
            name=named["name"], symbol=named["symbol"], summary=named["summary"],
            color=color, soft_color=soft, members=_member_initials(members),
            category=named.get("category", "project"),
        )
        # Link confidence blends structural cohesion with the LLM's coherence.
        confidence = round(min(1.0, 0.5 * cohesion + 0.5 * named["coherence"]), 4)
        explanation = (
            f"Grouped by semantic + deterministic similarity "
            f"(cohesion {cohesion:.2f}, model coherence {named['coherence']:.2f})."
        )
        for m in members:
            repo.link_item(
                cfg.database_url, user_id, project_id, m.id,
                confidence=confidence, explanation=explanation,
            )
        created += 1
        print(f"  + {named['symbol']} {named['name']}  "
              f"({len(members)} items, confidence {confidence:.2f})")

    print(f"\nCreated {created} AI project(s).")
    return 0


def cmd_status(args, cfg) -> int:
    user_id = _resolve_user_id(cfg, args.user_id)
    if not user_id:
        print("Need a user. Pass --user-id or set DEFAULT_TEST_USER_ID.")
        return 1
    counts = repo.progress(cfg.database_url, user_id)
    print("Stage 5 grouping progress")
    print("-" * 34)
    print(f"  AI projects:     {counts['ai_projects']}")
    print(f"  AI links:        {counts['ai_links']}")
    print(f"  included items:  {counts['included_items']}")
    return 0


def cmd_show(args, cfg) -> int:
    user_id = _resolve_user_id(cfg, args.user_id)
    if not user_id:
        print("Need a user. Pass --user-id or set DEFAULT_TEST_USER_ID.")
        return 1
    rows = repo.list_ai_projects(cfg.database_url, user_id)
    if not rows:
        print("No AI projects yet. Run `group.py run` first.")
        return 0
    print(f"AI projects ({len(rows)}):\n")
    for name, symbol, summary, items, avg_conf in rows:
        print(f"  {symbol}  {name}  ({items} items, avg confidence {avg_conf})")
        if summary:
            print(f"        {summary[:100]}")
    return 0


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Stage 5 Group & Link to Projects.")
    sub = parser.add_subparsers(dest="command", required=True)
    for name, help_text in [
        ("preview", "Cluster only (no writes, no LLM calls)."),
        ("run", "Name clusters and write projects + links."),
        ("status", "AI project / link counts."),
        ("show", "List AI projects."),
    ]:
        p = sub.add_parser(name, help=help_text)
        p.add_argument("--user-id", dest="user_id", default=None)
        if name in ("preview", "run"):
            p.add_argument("--threshold", type=float, default=0.5,
                           help="Min combined_score for an edge to connect items.")
            p.add_argument("--min-size", dest="min_size", type=int, default=2,
                           help="Minimum cluster size to become a project.")
        if name == "run":
            p.add_argument("--reset", action="store_true",
                           help="Delete existing AI projects before rebuilding.")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    cfg = config_mod.load_config()
    return {
        "preview": cmd_preview,
        "run": cmd_run,
        "status": cmd_status,
        "show": cmd_show,
    }[args.command](args, cfg)


if __name__ == "__main__":
    raise SystemExit(main())
