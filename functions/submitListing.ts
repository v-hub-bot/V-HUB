import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY') || '';
const LOGO_URL = "https://media.base44.com/images/public/69d062aca815ce8e697894b1/a9af95bc3_V-Hublogo.png";
const APP_URL = "https://www.v-hub.us";

// ── ID Validation ─────────────────────────────────────────────────────────────
// A valid database ID is exactly 24 lowercase hex characters.
// This prevents legacy codes (s41), text names, or garbage from being saved.
function isValidDbId(id: string): boolean {
  return typeof id === 'string' && /^[0-9a-f]{24}$/.test(id);
}

function validateIds(ids: unknown, fieldName: string): { valid: string[]; invalid: string[] } {
  if (!Array.isArray(ids)) return { valid: [], invalid: [] };
  const valid: string[] = [];
  const invalid: string[] = [];
  for (const id of ids) {
    if (isValidDbId(id)) valid.push(id);
    else invalid.push(String(id));
  }
  return { valid, invalid };
}

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
    console.error('SendGrid send error:', err);
  } else {
    console.log('SendGrid email sent to:', to);
  }
}

async function sha256(plain: string): Promise<string> {
  if (!plain) return '';
  if (/^[0-9a-f]{64}$/.test(plain)) return plain;
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(plain));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function genVHNumber(): string {
  return 'VH-' + String(Math.floor(1000 + Math.random() * 9000));
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));

    const {
      business_name, owner_name, phone, email, website, address,
      description, years_in_business, license_number,
      services, service_areas, category_id,
      service_names, area_names, category_name,
      login_email, login_password,
    } = body;

    if (!business_name || !owner_name || !phone || !email) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // ── Validate service and area IDs ──────────────────────────────────
    const svcValidation  = validateIds(services,      'services');
    const areaValidation = validateIds(service_areas, 'service_areas');

    if (svcValidation.invalid.length > 0) {
      console.error('submitListing: invalid service IDs rejected:', svcValidation.invalid);
      return Response.json({
        error: `Invalid service IDs submitted: ${svcValidation.invalid.join(', ')}. Please select services from the dropdown.`
      }, { status: 400 });
    }
    if (areaValidation.invalid.length > 0) {
      console.error('submitListing: invalid area IDs rejected:', areaValidation.invalid);
      return Response.json({
        error: `Invalid area IDs submitted: ${areaValidation.invalid.join(', ')}. Please select villages from the dropdown.`
      }, { status: 400 });
    }
    if (svcValidation.valid.length === 0) {
      return Response.json({ error: 'Please select at least one service.' }, { status: 400 });
    }
    if (areaValidation.valid.length === 0) {
      return Response.json({ error: 'Please select at least one village.' }, { status: 400 });
    }

    const hashed_password = login_password ? await sha256(login_password) : '';
    const vh_number = genVHNumber();
    const now = new Date().toISOString();
    const trialEnd = new Date(Date.now() + 45 * 86400000).toISOString();

    const record = await base44.asServiceRole.entities.Provider.create({
      business_name,
      owner_name,
      phone,
      email,
      website:           website || "",
      address:           address || "",
      description:       description || "",
      years_in_business: years_in_business ? String(years_in_business) : '',
      license_number:    license_number || "",
      services:          svcValidation.valid,
      service_areas:     areaValidation.valid,
      category_id:       isValidDbId(category_id) ? category_id : '',
      vh_number,
      subscription_status: "pending",
      onboarding_type:     "self_signup",
      subscription_tier:   "basic",
      trial_start_date:    now,
      trial_end_date:      trialEnd,
      is_visible:          false,
      is_active:           false,
      profile_views:       0,
      search_appearances:  0,
      login_email:         login_email || email,
      login_password:      hashed_password,
    });

    const cleanName = (n: string) => n.includes(' — ') ? n.split(' — ').pop()!.trim() : n;
    const svcDisplay  = (service_names && service_names.length > 0) ? service_names.map(cleanName).join(', ')  : 'See listing details';
    const areaDisplay = (area_names    && area_names.length    > 0) ? area_names.map(cleanName).join(', ')    : 'See listing details';
    const catDisplay  = category_name || 'N/A';
    const displayLoginEmail = login_email || email;

    try {
      const adminHtml = `
        <div style="font-family: Georgia, serif; max-width: 620px; margin: 0 auto; background: #F5E8CC; border: 2px solid #8B4513; border-radius: 12px; overflow: hidden;">
          <div style="background: #1A0A00; padding: 20px 24px; text-align: center;">
            <img src="${LOGO_URL}" style="height: 60px; border-radius: 8px;" />
            <div style="color: #F5E8CC; font-size: 20px; font-weight: 900; letter-spacing: 2px; margin-top: 10px;">📋 NEW LISTING SUBMISSION</div>
          </div>
          <div style="padding: 24px;">
            <p style="color: #5A3010; font-size: 15px; margin: 0 0 20px;">A new provider submitted a listing and is awaiting your approval.</p>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr style="border-bottom: 1px solid #C4A270;"><td style="padding: 10px 8px; font-weight: 700; color: #5A3010; width: 36%;">VH Account #</td><td style="padding: 10px 8px; color: #1A0A00; font-weight: 900; font-size: 16px; font-family: 'Courier New', monospace;">${vh_number}</td></tr>
              <tr style="border-bottom: 1px solid #C4A270; background: rgba(139,69,19,0.05);"><td style="padding: 10px 8px; font-weight: 700; color: #5A3010;">Business Name</td><td style="padding: 10px 8px; color: #1A0A00;">${business_name}</td></tr>
              <tr style="border-bottom: 1px solid #C4A270;"><td style="padding: 10px 8px; font-weight: 700; color: #5A3010;">Owner / Contact</td><td style="padding: 10px 8px; color: #1A0A00;">${owner_name}</td></tr>
              <tr style="border-bottom: 1px solid #C4A270; background: rgba(139,69,19,0.05);"><td style="padding: 10px 8px; font-weight: 700; color: #5A3010;">Phone</td><td style="padding: 10px 8px; color: #1A0A00;">${phone}</td></tr>
              <tr style="border-bottom: 1px solid #C4A270;"><td style="padding: 10px 8px; font-weight: 700; color: #5A3010;">Email</td><td style="padding: 10px 8px; color: #1A0A00;">${email}</td></tr>
              <tr style="border-bottom: 1px solid #C4A270; background: rgba(139,69,19,0.05);"><td style="padding: 10px 8px; font-weight: 700; color: #5A3010;">Login Email</td><td style="padding: 10px 8px; color: #1A0A00;">${displayLoginEmail}</td></tr>
              ${website ? `<tr style="border-bottom: 1px solid #C4A270;"><td style="padding: 10px 8px; font-weight: 700; color: #5A3010;">Website</td><td style="padding: 10px 8px; color: #1A0A00;">${website}</td></tr>` : ''}
              <tr style="border-bottom: 1px solid #C4A270;"><td style="padding: 10px 8px; font-weight: 700; color: #5A3010;">Category</td><td style="padding: 10px 8px; color: #1A0A00;">${catDisplay}</td></tr>
              <tr style="border-bottom: 1px solid #C4A270; background: rgba(139,69,19,0.05);"><td style="padding: 10px 8px; font-weight: 700; color: #5A3010;">Services Offered</td><td style="padding: 10px 8px; color: #1A0A00;">${svcDisplay}</td></tr>
              <tr><td style="padding: 10px 8px; font-weight: 700; color: #5A3010;">Villages Served</td><td style="padding: 10px 8px; color: #1A0A00;">${areaDisplay}</td></tr>
            </table>
            ${description ? `<div style="margin-top: 16px; padding: 12px; background: #fff; border-left: 3px solid #8B4513; border-radius: 4px; font-size: 13px; color: #333;"><strong>About:</strong><br/>${description}</div>` : ''}
            <div style="text-align: center; margin-top: 24px;">
              <a href="${APP_URL}/Wekcadmin" style="display: inline-block; background: #2e7d32; color: #fff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 700; font-size: 15px; letter-spacing: 1px;">✅ Review &amp; Approve in Admin Dashboard</a>
            </div>
          </div>
          <div style="background: #1A0A00; padding: 12px; text-align: center; color: rgba(245,232,204,0.5); font-size: 11px;">V-Hub · The Villages, Florida · admin@v-hub.us</div>
        </div>`;
      await sendEmail('admin@v-hub.us', `New Listing: ${business_name} (${vh_number})`, adminHtml);
    } catch (emailErr) { console.error("Admin notification email failed:", emailErr); }

    try {
      const passwordLine = login_password
        ? `<div style="font-size:13px;color:#1A237E;margin-bottom:4px;"><strong>Password:</strong> <span style="font-family:'Courier New',monospace;font-weight:900;font-size:14px;background:#dde;padding:2px 8px;border-radius:4px;">${login_password}</span></div>`
        : `<div style="font-size:13px;color:#555;">No password set — contact admin to get access.</div>`;

      const providerHtml = `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #F5E8CC; border: 2px solid #8B4513; border-radius: 12px; overflow: hidden;">
          <div style="background: #1A0A00; padding: 20px 24px; text-align: center;">
            <img src="${LOGO_URL}" style="height: 60px; border-radius: 8px;" />
            <div style="color: #F5E8CC; font-size: 20px; font-weight: 900; letter-spacing: 2px; margin-top: 10px;">✅ LISTING RECEIVED!</div>
          </div>
          <div style="padding: 24px;">
            <p style="color: #5A3010; font-size: 16px; font-weight: 700;">Hi ${owner_name},</p>
            <p style="color: #5A3010; font-size: 14px;">Thank you for submitting your listing to <strong>V-Hub</strong>! We've received your information and will review it shortly. You'll get another email once you're approved and live on the directory.</p>
            <div style="background: #fff; border: 1px solid #C4A270; border-radius: 8px; padding: 16px; margin: 20px 0;">
              <div style="font-size: 13px; color: #5A3010; font-weight: 700; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px;">Your Submission Summary</div>
              <div style="font-size:13px;color:#1A0A00;margin-bottom:4px;"><strong>VH Account #:</strong> <span style="font-family:'Courier New',monospace;font-weight:900;font-size:15px;">${vh_number}</span></div>
              <div style="font-size:13px;color:#1A0A00;margin-bottom:4px;"><strong>Business:</strong> ${business_name}</div>
              <div style="font-size:13px;color:#1A0A00;margin-bottom:4px;"><strong>Category:</strong> ${catDisplay}</div>
              <div style="font-size:13px;color:#1A0A00;margin-bottom:4px;"><strong>Services:</strong> ${svcDisplay}</div>
              <div style="font-size:13px;color:#1A0A00;margin-bottom:12px;"><strong>Villages:</strong> ${areaDisplay}</div>
              <hr style="border: none; border-top: 1px solid #C4A270; margin: 12px 0;" />
              <div style="font-size:13px;color:#5A3010;font-weight:700;margin-bottom:8px;">Provider Hub Login (save this!)</div>
              <div style="font-size:13px;color:#1A0A00;margin-bottom:4px;"><strong>Login ID:</strong> <span style="font-family:'Courier New',monospace;font-weight:900;">${vh_number}</span></div>
              <div style="font-size:13px;color:#1A0A00;margin-bottom:4px;"><strong>Email:</strong> ${displayLoginEmail}</div>
              ${passwordLine}
            </div>
            <p style="color: #5A3010; font-size: 13px;">Once approved, log in at <a href="${APP_URL}/ProviderHub" style="color: #8B4513;">${APP_URL}/ProviderHub</a> to manage your listing.</p>
          </div>
          <div style="background: #1A0A00; padding: 12px; text-align: center; color: rgba(245,232,204,0.5); font-size: 11px;">V-Hub · The Villages, Florida · admin@v-hub.us</div>
        </div>`;
await sendEmail(email, `V-Hub Listing Received - ${business_name}`, providerHtml);
    } catch (emailErr) { console.error("Provider confirmation email failed:", emailErr); }

    return Response.json({ success: true, vh_number, id: record.id });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error';
    console.error('submitListing error:', msg);
    return Response.json({ error: msg }, { status: 500 });
  }
});
