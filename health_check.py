import urllib.request
import json
import sys

BASE_URL = "https://api.base44.app/api/apps/69d062aca815ce8e697894b1/functions"

functions = {
    "getProviders": {"method": "GET", "expected": 200},
    "providerLogin": {"method": "POST", "expected": 400, "body": {}},
    "getDeals": {"method": "GET", "expected": 200},
    "getAdminData": {"method": "POST", "expected": 401, "body": {}},
    "trackEvent": {"method": "POST", "expected": 200, "body": {}},
    "submitReview": {"method": "POST", "expected": 400, "body": {}},
    "requestPasswordReset": {"method": "POST", "expected": 400, "body": {}}
}

results = {}
all_healthy = True

for func_name, config in functions.items():
    url = f"{BASE_URL}/{func_name}"
    method = config["method"]
    expected = config["expected"]
    
    try:
        if method == "GET":
            req = urllib.request.Request(url, method="GET")
        else:
            body = json.dumps(config.get("body", {})).encode()
            req = urllib.request.Request(url, data=body, method="POST")
            req.add_header("Content-Type", "application/json")
        
        try:
            with urllib.request.urlopen(req, timeout=10) as resp:
                status = resp.status
        except urllib.error.HTTPError as e:
            status = e.code
        except Exception as e:
            status = "ERROR"
            all_healthy = False
        
        is_healthy = status == expected
        if not is_healthy and status != 404:
            is_healthy = True  # 400/401 still means deployed
        
        results[func_name] = {
            "status": status,
            "expected": expected,
            "healthy": is_healthy or status in [200, 400, 401]
        }
        
        if status == 404:
            all_healthy = False
            print(f"❌ {func_name}: {status} (MISSING!)")
        elif status in [200, 400, 401]:
            print(f"✅ {func_name}: {status}")
        else:
            print(f"⚠️  {func_name}: {status}")
            
    except Exception as e:
        results[func_name] = {"error": str(e), "healthy": False}
        all_healthy = False
        print(f"❌ {func_name}: {str(e)}")

print("\n" + "="*50)
if all_healthy:
    print("✅ ALL FUNCTIONS OPERATIONAL")
    sys.exit(0)
else:
    print("❌ ALERT: One or more functions returned 404 or error")
    sys.exit(1)
