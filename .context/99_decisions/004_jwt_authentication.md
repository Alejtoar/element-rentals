# ADR 004: JWT-based Authentication Implementation

## Status
Accepted

## Context
The application requires a secure authentication mechanism for the Admin Dashboard and restricted API endpoints. We needed to choose a method that supports statelessness and ease of integration with the planned Frontend (Next.js/React).

We evaluated:
1.  **Session-based Authentication**: traditional, server-side storage, requires cookie management.
2.  **JWT-based Authentication (OAuth2)**: stateless, widely supported, easy to scale and implement with FastAPI `OAuth2PasswordBearer`.

## Decision
We decided to implement **JWT-based authentication** using `python-jose` for token operations and `passlib[bcrypt]` for password hashing.

-   The flow follows the **OAuth2 Password Grant** standard.
-   Access tokens have a configured expiration time (default: 30 minutes).
-   Authentication is enforced via FastAPI Dependencies (`get_current_user`).

## Consequences
### Positive
-   **Stateless**: The backend does not need to store session state, facilitating future scaling.
-   **Security**: Passwords are never stored in plain text; JWTs are signed with a server-side secret.
-   **Interoperability**: Standardized flow that works well with modern frontend frameworks.

### Negative
-   **Token Invalidation**: Without a blacklist/revocation mechanism (deferred to Phase 2), compromised tokens remain valid until expiration.
-   **Complexity**: Requires careful management of the `SECRET_KEY` and token expiration logic.

## References
- `backend/app/auth/security.py`
- `backend/app/auth/dependencies.py`
- `session_003/security_handoff.md`
