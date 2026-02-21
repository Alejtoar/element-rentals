# Session 020 Security Audit - Results

## Audit Status: PASS (With Remediation)
**Auditor:** Antigravity (Security Agent)
**Date:** 2026-02-21

## 1. Summary of Actions
This audit focused on iCal synchronization safety, data privacy (preventing `ical_secret` leakage), and filesystem sandbox integrity. Several high-criticality vulnerabilities were identified and patched.

## 2. Findings & Remediation

### 🔴 High Criticality: Toxic Data Leakage (iCal Secret)
- **Finding:** The `ical_secret` token (used for external calendar subscriptions) was included in the public `PropertyRead` schema, exposing it via the public catalog and detail endpoints.
- **Remediation:** 
    - Created `PropertyPublicRead` schema in `backend/app/properties/schemas.py` which explicitly excludes `ical_secret` and `owner_id`.
    - Updated public routers (`/public` and `/public/{slug}`) to use the restricted schema.
    - Protected the `GET /properties/{id}` endpoint with `get_current_staff_user` to prevent unauthorized probing of full property details.

### 🔴 High Criticality: SSRF & Resource Exhaustion (iCal Import)
- **Finding:** The server performed unvalidated `GET` requests to user-provided URLs in `ICalImportService`, enabling SSRF (Server-Side Request Forgery). No file size limits were enforced, risking DOS.
- **Remediation:** 
    - Implemented strict protocol validation (HTTPS only).
    - Added DNS resolution checks in `ical_service.py` to block internal/private IP ranges (127.0.0.1, 192.168.x.x, etc.).
    - Implemented a **5MB size limit** for incoming `.ics` files using streaming downloads.

### 🟢 Low Criticality: Filesystem Sandbox
- **Finding:** Verified image upload and deletion logic.
- **Remediation:** 
    - Confirmed that `filetype.guess()` is used for magic-number header validation.
    - Verified that `PropertyService.delete_image` uses path resolution to prevent traversal.
    - **Note:** Ensure production storage is mounted with `noexec` at the OS level.

## 3. RBAC Verification
- **Internal Sync:** `POST /properties/{id}/sync` correctly requires `get_current_staff_user`.
- **Calendar Management:** All external calendar CRUD operations are protected by `get_current_staff_user`.
- **Property Details:** The internal `get_by_id` now requires staff authentication; the frontend client was updated to handle this change.

## 4. Pending Risks / Recommendations
1. **iCal Secret Rotation:** Add a feature to regenerate the `ical_secret` if a link is leaked.
2. **Rate Limiting:** Implement rate limiting for the `GET /ical` export endpoint to prevent scraping of availability data.
