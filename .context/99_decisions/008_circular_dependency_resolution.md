# ADR 008: Circular Dependency Resolution Strategy

## Status
Accepted

## Context
As the domain model grew to include `Property`, `Reservation`, `Guest`, and `Owner`, tight coupling between entities led to circular import issues. For example, a `Property` has many `Reservations`, and a `Reservation` belongs to a `Property`.

## Decision
We decided to resolve circular dependencies in the domain layer using **string forward references** and **explicit relationship configuration** in SQLModel.

- **String References**: Relationships are defined using string names (e.g., `back_populates="property"`) instead of direct class imports.
- **TYPE_CHECKING Guard**: Imports required only for type hinting are kept inside `if TYPE_CHECKING:` blocks to prevent runtime circularity.
- **Model Registration**: All models are explicitly imported in `app/main.py` or a centralized `models/__init__.py` to ensure they are registered with SQLModel's metadata.

## Alternatives Considered
- **Shared Base Models**: Moving common attributes to a base class. **Rejected** as it doesn't solve the relationship mapping requirement.
- **Association Tables only**: Removing direct relationships and using only mapping tables. **Rejected** as it complicates simple queries and breaks ORM benefits.

## Consequences
### Positive
- **Module Separation**: Modules can remain distinct without runtime dependencies on each other.
- **Scalability**: New entities can be added to the relationship graph without creating new import loops.

### Negative
- **Less IDE Tooling Support**: String-based references are harder for some IDEs to track for refactoring compared to direct class references.
- **Runtime Errors**: Errors in relationship names (typos in strings) are only caught at runtime or during database initialization.

## References
- `backend/app/properties/models.py`
- `backend/app/reservations/models.py`
- `session_004/backend_handoff.md`
