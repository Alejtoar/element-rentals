# UI Components — Elemnt Rentals (MVP Phase 1)

This document defines all reusable UI components used across the website.
Pages must be built only using these components.

This ensures consistency, speed, and compatibility with AI-generated UI.

---

## 1. Layout Components

### AppLayout
Wraps all pages.
Includes:
- Header
- Footer
- Language selector

---

### Header
Contains:
- Logo
- Navigation links
- Language switch (EN / ES)
- WhatsApp contact button

---

### Footer
Contains:
- Company info
- WhatsApp link
- Social media
- Legal links

---

## 2. Navigation Components

### MainMenu
Links to:
- Home
- Properties
- Owners
- Contact (WhatsApp)

---

### LanguageSwitcher
Allows changing between:
- English
- Spanish

Must change URL (/en or /es).

---

## 3. Property Components

### PropertyCard
Used in listings.

Displays:
- Main image
- Property name
- Location
- Price per night
- "View" button

---

### PropertyGallery
Image carousel for property detail.

---

### PropertyDetails
Displays:
- Description
- Amenities
- Location
- Price

---

### PropertyCTA
Contains:
- "Book via WhatsApp"
- "Ask about this property"

Buttons must use backend-generated WhatsApp links.

---

## 4. Lead & CTA Components

### WhatsAppButton
Reusable button that:
- Receives a WhatsApp link
- Opens chat with pre-filled message

---

### OwnerPartnerCTA
Block explaining:
- Benefits
- Commission
- Button → "List my property"

---

## 5. Admin Components

### LoginForm
Fields:
- Email
- Password

---

### PropertyForm
For creating/editing properties:
- Title
- Description
- Location
- Price
- Images
- Owner

---

### PropertyTable
Lists all properties for admin:
- Edit
- Publish / unpublish

---

## 6. System Components

### LoadingSpinner
Used while loading data.

---

### ErrorMessage
Used for:
- API errors
- Validation errors

---

## Component Rules

- No component may contain hardcoded text.
- All labels and messages must use i18n keys.
- All data must come from backend API.
