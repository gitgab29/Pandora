# 04 · Data model

The authoritative schema lives in two places, in this order of precedence:

1. [`backend/api/models.py`](../backend/api/models.py) — the actual Django source
2. [`erd.html`](../erd.html) — Mermaid ERD; open in a browser

If they disagree, `models.py` wins and the ERD needs updating.

What follows is a field-level reference for the four current entities. Don't trust this file's field lists if you're touching schema — re-read `models.py`. This page is what to know about each entity, not a substitute for the source.

## Shared mixins

Every entity except `TransactionLog` inherits two mixins from [`models.py:26-49`](../backend/api/models.py#L26-L49):

- `TimeStampedModel` → `created_at`, `updated_at`
- `ArchivableMixin` → `is_archived`, `archive_reason` (`DELETED` | `RETIRED`), `archived_at`, `archived_by`, `archive_notes`

`TransactionLog` deliberately omits these — logs are immutable and never archived.

## User

[`models.py:52-83`](../backend/api/models.py#L52-L83). Replaces `django.contrib.auth.models.User`; email is the username field.

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key. Stored as a string in JSON. |
| `email` | string, unique | Login identifier — `USERNAME_FIELD` |
| `first_name`, `last_name` | string | Required |
| `title`, `location`, `business_group` | string, optional | Org metadata |
| `supervisor` | FK → self, nullable | `on_delete=SET_NULL`; reverse name `reports` |
| `notes` | text, optional | |
| `badge_number` | string, optional | Physical badge ID |
| `role` | enum `ADMIN` \| `STAFF` | Default `STAFF`; superusers default to `ADMIN` |
| inherited `is_archived`, `archive_reason`, `archived_at`, `archived_by`, `archive_notes` | | Soft-delete support |

**Things that aren't here but you might expect:**

- No `image_url`. It existed in migration `0001` and was removed in [`0004_remove_image_url_from_user_and_accessory.py`](../backend/api/migrations/0004_remove_image_url_from_user_and_accessory.py). Any reference to a profile image in CLAUDE.md is stale — see [10-roadmap.md](10-roadmap.md).
- No `is_retired` boolean. Retirement is `is_archived = true` + `archive_reason = 'RETIRED'`.

## Asset

[`models.py:86-143`](../backend/api/models.py#L86-L143). One row per physical item.

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | |
| `asset_tag` | string, unique | The human identifier — what shows up in tables and on the device sticker |
| `model` | string, optional | Display name like "Latitude 5540" |
| `category` | enum | `Laptop`, `Phone`, `Tablet`, `PC`, `Monitor`, `Accessory`, `Other` |
| `status` | enum | `AVAILABLE`, `DEPLOYED`, `IN_REPAIR`, `IN_MAINTENANCE`, `LOST`, `TO_AUDIT` |
| `previous_status` | enum, nullable | Saved when entering an "abnormal" status; restored when leaving — see invariants below |
| `serial_number` | string | |
| `warranty_expiry`, `end_of_life` | date, nullable | |
| `order_number`, `purchase_date` | optional | Procurement |
| `purchase_cost`, `depreciation_value` | decimal(12,2), nullable | Stored as strings in JSON; format with `₱` |
| `manufacturer`, `supplier` | string, optional | |
| `assigned_to` | FK → User, nullable | `on_delete=SET_NULL`; reverse `assets`. UI must display `assigned_to_detail.first_name + last_name`. |
| `notes` | text | |
| `group` | enum `PRODUCT` \| `PARTS` | Optional grouping |
| `imei_number` | string | Phones |
| `cpu`, `gpu`, `operating_system`, `ram`, `screen_size`, `storage_size` | string | Specs (laptops/PCs) |
| `metadata` | JSON | Free-form bucket for fields that don't deserve a column yet |

**Things that aren't here but you might expect:**

- No `asset_name` and no `location`. The display label is `asset_tag`; if you need a location, it's at the User level (`assigned_to_detail.location`) or in `notes`.
- No `image_url`, `business_group`, `ssd_encryption_status`, `connectivity` — removed in migration `0003`.

## Accessory

[`models.py:146-166`](../backend/api/models.py#L146-L166). One row per kind of stocked item.

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | |
| `item_name` | string | Display name |
| `quantity_available` | integer | Decremented on check-out, incremented on check-in. Updated under `select_for_update()` to serialise concurrent edits. |
| `model_number` | string, optional | |
| `purchase_date` | date, optional | |
| `unit_cost` | decimal(12,2), nullable | |
| `order_number` | string, optional | |
| `min_quantity` | integer, default 0 | "Low stock" threshold for the dashboard chart |
| `category`, `manufacturer`, `supplier`, `location`, `notes` | optional | |

`total_cost` is exposed by the serializer as `unit_cost * quantity_available` — read-only, computed via `SerializerMethodField` ([`serializers.py:97-100`](../backend/api/serializers.py#L97-L100)).

There is no per-unit identity; everything is quantity-based. If a workflow needs to track *individual* accessory units, model it as an `Asset` with `category = 'Accessory'`.

## TransactionLog

[`models.py:169-233`](../backend/api/models.py#L169-L233). Append-only audit trail. Read-only in DRF (`TransactionLogViewSet` is `ReadOnlyModelViewSet`) and read-only in admin (`readonly_fields` cover the timestamp fields).

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | |
| `transaction_date` | datetime, default now, indexed | Most queries order by `-transaction_date` |
| `performed_by` | FK → User, `PROTECT` | The acting admin. `PROTECT` means you cannot delete a User who has logs — only retire/archive them. |
| `transaction_type` | enum (12 values) | See list below |
| `event_description` | text | Human-readable summary the UI displays without joining to other tables |
| `asset` / `accessory` | FK, nullable | Set whichever applies |
| `to_user` / `from_user` | FK → User, nullable | Recipients/senders for transfers |
| `quantity` | integer, default 1 | For accessory check-outs |
| `notes` | text | Optional admin notes |
| `created_at` | datetime, auto | Distinct from `transaction_date` for back-dated entries (rare) |

Transaction types ([`models.py:170-182`](../backend/api/models.py#L170-L182)):

```
CHECK_OUT, CHECK_IN, TRANSFER, ADJUSTMENT,
ARCHIVE, RESTORE,
STATUS_IN_REPAIR, STATUS_IN_MAINTENANCE, STATUS_LOST,
STATUS_TO_AUDIT, STATUS_AVAILABLE, STATUS_DEPLOYED
```

A `CheckConstraint` enforces that every log row references *something*: at least one of `asset`, `accessory`, `to_user`, `from_user` must be set ([`models.py:218-229`](../backend/api/models.py#L218-L229)). If you write a viewset that creates a log without any of these, the database will reject it.

## Critical invariants

Re-read these before touching anything that mutates state.

### 1. UUIDs are strings, not numbers

Every `id` (`User`, `Asset`, `Accessory`, `TransactionLog`) is a UUID returned to the frontend as a string. In TypeScript:

```ts
// CORRECT
const selected = new Set<string>();
const newTempId = crypto.randomUUID();

// WRONG — will silently break
const selected = new Set<number>();
const newId = Math.max(...assets.map(a => a.id));   // NaN
```

### 2. AssetStatus is uppercase enum, not Title Case

`AVAILABLE`, `DEPLOYED`, `IN_REPAIR`, etc. Use `ASSET_STATUS_LABELS` from [`types/asset.ts:18`](../frontend/src/types/asset.ts#L18) for display. Don't hand-write Title Case strings — type checking will let them through but every comparison fails at runtime.

### 3. FK display always uses `*_detail`

Serializers attach a nested `*_detail` read-only object for every FK that has a human-readable label:

| Field | Detail object |
|---|---|
| `asset.assigned_to` | `assigned_to_detail` (`first_name`, `last_name`, `email`) |
| `asset.archived_by` | `archived_by_detail` |
| `transaction.performed_by` | `performed_by_detail` |
| `transaction.to_user` / `from_user` | `to_user_detail` / `from_user_detail` |
| `transaction.asset` | `asset_detail` (id + asset_tag + category) |
| `transaction.accessory` | `accessory_detail` (id + item_name) |
| `user.supervisor` | `supervisor_detail` |

The plain FK column holds the UUID. Bind UI to the detail object; never look up a name by re-fetching the user.

### 4. Currency is ₱

Two-decimal places. The reference formatter is [`AssetDetailModal.tsx:104-107`](../frontend/src/components/AssetDetailModal.tsx#L104-L107).

### 5. `previous_status` is only set on abnormal transitions

The backend tracks "abnormal" statuses as `IN_REPAIR`, `IN_MAINTENANCE`, `TO_AUDIT`, `LOST` ([`views.py:22-24`](../backend/api/views.py#L22-L24)). The rule:

- `normal → abnormal`: save the normal status into `previous_status`
- `abnormal → abnormal`: leave `previous_status` alone (don't lose the original normal state)
- `normal → normal`: don't touch it

This is what makes "Mark Repaired" able to restore the asset to its prior `AVAILABLE` or `DEPLOYED` state. Don't overwrite `previous_status` from the frontend.

### 6. `select_for_update` on every status mutation

Asset check-out/check-in/change-status and accessory check-out/check-in all wrap their row read in `select_for_update()` inside an `@transaction.atomic` block. This serialises concurrent admins acting on the same item. Preserve this when you add similar actions.

### 7. Soft delete is the default; hard delete is rare

`DELETE /api/<resource>/<id>/` archives. To actually remove a row, the resource must already be archived, then call `/<id>/hard_delete/`. See the cookbook recipe in [07-cookbook.md](07-cookbook.md) if you need to expose a destructive action in the UI.
