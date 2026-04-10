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
    console.error('SendGrid error:', err);
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const providers = await base44.asServiceRole.entities.Provider.list();

    const now = new Date();
    const in7Days = new Date(now);
    in7Days.setDate(in7Days.getDate() + 7);

    let sent = 0;
    let expired = 0;

    for (const p of providers) {
      if (p.subscription_status !== 'trial') continue;
      if (!p.trial_end_date) continue;

      const trialEnd = new Date(p.trial_end_date);
      const daysLeft = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      // Mark expired trials
      if (daysLeft <= 0) {
        await base44.asServiceRole.entities.Provider.update(p.id, {
          subscription_status: 'trial_expired',
          is_visible: false,
          is_active: false,
        });
        expired++;
        continue;
      }

      // Send reminder if within 7 days and not already sent
      if (daysLeft <= 7 && !p.reminder_sent) {
        const trialEndFormatted = trialEnd.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        const reminderHtml = `
          <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #F5E8CC; border: 2px solid #8B4513; border-radius: 12px; overflow: hidden;">
            <div style="background: #1A0A00; padding: 20px 24px; text-align: center;">
              <img src="https://media.base44.com/images/public/69d062aca815ce8e697894b1/a9af95bc3_V-Hublogo.png" style="height: 60px; border-radius: 8px;" />
              <div style="color: #F5E8CC; font-size: 20px; font-weight: 900; letter-spacing: 2px; margin-top: 10px;">Your Trial Ends in ${daysLeft} Day${daysLeft !== 1 ? 's' : ''}!</div>
            </div>
            <div style="padding: 28px 24px;">
              <p style="font-size: 16px; color: #3a1f00; margin: 0 0 16px;">Hi ${p.owner_name},</p>
              <p style="font-size: 15px; color: #5A3010; margin: 0 0 16px;">
                Your V-Hub free trial for <strong>${p.business_name}</strong> ends on <strong>${trialEndFormatted}</strong>.
              </p>
              <div style="background: #fff; border-radius: 10px; padding: 18px; margin: 20px 0; border-left: 4px solid #E8431A;">
                <div style="font-size: 14px; color: #333; margin-bottom: 8px;">To continue being listed on V-Hub, simply set up your billing:</div>
                <div style="font-size: 18px; font-weight: 800; color: #E8431A; margin: 8px 0;">$12 / month</div>
                <div style="font-size: 13px; color: #888;">Cancel anytime. No long-term contracts.</div>
              </div>
              <div style="text-align: center; margin: 24px 0;">
                <a href="https://v-hub-app-edf7f8e8.base44.app/ProviderDashboard" style="display: inline-block; background: #E8431A; color: #fff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 700; font-size: 15px;">
                  Set Up Billing →
                </a>
              </div>
              <p style="font-size: 13px; color: #888; text-align: center;">
                Questions? Email us at <a href="mailto:admin@v-hub.us" style="color: #E8431A;">admin@v-hub.us</a>
              </p>
            </div>
            <div style="background: #1A0A00; padding: 12px; text-align: center; color: rgba(245,232,204,0.5); font-size: 11px;">
              V-Hub · The Villages, Florida · admin@v-hub.us
            </div>
          </div>
        `;

        await sendEmail(p.email, `⏰ Your V-Hub Trial Ends in ${daysLeft} Day${daysLeft !== 1 ? 's' : ''} — ${p.business_name}`, reminderHtml);
        await base44.asServiceRole.entities.Provider.update(p.id, { reminder_sent: true });
        sent++;
      }
    }

    return Response.json({ ok: true, reminders_sent: sent, trials_expired: expired });
  } catch (error) {
    console.error('trialReminder error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
