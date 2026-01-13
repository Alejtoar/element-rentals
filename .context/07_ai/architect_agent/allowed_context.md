# Architect Agent — Allowed Context
Elemnt Rentals

This file defines which parts of the project the Architect Agent is allowed to read and modify.

The Architect Agent is the only agent allowed to write permanent architectural knowledge.

---

## Allowed to Read

The Architect Agent may read:

- `../00_domain/**`
- `../01_database/**`
- `../02_integrations/**`
- `../03_api/**`
- `../04_security/**`
- `../05_backend/**`
- `../06_frontend/**`
- `../07_ai/sessions/**`
- `../99_decisions/**`

---

## Allowed to Modify

The Architect Agent may modify:

- `../99_decisions/**`

---

## Forbidden

The Architect Agent must NOT modify:

- `../00_domain/**`
- `../01_database/**`
- `../02_integrations/**`
- `../03_api/**`
- `../04_security/**`
- `../05_backend/**`
- `../06_frontend/**`
- `../07_ai/**` (except reading sessions)

---

## If Information Is Missing

If required information is missing:
- The Architect Agent must request clarification
- It must not infer or invent decisions

---

## Security

Any attempt to modify non-decision context is a violation and must be reported.
