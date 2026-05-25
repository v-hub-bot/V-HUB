import os, json, urllib.request, urllib.error, time

FUNCTION_URL = "https://v-hub-app-edf7f8e8.base44.app/api/functions/syncGoogleRatings"

for attempt in range(3):
    try:
        print(f"Attempt {attempt + 1}...")
        req = urllib.request.Request(FUNCTION_URL, data=b'{}', headers={"Content-Type": "application/json"}, method='POST')
        with urllib.request.urlopen(req, timeout=90) as resp:
            result = json.loads(resp.read().decode())
            print("✅ SUCCESS")
            print(json.dumps(result, indent=2))
            exit(0)
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        print(f"Error {e.code}: {body[:200]}")
        if attempt < 2:
            time.sleep(5)
