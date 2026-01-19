
import requests
import os

BASE_URL = "http://127.0.0.1:8000/api/v1"
PROPERTY_ID = "078a6a96-9f19-41cc-9c69-0ff9440eb63c"

# Paths to generated images (provided by system)
IMAGE_PATHS = [
    r"C:/Users/57313/.gemini/antigravity/brain/4b8ba630-9c9b-4447-a5e7-a6378b9c16e2/luxury_villa_living_room_1768854220533.png",
    r"C:/Users/57313/.gemini/antigravity/brain/4b8ba630-9c9b-4447-a5e7-a6378b9c16e2/luxury_villa_bedroom_1768854232412.png",
    r"C:/Users/57313/.gemini/antigravity/brain/4b8ba630-9c9b-4447-a5e7-a6378b9c16e2/luxury_villa_terrace_1768854246133.png"
]

def populate():
    # 1. Login
    print("Logging in...")
    login_data = {"username": "admin@local.dev", "password": "admin123"}
    response = requests.post(f"{BASE_URL}/auth/login", data=login_data)
    if response.status_code != 200:
        print(f"Login failed: {response.text}")
        return
    
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # 2. Upload images
    for i, path in enumerate(IMAGE_PATHS):
        if not os.path.exists(path):
            print(f"File not found: {path}")
            continue
            
        print(f"Uploading {path}...")
        is_main = (i == 0)
        with open(path, "rb") as f:
            files = {"file": (os.path.basename(path), f, "image/png")}
            params = {"is_main": str(is_main).lower()}
            res = requests.post(
                f"{BASE_URL}/properties/{PROPERTY_ID}/images", 
                files=files, 
                params=params,
                headers=headers
            )
            if res.status_code == 200:
                print(f"Successfully uploaded image {i+1}")
            else:
                print(f"Failed to upload image {i+1}: {res.text}")

if __name__ == "__main__":
    populate()
