import requests
import json
import os
import sys

BASE_URL = "http://localhost:8000"
API_URL = f"{BASE_URL}/api/v1"
TOKEN = None

def print_section(title):
    print(f"\n{'='*60}\n{title}\n{'='*60}")

def pjson(data):
    print(json.dumps(data, indent=2))

def run():
    global TOKEN
    print_section("1. Backend health check (GET /)")
    try:
        r = requests.get(f"{BASE_URL}/")
        print(f"Status: {r.status_code}")
        pjson(r.json())
    except Exception as e:
        print(f"Error: {e}")

    print_section("2. Login (POST /auth/login)")
    try:
        r = requests.post(f"{API_URL}/auth/login", json={"email": "admin@example.com", "password": "adminpassword"})
        print(f"Status: {r.status_code}")
        data = r.json()
        pjson(data)
        TOKEN = data.get("access_token")
    except Exception as e:
        print(f"Error: {e}")

    headers = {"Authorization": f"Bearer {TOKEN}"} if TOKEN else {}

    print_section("3. Database verification")
    from sqlalchemy import create_engine, inspect
    db_url = "sqlite:///./knowledge_flow.db"
    engine = create_engine(db_url)
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    print(f"Tables found: {tables}")
    for required in ['roles', 'users', 'tasks', 'documents', 'activity_logs']:
        if required in tables:
            print(f" - {required}: OK")
        else:
            print(f" - {required}: MISSING")

    print_section("4. Task API (create, fetch, filter)")
    try:
        print("--- Create Task ---")
        task_data = {"title": "Test Task", "description": "Verification Task", "assigned_to": 1}
        r = requests.post(f"{API_URL}/tasks", json=task_data, headers=headers)
        print(f"Status: {r.status_code}")
        pjson(r.json())

        print("--- Fetch Tasks ---")
        r = requests.get(f"{API_URL}/tasks", headers=headers)
        print(f"Status: {r.status_code}")
        pjson(r.json())

        print("--- Filter Tasks (status=Pending) ---")
        r = requests.get(f"{API_URL}/tasks?status=Pending", headers=headers)
        print(f"Status: {r.status_code}")
        pjson(r.json())
    except Exception as e:
        print(f"Error: {e}")

    print_section("5. Document upload")
    try:
        with open("sample.txt", "w") as f:
            f.write("This is a sample document for testing semantic search and AI features.")
        with open("sample.txt", "rb") as f:
            files = {"file": ("sample.txt", f, "text/plain")}
            r = requests.post(f"{API_URL}/documents/", headers=headers, files=files)
        print(f"Status: {r.status_code}")
        pjson(r.json())
    except Exception as e:
        print(f"Error: {e}")

    print_section("6. Semantic search")
    try:
        search_data = {"query": "sample document", "top_k": 2}
        r = requests.post(f"{API_URL}/search", json=search_data, headers=headers)
        print(f"Status: {r.status_code}")
        pjson(r.json())
    except Exception as e:
        print(f"Error: {e}")

    print_section("7. Analytics")
    try:
        r = requests.get(f"{API_URL}/analytics", headers=headers)
        print(f"Status: {r.status_code}")
        pjson(r.json())
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    run()
