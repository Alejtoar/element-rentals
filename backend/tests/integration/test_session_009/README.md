"""
Session 009 Integration Tests

This test suite validates the features implemented in Session 009:
- Alembic migrations and schema management
- Slug-based SEO-friendly property routing
- Staff RBAC for property CRUD operations
- Image upload security with magic number validation
- Lead submission with metadata capture
- Webhook notifications for operational alerts

## Running Tests

### Run all Session 009 tests:
```bash
cd backend
.venv\Scripts\python -m pytest tests/integration/test_session_009/ -v
```

### Run specific test file:
```bash
.venv\Scripts\python -m pytest tests/integration/test_session_009/test_slug_routing.py -v
```

### Run as standalone scripts:
```bash
.venv\Scripts\python tests/integration/test_session_009/test_authentication_and_crud.py
.venv\Scripts\python tests/integration/test_session_009/test_image_upload_security.py
.venv\Scripts\python tests/integration/test_session_009/test_lead_submission.py
.venv\Scripts\python tests/integration/test_session_009/test_slug_routing.py
```

## Test Coverage

### test_authentication_and_crud.py
- ✅ Admin login and JWT token generation
- ✅ User profile retrieval (/auth/me)
- ✅ Protected property listing (staff RBAC)
- ❌ Property creation (KNOWN BLOCKER: 500 error)

### test_image_upload_security.py
- ✅ Reject .txt files
- ✅ Reject fake .png files (extension spoofing)
- ✅ Reject executable files renamed as images
- ✅ Magic number validation working correctly

### test_lead_submission.py
- ✅ Guest lead submission with metadata
- ✅ Owner lead submission with metadata
- ✅ Guest lead without property association
- ⚠️ Webhook notifications (requires NOTIFICATIONS_WEBHOOK_URL configuration)

### test_slug_routing.py
- ✅ Public properties include slugs
- ✅ Fetch property by slug
- ✅ 404 for non-existent slugs
- ✅ Slug format validation
- ⚠️ UUID backward compatibility (may require auth)

## Known Issues (Session 009 QA)

### CRITICAL BLOCKERS
1. **Alembic Migration Missing Import**
   - File: `alembic/versions/22228721e86c_init_schema.py`
   - Issue: Missing `import sqlmodel`
   - Impact: Fresh database initialization fails

2. **Property Creation Returns 500**
   - Endpoint: `POST /api/v1/properties`
   - Issue: Internal server error
   - Impact: Staff cannot create properties
   - Tests affected: `test_create_property()`

### MEDIUM PRIORITY
1. **Webhook URL Not Configured**
   - File: `backend/.env`
   - Issue: `NOTIFICATIONS_WEBHOOK_URL` is empty
   - Impact: Cannot verify webhook notifications

## Prerequisites

- Backend server running on http://localhost:8000
- Test database with seeded data (admin user, test properties)
- Python dependencies installed (requests, pytest)

## Test Data

Tests use the following fixtures:
- Admin user: `admin@local.dev` / `admin123`
- Test property ID: `6cb3e0aa-63df-486a-a5b4-9dfa35db82dd`
- Test owner ID: `a5332542-a18b-4131-ad91-cbe6e32390d2`

## Related Documentation

- QA Handoff: `.context/07_ai/sessions/session_009/qa_handoff.md`
- Backend Handoff: `.context/07_ai/sessions/session_009/backend_handoff.md`
- ADR 013: Granular RBAC Alignment
- ADR 016: Property Slugs
"""
