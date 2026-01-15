# ADR 007: Backend-Driven WhatsApp Link Generation

## Status
Accepted

## Context
The "Inquire via WhatsApp" feature requires generating specific URLs (`wa.me/phone/?text=...`) for different contexts: general inquiries, specific property inquiries, and owner onboarding. Managing these links in the frontend would require duplicating message templates and language logic.

## Decision
We decided to centralize WhatsApp link generation in the backend utility layer and expose it via API endpoints.

- **Unified Utility**: `app/utils/whatsapp.py` handles message templating and URL encoding.
- **Context-Specific Endpoints**:
    - `GET /properties/{id}/whatsapp-link`
    - `GET /owners/whatsapp-link`
- **Parameter Support**: The utility supports `lang` (i18n) and `source` parameters to append tracking metadata to the pre-filled message.

## Alternatives Considered
- **Frontend Generation**: Frontend constructs the URL using local translation files. **Rejected** to maintain single source of truth for communication templates across all channels (Email, WhatsApp, Push).
- **Hardcoded Links**: Using static links in the UI. **Rejected** because it prevents property-specific pre-filled messages and marketing tracking.

## Consequences
### Positive
- **Consistency**: The same message templates are used regardless of the client (Web, Mobile).
- **Dynamic Tracking**: Allows appending backend-known metadata (e.g., property internal CODE) to the message.
- **Maintainability**: Updating the WhatsApp phone number or message templates only requires a single backend change.

### Negative
- **API Latency**: Requires a network request before the user can be redirected to WhatsApp.
- **Dependency**: The "WhatsApp" button functionality depends on backend availability.

## References
- `backend/app/utils/whatsapp.py`
- `backend/app/properties/router.py` (whatsapp-link endpoint)
- `session_004/backend_handoff.md`
