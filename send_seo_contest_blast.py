import json, os, urllib.request, time

SENDGRID_API_KEY = os.environ.get("SENDGRID_API_KEY", "")

providers_raw = """INSERT_PROVIDERS_JSON"""

def get_name(p):
    name = (p.get("owner_name") or "").strip()
    if name and name.lower() not in ("owner", "manager", ""):
        # Use first name only
        return name.split()[0].title()
    # Fall back to business name
    return (p.get("business_name") or "there").strip()

def get_email(p):
    email = (p.get("login_email") or p.get("email") or "").strip()
    return email if "@" in email else None

def send_email(to_email, to_name, business_name):
    subject = "You're Listed on V-HUB — Help Us Help You Get Found!"
    html = f"""
<div style="font-family:Georgia,serif;max-width:600px;margin:auto;color:#222;">
  <div style="background:#1B3D6F;padding:16px 24px;text-align:center;">
    <img src="https://media.base44.com/images/public/69d062aca815ce8e697894b1/a9af95bc3_V-Hublogo.png" alt="V-HUB" style="height:48px;">
  </div>
  <div style="padding:28px 24px;background:#fffdf7;">
    <p>Hi {to_name},</p>
    <p>Just a quick note from the team at <strong>V-HUB</strong> — The Villages' local services directory.</p>
    <p><strong>{business_name}</strong> is listed at <a href="https://www.v-hub.us" style="color:#E8431A;">www.v-hub.us</a> and we'd love to help more residents find you.</p>
    <p>One simple thing that makes a big difference — add a line to your website or Facebook page:</p>
    <div style="background:#f5f0e8;border-left:4px solid #E8431A;padding:12px 16px;margin:16px 0;font-style:italic;">
      "Find us on V-HUB — The Villages Local Directory: www.v-hub.us"
    </div>
    <p>When Google sees your business linking to V-HUB (and V-HUB linking back to you), it helps <strong>both</strong> of us rank higher in local search results. More visibility for you, more traffic for the whole directory.</p>
    <p>If you don't have a website, even a quick Facebook post mentioning V-HUB works great!</p>

    <hr style="border:none;border-top:1px solid #ddd;margin:24px 0;">

    <p style="color:#E8431A;font-weight:bold;font-size:16px;">📸 Also — We're Running a Photo Contest!</p>
    <p>We're inviting Villages residents to submit their favorite local photos for a chance to be featured on the <strong>V-HUB homepage</strong>! The winning photo gets full credit and visibility to thousands of visitors.</p>
    <p>Help us spread the word — share the contest on your Facebook page or mention it to your customers. The more entries, the better the community showcase!</p>
    <p>Contest details at: <a href="https://www.v-hub.us" style="color:#E8431A;">www.v-hub.us</a></p>

    <hr style="border:none;border-top:1px solid #ddd;margin:24px 0;">

    <p>Thanks for being part of The Villages community!</p>
    <p style="margin-top:24px;">
      <strong>Admin Team</strong><br>
      V-HUB — The Villages Local Services Directory<br>
      <a href="https://www.v-hub.us" style="color:#E8431A;">www.v-hub.us</a>
    </p>
  </div>
  <div style="background:#1B3D6F;padding:10px 24px;text-align:center;color:#aaa;font-size:11px;">
    © 2026 V-HUB · The Villages, FL · <a href="https://www.v-hub.us" style="color:#aaa;">www.v-hub.us</a>
  </div>
</div>
"""
    payload = json.dumps({
        "personalizations": [{"to": [{"email": to_email, "name": to_name}]}],
        "from": {"email": "admin@v-hub.us", "name": "Admin at V-HUB"},
        "reply_to": {"email": "admin@v-hub.us", "name": "Admin at V-HUB"},
        "subject": subject,
        "content": [{"type": "text/html", "value": html}]
    }).encode()

    req = urllib.request.Request(
        "https://api.sendgrid.com/v3/mail/send",
        data=payload,
        method="POST",
        headers={
            "Authorization": f"Bearer {SENDGRID_API_KEY}",
            "Content-Type": "application/json"
        }
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return resp.status
    except urllib.error.HTTPError as e:
        return e.code

if __name__ == "__main__":
    with open("providers_for_blast.json") as f:
        providers = json.load(f)

    sent = 0
    skipped = 0
    failed = 0
    skipped_list = []

    for p in providers:
        email = get_email(p)
        if not email:
            skipped += 1
            skipped_list.append(p.get("business_name", "unknown"))
            continue
        name = get_name(p)
        business = (p.get("business_name") or "your business").strip()
        status = send_email(email, name, business)
        if status in (200, 202):
            sent += 1
            print(f"✅ {business} → {email}")
        else:
            failed += 1
            print(f"❌ FAILED ({status}) {business} → {email}")
        time.sleep(0.1)  # gentle rate limiting

    print(f"\n=== DONE ===")
    print(f"Sent:    {sent}")
    print(f"Skipped (no email): {skipped}")
    print(f"Failed:  {failed}")
    if skipped_list:
        print(f"\nNo email on file for: {', '.join(skipped_list[:20])}")
