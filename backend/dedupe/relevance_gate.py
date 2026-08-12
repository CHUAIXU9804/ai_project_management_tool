"""LLM relevance gate for Stage 3 (the 'judge the rest' layer).

Runs only on items the deterministic noise rule would drop. Asks a cheap model
(Haiku 4.5) whether the email is a genuine, actionable item for the recipient
(a task, project, career opportunity, interview/assessment, application, event,
or deadline they should act on) rather than bulk marketing. Keeps cost tiny by
touching only borderline items, and fails closed (returns False) so a transient
error never silently re-admits noise.
"""

from __future__ import annotations

DEFAULT_GATE_MODEL = "claude-haiku-4-5"

_SYSTEM = (
    "You filter a person's inbox. Answer with only 'yes' or 'no', nothing else."
)


def _prompt(sender: str | None, title: str | None, text: str | None) -> str:
    return (
        "Is the following email a genuine, actionable item for the recipient "
        "personally -- a task, project, assignment, interview or assessment, "
        "job/internship application or career opportunity, event, or deadline "
        "they should act on -- rather than bulk marketing, a promotional "
        "newsletter, or an automated notification that needs no action?\n\n"
        f"From: {sender or '(unknown)'}\n"
        f"Subject: {title or '(no subject)'}\n"
        f"Body: {(text or '')[:600]}\n\n"
        "Answer yes or no."
    )


def is_relevant(
    sender: str | None,
    title: str | None,
    text: str | None,
    *,
    api_key: str,
    model: str = DEFAULT_GATE_MODEL,
) -> bool:
    """Return True if the item should be KEPT despite looking like noise."""
    try:
        import anthropic

        client = anthropic.Anthropic(api_key=api_key)
        resp = client.messages.create(
            model=model,
            max_tokens=5,
            system=_SYSTEM,
            messages=[{"role": "user", "content": _prompt(sender, title, text)}],
        )
        answer = "".join(
            block.text for block in resp.content
            if getattr(block, "type", None) == "text"
        ).strip().lower()
        return answer.startswith("y")
    except Exception:  # noqa: BLE001 - fail closed; borderline item stays noise
        return False
