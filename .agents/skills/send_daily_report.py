#!/usr/bin/env python3
"""V-HUB Daily Performance Report — sends beautiful HTML email to Kimberly & William"""

import os, json, urllib.request, urllib.parse
from datetime import datetime, timedelta, timezone
from collections import defaultdict

SENDGRID_KEY = os.environ.get("SENDGRID_API_KEY", "")
BASE44_API = "https://api.base44.app/api/apps/69d062aca815ce8e697894b1"

def api_list(entity, limit=500, skip=0, extra_headers=None):
    url = f"{BASE44_API}/entities/{entity}?limit={limit}&skip={skip}"
    req = urllib.request.Request(url, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read())

def fetch_all(entity):
    all_records = []
    skip = 0
    while True:
        batch = api_list(entity, limit=500, skip=skip)
        if not batch:
            break
        all_records.extend(batch)
        if len(batch) < 500:
            break
        skip += 500
    return all_records

# --- Date setup (ET = UTC-4 in May) ---
now_utc = datetime.now(timezone.utc)
now_et = now_utc - timedelta(hours=4)
today_key = now_et.strftime("%Y-%m-%d")
yesterday_et = now_et - timedelta(days=1)
yesterday_key = yesterday_et.strftime("%Y-%m-%d")
report_date = now_et.strftime("%A, %B %-d, %Y")

print(f"Fetching analytics for {today_key}...")
analytics = fetch_all("ProviderAnalytic")
print(f"  Total analytics records: {len(analytics)}")

print("Fetching providers...")
providers = fetch_all("Provider")
print(f"  Total providers: {len(providers)}")

provider_map = {p["id"]: p.get("business_name") or p.get("owner_name") or "Unknown" for p in providers}

# Filter events
today_events  = [e for e in analytics if e.get("date_key") == today_key and e.get("provider_id") != "test123"]
yest_events   = [e for e in analytics if e.get("date_key") == yesterday_key and e.get("provider_id") != "test123"]

def count(events, etype, pid_filter=None):
    result = [e for e in events if e.get("event_type") == etype]
    if pid_filter == "SITE":
        result = [e for e in result if e.get("provider_id") == "SITE"]
    elif pid_filter == "NOT_SITE":
        result = [e for e in result if e.get("provider_id") != "SITE"]
    return len(result)

homepage_views    = count(today_events, "homepage_view", "SITE")
profile_views     = count(today_events, "profile_view", "NOT_SITE")
search_appear     = count(today_events, "search_appearance")
classified_clicks = count(today_events, "classified_click")
lead_inquiries    = count(today_events, "lead_inquiry")
y_homepage        = count(yest_events, "homepage_view", "SITE")
y_profile         = count(yest_events, "profile_view", "NOT_SITE")
y_search          = count(yest_events, "search_appearance")
y_classified      = count(yest_events, "classified_click")
y_leads           = count(yest_events, "lead_inquiry")

def delta(a, b):
    if b == 0:
        return f'<span style="color:#00BFA5">+{a} new</span>' if a > 0 else '<span style="color:#aaa">-</span>'
    d = a - b
    pct = round((d / b) * 100)
    if d > 0: return f'<span style="color:#00BFA5">+{d} ({pct}%)</span>'
    if d < 0: return f'<span style="color:#E8431A">{d} ({pct}%)</span>'
    return '<span style="color:#aaa">same</span>'

# Top 10 providers by profile views
pv_map = defaultdict(int)
for e in today_events:
    if e.get("event_type") == "profile_view" and e.get("provider_id") != "SITE":
        pv_map[e["provider_id"]] += 1
top_providers = sorted(pv_map.items(), key=lambda x: -x[1])[:10]
top_providers = [(provider_map.get(pid, "Unknown"), cnt) for pid, cnt in top_providers]

# Top 5 villages
village_map = defaultdict(int)
for e in today_events:
    if e.get("event_type") == "search_appearance" and e.get("area_name"):
        village_map[e["area_name"]] += 1
top_villages = sorted(village_map.items(), key=lambda x: -x[1])[:5]

# 7-day trend
trend = []
for i in range(6, -1, -1):
    d = now_et - timedelta(days=i)
    key = d.strftime("%Y-%m-%d")
    label = d.strftime("%b %-d")
    views = sum(1 for e in analytics if e.get("date_key") == key and e.get("event_type") == "homepage_view" and e.get("provider_id") == "SITE")
    trend.append((label, views))

max_trend = max((v for _, v in trend), default=1) or 1
trend_bars = ""
for label, views in trend:
    h = max(round((views / max_trend) * 80), 4)
    trend_bars += f'<td style="text-align:center;padding:0 6px;vertical-align:bottom;"><div style="background:#E8431A;width:32px;height:{h}px;border-radius:4px 4px 0 0;margin:0 auto;"></div><div style="font-size:10px;color:#888;margin-top:4px;font-family:Arial,sans-serif;">{label}</div><div style="font-size:12px;font-weight:bold;color:#333;font-family:Arial,sans-serif;">{views}</div></td>'

if top_providers:
    top_provider_rows = "".join(
        f'<tr style="background:{"#fff" if i%2==0 else "#fafafa"}"><td style="padding:9px 14px;color:#aaa;font-family:Arial,sans-serif;">{i+1}</td><td style="padding:9px 14px;font-weight:600;color:#1B3D6F;font-family:Arial,sans-serif;">{name}</td><td style="padding:9px 14px;text-align:center;color:#E8431A;font-weight:bold;font-size:16px;font-family:Arial,sans-serif;">{cnt}</td></tr>'
        for i, (name, cnt) in enumerate(top_providers)
    )
else:
    top_provider_rows = '<tr><td colspan="3" style="padding:20px;text-align:center;color:#aaa;font-family:Arial,sans-serif;">No profile views recorded yet today</td></tr>'

if top_villages:
    top_village_rows = "".join(
        f'<tr><td style="padding:9px 14px;color:#aaa;font-family:Arial,sans-serif;">{i+1}.</td><td style="padding:9px 14px;color:#1B3D6F;font-weight:600;font-family:Arial,sans-serif;">{name}</td><td style="padding:9px 14px;text-align:right;color:#00BFA5;font-weight:bold;font-family:Arial,sans-serif;">{cnt}</td></tr>'
        for i, (name, cnt) in enumerate(top_villages)
    )
else:
    top_village_rows = '<tr><td colspan="3" style="padding:16px;color:#aaa;text-align:center;font-family:Arial,sans-serif;">No village searches yet today</td></tr>'

total_providers = sum(1 for p in providers if p.get("is_active") and p.get("is_visible"))
trial_providers = sum(1 for p in providers if p.get("subscription_status") == "trial" and p.get("is_active"))
paid_providers  = sum(1 for p in providers if p.get("subscription_status") == "active" and p.get("is_active"))

html = f"""<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;background:#f2ede4;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#1B3D6F;"><tr><td style="padding:28px;text-align:center;">
<img src="https://media.base44.com/images/public/69d062aca815ce8e697894b1/a9af95bc3_V-Hublogo.png" width="50" style="vertical-align:middle;margin-right:8px;border-radius:8px;"/>
<span style="font-size:26px;color:#fff;font-style:italic;font-weight:bold;font-family:Georgia,serif;vertical-align:middle;">V-Hub</span><br><br>
<span style="font-size:10px;color:#a0b8d8;letter-spacing:3px;text-transform:uppercase;font-family:Arial,sans-serif;">DAILY PERFORMANCE REPORT</span><br>
<span style="font-size:13px;color:#7a9cbf;font-family:Arial,sans-serif;">{report_date}</span>
</td></tr></table>
<table width="580" cellpadding="0" cellspacing="0" align="center" style="margin:20px auto;">

<tr><td style="padding-bottom:14px;"><table width="100%" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
<tr style="background:#E8431A;"><td style="padding:12px 16px;font-size:12px;color:#fff;font-family:Arial,sans-serif;font-weight:bold;letter-spacing:1px;">SITE TRAFFIC &mdash; TODAY vs YESTERDAY</td></tr>
<tr><td style="padding:14px;"><table width="100%" cellpadding="0" cellspacing="0"><tr>
<td style="width:20%;text-align:center;padding:8px 2px;"><div style="font-size:30px;font-weight:bold;color:#1B3D6F;font-family:Arial,sans-serif;">{homepage_views}</div><div style="font-size:9px;color:#888;font-family:Arial,sans-serif;text-transform:uppercase;margin-top:2px;">Homepage<br>Visits</div><div style="font-size:11px;margin-top:4px;font-family:Arial,sans-serif;">{delta(homepage_views,y_homepage)}</div></td>
<td style="width:20%;text-align:center;padding:8px 2px;border-left:1px solid #f0ebe0;"><div style="font-size:30px;font-weight:bold;color:#1B3D6F;font-family:Arial,sans-serif;">{profile_views}</div><div style="font-size:9px;color:#888;font-family:Arial,sans-serif;text-transform:uppercase;margin-top:2px;">Profile<br>Views</div><div style="font-size:11px;margin-top:4px;font-family:Arial,sans-serif;">{delta(profile_views,y_profile)}</div></td>
<td style="width:20%;text-align:center;padding:8px 2px;border-left:1px solid #f0ebe0;"><div style="font-size:30px;font-weight:bold;color:#1B3D6F;font-family:Arial,sans-serif;">{search_appear}</div><div style="font-size:9px;color:#888;font-family:Arial,sans-serif;text-transform:uppercase;margin-top:2px;">Search<br>Appear.</div><div style="font-size:11px;margin-top:4px;font-family:Arial,sans-serif;">{delta(search_appear,y_search)}</div></td>
<td style="width:20%;text-align:center;padding:8px 2px;border-left:1px solid #f0ebe0;"><div style="font-size:30px;font-weight:bold;color:#E8431A;font-family:Arial,sans-serif;">{classified_clicks}</div><div style="font-size:9px;color:#888;font-family:Arial,sans-serif;text-transform:uppercase;margin-top:2px;">Ad<br>Clicks</div><div style="font-size:11px;margin-top:4px;font-family:Arial,sans-serif;">{delta(classified_clicks,y_classified)}</div></td>
<td style="width:20%;text-align:center;padding:8px 2px;border-left:1px solid #f0ebe0;"><div style="font-size:30px;font-weight:bold;color:#00BFA5;font-family:Arial,sans-serif;">{lead_inquiries}</div><div style="font-size:9px;color:#888;font-family:Arial,sans-serif;text-transform:uppercase;margin-top:2px;">Lead<br>Inquiries</div><div style="font-size:11px;margin-top:4px;font-family:Arial,sans-serif;">{delta(lead_inquiries,y_leads)}</div></td>
</tr></table></td></tr></table></td></tr>

<tr><td style="padding-bottom:14px;"><table width="100%" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
<tr style="background:#1B3D6F;"><td style="padding:12px 16px;font-size:12px;color:#fff;font-family:Arial,sans-serif;font-weight:bold;letter-spacing:1px;">7-DAY HOMEPAGE VISIT TREND</td></tr>
<tr><td style="padding:20px;"><table align="center" cellpadding="0" cellspacing="0"><tr style="vertical-align:bottom;">{trend_bars}</tr></table></td></tr>
</table></td></tr>

<tr><td style="padding-bottom:14px;"><table width="100%" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
<tr style="background:#00BFA5;"><td style="padding:12px 16px;font-size:12px;color:#fff;font-family:Arial,sans-serif;font-weight:bold;letter-spacing:1px;">TOP 10 PROVIDERS BY PROFILE VIEWS TODAY</td></tr>
<tr><td><table width="100%" cellpadding="0" cellspacing="0">
<tr style="background:#f0ebe0;"><th style="padding:7px 14px;text-align:left;font-size:10px;color:#888;font-family:Arial,sans-serif;font-weight:normal;">#</th><th style="padding:7px 14px;text-align:left;font-size:10px;color:#888;font-family:Arial,sans-serif;font-weight:normal;">PROVIDER</th><th style="padding:7px 14px;text-align:center;font-size:10px;color:#888;font-family:Arial,sans-serif;font-weight:normal;">VIEWS</th></tr>
{top_provider_rows}</table></td></tr></table></td></tr>

<tr><td style="padding-bottom:14px;"><table width="100%" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
<tr style="background:#1B3D6F;"><td style="padding:12px 16px;font-size:12px;color:#fff;font-family:Arial,sans-serif;font-weight:bold;letter-spacing:1px;">TOP VILLAGES SEARCHED TODAY</td></tr>
<tr><td style="padding:6px 0;"><table width="100%" cellpadding="0" cellspacing="0">{top_village_rows}</table></td></tr>
</table></td></tr>

<tr><td style="padding-bottom:14px;"><table width="100%" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
<tr style="background:#E8431A;"><td style="padding:12px 16px;font-size:12px;color:#fff;font-family:Arial,sans-serif;font-weight:bold;letter-spacing:1px;">DIRECTORY HEALTH</td></tr>
<tr><td style="padding:16px;"><table width="100%" cellpadding="0" cellspacing="0"><tr>
<td style="text-align:center;padding:10px;"><div style="font-size:34px;font-weight:bold;color:#1B3D6F;font-family:Arial,sans-serif;">{total_providers}</div><div style="font-size:9px;color:#888;font-family:Arial,sans-serif;text-transform:uppercase;margin-top:3px;">Active Listings</div></td>
<td style="text-align:center;padding:10px;border-left:1px solid #f0ebe0;"><div style="font-size:34px;font-weight:bold;color:#E8431A;font-family:Arial,sans-serif;">{trial_providers}</div><div style="font-size:9px;color:#888;font-family:Arial,sans-serif;text-transform:uppercase;margin-top:3px;">On Trial</div></td>
<td style="text-align:center;padding:10px;border-left:1px solid #f0ebe0;"><div style="font-size:34px;font-weight:bold;color:#00BFA5;font-family:Arial,sans-serif;">{paid_providers}</div><div style="font-size:9px;color:#888;font-family:Arial,sans-serif;text-transform:uppercase;margin-top:3px;">Paid Subscribers</div></td>
</tr></table></td></tr></table></td></tr>

<tr><td style="padding-bottom:40px;text-align:center;">
<img src="https://media.base44.com/images/public/69d062aca815ce8e697894b1/0a0a19a9f_ronnie_hero_fixed.jpg" width="580" style="border-radius:10px;width:100%;height:130px;object-fit:cover;display:block;"/>
<p style="font-family:Arial,sans-serif;font-size:11px;color:#aaa;margin-top:10px;">Sent daily at noon ET by V-Hub Intelligence &nbsp;|&nbsp; <a href="https://www.v-hub.us/Wekcadmin" style="color:#E8431A;text-decoration:none;">Admin Dashboard</a> &nbsp;&bull;&nbsp; <a href="https://www.v-hub.us/Home" style="color:#1B3D6F;text-decoration:none;">Live Site</a></p>
</td></tr>
</table></body></html>"""

# Send via SendGrid
recipients = [
    {"email": "kimberlycook1980@gmail.com", "name": "Kimberly"},
    {"email": "evansrus@comcast.net", "name": "William"},
]

for r in recipients:
    payload = json.dumps({
        "from": {"email": "admin@v-hub.us", "name": "V-Hub Intelligence"},
        "personalizations": [{"to": [{"email": r["email"], "name": r["name"]}]}],
        "subject": f"V-Hub Daily Report \u2014 {report_date}",
        "content": [{"type": "text/html", "value": html}]
    }).encode()
    req = urllib.request.Request(
        "https://api.sendgrid.com/v3/mail/send",
        data=payload,
        headers={"Authorization": f"Bearer {SENDGRID_KEY}", "Content-Type": "application/json"},
        method="POST"
    )
    with urllib.request.urlopen(req, timeout=15) as resp:
        status = resp.status
    print(f"  Sent to {r['email']}: HTTP {status}")

print(json.dumps({
    "ok": True,
    "date": today_key,
    "stats": {
        "homepage_views": homepage_views,
        "profile_views": profile_views,
        "search_appearances": search_appear,
        "classified_clicks": classified_clicks,
        "lead_inquiries": lead_inquiries,
        "total_providers": total_providers,
        "trial_providers": trial_providers,
        "paid_providers": paid_providers,
    }
}))
