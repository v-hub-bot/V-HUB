import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

async function sendEmail(base44: any, to: string, subject: string, htmlBody: string) {
  const { accessToken } = await base44.asServiceRole.connectors.getConnection('gmail');

  const boundary = "vhub_boundary_" + Date.now();
  const mime = [
    `From: V-Hub Admin <admin@v-hub.us>`,
    `To: ${to}`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    ``,
    `--${boundary}`,
    `Content-Type: text/html; charset=UTF-8`,
    `Content-Transfer-Encoding: quoted-printable`,
    ``,
    htmlBody,
    `--${boundary}--`,
  ].join("\r\n");

  const encoded = btoa(unescape(encodeURIComponent(mime)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw: encoded }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('Gmail send error:', err);
    throw new Error('Email send failed: ' + err);
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { provider_id, provider_record_id, business_name, owner_name, email, phone, services, service_areas, vh_number } = body;

    if (!provider_record_id) {
      return Response.json({ error: 'Missing provider_record_id' }, { status: 400 });
    }

    // Set trial dates — 45 day trial starting today
    const now = new Date();
    const trialEnd = new Date(now);
    trialEnd.setDate(trialEnd.getDate() + 45);

    const trialStartStr = now.toISOString().split('T')[0];
    const trialEndStr = trialEnd.toISOString().split('T')[0];
    const trialEndFormatted = trialEnd.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    // Mark provider as active, visible, on trial
    await base44.asServiceRole.entities.Provider.update(provider_record_id, {
      is_active: true,
      is_visible: true,
      subscription_status: "trial",
      trial_start_date: trialStartStr,
      trial_end_date: trialEndStr,
      reminder_sent: false,
    });

    // ── Email the provider ──────────────────────────────────────────────────
    if (email) {
      const servicesList = (services || []).join(', ') || 'your selected services';
      const areasList = (service_areas || []).join(', ') || 'your selected areas';
      const vhDisplay = vh_number ? `<div style="font-size: 13px; color: #333; margin-bottom: 6px;"><strong>VH Number:</strong> ${vh_number}</div>` : '';

      const providerHtml = `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #F5E8CC; border: 2px solid #8B4513; border-radius: 12px; overflow: hidden;">
          <div style="background: #1A0A00; padding: 20px 24px; text-align: center;">
            <img src="https://media.base44.com/images/public/69d062aca815ce8e697894b1/a9af95bc3_V-Hublogo.png" style="height: 60px; border-radius: 8px;" />
            <div style="color: #F5E8CC; font-size: 20px; font-weight: 900; letter-spacing: 2px; margin-top: 10px;">YOU'RE NOW LIVE ON V-HUB!</div>
          </div>
          <div style="padding: 28px 24px;">
            <p style="color: #1A0A00; font-size: 16px; margin: 0 0 12px;">Hi ${owner_name},</p>
            <p style="color: #5A3010; font-size: 15px; margin: 0 0 20px;">
              Great news — <strong>${business_name}</strong> has been approved and is now <strong>live on V-Hub</strong>!
              Residents of The Villages can find you right now when searching for services in your area.
            </p>
            <div style="background: #fff; border: 1px solid #C4A270; border-radius: 8px; padding: 16px 20px; margin-bottom: 20px;">
              <div style="font-weight: 700; color: #5A3010; margin-bottom: 10px; font-size: 14px;">YOUR LISTING SUMMARY</div>
              <div style="font-size: 13px; color: #333; margin-bottom: 6px;"><strong>Business:</strong> ${business_name}</div>
              ${vhDisplay}
              <div style="font-size: 13px; color: #333; margin-bottom: 6px;"><strong>Services:</strong> ${servicesList}</div>
              <div style="font-size: 13px; color: #333;"><strong>Areas:</strong> ${areasList}</div>
            </div>
            <div style="background: #E8F5E9; border: 1px solid #4CAF50; border-radius: 8px; padding: 14px 18px; margin-bottom: 20px;">
              <div style="font-weight: 700; color: #2E7D32; font-size: 14px; margin-bottom: 6px;">🎉 45-DAY FREE TRIAL STARTED</div>
              <div style="font-size: 13px; color: #388E3C;">
                Your listing is free through <strong>${trialEndFormatted}</strong>. No credit card required yet.
                We'll reach out before your trial ends with easy billing options — just $12/month to stay listed.
              </div>
            </div>
            <p style="color: #5A3010; font-size: 14px; margin: 0 0 8px;">
              When residents search for your services, your listing appears with your contact info.
              They call you directly — no middleman, no commission.
            </p>
            <p style="color: #5A3010; font-size: 14px; margin: 0 0 24px;">
              Questions? Reply to this email or reach us at <a href="mailto:admin@v-hub.us" style="color: #E8431A;">admin@v-hub.us</a>.
            </p>
            <div style="text-align: center;">
              <a href="https://v-hub-app-edf7f8e8.base44.app" style="display: inline-block; background: #E8431A; color: #fff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 700; font-size: 15px; letter-spacing: 1px;">
                🌴 View V-Hub Directory
              </a>
            </div>
          </div>
          <div style="background: #1A0A00; padding: 12px; text-align: center; color: rgba(245,232,204,0.5); font-size: 11px;">
            V-Hub · The Villages, Florida · A community-first directory · <a href="https://v-hub-app-edf7f8e8.base44.app" style="color: rgba(245,232,204,0.4);">v-hub.us</a>
          </div>
        </div>
      `;

      await sendEmail(base44, email, `🎉 You're live on V-Hub — ${business_name} (45-day free trial started)`, providerHtml);
    }

    return Response.json({ ok: true, trial_start: trialStartStr, trial_end: trialEndStr });
  } catch (error) {
    console.error("approveProvider error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
