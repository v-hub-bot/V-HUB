import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import Stripe from "npm:stripe@14";

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

async function getStripeCheckoutUrl(provider: any): Promise<string> {
  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2023-10-16" });
    const appUrl = "https://v-hub-app-edf7f8e8.base44.app";
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: provider.email,
      line_items: [{ price: "price_1TIfRrHOk6rIFwfqk1pUiUzR", quantity: 1 }],
      metadata: {
        provider_id: provider.provider_id || provider.id,
        provider_record_id: provider.id,
        business_name: provider.business_name,
      },
      success_url: `${appUrl}/ProviderDashboard?payment=success&acct=${provider.provider_id || provider.id}`,
      cancel_url: `${appUrl}/ProviderDashboard?payment=cancelled`,
    });
    return session.url || `${appUrl}/ProviderDashboard`;
  } catch (e) {
    console.error("Stripe checkout creation failed:", e);
    return "https://v-hub-app-edf7f8e8.base44.app/ProviderDashboard";
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const providers = await base44.asServiceRole.entities.Provider.list();

    const now = new Date();
    let sent = 0;
    let expired = 0;

    for (const p of providers) {
      if (p.subscription_status !== 'trial') continue;
      if (!p.trial_end_date) continue;

      const trialEnd = new Date(p.trial_end_date);
      const daysLeft = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      // ── Expired: deactivate ──────────────────────────────────────────────
      if (daysLeft <= 0) {
        await base44.asServiceRole.entities.Provider.update(p.id, {
          subscription_status: 'trial_expired',
          is_visible: false,
          is_active: false,
        });

        // Send expiry notice
        if (p.email) {
          const checkoutUrl = await getStripeCheckoutUrl(p);
          const expiredHtml = `
            <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #F5E8CC; border: 2px solid #8B4513; border-radius: 12px; overflow: hidden;">
              <div style="background: #1A0A00; padding: 20px 24px; text-align: center;">
                <img src="https://media.base44.com/images/public/69d062aca815ce8e697894b1/a9af95bc3_V-Hublogo.png" style="height: 60px; border-radius: 8px;" />
                <div style="color: #F5E8CC; font-size: 20px; font-weight: 900; letter-spacing: 2px; margin-top: 10px;">Your Trial Has Ended</div>
              </div>
              <div style="padding: 28px 24px;">
                <p style="font-size: 16px; color: #3a1f00; margin: 0 0 16px;">Hi ${p.owner_name},</p>
                <p style="font-size: 15px; color: #5A3010; margin: 0 0 16px;">
                  Your 45-day free trial for <strong>${p.business_name}</strong> has ended and your listing has been temporarily paused.
                </p>
                <p style="font-size: 15px; color: #5A3010; margin: 0 0 20px;">
                  To get back in front of Villages residents, activate your subscription below. It only takes a minute.
                </p>
                <div style="background: #fff; border-radius: 10px; padding: 18px; margin: 20px 0; border-left: 4px solid #E8431A; text-align: center;">
                  <div style="font-size: 22px; font-weight: 800; color: #E8431A; margin: 8px 0;">$12 / month</div>
                  <div style="font-size: 13px; color: #888; margin-bottom: 4px;">Cancel anytime. No long-term contracts.</div>
                </div>
                <div style="text-align: center; margin: 24px 0;">
                  <a href="${checkoutUrl}" style="display: inline-block; background: #E8431A; color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 700; font-size: 16px;">
                    Reactivate My Listing →
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
          await sendEmail(p.email, `Your V-Hub listing has been paused — ${p.business_name}`, expiredHtml);
        }

        expired++;
        continue;
      }

      // ── 10-day reminder ──────────────────────────────────────────────────
      if (daysLeft <= 10 && !p.reminder_sent) {
        const trialEndFormatted = trialEnd.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        const checkoutUrl = await getStripeCheckoutUrl(p);

        const reminderHtml = `
          <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #F5E8CC; border: 2px solid #8B4513; border-radius: 12px; overflow: hidden;">
            <div style="background: #1A0A00; padding: 20px 24px; text-align: center;">
              <img src="https://media.base44.com/images/public/69d062aca815ce8e697894b1/a9af95bc3_V-Hublogo.png" style="height: 60px; border-radius: 8px;" />
              <div style="color: #F5E8CC; font-size: 20px; font-weight: 900; letter-spacing: 2px; margin-top: 10px;">Your Trial Ends in ${daysLeft} Day${daysLeft !== 1 ? 's' : ''}</div>
            </div>
            <div style="padding: 28px 24px;">
              <p style="font-size: 16px; color: #3a1f00; margin: 0 0 16px;">Hi ${p.owner_name},</p>
              <p style="font-size: 15px; color: #5A3010; margin: 0 0 16px;">
                Your V-Hub free trial for <strong>${p.business_name}</strong> ends on <strong>${trialEndFormatted}</strong>.
                Don't lose your spot in front of Villages residents!
              </p>
              <div style="background: #fff; border-radius: 10px; padding: 18px; margin: 20px 0; border-left: 4px solid #E8431A; text-align: center;">
                <div style="font-size: 14px; color: #333; margin-bottom: 8px;">Keep your listing active for just:</div>
                <div style="font-size: 22px; font-weight: 800; color: #E8431A; margin: 8px 0;">$12 / month</div>
                <div style="font-size: 13px; color: #888;">Cancel anytime. No long-term contracts.</div>
              </div>
              <div style="text-align: center; margin: 24px 0;">
                <a href="${checkoutUrl}" style="display: inline-block; background: #E8431A; color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 700; font-size: 16px;">
                  Keep My Listing Active →
                </a>
              </div>
              <p style="font-size: 13px; color: #5A3010; margin: 0 0 8px; text-align: center;">
                Takes about 2 minutes. Secure checkout via Stripe.
              </p>
              <p style="font-size: 13px; color: #888; text-align: center;">
                Questions? Email us at <a href="mailto:admin@v-hub.us" style="color: #E8431A;">admin@v-hub.us</a>
              </p>
            </div>
            <div style="background: #1A0A00; padding: 12px; text-align: center; color: rgba(245,232,204,0.5); font-size: 11px;">
              V-Hub · The Villages, Florida · admin@v-hub.us
            </div>
          </div>
        `;

        await sendEmail(p.email, `⏰ Your V-Hub trial ends in ${daysLeft} day${daysLeft !== 1 ? 's' : ''} — ${p.business_name}`, reminderHtml);
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
