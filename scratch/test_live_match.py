import requests

BASE_URL = "https://linkos-backend-1060057002633.asia-southeast1.run.app"

def test():
    # 1. Login to get token
    print("Logging in...")
    resp = requests.post(f"{BASE_URL}/api/auth/login", json={"username": "superadmin", "password": "admin123"})
    if not resp.ok:
        print("Login failed:", resp.text)
        return
    token = resp.json()["access_token"]
    print("Got token.")
    
    # 2. Call match endpoint
    print("Calling match/run...")
    headers = {"Authorization": f"Bearer {token}"}
    payload = {"programme_id": "prog-fintech-2026"}
    match_resp = requests.post(f"{BASE_URL}/api/match/run", json=payload, headers=headers)
    
    print("Response status:", match_resp.status_code)
    try:
        print("Response JSON:")
        print(match_resp.json())
    except:
        print("Response Text:")
        print(match_resp.text)

if __name__ == "__main__":
    test()
