import os, json, urllib.request, urllib.error, time

SENDGRID_API_KEY = os.environ.get("SENDGRID_API_KEY")

providers = [
  {"name": "Village Neighbor", "email": "info@villageneighbor.com", "vh": "VH-6364"},
  {"name": "All Air & Heat Inc.", "email": "info@allairandheat.com", "vh": "VH-6053"},
  {"name": "Golf Cart Guy", "email": "info@golfcartguy.com", "vh": "VH-5262"},
  {"name": "Fairway Golf Car Mobile Services", "email": "dignifiednow@gmail.com", "vh": "VH-7763"},
  {"name": "BC Kustom Karts", "email": "brianblume@bckustomkarts.com", "vh": "VH-2265"},
  {"name": "Todd Casey Golf Cart Repairs", "email": "info@caseyscartrepairs.com", "vh": "VH-4942"},
  {"name": "Five Star Golf Cart Service LLC", "email": "info@fivestargolfcart.com", "vh": "VH-2753"},
  {"name": "Kent Services — Mobile Mechanic", "email": "info@kentservices.com", "vh": "VH-8570"},
  {"name": "Garrett's Mobile Golf Car Service", "email": "info@garrettsmobilegolf.com", "vh": "VH-3200"},
  {"name": "Clay's Carts", "email": "info@clayscarts.com", "vh": "VH-3870"},
  {"name": "Elite Flooring of Central Florida", "email": "info@eliteflooringrenovations.com", "vh": "VH-5196"},
  {"name": "El Matador Tile & Remodeling", "email": "info@elmatadortile.com", "vh": "VH-1670"},
  {"name": "Scott's Construction Unlimited LLC", "email": "info@scottsconstruction.com", "vh": "VH-5980"},
  {"name": "Bearded Brothers Flooring", "email": "BeardedBrothers@aol.com", "vh": "VH-6162"},
  {"name": "Woodies Flooring and More LLC", "email": "woodiesflooringllc@gmail.com", "vh": "VH-6141"},
  {"name": "TNA Residential Services", "email": "info@tnaresidential.com", "vh": "VH-5894"},
  {"name": "Carr's Floor & Home Carpet One", "email": "info@carrsfloorandhome.com", "vh": "VH-5470"},
  {"name": "Stamped and Sealed Handyman LLC", "email": "info@stampedandsealed.com", "vh": "VH-9010"},
  {"name": "iFixed EZ Florida", "email": "info@ifixedfl.com", "vh": "VH-9088"},
  {"name": "Mazza Innovations LLC", "email": "info@mazzainteriors.us", "vh": "VH-6115"},
  {"name": "Good Steward Home Solutions", "email": "info@goodstewardhomesolutions.com", "vh": "VH-3549"},
  {"name": "Legacy Flooring & Paint LLC", "email": "info@legacyflooringandpaint.com", "vh": "VH-3688"},
  {"name": "Marshall Properties & Remodeling LLC", "email": "info@marshallpropertiesremodeling.com", "vh": "VH-2613"},
  {"name": "R&C Brady Services LLC", "email": "info@rcbradyservices.com", "vh": "VH-5139"},
  {"name": "A Cut Above Tile & Hardwood Installations Inc.", "email": "acutabovetile@gmail.com", "vh": "VH-5103"},
  {"name": "K&W Flooring Pros Inc.", "email": "info@kwflooringpros.com", "vh": "VH-3737"},
  {"name": "San Juan Tile LLC", "email": "info@sanjuantile.com", "vh": "VH-6411"},
  {"name": "Skinner's Environmental & Home Improvements LLC", "email": "info@skinnershomeimprovements.com", "vh": "VH-5514"},
  {"name": "Roberto's Flooring", "email": "info@robertosflooring.com", "vh": "VH-4383"},
  {"name": "Floors of Distinction", "email": "info@floorsofdistinctionfl.com", "vh": "VH-9271"},
  {"name": "Dawn A. Cary — Rite Rug Flooring", "email": "info@ritecarpet.com", "vh": "VH-2903"},
  {"name": "Nick's Automotive & Diesel Repair LLC.", "email": "info@nicksautomotivefl.com", "vh": "VH-4417"},
  {"name": "Trev's Precision - Mobile Cart Service", "email": None, "vh": "VH-2122"},  # no email
  {"name": "Karmen Madden - Weed & Lawn Care", "email": None, "vh": "VH-8898"},  # no email
]

def make_html(business_name, vh_number):
    return f"""
<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;background:#fffdf7;border:2px solid #1A6B3C;border-radius:8px;overflow:hidden">
  <div style="background:#1B3D6F;padding:20px;text-align:center">
    <img src="https://media.base44.com/images/public/69d062aca815ce8e697894b1/a9af95bc3_V-Hublogo.png" height="60" alt="V-Hub"/>
    <h1 style="color:#fff;font-size:22px;margin:10px 0 0">You're Listed on V-Hub!</h1>
  </div>
  <div style="padding:28px 32px">
    <p style="font-size:16px;color:#1a1a1a">Hi <strong>{business_name}</strong>,</p>
    <p style="color:#333;line-height:1.7">Great news — your business is now listed on <strong>V-Hub</strong>, The Villages' local services directory! Residents across The Villages can now find and contact you directly through our platform.</p>
    <p style="color:#333;line-height:1.7"><strong>Your Account Details:</strong><br/>
    Account #: <strong>{vh_number}</strong><br/>
    Directory: <a href="https://www.v-hub.us" style="color:#1B3D6F">www.v-hub.us</a></p>
    <p style="color:#333;line-height:1.7">You're currently enjoying a <strong>45-day free trial</strong> — no credit card required. After your trial, you can continue your listing for just <strong>$12/month</strong>. We'll reach out before it ends.</p>
    <p style="color:#333;line-height:1.7">Want to manage your profile, update your services, or view customer inquiries? Log in to your Provider Hub anytime:<br/>
    <a href="https://www.v-hub.us/ProviderDashboard" style="color:#1B3D6F;font-weight:bold">www.v-hub.us/ProviderDashboard</a></p>
    <p style="color:#333;line-height:1.7">To set up your login, use the "Forgot Password" option with your email address and we'll get you access right away.</p>
    <p style="color:#333;line-height:1.7">We're proud to support local businesses in The Villages community. Welcome aboard!</p>
    <p style="color:#333">Warm regards,<br/><strong>The V-Hub Team</strong><br/>
    <a href="https://www.v-hub.us" style="color:#1B3D6F">www.v-hub.us</a> | admin@v-hub.us</p>
  </div>
  <div style="background:#f0f0e8;padding:14px;text-align:center;font-size:11px;color:#666">
    V-Hub · The Villages, Florida · <a href="https://www.v-hub.us" style="color:#1B3D6F">www.v-hub.us</a>
  </div>
</div>
"""

sent = []
skipped = []
failed = []

for p in providers:
    if not p["email"]:
        skipped.append(f"{p['name']} — no email on file")
        continue

    payload = {
        "personalizations": [{"to": [{"email": p["email"]}]}],
        "from": {"email": "admin@v-hub.us", "name": "V-Hub"},
        "subject": f"You're Listed on V-Hub! Welcome, {p['name']} 🏡",
        "content": [{"type": "text/html", "value": make_html(p["name"], p["vh"])}]
    }

    req = urllib.request.Request(
        "https://api.sendgrid.com/v3/mail/send",
        data=json.dumps(payload).encode(),
        headers={
            "Authorization": f"Bearer {SENDGRID_API_KEY}",
            "Content-Type": "application/json"
        },
        method="POST"
    )
    try:
        with urllib.request.urlopen(req) as resp:
            sent.append(f"{p['name']} → {p['email']}")
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        failed.append(f"{p['name']} → {p['email']} | {e.code}: {body[:120]}")

    time.sleep(0.3)  # be kind to SendGrid rate limits

print(f"\n✅ SENT ({len(sent)}):")
for s in sent: print(f"  {s}")

print(f"\n⏭ SKIPPED — no email ({len(skipped)}):")
for s in skipped: print(f"  {s}")

print(f"\n❌ FAILED ({len(failed)}):")
for f in failed: print(f"  {f}")
