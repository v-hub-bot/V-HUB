import os, requests, time, json

SENDGRID_API_KEY = os.environ.get("SENDGRID_API_KEY")
FROM_EMAIL = "admin@v-hub.us"
FROM_NAME = "V-HUB Directory"
PROVIDER_HUB_URL = "https://www.v-hub.us"

# Providers that need welcome emails
# Tallman and BC Kustom Karts have set their own passwords - just give account number + login instructions
# Others still have VHub2026! as temp password

providers = [
    {
        "vh": "VH-3961",
        "name": "Feel Safe Home Watch, LLC",
        "email": "feelsafehomewatch@gmail.com",
        "password": "VHub2026!",
        "owner": "",
    },
    {
        "vh": "VH-0006",
        "name": "S&W Roofing LLC",
        "email": "Hello@SWRoofingLLC.com",
        "password": "VHub2026!",
        "owner": "",
    },
    {
        "vh": "VH-9170",
        "name": "Roof Guys",
        "email": "info@theroofguys.com",
        "password": "VHub2026!",
        "owner": "",
    },
    {
        "vh": "VH-8082",
        "name": "SprinkleRight Irrigation",
        "email": "SprinkleRight@gmail.com",
        "password": "VHub2026!",
        "owner": "",
    },
    {
        "vh": "VH-1611",
        "name": "Puddle Pool Services",
        "email": "info@puddlepools.com",
        "password": "VHub2026!",
        "owner": "",
    },
    {
        "vh": "VH-7842",
        "name": "Tallman Lawn Services",
        "email": "tallmanlawnservices@gmail.com",
        "password": None,  # already set their own
        "owner": "William",
    },
    {
        "vh": "VH-2122",
        "name": "Trev's Precision - Mobile Cart Service",
        "email": "usmcpratt4@gmail.com",
        "password": "VHub2026!",
        "owner": "Trevor",
    },
    {
        "vh": "VH-2265",
        "name": "BC Kustom Karts",
        "email": "brianblume@bckustomkarts.com",
        "password": None,  # already set their own
        "owner": "Brian",
    },
]

def build_email_html(vh, name, email, password, owner):
    greeting = f"Hi {owner}," if owner else f"Hello,"
    
    if password:
        password_section = f"""
        <table style="background:#f9f9f9;border:1px solid #ddd;border-radius:6px;padding:16px;margin:20px 0;width:100%;">
          <tr><td><strong>Account Number:</strong></td><td>{vh}</td></tr>
          <tr><td><strong>Login Email:</strong></td><td>{email}</td></tr>
          <tr><td><strong>Temporary Password:</strong></td><td><code style="background:#fffbea;padding:2px 6px;border-radius:3px;">{password}</code></td></tr>
        </table>
        <p>We recommend logging in and changing your password right away.</p>
        """
    else:
        password_section = f"""
        <table style="background:#f9f9f9;border:1px solid #ddd;border-radius:6px;padding:16px;margin:20px 0;width:100%;">
          <tr><td><strong>Account Number:</strong></td><td>{vh}</td></tr>
          <tr><td><strong>Login Email:</strong></td><td>{email}</td></tr>
        </table>
        <p>You've already set your own password — just log in with your account number or email.</p>
        """

    return f"""
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#333;">
      <div style="text-align:center;padding:20px 0;">
        <img src="https://media.base44.com/images/public/69d062aca815ce8e697894b1/a9af95bc3_V-Hublogo.png" width="80" alt="V-HUB Logo"/>
      </div>
      <h2 style="color:#E8431A;border-bottom:2px solid #E8431A;padding-bottom:8px;">Welcome to V-HUB!</h2>
      <p>{greeting}</p>
      <p>Your business — <strong>{name}</strong> — is now listed and <strong>live</strong> on <strong>V-HUB</strong>, The Villages' local services directory. Residents across The Villages can now find and contact you directly through our platform.</p>
      <h3 style="color:#00BFA5;">Your Account Details</h3>
      {password_section}
      <p>
        <a href="{PROVIDER_HUB_URL}" style="background:#E8431A;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;font-weight:bold;">
          Log In to Your Provider Hub →
        </a>
      </p>
      <p>From your Provider Hub you can:</p>
      <ul>
        <li>Update your business profile, hours, and services</li>
        <li>View customer leads and inquiries</li>
        <li>Respond to reviews</li>
        <li>Track your profile views and search appearances</li>
      </ul>
      <p>If you have any questions or need help with your listing, just reply to this email — we're happy to help.</p>
      <p style="color:#00BFA5;font-weight:bold;">Welcome aboard — we're glad to have you!</p>
      <p>— The V-HUB Team<br/>
      <a href="mailto:admin@v-hub.us">admin@v-hub.us</a><br/>
      <a href="{PROVIDER_HUB_URL}">{PROVIDER_HUB_URL}</a></p>
      <hr style="margin-top:30px;border:none;border-top:1px solid #eee;"/>
      <p style="font-size:11px;color:#999;text-align:center;">V-HUB | The Villages Local Services Directory | {PROVIDER_HUB_URL}</p>
    </div>
    """

def send_email(to_email, subject, html):
    response = requests.post(
        "https://api.sendgrid.com/v3/mail/send",
        headers={
            "Authorization": f"Bearer {SENDGRID_API_KEY}",
            "Content-Type": "application/json",
        },
        json={
            "personalizations": [{"to": [{"email": to_email}]}],
            "from": {"email": FROM_EMAIL, "name": FROM_NAME},
            "subject": subject,
            "content": [{"type": "text/html", "value": html}],
        }
    )
    return response.status_code

results = []
for p in providers:
    html = build_email_html(p["vh"], p["name"], p["email"], p["password"], p["owner"])
    subject = f"Welcome to V-HUB — {p['name']} Is Now Live!"
    status = send_email(p["email"], subject, html)
    ok = status in (200, 202)
    results.append({"vh": p["vh"], "name": p["name"], "email": p["email"], "status": status, "ok": ok})
    print(f"{'✅' if ok else '❌'} {p['vh']} | {p['name']} | {p['email']} | HTTP {status}")
    time.sleep(0.4)

print(f"\nSent: {sum(1 for r in results if r['ok'])}/{len(results)}")
