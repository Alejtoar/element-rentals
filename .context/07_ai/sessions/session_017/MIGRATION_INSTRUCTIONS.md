# Session 017 — Migration Instructions

**Date**: 2026-02-09  
**Status**: ⏳ PENDING EXECUTION

---

## Database Migration Required

Session 017 introduces new tables and modifies existing ones. The database must be migrated before the new features can be used.

---

## Migration File

**Location**: `backend/alembic/versions/5a8f9c2d3e4b_session_017_payment_methods_and_expenses.py`

**Revision ID**: `5a8f9c2d3e4b`  
**Previous Revision**: `0111d325f136`

---

## What the Migration Does

### Creates New Tables:

1. **`paymentmethod`**
   - Stores configurable payment methods with fee structures
   - Fields: id, name, transaction_fee_percent, transaction_fee_fixed, is_active, timestamps

2. **`expense`** (restructured)
   - Property-specific expense tracking
   - Fields: id, property_id, amount, date, category, description, is_deductible, receipt_url, timestamps

### Modifies Existing Tables:

1. **`payment`**
   - **Adds**: `payment_method_id` (UUID, FK to paymentmethod.id, nullable)
   - **Adds**: `net_amount` (DECIMAL, default 0)
   - **Removes**: `provider` (VARCHAR)

---

## Migration Commands

### Option 1: Using Alembic CLI (Recommended)

```bash
cd backend
alembic upgrade head
```

### Option 2: Using Python

```bash
cd backend
python -c "from alembic.config import Config; from alembic import command; cfg = Config('alembic.ini'); command.upgrade(cfg, 'head')"
```

### Option 3: Manual SQL (if Alembic fails)

If the automated migration fails, you can run the SQL manually:

```sql
-- 1. Create paymentmethod table
CREATE TABLE paymentmethod (
    id UUID PRIMARY KEY,
    name VARCHAR NOT NULL,
    transaction_fee_percent DECIMAL(5,2) NOT NULL DEFAULT 0,
    transaction_fee_fixed DECIMAL(10,2) NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE INDEX ix_paymentmethod_name ON paymentmethod(name);

-- 2. Create new expense table
CREATE TABLE expense (
    id UUID PRIMARY KEY,
    property_id UUID NOT NULL REFERENCES property(id),
    amount DECIMAL(10,2) NOT NULL,
    date DATE NOT NULL,
    category VARCHAR NOT NULL,
    description VARCHAR NOT NULL,
    is_deductible BOOLEAN NOT NULL DEFAULT TRUE,
    receipt_url VARCHAR NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

-- 3. Modify payment table
ALTER TABLE payment ADD COLUMN payment_method_id UUID NULL;
ALTER TABLE payment ADD COLUMN net_amount DECIMAL(10,2) NOT NULL DEFAULT 0;
ALTER TABLE payment ADD CONSTRAINT fk_payment_payment_method 
    FOREIGN KEY (payment_method_id) REFERENCES paymentmethod(id);

-- 4. Drop old provider column (AFTER data migration if needed)
-- ALTER TABLE payment DROP COLUMN provider;
```

---

## Post-Migration Steps

### 1. Verify Migration

```bash
cd backend
python .context/07_ai/sessions/session_017/validate_session_017.py
```

### 2. Seed Initial Payment Methods

Create common payment methods via API or seed script:

```bash
# Example: Create payment methods via API
curl -X POST http://localhost:8000/api/v1/payment-methods \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Cash",
    "transaction_fee_percent": 0,
    "transaction_fee_fixed": 0,
    "is_active": true
  }'

curl -X POST http://localhost:8000/api/v1/payment-methods \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Stripe",
    "transaction_fee_percent": 2.9,
    "transaction_fee_fixed": 0.30,
    "is_active": true
  }'

curl -X POST http://localhost:8000/api/v1/payment-methods \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bank Transfer",
    "transaction_fee_percent": 0,
    "transaction_fee_fixed": 0,
    "is_active": true
  }'
```

### 3. Data Migration (Optional)

If you have existing payments with the old `provider` field, you may want to:

1. Create PaymentMethod records for each unique provider
2. Update existing payments to link to the appropriate payment_method_id
3. Calculate net_amount for existing payments

**Example migration script**:

```python
# backend/scripts/migrate_payment_providers.py
from sqlmodel import Session, select
from app.db import engine
from app.reservations.models import Payment
from app.finance.models import PaymentMethod

def migrate_providers():
    with Session(engine) as session:
        # Get unique providers
        payments = session.exec(select(Payment)).all()
        providers = set(p.provider for p in payments if hasattr(p, 'provider'))
        
        # Create PaymentMethods
        method_map = {}
        for provider_name in providers:
            method = PaymentMethod(
                name=provider_name,
                transaction_fee_percent=0,
                transaction_fee_fixed=0,
                is_active=True
            )
            session.add(method)
            session.commit()
            session.refresh(method)
            method_map[provider_name] = method.id
        
        # Update payments
        for payment in payments:
            if hasattr(payment, 'provider') and payment.provider:
                payment.payment_method_id = method_map.get(payment.provider)
                payment.net_amount = payment.amount  # No fees for old payments
                session.add(payment)
        
        session.commit()
        print(f"Migrated {len(payments)} payments")

if __name__ == "__main__":
    migrate_providers()
```

---

## Troubleshooting

### Error: "Target database is not up to date"

This means there are pending migrations. Run:
```bash
cd backend
alembic current
alembic heads
alembic upgrade head
```

### Error: "Can't locate revision identified by '0111d325f136'"

The migration chain is broken. Check:
```bash
cd backend
alembic history
```

Ensure the previous migration exists and is applied.

### Error: "Column 'provider' does not exist"

The migration already ran. Check:
```bash
cd backend
alembic current
```

### Backend won't start after migration

Check the logs for specific errors. Common issues:
- Import errors (ensure all new modules are imported in `main.py`)
- Model relationship errors (check forward references)

---

## Rollback (if needed)

If you need to rollback the migration:

```bash
cd backend
alembic downgrade -1
```

This will:
- Drop `paymentmethod` and new `expense` tables
- Restore `provider` column to `payment` table
- Remove `payment_method_id` and `net_amount` from `payment` table

---

## Verification Checklist

After migration, verify:

- [ ] Backend starts without errors
- [ ] `/docs` shows new Payment Methods endpoints
- [ ] `/docs` shows updated Payments endpoints
- [ ] `/docs` shows updated Expenses endpoints
- [ ] Can create a PaymentMethod via API
- [ ] Can create a Payment with payment_method_id
- [ ] `net_amount` is calculated correctly
- [ ] Can create an Expense via API
- [ ] Session 016 financial summary still works

---

## Status

- ✅ Migration file created
- ⏳ Migration execution pending
- ⏳ Seed data pending
- ⏳ Validation pending

---

**Next Steps**: Run the migration and execute the validation script to confirm all features are working correctly.
