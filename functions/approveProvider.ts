import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY') || '';
const SERVICE_TOKEN = Deno.env.get('BASE44_SERVICE_TOKEN') || '';
const APP_ID = Deno.env.get('BASE44_APP_ID') || '69d062aca815ce8e697894b1';
const APP_URL = "https://v-hub-app-edf7f8e8.base44.app";
const LOGO_URL = "https://media.base44.com/images/public/69d062aca815ce8e697894b1/a9af95bc3_V-Hublogo.png";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

async function sendEmail(to: string, subject: string, htmlBody: string) {
  const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SENDGRID_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: 'admin@v-hub.us', name: 'V-Hub' },
      subject,
      content: [{ type: 'text/html', value: htmlBody }],
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    console.error('SendGrid error:', err);
    throw new Error('Email failed: ' + err);
  }
}

/** Fetch all records from an entity using the service token */
async function fetchEntity(entityName: string): Promise<any[]> {
  try {
    const url = `https://api.base44.app/api/apps/${APP_ID}/entities/${entityName}`;
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${SERVICE_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) {
      console.error(`fetchEntity ${entityName} failed:`, res.status, await res.text());
      return [];
    }
    const data = await res.json();
    return Array.isArray(data) ? data : (data.records || data.items || []);
  } catch (e) {
    console.error(`fetchEntity ${entityName} error:`, e);
    return [];
  }
}

/** Update a single entity record using the service token */
async function updateEntity(entityName: string, id: string, fields: Record<string, any>): Promise<boolean> {
  try {
    const url = `https://api.base44.app/api/apps/${APP_ID}/entities/${entityName}/${id}`;
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${SERVICE_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(fields),
    });
    if (!res.ok) {
      console.error(`updateEntity ${entityName}/${id} failed:`, res.status, await res.text());
      return false;
    }
    return true;
  } catch (e) {
    console.error(`updateEntity error:`, e);
    return false;
  }
}

/** Legacy short-code maps for old-style IDs */
const SERVICE_LEGACY_MAP: Record<string, string> = {
  s01: "Website Design", s02: "Website Maintenance", s03: "SEO", s04: "Social Media Management",
  s05: "Graphic Design", s06: "Logo Design", s07: "Content Writing", s08: "Email Marketing",
  s09: "Google Ads", s10: "Business Consulting", s11: "Tax Preparation", s12: "Bookkeeping",
  s13: "Notary Services", s14: "Financial Planning", s15: "Insurance Services", s16: "Legal Services",
  s17: "Home Inspection", s18: "Plumbing", s19: "Lawn Care", s20: "Landscaping", s21: "Tree Service",
  s22: "Pest Control", s23: "Pool Service", s24: "Pressure Washing", s25: "House Cleaning",
  s26: "Window Cleaning", s27: "Gutter Cleaning", s28: "AC Service", s29: "Electrical",
  s30: "Handyman", s31: "Painting", s32: "Flooring", s33: "Roofing", s34: "Fencing",
  s35: "Screen Repair", s36: "Appliance Repair", s37: "Computer Repair", s38: "TV Mounting",
  s39: "Smart Home Setup", s40: "Security Cameras", s41: "Moving Services", s42: "Junk Removal",
  s43: "Garage Organization", s44: "Storage Solutions", s45: "Interior Design", s46: "Staging",
  s47: "Photography", s48: "Pet Grooming", s49: "Dog Walking", s50: "Pet Sitting",
  s51: "Veterinary Services", s52: "Alterations", s53: "Dry Cleaning", s54: "Tutoring",
  s55: "Music Lessons", s56: "Dance Lessons", s57: "Personal Training", s58: "Yoga",
  s59: "Massage Therapy", s60: "Acupuncture", s61: "Healthcare/Medical", s62: "Caregiving",
  s63: "Transportation", s64: "Pool Cleaning", s65: "Golf Cart Repair", s66: "Auto Detailing",
};

const AREA_LEGACY_MAP: Record<string, string> = {
  va001: "Alhambra", va002: "Amelia", va003: "Antelope", va004: "Ashland", va005: "Bonnybrook",
  va006: "Calumet Grove", va007: "Chatham", va008: "Citrus Grove", va009: "Collier",
  va010: "Countryman", va011: "Cypress Landing", va012: "DeSoto", va013: "Dunedin",
  va014: "El Camino Real", va015: "Fenney", va016: "Fernandina", va017: "Gilchrist",
  va018: "Glenbrook", va019: "Gilchrist", va020: "Hadley", va021: "Hammond",
  va022: "Harbor Hills", va023: "Hemming", va024: "Hernando", va025: "Hillsborough",
  va026: "Hooten", va027: "Hutchinson", va028: "Indigo East", va029: "Jaguar",
  va030: "Lake Deaton", va031: "Lake Miona Heights", va032: "Largo Vista",
  va033: "Linden", va034: "Magnolia", va035: "Mallory Square", va036: "Marion Landing",
  va037: "Marsh Bend", va038: "McAlister", va039: "Midway", va040: "Moultrie Creek",
  va041: "Mubarak", va042: "Myrtlewood", va043: "Nassau", va044: "Newell",
  va045: "Orange Blossom Gardens", va046: "Osceola Hills", va047: "Palmer",
  va048: "Pennecamp", va049: "Pine Hills", va050: "Pinellas", va051: "Poinciana",
  va052: "Polo Ridge", va053: "Redhawk", va054: "Rio Grande", va055: "Romero",
  va056: "Sanibel", va057: "Santiago", va058: "Sarasota", va059: "Sharon Rose Wilder",
  va060: "Silver Lake", va061: "Simms", va062: "Soaring Eagle", va063: "Springdale",
  va064: "Summerhill", va065: "Sumter Landing Area", va066: "Sunset Pointe",
  va067: "Tamarind Grove", va068: "Tamarind Hills", va069: "Tierra del Sol",
  va070: "Treasury", va071: "Turtle Mound", va072: "Twin Oaks", va073: "Umber Ridge",
  va074: "Updike", va075: "Velocity", va076: "Vera Cruz", va077: "Vicar",
  va078: "Victoria", va079: "Villa Valencia", va080: "Virginia Trace",
  va081: "Vista Lago", va082: "Volusia", va083: "Wahoo", va084: "Walnut Grove",
  va085: "Waterford", va086: "Wellington", va087: "Westport", va088: "Weybridge",
  va089: "Whispering Pines", va090: "Whitfield", va091: "Windsor Park",
  va092: "Woodbury", va093: "Woodlands", va094: "Woodstock", va095: "Worthington",
  va096: "Wyndham", va097: "Yellar",
};

/** Resolve service IDs to human-readable names */
async function resolveServiceNames(ids: string[]): Promise<string> {
  if (!ids || ids.length === 0) return 'your selected services';
  try {
    const allServices = await fetchEntity('Service');
    const map = new Map(allServices.map((s: any) => [s.id, s.name]));
    const names = ids
      .map((id) => map.get(id) || SERVICE_LEGACY_MAP[id] || null)
      .filter(Boolean) as string[];
    // Strip emoji/group prefix from names like "🌿 Group — Village Name"
    const clean = names.map(n => n.includes(' — ') ? n.split(' — ').pop()!.trim() : n);
    return clean.length > 0 ? clean.join(', ') : 'See listing details';
  } catch (e) {
    console.error('resolveServiceNames failed:', e);
    const names = ids.map(id => SERVICE_LEGACY_MAP[id] || null).filter(Boolean) as string[];
    return names.length > 0 ? names.join(', ') : 'See listing details';
  }
}

/** Resolve service area IDs to human-readable names */
async function resolveAreaNames(ids: string[]): Promise<string> {
  if (!ids || ids.length === 0) return 'your selected villages';
  try {
    const allAreas = await fetchEntity('ServiceArea');
    const map = new Map(allAreas.map((a: any) => [a.id, a.name]));
    const names = ids
      .map((id) => map.get(id) || AREA_LEGACY_MAP[id] || null)
      .filter(Boolean) as string[];
    // Strip emoji/group prefix from names like "🌿 Group — Village Name"
    const clean = names.map(n => n.includes(' — ') ? n.split(' — ').pop()!.trim() : n);
    return clean.length > 0 ? clean.join(', ') : 'See listing details';
  } catch (e) {
    console.error('resolveAreaNames failed:', e);
    const names = ids.map(id => AREA_LEGACY_MAP[id] || null).filter(Boolean) as string[];
    return names.length > 0 ? names.join(', ') : 'See listing details';
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  try {
    const base44 = createClientFromRequest(req);

    // Admin PIN / email validation
    const VALID_PINS = ["6185", "1357"];
    const ADMIN_EMAILS = ["kimberlycook1980@gmail.com", "5bebegurlz@gmail.com", "evansrus@comcast.net"];
    const body = await req.json().catch(() => ({}));
    const pinProvided = body.pin && VALID_PINS.includes(String(body.pin));
    let userIsAdmin = false;
    try {
      const me = await base44.auth.me();
      if (me?.email && ADMIN_EMAILS.includes(me.email.toLowerCase())) userIsAdmin = true;
    } catch (_) {}
    if (!pinProvided && !userIsAdmin) {
      return Response.json({ error: "Unauthorized" }, { status: 401, headers: CORS_HEADERS });
    }

    const {
      provider_record_id,
      business_name,
      owner_name,
      email,
      phone,
      services,
      service_areas,
      vh_number,
      login_email,       // optional: provider's login email
      email_only,        // if true, skip DB update (frontend already did it)
    } = body;

    if (!provider_record_id) {
      return new Response(JSON.stringify({ error: 'Missing provider_record_id' }), {
        status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
      });
    }

    // Set up 45-day trial dates
    const now = new Date();
    const trialEnd = new Date(now);
    trialEnd.setDate(trialEnd.getDate() + 45);
    const trialStartStr = now.toISOString().split('T')[0];
    const trialEndStr = trialEnd.toISOString().split('T')[0];
    const trialEndFormatted = trialEnd.toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
    });

    // Update the provider record via direct REST API
    if (!email_only) {
      const updated = await updateEntity('Provider', provider_record_id, {
        is_active: true,
        is_visible: true,
        subscription_status: "trial",
        subscription_tier: "basic",
        trial_start_date: trialStartStr,
        trial_end_date: trialEndStr,
        reminder_sent: false,
      });
      if (!updated) {
        console.error('Provider update failed for:', provider_record_id);
      }
    }

    // Resolve human-readable names
    const servicesList = await resolveServiceNames(services || []);
    const areasList = await resolveAreaNames(service_areas || []);

    // Determine login email to show in the email
    const displayLoginEmail = login_email || email;

    // ── Send confirmation email to provider ─────────────────────────────
    let emailError: string | null = null;
    if (email) {
      try {
        const vhDisplay = vh_number
          ? `<div style="font-size:13px;color:#333;margin-bottom:6px;"><strong>VH Number:</strong> <span style="font-family:'Courier New',monospace;font-weight:900;font-size:15px;">${vh_number}</span></div>`
          : '';

        const providerHtml = `
          <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;background:#F5E8CC;border:2px solid #8B4513;border-radius:12px;overflow:hidden;">

            <!-- Header -->
            <div style="background:#1A0A00;padding:24px;text-align:center;">
              <img src="${LOGO_URL}" style="height:65px;border-radius:10px;margin-bottom:10px;" />
              <div style="color:#F5E8CC;font-size:22px;font-weight:900;letter-spacing:2px;">🎉 YOU'RE LIVE ON V-HUB!</div>
              <div style="color:#C9973A;font-size:13px;margin-top:6px;font-style:italic;">The Villages' #1 Local Services Directory</div>
            </div>

            <!-- Body -->
            <div style="padding:28px 24px;">
              <p style="color:#1A0A00;font-size:17px;font-weight:700;margin:0 0 6px;">Hi ${owner_name},</p>
              <p style="color:#5A3010;font-size:15px;line-height:1.7;margin:0 0 20px;">
                Congratulations — <strong>${business_name}</strong> has been reviewed and <strong>approved!</strong>
                Your listing is now live and searchable by residents throughout The Villages.
              </p>

              <!-- Listing Summary -->
              <div style="background:#fff;border:1px solid #C4A270;border-radius:10px;padding:18px 20px;margin-bottom:20px;">
                <div style="font-weight:800;color:#5A3010;margin-bottom:12px;font-size:14px;text-transform:uppercase;letter-spacing:1px;">📋 Your Listing</div>
                <div style="font-size:13px;color:#333;margin-bottom:6px;"><strong>Business:</strong> ${business_name}</div>
                ${vhDisplay}
                <div style="font-size:13px;color:#333;margin-bottom:6px;"><strong>Services:</strong> ${servicesList}</div>
                <div style="font-size:13px;color:#333;"><strong>Villages Served:</strong> ${areasList}</div>
              </div>

              <!-- Login Info -->
              <div style="background:#E8EAF6;border:2px solid #3F51B5;border-radius:10px;padding:20px;margin-bottom:20px;">
                <div style="font-weight:800;color:#1A237E;font-size:14px;margin-bottom:12px;text-transform:uppercase;letter-spacing:1px;">🔐 Your Login Credentials</div>
                <div style="font-size:13px;color:#1A237E;line-height:1.9;">
                  <strong>Login Email:</strong> ${displayLoginEmail}<br/>
                  <strong>Password:</strong> The password you created when you signed up<br/>
                </div>
                <div style="text-align:center;margin-top:14px;">
                  <a href="${APP_URL}/ProviderDashboard" style="display:inline-block;background:#3F51B5;color:#fff;text-decoration:none;padding:11px 24px;border-radius:8px;font-weight:700;font-size:13px;letter-spacing:1px;">
                    🔑 Log In to Provider Dashboard →
                  </a>
                </div>
                <div style="font-size:12px;color:#5C6BC0;margin-top:10px;text-align:center;">
                  Forgot your password? Use the "Forgot Password" link on the login page.
                </div>
              </div>

              <!-- 45-Day Trial Box -->
              <div style="background:#E8F5E9;border:2px solid #4CAF50;border-radius:10px;padding:20px;margin-bottom:20px;text-align:center;">
                <div style="font-size:28px;margin-bottom:6px;">🌴</div>
                <div style="font-weight:900;color:#2E7D32;font-size:18px;margin-bottom:8px;">45-DAY FREE TRIAL — STARTS TODAY</div>
                <div style="font-size:14px;color:#388E3C;line-height:1.7;margin-bottom:10px;">
                  Your listing is <strong>completely free</strong> for the next 45 days.<br/>
                  <strong>No credit card needed now. No charges until your trial ends.</strong>
                </div>
                <div style="background:#fff;border-radius:8px;padding:12px 18px;display:inline-block;border:1px solid #A5D6A7;">
                  <div style="font-size:12px;color:#777;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Trial Expires On</div>
                  <div style="font-size:20px;font-weight:900;color:#2E7D32;">${trialEndFormatted}</div>
                  <div style="font-size:12px;color:#888;margin-top:4px;">(45 days from today)</div>
                </div>
              </div>

              <!-- How It Works -->
              <div style="background:#FFF8E1;border:1px solid #FFD54F;border-radius:10px;padding:18px 20px;margin-bottom:20px;">
                <div style="font-weight:800;color:#E65100;font-size:14px;margin-bottom:12px;text-transform:uppercase;letter-spacing:1px;">💳 How Billing Works</div>
                <div style="font-size:13px;color:#5A3010;line-height:1.8;">
                  ✅ <strong>Free for 45 days</strong> — no payment needed now<br/>
                  ✅ <strong>$12/month</strong> after your trial period ends<br/>
                  ✅ <strong>Pay anytime</strong> through your Provider Dashboard — before or after trial<br/>
                  ✅ <strong>Cancel anytime</strong> — no contracts, no cancellation fees<br/>
                  ✅ Each time you pay, you'll see exactly when your next payment is due<br/>
                  ✅ <strong>Admin will notify you</strong> as your trial end date approaches
                </div>
              </div>

              <!-- Provider Dashboard features -->
              <div style="background:#E3F2FD;border:1px solid #90CAF9;border-radius:10px;padding:18px 20px;margin-bottom:24px;">
                <div style="font-weight:800;color:#1565C0;font-size:14px;margin-bottom:10px;text-transform:uppercase;letter-spacing:1px;">📊 Your Provider Dashboard</div>
                <div style="font-size:13px;color:#1A237E;line-height:1.8;margin-bottom:14px;">
                  Log into your Provider Dashboard to:<br/>
                  • See how many people viewed or found your listing<br/>
                  • Check your trial countdown and days remaining<br/>
                  • Manage your subscription and make payments<br/>
                  • Update your business info at any time
                </div>
                <div style="text-align:center;">
                  <a href="${APP_URL}/ProviderDashboard" style="display:inline-block;background:#1565C0;color:#fff;text-decoration:none;padding:12px 26px;border-radius:8px;font-weight:700;font-size:14px;letter-spacing:1px;">
                    📊 Go to My Provider Dashboard →
                  </a>
                </div>
                <div style="font-size:12px;color:#555;margin-top:10px;text-align:center;">
                  Visit <strong>${APP_URL}</strong> → click <strong>Provider Login</strong>
                </div>
              </div>

              <!-- How searchers find you -->
              <p style="color:#5A3010;font-size:14px;line-height:1.7;margin:0 0 20px;">
                When residents search for your services, your listing appears with your contact info so they can reach you directly —
                <strong>no middleman, no commissions.</strong>
              </p>

              <!-- Homepage Button -->
              <div style="text-align:center;margin-bottom:10px;">
                <a href="${APP_URL}" style="display:inline-block;background:#E8431A;color:#fff;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:700;font-size:15px;letter-spacing:1px;">
                  🌴 View V-Hub Directory
                </a>
              </div>

              <p style="font-size:12px;color:#8B5E3C;text-align:center;margin-top:14px;">
                Questions? Reply to this email or reach us at <a href="mailto:admin@v-hub.us" style="color:#E8431A;">admin@v-hub.us</a>
              </p>
            </div>

            <!-- Footer -->
            <div style="background:#1A0A00;padding:14px;text-align:center;color:rgba(245,232,204,0.5);font-size:11px;">
              V-Hub · The Villages, Florida · A community-first local directory<br/>
              <a href="${APP_URL}" style="color:rgba(245,232,204,0.4);text-decoration:none;">v-hub.us</a> ·
              <a href="mailto:admin@v-hub.us" style="color:rgba(245,232,204,0.4);text-decoration:none;">admin@v-hub.us</a>
            </div>
          </div>
        `;

        await sendEmail(
          email,
          `🎉 You're live on V-Hub — ${business_name} | 45-Day Free Trial Started`,
          providerHtml
        );
      } catch (emailErr: any) {
        console.error("Provider email failed:", emailErr);
        emailError = emailErr.message;
      }
    }

    // ── Notify admin that approval was completed ─────────────────────────
    try {
      const adminHtml = `
        <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#f9f9f9;border:1px solid #ddd;border-radius:10px;overflow:hidden;">
          <div style="background:#2e7d32;padding:16px 20px;text-align:center;">
            <div style="color:#fff;font-size:18px;font-weight:900;">✅ Provider Approved</div>
          </div>
          <div style="padding:20px;">
            <p style="font-size:14px;color:#333;margin:0 0 12px;"><strong>${business_name}</strong> has been approved and is now live on V-Hub.</p>
            <p style="font-size:13px;color:#555;margin:0 0 8px;">• VH Number: <strong>${vh_number || 'N/A'}</strong></p>
            <p style="font-size:13px;color:#555;margin:0 0 8px;">• Contact: ${owner_name} — ${email}</p>
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

    return new Response(JSON.stringify({
      ok: true,
      trial_start: trialStartStr,
      trial_end: trialEndStr,
      email_error: emailError,
    }), {
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
    });

  } catch (error: any) {
    console.error("approveProvider error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
    });
  }
});
