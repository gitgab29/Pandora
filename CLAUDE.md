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
- [x] `src/theme.ts` — all color and typography design tokens
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

### Next Up
- [ ] Define models in `backend/api/models.py` (User, Asset, StoreroomInventory, TransactionLog)
- [ ] Write serializers and views for each model
- [ ] Build frontend pages and components per Figma designs
