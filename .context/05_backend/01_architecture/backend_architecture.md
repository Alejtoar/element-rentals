# Backend Architecture

> **Status:** Phase 2 (Operational Maturity) is implemented. This document originally described the
> Phase 1 landing page; the architectural *principles* below still hold, but the scope is now the full
> operating platform. Current scope: [phase_2_operational_maturity.md](../02_scope/phase_2_operational_maturity.md).
> Historical Phase 1 scope: [mvp_phase_1.md](../02_scope/mvp_phase_1.md).

This document defines the backend architecture and the rules every backend change must respect.

The backend is designed to be:
- Simple
- Secure
- Easily extensible
- Reusable for future phases

---

## Technology Stack

- Framework: FastAPI
- Language: Python
- ORM: SQLModel (SQLAlchemy under the hood)
- Migrations: Alembic
- Database:
  - **Production / Docker:** PostgreSQL (absolute requirement — see the Phase 2 scope).
  - **Local dev / tests:** SQLite (`dev.db`; in-memory DB for the test suite). Keep models portable
    across both.
- Authentication: JWT
- File Storage: `StorageProvider` abstraction — local disk in Phase 1 (`/uploads`), S3-compatible later.

---

## Responsibilities

The backend owns the full operating platform:
- Property, owner, and admin-user management (RBAC: Admin / Staff / Finance)
- Public property listing/detail for the website + lead capture (guest & owner leads)
- Guests, channels, and manual reservation + payment CRUD
- Financial module: income, expenses (deductible/prorated), owner settlements, statements, PDF/Excel export
- External calendar sync (iCal) and `CalendarBlock` availability
- Management contracts
- Authentication and authorization for admin users

---

## Core Modules

Each lives under `backend/app/<module>/` following the layered structure below:

`auth`, `users`, `owners`, `properties`, `reservations` (incl. channels, payments, charges),
`finance` (payment methods, expenses, reporting/settlements), `contracts`, `calendar`, `guests`,
`leads`, `media`, `notifications`, `utils`.

---

## API Exposure

All routes are versioned under `settings.API_V1_STR` (`/api/v1`). See
[../../03_api/endpoints.md](../../03_api/endpoints.md) for the full contract.

- Public endpoints (no auth — SEO / lead generation / browsing):
  - List properties (with filtering), property detail, guest & owner lead submission
- Private endpoints (JWT + RBAC):
  - Property/owner/user CRUD, image upload, activate/deactivate
  - Reservations, payments, channels, guests, expenses, financial reports, contracts, calendar sync

---

## Architectural Principles

- Clear separation of concerns
- No business logic in controllers
- Configuration-driven behavior
- Prepared for future RBAC expansion

---

## Internal Layered Architecture

The backend follows a layered architecture to ensure maintainability and correctness.

Each module (auth, properties, users, media) MUST be structured as:

module_name/
├── router.py        # FastAPI endpoints (transport layer)
├── schemas.py       # Pydantic request/response DTOs
├── service.py       # Business logic
├── repository.py   # Database access
├── models.py       # SQLAlchemy / SQLModel entities

---

## Dependency Flow (Strict)

The backend must respect this dependency direction:

API (router.py)
    ↓
Services (service.py)
    ↓
Domain Models (models.py)
    ↓
Repositories (repository.py)
    ↓
Database

Violations are not allowed:
- Routers may NOT access repositories directly
- Repositories may NOT contain business logic
- Services may NOT depend on FastAPI

---

## Business Logic Ownership

All business rules must live in Services.

Examples:
- Whether a property is "public"
- Whether a property can be deactivated
- Validation of status changes
- Visibility rules

These must NEVER be implemented in:
- Routers
- Repositories
- Frontend

---

## Data Transfer Objects (DTOs)

All API input and output must use Pydantic schemas.

Rules:
- Database models must never be returned directly
- API schemas define the contract with the frontend
- Internal fields (IDs, flags, timestamps) must be filtered here


---

## Environment Separation

The backend must support multiple environments:

- dev
- test
- prod

Environment selection is done via:
- ENV variable
- .env files (never committed)

Each environment must have:
- Its own database
- Its own credentials
- Its own secrets


---

## Configuration Ownership

All configuration must live in:

backend/app/config.py

Loaded from:
- OS environment variables
- .env files

Hardcoded secrets or URLs are forbidden.


---

## Testability Requirement

All Services and Repositories must be written so they can be tested without FastAPI.

This means:
- No direct dependency on Request or Response objects
- No global database sessions
- Dependencies must be injectable

---

### Media Module Abstraction
The `media/` module must implement a `StorageProvider` interface. 
- Phase 1: `LocalStorageProvider` (Saves to a local disk folder).
- Interface: Must have methods `upload_file(file, path)` and `get_url(file_id)`.
- The database (`PropertyImage`) will only store the result of `get_url()`.

---

## Agent Compliance

This architecture is mandatory.

The Backend Agent:
- Must follow this structure
- Must refuse tasks that require breaking it
- Must request clarification if domain rules are missing


## Dependency Management

All Python dependencies MUST be managed using a virtual environment.

Rules:
- The backend MUST use a local virtual environment located at:
  `backend/.venv`
- No Python package may be installed globally.
- No Python package may be installed outside the active `.venv`.

All dependencies MUST be declared in:
- `backend/requirements.txt` (human-maintained)
- `backend/requirements.lock.txt` (auto-generated, exact versions)

Installation flow:
1. Activate `.venv`
2. Install from `requirements.txt`
3. Regenerate `requirements.lock.txt`

The repository must never rely on implicit system or Anaconda packages.