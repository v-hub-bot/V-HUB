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
      from: { email: 'admin@v-hub.us', name: 'V-Hub Admin' },
      subject,
      content: [{ type: 'text/html', value: htmlBody }],
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    console.error('SendGrid error:', err);
  }
}

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const {
      business_name,
      vh_number,
      owner_name,
      email,
      phone,
      website,
      address,
      category_name,
      service_name,
      service_areas = [],
      description,
      license_number,
      years_in_business,
      login_email,
      trial_start_date,
      trial_end_date,
    } = body;

    const htmlContent = `
      <div style="font-family: Georgia, serif; max-width: 700px; margin: 0 auto; background: #F5E8CC; border: 2px solid #8B4513; border-radius: 12px; overflow: hidden;">
        <div style="background: #1A0A00; padding: 20px 24px; text-align: center;">
          <div style="color: #F5E8CC; font-size: 18px; font-weight: 900; letter-spacing: 1px;">V-HUB ADMIN NOTIFICATION</div>
        </div>
        <div style="padding: 28px 24px;">
          <h2 style="color: #E8431A; margin-top: 0;">New Provider Listing Submitted</h2>
          <p style="font-size: 15px; color: #5A3010; margin: 0 0 20px;">
            A new provider has signed up and requires activation.
          </p>
          
          <div style="background: #fff; border-radius: 10px; padding: 18px; margin: 20px 0; border-left: 4px solid #E8431A;">
            <h3 style="margin-top: 0; color: #E8431A;">Provider Details</h3>
            <table style="width: 100%; font-size: 14px; color: #333;">
              <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 8px 0; font-weight: bold; width: 140px;">Business Name:</td>
                <td style="padding: 8px 0;">${business_name}</td>
              </tr>
              <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 8px 0; font-weight: bold;">V-HUB Account:</td>
                <td style="padding: 8px 0; font-family: monospace; color: #E8431A; font-weight: bold;">${vh_number}</td>
              </tr>
              <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 8px 0; font-weight: bold;">Owner:</td>
                <td style="padding: 8px 0;">${owner_name}</td>
              </tr>
              <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 8px 0; font-weight: bold;">Email:</td>
                <td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #00BFA5;">${email}</a></td>
              </tr>
              <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 8px 0; font-weight: bold;">Phone:</td>
                <td style="padding: 8px 0;">${phone}</td>
              </tr>
              <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 8px 0; font-weight: bold;">Website:</td>
                <td style="padding: 8px 0;"><a href="${website}" style="color: #00BFA5;">${website}</a></td>
              </tr>
              <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 8px 0; font-weight: bold;">Address:</td>
                <td style="padding: 8px 0;">${address}</td>
              </tr>
            </table>
          </div>
          
          <div style="background: #fff; border-radius: 10px; padding: 18px; margin: 20px 0; border-left: 4px solid #00BFA5;">
            <h3 style="margin-top: 0; color: #00BFA5;">Services</h3>
            <table style="width: 100%; font-size: 14px; color: #333;">
              <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 8px 0; font-weight: bold; width: 140px;">Category:</td>
                <td style="padding: 8px 0;">${category_name}</td>
              </tr>
              <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 8px 0; font-weight: bold;">Service:</td>
                <td style="padding: 8px 0;">${service_name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; vertical-align: top;">Areas:</td>
                <td style="padding: 8px 0;">
                  <ul style="margin: 0; padding-left: 20px;">
                    ${service_areas.map(area => `<li style="margin: 4px 0;">${area}</li>`).join('')}
                  </ul>
                </td>
              </tr>
            </table>
          </div>
          
          <div style="background: #fff; border-radius: 10px; padding: 18px; margin: 20px 0; border-left: 4px solid #FFC107;">
            <h3 style="margin-top: 0; color: #333;">Company Information</h3>
            <p style="font-size: 14px; color: #333; margin: 8px 0;">
              <strong>Description:</strong><br/>
              ${description}
            </p>
            <table style="width: 100%; font-size: 14px; color: #333;">
              <tr style="border-top: 1px solid #eee; border-bottom: 1px solid #eee;">
                <td style="padding: 8px 0; font-weight: bold; width: 140px;">License:</td>
                <td style="padding: 8px 0;">${license_number}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Years in Business:</td>
                <td style="padding: 8px 0;">${years_in_business}</td>
              </tr>
            </table>
          </div>
          
          <div style="background: #FFDB00; border-radius: 8px; padding: 14px 16px; margin: 20px 0; border-left: 4px solid #E8431A;">
            <h3 style="color: #3a1f00; margin-top: 0;">Trial Information</h3>
            <p style="font-size: 14px; color: #3a1f00; margin: 8px 0;">
              <strong>Trial Period:</strong> ${trial_start_date} → ${trial_end_date}
            </p>
            <p style="font-size: 14px; color: #3a1f00; margin: 8px 0;">
              <strong>Provider Email:</strong> ${login_email}
            </p>
            <p style="font-size: 14px; color: #3a1f00; margin: 8px 0;">
              <strong>Status:</strong> INACTIVE (awaiting admin activation)
            </p>
          </div>
          
          <h3 style="color: #3a1f00; font-size: 15px; margin-top: 20px;">Next Steps</h3>
          <ol style="color: #5A3010; font-size: 14px; line-height: 1.8;">
            <li>Review the provider details above</li>
            <li>Go to the <strong>V-HUB Admin Dashboard</strong> to activate and manage this account</li>
            <li>Once approved, the provider will receive their welcome email with login instructions</li>
          </ol>
          
          <div style="text-align: center; margin-top: 24px;">
            <a href="https://www.v-hub.us/Wekcadmin" style="display: inline-block; background: #E8431A; color: white; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px;">Go to Admin Dashboard</a>
          </div>
          
          <div style="border-top: 1px solid #ddd; margin-top: 28px; padding-top: 16px; text-align: center;">
            <p style="font-size: 12px; color: #888; margin-bottom: 8px;">This is an automated notification from V-Hub Admin System</p>
            <a href="https://www.v-hub.us" style="color: #C9973A; font-size: 13px; font-weight: 700; text-decoration: none;">🌴 www.v-hub.us</a>
          </div>
        </div>
      </div>
    `;

    await sendEmail(
      'evansrus@comcast.net',
      `[V-HUB Admin] New Provider Listing — ${business_name} (${vh_number})`,
      htmlContent
    );

    return Response.json({ ok: true, message: "Admin notification sent" });
  } catch (error) {
    console.error('sendAdminNotification error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
