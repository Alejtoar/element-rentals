# Session 017 — Documentation Updates

**Date**: 2026-02-09  
**Status**: ✅ COMPLETE

---

## Updated Documentation Files

### 1. Database Schema (`.context/01_database/database_schema.md`)

**Changes Made**:

#### Added PaymentMethod to Entities List
- New entity: `PaymentMethod (Session 017)`

#### New Table: PaymentMethod
```
| Field | Type | Notes |
|-------|------|-------|
| id | UUID (PK) | |
| name | VARCHAR | e.g., Stripe, Cash, Bank Transfer |
| transaction_fee_percent | DECIMAL(5,2) | Percentage fee (e.g., 2.9 for 2.9%) |
| transaction_fee_fixed | DECIMAL(10,2) | Fixed fee (e.g., 0.30) |
| is_active | BOOLEAN | Whether this method is currently available |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |
```

#### Updated Table: Payment
**Added**:
- `payment_method_id` (UUID, FK to PaymentMethod.id, nullable)
- `net_amount` (DECIMAL) - Amount after processing fees

**Removed**:
- `provider` (VARCHAR) - Replaced by payment_method_id FK

#### Updated Table: Expense
**Changed from generic expense allocation to property-specific tracking**:
- Now has `property_id` FK (direct link to Property)
- Simplified fields: `amount`, `date`, `category`, `description`
- Added `is_deductible` (boolean) for tax purposes
- Added `receipt_url` for documentation
- Removed: `total_amount`, `charged_to_guest`, `reservation_id`, `support_document`, `incurred_at`

---

### 2. API Endpoints (`.context/03_api/endpoints.md`)

**Changes Made**:

#### New Section: 8️⃣ Payment Methods
- `GET /payment-methods` - List all methods
- `GET /payment-methods/{id}` - Get specific method
- `POST /payment-methods` - Create method (Finance/Admin)
- `PATCH /payment-methods/{id}` - Update method (Finance/Admin)
- `DELETE /payment-methods/{id}` - Delete method (Finance/Admin)

#### Updated Section: 9️⃣ Payments (was 8️⃣)
- Updated `POST /payments` to use `payment_method_id` instead of `provider`
- Added automatic `net_amount` calculation documentation
- Added `GET /payments` - List all payments
- Added `GET /payments/{id}` - Get specific payment
- Added `PATCH /payments/{id}` - Update payment (Finance/Admin)
- Added `DELETE /payments/{id}` - Delete payment (Finance/Admin)
- Documented fee calculation formula

#### Updated Section: 🔟 Expenses (was 9️⃣)
- Complete rewrite for property-specific expense tracking
- `GET /expenses` - List expenses (with property_id filter)
- `GET /expenses/{id}` - Get specific expense
- `POST /expenses` - Create expense (Staff+)
- `PATCH /expenses/{id}` - Update expense (Finance/Admin)
- `DELETE /expenses/{id}` - Delete expense (Finance/Admin)
- Removed expense allocation endpoints (simplified model)

#### Renumbered Sections:
- 1️⃣1️⃣ Inventory (unchanged)
- 1️⃣2️⃣ Stay Events (was 1️⃣1️⃣)
- 1️⃣3️⃣ Guest Contract Acceptance (was 1️⃣2️⃣)
- 1️⃣4️⃣ Financial Statements (was 1️⃣3️⃣)

---

## Summary of Changes

### Database Schema Updates:
- ✅ Added PaymentMethod table definition
- ✅ Updated Payment table (removed provider, added payment_method_id and net_amount)
- ✅ Updated Expense table (simplified to property-specific model)
- ✅ Updated entities overview list

### API Documentation Updates:
- ✅ Added complete Payment Methods API section (5 endpoints)
- ✅ Updated Payments API section with new schema
- ✅ Updated Expenses API section with new model
- ✅ Fixed section numbering throughout document
- ✅ Added fee calculation examples and formulas
- ✅ Documented RBAC for all new endpoints

---

## Key Documentation Highlights

### Fee Calculation Formula
```
net_amount = amount - (amount * fee_percent / 100) - fee_fixed
```

**Example**: $100 payment with Stripe (3% + $0.30) = $96.70 net

### RBAC Summary

**Payment Methods**:
- Read: Staff, Finance, Admin
- Create/Update/Delete: Finance, Admin only

**Payments**:
- Read: Staff, Finance, Admin
- Create/Update/Delete: Finance, Admin only

**Expenses**:
- Read/Create: Staff, Finance, Admin
- Update/Delete: Finance, Admin only

---

## Files Modified

1. `.context/01_database/database_schema.md`
   - Added PaymentMethod table
   - Updated Payment table
   - Updated Expense table
   - Updated entities list

2. `.context/03_api/endpoints.md`
   - Added Payment Methods section
   - Updated Payments section
   - Updated Expenses section
   - Fixed section numbering

---

**Documentation Status**: ✅ **UP TO DATE**

All documentation now accurately reflects the Session 017 implementation.
