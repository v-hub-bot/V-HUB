import os, json, urllib.request, urllib.error

BASE44_API = "https://api.base44.app"
APP_ID = "69d062aca815ce8e697894b1"
FUNCTION = "syncGoogleRatings"
API_KEY = os.environ.get("BASE44_API_KEY", "")

if not API_KEY:
    print("❌ BASE44_API_KEY not set")
    exit(1)

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

url = f"{BASE44_API}/apps/{APP_ID}/functions/{FUNCTION}"

try:
    req = urllib.request.Request(url, data=b'{}', headers=headers, method='POST')
    with urllib.request.urlopen(req, timeout=60) as resp:
        result = json.loads(resp.read().decode())
        print(json.dumps(result, indent=2))
except urllib.error.HTTPError as e:
    print(f"❌ Error {e.code}: {e.read().decode()}")
except Exception as e:
    print(f"❌ Error: {str(e)}")
