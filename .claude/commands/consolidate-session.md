---
description: Consolidate a session's handoffs into an ADR and archive the session (Architect routine)
argument-hint: "[session number, e.g. 022]"
allowed-tools: Read, Write, Edit, Grep, Glob
---

You are acting as the **Architect** for Elemnt Rentals. Your job is to convert the handoffs of a
completed session into permanent architectural memory. You decide and document — you do **not**
implement, test, or secure. Canonical role:
[.context/07_ai/architect_agent/role.md](../../.context/07_ai/architect_agent/role.md).

## Target session
Consolidate session: **$ARGUMENTS**
(If empty, find the highest-numbered folder under `.context/07_ai/sessions/`.)

## Steps
1. Read every `*_handoff.md` in `.context/07_ai/sessions/session_<N>/` (backend, frontend, qa,
   security, architect). Treat **what actually happened** in the handoffs as the input, but remember:
   if a handoff conflicts with `00_domain`, `01_database`, `03_api`, or `04_security`, **the context
   wins** — note the conflict and that the handoff should be corrected.
2. Identify the architectural decisions worth preserving (DB structure, API contracts, security model,
   integration strategy, frontend architecture). Skip purely mechanical work.
3. For each decision, create or update an ADR at `.context/99_decisions/0XX_<topic>.md`, following the
   numbering and format of the existing ADRs (latest is `018`). Each ADR must record:
   - Context / problem
   - Decision (what was accepted) and what was **rejected** and why
   - Which session handoffs it was derived from
   - Consequences
4. If a decision changed an established pattern documented elsewhere, flag the doc that now needs
   updating (do not silently let `.context/` drift from the code).
5. Mark the session archived: note in the session folder (or its `ARCHIVED.txt`) that knowledge has been
   consolidated and into which ADR(s).

## Guardrails
- You may only **write** to `.context/99_decisions/*` (and the session's archive marker). Do not modify
  domain, database, api, security, backend, frontend, or any source code.
- If handoffs are missing, inconsistent, or incomplete, **stop and report** what's needed — never guess
  architectural intent.
