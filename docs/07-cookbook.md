# 07 · Cookbook

Step-by-step recipes for the common tasks. Each one assumes the dev environment is running ([02-getting-started.md](02-getting-started.md)).

## Recipe 1 — Add a new page / route

Goal: add a `/reports` page that renders a report dashboard.

1. Create [`frontend/src/pages/Reports.tsx`](../frontend/src/pages/Reports.tsx). Structure it like [`pages/Activity.tsx`](../frontend/src/pages/Activity.tsx) — `<Sidebar/>`, `<Header/>`, white main panel.
2. If the page needs reusable widgets, put them in `src/components/`. Page-specific helpers stay in the page file.
3. Add the route to `App.tsx`, wrapped in `<ProtectedRoute>`:
   ```tsx
   <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
   ```
4. Add a sidebar nav entry to `NAV_ITEMS` in [`Sidebar.tsx:26-33`](../frontend/src/components/Sidebar.tsx#L26-L33). Pick an icon from `lucide-react`.
5. If the page needs server data, add a wrapper to `api.ts` (Recipe 2) and call it from a `useEffect`.
6. Verify: navigate to `/reports`, confirm the route loads, sidebar highlight works, refresh keeps you on the page (route is registered in `App.tsx`, not just sidebar).

## Recipe 2 — Add a new API endpoint

Goal: add `GET /api/assets/<id>/depreciation_history/` returning `[{ date, value }]`.

1. **Backend** — add an `@action` method to `AssetViewSet` in [`views.py`](../backend/api/views.py):
   ```python
   @action(detail=True, methods=['get'])
   def depreciation_history(self, request, pk=None):
       asset = self.get_object()
       history = compute_depreciation(asset)   # your domain logic
       return Response(history)
   ```
2. The DRF router auto-wires the URL. No change to `urls.py` needed.
3. Confirm in browser: `http://localhost:8000/api/assets/<some-id>/depreciation_history/` (you'll be 401'd in the browser; use `curl -H "Authorization: Bearer <token>"` or test from the frontend).
4. **Frontend** — add a wrapper to the resource block in [`api.ts`](../frontend/src/api.ts):
   ```ts
   depreciationHistory: (id: string) =>
     api.get<{ date: string; value: number }[]>(`/assets/${id}/depreciation_history/`)
        .then(r => r.data),
   ```
5. Call it from a component:
   ```ts
   useEffect(() => {
     assetsApi.depreciationHistory(asset.id).then(setHistory);
   }, [asset.id]);
   ```
6. If the response shape becomes shared, hoist the type to `frontend/src/types/asset.ts`.
7. Verify: render the data, confirm a 401 round-trip refreshes correctly (kill your access token in localStorage and re-trigger).

## Recipe 3 — Add a field to an existing model

Goal: add `device_color` to `Asset`, surfaced in the Add form, the table, and the detail modal.

1. **Model** — add to [`models.py`](../backend/api/models.py):
   ```python
   device_color = models.CharField(max_length=50, blank=True)
   ```
2. **Migration**:
   ```bash
   cd backend && python manage.py makemigrations && python manage.py migrate
   ```
3. **Serializer** — add `'device_color'` to `AssetSerializer.Meta.fields` in [`serializers.py`](../backend/api/serializers.py).
4. **Frontend type** — add `device_color?: string;` to the `Asset` interface in [`frontend/src/types/asset.ts`](../frontend/src/types/asset.ts) and to `AddAssetFormData` if it should appear in the Add form.
5. **Add form** — find the form fields in [`AddAssetModal.tsx`](../frontend/src/components/AddAssetModal.tsx), copy an existing input (e.g. `manufacturer`), rename to `device_color`. Make sure the form's `onSubmit` includes the new value in the POST body.
6. **Edit form** — same change in [`EditAssetModal.tsx`](../frontend/src/components/EditAssetModal.tsx).
7. **Table column** — in [`AssetsTabContent.tsx`](../frontend/src/components/AssetsTabContent.tsx), add a `<th>` and a `<td>` rendering `asset.device_color || '—'`. Reuse `TH` / `TD` from `tableStyles.ts`.
8. **Detail modal** — in [`AssetDetailModal.tsx`](../frontend/src/components/AssetDetailModal.tsx), add `<InfoField label="Device Color" value={asset.device_color} />` to the General or Specifications section.
9. **Seed** (optional) — if `seed_demo.py` should populate it, add a value to the seeded asset definitions.
10. Verify: add a new asset with a colour value, confirm it round-trips through the table and detail modal.

## Recipe 4 — Add a new entity from scratch (Licenses worked example)

Licenses are currently a [`ComingSoonPanel`](../frontend/src/components/ComingSoonPanel.tsx). This recipe is the path from zero to a working Licenses tab. Don't actually do this without an explicit ask — schema is unscoped.

1. **Pin the schema first.** Talk to IT before you touch a file. Minimum questions: which fields are required, do licenses have seats (quantity-based) or per-user assignments (FK-based), do they expire, do they archive, do they have a renewal flow.
2. **Model** — in [`models.py`](../backend/api/models.py), add a `License` class inheriting `TimeStampedModel`, `ArchivableMixin`. UUID PK. Use `TextChoices` for any enum fields.
3. **Serializer** — add `LicenseSerializer` in [`serializers.py`](../backend/api/serializers.py). For every FK, add a `*_detail` nested read using `UserMinimalSerializer` or a new minimal serializer.
4. **ViewSet** — add `LicenseViewSet(viewsets.ModelViewSet)` in [`views.py`](../backend/api/views.py). Override `get_queryset` to include the standard `include_archived` / `archived_only` / `archive_reason` handling — copy from `AssetViewSet.get_queryset`. Override `destroy` for soft delete using `_do_archive`. Add `retire`, `restore`, `hard_delete` `@action` methods if archive workflow applies.
5. **URLs** — register the viewset in [`urls.py`](../backend/api/urls.py): `router.register(r'licenses', LicenseViewSet, basename='license')`.
6. **Migration**: `makemigrations && migrate`.
7. **Admin** — register in [`admin.py`](../backend/api/admin.py) with sensible `list_display` and `search_fields`.
8. **Frontend type** — create [`frontend/src/types/license.ts`](../frontend/src/types/license.ts) with the `License` interface mirroring the serializer, plus any enum types and label maps.
9. **API wrapper** — add a `licensesApi` block to [`api.ts`](../frontend/src/api.ts) following `assetsApi`.
10. **Tab content** — create `LicensesTabContent.tsx` modelled on [`AssetsTabContent.tsx`](../frontend/src/components/AssetsTabContent.tsx). Wire it into `Inventory.tsx` to replace the `ComingSoonPanel` for the Licenses tab.
11. **Modals** — create `AddLicenseModal`, `EditLicenseModal`, `LicenseDetailModal` from the asset versions. Detail modal should follow the trio pattern in [05-frontend-conventions.md § Modal trio](05-frontend-conventions.md#the-modal-trio-add-edit-detail).
12. Verify: round-trip CRUD, archive, restore, search, filter. Confirm logs land in the Activity page if you're emitting `TransactionLog` rows from Licenses actions.

## Recipe 5 — Add a new design token

Goal: add a "warning" badge background that doesn't currently exist.

1. Open [`frontend/src/theme.ts`](../frontend/src/theme.ts).
2. Decide which export it belongs in:
   - One-off colour reused in 2+ places → add to `colors`
   - Status-related → add to `statusColors`
   - Activity badge → add to `badgeColors`
   - Otherwise → group with semantically similar tokens
3. Add the token. For badges, follow the `{ bg, text }` pair shape:
   ```ts
   warning: { bg: 'rgba(234,179,8,0.12)', text: '#92400e' },
   ```
4. Use it: `style={{ backgroundColor: badgeColors.warning.bg, color: badgeColors.warning.text }}`.
5. Search for any `#xxxxxx` you were about to write and replace it with the token.
6. If the new colour is brand-level, raise it with the team before checking in — palette changes are a design decision, not a code decision.

## Recipe 6 — Debug 401 / 403 / CORS issues

Symptom-first.

### `401 Unauthorized`

1. Open DevTools → Application → Local Storage → `http://localhost:5173`. Confirm `access_token` and `refresh_token` are present.
2. Decode the access token at jwt.io. Check `exp` against the current time. Access tokens last 1 hour ([`settings.py:181-185`](../backend/core/settings.py#L181-L185)).
3. If expired, the axios interceptor at [`api.ts:22-43`](../frontend/src/api.ts#L22-L43) should auto-refresh. Check the Network tab for a `POST /api/auth/refresh/` — if it 401s, the refresh token is also expired (7-day lifetime). Sign in again.
4. If the access token looks valid but the request still 401s, check the `Authorization` header in the failing request — should be `Bearer eyJ…`. If it's missing, the request bypassed the interceptor (someone imported axios directly — check the importing file).
5. If the backend is rejecting a valid token, restart Django; there's no token-blocklist state so this is rare but possible during dev.

### `403 Forbidden`

The app currently has no role-based permissions beyond `IsAuthenticated`. If you see a 403, you're hitting:

- A view that explicitly added `permission_classes` — grep for the path
- Django admin (`/admin/`) — needs `is_staff = True`
- An archive endpoint where the resource isn't archived (e.g. `restore` on a non-archived row — returns 404, not 403, but the symptom is similar)

### `429 Throttled`

DRF rate limits ([`settings.py:169-176`](../backend/core/settings.py#L169-L176)): 240 req/min/user, 20/min anon. Wait it out, or comment the throttle classes locally if you're profiling something request-heavy.

### CORS errors

Browser console says "blocked by CORS policy".

1. Confirm the frontend's origin is in `CORS_ALLOWED_ORIGINS` in [`settings.py:189-194`](../backend/core/settings.py#L189-L194). Local default is `http://localhost:5173,https://pandora-testing.vercel.app`.
2. If you changed the frontend port (e.g. `npm run dev -- --port 3000`), add that origin to the env var: `export CORS_ALLOWED_ORIGINS=http://localhost:3000,…`.
3. Restart Django — settings are read at boot.
4. CORS is **request-origin** based. Check the failing request's `Origin` header against the configured list, exactly. No trailing slash, scheme matters.
5. Preflight failure (`OPTIONS` request 4xx) usually means the path isn't routed — check `urls.py`.

### `400` on register / login

`auth.py` returns plain `{detail: '…'}` strings for these. Read the response body. Common ones:

- `'Email already registered.'` — duplicate
- `'Invalid email or password.'` — wrong creds
- `['Password is too short.', …]` — Django's password validators rejected it ([`auth.py:75-80`](../backend/api/auth.py#L75-L80))
