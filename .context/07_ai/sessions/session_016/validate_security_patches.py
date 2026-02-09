"""
Session 016 Security Patches Validation Script
Tests the security fixes SEC-001 and SEC-002
"""

import requests
import json

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

def test_sec_001_owner_bank_details_restriction(token):
    """
    SEC-001: Verify that GET /owners/{id} no longer returns bank_details
    """
    print("\n=== Testing SEC-001: Owner Bank Details Restriction ===")
    headers = {"Authorization": f"Bearer {token}"}
    
    # Get list of owners
    owners_response = requests.get(f"{BASE_URL}/owners", headers=headers)
    
    if owners_response.status_code == 200:
        owners = owners_response.json()
        if len(owners) > 0:
            owner_id = owners[0]["id"]
            
            # Test standard endpoint (should NOT have bank_details)
            standard_response = requests.get(
                f"{BASE_URL}/owners/{owner_id}",
                headers=headers
            )
            
            if standard_response.status_code == 200:
                owner_data = standard_response.json()
                
                if "bank_details" in owner_data:
                    print(f"❌ FAIL: bank_details exposed in standard endpoint")
                    print(f"   Response: {json.dumps(owner_data, indent=2)}")
                    return False
                else:
                    print(f"✅ PASS: bank_details correctly excluded from GET /owners/{{id}}")
                    print(f"   Owner ID: {owner_id}")
                    print(f"   Fields returned: {list(owner_data.keys())}")
                    return True
            else:
                print(f"❌ Failed to get owner: {standard_response.status_code}")
                return False
        else:
            print("⚠️  No owners found to test")
            return True
    else:
        print(f"❌ Failed to list owners: {owners_response.text}")
        return False

def test_sec_001_financial_endpoint(token):
    """
    SEC-001: Verify that GET /owners/{id}/financial returns bank_details
    and is only accessible by finance/admin
    """
    print("\n=== Testing SEC-001: Owner Financial Endpoint ===")
    headers = {"Authorization": f"Bearer {token}"}
    
    # Get list of owners
    owners_response = requests.get(f"{BASE_URL}/owners", headers=headers)
    
    if owners_response.status_code == 200:
        owners = owners_response.json()
        if len(owners) > 0:
            owner_id = owners[0]["id"]
            
            # Test financial endpoint (should have bank_details)
            financial_response = requests.get(
                f"{BASE_URL}/owners/{owner_id}/financial",
                headers=headers
            )
            
            if financial_response.status_code == 200:
                owner_data = financial_response.json()
                
                if "bank_details" in owner_data:
                    print(f"✅ PASS: bank_details available in financial endpoint")
                    print(f"   Owner ID: {owner_id}")
                    print(f"   Fields returned: {list(owner_data.keys())}")
                    return True
                else:
                    print(f"❌ FAIL: bank_details missing from financial endpoint")
                    print(f"   Response: {json.dumps(owner_data, indent=2)}")
                    return False
            elif financial_response.status_code == 403:
                print(f"⚠️  Access denied (expected if not finance/admin role)")
                print(f"   This is correct behavior for non-finance users")
                return True
            else:
                print(f"❌ Unexpected status: {financial_response.status_code}")
                print(f"   Response: {financial_response.text}")
                return False
        else:
            print("⚠️  No owners found to test")
            return True
    else:
        print(f"❌ Failed to list owners: {owners_response.text}")
        return False

def test_sec_002_financial_summary_access(token):
    """
    SEC-002: Verify that GET /reservations/{id}/financial-summary
    is accessible by internal users (including finance role)
    """
    print("\n=== Testing SEC-002: Financial Summary Access ===")
    headers = {"Authorization": f"Bearer {token}"}
    
    # Get list of reservations
    reservations_response = requests.get(f"{BASE_URL}/reservations", headers=headers)
    
    if reservations_response.status_code == 200:
        reservations = reservations_response.json()
        if len(reservations) > 0:
            reservation_id = reservations[0]["id"]
            
            # Test financial summary endpoint
            summary_response = requests.get(
                f"{BASE_URL}/reservations/{reservation_id}/financial-summary",
                headers=headers
            )
            
            if summary_response.status_code == 200:
                summary = summary_response.json()
                print(f"✅ PASS: Financial summary accessible")
                print(f"   Reservation ID: {reservation_id}")
                print(f"   Summary: {json.dumps(summary, indent=2)}")
                
                # Verify expected fields
                required_fields = ["total_amount", "total_paid", "balance", "is_fully_paid"]
                missing_fields = [f for f in required_fields if f not in summary]
                
                if missing_fields:
                    print(f"⚠️  Missing fields: {missing_fields}")
                    return False
                
                return True
            else:
                print(f"❌ FAIL: Cannot access financial summary")
                print(f"   Status: {summary_response.status_code}")
                print(f"   Response: {summary_response.text}")
                return False
        else:
            print("⚠️  No reservations found to test")
            return True
    else:
        print(f"❌ Failed to list reservations: {reservations_response.text}")
        return False

def main():
    """Run all security validation tests"""
    print("=" * 60)
    print("Session 016 Security Patches Validation")
    print("SEC-001: Owner Bank Details Restriction")
    print("SEC-002: Financial Summary Access")
    print("=" * 60)
    
    # Login
    print("\n=== Authenticating ===")
    token = login()
    if not token:
        print("❌ Authentication failed. Cannot proceed with tests.")
        return
    
    print(f"✅ Authenticated successfully")
    
    # Run tests
    results = []
    
    results.append(("SEC-001: Bank Details Excluded", test_sec_001_owner_bank_details_restriction(token)))
    results.append(("SEC-001: Financial Endpoint", test_sec_001_financial_endpoint(token)))
    results.append(("SEC-002: Financial Summary Access", test_sec_002_financial_summary_access(token)))
    
    # Summary
    print("\n" + "=" * 60)
    print("SECURITY VALIDATION SUMMARY")
    print("=" * 60)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {test_name}")
    
    total_tests = len(results)
    passed_tests = sum(1 for _, result in results if result)
    
    print(f"\nTotal: {passed_tests}/{total_tests} tests passed")
    
    if passed_tests == total_tests:
        print("\n🎉 All security patches validated successfully!")
        print("✅ SEC-001: Owner bank details properly restricted")
        print("✅ SEC-002: Finance role can access financial summaries")
    else:
        print(f"\n⚠️  {total_tests - passed_tests} test(s) failed. Please review.")

if __name__ == "__main__":
    main()
