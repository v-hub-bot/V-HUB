const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY') || '';

async function sendEmail(to: string, subject: string, html: string) {
  const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: { Authorization: `Bearer ${SENDGRID_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: 'admin@v-hub.us', name: 'V-Hub' },
      subject,
      content: [{ type: 'text/html', value: html }],
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    console.error('SendGrid error:', err);
    throw new Error('Email send failed');
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST', 'Access-Control-Allow-Headers': 'Content-Type' } });
  }

  try {
    const { old_email, new_email, business_name } = await req.json().catch(() => ({}));

    if (!old_email || !new_email) {
      return Response.json({ error: 'old_email and new_email are required' }, { status: 400 });
    }

    const name = business_name || 'your account';
    const now = new Date().toLocaleString('en-US', { timeZone: 'America/New_York', dateStyle: 'long', timeStyle: 'short' });

    const html = `
      <div style="font-family: Georgia, serif; max-width: 580px; margin: 0 auto; background: #F5E8CC; border: 2px solid #8B4513; border-radius: 12px; overflow: hidden;">
        <div style="background: #1A0A00; padding: 20px 24px; text-align: center;">
          <img src="https://media.base44.com/images/public/69d06ada8019d7e9edf7f8e8/a9af95bc3_V-Hublogo.png" style="height: 54px; border-radius: 8px;" />
          <div style="color: #F5E8CC; font-size: 20px; font-weight: 900; letter-spacing: 2px; margin-top: 10px;">Email Address Changed</div>
        </div>
        <div style="padding: 28px 24px;">
          <p style="font-size: 15px; color: #3a1f00; margin: 0 0 16px;">Hi <strong>${name}</strong>,</p>
          <p style="font-size: 14px; color: #5A3010; margin: 0 0 16px; line-height: 1.6;">
            We're letting you know that the login email address for your V-Hub Provider Hub account was changed on <strong>${now}</strong>.
          </p>
          <div style="background: #fff8e8; border: 1.5px solid #c8a050; border-radius: 8px; padding: 16px 20px; margin: 20px 0;">
            <div style="font-size: 13px; color: #5A3010; margin-bottom: 8px;"><strong>Previous email:</strong> ${old_email}</div>
            <div style="font-size: 13px; color: #1A6B3C;"><strong>New email:</strong> ${new_email}</div>
          </div>
          <p style="font-size: 14px; color: #5A3010; margin: 0 0 16px; line-height: 1.6;">
            Going forward, use <strong>${new_email}</strong> to sign in to your Provider Hub.
          </p>
          <p style="font-size: 13px; color: #7a5c3c; margin: 0; line-height: 1.6;">
            If you did not make this change, please contact us immediately at
            <a href="mailto:admin@v-hub.us" style="color: #7A4820; font-weight: 700;">admin@v-hub.us</a>.
          </p>
        </div>
        <div style="background: #1A0A00; padding: 12px; text-align: center; color: rgba(245,232,204,0.5); font-size: 11px;">
          <a href="https://www.v-hub.us" style="color:#CC0000;font-weight:700;text-decoration:none;">🌴 www.v-hub.us</a> · V-Hub · The Villages, Florida · admin@v-hub.us
        </div>
      </div>
    `;

    await sendEmail(old_email, 'Your V-Hub login email was changed', html);

    return Response.json({ ok: true });
  } catch (err: any) {
    console.error('notifyEmailChange error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
});
