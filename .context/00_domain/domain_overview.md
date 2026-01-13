# Domain Overview — Elemnt Rentals

## Vision

Elemnt Rentals (ELEMNT RENTALS S.A.S.) acts as the **Single Source of Truth (SSOT)** for the operation of short-term vacation rentals.

The system centralizes:
- Reservations
- Payments
- Expenses
- Financial reporting
- Owner settlements

to guarantee:
- Legal compliance with guests  
- Financial transparency for property owners  
- Operational control for the operator  

---

## Legal & Business Position

Elemnt Rentals operates under two simultaneous legal roles:

### 1. As Operator (Mandate Holder)
Elemnt Rentals acts on behalf of property owners under a **Management Mandate Agreement**.

In this role, Elemnt Rentals is responsible for:
- Marketing and publishing properties
- Managing pricing and availability
- Handling cleaning, maintenance, and logistics
- Collecting guest payments
- Producing financial reports
- Paying owners their net revenue

The company does **not** own the properties.

---

### 2. As Lessor (Guest Contract Holder)
Elemnt Rentals signs hospitality and rental contracts **directly with guests**.

This means:
- Guests are legally bound to Elemnt Rentals
- Elemnt Rentals is responsible for enforcing house rules, penalties, and damage charges
- Guest disputes are handled by Elemnt Rentals, not by property owners

---

## Business Model

Elemnt Rentals earns revenue by taking a commission on the **net profitability** of each property after operational expenses.

Owners receive:
- Gross rental income  
- Minus deductible operating expenses  
- Minus Elemnt Rentals’ management commission  

The system must be able to generate immutable, auditable financial statements per property and per owner.

---

## Key System Capabilities

The platform must support:

- **Multi-property management**
- **Multi-channel reservations** (Airbnb, Booking, Vrbo, Direct, etc.)
- **Direct manual reservations**
- **Expense tracking and allocation**
- **Owner statements and payouts**
- **Guest charges and penalties**
- **Audit-safe financial history**

---

## Channel Strategy

The system must support multiple booking sources:

- Direct (WhatsApp, website, phone)
- Airbnb
- Booking
- Vrbo
- Other future platforms

Each reservation must record its **source**, as it affects:
- Payment flow
- Platform commissions
- Dispute handling
- Reporting

---

## Communication Channel

WhatsApp is the **primary communication channel** for:
- Guests
- Owner partners

Standardized message templates must exist for:
- `guest_interest`
- `owner_lead`

The system must be able to generate WhatsApp links and pre-filled messages in multiple languages.

---

## AI & Automation

The architecture must support:
- AI agents reading structured data
- AI agents generating reports
- AI agents assisting operators

The domain must be machine-readable and deterministic.
