"""
Covers:
- Domain Rule: Authentication & Authorization
- API: /auth/login, /owners/, /properties/
- ADR: 002_deferred_auth.md
"""

import requests
import json
from typing import Dict, Any
import uuid

# Configuration
BASE_URL = "http://127.0.0.1:8000"

class TestResults:
    def __init__(self):
        self.passed = []
        self.failed = []
        self.warnings = []
    
    def add_pass(self, test_name: str, details: str = ""):
        self.passed.append({"test": test_name, "details": details})
        print(f"✅ PASS: {test_name}")
        if details:
            print(f"   {details}")
    
    def add_fail(self, test_name: str, details: str, severity: str = "HIGH"):
        self.failed.append({"test": test_name, "details": details, "severity": severity})
        print(f"❌ FAIL ({severity}): {test_name}")
        print(f"   {details}")
    
    def add_warning(self, test_name: str, details: str):
        self.warnings.append({"test": test_name, "details": details})
        print(f"⚠️  WARNING: {test_name}")
        print(f"   {details}")
    
    def summary(self):
        print("\n" + "="*80)
        print("TEST SUMMARY")
        print("="*80)
        print(f"✅ Passed: {len(self.passed)}")
        print(f"❌ Failed: {len(self.failed)}")
        print(f"⚠️  Warnings: {len(self.warnings)}")
        
        if self.failed:
            print("\n🔴 CRITICAL FAILURES:")
            for fail in self.failed:
                print(f"  - {fail['test']} ({fail['severity']})")
        
        return len(self.failed) == 0

def run_integration_tests():
    results = TestResults()
    access_token = None
    property_id = None

    # Test 1: Health Check
    print("\n" + "="*80)
    print("TEST 1: Health Check")
    print("="*80)
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            results.add_pass("Health check endpoint", f"Status: {response.status_code}")
        else:
            results.add_fail("Health check endpoint", f"Expected 200, got {response.status_code}", "HIGH")
    except Exception as e:
        results.add_fail("Health check endpoint", f"Connection error: {str(e)}", "CRITICAL")

    # Test 2: Public Property Listing (No Auth Required)
    print("\n" + "="*80)
    print("TEST 2: Public Property Listing (No Auth)")
    print("="*80)
    try:
        response = requests.get(f"{BASE_URL}/properties/")
        if response.status_code == 200:
            results.add_pass("Public property listing", f"Status: {response.status_code}, Properties: {len(response.json())}")
        else:
            results.add_fail("Public property listing", f"Expected 200, got {response.status_code}", "HIGH")
    except Exception as e:
        results.add_fail("Public property listing", f"Error: {str(e)}", "HIGH")

    # Test 3: Admin Login
    print("\n" + "="*80)
    print("TEST 3: Admin Login")
    print("="*80)
    try:
        login_data = {
            "username": "admin@elemnt.com",
            "password": "admin"
        }
        response = requests.post(f"{BASE_URL}/auth/login", data=login_data)
        if response.status_code == 200:
            token_data = response.json()
            if "access_token" in token_data and "token_type" in token_data:
                access_token = token_data["access_token"]
                results.add_pass("Admin login", f"Token received: {access_token[:20]}...")
            else:
                results.add_fail("Admin login", "Token structure invalid", "HIGH")
        else:
            results.add_fail("Admin login", f"Expected 200, got {response.status_code}: {response.text}", "CRITICAL")
    except Exception as e:
        results.add_fail("Admin login", f"Error: {str(e)}", "CRITICAL")

    # Test 4: Invalid Login Attempt
    print("\n" + "="*80)
    print("TEST 4: Invalid Login Attempt")
    print("="*80)
    try:
        login_data = {
            "username": "admin@elemnt.com",
            "password": "wrongpassword"
        }
        response = requests.post(f"{BASE_URL}/auth/login", data=login_data)
        if response.status_code == 401:
            results.add_pass("Invalid login rejection", "Correctly rejected with 401")
        else:
            results.add_fail("Invalid login rejection", f"Expected 401, got {response.status_code}", "HIGH")
    except Exception as e:
        results.add_fail("Invalid login rejection", f"Error: {str(e)}", "MEDIUM")

    # Test 5: Protected Endpoint Without Auth (Should Fail)
    print("\n" + "="*80)
    print("TEST 5: Protected Endpoint Without Auth")
    print("="*80)
    try:
        response = requests.post(f"{BASE_URL}/owners/", json={"full_name": "Test", "email": "test@test.com", "phone": "123"})
        if response.status_code == 401:
            results.add_pass("Unauthorized access blocked", "Correctly rejected with 401")
        else:
            results.add_fail("Unauthorized access blocked", f"Expected 401, got {response.status_code}", "CRITICAL")
    except Exception as e:
        results.add_fail("Unauthorized access blocked", f"Error: {str(e)}", "CRITICAL")

    # Test 6 & 7: CRUD with Auth
    if access_token:
        headers = {"Authorization": f"Bearer {access_token}"}
        
        # Create Owner
        print("\n" + "="*80)
        print("TEST 6: Create Owner with Admin Auth")
        print("="*80)
        try:
            owner_data = {
                "full_name": f"QA Test Owner {uuid.uuid4().hex[:6]}",
                "email": f"qatest_{uuid.uuid4().hex[:6]}@elemnt.com",
                "phone": "+1234567890"
            }
            response = requests.post(f"{BASE_URL}/owners/", json=owner_data, headers=headers)
            if response.status_code == 200:
                owner = response.json()
                test_owner_id = owner.get("id")
                results.add_pass("Create owner with auth", f"Owner created: {owner.get('full_name')}")
            else:
                results.add_fail("Create owner with auth", f"Expected 200, got {response.status_code}: {response.text}", "HIGH")
                test_owner_id = None
        except Exception as e:
            results.add_fail("Create owner with auth", f"Error: {str(e)}", "HIGH")
            test_owner_id = None

        # Create Property
        if test_owner_id:
            print("\n" + "="*80)
            print("TEST 8: Create Property (Admin Only)")
            print("="*80)
            try:
                property_data = {
                    "name": "QA Test Property",
                    "nightly_price": 100.0,
                    "address": "123 Test St",
                    "city": "Test City",
                    "country": "Test Country",
                    "max_guests": 4,
                    "active": True,
                    "owner_id": test_owner_id
                }
                response = requests.post(f"{BASE_URL}/properties/", json=property_data, headers=headers)
                if response.status_code == 200:
                    prop = response.json()
                    property_id = prop.get("id")
                    results.add_pass("Create property with auth", f"Property created: {prop.get('name')}")
                else:
                    results.add_fail("Create property with auth", f"Expected 200, got {response.status_code}: {response.text}", "HIGH")
            except Exception as e:
                results.add_fail("Create property with auth", f"Error: {str(e)}", "HIGH")

        # Update Property
        if property_id:
            print("\n" + "="*80)
            print("TEST 9: Update Property (Admin Only)")
            print("="*80)
            try:
                update_data = {"name": "QA Test Property - Updated"}
                response = requests.patch(f"{BASE_URL}/properties/{property_id}", json=update_data, headers=headers)
                if response.status_code == 200:
                    updated_prop = response.json()
                    results.add_pass("Update property with auth", f"Property updated: {updated_prop.get('name')}")
                else:
                    results.add_fail("Update property with auth", f"Expected 200, got {response.status_code}", "HIGH")
            except Exception as e:
                results.add_fail("Update property with auth", f"Error: {str(e)}", "HIGH")

    # Test 10: Property Filtering
    print("\n" + "="*80)
    print("TEST 10: Property Filtering (Public)")
    print("="*80)
    try:
        response = requests.get(f"{BASE_URL}/properties/?city=Test City")
        if response.status_code == 200:
            properties = response.json()
            results.add_pass("Property filtering by city", f"Found {len(properties)} properties")
        else:
            results.add_fail("Property filtering by city", f"Expected 200, got {response.status_code}", "MEDIUM")
    except Exception as e:
        results.add_fail("Property filtering by city", f"Error: {str(e)}", "MEDIUM")

    # Test 11: CORS
    print("\n" + "="*80)
    print("TEST 11: CORS Configuration")
    print("="*80)
    try:
        headers = {"Origin": "http://localhost:3000"}
        response = requests.get(f"{BASE_URL}/properties/", headers=headers)
        cors_headers = response.headers.get("Access-Control-Allow-Origin")
        if cors_headers == "*":
            results.add_warning("CORS wildcard configuration", "CORS allows all origins (*) - acceptable for dev, must be restricted for production")
        elif cors_headers:
            results.add_pass("CORS configuration", f"CORS origin: {cors_headers}")
        else:
            results.add_fail("CORS configuration", "No CORS headers found", "LOW")
    except Exception as e:
        results.add_warning("CORS configuration", f"Could not check CORS: {str(e)}")

    return results.summary()

if __name__ == "__main__":
    success = run_integration_tests()
    if success:
        exit(0)
    else:
        exit(1)
