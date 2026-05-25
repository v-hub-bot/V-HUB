import os, json, urllib.request, urllib.error, time

BASE44_API = "https://api.base44.app"
MINI_APP_ID = "69d06ada8019d7e9edf7f8e8"
API_KEY = os.environ.get("BASE44_API_KEY", "")
GOOGLE_KEY = os.environ.get("GOOGLE_PLACES_API_KEY", "")

if not API_KEY or not GOOGLE_KEY:
    print("❌ Missing BASE44_API_KEY or GOOGLE_PLACES_API_KEY")
    exit(1)

# Read all providers with google_review_url
def get_providers():
    url = f"{BASE44_API}/apps/{MINI_APP_ID}/entities/Provider/read?limit=500"
    headers = {"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"}
    try:
        req = urllib.request.Request(url, headers=headers, method='GET')
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode())
            return data.get("data", [])
    except Exception as e:
        print(f"❌ Failed to read providers: {e}")
        return []

def get_google_rating(business_name, google_url):
    """Fetch rating from Google Places API"""
    if not google_url or not google_url.strip():
        return None
    
    # Try text search
    try:
        q = f"{business_name} The Villages Florida"
        search_url = f"https://maps.googleapis.com/maps/api/place/textsearch/json?query={urllib.parse.quote(q)}&key={GOOGLE_KEY}"
        req = urllib.request.Request(search_url)
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode())
            if data.get("results") and len(data["results"]) > 0:
                rating = data["results"][0].get("rating")
                if rating:
                    return round(rating * 10) / 10
    except Exception as e:
        print(f"  ⚠️  {business_name}: {str(e)[:60]}")
    
    return None

def update_provider(provider_id, google_rating):
    """Update provider's google_rating field"""
    url = f"{BASE44_API}/apps/{MINI_APP_ID}/entities/Provider/{provider_id}"
    headers = {"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"}
    payload = json.dumps({"google_rating": google_rating}).encode()
    
    try:
        req = urllib.request.Request(url, data=payload, headers=headers, method='PUT')
        with urllib.request.urlopen(req, timeout=30) as resp:
            return True
    except Exception as e:
        print(f"  ❌ Update failed: {e}")
        return False

# Main sync
print("📡 Fetching providers...")
providers = get_providers()
print(f"Found {len(providers)} providers")

targets = [p for p in providers if p.get("google_review_url") and p.get("is_active") and p.get("is_visible")]
print(f"Syncing {len(targets)} providers with Google URLs\n")

updated = 0
failed = 0
results = []

for prov in targets:
    try:
        new_rating = get_google_rating(prov["business_name"], prov["google_review_url"])
        old_rating = prov.get("google_rating")
        
        if new_rating is not None:
            if old_rating != new_rating:
                if update_provider(prov["id"], new_rating):
                    print(f"✅ {prov['business_name']}: {old_rating} → {new_rating}")
                    updated += 1
                    results.append({"name": prov["business_name"], "old": old_rating, "new": new_rating, "status": "updated"})
                else:
                    failed += 1
            else:
                print(f"  • {prov['business_name']}: {new_rating} (unchanged)")
                results.append({"name": prov["business_name"], "rating": new_rating, "status": "unchanged"})
        else:
            print(f"  ⊘ {prov['business_name']}: no rating found")
            failed += 1
            results.append({"name": prov["business_name"], "status": "no_rating_found"})
        
        time.sleep(0.2)  # Rate limit
        
    except Exception as e:
        print(f"❌ {prov['business_name']}: {str(e)}")
        failed += 1

print(f"\n✅ Summary: {updated} updated, {failed} failed out of {len(targets)} synced")
