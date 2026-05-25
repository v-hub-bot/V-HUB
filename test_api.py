import os, json, urllib.request, urllib.error

BASE44_API = "https://api.base44.app"
MINI_APP_ID = "69d06ada8019d7e9edf7f8e8"
API_KEY = os.environ.get("BASE44_API_KEY", "")

if not API_KEY:
    print("❌ No API key")
    exit(1)

# Try different endpoint patterns
patterns = [
    f"{BASE44_API}/apps/{MINI_APP_ID}/entities/Provider/read",
    f"{BASE44_API}/apps/{MINI_APP_ID}/entities/Provider",
    f"{BASE44_API}/entity/{MINI_APP_ID}/Provider/list",
]

headers = {"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"}

for url in patterns:
    try:
        print(f"Trying: {url}")
        req = urllib.request.Request(url, headers=headers, method='GET')
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode())
            print(f"✅ SUCCESS: {len(data)} items\n")
            break
    except urllib.error.HTTPError as e:
        print(f"  Error {e.code}\n")
    except Exception as e:
        print(f"  Error: {str(e)[:60]}\n")
