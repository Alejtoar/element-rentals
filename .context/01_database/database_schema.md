# Database Schema – Element Rentals Platform

## Purpose

This document defines the authoritative database schema for the Element Rentals platform.

The database is the Single Source of Truth (SSOT) for:
- Reservations
- Payments
- Expenses
- Financial reporting
- Owner payouts
- Legal compliance

All schema changes MUST be reflected here before code or migrations are updated.

---

## Database Technology

- PostgreSQL
- Relational, normalized (3NF)
- UUID primary keys
- Timestamps in UTC

---

## Core Design Principles

- External systems (Airbnb, Booking, Lodgify) are integrated via adapters
- Financial data must be auditable and traceable
- Monthly financial statements are immutable once generated
- Not all payments are revenue
- Expenses may be shared across properties
- Business rules are enforced at the domain level, not UI

---

## Entities Overview

- Owner
- Property
- ManagementContract
- Guest
- Reservation
- Channel
- Payment
- Charge
- Expense
- ExpenseProperty
- FinancialStatement
- Payout
- StayEvent
- ContractAcceptance
- InventoryItem
- User

---

## Tables Definition

---

### Owner

Represents a property owner (principal of the mandate contract).

| Field | Type | Notes |
|-----|-----|-----|
| id | UUID (PK) | |
| full_name | VARCHAR | |
| email | VARCHAR | |
| phone | VARCHAR | |
| created_at | TIMESTAMP | |

---

### Property

Represents a managed physical property.

| Field | Type | Notes |
|-----|-----|-----|
| id | UUID (PK) | |
| owner_id | UUID (FK → Owner.id) | |
| name | VARCHAR | Internal reference |
| slug | VARCHAR | Unique SEO-friendly URL part |
| nightly_price | DECIMAL | |
| address | TEXT | |
| city | VARCHAR | |
| country | VARCHAR | |
| max_guests | INTEGER | Capacity limit |
| active | BOOLEAN | |
| created_at | TIMESTAMP | |

---

### ManagementContract

Represents the mandate agreement between Element Rentals and the property owner.

| Field | Type | Notes |
|-----|-----|-----|
| id | UUID (PK) | |
| owner_id | UUID (FK → Owner.id) | |
| property_id | UUID (FK → Property.id) | |
| commission_rate | DECIMAL | Default 0.20 |
| exclusive | BOOLEAN | |
| start_date | DATE | |
| end_date | DATE | Nullable |
| active | BOOLEAN | |
| created_at | TIMESTAMP | |

---

### Guest

Represents a guest staying at a property.

| Field | Type | Notes |
|-----|-----|-----|
| id | UUID (PK) | |
| full_name | VARCHAR | |
| email | VARCHAR | Nullable |
| phone | VARCHAR | |
| created_at | TIMESTAMP | |

---

### Channel

Represents the booking source.

| Field | Type | Notes |
|-----|-----|-----|
| id | UUID (PK) | |
| name | VARCHAR | Airbnb, Booking, Manual |
| external | BOOLEAN | |
| created_at | TIMESTAMP | |

---

### Reservation

Represents an occupancy record.

| Field | Type | Notes |
|-----|-----|-----|
| id | UUID (PK) | |
| property_id | UUID (FK → Property.id) | |
| guest_id | UUID (FK → Guest.id) | Nullable for owner use |
| channel_id | UUID (FK → Channel.id) | |
| reservation_type | VARCHAR | commercial, owner_use |
| start_date | DATE | |
| end_date | DATE | |
| guest_count | INTEGER | |
| total_amount | DECIMAL | Gross amount |
| status | VARCHAR | confirmed, cancelled, completed |
| created_at | TIMESTAMP | |

---

### Payment

Represents a payment related to a reservation.

| Field | Type | Notes |
|-----|-----|-----|
| id | UUID (PK) | |
| reservation_id | UUID (FK → Reservation.id) | |
| amount | DECIMAL | |
| payment_type | VARCHAR | deposit, balance, penalty |
| non_refundable | BOOLEAN | |
| provider | VARCHAR | Stripe, Cash, Transfer |
| beneficiary | VARCHAR | company, third_party |
| percentage_applied | DECIMAL(5,2) | Percentage of total reservation amount this payment represents |
| status | VARCHAR | paid, pending |
| paid_at | TIMESTAMP | |
| created_at | TIMESTAMP | |

---

### Charge

Charges represent additional amounts billed to the guest,
including damages, penalties, fines, or extraordinary cleaning,
as allowed by the guest contract.

| Field | Type | Notes |
|-----|-----|-----|
| id | UUID (PK) | |
| reservation_id | UUID (FK → Reservation.id) | |
| type | VARCHAR | penalty, fee |
| description | TEXT | |
| amount | DECIMAL | |
| beneficiary | VARCHAR | company, third_party |
| paid | BOOLEAN | |
| created_at | TIMESTAMP | |

---

### Expense

Expenses are operational costs.
Guest-caused damages are NOT expenses unless unpaid by the guest.


| Field | Type | Notes |
|-----|-----|-----|
| id | UUID (PK) | |
| category | VARCHAR | cleaning, maintenance, supply |
| total_amount | DECIMAL | |
| deductible | BOOLEAN | |
| charged_to_guest | BOOLEAN | |
| reservation_id | UUID (FK → Reservation.id) | Nullable |
| description | TEXT | |
| support_document | TEXT | Invoice or receipt |
| incurred_at | DATE | |
| created_at | TIMESTAMP | |

---

### ExpenseProperty

Allocates expenses to properties (supports proration).

| Field | Type | Notes |
|-----|-----|-----|
| id | UUID (PK) | |
| expense_id | UUID (FK → Expense.id) | |
| property_id | UUID (FK → Property.id) | |
| allocated_amount | DECIMAL | |
| created_at | TIMESTAMP | |

---

### FinancialStatement

Monthly immutable financial statement per property.

| Field | Type | Notes |
|-----|-----|-----|
| id | UUID (PK) | |
| property_id | UUID (FK → Property.id) | |
| period_start | DATE | |
| period_end | DATE | |
| gross_income | DECIMAL | All revenue collected |
| platform_fees | DECIMAL | Commissions (Airbnb, etc) |
| deductible_expenses | DECIMAL | Cleaning, supplies, etc |
| depurated_income | DECIMAL | Result: Gross - Fees - Expenses |
| operator_commission | DECIMAL | 20% of depurated_income |
| owner_payout | DECIMAL | 80% of depurated_income |
| generated_at | TIMESTAMP | |

---

### Payout

Represents a transfer to the property owner.

| Field | Type | Notes |
|-----|-----|-----|
| id | UUID (PK) | |
| financial_statement_id | UUID (FK → FinancialStatement.id) | |
| amount | DECIMAL | |
| payment_method | VARCHAR | transfer |
| paid_at | TIMESTAMP | |
| created_at | TIMESTAMP | |

---

### StayEvent

Tracks lifecycle events of a stay.

| Field | Type | Notes |
|-----|-----|-----|
| id | UUID (PK) | |
| reservation_id | UUID (FK → Reservation.id) | |
| event_type | VARCHAR | check_in, check_out |
| occurred_at | TIMESTAMP | |
| notes | TEXT | |

---

### ContractAcceptance

Tracks guest acceptance of the rental contract.

| Field | Type | Notes |
|-----|-----|-----|
| id | UUID (PK) | |
| reservation_id | UUID (FK → Reservation.id) | |
| accepted_at | TIMESTAMP | |
| ip_address | VARCHAR | |
| user_agent | TEXT | |
| signed | BOOLEAN | |

---

### InventoryItem

Represents inventory items inside a property.

| Field | Type | Notes |
|-----|-----|-----|
| id | UUID (PK) | |
| property_id | UUID (FK → Property.id) | |
| name | VARCHAR | |
| quantity | INTEGER | |
| condition | VARCHAR | |
| created_at | TIMESTAMP | |

---

### User

Internal system user.

| Field | Type | Notes |
|-----|-----|-----|
| id | UUID (PK) | |
| email | VARCHAR | |
| full_name | VARCHAR | Added for profile display |
| hashed_password | VARCHAR | BCrypt hash |
| role | VARCHAR | admin, staff, finance |
| created_at | TIMESTAMP | |

---

### PropertyImage
Stores references to property photos. Supports normalization and gallery ordering.

| Field | Type | Notes |
|-----|-----|-----|
| id | UUID (PK) | |
| property_id | UUID (FK → Property.id) | |
| url | TEXT | Full path to S3/Cloudinary/Storage |
| is_main | BOOLEAN | Default false. Only one per property. |
| order | INTEGER | For gallery sorting |
| created_at | TIMESTAMP | |

---

## Net Revenue & Financial Invariants

- Reservations must have at least one payment if commercial.
- Deposit payments are non-refundable.
- Owner usage reservations generate no income.
- Only deductible expenses affect net income.
- Financial statements are immutable once generated.
- Payouts are always linked to a financial statement.
- **Beneficiary Logic**:
    - Payments where `beneficiary == 'company'` are included in Gross Income.
    - Payments where `beneficiary == 'third_party'` (e.g., Resort Fees, Building Wristbands) must be recorded for auditability but **excluded** from all Gross/Net Income calculations for the Owner.
- **Charge Protection**: Guest-paid charges for damages are not considered "Revenue" but "reimbursements". They do not affect the 20/80 split unless explicitly marked as extra income.

---

## Notes for AI Agents

- Do not modify schema without updating this document.
- Do not infer business rules not stated here.
- Always respect financial invariants.

---

