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

- Tokens: `frontend/src/theme.ts` exports `colors`, `typography`, `spacing`, `radius`, `sizing`, `fontSize`, `shadows`, `badgeColors`, `statusColors` — read it before adding styles
- Fonts: Roboto (headings) + Archivo (body), wired in `src/index.css`
- Icons: `lucide-react` everywhere
- App-shell visuals (sidebar widths/alphas, header blur, `bg-auth.jpg` background): see `src/components/Sidebar.tsx` and `src/components/Header.tsx`

## Data model

Current entities: `User`, `Asset`, `Accessory`, `TransactionLog`. Future entities (Licenses, Consumables) are not yet scoped — their Inventory tabs render `ComingSoonPanel` until schemas land. **Field-level schema lives in `backend/api/models.py` and `erd.html` — read those when you need fields. Don't trust this file for schema details.**

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
- ✅ `/inventory` — **tabbed catalog page**. Four tabs: `Assets` · `Accessories` · `Licenses` · `Consumables`
  - **Assets tab** = full CRUD (add/edit/copy/delete), lives in `components/AssetsTabContent.tsx`, backed by `INITIAL_ASSETS` dummy data exported from that same file
  - **Accessories tab** = Accessory CRUD (body still inlined in `pages/Inventory.tsx`, backed by `INITIAL_INVENTORY`). Has toggleable stat cards (Eye/EyeOff button).
  - **Licenses / Consumables tabs** = `ComingSoonPanel` placeholder; schemas not yet defined
- ✅ `/activity` — table with search / sort / pagination, view-detail modal, delete modal (dummy logs in `useState`)
- ✅ Stub routes (`/people`, `/settings`, `/archive`) → `ComingSoon`
- ✅ Reusable modals: `Add/Edit/Copy` Asset, `Add/Edit` Accessory, `CheckIn/CheckOut` for both, `ChangeStatusModal`, `DeleteConfirm`, `ActivityDetail`, `FeatureNotAvailable`
- ✅ Sidebar has a logout button at the bottom (mock — navigates to `/sign-in`)
- ❌ Backend `api/`: Django + DRF + JWT scaffolded, but `models.py` / `views.py` / `serializers.py` are **empty** — no real endpoints exist
- ❌ Google OAuth: no Django endpoint yet; frontend handlers are mocks

**Asset schema note:** `Asset` has no `asset_name` or `location` field — the displayed identifier is `asset_tag`. If you're adding new asset-related UI, bind to `asset_tag`.

**Dummy-data hotspots to replace when backend lands:** `INITIAL_ASSETS` in `components/AssetsTabContent.tsx`, `INITIAL_INVENTORY` in `pages/Inventory.tsx`, `generateLogs()` in `pages/Home.tsx` and `pages/Activity.tsx`, `DUMMY_USERS` in both checkout modals, `DUMMY_MANAGERS` in `pages/SignUp.tsx`, dropdown data in `components/Header.tsx`.

## Design Context

### Users

IT administrators at **Embedded Silicon** — a small, experienced team who live in this tool daily. Power users who manage hardware assets, storeroom inventory, and transaction audits. They are precision-oriented and get frustrated by visual noise and wasted motion. The interface should feel like a tool they trust, not a product they navigate around.

### Brand Personality

**Precise. Calm. Polished.** Like a well-calibrated instrument. Nothing decorative — every element earns its place by serving the data. The emotional goal is quiet confidence: the tool has everything under control so users can focus on the work.

### Aesthetic Direction

**Layered depth system — preserve it.** Three-layer visual hierarchy:
1. **Dark background** — `bg-auth.jpg`, always present behind everything
2. **Blue glass sidebar** — `rgba(46, 124, 253, 0.88)` + `backdrop-filter: blur(4px)`
3. **White/light content panels** — crisp, high-contrast working surface

Never flatten into purely dark or purely light. Never add a fourth layer (no card-in-card).

Color restraint: Orange (`#fc9c2d`) reserved for genuine urgency (warnings, archive badge, overdue). Cyan (`#2dfcf9`) used sparingly — risks looking garish on white. Blue primary anchors navigation and CTAs only.

### Design Principles

1. **Precision over decoration** — every element serves the data or the task
2. **Depth through layers** — dark → glass → white is the product's identity; slot all surfaces into one of these three
3. **Calm by default, urgent when needed** — quiet UI, accents reserved for real signals
4. **Density without fatigue** — tight table rows, hierarchy through weight/color not size
5. **Trustworthy at first glance** — consistent radii, exact alignment, required hover/focus states

## Next up

- [ ] Define models in `backend/api/models.py` (User, Asset, Accessory, TransactionLog)
- [ ] Write serializers + views for each model
- [ ] Implement Google OAuth on Django (`/api/auth/google/`) → issue JWT
- [ ] Wire frontend auth handlers to real OAuth endpoint
- [ ] Add protected-route wrapper (redirect to `/sign-in` if no valid JWT)
- [ ] Replace dummy hotspots above with real `GET /api/...` calls + wire row-action endpoints
- [ ] Build out Licenses, People, Settings, Archive pages per Figma
