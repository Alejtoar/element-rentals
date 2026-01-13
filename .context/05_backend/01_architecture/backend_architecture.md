# Backend Architecture – Phase 1

This document defines the backend architecture for the initial phase
(Landing Page + Basic Property Management).

The backend is designed to be:
- Simple
- Secure
- Easily extensible
- Reusable for future phases

---

## Technology Stack

- Framework: FastAPI
- Language: Python
- Database: PostgreSQL
- ORM: SQLAlchemy / SQLModel
- Authentication: JWT (basic)
- File Storage: Object storage (S3-compatible)

---

## Responsibilities (Phase 1)

The backend is responsible for:
- Managing property data
- Serving public property information to the website
- Providing a minimal admin API
- Handling authentication for admin users

---

## Core Modules

- auth
- properties
- media (images)
- users (admin only)

---

## API Exposure

- Public endpoints:
  - List properties
  - Get property details
- Private endpoints:
  - Create / update properties
  - Upload images
  - Activate / deactivate properties

---

## Non-Goals (Phase 1)

The backend will NOT handle:
- Reservations
- Payments
- Financial reporting
- External integrations
- Owner portals

These will be implemented in future phases.

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