# 06 · Backend conventions

Django + DRF. One app, `api`. One Django project, `core` — and `core` only holds project config.

## The one rule

All domain code lives in [`backend/api/`](../backend/api/). `core/` is for `settings.py`, `urls.py`, `wsgi.py`, `pagination.py` — Django plumbing. If you find yourself adding a model, serializer, view, or business helper to `core`, stop.

## The standard flow

Adding any new piece of data follows the same five-step rhythm:

```
models.py  →  serializers.py  →  views.py  →  urls.py  →  migration
```

| Step | What you add |
|---|---|
| 1. Model | Field on existing entity, or new entity inheriting `TimeStampedModel` + `ArchivableMixin` |
| 2. Serializer | Add the field to `fields`; if it's an FK, add a `*_detail` nested read |
| 3. ViewSet | Usually nothing — `ModelViewSet` covers CRUD. Extra behaviour goes in `@action` methods. |
| 4. URLs | Already wired through the DRF router for ViewSets; only auth-style routes go in `urls.py` directly |
| 5. Migration | `python manage.py makemigrations` — never edit by hand |

[07-cookbook.md](07-cookbook.md) walks each of these for the common cases.

## Serializers and the `*_detail` pattern

Every FK gets a paired `*_detail` read-only nested object built from `UserMinimalSerializer` (or similar). The pattern, from [`serializers.py:52-74`](../backend/api/serializers.py#L52-L74):

```python
class AssetSerializer(serializers.ModelSerializer):
    assigned_to_detail = UserMinimalSerializer(source='assigned_to', read_only=True)
    archived_by_detail = UserMinimalSerializer(source='archived_by', read_only=True)

    class Meta:
        model = Asset
        fields = (
            …,
            'assigned_to', 'assigned_to_detail',
            'archived_by', 'archived_by_detail',
            …,
        )
        read_only_fields = (
            'id', 'created_at', 'updated_at',
            'is_archived', 'archive_reason', 'archived_at', 'archived_by', 'archived_by_detail',
        )
```

Why we do this:

- The plain FK (`assigned_to`) is what the client sends back to update the relation — a UUID string.
- The `_detail` object is what the UI displays — a stable nested shape with first/last name and email.
- The frontend never has to issue a follow-up request to render a name.

Always pair them. If you add a new FK, add the matching `*_detail`.

## ViewSets

`ModelViewSet` does CRUD. Don't write list/retrieve/create/update/destroy by hand unless you need custom behaviour — and if you do, override the specific method, don't recreate the whole class.

Standard shape (from [`views.py:174-201`](../backend/api/views.py#L174-L201)):

```python
class AssetViewSet(viewsets.ModelViewSet):
    serializer_class = AssetSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'status', 'group', 'assigned_to']
    search_fields  = ['asset_tag', 'serial_number', 'manufacturer', 'supplier']
    ordering_fields = ['asset_tag', 'category', 'status', 'purchase_date', 'created_at']
    ordering = ['asset_tag']

    def get_queryset(self):
        # always return select_related for the FKs the serializer reads
        qs = Asset.objects.select_related('assigned_to', 'archived_by')
        # archive filter logic — see § Archive query params
        …
```

Things to remember:

- **Always `select_related`** the FKs the serializer's `*_detail` fields touch. Otherwise every list response fires N+1 queries.
- **Always require auth** unless the endpoint is genuinely public (the four routes in `auth.py` are the only `AllowAny` views in the app).
- **Never `.values()` or return raw QuerySets** in custom logic — wrap in `XSerializer(obj).data`.
- **Don't use `pk` integer assumptions** anywhere — IDs are UUIDs.

## Custom actions: annotated `check_out`

The `@action` decorator turns a method into an extra route on the viewset. The check-out action ([`views.py:287-317`](../backend/api/views.py#L287-L317)) is the canonical reference. Annotated:

```python
@action(detail=True, methods=['post'])         # POST /api/assets/<id>/check_out/
@transaction.atomic                             # all-or-nothing: status, assigned_to, log
def check_out(self, request, pk=None):
    user_id = request.data.get('user_id')      # validate inputs
    notes   = request.data.get('notes', '')
    if not user_id:
        return Response({'detail': 'user_id is required.'}, status=400)
    try:
        to_user = User.objects.get(pk=user_id)
    except User.DoesNotExist:
        return Response({'detail': 'User not found.'}, status=404)

    # Lock the row so two admins can't double-check-out the same asset.
    asset = self.get_queryset().select_for_update().get(pk=pk)
    from_user = asset.assigned_to

    asset.assigned_to = to_user
    if asset.status not in _ABNORMAL_STATUSES:  # preserve abnormal-state restore point
        asset.previous_status = asset.status
    asset.status = Asset.Status.DEPLOYED
    asset.save()

    TransactionLog.objects.create(              # write the audit row last
        performed_by=request.user,
        transaction_type=TransactionLog.TransactionType.CHECK_OUT,
        asset=asset,
        to_user=to_user,
        from_user=from_user,
        event_description=f'Asset {asset.asset_tag} checked out to {to_user.first_name} {to_user.last_name}',
        notes=notes,
    )
    return Response(AssetSerializer(asset).data)
```

The pattern is:

1. Decorate with `@action(detail=…, methods=[…])` — DRF wires the URL automatically through the router.
2. Wrap the body in `@transaction.atomic`.
3. Validate inputs and `return Response(…, status=4xx)` on failure.
4. Lock the row with `select_for_update()` if you're mutating shared state.
5. Mutate the model.
6. Write a `TransactionLog` row that captures the human-readable description in `event_description` (the UI displays this directly without joining other tables).
7. Return the serialised model.

When you add a new mutating action, copy this skeleton.

## Filter param conventions

Standard query params handled across viewsets:

| Param | Where | Effect |
|---|---|---|
| `?search=` | All `filters.SearchFilter` viewsets | Substring match across `search_fields` |
| `?ordering=` | All `OrderingFilter` viewsets | Field name; `-` prefix for descending |
| `?<field>=` | Listed in `filterset_fields` | Exact match (e.g. `?status=DEPLOYED`) |
| `?include_archived=1` | Asset, Accessory, User | Include archived rows in the list |
| `?archived_only=1` | Same | Only archived rows |
| `?archive_reason=DELETED` or `RETIRED` | Same | Filter by archive reason |
| `?older_than_days=N`, `?within_last_days=N` | Transactions | Time window relative to now |

The hidden-by-default behaviour is intentional: every list view filters out archived rows unless explicitly asked. Don't change that default — the Archive page is the one place that opts in.

## Archive vs hard delete

`DELETE /api/<resource>/<id>/` is a soft delete: `is_archived = true`, `archive_reason = 'DELETED'`, `archived_at = now()`, `archived_by = request.user`. The row stays.

`POST /api/<resource>/<id>/retire/` is also a soft delete with `archive_reason = 'RETIRED'` — used for end-of-life kit and departing employees.

`POST /api/<resource>/<id>/restore/` un-archives. Only available against rows where `is_archived = true` (see `get_queryset` overrides).

`DELETE /api/<resource>/<id>/hard_delete/` actually removes the row from the database. Only allowed when the row is already archived. The frontend wraps this in a "Hard delete confirm" modal — see [`HardDeleteConfirmModal.tsx`](../frontend/src/components/HardDeleteConfirmModal.tsx).

Helper functions live at [`views.py:48-63`](../backend/api/views.py#L48-L63):

```python
_do_archive(obj, performed_by, reason, notes='')
_do_restore(obj)
```

Use these instead of poking the archive fields directly.

## Auth views

The four endpoints in [`auth.py`](../backend/api/auth.py) sit outside the DRF router and are the only `AllowAny` routes:

| Endpoint | Behaviour |
|---|---|
| `POST /api/auth/login/` | Email + password → `{access, refresh, user}`. Email is the username field. |
| `POST /api/auth/register/` | Validates required fields, checks email uniqueness, runs Django password validators, creates the user with role `STAFF`. |
| `POST /api/auth/google/` | Verifies Google ID token (requires `GOOGLE_OAUTH_CLIENT_ID`); creates the user on first login. |
| `POST /api/auth/refresh/` | `simplejwt`'s built-in refresh view; rotates both tokens (`ROTATE_REFRESH_TOKENS = True`). |
| `GET /api/auth/me/` | Returns the current user via `UserSerializer`. |

The shared `_token_response()` helper at [`auth.py:16-29`](../backend/api/auth.py#L16-L29) is the only place where the login payload shape is defined. If you need to add a field to it, change it once there.

## Migrations

- `python manage.py makemigrations` after every model change. Always.
- Review the generated file. **Don't edit it.** If something looks wrong, fix the model and re-run.
- Commit migrations with the model change in the same PR. Never separately.
- Don't squash migrations.
- `0002_seed_demo.py` is a historical no-op (the seeder it ran has been deleted). Don't reuse the name; don't drop the file — later migrations depend on its node.

## Things to avoid

| Anti-pattern | Why |
|---|---|
| Returning `.values()` or raw QuerySets from a view | Bypasses the serializer; loses `*_detail` enrichment and validation |
| Forgetting `select_related` on FKs the serializer reads | N+1 queries, latency cliff at scale |
| Adding business logic to a serializer's `validate_*` instead of the viewset | Serializers should validate shape, not enforce policy |
| Hand-editing migrations | Loses the `makemigrations` invariant; future generators break |
| Putting anything in `core/` | Domain code belongs in `api/` |
| Returning `200` from a write that didn't actually write | Wrap mutations in `@transaction.atomic` and surface failures as 4xx |
