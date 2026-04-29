import os, json, urllib.request, urllib.error

api_key = os.environ.get("SENDGRID_API_KEY")

providers = [
    {"email": "robertshomeservices1@gmail.com", "name": "Roberts Home Services", "vh": "VH-9372", "owner": ""},
    {"email": "james@blumagicpoolsfl.com",       "name": "Blu Magic Pools",        "vh": "VH-3988", "owner": "James"},
    {"email": "brownesyardcreations@gmail.com",  "name": "Browne's Yard Creations","vh": "VH-2143", "owner": "Spencer"},
]

def send_welcome(p):
    greeting = f"Hi {p['owner']}," if p['owner'] else f"Hello,"
    html = f"""<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;background:#fdf6e3;padding:32px;border:1px solid #ddd;border-radius:8px;">
  <img src="https://media.base44.com/images/public/69d062aca815ce8e697894b1/a9af95bc3_V-Hublogo.png" width="120" style="margin-bottom:16px;display:block;"/>
  <h2 style="color:#1B3D6F;margin-top:0;">Welcome to V-HUB, {p['name']}!</h2>
  <p style="color:#333;font-size:15px;">{greeting}</p>
  <p style="color:#333;font-size:15px;">
    Your business is now live on <strong>V-HUB</strong> — The Villages' trusted local services directory! 
    Residents across all of The Villages can now find and contact you directly from our platform.
  </p>
  <p style="color:#333;font-size:15px;">
    Here are your <strong>Provider Hub</strong> login credentials so you can manage your profile, view incoming leads, respond to reviews, and track your analytics:
  </p>
  <div style="background:#fff;border:1px solid #ddd;border-radius:8px;padding:16px;margin:16px 0;">
    <p style="margin:4px 0;"><strong>VH Number:</strong> {p['vh']}</p>
    <p style="margin:4px 0;"><strong>Login Email:</strong> {p['email']}</p>
    <p style="margin:4px 0;"><strong>Temporary Password:</strong> VHub2026!</p>
  </div>
  <p style="text-align:center;margin:24px 0;">
    <a href="https://v-hub-app-edf7f8e8.base44.app/ProviderDashboard"
       style="background:#E8431A;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-size:15px;font-weight:bold;">
      Access Your Provider Hub →
    </a>
  </p>
  <p style="color:#333;font-size:15px;">
    We recommend logging in and changing your password at your convenience. From your dashboard you can update your business details, upload photos, respond to reviews, and see how many Villages residents are viewing your listing.
  </p>
  <p style="color:#333;font-size:15px;">Welcome aboard — we're glad to have you! 🌴</p>
  <hr style="border:none;border-top:1px solid #ddd;margin:24px 0;"/>
  <p style="color:#888;font-size:12px;text-align:center;">
    V-HUB Directory &bull; <a href="https://www.v-hub.us" style="color:#E8431A;">www.v-hub.us</a><br/>
    Questions? Reply to this email or visit your Provider Hub.
  </p>
</div>"""

    payload = {
        "personalizations": [{"to": [{"email": p['email'], "name": p['name']}]}],
        "from": {"email": "admin@v-hub.us", "name": "V-HUB Directory"},
        "subject": f"Welcome to V-HUB — {p['name']} is Now Live!",
        "content": [{"type": "text/html", "value": html}]
    }
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        "https://api.sendgrid.com/v3/mail/send",
        data=data,
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        method="POST"
    )
    try:
        with urllib.request.urlopen(req) as resp:
            print(f"✅ Sent to {p['name']} ({p['email']}) — Status: {resp.status}")
    except urllib.error.HTTPError as e:
        print(f"❌ Error for {p['name']}: {e.code} — {e.read().decode()}")

for p in providers:
    send_welcome(p)
