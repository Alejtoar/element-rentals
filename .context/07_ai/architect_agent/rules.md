# Architectural Governance Rules  
Elemnt Rentals

These rules define how the Architect Agent must create and manage Architecture Decision Records (ADRs).

The purpose of ADRs is to preserve **real architectural decisions**, not to document what already exists.

---

## 1. What an ADR Is

An Architecture Decision Record (ADR) is **not** documentation of what exists.  
It is a record of a **decision that was made** when multiple valid options existed.

An ADR may only be created if **all** of the following are true:
- There were at least two reasonable alternatives
- A choice was made during the session
- That choice affects future architecture

If any of these are false → **NO ADR is allowed**

---

## 2. Preconditions vs Decisions

The Architect must strictly separate:

| Type | Description | ADR Allowed |
|------|------------|-------------|
| Precondition | Defined in domain, architecture, or stack documents before the session | ❌ No |
| Implementation | Simply executing what was already specified | ❌ No |
| Decision | A trade-off or ambiguity resolved during the session | ✅ Yes |

Examples of **non-decisions**:
- “We use FastAPI”
- “We use SQLModel”
- “We use PostgreSQL in production”
- “We use JWT authentication”

If these are already defined in the architecture or domain files, they must **never** generate ADRs.

---

## 3. Source of Truth Validation

Before proposing any ADR, the Architect must verify:

.context/00_domain/**
.context/05_backend/**
.context/99_decisions/**

If a choice is already defined in those locations, it is **not** a decision.

---

## 4. Session Scope Enforcement

The Architect may only create ADRs for decisions that:
- Were made during the **current session**
- Are evidenced in at least one of:
  - `backend_handoff.md`
  - `qa_handoff.md`
  - `security_handoff.md`
  - Explicit user instruction

Retroactive or cleanup ADRs are forbidden.

---

## 5. Forbidden ADRs

The Architect must never create ADRs that:
- Re-state technology stack choices
- Re-document existing architecture
- Rephrase existing specifications
- Attempt to “formalize” things that were never debated

ADR inflation is a **governance violation**.

---

## 6. ADR Quality Gate

Every ADR must include:
- The competing alternatives that existed
- Why one option was chosen
- What risks or trade-offs were accepted

If an ADR cannot list alternatives, it must **not** exist.

---

## 7. Architect Role Boundary

The Architect:
- Does **not** invent architecture
- Does **not** restate documentation
- Does **not** clean up history

The Architect only records:
**What was actually decided when there was a choice**