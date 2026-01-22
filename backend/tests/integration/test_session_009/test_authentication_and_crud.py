"""
Integration tests for Session 009: Authentication and Property CRUD

Covers:
- Business Rule: Staff CRUD Validation
- API: POST /api/v1/auth/login
- API: GET /api/v1/auth/me
- API: GET /api/v1/properties (protected)
- API: POST /api/v1/properties (protected)
- ADR: ADR_013_granular_rbac_alignment
- ADR: ADR_016_property_slugs

Tests verify that staff users can authenticate and perform CRUD operations
on properties, with automatic slug generation.
"""

import requests

BASE_URL = "http://localhost:8000/api/v1"


def test_admin_login():
    """Test that admin user can obtain JWT token"""
    login_data = {
        "username": "admin@local.dev",
        "password": "admin123"
    }
    response = requests.post(
        f"{BASE_URL}/auth/login",
        data=login_data
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "token_type" in data
    assert data["token_type"] == "bearer"
    return data["access_token"]


def test_get_current_user():
    """Test that authenticated user can access /auth/me"""
    token = test_admin_login()
    headers = {"Authorization": f"Bearer {token}"}
    
    response = requests.get(f"{BASE_URL}/auth/me", headers=headers)
    assert response.status_code == 200
    
    user = response.json()
    assert user["email"] == "admin@local.dev"
    assert user["role"] == "admin"
    assert user["is_active"] is True
    assert "full_name" in user


def test_get_protected_properties():
    """Test that staff user can read properties via protected endpoint"""
    token = test_admin_login()
    headers = {"Authorization": f"Bearer {token}"}
    
    response = requests.get(f"{BASE_URL}/properties", headers=headers)
    assert response.status_code == 200
    
    properties = response.json()
    assert isinstance(properties, list)
    assert len(properties) > 0
    
    # Verify properties have slugs
    for prop in properties:
        assert "slug" in prop
        assert prop["slug"] is not None


def test_create_property():
    """
    Test that staff user can create a property with auto-generated slug
    """
    token = test_admin_login()
    headers = {"Authorization": f"Bearer {token}"}
    
    property_data = {
        "owner_id": "a5332542-a18b-4131-ad91-cbe6e32390d2",
        "name": f"Integration Test Property {uuid.uuid4().hex[:6]}",
        "nightly_price": 300.00,
        "address": "Test Address 789",
        "city": "Playa del Carmen",
        "country": "Mexico",
        "max_guests": 8,
        "active": True,
        "featured": False
    }
    
    response = requests.post(
        f"{BASE_URL}/properties",
        json=property_data,
        headers=headers
    )
    
    assert response.status_code == 200, f"Property creation failed: {response.text}"
    created = response.json()
    assert created["name"] == property_data["name"]
    assert "slug" in created
    assert created["slug"] is not None
    return created


def test_update_property():
    """Test that staff user can update a property"""
    token = test_admin_login()
    headers = {"Authorization": f"Bearer {token}"}
    
    # Create a property first
    property = test_create_property()
    property_id = property["id"]
    
    update_data = {"nightly_price": 350.00}
    response = requests.patch(
        f"{BASE_URL}/properties/{property_id}",
        json=update_data,
        headers=headers
    )
    
    assert response.status_code == 200
    updated = response.json()
    assert float(updated["nightly_price"]) == 350.00
    return updated


def test_delete_property():
    """Test that staff user can delete a property"""
    token = test_admin_login()
    headers = {"Authorization": f"Bearer {token}"}
    
    # Create a property first
    property = test_create_property()
    property_id = property["id"]
    
    response = requests.delete(
        f"{BASE_URL}/properties/{property_id}",
        headers=headers
    )
    
    assert response.status_code == 204
    
    # Verify 404
    response = requests.get(f"{BASE_URL}/properties/{property_id}", headers=headers)
    assert response.status_code == 404


if __name__ == "__main__":
    import uuid
    print("Running Session 009 Authentication and CRUD Tests...\n")
    
    try:
        print("Test 1: Admin Login")
        token = test_admin_login()
        print(f"✅ PASS: Token obtained: {token[:20]}...\n")
    except AssertionError as e:
        print(f"❌ FAIL: {e}\n")
    
    try:
        print("Test 2: Get Current User")
        test_get_current_user()
        print("✅ PASS: User profile retrieved\n")
    except AssertionError as e:
        print(f"❌ FAIL: {e}\n")
    
    try:
        print("Test 3: Get Protected Properties")
        test_get_protected_properties()
        print("✅ PASS: Properties retrieved with slugs\n")
    except AssertionError as e:
        print(f"❌ FAIL: {e}\n")
    
    try:
        print("Test 4: Create Property")
        test_create_property()
        print("✅ PASS: Property created with auto-generated slug\n")
    except AssertionError as e:
        print(f"❌ FAIL: {e}\n")

    try:
        print("Test 5: Update Property")
        test_update_property()
        print("✅ PASS: Property updated successfully\n")
    except AssertionError as e:
        print(f"❌ FAIL: {e}\n")

    try:
        print("Test 6: Delete Property")
        test_delete_property()
        print("✅ PASS: Property deleted successfully\n")
    except AssertionError as e:
        print(f"❌ FAIL: {e}\n")
