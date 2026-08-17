# ThreadLinePMA

AI-assisted project memory that organizes connected Gmail messages, Google Calendar events, and uploaded files into projects, timelines, and actions.

## Project structure

```text
.
├── frontend/                     Static website
│   ├── index.html                Page structure
│   ├── assets/
│   │   ├── css/styles.css        Visual design and responsive layouts
│   │   └── js/
│   │       ├── dashboard.js      Dashboard rendering and interactions
│   │       └── auth.js           Sign-in, registration, profiles, and sessions
│   └── config/
│       ├── supabase-config.example.js
│       └── supabase-config.js    Browser-safe Supabase URL/key + OAuth server URL
├── backend/                      Server-side and database administration
│   ├── .env.example
│   ├── .env                     Local secrets; ignored by Git
│   ├── requirements.txt
│   └── database/
│       ├── supabase_connections.py
│       └── supabase_queries.json
├── docs/                         Planning and setup documentation
└── README.md
```

## Responsibility boundaries

- `frontend/assets/js/dashboard.js` controls only dashboard UI and display state.
- `frontend/assets/js/auth.js` controls Supabase Auth and user profiles.
- `backend/database/` contains privileged schema-management tools and SQL.
- `backend/.env` contains the database URL and must never reach the browser.
- `frontend/config/supabase-config.js` contains only the browser-safe project URL and publishable key.

## One-time setup

1. **Install backend dependencies:**
   ```bash
   python3 -m pip install -r backend/requirements.txt
   ```
2. **Create a Supabase project and the schema.** See [docs/SUPABASE.md](docs/SUPABASE.md) for
   creating the project, then apply the schema:
   ```bash
   python3 backend/database/supabase_connections.py --list
   python3 backend/database/supabase_connections.py --title check_all_tables
   ```
3. **Fill in config** (both are gitignored except their `.example` counterparts):
   - `backend/.env` — copy from `backend/.env.example`. Database URL, Google OAuth
     client id/secret, token encryption key, `ANTHROPIC_API_KEY`.
   - `frontend/config/supabase-config.js` — copy from `supabase-config.example.js`.
     Supabase project URL + publishable key (safe for the browser), and
     `oauthBaseUrl` (where the backend OAuth/pipeline server below is reachable).
4. **Create a Google OAuth client** (Gmail + Calendar, read-only) and register it as
   a test user. Full walkthrough: [docs/STAGE0_OAUTH.md](docs/STAGE0_OAUTH.md).

## Start the app

Two processes, each in its own terminal, from the repository root:

```bash
# 1. Backend: OAuth (Connect apps) + pipeline runner (Scan for updates)
python3 backend/auth/server.py

# 2. Frontend: the static dashboard
python3 -m http.server 8000 --directory frontend
```

Open `http://localhost:8000`, sign in, then **Connect apps** (first time only,
Gmail and/or Calendar) and **Scan for updates** to pull in and process new
messages/events. Scan for updates runs Stages 1-7 for you — sync, normalize,
dedupe, embed, relate, group, and extract/summarize — instead of running each
stage's CLI by hand. If you'd rather run (or debug) a stage individually, see
each script's own `--help` under `backend/*/`, or
[demo_data/README.md](demo_data/README.md) for the full manual sequence against
the bundled synthetic dataset.

## Demo the deployed site

The frontend alone is deployed (Cloudflare) and reachable from anywhere — sign-in
and browsing work there directly. **Connect apps / Scan for updates** additionally
need the backend from "Start the app" above running on your own machine, exposed
via a [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/):

```bash
python3 backend/auth/server.py        # same as local
cloudflared tunnel --url http://localhost:8765
```

Take the printed `https://<random>.trycloudflare.com` URL, set it as
`oauthBaseUrl` in `frontend/config/supabase-config.js`, then commit + push (this
file *is* tracked in git — only its `.example` counterpart's placeholder values
aren't real). Cloudflare redeploys on push. A quick tunnel's URL changes every
time it restarts, so this step repeats each fresh session unless it's swapped
for a named/persistent tunnel (requires owning a domain in your Cloudflare
account).

If your deployed site's origin ever changes, update `_ALLOWED_ORIGINS` in
`backend/auth/server.py` to match — it's the CORS + OAuth-return-redirect
allowlist, currently hardcoded to this project's deployed URL.
