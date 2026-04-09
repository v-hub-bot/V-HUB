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
    console.log('SendGrid email sent successfully to:', to);
  }
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
      services,
      service_areas,
      provider_id,
    } = body;

    // Validate required fields
    if (!business_name || !owner_name || !phone || !email) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Use asServiceRole to bypass RLS for unauthenticated submissions
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
      provider_id,
      subscription_status: "pending",
      is_visible: false,
    });

    // ── Notify William (admin) ────────────────────────────────────────────
    try {
      const servicesList = (services || []).join(', ') || 'N/A';
      const areasList = (service_areas || []).join(', ') || 'N/A';
      const adminHtml = `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #F5E8CC; border: 2px solid #8B4513; border-radius: 12px; overflow: hidden;">
          <div style="background: #1A0A00; padding: 20px 24px; text-align: center;">
            <img src="https://media.base44.com/images/public/69d062aca815ce8e697894b1/a9af95bc3_V-Hublogo.png" style="height: 60px; border-radius: 8px;" />
            <div style="color: #F5E8CC; font-size: 20px; font-weight: 900; letter-spacing: 2px; margin-top: 10px;">NEW LISTING SUBMISSION</div>
          </div>
          <div style="padding: 24px;">
            <p style="color: #5A3010; font-size: 15px; margin: 0 0 20px;">A new provider has submitted a listing on V-Hub and is awaiting your approval.</p>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr style="border-bottom: 1px solid #C4A270;">
                <td style="padding: 10px 8px; font-weight: 700; color: #5A3010; width: 38%;">Business Name</td>
                <td style="padding: 10px 8px; color: #1A0A00;">${business_name}</td>
              </tr>
              <tr style="border-bottom: 1px solid #C4A270; background: rgba(139,69,19,0.05);">
                <td style="padding: 10px 8px; font-weight: 700; color: #5A3010;">Owner / Contact</td>
                <td style="padding: 10px 8px; color: #1A0A00;">${owner_name}</td>
              </tr>
              <tr style="border-bottom: 1px solid #C4A270;">
                <td style="padding: 10px 8px; font-weight: 700; color: #5A3010;">Phone</td>
                <td style="padding: 10px 8px; color: #1A0A00;">${phone}</td>
              </tr>
              <tr style="border-bottom: 1px solid #C4A270; background: rgba(139,69,19,0.05);">
                <td style="padding: 10px 8px; font-weight: 700; color: #5A3010;">Email</td>
                <td style="padding: 10px 8px; color: #1A0A00;">${email}</td>
              </tr>
              ${website ? `<tr style="border-bottom: 1px solid #C4A270;"><td style="padding: 10px 8px; font-weight: 700; color: #5A3010;">Website</td><td style="padding: 10px 8px; color: #1A0A00;">${website}</td></tr>` : ''}
              ${address ? `<tr style="border-bottom: 1px solid #C4A270; background: rgba(139,69,19,0.05);"><td style="padding: 10px 8px; font-weight: 700; color: #5A3010;">Address</td><td style="padding: 10px 8px; color: #1A0A00;">${address}</td></tr>` : ''}
              <tr style="border-bottom: 1px solid #C4A270;">
                <td style="padding: 10px 8px; font-weight: 700; color: #5A3010;">Services Offered</td>
                <td style="padding: 10px 8px; color: #1A0A00;">${servicesList}</td>
              </tr>
              <tr style="background: rgba(139,69,19,0.05);">
                <td style="padding: 10px 8px; font-weight: 700; color: #5A3010;">Areas Served</td>
                <td style="padding: 10px 8px; color: #1A0A00;">${areasList}</td>
              </tr>
            </table>
            ${description ? `<div style="margin-top: 16px; padding: 12px; background: #fff; border-left: 3px solid #8B4513; border-radius: 4px; font-size: 13px; color: #333;"><strong>About the Business:</strong><br/>${description}</div>` : ''}
            <div style="text-align: center; margin-top: 24px;">
              <a href="https://v-hub.us/Admin" style="display: inline-block; background: #2e7d32; color: #fff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 700; font-size: 15px; letter-spacing: 1px;">
                ✅ Go to Admin Dashboard to Approve
              </a>
            </div>
          </div>
          <div style="background: #1A0A00; padding: 12px; text-align: center; color: rgba(245,232,204,0.5); font-size: 11px;">
            V-Hub · The Villages, Florida · admin@v-hub.us
          </div>
        </div>
      `;
      await sendEmail('admin@v-hub.us', `📋 New Listing: ${business_name}`, adminHtml);
    } catch (emailErr) {
      console.error("Admin notification email failed:", emailErr);
    }

    return Response.json({ ok: true, id: record.id, provider_id });
  } catch (error) {
    console.error("submitListing error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
