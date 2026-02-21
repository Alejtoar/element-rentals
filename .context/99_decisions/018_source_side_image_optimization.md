# ADR 018: Source-Side Image Optimization

## Status
Accepted

## Date
2026-02-21

## Context
In early iterations, the platform used the default Next.js `Image` component which optimizes images on-the-fly at the edge/server requesting them. However, this introduced several issues:
1.  **Performance overhead**: In a standalone Docker environment with limited resources, Next.js image optimization (using `sharp`) consumed significant CPU, especially when many high-res images were requested simultaneously.
2.  **Storage inefficiency**: Serving 5MB+ original images from the backend inhibited fast page loads before Next.js could process them.
3.  **Deployment complexity**: Required the `unoptimized: true` flag in `next.config.js` to avoid performance bottlenecks in low-spec environments, which resulted in serving oversized images to mobile clients.

## Decision
We decided to move image optimization from the Frontend (Request-time) to the Backend (Upload-time).

1.  **Backend ImageOptimizer**:
    - Every image uploaded is processed immediately by a dedicated `ImageOptimizer` service using the `Pillow` library.
    - Full-size images are capped at 1920x1080.
    - Compression is applied (progressive JPEG, quality 85).
    - A dedicated thumbnail (400x300) is generated at upload time and stored in a `/thumbs` subdirectory.
2.  **Frontend Integration**:
    - The `unoptimized` flag is removed from `next.config.mjs`, allowing Next.js to do final lightweight adjustments if needed.
    - The backend `PropertyRead` schema now provides a pre-calculated `main_image_url`.
    - Future UI components can specifically request the `/thumbs/` path for gallery previews and listing cards, drastically reducing initial TTI (Time to Interactive).

## Consequences

### Positive
- **Reduced Server Load**: CPU-intensive optimization happens once (on upload) rather than every time an image is requested or cache expires.
- **Improved Performance**: Initial image delivery is much faster as the "source" image is already web-ready (usually < 300KB vs 5MB+).
- **Storage Savings**: Original massive files are replaced by optimized versions.

### Negative
- **Destructive Transformation**: The original high-resolution file is discarded after optimization to save space. (Acceptable for MVP; Phase 2 may introduce a "Vault" for originals if needed).
- **Processing Latency on Upload**: The upload API response takes slightly longer as it waits for optimization (addressed via `Pillow`'s efficiency).

## References
- `backend/app/media/image_optimizer.py`
- `backend/app/media/storage.py`
- `frontend/next.config.mjs`
- `architectural_validation_session_020.md`
