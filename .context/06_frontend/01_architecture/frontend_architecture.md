# Frontend Architecture

> **Status:** Phase 2 implemented. The frontend now includes a full admin portal (reservations,
> finance, owners, channels, calendar sync, contracts) in addition to the public marketing site.
> Current scope: [../03_scope/phase_2_operational_maturity.md](../03_scope/phase_2_operational_maturity.md).

This document defines the frontend architecture and the rules every frontend change must respect.

The frontend covers:
- Public property presentation
- Lead generation
- Operational administration (admin portal)

---

## Technology Stack

- Framework: **Next.js 16 (App Router)** — see [ADR 009](../../99_decisions/009_nextjs_app_router.md).
- Library: React 19
- Language: TypeScript
- Styling: **Tailwind CSS v4** — see [ADR 010](../../99_decisions/010_tailwind_v4.md).
- Routing: file-based under `src/app/[lang]/` (language-prefixed). Public site at root; admin under
  `[lang]/admin/`.
- UI Components: brand design system (see [design_specification.md](../02_ui/design_specification.md)).

---

## Public Website

Includes:
- Home page
- Property listing
- Property detail page
- Owner partnership section
- WhatsApp contact buttons

---

## Admin Interface

Includes:
- Login
- Property management
- Image upload
- Activation / deactivation

---

## Data Flow

- Public pages consume public backend endpoints
- Admin interface consumes protected endpoints
- No direct database access from frontend

---

## Non-Goals

- No public self-service booking/checkout flow (reservations are created by staff in the admin portal)
- No in-app payment processing (payments are *recorded*, not charged)
- No public user self-registration (admin users are managed internally)

---

## Architectural Pattern

The frontend follows a strict component-based and layered architecture.

Layers:

UI Components (pure)
    ↓
Feature Components
    ↓
Pages
    ↓
API Clients
    ↓
Backend

---

## Separation of Responsibilities

Each layer has a single purpose:

### UI Components
- Buttons, inputs, cards
- No business logic
- No API calls
- No translations

### Feature Components
- Combine UI components
- Handle user interaction
- Use hooks
- No direct fetch calls

### Pages
- Control routing
- Load data
- Connect features to backend

### API Clients
- Only place where HTTP is allowed
- All backend calls must go through here


---

## API Communication Rules

The frontend must never:
- Call fetch() directly inside components
- Build URLs inline
- Assume backend structures

All backend communication must go through:

frontend/src/api/


---

## Internationalization (i18n)

The frontend must support:
- English (en)
- Spanish (es)

Rules:
- No hardcoded user-facing text
- All strings come from translation files
- URLs must include language prefix (/en or /es)


---

## State Management

The frontend must use:

- React Context or lightweight store (Zustand or similar)
- No global variables
- No data stored in localStorage unless explicitly allowed


---

## Authentication Handling

The frontend must:
- Store JWT in memory or secure storage
- Never expose tokens in URLs
- Redirect unauthorized users to login
- Consume the backend through `NEXT_PUBLIC_API_URL` only; never hardcode API versions in components


---

## Agent Compliance

The Frontend Agent must:

- Follow this architecture
- Reject tasks that violate layer separation
- Never invent API fields
- Only use endpoints defined in ../03_api/
