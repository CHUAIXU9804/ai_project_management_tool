"""Pure helpers for Stage 3 (clean & deduplicate).

Content hashing (for duplicate detection) and simple noise rules (newsletters,
automated notifications). No I/O -- takes text/fields, returns values -- so it
is unit-testable in isolation.
"""

from __future__ import annotations

import hashlib

# Sender fragments that signal automated / bulk mail rather than project work.
_NOISE_SENDER_FRAGMENTS = (
    "noreply", "no-reply", "no_reply", "donotreply", "do-not-reply",
    "newsletter", "notifications", "notification", "notify",
    "alerts", "alert@", "mailer-daemon", "mailer", "bounce",
    "marketing", "promo", "jobalerts", "automated", "updates@",
)

# Body phrases typical of newsletters / bulk mail.
_NOISE_BODY_PHRASES = (
    "unsubscribe",
    "view in browser",
    "view this email in your browser",
    "manage your preferences",
    "update your preferences",
    "you are receiving this",
    "you're receiving this",
)


def content_hash(source_type: str, title: str | None, text: str | None) -> str | None:
    """Stable hash of an item's meaningful content, or None if there's no text.

    Returns None when the cleaned text is empty so that empty-bodied items (many
    calendar events) are not falsely deduplicated against each other.
    """
    body = (text or "").strip()
    if not body:
        return None
    key = "\n".join([source_type or "", (title or "").strip(), body])
    return hashlib.sha256(key.encode("utf-8")).hexdigest()


def is_noise(sender: str | None, title: str | None, text: str | None) -> bool:
    """True if the item looks like a newsletter / automated notification."""
    sender_l = (sender or "").lower()
    if any(fragment in sender_l for fragment in _NOISE_SENDER_FRAGMENTS):
        return True
    body_l = f"{title or ''}\n{text or ''}".lower()
    return any(phrase in body_l for phrase in _NOISE_BODY_PHRASES)
