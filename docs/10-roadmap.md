# 10 · Roadmap

Live work is tracked elsewhere; this page is the long-running backlog plus the architectural questions that don't have a single owner yet.

## Carried from CLAUDE.md "Next up"

These are the items currently listed in [`../CLAUDE.md`](../CLAUDE.md#next-up). Single source of truth: CLAUDE.md. Cross-listed here so this guide reads as a complete picture.

- Set `GOOGLE_OAUTH_CLIENT_ID` env var and test Google OAuth end-to-end
- Build out Licenses, Settings, Archive pages
- Add a protected-route role guard (admin-only sections)
- Deploy to AWS (RDS + static hosting)
- Polish: animations, micro-interactions, edge-case handling

## Documentation TODOs

Discovered while writing this guide. Each one is a small, scoped task — not a project.

| # | Task | Why it matters |
|---|---|---|
| D1 | **Reconcile CLAUDE.md endpoint table with reality.** It's missing `retire`, `restore`, `hard_delete`, `auto_archive_eol`, accessory `holders`, archive query params (`include_archived`, `archived_only`, `archive_reason`), and transaction time-window filters (`older_than_days`, `within_last_days`). Either expand the table or replace it with "see `urls.py` + `api.ts`". | Interns reading the doc will think these endpoints don't exist. |
| D2 | **CLAUDE.md says User has `image_url`** ("Recently completed: Add `image_url` field to User model"). Migration [`0004_remove_image_url_from_user_and_accessory`](../backend/api/migrations/0004_remove_image_url_from_user_and_accessory.py) **removed** it from User and Accessory. The frontend has no references either. Remove the bullet from CLAUDE.md, or restore the field if profile images are still wanted. | Stale doc claim; intern will look for a column that doesn't exist. |
| D3 | **`AssetDetailModal.tsx:265` references `colors.textSecondary`**, which is not exported by [`theme.ts`](../frontend/src/theme.ts). Latent bug in the canonical detail modal. Either add the token (and wire it intentionally) or replace the reference with `colors.blueGrayMd`. | Renders the wrong colour in the resolve-confirm UI path; weakens "canonical example" claim. |
| D4 | **Create a checked-in `.env.example`** for both `frontend/` and `backend/`, sourced from [02-getting-started.md § Environment variables](02-getting-started.md#environment-variables). | Right now interns have to read source code to find the var names. |
| D5 | **Capture real screenshots** for `docs/img/` and replace the placeholders in [01-orientation.md § Screenshots](01-orientation.md#screenshots). | First-day intern shouldn't have to spin up a local environment to know what the app looks like. |
| D6 | **Document the auth response shape** in `types/auth.ts` matches what the backend returns (`{access, refresh, user}`). They do match today, but neither side cites the other. Add a comment on `AuthTokens` linking to [`auth.py:16-29`](../backend/api/auth.py#L16-L29). | If the payload changes one side without the other, the only catch is runtime errors at login. |
| D7 | **Decide whether to enumerate Notifications and Recency contexts.** They live alongside Auth and Toast in [`App.tsx:18-37`](../frontend/src/App.tsx#L18-L37) but aren't documented anywhere. | Newcomers reading [05-frontend-conventions.md](05-frontend-conventions.md) see they exist but won't know their contracts. |

## Open architectural questions

Not bugs — design choices that haven't been made yet. Surface them when the relevant work starts.

| # | Question | Why it's open |
|---|---|---|
| Q1 | **License schema.** Per-seat (quantity) or per-user (FK assignments)? Do licenses expire? Renewal flow? | Blocks Recipe 4 in [07-cookbook.md](07-cookbook.md). Whatever we pick will set a precedent for Consumables. |
| Q2 | **Consumable schema.** Is this just a flavour of Accessory with a different label, or a distinct entity with usage tracking? | If it's a label, drop it from the tabs. If it's distinct, write the model. |
| Q3 | **Role guards.** Right now every authenticated user can do everything. Do we need an `IsAdmin` permission for retire / hard delete / user creation? | Not urgent for an internal IT tool, but the placeholder is in CLAUDE.md's "Next up". |
| Q4 | **Where does a user's profile photo live?** Migration `0004` removed `image_url` from User. If profile images come back, do we store URLs (S3) or upload binaries (Django storage)? | Affects the People modal and Header avatar. |
| Q5 | **Pagination in the UI.** Backend pagination is on at `PAGE_SIZE: 500`. Frontend doesn't render page controls anywhere. What's the plan when a list crosses 500 rows? | Will silently truncate today. |
| Q6 | **Test strategy.** No tests exist. When we add the first one, do we go pytest + Vitest, or wait for E2E with Playwright as the primary safety net? | The first test sets the precedent. |
| Q7 | **Audit log retention.** `TransactionLog` grows unboundedly. Do we keep everything forever, archive after N years, or compact older rows? | Not a problem yet. Will be at year-3 scale. |
| Q8 | **Tenant isolation.** Embedded Silicon is one company today. If this ever supports multiple, we'll need `organization_id` on every row and a tenant filter on every queryset. Cheaper to plan now than retrofit. | Speculative — flag if it becomes likely. |
| Q9 | **Bulk import.** No CSV upload anywhere. The team currently seeds from spreadsheets via Django admin. Does the UI need a "bulk add" path? | Came up in onboarding; no decision. |
