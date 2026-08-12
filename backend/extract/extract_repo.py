"""Database access for Stage 6 (extract events & actions).

Reads the items that are linked to a project but not yet extracted, inserts the
extracted project_events / project_actions, and marks the item extracted. AI
rows carry user_edited=false so a re-run can clear them without touching rows a
user has edited.
"""

from __future__ import annotations

from dataclasses import dataclass, field

import psycopg


@dataclass
class ExtractItem:
    id: str
    project_id: str
    source_type: str
    title: str
    sender: str | None
    participants: list[str] = field(default_factory=list)
    occurred_at: object = None
    extracted_text: str | None = None
    color: str = "#4263eb"


def fetch_queue(database_url: str, user_id: str, limit: int = 500) -> list[ExtractItem]:
    """Linked items not yet extracted (one row per item, highest-confidence link)."""
    with psycopg.connect(database_url) as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                select distinct on (si.id)
                    si.id, l.project_id, si.source_type, si.title, si.sender,
                    si.participants, si.occurred_at, si.extracted_text, p.color
                from public.source_items si
                join public.project_source_links l on l.source_item_id = si.id
                join public.projects p on p.id = l.project_id
                where si.user_id = %s and si.extracted_at is null
                order by si.id, l.confidence desc nulls last
                limit %s
                """,
                (user_id, limit),
            )
            rows = cursor.fetchall()
    return [
        ExtractItem(
            id=str(r[0]), project_id=str(r[1]), source_type=r[2],
            title=r[3] or "", sender=r[4], participants=r[5] or [],
            occurred_at=r[6], extracted_text=r[7], color=r[8] or "#4263eb",
        )
        for r in rows
    ]


def insert_event(database_url, user_id, project_id, source_item_id, event, color) -> None:
    with psycopg.connect(database_url) as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                insert into public.project_events
                    (user_id, project_id, source_item_id, event_type, title,
                     body, person, event_date, confidence, user_edited, color)
                values (%s, %s, %s, %s, %s, %s, %s, coalesce(%s, now()), %s, false, %s)
                """,
                (user_id, project_id, source_item_id, event["event_type"],
                 event["title"], event["body"], event["person"],
                 event["event_date"], round(event["confidence"], 4), color),
            )


def insert_action(database_url, user_id, project_id, source_item_id, action, color) -> None:
    with psycopg.connect(database_url) as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                insert into public.project_actions
                    (user_id, project_id, source_item_id, title, assignee,
                     due_date, completed, confidence, user_edited, color)
                values (%s, %s, %s, %s, %s, %s, false, %s, false, %s)
                """,
                (user_id, project_id, source_item_id, action["title"],
                 action["assignee"], action["due_date"],
                 round(action["confidence"], 4), color),
            )


def mark_extracted(database_url: str, item_id: str) -> None:
    with psycopg.connect(database_url) as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                update public.source_items
                set extracted_at = now(),
                    processing_status = 'processed',
                    updated_at = now()
                where id = %s
                """,
                (item_id,),
            )


def reset(database_url: str, user_id: str) -> dict:
    """Delete AI-generated (not user-edited) events/actions and re-queue items."""
    with psycopg.connect(database_url) as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                "delete from public.project_events "
                "where user_id = %s and user_edited = false",
                (user_id,),
            )
            events = cursor.rowcount
            cursor.execute(
                "delete from public.project_actions "
                "where user_id = %s and user_edited = false",
                (user_id,),
            )
            actions = cursor.rowcount
            cursor.execute(
                """
                update public.source_items
                set extracted_at = null
                where user_id = %s
                  and id in (select source_item_id from public.project_source_links
                             where user_id = %s)
                """,
                (user_id, user_id),
            )
            requeued = cursor.rowcount
    return {"events_deleted": events, "actions_deleted": actions, "requeued": requeued}


def progress(database_url: str, user_id: str) -> dict:
    with psycopg.connect(database_url) as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                select
                    (select count(*) from public.project_events
                       where user_id = %(u)s) as events,
                    (select count(*) from public.project_actions
                       where user_id = %(u)s) as actions,
                    (select count(*) from public.source_items si
                       join public.project_source_links l on l.source_item_id = si.id
                       where si.user_id = %(u)s and si.extracted_at is null) as queued
                """,
                {"u": user_id},
            )
            row = cursor.fetchone()
    return {"events": row[0], "actions": row[1], "queued": row[2]}
