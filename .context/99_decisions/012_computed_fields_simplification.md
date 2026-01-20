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
- **Frontend Autonomy**: The backend provides relative paths (`/media/...`), and the frontend resolves these using a centralized utility, allowing the base API URL to change without database migrations.

### Negative
- **Backend Coupling**: Changes to display logic require a backend deployment.
- **Serialization Overhead**: Marginal increase in CPU time for the backend.
- **Frontend Dependency**: Client-side components must use the `resolveMediaUrl` utility instead of direct string interpolation.

## Media Resolution Utility
To support this strategy, the frontend implements `src/lib/media.ts`:
```typescript
export function resolveMediaUrl(path: string | null): string {
    if (!path) return '/placeholder.png';
    if (path.startsWith('http')) return path;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:8000';
    return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
}
```

## References
- `backend/app/properties/models.py`
- `frontend/src/lib/media.ts`
- `session_007/backend_handoff.md`
- `session_008/qa_hanfoff.md`
