import os, requests, time

SENDGRID_API_KEY = os.environ.get("SENDGRID_API_KEY")
FROM_EMAIL = "admin@v-hub.us"
FROM_NAME = "V-HUB Directory"
PROVIDER_HUB_URL = "https://www.v-hub.us"

providers = [
    {"vh": "VH-7683", "name": "24 Hour Cart Club", "email": "24hrcarts@gmail.com"},
    {"vh": "VH-3398", "name": "FLI Lawn Tune-Up", "email": "fli83@live.com"},
    {"vh": "VH-6435", "name": "Sunshine Awnings", "email": "sellarspatch@aol.com"},
    {"vh": "VH-3609", "name": "Quality Moving Services", "email": "qualitymovingservices@outlook.com"},
    {"vh": "VH-8388", "name": "Helping Hand Moving Services", "email": "Helpinghandmovingservices@gmail.com"},
    {"vh": "VH-7579", "name": "Ricardo's Painting Services LLC", "email": "Ricardoh2583@gmail.com"},
    {"vh": "VH-8961", "name": "El Sol Hardscaping", "email": "elsolhardscaping@gmail.com"},
    {"vh": "VH-1475", "name": "Residential Water Works LLC", "email": "dvorisek@residentialwaterworks.com"},
]

def build_html(vh, name):
    return f"""
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#333;">
      <div style="text-align:center;padding:20px 0;">
        <img src="https://media.base44.com/images/public/69d062aca815ce8e697894b1/a9af95bc3_V-Hublogo.png" width="80" alt="V-HUB"/>
      </div>
      <h2 style="color:#E8431A;border-bottom:2px solid #E8431A;padding-bottom:8px;">Welcome to V-HUB!</h2>
      <p>Hello,</p>
      <p>Your business — <strong>{name}</strong> — is now listed and <strong>live</strong> on <strong>V-HUB</strong>, The Villages' local services directory. Residents across The Villages can now find and contact you directly through our platform.</p>
      <h3 style="color:#00BFA5;">Your Account Details</h3>
      <table style="background:#f9f9f9;border:1px solid #ddd;border-radius:6px;padding:16px;margin:20px 0;width:100%;border-collapse:collapse;">
        <tr><td style="padding:6px;"><strong>Account Number:</strong></td><td style="padding:6px;">{vh}</td></tr>
        <tr><td style="padding:6px;"><strong>Temporary Password:</strong></td><td style="padding:6px;"><code style="background:#fffbea;padding:2px 6px;border-radius:3px;">VHub2026!</code></td></tr>
      </table>
      <p>
        <a href="{PROVIDER_HUB_URL}" style="background:#E8431A;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;font-weight:bold;">
          Log In to Your Provider Hub &rarr;
        </a>
      </p>
      <p>From your Provider Hub you can:</p>
      <ul>
        <li>Update your business profile, hours, and services</li>
        <li>View customer leads and inquiries</li>
        <li>Respond to reviews</li>
        <li>Track your profile views and search appearances</li>
      </ul>
      <p>We recommend logging in and changing your password at your earliest convenience.</p>
      <p>If you have any questions or need help, just reply to this email — we're happy to help.</p>
      <p style="color:#00BFA5;font-weight:bold;">Welcome aboard — we're glad to have you!</p>
      <p>— The V-HUB Team<br/>
      <a href="mailto:admin@v-hub.us">admin@v-hub.us</a> &nbsp;|&nbsp;
      <a href="{PROVIDER_HUB_URL}">{PROVIDER_HUB_URL}</a></p>
      <hr style="margin-top:30px;border:none;border-top:1px solid #eee;"/>
      <p style="font-size:11px;color:#999;text-align:center;">V-HUB | The Villages Local Services Directory</p>
    </div>
    """

results = []
for p in providers:
    html = build_html(p["vh"], p["name"])
    subject = f"Welcome to V-HUB — {p['name']} Is Now Live!"
    resp = requests.post(
        "https://api.sendgrid.com/v3/mail/send",
        headers={"Authorization": f"Bearer {SENDGRID_API_KEY}", "Content-Type": "application/json"},
        json={
            "personalizations": [{"to": [{"email": p["email"]}]}],
            "from": {"email": FROM_EMAIL, "name": FROM_NAME},
            "subject": subject,
            "content": [{"type": "text/html", "value": html}],
        }
    )
    ok = resp.status_code in (200, 202)
    results.append(ok)
    print(f"{'✅' if ok else '❌'} {p['vh']} | {p['name']} | {p['email']} | HTTP {resp.status_code}")
    time.sleep(0.4)

print(f"\nSent: {sum(results)}/{len(results)}")
