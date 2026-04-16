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

## API endpoints

All endpoints require JWT (`Authorization: Bearer <access>`) except auth routes.

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/login/` | Email + password → access/refresh + user |
| POST | `/api/auth/register/` | Create account → access/refresh + user |
| POST | `/api/auth/google/` | Google ID token → access/refresh + user |
| POST | `/api/auth/refresh/` | Rotate access token |
| GET | `/api/auth/me/` | Current user profile |
| GET/POST | `/api/users/` | List / create users |
| GET/PUT/PATCH/DELETE | `/api/users/<id>/` | Retrieve / update / delete user |
| GET/POST | `/api/assets/` | List / create assets |
| GET/PUT/PATCH/DELETE | `/api/assets/<id>/` | Retrieve / update / delete asset |
| POST | `/api/assets/<id>/check_out/` | Check out asset (body: `user_id`, `notes`) |
| POST | `/api/assets/<id>/check_in/` | Check in asset (body: `notes`) |
| POST | `/api/assets/<id>/change_status/` | Change asset status (body: `status`, `notes`) |
| GET/POST | `/api/accessories/` | List / create accessories |
| GET/PUT/PATCH/DELETE | `/api/accessories/<id>/` | Retrieve / update / delete accessory |
| POST | `/api/accessories/<id>/check_out/` | Check out qty (body: `quantity`, `user_id`, `notes`) |
| POST | `/api/accessories/<id>/check_in/` | Check in qty (body: `quantity`, `notes`) |
| GET | `/api/transactions/` | List transaction logs (read-only) |
| GET | `/api/transactions/<id>/` | Retrieve single log |

Filter params: `?category=`, `?status=`, `?business_group=`, `?transaction_type=`, `?search=`, `?ordering=`, `?include_archived=1`, `?assigned_to=` (Assets only), `?to_user=` (Transactions only)

## Status snapshot

- ✅ Frontend shell: collapsible Sidebar + Header + `bg-auth.jpg` background, used by every authenticated page
- ✅ Auth pages: `/sign-in` wired to real `POST /api/auth/login/` + `AuthContext`; `/sign-up` wired to real `POST /api/auth/register/`; Google OAuth endpoint exists on backend but requires `GOOGLE_OAUTH_CLIENT_ID` env var
- ✅ Protected routes: `ProtectedRoute` component wraps all authenticated pages; redirects to `/sign-in` if no valid JWT
- ✅ `AuthContext` (`context/AuthContext.tsx`) — stores `user`, `access`/`refresh` tokens, `isAuthenticated`, `loading`; exposes `login()`, `logout()`, `register()`
- ✅ `/home` dashboard — 9 pressable stat cards (Asset Status + Overview) + 3 charts (recharts: donut, bar, horizontal bar); no activity log table
- ✅ `/inventory` — **tabbed catalog page**. Four tabs: `Assets` · `Accessories` · `Licenses` · `Consumables`
  - **Assets tab** = full CRUD (add/edit/copy/delete), lives in `components/AssetsTabContent.tsx`. Stat cards compute real stats (Total, Available, Deployed, To Audit). **Fully wired to APIs** — all CRUD + check-in/out call real endpoints.
  - **Accessories tab** = full CRUD with real API calls. Stat cards computed. Check-in/out wired to API endpoints. **Clickable rows** open edit modal.
  - **Licenses / Consumables tabs** = `ComingSoonPanel` placeholder; schemas not yet defined
- ✅ `/activity` — full activity log with real transaction data; clickable rows open detail modal with all transaction info
- ✅ Stub routes (`/settings`, `/archive`) → `ComingSoon`
- ✅ Reusable modals: `Add/Edit/Copy` Asset, `Add/Edit` Accessory, `CheckIn/CheckOut` for both, `ChangeStatusModal`, `DeleteConfirm`, `ActivityDetail`, `FeatureNotAvailable`, `AssignAssetToPersonModal`, `AssignAccessoryToPersonModal`, **new: `AssetDetailModal` (read-only), `AccessoryDetailModal` (read-only)**
- ✅ Sidebar logout button — clears `AuthContext` and navigates to `/sign-in`
- ✅ `/people` — People directory. **Clickable rows** open PersonDetailModal. **Redesigned detail modal**:
  - **Assets subtab**: shows assets assigned to person; "Check In" action per row; "Assign Asset" button opens modal with available asset picker
  - **Accessories subtab**: shows checkout history for person; "Check Out Accessory" button opens modal with accessory picker + qty
  - Full CRUD + Detail modal fully wired to API. All mutations call real endpoints.
- ✅ **Backend fully implemented** — `backend/api/` has real models, serializers, views, auth:
  - `models.py`: `User` (email-auth, UUID PK, role, supervisor FK), `Asset`, `Accessory`, `TransactionLog`
  - `serializers.py`: Full DRF serializers with nested `*_detail` read fields
  - `views.py`: `UserViewSet`, `AssetViewSet` (+ check_in/out/change_status actions), `AccessoryViewSet` (+ check_in/out), `TransactionLogViewSet` (read-only)
  - `auth.py`: `EmailLoginView`, `RegisterView`, `GoogleAuthView`, `MeView`
  - `urls.py`: DRF router + auth sub-routes all wired
  - `admin.py`: All models registered in Django admin
  - Migration: `0001_initial.py` created and applied
  - Superuser: `admin@embeddedsilicon.com` (run `python manage.py changepassword` to reset)
- ❌ Google OAuth: backend endpoint scaffolded but requires `GOOGLE_OAUTH_CLIENT_ID` env var to function

**Asset schema note:** `Asset` has no `asset_name` or `location` field — the displayed identifier is `asset_tag`. Bind new asset UI to `asset_tag`.

**`AssetStatus` is the backend enum, not Title Case.** Frontend `AssetStatus` type uses `'AVAILABLE' | 'DEPLOYED' | 'IN_REPAIR' | 'IN_MAINTENANCE' | 'TO_AUDIT' | 'LOST'` — matching `Asset.Status` in `backend/api/models.py`. Use `ASSET_STATUS_LABELS` (exported from `types/asset.ts`) when rendering display text. Never compare `asset.status === 'Available'` — it will silently fail.

**ID fields are UUID strings, not numbers.** All entity `id`s (`Asset.id`, `Person.id`, `Accessory.id`) are UUIDs from the backend. Use `Set<string>`, never `Set<number>`. Never do `id % n` (NaN) or `Math.max(...ids)` for new IDs — use `crypto.randomUUID()` for client-side temporary IDs.

**Holder display:** `asset.assigned_to` is a UUID. To render the user's name, use `asset.assigned_to_detail.first_name + last_name` (the nested read-only object from the serializer).

**All stat cards and list data are now wired to real APIs.** No remaining dummy-data hotspots in active features (Home, Activity, Inventory, People all use live data).

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

## Recently completed

- ✅ Add `image_url` field to User model (backend + frontend) — People table and PersonDetailModal show profile images when available; AddEditPersonModal has image URL field
- ✅ Header quick access dropdown now navigates to Assets, Accessories, Licenses, Consumables (via `/inventory?tab=<Tab>`)
- ✅ Stat cards on Home are pressable — navigate to corresponding Inventory filtered view
- ✅ Home page redesigned: activity log removed, replaced with charts (Asset Status donut, Activity Breakdown bar, Assets by Category horizontal bar) + Overview stat cards (People, Accessories, Low Stock, Recent Activity)
- ✅ Activity page now fetches transactions with `ordering: '-transaction_date'` for most-recent-first
- ✅ Asset and Accessory row clicks now open read-only detail modals (`AssetDetailModal`, `AccessoryDetailModal`) instead of edit modals; edit is accessible via Edit button inside detail modal
- ✅ Inventory page reads `tab` URL param to support direct-linking to tabs
- ✅ AssetsTabContent reads `status` URL param to pre-filter by status from Home stat cards
- ✅ Header avatar shows real user initials from AuthContext (was hardcoded "LJ")
- ✅ `recharts` added as dependency for Home dashboard charts

## Next up

- [ ] Set `GOOGLE_OAUTH_CLIENT_ID` env var + test Google OAuth end-to-end
- [ ] Build out Licenses, Settings, Archive pages
- [ ] Add protected-route role guard (admin-only sections)
- [ ] Deploy to AWS (RDS + static hosting)
- [ ] Polish: animations, micro-interactions, edge case handling
