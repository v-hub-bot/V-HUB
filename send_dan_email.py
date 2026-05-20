import os, json, urllib.request, urllib.error

SENDGRID_KEY = os.environ.get("SENDGRID_API_KEY", "")

html = """
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f4f0e8;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f0e8;padding:30px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #ddd;border-radius:4px;">
        <tr>
          <td style="background:#1B3D6F;padding:24px 32px;text-align:center;">
            <img src="https://media.base44.com/images/public/69d062aca815ce8e697894b1/a9af95bc3_V-Hublogo.png" width="120" alt="V-HUB" style="display:block;margin:0 auto 10px auto;" />
            <div style="color:#ffffff;font-size:13px;font-family:Arial,sans-serif;letter-spacing:2px;text-transform:uppercase;">The Villages Local Services Directory</div>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 40px;">
            <p style="font-size:16px;color:#333;line-height:1.7;margin:0 0 18px 0;">Dear Valued V-Hub Provider,</p>
            <p style="font-size:16px;color:#333;line-height:1.7;margin:0 0 18px 0;">Thank you for your support during the V-Hub rollout. We truly appreciate your partnership and participation on the platform.</p>
            <p style="font-size:16px;color:#333;line-height:1.7;margin:0 0 18px 0;">As a token of our appreciation, we are offering you <strong>FREE enhanced visibility</strong> to Villagers seeking services through V-Hub. We have prepared a featured advertisement for your business that will appear as a link from the V-Hub homepage.</p>
            <p style="font-size:16px;color:#333;line-height:1.7;margin:0 0 18px 0;">Before the ad goes live, we would like to provide you with the opportunity to review and approve the content of your ad. This promotional placement is <strong>completely free of charge</strong> and will run through <strong>June 15, 2026</strong>.</p>
            <p style="font-size:16px;color:#333;line-height:1.7;margin:0 0 24px 0;">Please review the ad shown below and reply to this email to let us know you approve, or if you would like any changes made before launch.</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center" style="padding:10px 0 24px 0;">
                  <img src="https://base44.app/api/apps/69d062aca815ce8e697894b1/files/mp/public/69d062aca815ce8e697894b1/7365fdd08_tropical_splash_final.jpg" width="500" alt="Tropical Splash Painting Ad" style="display:block;max-width:100%;border-radius:6px;box-shadow:0 2px 8px rgba(0,0,0,0.15);" />
                </td>
              </tr>
            </table>
            <p style="font-size:16px;color:#333;line-height:1.7;margin:0 0 6px 0;">Thank you again for being part of the V-Hub community. We look forward to helping connect you with more Villagers.</p>
            <p style="font-size:16px;color:#333;line-height:1.7;margin:18px 0 6px 0;">Best regards,</p>
            <p style="font-size:16px;color:#333;font-weight:bold;margin:0;">The V-Hub Team</p>
          </td>
        </tr>
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
</html>
"""

for recipient in ["tropicalsplashpainting@gmail.com", "kimberlycook1980@gmail.com"]:
    payload = json.dumps({
        "personalizations": [{"to": [{"email": recipient}]}],
        "from": {"email": "admin@v-hub.us", "name": "The V-Hub Team"},
        "reply_to": {"email": "admin@v-hub.us", "name": "The V-Hub Team"},
        "subject": "Your FREE Featured Ad on V-HUB — Tropical Splash Painting Power Washing & More",
        "content": [{"type": "text/html", "value": html}]
    }).encode()

    req = urllib.request.Request(
        "https://api.sendgrid.com/v3/mail/send",
        data=payload,
        headers={"Authorization": f"Bearer {SENDGRID_KEY}", "Content-Type": "application/json"}
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            print(f"✅ Sent to {recipient} — Status: {r.status}")
    except urllib.error.HTTPError as e:
        print(f"❌ Error: {e.read()}")
