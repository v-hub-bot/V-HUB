#!/usr/bin/env python3
"""V-HUB Daily Performance Report — COMPREHENSIVE v3
   Pulls: GA4 real traffic + internal analytics + classified ads + new signups + category breakdown
   Sends to: kimberlycook1980@gmail.com, evansrus@comcast.net
"""

import os, json, urllib.request, urllib.error
from datetime import datetime, timedelta, timezone
from collections import defaultdict

SENDGRID_KEY = os.environ.get("SENDGRID_API_KEY", "")
GA_TOKEN     = os.environ.get("GOOGLE_ANALYTICS_ACCESS_TOKEN", "")
GA_PROP      = "properties/534059288"
BASE44_API   = "https://api.base44.app/api/apps/69d062aca815ce8e697894b1"
RECIPIENTS   = ["kimberlycook1980@gmail.com", "evansrus@comcast.net"]
BASE44_KEY   = os.environ.get("BASE44_API_KEY", "")

# ── Helpers ──────────────────────────────────────────────────────────────────

def fetch_all(entity):
    all_records, skip = [], 0
    while True:
        url = f"{BASE44_API}/entities/{entity}?limit=500&skip={skip}"
        req = urllib.request.Request(url, headers={"Content-Type": "application/json", "api_key": BASE44_KEY})
        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                batch = json.loads(r.read())
        except Exception as e:
            print(f"  ⚠️  fetch_all({entity}) error: {e}")
            break
        if not batch:
            break
        all_records.extend(batch)
        if len(batch) < 500:
            break
        skip += 500
    return all_records

def ga4_report(payload):
    url = f"https://analyticsdata.googleapis.com/v1beta/{GA_PROP}:runReport"
    data = json.dumps(payload).encode()
    req = urllib.request.Request(url, data=data, headers={
        "Authorization": f"Bearer {GA_TOKEN}",
        "Content-Type": "application/json"
    })
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.loads(r.read())
    except Exception as e:
        print(f"  ⚠️  GA4 error: {e}")
        return {}

def send_email(subject, html):
    payload = json.dumps({
        "personalizations": [{"to": [{"email": e} for e in RECIPIENTS]}],
        "from": {"email": "admin@v-hub.us", "name": "V-HUB"},
        "subject": subject,
        "content": [{"type": "text/html", "value": html}]
    }).encode()
    req = urllib.request.Request(
        "https://api.sendgrid.com/v3/mail/send",
        data=payload,
        headers={"Authorization": f"Bearer {SENDGRID_KEY}", "Content-Type": "application/json"}
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return r.status
    except urllib.error.HTTPError as e:
        print(f"  ⚠️  SendGrid error: {e.read()}")
        return e.code

def delta_html(a, b):
    if b == 0:
        return f'<span style="color:#00BFA5;font-size:11px;">+{a} new</span>' if a > 0 else '<span style="color:#aaa;font-size:11px;">—</span>'
    d = a - b
    pct = round((d / b) * 100)
    if d > 0: return f'<span style="color:#00BFA5;font-size:11px;">▲ +{d} ({pct}%)</span>'
    if d < 0: return f'<span style="color:#E8431A;font-size:11px;">▼ {d} ({pct}%)</span>'
    return '<span style="color:#aaa;font-size:11px;">→ same</span>'

def stat_cell(val, label, delta="", color="#1B3D6F", border=True):
    b = 'border-left:1px solid #f0ebe0;' if border else ''
    return f'''<td style="width:16%;text-align:center;padding:14px 6px;{b}">
      <div style="font-size:28px;font-weight:bold;color:{color};font-family:Arial,sans-serif;">{val}</div>
      <div style="font-size:9px;color:#888;font-family:Arial,sans-serif;text-transform:uppercase;margin-top:3px;line-height:1.3;">{label}</div>
      <div style="margin-top:5px;">{delta}</div>
    </td>'''

# ── Date Setup ───────────────────────────────────────────────────────────────
now_utc   = datetime.now(timezone.utc)
now_et    = now_utc - timedelta(hours=4)
today_key = now_et.strftime("%Y-%m-%d")
yest_key  = (now_et - timedelta(days=1)).strftime("%Y-%m-%d")
week_ago  = (now_et - timedelta(days=7)).strftime("%Y-%m-%d")
report_date = now_et.strftime("%A, %B %-d, %Y")
report_time = now_et.strftime("%-I:%M %p ET")

print(f"📅 Report date: {report_date}")

# ── Fetch Internal Data ──────────────────────────────────────────────────────
print("Fetching analytics...")
analytics = fetch_all("ProviderAnalytic")
print(f"  {len(analytics)} records")

print("Fetching providers...")
providers = fetch_all("Provider")
print(f"  {len(providers)} records")

print("Fetching classified ads...")
ads = fetch_all("ClassifiedAd")

print("Fetching leads...")
leads = fetch_all("LeadInquiry")

print("Fetching reviews...")
reviews = fetch_all("ProviderReview")

# ── Provider Map ─────────────────────────────────────────────────────────────
provider_map = {p["id"]: p.get("business_name") or p.get("owner_name") or "Unknown" for p in providers}

# ── Filter Analytics ─────────────────────────────────────────────────────────
prior_14 = (now_et - timedelta(days=14)).strftime("%Y-%m-%d")

EXCLUDED_PIDS = ("test123", "VH-TEST1")

# Last 7 days (current week)
week_ev  = [e for e in analytics if e.get("date_key", "") >= week_ago  and e.get("provider_id") not in EXCLUDED_PIDS]
# Prior 7 days (comparison week)
prior_ev = [e for e in analytics if prior_14 <= e.get("date_key", "") < week_ago and e.get("provider_id") not in EXCLUDED_PIDS]

def cnt(events, etype, pid=None):
    r = [e for e in events if e.get("event_type") == etype]
    if pid == "SITE": r = [e for e in r if e.get("provider_id") == "SITE"]
    if pid == "OTHER": r = [e for e in r if e.get("provider_id") != "SITE"]
    return len(r)

# This week internal stats
t_hp   = cnt(week_ev, "homepage_view", "SITE")
t_pv   = cnt(week_ev, "profile_view", "OTHER")
t_sa   = cnt(week_ev, "search_appearance")
t_cc   = cnt(week_ev, "classified_click") + cnt(week_ev, "classified_ad_click")
t_li   = cnt(week_ev, "lead_inquiry")

# Prior week (for comparison delta)
y_hp   = cnt(prior_ev, "homepage_view", "SITE")
y_pv   = cnt(prior_ev, "profile_view", "OTHER")
y_sa   = cnt(prior_ev, "search_appearance")
y_cc   = cnt(prior_ev, "classified_click") + cnt(prior_ev, "classified_ad_click")
y_li   = cnt(prior_ev, "lead_inquiry")

# ── GA4 Data ─────────────────────────────────────────────────────────────────
print("Fetching GA4 data...")
ga_daily = ga4_report({
    "dateRanges": [{"startDate": "7daysAgo", "endDate": "today"}],
    "dimensions": [{"name": "date"}],
    "metrics": [{"name": "totalUsers"}, {"name": "screenPageViews"}, {"name": "sessions"}, {"name": "newUsers"}],
    "orderBys": [{"dimension": {"dimensionName": "date"}}]
})

ga_totals = ga4_report({
    "dateRanges": [{"startDate": "today", "endDate": "today"}],
    "metrics": [{"name": "totalUsers"}, {"name": "newUsers"}, {"name": "sessions"}, {"name": "screenPageViews"}, {"name": "bounceRate"}, {"name": "averageSessionDuration"}]
})

ga_yesterday = ga4_report({
    "dateRanges": [{"startDate": "yesterday", "endDate": "yesterday"}],
    "metrics": [{"name": "totalUsers"}, {"name": "sessions"}, {"name": "screenPageViews"}]
})

ga_sources = ga4_report({
    "dateRanges": [{"startDate": "7daysAgo", "endDate": "today"}],
    "dimensions": [{"name": "sessionDefaultChannelGroup"}],
    "metrics": [{"name": "sessions"}, {"name": "totalUsers"}],
    "orderBys": [{"metric": {"metricName": "sessions"}, "desc": True}],
    "limit": 8
})

ga_devices = ga4_report({
    "dateRanges": [{"startDate": "7daysAgo", "endDate": "today"}],
    "dimensions": [{"name": "deviceCategory"}],
    "metrics": [{"name": "sessions"}, {"name": "totalUsers"}]
})

ga_pages = ga4_report({
    "dateRanges": [{"startDate": "7daysAgo", "endDate": "today"}],
    "dimensions": [{"name": "pagePath"}],
    "metrics": [{"name": "screenPageViews"}, {"name": "totalUsers"}],
    "orderBys": [{"metric": {"metricName": "screenPageViews"}, "desc": True}],
    "limit": 8
})

# Parse GA4
def ga_int(data, metric_idx, row_idx=0):
    try:
        return int(data["rows"][row_idx]["metricValues"][metric_idx]["value"])
    except:
        return 0

def ga_float(data, metric_idx, row_idx=0):
    try:
        return float(data["rows"][row_idx]["metricValues"][metric_idx]["value"])
    except:
        return 0.0

ga_users_today    = ga_int(ga_totals, 0)
ga_new_today      = ga_int(ga_totals, 1)
ga_sessions_today = ga_int(ga_totals, 2)
ga_views_today    = ga_int(ga_totals, 3)
ga_bounce_today   = round(ga_float(ga_totals, 4) * 100, 1)
ga_avg_dur        = int(ga_float(ga_totals, 5))
ga_dur_min        = ga_avg_dur // 60
ga_dur_sec        = ga_avg_dur % 60

ga_users_yest     = ga_int(ga_yesterday, 0)
ga_sessions_yest  = ga_int(ga_yesterday, 1)
ga_views_yest     = ga_int(ga_yesterday, 2)

# 7-day GA4 trend table
ga_daily_rows = ga_daily.get("rows", [])
ga_trend = []
for row in ga_daily_rows:
    d = row["dimensionValues"][0]["value"]
    date_label = f"{d[4:6]}/{d[6:]}"
    u  = int(row["metricValues"][0]["value"])
    pv = int(row["metricValues"][1]["value"])
    s  = int(row["metricValues"][2]["value"])
    nu = int(row["metricValues"][3]["value"])
    ga_trend.append((date_label, u, pv, s, nu))

max_ga_users = max((r[1] for r in ga_trend), default=1) or 1
ga_trend_bars = ""
for label, u, pv, s, nu in ga_trend:
    h = max(round((u / max_ga_users) * 70), 4)
    ga_trend_bars += f'''<td style="text-align:center;padding:0 4px;vertical-align:bottom;">
      <div style="background:#1B3D6F;width:34px;height:{h}px;border-radius:4px 4px 0 0;margin:0 auto;"></div>
      <div style="font-size:9px;color:#888;font-family:Arial,sans-serif;margin-top:3px;">{label}</div>
      <div style="font-size:11px;font-weight:bold;color:#1B3D6F;font-family:Arial,sans-serif;">{u}</div>
    </td>'''

# GA4 traffic sources
source_rows = ""
for row in ga_sources.get("rows", [])[:6]:
    ch = row["dimensionValues"][0]["value"]
    s  = int(row["metricValues"][0]["value"])
    u  = int(row["metricValues"][1]["value"])
    source_rows += f'<tr><td style="padding:7px 12px;font-family:Arial,sans-serif;color:#333;font-size:13px;">{ch}</td><td style="padding:7px 12px;text-align:center;font-family:Arial,sans-serif;font-weight:bold;color:#1B3D6F;">{s}</td><td style="padding:7px 12px;text-align:center;font-family:Arial,sans-serif;font-weight:bold;color:#00BFA5;">{u}</td></tr>'
if not source_rows:
    source_rows = '<tr><td colspan="3" style="padding:14px;text-align:center;color:#aaa;font-family:Arial,sans-serif;">No data yet</td></tr>'

# GA4 device breakdown
device_rows = ""
for row in ga_devices.get("rows", []):
    dv = row["dimensionValues"][0]["value"].title()
    s  = int(row["metricValues"][0]["value"])
    u  = int(row["metricValues"][1]["value"])
    device_rows += f'<tr><td style="padding:7px 12px;font-family:Arial,sans-serif;color:#333;font-size:13px;">{dv}</td><td style="padding:7px 12px;text-align:center;font-family:Arial,sans-serif;font-weight:bold;color:#1B3D6F;">{s}</td><td style="padding:7px 12px;text-align:center;font-family:Arial,sans-serif;font-weight:bold;color:#00BFA5;">{u}</td></tr>'
if not device_rows:
    device_rows = '<tr><td colspan="3" style="padding:14px;text-align:center;color:#aaa;font-family:Arial,sans-serif;">No data yet</td></tr>'

# GA4 top pages
page_rows = ""
for row in ga_pages.get("rows", [])[:6]:
    path = row["dimensionValues"][0]["value"]
    pv   = int(row["metricValues"][0]["value"])
    u    = int(row["metricValues"][1]["value"])
    page_rows += f'<tr><td style="padding:7px 12px;font-family:Arial,sans-serif;color:#333;font-size:12px;">{path}</td><td style="padding:7px 12px;text-align:center;font-family:Arial,sans-serif;font-weight:bold;color:#E8431A;">{pv}</td><td style="padding:7px 12px;text-align:center;font-family:Arial,sans-serif;color:#666;">{u}</td></tr>'
if not page_rows:
    page_rows = '<tr><td colspan="3" style="padding:14px;text-align:center;color:#aaa;font-family:Arial,sans-serif;">No data yet</td></tr>'

# ── Provider Stats ────────────────────────────────────────────────────────────
active_providers = [p for p in providers if p.get("is_active") and p.get("is_visible") and p.get("id") != "VH-TEST1"]
trial_providers  = [p for p in active_providers if p.get("subscription_status") == "trial"]
paid_providers   = [p for p in active_providers if p.get("subscription_status") == "active"]
total_active     = len(active_providers)

# New signups today and this week
def is_today(p):
    cd = p.get("created_date", "")
    return str(cd)[:10] == today_key

def is_this_week(p):
    cd = p.get("created_date", "")
    return str(cd)[:10] >= week_ago

new_today = [p for p in providers if is_today(p)]
new_week  = [p for p in providers if is_this_week(p)]

new_today_rows = ""
for p in new_today:
    new_today_rows += f'<tr><td style="padding:7px 12px;font-family:Arial,sans-serif;font-weight:bold;color:#1B3D6F;">{p.get("business_name","")}</td><td style="padding:7px 12px;font-family:Arial,sans-serif;color:#666;">{p.get("owner_name","")}</td><td style="padding:7px 12px;font-family:Arial,sans-serif;color:#E8431A;font-weight:bold;">{p.get("vh_number","")}</td></tr>'
if not new_today_rows:
    new_today_rows = '<tr><td colspan="3" style="padding:14px;text-align:center;color:#aaa;font-family:Arial,sans-serif;">No new sign-ups today</td></tr>'

new_week_rows = ""
for p in new_week:
    cd = str(p.get("created_date",""))[:10]
    new_week_rows += f'<tr><td style="padding:6px 12px;font-family:Arial,sans-serif;color:#333;font-size:12px;">{p.get("business_name","")}</td><td style="padding:6px 12px;font-family:Arial,sans-serif;color:#666;font-size:12px;">{p.get("vh_number","")}</td><td style="padding:6px 12px;font-family:Arial,sans-serif;color:#888;font-size:12px;">{cd}</td></tr>'
if not new_week_rows:
    new_week_rows = '<tr><td colspan="3" style="padding:14px;text-align:center;color:#aaa;font-family:Arial,sans-serif;">No new sign-ups this week</td></tr>'

# ── Top 5 Providers by Profile Views (all time this week) ────────────────────
week_ev = [e for e in analytics if e.get("date_key", "") >= week_ago and e.get("provider_id") not in ("test123", "VH-TEST1", "SITE")]
pv_map = defaultdict(int)
for e in week_ev:
    if e.get("event_type") == "profile_view":
        pv_map[e["provider_id"]] += 1
top5 = sorted(pv_map.items(), key=lambda x: -x[1])[:5]
top5_rows = ""
for i, (pid, cnt_v) in enumerate(top5):
    name = provider_map.get(pid, "Unknown")
    bg = "#fff" if i % 2 == 0 else "#fafafa"
    medal = ["🥇","🥈","🥉","4️⃣","5️⃣"][i]
    top5_rows += f'<tr style="background:{bg}"><td style="padding:10px 14px;font-size:18px;">{medal}</td><td style="padding:10px 14px;font-family:Arial,sans-serif;font-weight:bold;color:#1B3D6F;">{name}</td><td style="padding:10px 14px;text-align:center;font-family:Arial,sans-serif;font-size:20px;font-weight:bold;color:#E8431A;">{cnt_v}</td></tr>'
if not top5_rows:
    top5_rows = '<tr><td colspan="3" style="padding:18px;text-align:center;color:#aaa;font-family:Arial,sans-serif;">No profile views recorded this week</td></tr>'

# ── Category Search Breakdown ─────────────────────────────────────────────────
cat_map = defaultdict(int)
for e in week_ev:
    if e.get("event_type") == "search_appearance" and e.get("category_name"):
        cat_map[e["category_name"]] += 1
top_cats = sorted(cat_map.items(), key=lambda x: -x[1])[:8]
cat_rows = ""
for cat, c in top_cats:
    cat_rows += f'<tr><td style="padding:7px 14px;font-family:Arial,sans-serif;color:#333;">{cat}</td><td style="padding:7px 14px;text-align:right;font-family:Arial,sans-serif;font-weight:bold;color:#1B3D6F;">{c}</td></tr>'
if not cat_rows:
    cat_rows = '<tr><td colspan="2" style="padding:14px;text-align:center;color:#aaa;font-family:Arial,sans-serif;">No category search data yet</td></tr>'

# ── Village Search Breakdown ──────────────────────────────────────────────────
village_map = defaultdict(int)
for e in week_ev:
    if e.get("event_type") == "search_appearance" and e.get("area_name"):
        village_map[e["area_name"]] += 1
top_villages = sorted(village_map.items(), key=lambda x: -x[1])[:8]
vil_rows = ""
for v, c in top_villages:
    vil_rows += f'<tr><td style="padding:7px 14px;font-family:Arial,sans-serif;color:#333;">{v}</td><td style="padding:7px 14px;text-align:right;font-family:Arial,sans-serif;font-weight:bold;color:#00BFA5;">{c}</td></tr>'
if not vil_rows:
    vil_rows = '<tr><td colspan="2" style="padding:14px;text-align:center;color:#aaa;font-family:Arial,sans-serif;">No village search data yet</td></tr>'

# ── Live Classified Ads ───────────────────────────────────────────────────────
live_ads = [a for a in ads if a.get("is_active")]
ad_rows = ""
for a in live_ads:
    expires = str(a.get("deal_expires_at",""))[:10]
    headline = a.get("headline","")[:60]
    pname = a.get("provider_name","")
    slot = a.get("slot_number","")
    # Count clicks for this ad's provider
    provider_id = a.get("provider_id","")
    ad_clicks = sum(1 for e in analytics if e.get("provider_id") == provider_id and e.get("event_type") == "classified_click")
    ad_rows += f'''<tr>
      <td style="padding:10px 14px;font-family:Arial,sans-serif;font-weight:bold;color:#1B3D6F;">{pname}</td>
      <td style="padding:10px 14px;font-family:Arial,sans-serif;color:#555;font-size:12px;">{headline}</td>
      <td style="padding:10px 14px;text-align:center;font-family:Arial,sans-serif;color:#E8431A;font-weight:bold;">{ad_clicks}</td>
      <td style="padding:10px 14px;text-align:center;font-family:Arial,sans-serif;color:#666;font-size:12px;">{expires}</td>
    </tr>'''
if not ad_rows:
    ad_rows = '<tr><td colspan="4" style="padding:14px;text-align:center;color:#aaa;font-family:Arial,sans-serif;">No live ads running</td></tr>'

# ── Pending Reviews ───────────────────────────────────────────────────────────
pending_reviews = [r for r in reviews if not r.get("is_approved")]
pending_review_note = f'{len(pending_reviews)} review(s) awaiting approval' if pending_reviews else 'All reviews approved ✅'

# ── Pending Leads ─────────────────────────────────────────────────────────────
total_leads_week = sum(1 for l in leads if str(l.get("created_date",""))[:10] >= week_ago)
total_leads_alltime = len(leads)

# ── Build HTML ────────────────────────────────────────────────────────────────
LOGO = "https://media.base44.com/images/public/69d062aca815ce8e697894b1/a9af95bc3_V-Hublogo.png"

section_header = lambda title, color="#E8431A": f'''<tr style="background:{color};">
  <td colspan="10" style="padding:12px 18px;font-size:12px;color:#fff;font-family:Arial,sans-serif;font-weight:bold;letter-spacing:1px;">{title}</td>
</tr>'''

html = f"""<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f2ede4;font-family:Arial,sans-serif;">

<!-- HEADER -->
<table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#1B3D6F,#0d2444);">
<tr><td style="padding:32px 24px;text-align:center;">
  <img src="{LOGO}" width="56" style="border-radius:10px;margin-bottom:10px;display:block;margin-left:auto;margin-right:auto;" /><br>
  <span style="font-size:30px;color:#fff;font-style:italic;font-weight:bold;font-family:Georgia,serif;">V-Hub</span><br><br>
  <span style="font-size:10px;color:#a0b8d8;letter-spacing:4px;text-transform:uppercase;">Daily Performance Report</span><br>
  <span style="font-size:14px;color:#7a9cbf;margin-top:6px;display:block;">{report_date} &nbsp;·&nbsp; Generated {report_time}</span>
</td></tr></table>

<table width="620" cellpadding="0" cellspacing="0" align="center" style="margin:24px auto;">

<!-- ═══════════════ 1. GOOGLE ANALYTICS (REAL TRAFFIC) ═══════════════ -->
<tr><td style="padding-bottom:18px;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.09);">
  {section_header("📊 GOOGLE ANALYTICS — REAL TRAFFIC (TODAY)", "#1B3D6F")}
  <tr><td style="padding:20px 14px;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      {stat_cell(ga_users_today, "Unique<br>Visitors", delta_html(ga_users_today, ga_users_yest), "#1B3D6F", False)}
      {stat_cell(ga_new_today, "New<br>Visitors", "", "#00BFA5")}
      {stat_cell(ga_sessions_today, "Sessions", delta_html(ga_sessions_today, ga_sessions_yest), "#1B3D6F")}
      {stat_cell(ga_views_today, "Page<br>Views", delta_html(ga_views_today, ga_views_yest), "#E8431A")}
      {stat_cell(f"{ga_bounce_today}%", "Bounce<br>Rate", "", "#888")}
      {stat_cell(f"{ga_dur_min}m {ga_dur_sec}s", "Avg Session<br>Duration", "", "#00BFA5")}
    </tr></table>
  </td></tr>

  <!-- 7-day GA4 bar chart -->
  <tr><td style="padding:0 20px 10px;">
    <div style="font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;">7-Day Unique Visitors (Google Analytics)</div>
    <table cellpadding="0" cellspacing="0"><tr>{ga_trend_bars}</tr></table>
  </td></tr>
</table>
</td></tr>

<!-- ═══════════════ 2. TRAFFIC SOURCES ═══════════════ -->
<tr><td style="padding-bottom:18px;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.09);">
  {section_header("🔗 TRAFFIC SOURCES — LAST 7 DAYS", "#1B3D6F")}
  <tr><td style="padding:6px 0;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr style="background:#f7f4ee;"><td style="padding:8px 12px;font-size:11px;color:#888;font-weight:bold;">Channel</td><td style="padding:8px 12px;text-align:center;font-size:11px;color:#888;font-weight:bold;">Sessions</td><td style="padding:8px 12px;text-align:center;font-size:11px;color:#888;font-weight:bold;">Users</td></tr>
      {source_rows}
    </table>
  </td></tr>
</table>
</td></tr>

<!-- ═══════════════ 3. DEVICE BREAKDOWN + TOP PAGES ═══════════════ -->
<tr><td style="padding-bottom:18px;">
<table width="100%" cellpadding="0" cellspacing="0"><tr>

  <td style="width:48%;vertical-align:top;padding-right:8px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.09);">
    {section_header("📱 DEVICE BREAKDOWN", "#1B3D6F")}
    <tr><td style="padding:6px 0;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr style="background:#f7f4ee;"><td style="padding:8px 12px;font-size:11px;color:#888;font-weight:bold;">Device</td><td style="padding:8px 12px;text-align:center;font-size:11px;color:#888;font-weight:bold;">Sessions</td><td style="padding:8px 12px;text-align:center;font-size:11px;color:#888;font-weight:bold;">Users</td></tr>
        {device_rows}
      </table>
    </td></tr>
  </table>
  </td>

  <td style="width:48%;vertical-align:top;padding-left:8px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.09);">
    {section_header("📄 TOP PAGES", "#1B3D6F")}
    <tr><td style="padding:6px 0;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr style="background:#f7f4ee;"><td style="padding:8px 12px;font-size:11px;color:#888;font-weight:bold;">Page</td><td style="padding:8px 12px;text-align:center;font-size:11px;color:#888;font-weight:bold;">Views</td><td style="padding:8px 12px;text-align:center;font-size:11px;color:#888;font-weight:bold;">Users</td></tr>
        {page_rows}
      </table>
    </td></tr>
  </table>
  </td>

</tr></table>
</td></tr>

<!-- ═══════════════ 4. INTERNAL ENGAGEMENT ═══════════════ -->
<tr><td style="padding-bottom:18px;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.09);">
  {section_header("🎯 INTERNAL ENGAGEMENT — LAST 7 DAYS vs PRIOR 7 DAYS", "#E8431A")}
  <tr><td style="padding:20px 10px;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      {stat_cell(t_hp, "Homepage<br>Hits", delta_html(t_hp, y_hp), "#1B3D6F", False)}
      {stat_cell(t_pv, "Profile<br>Views", delta_html(t_pv, y_pv), "#1B3D6F")}
      {stat_cell(t_sa, "Search<br>Appear.", delta_html(t_sa, y_sa), "#1B3D6F")}
      {stat_cell(t_cc, "Ad<br>Clicks", delta_html(t_cc, y_cc), "#E8431A")}
      {stat_cell(t_li, "Lead<br>Inquiries", delta_html(t_li, y_li), "#00BFA5")}
      {stat_cell(total_leads_week, "Leads<br>This Week", "", "#00BFA5")}
    </tr></table>
  </td></tr>
</table>
</td></tr>

<!-- ═══════════════ 5. TOP 5 PROVIDERS THIS WEEK ═══════════════ -->
<tr><td style="padding-bottom:18px;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.09);">
  {section_header("🏆 TOP 5 MOST VIEWED PROVIDERS — THIS WEEK", "#E8431A")}
  <tr><td style="padding:4px 0;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr style="background:#f7f4ee;"><td style="padding:8px 14px;font-size:11px;color:#888;font-weight:bold;width:40px;">#</td><td style="padding:8px 14px;font-size:11px;color:#888;font-weight:bold;">Provider</td><td style="padding:8px 14px;text-align:center;font-size:11px;color:#888;font-weight:bold;">Profile Views</td></tr>
      {top5_rows}
    </table>
  </td></tr>
</table>
</td></tr>

<!-- ═══════════════ 6. CATEGORY + VILLAGE SEARCH BREAKDOWN ═══════════════ -->
<tr><td style="padding-bottom:18px;">
<table width="100%" cellpadding="0" cellspacing="0"><tr>

  <td style="width:48%;vertical-align:top;padding-right:8px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.09);">
    {section_header("🔍 TOP SEARCHED CATEGORIES — THIS WEEK", "#00BFA5")}
    <tr><td style="padding:4px 0;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr style="background:#f7f4ee;"><td style="padding:8px 14px;font-size:11px;color:#888;font-weight:bold;">Category</td><td style="padding:8px 14px;text-align:right;font-size:11px;color:#888;font-weight:bold;">Searches</td></tr>
        {cat_rows}
      </table>
    </td></tr>
  </table>
  </td>

  <td style="width:48%;vertical-align:top;padding-left:8px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.09);">
    {section_header("📍 TOP SEARCHED VILLAGES — THIS WEEK", "#00BFA5")}
    <tr><td style="padding:4px 0;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr style="background:#f7f4ee;"><td style="padding:8px 14px;font-size:11px;color:#888;font-weight:bold;">Village / Area</td><td style="padding:8px 14px;text-align:right;font-size:11px;color:#888;font-weight:bold;">Searches</td></tr>
        {vil_rows}
      </table>
    </td></tr>
  </table>
  </td>

</tr></table>
</td></tr>

<!-- ═══════════════ 7. LIVE CLASSIFIED ADS ═══════════════ -->
<tr><td style="padding-bottom:18px;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.09);">
  {section_header(f"📰 LIVE CLASSIFIED ADS ({len(live_ads)} RUNNING)", "#E8431A")}
  <tr><td style="padding:4px 0;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr style="background:#f7f4ee;">
        <td style="padding:8px 14px;font-size:11px;color:#888;font-weight:bold;">Provider</td>
        <td style="padding:8px 14px;font-size:11px;color:#888;font-weight:bold;">Headline</td>
        <td style="padding:8px 14px;text-align:center;font-size:11px;color:#888;font-weight:bold;">Total Clicks</td>
        <td style="padding:8px 14px;text-align:center;font-size:11px;color:#888;font-weight:bold;">Expires</td>
      </tr>
      {ad_rows}
    </table>
  </td></tr>
</table>
</td></tr>

<!-- ═══════════════ 8. NEW SIGN-UPS ═══════════════ -->
<tr><td style="padding-bottom:18px;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.09);">
  {section_header(f"🆕 NEW SIGN-UPS TODAY ({len(new_today)}) & THIS WEEK ({len(new_week)})", "#00BFA5")}
  <tr><td style="padding:10px 14px;">
    <div style="font-size:12px;color:#888;font-weight:bold;margin-bottom:6px;">TODAY</div>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
      <tr style="background:#f7f4ee;"><td style="padding:7px 12px;font-size:11px;color:#888;font-weight:bold;">Business</td><td style="padding:7px 12px;font-size:11px;color:#888;font-weight:bold;">Owner</td><td style="padding:7px 12px;font-size:11px;color:#888;font-weight:bold;">VH#</td></tr>
      {new_today_rows}
    </table>
    <div style="font-size:12px;color:#888;font-weight:bold;margin-bottom:6px;">THIS WEEK</div>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr style="background:#f7f4ee;"><td style="padding:6px 12px;font-size:11px;color:#888;font-weight:bold;">Business</td><td style="padding:6px 12px;font-size:11px;color:#888;font-weight:bold;">VH#</td><td style="padding:6px 12px;font-size:11px;color:#888;font-weight:bold;">Signed Up</td></tr>
      {new_week_rows}
    </table>
  </td></tr>
</table>
</td></tr>

<!-- ═══════════════ 9. DIRECTORY HEALTH ═══════════════ -->
<tr><td style="padding-bottom:18px;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.09);">
  {section_header("🏥 DIRECTORY HEALTH SNAPSHOT", "#1B3D6F")}
  <tr><td style="padding:20px 10px;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      {stat_cell(total_active, "Active<br>Providers", "", "#1B3D6F", False)}
      {stat_cell(len(trial_providers), "On Free<br>Trial", "", "#888")}
      {stat_cell(len(paid_providers), "Paid<br>Subscribers", "", "#00BFA5")}
      {stat_cell(len(live_ads), "Live<br>Ads", "", "#E8431A")}
      {stat_cell(len(pending_reviews), "Pending<br>Reviews", "", "#888")}
      {stat_cell(total_leads_week, "Leads<br>This Week", "", "#00BFA5")}
    </tr></table>
    <div style="text-align:center;padding:10px 0 0;font-size:12px;color:#aaa;">{pending_review_note}</div>
  </td></tr>
</table>
</td></tr>

<!-- FOOTER -->
<tr><td style="padding-bottom:30px;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#1A0A00;border-radius:10px;">
<tr><td style="padding:18px;text-align:center;">
  <a href="https://www.v-hub.us" style="color:#E8431A;font-weight:bold;text-decoration:none;font-size:14px;font-family:Arial,sans-serif;">🌴 www.v-hub.us</a>
  <span style="color:#555;margin:0 8px;">·</span>
  <a href="https://v-hub-app-edf7f8e8.base44.app/Wekcadmin" style="color:#C9973A;text-decoration:none;font-size:12px;font-family:Arial,sans-serif;">Admin Dashboard</a><br>
  <span style="color:#444;font-size:10px;font-family:Arial,sans-serif;">V-Hub · The Villages, Florida · admin@v-hub.us</span>
</td></tr>
</table>
</td></tr>

</table>
</body></html>"""

# ── Send ──────────────────────────────────────────────────────────────────────
print(f"\n📧 Sending report to {RECIPIENTS}...")
status = send_email(f"V-HUB Daily Report — {report_date}", html)
if status in (200, 202, None):
    print(f"✅ Report sent! GA4: {ga_users_today} visitors today | {total_active} active providers | {len(live_ads)} live ads | {len(new_today)} new sign-ups today")
else:
    print(f"⚠️  SendGrid returned status: {status}")
