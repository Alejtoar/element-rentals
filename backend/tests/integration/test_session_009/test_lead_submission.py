"""
Integration tests for Session 009: Lead Submission and Webhook Notifications

Covers:
- Business Rule: Lead Metadata Traceability
- API: POST /api/v1/leads/guest
- API: POST /api/v1/leads/owner
- ADR: ADR_006_lead_metadata_traceability
- Session 009: Webhook notification integration

Tests verify that guest and owner leads are created with correct metadata
and that webhook notifications are sent (when configured).
"""

import requests

BASE_URL = "http://localhost:8000/api/v1"


def test_submit_guest_lead():
    """
    Test that guest lead submission captures all required metadata
    
    Verifies:
    - Lead is created successfully
    - Metadata fields are populated (ip_address, user_agent, referer)
    - Property association works
    - Desired dates are captured
    """
    guest_lead_data = {
        "name": "Integration Test Guest",
        "phone": "+573001234567",
        "message": "I'm interested in booking this property for my vacation",
        "source": "integration_test",
        "property_id": "6cb3e0aa-63df-486a-a5b4-9dfa35db82dd",
        "desired_dates": "2026-03-15 to 2026-03-22"
    }
    
    response = requests.post(
        f"{BASE_URL}/leads/guest",
        json=guest_lead_data
    )
    
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    
    lead = response.json()
    
    # Verify all input fields are preserved
    assert lead["name"] == guest_lead_data["name"]
    assert lead["phone"] == guest_lead_data["phone"]
    assert lead["message"] == guest_lead_data["message"]
    assert lead["source"] == guest_lead_data["source"]
    assert lead["property_id"] == guest_lead_data["property_id"]
    assert lead["desired_dates"] == guest_lead_data["desired_dates"]
    
    # Verify metadata is captured
    assert "id" in lead
    assert "created_at" in lead
    assert "ip_address" in lead
    assert "user_agent" in lead
    assert lead["ip_address"] is not None  # Should capture request IP
    assert lead["user_agent"] is not None  # Should capture User-Agent header
    
    # Referer is optional
    assert "referer" in lead
    
    return lead


def test_submit_owner_lead():
    """
    Test that owner lead submission captures all required metadata
    
    Verifies:
    - Lead is created successfully
    - Metadata fields are populated
    - Location field is captured
    """
    owner_lead_data = {
        "name": "Integration Test Owner",
        "phone": "+573007654321",
        "message": "I want to list my luxury villa in Tulum",
        "source": "integration_test",
        "location": "Tulum, Quintana Roo, Mexico"
    }
    
    response = requests.post(
        f"{BASE_URL}/leads/owner",
        json=owner_lead_data
    )
    
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    
    lead = response.json()
    
    # Verify all input fields are preserved
    assert lead["name"] == owner_lead_data["name"]
    assert lead["phone"] == owner_lead_data["phone"]
    assert lead["message"] == owner_lead_data["message"]
    assert lead["source"] == owner_lead_data["source"]
    assert lead["location"] == owner_lead_data["location"]
    
    # Verify metadata is captured
    assert "id" in lead
    assert "created_at" in lead
    assert "ip_address" in lead
    assert "user_agent" in lead
    assert lead["ip_address"] is not None
    assert lead["user_agent"] is not None
    
    return lead


def test_guest_lead_without_property():
    """
    Test that guest lead can be submitted without property_id
    
    This handles cases where guest is interested but hasn't selected
    a specific property yet.
    """
    guest_lead_data = {
        "name": "General Inquiry Guest",
        "phone": "+573009876543",
        "message": "I'm looking for properties in Playa del Carmen",
        "source": "integration_test",
        "desired_dates": "2026-04-01 to 2026-04-10"
    }
    
    response = requests.post(
        f"{BASE_URL}/leads/guest",
        json=guest_lead_data
    )
    
    assert response.status_code == 200
    lead = response.json()
    assert lead["property_id"] is None
    assert lead["desired_dates"] == guest_lead_data["desired_dates"]


def test_webhook_notification_note():
    """
    Note about webhook notification testing
    
    Webhook notifications require NOTIFICATIONS_WEBHOOK_URL to be configured
    in backend/.env. As of Session 009 QA, this was empty.
    
    To test webhook notifications:
    1. Set up a test webhook (webhook.site, Discord, or Slack)
    2. Configure NOTIFICATIONS_WEBHOOK_URL in .env
    3. Submit a lead
    4. Verify webhook receives POST request with lead data
    
    Expected webhook payload format:
    {
        "type": "guest_lead" | "owner_lead",
        "lead": { ...lead data... },
        "timestamp": "2026-01-20T23:00:00Z"
    }
    """
    print("\n" + "="*60)
    print("WEBHOOK NOTIFICATION TESTING")
    print("="*60)
    print("⚠️  Webhook URL is not configured in .env")
    print("To test webhook notifications:")
    print("1. Create a webhook at webhook.site, Discord, or Slack")
    print("2. Set NOTIFICATIONS_WEBHOOK_URL in backend/.env")
    print("3. Submit a test lead")
    print("4. Verify webhook receives the payload")
    print("="*60 + "\n")


if __name__ == "__main__":
    print("Running Session 009 Lead Submission Tests...\n")
    
    try:
        print("Test 1: Submit Guest Lead")
        lead = test_submit_guest_lead()
        print(f"✅ PASS: Guest lead created with ID: {lead['id']}")
        print(f"   Metadata captured: IP={lead['ip_address']}, UA={lead['user_agent'][:30]}...\n")
    except AssertionError as e:
        print(f"❌ FAIL: {e}\n")
    
    try:
        print("Test 2: Submit Owner Lead")
        lead = test_submit_owner_lead()
        print(f"✅ PASS: Owner lead created with ID: {lead['id']}")
        print(f"   Metadata captured: IP={lead['ip_address']}, UA={lead['user_agent'][:30]}...\n")
    except AssertionError as e:
        print(f"❌ FAIL: {e}\n")
    
    try:
        print("Test 3: Guest Lead Without Property")
        test_guest_lead_without_property()
        print("✅ PASS: Guest lead created without property association\n")
    except AssertionError as e:
        print(f"❌ FAIL: {e}\n")
    
    test_webhook_notification_note()
