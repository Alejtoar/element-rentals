# ADR 002: Deferred Authentication Strategy

## Status
Accepted

## Context
The MVP Phase 1 scope (`mvp_phase_1.md`) mandates "Admin user login" and role-based access control.
During the implementation of Core Entities (`Owner`, `Property`) in **Session 002**, the team faced a trade-off between strict security compliance and development velocity.

The Security Agent identified the lack of authentication as a **Critical Risk** that blocks production release.
The QA Agent noted this as a "KNOWN ACCEPTED RISK" for the session.

We needed to decide whether to:
1.  **Block the session** and implement Authentication before any other features (Strict Security).
2.  **Defer Authentication** to immediately follow Core Entities, releasing the current build as an internal prototype (Velocity).

## Decision
We decided to **defer authentication** until the immediate next session.

- The current backend implementation intentionally exposes all endpoints (`/owners`, `/properties`) publicly.
- This state is classified as **"Private Prototype"**.
- Deployment to any public-facing environment (Production/Staging) is **explicitly forbidden** until this ADR is superseded by an Auth implementation.

## Consequences
### Positive
- **Velocity**: Enabled rapid validation of the Data Model (`Owner`, `Property`) and core CRUD flows without the overhead of debugging Auth middleware.
- **Frontend Integration**: Allows the Frontend Agent to begin wiring up forms and UI components immediately against a working (albeit insecure) API.

### Negative
- **Security Debt**: The application is compliant with *functionality* requirements but fails *security* requirements.
- **Data Exposure**: Any data entered into the system is globally readable/writable if the port is exposed.
- **Rework**: Implementation of Auth later may require updating all controller tests and frontend fetch calls to include headers.

## References
- `session_002/security_handoff.md`
- `session_002/backend_handoff.md`
- `05_backend/02_scope/mvp_phase_1.md`
