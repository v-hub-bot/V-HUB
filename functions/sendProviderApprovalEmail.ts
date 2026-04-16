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
    console.error('SendGrid error:', err);
  }
}

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const {
      owner_name,
      business_name,
      email,
      vh_number,
    } = body;

    const dashboardUrl = "https://www.v-hub.us/ProviderDashboard";

    const htmlContent = `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #F5E8CC; border: 2px solid #8B4513; border-radius: 12px; overflow: hidden;">
        <div style="background: #1A0A00; padding: 20px 24px; text-align: center;">
          <img src="https://media.base44.com/images/public/69d062aca815ce8e697894b1/a9af95bc3_V-Hublogo.png" style="height: 60px; border-radius: 8px;" />
          <div style="color: #F5E8CC; font-size: 20px; font-weight: 900; letter-spacing: 2px; margin-top: 10px;">Welcome to V-Hub!</div>
        </div>
        <div style="padding: 28px 24px;">
          <p style="font-size: 16px; color: #3a1f00; margin: 0 0 16px;">Hi ${owner_name},</p>
          <p style="font-size: 15px; color: #5A3010; margin: 0 0 16px;">
            Great news! Your listing for <strong>${business_name}</strong> has been approved and is now live on V-Hub.
          </p>
          
          <div style="background: #fff; border-radius: 10px; padding: 18px; margin: 20px 0; border-left: 4px solid #E8431A;">
            <h3 style="margin-top: 0; color: #E8431A;">Your Account Details</h3>
            <p style="font-size: 14px; color: #333; margin: 8px 0;">
              <strong>V-Hub Account Number:</strong><br/>
              <span style="font-family: monospace; font-weight: bold; color: #E8431A; font-size: 16px;">${vh_number}</span>
            </p>
            <p style="font-size: 14px; color: #333; margin: 8px 0;">
              <strong>Account Email:</strong><br/>
              ${email}
            </p>
          </div>
          
          <h3 style="color: #3a1f00; font-size: 15px; margin-top: 20px;">How to Access Your Provider Dashboard</h3>
          <ol style="color: #5A3010; font-size: 14px; line-height: 1.8;">
            <li>Visit <a href="${dashboardUrl}" style="color: #00BFA5; text-decoration: none; font-weight: bold;">${dashboardUrl}</a></li>
            <li>Sign in with your email address: <strong>${email}</strong></li>
            <li>You'll receive a sign-in link — click it to access your account</li>
            <li>Once logged in, you can manage your listing, view inquiries, and track performance</li>
          </ol>
          
          <div style="background: #FFDB00; border-radius: 8px; padding: 14px 16px; margin: 20px 0; border-left: 4px solid #E8431A;">
            <p style="font-size: 13px; color: #3a1f00; margin: 0;">
              <strong>💡 Keep Your Account Number Handy:</strong> Save <strong>${vh_number}</strong> somewhere safe. You'll need it if you ever need support or have questions.
            </p>
          </div>
          
          <p style="font-size: 15px; color: #5A3010; margin: 0 0 20px;">
            Your 45-day trial is now active. After that, keep your listing live for just <strong>$12/month</strong>. You can manage your subscription anytime from your dashboard.
          </p>
          
          <p style="font-size: 13px; color: #888; text-align: center; margin-top: 24px;">
            Questions? Email us at <a href="mailto:admin@v-hub.us" style="color: #E8431A;">admin@v-hub.us</a>
          </p>
        </div>
        <div style="background: #1A0A00; padding: 12px; text-align: center; color: rgba(245,232,204,0.5); font-size: 11px;">
          V-Hub · The Villages, Florida · admin@v-hub.us
        </div>
      </div>
    `;

    await sendEmail(
      email,
      `Welcome to V-Hub, ${owner_name}! Your Listing is Live`,
      htmlContent
    );

    return Response.json({ ok: true, message: "Welcome email sent" });
  } catch (error) {
    console.error('sendProviderApprovalEmail error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
