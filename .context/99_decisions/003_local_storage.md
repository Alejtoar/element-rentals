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
- The directory is mounted at `/static` in `main.py`.
- The `StorageProvider` abstraction allows swapping to S3 in Phase 2 without changing controller logic.

## Consequences
### Positive
- **Simplicity**: Developers can run the full stack with just Python and Postgres; no AWS credentials needed.
- **Speed**: image retrieval is instant over loopback/local network.

### Negative
- **XSS Risk**: As noted by Security, serving user content from the same domain poses XSS risks if files are not strictly sanitized (mitigated partially by UUID filenames, but content-type validation is still pending).
- **Deployment Constraints**: This architecture does not support ephemeral containers (e.g., Heroku, Serverless, AWS Lambda) as the local disk is not persistent between restarts/instances. The backend must run on a VM or persistent container for MVP.

## References
- `backend/app/media/storage.py`
- `session_002/backend_handoff.md`
