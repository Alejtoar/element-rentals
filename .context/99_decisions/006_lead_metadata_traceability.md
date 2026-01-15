# ADR 006: Lead Management and Metadata Traceability Strategy

## Status
Accepted

## Context
As part of the marketing and growth strategy for Elemnt Rentals, it is critical to capture leads (Guest inquiries and Owner listings) and track their origin. Standard contact forms often lack context about the user's environment, making it difficult to attribute leads to specific marketing efforts or identify potential fraud/spam.

## Decision
We decided to implement a centralized Lead Management system within the backend that automatically captures request metadata.

- **Automated Metadata Capture**: The backend extracts `ip_address`, `user_agent`, and `referer` directly from HTTP headers for every lead submission.
- **Service Layer Ownership**: Serialization and storage of this metadata is handled in the `LeadService` to ensure consistency across different lead types (Owner/Guest).
- **Public/Private Split**: Lead creation endpoints are public, while retrieval is restricted to administrative accounts.

## Alternatives Considered
- **Frontend Metadata Extraction**: The frontend could send this data in the request body. **Rejected** because it is less reliable and more easily spoofed.
- **Third-Party CRM Tracking**: Using an external service (e.g., Hubspot) for tracking. **Deferred** to minimize external dependencies and maintain data ownership in Phase 1.

## Consequences
### Positive
- **Marketing Attribution**: Provides clear data on where leads came from (Referer).
- **Security & Fraud Prevention**: IP tracking allows for rate limiting and identifying malicious patterns.
- **Data Completeness**: No effort required from the frontend to provide basic traceability.

### Negative
- **Privacy Compliance**: Requires clear disclosure in the Privacy Policy regarding the collection of IP addresses and browser data.
- **DB Growth**: Storing metadata for every inquiry increases database size over time.

## References
- `backend/app/leads/router.py`
- `backend/app/leads/service.py`
- `session_004/backend_handoff.md`
