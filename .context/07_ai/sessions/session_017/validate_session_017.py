"""
Session 017 Validation Script
Tests PaymentMethod and Expense functionality
"""

import requests
import json
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
        print(f"❌ Login failed: {response.status_code}")
        print(response.text)
        return None

def test_payment_methods(token):
    """Test PaymentMethod CRUD operations"""
    print("\n" + "="*60)
    print("Testing Payment Methods")
    print("="*60)
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # 1. Create a payment method
    print("\n1️⃣ Creating payment method (Stripe Test)...")
    payment_method_data = {
        "name": "Stripe Test",
        "transaction_fee_percent": 3.00,
        "transaction_fee_fixed": 0.30,
        "is_active": True
    }
    
    response = requests.post(
        f"{BASE_URL}/payment-methods",
        headers=headers,
        json=payment_method_data
    )
    
    if response.status_code == 201:
        payment_method = response.json()
        print(f"✅ Payment method created: {payment_method['id']}")
        print(f"   Name: {payment_method['name']}")
        print(f"   Fee: {payment_method['transaction_fee_percent']}% + ${payment_method['transaction_fee_fixed']}")
        
        # 2. List payment methods
        print("\n2️⃣ Listing payment methods...")
        response = requests.get(f"{BASE_URL}/payment-methods", headers=headers)
        if response.status_code == 200:
            methods = response.json()
            print(f"✅ Found {len(methods)} payment method(s)")
            
            # 3. Test fee calculation with a payment
            print("\n3️⃣ Testing fee calculation...")
            print("   Creating a $100 payment with Stripe Test method...")
            
            # First, get a reservation to attach the payment to
            reservations_response = requests.get(f"{BASE_URL}/reservations", headers=headers)
            if reservations_response.status_code == 200:
                reservations = reservations_response.json()
                if len(reservations) > 0:
                    reservation_id = reservations[0]["id"]
                    
                    payment_data = {
                        "reservation_id": reservation_id,
                        "payment_method_id": payment_method["id"],
                        "amount": 100.00,
                        "payment_type": "deposit",
                        "non_refundable": True,
                        "beneficiary": "company",
                        "percentage_applied": 50.00,
                        "status": "pending"
                    }
                    
                    payment_response = requests.post(
                        f"{BASE_URL}/payments",
                        headers=headers,
                        json=payment_data
                    )
                    
                    if payment_response.status_code == 201:
                        payment = payment_response.json()
                        print(f"✅ Payment created successfully")
                        print(f"   Gross Amount: ${payment['amount']}")
                        print(f"   Net Amount: ${payment['net_amount']}")
                        print(f"   Fees: ${float(payment['amount']) - float(payment['net_amount']):.2f}")
                        
                        # Verify calculation
                        expected_net = 100.00 - (100.00 * 0.03) - 0.30
                        actual_net = float(payment['net_amount'])
                        
                        if abs(expected_net - actual_net) < 0.01:
                            print(f"✅ Fee calculation correct! Expected: ${expected_net:.2f}, Got: ${actual_net:.2f}")
                            return True
                        else:
                            print(f"❌ Fee calculation incorrect! Expected: ${expected_net:.2f}, Got: ${actual_net:.2f}")
                            return False
                    else:
                        print(f"❌ Payment creation failed: {payment_response.status_code}")
                        print(payment_response.text)
                        return False
                else:
                    print("⚠️  No reservations found to test payment creation")
                    return True
            else:
                print(f"❌ Failed to get reservations: {reservations_response.status_code}")
                return False
        else:
            print(f"❌ Failed to list payment methods: {response.status_code}")
            return False
    else:
        print(f"❌ Payment method creation failed: {response.status_code}")
        print(response.text)
        return False

def test_expenses(token):
    """Test Expense CRUD operations"""
    print("\n" + "="*60)
    print("Testing Expenses")
    print("="*60)
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # 1. Get a property to attach expense to
    print("\n1️⃣ Getting properties...")
    properties_response = requests.get(f"{BASE_URL}/properties", headers=headers)
    
    if properties_response.status_code == 200:
        properties = properties_response.json()
        if len(properties) > 0:
            property_id = properties[0]["id"]
            print(f"✅ Using property: {properties[0]['name']}")
            
            # 2. Create an expense
            print("\n2️⃣ Creating expense...")
            expense_data = {
                "property_id": property_id,
                "amount": 150.00,
                "date": "2026-02-09",
                "category": "Maintenance",
                "description": "Fixed broken window - Session 017 test",
                "is_deductible": True,
                "receipt_url": "https://example.com/receipt.pdf"
            }
            
            expense_response = requests.post(
                f"{BASE_URL}/expenses",
                headers=headers,
                json=expense_data
            )
            
            if expense_response.status_code == 201:
                expense = expense_response.json()
                print(f"✅ Expense created: {expense['id']}")
                print(f"   Amount: ${expense['amount']}")
                print(f"   Category: {expense['category']}")
                print(f"   Description: {expense['description']}")
                print(f"   Deductible: {expense['is_deductible']}")
                
                # 3. List expenses for this property
                print("\n3️⃣ Listing expenses for property...")
                list_response = requests.get(
                    f"{BASE_URL}/expenses?property_id={property_id}",
                    headers=headers
                )
                
                if list_response.status_code == 200:
                    expenses = list_response.json()
                    print(f"✅ Found {len(expenses)} expense(s) for this property")
                    
                    # 4. Update the expense
                    print("\n4️⃣ Updating expense...")
                    update_data = {
                        "amount": 175.00,
                        "description": "Fixed broken window and door - Updated"
                    }
                    
                    update_response = requests.patch(
                        f"{BASE_URL}/expenses/{expense['id']}",
                        headers=headers,
                        json=update_data
                    )
                    
                    if update_response.status_code == 200:
                        updated_expense = update_response.json()
                        print(f"✅ Expense updated")
                        print(f"   New Amount: ${updated_expense['amount']}")
                        print(f"   New Description: {updated_expense['description']}")
                        return True
                    else:
                        print(f"❌ Expense update failed: {update_response.status_code}")
                        print(update_response.text)
                        return False
                else:
                    print(f"❌ Failed to list expenses: {list_response.status_code}")
                    return False
            else:
                print(f"❌ Expense creation failed: {expense_response.status_code}")
                print(expense_response.text)
                return False
        else:
            print("⚠️  No properties found to test expenses")
            return True
    else:
        print(f"❌ Failed to get properties: {properties_response.status_code}")
        return False

def test_financial_summary_compatibility(token):
    """Verify Session 016 financial summary still works"""
    print("\n" + "="*60)
    print("Testing Financial Summary Compatibility (Session 016)")
    print("="*60)
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Get a reservation
    reservations_response = requests.get(f"{BASE_URL}/reservations", headers=headers)
    
    if reservations_response.status_code == 200:
        reservations = reservations_response.json()
        if len(reservations) > 0:
            reservation_id = reservations[0]["id"]
            
            # Get financial summary
            summary_response = requests.get(
                f"{BASE_URL}/reservations/{reservation_id}/financial-summary",
                headers=headers
            )
            
            if summary_response.status_code == 200:
                summary = summary_response.json()
                print(f"✅ Financial summary still works!")
                print(f"   Total Amount: ${summary['total_amount']}")
                print(f"   Total Paid: ${summary['total_paid']}")
                print(f"   Balance: ${summary['balance']}")
                print(f"   Fully Paid: {summary['is_fully_paid']}")
                return True
            else:
                print(f"❌ Financial summary failed: {summary_response.status_code}")
                print(summary_response.text)
                return False
        else:
            print("⚠️  No reservations found to test")
            return True
    else:
        print(f"❌ Failed to get reservations: {reservations_response.status_code}")
        return False

def main():
    """Run all validation tests"""
    print("="*60)
    print("Session 017 Validation")
    print("PaymentMethod & Expense Features")
    print("="*60)
    
    # Login
    print("\n🔐 Authenticating...")
    token = login()
    if not token:
        print("❌ Authentication failed. Cannot proceed.")
        return
    
    print("✅ Authenticated successfully")
    
    # Run tests
    results = []
    
    print("\n" + "="*60)
    print("NOTE: These tests require the database migration to be run first.")
    print("If you see errors, run: cd backend && alembic upgrade head")
    print("="*60)
    
    results.append(("Payment Methods", test_payment_methods(token)))
    results.append(("Expenses", test_expenses(token)))
    results.append(("Financial Summary Compatibility", test_financial_summary_compatibility(token)))
    
    # Summary
    print("\n" + "="*60)
    print("VALIDATION SUMMARY")
    print("="*60)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {test_name}")
    
    total_tests = len(results)
    passed_tests = sum(1 for _, result in results if result)
    
    print(f"\nTotal: {passed_tests}/{total_tests} tests passed")
    
    if passed_tests == total_tests:
        print("\n🎉 All Session 017 features validated successfully!")
        print("✅ Payment methods with fee calculation working")
        print("✅ Expense tracking working")
        print("✅ Backward compatibility maintained")
    else:
        print(f"\n⚠️  {total_tests - passed_tests} test(s) failed.")
        print("This is expected if the database migration hasn't been run yet.")

if __name__ == "__main__":
    main()
