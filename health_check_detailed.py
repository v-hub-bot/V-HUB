import urllib.request, urllib.error, json

BASE_URL = "https://api.base44.app/api/apps/69d062aca815ce8e697894b1/functions"

# Test each function individually with detailed error info
tests = [
    ("getProviders", "GET", None, "200 or 405 (method route issue)"),
    ("getDeals", "GET", None, "200 (timeout indicates slow response or route issue)"),
    ("getAdminData", "POST", {}, "401 (auth required, expected)"),
    ("trackEvent", "POST", {"event_type": "test", "area_name": "test"}, "200"),
    ("submitReview", "POST", {"provider_id": "test"}, "400 (missing fields)"),
    ("requestPasswordReset", "POST", {"email": "test@test.com"}, "400 or 200?"),
    ("providerLogin", "POST", {"vh_number": "VH-TEST1", "password": "wrong"}, "400"),
]

print("=== Detailed V-HUB Health Check ===\n")

for func_name, method, body, expected in tests:
    url = f"{BASE_URL}/{func_name}"
    
    try:
        data = json.dumps(body).encode() if body is not None else None
        req = urllib.request.Request(url, data=data, method=method)
        if method == "POST":
            req.add_header("Content-Type", "application/json")
        
        with urllib.request.urlopen(req, timeout=5) as resp:
            status = resp.status
            response_text = resp.read().decode()[:200]
            result = f"✅ {status} — {response_text}"
    except urllib.error.HTTPError as e:
        status = e.code
        try:
            body_text = e.read().decode()[:200]
            result = f"ℹ️  {status} — {body_text}"
        except:
            result = f"ℹ️  {status}"
    except urllib.error.URLError as e:
        result = f"⚠️  {str(e)}"
    except Exception as e:
        result = f"❌ {type(e).__name__}: {str(e)}"
    
    print(f"{func_name:25} {method:6} → {result}")
    print(f"   Expected: {expected}\n")
