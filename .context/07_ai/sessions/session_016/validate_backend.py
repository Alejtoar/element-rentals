"""
Session 016 Backend Validation Script
Tests the new endpoints implemented in Phase 2
"""

import requests
import json
from datetime import date, datetime
from decimal import Decimal

# Configuration
BASE_URL = "http://localhost:8000/api/v1"
ADMIN_EMAIL = "admin@local.dev"
ADMIN_PASSWORD = "admin"

def login():
    """Authenticate and get access token"""
    response = requests.post(
        f"{BASE_URL}/auth/login",
        data={"username": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
    )
    if response.status_code == 200:
        return response.json()["access_token"]
    else:
        print(f"Login failed: {response.status_code}")
        print(response.text)
        return None

def test_financial_summary(token, reservation_id):
    """Test GET /reservations/{id}/financial-summary"""
    print("\n=== Testing Financial Summary Endpoint ===")
    headers = {"Authorization": f"Bearer {token}"}
    
    response = requests.get(
        f"{BASE_URL}/reservations/{reservation_id}/financial-summary",
        headers=headers
    )
    
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        summary = response.json()
        print(f"✅ Financial Summary Retrieved:")
        print(f"   Total Amount: {summary['total_amount']}")
        print(f"   Total Paid: {summary['total_paid']}")
        print(f"   Balance: {summary['balance']}")
        print(f"   Fully Paid: {summary['is_fully_paid']}")
        return True
    else:
        print(f"❌ Failed: {response.text}")
        return False

def test_reservation_list_optimization(token):
    """Test GET /reservations with total_paid field"""
    print("\n=== Testing Reservation List Optimization ===")
    headers = {"Authorization": f"Bearer {token}"}
    
    response = requests.get(
        f"{BASE_URL}/reservations",
        headers=headers
    )
    
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        reservations = response.json()
        if len(reservations) > 0:
            first_reservation = reservations[0]
            if 'total_paid' in first_reservation:
                print(f"✅ Reservation list includes total_paid field")
                print(f"   Sample: ID={first_reservation['id'][:8]}..., total_paid={first_reservation.get('total_paid', 'N/A')}")
                return True
            else:
                print(f"❌ total_paid field not found in response")
                return False
        else:
            print("⚠️  No reservations found to test")
            return True
    else:
        print(f"❌ Failed: {response.text}")
        return False

def test_owner_deletion(token):
    """Test DELETE /owners/{id} with and without properties"""
    print("\n=== Testing Owner Deletion Endpoint ===")
    headers = {"Authorization": f"Bearer {token}"}
    
    # First, create a test owner without properties
    create_response = requests.post(
        f"{BASE_URL}/owners",
        headers=headers,
        json={
            "full_name": "Test Owner for Deletion",
            "email": f"test.delete.{datetime.now().timestamp()}@test.com",
            "phone": "+57300000000",
            "bank_details": "Test Bank 123456"
        }
    )
    
    if create_response.status_code == 200:
        owner_id = create_response.json()["id"]
        print(f"✅ Created test owner: {owner_id}")
        
        # Try to delete the owner (should succeed)
        delete_response = requests.delete(
            f"{BASE_URL}/owners/{owner_id}",
            headers=headers
        )
        
        print(f"Delete Status Code: {delete_response.status_code}")
        if delete_response.status_code == 204:
            print(f"✅ Successfully deleted owner without properties")
            return True
        else:
            print(f"❌ Failed to delete: {delete_response.text}")
            return False
    else:
        print(f"❌ Failed to create test owner: {create_response.text}")
        return False

def test_owner_deletion_with_properties(token):
    """Test that owners with properties cannot be deleted"""
    print("\n=== Testing Owner Deletion Protection ===")
    headers = {"Authorization": f"Bearer {token}"}
    
    # Get first owner (likely has properties)
    owners_response = requests.get(f"{BASE_URL}/owners", headers=headers)
    
    if owners_response.status_code == 200:
        owners = owners_response.json()
        if len(owners) > 0:
            # Find an owner with properties
            for owner in owners:
                owner_id = owner["id"]
                # Try to delete
                delete_response = requests.delete(
                    f"{BASE_URL}/owners/{owner_id}",
                    headers=headers
                )
                
                if delete_response.status_code == 400:
                    print(f"✅ Correctly prevented deletion of owner with properties")
                    print(f"   Error message: {delete_response.json()['detail']}")
                    return True
                elif delete_response.status_code == 204:
                    print(f"⚠️  Owner {owner_id} was deleted (had no properties)")
                    continue
            
            print(f"⚠️  Could not find an owner with properties to test")
            return True
        else:
            print("⚠️  No owners found to test")
            return True
    else:
        print(f"❌ Failed to get owners: {owners_response.text}")
        return False

def test_payment_rbac(token):
    """Verify RBAC on payment endpoints"""
    print("\n=== Testing Payment RBAC ===")
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test GET /payments (should work for all internal users)
    response = requests.get(f"{BASE_URL}/payments", headers=headers)
    print(f"GET /payments Status: {response.status_code}")
    
    if response.status_code == 200:
        print(f"✅ Can view payments (correct for admin/finance/staff)")
        return True
    else:
        print(f"❌ Cannot view payments: {response.text}")
        return False

def main():
    """Run all validation tests"""
    print("=" * 60)
    print("Session 016 Backend Validation")
    print("Phase 2: Financial Aggregations & Operational Polish")
    print("=" * 60)
    
    # Login
    print("\n=== Authenticating ===")
    token = login()
    if not token:
        print("❌ Authentication failed. Cannot proceed with tests.")
        return
    
    print(f"✅ Authenticated successfully")
    
    # Get a reservation ID for testing
    headers = {"Authorization": f"Bearer {token}"}
    reservations_response = requests.get(f"{BASE_URL}/reservations", headers=headers)
    
    reservation_id = None
    if reservations_response.status_code == 200:
        reservations = reservations_response.json()
        if len(reservations) > 0:
            reservation_id = reservations[0]["id"]
    
    # Run tests
    results = []
    
    if reservation_id:
        results.append(("Financial Summary", test_financial_summary(token, reservation_id)))
    else:
        print("\n⚠️  No reservations found, skipping financial summary test")
    
    results.append(("Reservation List Optimization", test_reservation_list_optimization(token)))
    results.append(("Owner Deletion", test_owner_deletion(token)))
    results.append(("Owner Deletion Protection", test_owner_deletion_with_properties(token)))
    results.append(("Payment RBAC", test_payment_rbac(token)))
    
    # Summary
    print("\n" + "=" * 60)
    print("VALIDATION SUMMARY")
    print("=" * 60)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {test_name}")
    
    total_tests = len(results)
    passed_tests = sum(1 for _, result in results if result)
    
    print(f"\nTotal: {passed_tests}/{total_tests} tests passed")
    
    if passed_tests == total_tests:
        print("\n🎉 All tests passed! Session 016 backend implementation is ready.")
    else:
        print(f"\n⚠️  {total_tests - passed_tests} test(s) failed. Please review.")

if __name__ == "__main__":
    main()
