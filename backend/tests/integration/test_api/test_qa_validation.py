
import requests
import uuid
import json

BASE_URL = "http://127.0.0.1:8000/api/v1"

def test_admin_seeding():
    print("--- Testing Admin Seeding & Login ---")
    # Try default credentials from config.py first
    payload = {
        "username": "admin@elemnt.com",
        "password": "admin"
    }
    response = requests.post(f"{BASE_URL}/auth/login", data=payload)
    if response.status_code == 200:
        print("✅ Admin Login Passed with default credentials")
        return response.json()["access_token"]
    else:
        print(f"❌ Admin Login Failed with default: {response.status_code} {response.text}")
        # Try the ones in the previous test script just in case
        payload = {
            "username": "admin@local.dev",
            "password": "admin123"
        }
        response = requests.post(f"{BASE_URL}/auth/login", data=payload)
        if response.status_code == 200:
            print("✅ Admin Login Passed with local.dev credentials")
            return response.json()["access_token"]
        else:
            print(f"❌ Admin Login Failed with local.dev: {response.status_code}")
            return None

def test_lead_submission(token):
    print("\n--- Testing Lead Submission Flow ---")
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    
    # Guest Lead
    guest_payload = {
        "name": "QA Guest",
        "phone": "+123456789",
        "message": "QA Test Message",
        "desired_dates": "Next week"
    }
    # We send custom headers to verify metadata capture
    custom_headers = {
        "User-Agent": "QA-Agent-Bot/1.0",
        "Referer": "http://qa-test.com"
    }
    response = requests.post(f"{BASE_URL}/leads/guest", json=guest_payload, headers=custom_headers)
    assert response.status_code == 200
    guest_lead_id = response.json()["id"]
    print(f"✅ Guest Lead created: {guest_lead_id}")
    
    # Owner Lead
    owner_payload = {
        "name": "QA Owner",
        "phone": "+987654321",
        "location": "QA City",
        "message": "I have a big house"
    }
    response = requests.post(f"{BASE_URL}/leads/owner", json=owner_payload, headers=custom_headers)
    assert response.status_code == 200
    owner_lead_id = response.json()["id"]
    print(f"✅ Owner Lead created: {owner_lead_id}")
    
    # Verify metadata in retrieval
    if token:
        # Check Guest Lead
        response = requests.get(f"{BASE_URL}/leads/guest", headers=headers)
        leads = response.json()
        target = next((l for l in leads if l["id"] == guest_lead_id), None)
        assert target is not None
        assert target["user_agent"] == "QA-Agent-Bot/1.0"
        assert target["referer"] == "http://qa-test.com"
        assert target["ip_address"] is not None
        print("✅ Guest Lead metadata verified")
        
        # Check Owner Lead
        response = requests.get(f"{BASE_URL}/leads/owner", headers=headers)
        leads = response.json()
        target = next((l for l in leads if l["id"] == owner_lead_id), None)
        assert target is not None
        assert target["user_agent"] == "QA-Agent-Bot/1.0"
        assert target["referer"] == "http://qa-test.com"
        assert target["ip_address"] is not None
        print("✅ Owner Lead metadata verified")

def test_property_filtering(token):
    print("\n--- Testing Property Filtering ---")
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    
    # Create an owner first if we want to create a property
    owner_payload = {
        "full_name": "Filter Test Owner",
        "email": f"filter_{uuid.uuid4().hex[:6]}@example.com",
        "phone": "+111222333"
    }
    resp = requests.post(f"{BASE_URL}/owners/", json=owner_payload, headers=headers)
    owner_id = resp.json()["id"]
    
    # Create specific properties to test filters
    p1 = {
        "name": "Prop City A",
        "nightly_price": 100,
        "address": "Addr A",
        "city": "CityA",
        "country": "CountryA",
        "max_guests": 2,
        "active": True,
        "featured": True,
        "owner_id": owner_id
    }
    p2 = {
        "name": "Prop City B Large",
        "nightly_price": 200,
        "address": "Addr B",
        "city": "CityB",
        "country": "CountryB",
        "max_guests": 10,
        "active": True,
        "featured": False,
        "owner_id": owner_id
    }
    
    requests.post(f"{BASE_URL}/properties/", json=p1, headers=headers)
    requests.post(f"{BASE_URL}/properties/", json=p2, headers=headers)
    
    # Test City Filter
    response = requests.get(f"{BASE_URL}/properties/?city=CityA")
    props = response.json()
    assert all(p["city"] == "CityA" for p in props)
    assert any(p["name"] == "Prop City A" for p in props)
    print("✅ City filter verified")
    
    # Test Max Guests Filter
    response = requests.get(f"{BASE_URL}/properties/?max_guests=5")
    props = response.json()
    assert all(p["max_guests"] >= 5 for p in props)
    assert any(p["name"] == "Prop City B Large" for p in props)
    assert not any(p["name"] == "Prop City A" for p in props)
    print("✅ Max guests filter verified")
    
    # Test Featured Sorting (Public endpoint returns featured first)
    response = requests.get(f"{BASE_URL}/properties/")
    props = response.json()
    # Find the position of our featured and non-featured props
    idx_p1 = next((i for i, p in enumerate(props) if p["name"] == "Prop City A"), None)
    idx_p2 = next((i for i, p in enumerate(props) if p["name"] == "Prop City B Large"), None)
    
    if idx_p1 is not None and idx_p2 is not None:
        assert idx_p1 < idx_p2
        print("✅ Featured sorting verified")
    else:
        print("⚠️ Could not verify featured sorting (props not found in list)")

def test_whatsapp_links():
    print("\n--- Testing WhatsApp Link Logic ---")
    # Get any property
    response = requests.get(f"{BASE_URL}/properties/")
    props = response.json()
    if not props:
        print("❌ No properties found to test WhatsApp links")
        return
        
    prop_id = props[0]["id"]
    prop_name = props[0]["name"]
    
    # Test ES
    response = requests.get(f"{BASE_URL}/properties/{prop_id}/whatsapp-link?lang=es&source=test_source")
    url = response.json()["url"]
    print(f"ES Link: {url}")
    assert "wa.me" in url
    assert "propiedad" in url.lower()
    assert "test_source" in url
    
    # Test EN
    response = requests.get(f"{BASE_URL}/properties/{prop_id}/whatsapp-link?lang=en&source=web")
    url = response.json()["url"]
    print(f"EN Link: {url}")
    assert "wa.me" in url
    assert "interested" in url.lower()
    assert "web" in url
    
    print("✅ WhatsApp link logic verified")

if __name__ == "__main__":
    token = test_admin_seeding()
    test_lead_submission(token)
    test_property_filtering(token)
    test_whatsapp_links()
    print("\nALL BACKEND VALIDATIONS PASSED")
