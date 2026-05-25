import urllib.request, urllib.error, json

BASE_URL = "https://api.base44.app/api/apps/69d062aca815ce8e697894b1/functions"
FUNCTIONS = [
    ("getProviders", "GET", {}, 200),
    ("providerLogin", "POST", {"vh_number": "VH-TEST1", "password": "wrong"}, 400),
    ("getDeals", "GET", {}, 200),
    ("getAdminData", "POST", {"test": "data"}, 401),
    ("trackEvent", "POST", {"event_type": "test", "area_name": "test"}, 200),
    ("submitReview", "POST", {"provider_id": "test"}, 400),
    ("requestPasswordReset", "POST", {"email": "test@test.com"}, 400),
]

results = []
failed = []

for func_name, method, body, expected_code in FUNCTIONS:
    url = f"{BASE_URL}/{func_name}"
    
    data = json.dumps(body).encode() if method == "POST" else None
    req = urllib.request.Request(url, data=data, method=method)
    if method == "POST":
        req.add_header("Content-Type", "application/json")
    
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            status = resp.status
    except urllib.error.HTTPError as e:
        status = e.code
    except Exception as e:
        status = f"ERROR: {str(e)}"
    
    passed = status == expected_code
    icon = "✅" if passed else "❌"
    results.append(f"{icon} {func_name:25} {method:6} → {status} (expected {expected_code})")
    
    if status == 404 or (isinstance(status, str) and "ERROR" in status):
        failed.append(f"{func_name}: {status}")

print("\n=== V-HUB Daily Health Check ===\n")
for r in results:
    print(r)

print(f"\n{'='*50}")
if failed:
    print(f"⚠️  FAILED: {len(failed)} function(s) not deployed or unreachable")
    for f in failed:
        print(f"   • {f}")
    exit(1)
else:
    print("✅ All 7 critical functions operational")
    exit(0)
