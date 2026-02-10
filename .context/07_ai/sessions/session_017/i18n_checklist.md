# Admin Module Internationalization Checklist

## Status: 🚧 IN PROGRESS

### Modules to Internationalize:

1. ✅ **Layout** (`admin/layout.tsx`) - DONE
   - Sidebar navigation
   - Portal title
   - Logout button
   - Language switcher

2. ✅ **Settings** (`admin/settings/page.tsx`) - DONE
   - Profile section
   - Password change form
   - Quick links to financial settings

3. ✅ **Financial Settings** (`admin/settings/financial/page.tsx`) - DONE
   - Payment methods CRUD
   - All labels and buttons

4. ⏳ **Properties** (`admin/properties/page.tsx`) - IN PROGRESS
   - Page title and description
   - Filter buttons
   - Table headers
   - Action buttons
   - Status labels
   - Confirmation dialogs

5. ⏳ **Reservations** (`admin/reservations/page.tsx`) - PENDING
   - Page title
   - Table headers
   - Status labels
   - Filter options

6. ⏳ **Reservation Details** (`admin/reservations/[id]/page.tsx`) - PENDING
   - Section titles
   - Field labels
   - Quick actions

7. ⏳ **Guests** (`admin/guests/page.tsx`) - PENDING
   - Page title
   - Table headers
   - Form labels

8. ⏳ **Channels** (`admin/channels/page.tsx`) - PENDING
   - Page title
   - Table headers
   - Form labels

9. ⏳ **Owners** (`admin/owners/page.tsx`) - PENDING
   - Page title
   - Table headers
   - Form labels

10. ⏳ **Leads** (`admin/leads/page.tsx`) - PENDING
    - Page title
    - Tab navigation
    - Table headers

11. ⏳ **Users** (`admin/users/page.tsx`) - PENDING
    - Page title
    - Table headers
    - Form labels
    - Role labels

12. ⏳ **Login** (`admin/login/page.tsx`) - PENDING
    - Form labels
    - Error messages
    - Submit button

## Implementation Notes:

- All modules need to import `getDictionary` and `Locale`
- Add `params: Promise<{ lang: string }>` to page props
- Load dictionary in useEffect
- Replace all hardcoded strings with `dict.admin.*` references
- Ensure loading state while dictionary loads

## Priority Order:

1. High Priority: Properties, Reservations, Reservation Details
2. Medium Priority: Guests, Channels, Owners, Users
3. Low Priority: Leads, Login
