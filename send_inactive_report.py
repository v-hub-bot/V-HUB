import os, json, urllib.request, urllib.error

SENDGRID_KEY = os.environ.get("SENDGRID_API_KEY", "")

html = """<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;color:#333;">
  <div style="max-width:650px;margin:auto;padding:30px 20px;">

    <h2 style="color:#E8431A;margin-top:0;">V-HUB Daily Inactive Provider Flag</h2>
    <p style="font-size:15px;color:#666;">May 25, 2026 @ 08:00 AM ET</p>

    <hr style="border:none;border-top:1px solid #ddd;margin:20px 0;">

    <h3>Scan Results</h3>
    <p>Checked all <strong>177 V-Hub managed providers</strong> for accounts that have:</p>
    <ul>
      <li>Never logged in (password_changed = null)</li>
      <li>Trial started ≥ 45 days ago (before April 10, 2026)</li>
    </ul>

    <p style="background:#f0f8ff;padding:16px;border-left:4px solid #00BFA5;margin:16px 0;">
      <strong>✅ No inactive candidates found</strong><br>
      All V-Hub managed trial accounts are still within their 45-day window. No action required today.
    </p>

    <h3>Account Status Summary</h3>
    <table style="border-collapse:collapse;width:100%;font-size:14px;">
      <tr style="background:#f5f5f5;">
        <td style="padding:10px 14px;border:1px solid #ddd;font-weight:bold;">Newest Trial Account</td>
        <td style="padding:10px 14px;border:1px solid #ddd;">CK's Signature Detailing (Cody Fogle) — May 20, 2026</td>
      </tr>
      <tr>
        <td style="padding:10px 14px;border:1px solid #ddd;font-weight:bold;">Days Until Next Check</td>
        <td style="padding:10px 14px;border:1px solid #ddd;">→ Handy Manny Enterprises (started Apr 29) expires in ~19 days</td>
      </tr>
    </table>

    <p style="margin-top:24px;font-size:13px;color:#666;">
      <strong>Next scan:</strong> May 26, 2026 at 08:00 AM ET<br>
      This automation runs daily and will flag any accounts meeting the inactive criteria.
    </p>

  </div>
</body>
</html>"""

payload = json.dumps({
    "personalizations": [{"to": [{"email": "kimberlycook1980@gmail.com", "name": "Kimberly Cook"}]}],
    "from": {"email": "admin@v-hub.us", "name": "V-HUB Automation"},
    "subject": "V-HUB Daily Inactive Provider Flag — May 25, 2026",
    "content": [{"type": "text/html", "value": html}]
}).encode()

req = urllib.request.Request(
    "https://api.sendgrid.com/v3/mail/send",
    data=payload,
    headers={"Authorization": f"Bearer {SENDGRID_KEY}", "Content-Type": "application/json"}
)
try:
    with urllib.request.urlopen(req, timeout=30) as r:
        print(f"✅ Email sent! Status: {r.status}")
except urllib.error.HTTPError as e:
    print(f"❌ Error {e.code}: {e.read().decode()}")
