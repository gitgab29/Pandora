# Pandora — CLAUDE.md

Internal IT and fixed asset management system for **Embedded Silicon** — tracks hardware assets, storeroom inventory, and transactions, replacing spreadsheet workflows.

## Stack

| Layer | Choice |
|---|---|
| Frontend | React + TypeScript (Vite) |
| Backend | Python + Django + DRF |
| Database | PostgreSQL (prod / AWS RDS); SQLite (local) |
| Auth | JWT — `djangorestframework-simplejwt` |
| Styling | Tailwind + tokens from `src/theme.ts` |
| State | React Context + `useReducer` (no Redux) |
| HTTP | Centralized `src/api.ts` |
| Deploy | AWS (later) |

## Layout

```
frontend/src/   api.ts  theme.ts  components/  pages/  context/  hooks/  types/  utils/
backend/        core/  (Django config only)    api/  (all models, serializers, views, urls)
erd.html        Mermaid ERD — source of truth for entity fields
```

## Rules

### DO
- Route every HTTP call through `src/api.ts`
- Put reusable types in `src/types/<domain>.ts`
- Style with Tailwind + tokens from `src/theme.ts`
- Keep all Django business logic in `backend/api/`
- Return DRF serializers from every endpoint
- Require JWT on protected endpoints

### DON'T
- Import axios in components or hooks
- Hardcode colors, font sizes, or spacing
- Add Redux / Zustand / any other state library
- Put models or business logic in `backend/core/`
- Return raw QuerySets or use `.values()` in views
- Edit migration files by hand

## Where to add things

| Need | Location |
|---|---|
| New page (route) | `src/pages/<Name>.tsx`, register in `App.tsx` |
| Shared component / modal | `src/components/<Name>.tsx` |
| Shared type / interface / enum | `src/types/<domain>.ts` |
| Custom hook | `src/hooks/use<Name>.ts` |
| Global state | `src/context/` (Context + reducer) |
| HTTP endpoint wrapper | extend `src/api.ts` |
| Design token | `src/theme.ts` |
| Django model / serializer / view / url | `backend/api/` (never `core/`) |

## Design system

- Tokens: `frontend/src/theme.ts` exports `colors`, `typography`, `spacing`, `radius`, `sizing` — read it before adding styles
- Fonts: Roboto (headings) + Archivo (body), wired in `src/index.css`
- Icons: `lucide-react` everywhere
- App-shell visuals (sidebar widths/alphas, header blur, `bg-auth.jpg` background): see `src/components/Sidebar.tsx` and `src/components/Header.tsx`

## Data model

Four entities: `User`, `Asset`, `StoreroomInventory`, `TransactionLog`. **Field-level schema lives in `backend/api/models.py` and `erd.html` — read those when you need fields. Don't trust this file for schema details.**

## Dev commands

```bash
# Frontend
cd frontend && npm install && npm run dev      # http://localhost:5173

# Backend (first time)
cd backend
python -m venv .venv && source .venv/bin/activate    # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver                      # http://localhost:8000

# Backend (subsequent)
cd backend && source .venv/bin/activate && python manage.py runserver
```

## Status snapshot

- ✅ Frontend shell: collapsible Sidebar + Header + `bg-auth.jpg` background, used by every authenticated page
- ✅ Auth pages: `/sign-in`, `/sign-up` (Google OAuth **mocked** on frontend)
- ✅ `/home` dashboard — 5 stat cards + `ActivityLogTable` (dummy data)
- ✅ `/assets` — full CRUD UI on dummy `useState`; row actions (delete/copy/edit/check-in/out) all functional client-side
- ✅ `/inventory` — full CRUD UI on dummy `useState`; stat cards + tabs derived live via `useMemo`; row actions functional client-side
- ✅ `/activity` — table with search / sort / pagination, view-detail modal, delete modal (dummy logs in `useState`)
- ✅ Stub routes (`/licenses`, `/people`, `/settings`, `/archive`) → `ComingSoon`
- ✅ Reusable modals: `Add/Edit/Copy` Asset, `Add/Edit` Inventory, `CheckIn/CheckOut` for both, `DeleteConfirm`, `ActivityDetail`, `FeatureNotAvailable`
- ❌ Backend `api/`: Django + DRF + JWT scaffolded, but `models.py` / `views.py` / `serializers.py` are **empty** — no real endpoints exist
- ❌ Google OAuth: no Django endpoint yet; frontend handlers are mocks

**Dummy-data hotspots to replace when backend lands:** `INITIAL_ASSETS` in `pages/Assets.tsx`, `INITIAL_INVENTORY` in `pages/Inventory.tsx`, `generateLogs()` in `pages/Home.tsx` and `pages/Activity.tsx`, `DUMMY_USERS` in both checkout modals, `DUMMY_MANAGERS` in `pages/SignUp.tsx`, dropdown data in `components/Header.tsx`.

## Next up

- [ ] Define models in `backend/api/models.py` (User, Asset, StoreroomInventory, TransactionLog)
- [ ] Write serializers + views for each model
- [ ] Implement Google OAuth on Django (`/api/auth/google/`) → issue JWT
- [ ] Wire frontend auth handlers to real OAuth endpoint
- [ ] Add protected-route wrapper (redirect to `/sign-in` if no valid JWT)
- [ ] Replace dummy hotspots above with real `GET /api/...` calls + wire row-action endpoints
- [ ] Build out Licenses, People, Settings, Archive pages per Figma
