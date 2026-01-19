# ADR 012: Backend-Driven Frontend Simplification (Computed Fields)

## Status
Accepted

## Context
The frontend often needs derived data from entity models for display purposes (e.g., the primary image URL from a list of images, formatted names, or translated status labels). 

Calculated logic in the frontend can lead to:
1. **Inconsistency**: Different components might implement the "main image" selection logic differently.
2. **Complexity**: Increased boilerplate in React components.
3. **Payload Bloat**: If the frontend has to filter large lists to find one item.

## Decision
We decided to use **Backend Computed Fields** (via SQLModel `@computed_field` or Pydantic `field_validator`) to provide frontend-ready properties directly in the API response.

Specifically in Session 007:
- **`main_image_url`**: Automatically resolves the first image path from the `images` list (where `is_main=True` or the lowest `order`).
- **`images` array**: Returned in the property detail to allow frontend gallery implementation.
- **Backend Sorting**: The backend (or API contract) ensures that images are returned or should be handled according to an `order` integer, reducing frontend sorting logic.

## Alternatives Considered
- **Frontend Utility Functions**: Creating a shared `utils/images.ts` in the frontend. **Rejected** because it doesn't solve the payload bloat if we only need the thumbnail, and it's less centralized than the API schema.
- **Client-Side Image Selection**: Fetching all images and having the React component decide which one is "main". **Rejected** because it forces every consumer (Search, Detail, Recommendations) to reimplement the logic.

## Consequences
### Positive
- **Cleaner Frontend**: Components can directly bind to `property.main_image_url`.
- **Consistency**: The definition of "Main Image" is centralized in the backend.
- **Gallery Ready**: The `images` array comes pre-sorted or with clear instructions (`order`) for display.

### Negative
- **Backend Coupling**: Changes to display logic require a backend deployment.
- **Serialization Overhead**: Marginal increase in CPU time for the backend.

## References
- `backend/app/properties/schemas.py`
- `session_007/backend_handoff.md`
- `session_007/frontend_handoff.md`
