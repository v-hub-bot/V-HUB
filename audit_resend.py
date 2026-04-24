#!/usr/bin/env python3
"""
Resend welcome emails to all early providers (pre-DKIM, self-registered)
who may have had their original emails go to spam.
These all have login_email set (they self-registered) and managed_by = 'provider' or 'self'
DKIM was verified April 22 2026 — so anyone created before that is at risk.
We resend a clean "your listing is live + login reminder" email.
"""

import os, json, time, urllib.request, urllib.error

SENDGRID_API_KEY = os.environ.get("SENDGRID_API_KEY", "")
FROM_EMAIL = "admin@v-hub.us"
FROM_NAME = "V-HUB Directory"
LOGIN_URL = "https://v-hub-app-edf7f8e8.base44.app/ProviderDashboard"
HOME_URL = "https://www.v-hub.us"

# All pre-DKIM self-registered providers with emails
# These signed up themselves but their confirmation may have gone to spam
PROVIDERS = [
    # Format: (vh_number, business_name, email)
    ("VH-2794", "Nick's Automotive & Diesel Repair LLC", "nicksrepairs@yahoo.com"),
    ("VH-3707", "Dawn A. Cary — Rite Rug Flooring", "dawncary@riterug.com"),
    ("VH-6278", "Floors of Distinction", "info@floorsofdistinctionfl.com"),
    ("VH-4383", "Roberto's Flooring", "info@robertosflooring.com"),
    ("VH-5514", "Skinner's Environmental & Home Improvements LLC", "info@skinnershomeimprovements.com"),
    ("VH-6411", "San Juan Tile LLC", "info@sanjuantile.com"),
    ("VH-3737", "K&W Flooring Pros Inc.", "info@kwflooringpros.com"),
    ("VH-5103", "A Cut Above Tile & Hardwood Installations Inc.", "acutabovetile@gmail.com"),
    ("VH-5139", "R&C Brady Services LLC", "info@rcbradyservices.com"),
    ("VH-2613", "Marshall Properties & Remodeling LLC", "info@marshallpropertiesremodeling.com"),
    ("VH-3688", "Legacy Flooring & Paint LLC", "info@legacyflooringandpaint.com"),
    ("VH-3549", "Good Steward Home Solutions", "info@goodstewardhomesolutions.com"),
    ("VH-6115", "Mazza Innovations LLC", "info@mazzainteriors.us"),
    ("VH-9088", "iFixed EZ Florida", "info@ifixedfl.com"),
    ("VH-9010", "Stamped and Sealed Handyman LLC", "info@stampedandsealed.com"),
    ("VH-5470", "Carr's Floor & Home Carpet One", "info@carrsfloorandhome.com"),
    ("VH-5894", "TNA Residential Services", "info@tnaresidential.com"),
    ("VH-6141", "Woodies Flooring and More LLC", "woodiesflooringllc@gmail.com"),
    ("VH-6162", "Bearded Brothers Flooring", "BeardedBrothers@aol.com"),
    ("VH-5980", "Scott's Construction Unlimited LLC", "info@scottsconstruction.com"),
    ("VH-1670", "El Matador Tile & Remodeling", "info@elmatadortile.com"),
    ("VH-5196", "Elite Flooring of Central Florida", "info@eliteflooringrenovations.com"),
    ("VH-3870", "Clay's Carts", "info@clayscarts.com"),
    ("VH-3200", "Garrett's Mobile Golf Car Service", "info@garrettsmobilegolf.com"),
    ("VH-8570", "Kent Services — Mobile Mechanic", "info@kentservices.com"),
    ("VH-2753", "Five Star Golf Cart Service LLC", "info@fivestargolfcart.com"),
    ("VH-4942", "Todd Casey Golf Cart Repairs", "info@caseyscartrepairs.com"),
    ("VH-5172", "BC Kustom Karts", "brianblume@bckustomkarts.com"),
    ("VH-1234", "All About Carts", "aacvillages@gmail.com"),
    ("VH-4321", "Willie's Golf Cart Repair", "jlwil307@aol.com"),
    ("VH-2144", "William's Golf & Cart Services", "evansrus@comcast.net"),
    ("VH-3609", "Quality Moving Services", "qualitymovingservices@outlook.com"),
    ("VH-8934", "Irrigation Nation", "info@irrigationnation.org"),
    ("VH-1475", "Residential Water Works LLC", "dvorisek@residentialwaterworks.com"),
    ("VH-1365", "Freeman Landscaping", "freemanmep@gmail.com"),
    ("VH-6474", "PLOS Lawn & Landscaping", "interceptorsix@gmail.com"),
    ("VH-5991", "Leelandscape LLC", "daleylandscapellc@gmail.com"),
    ("VH-6435", "Sunshine Awnings — Outdoor Cleaning", "sellarspatch@aol.com"),
    ("VH-0006", "S&W Roofing LLC", "Hello@SWRoofingLLC.com"),
    ("VH-1611", "Puddle Pool Services", "info@puddlepools.com"),
    ("VH-5353", "Advanced Pool & Spa Sales", "advancedcompanies@yahoo.com"),
    ("VH-7579", "Ricardo's Painting Services LLC", "Ricardoh2583@gmail.com"),
    ("VH-0644", "The Village Super Home Repair", "info@thevillagesuperllc.com"),
    ("VH-3076", "D&D Golf Cart Rentals LLC", "ddcartrentals@yahoo.com"),
    ("VH-0455", "VillagersHome WatchPlus", "randyk053@gmail.com"),
    ("VH-8840", "Mr. Handyman", "ocala@mrhandyman.com"),
    ("VH-3005", "Thomas's Handyman Service", "hello@thomashandymanservice.com"),
    ("VH-3968", "Exterior Experts LLC", "info@eehousewashing.com"),
    ("VH-1817", "A-1 Devon Irrigation", "devonirrigation@gmail.com"),
    ("VH-3398", "FLI Lawn Tune-Up", "fli83@live.com"),
    ("VH-8082", "SprinkleRight Irrigation", "SprinkleRight@gmail.com"),
    ("VH-3642", "Windows of Central Florida", "windowsofcfl@gmail.com"),
    ("VH-1754", "Q Services LLC", "info@qservicesllc.com"),
    ("VH-0069", "#1 A Docs Painting with Excellence", "adocspaintingwithexcellence@gmail.com"),
    # Additional batches
    ("VH-2122", "Trev's Precision Lawn Care", "usmcpratt4@gmail.com"),
    ("VH-7842", "Tallman Lawn Services", "tallmanlawnservices@gmail.com"),
    ("VH-9485", "Karmen's Weed Control", "martinezweedcontrol@gmail.com"),
    ("VH-3718", "Barefoot Landscape & Design LLC", "barefootlandscapedesign@gmail.com"),
    ("VH-2027", "Village Home Watch & Services", "info@villagehomewatch.com"),
    ("VH-2915", "Villages Home Watch", "info@VillagesHW.com"),
]

def build_email_html(vh_number, business_name):
    return f"""
    <html><body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#333;">
      <div style="background:#1B3D6F;padding:20px;text-align:center;">
        <img src="https://media.base44.com/images/public/69d062aca815ce8e697894b1/a9af95bc3_V-Hublogo.png"
             alt="V-HUB" style="height:60px;">
      </div>
      <div style="padding:30px;">
        <p>Hi <strong>{business_name}</strong> team,</p>
        <p>We're reaching out to confirm that your business is actively listed on <strong>V-HUB</strong> — The Villages' local services directory at <a href="{HOME_URL}">www.v-hub.us</a>. Villages residents are searching for trusted providers like you every day.</p>
        <p>We recently upgraded our email system and want to make sure this message reaches your inbox properly. You can log in to your <strong>Provider Hub</strong> anytime to view leads, manage your profile, and see how many residents have found you:</p>
        <p style="text-align:center; margin:24px 0;">
          <a href="{LOGIN_URL}" style="background-color:#E8431A;color:#ffffff;padding:14px 28px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:16px;">Access Your Provider Hub</a>
        </p>
        <p><strong>Your login:</strong><br>
        🔑 VH Number: <strong>{vh_number}</strong><br>
        🔒 Use the password you set when you registered (or contact us to reset it)</p>
        <p>If you never received your original welcome email or have trouble logging in, just reply to this message and we'll get you sorted right away.</p>
        <p>Thank you for being part of V-HUB!<br>
        The V-HUB Team<br>
        <a href="{HOME_URL}">www.v-hub.us</a></p>
      </div>
      <div style="background:#f5f5f5;padding:15px;text-align:center;font-size:12px;color:#888;">
        V-HUB · The Villages Local Services Directory · <a href="{HOME_URL}">{HOME_URL}</a>
      </div>
    </body></html>
    """

def send_email(to_email, subject, html_content):
    data = json.dumps({
        "personalizations": [{"to": [{"email": to_email}]}],
        "from": {"email": FROM_EMAIL, "name": FROM_NAME},
        "subject": subject,
        "content": [{"type": "text/html", "value": html_content}]
    }).encode("utf-8")
    req = urllib.request.Request(
        "https://api.sendgrid.com/v3/mail/send",
        data=data,
        headers={"Authorization": f"Bearer {SENDGRID_API_KEY}", "Content-Type": "application/json"},
        method="POST"
    )
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, "OK"
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()

sent, failed, skipped = [], [], []

for vh_number, business_name, email in PROVIDERS:
    if not email or email.strip() == "":
        skipped.append((vh_number, business_name))
        continue

    subject = f"Your V-HUB listing is live — Provider Hub access ({vh_number})"
    html = build_email_html(vh_number, business_name)
    status, msg = send_email(email, subject, html)

    if status in (200, 202):
        print(f"✅ {vh_number} {business_name} → {email}")
        sent.append((vh_number, business_name, email))
    else:
        print(f"❌ {vh_number} {business_name} → {email} | {status}: {msg[:120]}")
        failed.append((vh_number, business_name, email, status))
    time.sleep(0.3)

print(f"\n=== DONE ===")
print(f"✅ Sent: {len(sent)}")
print(f"❌ Failed: {len(failed)}")
print(f"⏭️  Skipped (no email): {len(skipped)}")
if failed:
    print("\nFailed:")
    for f in failed:
        print(f"  {f[0]} {f[1]} ({f[2]}): {f[3]}")
