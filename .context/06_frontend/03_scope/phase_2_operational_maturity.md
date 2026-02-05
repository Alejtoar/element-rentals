# Phase 2 — Operational Maturity & Financial Control
Elemnt Rentals

## Goal
Provide owners and administrators with tools for financial control, property management, and professionalized guest interactions.

---

## UI/UX Enhancements

### 1. Admin Dashboard Expansion
- **Owners Management**: List, create, edit, and delete property owners.
- **Financial Input**: Forms to record income and expenses per property.
- **Report Generation**: Interface to trigger and download monthly PDF/Excel statements.

### 2. Guest Experience (Conversion Optimization)
- **Property Visual Calendar**: Interactive monthly view showing availability (synced from iCal).
- **Date Picking**: Integrated date range selection for inquiries.
- **"Inquire Now" Flow**: Modal-based form that captures specific stay dates and property context.
- **Image Optimization**: Masive implementation of `next/image` using the new backend resizing capabilities.

### 3. Internationalization (i18n)
- **Auto-Detection**: Detect browser language (`navigator.language`) and redirect to `/es` or `/en`.
- **Language Switcher**: Consistent UI element to toggle between languages.

### 4. Marketing & Analytics readiness
- **UTM Capture**: Logic to extract UTM parameters from the URL and store them in `sessionStorage` or `cookies` to ensure they are sent with lead forms even if the user navigates between pages.
- **Conversion Events**: Clean triggers for GTM / Meta Pixel (e.g., `onLeadSuccess`, `onWhatsAppClick`).
- **Dynamic Config**: Load social links (Instagram, Facebook) from the environment or a configuration endpoint.

---

## New Components Needed
- **CalendarView**: A mobile-friendly accessibility calendar.
- **FinancialTable**: For displaying income/expenses in the admin area.
- **OwnerForm**: CRUD component for owner management.
- **LanguageSwitcher**: A sleek, premium dropdown for i18n.

---

## Technical Considerations
- **Form Persistence**: Handle multi-step financial inputs.
- **Download Streams**: Correctly handle PDF/Excel binary downloads from the API.
- **State Management**: Ensure UTM context survives page reloads during a single session.
