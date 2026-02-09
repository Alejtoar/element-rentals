# Session 017 — Quick Reference

## New Endpoints

### Payment Methods
```
GET    /api/v1/payment-methods
POST   /api/v1/payment-methods (Finance/Admin)
GET    /api/v1/payment-methods/{id}
PATCH  /api/v1/payment-methods/{id} (Finance/Admin)
DELETE /api/v1/payment-methods/{id} (Finance/Admin)
```

### Expenses
```
GET    /api/v1/expenses?property_id={id}
POST   /api/v1/expenses (Staff+)
GET    /api/v1/expenses/{id}
PATCH  /api/v1/expenses/{id} (Finance/Admin)
DELETE /api/v1/expenses/{id} (Finance/Admin)
```

---

## Payment Changes

### New Fields:
- `payment_method_id` (UUID, optional) - Replaces `provider` string
- `net_amount` (Decimal) - Amount after fees

### Removed Fields:
- `provider` (string) - Now use `payment_method_id`

---

## Fee Calculation

**Formula**:
```
net_amount = amount - (amount * fee_percent / 100) - fee_fixed
```

**Example** (Stripe: 3% + $0.30):
```
Amount: $100.00
Fees: $3.00 + $0.30 = $3.30
Net: $96.70
```

---

## Quick Test

```bash
# 1. Create payment method
POST /api/v1/payment-methods
{
  "name": "Stripe Test",
  "transaction_fee_percent": 3.00,
  "transaction_fee_fixed": 0.30
}

# 2. Create payment
POST /api/v1/payments
{
  "reservation_id": "...",
  "payment_method_id": "<id-from-step-1>",
  "amount": 100.00,
  ...
}

# 3. Verify net_amount = 96.70
```

---

## Migration

```bash
cd backend
alembic upgrade head
```

---

## Status

✅ Code complete  
⏳ Migration pending  
⏳ Frontend integration needed
