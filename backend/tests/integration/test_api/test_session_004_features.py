"""
Covers:
- Architectural Standard: Layered Architecture (Refactoring Validation)
- Business Rule: Lead Management System
- Business Rule: WhatsApp Integration
- Business Rule: Financial & Reservation Foundations
- API: POST /leads/owner
- API: POST /leads/guest
- API: GET /leads/owner
- API: GET /leads/guest
- API: GET /properties/{id}/whatsapp-link
- API: GET /owners/whatsapp-link
"""

import requests
import uuid
import time

BASE_URL = "http://127.0.0.1:8000"

def test_health_check():
    print("Testing Health Check...")
    response = requests.get(f"{BASE_URL}/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
    print("✅ Health Check Passed")

def test_admin_login():
    print("Testing Admin Login...")
    payload = {
        "username": "admin@local.dev",
        "password": "admin123"
    }
    response = requests.post(f"{BASE_URL}/auth/login", data=payload)
    assert response.status_code == 200
    token = response.json().get("access_token")
    assert token is not None
    print("✅ Admin Login Passed")
    return token

def test_whatsapp_links(token):
    print("Testing WhatsApp Links...")
    # Test owners link
    response = requests.get(f"{BASE_URL}/owners/whatsapp-link")
    assert response.status_code == 200
    url = response.json()["url"]
    print(f"Owner Link: {url}")
    assert "wa.me" in url
    
    # Test properties link
    response = requests.get(f"{BASE_URL}/properties/")
    if response.status_code != 200:
        print(f"Error getting properties: {response.status_code} - {response.text}")
    assert response.status_code == 200
    properties = response.json()
    if properties:
        prop_id = properties[0]["id"]
        response = requests.get(f"{BASE_URL}/properties/{prop_id}/whatsapp-link")
        if response.status_code != 200:
            print(f"Error getting property whatsapp link: {response.status_code} - {response.text}")
        assert response.status_code == 200
        url = response.json()["url"]
        print(f"Property Link: {url}")
        assert "wa.me" in url
    else:
        print("Note: No properties found, skipping property link test")
    
    print("✅ WhatsApp Links Passed")

def test_lead_management(token):
    print("Testing Lead Management...")
    headers = {"Authorization": f"Bearer {token}"}
    
    # Create Owner Lead (Public)
    owner_lead_payload = {
        "name": "Test Owner Lead",
        "phone": "+573001234567",
        "location": "Medellin",
        "message": "Test property in Medellin"
    }
    response = requests.post(f"{BASE_URL}/leads/owner", json=owner_lead_payload)
    if response.status_code != 200:
        print(f"Error creating owner lead: {response.status_code} - {response.text}")
    assert response.status_code == 200
    lead_id = response.json()["id"]
    
    # Create Guest Lead (Public)
    guest_lead_payload = {
        "name": "Test Guest Lead",
        "phone": "+573007654321",
        "message": "I want to rent this property"
    }
    response = requests.post(f"{BASE_URL}/leads/guest", json=guest_lead_payload)
    if response.status_code != 200:
        print(f"Error creating guest lead: {response.status_code} - {response.text}")
    assert response.status_code == 200
    
    # Retrieve leads (Protected)
    response = requests.get(f"{BASE_URL}/leads/owner", headers=headers)
    assert response.status_code == 200
    leads = response.json()
    assert any(l["id"] == lead_id for l in leads)
    # Check metadata was captured (though we might not be able to verify IP is correct, just that it's there)
    assert leads[0]["ip_address"] is not None
    assert leads[0]["user_agent"] is not None
    
    response = requests.get(f"{BASE_URL}/leads/guest", headers=headers)
    assert response.status_code == 200
    print("✅ Lead Management Passed")

def test_refactored_endpoints(token):
    print("Testing Refactored Endpoints (Owners/Properties)...")
    headers = {"Authorization": f"Bearer {token}"}
    
    # Owners
    response = requests.get(f"{BASE_URL}/owners/", headers=headers)
    assert response.status_code == 200
    
    # Create an owner
    owner_payload = {
        "full_name": f"QA Owner {uuid.uuid4().hex[:6]}",
        "email": f"qa_owner_{uuid.uuid4().hex[:6]}@example.com",
        "phone": "+1234567890"
    }
    response = requests.post(f"{BASE_URL}/owners/", json=owner_payload, headers=headers)
    assert response.status_code == 200
    owner_id = response.json()["id"]
    
    # Properties
    response = requests.get(f"{BASE_URL}/properties/")
    assert response.status_code == 200
    
    # Create a property
    property_payload = {
        "name": "QA Test Property",
        "nightly_price": 150.0,
        "address": "Street 123",
        "city": "Medellin",
        "country": "Colombia",
        "max_guests": 4,
        "active": True,
        "owner_id": owner_id,
        "featured": True
    }
    response = requests.post(f"{BASE_URL}/properties/", json=property_payload, headers=headers)
    assert response.status_code == 200
    prop_id = response.json()["id"]
    assert response.json()["featured"] == True
    
    # Test sorting (featured first)
    response = requests.get(f"{BASE_URL}/properties/")
    assert response.status_code == 200
    properties = response.json()
    assert properties[0]["featured"] == True
    
    print("✅ Refactored Endpoints Passed")

if __name__ == "__main__":
    try:
        test_health_check()
        token = test_admin_login()
        test_whatsapp_links(token)
        test_lead_management(token)
        test_refactored_endpoints(token)
        print("\n🎉 ALL TESTS PASSED SUCCESSFULLY!")
    except Exception as e:
        print(f"\n❌ TEST FAILED: {str(e)}")
        import traceback
        traceback.print_exc()
        exit(1)
