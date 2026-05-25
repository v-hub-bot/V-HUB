import os, json, urllib.request, urllib.error
from datetime import datetime, timedelta

TOKEN = os.environ.get("GOOGLE_SEARCH_CONSOLE_ACCESS_TOKEN", "")
SITE = "sc-domain:v-hub.us"

# Query last 28 days
end_date = datetime.now().date()
start_date = end_date - timedelta(days=28)

payload = json.dumps({
    "startDate": str(start_date),
    "endDate": str(end_date),
    "dimensions": ["query"],
    "rowLimit": 25
}).encode()

req = urllib.request.Request(
    f"https://www.googleapis.com/webmasters/v3/sites/{SITE}/searchAnalytics/query",
    data=payload,
    headers={"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"},
    method="POST"
)

try:
    with urllib.request.urlopen(req, timeout=30) as r:
        data = json.loads(r.read().decode())
        print(json.dumps(data, indent=2))
except urllib.error.HTTPError as e:
    error_body = e.read().decode()
    print(f"❌ Error {e.code}: {error_body}")
except Exception as e:
    print(f"❌ Exception: {str(e)}")
