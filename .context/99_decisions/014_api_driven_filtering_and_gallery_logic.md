# ADR 014: API-Driven Filtering and Gallery Logic

## Status
Accepted

## Context
The Elemnt Rentals platform requires sophisticated filtering (e.g., "Featured Stays") and high-end media display (Image Gallery/Carousel). 

We needed to decide whether to handle filtering and sorting logic on the client-side (frontend) or the server-side (backend).

## Decision
We decided to implement **Server-Side Filtering** for business logic (like "Featured" status) and **Order-Based Media Handling** for galleries.

1. **Filtering**: The `GET /properties/public` endpoint was extended with a `featured` boolean query parameter. The frontend "Featured Only" toggle directly triggers an API call with this filter.
2. **Gallery Logic**: 
   - The API returns an array of images for each property.
   - Each image has an `order` integer field.
   - The frontend is responsible for rendering the gallery but relies on the backend-provided `order` for sorting and the `main_image_url` computed field (see ADR 012) for the default view.
3. **Routing Priority**: We fixed a routing conflict where `/properties/public` was being shadowed by `/{property_id}` by ensuring explicit routes are defined before generic UUID routes in FastAPI.

## Alternatives Considered
- **Client-Side Filtering**: Fetching all public properties and filtering in React. **Rejected** because it doesn't scale well and prevents the backend from optimizing queries (e.g., adding pagination later).
- **Hardcoded Image Ordering**: Sorting images by their creation date or filename alphabetical order. **Rejected** because it doesn't allow administrators to customize which image appears first in the gallery.

## Consequences
### Positive
- **Performance**: Reduced payload sizes for filtered views.
- **Flexibility**: Administrators can control the gallery experience by updating the `order` and `is_main` flags in the database without changing frontend code.
- **Consistency**: The business definition of a "Featured" property remains consistent across Web, Mobile, and future API consumers.

### Negative
- **Network Latency**: Toggling a filter requires a network request.
- **State Management**: The frontend must handle loading states during filter transitions.

## References
- `backend/app/properties/router.py` (Filtering logic)
- `frontend/src/api/client.ts`
- `frontend/src/components/features/PropertyListing.tsx`
- `session_007/qa_handoff.md`
