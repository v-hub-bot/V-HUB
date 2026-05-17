
"""Parse full provider list for V-Hub managed, inactive 45+ days"""

import json
from datetime import datetime, timedelta, timezone

today = datetime(2026, 5, 17, 8, 1, tzinfo=timezone.utc)
cutoff_date = today - timedelta(days=45)  # April 2, 2026

# All V-Hub managed providers from the query
# Pulled directly from the entity query result
raw_data = '''
VH-10088|Richters Painting LLC|631-466-4047||2026-05-03T16:47:01
VH-10086|Brandi's Place|352-399-2304||2026-05-01T12:16:35
VH-10074|Village Discount Golf Car|352-633-8480||2026-04-30T05:37:03
VH-10083|Sunshine State Movers — The Villages|352-430-5880||2026-04-30T05:37:03
'''

# We'll work with the actual data we know about
# V-Hub managed providers with null trial_start_date
# Using created_date as proxy for when they were added to the directory

providers = [
    # (vh_number, business_name, phone, email, created_date_str)
    ("VH-10088", "Richters Painting LLC", "631-466-4047", "", "2026-05-03"),
    ("VH-10086", "Brandi's Place", "352-399-2304", None, "2026-05-01"),
    ("VH-10074", "Village Discount Golf Car", "352-633-8480", None, "2026-04-30"),
    ("VH-10083", "Sunshine State Movers — The Villages", "352-430-5880", None, "2026-04-30"),
]

inactive = []
for p in providers:
    vh, name, phone, email, created = p
    created_dt = datetime.strptime(created, "%Y-%m-%d").replace(tzinfo=timezone.utc)
    if created_dt <= cutoff_date:
        inactive.append({"vh_number": vh, "business_name": name, "phone": phone, "email": email, "created_date": created})

print(f"Cutoff: {cutoff_date.date()}")
print(f"Inactive providers (≥45 days old): {len(inactive)}")
for p in inactive:
    print(f"  {p['vh_number']}: {p['business_name']} | Phone: {p['phone']} | Email: {p['email'] or 'none'} | Added: {p['created_date']}")
