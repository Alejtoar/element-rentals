# Phase 2 — Operational Maturity & Financial Control
Elemnt Rentals

## Goal
Transition from a lead-generation landing page to a functional operating platform for owner-partners, including financial traceability and automated availability.

---

## Core Capabilities

### 1. Advanced Property, Owner & User Management
- **Owner CRUD**: Full interface for managing owner profiles (Name, Phone, Email, Bank Details).
- **User Management**: 
  - Admin interface to Create/Edit/List system users.
  - Role-based access control (Admin, Staff, Finance).
  - Password Reset Logic: Admin can reset user passwords; users can change their own.
- **Property-Owner Linking**: Ability to reassign properties to different owners via UI.
- **Image Optimization**: Support for dynamic image resizing (serving different resolutions via API/CDN filters).

### 2. Reservation & Payment CRUD (Manual Operation)
- **Guest Management**: CRUD for Guests (Names, Phone, Identity Documents).
- **Channel Management**: Management of booking sources (Direct, Airbnb, Booking, etc.).
- **Reservation CRUD**: Create and manage manual reservations (Link to Property, Guest, and Channel).
- **Payment Tracking**: 
  - Record payments (Stripe, Transfer, Cash) linked to reservations.
  - Support for partial payments and deposits.

### 3. Financial Module (Phase 2 Focus)
- **Income Tracking**: Automate calculation of Gross Income from confirmed payments.
- **Expense Management**:
  - Record operational expenses (cleaning, maintenance, supplies).
  - Categorize expenses as deductible/non-deductible.
  - Prorate shared expenses across multiple properties.
- **Owner Settlements**:
  - Automatic calculation of the 80/20 split after deductions.
  - Generation of monthly Financial Statements (Immutable records).
- **Reporting & Exports**:
  - Export monthly statements to **PDF** (Professional invoices).
  - Export financial data to **Excel** for internal accounting.

### 3. Automated Availability (iCal Sync)
- **Background Jobs**: Periodic synchronization with external iCal feeds (Airbnb, Booking).
- **Conflict Management**: Prevent internal inquiries for dates blocked on external platforms.
- **Calendar API**: Expose `CalendarBlock` data to the frontend.

### 4. Professional Marketing & Traceability
- **UTM Persistence**: Save `utm_source`, `utm_medium`, `utm_campaign`, etc., for every lead.
- **Email Notifications**: Format lead webhooks as professional emails sent to the operation team's inbox.
- **Dynamic Settings**: Move social media links and company contact info to environment variables or a global settings table.

### 5. Multi-Language Automation
- **i18n Detection**: API support for language-aware message templates.
- **Localization**: Full support for English/Spanish across all financial documents and customer emails.

---

## Technical Requirements
- **PostgreSQL**: Absolute requirement for production.
- **Background Worker**: Implementation of a task queue (e.g., Celery, Taskiq, or Arq) for iCal sync and PDF generation.
- **Storage**: Persistent Volumes for image storage and generated reports.
- **SMTP Integration**: For sending lead alerts to email.
