"""
Integration tests for Session 009: API Validation

Covers:
- Form validation edge cases
- API Error handling (422 Unprocessable Entity)
"""

import requests

BASE_URL = "http://localhost:8000/api/v1"

def get_token():
    response = requests.post(
        f"{BASE_URL}/auth/login",
        data={"username": "admin@local.dev", "password": "admin123"}
    )
    response.raise_for_status()
    return response.json()["access_token"]

def test_missing_required_fields():
    """Test that missing required fields return 422"""
    token = get_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    # Missing required field (name)
    payload = {
        "owner_id": "a5332542-a18b-4131-ad91-cbe6e32390d2",
        "nightly_price": 100,
        "address": "Addr",
        "city": "City",
        "country": "Country",
        "max_guests": 2
    }
    response = requests.post(f"{BASE_URL}/properties", json=payload, headers=headers)
    assert response.status_code == 422
    return True

def test_invalid_data_types():
    """Test that invalid data types return 422"""
    token = get_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    payload = {
        "owner_id": "a5332542-a18b-4131-ad91-cbe6e32390d2",
        "name": "Validation Test",
        "nightly_price": "not-a-number",
        "address": "Addr",
        "city": "City",
        "country": "Country",
        "max_guests": 2
    }
    response = requests.post(f"{BASE_URL}/properties", json=payload, headers=headers)
    assert response.status_code == 422
    
    # Invalid UUID
    payload["nightly_price"] = 100
    payload["owner_id"] = "not-a-uuid"
    response = requests.post(f"{BASE_URL}/properties", json=payload, headers=headers)
    assert response.status_code == 422
    return True

if __name__ == "__main__":
    print("Running API Validation Tests...\n")
    
    try:
        print("Test 1: Missing Required Fields")
        test_missing_required_fields()
        print("✅ PASS: Correctly rejected missing fields with 422\n")
    except AssertionError as e:
        print(f"❌ FAIL: {e}\n")
    
    try:
        print("Test 2: Invalid Data Types")
        test_invalid_data_types()
        print("✅ PASS: Correctly rejected invalid types with 422\n")
    except AssertionError as e:
        print(f"❌ FAIL: {e}\n")
