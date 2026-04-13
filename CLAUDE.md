# Pandora — CLAUDE.md

## Project Overview

**Pandora** is a custom internal IT and fixed asset management system for **Embedded Silicon**.
It is used by the IT and Operations team to track hardware assets, manage storeroom inventory, and log transactions — replacing manual spreadsheet-based tracking.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | React + TypeScript (Vite) |
| Backend | Python + Django + Django REST Framework |
| Database | PostgreSQL (prod / AWS RDS); SQLite for local dev |
| Auth | JWT — `djangorestframework-simplejwt` |
| Styling | Tailwind CSS + `src/theme.ts` design tokens |
| State | React Context + useReducer (no Redux) |
| HTTP | Centralized `src/api.ts` — never import axios directly in components |
| Deployment | AWS (not immediate) |

---

## Project Structure

```
Pandora/
├── frontend/
│   ├── src/
│   │   ├── api.ts          # Centralized axios wrapper — use this for ALL HTTP calls
│   │   ├── theme.ts        # Design tokens (colors, typography, spacing)
│   │   ├── components/     # Shared/reusable UI components (PascalCase filenames)
│   │   ├── pages/          # Route-level page components
│   │   ├── context/        # React Context providers + useReducer state
│   │   ├── hooks/          # Custom hooks (prefixed with `use`)
│   │   ├── types/          # TypeScript interfaces, types, and enums
│   │   └── utils/          # Pure helper functions
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   └── package.json
├── backend/
│   ├── core/               # Django project config only (settings, urls, wsgi, asgi) — NO business logic
│   ├── api/                # Single Django app — all models, views, serializers, URLs
│   │   ├── models.py       # User, Asset, StoreroomInventory, TransactionLog
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   ├── admin.py
│   │   └── migrations/
│   ├── manage.py
│   └── requirements.txt
├── erd.html                # Interactive Entity Relationship Diagram (Mermaid)
└── CLAUDE.md
```

---

## Data Model

Four entities defined in `backend/api/models.py`:

**USER**
`id, first_name, last_name, email, title, location, department, manager_id, notes, badge_number, role, is_active, created_at, updated_at`

**ASSET**
`id, asset_name, image_url, asset_tag, category, status, serial_number, warranty_expiry, end_of_life, order_number, purchase_date, purchase_cost, depreciation_value, manufacturer, supplier, location, department, assigned_to, notes, group, imei_number, ssd_encryption_status, connectivity, cpu, gpu, operating_system, ram, screen_size, storage_size, metadata, created_at, updated_at`

**STOREROOM_INVENTORY**
`id, item_name, image_url, quantity_available, model_number, purchase_date, unit_cost, total_cost, order_number, min_quantity, category, manufacturer, supplier, location, department, notes, created_at, updated_at`

**TRANSACTION_LOG**
`id, transaction_date, performed_by, transaction_type, event_description, asset_id, storeroom_item_id, to_user_id, from_user_id, quantity, notes, created_at`

See `erd.html` for the interactive diagram.

---

## Frontend Conventions

- **HTTP:** All requests go through `src/api.ts`. Never import or use axios directly inside a component or hook.
- **State:** Global state via React Context + `useReducer`. Do not add Redux, Zustand, or any other state library.
- **Styling:** Tailwind utility classes only. Import design tokens from `src/theme.ts` — do not hardcode hex values, font sizes, or spacing.
- **TypeScript:** Strict mode. All shared interfaces, types, and enums live in `src/types/`. Do not define reusable types inline in component files.
- **Components:** PascalCase filenames and default exports (e.g., `AssetTable.tsx`). Shared components in `src/components/`, route-level components in `src/pages/`.
- **Hooks:** Custom hooks prefixed with `use`, located in `src/hooks/`.

---

## Backend Conventions

- **Single app:** All models, serializers, views, and URLs belong in `backend/api/`. The `backend/core/` package is Django project config only — no business logic, no models.
- **Serializers:** Every API response must go through a DRF serializer. Do not return raw QuerySets or use `.values()` in views.
- **Auth:** JWT required on all protected endpoints. Configure via `DEFAULT_AUTHENTICATION_CLASSES` and `DEFAULT_PERMISSION_CLASSES` in settings.
- **Migrations:** Use `python manage.py makemigrations` and `migrate`. Never edit migration files by hand.
- **Database:** Local dev uses SQLite. Production uses PostgreSQL. Use `DATABASE_URL` env var to switch.

---

## Design System

Figma file: `https://www.figma.com/design/gSuJy9NwKbP9Qi9j7ctZOv/Pandora`

---

### Color Palette

Extracted from the **Blue Monochrome** primary palette and supporting swatches:

| Token name | Hex | Usage |
|---|---|---|
| `primary` | `#2e7cfd` | Primary blue — buttons, links, active states |
| `primary-dark` | `#226de6` | Hover / pressed state for primary |
| `blue-gray-md` | `#466291` | Secondary UI elements, borders |
| `blue-gray-dark` | `#425066` | Disabled states, subtle borders |
| `gray-dark` | `#31353c` | Surface backgrounds (cards, panels) |
| `gray-darkest` | `#2a2d33` | Page / sidebar background |
| `text-primary` | `#030c23` | All body text |
| `cyan-accent` | `#2dfcf9` | Highlight / badge accent |
| `orange-accent` | `#fc9c2d` | Warning / status badges |

Map these to `src/theme.ts` tokens. Do **not** hardcode hex values in components.

---

### Typography

Two font families — import both from Google Fonts (or bundle via Vite):

| Family | Role |
|---|---|
| **Roboto** | Headings, page titles, subtitles |
| **Archivo** | Body text, table cells, labels, inputs |

| Scale name | Family | Weight | Size | Line-height |
|---|---|---|---|---|
| `heading` | Roboto | Bold (700) | 56px | 66px |
| `subheading` | Roboto | Regular (400) | 20px | 28px |
| `subheading-bold` | Roboto | Bold (700) | 20px | 28px |
| `body` | Archivo | Regular (400) | 16px | 26px |
| `body-bold` | Archivo | Bold (700) | 16px | 26px |

---

### Key Component Patterns

Defined in Figma — reference these when building components:

| Component | Figma node |
|---|---|
| Sidebar nav | `21:1879` |
| Header | `21:2033` |
| Asset list / data table | `52:2246` |
| People list | `86:3957` |
| Activity log list | `49:800` |
| Statistic card | `43:621` |
| Pagination | `43:1542` |
| Search bar | `46:716` |
| Status badge | `51:2189` |
| Add item modal | `63:2715` |
| Deletion modal | `58:2661` |
| Add / Edit user modals | `86:4492`, `86:4571` |

To inspect a node: `https://www.figma.com/design/gSuJy9NwKbP9Qi9j7ctZOv/Pandora?node-id=<id>`

---

## Dev Commands

```bash
# Frontend
cd frontend
npm install
npm run dev          # http://localhost:5173

# Backend (first time)
cd backend
python -m venv .venv
source .venv/bin/activate    # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver   # http://localhost:8000

# Backend (subsequent runs)
cd backend && source .venv/bin/activate && python manage.py runserver
```

---

## Rules

### DO
- Use `src/api.ts` for every HTTP request
- Define all reusable TypeScript types in `src/types/`
- Use Tailwind classes and import tokens from `src/theme.ts` for all styling
- Put all Django business logic in `backend/api/`
- Use DRF serializers for every API response
- Use JWT auth on all protected endpoints

### DON'T
- Import axios directly inside components or hooks
- Hardcode colors, font sizes, or spacing — use `theme.ts` tokens
- Add Redux, Zustand, or any other state library
- Add models or business logic to `backend/core/`
- Return raw QuerySets or call `.values()` in views
- Edit migration files by hand

---

## Setup Status

### Completed
- [x] Vite + React + TypeScript frontend scaffolded
- [x] Tailwind CSS installed (`@tailwindcss/vite` plugin) and configured in `vite.config.ts`
- [x] Axios installed; `src/api.ts` centralized HTTP client with JWT interceptors (auto-attach + auto-refresh on 401)
- [x] `src/theme.ts` — design tokens: `colors`, `typography` (rem), `spacing`, `radius`, `sizing`
- [x] `src/index.css` — Google Fonts (Roboto + Archivo) + Tailwind base
- [x] Frontend folder structure created: `components/`, `pages/`, `context/`, `hooks/`, `types/`, `utils/`
- [x] Vite dev proxy: `/api` → `http://localhost:8000`
- [x] Django 5.2 project (`core/`) + `api` app scaffolded
- [x] `settings.py` configured: DRF, simplejwt, corsheaders, CORS for `localhost:5173`
- [x] JWT: 1h access token, 7d refresh token, rotation enabled
- [x] `core/urls.py` routes `/api/` → `api.urls`
- [x] `api/urls.py` exposes `/api/token/` and `/api/token/refresh/`
- [x] SQLite local dev DB; `DATABASE_URL` env var for PostgreSQL in prod
- [x] `requirements.txt` generated
- [x] Initial Django migrations applied
- [x] `react-router-dom` installed; routing wired in `App.tsx`
- [x] **Sign In page** (`/sign-in`) — Google-only auth, split card (form left / blue brand right), logo, underline decoration, responsive (blue panel hidden ≤768px)
- [x] **Sign Up page** (`/sign-up`) — two-step flow: Step 1 Google OAuth → Step 2 profile form; split card (blue brand left / form right); all 7 fields required (firstName, lastName, title, location, department, badgeNumber, manager); manager field is a combobox with dummy data
- [x] **`src/components/Button.tsx`** — `primary`, `google`, `ghost` variants; loading spinner; disabled state
- [x] **`src/components/Input.tsx`** — label, focus/error border states
- [x] **`src/types/auth.ts`** — `GoogleUser` and `SignUpFormData` interfaces
- [x] Logo assets in `public/` — `primary-logo-with-text.svg`, `whtie-logo-with-text.svg` (+ only variants)
- [x] Auth background image — `public/bg-auth.jpg` (sky/clouds photo from Figma)
- [x] `lucide-react` installed — use for all icons throughout the app
- [x] **`src/types/activity.ts`** — `TransactionLog` interface
- [x] **`src/components/Sidebar.tsx`** — collapsible sidebar (220px ↔ 64px); `colors.primary` background (semi-transparent, `bg-auth.jpg` shows through); collapsed state shows only toggle chevron (no logo); orange badge dot on Archive; active item `rgba(255,255,255,0.2)` highlight
- [x] **`src/components/Header.tsx`** — page title left; right: Quick Access dropdown (LayoutGrid icon), Notification dropdown (Bell icon with unread badge), avatar initials; both dropdowns have dummy data and close on backdrop click
- [x] **`src/components/StatisticCard.tsx`** — title, large value, optional trend (TrendingUp/Down, green/red percentage)
- [x] **`src/components/SearchBar.tsx`** — search icon, clear button, highlights border when active
- [x] **`src/components/Pagination.tsx`** — Previous / page numbers with ellipsis / Next; active page in `primary` blue
- [x] **`src/components/FeatureNotAvailableModal.tsx`** — modal matching Figma design (blue `!` circle, Cancel + Confirm pill buttons, backdrop close)
- [x] **`src/components/ActivityLogTable.tsx`** — self-contained table component; manages search, filter, sort, and pagination state internally; receives `logs: TransactionLog[]`
- [x] **`src/components/FilterDropdown.tsx`** — reusable filter dropdown; accepts `groups: { label, options }[]`; renders trigger button + chip panel
- [x] **`src/components/SortDropdown.tsx`** — reusable sort dropdown; accepts `options`, `activeSort`, `onSortChange`; renders trigger button + option list
- [x] **`src/pages/Home.tsx`** (`/home`) — full dashboard: `bg-auth.jpg` background, collapsible Sidebar, Header, 5 StatisticCards (dummy data), ActivityLogTable (68 dummy rows)
- [x] **`src/pages/ComingSoon.tsx`** — generic page used by all stub routes; renders Sidebar + Header + centered "Coming Soon" text on `bg-auth.jpg` background
- [x] All sidebar routes wired in `App.tsx`: `/assets`, `/inventory`, `/licenses`, `/activity`, `/people`, `/settings`, `/archive` → `ComingSoon`; default `*` redirects to `/home`
- [x] **`src/types/asset.ts`** — `Asset` interface (all ERD fields), `AssetStatus` union, `AssetCategory` union, `AddAssetFormData`
- [x] **`src/types/inventory.ts`** — `StoreroomInventory` interface (all ERD fields), `AddInventoryFormData`
- [x] **`src/components/AddAssetModal.tsx`** — scrollable modal (max-w 42rem); 25 ERD fields in 4 sections (Basic Info, Assignment, Hardware Specs, Purchase Info, Notes); 2-col grid; text + select inputs with focus highlight; resets form on close; submit is a no-op until backend is ready
- [x] **`src/components/AddInventoryModal.tsx`** — scrollable modal (max-w 38rem); 13 ERD fields in 4 sections (Item Details, Source, Location, Notes); same field patterns as AddAssetModal
- [x] **`src/pages/Assets.tsx`** (`/assets`) — stat cards (Available 56 +66%, Deployed 18 -66%, To Audit 4); filter tabs (All Assets / Available / Deployed / In Repair / Retired / To Audit); table with checkbox, Item Name, Serial Number, Category, Current Holder, Status dot, row actions (Trash/Image/Edit icons + Check Out / Check In pill); Export → FeatureNotAvailableModal; New + → AddAssetModal; search + pagination; 25 dummy rows
- [x] **`src/pages/Inventory.tsx`** (`/inventory`) — stat cards derived from dummy data (Total Items, Total Units, Low Stock, Out of Stock); filter tabs (All / Low Stock / Out of Stock) with contextual active colors (blue/orange/red); table with checkbox, Item Name (AlertTriangle icon for low/out stock), Model Number, Category badge, Qty Available (color-coded), Min Qty, Location, Dept, row actions (Trash/Edit icons + Restock pill); Export → modal; New + → AddInventoryModal; search + pagination; 20 dummy rows

### Layout conventions (app shell)
- Every authenticated page uses `bg-auth.jpg` as the full-viewport background image (full opacity, no filter)
- Sidebar: `rgba(46, 124, 253, 0.88)` — semi-transparent primary blue, `backdropFilter: blur(4px)`
- Main content column: `rgba(244, 246, 249, 0.92)` — semi-transparent light gray
- Header: `rgba(255, 255, 255, 0.95)` — near-solid white, `backdropFilter: blur(8px)`
- Sidebar collapsed width: `64px` (icon/toggle only); expanded: `220px`

### Auth Flow — Implementation Notes
- Google OAuth is **mocked** on the frontend (simulates a successful login with dummy data). Wire up by replacing the `handleGoogleSignIn` / `handleGoogleSignUp` click handlers with a redirect to `/api/auth/google/login` once the Django backend OAuth endpoint is ready.
- After Google auth, the Sign Up flow collects the profile and should `POST /api/users/register` with the form data + the Google-issued token.
- `manager` field stores a name string for now (dummy data). Replace `DUMMY_MANAGERS` in `SignUp.tsx` with a `GET /api/users/` call and resolve to a `manager_id` FK on submit.

### Activity Log — Implementation Notes
- 68 dummy rows generated at runtime in `Home.tsx` (`generateLogs()`). Replace with `GET /api/transactions/` when the backend endpoint is ready.
- Search filters client-side across user, type, event, item, to/from, and notes fields.
- Filter and Sort dropdowns are visual-only (dummy chips/options). Wire up when backend supports query params (e.g. `?type=Asset&sort=date_desc`).
- Notification and Quick Access dropdowns in `Header.tsx` use hardcoded dummy data. Replace with real API calls when available.

### Assets — Implementation Notes
- Stat card values (Available 56, Deployed 18, To Audit 4) are hardcoded dummies. Replace with `GET /api/assets/stats/` or derive client-side from `GET /api/assets/` response.
- 25 dummy rows defined inline in `Assets.tsx`. Replace with `GET /api/assets/` — pass `?status=<tab>` and `?search=<q>` as query params once backend supports filtering.
- Row actions (Trash, Image, Edit, Check Out/In) all open `FeatureNotAvailableModal`. Wire each to its real endpoint when ready (`DELETE /api/assets/:id/`, `PATCH /api/assets/:id/`, `POST /api/assets/:id/checkout/`).
- "New +" opens `AddAssetModal`; the submit handler is a no-op — wire to `POST /api/assets/` when backend is ready.

### Inventory — Implementation Notes
- Stat card values are derived from the 20 dummy rows at module load. Replace with `GET /api/inventory/stats/` or compute from API response.
- 20 dummy rows defined inline in `Inventory.tsx`. Replace with `GET /api/inventory/` — pass `?filter=low_stock` / `?filter=out_of_stock` for tab filtering.
- Row actions (Trash, Edit, Restock) all open `FeatureNotAvailableModal`. Wire to `DELETE /api/inventory/:id/`, `PATCH /api/inventory/:id/`, `PATCH /api/inventory/:id/restock/`.
- "New +" opens `AddInventoryModal`; submit is a no-op — wire to `POST /api/inventory/` when backend is ready.

### Next Up
- [ ] Define models in `backend/api/models.py` (User, Asset, StoreroomInventory, TransactionLog)
- [ ] Write serializers and views for each model
- [ ] Implement Google OAuth on the Django backend (`/api/auth/google/`) and issue JWT on success
- [ ] Wire frontend auth handlers to real OAuth endpoints
- [ ] Add protected route wrapper (redirect to `/sign-in` if no valid JWT)
- [ ] Replace dummy Asset data with `GET /api/assets/` and wire all row actions
- [ ] Replace dummy Inventory data with `GET /api/inventory/` and wire all row actions
- [ ] Replace dummy Activity Log data with `GET /api/transactions/`
- [ ] Replace dummy Header notifications with real endpoint
- [ ] Build out Licenses, People, Activity, Settings, Archive pages per Figma designs
