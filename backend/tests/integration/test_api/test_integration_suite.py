
import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session
from app.users.service import UserService
from app.users.schemas import UserCreate
from app.auth.security import get_password_hash
from app.config import settings

def test_admin_seeding_logic(session: Session):
    user_service = UserService(session)
    user_service.create_admin_if_not_exists()
    admin = user_service.get_user_by_email(settings.FIRST_ADMIN_EMAIL)
    assert admin is not None
    assert admin.role == "admin"

def test_public_properties_endpoint(client: TestClient):
    response = client.get("/api/v1/properties/public")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_lead_submission(client: TestClient):
    # Guest Lead
    guest_payload = {
        "name": "QA Guest",
        "phone": "+123456789",
        "message": "QA Test Message",
        "desired_dates": "Next week"
    }
    response = client.post("/api/v1/leads/guest", json=guest_payload)
    assert response.status_code == 200
    assert "id" in response.json()

    # Owner Lead
    owner_payload = {
        "name": "QA Owner",
        "phone": "+987654321",
        "location": "QA City",
        "message": "I have a big house"
    }
    response = client.post("/api/v1/leads/owner", json=owner_payload)
    assert response.status_code == 200
    assert "id" in response.json()

def test_rbac_reservations(client: TestClient, session: Session):
    # 1. Setup Users
    user_service = UserService(session)
    # Staff
    staff = user_service.create_user(UserCreate(
        email="staff_test@example.com",
        password="password123",
        role="staff",
        is_active=True
    ))
    # Finance
    finance = user_service.create_user(UserCreate(
        email="finance_test@example.com",
        password="password123",
        role="finance",
        is_active=True
    ))

    # Get Tokens
    def get_token(email):
        resp = client.post("/api/v1/auth/login", data={"username": email, "password": "password123"})
        if resp.status_code != 200:
            print(f"DEBUG: Login Failed for {email}: {resp.status_code} {resp.text}")
        return resp.json()["access_token"]

    staff_token = get_token("staff_test@example.com")
    finance_token = get_token("finance_test@example.com")

    # 2. Test Access
    # Create Property (Staff OK)
    # We need an owner first
    owner_resp = client.post("/api/v1/owners/", json={
        "full_name": "Test Owner",
        "email": "owner@test.com",
        "phone": "+111"
    }, headers={"Authorization": f"Bearer {staff_token}"})
    if owner_resp.status_code != 200:
        print(f"DEBUG: Owner Resp: {owner_resp.status_code} {owner_resp.text}")
    owner_id = owner_resp.json()["id"]

    prop_resp = client.post("/api/v1/properties/", json={
        "name": "Test Prop",
        "nightly_price": 100,
        "address": "Addr",
        "city": "City",
        "country": "Country",
        "max_guests": 2,
        "active": True,
        "owner_id": owner_id
    }, headers={"Authorization": f"Bearer {staff_token}"})
    assert prop_resp.status_code == 200
    prop_id = prop_resp.json()["id"]

    # Create Reservation (Staff OK, Finance 403)
    res_payload = {
        "property_id": prop_id,
        "start_date": "2026-05-01",
        "end_date": "2026-05-10",
        "guest_count": 2,
        "total_amount": 1000,
        "status": "pending"
    }
    
    # Finance Create -> 403
    res_resp = client.post("/api/v1/reservations/", json=res_payload, headers={"Authorization": f"Bearer {finance_token}"})
    assert res_resp.status_code == 403

    # Staff Create -> 201
    res_resp = client.post("/api/v1/reservations/", json=res_payload, headers={"Authorization": f"Bearer {staff_token}"})
    assert res_resp.status_code == 201
    res_id = res_resp.json()["id"]

    # Finance Update -> 403
    res_resp = client.patch(f"/api/v1/reservations/{res_id}", json={"total_amount": 2000}, headers={"Authorization": f"Bearer {finance_token}"})
    assert res_resp.status_code == 403
