# 09 · Deployment

Production deployment is **not yet wired up**. The current target is AWS — RDS for Postgres, plus static hosting for the Vite build. A `render.yaml` exists at the repo root from earlier exploration; it isn't the active path.

This page captures what we know now, so the first real deploy doesn't start from scratch.

## Env-var matrix

| Variable | Local dev | Staging | Production |
|---|---|---|---|
| `DEBUG` | `True` (default) | `False` | `False` |
| `SECRET_KEY` | dev fallback (insecure) | required, unique | required, unique, rotated on compromise |
| `ALLOWED_HOSTS` | `localhost,127.0.0.1` (default) | staging hostname | production hostname(s) |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173,https://pandora-testing.vercel.app` | staging frontend origin | prod frontend origin |
| `DATABASE_URL` | unset → SQLite at `backend/db.sqlite3` | RDS Postgres URL | RDS Postgres URL |
| `GOOGLE_OAUTH_CLIENT_ID` | unset | set if testing OAuth | required for Google sign-in |
| `VITE_API_BASE_URL` (frontend build-time) | `http://localhost:8000` | staging API origin | production API origin |

`SECRET_KEY` behaviour: with `DEBUG=False`, the app **refuses to boot** without a real value ([`settings.py:33-40`](../backend/core/settings.py#L33-L40)). This is intentional — silently running with the dev fallback in production would be worse than crashing.

`VITE_*` vars are baked into the bundle at build time. Changing the API URL means a rebuild, not a redeploy of static assets — so the build pipeline needs the right origin set per environment.

## Migration discipline

When deploying a schema change, the order is:

1. **Merge** the PR with the model + migration.
2. **Build & push** the backend artifact.
3. **Run migrations** against the target DB before swapping traffic:
   ```bash
   python manage.py migrate
   ```
4. **Swap traffic** to the new backend.
5. **Build & deploy** the frontend (it has the new TypeScript types).

If a migration is destructive (column drop, type change), do it in two deploys:

- Deploy 1: model adds the new field, code reads from old + new
- Deploy 2: code reads from new only; old field deleted in a follow-up migration

Don't run `migrate` from a developer machine against a shared DB. Run it from CI/CD against the target.

## Suggested AWS shape (placeholder)

Not implemented yet. This is the working assumption to validate when we get to it:

```
┌──────────────────┐
│  CloudFront      │   serves /assets/* (Vite build) from S3
│  + S3 bucket     │   serves /api/* via origin behaviour to ALB
└─────┬────────────┘
      │
      ▼
┌──────────────────┐
│  ALB             │   path /api/* → ECS Fargate (Django + Gunicorn)
└─────┬────────────┘
      │
      ▼
┌──────────────────┐
│  ECS Fargate     │   running gunicorn core.wsgi
│  (Django app)    │   one task min, autoscale on CPU
└─────┬────────────┘
      │
      ▼
┌──────────────────┐
│  RDS Postgres    │   single-AZ for staging, multi-AZ for prod
└──────────────────┘
```

Open questions to resolve when we deploy:

- Where does `manage.py migrate` run? (Recommended: a one-off ECS task gated to the deploy pipeline.)
- Static files: `collectstatic` to S3 with `django-storages`, or skip Django static and serve only the API?
- Where do secrets live? (Recommended: AWS SSM Parameter Store + ECS task env injection.)
- Logging: CloudWatch via the Fargate awslogs driver, or ship structured JSON to a different sink?
- HTTPS termination at ALB; HSTS via Django middleware in prod.

These are decisions the first deploy makes; document them in this file when made.

## Pre-flight checks before any production push

- [ ] Migrations are applied and a backup exists
- [ ] `SECRET_KEY` is set and unique to the environment
- [ ] `DEBUG=False` confirmed via `/admin/` returning normal admin login (not a Django error page)
- [ ] CORS list matches the frontend origin exactly
- [ ] Throttling rates ([`settings.py:173-176`](../backend/core/settings.py#L173-L176)) reviewed against expected traffic
- [ ] Access token lifetime ([`settings.py:181-185`](../backend/core/settings.py#L181-L185)) is acceptable for the user experience (currently 1 h access, 7 day refresh, rotating)
- [ ] No dev-only data in the prod DB
