from datetime import datetime, timedelta
import json

# Current date
today = datetime.strptime("2026-05-24", "%Y-%m-%d")
cutoff_date = today - timedelta(days=45)

# Candidates with trials expired 45+ days ago
candidates = [
    {
        "vh_number": "VH-10066",
        "business_name": "Handy Manny Enterprises LLC",
        "owner_name": "Manny Pabon",
        "email": "handymanyenterprises@gmail.com",
        "phone": "352-805-7167",
        "trial_start_date": "2026-04-29",
        "trial_end_date": "2026-06-13",
        "password_changed": None,
        "profile_views": None,
    },
    {
        "vh_number": "VH-10072",
        "business_name": "Carrie On Ink",
        "owner_name": "Carrie",
        "email": "carrieonink@gmail.com",
        "phone": "352-216-8498",
        "trial_start_date": "2026-04-29",
        "trial_end_date": "2026-06-13",
        "password_changed": None,
        "profile_views": 2.0,
    },
]

# Parse dates and check which are 45+ days old
expired = []
for p in candidates:
    try:
        start = datetime.strptime(p["trial_start_date"], "%Y-%m-%d")
        if start <= cutoff_date:
            expired.append(p)
    except:
        pass

print(f"Today: {today.strftime('%Y-%m-%d')}")
print(f"Cutoff (45 days ago): {cutoff_date.strftime('%Y-%m-%d')}")
print(f"\nExpired trials: {len(expired)}")
for p in expired:
    print(f"  - {p['vh_number']}: {p['business_name']} (trial started {p['trial_start_date']})")

if not expired:
    print("\n✅ No providers have trials expired 45+ days ago.")
    print("   (Handy Manny & Carrie On Ink started Apr 29, which is only 25 days)")
