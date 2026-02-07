
import pytest
from uuid import uuid4
from decimal import Decimal
from fastapi.testclient import TestClient
from sqlmodel import Session, select
from app.api.deps import get_current_user
from app.core.security import get_password_hash
from app.users.models import User
from app.reservations.models import Reservation, Payment
from app.auth.security import create_access_token

# --- Fixtures ---
@pytest.fixture
def admin_token(client: TestClient, session: Session):
    email = f"admin_{uuid4()}@test.com"
    password = "adminpass"
    user = User(
        email=email,
        hashed_password=get_password_hash(password),
        full_name="Admin Test",
        role="admin",
        is_active=True
    )
    session.add(user)
    session.commit()
    
    # Login to get token
    response = client.post("/api/v1/auth/login", data={"username": email, "password": password})
    assert response.status_code == 200
    token = response.json()["access_token"]
    return token

@pytest.fixture
def staff_headers(client: TestClient, session: Session):
    email = f"staff_{uuid4()}@test.com"
    password = "staffpass"
    user = User(
        email=email,
        hashed_password=get_password_hash(password),
        full_name="Staff Test",
        role="staff",
        is_active=True
    )
    session.add(user)
    session.commit()
    
    response = client.post("/api/v1/auth/login", data={"username": email, "password": password})
    assert response.status_code == 200
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


# --- Tests ---

def test_marketing_attribution_utm(client: TestClient, session: Session):
    """
    Validation: Verify UTM parameters are correctly stored when submitting a lead.
    """
    payload = {
        "name": "UTM Test Guest",
        "phone": "555-UTM-TEST",
        "message": "Testing UTM persistence",
        "source": "api_test",
        "utm_source": "google_ads",
        "utm_medium": "cpc",
        "utm_campaign": "summer_sale_2026",
        "utm_term": "luxury rentals",
        "utm_content": "banner_v1"
    }
    
    # Submit Lead
    response = client.post("/api/v1/leads/guest", json=payload)
    assert response.status_code == 200
    data = response.json()
    
    # Verify Response Data
    assert data["utm_source"] == "google_ads"
    assert data["utm_campaign"] == "summer_sale_2026"
    
    # Verify DB Persistence (Double Check)
    # Assuming we can inspect via DB session directly if endpoints return different models
    from app.leads.models import GuestLead
    lead = session.get(GuestLead, data["id"])
    assert lead is not None
    assert lead.utm_medium == "cpc"

def test_operational_e2e_flow(client: TestClient, session: Session, admin_headers):
    """
    Validation: Full Operational CRUD - Property -> Guest -> Channel -> Reservation -> Payment.
    """
    # 1. Create Owner
    owner_payload = {"full_name": "Op Owner", "email": "op@owner.com", "phone": "123"}
    resp = client.post("/api/v1/owners/", json=owner_payload, headers=admin_headers)
    assert resp.status_code == 201
    owner_id = resp.json()["id"]

    # 2. Create Property
    prop_payload = {
        "owner_id": owner_id,
        "name": "Op Property",
        "city": "Medellin",
        "country": "Colombia", # Ensuring new field is present
        "nightly_price": 200.0,
        "max_guests": 6,
        "address": "Calle 10 # 5-50",
        "slug": f"op-prop-{uuid4()}"
    }
    resp = client.post("/api/v1/properties/", json=prop_payload, headers=admin_headers)
    assert resp.status_code == 201
    prop_id = resp.json()["id"]

    # 3. Create Guest
    guest_payload = {"full_name": "Op Guest", "email": "guest@op.com", "phone": "555-0101"}
    resp = client.post("/api/v1/guests/", json=guest_payload, headers=admin_headers)
    assert resp.status_code == 201
    guest_id = resp.json()["id"]

    # 4. Create Channel
    chan_payload = {"name": "Direct Booking", "external": False}
    resp = client.post("/api/v1/channels/", json=chan_payload, headers=admin_headers)
    # Handle if channel exists (name unique constraint might apply depending on implementation)
    if resp.status_code == 409:
        # Fetch existing - for simplicity assume list returns it
        channels = client.get("/api/v1/channels/", headers=admin_headers).json()
        chan_id = channels[0]["id"]
    else:
        assert resp.status_code == 201
        chan_id = resp.json()["id"]

    # 5. Create Reservation
    # New logic: Auto-creates 50% deposit
    total_amount = 1000.00
    res_payload = {
        "property_id": prop_id,
        "guest_id": guest_id,
        "channel_id": chan_id,
        "reservation_type": "commercial",
        "start_date": "2026-06-01",
        "end_date": "2026-06-05",
        "guest_count": 2,
        "total_amount": total_amount,
        "status": "confirmed"
    }
    resp = client.post("/api/v1/reservations/", json=res_payload, headers=admin_headers)
    assert resp.status_code == 201
    res_data = resp.json()
    res_id = res_data["id"]

    # Verify Auto-Deposit (Business Rule 1.1)
    # Check payments attached to reservation
    resp = client.get(f"/api/v1/reservations/{res_id}/payments", headers=admin_headers)
    assert resp.status_code == 200
    payments = resp.json()
    
    assert len(payments) >= 1
    deposit = next((p for p in payments if p["payment_type"] == "deposit"), None)
    assert deposit is not None
    assert float(deposit["amount"]) == 500.0 # 50% of 1000
    assert deposit["status"] == "pending"

    # 6. Add Balance Payment
    pay_payload = {
        "reservation_id": res_id,
        "amount": 500.00,
        "payment_type": "balance",
        "provider": "Stripe",
        "beneficiary": "company",
        "percentage_applied": 50.00,
        "status": "paid" # Mark as paid immediately
    }
    resp = client.post("/api/v1/payments/", json=pay_payload, headers=admin_headers)
    assert resp.status_code == 201
    
    # 7. Verify Total Paid Logic (if implemented in service)
    # We can inspect payments again
    resp = client.get(f"/api/v1/reservations/{res_id}/payments", headers=admin_headers)
    payments = resp.json()
    total_paid = sum(float(p["amount"]) for p in payments if p["status"] == "paid")
    assert total_paid == 500.0


def test_rbac_security(client: TestClient, session: Session, staff_headers):
    """
    Validation: Verify Role-Based Access Control invariants.
    Staff should NOT be able to list Users (Admin only).
    """
    # Attempt to list users
    resp = client.get("/api/v1/users/", headers=staff_headers)
    
    # Expect 403 Forbidden
    assert resp.status_code == 403
