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