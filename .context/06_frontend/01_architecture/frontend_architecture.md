# Frontend Architecture – Phase 1

This document defines the frontend architecture for the initial phase.

The frontend is focused on:
- Public property presentation
- Lead generation
- Simple administration

---

## Technology Stack

- Framework: React (SPA)
- Build Tool: Vite or Create React App
- Language: TypeScript
- Styling: Tailwind CSS
- UI Components: Template-based (admin + marketing)

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

## Non-Goals (Phase 1)

- No booking flows
- No payments
- No dashboards or analytics
- No user self-registration

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


---


## Authentication Handling

The frontend must:
- Store JWT in memory or secure storage
- Never expose tokens in URLs
- Redirect unauthorized users to login


---

## Agent Compliance

The Frontend Agent must:

- Follow this architecture
- Reject tasks that violate layer separation
- Never invent API fields
- Only use endpoints defined in ../03_api/
