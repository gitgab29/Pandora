# 08 · Testing & QA

There is no automated test suite yet (see [10-roadmap.md](10-roadmap.md)). Until there is, every PR rests on a manual smoke test.

## Pre-PR smoke checklist

Run these after every non-trivial change. Do all of them — picking-and-choosing is how regressions ship.

### Auth

- [ ] Sign in with valid creds lands on `/home`
- [ ] Sign in with wrong password shows the error toast, stays on `/sign-in`
- [ ] Hard refresh on any page rehydrates the session (no flicker back to `/sign-in`)
- [ ] Sign out from the sidebar clears localStorage and lands on `/sign-in`
- [ ] Open the app in a private window and try to navigate directly to `/home` → redirected to `/sign-in`

### Inventory · Assets

- [ ] Add an asset; confirm it appears in the table and the Total stat increments
- [ ] Click the row → AssetDetailModal opens (read-only)
- [ ] Edit from inside the detail modal; confirm changes persist after refresh
- [ ] Check out to a person; status flips to `DEPLOYED`, holder badge appears, Activity log shows a `CHECK_OUT` row
- [ ] Check in; status flips to `AVAILABLE`, holder cleared, Activity log shows `CHECK_IN`
- [ ] Change status to In Repair, then resolve via "Mark Repaired" — confirm it returns to the prior `AVAILABLE`/`DEPLOYED` (not always `AVAILABLE`)
- [ ] Filter by status from the URL (`/inventory?tab=Assets&status=DEPLOYED`); confirm the filter applies
- [ ] Search by manufacturer + model substring (e.g. "Dell Latitude") — confirm matches

### Inventory · Accessories

- [ ] Add an accessory with a quantity
- [ ] Check out N units to a person; quantity decrements, log row written
- [ ] Try to check out more than `quantity_available` — server rejects with `400` and inventory unchanged
- [ ] Check in same units; quantity restored
- [ ] Holders view (in PersonDetailModal accessories subtab) shows correct net quantity per person

### People

- [ ] Add a person; appears in the directory
- [ ] Click row → PersonDetailModal opens
- [ ] Assets subtab shows assets currently `assigned_to` this person
- [ ] Accessories subtab shows correct held quantities
- [ ] Retire the person — they're auto-checked-in for any held assets and removed from the active directory; Activity logs an `ARCHIVE` row

### Activity

- [ ] Most recent transaction is at the top
- [ ] Click any row → ActivityDetailModal shows full context (acting admin, target, notes, related entity link)
- [ ] Filter by transaction_type works

### Archive

- [ ] Soft-deleting an item moves it to Archive (not removed)
- [ ] Restoring un-archives and the item reappears in active lists
- [ ] Hard delete from Archive removes the row entirely (irreversible)

### Visual / theme

- [ ] No card-in-card surfaces introduced
- [ ] No hardcoded hex colours in the diff (search for `#` in your changes)
- [ ] Sidebar collapses and re-expands cleanly; main content reflows
- [ ] Glass effect still visible behind the sidebar (don't have a solid blue rectangle)
- [ ] All new buttons have a hover state

## What to run locally

Before committing, run:

```bash
# Frontend
cd frontend
npm run lint        # ESLint
npm run build       # tsc + vite build — catches type errors
```

```bash
# Backend
cd backend
python manage.py check                  # Django config check
python manage.py makemigrations --check # fails if you forgot to generate one
python manage.py test                   # currently a no-op; placeholder for when tests land
```

If the typecheck or build fails, fix it before pushing. Don't `// @ts-ignore` your way past a type error — the type definition is probably wrong, fix it instead.

## Known sharp edges

| Area | Edge |
|---|---|
| **Token reference** | [`AssetDetailModal.tsx:265`](../frontend/src/components/AssetDetailModal.tsx#L265) reads `colors.textSecondary`, which doesn't exist in [`theme.ts`](../frontend/src/theme.ts). Triggers a runtime undefined-property render in one inline-resolve UI path. Tracked in [10-roadmap.md](10-roadmap.md). |
| **Pagination size** | DRF pagination is on with `PAGE_SIZE: 500`. Lists of more than 500 rows will silently get cut off until pagination is wired in the UI. We don't have entities that large yet, but People could exceed it long-term. |
| **No retry for non-401 errors** | The axios interceptor only handles `401`. Network failures, `5xx`, and `429` bubble up to the caller as a rejected promise — components must handle these themselves. |
| **JWT in localStorage** | Susceptible to XSS. Acceptable for an internal tool with trusted authors; revisit before any external rollout. |
| **No CSRF protection on JWT routes** | Standard for token-auth APIs, but worth knowing if you start mixing session auth in. |
| **Throttle limits during heavy local testing** | 240 req/min/user is easy to hit when iterating on a list page. Comment the throttle classes locally if you need to. |
| **`previous_status` only restores AVAILABLE/DEPLOYED** | The detail modal's resolve path coerces anything else to `AVAILABLE` — see [`AssetDetailModal.tsx:73-77`](../frontend/src/components/AssetDetailModal.tsx#L73-L77). Edge cases with chained abnormal transitions can lose context. |
| **Google OAuth requires env var** | `GOOGLE_OAUTH_CLIENT_ID` is unset by default. The Google sign-in button will return `503` until set. |
| **Time zone** | `TIME_ZONE = 'UTC'` everywhere. The frontend formats with the user's locale — don't assume server time = local time. |

## What to add when you start a real test suite

This is preference, not policy:

- Backend: `pytest-django` for viewset tests; one test per `@action` covering happy path + at least one 4xx
- Backend: factory-boy for fixtures — keep test data isolated per-test, don't share a global seed
- Frontend: Vitest + React Testing Library for components; one test per modal covering open/close + the primary action
- E2E: Playwright; one per user-facing workflow (sign-in, asset check-out, accessory check-out, archive)
