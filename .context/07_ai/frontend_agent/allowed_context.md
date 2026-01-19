# Frontend Agent — Allowed Context
Elemnt Rentals

This file defines which parts of the project the Frontend Agent is allowed to read and modify.

The agent must never use or assume information outside these paths.

---

## Allowed to Read

The Frontend Agent may read:

- `../00_domain/**`
- `../03_api/**`
- `../05_backend/01_architecture/backend_architecture.md`
- `../06_frontend/**`
- `../07_ai/sessions/**` (read-only, for handoff context)

---

## Allowed to Modify

The Frontend Agent may modify:

- `../06_frontend/**`

---

## Forbidden

The Frontend Agent must NOT read or modify:

- `../01_database/**`
- `../02_integrations/**`
- `../04_security/**`
- `../05_backend/**` (except architecture read-only)
- `../07_ai/backend_agent/**`
- `../07_ai/security_agent/**`
- `../07_ai/qa_agent/**`
- `../07_ai/architect_agent/**`
- `../99_decisions/**`

---

## If Information Is Missing

If required information is not found inside the allowed context:
- The agent must stop
- The agent must request a domain, API or UX update

It must never guess.

---

## Security

Any attempt to access forbidden context is considered a violation and must be reported.

---

## gitignore files

- if you need to look at a gitignore file, ask to permission to use some commands to see the content of the file
- if you need to modify a gitignore file, ask to permission or tell me to do it