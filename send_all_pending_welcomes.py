#!/usr/bin/env python3
"""Send welcome emails to all pending providers with email addresses."""

import os
import json
import time
import hashlib
import secrets
import urllib.request
import urllib.error

SENDGRID_API_KEY = os.environ.get("SENDGRID_API_KEY", "")
FROM_EMAIL = "admin@v-hub.us"
FROM_NAME = "V-HUB Directory"
LOGIN_URL = "https://v-hub-app-edf7f8e8.base44.app/ProviderDashboard"
HOME_URL = "https://www.v-hub.us"

# All providers needing welcome emails
# Format: (vh_number, business_name, email, managed_by)
PROVIDERS = [
    # V-Hub managed - new additions with emails
    ("VH-9129", "Mr. Stucco Man", "lirenovation@yahoo.com", "V-Hub"),
    ("VH-6756", "Clear Clean Services", "contact@clearcleanservices.com", "V-Hub"),
    ("VH-3584", "CLC Lawn Care LLC", "rekitokr7@gmail.com", "V-Hub"),
    ("VH-2305", "Green Pastures 23 Lawn Care & Landscaping", "gp23lawns@gmail.com", "V-Hub"),
    ("VH-2341", "Thomas's Handyman Service", "hello@thomashandymanservice.com", "V-Hub"),
    ("VH-8821", "Award Construction LLC", "awardconstruction2023@gmail.com", "V-Hub"),
    ("VH-3347", "DF Builders LLC", "DFBuildersllc@gmail.com", "V-Hub"),
    ("VH-7712", "VH Carpentry & Handyman Services LLC", "vh.carpentryservices@gmail.com", "V-Hub"),
    ("VH-4419", "T-Mat Construction Inc.", "TMatConstruction@AOL.com", "V-Hub"),
    ("VH-2984", "A.M. Complete Home Maintenance LLC", "amcompletehome@gmail.com", "V-Hub"),
    ("VH-9923", "Superior Service Construction LLC", "mike@superiorserviceconstruction.com", "V-Hub"),
    # Self-Managed - previously blocked by SendGrid limit
    ("VH-4664", "Integrity Electrical Contracting of FL Inc.", "integrity.elec@aol.com", "Self-Managed"),
    ("VH-1923", "Lake-Sumter Electric", "lakesumterelectric@yahoo.com", "Self-Managed"),
    ("VH-4898", "Lake County Electrician LLC", "lakecountyelectricianfl@gmail.com", "Self-Managed"),
    ("VH-9638", "Roam Electric Inc.", "Office@roamelectricinc.com", "Self-Managed"),
    ("VH-3836", "Pegasus Construction Group Inc.", "PegasusConstructionGroupInc@gmail.com", "Self-Managed"),
    ("VH-2883", "Mr. Goodbrush Painting & Renovations", "Robert@MisterGoodBrush.com", "Self-Managed"),
    ("VH-9551", "All Surface Rejuvenations Plus", "Dave@WeSealGrout.com", "Self-Managed"),
    ("VH-2158", "J&H Property and Land Solutions", "JHPropSolutionsLLC@gmail.com", "Self-Managed"),
    ("VH-7091", "Christian Brothers Power Washing & Windows", "cb.powerwashing.windows@gmail.com", "Self-Managed"),
    ("VH-4854", "Liberty Moves Orlando", "info@libertymoves.com", "Self-Managed"),
    ("VH-3239", "Helen's Nails & Spa", "nhatquangp2000@yahoo.com", "Self-Managed"),
    ("VH-3691", "Duncan Family Movers LLC", "duncanfamilymovers@gmail.com", "Self-Managed"),
    ("VH-3372", "All American Muscle Moving LLC", "allamericanmusclemoving@gmail.com", "Self-Managed"),
    ("VH-9946", "Tri-County Movers", "tri_countymovers@yahoo.com", "Self-Managed"),
    ("VH-4968", "DPS Flooring Kitchen & Bath Inc.", "johnnybass87@gmail.com", "Self-Managed"),
    ("VH-4998", "First Class Junk Removing LLC", "firstclassjunkremovingllc@gmail.com", "Self-Managed"),
    ("VH-9841", "The Lotus Skin Studio", "Bookings@thelotusskinstudio.com", "Self-Managed"),
    ("VH-7793", "The Tire Guy — Andy Robinson", "TheTireGuy352@gmail.com", "Self-Managed"),
    ("VH-3249", "Arianna's Perfect Clean", "ariannajimenez7621@gmail.com", "Self-Managed"),
    ("VH-4039", "J.R. Pruning", "jocelynramz@gmail.com", "Self-Managed"),
    ("VH-3718", "Barefoot Landscape & Design LLC", "barefootlandscapedesign@gmail.com", "Self-Managed"),
    ("VH-6696", "Golf Cart Guy", "golfcartguy10@gmail.com", "Self-Managed"),
    ("VH-5093", "The Villages Mobile Notary", "villagesnotary@gmail.com", "Self-Managed"),
    ("VH-3263", "Oscar's Quality Painting LLC", "oscarsqualitypainting@gmail.com", "Self-Managed"),
    ("VH-8860", "KB Landscape Supply Inc.", "info@kblawn.com", "Self-Managed"),
    ("VH-2573", "Warren's Landscaping & Property Maintenance", "jodie@warrenslandscapingllc.com", "Self-Managed"),
    ("VH-7064", "Conroy's Roofing & Tree Trimming", "toddmconroy@yahoo.com", "Self-Managed"),
    ("VH-8587", "Pro Closet & Cabinetry", "corporate@pcdmfg.com", "Self-Managed"),
    ("VH-1216", "From The Ground Up Landscaping & Tree Removal", "ftguoffice1@gmail.com", "Self-Managed"),
    ("VH-7990", "Welcome Legacy Maintenance LLC", "welcomelawncare@gmail.com", "Self-Managed"),
    ("VH-9277", "EW Excavation Pool LLC", "ewgeneral12@gmail.com", "Self-Managed"),
    ("VH-8892", "Sharie's Salon / Permanent Makeup by Sharie", "sharieangardner@aim.com", "Self-Managed"),
    ("VH-5065", "TMT Beauty", "bronzedberrybytessa@gmail.com", "Self-Managed"),
    ("VH-2798", "Face-Time Aesthetics", "facetimeaesthetics@gmail.com", "Self-Managed"),
    ("VH-6150", "PM by Dawn — Permanent Makeup Boutique", "pmbydawn@icloud.com", "Self-Managed"),
    ("VH-9685", "Kings PowerWash Service LLC", "noahkingbusiness01@gmail.com", "Self-Managed"),
    ("VH-3544", "Marketplace Movers & Painters", "marketplacemover@yahoo.com", "Self-Managed"),
    ("VH-7988", "Later Gator Moving LLC", "latergatormoving.llc@gmail.com", "Self-Managed"),
    ("VH-6936", "Bereket Moving and Storage", "info@bereketmoving.com", "Self-Managed"),
    ("VH-9713", "Craine-N-Sons Moving Services", "crainesmoving@gmail.com", "Self-Managed"),
]

def build_email_html(vh_number, business_name, temp_password, managed_by):
    if managed_by == "Self-Managed":
        body = f"""
        <p>Hi {business_name} team,</p>
        <p>Great news — <strong>{business_name}</strong> is now listed on <strong>V-HUB</strong>, The Villages' local services directory! Villages residents searching for trusted local providers will find your business at <a href="{HOME_URL}">www.v-hub.us</a>.</p>
        <p>You can log in to your Provider Hub to view your listing, manage your profile, respond to leads, and see how many residents have found you:</p>
        <p style="text-align:center; margin:24px 0;">
          <a href="{LOGIN_URL}" style="background-color:#E8431A;color:#ffffff;padding:14px 28px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:16px;">Access Your Provider Hub</a>
        </p>
        <p><strong>Your login credentials:</strong><br>
        🔑 VH Number: <strong>{vh_number}</strong><br>
        🔒 Temporary Password: <strong>{temp_password}</strong></p>
        <p>Please log in and change your password at your earliest convenience. You can also update your business description, service areas, hours, and more.</p>
        <p>If you have any questions or need help with your listing, simply reply to this email.</p>
        <p>Welcome to V-HUB!<br>
        The V-HUB Team<br>
        <a href="{HOME_URL}">www.v-hub.us</a></p>
        """
    else:
        body = f"""
        <p>Hi {business_name} team,</p>
        <p>Your business, <strong>{business_name}</strong>, has been added to <strong>V-HUB</strong> — The Villages' local services directory at <a href="{HOME_URL}">www.v-hub.us</a>. We curate local providers so Villages residents can find trusted businesses like yours.</p>
        <p>We're managing your listing for now, but you're welcome to take control of it at any time through your Provider Hub:</p>
        <p style="text-align:center; margin:24px 0;">
          <a href="{LOGIN_URL}" style="background-color:#E8431A;color:#ffffff;padding:14px 28px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:16px;">Access Your Provider Hub</a>
        </p>
        <p><strong>Your login credentials:</strong><br>
        🔑 VH Number: <strong>{vh_number}</strong><br>
        🔒 Temporary Password: <strong>{temp_password}</strong></p>
        <p>Once logged in you can update your business info, service areas, hours, and more. Your listing is live and actively shown to Villages residents searching for your services.</p>
        <p>Have questions or want to make changes? Just reply to this email and we'll help.</p>
        <p>Welcome aboard!<br>
        The V-HUB Team<br>
        <a href="{HOME_URL}">www.v-hub.us</a></p>
        """

    return f"""
    <html><body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#333;">
      <div style="background:#1B3D6F;padding:20px;text-align:center;">
        <img src="https://media.base44.com/images/public/69d062aca815ce8e697894b1/a9af95bc3_V-Hublogo.png" 
             alt="V-HUB" style="height:60px;">
      </div>
      <div style="padding:30px;">
        {body}
      </div>
      <div style="background:#f5f5f5;padding:15px;text-align:center;font-size:12px;color:#888;">
        V-HUB · The Villages Local Services Directory · <a href="{HOME_URL}">{HOME_URL}</a>
      </div>
    </html></body>
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
        headers={
            "Authorization": f"Bearer {SENDGRID_API_KEY}",
            "Content-Type": "application/json"
        },
        method="POST"
    )
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, "OK"
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()

def generate_temp_password(vh_number):
    """Generate a consistent temp password based on VH number."""
    base = f"VHub{vh_number[-4:]}!"
    return base

sent = []
failed = []

for vh_number, business_name, email, managed_by in PROVIDERS:
    temp_password = generate_temp_password(vh_number)
    subject = f"Welcome to V-HUB — Your Listing is Live! ({vh_number})"
    html = build_email_html(vh_number, business_name, temp_password, managed_by)
    
    status, msg = send_email(email, subject, html)
    
    if status in (200, 202):
        print(f"✅ {vh_number} {business_name} → {email}")
        sent.append((vh_number, business_name, email))
    else:
        print(f"❌ {vh_number} {business_name} → {email} | {status}: {msg[:100]}")
        failed.append((vh_number, business_name, email, status, msg[:200]))
    
    time.sleep(0.3)  # be polite to SendGrid

print(f"\n\n=== DONE ===")
print(f"✅ Sent: {len(sent)}")
print(f"❌ Failed: {len(failed)}")
if failed:
    print("\nFailed list:")
    for f in failed:
        print(f"  {f[0]} {f[1]} ({f[2]}): {f[3]}")
