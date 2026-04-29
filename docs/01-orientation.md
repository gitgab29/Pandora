# 01 · Orientation

## What Pandora is

An internal IT and fixed-asset management tool for **Embedded Silicon**. It replaces the spreadsheets that the IT team used to track:

- **Hardware assets** — laptops, phones, monitors, PCs (one physical thing per row)
- **Storeroom inventory** — accessories that come in quantities (cables, mice, chargers)
- **Transactions** — every check-in, check-out, status change, archive, and restore

The audience is a small team of IT administrators who live in this tool every day. They are technical, precise, and prefer dense interfaces over wizards. Every design decision serves that audience first.

## Mental model

```
People  ──assigned──>  Assets         (one-to-many; one holder per asset)
People  ──holds──────  Accessories    (many-to-many via TransactionLog; quantities)
Every action  ────>    TransactionLog (immutable audit trail)
```

A *person* is just a User row. An IT admin is also a User, with `role = ADMIN`.

## Glossary

| Term | Meaning |
|---|---|
| **Asset** | A single physical item with a unique `asset_tag` (e.g. `LT-0042`). Has one current holder, one current status. Tracked individually. |
| **Accessory** | A bulk-stocked item with a `quantity_available` count. Tracked by net quantity per holder, not per unit. |
| **License** | Planned entity — schema not yet defined. The Inventory tab renders [`ComingSoonPanel`](../frontend/src/components/ComingSoonPanel.tsx). Don't build for it yet. |
| **Consumable** | Same as License — placeholder, no schema. |
| **TransactionLog** | An append-only event row. Every check-in, check-out, status change, archive, and adjustment writes one. Immutable in admin (see [`backend/api/admin.py:48`](../backend/api/admin.py#L48)). |
| **Check-out** | Hand an asset (or N units of an accessory) to a person. Writes a `CHECK_OUT` log. For assets, sets `assigned_to` and flips status to `DEPLOYED`. |
| **Check-in** | Return it. Writes `CHECK_IN`. For assets, clears `assigned_to` and flips to `AVAILABLE`. |
| **Assign** | Synonym for check-out in the People-side UI. There is no separate "assignment" entity — assignment *is* the asset's `assigned_to` FK. |
| **Archive** | Soft-delete. Sets `is_archived = true` plus reason (`DELETED` or `RETIRED`). The row stays in the DB; queries default to hiding it. |
| **Retire** | A flavour of archive (`archive_reason = 'RETIRED'`). Used for end-of-life kit and departing employees. |
| **Hard delete** | Actually removes the row. Only available on already-archived items, via `/hard_delete/`. |

## `asset_tag` vs `id` — read this once and never forget

| Field | Type | Stable? | Human-facing? | Used in URLs? |
|---|---|---|---|---|
| `id` | UUID string | Yes — generated once by Django | No | Yes (`/api/assets/<id>/`) |
| `asset_tag` | string, unique | Editable in admin | **Yes** — what users see in tables and on the device sticker | No |

The displayed identifier in every Asset table, modal, and header is `asset_tag`. `id` is only ever a URL parameter or a foreign-key value. Never bind a UI element to `id` directly.

Same rule for users: `id` is a UUID; the human label is `first_name + last_name`, sourced from the nested `assigned_to_detail` object the serializer attaches.

## Status enum casing

Asset statuses are uppercase enum values, not Title Case strings. See [`backend/api/models.py:87-93`](../backend/api/models.py#L87-L93) and the frontend mirror in [`frontend/src/types/asset.ts:1-7`](../frontend/src/types/asset.ts#L1-L7).

```ts
'AVAILABLE' | 'DEPLOYED' | 'IN_REPAIR' | 'IN_MAINTENANCE' | 'TO_AUDIT' | 'LOST'
```

For display, run them through `ASSET_STATUS_LABELS` from [`types/asset.ts:18`](../frontend/src/types/asset.ts#L18). Never write `asset.status === 'Available'` — it will silently always be false.

## Currency

Peso (`₱`). Format with two decimal places. See [`AssetDetailModal.tsx:104-107`](../frontend/src/components/AssetDetailModal.tsx#L104-L107) for the canonical formatter.

## Screenshots

> Placeholder — replace with real screenshots once the staging URL stabilises.

| Screen | Placeholder |
|---|---|
| `/sign-in` | `docs/img/sign-in.png` |
| `/home` (dashboard) | `docs/img/home.png` |
| `/inventory?tab=Assets` | `docs/img/inventory-assets.png` |
| `/inventory?tab=Accessories` | `docs/img/inventory-accessories.png` |
| `/people` (directory) | `docs/img/people.png` |
| `/activity` | `docs/img/activity.png` |
| Asset detail modal | `docs/img/asset-detail.png` |
| Person detail modal | `docs/img/person-detail.png` |

Drop captures into `docs/img/` and link them inline in the matching guide section. Keep file names lowercase and hyphenated.

## Where to go next

- New laptop, never run the project locally → [02-getting-started.md](02-getting-started.md)
- Want the system map → [03-architecture.md](03-architecture.md)
- Need to know an entity's fields → [04-data-model.md](04-data-model.md)
