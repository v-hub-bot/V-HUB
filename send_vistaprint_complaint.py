import os, json, urllib.request, urllib.error

SENDGRID_KEY = os.environ.get("SENDGRID_API_KEY", "")

html = """<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;color:#333;">
  <div style="max-width:650px;margin:auto;padding:30px 20px;">

    <p>To Whom It May Concern at Vistaprint Customer Service,</p>

    <p>I am writing to report an incorrect order fulfillment that requires immediate resolution.</p>

    <p>I placed an order for <strong>custom printed V-HUB labels/stickers</strong> featuring our V-HUB logo, QR code, and the text "Find a Service Provider in Your Village." What I received instead was a <strong>completely blank roll of labels</strong> with no printing whatsoever.</p>

    <p>The second image attached to this email shows exactly what the label was supposed to look like — our custom V-HUB branded design with logo, QR code, and text. The first image shows what was actually delivered — a blank roll with only barcodes on the outside packaging.</p>

    <p>This is clearly a fulfillment error on Vistaprint's part. I need one of the following resolutions:</p>
    <ol>
      <li><strong>Rush reprint and re-shipment</strong> of the correct order at no additional charge, or</li>
      <li><strong>Full refund</strong> for the order amount</li>
    </ol>

    <p>Please advise on the fastest path to resolution. I am happy to provide the order number or any additional information needed to process this claim immediately.</p>

    <p>I would appreciate a response as soon as possible, as these labels were ordered for active business use.</p>

    <p>Thank you for your prompt attention to this matter.</p>

    <p style="margin-top:24px;">
      Sincerely,<br>
      <strong>Kimberly Cook</strong><br>
      V-HUB — The Villages Local Services Directory<br>
      kimberlycook1980@gmail.com<br>
      540-654-0988<br>
      <a href="https://www.v-hub.us">www.v-hub.us</a>
    </p>

  </div>
</body>
</html>"""

payload = json.dumps({
    "personalizations": [{"to": [{"email": "customerservice@vistaprint.com", "name": "Vistaprint Customer Service"}]}],
    "from": {"email": "kimberlycook1980@gmail.com", "name": "Kimberly Cook"},
    "reply_to": {"email": "kimberlycook1980@gmail.com", "name": "Kimberly Cook"},
    "subject": "Incorrect Order Received — Blank Labels Instead of Custom Printed Stickers",
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
