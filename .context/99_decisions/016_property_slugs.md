# ADR 016: Human-Readable Slugs for SEO

## Status
Accepted

## Context
Currently, properties are identified by UUIDs in URLs (e.g., `/properties/550e8400-e29b-41d4-a716-446655440000`). This is secure and conflict-free but suboptimal for:
1.  **SEO**: Search engines prefer descriptive keywords in URLs.
2.  **User Experience**: Long UUIDs are difficult to type, read, or recognize in browser history.
3.  **Marketing**: Sharing a link like `/properties/luxury-villa-akumal` feels more "premium" than a UUID.

## Decision
We decided to implement **Human-Readable Slugs** as the primary public identifier for properties:

-   A new `slug: str` field will be added to the `Property` model.
-   Slugs will be auto-generated from the property name upon creation (e.g., "Luxury Villa Tulum" → `luxury-villa-tulum`).
-   The API will support fetching a property profile by its slug.
-   Internal admin operations will continue to use UUIDs for technical stability.

## Alternatives Considered
-   **Direct UUIDs (Status Quo)**: Rejected due to SEO and UX limitations mentioned above.
-   **Sequential IDs (IDs 1, 2, 3)**: Rejected because they leak business data (number of properties) and don't help with SEO.

## Consequences
### Positive
-  **SEO Improvement**: Better indexing and search relevancy.
-  **Brand Perception**: URL consistency with high-end hospitality brands.
-  **Shareability**: Links are more enticing when sent via social media or WhatsApp.

### Negative
-  **Collision Risk**: Two properties with the same name would generate the same slug. We must implement a "Suffix Logic" (e.g., `luxury-villa-2`) to handle duplicates.
-  **Redirect Complexity**: If a property name changes, we must decide whether to update the slug (breaking old links) or keep it (inconsistent with name). Decision: Slugs are immutable after creation unless manually edited.

## References
- `backend/app/properties/models.py`
- `frontend/src/app/[lang]/property/[slug]/`
- `session_009/backend_handoff.md`
