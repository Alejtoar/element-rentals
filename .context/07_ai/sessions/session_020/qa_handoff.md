# Session 020 QA Validation - Handoff

## Scope: Availability Search, iCal Sync & User Experience

### 1. Catalog Availability Search
- **Test Case:** Select a date range on the Hero section (Home).
- **Test Case:** Verify that properties with an overlapping reservation or `CalendarBlock` in that range are hidden.
- **Test Case:** Verify that properties without blocks in that range are shown correctly.
- **Test Case:** Test "Clear Dates" button and verify the catalog returns to its default state.

### 2. Property Detail Calendar
- **Test Case:** Compare the red (booked) dates in the calendar widget with the data in the database (Reservations + Blocks).
- **Test Case:** Check month navigation (next/prev).
- **Test Case:** Verify responsive layout of the calendar on mobile vs desktop.

### 3. Admin iCal Management
- **Test Case:** "Copy URL" button in the Sync tab. Verify the copied link is correct and matches the domain.
- **Test Case:** Add a valid .ics URL (can use a dummy ics from the web or a local test file).
- **Test Case:** Trigger "Sync All" and check for the success/error toast notifications.
- **Test Case:** Delete a calendar and ensure it disappears from the list.

### 4. Admin Reservations Filter
- **Test Case:** Filter reservations by a date range that overlaps existing bookings.
- **Test Case:** Verify the overlap logic (a reservation starting before and ending after the filter range should still show up).

### 5. Production Hardening (Sanity Check)
- **Test Case:** Check Footer social links. They should point to the values set in the environment, not "#".
- **Test Case:** Verify images load correctly without `unoptimized` flag (check Network tab for smaller, optimized WebP versions).

### Key Files/Modules to Validate:
- `src/components/features/Hero.tsx`
- `src/components/features/AvailabilityCalendar.tsx`
- `src/app/[lang]/admin/properties/[id]/sync/page.tsx`
- `backend/app/properties/repository.py` (Overlap SQL logic)
