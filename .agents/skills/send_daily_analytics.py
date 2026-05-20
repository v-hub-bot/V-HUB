#!/usr/bin/env python3
"""
V-HUB Daily Analytics Email
Sends to kimberlycook1980@gmail.com and evansrus@comcast.net
"""
import os, json, urllib.request, urllib.error
from datetime import datetime, timedelta, timezone

SENDGRID_KEY = os.environ.get('SENDGRID_API_KEY', '')
APP_ID = "69d062aca815ce8e697894b1"
API_BASE = f"https://api.base44.app/api/apps/{APP_ID}"

def fetch_entity(entity, query=None, limit=500, skip=0):
    url = f"{API_BASE}/entities/{entity}?limit={limit}&skip={skip}"
    if query:
        url += f"&" + "&".join(f"{k}={v}" for k,v in query.items())
    req = urllib.request.Request(url, headers={"api_key": os.environ.get('BASE44_API_KEY','')})
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            return json.loads(r.read())
    except Exception as e:
        print(f"Error fetching {entity}: {e}")
        return []

def fetch_all_pages(entity, query=None):
    all_records = []
    skip = 0
    while True:
        page = fetch_entity(entity, query, limit=500, skip=skip)
        if not page: break
        all_records.extend(page)
        if len(page) < 500: break
        skip += 500
        if len(all_records) > 50000: break
    return all_records

today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
yesterday = (datetime.now(timezone.utc) - timedelta(days=1)).strftime("%Y-%m-%d")
day7ago = (datetime.now(timezone.utc) - timedelta(days=7)).strftime("%Y-%m-%d")
day30ago = (datetime.now(timezone.utc) - timedelta(days=30)).strftime("%Y-%m-%d")

print("Fetching analytics data...")

# Fetch ProviderAnalytic events (last 30 days)
events = fetch_all_pages("ProviderAnalytic")
print(f"Total analytic events: {len(events)}")

# Fetch Providers
providers = fetch_all_pages("Provider")
print(f"Total providers: {len(providers)}")

# Fetch Leads (last 30 days)
leads = fetch_all_pages("LeadInquiry")

# Fetch Reviews
reviews = fetch_all_pages("ProviderReview")

# Classify events
yesterday_events = [e for e in events if e.get('date_key','') == yesterday]
week_events = [e for e in events if e.get('date_key','') >= day7ago]
month_events = [e for e in events if e.get('date_key','') >= day30ago]

site_events_week = [e for e in week_events if e.get('provider_id') == 'SITE']
prov_events_week = [e for e in week_events if e.get('provider_id') != 'SITE']

# Village searches (7 days)
village_counts = {}
for e in site_events_week:
    if e.get('event_type') == 'village_search' and e.get('area_name'):
        village_counts[e['area_name']] = village_counts.get(e['area_name'], 0) + 1
for e in site_events_week:
    if e.get('event_type') == 'search_performed' and e.get('area_name') and e['area_name'] != 'All Villages':
        village_counts[e['area_name']] = village_counts.get(e['area_name'], 0) + 1
top_villages = sorted(village_counts.items(), key=lambda x: -x[1])[:8]

# Service searches (7 days)
service_counts = {}
for e in prov_events_week:
    if e.get('event_type') == 'search_appearance' and e.get('service_name'):
        service_counts[e['service_name']] = service_counts.get(e['service_name'], 0) + 1
top_services = sorted(service_counts.items(), key=lambda x: -x[1])[:8]

# Top providers by views (7 days)
prov_view_counts = {}
for e in prov_events_week:
    if e.get('event_type') == 'profile_view':
        prov_view_counts[e['provider_id']] = prov_view_counts.get(e['provider_id'], 0) + 1
top_viewed_ids = sorted(prov_view_counts.items(), key=lambda x: -x[1])[:5]
prov_map = {p['id']: p for p in providers}
top_viewed = [(prov_map.get(pid, {}).get('business_name', pid), cnt) for pid, cnt in top_viewed_ids if pid in prov_map]

# Key metrics
homepage_views_week = len([e for e in site_events_week if e.get('event_type') == 'homepage_view'])
searches_week = len([e for e in site_events_week if e.get('event_type') == 'search_performed'])
profile_views_week = len([e for e in prov_events_week if e.get('event_type') == 'profile_view'])
ad_clicks_week = len([e for e in prov_events_week if e.get('event_type') in ['classified_ad_click','classified_click']])
featured_clicks_week = len([e for e in site_events_week if e.get('event_type') == 'featured_banner_click'])

leads_week = [l for l in leads if l.get('created_date','') >= day7ago]
reviews_week = [r for r in reviews if r.get('created_date','') >= day7ago]
new_providers_week = [p for p in providers if p.get('created_date','') >= day7ago]

paid_count = len([p for p in providers if p.get('subscription_status') in ['active','paid']])
trial_count = len([p for p in providers if p.get('subscription_status') == 'trial'])

display_date = datetime.now(timezone.utc).strftime("%B %d, %Y")

# Build village rows
village_rows = ""
for village, cnt in top_villages:
    village_rows += f'<tr><td style="padding:5px 10px;font-size:13px;color:#333;font-family:Arial,sans-serif;">{village}</td><td style="padding:5px 10px;font-size:13px;font-weight:700;color:#E8431A;font-family:Arial,sans-serif;text-align:right;">{cnt}</td></tr>'
if not village_rows:
    village_rows = '<tr><td colspan="2" style="padding:8px 10px;font-size:13px;color:#aaa;font-style:italic;font-family:Arial,sans-serif;">Village tracking just activated — data will populate soon</td></tr>'

# Build service rows
service_rows = ""
for svc, cnt in top_services:
    service_rows += f'<tr><td style="padding:5px 10px;font-size:13px;color:#333;font-family:Arial,sans-serif;">{svc}</td><td style="padding:5px 10px;font-size:13px;font-weight:700;color:#00BFA5;font-family:Arial,sans-serif;text-align:right;">{cnt}</td></tr>'
if not service_rows:
    service_rows = '<tr><td colspan="2" style="padding:8px 10px;font-size:13px;color:#aaa;font-style:italic;font-family:Arial,sans-serif;">No service data yet this week</td></tr>'

# Build top provider rows
provider_rows = ""
for biz, cnt in top_viewed:
    provider_rows += f'<tr><td style="padding:5px 10px;font-size:13px;color:#333;font-family:Arial,sans-serif;">{biz}</td><td style="padding:5px 10px;font-size:13px;font-weight:700;color:#1A6B3C;font-family:Arial,sans-serif;text-align:right;">{cnt} views</td></tr>'
if not provider_rows:
    provider_rows = '<tr><td colspan="2" style="padding:8px 10px;font-size:13px;color:#aaa;font-style:italic;font-family:Arial,sans-serif;">No profile view data yet</td></tr>'

html = f'''<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f4f0e8;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f0e8;padding:30px 0;">
    <tr><td align="center">
      <table width="620" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #ddd;border-radius:4px;">
        <tr>
          <td style="background:#1B3D6F;padding:20px 32px;text-align:center;">
            <img src="https://media.base44.com/images/public/69d062aca815ce8e697894b1/a9af95bc3_V-Hublogo.png" width="100" alt="V-HUB" style="display:block;margin:0 auto 8px auto;" />
            <div style="color:#ffffff;font-size:18px;font-weight:700;font-family:Arial,sans-serif;">V-HUB Daily Analytics Report</div>
            <div style="color:#aab8cc;font-size:13px;font-family:Arial,sans-serif;margin-top:4px;">{display_date}</div>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 32px;">

            <!-- 7-Day KPIs -->
            <div style="font-size:14px;font-weight:700;color:#1B3D6F;font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;border-bottom:2px solid #E8431A;padding-bottom:5px;">📊 Last 7 Days — Platform Activity</div>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
              <tr>
                <td style="width:25%;text-align:center;background:#f4f0e8;border-radius:6px;padding:12px 4px;">
                  <div style="font-size:28px;font-weight:800;color:#1B3D6F;font-family:Arial,sans-serif;">{homepage_views_week}</div>
                  <div style="font-size:10px;color:#888;font-family:Arial,sans-serif;text-transform:uppercase;">Homepage Views</div>
                </td>
                <td style="width:4px;"></td>
                <td style="width:25%;text-align:center;background:#f4f0e8;border-radius:6px;padding:12px 4px;">
                  <div style="font-size:28px;font-weight:800;color:#00BFA5;font-family:Arial,sans-serif;">{searches_week}</div>
                  <div style="font-size:10px;color:#888;font-family:Arial,sans-serif;text-transform:uppercase;">Searches Run</div>
                </td>
                <td style="width:4px;"></td>
                <td style="width:25%;text-align:center;background:#f4f0e8;border-radius:6px;padding:12px 4px;">
                  <div style="font-size:28px;font-weight:800;color:#1A6B3C;font-family:Arial,sans-serif;">{profile_views_week}</div>
                  <div style="font-size:10px;color:#888;font-family:Arial,sans-serif;text-transform:uppercase;">Profile Views</div>
                </td>
                <td style="width:4px;"></td>
                <td style="width:25%;text-align:center;background:#f4f0e8;border-radius:6px;padding:12px 4px;">
                  <div style="font-size:28px;font-weight:800;color:#7B3FA0;font-family:Arial,sans-serif;">{ad_clicks_week}</div>
                  <div style="font-size:10px;color:#888;font-family:Arial,sans-serif;text-transform:uppercase;">Ad Clicks</div>
                </td>
              </tr>
            </table>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              <tr>
                <td style="width:25%;text-align:center;background:#f4f0e8;border-radius:6px;padding:12px 4px;">
                  <div style="font-size:28px;font-weight:800;color:#E8431A;font-family:Arial,sans-serif;">{len(leads_week)}</div>
                  <div style="font-size:10px;color:#888;font-family:Arial,sans-serif;text-transform:uppercase;">Leads Sent</div>
                </td>
                <td style="width:4px;"></td>
                <td style="width:25%;text-align:center;background:#f4f0e8;border-radius:6px;padding:12px 4px;">
                  <div style="font-size:28px;font-weight:800;color:#B8860B;font-family:Arial,sans-serif;">{len(reviews_week)}</div>
                  <div style="font-size:10px;color:#888;font-family:Arial,sans-serif;text-transform:uppercase;">New Reviews</div>
                </td>
                <td style="width:4px;"></td>
                <td style="width:25%;text-align:center;background:#f4f0e8;border-radius:6px;padding:12px 4px;">
                  <div style="font-size:28px;font-weight:800;color:#CC0000;font-family:Arial,sans-serif;">{featured_clicks_week}</div>
                  <div style="font-size:10px;color:#888;font-family:Arial,sans-serif;text-transform:uppercase;">Featured Clicks</div>
                </td>
                <td style="width:4px;"></td>
                <td style="width:25%;text-align:center;background:#f4f0e8;border-radius:6px;padding:12px 4px;">
                  <div style="font-size:28px;font-weight:800;color:#1B3D6F;font-family:Arial,sans-serif;">{len(new_providers_week)}</div>
                  <div style="font-size:10px;color:#888;font-family:Arial,sans-serif;text-transform:uppercase;">New Providers</div>
                </td>
              </tr>
            </table>

            <!-- Top Villages -->
            <div style="font-size:14px;font-weight:700;color:#1B3D6F;font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;border-bottom:2px solid #E8431A;padding-bottom:5px;">📍 Top Villages Searched (7 Days)</div>
            <table width="100%" cellpadding="0" cellspacing="4" style="margin-bottom:20px;border-collapse:collapse;">
              {village_rows}
            </table>

            <!-- Top Services -->
            <div style="font-size:14px;font-weight:700;color:#1B3D6F;font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;border-bottom:2px solid #00BFA5;padding-bottom:5px;">🔧 Top Services Searched (7 Days)</div>
            <table width="100%" cellpadding="0" cellspacing="4" style="margin-bottom:20px;border-collapse:collapse;">
              {service_rows}
            </table>

            <!-- Top Providers -->
            <div style="font-size:14px;font-weight:700;color:#1B3D6F;font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;border-bottom:2px solid #1A6B3C;padding-bottom:5px;">👁️ Most Viewed Providers (7 Days)</div>
            <table width="100%" cellpadding="0" cellspacing="4" style="margin-bottom:20px;border-collapse:collapse;">
              {provider_rows}
            </table>

            <!-- Platform Health -->
            <div style="font-size:14px;font-weight:700;color:#1B3D6F;font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;border-bottom:2px solid #1B3D6F;padding-bottom:5px;">🏥 Platform Health</div>
            <table width="100%" cellpadding="0" cellspacing="4" style="margin-bottom:24px;border-collapse:collapse;">
              <tr>
                <td style="padding:5px 10px;font-size:13px;color:#333;font-family:Arial,sans-serif;">Total Active Providers</td>
                <td style="padding:5px 10px;font-size:13px;font-weight:700;color:#1B3D6F;font-family:Arial,sans-serif;text-align:right;">{len(providers)}</td>
              </tr>
              <tr style="background:#f9f7f2;">
                <td style="padding:5px 10px;font-size:13px;color:#333;font-family:Arial,sans-serif;">Paid Subscribers</td>
                <td style="padding:5px 10px;font-size:13px;font-weight:700;color:#1A6B3C;font-family:Arial,sans-serif;text-align:right;">{paid_count}</td>
              </tr>
              <tr>
                <td style="padding:5px 10px;font-size:13px;color:#333;font-family:Arial,sans-serif;">On Trial</td>
                <td style="padding:5px 10px;font-size:13px;font-weight:700;color:#B8860B;font-family:Arial,sans-serif;text-align:right;">{trial_count}</td>
              </tr>
              <tr style="background:#f9f7f2;">
                <td style="padding:5px 10px;font-size:13px;color:#333;font-family:Arial,sans-serif;">Est. Monthly Revenue</td>
                <td style="padding:5px 10px;font-size:13px;font-weight:700;color:#1A6B3C;font-family:Arial,sans-serif;text-align:right;">${paid_count * 12}</td>
              </tr>
            </table>

            <div style="text-align:center;margin-top:10px;">
              <a href="https://www.v-hub.us" style="display:inline-block;padding:10px 24px;background:#1B3D6F;color:#fff;border-radius:4px;font-family:Arial,sans-serif;font-size:13px;font-weight:700;text-decoration:none;margin-right:8px;">Visit V-HUB →</a>
              <a href="https://app.base44.com" style="display:inline-block;padding:10px 24px;background:#E8431A;color:#fff;border-radius:4px;font-family:Arial,sans-serif;font-size:13px;font-weight:700;text-decoration:none;">Admin Dashboard →</a>
            </div>

          </td>
        </tr>
        <tr>
          <td style="background:#1B3D6F;padding:14px 32px;text-align:center;">
            <p style="color:#aab8cc;font-size:11px;font-family:Arial,sans-serif;margin:0;">V-HUB · The Villages Local Services Directory · www.v-hub.us</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>'''

recipients = ['kimberlycook1980@gmail.com', 'evansrus@comcast.net']
for recipient in recipients:
    payload = json.dumps({
        'personalizations': [{'to': [{'email': recipient}]}],
        'from': {'email': 'admin@v-hub.us', 'name': 'V-HUB Analytics'},
        'reply_to': {'email': 'admin@v-hub.us'},
        'subject': f'V-HUB Daily Report — {display_date}',
        'content': [{'type': 'text/html', 'value': html}]
    }).encode()

    req = urllib.request.Request(
        'https://api.sendgrid.com/v3/mail/send',
        data=payload,
        headers={'Authorization': f'Bearer {SENDGRID_KEY}', 'Content-Type': 'application/json'}
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            print(f'✅ Sent to {recipient} — {r.status}')
    except urllib.error.HTTPError as e:
        print(f'❌ Error sending to {recipient}: {e.read()}')

print("Daily analytics email complete!")
