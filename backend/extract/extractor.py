"""Extract timeline events and action items from one item (Stage 6, Haiku 4.5).

Given a single source item (email or calendar event) with its project context,
asks a cheap model for a small set of typed timeline events and actionable
to-dos. Normalizes the result (event types, dates, persons) so the caller can
insert directly. Falls back to a single metadata-derived event when no API key
is set or a call fails, so extraction never blocks the pipeline.
"""

from __future__ import annotations

import json
import re
from datetime import date, datetime, timezone

DEFAULT_EXTRACT_MODEL = "claude-haiku-4-5"

_EVENT_TYPES = {"email", "file", "meeting", "decision", "deadline", "status", "note"}

_SYSTEM = (
    "You extract structured timeline events and action items from a single work "
    "item (an email or a calendar event). Reply with ONLY a JSON object, no prose."
)


def _prompt(item: dict) -> str:
    return (
        "Item:\n"
        f"  type: {item.get('source_type')}\n"
        f"  subject/title: {item.get('title') or '(none)'}\n"
        f"  from: {item.get('sender') or '(unknown)'}\n"
        f"  participants: {', '.join(item.get('participants') or []) or '(none)'}\n"
        f"  date: {item.get('occurred_at') or '(unknown)'}\n"
        f"  body: {(item.get('extracted_text') or '')[:1200]}\n\n"
        "Return a JSON object:\n"
        '{\n'
        '  "events": [ {"event_type": one of '
        "email|file|meeting|decision|deadline|status|note, "
        '"title": short, "body": one sentence, "person": name or email or "", '
        '"event_date": "YYYY-MM-DD" or null, "confidence": 0.0-1.0} ],\n'
        '  "actions": [ {"title": an imperative task the recipient should do, '
        '"assignee": name or email or "", "due_date": "YYYY-MM-DD" or null, '
        '"confidence": 0.0-1.0} ]\n'
        "}\n\n"
        "Rules: events summarize what happened; actions are things to do next. "
        "Always include at least one event describing this item. If there is "
        "nothing to act on, use an empty actions list. At most 4 events and 4 "
        "actions. Use the item's date and sender when a date or person is not "
        "otherwise stated."
    )


def _parse_date(value, fallback) -> object:
    if isinstance(value, str):
        try:
            d = date.fromisoformat(value[:10])
            return datetime(d.year, d.month, d.day, tzinfo=timezone.utc)
        except ValueError:
            pass
    return fallback


def _parse_due(value):
    if isinstance(value, str):
        try:
            return date.fromisoformat(value[:10])
        except ValueError:
            return None
    return None


def _clamp01(value) -> float:
    try:
        return max(0.0, min(1.0, float(value)))
    except (TypeError, ValueError):
        return 0.5


def _extract_json(text: str) -> dict | None:
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if match:
            try:
                return json.loads(match.group(0))
            except json.JSONDecodeError:
                return None
    return None


def _fallback(item: dict) -> dict:
    kind = "meeting" if item.get("source_type") == "google_calendar" else "email"
    return {
        "events": [{
            "event_type": kind,
            "title": (item.get("title") or "(untitled)")[:200],
            "body": "",
            "person": item.get("sender") or "",
            "event_date": item.get("occurred_at"),
            "confidence": 0.4,
        }],
        "actions": [],
    }


def _normalize(data: dict, item: dict) -> dict:
    occurred = item.get("occurred_at")
    events = []
    for ev in (data.get("events") or [])[:4]:
        etype = str(ev.get("event_type", "note")).lower().strip()
        if etype not in _EVENT_TYPES:
            etype = "note"
        events.append({
            "event_type": etype,
            "title": (str(ev.get("title", "")).strip() or "(untitled)")[:200],
            "body": str(ev.get("body", "")).strip()[:1000],
            "person": str(ev.get("person", "")).strip()[:200]
                      or (item.get("sender") or ""),
            "event_date": _parse_date(ev.get("event_date"), occurred),
            "confidence": _clamp01(ev.get("confidence", 0.6)),
        })
    if not events:  # always keep at least one event
        events = _fallback(item)["events"]

    actions = []
    for ac in (data.get("actions") or [])[:4]:
        title = str(ac.get("title", "")).strip()
        if not title:
            continue
        actions.append({
            "title": title[:200],
            "assignee": str(ac.get("assignee", "")).strip()[:200] or None,
            "due_date": _parse_due(ac.get("due_date")),
            "confidence": _clamp01(ac.get("confidence", 0.6)),
        })
    return {"events": events, "actions": actions}


def extract(item: dict, *, api_key: str | None, model: str = DEFAULT_EXTRACT_MODEL) -> dict:
    """Return {events: [...], actions: [...]} for one item. Never raises."""
    if not api_key:
        return _normalize(_fallback(item), item)
    try:
        import anthropic

        client = anthropic.Anthropic(api_key=api_key)
        resp = client.messages.create(
            model=model,
            max_tokens=800,
            system=_SYSTEM,
            messages=[{"role": "user", "content": _prompt(item)}],
        )
        text = "".join(
            block.text for block in resp.content
            if getattr(block, "type", None) == "text"
        )
        data = _extract_json(text)
        if not data:
            return _normalize(_fallback(item), item)
        return _normalize(data, item)
    except Exception:  # noqa: BLE001 - fall back rather than fail the stage
        return _normalize(_fallback(item), item)
