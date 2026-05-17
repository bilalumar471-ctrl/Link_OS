import requests

url = "https://linkos-backend-1060057002633.asia-southeast1.run.app/api/auth/login"
headers = {
    "Origin": "https://linkos-myhack-2026.web.app",
    "Access-Control-Request-Method": "POST",
    "Access-Control-Request-Headers": "content-type"
}

print("Testing OPTIONS...")
r = requests.options(url, headers=headers)
print(f"Status: {r.status_code}")
print(f"Headers: {r.headers}")

url = "https://linkos-backend-1060057002633.asia-southeast1.run.app/api/stats"
print("\nTesting GET stats...")
r2 = requests.get(url, headers={"Origin": "https://linkos-myhack-2026.web.app"})
print(f"Status: {r2.status_code}")
print(f"Body: {r2.text}")
