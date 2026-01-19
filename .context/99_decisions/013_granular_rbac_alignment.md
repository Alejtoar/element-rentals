# ADR 013: Granular RBAC Role Alignment

## Status
Accepted

## Context
Initial sessions used a monolithic `admin` check for all protected endpoints. As the system grows, we need to distinguish between operational staff (managing properties/reservations) and financial staff (validating payments). 

Session 006 identified a misalignment where roles were inverted for certain entities.

## Decision
We decided to adopt a granular Role-Based Access Control (RBAC) model based on the roles defined in `.context/04_security/roles_permissions.md`.

- **Operator Admin (Staff)**: Primary role for managing properties, owners, and reservations (Full CRUD).
- **Finance**: Restricted role for validating payments and viewing financial reports (Read-only for Reservations, Update for Payments).
- **Shared Access**: Internal users (Staff + Finance) shares read-access to critical entities like Payments for cross-verification.

Implementation was corrected and verified in Session 007.

## Alternatives Considered
- **Scope-Based Access (OAuth2 Scopes)**: Granular permissions per action. **Rejected** as overkill for the current complexity; roles are easier to map to business functions in Phase 1.
- **Monolithic Admin**: **Rejected** because it violates the principle of least privilege required for financial data.

## Consequences
### Positive
- **Security**: Reduced blast radius if a staff account is compromised.
- **Compliance**: Clear separation of duties between operations and finance.

### Negative
- **Complexity**: Multiple dependencies (`get_current_staff_user`, `get_current_finance_user`, `get_current_internal_user`) must be maintained.

## References
- `.context/04_security/roles_permissions.md`
- `backend/app/auth/dependencies.py`
- `session_007/security_handoff.md`
