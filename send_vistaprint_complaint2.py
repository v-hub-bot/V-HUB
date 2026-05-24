import os, json, urllib.request, urllib.error

SENDGRID_KEY = os.environ.get("SENDGRID_API_KEY", "")

html = """<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;color:#333;">
  <div style="max-width:650px;margin:auto;padding:30px 20px;">

    <p>To Whom It May Concern at Vistaprint Customer Service,</p>

    <p>I am writing to report an incorrect order fulfillment that requires immediate resolution.</p>

    <p>I placed an order for <strong>custom printed V-HUB labels/stickers</strong> featuring our V-HUB logo, QR code, and the text "Find a Service Provider in Your Village." What I received instead was a <strong>completely blank roll of labels</strong> with no printing whatsoever.</p>

    <p>I have attached two images for reference:</p>
    <ul>
      <li><strong>Image 1:</strong> What was delivered — a blank roll of labels with nothing printed on them, only barcodes on the outer packaging</li>
      <li><strong>Image 2:</strong> What I ordered — a custom V-HUB branded label with our logo, QR code, and "Find a Service Provider in Your Village" text</li>
    </ul>

    <p>This is clearly a fulfillment error. I need one of the following resolutions:</p>
    <ol>
      <li><strong>Rush reprint and re-shipment</strong> of the correct order at no additional charge, or</li>
      <li><strong>Full refund</strong> for the order amount</li>
    </ol>

    <p>Please advise on the fastest path to resolution. I am happy to provide the order number or any additional information needed to process this claim promptly.</p>

    <p>I would appreciate a response as soon as possible, as these labels were ordered for active business use.</p>

    <p>Thank you for your attention to this matter.</p>

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
