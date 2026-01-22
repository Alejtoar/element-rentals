import requests
import json
import time
import threading
from http.server import HTTPServer, BaseHTTPRequestHandler
import uuid

# Configuration
API_URL = "http://localhost:8000/api/v1"
MOCK_WEBHOOK_PORT = 9000
MOCK_WEBHOOK_URL = f"http://127.0.0.1:{MOCK_WEBHOOK_PORT}/webhook"

class MockWebhookHandler(BaseHTTPRequestHandler):
    received_payloads = []

    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        payload = json.loads(post_data.decode('utf-8'))
        MockWebhookHandler.received_payloads.append(payload)
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({"status": "ok"}).encode('utf-8'))

    def log_message(self, format, *args):
        return # Silence server logs

def run_mock_server():
    server = HTTPServer(('0.0.0.0', MOCK_WEBHOOK_PORT), MockWebhookHandler)
    server.serve_forever()

def test_webhook_activation():
    # 1. Start Mock Server in background
    print(f"Starting mock webhook server on port {MOCK_WEBHOOK_PORT}...")
    mock_thread = threading.Thread(target=run_mock_server, daemon=True)
    mock_thread.start()
    time.sleep(1) # Wait for server to start

    # Clear previous payloads if any
    MockWebhookHandler.received_payloads = []

    # 1.5 Verify Mock Server Connectivity
    print("Verifying mock server is reachable...")
    try:
        ping_resp = requests.post(MOCK_WEBHOOK_URL, json={"ping": "pong"})
        assert ping_resp.status_code == 200
        print("Mock server is reachable.")
    except Exception as e:
        print(f"ERROR: Cannot reach mock server: {e}")
        return

    # 2. Trigger Guest Lead Creation
    print("Triggering Guest Lead creation...")
    guest_data = {
        "name": "Test Guest",
        "email": "guest@test.com",
        "phone": "+123456789",
        "message": "I want to rent this property",
        "property_id": None, # Global inquiry
        "desired_dates": "July 2026"
    }
    headers = {
        "User-Agent": "TestAgent/1.0",
        "Referer": "http://localhost:3000/property/villa-test"
    }
    response = requests.post(f"{API_URL}/leads/guest", json=guest_data, headers=headers)
    assert response.status_code == 200, f"Failed guest lead: {response.text}"
    
    # 3. Trigger Owner Lead Creation
    print("Triggering Owner Lead creation...")
    owner_data = {
        "name": "Test Owner",
        "email": "owner@test.com",
        "phone": "+987654321",
        "message": "I want to list my apartment",
        "location": "Narnia"
    }
    response = requests.post(f"{API_URL}/leads/owner", json=owner_data, headers=headers)
    assert response.status_code == 200, f"Failed owner lead: {response.text}"

    # 4. Wait for webhooks to be processed
    print("Waiting for webhooks...")
    time.sleep(2)

    # 5. Verify results
    print(f"Received {len(MockWebhookHandler.received_payloads)} webhook payloads.")
    assert len(MockWebhookHandler.received_payloads) >= 2, "Should have received at least 2 webhooks"

    # Verify payloads
    found_guest = False
    found_owner = False

    for payload in MockWebhookHandler.received_payloads:
        inner_payload = payload.get("payload", {})
        if inner_payload.get("name") == "Test Guest":
            found_guest = True
            print("Verified Guest Lead Payload:")
            print(f"  IP: {inner_payload.get('ip_address')}")
            print(f"  User-Agent: {inner_payload.get('user_agent')}")
            print(f"  Referer: {inner_payload.get('referer')}")
            assert inner_payload.get("user_agent") == "TestAgent/1.0"
            assert inner_payload.get("referer") == "http://localhost:3000/property/villa-test"
        
        if inner_payload.get("name") == "Test Owner":
            found_owner = True
            print("Verified Owner Lead Payload:")
            assert inner_payload.get("location") == "Narnia"

    assert found_guest, "Guest lead webhook not found"
    assert found_owner, "Owner lead webhook not found"
    print("SUCCESS: Webhook activation verified!")

if __name__ == "__main__":
    try:
        test_webhook_activation()
    except Exception as e:
        print(f"TEST FAILED: {e}")
        exit(1)
