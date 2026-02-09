import requests
import json
import sys

BASE_URL = "http://localhost:8000/api/v1"
AUTH_URL = "http://localhost:8000/api/v1/auth/login"

def log(msg, status="INFO"):
    print(f"[{status}] {msg}")

def login():
    payload = {
        "username": "admin@local.dev",
        "password": "admin"
    }
    try:
        response = requests.post(AUTH_URL, data=payload)
        response.raise_for_status()
        token = response.json()["access_token"]
        log("Login successful", "SUCCESS")
        return {"Authorization": f"Bearer {token}"}
    except Exception as e:
        log(f"Login failed: {e}", "ERROR")
        if response:
            log(f"Response: {response.text}", "ERROR")
        sys.exit(1)

def get_or_create_property(headers):
    # Try to get existing properties first
    resp = requests.get(f"{BASE_URL}/properties/", headers=headers)
    if resp.status_code == 200 and len(resp.json()) > 0:
        prop = resp.json()[0]
        log(f"Using existing property: {prop['name']} ({prop['id']})", "INFO")
        return prop['id']
    
    # Create a property if none exist
    log("Creating a new property...", "INFO")
    payload = {
        "name": "Test Property for Validation",
        "description": "Created by validation script",
        "address": "123 Test St",
        "city": "Medellin",
        "country": "Colombia",
        "price_per_night": 100000,
        "nightly_price": 100000, # Also fix this key as PropertyBase uses nightly_price
        "currency": "COP",
        "max_guests": 4,
        "bedrooms": 2,
        "beds": 2,
        "baths": 1
    }
    # Need to get an owner ID first for property creation
    owner_resp = requests.get(f"{BASE_URL}/owners/", headers=headers)
    if owner_resp.status_code == 200 and len(owner_resp.json()) > 0:
        owner_id = owner_resp.json()[0]['id']
    else:
        # Create temporary owner
        owner_payload = {"full_name": "Temp Owner", "email": "temp@owner.com", "phone": "123"}
        try:
             owner_id = requests.post(f"{BASE_URL}/owners/", json=owner_payload, headers=headers).json()['id']
        except:
             log("Failed to get/create owner for property", "ERROR")
             sys.exit(1)
             
    payload["owner_id"] = owner_id

    resp = requests.post(f"{BASE_URL}/properties/", json=payload, headers=headers)
    if resp.status_code != 201:
        log(f"Failed to create property: {resp.text}", "ERROR")
        sys.exit(1)
    
    prop = resp.json()
    log(f"Created property: {prop['name']} ({prop['id']})", "SUCCESS")
    return prop['id']

def get_or_create_channel(headers):
    resp = requests.get(f"{BASE_URL}/channels/", headers=headers)
    if resp.status_code == 200:
        channels = resp.json()
        for ch in channels:
            if ch['name'] == "Direct":
                return ch['id']
            
    # Create Direct channel
    payload = {"name": "Direct", "external": False}
    resp = requests.post(f"{BASE_URL}/channels/", json=payload, headers=headers)
    return resp.json()['id']

def run_validation():
    headers = login()
    property_id = get_or_create_property(headers)
    channel_id = get_or_create_channel(headers)
    
    # ---------------------------------------------------------
    # Test Case 1: Reservation Creation & Guest Logic
    # ---------------------------------------------------------
    log("\n--- Starting Test Case 1: Reservation Creation & Guest Logic ---", "INFO")
    
    # 1. Create Guest
    guest_payload = {
        "full_name": "Test Guest",
        "email": "test.guest@example.com",
        "phone": "+573001234567"
    }
    # Check if guest exists or create new
    # For simplicity, we'll just try to create and ignore 400 if duplicate email, or use a unique email
    import time
    guest_payload["email"] = f"test.guest.{int(time.time())}@example.com"
    
    resp = requests.post(f"{BASE_URL}/guests/", json=guest_payload, headers=headers)
    if resp.status_code == 201:
        guest_id = resp.json()['id']
        log("Guest created successfully", "SUCCESS")
    else:
        log(f"Failed to create guest: {resp.text}", "ERROR")
        sys.exit(1)

    # 2. Create Reservation
    res_payload = {
        "property_id": property_id,
        "guest_id": guest_id,
        "channel_id": channel_id,
        "reservation_type": "commercial",
        "start_date": "2026-03-01",
        "end_date": "2026-03-05",
        "guest_count": 2,
        "total_amount": "500000.00",
        "status": "confirmed"
    }
    resp = requests.post(f"{BASE_URL}/reservations/", json=res_payload, headers=headers)
    if resp.status_code == 201:
        res_id = resp.json()['id']
        log("Reservation created successfully", "SUCCESS")
    else:
        log(f"Failed to create reservation: {resp.text}", "ERROR")
        sys.exit(1)
        
    # Verify Guest linkage
    if resp.json()['guest_id'] == guest_id:
        log("Reservation correctly linked to guest", "PASS")
    else:
        log("Reservation guest linkage failed", "FAIL")

    # 3. Create "Owner Use" Reservation
    owner_res_payload = {
        "property_id": property_id,
        "reservation_type": "owner", # Assuming "owner" type is valid based on requirements
        "start_date": "2026-03-10",
        "end_date": "2026-03-12",
        "guest_count": 1,
        "total_amount": "0.00",
        "status": "confirmed"
    }
    resp = requests.post(f"{BASE_URL}/reservations/", json=owner_res_payload, headers=headers)
    if resp.status_code == 201:
        owner_res = resp.json()
        if owner_res['reservation_type'] == 'owner':
            log("Owner Use reservation created successfully", "PASS")
        else:
            log(f"Owner reservation created but type is {owner_res['reservation_type']}", "FAIL")
    else:
        log(f"Failed to create Owner Use reservation: {resp.text}", "FAIL")

    # ---------------------------------------------------------
    # Test Case 2: Payment Lifecycle & Calculations
    # ---------------------------------------------------------
    log("\n--- Starting Test Case 2: Payment Lifecycle & Calculations ---", "INFO")
    
    # 1. Create High Value Reservation
    fin_res_payload = {
        "property_id": property_id,
        "guest_id": guest_id,
        "channel_id": channel_id,
        "reservation_type": "commercial",
        "start_date": "2026-04-01",
        "end_date": "2026-04-10",
        "guest_count": 2,
        "total_amount": "1000000.00",
        "status": "confirmed"
    }
    resp = requests.post(f"{BASE_URL}/reservations/", json=fin_res_payload, headers=headers)
    if resp.status_code != 201:
        log(f"Failed to create financial test reservation: {resp.text}", "ERROR")
        sys.exit(1)
    
    fin_res_id = resp.json()['id']
    log(f"Financial Reservation Created: {fin_res_id}", "INFO")
    
    # 2. Add Payment 500k (Paid)
    payment1 = {
        "reservation_id": fin_res_id,
        "amount": "500000.00",
        "payment_type": "deposit",
        "provider": "cash",
        "beneficiary": "company",
        "percentage_applied": "50.00",
        "status": "paid",
        "paid_at": "2026-02-08T10:00:00"
    }
    resp = requests.post(f"{BASE_URL}/payments/", json=payment1, headers=headers)
    if resp.status_code != 201:
        log(f"Failed to create payment 1: {resp.text}", "FAIL")
    else:
        log("Payment 1 (Paid, 500k) created", "SUCCESS")
        
    # Check Financial Summary
    resp = requests.get(f"{BASE_URL}/reservations/{fin_res_id}/financial-summary", headers=headers)
    summary = resp.json()
    log(f"Financial Summary 1: {summary}", "INFO")
    
    if float(summary['total_paid']) == 500000.0 and float(summary['balance']) == 500000.0:
        log("Financial Summary correct after 1st payment", "PASS")
    else:
        log(f"Financial Summary incorrect: {summary}", "FAIL")

    # 3. Add Payment 500k (Pending)
    payment2 = {
        "reservation_id": fin_res_id,
        "amount": "500000.00",
        "payment_type": "balance",
        "provider": "transfer",
        "beneficiary": "company",
        "percentage_applied": "50.00",
        "status": "pending"
    }
    resp = requests.post(f"{BASE_URL}/payments/", json=payment2, headers=headers)
    if resp.status_code != 201:
        log(f"Failed to create payment 2: {resp.text}", "FAIL")
    else:
        log("Payment 2 (Pending, 500k) created", "SUCCESS")
        
    # Check Financial Summary Again
    resp = requests.get(f"{BASE_URL}/reservations/{fin_res_id}/financial-summary", headers=headers)
    summary = resp.json()
    log(f"Financial Summary 2: {summary}", "INFO")
    
    # Pending payments should NOT be included in total_paid
    if float(summary['total_paid']) == 500000.0:
        log("Financial Summary correct (Pending not included in paid)", "PASS")
    else:
        log(f"Financial Summary incorrect (Pending included?): {summary}", "FAIL")
        
    # ---------------------------------------------------------
    # Test Case 3: Owner Management & Constraints
    # ---------------------------------------------------------
    log("\n--- Starting Test Case 3: Owner Management & Constraints ---", "INFO")
    
    # 1. Create Owner
    owner_payload = {
        "full_name": "Test Owner",
        "email": f"owner.{int(time.time())}@example.com",
        "phone": "+573111111111",
        "bank_details": "Bank: Bancolombia\nAccount: 123456789\nType: Savings"
    }
    resp = requests.post(f"{BASE_URL}/owners/", json=owner_payload, headers=headers)
    if resp.status_code != 200: # create_owner returns 200 based on router
        log(f"Failed to create owner: {resp.text}", "ERROR")
        sys.exit(1)
        
    owner_id = resp.json()['id']
    log(f"Owner created: {owner_id}", "SUCCESS")
    
    # 2. Update Owner Bank Details
    update_payload = {
        "bank_details": "Bank: Davivienda\nAccount: 987654321"
    }
    resp = requests.patch(f"{BASE_URL}/owners/{owner_id}", json=update_payload, headers=headers)
    if resp.status_code == 200:
        data = resp.json()
        # bank_details might be hidden in the response schema
        if "bank_details" in data and "Davivienda" in data["bank_details"]:
            log("Owner updated successfully", "PASS")
        else:
            # If the field is hidden in response, we check via financial endpoint
            log("bank_details not in response (expected behavior), checking financial endpoint...", "INFO")
            resp_fin = requests.get(f"{BASE_URL}/owners/{owner_id}/financial", headers=headers)
            if resp_fin.status_code == 200:
                fin_data = resp_fin.json()
                if "Davivienda" in fin_data.get('bank_details', ''):
                     log("Owner updated successfully (verified via financial endpoint)", "PASS")
                else:
                     log(f"Owner update verification failed. Bank details: {fin_data.get('bank_details')}", "FAIL")
            else:
                 log(f"Failed to access financial endpoint: {resp_fin.status_code}", "FAIL")
    else:
        log(f"Failed to update owner: {resp.text}", "FAIL")

    # 3. Assign Property to Owner (to test deletion constraint)
    # We need to update the property we created earlier
    prop_update = {"owner_id": owner_id}
    resp = requests.patch(f"{BASE_URL}/properties/{property_id}", json=prop_update, headers=headers)
    if resp.status_code == 200:
        log(f"Property {property_id} assigned to owner {owner_id}", "SUCCESS")
    else:
        log(f"Failed to assign property to owner: {resp.text}", "FAIL")
        
    # 4. Try to Delete Owner
    resp = requests.delete(f"{BASE_URL}/owners/{owner_id}", headers=headers)
    if resp.status_code == 400: # Expected Bad Request due to constraint
        log("Owner deletion blocked correctly (400 Bad Request)", "PASS")
    elif resp.status_code == 500:
        log("Owner deletion failed with 500 (Server Error) - specific error handling missing?", "FAIL")
    elif resp.status_code == 204:
        log("Owner deleted! Constraint failed!", "FAIL")
    else:
        log(f"Unexpected status code on delete: {resp.status_code}", "FAIL")

    log("\n--- Validation Complete ---", "INFO")

if __name__ == "__main__":
    try:
        run_validation()
    except Exception as e:
        log(f"Script execution failed: {e}", "ERROR")
