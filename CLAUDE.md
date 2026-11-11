# CLAUDE.md — Elemnt Rentals

Guidance for Claude Code when working in this repository. This file is intentionally short: the
authoritative knowledge lives in [`.context/`](.context/) and is **linked**, not duplicated. When a
fact here and a fact in `.context/` disagree, treat `.context/` as the source of truth and flag the
drift (see [Known doc drift](#known-doc-drift--suggested-improvements)).

> Docs in `.context/` are written in English. Keep new context docs and code comments in English for
> consistency; converse with the user in their language.

## What this is

Elemnt Rentals (ELEMNT RENTALS S.A.S.) is the **Single Source of Truth** for operating short-term
vacation rentals: properties, reservations, payments, expenses, owner settlements and financial
reporting. The company operates as both **mandate operator** (for owners) and **lessor** (contracts
with guests). Full domain framing: [domain_overview.md](.context/00_domain/domain_overview.md),
[business_rules.md](.context/00_domain/business_rules.md),
[terminology.md](.context/00_domain/terminology.md).

## Repository layout

Monorepo, two deployables:

- [`backend/`](backend/) — FastAPI + SQLModel + Alembic API. Module-per-domain layered architecture.
- [`frontend/`](frontend/) — Next.js 16 (App Router) + React 19 + Tailwind v4, TypeScript.
- [`.context/`](.context/) — the project's permanent memory: domain, DB, API, security, scope and ADRs.
- [`.claude/agents/`](.claude/agents/) — Claude Code subagents mirroring the `.context/07_ai/` roles.
- [`scripts/`](scripts/), [`Makefile`](Makefile), [`docker-compose.yml`](docker-compose.yml).

## Dev commands

Run backend and frontend from their own directories. The [`Makefile`](Makefile) assumes a POSIX shell
+ `backend/.venv`; on Windows run the underlying commands directly.

```bash
# Backend (FastAPI) — requires backend/.venv activated; ENV ∈ {dev,test,prod}
cd backend && ENV=dev uvicorn app.main:app --reload      # http://localhost:8000  (docs at /docs)
cd backend && pytest                                      # tests/ (FastAPI TestClient + SQLite)
cd backend && alembic upgrade head                        # apply migrations
cd backend && alembic revision --autogenerate -m "msg"    # new migration

# Frontend (Next.js)
cd frontend && npm run dev      # http://localhost:3000
cd frontend && npm run build && npm start
cd frontend && npm run lint

# Whole stack via Docker (Postgres + backend + frontend); needs .env (see .env.docker.example)
docker compose up --build
```

## Backend conventions (must follow)

Authoritative: [backend_architecture.md](.context/05_backend/01_architecture/backend_architecture.md).

- **Module per domain** under [`backend/app/`](backend/app/): `auth, users, owners, properties,
  reservations, finance, contracts, calendar, guests, leads, media, notifications`. Each module is
  `router.py` → `service.py` → `repository.py` → `models.py`, with `schemas.py` (Pydantic DTOs).
- **Strict dependency flow:** router → service → repository → DB. Routers must **not** touch
  repositories directly; repositories hold **no** business logic; services must **not** import FastAPI.
- **All business logic lives in services.** Never in routers, repositories, or the frontend.
- **Never return ORM models** from endpoints — always Pydantic schemas. Internal fields are filtered there.
- **Config only in** [`backend/app/config.py`](backend/app/config.py), loaded from env / `.env`. No
  hardcoded secrets or URLs.
- **Media** goes through the `StorageProvider` interface (Phase 1 = local disk, served at `/uploads`).
- **Python deps:** only inside `backend/.venv`. Declare in `requirements.txt`, regenerate
  `requirements.lock.txt`. Never install globally / into Anaconda.
- API is versioned under `settings.API_V1_STR` (`/api/v1`). Endpoint contracts:
  [endpoints.md](.context/03_api/endpoints.md). RBAC: [roles_permissions.md](.context/04_security/roles_permissions.md).
- Financial logic is **audit-critical** — follow [financial_rules.md](.context/01_database/financial_rules.md)
  exactly; never invent percentages or settlement math.

## Frontend conventions (must follow)

Authoritative: [frontend_architecture.md](.context/06_frontend/01_architecture/frontend_architecture.md),
[design_specification.md](.context/06_frontend/02_ui/design_specification.md),
[ux_rules.md](.context/06_frontend/02_ui/ux_rules.md).

- **App Router** under [`frontend/src/app/[lang]/`](frontend/src/app) — every route is language-prefixed
  (`/en`, `/es`). Public site at root; admin under `[lang]/admin/`.
- **Layered:** UI components (pure, no API/logic/i18n) → feature components → pages → API clients.
- **All HTTP through** [`frontend/src/api/client.ts`](frontend/src/api/client.ts). Never call `fetch()`
  inside a component or build URLs inline. Backend base URL comes from `NEXT_PUBLIC_API_URL` only.
- **i18n is mandatory** (en/es): no hardcoded user-facing strings — use the dictionaries in
  [`frontend/src/locales/`](frontend/src/locales). See [i18n.md](.context/06_frontend/02_ui/i18n.md).
- Use the brand palette/tokens from `design_specification.md` (Forest/Sand/Sage/Olive/Bone/Cream).

## Architecture decisions

All non-obvious choices are recorded as ADRs in [`.context/99_decisions/`](.context/99_decisions/)
(JWT auth, Next.js App Router, Tailwind v4, lightweight i18n, RBAC alignment, property slugs, external
calendar sync, image optimization, …). **Read the relevant ADR before changing an established pattern**,
and add a new ADR when you make one.

## Multi-agent workflow

This project is built with a role-based agent workflow defined in [`.context/07_ai/`](.context/07_ai/)
and mirrored as Claude Code subagents in [`.claude/agents/`](.claude/agents/) (see the
[agents README](.claude/agents/README.md)):

| Subagent | Model | Owns / may modify | Sources of truth |
|----------|-------|-------------------|------------------|
| `backend-agent`   | opus   | `backend/`, `01_database`, `02_integrations`, `03_api`, `05_backend` | domain/db/api/security |
| `frontend-agent`  | sonnet | `frontend/`, `06_frontend` | domain/api/frontend |
| `security-agent`  | opus   | `04_security`, security parts of `03_api` (+ reports) | domain/api/security |
| `qa-agent`        | sonnet | reports only (no prod code) | domain/api/security/backend/frontend |

The **architect** role is a slash command, not an agent: [`/consolidate-session`](.claude/commands/consolidate-session.md)
turns a session's handoffs into an ADR and archives it.

**Handoff convention:** substantial work is grouped into a numbered session under
`.context/07_ai/sessions/session_XXX/`. Each agent writes a `*_handoff.md` describing what changed,
which files/endpoints were touched, and what other agents must know. Latest session: **022**.

### Dispatching (how this session should orchestrate)

This main session reads CLAUDE.md, so **it acts as the orchestrator/dispatcher**. The ideal flow:

1. **Triage the request.** Trivial, cross-cutting, or read-only work (a one-line fix, answering a
   question, a rename) → just do it here. Role-shaped, multi-step work → delegate.
2. **Route to the owning agent** so its write boundaries and domain rules are enforced:
   - Backend/API/DB/migrations/financial logic → `backend-agent`
   - UI/pages/i18n/styling/API consumption → `frontend-agent`
   - "is this safe to ship?" → `security-agent` · "does it actually work?" → `qa-agent`
   Independent pieces (e.g. a backend endpoint + its frontend page) can be dispatched in parallel.
3. **Override the model per dispatch when it pays off** — e.g. run `backend-agent` on `sonnet` for
   trivial CRUD, or `qa-agent` on `opus` when verifying settlement math — via the `model` param on the
   `Task`/Agent call. Defaults (above) are the common case.
4. **Gate risky changes:** for anything touching auth, RBAC, finance, or contracts, run `security-agent`
   (and `qa-agent` for financial correctness) before considering it done.
5. **Consolidate** at the end of a substantial session: ensure each agent left its `*_handoff.md`, then
   run `/consolidate-session <N>` to record the ADR.

Agents must **stop and ask** rather than invent business rules, financial math, API contracts, or user
flows. When docs disagree: domain > database > api > architecture.

## Keeping docs in sync

The architecture docs were realigned to current reality (Phase 2): backend/frontend scope, Next.js 16
stack, and the Postgres-prod / SQLite-dev split are now documented. The **scope** docs
([backend Phase 2](.context/05_backend/02_scope/phase_2_operational_maturity.md),
frontend equivalent) already track what's built. When you change an established pattern, update the
matching `.context/` doc in the same change (or file an ADR) so the docs and code don't drift apart
again — this is what the `architect-agent` consolidates per session.
