# ADR 017 – External Calendar Synchronization via iCal

## Status
Accepted

## Date
2026-02-04

## Context

Element Rentals operates as a property management and marketing platform for short-term rentals.  
Properties are listed on third-party platforms such as Airbnb and Booking.com, which act as the primary reservation systems.

At this stage of the platform:
- Element Rentals does **not** manage reservations directly.
- Third-party platforms expose availability data via iCalendar (iCal) feeds.
- These feeds provide **blocked date ranges only**, without guest, pricing, or payment information.

The system requires a reliable way to:
- Display accurate availability on the public website.
- Prevent inquiries for unavailable dates.
- Avoid introducing a premature Property Management System (PMS).

---

## Decision

The platform will implement an **External Calendar Synchronization** mechanism based on iCal feeds.

A new domain model, `CalendarBlock`, will be introduced to represent non-availability periods for a property.

Availability data will be:
- Imported automatically from external iCal feeds.
- Stored locally in the database.
- Treated as **read-only** in Phase 1.

No manual calendar editing UI will be provided in this phase.

---

## Model Definition

A `CalendarBlock` represents a continuous date range during which a property is unavailable.

Key characteristics:
- It does **not** represent a reservation.
- It does **not** contain pricing or guest information.
- It exists solely to block availability.

Conceptual fields:
- `id` (UUID)
- `property_id` (UUID)
- `start_date` (DATE)
- `end_date` (DATE)
- `source` (VARCHAR: airbnb, booking, owner, manual)
- `external_uid` (VARCHAR, optional)
- `reason` (TEXT, optional)
- `created_at` (TIMESTAMP)

---

## Synchronization Strategy

Availability synchronization will be handled by a background job.

For each property and source:
1. Fetch the remote iCal feed.
2. Parse all calendar events.
3. Remove existing `CalendarBlock` entries for that property and source.
4. Insert fresh blocks based on the current feed state.

This **replace-by-source** strategy avoids inconsistencies caused by unstable external identifiers.

---

## Frontend Implications

The frontend will:
- Treat availability as **read-only**.
- **Visual Calendar**: Display a monthly calendar on the Property Detail page showing blocked dates (synchronized from iCal).
- **Date Range Selection**: Allow users to select a desired check-in/check-out range.
- **Consultation Flow**: The "Inquire Now" button will open a specific form/modal where the selected dates are automatically attached to the `GuestLead`.
- **Date Filtering**: Allow filtering properties in the main catalog by available date ranges.
- **Communication**: Clearly state that availability is synchronized from external platforms.

---

## Rationale

This approach prioritizes:
- Architectural clarity
- MVP velocity
- Data correctness
- Future extensibility

It avoids prematurely introducing reservation logic while still delivering accurate availability to users.
