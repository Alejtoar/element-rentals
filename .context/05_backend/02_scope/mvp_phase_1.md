# MVP Phase 1 — Backend Scope
Elemnt Rentals

## Goal
Provide a minimal but production-grade backend that supports:
- Property listings
- Lead capture via WhatsApp
- Owner partner onboarding
- Reservation & payment foundations
- Channel manager readiness

This MVP does NOT aim to fully replace Airbnb/Booking yet. It prepares the data and integrations for that future.

---

## Core Capabilities

### 1. Property Management
The backend must support:
- Creating properties
- Editing property details
- Publishing/unpublishing properties
- Uploading and storing:
  - Title
  - Description
  - Location
  - Images
  - Nightly price
  - Owner partner

No availability calendar is required in Phase 1.

---

### 2. Owner Partner Leads
The system must:
- Store incoming owner partner leads
- Capture:
  - Name
  - Phone
  - Property location
  - Message
  - Source (website, WhatsApp, referral)

These leads will be triggered from frontend CTA buttons.

---

### 3. Guest Leads
The system must:
- Capture guest inquiries:
  - Property
  - Name
  - Phone
  - Desired dates
  - Message
  - Channel (WhatsApp, Web)

No booking logic yet. This is lead capture only.

---

### 4. Financial & Reservation Foundations
The backend must already support:
- Reservations table
- Payments table
- Charges table (penalties, damages, extras)

Even if not exposed in UI yet, this data model must exist.

---

### 5. WhatsApp Integration (Phase 1)
The backend must:
- Generate WhatsApp deeplinks
- Attach:
  - Property ID
  - Lead type (guest / owner)
  - Source tracking

No chatbot yet.

---

### 6. Security & Roles
The backend must implement:
- Admin user login
- Roles:
  - Admin
  - Finance
- Access control for:
  - Property creation
  - Lead viewing

---

### 7. API
Expose endpoints for:
- Public property listing
- Property detail
- Guest lead submission
- Owner partner lead submission
- Admin authentication
- Admin property management

---

## 8. Technical Additions & Refinements (Phase 1)

### A. Image Management (Normalized & Abstracted)
- **Requirement:** Implementation of the `PropertyImage` entity.
- **Details:** - The system must support multiple images per property.
    - Implement a "Storage Provider" abstraction. Initial development will use **Local File Storage**, but the architecture must be ready to swap to **AWS S3/Cloudinary** via environment variables.
    - Validation: Ensure only one image is marked as `is_main` per property.
    - Storing: Only the relative or absolute URL/Path is stored in PostgreSQL.

### B. Lead Metadata & Traceability
- **Requirement:** Capture context for every inquiry.
- **Details:**
    - When an Owner or Guest lead is created, the backend must automatically capture: `IP Address`, `User-Agent`, and `Referrer URL`.
    - **Notification Trigger:** Upon successful lead creation, the system must generate an internal log or a simple Email/Slack notification (mocked or via SMTP) to alert the operations team.

### C. Financial & Pricing Foundations
- **Requirement:** Base data for property listings.

### D. API Robustness
- **Requirement:** Advanced Filtering for Public Endpoints.
- **Details:**
    - The `/properties` public endpoint must support basic filtering by: `city`, `max_guests`, and `active` status.
    - Include a "featured" flag or sort order for the Landing Page display.

---

## Explicitly Excluded
Not included in Phase 1:
- Live availability syncing
- Payment processing
- Channel manager sync
- Owner dashboards
- Financial reporting

---

## Authentication Scope (Phase 1)

Authentication is enforced only on protected admin endpoints.

Public endpoints must remain accessible without authentication to support:
- SEO
- Lead generation
- Guest browsing