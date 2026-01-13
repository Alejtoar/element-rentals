# Synchronization Rules

## Source of Truth
- The internal system is the source of truth for:
  - Financial data
  - Owner reporting
  - Operational expenses
- External platforms are sources of reservation events only.

## Reservation Sync
- External reservations are imported as read-only for core data
  (dates, guests, pricing).
- Financial adjustments and charges are handled internally.

## Availability Sync
- Availability changes from any channel must propagate to all others.
- Manual blocks must be respected across all platforms.

## Conflict Handling
- In case of conflict:
  - The earliest confirmed reservation prevails.
  - Conflicts must be logged for manual review.

## Manual Reservations
- Admin-created reservations bypass external sync.
- They still block availability and follow the same payment rules.
