# Session 016 — Quick Reference

## New Endpoints

### Financial Summary
```
GET /api/v1/reservations/{reservation_id}/financial-summary
```
**Response:**
```json
{
  "total_amount": 1000.00,
  "total_paid": 500.00,
  "balance": 500.00,
  "is_fully_paid": false
}
```
**Auth**: Staff, Finance, Admin

---

### Owner Deletion
```
DELETE /api/v1/owners/{owner_id}
```
**Returns**: 204 (success), 400 (has properties), 404 (not found)  
**Auth**: Staff, Finance, Admin

---

### Reservation List (Enhanced)
```
GET /api/v1/reservations/
```
**Enhancement**: Now includes `total_paid` field in each reservation  
**Auth**: Staff, Finance, Admin

---

### Owner Financial Data (NEW - SEC-001)
```
GET /api/v1/owners/{owner_id}/financial
```
**Returns**: Owner details INCLUDING bank_details  
**Auth**: Finance, Admin ONLY  
**Note**: Standard `/owners/{id}` endpoint NO LONGER returns bank_details

---

## Security Patches

### SEC-001: Owner Bank Details (HIGH)
- ✅ FIXED: `bank_details` removed from standard owner endpoints
- ✅ NEW: `/owners/{id}/financial` endpoint for Finance/Admin only

### SEC-002: Financial Summary Access (MEDIUM)
- ✅ FIXED: Finance role can now access `/reservations/{id}/financial-summary`

---

## Testing

Run validation:
```bash
backend\.venv\Scripts\python.exe .context\07_ai\sessions\session_016\validate_backend.py
```

Expected: 5/5 tests pass ✅

---

## Admin Credentials

- **Email**: admin@local.dev
- **Password**: admin

---

## Files Changed

- `backend/app/reservations/schemas.py`
- `backend/app/reservations/service.py`
- `backend/app/reservations/router.py`
- `backend/app/owners/repository.py`
- `backend/app/owners/service.py`
- `backend/app/owners/router.py`
- `.context/03_api/endpoints.md`

---

## Status

✅ All features implemented  
✅ All tests passing  
✅ Documentation updated  
✅ Ready for frontend integration
