import os, urllib.request, urllib.error, json

SENDGRID_API_KEY = os.environ.get("SENDGRID_API_KEY")

html = """<!DOCTYPE html>
<html><head><meta charset="UTF-8"><style>
body{font-family:Georgia,serif;background:#fdf6e3;margin:0;padding:0}
.container{max-width:600px;margin:0 auto;background:#fff;border:2px solid #1B3D6F;border-radius:8px;overflow:hidden}
.header{background:#1B3D6F;padding:24px;text-align:center}
.masthead{text-align:center;padding:16px 24px;border-bottom:3px solid #E8431A;background:#fdf6e3}
.masthead h1{font-size:36px;color:#1B3D6F;margin:0;font-family:Georgia,serif}
.masthead h1 span{color:#E8431A}
.body{padding:28px 32px;color:#333;font-size:15px;line-height:1.7}
.body h2{color:#1B3D6F;font-size:20px;border-bottom:2px solid #00BFA5;padding-bottom:6px}
.vh-box{background:#1B3D6F;color:#fff;border-radius:8px;padding:16px 24px;text-align:center;margin:24px 0}
.vh-box p{margin:0;font-size:13px;letter-spacing:1px;text-transform:uppercase;opacity:.8}
.vh-box .vh-num{font-size:32px;font-weight:bold;letter-spacing:4px;color:#FFDB00;margin:6px 0}
.info-table{width:100%;border-collapse:collapse;margin:16px 0}
.info-table td{padding:8px 12px;border-bottom:1px solid #eee;font-size:14px}
.info-table td:first-child{color:#666;width:40%}
.cta{text-align:center;margin:28px 0}
.cta a{background:#E8431A;color:#fff;padding:14px 32px;border-radius:6px;text-decoration:none;font-size:16px;font-weight:bold;display:inline-block}
.footer{background:#fdf6e3;padding:16px 24px;text-align:center;font-size:12px;color:#888;border-top:1px solid #ddd}
</style></head><body>
<div class="container">
  <div class="header">
    <img src="https://media.base44.com/images/public/69d062aca815ce8e697894b1/f14a7cbd0_logo_icon_small.png" alt="V-HUB Logo" style="height:48px">
  </div>
  <div class="masthead">
    <h1>V<span>-</span>HUB</h1>
    <p style="color:#666;font-size:13px;margin:4px 0 0">The Villages Local Services Directory</p>
  </div>
  <div class="body">
    <h2>Welcome to V-HUB, Trevor! 🎉</h2>
    <p>Your business listing for <strong>Trev's Precision - Mobile Cart Service</strong> is now <strong>live</strong> on V-HUB — The Villages' trusted local services directory!</p>

    <div class="vh-box">
      <p>Your V-HUB Provider Number</p>
      <div class="vh-num">VH-4988</div>
      <p style="font-size:12px;margin-top:4px">Use this number or your email to log in</p>
    </div>

    <table class="info-table">
      <tr><td>Business</td><td><strong>Trev's Precision - Mobile Cart Service</strong></td></tr>
      <tr><td>Owner</td><td>Trevor Pratt</td></tr>
      <tr><td>Login Email</td><td>usmcpratt4@gmail.com</td></tr>
      <tr><td>Trial Period</td><td>Free through June 26, 2026</td></tr>
    </table>

    <h2>Access Your Provider Hub</h2>
    <p>Log in anytime to update your profile, view leads, check analytics, and manage your listing:</p>
    <div class="cta"><a href="https://www.v-hub.us">Log In to Provider Hub</a></div>
    <p style="text-align:center;font-size:13px;color:#666">Go to <strong>www.v-hub.us</strong> &rarr; click <strong>Provider Hub</strong> &rarr; log in with <strong>VH-4988</strong> or your email</p>

    <h2>Tips to Get Found Faster</h2>
    <ul>
      <li>📣 Share your V-HUB listing on Facebook and Nextdoor</li>
      <li>⭐ Ask happy customers to leave a review on your V-HUB profile</li>
      <li>📍 Keep your service areas up to date in your dashboard</li>
      <li>🛒 Check out our <strong>Deals of the Week</strong> feature to run a weekly ad</li>
    </ul>

    <p>Questions? Just reply to this email — we're happy to help.</p>
    <p style="margin-top:24px">Welcome aboard,<br><strong>The V-HUB Team</strong></p>
  </div>
  <div class="footer">
    V-HUB &bull; The Villages, FL &bull; <a href="https://www.v-hub.us" style="color:#E8431A">www.v-hub.us</a><br>
    You're receiving this because you registered your business on V-HUB.
  </div>
</div>
</body></html>"""

payload = {
    "personalizations": [{
        "to": [{"email": "usmcpratt4@gmail.com", "name": "Trevor Pratt"}],
        "subject": "Welcome to V-HUB, Trevor! Your Listing is Live 🎉"
    }],
    "from": {"email": "admin@v-hub.us", "name": "Admin at V-HUB"},
    "reply_to": {"email": "admin@v-hub.us", "name": "V-HUB Support"},
    "content": [{"type": "text/html", "value": html}]
}

data = json.dumps(payload).encode("utf-8")
req = urllib.request.Request(
    "https://api.sendgrid.com/v3/mail/send",
    data=data,
    headers={
        "Authorization": f"Bearer {SENDGRID_API_KEY}",
        "Content-Type": "application/json"
    },
    method="POST"
)

try:
    with urllib.request.urlopen(req, timeout=30) as r:
        print(f"✅ Email sent! Status: {r.status}")
except urllib.error.HTTPError as e:
    body = e.read().decode()
    print(f"❌ Error {e.code}: {body}")
