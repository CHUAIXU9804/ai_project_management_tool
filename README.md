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
│       └── supabase-config.js    Local browser config; ignored by Git
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

## Install backend dependencies

```bash
python3 -m pip install -r backend/requirements.txt
```

## Run database queries

```bash
python3 backend/database/supabase_connections.py --list
python3 backend/database/supabase_connections.py --title check_all_tables
```

## Run the frontend

From the repository root:

```bash
python3 -m http.server 8000 --directory frontend
```

Open `http://localhost:8000`.
