# ADR 005: Automated Administrative User Seeding

## Status
Accepted (Development/MVP Scope)

## Context
To enable immediate testing of protected endpoints and administrative features, the system requires at least one active Admin user. Manually creating this user via direct database manipulation or external scripts during initial setup adds friction to the development process.

## Decision
We decided to implement **Automated Admin Seeding** during the application startup lifecycle, driven by environment variables.

-   The `on_startup` event in `main.py` checks for the existence of an admin user.
-   If no admin exists, it creates an admin user using credentials defined in `FIRST_ADMIN_EMAIL` and `FIRST_ADMIN_PASSWORD` within the `.env` file.
-   This logic is encapsulated in the `UserService` layer.
-   The configuration is managed via `Settings` in `app/config.py`.


## Consequences
### Positive
-   **Developer Experience**: The platform is "ready to use" immediately after a fresh database setup.
-   **Consistency**: Ensures that a base administrative role is always available across all development environments.

### Negative
-   **Security Risk**: The default password is hardcoded and well-known.
-   **Production Danger**: This seeding logic must be disabled or replaced with a secure CLI command before production deployment to prevent unauthorized access.
-   **Maintenance**: Adds a dependency on the startup sequence that may slow down initialization as the seeding logic grows.

## References
- `backend/app/main.py` (startup event)
- `backend/app/users/service.py` (`create_admin_if_not_exists` method)
- `session_003/backend_handoff.md`
