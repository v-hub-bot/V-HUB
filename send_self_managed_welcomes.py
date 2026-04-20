import json, requests, os, hashlib, time

SENDGRID_API_KEY = os.environ['SENDGRID_API_KEY']
BASE44_TOKEN = os.environ['BASE44_SERVICE_TOKEN']
APP_ID = "69d062aca815ce8e697894b1"

with open('/app/self_managed_batch.json') as f:
    providers = json.load(f)

def hash_password(pw):
    return hashlib.sha256(pw.encode()).hexdigest()

def update_provider(provider_id, email, password, vh_number):
    url = f"https://api.base44.app/api/apps/{APP_ID}/entities/Provider/{provider_id}"
    headers = {"Authorization": f"Bearer {BASE44_TOKEN}", "Content-Type": "application/json"}
    data = {
        "managed_by": "provider",
        "login_email": email.lower(),
        "login_password": hash_password(password),
        "password_changed": False
    }
    r = requests.put(url, headers=headers, json=data)
    return r.status_code

def send_welcome(email, business_name, vh_number, password):
    url = "https://api.sendgrid.com/v3/mail/send"
    headers = {"Authorization": f"Bearer {SENDGRID_API_KEY}", "Content-Type": "application/json"}
    
    html = f"""
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:30px 0;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
      <!-- Header -->
      <tr><td style="background:#1B3D6F;padding:30px;text-align:center;">
        <img src="https://media.base44.com/images/public/69d062aca815ce8e697894b1/a9af95bc3_V-Hublogo.png" width="80" alt="V-HUB" style="display:block;margin:0 auto 12px;"/><br>
        <span style="color:#ffffff;font-size:26px;font-weight:bold;letter-spacing:1px;">V-HUB</span><br>
        <span style="color:#00BFA5;font-size:13px;letter-spacing:2px;">LOCAL SERVICES · THE VILLAGES</span>
      </td></tr>
      <!-- Body -->
      <tr><td style="padding:36px 40px;">
        <h2 style="color:#1B3D6F;margin-top:0;">Welcome to V-HUB, {business_name}! 🎉</h2>
        <p style="color:#444;font-size:15px;line-height:1.7;">
          Your business is now listed in the <strong>V-HUB</strong> directory — the go-to local services platform for residents of <strong>The Villages, FL</strong>.
        </p>
        <p style="color:#444;font-size:15px;line-height:1.7;">
          We've set up your Provider account so you can log in and manage your listing directly. Here are your login details:
        </p>
        
        <!-- Credentials Box -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f7ff;border-left:4px solid #1B3D6F;border-radius:6px;padding:20px;margin:24px 0;">
          <tr><td style="padding:20px;">
            <p style="margin:0 0 10px;color:#1B3D6F;font-weight:bold;font-size:15px;">📋 Your Account Details</p>
            <p style="margin:4px 0;color:#333;font-size:14px;"><strong>Account #:</strong> {vh_number}</p>
            <p style="margin:4px 0;color:#333;font-size:14px;"><strong>Login Email:</strong> {email}</p>
            <p style="margin:4px 0;color:#333;font-size:14px;"><strong>Temporary Password:</strong> <span style="font-family:monospace;background:#e8f0fe;padding:2px 6px;border-radius:3px;">{password}</span></p>
          </td></tr>
        </table>

        <p style="color:#444;font-size:15px;line-height:1.7;">
          You can log into your Provider Hub at:
        </p>
        <p style="text-align:center;margin:20px 0;">
          <a href="https://www.v-hub.us" style="background:#E8431A;color:#ffffff;padding:14px 32px;border-radius:6px;text-decoration:none;font-size:16px;font-weight:bold;display:inline-block;">Log In to Provider Hub →</a>
        </p>
        
        <p style="color:#444;font-size:14px;line-height:1.7;">
          From your Provider Hub you can:
        </p>
        <ul style="color:#444;font-size:14px;line-height:2;">
          <li>✅ Update your business info, hours & description</li>
          <li>✅ View and respond to customer reviews</li>
          <li>✅ See how many times your profile has been viewed</li>
          <li>✅ Post a weekly Deal or Special Offer</li>
          <li>✅ Change your password anytime</li>
        </ul>

        <p style="color:#666;font-size:13px;line-height:1.7;margin-top:24px;">
          We recommend changing your password after your first login. If you have any questions or need help, reply to this email and we'll take care of you.
        </p>

        <p style="color:#444;font-size:15px;margin-top:24px;">
          Welcome aboard! 🌴<br>
          <strong style="color:#1B3D6F;">The V-HUB Team</strong>
        </p>
      </td></tr>
      <!-- Footer -->
      <tr><td style="background:#f8f8f8;padding:20px;text-align:center;border-top:1px solid #eee;">
        <p style="margin:0;color:#999;font-size:12px;">V-HUB · Local Services for The Villages, FL · <a href="https://www.v-hub.us" style="color:#E8431A;">www.v-hub.us</a></p>
        <p style="margin:6px 0 0;color:#bbb;font-size:11px;">You're receiving this because your business was listed on V-HUB.</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>
"""
    
    payload = {
        "personalizations": [{"to": [{"email": email}]}],
        "from": {"email": "admin@v-hub.us", "name": "V-HUB"},
        "subject": f"Welcome to V-HUB — Your Provider Account is Ready, {business_name}!",
        "content": [{"type": "text/html", "value": html}]
    }
    r = requests.post(url, headers=headers, json=payload)
    return r.status_code

sent = 0
failed = 0
db_updated = 0
results = []

for p in providers:
    email = p['email']
    if not email or '@' not in email:
        continue
    
    # Update DB
    db_status = update_provider(p['id'], email, p['temp_password'], p['vh_number'])
    if db_status in [200, 201]:
        db_updated += 1
    
    # Send email
    email_status = send_welcome(email, p['business_name'], p['vh_number'], p['temp_password'])
    if email_status == 202:
        sent += 1
        print(f"✓ {p['vh_number']} | {p['business_name']} | {email}")
    else:
        failed += 1
        print(f"✗ FAILED {p['vh_number']} | {email} | status: {email_status}")
    
    results.append({"vh": p['vh_number'], "email": email, "db": db_status, "email_sent": email_status == 202})
    time.sleep(0.15)

print(f"\n=== DONE ===")
print(f"DB updated: {db_updated}")
print(f"Emails sent: {sent}")
print(f"Failed: {failed}")

with open('/app/self_managed_results.json', 'w') as f:
    json.dump(results, f, indent=2)
