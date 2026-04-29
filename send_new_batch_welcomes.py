import os
import json
import urllib.request

api_key = os.environ.get("SENDGRID_API_KEY")

providers = [
    {
        "email": "mcwilliamspaintingplus@gmail.com",
        "name": "McWilliams Painting Plus",
        "vh": "VH-6471",
        "login_email": "mcwilliamspaintingplus@gmail.com"
    }
]

def send_welcome(email, name, vh, login_email):
    html = f"""<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;background:#fdf6e3;padding:32px;border:1px solid #ddd;">
<img src="https://media.base44.com/images/public/69d062aca815ce8e697894b1/a9af95bc3_V-Hublogo.png" width="120" style="margin-bottom:16px;"/>
<h2 style="color:#1B3D6F;">Welcome to V-HUB, {name}!</h2>
<p style="color:#333;font-size:15px;">Great news — your business is now listed on <strong>V-HUB</strong>, The Villages' trusted local services directory! Residents across all of The Villages can now find and contact you directly.</p>
<p style="color:#333;font-size:15px;">Here are your Provider Hub login details so you can manage your profile, view leads, and track your analytics:</p>
<div style="background:#fff;border:1px solid #ddd;border-radius:8px;padding:16px;margin:16px 0;">
  <p style="margin:4px 0;"><strong>VH Number:</strong> {vh}</p>
  <p style="margin:4px 0;"><strong>Email:</strong> {login_email}</p>
  <p style="margin:4px 0;"><strong>Temporary Password:</strong> VHub2026!</p>
</div>
<p style="text-align:center;margin:24px 0;">
  <a href="https://v-hub-app-edf7f8e8.base44.app/ProviderDashboard" style="background:#E8431A;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-size:15px;font-weight:bold;">Access Your Provider Hub</a>
</p>
<p style="color:#333;font-size:15px;">We recommend logging in and changing your password when you get a chance. From your dashboard you can update your profile, respond to reviews, and see how many residents are viewing your listing.</p>
<p style="color:#333;font-size:15px;">Welcome aboard! 🌴</p>
<p style="color:#888;font-size:12px;">V-HUB Directory &bull; <a href="https://www.v-hub.us" style="color:#E8431A;">www.v-hub.us</a></p>
</div>"""

    payload = {
        "personalizations": [{"to": [{"email": email, "name": name}]}],
        "from": {"email": "admin@v-hub.us", "name": "V-HUB Directory"},
        "subject": f"Welcome to V-HUB — Your Listing is Live!",
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
            print(f"✅ Sent to {name} ({email}) — Status: {resp.status}")
    except urllib.error.HTTPError as e:
        print(f"❌ Error for {name}: {e.code} {e.read()}")

for p in providers:
    send_welcome(p["email"], p["name"], p["vh"], p["login_email"])
