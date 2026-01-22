from app.notifications.service import WebhookNotifier
from app.config import settings
import requests
import json
import time
import threading
from http.server import HTTPServer, BaseHTTPRequestHandler

# Mock Webhook Server
MOCK_WEBHOOK_PORT = 9001
MOCK_WEBHOOK_URL = f"http://127.0.0.1:{MOCK_WEBHOOK_PORT}/webhook"

class MockWebhookHandler(BaseHTTPRequestHandler):
    received_payloads = []
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        payload = json.loads(post_data.decode('utf-8'))
        MockWebhookHandler.received_payloads.append(payload)
        self.send_response(200)
        self.end_headers()
    def log_message(self, format, *args): return

def run_mock_server():
    server = HTTPServer(('127.0.0.1', MOCK_WEBHOOK_PORT), MockWebhookHandler)
    server.serve_forever()

def test_direct_notifier():
    print(f"Starting mock server on {MOCK_WEBHOOK_PORT}...")
    threading.Thread(target=run_mock_server, daemon=True).start()
    time.sleep(1)

    # Use the mock URL
    notifier = WebhookNotifier(webhook_url=MOCK_WEBHOOK_URL)
    
    lead_data = {
        "name": "Metadata Tester",
        "phone": "555-1234",
        "message": "Verify metadata",
        "ip_address": "127.0.0.1",
        "user_agent": "Mozilla/5.0 (Test)",
        "referer": "http://test.com/ref"
    }

    print("Sending direct lead notification...")
    notifier.notify_lead("guest", lead_data)
    
    time.sleep(1)
    print(f"Received {len(MockWebhookHandler.received_payloads)} payloads.")
    
    if len(MockWebhookHandler.received_payloads) > 0:
        p = MockWebhookHandler.received_payloads[0]
        inner = p.get("payload", {})
        print(f"Verified Metadata in Webhook:")
        print(f"  IP: {inner.get('ip_address')}")
        print(f"  User-Agent: {inner.get('user_agent')}")
        print(f"  Referer: {inner.get('referer')}")
        assert inner.get("user_agent") == "Mozilla/5.0 (Test)"
        print("SUCCESS: Logic verified.")
    else:
        print("FAILED: No payload received.")
        exit(1)

if __name__ == "__main__":
    test_direct_notifier()
