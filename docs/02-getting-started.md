# 02 · Getting started

Goal: clone the repo, run the backend on `:8000` and the frontend on `:5173`, and log in as a superuser you create.

## Prerequisites

| Tool | Version | Notes |
|---|---|---|
| Node.js | 18+ | 20 LTS recommended |
| npm | bundled with Node | yarn/pnpm not used |
| Python | 3.11+ | 3.12 works fine |
| pip + venv | bundled with Python | |
| Git | any recent | |
| (Optional) Postgres | 14+ | Only needed if you set `DATABASE_URL`. SQLite is the default. |

You do **not** need Docker. The dev loop runs natively.

## One-time setup

### Backend

```bash
cd backend
python -m venv .venv

# macOS / Linux
source .venv/bin/activate
# Windows (PowerShell)
.venv\Scripts\Activate.ps1
# Windows (Git Bash)
source .venv/Scripts/activate

pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser      # creates the first admin account
python manage.py runserver            # http://localhost:8000
```

The DB ships empty — there is no demo seed. Add real assets/accessories/people through the app or the Django admin once you're signed in.

### Frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev    # http://localhost:5173
```

The Vite dev server proxies through to the Django API via the `VITE_API_BASE_URL` env var (default empty, which means same-origin — for local dev set it explicitly, see below).

## Environment variables

There is no checked-in `.env.example` yet — see the TODO list in [10-roadmap.md](10-roadmap.md). For now, this is the canonical reference.

### Frontend (`frontend/.env.local`)

| Variable | Required? | Local default | Purpose |
|---|---|---|---|
| `VITE_API_BASE_URL` | Yes for local | `http://localhost:8000` | Prefix for `axios` calls in [`src/api.ts:8`](../frontend/src/api.ts#L8). Leave empty to use same-origin. |

### Backend (`backend/.env`, loaded via shell or your IDE)

Read by [`backend/core/settings.py`](../backend/core/settings.py).

| Variable | Required? | Local default | Production behaviour |
|---|---|---|---|
| `DEBUG` | No | `True` | Must be `False` in prod |
| `SECRET_KEY` | In prod | Insecure dev fallback | App **refuses to boot** without it when `DEBUG=False` ([settings.py:33-40](../backend/core/settings.py#L33-L40)) |
| `ALLOWED_HOSTS` | In prod | `localhost,127.0.0.1` | Comma-separated host list |
| `CORS_ALLOWED_ORIGINS` | If frontend on a different host | `http://localhost:5173,https://pandora-testing.vercel.app` | Comma-separated origin list |
| `DATABASE_URL` | No | SQLite at `backend/db.sqlite3` | Postgres URL (parsed by `dj_database_url`) |
| `GOOGLE_OAUTH_CLIENT_ID` | Only for `/auth/google/` | unset | Without it, that endpoint returns `503` ([auth.py:113-118](../backend/api/auth.py#L113-L118)) |

## Default flow once it's running

1. Open `http://localhost:5173` → redirected to `/sign-in`
2. Sign in with the superuser you created via `createsuperuser`.
3. You land on `/home` with stat cards and charts (empty until you add data).
4. Click any stat card to drill into the matching Inventory filter.

## Common Windows / venv gotchas

| Symptom | Cause | Fix |
|---|---|---|
| `Activate.ps1 cannot be loaded because running scripts is disabled` | PowerShell execution policy | Run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` once. |
| `python` not found, but `py` works | Windows Python launcher | Use `py -m venv .venv` instead. |
| Frontend logs `Network Error` on every API call | `VITE_API_BASE_URL` unset and Vite running on a different origin | Create `frontend/.env.local` with `VITE_API_BASE_URL=http://localhost:8000`. Restart Vite (env vars are read at boot). |
| `CORS error: blocked by CORS policy` | Origin missing from `CORS_ALLOWED_ORIGINS` | Add it to the env var or run frontend on `:5173` (the default allow-list). |
| `401 Unauthorized` after a few minutes of idle | JWT access token expired (1 h lifetime, [settings.py:181-185](../backend/core/settings.py#L181-L185)) | The axios interceptor in [`api.ts:22-43`](../frontend/src/api.ts#L22-L43) auto-refreshes once. If refresh also fails, you'll be bounced to `/sign-in` — that's by design. |
| `Throttled. Expected available in N seconds.` | DRF throttle: 240 req/min/user, 20/min anon ([settings.py:173-176](../backend/core/settings.py#L173-L176)) | Wait, or comment out throttling for local profiling. |
| Tables empty after `migrate` | Expected — there is no demo seed | Run `python manage.py createsuperuser`, then add data via the app or `/admin/` |
| Path errors when running `manage.py` | You're not in `backend/` | `cd backend` first; `manage.py` resolves paths relative to its own location. |

## What's running where

| Service | URL | Defined in |
|---|---|---|
| Django dev server | `http://localhost:8000` | [`backend/manage.py`](../backend/manage.py) |
| API root | `http://localhost:8000/api/` | [`backend/api/urls.py`](../backend/api/urls.py) |
| Django admin | `http://localhost:8000/admin/` | superuser-only |
| Vite dev server | `http://localhost:5173` | [`frontend/vite.config.ts`](../frontend/vite.config.ts) |
