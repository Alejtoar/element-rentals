This document defines the **canonical API contract** for the Elemnt Rentals platform.
It is optimized for:

* Backend implementation (FastAPI / NestJS)
* Frontend consumption
* AI agents working inside the editor

It must stay aligned with:

* `database_schema.md`
* `database_diagram.md`
* `financial_rules.md`

---

## 0️⃣ Global Conventions

* Base URL: `/api/v1`
* Authentication: JWT (Bearer Token)
* UUIDs as primary identifiers
* Dates in ISO 8601
* Monetary values as DECIMAL (no floating point)

### Standard Response Envelope

```json
{
  "data": {},
  "meta": {},
  "error": null
}
```

---

## 1️⃣ Authentication & Users

### POST `/auth/login`

Authenticates an internal user (operator / admin).

Request:

```json
{
  "email": "admin@elemnt.com",
  "password": "********"
}
```

---

### GET `/users/me`

Returns the authenticated user profile.

### GET `/users`

List all users (Admin only).

### POST `/users`

Create user (Admin only).

### PATCH `/users/{user_id}`

Update user (Admin only).

### POST `/users/{user_id}/password`

Admin reset of user password.

### POST `/users/me/password`

Self password update (requires old password).

---

## 2️⃣ Owners (Property Partners)

### POST `/owners`

Creates a new property owner.

```json
{
  "full_name": "Carlos Perez",
  "email": "carlos@email.com",
  "phone": "+57...",
  "bank_details": "Bancolombia Ahorros 123456789"
}
```

---

### GET `/owners/{owner_id}`

Returns owner details (excluding sensitive financial information).

**Security (SEC-001)**: The `bank_details` field is intentionally excluded from this response to follow the principle of least privilege. Staff users can see contact information but not banking details.

**Response**:
```json
{
  "id": "uuid",
  "full_name": "Carlos Perez",
  "email": "carlos@email.com",
  "phone": "+57..."
}
```

---

### GET `/owners/{owner_id}/financial`

Returns owner details including sensitive financial information.

**Security**: Only accessible by Finance and Admin roles.  
**Use Case**: Payout processing and financial reconciliation.

**Response**:
```json
{
  "id": "uuid",
  "full_name": "Carlos Perez",
  "email": "carlos@email.com",
  "phone": "+57...",
  "bank_details": "Bancolombia Ahorros 987654321"
}
```

**Added**: Session 017 (Security Fix SEC-001)

---

### PATCH `/owners/{owner_id}`

Updates owner details including bank_details.

```json
{
  "full_name": "Carlos Perez Updated",
  "email": "carlos.new@email.com",
  "phone": "+57...",
  "bank_details": "Bancolombia Ahorros 987654321"
}
```

---

### DELETE `/owners/{owner_id}`

Deletes an owner.

**Business Rule**: Cannot delete an owner with active properties.
Returns 400 if owner has properties linked.

**Added**: Session 016 (Phase 2)

---

### GET `/owners/{owner_id}/properties`

Lists all properties owned by a given owner.

---

## 3️⃣ Properties

### POST `/properties`

Creates a property.

```json
{
  "owner_id": "uuid",
  "name": "Apartment 402",
  "address": "Street 123",
  "city": "Cartagena",
  "country": "Colombia",
  "max_guests": 4
}
```

---

### GET `/properties/{property_id}`

Returns property details.

---

### GET `/properties`

Query params:

* `city`
* `active`
* `owner_id`

---

## 4️⃣ Management Contracts (Partners)

### POST `/management-contracts`

Registers a management contract with a property owner.

```json
{
  "owner_id": "uuid",
  "property_id": "uuid",
  "commission_rate": 0.20,
  "exclusive": true,
  "start_date": "2025-01-01"
}
```

---

### GET `/management-contracts/{id}`

Returns contract details.

---

## 5️⃣ Guests

### POST `/guests`

Creates a guest (manual or external).

---

### GET `/guests`

List all guests.

### GET `/guests/{guest_id}`

Returns guest details.

### PATCH `/guests/{guest_id}`

Update guest details.

### DELETE `/guests/{guest_id}`

Delete guest.

---

## 6️⃣ Channels (Airbnb, Booking, Manual)

### GET `/channels`

Lists reservation channels.

---

### POST `/channels`

Creates a new channel (admin only).

```json
{
  "name": "Airbnb",
  "external": true
}
```

### PATCH `/channels/{channel_id}`

Update channel details.

### DELETE `/channels/{channel_id}`

Delete channel.


---

## 7️⃣ Reservations

### POST `/reservations`

Creates a reservation.

```json
{
  "property_id": "uuid",
  "guest_id": "uuid",
  "channel_id": "uuid",
  "reservation_type": "commercial",
  "start_date": "2025-06-01",
  "end_date": "2025-06-05",
  "guest_count": 2,
  "total_amount": 1000
}
```

**Automatic rules:**

* A `deposit` payment (50%) is generated
* Initial status: `pending`

---

### GET `/reservations/{id}`

Returns reservation details.

---

### GET `/reservations`

Lists all reservations.

**Optimization (Session 016)**: Each reservation in the list includes a `total_paid` field calculated from payments with `status='paid'`. This avoids N+1 query problems in the frontend.

---

### GET `/reservations/{id}/financial-summary`

Returns the financial summary for a reservation.

**Security (SEC-002)**: Accessible by Admin, Staff, and Finance roles. Finance team requires this data for payment reconciliation and payout processing.

**Response**:
```json
{
  "total_amount": 1000.00,
  "total_paid": 500.00,
  "balance": 500.00,
  "is_fully_paid": false
}
```

**Fields**:
- `total_amount`: Original cost of the stay
- `total_paid`: Sum of payments with status='paid'
- `balance`: Remaining amount to be paid (total_amount - total_paid)
- `is_fully_paid`: Boolean indicating if reservation is fully paid

**Added**: Session 016 (Phase 2)  
**Updated**: Session 017 (Security Fix SEC-002 - Finance access enabled)

---

### POST `/reservations/{id}/confirm`

Confirms the reservation and validates the deposit.

---

### POST `/reservations/{id}/check-in`

Registers check-in and generates the balance payment (50%).

---

### POST `/reservations/{id}/check-out`

Registers check-out.

---

## 8️⃣ Payment Methods

**Session 017**: Configurable payment methods with fee structure.

### GET `/payment-methods`

Lists all payment methods.

**Auth**: Staff, Finance, Admin

**Query Parameters**:
- `active_only` (boolean): Filter to show only active methods

**Response**:
```json
[
  {
    "id": "uuid",
    "name": "Stripe",
    "transaction_fee_percent": 2.9,
    "transaction_fee_fixed": 0.30,
    "is_active": true,
    "created_at": "2026-02-09T00:00:00Z",
    "updated_at": "2026-02-09T00:00:00Z"
  }
]
```

---

### GET `/payment-methods/{id}`

Get a specific payment method.

**Auth**: Staff, Finance, Admin

---

### POST `/payment-methods`

Create a new payment method.

**Auth**: Finance, Admin only

**Request**:
```json
{
  "name": "Stripe",
  "transaction_fee_percent": 2.9,
  "transaction_fee_fixed": 0.30,
  "is_active": true
}
```

---

### PATCH `/payment-methods/{id}`

Update a payment method.

**Auth**: Finance, Admin only

**Request**:
```json
{
  "transaction_fee_percent": 3.0,
  "is_active": false
}
```

---

### DELETE `/payment-methods/{id}`

Delete a payment method.

**Auth**: Finance, Admin only

---

## 9️⃣ Payments

### POST `/payments`

Registers a payment (manual or automatic).

**Session 017 Changes**: Now uses `payment_method_id` instead of `provider` string. Automatically calculates `net_amount` based on payment method fees.

**Request**:
```json
{
  "reservation_id": "uuid",
  "payment_method_id": "uuid",
  "amount": 100.00,
  "payment_type": "deposit",
  "non_refundable": true,
  "beneficiary": "company",
  "percentage_applied": 50.00,
  "status": "pending"
}
```

**Response**:
```json
{
  "id": "uuid",
  "reservation_id": "uuid",
  "payment_method_id": "uuid",
  "amount": 100.00,
  "net_amount": 96.70,
  "payment_type": "deposit",
  "non_refundable": true,
  "beneficiary": "company",
  "percentage_applied": 50.00,
  "status": "pending",
  "paid_at": null,
  "created_at": "2026-02-09T00:00:00Z"
}
```

**Fee Calculation**:
- If `payment_method_id` is provided, `net_amount` is automatically calculated
- Formula: `net_amount = amount - (amount * fee_percent / 100) - fee_fixed`
- Example: $100 with Stripe (3% + $0.30) = $96.70 net

---

### GET `/payments`

Lists all payments.

**Auth**: Staff, Finance, Admin

**Query Parameters**:
- `reservation_id` (UUID): Filter payments by reservation

---

### GET `/payments/{id}`

Get a specific payment.

**Auth**: Staff, Finance, Admin

---

### PATCH `/payments/{id}`

Update a payment.

**Auth**: Finance, Admin only

**Session 017**: If `amount` or `payment_method_id` is changed, `net_amount` is automatically recalculated.

**Request**:
```json
{
  "amount": 150.00,
  "payment_method_id": "uuid",
  "status": "paid",
  "paid_at": "2026-02-09T12:00:00Z"
}
```

---

### DELETE `/payments/{id}`

Delete a payment.

**Auth**: Finance, Admin only

---

### GET `/reservations/{id}/payments`

Lists all payments for a reservation.

**Auth**: Staff, Finance, Admin

---

## 🔟 Expenses

**Session 017**: Property-specific expense tracking for financial reporting and owner payouts.

### GET `/expenses`

Lists all expenses.

**Auth**: Staff, Finance, Admin

**Query Parameters**:
- `property_id` (UUID): Filter expenses by property

**Response**:
```json
[
  {
    "id": "uuid",
    "property_id": "uuid",
    "amount": 150.00,
    "date": "2026-02-09",
    "category": "Maintenance",
    "description": "Fixed broken window",
    "is_deductible": true,
    "receipt_url": "https://...",
    "created_at": "2026-02-09T00:00:00Z",
    "updated_at": "2026-02-09T00:00:00Z"
  }
]
```

---

### GET `/expenses/{id}`

Get a specific expense.

**Auth**: Staff, Finance, Admin

---

### POST `/expenses`

Creates an expense.

**Auth**: Staff, Finance, Admin (Staff can create)

**Request**:
```json
{
  "property_id": "uuid",
  "amount": 150.00,
  "date": "2026-02-09",
  "category": "Maintenance",
  "description": "Fixed broken window",
  "is_deductible": true,
  "receipt_url": "https://..."
}
```

**Categories**: Maintenance, Utilities, Cleaning, Supplies, etc.

---

### PATCH `/expenses/{id}`

Update an expense.

**Auth**: Finance, Admin only

**Request**:
```json
{
  "amount": 175.00,
  "description": "Fixed broken window and door",
  "is_deductible": false
}
```

---

### DELETE `/expenses/{id}`

Delete an expense.

**Auth**: Finance, Admin only

---

## 1️⃣1️⃣ Inventory

### POST `/properties/{property_id}/inventory`

Creates an inventory item.

---

### GET `/properties/{property_id}/inventory`

Lists inventory items for a property.

---

## 1️⃣2️⃣ Stay Events

### POST `/reservations/{id}/events`

Logs a reservation lifecycle event.

```json
{
  "event_type": "check_in",
  "notes": "Guest arrived without issues"
}
```

---

## 1️⃣3️⃣ Guest Contract Acceptance

### POST `/reservations/{id}/accept-contract`

Registers acceptance of the guest rental contract.

```json
{
  "ip_address": "xxx",
  "user_agent": "Chrome"
}
```

**Required before check-in.**

---

## 1️⃣4️⃣ Financial Statements

### POST `/financial-statements/generate`

Generates a financial statement for a property and period.

```json
{
  "property_id": "uuid",
  "period_start": "2025-06-01",
  "period_end": "2025-06-30"
}
```

Calculates:

* gross income
* platform fees
* deductible expenses
* operator commission
* owner payout

---

### POST /reservations/{id}/charges

Registers an additional charge associated with a reservation.

This endpoint is used to bill the guest for contractually allowed
extra charges, such as property damage, penalties, fines, or
extraordinary cleaning.

Charges created through this endpoint:
- Are not part of the original reservation amount.
- Do not affect owner revenue unless unpaid by the guest.
- May be linked to repairs, penalties, or third-party services.

### GET `/financial-statements/{id}`

Returns a financial statement.

---

### POST `/financial-statements/{id}/payout`

Registers a payout to the owner.

```json
{
  "payment_method": "bank_transfer"
}
```

---

## 1️⃣4️⃣ Analytics & KPIs

### GET `/analytics/property/{property_id}`

Returns property-level KPIs:

* occupancy rate
* ADR
* net income
* expenses

---

### GET `/analytics/global`

Returns global business KPIs.

---

## 🧠 Notes for AI Agents

* Do NOT create endpoints outside this document
* Do NOT infer undocumented financial logic
* Financial calculations live in `financial_rules.md`
* Frontend consumes data; business logic lives in backend

---

## 📌 Design Status

At this point the system has:

✅ Closed domain model
✅ Defined database schema
✅ Clear API contract
✅ Ready for FastAPI / NestJS
✅ Prepared for MCP / AI integrations

---

## WhatsApp Lead Links

### GET /properties/{id}/whatsapp-link

Generates a WhatsApp deeplink for guest inquiries about a specific property.

**Query parameters**
- `lang`: `en` or `es`
- `type`: `guest`

**Response**
```json
{
  "url": "https://wa.me/57300123456?text=Hello%20I%20am%20interested%20in%20property%20ER-1023"
}
```

This link must:

* Use the correct language template
* Include the property reference
* Include tracking information

---

### GET /owners/whatsapp-link

Generates a WhatsApp deeplink for owner partner leads.

**Query parameters**
- `lang`: `en` or `es`

**Response**
```json
{
  "url": "https://wa.me/57300123456?text=Hola%20quiero%20publicar%20mi%20propiedad%20con%20Elemnt%20Rentals"
}
```

This link must:

* Use the correct owner_lead template
* Include language
* Include source tracking

---


### POST /leads/guest
Captures inquiries from the landing page.
- **Payload**: `property_id`, `name`, `phone`, `desired_dates`, `message`, `source`
- **Logic**: Must capture `ip_address` and `user_agent` from request headers.

### POST /leads/owner
Captures property owner interest.
- **Payload**: `name`, `phone`, `location`, `message`, `source`

### POST /properties/{id}/images
Uploads a new image to a property.
- **Multipart Form**: `file`, `is_main` (bool), `sort_order` (int)
- **Constraint**: If `is_main` is true, all other images for this property must be set to `is_main: false`.

### DELETE /properties/{property_id}/images/{image_id}
Deletes a property image.
- **Authentication**: Required (Staff/Admin)
- **Path Parameters**: `property_id` (UUID), `image_id` (UUID)
- **Response**: Updated `PropertyRead` with remaining images
- **Logic**:
  - Removes image from database
  - Deletes physical file from storage
  - If deleted image was `is_main=true`, automatically promotes another image to main
  - Returns 404 if property or image not found
  - Returns 403 if user lacks permission
- **Status Codes**: 200 (success), 403 (unauthorized), 404 (not found), 500 (server error)
- **Added**: Session 012 (2026-01-23)

### GET /properties/public
Public listing for the Landing Page.
- **Query Params**: `city`, `max_guests`, `min_price`, `max_price`
- **Response**: Filtered list of active properties including their `main_image` URL.