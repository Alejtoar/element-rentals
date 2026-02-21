# Session 020 Architectural Review - Handoff

## Focus: System Integrity, Availability Patterns & Hybrid Sync

### Architectural Milestones in Session 020:

1. **Integrated Availability Logic:**
   - Moved from simple metadata to a unified availability engine.
   - **Pattern:** Using SQLAlchemy `EXISTS` subqueries in the Repository layer for high-performance date range filtering.
   - **Data Source:** Aggregation of `Reservation` (internal) and `CalendarBlock` (external) for a single "source of truth" on inventory.

2. **iCal Synchronization Strategy (ADR-017 - Replace-by-Source):**
   - Chose an idempotent "wipe and reload" strategy for external blocks to simplify state management and avoid drift with external platform UIDs.
   - Decoupled `ICalImportService` from standard Property services.

3. **Public/Private API Boundaries:**
   - Established clear boundaries for iCal visibility.
   - **Security:** Use of `ical_secret` as a non-sequential, cryptographically strong token for public service URLs.
   - **Schema:** Strict separation between `PropertyRead` (admin/internal) and `PropertyPublicRead` (guest-facing) regarding sensitive tokens.

4. **Production Hardening (Build-Time vs. Runtime):**
   - Standardized the use of Docker `ARG` for Next.js build-time variables (Rewrites/Public URLs).
   - Ensured image optimization is handled at the source (Backup/Middleware) rather than just the edge (Next.js Image), reducing server load during peaks.

### High-Level Architecture Review Points:
- Check for circular dependencies introduced by cross-referencing `Reservations` and `Properties` in the Repository. (Fixed with lazy imports, needs validation).
- Verify the error propagation strategy during the multi-source iCal synchronization.
- Review the "Standalone" Next.js build configuration for production scalability.

### Files of Interest:
- `backend/app/properties/repository.py` (Filter logic)
- `backend/app/properties/ical_service.py` (Sync logic)
- `backend/app/properties/router.py` (Boundary definition)
- `frontend/Dockerfile` (Build pipeline)
