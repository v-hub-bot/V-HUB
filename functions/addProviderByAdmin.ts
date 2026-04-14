import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY') || '';
const APP_URL = "https://v-hub-app-edf7f8e8.base44.app";
const LOGO_URL = "https://media.base44.com/images/public/69d062aca815ce8e697894b1/a9af95bc3_V-Hublogo.png";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

async function sendEmail(to: string, subject: string, htmlBody: string) {
  const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: { Authorization: `Bearer ${SENDGRID_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: 'admin@v-hub.us', name: 'V-Hub' },
      subject,
      content: [{ type: 'text/html', value: htmlBody }],
    }),
  });
  if (!res.ok) { const err = await res.text(); console.error('SendGrid error:', err); throw new Error('Email failed: ' + err); }
}

async function sha256(plain: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(plain));
  return Array.from(new Uint8Array(buf)).map((b: number) => b.toString(16).padStart(2, "0")).join("");
}

function genTempPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  return Array.from(crypto.getRandomValues(new Uint8Array(10)))
    .map((b: number) => chars[b % chars.length]).join("");
}

function generateVhNumber(existing: string[]): string {
  const existingSet = new Set(existing);
  for (let attempts = 0; attempts < 1000; attempts++) {
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    const num = (arr[0] % 9000) + 1000;
    const candidate = `VH-${num}`;
    if (!existingSet.has(candidate)) return candidate;
  }
  throw new Error('Could not generate unique VH number');
}

async function resolveNames(base44: any, ids: string[], entityName: string, legacyMap: Record<string, string>): Promise<string[]> {
  try {
    const all = await base44.asServiceRole.entities[entityName].list();
    const map = new Map(all.map((r: any) => [r.id, r.name]));
    return (ids || []).map((id: string) => {
      const raw = (map.get(id) || legacyMap[id] || id) as string;
      return raw.includes(' — ') ? raw.split(' — ').pop()!.trim() : raw;
    }).filter(Boolean);
  } catch {
    return (ids || []).map((id: string) => legacyMap[id] || id).filter(Boolean);
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));

    // Auth check
    const VALID_PINS = ["1357"];
    const ADMIN_EMAILS = ["kimberlycook1980@gmail.com", "5bebegurlz@gmail.com"];
    const pinOk = body.pin && VALID_PINS.includes(String(body.pin));
    let userIsAdmin = false;
    try { const me = await base44.auth.me(); if (me?.email && ADMIN_EMAILS.includes(me.email.toLowerCase())) userIsAdmin = true; } catch (_) {}
    if (!pinOk && !userIsAdmin) return Response.json({ error: "Unauthorized" }, { status: 401, headers: CORS });

    const {
      business_name, owner_name, email, phone, website, address,
      description, years_in_business, license_number, google_review_url,
      services, service_areas, category_id, notes,
      trial_days: inputTrialDays,
    } = body;

    if (!business_name) {
      return Response.json({ error: 'business_name is required' }, { status: 400, headers: CORS });
    }

    // Get existing VH numbers
    const existing = await base44.asServiceRole.entities.Provider.list();
    const existingVhNumbers = existing.map((p: any) => p.vh_number).filter(Boolean);
    const vh_number = generateVhNumber(existingVhNumbers);

    // Trial period
    const trialDays = Math.max(1, Math.min(365, parseInt(inputTrialDays) || 45));
    const now = new Date();
    const trialEnd = new Date(now);
    trialEnd.setDate(trialEnd.getDate() + trialDays);

    const tempPassword = genTempPassword();
    const hashedPassword = await sha256(tempPassword);

    const record = await base44.asServiceRole.entities.Provider.create({
      business_name: business_name.trim(),
      owner_name: owner_name.trim(),
      email: email.trim().toLowerCase(),
      login_email: email.trim().toLowerCase(),
      login_password: hashedPassword,
      phone: (phone || '').trim(),
      website: (website || '').trim(),
      address: (address || '').trim(),
      description: (description || '').trim(),
      years_in_business: years_in_business ? String(years_in_business) : '',
      license_number: (license_number || '').trim(),
      google_review_url: (google_review_url || '').trim(),
      services: services || [],
      service_areas: service_areas || [],
      category_id: category_id || '',
      notes: (notes || '').trim(),
      vh_number,
      onboarding_type: 'admin_added',
      subscription_status: 'trial',
      subscription_tier: 'basic',
      is_visible: true,
      is_active: true,
      trial_start_date: now.toISOString().split('T')[0],
      trial_end_date: trialEnd.toISOString().split('T')[0],
      reminder_sent: false,
      profile_views: 0,
      search_appearances: 0,
    });

    // Resolve human-readable names for email
    const LEGACY_SVC: Record<string, string> = {
      s01:"Home Improvements",s02:"General Repairs",s03:"Cleaning Services",s04:"Painting (Interior/Exterior)",
      s05:"Garage Door Services",s06:"Window Installation/Repair",s07:"HVAC",s08:"Plumbing",s09:"Roofing",
      s10:"Handyman Services",s11:"Security & Home Watch",s12:"Pest Control",s13:"Appliance Repair",
      s14:"Electrical & Lighting",s15:"Flooring (Tile, Wood, Carpet)",s16:"Home Organization",
      s17:"Smart Home Installation",s18:"Pool & Spa Services",s19:"Lawn Mowing",s20:"Sod Installation",
      s21:"Tree Trimming & Pruning/Removal",s22:"Lawn Fertilization",s23:"Irrigation/Sprinkler Services",
      s24:"Landscaping",s25:"Hardscaping",s26:"Pressure Washing",s27:"Driveway Repair/Cleaning/Painting",
      s28:"Rentals",s29:"Repairs",s30:"Detailing",s31:"Lighting Upgrades",s32:"Improvements/Customizations",
      s33:"Battery Replacement",s34:"Tire Services",s35:"Auto Repairs",s36:"Auto Detailing",
      s37:"Oil Changes",s38:"Tire Services",s39:"Mobile Mechanic",s40:"Hair Stylists",
      s41:"Nail Technicians",s42:"Spa Services",s43:"Home Health Aides",s44:"Massage Therapists",
      s45:"Personal Trainers",s46:"Makeup Artists",s47:"Veterinary Services",s48:"Grooming",
      s49:"Pet Sitting/Walking",s50:"Pet Training",s51:"Mobile Grooming",s52:"Medical Transport",
      s53:"Airport Transport",s54:"Local Rides",s55:"Errand Services",s56:"Courier/Delivery Services",
      s57:"Accounting & Bookkeeping",s58:"Notary Services",s59:"IT Support",s60:"Legal Services",
      s61:"Business Consulting",s62:"Tax Preparation",s63:"Home Watch",s64:"Pool Cleaning",
      s65:"Golf Cart Repair",s66:"Auto Detailing",
    };
    const LEGACY_AREA: Record<string, string> = {
      va001:"Alhambra",va002:"Amelia",va003:"Ashland",va004:"Belle Aire",va005:"Belvedere",
      va006:"Bonita",va007:"Bonnybrook",va008:"Bradford",va009:"Briar Meadow",
      va010:"Bridgeport at Creekside Landing",va011:"Bridgeport at Lake Miona",va012:"Bridgeport at Lake Sumter",
      va013:"Bridgeport at Laurel Valley",va014:"Bridgeport at Miona Shores",va015:"Bridgeport at Mission Hills",
      va016:"Buttonwood",va017:"Calumet Grove",va018:"Caroline",va019:"Cason Hammock",va020:"Charlotte",
      va021:"Chatham",va022:"Chitty Chatty",va023:"Citrus Grove",va024:"Collier",
      va025:"Collier at Alden Bungalows",va026:"Collier at Antrim Dells",va027:"Country Club Hills",
      va028:"Dabney",va029:"De Allende",va030:"De La Vista",va031:"Del Mar",va032:"DeLuna",
      va033:"DeSoto",va034:"Dunedin",va035:"Duval",va036:"El Cortez",va037:"Fenney",
      va038:"Fernandina",va039:"Gilchrist",va040:"Glenbrook",va041:"Hacienda",
      va042:"Haciendas of Mission Hills",va043:"Hadley",va044:"Hammock at Fenney",
      va045:"Hawkins",va046:"Hemingway",va047:"Hillsborough",va048:"La Reynalda",
      va049:"La Zamora",va050:"LaBelle",va051:"Lake Deaton",va052:"Lake Denham",
      va053:"Lakeshore Cottages",va054:"Largo",va055:"Liberty Park",va056:"Linden",
      va057:"Lynnhaven",va058:"Mallory Square",va059:"Marsh Bend",va060:"McClure",
      va061:"Mira Mesa",va062:"Monarch Grove",va063:"Newell",va064:"Orange Blossom Gardens",
      va065:"Osceola Hills",va066:"Osceola Hills at Soaring Eagle Preserve",va067:"Palo Alto",
      va068:"Pennecamp",va069:"Piedmont",va070:"Pine Hills",va071:"Pine Ridge",va072:"Pinellas",
      va073:"Poinciana",va074:"Polo Ridge",va075:"Richmond",va076:"Rio Grande",va077:"Rio Ponderosa",
      va078:"Rio Ranchero",va079:"Sabal Chase",va080:"Sanibel",va081:"Santiago",va082:"Santo Domingo",
      va083:"Silver Lake",va084:"Springdale",va085:"St. Catherine",va086:"St. Charles",
      va087:"St. James",va088:"St. Johns",va089:"Summerhill",va090:"Sunset Pointe",va091:"Tall Trees",
      va092:"Tamarind Grove",va093:"Tierra Del Sol",va094:"Valle Verde",va095:"Virginia Trace",
      va096:"Winifred",va097:"Woodbury",
    };

    const serviceNames = await resolveNames(base44, services || [], 'Service', LEGACY_SVC);
    const areaNames = await resolveNames(base44, service_areas || [], 'ServiceArea', LEGACY_AREA);
    const trialEndFormatted = trialEnd.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

    const servicesHtml = serviceNames.length > 0
      ? serviceNames.map((s: string) => `<li style="margin-bottom:4px;">${s}</li>`).join('')
      : '<li>See your listing</li>';
    const areasHtml = areaNames.length > 0
      ? areaNames.map((a: string) => `<li style="margin-bottom:4px;">${a}</li>`).join('')
      : '<li>See your listing</li>';

    const welcomeHtml = `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#e8dcc8;">
<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;background:#F5E8CC;border:2px solid #8B4513;border-radius:12px;overflow:hidden;">

  <!-- Header -->
  <div style="background:#1A0A00;padding:28px 24px;text-align:center;">
    <img src="${LOGO_URL}" style="height:70px;border-radius:10px;margin-bottom:12px;" />
    <div style="color:#F5E8CC;font-size:24px;font-weight:900;letter-spacing:2px;">We Built Your Listing!</div>
    <div style="color:#C9973A;font-size:13px;margin-top:6px;font-style:italic;">The Villages, FL — Local Services Directory</div>
  </div>

  <!-- Body -->
  <div style="padding:30px 26px;">
    <p style="color:#1A0A00;font-size:17px;font-weight:700;margin:0 0 10px;">Hi ${owner_name},</p>
    <p style="color:#5A3010;font-size:15px;line-height:1.75;margin:0 0 20px;">
      Great news — we've created a listing for <strong>${business_name}</strong> on <strong>V-Hub</strong>, The Villages' local services directory. Residents searching for services like yours will now be able to find and contact you directly.
    </p>
    <p style="color:#5A3010;font-size:15px;line-height:1.75;margin:0 0 24px;">
      Your listing is <strong>live right now</strong> and includes your ${trialDays}-day complimentary trial — no credit card needed to get started.
    </p>

    <!-- Listing Summary -->
    <div style="background:#fff;border-radius:10px;padding:20px;margin-bottom:20px;border:1.5px solid #D4B896;">
      <div style="font-size:13px;font-weight:900;color:#5A3010;text-transform:uppercase;letter-spacing:1px;margin-bottom:14px;">📋 Your Listing Summary</div>
      <table style="width:100%;border-collapse:collapse;font-size:14px;color:#333;">
        <tr><td style="padding:5px 0;color:#888;width:40%;">Business:</td><td style="font-weight:700;">${business_name}</td></tr>
        <tr><td style="padding:5px 0;color:#888;">Owner:</td><td>${owner_name}</td></tr>
        ${phone ? `<tr><td style="padding:5px 0;color:#888;">Phone:</td><td>${phone}</td></tr>` : ''}
        ${website ? `<tr><td style="padding:5px 0;color:#888;">Website:</td><td>${website}</td></tr>` : ''}
      </table>
      <div style="margin-top:14px;">
        <div style="font-size:12px;color:#888;margin-bottom:6px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Services Listed:</div>
        <ul style="margin:0;padding-left:18px;font-size:13px;color:#333;">${servicesHtml}</ul>
      </div>
      <div style="margin-top:12px;">
        <div style="font-size:12px;color:#888;margin-bottom:6px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Service Areas:</div>
        <ul style="margin:0;padding-left:18px;font-size:13px;color:#333;">${areasHtml}</ul>
      </div>
    </div>

    <!-- Trial Info -->
    <div style="background:#FFF8E1;border-left:4px solid #C9973A;border-radius:8px;padding:18px 20px;margin-bottom:20px;">
      <div style="font-size:13px;font-weight:900;color:#5A3010;margin-bottom:10px;">🎁 YOUR FREE TRIAL</div>
      <div style="font-size:14px;color:#333;line-height:1.8;">
        <strong>Trial Length:</strong> ${trialDays} days<br/>
        <strong>Trial Ends:</strong> ${trialEndFormatted}<br/>
        <strong>After Trial:</strong> Just $12/month to stay listed
      </div>
      <p style="font-size:13px;color:#666;margin:12px 0 0;line-height:1.6;">
        When your trial is about to end, we'll send you a reminder. If you'd like to continue, simply click the link in that email to enter your payment info — no hassle. If you ever want to cancel, just reply to this email and we'll take care of it immediately.
      </p>
    </div>

    <!-- Login Info -->
    <div style="background:#E8F5E9;border:2px solid #66BB6A;border-radius:10px;padding:20px;margin-bottom:20px;">
      <div style="font-size:13px;font-weight:900;color:#2E7D32;margin-bottom:12px;">🔐 YOUR PROVIDER HUB LOGIN</div>
      <p style="font-size:13px;color:#1B5E20;line-height:1.7;margin:0 0 12px;">
        Your Provider Hub lets you view profile stats, update your listing, change your contact info, and manage your subscription.
      </p>
      <table style="width:100%;border-collapse:collapse;font-size:14px;color:#333;">
        <tr><td style="padding:5px 0;color:#555;width:40%;">Portal:</td><td><a href="${APP_URL}/ProviderDashboard" style="color:#2E7D32;font-weight:700;">V-Hub Provider Hub →</a></td></tr>
        <tr><td style="padding:5px 0;color:#555;">VH Account #:</td><td><strong style="font-family:'Courier New',monospace;font-size:15px;background:#f0f0f0;padding:2px 8px;border-radius:4px;">${vh_number}</strong></td></tr>
        <tr><td style="padding:5px 0;color:#555;">Email:</td><td>${email}</td></tr>
        <tr><td style="padding:5px 0;color:#555;">Password:</td><td><strong style="font-family:'Courier New',monospace;font-size:16px;background:#d4edda;padding:3px 10px;border-radius:4px;letter-spacing:1px;">${tempPassword}</strong></td></tr>
      </table>
      <p style="font-size:12px;color:#555;margin:12px 0 0;font-style:italic;">
        You can log in with either your VH account number or your email address. We recommend changing your password after your first login via Account Settings.
      </p>
    </div>

    <!-- Questions -->
    <p style="font-size:14px;color:#5A3010;line-height:1.7;margin:0 0 8px;">
      Questions? We're happy to help. Just reply to this email or reach us at <a href="mailto:admin@v-hub.us" style="color:#E8431A;font-weight:700;">admin@v-hub.us</a>.
    </p>
    <p style="font-size:14px;color:#5A3010;margin:0;">
      We're glad to have you as part of the V-Hub community!
    </p>
  </div>

  <!-- Footer -->
  <div style="background:#1A0A00;padding:14px;text-align:center;color:rgba(245,232,204,0.5);font-size:11px;">
    V-Hub · The Villages, Florida · <a href="mailto:admin@v-hub.us" style="color:#C9973A;">admin@v-hub.us</a>
  </div>
</div>
</body>
</html>`;

    let emailSent = false;
    let emailSkipped = false;
    if (email && email.trim()) {
      await sendEmail(email, `Welcome to V-Hub — Your Listing for ${business_name} is Live!`, welcomeHtml);
      emailSent = true;
    } else {
      emailSkipped = true;
      console.log(`No email for ${business_name} — skipping welcome email. Send manually later.`);
    }

    return Response.json({ ok: true, id: record.id, vh_number, temp_password: tempPassword, email_sent: emailSent, email_skipped: emailSkipped }, { headers: CORS });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('addProviderByAdmin error:', msg);
    return Response.json({ error: msg }, { status: 500, headers: CORS });
  }
});
