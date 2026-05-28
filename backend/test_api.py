import requests
import json
import os
# pyrefly: ignore [missing-import]
from sqlalchemy import create_engine, inspect

BASE_URL = "http://localhost:8000"
API_URL = f"{BASE_URL}/api/v1"

def print_section(title):
    print(f"\n{'='*50}\n{title}\n{'='*50}")

def test_health():
    print_section("1. Backend health check (GET /)")
    try:
        response = requests.get(f"{BASE_URL}/")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    except Exception as e:
        print(f"Failed: {e}")

def test_login():
    print_section("2. Login (POST /api/v1/auth/login)")
    try:
        # Assuming admin/admin or similar exists. Wait, I should check DB for users or create one.
        # Let's try default if there's any.
        login_data = {"username": "admin", "password": "adminpassword"} 
        # I'll just hit the endpoint, maybe it fails with 401 if user doesn't exist, but let's see.
        response = requests.post(f"{API_URL}/auth/login", data=login_data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        if response.status_code == 200:
            return response.json().get("access_token")
    except Exception as e:
        print(f"Failed: {e}")
    return None

def test_db():
    print_section("3. Database verification")
    try:
        # DB URL from .env
        db_url = "mysql+pymysql://root:admin_password@localhost:3306/knowledge_flow_db"
        engine = create_engine(db_url)
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        print(f"Tables found: {tables}")
        for required in ['roles', 'users', 'tasks', 'documents', 'activity_logs']:
            if required in tables:
                print(f" - {required}: OK")
            else:
                print(f" - {required}: MISSING")
    except Exception as e:
        print(f"Failed: {e}")

if __name__ == "__main__":
    test_health()
    test_db()
    test_login()
