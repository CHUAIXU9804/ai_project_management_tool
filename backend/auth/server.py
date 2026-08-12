"""Stage 0 OAuth server: Connect & Authorize Gmail + Google Calendar.

A small local Flask app that runs the Google OAuth 2.0 authorization-code flow:

  GET  /                        landing page with connect buttons
  GET  /health                  config/readiness check (no secrets leaked)
  GET  /auth/google/start       redirect the user to Google's consent screen
  GET  /auth/google/callback    exchange the code, store token, upsert connection
  GET  /connections             list this user's connections (metadata only)

Run it with:  python3 backend/auth/server.py
Then open:    http://localhost:8765

The client secret and the resulting tokens never reach the browser: the secret
stays in this process, and tokens are encrypted into the source_secrets table.
"""

from __future__ import annotations

import html
import secrets
import sys
import time
from pathlib import Path

# Allow running directly (python3 backend/auth/server.py): make sibling modules
# importable regardless of the caller's working directory.
sys.path.insert(0, str(Path(__file__).resolve().parent))

import requests
from flask import Flask, redirect, request
from google_auth_oauthlib.flow import Flow

import connections_repo
from config import USERINFO_ENDPOINT, VALID_PROVIDERS, load_config
from token_store import TokenStore

config = load_config()
app = Flask(__name__)

# Short-lived CSRF/state store: maps the opaque `state` value we send to Google
# to the request context we need back on the callback. In-memory is fine for a
# single-process local demo; entries expire after STATE_TTL seconds.
_pending: dict[str, dict] = {}
STATE_TTL = 600


def _clean_pending() -> None:
    now = time.time()
    for key in [k for k, v in _pending.items() if now - v["created_at"] > STATE_TTL]:
        _pending.pop(key, None)


def _safe_return_to(url: str | None) -> str | None:
    """Allow redirecting back only to a local dev origin (open-redirect guard).

    Production should replace this with an explicit allowlist of trusted app
    origins rather than a localhost check.
    """
    if not url:
        return None
    if url.startswith("http://localhost:") or url.startswith("http://127.0.0.1:"):
        return url
    return None


def _build_flow(scopes: list[str], state: str | None = None) -> Flow:
    flow = Flow.from_client_config(
        config.client_config(), scopes=scopes, state=state
    )
    flow.redirect_uri = config.redirect_uri
    return flow


def _page(title: str, body: str, status: int = 200):
    return (
        f"<!doctype html><meta charset='utf-8'>"
        f"<title>{html.escape(title)}</title>"
        f"<style>body{{font:16px/1.5 system-ui,sans-serif;max-width:640px;"
        f"margin:3rem auto;padding:0 1rem;color:#222}}"
        f"a.btn,button{{display:inline-block;background:#4263eb;color:#fff;"
        f"text-decoration:none;padding:.6rem 1rem;border-radius:8px;border:0;"
        f"font-size:1rem;cursor:pointer;margin:.25rem .25rem 0 0}}"
        f"code{{background:#f2f4f7;padding:.1rem .3rem;border-radius:4px}}"
        f".ok{{color:#067647}}.err{{color:#b42318}}</style>{body}",
        status,
    )


@app.get("/health")
def health():
    """Readiness probe -- reports what is configured without printing secrets."""
    default_set = bool(config.default_test_user_id) and (
        config.default_test_user_id != "00000000-0000-0000-0000-000000000000"
    )
    lines = [
        f"config_complete: {config.is_complete}",
        f"redirect_uri: {config.redirect_uri}",
        f"default_test_user_id_set: {default_set}",
    ]
    if config.missing:
        lines.append("missing: " + ", ".join(config.missing))
    return (
        "\n".join(lines),
        (200 if config.is_complete else 503),
        {"Content-Type": "text/plain"},
    )


@app.get("/")
def index():
    if not config.is_complete:
        return _page(
            "Setup needed",
            "<h1>Stage 0 - Connect &amp; Authorize</h1>"
            "<p class='err'>Configuration is incomplete. Missing: <code>"
            + html.escape(", ".join(config.missing))
            + "</code></p><p>Fill these in <code>backend/.env</code> "
            "(see <code>backend/.env.example</code>), then restart the server.</p>",
            503,
        )
    user_hint = (
        html.escape(config.default_test_user_id)
        if config.default_test_user_id
        else "(none - append ?user_id=... to the links below)"
    )
    return _page(
        "Connect your accounts",
        "<h1>Stage 0 - Connect &amp; Authorize</h1>"
        f"<p>Connecting for user: <code>{user_hint}</code></p>"
        "<p>"
        "<a class='btn' href='/auth/google/start?providers=gmail'>Connect Gmail</a>"
        "<a class='btn' href='/auth/google/start?providers=google_calendar'>Connect Calendar</a>"
        "<a class='btn' href='/auth/google/start?providers=gmail,google_calendar'>Connect both</a>"
        "</p>"
        "<p><a href='/connections'>View current connections</a></p>",
    )


@app.get("/auth/google/start")
def auth_start():
    if not config.is_complete:
        return _page("Setup needed", "<p class='err'>Server not configured.</p>", 503)

    raw = request.args.get("providers", "gmail")
    providers = [p.strip() for p in raw.split(",") if p.strip()]
    invalid = [p for p in providers if p not in VALID_PROVIDERS]
    if not providers or invalid:
        return _page(
            "Bad request",
            "<p class='err'>Unknown provider(s): "
            + html.escape(", ".join(invalid or ["(none given)"]))
            + f". Valid: {', '.join(VALID_PROVIDERS)}.</p>",
            400,
        )

    user_id = request.args.get("user_id", "").strip() or config.default_test_user_id
    if not user_id or user_id == "00000000-0000-0000-0000-000000000000":
        return _page(
            "Missing user",
            "<p class='err'>No user to attach this connection to. Set "
            "<code>DEFAULT_TEST_USER_ID</code> in <code>backend/.env</code> or "
            "append <code>?user_id=&lt;supabase-user-uuid&gt;</code>.</p>",
            400,
        )

    scopes = config.scopes_for(providers)
    state = secrets.token_urlsafe(24)
    flow = _build_flow(scopes, state=state)
    auth_url, _ = flow.authorization_url(
        access_type="offline",       # ask for a refresh token
        include_granted_scopes="true",
        prompt="consent",            # force refresh-token issuance every time
    )

    _clean_pending()
    _pending[state] = {
        "providers": providers,
        "user_id": user_id,
        "scopes": scopes,
        # PKCE: the verifier generated here must be replayed at token exchange.
        "code_verifier": flow.code_verifier,
        "return_to": _safe_return_to(request.args.get("return_to")),
        "created_at": time.time(),
    }
    return redirect(auth_url)


@app.get("/auth/google/callback")
def auth_callback():
    error = request.args.get("error")
    if error:
        return _page(
            "Consent declined",
            f"<p class='err'>Google returned: {html.escape(error)}</p>",
            400,
        )

    state = request.args.get("state", "")
    _clean_pending()
    pending = _pending.pop(state, None)
    if pending is None:
        return _page(
            "Expired",
            "<p class='err'>This authorization link is invalid or expired. "
            "Start again from the home page.</p>",
            400,
        )

    flow = _build_flow(pending["scopes"], state=state)
    # Replay the PKCE verifier from the start step so Google accepts the code.
    flow.code_verifier = pending.get("code_verifier")
    try:
        flow.fetch_token(authorization_response=request.url)
    except Exception as exc:  # noqa: BLE001 - surface any exchange failure to the tester
        return _page(
            "Token exchange failed",
            f"<p class='err'>{html.escape(str(exc))}</p>",
            400,
        )

    creds = flow.credentials

    # Identify the Google account so we can fill provider_account_id + email.
    try:
        resp = requests.get(
            USERINFO_ENDPOINT,
            headers={"Authorization": f"Bearer {creds.token}"},
            timeout=15,
        )
        resp.raise_for_status()
        userinfo = resp.json()
    except requests.RequestException as exc:
        return _page(
            "Identity lookup failed",
            f"<p class='err'>{html.escape(str(exc))}</p>",
            502,
        )

    google_sub = userinfo.get("sub")
    account_email = userinfo.get("email", "")
    if not google_sub:
        return _page(
            "Identity lookup failed",
            "<p class='err'>Google did not return an account id.</p>",
            502,
        )

    token_record = {
        "token": creds.token,
        "refresh_token": creds.refresh_token,
        "token_uri": creds.token_uri,
        "client_id": creds.client_id,
        "client_secret": creds.client_secret,
        "scopes": list(creds.scopes or pending["scopes"]),
        "expiry": creds.expiry.isoformat() if creds.expiry else None,
    }

    store = TokenStore(config.token_encryption_key, config.database_url)

    connected = []
    for provider in pending["providers"]:
        connection_id = connections_repo.upsert_connection(
            config.database_url,
            user_id=pending["user_id"],
            provider=provider,
            provider_account_id=google_sub,
            account_email=account_email,
            status="active",
        )
        # Both providers from a single consent share the same underlying grant,
        # so the same token record is stored under each connection id.
        store.put(connection_id, pending["user_id"], token_record)
        connected.append((provider, connection_id))

    # If the browser came from the app, return there so it can refresh the
    # "Connected" state instead of stranding the user on this backend page.
    return_to = pending.get("return_to")
    if return_to:
        sep = "&" if "?" in return_to else "?"
        joined = ",".join(p for p, _ in connected)
        return redirect(f"{return_to}{sep}connected={joined}")

    rows = "".join(
        f"<li><b>{html.escape(p)}</b> &rarr; connection "
        f"<code>{html.escape(cid)}</code></li>"
        for p, cid in connected
    )
    got_refresh = "yes" if creds.refresh_token else "NO (re-consent needed)"
    return _page(
        "Connected",
        "<h1 class='ok'>Connected ✓</h1>"
        f"<p>Account: <code>{html.escape(account_email)}</code></p>"
        f"<p>Refresh token received: <b>{got_refresh}</b></p>"
        f"<ul>{rows}</ul>"
        "<p>Tokens are encrypted in <code>source_secrets</code>; only "
        "non-secret metadata is in <code>source_connections</code>.</p>"
        "<p><a href='/connections'>View connections</a> &middot; "
        "<a href='/'>Home</a></p>"
        "<p>Now verify from the terminal:<br>"
        "<code>python3 backend/auth/verify.py verify --provider gmail</code></p>",
    )


@app.get("/connections")
def connections():
    if not config.is_complete:
        return _page("Setup needed", "<p class='err'>Server not configured.</p>", 503)
    user_id = (
        request.args.get("user_id", "").strip()
        or config.default_test_user_id
        or None
    )
    rows = connections_repo.list_connections(config.database_url, user_id)
    if not rows:
        body = "<p>No connections yet. <a href='/'>Connect an account.</a></p>"
    else:
        items = "".join(
            f"<li><b>{html.escape(c.provider)}</b> &mdash; "
            f"{html.escape(c.account_email)} &mdash; "
            f"<span class={'ok' if c.status == 'active' else 'err'!r}>"
            f"{html.escape(c.status)}</span>"
            f"{(' &mdash; ' + html.escape(c.last_error)) if c.last_error else ''}</li>"
            for c in rows
        )
        body = f"<ul>{items}</ul>"
    return _page(
        "Connections", "<h1>Connections</h1>" + body + "<p><a href='/'>Home</a></p>"
    )


def main() -> None:
    if not config.is_complete:
        print(
            "WARNING: configuration incomplete. Missing: "
            + ", ".join(config.missing)
        )
        print(
            f"Fill them in {Path(__file__).resolve().parent.parent / '.env'} "
            "then restart. Serving a setup page in the meantime.\n"
        )
    print(f"Stage 0 OAuth server on http://{config.host}:{config.port}")
    print(f"Redirect URI (must be registered in Google): {config.redirect_uri}")
    app.run(host=config.host, port=config.port, debug=False)


if __name__ == "__main__":
    main()
