import urllib.request, json

# Try to call a function we know should exist
functions = ["trackEvent", "getProviders", "submitReview"]

for fn in functions:
    url = f"https://v-hub-app-edf7f8e8.base44.app/api/functions/{fn}"
    try:
        req = urllib.request.Request(url, data=b'{}', headers={"Content-Type": "application/json"}, method='POST')
        with urllib.request.urlopen(req, timeout=10) as resp:
            print(f"✅ {fn} — callable")
    except Exception as e:
        print(f"❌ {fn} — {str(e)[:80]}")
