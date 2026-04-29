# 05 · Frontend conventions

The frontend is a Vite + React + TypeScript app. No CSS framework beyond inline styles built from tokens. No state library beyond React Context. No HTTP library beyond axios — and even that is hidden behind one module.

## Folder responsibilities

| Folder | Holds | Does not hold |
|---|---|---|
| `src/api.ts` | Every HTTP call, organised by resource | Component code, JSX, business logic |
| `src/theme.ts` | Design tokens (colors, spacing, typography, shadows, transitions, …) | Component-specific styles |
| `src/pages/` | One file per route, registered in `App.tsx` | Reusable widgets |
| `src/components/` | Reusable UI — modals, table cells, buttons | Page composition |
| `src/context/` | Global state via Context + reducer | Local component state |
| `src/hooks/` | Custom hooks named `use<Name>.ts` | Anything that isn't a hook |
| `src/types/` | Shared interfaces, grouped by domain (`asset.ts`, `inventory.ts`, …) | Type definitions used by exactly one file |
| `src/utils/` | Pure helpers | Anything that touches React or the network |

If you can't figure out where a new file belongs, it probably belongs in the page that uses it. Don't pre-share things.

## Tokens, from `theme.ts`

Read [`theme.ts`](../frontend/src/theme.ts) once before adding styles. Every value you'd otherwise hardcode is exported there:

| Export | What it gives you |
|---|---|
| `colors` | Brand, surfaces, semantic, borders, overlay |
| `typography` | `heading`, `subheading`, `body`, with bold variants |
| `fontSize` | One-off sizes (`display`, `h1`–`h6`, `body`, `lg`–`micro`, `label`) |
| `spacing` | `xs` → `xl4` for padding/margin/gap |
| `radius` | `sm` → `xl2` plus `full` |
| `sizing` | Sidebar widths, header height |
| `shadows` | `card`, `dropdown`, `modal`, `auth` |
| `surfaces` | Translucent overlays — row hover, glass, dividers |
| `transitions` | Reusable transition strings |
| `badgeColors` | Per-event-type chip palette |
| `statusColors` | Asset status dot colours |
| `chartColors` | Recharts palette by enum value |

Rules:

- Don't hardcode hex codes. If the value you need isn't in `theme.ts`, **add it there first**, then use it.
- Don't hardcode pixel values for spacing or font size. Use `spacing.*` and `fontSize.*`.
- Inline styles are fine — most of the codebase uses them. The point is the values come from tokens, not where they're applied.

## The `api.ts` rule

Everything HTTP goes through [`src/api.ts`](../frontend/src/api.ts). Components and hooks **never** import axios directly.

This buys three things:

1. JWT attachment is automatic (request interceptor at [`api.ts:14-20`](../frontend/src/api.ts#L14-L20))
2. 401 retry-with-refresh is automatic (response interceptor at [`api.ts:22-43`](../frontend/src/api.ts#L22-L43))
3. Pagination unwrapping is automatic (`unwrapList` at [`api.ts:46-49`](../frontend/src/api.ts#L46-L49))

Each resource gets a const object with named methods:

```ts
export const assetsApi = {
  list:   (params?) => api.get<Asset[] | Paginated<Asset>>('/assets/', { params }).then(r => unwrapList(r.data)),
  get:    (id)      => api.get<Asset>(`/assets/${id}/`).then(r => r.data),
  create: (data)    => api.post<Asset>('/assets/', data).then(r => r.data),
  // …
};
```

### Worked example: adding a new endpoint wrapper

Suppose the backend grows a `GET /api/assets/<id>/depreciation_history/` endpoint that returns an array of `{ date, value }`.

```ts
// frontend/src/api.ts — inside the assetsApi object

depreciationHistory: (id: string) =>
  api.get<{ date: string; value: number }[]>(`/assets/${id}/depreciation_history/`)
     .then(r => r.data),
```

Then in a component:

```ts
import { assetsApi } from '../api';

useEffect(() => {
  assetsApi.depreciationHistory(asset.id).then(setHistory);
}, [asset.id]);
```

That's it. No new axios instance, no header juggling, no error handling for 401 (the interceptor takes care of it).

## Context + reducer pattern

Global state uses Context + `useReducer`. The canonical example is [`AuthContext.tsx`](../frontend/src/context/AuthContext.tsx). Every new context follows the same five sections:

```tsx
// 1. State shape
interface XState { /* … */ }

// 2. Action union
type XAction = { type: 'SET_FOO'; payload: Foo } | { type: 'CLEAR' };

// 3. Pure reducer
function xReducer(state: XState, action: XAction): XState { /* … */ }

// 4. Provider
export function XProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(xReducer, initialState);
  // expose actions as bound functions
  return <XContext.Provider value={{ ...state, doThing }}>{children}</XContext.Provider>;
}

// 5. Hook with non-null assertion
export function useX() {
  const ctx = useContext(XContext);
  if (!ctx) throw new Error('useX must be used inside XProvider');
  return ctx;
}
```

Keep reducers pure (no side effects). Async work (API calls) lives in the bound action functions inside the provider, which dispatch on success/failure. See `login()` in [`AuthContext.tsx:78-81`](../frontend/src/context/AuthContext.tsx#L78-L81).

Wire new providers into the stack at the root in [`App.tsx:18-37`](../frontend/src/App.tsx#L18-L37). Order matters when one provider depends on another.

## Page composition

Every authenticated page has the same shell:

```tsx
<>
  <Sidebar collapsed={…} onToggle={…} />
  <Header title="…" />
  <main style={{ marginLeft: sidebarCollapsed ? sizing.sidebarCollapsed : sizing.sidebarExpanded }}>
    {/* page body */}
  </main>
</>
```

`Sidebar` and `Header` already know how to render against the dark `bg-auth.jpg` background. The page body is the white panel — keep it on layer 3 (don't add another card around the whole thing).

URL parameters are how we link between views:

- `/inventory?tab=Assets` opens the Assets tab ([`Inventory.tsx:65-74`](../frontend/src/pages/Inventory.tsx#L65-L74))
- `/inventory?tab=Assets&status=DEPLOYED` pre-filters the table — read in `AssetsTabContent`
- The Header quick-access dropdown and Home stat cards both navigate via these params

When you add a new filter that should be deep-linkable, follow the same pattern with `useSearchParams`.

## The modal trio: Add, Edit, Detail

Most entities have three modals working together:

| Role | Triggered by | Behaviour |
|---|---|---|
| **Add** | "Add" button on the toolbar | Empty form, POST on submit |
| **Edit** | "Edit" button inside Detail | Form pre-filled, PATCH on submit |
| **Detail** | Clicking a row | **Read-only.** Shows everything. Footer offers contextual actions (Check Out, Check In, Set Lost, …) gated by the entity's current state. |

Row clicks open Detail, never Edit. Edit is reachable from inside Detail. This protects against fat-finger writes and matches the user research: admins want to *look at* a row much more often than they want to change it.

The canonical implementation is [`AssetDetailModal.tsx`](../frontend/src/components/AssetDetailModal.tsx). Things to copy from it:

- **Header layout** ([lines 119-185](../frontend/src/components/AssetDetailModal.tsx#L119-L185)): icon tile + title block + action buttons. Title is the human ID (`asset_tag`), with a single subtitle line and a row of badges below.
- **`InfoField` + `SectionLabel`** ([lines 44-63](../frontend/src/components/AssetDetailModal.tsx#L44-L63)): two tiny components define the read-only field grid. Reuse these (or copy the pattern) for any new detail modal.
- **Three-column field grid** with `gridTemplateColumns: 'repeat(3, 1fr)'` and `gap: spacing.lg + spacing.xl2`. This is the rhythm of the entire modal.
- **Footer actions are derived from state**, not always-visible. `showCheckOut = status === 'AVAILABLE' && !!onCheckOut`, etc. ([lines 80-86](../frontend/src/components/AssetDetailModal.tsx#L80-L86)). Don't render disabled buttons; render only the ones that make sense right now.
- **Close-and-then-act**: action buttons close the detail modal first, then invoke the parent's handler ([line 88](../frontend/src/components/AssetDetailModal.tsx#L88)). The parent opens the next modal (e.g. CheckOut). Two single-purpose modals beat one mode-switching modal.

When you build the next entity's detail modal, copy the file, rename the type imports, swap the field grid, and keep the footer pattern.

## Shared style helpers

A few re-exported style snippets keep tables consistent: `TH`, `TD`, `NEW_BG`, `NEW_BG_HOVER`, `HOVER_BG`, `restingBg` from `components/tableStyles.ts` (used in `Inventory.tsx`, `AssetsTabContent.tsx`, etc.). When you build another table, import these instead of writing your own.

## Things to avoid

| Anti-pattern | Do this instead |
|---|---|
| `import axios` in a component | `import { assetsApi } from '../api'` |
| `style={{ color: '#2e7cfd' }}` | `style={{ color: colors.primary }}` |
| `Math.max(...rows.map(r => r.id))` | `crypto.randomUUID()` |
| Comparing `asset.status === 'Available'` | `asset.status === 'AVAILABLE'`; for display, `ASSET_STATUS_LABELS[asset.status]` |
| Showing a name by reading `assigned_to` (UUID) | Read `assigned_to_detail.first_name + last_name` |
| Adding Redux | Don't. New state goes in a Context. |
| A card inside another card | Use a divider, a stripe, or a section label — not nested surfaces. |
