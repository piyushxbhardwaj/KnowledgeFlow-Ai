import requests
import json
import time

BASE_URL = "http://localhost:8000/api/v1"

# 1. Login
r = requests.post(f"{BASE_URL}/auth/login", json={"email": "admin@example.com", "password": "adminpassword"})
token = r.json().get("access_token")
headers = {"Authorization": f"Bearer {token}"}

# 2. Upload "Password reset requires email verification."
with open("test_upload.txt", "w") as f:
    f.write("Password reset requires email verification.")
    
with open("test_upload.txt", "rb") as f:
    files = {"file": ("test_upload.txt", f, "text/plain")}
    r_upload = requests.post(f"{BASE_URL}/documents/", headers=headers, files=files)
    print("UPLOAD RESPONSE:", r_upload.json())

# Wait a sec for vector DB to flush if async (though it's sync)
time.sleep(1)

# 3. Search "How do I reset password?"
r_search = requests.post(f"{BASE_URL}/search", headers=headers, json={"query": "How do I reset password?", "top_k": 3})
print("SEARCH RESPONSE:", json.dumps(r_search.json(), indent=2))
