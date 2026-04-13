import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY') || '';
const APP_URL = 'https://v-hub-app-edf7f8e8.base44.app';

async function sha256(plain: string): Promise<string> {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest('SHA-256', enc.encode(plain));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function genToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}

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
    const base44 = createClientFromRequest(req);
    const { email } = await req.json().catch(() => ({}));

    if (!email) {
      return Response.json({ error: 'Email is required' }, { status: 400 });
    }

    const emailLower = email.trim().toLowerCase();

    // Find provider by login_email or email
    let providers = await base44.asServiceRole.entities.Provider.filter({ login_email: emailLower });
    if (!providers.length) {
      providers = await base44.asServiceRole.entities.Provider.filter({ email: emailLower });
    }

    // Always return success (don't reveal if email exists)
    if (!providers.length) {
      return Response.json({ ok: true });
    }

    const provider = providers[0];

    // Generate token
    const rawToken = genToken();
    const tokenHash = await sha256(rawToken);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

    // Store hashed token
    await base44.asServiceRole.entities.PasswordResetToken.create({
      provider_id: provider.id,
      email: emailLower,
      token_hash: tokenHash,
      expires_at: expiresAt,
      used: false,
    });

    // Build reset link (raw token in URL)
    const resetLink = `${APP_URL}/ProviderDashboard?reset_token=${rawToken}&provider_id=${provider.id}`;

    const html = `
      <div style="font-family: Georgia, serif; max-width: 580px; margin: 0 auto; background: #F5E8CC; border: 2px solid #8B4513; border-radius: 12px; overflow: hidden;">
        <div style="background: #1A0A00; padding: 20px 24px; text-align: center;">
          <img src="https://media.base44.com/images/public/69d062aca815ce8e697894b1/a9af95bc3_V-Hublogo.png" style="height: 54px; border-radius: 8px;" />
          <div style="color: #F5E8CC; font-size: 20px; font-weight: 900; letter-spacing: 2px; margin-top: 10px;">Reset Your Password</div>
        </div>
        <div style="padding: 28px 24px;">
          <p style="font-size: 15px; color: #3a1f00; margin: 0 0 16px;">Hi ${provider.owner_name || provider.business_name},</p>
          <p style="font-size: 14px; color: #5A3010; margin: 0 0 20px;">
            We received a request to reset your V-Hub Provider Hub password. Click the button below to set a new password. This link expires in <strong>1 hour</strong>.
          </p>
          <div style="text-align: center; margin: 28px 0;">
            <a href="${resetLink}" style="background: #E8431A; color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 900; font-family: Georgia, serif; letter-spacing: 1px; display: inline-block;">
              Reset My Password →
            </a>
          </div>
          <p style="font-size: 13px; color: #7a5c3c; margin: 0 0 8px;">If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="font-size: 11px; color: #7a5c3c; word-break: break-all; margin: 0 0 20px;">${resetLink}</p>
          <p style="font-size: 13px; color: #7a5c3c; margin: 0;">
            If you did not request a password reset, you can safely ignore this email. Your password will not change.
          </p>
        </div>
        <div style="background: #1A0A00; padding: 12px; text-align: center; color: rgba(245,232,204,0.5); font-size: 11px;">
          V-Hub · The Villages, Florida · admin@v-hub.us
        </div>
      </div>
    `;

    await sendEmail(emailLower, 'Reset your V-Hub password', html);

    return Response.json({ ok: true });
  } catch (err: any) {
    console.error('requestPasswordReset error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
});
