import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY') || '';
const APP_URL = "https://www.v-hub.us";
const LOGO_URL = "https://media.base44.com/images/public/69d062aca815ce8e697894b1/a9af95bc3_V-Hublogo.png";

const CORS_HEADERS = {
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

const SERVICE_LEGACY_MAP: Record<string, string> = {
  s01:"Website Design",s02:"Website Maintenance",s03:"SEO",s04:"Social Media Management",
  s05:"Graphic Design",s06:"Logo Design",s07:"Content Writing",s08:"Email Marketing",
  s09:"Google Ads",s10:"Business Consulting",s11:"Tax Preparation",s12:"Bookkeeping",
  s13:"Notary Services",s14:"Financial Planning",s15:"Insurance Services",s16:"Legal Services",
  s17:"Home Inspection",s18:"Plumbing",s19:"Lawn Care",s20:"Landscaping",s21:"Tree Service",
  s22:"Pest Control",s23:"Pool Service",s24:"Pressure Washing",s25:"House Cleaning",
  s26:"Window Cleaning",s27:"Gutter Cleaning",s28:"AC Service",s29:"Electrical",
  s30:"Handyman",s31:"Painting",s32:"Flooring",s33:"Roofing",s34:"Fencing",
  s35:"Screen Repair",s36:"Appliance Repair",s37:"Computer Repair",s38:"TV Mounting",
  s39:"Smart Home Setup",s40:"Security Cameras",s41:"Moving Services",s42:"Junk Removal",
  s43:"Garage Organization",s44:"Storage Solutions",s45:"Interior Design",s46:"Staging",
  s47:"Photography",s48:"Pet Grooming",s49:"Dog Walking",s50:"Pet Sitting",
  s51:"Veterinary Services",s52:"Alterations",s53:"Dry Cleaning",s54:"Tutoring",
  s55:"Music Lessons",s56:"Dance Lessons",s57:"Personal Training",s58:"Yoga",
  s59:"Massage Therapy",s60:"Acupuncture",s61:"Healthcare/Medical",s62:"Caregiving",
  s63:"Transportation",s64:"Pool Cleaning",s65:"Golf Cart Repair",s66:"Auto Detailing",
};

const AREA_LEGACY_MAP: Record<string, string> = {
  va001:"Alhambra",va002:"Amelia",va003:"Antelope",va004:"Ashland",va005:"Bonnybrook",
  va006:"Calumet Grove",va007:"Chatham",va008:"Citrus Grove",va009:"Collier",
  va010:"Countryman",va011:"Cypress Landing",va012:"DeSoto",va013:"Dunedin",
  va014:"El Camino Real",va015:"Fenney",va016:"Fernandina",va017:"Gilchrist",
  va018:"Glenbrook",va019:"Gilchrist",va020:"Hadley",va021:"Hammond",
  va022:"Harbor Hills",va023:"Hemming",va024:"Hernando",va025:"Hillsborough",
  va026:"Hooten",va027:"Hutchinson",va028:"Indigo East",va029:"Jaguar",
  va030:"Lake Deaton",va031:"Lake Miona Heights",va032:"Largo Vista",
  va033:"Linden",va034:"Magnolia",va035:"Mallory Square",va036:"Marion Landing",
  va037:"Marsh Bend",va038:"McAlister",va039:"Midway",va040:"Moultrie Creek",
  va041:"Mubarak",va042:"Myrtlewood",va043:"Nassau",va044:"Newell",
  va045:"Orange Blossom Gardens",va046:"Osceola Hills",va047:"Palmer",
  va048:"Pennecamp",va049:"Pine Hills",va050:"Pinellas",va051:"Poinciana",
  va052:"Polo Ridge",va053:"Redhawk",va054:"Rio Grande",va055:"Romero",
  va056:"Sanibel",va057:"Santiago",va058:"Sarasota",va059:"Sharon Rose Wilder",
  va060:"Silver Lake",va061:"Simms",va062:"Soaring Eagle",va063:"Springdale",
  va064:"Summerhill",va065:"Sumter Landing Area",va066:"Sunset Pointe",
  va067:"Tamarind Grove",va068:"Tamarind Hills",va069:"Tierra del Sol",
  va070:"Treasury",va071:"Turtle Mound",va072:"Twin Oaks",va073:"Umber Ridge",
  va074:"Updike",va075:"Velocity",va076:"Vera Cruz",va077:"Vicar",
  va078:"Victoria",va079:"Villa Valencia",va080:"Virginia Trace",
  va081:"Vista Lago",va082:"Volusia",va083:"Wahoo",va084:"Walnut Grove",
  va085:"Waterford",va086:"Wellington",va087:"Westport",va088:"Weybridge",
  va089:"Whispering Pines",va090:"Whitfield",va091:"Windsor Park",
  va092:"Woodbury",va093:"Woodlands",va094:"Woodstock",va095:"Worthington",
  va096:"Wyndham",va097:"Yellar",
};

function cleanName(n: string): string {
  return n.includes(' — ') ? n.split(' — ').pop()!.trim() : n;
}

async function resolveServiceNames(base44: any, ids: string[]): Promise<string> {
  if (!ids || ids.length === 0) return 'your selected services';
  try {
    const all = await base44.asServiceRole.entities.Service.list();
    const map = new Map(all.map((s: any) => [s.id, s.name]));
    const names = ids.map(id => map.get(id) || SERVICE_LEGACY_MAP[id] || null).filter(Boolean) as string[];
    return names.map(cleanName).join(', ') || 'See listing details';
  } catch {
    return ids.map(id => SERVICE_LEGACY_MAP[id] || null).filter(Boolean).join(', ') || 'See listing details';
  }
}

async function resolveAreaNames(base44: any, ids: string[]): Promise<string> {
  if (!ids || ids.length === 0) return 'your selected villages';
  try {
    const all = await base44.asServiceRole.entities.ServiceArea.list();
    const map = new Map(all.map((a: any) => [a.id, a.name]));
    const names = ids.map(id => map.get(id) || AREA_LEGACY_MAP[id] || null).filter(Boolean) as string[];
    return names.map(cleanName).join(', ') || 'See listing details';
  } catch {
    return ids.map(id => AREA_LEGACY_MAP[id] || null).filter(Boolean).join(', ') || 'See listing details';
  }
}

async function resolveServiceList(base44: any, ids: string[]): Promise<string[]> {
  if (!ids || ids.length === 0) return [];
  try {
    const all = await base44.asServiceRole.entities.Service.list();
    const map = new Map(all.map((s: any) => [s.id, s.name]));
    return ids.map(id => map.get(id) || SERVICE_LEGACY_MAP[id] || null).filter(Boolean).map(cleanName) as string[];
  } catch {
    return ids.map(id => SERVICE_LEGACY_MAP[id] || null).filter(Boolean).map(cleanName) as string[];
  }
}

async function resolveAreaList(base44: any, ids: string[]): Promise<string[]> {
  if (!ids || ids.length === 0) return [];
  try {
    const all = await base44.asServiceRole.entities.ServiceArea.list();
    const map = new Map(all.map((a: any) => [a.id, a.name]));
    return ids.map(id => map.get(id) || AREA_LEGACY_MAP[id] || null).filter(Boolean).map(cleanName) as string[];
  } catch {
    return ids.map(id => AREA_LEGACY_MAP[id] || null).filter(Boolean).map(cleanName) as string[];
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS_HEADERS });

  try {
    const base44 = createClientFromRequest(req);

    const VALID_PINS = ["1357"];
    const ADMIN_EMAILS = ["kimberlycook1980@gmail.com", "5bebegurlz@gmail.com"];
    const body = await req.json().catch(() => ({}));
    const pinProvided = body.pin && VALID_PINS.includes(String(body.pin));
    let userIsAdmin = false;
    try { const me = await base44.auth.me(); if (me?.email && ADMIN_EMAILS.includes(me.email.toLowerCase())) userIsAdmin = true; } catch (_) {}
    if (!pinProvided && !userIsAdmin) return Response.json({ error: "Unauthorized" }, { status: 401, headers: CORS_HEADERS });

    const { provider_record_id, business_name, owner_name, email, phone, services, service_areas, vh_number, login_email, email_only, temp_password } = body;

    if (!provider_record_id) {
      return new Response(JSON.stringify({ error: 'Missing provider_record_id' }), { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
    }

    const now = new Date();
    const trialEnd = new Date(now);
    trialEnd.setDate(trialEnd.getDate() + 45);
    const trialStartStr = now.toISOString().split('T')[0];
    const trialEndStr = trialEnd.toISOString().split('T')[0];
    const trialEndFormatted = trialEnd.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

    // ── Update DB record ──────────────────────────────────────────────────
    if (!email_only) {
      try {
        await base44.asServiceRole.entities.Provider.update(provider_record_id, {
          is_active: true,
          is_visible: true,
          subscription_status: "trial",
          subscription_tier: "basic",
          trial_start_date: trialStartStr,
          trial_end_date: trialEndStr,
          reminder_sent: false,
        });
        console.log("✅ Provider record updated:", provider_record_id);
      } catch (updateErr) {
        console.error("❌ Provider update failed:", updateErr);
        return new Response(JSON.stringify({ error: 'DB update failed: ' + String(updateErr) }), { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
      }
    }

    // ── Resolve human-readable names ──────────────────────────────────────
    const servicesList = await resolveServiceNames(base44, services || []);
    const areasList = await resolveAreaNames(base44, service_areas || []);
    const svcArray = await resolveServiceList(base44, services || []);
    const areaArray = await resolveAreaList(base44, service_areas || []);
    const displayLoginEmail = login_email || email;

    let emailError: string | null = null;

    // ── Single combined provider email ────────────────────────────────────
    if (email) {
      try {
        const servicesHtml = svcArray.length > 0
          ? svcArray.map(s => `<li style="margin-bottom:4px;">${s}</li>`).join('')
          : '<li>See your listing</li>';
        const areasHtml = areaArray.length > 0
          ? areaArray.map(a => `<li style="margin-bottom:4px;">${a}</li>`).join('')
          : '<li>See your listing</li>';

        const passwordBlock = temp_password
          ? `<tr>
              <td style="padding:7px 0;color:#555;width:38%;vertical-align:top;">Temp Password:</td>
              <td>
                <span style="font-family:'Courier New',monospace;font-weight:900;font-size:16px;background:#d4edda;padding:3px 10px;border-radius:4px;letter-spacing:1px;">${temp_password}</span>
                <span style="font-size:11px;color:#c62828;display:block;margin-top:4px;">⚠️ Please change this after your first login</span>
              </td>
            </tr>`
          : `<tr>
              <td style="padding:7px 0;color:#555;width:38%;">Password:</td>
              <td>The password you set during signup</td>
            </tr>`;

        const providerHtml = `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#e8dcc8;">
<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;background:#F5E8CC;border:2px solid #8B4513;border-radius:12px;overflow:hidden;">

  <!-- Header -->
  <div style="background:#1A0A00;padding:28px 24px;text-align:center;">
    <img src="${LOGO_URL}" style="height:70px;border-radius:10px;margin-bottom:12px;" />
    <div style="color:#F5E8CC;font-size:24px;font-weight:900;letter-spacing:2px;">🎉 You're Live on V-Hub!</div>
    <div style="color:#C9973A;font-size:13px;margin-top:6px;font-style:italic;">The Villages, FL &mdash; Local Services Directory</div>
  </div>

  <!-- Body -->
  <div style="padding:30px 26px;">

    <p style="color:#1A0A00;font-size:17px;font-weight:700;margin:0 0 10px;">Hi ${owner_name},</p>
    <p style="color:#5A3010;font-size:15px;line-height:1.75;margin:0 0 14px;">
      Your listing for <strong>${business_name}</strong> has been reviewed and is now <strong>live on V-Hub</strong> &mdash; The Villages' local services directory. Residents searching for your services can find and contact you directly, with <strong>no middleman and no commissions.</strong>
    </p>
    <p style="color:#5A3010;font-size:15px;line-height:1.75;margin:0 0 24px;">
      Your <strong>45-day complimentary trial starts today</strong> &mdash; no credit card needed to get started.
    </p>

    <!-- Spam notice -->
    <div style="background:#FFF3CD;border:1px solid #FFC107;border-radius:8px;padding:12px 16px;margin-bottom:22px;font-size:13px;color:#856404;text-align:center;">
      📬 <strong>Heads up:</strong> Future V-Hub emails may land in your <strong>Spam or Junk</strong> folder.<br/>
      Add <strong>admin@v-hub.us</strong> to your contacts to make sure you never miss an update.
    </div>

    <!-- VH Account Number -->
    <div style="background:#fff;border:2px solid #8B4513;border-radius:8px;padding:18px 20px;text-align:center;margin-bottom:20px;">
      <div style="font-size:11px;font-weight:700;letter-spacing:3px;color:#8B5E3C;text-transform:uppercase;margin-bottom:8px;">Your V-Hub Account Number</div>
      <div style="font-size:36px;font-weight:900;color:#5C3317;letter-spacing:6px;font-family:'Courier New',monospace;">${vh_number || 'See Dashboard'}</div>
      <div style="font-size:11px;color:#8B5E3C;margin-top:8px;font-style:italic;">Save this &mdash; you can use it instead of your email to log in</div>
    </div>

    <!-- Listing Summary -->
    <div style="background:#fff;border-radius:10px;padding:20px;margin-bottom:20px;border:1.5px solid #D4B896;">
      <div style="font-size:13px;font-weight:900;color:#5A3010;text-transform:uppercase;letter-spacing:1px;margin-bottom:14px;">📋 Your Listing Summary</div>
      <table style="width:100%;border-collapse:collapse;font-size:14px;color:#333;">
        <tr><td style="padding:5px 0;color:#888;width:38%;">Business:</td><td style="font-weight:700;">${business_name}</td></tr>
        <tr><td style="padding:5px 0;color:#888;">Owner:</td><td>${owner_name}</td></tr>
        ${phone ? `<tr><td style="padding:5px 0;color:#888;">Phone:</td><td>${phone}</td></tr>` : ''}
      </table>
      <div style="margin-top:14px;">
        <div style="font-size:12px;color:#888;margin-bottom:6px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Services Listed:</div>
        <ul style="margin:0;padding-left:18px;font-size:13px;color:#333;">${servicesHtml}</ul>
      </div>
      <div style="margin-top:12px;">
        <div style="font-size:12px;color:#888;margin-bottom:6px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Villages You Serve:</div>
        <ul style="margin:0;padding-left:18px;font-size:13px;color:#333;">${areasHtml}</ul>
      </div>
    </div>

    <!-- Login Credentials -->
    <div style="background:#E8EAF6;border:2px solid #3F51B5;border-radius:10px;padding:20px;margin-bottom:20px;">
      <div style="font-weight:900;color:#1A237E;font-size:14px;margin-bottom:14px;text-transform:uppercase;letter-spacing:1px;">🔐 Your Provider Hub Login</div>
      <table style="width:100%;border-collapse:collapse;font-size:14px;color:#333;margin-bottom:16px;">
        <tr><td style="padding:7px 0;color:#555;width:38%;">Login Email:</td><td><strong>${displayLoginEmail}</strong></td></tr>
        ${passwordBlock}
        <tr><td style="padding:7px 0;color:#555;">VH Account #:</td><td><strong style="font-family:'Courier New',monospace;font-size:15px;">${vh_number || 'See Dashboard'}</strong> <span style="font-size:11px;color:#5C6BC0;">(use this or your email to log in)</span></td></tr>
      </table>
      <div style="text-align:center;margin-bottom:10px;">
        <a href="${APP_URL}/ProviderDashboard" style="display:inline-block;background:#3F51B5;color:#fff;text-decoration:none;padding:13px 28px;border-radius:8px;font-weight:700;font-size:14px;letter-spacing:1px;">🔑 Log In to Your Provider Hub &rarr;</a>
      </div>
      <div style="font-size:12px;color:#5C6BC0;text-align:center;">Forgot your password? Use the "Forgot Password" link on the login page.</div>
    </div>

    <!-- Trial Info -->
    <div style="background:#E8F5E9;border:2px solid #4CAF50;border-radius:10px;padding:20px;margin-bottom:20px;text-align:center;">
      <div style="font-size:28px;margin-bottom:6px;">🌴</div>
      <div style="font-weight:900;color:#2E7D32;font-size:18px;margin-bottom:8px;">45-DAY FREE TRIAL &mdash; STARTS TODAY</div>
      <div style="font-size:14px;color:#388E3C;line-height:1.7;margin-bottom:14px;">
        Your listing is <strong>completely free</strong> for the next 45 days.<br/>
        <strong>No credit card needed now. No charges until your trial ends.</strong>
      </div>
      <div style="background:#fff;border-radius:8px;padding:12px 18px;display:inline-block;border:1px solid #A5D6A7;">
        <div style="font-size:12px;color:#777;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Trial Expires On</div>
        <div style="font-size:20px;font-weight:900;color:#2E7D32;">${trialEndFormatted}</div>
        <div style="font-size:12px;color:#888;margin-top:4px;">(45 days from today)</div>
      </div>
    </div>

    <!-- Billing -->
    <div style="background:#FFF8E1;border-left:4px solid #C9973A;border-radius:8px;padding:18px 20px;margin-bottom:20px;">
      <div style="font-size:13px;font-weight:900;color:#5A3010;margin-bottom:10px;">💳 HOW BILLING WORKS</div>
      <div style="font-size:14px;color:#333;line-height:1.9;">
        &#10003; <strong>Free for 45 days</strong> &mdash; no payment needed now<br/>
        &#10003; <strong>$12/month</strong> after your trial period ends<br/>
        &#10003; <strong>Pay anytime</strong> through your Provider Dashboard<br/>
        &#10003; <strong>Cancel anytime</strong> &mdash; no contracts, no fees<br/>
        &#10003; We'll send a reminder before your trial expires
      </div>
    </div>

    <!-- What Happens Next -->
    <div style="background:#EEF2FF;border:1.5px solid #7986CB;border-radius:10px;padding:20px;margin-bottom:20px;">
      <div style="font-size:13px;font-weight:900;color:#283593;margin-bottom:12px;">📌 WHAT HAPPENS NEXT</div>
      <ol style="margin:0;padding-left:18px;font-size:14px;color:#333;line-height:2;">
        <li><strong>Log in to your Provider Hub</strong> &mdash; review your listing and make any updates.</li>
        <li><strong>Personalize your profile</strong> &mdash; add your logo, update your description, hours, and service areas anytime.</li>
        <li><strong>Residents find you</strong> &mdash; when someone in The Villages searches for your services, your listing appears and they can contact you directly.</li>
        <li><strong>At trial end</strong> &mdash; we'll send a reminder before your 45-day trial expires. Just $12/month to stay listed &mdash; cancel anytime.</li>
      </ol>
    </div>

    <!-- View Homepage CTA -->
    <div style="text-align:center;margin-bottom:24px;">
      <a href="${APP_URL}" style="display:inline-block;background:#E8431A;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:700;font-size:15px;letter-spacing:1px;">🌴 Visit the V-Hub Directory</a>
    </div>

    <p style="font-size:13px;color:#8B5E3C;text-align:center;margin:0 0 6px;">
      Questions? Reply to this email or reach us at <a href="mailto:admin@v-hub.us" style="color:#E8431A;font-weight:700;">admin@v-hub.us</a>
    </p>

  </div>

  <!-- Footer -->
  <div style="background:#1A0A00;padding:16px 20px;text-align:center;">
    <a href="${APP_URL}" style="color:#C9973A;font-size:13px;font-weight:700;text-decoration:none;">🌴 www.v-hub.us</a>
    <div style="color:rgba(245,232,204,0.45);font-size:11px;margin-top:6px;">V-Hub &middot; The Villages, Florida &middot; A community-first local directory</div>
    <div style="color:rgba(245,232,204,0.35);font-size:10px;margin-top:4px;">
      <a href="mailto:admin@v-hub.us" style="color:rgba(201,151,58,0.7);text-decoration:none;">admin@v-hub.us</a>
    </div>
  </div>

</div>
</body>
</html>`;

        await sendEmail(email, `🎉 You're live on V-Hub — ${business_name} | 45-Day Free Trial Started`, providerHtml);
        console.log("✅ Combined provider welcome email sent to:", email);
      } catch (emailErr: any) {
        console.error("Provider email failed:", emailErr);
        emailError = emailErr.message;
      }
    }

    // ── Admin confirmation email ──────────────────────────────────────────
    try {
      const adminHtml = `
        <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#f9f9f9;border:1px solid #ddd;border-radius:10px;overflow:hidden;">
          <div style="background:#2e7d32;padding:16px 20px;text-align:center;">
            <div style="color:#fff;font-size:18px;font-weight:900;">✅ Provider Approved & Live</div>
          </div>
          <div style="padding:20px;">
            <p style="font-size:14px;color:#333;margin:0 0 12px;"><strong>${business_name}</strong> is now live on V-Hub.</p>
            <p style="font-size:13px;color:#555;margin:0 0 8px;">• VH Number: <strong>${vh_number || 'N/A'}</strong></p>
            <p style="font-size:13px;color:#555;margin:0 0 8px;">• Contact: ${owner_name} — ${email}</p>
            <p style="font-size:13px;color:#555;margin:0 0 8px;">• Login Email: ${displayLoginEmail}</p>
            <p style="font-size:13px;color:#555;margin:0 0 8px;">• Services: ${servicesList}</p>
            <p style="font-size:13px;color:#555;margin:0 0 8px;">• Villages: ${areasList}</p>
            <p style="font-size:13px;color:#555;margin:0 0 8px;">• Trial ends: <strong>${trialEndFormatted}</strong></p>
            <p style="font-size:13px;color:#555;margin:0;">• Provider welcome email: ${emailError ? '❌ FAILED — ' + emailError : '✅ Sent to ' + email}</p>
            <div style="text-align:center;margin-top:20px;">
              <a href="${APP_URL}/Wekcadmin" style="background:#5C3317;color:#fff;text-decoration:none;padding:10px 22px;border-radius:6px;font-size:13px;font-weight:700;">View Admin Dashboard →</a>
            </div>
          </div>
        </div>
      `;
      await sendEmail('admin@v-hub.us', `✅ Approved: ${business_name} is now live`, adminHtml);
    } catch (adminErr) {
      console.error("Admin confirmation email failed:", adminErr);
    }

    return new Response(JSON.stringify({ ok: true, trial_start: trialStartStr, trial_end: trialEndStr, email_error: emailError }), {
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
    });

  } catch (error: any) {
    console.error("approveProvider error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
  }
});
