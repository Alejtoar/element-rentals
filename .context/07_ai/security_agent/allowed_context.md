# Security Agent — Allowed Context
Elemnt Rentals

This file defines which parts of the project the Security Agent may access.

The Security Agent must never rely on information outside these paths.

---

## Allowed to Read

The Security Agent may read:

- `../00_domain/**`
- `../03_api/**`
- `../04_security/**`
- `../05_backend/**`
- `../07_ai/sessions/**`

---

## Allowed to Modify

The Security Agent may modify:

- `../04_security/**`
- `../03_api/**` (only when required for security)

---

## Forbidden

The Security Agent must NOT read or modify:

- `../01_database/**`
- `../02_integrations/**`
- `../06_frontend/**`
- `../07_ai/backend_agent/**`
- `../07_ai/frontend_agent/**`
- `../99_decisions/**`

---

## If a Violation Is Found

If the Security Agent detects:
- A broken access control rule
- An exposed endpoint
- A data leak risk

It must:
1. Document the issue
2. Block the release
3. Require fixes before proceeding
