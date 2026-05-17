import os
from google.cloud import logging

os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "./service-account.json"
client = logging.Client(project="linkos-myhack-2026")
logger = client.logger("run.googleapis.com/stderr")

entries = client.list_entries(max_results=20, order_by=logging.DESCENDING)
for entry in entries:
    print(f"[{entry.timestamp}] {entry.payload}")
