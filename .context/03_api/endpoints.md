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

---

## 2️⃣ Owners (Property Partners)

### POST `/owners`

Creates a new property owner.

```json
{
  "full_name": "Carlos Perez",
  "email": "carlos@email.com",
  "phone": "+57..."
}
```

---

### GET `/owners/{owner_id}`

Returns owner details.

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

### GET `/guests/{guest_id}`

Returns guest details.

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

### POST `/reservations/{id}/confirm`

Confirms the reservation and validates the deposit.

---

### POST `/reservations/{id}/check-in`

Registers check-in and generates the balance payment (50%).

---

### POST `/reservations/{id}/check-out`

Registers check-out.

---

## 8️⃣ Payments

### POST `/payments`

Registers a payment (manual or automatic).

```json
{
  "reservation_id": "uuid",
  "amount": 250,
  "payment_type": "deposit",
  "provider": "Stripe",
  "beneficiary": "operator"
}
```

---

### GET `/reservations/{id}/payments`

Lists all payments for a reservation.

---

## 9️⃣ Expenses

### POST `/expenses`

Creates an operational expense.

```json
{
  "category": "supply",
  "total_amount": 120,
  "deductible": true,
  "charged_to_guest": false,
  "reservation_id": null,
  "description": "General supplies",
  "incurred_at": "2025-06-03"
}
```

---

### POST `/expenses/{id}/allocate`

Allocates an expense across one or more properties.

```json
{
  "allocations": [
    { "property_id": "uuid1", "amount": 60 },
    { "property_id": "uuid2", "amount": 60 }
  ]
}
```

---

## 🔟 Inventory

### POST `/properties/{property_id}/inventory`

Creates an inventory item.

---

### GET `/properties/{property_id}/inventory`

Lists inventory items for a property.

---

## 1️⃣1️⃣ Stay Events

### POST `/reservations/{id}/events`

Logs a reservation lifecycle event.

```json
{
  "event_type": "check_in",
  "notes": "Guest arrived without issues"
}
```

---

## 1️⃣2️⃣ Guest Contract Acceptance

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

## 1️⃣3️⃣ Financial Statements

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

### GET /properties/public
Public listing for the Landing Page.
- **Query Params**: `city`, `max_guests`, `min_price`, `max_price`
- **Response**: Filtered list of active properties including their `main_image` URL.