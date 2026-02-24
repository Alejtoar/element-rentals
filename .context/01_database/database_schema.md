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
- PaymentMethod (Session 017)
- Payment
- Charge
- Expense
- ExpenseProperty
- FinancialStatement
- Payout
- StayEvent
- ContractAcceptance
- InventoryItem
- ExternalCalendar (Session 018)
- CalendarBlock (Session 020)
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
| bank_details | TEXT | Phase 2 financial info |
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
| description | TEXT | Detailed property description |
| nightly_price | DECIMAL | |
| address | TEXT | |
| city | VARCHAR | |
| country | VARCHAR | |
| max_guests | INTEGER | Capacity limit |
| active | BOOLEAN | |
| featured | BOOLEAN | |
| ical_secret | UUID | Unique token for iCal export URL |
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

### OwnerLead

Captures interest from potential property owners.

| Field | Type | Notes |
|-----|-----|-----|
| id | UUID (PK) | |
| name | VARCHAR | |
| phone | VARCHAR | |
| location | VARCHAR | Property location |
| message | TEXT | |
| source | VARCHAR | website, whatsapp, referral |
| ip_address | VARCHAR | |
| user_agent | VARCHAR | |
| referer | VARCHAR | |
| utm_source | VARCHAR | |
| utm_medium | VARCHAR | |
| utm_campaign | VARCHAR | |
| utm_term | VARCHAR | |
| utm_content | VARCHAR | |
| created_at | TIMESTAMP | |

---

### GuestLead

Captures inquiries for property rentals.

| Field | Type | Notes |
|-----|-----|-----|
| id | UUID (PK) | |
| property_id | UUID (FK → Property.id) | Optional (general vs specific) |
| name | VARCHAR | |
| phone | VARCHAR | |
| desired_dates | VARCHAR | |
| message | TEXT | |
| source | VARCHAR | website, whatsapp, referral |
| ip_address | VARCHAR | |
| user_agent | VARCHAR | |
| referer | VARCHAR | |
| utm_source | VARCHAR | |
| utm_medium | VARCHAR | |
| utm_campaign | VARCHAR | |
| utm_term | VARCHAR | |
| utm_content | VARCHAR | |
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

### PaymentMethod

**Session 017**: Configurable payment methods with fee structure.

| Field | Type | Notes |
|-----|-----|-----|
| id | UUID (PK) | |
| name | VARCHAR | e.g., Stripe, Cash, Bank Transfer |
| transaction_fee_percent | DECIMAL(5,2) | Percentage fee (e.g., 2.9 for 2.9%) |
| transaction_fee_fixed | DECIMAL(10,2) | Fixed fee (e.g., 0.30) |
| is_active | BOOLEAN | Whether this method is currently available |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

---

### Payment

Represents a payment related to a reservation.

**Session 017 Changes**: Replaced `provider` string with `payment_method_id` FK, added `net_amount` for fee tracking.

| Field | Type | Notes |
|-----|-----|-----|
| id | UUID (PK) | |
| reservation_id | UUID (FK → Reservation.id) | |
| payment_method_id | UUID (FK → PaymentMethod.id) | Nullable - links to payment method |
| amount | DECIMAL | Gross payment amount |
| net_amount | DECIMAL | Amount after processing fees |
| payment_type | VARCHAR | deposit, balance, penalty |
| non_refundable | BOOLEAN | |
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

**Session 017**: Property-specific expense tracking for financial reporting.

Expenses are operational costs.
Guest-caused damages are NOT expenses unless unpaid by the guest.

| Field | Type | Notes |
|-----|-----|-----|
| id | UUID (PK) | |
| property_id | UUID (FK → Property.id) | Property this expense belongs to |
| amount | DECIMAL | Expense amount |
| date | DATE | Date expense was incurred |
| category | VARCHAR | Maintenance, Utilities, Cleaning, Supplies, etc. |
| description | TEXT | Detailed description |
| is_deductible | BOOLEAN | Tax deductible from owner payout |
| receipt_url | VARCHAR | Optional URL to receipt/invoice |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

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

### CalendarBlock

Represents a continuous date range during which a property is unavailable, synchronized from external sources.

| Field | Type | Notes |
|-----|-----|-----|
| id | UUID (PK) | |
| property_id | UUID (FK → Property.id) | |
| start_date | DATE | |
| end_date | DATE | |
| source | VARCHAR | airbnb, booking, owner, manual |
| external_uid | VARCHAR | Optional UID from iCal |
| reason | TEXT | Optional reason for block |
| created_at | TIMESTAMP | |

---

### ExternalCalendar

**Session 018**: Stores URLs for importing availability from external platforms.

| Field | Type | Notes |
|-----|-----|-----|
| id | UUID (PK) | |
| property_id | UUID (FK → Property.id) | |
| name | VARCHAR | e.g., Airbnb, Booking |
| url | TEXT | The secret .ics URL from the platform |
| last_sync | TIMESTAMP | Nullable - when it was last updated |
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

### ExternalCalendar

Registers external `.ics` feed URLs from platforms like Airbnb or Booking.com for a property. Used by the iCal import service to know where to fetch blocks from.
**Added**: Session 018 (iCal Export), managed via import in Session 020.

| Field | Type | Notes |
|-----|-----|-----|
| id | UUID (PK) | |
| property_id | UUID (FK → Property.id) | |
| name | VARCHAR | Human label, e.g. "Airbnb", "Booking" |
| url | TEXT | The remote `.ics` feed URL |
| last_sync | TIMESTAMP | UTC timestamp of last successful sync. Nullable |
| created_at | TIMESTAMP | |

---

### CalendarBlock

Stores unavailable date ranges imported from external iCal feeds. Populated exclusively by `ICalImportService` using the **replace-by-source** strategy (ADR-017). Never created manually via UI.
**Added**: Session 020.

| Field | Type | Notes |
|-----|-----|-----|
| id | UUID (PK) | |
| property_id | UUID (FK → Property.id) | Indexed |
| start_date | DATE | Inclusive |
| end_date | DATE | Exclusive (checkout day is available) |
| source | VARCHAR | Origin platform: `airbnb`, `booking`, `manual` |
| external_uid | VARCHAR | `UID` from the iCal VEVENT. Nullable. Indexed for deduplication |
| reason | VARCHAR | SUMMARY from iCal event. Nullable |
| created_at | TIMESTAMP | |

**Sync strategy**: On each sync for a `(property_id, source)` pair, all existing rows are deleted and replaced with newly parsed events. This avoids complex diffing at the cost of always re-inserting.

---

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

