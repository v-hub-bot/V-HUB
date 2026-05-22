import os, json, urllib.request, urllib.error

SENDGRID_KEY = os.environ.get("SENDGRID_API_KEY", "")

html = """<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f4f0e8;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f0e8;padding:30px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #ddd;border-radius:4px;">

        <!-- Header -->
        <tr>
          <td style="background:#1B3D6F;padding:24px 32px;text-align:center;">
            <img src="https://media.base44.com/images/public/69d062aca815ce8e697894b1/a9af95bc3_V-Hublogo.png" width="120" alt="V-HUB" style="display:block;margin:0 auto 10px auto;" />
            <div style="color:#ffffff;font-size:13px;font-family:Arial,sans-serif;letter-spacing:2px;text-transform:uppercase;">The Villages Local Services Directory</div>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 40px;">
            <p style="font-size:16px;color:#333;line-height:1.7;margin:0 0 18px 0;">Hi Trevor,</p>

            <p style="font-size:16px;color:#333;line-height:1.7;margin:0 0 18px 0;">Great news — your <strong>Trev's Precision Mobile Cart Service</strong> featured ad is now <strong>LIVE</strong> on V-HUB! 🎉</p>

            <p style="font-size:16px;color:#333;line-height:1.7;margin:0 0 18px 0;">Your ad is being shown to Villagers right now on the V-HUB homepage. This promotional placement is <strong>completely free of charge</strong> and will run through <strong>June 15, 2026</strong>.</p>

            <!-- Ad Image Preview -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center" style="padding:10px 0 24px 0;">
                  <img src="https://media.base44.com/images/public/69d062aca815ce8e697894b1/bfc1dba57_file_000000003aac720c892fe9b7505ef761.png" width="500" alt="Trev's Precision Ad" style="display:block;max-width:100%;border-radius:6px;box-shadow:0 2px 8px rgba(0,0,0,0.15);" />
                </td>
              </tr>
            </table>

            <p style="font-size:16px;color:#333;line-height:1.7;margin:0 0 18px 0;">You can view your listing anytime at <a href="https://www.v-hub.us" style="color:#E8431A;">www.v-hub.us</a> — just search for Trev's Precision or browse Golf Cart Services.</p>

            <p style="font-size:16px;color:#333;line-height:1.7;margin:0 0 18px 0;">Feel free to share the good news on your Facebook page and let your customers know you're featured on V-HUB!</p>

            <p style="font-size:16px;color:#333;line-height:1.7;margin:0 0 6px 0;">Thank you for being part of the V-HUB community, Trevor. We look forward to helping connect you with more Villagers!</p>

            <p style="font-size:16px;color:#333;line-height:1.7;margin:18px 0 6px 0;">Best regards,</p>
            <p style="font-size:16px;color:#333;font-weight:bold;margin:0;">The V-HUB Team</p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#1B3D6F;padding:18px 32px;text-align:center;">
            <p style="color:#aab8cc;font-size:12px;font-family:Arial,sans-serif;margin:0;">
              V-HUB · The Villages Local Services Directory · <a href="https://www.v-hub.us" style="color:#00BFA5;text-decoration:none;">www.v-hub.us</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>"""

payload = json.dumps({
    "personalizations": [{"to": [{"email": "usmcpratt4@gmail.com", "name": "Trevor Pratt"}]}],
    "from": {"email": "admin@v-hub.us", "name": "The V-HUB Team"},
    "reply_to": {"email": "admin@v-hub.us", "name": "The V-HUB Team"},
    "subject": "Your Trev's Precision Ad is LIVE on V-HUB! 🎉",
    "content": [{"type": "text/html", "value": html}]
}).encode()

req = urllib.request.Request(
    "https://api.sendgrid.com/v3/mail/send",
    data=payload,
    headers={"Authorization": f"Bearer {SENDGRID_KEY}", "Content-Type": "application/json"}
)
try:
    with urllib.request.urlopen(req, timeout=30) as r:
        print(f"✅ Email sent to Trevor! Status: {r.status}")
except urllib.error.HTTPError as e:
    print(f"❌ Error {e.code}: {e.read().decode()}")
