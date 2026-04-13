import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY') || '';
const LOGO_URL = "https://media.base44.com/images/public/69d062aca815ce8e697894b1/a9af95bc3_V-Hublogo.png";
const APP_URL = "https://v-hub-app-edf7f8e8.base44.app";

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

/** SHA-256 hash using Web Crypto API */
async function sha256(plain: string): Promise<string> {
  if (!plain) return '';
  if (/^[0-9a-f]{64}$/.test(plain)) return plain; // already hashed
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
      business_name,
      owner_name,
      phone,
      email,
      website,
      address,
      description,
      years_in_business,
      license_number,
      services,        // array of service IDs
      service_areas,   // array of ServiceArea IDs
      category_id,
      service_names,   // human-readable service names (from frontend)
      area_names,      // human-readable area names (from frontend)
      category_name,
      login_email,
      login_password,  // plain text — shown in provider email, then hashed for storage
    } = body;

    if (!business_name || !owner_name || !phone || !email) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Hash password for storage — never store plain text
    const hashed_password = login_password ? await sha256(login_password) : '';

    const vh_number = genVHNumber();
    const now = new Date().toISOString();
    const trialEnd = new Date(Date.now() + 45 * 86400000).toISOString();

    // Create provider record
    const record = await base44.asServiceRole.entities.Provider.create({
      business_name,
      owner_name,
      phone,
      email,
      website:           website || "",
      address:           address || "",
      description:       description || "",
      years_in_business: years_in_business ? Number(years_in_business) : 0,
      license_number:    license_number || "",
      services:          services || [],
      service_areas:     service_areas || [],
      category_id:       category_id || null,
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

    // Use human-readable names (passed from frontend) for emails
    const svcDisplay = (service_names && service_names.length > 0)
      ? service_names.join(', ')
      : (services || []).join(', ') || 'N/A';

    const areaDisplay = (area_names && area_names.length > 0)
      ? area_names.join(', ')
      : (service_areas || []).join(', ') || 'N/A';

    const catDisplay = category_name || 'N/A';
    const displayLoginEmail = login_email || email;

    // ── Admin notification email ────────────────────────────────────────
    // Admin sees everything EXCEPT the provider's password
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
              <tr style="border-bottom: 1px solid #C4A270;">
                <td style="padding: 10px 8px; font-weight: 700; color: #5A3010; width: 36%;">VH Account #</td>
                <td style="padding: 10px 8px; color: #1A0A00; font-weight: 900; font-size: 16px; font-family: 'Courier New', monospace;">${vh_number}</td>
              </tr>
              <tr style="border-bottom: 1px solid #C4A270; background: rgba(139,69,19,0.05);">
                <td style="padding: 10px 8px; font-weight: 700; color: #5A3010;">Business Name</td>
                <td style="padding: 10px 8px; color: #1A0A00;">${business_name}</td>
              </tr>
              <tr style="border-bottom: 1px solid #C4A270;">
                <td style="padding: 10px 8px; font-weight: 700; color: #5A3010;">Owner / Contact</td>
                <td style="padding: 10px 8px; color: #1A0A00;">${owner_name}</td>
              </tr>
              <tr style="border-bottom: 1px solid #C4A270; background: rgba(139,69,19,0.05);">
                <td style="padding: 10px 8px; font-weight: 700; color: #5A3010;">Phone</td>
                <td style="padding: 10px 8px; color: #1A0A00;">${phone}</td>
              </tr>
              <tr style="border-bottom: 1px solid #C4A270;">
                <td style="padding: 10px 8px; font-weight: 700; color: #5A3010;">Email</td>
                <td style="padding: 10px 8px; color: #1A0A00;">${email}</td>
              </tr>
              <tr style="border-bottom: 1px solid #C4A270; background: rgba(139,69,19,0.05);">
                <td style="padding: 10px 8px; font-weight: 700; color: #5A3010;">Login Email</td>
                <td style="padding: 10px 8px; color: #1A0A00;">${displayLoginEmail}</td>
              </tr>
              ${website ? `<tr style="border-bottom: 1px solid #C4A270;"><td style="padding: 10px 8px; font-weight: 700; color: #5A3010;">Website</td><td style="padding: 10px 8px; color: #1A0A00;">${website}</td></tr>` : ''}
              <tr style="border-bottom: 1px solid #C4A270;">
                <td style="padding: 10px 8px; font-weight: 700; color: #5A3010;">Category</td>
                <td style="padding: 10px 8px; color: #1A0A00;">${catDisplay}</td>
              </tr>
              <tr style="border-bottom: 1px solid #C4A270; background: rgba(139,69,19,0.05);">
                <td style="padding: 10px 8px; font-weight: 700; color: #5A3010;">Services Offered</td>
                <td style="padding: 10px 8px; color: #1A0A00;">${svcDisplay}</td>
              </tr>
              <tr>
                <td style="padding: 10px 8px; font-weight: 700; color: #5A3010;">Villages Served</td>
                <td style="padding: 10px 8px; color: #1A0A00;">${areaDisplay}</td>
              </tr>
            </table>
            ${description ? `<div style="margin-top: 16px; padding: 12px; background: #fff; border-left: 3px solid #8B4513; border-radius: 4px; font-size: 13px; color: #333;"><strong>About:</strong><br/>${description}</div>` : ''}
            <div style="text-align: center; margin-top: 24px;">
              <a href="${APP_URL}/Wekcadmin" style="display: inline-block; background: #2e7d32; color: #fff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 700; font-size: 15px; letter-spacing: 1px;">
                ✅ Review &amp; Approve in Admin Dashboard
              </a>
            </div>
          </div>
          <div style="background: #1A0A00; padding: 12px; text-align: center; color: rgba(245,232,204,0.5); font-size: 11px;">
            V-Hub · The Villages, Florida · admin@v-hub.us
          </div>
        </div>
      `;
      await sendEmail('admin@v-hub.us', `📋 New Listing: ${business_name} (${vh_number})`, adminHtml);
    } catch (emailErr) {
      console.error("Admin notification email failed:", emailErr);
    }

    // ── Provider confirmation email ─────────────────────────────────────
    // Provider sees their services, areas, login email, and their password
    try {
      const passwordLine = login_password
        ? `<div style="font-size:13px;color:#1A237E;margin-bottom:4px;"><strong>Password:</strong> <span style="font-family:'Courier New',monospace;font-weight:900;font-size:14px;background:#dde;padding:2px 8px;border-radius:4px;">${login_password}</span></div>`
        : `<div style="font-size:13px;color:#555;">No password set — contact admin to get access.</div>`;

      const providerHtml = `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #F5E8CC; border: 2px solid #8B4513; border-radius: 12px; overflow: hidden;">
          <div style="background: #1A0A00; padding: 20px 24px; text-align: center;">
            <img src="${LOGO_URL}" style="height: 60px; border-radius: 8px;" />
            <div style="color: #F5E8CC; font-size: 20px; font-weight: 900; letter-spacing: 2px; margin-top: 10px;">✅ LISTING RECEIVED!</div>
            <div style="color: #C9973A; font-size: 13px; margin-top: 6px; font-style: italic;">The Villages' #1 Local Services Directory</div>
          </div>
          <div style="padding: 24px;">
            <p style="color: #1A0A00; font-size: 16px; font-weight: 700; margin: 0 0 8px;">Hi ${owner_name},</p>
            <p style="color: #5A3010; font-size: 14px; line-height: 1.7; margin: 0 0 20px;">
              Thank you for submitting <strong>${business_name}</strong> to V-Hub!
              Your listing is now under review and will appear in search results once approved — usually within 1 business day.
            </p>

            <!-- VH Account Number -->
            <div style="background: #fff; border: 2px solid #8B4513; border-radius: 8px; padding: 20px; text-align: center; margin: 0 0 20px;">
              <div style="font-size: 11px; font-weight: 700; letter-spacing: 3px; color: #8B5E3C; text-transform: uppercase; margin-bottom: 8px;">Your V-Hub Account Number</div>
              <div style="font-size: 36px; font-weight: 900; color: #5C3317; letter-spacing: 6px; font-family: 'Courier New', monospace;">${vh_number}</div>
              <div style="font-size: 11px; color: #8B5E3C; margin-top: 8px; font-style: italic;">Save this — you'll need it to manage your listing</div>
            </div>

            <!-- Login Credentials -->
            <div style="background: #E8EAF6; border: 2px solid #3F51B5; border-radius: 10px; padding: 18px 20px; margin-bottom: 20px;">
              <div style="font-weight: 800; color: #1A237E; font-size: 13px; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px;">🔐 Your Login Credentials</div>
              <div style="font-size: 13px; color: #1A237E; margin-bottom: 6px;"><strong>Login Email:</strong> ${displayLoginEmail}</div>
              ${passwordLine}
              <div style="font-size: 12px; color: #5C6BC0; margin-top: 10px; font-style: italic;">Keep these safe — you'll use them to log into your Provider Dashboard once approved.</div>
            </div>

            <!-- What you submitted -->
            <div style="background: #fff; border: 1px solid #C4A270; border-radius: 10px; padding: 18px 20px; margin-bottom: 20px;">
              <div style="font-weight: 800; color: #5A3010; font-size: 13px; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px;">📋 What You Submitted</div>
              <div style="font-size: 13px; color: #333; margin-bottom: 6px;"><strong>Business:</strong> ${business_name}</div>
              <div style="font-size: 13px; color: #333; margin-bottom: 6px;"><strong>Category:</strong> ${catDisplay}</div>
              <div style="font-size: 13px; color: #333; margin-bottom: 6px;"><strong>Services:</strong> ${svcDisplay}</div>
              <div style="font-size: 13px; color: #333;"><strong>Villages Served:</strong> ${areaDisplay}</div>
            </div>

            <!-- What happens next -->
            <div style="background: #F0E6C8; border-radius: 8px; padding: 16px 18px; font-size: 13px; color: #5A3010; line-height: 1.9; margin-bottom: 20px;">
              <strong>What happens next:</strong><br/>
              📋 Step 1 — Our team reviews your listing<br/>
              ✅ Step 2 — You'll receive an approval email once you're live<br/>
              🌴 Step 3 — Your 45-day free trial begins — no credit card needed!<br/>
              🔍 Step 4 — Residents across your selected villages can find you
            </div>

            <p style="font-size: 12px; color: #8B5E3C; margin-top: 4px; text-align: center;">
              Questions? Reply to this email or contact us at <a href="mailto:admin@v-hub.us" style="color: #5C3317;">admin@v-hub.us</a>
            </p>
          </div>
          <div style="background: #1A0A00; padding: 12px; text-align: center; color: rgba(245,232,204,0.5); font-size: 11px;">
            V-Hub · The Villages, Florida
          </div>
        </div>
      `;
      await sendEmail(email, `Welcome to V-Hub — Your listing is under review (${vh_number})`, providerHtml);
    } catch (emailErr) {
      console.error("Provider confirmation email failed:", emailErr);
    }

    return Response.json({ ok: true, id: record.id, vh_number });
  } catch (error: any) {
    console.error("submitListing error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
