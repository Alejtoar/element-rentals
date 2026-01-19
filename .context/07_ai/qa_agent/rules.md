# QA Rules — Test Organization & Structure
Elemnt Rentals

This document defines mandatory rules for how tests must be organized and maintained.

These rules apply to **all QA work** for both Backend and Frontend.

---

## 1. Mandatory Test Directories

All automated tests MUST be placed in dedicated test folders.

### Backend Tests

backend/
└── tests/
├── unit/
│ ├── test_models/
│ ├── test_services/
│ ├── test_repositories/
│ └── test_utils/
├── integration/
│ ├── test_api/
│ └── test_db/
└── conftest.py

### Frontend Tests

frontend/
└── tests/
├── unit/
│ ├── components/
│ ├── hooks/
│ └── utils/
├── integration/
│ └── pages/
└── e2e/

No test files may exist outside these folders.

---

## 2. Naming Conventions

- Test files MUST start with `test_`
- Test classes MUST describe the unit under test
- Test functions MUST describe behavior, not implementation

### Examples

test_property_creation.py
test_payment_percentage_applied.py
test_whatsapp_link_generation.py

❌ Forbidden:
- `tests.py`
- `property_test_final.py`
- `temp_test.py`

---

## 3. Test Scope Separation

The QA Agent MUST respect test scope:

### Unit Tests
- Test one function or class
- No network calls
- No real database
- Use mocks or fixtures

### Integration Tests
- Test interaction between components
- May use test database
- May use FastAPI test client

### End-to-End Tests (Frontend)
- Test user flows
- Use test environment only
- Never run against production

---

## 4. Traceability to Context

Every test suite MUST be traceable to context documents.

Each test file MUST include a header comment referencing:
- Domain rule
- API endpoint
- ADR (if applicable)

### Example
```python
"""
Covers:
- Business Rule: Booking & Payments — Confirmation Deposit
- API: POST /reservations/{id}/confirm
- ADR: ADR_002_database_strategy
"""
```

---

## 5. Forbidden Practices

The QA Agent MUST NOT:

* Add tests without a defined rule or requirement

* Write tests based on assumptions

* Test features marked as "Non-Goals" for the current phase

* Modify production code to "make tests pass"

If a test reveals a design issue, it must be reported — not silently fixed.

---

# QA Agent – Runtime & Environment Rules

## Server Lifecycle Management

The QA Agent is allowed to start local development servers **only for testing purposes** and must strictly follow the rules below.

### 1. Pre-Execution Verification (Mandatory)

Before starting any backend or frontend server, the QA Agent MUST:

- Verify whether the service is already running by:
  - Checking common ports (e.g. 8000, 8001, 3000, 5173)
  - Or explicitly asking the user to confirm
- NEVER assume a server is running or stopped

If a server is already running:
- The QA Agent MUST NOT start a new instance, if it's necessary to stop the server, the QA Agent MUST ask the user to do it
- The QA Agent MUST reuse the existing running service for testing if it's possible.

---

### 2. Explicit Authorization Requirement

The QA Agent MUST:

- Request explicit user authorization before starting any server
- Clearly state:
  - Which service will be started (backend / frontend)
  - Which command will be used
  - Which port will be bound
  - Whether a virtual environment will be activated

Example:
> "I need to start the backend locally using Uvicorn on port 8000 inside the existing virtual environment. Do you approve?"

---

### 3. Environment Safety Rules

- All Python-related commands MUST be executed inside the active virtual environment (`.venv`)
- Dependency installation is NOT allowed unless explicitly authorized
- The QA Agent MUST NOT modify environment variables or `.env` files unless explicitly authorized, better tell to user to do it

---

### 4. Post-Test Cleanup (Mandatory)

After completing testing tasks, the QA Agent MUST:

- Explicitly instruct the user to stop the running server
- OR clearly indicate which process should be terminated
- Confirm that no background services are expected to remain running

The QA Agent MUST NOT leave services running implicitly.

---

### 5. Reporting Obligations

The QA Agent MUST report:

- Whether a server was reused or started
- Which ports were used
- Whether the environment was left clean after testing

Example:
> "Backend server on port 8000 was started for testing and should now be stopped. No other services were affected."
