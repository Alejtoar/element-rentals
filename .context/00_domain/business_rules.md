# Business Rules — Elemnt Rentals

These rules are derived from the legally binding contracts with guests and property owners.
They are the authoritative source of truth for system behavior.

---

## 1. Reservations & Payments

### 1.1 Confirmation Deposit
A **50% non-refundable deposit** is required at the time of booking to confirm any reservation.

This deposit:
- Secures the property
- Blocks availability
- Is not refundable under any circumstances unless legally required

---

### 1.2 Balance Payment
The remaining **50% balance** must be paid **before or at check-in**.

A guest **cannot check in** if the balance is not paid.

---

### 1.3 Payment Records
A single reservation may have multiple payment records.

Not all payments represent revenue for the company:
- Some are penalties
- Some are security or damage charges
- Some are pass-through fees

Each payment must store:
- `percentage_applied` — the percentage of the total booking that this payment represents  
This value must be derived from the **active contract policy**, not hard-coded.

---

## 2. Availability Rules

### 2.1 Guest Priority
Guest reservations always have higher priority than owner personal use.

An owner may block dates for personal use only if:
- No confirmed guest reservation exists for those dates
- The request is made at least 7 days in advance

Owner use generates:
- No revenue
- No commission
- No guest charges

---

## 3. Expenses & Owner Revenue

### 3.1 Expense Types
Expenses can be:
- **Individual** (apply to one property)
- **Shared** (spread across multiple properties)

Shared expenses must be explicitly allocated between properties.

---

### 3.2 Deductible Expenses
Only deductible operational expenses reduce owner revenue.

Deductible expenses include:
- Cleaning
- Supplies and consumables
- Platform fees
- Minor maintenance and repairs

Non-deductible charges (penalties, guest damages) must not reduce owner revenue unless explicitly allowed.

---

## 4. Charges, Penalties & Damages

### 4.1 Guest Responsibility
Guests are financially responsible for:
- Property damage
- Rule violations
- Missing or damaged items

These are recorded as **Charges**.

---

### 4.2 Revenue Protection
Charges and penalties:
- Must first be collected from the guest
- Do not reduce owner revenue unless they remain unpaid and the operator explicitly decides to deduct them

---

### 4.3 Fixed Penalties

The following penalties are contractually defined:

| Event | Amount (COP) |
|------|-------------|
| Lost key or access card | 120,000 |
| Lockout assistance | 30,000 |

These values must be stored as system-configurable constants, not hardcoded in logic.

---

## 5. Multi-Channel Reservations

Every reservation must have a **source**:

- direct
- airbnb
- booking
- vrbo
- other

The source determines:
- Who collected the money
- What commissions apply
- How disputes are handled
- How revenue is reported

---

## 6. Presentation & Communication (Cross-cutting Rule)

### 6.1 i18n
No user-facing text may be hardcoded.

All system messages, UI labels, WhatsApp templates, and notifications must use:
- i18n keys
- Language-specific dictionaries

This applies to:
- Website
- Admin panel
- WhatsApp messages
- System notifications
