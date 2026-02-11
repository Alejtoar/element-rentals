# Session 019: Contracts & Financial Reporting Engine - Backend Handoff

## Summary
Implements the core legal and financial logic for Phase 2, enabling the system to track management contracts and generate flexible financial statements for property owners in English and Spanish.

## Implemented Features

### 1. Management Contracts (`app/contracts/`)
- **Model**: `ManagementContract`
  - Tracks commission rate (default 20%), exclusivity, and active dates.
  - Linked to Owner and Property.
- **Validation**: Enforces non-overlapping active contracts per property.
- **Security Audit Fixes**:
  - **RBAC**: All write operations (Create, Update, Delete) are restricted to `Admin` users.
  - **Immutability**: Prevents modification of `commission_rate` and `start_date` for contracts marked as `active` to ensure historical integrity.
- **CRUD Operations**: Full API support for managing contract lifecycles.
  - **Listing**: Added endpoint to list all contracts, optionally filtered by `property_id`.

### 2. Financial Reporting Engine (`app/finance/reporting.py`)
- **Logic**:
  - **Flexible Periods**: Supports custom date ranges (start_date to end_date) instead of fixed months.
  - **Gross Revenue**: Sum of payments (Net Amount) for reservations ending within the specified period.
  - **Total Expenses**: Sum of deductible expenses incurred within the specified period.
  - **Net Revenue**: Gross Revenue - Total Expenses.
  - **Commission**: Net Revenue * Contract Commission Rate.
  - **Owner Payout**: Net Revenue - Commission.
- **PDF Generation** (`app/utils/pdf_generator.py`):
  - Uses `reportlab` to generate professional owner statements.
  - **Multi-language Support**: Supports English (`en`) and Spanish (`es`) via translation dictionary.
  - Includes financial summary, detailed reservation list, expenses, and generated timestamp.

### 3. API Endpoints

#### Contracts (`/api/v1/contracts`)
| Method | Endpoint | Description | Security |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | List all contracts (filter by `property_id`) | Authenticated User |
| `POST` | `/` | Create a new contract | **Admin Only** |
| `GET` | `/{id}` | Get contract details | Authenticated User |
| `PUT` | `/{id}` | Update contract | **Admin Only** |
| `DELETE` | `/{id}` | Delete contract | **Admin Only** |

#### Finance Reporting (`/api/v1/finance`)
- `GET /reports/statement`
  - **Params**: 
    - `property_id`
    - `start_date` (YYYY-MM-DD)
    - `end_date` (YYYY-MM-DD)
    - `lang` (default "es")
  - **Output**: PDF file download (Filename: `statement_{start}_{end}_{prop_id}.pdf`).
  - **Security**: Restricted to Finance/Admin users.

### 4. Verification
- **Script**: `backend/verify_reporting.py` updated to test custom date ranges and internationalization.
- **Result**: 
  - Validated payout calculation for period 2024-01-01 to 2024-01-31.
  - Verified generated PDF content differs between English and Spanish versions.

## Files Created/Modified
- **New Modules**:
  - `backend/app/contracts/` (models, schemas, service, router, repository)
  - `backend/app/finance/reporting.py`
  - `backend/app/utils/pdf_generator.py`
- **Updated**:
  - `backend/app/main.py` (Router registration)
  - `backend/app/auth/dependencies.py` (Added imports if needed)
  - `backend/app/finance/router.py` (Added reporting endpoint with date range params)
  - `backend/app/owners/models.py` & `backend/app/properties/models.py` (Relationships)
  - `backend/requirements.txt` & `backend/requirements.lock.txt` (Added `reportlab`)
  - `backend/app/reservations/schemas.py` (Added `net_amount` to `PaymentUpdate` schema)

## Next Steps (Frontend)
1. Build UI for Management Contracts (Create/List/Edit).
2. Create "Financial Reports" page for Owners/Admin with date range pickers.
3. Integrate the PDF download endpoint, passing the user's selected dates and language preference.
