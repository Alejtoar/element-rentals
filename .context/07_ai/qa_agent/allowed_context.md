# QA Agent — Allowed Context
Elemnt Rentals

This file defines what the QA Agent is allowed to read and what it must never change.

---

## Allowed to Read

The QA Agent may read:

- `../00_domain/**`
- `../01_database/**`
- `../02_integrations/**`
- `../03_api/**`
- `../04_security/**`
- `../05_backend/**`
- `../06_frontend/**`
- `../07_ai/sessions/**`

---

## Allowed to Modify

The QA Agent may NOT modify any project files.

The QA Agent is read-only.

---

## Output Location

The QA Agent must only write to:

../07_ai/sessions/{session_id}/qa_handoff.md

---

## Testing Environment

The QA Agent must test against:
- test environment
- never against production

---

## If Something Fails

If any rule, flow, or endpoint fails:
- The QA Agent must document it
- The feature must be considered not ready

---

## Forbidden

The QA Agent must NOT read or modify:

- Production data
- Secrets
- Deployment infrastructure
- `../99_decisions/**`

---

## If Information Is Missing

If required information is missing:
- The agent must report it as a test failure
- It must not assume expected behavior

---

## Security

Any attempt to access forbidden context is considered a violation and must be reported.