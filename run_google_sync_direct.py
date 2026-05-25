import os, json, urllib.request, urllib.error

# Try calling the function endpoint directly
FUNCTION_URL = "https://v-hub-app-edf7f8e8.base44.app/api/functions/syncGoogleRatings"

try:
    req = urllib.request.Request(FUNCTION_URL, data=b'{}', headers={"Content-Type": "application/json"}, method='POST')
    with urllib.request.urlopen(req, timeout=60) as resp:
        result = json.loads(resp.read().decode())
        print(json.dumps(result, indent=2))
except urllib.error.HTTPError as e:
    body = e.read().decode()
    print(f"❌ Error {e.code}:")
    print(body)
except Exception as e:
    print(f"❌ Error: {str(e)}")
