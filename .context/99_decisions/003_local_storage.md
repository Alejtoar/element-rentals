# ADR 003: Local Filesystem Storage for MVP

## Status
Accepted

## Context
The application requires the ability to upload and view Property Images.
Standard production architectures typically use Object Storage (S3, GCS, Azure Blob) and CDN delivery.
However, the MVP Phase 1 (`mvp_phase_1.md`) prioritizes a standalone environment ease of setup.

We evaluated:
1.  **Cloud Storage (S3)**: Robust, stateless, but requires credentials and internet access during dev.
2.  **Database Storage (BLOB)**: Single source of truth, but bloats DB and complicates backups.
3.  **Local Filesystem + Static Mounting**: Simple, zero-dependency, but stateful.

## Decision
We decided to implement the **`LocalStorageProvider`** pattern and serve images via **FastAPI `StaticFiles`**.

- Images are saved to `backend/uploads`.
- **Security Standard**: Every uploaded file is renamed to a random `uuid4()` string, discarding the original filename entirely (except for the extension). This prevents Path Traversal attacks and filename collisions.
- The directory is mounted at `/static` in `main.py`.
- The `StorageProvider` abstraction allows swapping to S3 in Phase 2 without changing controller logic.

## Consequences
### Positive
- **Security**: The UUID strategy completely eliminates Path Traversal risks via the `filename` parameter.
- **Simplicity**: Developers can run the full stack with just Python and Postgres; no AWS credentials needed.
- **Speed**: image retrieval is instant over loopback/local network.

### Negative
- **Metadata Loss**: The original user-provided filename is lost unless stored in a separate database field.
- **XSS Risk**: As noted by Security, serving user content from the same domain poses XSS risks if files are not strictly sanitized.
- **Deployment Constraints**: This architecture does not support ephemeral containers (e.g., Heroku, Serverless, AWS Lambda).

## References
- `backend/app/media/storage.py`
- `backend/app/properties/service.py` (Implementation of UUID renaming)
- `session_007/security_handoff.md`
