import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY') || '';

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

function genVHNumber(): string {
  // VH- followed by 4 random digits
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
      services,       // array of service IDs (from real Service entity)
      service_areas,  // array of ServiceArea IDs (from real ServiceArea entity)
      category_id,    // single Category ID
      service_names,  // human-readable names for email notification
      area_names,     // human-readable names for email notification
      category_name,  // human-readable category for email notification
      login_email,    // provider's chosen login email
      login_password, // provider's chosen login password
    } = body;

    // Validate required fields
    if (!business_name || !owner_name || !phone || !email) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Generate VH number
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
      login_password:      login_password || "",
    });

    // ── Notify admin ────────────────────────────────────────────────────
    try {
      const svcDisplay = (service_names || services || []).join(', ') || 'N/A';
      const areaDisplay = (area_names || service_areas || []).join(', ') || 'N/A';
      const catDisplay = category_name || category_id || 'N/A';

      const adminHtml = `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #F5E8CC; border: 2px solid #8B4513; border-radius: 12px; overflow: hidden;">
          <div style="background: #1A0A00; padding: 20px 24px; text-align: center;">
            <img src="https://media.base44.com/images/public/69d062aca815ce8e697894b1/a9af95bc3_V-Hublogo.png" style="height: 60px; border-radius: 8px;" />
            <div style="color: #F5E8CC; font-size: 20px; font-weight: 900; letter-spacing: 2px; margin-top: 10px;">NEW LISTING SUBMISSION</div>
          </div>
          <div style="padding: 24px;">
            <p style="color: #5A3010; font-size: 15px; margin: 0 0 20px;">A new provider submitted a listing and is awaiting approval.</p>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr style="border-bottom: 1px solid #C4A270;">
                <td style="padding: 10px 8px; font-weight: 700; color: #5A3010; width: 38%;">VH Account #</td>
                <td style="padding: 10px 8px; color: #1A0A00; font-weight: 900; font-size: 16px;">${vh_number}</td>
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
              ${website ? `<tr style="border-bottom: 1px solid #C4A270; background: rgba(139,69,19,0.05);"><td style="padding: 10px 8px; font-weight: 700; color: #5A3010;">Website</td><td style="padding: 10px 8px; color: #1A0A00;">${website}</td></tr>` : ''}
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
              <a href="https://v-hub-app-edf7f8e8.base44.app/Wekcadmin" style="display: inline-block; background: #2e7d32; color: #fff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 700; font-size: 15px; letter-spacing: 1px;">
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

    // ── Confirm email to provider ───────────────────────────────────────
    try {
      const providerHtml = `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #F5E8CC; border: 2px solid #8B4513; border-radius: 12px; overflow: hidden;">
          <div style="background: #1A0A00; padding: 20px 24px; text-align: center;">
            <img src="https://media.base44.com/images/public/69d062aca815ce8e697894b1/a9af95bc3_V-Hublogo.png" style="height: 60px; border-radius: 8px;" />
            <div style="color: #F5E8CC; font-size: 20px; font-weight: 900; letter-spacing: 2px; margin-top: 10px;">LISTING RECEIVED</div>
          </div>
          <div style="padding: 24px;">
            <p style="color: #1A0A00; font-size: 15px;">Hi ${owner_name},</p>
            <p style="color: #5A3010; font-size: 14px; line-height: 1.7;">Thank you for submitting <strong>${business_name}</strong> to V-Hub! Your listing is now under review and will appear in search results once approved — usually within 1 business day.</p>
            <div style="background: #fff; border: 2px solid #8B4513; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
              <div style="font-size: 11px; font-weight: 700; letter-spacing: 3px; color: #8B5E3C; text-transform: uppercase; margin-bottom: 8px;">Your V-Hub Account Number</div>
              <div style="font-size: 36px; font-weight: 900; color: #5C3317; letter-spacing: 6px; font-family: 'Courier New', monospace;">${vh_number}</div>
              <div style="font-size: 11px; color: #8B5E3C; margin-top: 8px; font-style: italic;">Save this — you'll need it to manage your listing</div>
            </div>
            <div style="background: #F0E6C8; border-radius: 6px; padding: 14px 18px; font-size: 13px; color: #5A3010; line-height: 1.8;">
              <strong>What happens next:</strong><br/>
              📋 Step 1 — Our team reviews your listing<br/>
              ✅ Step 2 — You'll receive an approval confirmation email<br/>
              🔍 Step 3 — You appear in search results across your selected villages
            </div>
            <p style="font-size: 12px; color: #8B5E3C; margin-top: 16px;">Questions? Reply to this email or contact us at <a href="mailto:admin@v-hub.us" style="color: #5C3317;">admin@v-hub.us</a></p>
          </div>
          <div style="background: #1A0A00; padding: 12px; text-align: center; color: rgba(245,232,204,0.5); font-size: 11px;">
            V-Hub · The Villages, Florida
          </div>
        </div>
      `;
      await sendEmail(email, `Welcome to V-Hub — Your Account Number: ${vh_number}`, providerHtml);
    } catch (emailErr) {
      console.error("Provider confirmation email failed:", emailErr);
    }

    return Response.json({ ok: true, id: record.id, vh_number });
  } catch (error) {
    console.error("submitListing error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
