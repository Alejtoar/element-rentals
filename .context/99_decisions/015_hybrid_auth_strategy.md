# ADR 015: Hybrid Authentication Storage Strategy

## Status
Accepted

## Context
With the migration to Next.js App Router and the introduction of a protected Admin Dashboard, we needed a strategy to manage JWT tokens that works across both:
1.  **Middleware (Server-side)**: To perform fast redirects for unauthenticated users before pages are rendered.
2.  **API Client (Client-side)**: To include `Authorization: Bearer <token>` headers in fetch requests to the FastAPI backend.

Next.js Middleware cannot access `localStorage`, and using exclusively Cookies complicates the client-side API client which was designed for standard Bearer token authentication.

## Decision
We decided to implement a **Hybrid Storage Strategy**:

-   **localStorage**: Remains the primary source of truth for the client-side `api.client.ts`. It stores the token under `elemnt_admin_token`.
-   **Cookies**: When a token is set or cleared in the frontend, a corresponding cookie `elemnt_admin_token` is also updated. 
    -   `path=/`
    -   `max-age=86400` (24 hours)
    -   `SameSite=Lax`

The Middleware now checks this cookie to determine if a user is authorized to access `/admin/*` routes.

## Consequences
### Positive
-   **Seamless Server-side Protection**: Middleware can instantly redirect unauthenticated requests, preventing "flicker" of protected content.
-   **Simplified API Client**: The frontend doesn't need to manage cookie-based fetch configurations (`credentials: 'include'`), keeping the API client lightweight.
-   **I18n Compatibility**: Works well with our locale-prefixed routing.

### Negative
-   **Redundancy**: The token is stored in two places in the browser.
-   **Manual Sync Required**: The frontend must ensure that clearing `localStorage` also clears the `Cookie` (implemented in `clearAuthToken`).

## References
- `frontend/src/api/client.ts`
- `frontend/src/middleware.ts`
- `frontend/public/robots.txt`
- `session_008/frontend_handoff.md`
- `session_008/security_handoff.md`
- `session_010/ARCHIVED.txt` (Admin footer link, robots.txt mitigation)
