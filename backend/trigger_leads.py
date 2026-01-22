import requests
headers = {
    "User-Agent": "AntigravityBot/1.0",
    "Referer": "http://localhost:3000/property/villa-test"
}
guest_data = {
    "name": "Webhook Tester",
    "email": "test@webhook.site",
    "phone": "+123456",
    "message": "Testing live webhook",
    "property_id": None,
    "desired_dates": "Soon"
}
owner_data = {
    "name": "Owner Tester",
    "email": "owner@webhook.site",
    "phone": "+654321",
    "message": "Testing owner webhook",
    "location": "Medellin"
}
print("Sending Guest Lead...")
r1 = requests.post("http://localhost:8001/api/v1/leads/guest", json=guest_data, headers=headers)
print(f"Guest Lead Status: {r1.status_code}")
print("Sending Owner Lead...")
r2 = requests.post("http://localhost:8001/api/v1/leads/owner", json=owner_data, headers=headers)
print(f"Owner Lead Status: {r2.status_code}")
