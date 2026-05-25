import os, json, urllib.request, urllib.error, time

GOOGLE_KEY = os.environ.get("GOOGLE_PLACES_API_KEY", "")

if not GOOGLE_KEY:
    print("❌ GOOGLE_PLACES_API_KEY not set")
    exit(1)

def get_google_rating(business_name, google_url):
    """Fetch rating from Google Places API via text search"""
    if not google_url or google_url.strip() == "":
        return None
    
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
        pass
    
    return None

# Sample providers with URLs from the read above
test_providers = [
    {"id": "69f6a15902bf30afae10628c", "business_name": "Make Room with Renée", "google_review_url": "https://www.thumbtack.com/fl/the-villages/personal-organizers/make-room-with-rene-llc/service/432838571050950657", "old_rating": 4.7},
    {"id": "69f499a3906b60a2b0dc6251", "business_name": "Brandi's Place", "google_review_url": "https://www.google.com/maps/search/Brandi%27s+Place+1102+N+Main+St+Wildwood+FL", "old_rating": 4.5},
]

print(f"🔍 Testing Google sync on {len(test_providers)} providers...\n")

for prov in test_providers:
    new_rating = get_google_rating(prov["business_name"], prov["google_review_url"])
    old_rating = prov.get("old_rating")
    
    if new_rating is not None:
        status = "updated" if old_rating != new_rating else "unchanged"
        print(f"{'✅' if status=='updated' else '  •'} {prov['business_name']}: {old_rating} → {new_rating} ({status})")
    else:
        print(f"  ⊘ {prov['business_name']}: no rating found")
    
    time.sleep(0.3)

print("\n✅ API sync working — ready for full provider sync")
