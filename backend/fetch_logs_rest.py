import json
import urllib.request
import urllib.error
from google.oauth2 import service_account
import google.auth.transport.requests

# 1. Load credentials and get token
creds = service_account.Credentials.from_service_account_file(
    "./service-account.json",
    scopes=["https://www.googleapis.com/auth/cloud-platform"]
)
request = google.auth.transport.requests.Request()
creds.refresh(request)
token = creds.token

# 2. Call Cloud Logging API
url = "https://logging.googleapis.com/v2/entries:list"
headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}
data = {
    "resourceNames": ["projects/linkos-myhack-2026"],
    "filter": 'resource.type="cloud_run_revision" AND resource.labels.service_name="linkos-backend" AND severity>=ERROR',
    "orderBy": "timestamp desc",
    "pageSize": 5
}

req = urllib.request.Request(url, data=json.dumps(data).encode("utf-8"), headers=headers)
try:
    with urllib.request.urlopen(req) as response:
        res = json.loads(response.read().decode("utf-8"))
        entries = res.get("entries", [])
        if not entries:
            print("No error logs found.")
        for e in entries:
            print(f"[{e.get('timestamp')}] {e.get('textPayload', e.get('jsonPayload'))}")
except urllib.error.HTTPError as e:
    print(f"API Error: {e.code} {e.read().decode('utf-8')}")
