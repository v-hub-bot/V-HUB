// stripeWebhook v4 — Full lifecycle: trial start, payment receipt, payment failed, cancellation confirm
import Stripe from "npm:stripe@14";
import { createClientFromRequest } from "npm:@base44/sdk@0.8.25";

const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY") || "";
const LOGO_URL = "https://media.base44.com/images/public/69d062aca815ce8e697894b1/a9af95bc3_V-Hublogo.png";
const APP_URL = "https://www.v-hub.us";

// ── Email helpers ────────────────────────────────────────────────────────────

function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });
}

async function sendEmail(to: string, subject: string, html: string) {
  if (!SENDGRID_API_KEY) { console.error("No SendGrid key — skipping email"); return; }
  const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: { Authorization: `Bearer ${SENDGRID_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: "admin@v-hub.us", name: "V-Hub" },
      subject,
      content: [{ type: "text/html", value: html }],
    }),
  });
  if (!res.ok) console.error("SendGrid error:", await res.text());
  else console.log(`✅ Email sent to ${to} — ${subject}`);
}

function emailWrapper(headerLine: string, body: string): string {
  return `
    <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;background:#F5E8CC;border:2px solid #8B4513;border-radius:12px;overflow:hidden;">
      <div style="background:#1A0A00;padding:24px;text-align:center;">
        <img src="${LOGO_URL}" style="height:60px;border-radius:10px;margin-bottom:10px;"/>
        <div style="color:#F5E8CC;font-size:20px;font-weight:900;letter-spacing:2px;">${headerLine}</div>
        <div style="color:#C9973A;font-size:13px;margin-top:6px;font-style:italic;">V-Hub · The Villages, FL</div>
      </div>
      <div style="padding:28px 24px;">${body}</div>
      <div style="background:#3A1A00;padding:16px;text-align:center;">
        <p style="color:#C9973A;font-size:12px;margin:0;">© 2026 V-Hub · The Villages, Florida · All Rights Reserved</p>
        <p style="color:#8B7355;font-size:11px;margin:6px 0 0;">V-Hub is not affiliated with The Villages® or its affiliates.</p>
      </div>
    </div>`;
}

async function sendReceiptEmail(opts: {
  to: string;
  ownerName: string;
  businessName: string;
  amount: number;
  currency: string;
  invoiceNumber: string;
  periodStart: string;
  periodEnd: string;
  isFirstPayment: boolean;
  hostedInvoiceUrl?: string;
}) {
  const { to, ownerName, businessName, amount, currency, invoiceNumber, periodStart, periodEnd, isFirstPayment, hostedInvoiceUrl } = opts;
  const formattedAmount = (amount / 100).toLocaleString("en-US", { style: "currency", currency: currency.toUpperCase() });
  const subject = isFirstPayment
    ? `V-Hub Payment Receipt — ${formattedAmount} · Your Trial Has Ended, Subscription Active`
    : `V-Hub Payment Receipt — ${formattedAmount} · Monthly Subscription Renewed`;
  const intro = isFirstPayment
    ? `Your trial period has ended and your first subscription payment has been processed. Your V-Hub listing remains <strong>active</strong> and visible to residents across The Villages.`
    : `Your V-Hub monthly subscription has been renewed successfully. Your listing remains <strong>active</strong>.`;

  const viewBtn = hostedInvoiceUrl
    ? `<div style="text-align:center;margin:24px 0;"><a href="${hostedInvoiceUrl}" style="background:#C9973A;color:#1A0A00;padding:12px 28px;border-radius:8px;font-weight:900;font-size:14px;text-decoration:none;letter-spacing:1px;">VIEW INVOICE</a></div>`
    : "";

  const body = `
    <p style="color:#1A0A00;font-size:17px;font-weight:700;margin:0 0 6px;">Hi ${ownerName},</p>
    <p style="color:#5A3010;font-size:15px;line-height:1.7;margin:0 0 20px;">${intro}</p>
    <div style="background:#fff8ee;border:1px solid #C9973A;border-radius:10px;padding:20px 24px;margin-bottom:20px;">
      <div style="font-size:13px;font-weight:900;color:#8B4513;letter-spacing:1px;margin-bottom:14px;text-transform:uppercase;">Payment Summary</div>
      <table style="width:100%;border-collapse:collapse;font-size:14px;color:#3A1A00;">
        <tr><td style="padding:5px 0;color:#7B5230;">Business</td><td style="text-align:right;font-weight:700;">${businessName}</td></tr>
        <tr><td style="padding:5px 0;color:#7B5230;">Amount Paid</td><td style="text-align:right;font-weight:900;font-size:18px;color:#2E7D32;">${formattedAmount}</td></tr>
        <tr><td style="padding:5px 0;color:#7B5230;">Invoice #</td><td style="text-align:right;font-family:'Courier New',monospace;">${invoiceNumber}</td></tr>
        <tr><td style="padding:5px 0;color:#7B5230;">Billing Period</td><td style="text-align:right;">${periodStart} – ${periodEnd}</td></tr>
        <tr><td style="padding:5px 0;color:#7B5230;">Subscription</td><td style="text-align:right;">V-Hub Basic Listing · Monthly</td></tr>
      </table>
    </div>
    ${viewBtn}
    <p style="color:#5A3010;font-size:14px;line-height:1.7;">Log in to your <a href="${APP_URL}/ProviderDashboard" style="color:#C9973A;">Provider Hub</a> anytime to update your profile, view stats, and manage your subscription.</p>
    <p style="color:#5A3010;font-size:13px;line-height:1.7;margin-top:12px;">Questions? Contact us at <a href="mailto:admin@v-hub.us" style="color:#C9973A;">admin@v-hub.us</a></p>`;

  await sendEmail(to, subject, emailWrapper("✅ PAYMENT RECEIVED", body));
}

async function sendTrialStartEmail(opts: {
  to: string; ownerName: string; businessName: string; trialEndDate: string;
}) {
  const { to, ownerName, businessName, trialEndDate } = opts;
  const body = `
    <p style="color:#1A0A00;font-size:17px;font-weight:700;margin:0 0 6px;">Hi ${ownerName},</p>
    <p style="color:#5A3010;font-size:15px;line-height:1.7;margin:0 0 20px;">Your V-Hub listing for <strong>${businessName}</strong> is now <strong>live</strong> and your billing information has been securely saved.</p>
    <div style="background:#fff8ee;border:1px solid #C9973A;border-radius:10px;padding:20px 24px;margin-bottom:20px;">
      <div style="font-size:13px;font-weight:900;color:#8B4513;letter-spacing:1px;margin-bottom:14px;text-transform:uppercase;">Trial Details</div>
      <table style="width:100%;border-collapse:collapse;font-size:14px;color:#3A1A00;">
        <tr><td style="padding:5px 0;color:#7B5230;">Amount Due Today</td><td style="text-align:right;font-weight:900;font-size:18px;color:#2E7D32;">$0.00</td></tr>
        <tr><td style="padding:5px 0;color:#7B5230;">Trial Ends</td><td style="text-align:right;font-weight:700;">${trialEndDate}</td></tr>
        <tr><td style="padding:5px 0;color:#7B5230;">After Trial</td><td style="text-align:right;">$12 / month</td></tr>
        <tr><td style="padding:5px 0;color:#7B5230;">Subscription</td><td style="text-align:right;">V-Hub Basic Listing · Monthly</td></tr>
      </table>
    </div>
    <p style="color:#5A3010;font-size:14px;line-height:1.7;"><strong>Nothing is charged today.</strong> Your card will be automatically billed on <strong>${trialEndDate}</strong> when your trial period ends. You can cancel anytime before that date from your <a href="${APP_URL}/ProviderDashboard" style="color:#C9973A;">Provider Hub</a>.</p>
    <p style="color:#5A3010;font-size:13px;line-height:1.7;margin-top:12px;">Questions? Contact us at <a href="mailto:admin@v-hub.us" style="color:#C9973A;">admin@v-hub.us</a></p>`;
  await sendEmail(to, `V-Hub — Your Trial is Active! First charge on ${trialEndDate}`, emailWrapper("🎉 YOUR TRIAL HAS STARTED!", body));
}

async function sendPaymentFailedEmail(opts: {
  to: string; ownerName: string; businessName: string; nextRetry?: string;
}) {
  const { to, ownerName, businessName, nextRetry } = opts;
  const retryLine = nextRetry ? `<p style="color:#5A3010;font-size:14px;line-height:1.7;margin:0 0 12px;">Stripe will automatically retry the charge on <strong>${nextRetry}</strong>. You can also update your payment method now to avoid any interruption.</p>` : "";
  const body = `
    <p style="color:#1A0A00;font-size:17px;font-weight:700;margin:0 0 6px;">Hi ${ownerName},</p>
    <p style="color:#5A3010;font-size:15px;line-height:1.7;margin:0 0 16px;">We were unable to process your monthly subscription payment for <strong>${businessName}</strong>. Your listing has been temporarily hidden from search results.</p>
    ${retryLine}
    <div style="background:#FFF3E0;border:2px solid #E65100;border-radius:10px;padding:16px 20px;margin-bottom:20px;">
      <div style="font-size:13px;font-weight:900;color:#BF360C;letter-spacing:1px;margin-bottom:8px;">⚠️ ACTION REQUIRED</div>
      <p style="color:#3A1A00;font-size:14px;line-height:1.7;margin:0;">Please update your payment method to restore your listing. If payment is not resolved, your listing will remain hidden.</p>
    </div>
    <div style="text-align:center;margin:24px 0;">
      <a href="${APP_URL}/ProviderDashboard" style="background:#C62828;color:#fff;padding:14px 32px;border-radius:8px;font-weight:900;font-size:14px;text-decoration:none;letter-spacing:1px;">UPDATE BILLING INFO →</a>
    </div>
    <p style="color:#5A3010;font-size:13px;line-height:1.7;margin-top:12px;">Questions? Contact us at <a href="mailto:admin@v-hub.us" style="color:#C9973A;">admin@v-hub.us</a></p>`;
  await sendEmail(to, `⚠️ V-Hub — Payment Failed · Action Required for ${businessName}`, emailWrapper("⚠️ PAYMENT FAILED", body));
}

async function sendCancellationEmail(opts: {
  to: string; ownerName: string; businessName: string; accessUntil: string;
}) {
  const { to, ownerName, businessName, accessUntil } = opts;
  const body = `
    <p style="color:#1A0A00;font-size:17px;font-weight:700;margin:0 0 6px;">Hi ${ownerName},</p>
    <p style="color:#5A3010;font-size:15px;line-height:1.7;margin:0 0 16px;">Your V-Hub subscription for <strong>${businessName}</strong> has been cancelled. We're sorry to see you go!</p>
    <div style="background:#fff8ee;border:1px solid #C9973A;border-radius:10px;padding:20px 24px;margin-bottom:20px;">
      <div style="font-size:13px;font-weight:900;color:#8B4513;letter-spacing:1px;margin-bottom:14px;text-transform:uppercase;">Cancellation Summary</div>
      <table style="width:100%;border-collapse:collapse;font-size:14px;color:#3A1A00;">
        <tr><td style="padding:5px 0;color:#7B5230;">Business</td><td style="text-align:right;font-weight:700;">${businessName}</td></tr>
        <tr><td style="padding:5px 0;color:#7B5230;">Listing Active Until</td><td style="text-align:right;font-weight:700;color:#2E7D32;">${accessUntil}</td></tr>
        <tr><td style="padding:5px 0;color:#7B5230;">Future Charges</td><td style="text-align:right;color:#2E7D32;font-weight:700;">None</td></tr>
      </table>
    </div>
    <p style="color:#5A3010;font-size:14px;line-height:1.7;">Your listing will remain visible to residents until <strong>${accessUntil}</strong>, then it will be removed. No further charges will be made.</p>
    <p style="color:#5A3010;font-size:14px;line-height:1.7;margin-top:12px;">Changed your mind? You can reactivate your listing anytime from your <a href="${APP_URL}/ProviderDashboard" style="color:#C9973A;">Provider Hub</a> — $12/month, no contracts.</p>
    <p style="color:#5A3010;font-size:13px;line-height:1.7;margin-top:12px;">Questions? Contact us at <a href="mailto:admin@v-hub.us" style="color:#C9973A;">admin@v-hub.us</a></p>`;
  await sendEmail(to, `V-Hub — Subscription Cancelled · ${businessName}`, emailWrapper("🔔 SUBSCRIPTION CANCELLED", body));
}

async function sendTrialEndingEmail(opts: {
  to: string; ownerName: string; businessName: string; trialEndDate: string; daysLeft: number;
}) {
  const { to, ownerName, businessName, trialEndDate, daysLeft } = opts;
  const body = `
    <p style="color:#1A0A00;font-size:17px;font-weight:700;margin:0 0 6px;">Hi ${ownerName},</p>
    <p style="color:#5A3010;font-size:15px;line-height:1.7;margin:0 0 16px;">Just a heads-up — your V-Hub free trial for <strong>${businessName}</strong> ends in <strong>${daysLeft} day${daysLeft !== 1 ? "s" : ""}</strong> on <strong>${trialEndDate}</strong>.</p>
    <div style="background:#fff8ee;border:1px solid #C9973A;border-radius:10px;padding:20px 24px;margin-bottom:20px;">
      <div style="font-size:13px;font-weight:900;color:#8B4513;letter-spacing:1px;margin-bottom:14px;text-transform:uppercase;">What Happens Next</div>
      <table style="width:100%;border-collapse:collapse;font-size:14px;color:#3A1A00;">
        <tr><td style="padding:5px 0;color:#7B5230;">Trial Ends</td><td style="text-align:right;font-weight:700;">${trialEndDate}</td></tr>
        <tr><td style="padding:5px 0;color:#7B5230;">Monthly Rate</td><td style="text-align:right;font-weight:700;">$12.00 / month</td></tr>
        <tr><td style="padding:5px 0;color:#7B5230;">Your Card</td><td style="text-align:right;">Charged automatically on ${trialEndDate}</td></tr>
      </table>
    </div>
    <p style="color:#5A3010;font-size:14px;line-height:1.7;">If you'd like to continue, <strong>no action is needed</strong> — your subscription will automatically begin on ${trialEndDate}.</p>
    <p style="color:#5A3010;font-size:14px;line-height:1.7;margin-top:8px;">Want to cancel before being charged? Visit your <a href="${APP_URL}/ProviderDashboard" style="color:#C9973A;">Provider Hub</a> and click <strong>"Cancel My Subscription"</strong>.</p>
    <p style="color:#5A3010;font-size:13px;line-height:1.7;margin-top:12px;">Questions? Contact us at <a href="mailto:admin@v-hub.us" style="color:#C9973A;">admin@v-hub.us</a></p>`;
  await sendEmail(to, `V-Hub — Your Trial Ends in ${daysLeft} Day${daysLeft !== 1 ? "s" : ""} · ${businessName}`, emailWrapper("⏰ TRIAL ENDING SOON", body));
}

// ── Main webhook handler ─────────────────────────────────────────────────────

Deno.serve(async (req: Request): Promise<Response> => {
  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2023-10-16" });
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const base44 = createClientFromRequest(req);

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, sig!, webhookSecret!);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return new Response(`Webhook signature verification failed: ${err}`, { status: 400 });
  }

  console.log(`Stripe event: ${event.type}`);

  // ── checkout.session.completed ───────────────────────────────────────────
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    // ── One-time payment (classifieds weekly $10) ──────────────────────
    if (session.mode === "payment") {
      const providerRecordId = session.metadata?.provider_record_id;
      const addonType = session.metadata?.addon_type;
      const adExpires = session.metadata?.ad_expires;

      if (addonType === "classifieds_weekly" && providerRecordId) {
        try {
          const expires = adExpires ? new Date(adExpires).toISOString() : new Date(Date.now() + 7 * 86400000).toISOString();

          await base44.asServiceRole.entities.Provider.update(providerRecordId, {
            classifieds_addon: true,
          });

          let provider: any = null;
          try {
            provider = await base44.asServiceRole.entities.Provider.get(providerRecordId);
          } catch (_) {
            const results = await base44.asServiceRole.entities.Provider.filter({ id: providerRecordId });
            if (results.length > 0) provider = results[0];
          }

          const existingAds = await base44.asServiceRole.entities.ClassifiedAd.filter({ provider_id: providerRecordId, is_active: true });

          if (existingAds.length > 0) {
            await base44.asServiceRole.entities.ClassifiedAd.update(existingAds[0].id, {
              next_deal_expires_at: expires,
            });
            console.log("✅ Queued next classifieds ad for:", providerRecordId, "expires:", expires);
          } else {
            await base44.asServiceRole.entities.ClassifiedAd.create({
              provider_id: providerRecordId,
              provider_name: provider?.business_name || session.metadata?.provider_name || "Unknown",
              is_active: true,
              deal_expires_at: expires,
              headline: "",
              body: "",
              village: "",
              address: "",
            });
            console.log("✅ ClassifiedAd created for:", providerRecordId, "expires:", expires);
          }
        } catch (err) {
          console.error("Failed to activate classifieds weekly addon:", err);
        }
      }
    }

    // ── Subscription checkout ─────────────────────────────────────────────
    if (session.mode === "subscription") {
      const subscriptionId = session.subscription as string;
      const providerRecordId = session.metadata?.provider_record_id || session.metadata?.provider_id;
      const addonType = session.metadata?.addon_type || "";

      // Classifieds addon (old monthly flow — kept for backwards compat)
      if (addonType === "classifieds" && providerRecordId) {
        try {
          await base44.asServiceRole.entities.Provider.update(providerRecordId, {
            classifieds_addon: true,
            classifieds_stripe_subscription_id: subscriptionId,
          });
          console.log("✅ Classifieds addon activated for:", providerRecordId);
        } catch (err) {
          console.error("Failed to activate classifieds addon:", err);
        }
      }

      // ── Main subscription checkout ──────────────────────────────────
      else if (providerRecordId) {
        let provider: any = null;
        try {
          provider = await base44.asServiceRole.entities.Provider.get(providerRecordId);
        } catch (_) {
          const results = await base44.asServiceRole.entities.Provider.filter({ provider_id: providerRecordId });
          if (results.length > 0) provider = results[0];
        }

        if (provider) {
          let hasTrial = false;
          let trialEndUnix: number | null = null;
          try {
            const sub = await stripe.subscriptions.retrieve(subscriptionId);
            if (sub.trial_end && sub.trial_end > Math.floor(Date.now() / 1000)) {
              hasTrial = true;
              trialEndUnix = sub.trial_end;
            }
          } catch (subErr) {
            console.warn("Could not retrieve subscription for trial check:", subErr);
          }

          await base44.asServiceRole.entities.Provider.update(provider.id, {
            subscription_status: hasTrial ? "trial" : "active",
            subscription_tier: provider.subscription_tier || "basic",
            is_visible: true,
            is_active: true,
            stripe_subscription_id: subscriptionId,
            stripe_customer_id: session.customer as string,
            ...(trialEndUnix ? {
              trial_end_date: new Date(trialEndUnix * 1000).toISOString().split("T")[0],
            } : {}),
          });
          console.log(`Provider updated: ${provider.id} | hasTrial=${hasTrial}`);

          const email = session.customer_email || provider.email || provider.login_email || "";
          const ownerName = session.metadata?.provider_name || provider.owner_name || "Provider";
          const bizName = session.metadata?.business_name || provider.business_name || "";

          if (email) {
            if (hasTrial && trialEndUnix) {
              const trialEndDate = new Date(trialEndUnix * 1000).toLocaleDateString("en-US", {
                weekday: "long", month: "long", day: "numeric", year: "numeric",
              });
              await sendTrialStartEmail({ to: email, ownerName, businessName: bizName, trialEndDate });
            } else {
              try {
                const sub = await stripe.subscriptions.retrieve(subscriptionId, { expand: ["latest_invoice"] });
                const invoice = sub.latest_invoice as Stripe.Invoice | null;
                if (invoice && (invoice.amount_paid ?? 0) > 0) {
                  await sendReceiptEmail({
                    to: email, ownerName, businessName: bizName,
                    amount: invoice.amount_paid ?? invoice.total ?? 0,
                    currency: invoice.currency ?? "usd",
                    invoiceNumber: invoice.number ?? invoice.id ?? "N/A",
                    periodStart: invoice.period_start ? formatDate(invoice.period_start) : "",
                    periodEnd: invoice.period_end ? formatDate(invoice.period_end) : "",
                    isFirstPayment: true,
                    hostedInvoiceUrl: invoice.hosted_invoice_url ?? undefined,
                  });
                }
              } catch (invErr) {
                console.error("Invoice fetch error:", invErr);
              }
            }
          }
        } else {
          console.error("Provider not found for checkout session:", providerRecordId);
        }
      }
    }
  }

  // ── invoice.payment_succeeded ────────────────────────────────────────────
  if (event.type === "invoice.payment_succeeded") {
    const invoice = event.data.object as Stripe.Invoice;
    const subId = invoice.subscription as string;
    const billingReason = invoice.billing_reason;
    const amountPaid = invoice.amount_paid ?? invoice.total ?? 0;

    console.log(`invoice.payment_succeeded | billing_reason=${billingReason} | amount=${amountPaid}`);

    if (subId) {
      let provider: any = null;
      try {
        const providers = await base44.asServiceRole.entities.Provider.filter({ stripe_subscription_id: subId });
        if (providers.length > 0) provider = providers[0];
      } catch (e) {
        console.error("Error finding provider:", e);
      }

      // Re-activate if past_due
      if (provider && provider.subscription_status === "past_due" && amountPaid > 0) {
        await base44.asServiceRole.entities.Provider.update(provider.id, {
          subscription_status: "active",
          is_visible: true,
          is_active: true,
        });
        console.log("Provider re-activated after payment:", provider.id);
      }

      const isRealCharge = amountPaid > 0;
      const isTrialSetup = billingReason === "subscription_create" && amountPaid === 0;

      if (isRealCharge && !isTrialSetup) {
        const email = invoice.customer_email || provider?.email || provider?.login_email || "";
        const ownerName = provider?.owner_name || "Provider";
        const bizName = provider?.business_name || "";
        const isFirstPayment = billingReason === "subscription_create" ||
          (billingReason === "subscription_cycle" && provider?.subscription_status === "trial");

        // Move from trial → active when first real charge fires
        if (provider && provider.subscription_status === "trial") {
          await base44.asServiceRole.entities.Provider.update(provider.id, {
            subscription_status: "active",
          });
          console.log("Provider moved from trial to active:", provider.id);
        }

        if (email) {
          await sendReceiptEmail({
            to: email, ownerName, businessName: bizName,
            amount: amountPaid,
            currency: invoice.currency ?? "usd",
            invoiceNumber: invoice.number ?? invoice.id ?? "N/A",
            periodStart: invoice.period_start ? formatDate(invoice.period_start) : "",
            periodEnd: invoice.period_end ? formatDate(invoice.period_end) : "",
            isFirstPayment,
            hostedInvoiceUrl: invoice.hosted_invoice_url ?? undefined,
          });
        } else {
          console.warn("No email for receipt — subscription:", subId);
        }
      } else {
        console.log(`Skipping receipt: billing_reason=${billingReason}, amount=${amountPaid} (trial $0 setup)`);
      }
    }
  }

  // ── invoice.payment_failed ───────────────────────────────────────────────
  // Fires when Stripe cannot charge the card. Mark past_due + email provider.
  if (event.type === "invoice.payment_failed") {
    const invoice = event.data.object as Stripe.Invoice;
    const subId = invoice.subscription as string;
    if (subId) {
      try {
        const providers = await base44.asServiceRole.entities.Provider.filter({ stripe_subscription_id: subId });
        if (providers.length > 0) {
          const provider = providers[0];
          await base44.asServiceRole.entities.Provider.update(provider.id, {
            subscription_status: "past_due",
            is_visible: false,
            is_active: false,
          });
          console.log("Provider marked past_due + hidden:", provider.id);

          // Send payment failed email
          const email = invoice.customer_email || provider.email || provider.login_email || "";
          if (email) {
            // Stripe retries — calculate next retry date if available
            let nextRetry: string | undefined;
            try {
              const sub = await stripe.subscriptions.retrieve(subId);
              const retryTs = (sub as any).next_pending_invoice_item_invoice;
              if (retryTs) nextRetry = new Date(retryTs * 1000).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
            } catch (_) { /* non-fatal */ }

            await sendPaymentFailedEmail({
              to: email,
              ownerName: provider.owner_name || "Provider",
              businessName: provider.business_name || "",
              nextRetry,
            });
          }
        }
      } catch (e) {
        console.error("Error handling payment_failed:", e);
      }
    }
  }

  // ── customer.subscription.deleted ───────────────────────────────────────
  // Fires when subscription is fully ended (after cancel_at_period_end date passes).
  // At this point, listing should be completely deactivated.
  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription;
    try {
      const providers = await base44.asServiceRole.entities.Provider.filter({ stripe_subscription_id: sub.id });
      if (providers.length > 0) {
        const provider = providers[0];
        await base44.asServiceRole.entities.Provider.update(provider.id, {
          subscription_status: "cancelled",
          is_visible: false,
          is_active: false,
        });
        console.log("Provider deactivated on subscription delete:", provider.id);

        // NOTE: We do NOT send a cancellation email here — that's sent by cancelSubscription.ts
        // when the provider clicks "Cancel My Subscription" in the dashboard.
        // This event fires later when the period actually ends — no need to email again.
      }
    } catch (e) {
      console.error("Error handling subscription.deleted:", e);
    }
  }

  // ── customer.subscription.trial_will_end ────────────────────────────────
  // Fires exactly 3 days before trial ends — send a reminder email.
  if (event.type === "customer.subscription.trial_will_end") {
    const sub = event.data.object as Stripe.Subscription;
    console.log(`Trial ending soon for subscription: ${sub.id} | trial_end=${sub.trial_end}`);

    try {
      const providers = await base44.asServiceRole.entities.Provider.filter({ stripe_subscription_id: sub.id });
      if (providers.length > 0) {
        const provider = providers[0];
        const email = provider.email || provider.login_email || "";
        if (email && sub.trial_end) {
          const trialEndDate = new Date(sub.trial_end * 1000).toLocaleDateString("en-US", {
            weekday: "long", month: "long", day: "numeric", year: "numeric",
          });
          const msLeft = sub.trial_end * 1000 - Date.now();
          const daysLeft = Math.max(1, Math.ceil(msLeft / 86400000));
          await sendTrialEndingEmail({
            to: email,
            ownerName: provider.owner_name || "Provider",
            businessName: provider.business_name || "",
            trialEndDate,
            daysLeft,
          });
          console.log(`✅ Trial-ending reminder sent to ${email} (${daysLeft} days left)`);
        }
      }
    } catch (e) {
      console.error("Error handling trial_will_end:", e);
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
