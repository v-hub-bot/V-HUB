// v3 — 45-day trial → 90-day grace → archived (not deleted)
// Timeline:
//   Day 0:   Trial starts (subscription_status = 'trial', is_active = true)
//   Day 45:  Trial ends → status = 'trial_expired', is_active = false, is_visible = false
//             grace_period_end_date set to 90 days later
//             Email: "Trial ended — you have 90 days to reactivate"
//   Day 10 before trial ends: reminder email sent (reminder_sent = true)
//   Day 45+90 = Day 135: Grace period ends → status = 'archived'
//             Account stays in DB but is_active = false, is_visible = false
//             Email: "Account archived — email admin@v-hub.us to reactivate"
//   Admin can reactivate archived accounts from the admin dashboard

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from "npm:stripe@14";

const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY') || '';
const APP_URL = "https://www.v-hub.us";
const LOGO_URL = "https://media.base44.com/images/public/69d062aca815ce8e697894b1/a9af95bc3_V-Hublogo.png";

async function sendEmail(to: string, subject: string, htmlBody: string) {
  const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: { Authorization: `Bearer ${SENDGRID_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: 'admin@v-hub.us', name: 'V-Hub' },
      subject,
      content: [{ type: 'text/html', value: htmlBody }],
    }),
  });
  if (!res.ok) { const err = await res.text(); console.error('SendGrid error:', err); }
}

async function getStripeCheckoutUrl(provider: any): Promise<string> {
  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2023-10-16" });
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
      success_url: `${APP_URL}/ProviderDashboard?payment=success&acct=${provider.provider_id || provider.id}`,
      cancel_url: `${APP_URL}/ProviderDashboard?payment=cancelled`,
    });
    return session.url || `${APP_URL}/ProviderDashboard`;
  } catch (e) {
    console.error("Stripe checkout creation failed:", e);
    return `${APP_URL}/ProviderDashboard`;
  }
}

function emailFooter() {
  return `<div style="background:#1A0A00;padding:14px;text-align:center;color:rgba(245,232,204,0.5);font-size:11px;">
    <a href="https://www.v-hub.us" style="color:#C9973A;font-weight:700;text-decoration:none;font-size:13px;">🌴 www.v-hub.us</a>
    <span style="margin:0 8px;">·</span>V-Hub · The Villages, Florida
    <span style="margin:0 8px;">·</span><a href="mailto:admin@v-hub.us" style="color:#C9973A;">admin@v-hub.us</a>
  </div>`;
}

function emailHeader(title: string) {
  return `<div style="background:#1A0A00;padding:20px 24px;text-align:center;">
    <img src="${LOGO_URL}" style="height:60px;border-radius:8px;"/>
    <div style="color:#F5E8CC;font-size:20px;font-weight:900;letter-spacing:2px;margin-top:10px;">${title}</div>
  </div>`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const providers = await base44.asServiceRole.entities.Provider.list();

    const now = new Date();
    let reminders = 0, expired = 0, archived = 0;

    for (const p of providers) {
      const status = p.subscription_status;

      // ══════════════════════════════════════════════════════════════════════
      // ACTIVE TRIAL — check for expiry warning or expiry
      // ══════════════════════════════════════════════════════════════════════
      if (status === 'trial' && p.trial_end_date) {
        const trialEnd = new Date(p.trial_end_date);
        const daysLeft = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        // ── Trial just expired ─────────────────────────────────────────────
        if (daysLeft <= 0) {
          const graceEnd = new Date(trialEnd);
          graceEnd.setDate(graceEnd.getDate() + 90);

          await base44.asServiceRole.entities.Provider.update(p.id, {
            subscription_status: 'trial_expired',
            is_visible: false,
            is_active: false,
            grace_period_end_date: graceEnd.toISOString().split('T')[0],
          });

          if (p.email) {
            const checkoutUrl = await getStripeCheckoutUrl(p);
            const graceFmt = graceEnd.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
            await sendEmail(p.email, `Your V-Hub trial has ended — ${p.business_name}`, `
              <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;background:#F5E8CC;border:2px solid #8B4513;border-radius:12px;overflow:hidden;">
                ${emailHeader("⏰ Your Free Trial Has Ended")}
                <div style="padding:28px 24px;">
                  <p style="font-size:16px;color:#3a1f00;margin:0 0 16px;">Hi ${p.owner_name || 'there'},</p>
                  <p style="font-size:15px;color:#5A3010;margin:0 0 16px;">
                    Your 45-day free trial for <strong>${p.business_name}</strong> has ended. Your listing has been temporarily paused.
                  </p>
                  <div style="background:#fff3cd;border-left:4px solid #E8431A;border-radius:8px;padding:16px;margin:16px 0;">
                    <div style="font-size:14px;font-weight:700;color:#8B0000;margin-bottom:6px;">⏳ You have until ${graceFmt} to reactivate</div>
                    <div style="font-size:13px;color:#555;">After that date your account will be archived. You can still contact us to restore it, but it'll require manual review.</div>
                  </div>
                  <div style="background:#fff;border-radius:10px;padding:18px;margin:20px 0;border-left:4px solid #E8431A;text-align:center;">
                    <div style="font-size:14px;color:#333;margin-bottom:8px;">Keep your listing live for just:</div>
                    <div style="font-size:26px;font-weight:800;color:#E8431A;">$12 / month</div>
                    <div style="font-size:12px;color:#888;margin-top:4px;">Cancel anytime. No contracts. Billing starts after your grace period.</div>
                  </div>
                  <div style="text-align:center;margin:24px 0;">
                    <a href="${checkoutUrl}" style="display:inline-block;background:#E8431A;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:700;font-size:16px;">Reactivate My Listing →</a>
                  </div>
                  <p style="font-size:13px;color:#888;text-align:center;">Questions? Reply to this email or write to <a href="mailto:admin@v-hub.us" style="color:#E8431A;">admin@v-hub.us</a></p>
                </div>
                ${emailFooter()}
              </div>
            `);
          }
          expired++;
          continue;
        }

        // ── 10-day reminder (only once) ────────────────────────────────────
        if (daysLeft <= 10 && !p.reminder_sent) {
          const checkoutUrl = await getStripeCheckoutUrl(p);
          const trialEndFmt = trialEnd.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
          await sendEmail(p.email, `⏰ Your V-Hub trial ends in ${daysLeft} day${daysLeft !== 1 ? 's' : ''} — ${p.business_name}`, `
            <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;background:#F5E8CC;border:2px solid #8B4513;border-radius:12px;overflow:hidden;">
              ${emailHeader(`Trial Ends in ${daysLeft} Day${daysLeft !== 1 ? 's' : ''}`)}
              <div style="padding:28px 24px;">
                <p style="font-size:16px;color:#3a1f00;margin:0 0 16px;">Hi ${p.owner_name || 'there'},</p>
                <p style="font-size:15px;color:#5A3010;margin:0 0 16px;">
                  Your V-Hub trial for <strong>${p.business_name}</strong> ends on <strong>${trialEndFmt}</strong>.
                  Lock in your listing now — set up payment and you won't be charged until your trial ends.
                </p>
                <div style="background:#fff;border-radius:10px;padding:18px;margin:20px 0;border-left:4px solid #E8431A;text-align:center;">
                  <div style="font-size:26px;font-weight:800;color:#E8431A;">$12 / month</div>
                  <div style="font-size:12px;color:#888;margin-top:4px;">No charge until ${trialEndFmt}. Cancel anytime.</div>
                </div>
                <div style="text-align:center;margin:24px 0;">
                  <a href="${checkoutUrl}" style="display:inline-block;background:#E8431A;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:700;font-size:16px;">Set Up My Billing →</a>
                </div>
                <p style="font-size:13px;color:#888;text-align:center;">Questions? <a href="mailto:admin@v-hub.us" style="color:#E8431A;">admin@v-hub.us</a></p>
              </div>
              ${emailFooter()}
            </div>
          `);
          await base44.asServiceRole.entities.Provider.update(p.id, { reminder_sent: true });
          reminders++;
        }
      }

      // ══════════════════════════════════════════════════════════════════════
      // TRIAL EXPIRED — check if 90-day grace period is up → archive
      // ══════════════════════════════════════════════════════════════════════
      if (status === 'trial_expired' && p.grace_period_end_date) {
        const graceEnd = new Date(p.grace_period_end_date);
        const daysUntilArchive = Math.ceil((graceEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (daysUntilArchive <= 0) {
          await base44.asServiceRole.entities.Provider.update(p.id, {
            subscription_status: 'archived',
            is_visible: false,
            is_active: false,
          });

          if (p.email) {
            await sendEmail(p.email, `Your V-Hub account has been archived — ${p.business_name}`, `
              <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;background:#F5E8CC;border:2px solid #8B4513;border-radius:12px;overflow:hidden;">
                ${emailHeader("📁 Your Account Has Been Archived")}
                <div style="padding:28px 24px;">
                  <p style="font-size:16px;color:#3a1f00;margin:0 0 16px;">Hi ${p.owner_name || 'there'},</p>
                  <p style="font-size:15px;color:#5A3010;margin:0 0 16px;">
                    Your V-Hub listing for <strong>${p.business_name}</strong> has been archived after the 90-day grace period.
                    Your account data is still on file — nothing is lost.
                  </p>
                  <div style="background:#f0f4ff;border-left:4px solid #1A6B5C;border-radius:8px;padding:16px;margin:16px 0;">
                    <div style="font-size:14px;font-weight:700;color:#1A6B5C;margin-bottom:6px;">Want to come back? We'd love to have you.</div>
                    <div style="font-size:13px;color:#555;line-height:1.6;">
                      Just email us at <a href="mailto:admin@v-hub.us" style="color:#E8431A;font-weight:700;">admin@v-hub.us</a> and we'll restore your listing manually.
                      Your VH number <strong>${p.vh_number || ''}</strong> is reserved for you.
                    </div>
                  </div>
                  <p style="font-size:13px;color:#888;text-align:center;margin-top:20px;">
                    Thank you for being part of V-Hub. We hope to see you again soon.
                  </p>
                </div>
                ${emailFooter()}
              </div>
            `);
          }
          archived++;
        }
      }
    }

    return Response.json({ ok: true, reminders_sent: reminders, trials_expired: expired, accounts_archived: archived });
  } catch (error) {
    console.error('trialReminder error:', error);
    return Response.json({ error: String(error) }, { status: 500 });
  }
});
