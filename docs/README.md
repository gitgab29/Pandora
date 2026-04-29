# Pandora — intern guide

This folder is the conceptual onboarding doc for the Pandora codebase. The operational doc — current state, rules, where to add things — lives at [`../CLAUDE.md`](../CLAUDE.md). This guide explains *how to think about the system*. CLAUDE.md tells you *what is true today*. When in doubt, CLAUDE.md wins; this guide should never duplicate it.

## Index

| # | File | What it covers |
|---|---|---|
| 1 | [01-orientation.md](01-orientation.md) | What Pandora is, who uses it, vocabulary |
| 2 | [02-getting-started.md](02-getting-started.md) | Clone → running locally, env vars, Windows gotchas |
| 3 | [03-architecture.md](03-architecture.md) | Request flow, folder map, three-layer visual system, JWT lifecycle |
| 4 | [04-data-model.md](04-data-model.md) | Entity tables, invariants, link to ERD |
| 5 | [05-frontend-conventions.md](05-frontend-conventions.md) | Tokens, Context+reducer, `api.ts`, modal trio |
| 6 | [06-backend-conventions.md](06-backend-conventions.md) | model → serializer → viewset → router → migration |
| 7 | [07-cookbook.md](07-cookbook.md) | Step-by-step recipes for common tasks |
| 8 | [08-testing-qa.md](08-testing-qa.md) | Manual smoke checklist, sharp edges |
| 9 | [09-deployment.md](09-deployment.md) | Env-var matrix, migration discipline, AWS placeholder |
| 10 | [10-roadmap.md](10-roadmap.md) | Open work, doc TODOs, architectural questions |
| 11 | [11-maintaining-this-guide.md](11-maintaining-this-guide.md) | One rule for keeping this doc honest |

## How to read this

If you have one hour: read 01, 02, and 04. That's enough to navigate.

If you have a day: read all of it in order. The cookbook (07) is reference, not reading.

If something here disagrees with the code, the code wins — open a PR fixing the doc.
