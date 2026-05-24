import os, json, urllib.request, urllib.error

SENDGRID_KEY = os.environ.get("SENDGRID_API_KEY", "")

html = """<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;color:#333;">
  <div style="max-width:650px;margin:auto;padding:30px 20px;">

    <p>To Whom It May Concern at Vistaprint Customer Service,</p>

    <p>I am writing to report an incorrect order fulfillment that requires immediate resolution. Please see my order details below:</p>

    <table style="border-collapse:collapse;width:100%;margin:16px 0;font-size:15px;">
      <tr style="background:#f5f5f5;">
        <td style="padding:10px 14px;border:1px solid #ddd;font-weight:bold;width:40%;">Order Number</td>
        <td style="padding:10px 14px;border:1px solid #ddd;"><strong>VP_8D01N7S9</strong></td>
      </tr>
      <tr>
        <td style="padding:10px 14px;border:1px solid #ddd;font-weight:bold;">Order Date</td>
        <td style="padding:10px 14px;border:1px solid #ddd;">May 15, 2026</td>
      </tr>
      <tr style="background:#f5f5f5;">
        <td style="padding:10px 14px;border:1px solid #ddd;font-weight:bold;">Account Email</td>
        <td style="padding:10px 14px;border:1px solid #ddd;">kimberlycook1980@gmail.com</td>
      </tr>
    </table>

    <p>I ordered <strong>custom printed V-HUB labels/stickers</strong> featuring our V-HUB logo, QR code, and the text "Find a Service Provider in Your Village." What I received instead was a <strong>completely blank roll of labels</strong> with no printing whatsoever — only barcodes on the outer packaging.</p>

    <p>This is clearly a fulfillment error. I am requesting one of the following resolutions:</p>
    <ol>
      <li><strong>Rush reprint and re-shipment</strong> of the correct order at no additional charge, or</li>
      <li><strong>Full refund</strong> to my original payment method</li>
    </ol>

    <p>I have photos of what was received versus what was ordered and am happy to provide them upon request.</p>

    <p>Please respond as soon as possible — these labels were ordered for active business use and this error has caused a significant delay.</p>

    <p style="margin-top:24px;">
      Sincerely,<br>
      <strong>Kimberly Cook</strong><br>
      V-HUB — The Villages Local Services Directory<br>
      <strong>Email:</strong> kimberlycook1980@gmail.com<br>
      <strong>Phone:</strong> 540-654-0988<br>
      <a href="https://www.v-hub.us">www.v-hub.us</a>
    </p>

  </div>
</body>
</html>"""

payload = json.dumps({
    "personalizations": [{"to": [{"email": "customerservice@vistaprint.com", "name": "Vistaprint Customer Service"}]}],
    "from": {"email": "admin@v-hub.us", "name": "Kimberly Cook — V-HUB"},
    "reply_to": {"email": "kimberlycook1980@gmail.com", "name": "Kimberly Cook"},
    "subject": "Incorrect Order — Order #VP_8D01N7S9 — Blank Labels Received Instead of Custom Printed Stickers",
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
