// stripeWebhook v5 — Full lifecycle: trial, subscription, classifieds one-time payment
import Stripe from "npm:stripe@14";
import { createClientFromRequest } from "npm:@base44/sdk@0.8.25";

const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY") || "";
const LOGO_URL = "https://media.base44.com/images/public/69d06ada8019d7e9edf7f8e8/a9af95bc3_V-Hublogo.png";
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
  to: string; ownerName: string; businessName: string; amount: number;
  currency: string; invoiceNumber: string; periodStart: string; periodEnd: string;
  isFirstPayment: boolean; hostedInvoiceUrl?: string;
}) {
  const { to, ownerName, businessName, amount, currency, invoiceNumber, periodStart, periodEnd, isFirstPayment, hostedInvoiceUrl } = opts;
  const formattedAmount = (amount / 100).toLocaleString("en-US", { style: "currency", currency: currency.toUpperCase() });
  const subject = isFirstPayment
    ? `V-Hub Payment Receipt - ${formattedAmount} | Trial Ended, Subscription Active`
    : `V-Hub Payment Receipt - ${formattedAmount} | Monthly Subscription Renewed`;
  const intro = isFirstPayment
    ? `Your trial period has ended and your first subscription payment has been processed. Your V-Hub listing remains <strong>active</strong>.`
    : `Your V-Hub monthly subscription has been renewed. Your listing remains <strong>active</strong>.`;
  const viewBtn = hostedInvoiceUrl
    ? `<div style="text-align:center;margin:24px 0;"><a href="${hostedInvoiceUrl}" style="background:#C9973A;color:#1A0A00;padding:12px 28px;border-radius:8px;font-weight:900;font-size:14px;text-decoration:none;">VIEW INVOICE</a></div>`
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
      </table>
    </div>
    ${viewBtn}
    <p style="color:#5A3010;font-size:14px;line-height:1.7;">Log in to your <a href="${APP_URL}/ProviderDashboard" style="color:#C9973A;">Provider Hub</a> to manage your listing.</p>
    <p style="color:#5A3010;font-size:13px;line-height:1.7;margin-top:12px;">Questions? <a href="mailto:admin@v-hub.us" style="color:#E8431A;font-weight:700;">admin@v-hub.us</a></p>`;
  await sendEmail(to, subject, emailWrapper("PAYMENT RECEIVED", body));
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
      </table>
    </div>
    <p style="color:#5A3010;font-size:14px;line-height:1.7;"><strong>Nothing is charged today.</strong> Your card will be billed on <strong>${trialEndDate}</strong> when your trial ends. Cancel anytime from your <a href="${APP_URL}/ProviderDashboard" style="color:#C9973A;">Provider Hub</a>.</p>`;
  await sendEmail(to, `V-Hub - Your Trial is Active! First charge on ${trialEndDate}`, emailWrapper("YOUR TRIAL HAS STARTED!", body));
}

async function sendPaymentFailedEmail(opts: {
  to: string; ownerName: string; businessName: string; nextRetry?: string;
}) {
  const { to, ownerName, businessName, nextRetry } = opts;
  const retryLine = nextRetry ? `<p style="color:#5A3010;font-size:14px;line-height:1.7;margin:0 0 12px;">Stripe will automatically retry on <strong>${nextRetry}</strong>. Update your payment method now to avoid interruption.</p>` : "";
  const body = `
    <p style="color:#1A0A00;font-size:17px;font-weight:700;margin:0 0 6px;">Hi ${ownerName},</p>
    <p style="color:#5A3010;font-size:15px;line-height:1.7;margin:0 0 16px;">We were unable to process your subscription payment for <strong>${businessName}</strong>. Your listing has been temporarily hidden.</p>
    ${retryLine}
    <div style="background:#FFF3E0;border:2px solid #E65100;border-radius:10px;padding:16px 20px;margin-bottom:20px;">
      <div style="font-size:13px;font-weight:900;color:#BF360C;letter-spacing:1px;margin-bottom:8px;">⚠️ ACTION REQUIRED</div>
      <p style="color:#3A1A00;font-size:14px;line-height:1.7;margin:0;">Please update your payment method to restore your listing.</p>
    </div>
    <div style="text-align:center;margin:24px 0;">
      <a href="${APP_URL}/ProviderDashboard" style="background:#E65100;color:#fff;padding:12px 28px;border-radius:8px;font-weight:900;font-size:14px;text-decoration:none;">UPDATE PAYMENT METHOD</a>
    </div>`;
  await sendEmail(to, `⚠️ V-Hub Payment Failed - ${businessName}`, emailWrapper("PAYMENT FAILED", body));
}

async function sendCancellationEmail(opts: {
  to: string; ownerName: string; businessName: string; endDate: string;
}) {
  const { to, ownerName, businessName, endDate } = opts;
  const body = `
    <p style="color:#1A0A00;font-size:17px;font-weight:700;margin:0 0 6px;">Hi ${ownerName},</p>
    <p style="color:#5A3010;font-size:15px;line-height:1.7;margin:0 0 16px;">Your V-Hub subscription for <strong>${businessName}</strong> has been cancelled. Your listing will remain active through <strong>${endDate}</strong>.</p>
    <p style="color:#5A3010;font-size:14px;line-height:1.7;">Want to reactivate? Log in to your <a href="${APP_URL}/ProviderDashboard" style="color:#C9973A;">Provider Hub</a> anytime. Questions? <a href="mailto:admin@v-hub.us" style="color:#E8431A;">admin@v-hub.us</a></p>`;
  await sendEmail(to, `V-Hub Subscription Cancelled - ${businessName}`, emailWrapper("SUBSCRIPTION CANCELLED", body));
}

async function sendClassifiedsConfirmEmail(opts: {
  to: string; ownerName: string; businessName: string;
  headline: string; expiresDate: string;
}) {
  const { to, ownerName, businessName, headline, expiresDate } = opts;
  const body = `
    <p style="color:#1A0A00;font-size:17px;font-weight:700;margin:0 0 6px;">Hi ${ownerName},</p>
    <p style="color:#5A3010;font-size:15px;line-height:1.7;margin:0 0 16px;">Your Deal of the Week ad for <strong>${businessName}</strong> is now <strong>live</strong> on V-Hub!</p>
    <div style="background:#E8F5E9;border:2px solid #2E7D32;border-radius:10px;padding:20px 24px;margin-bottom:20px;">
      <div style="font-size:13px;font-weight:900;color:#1B5E20;letter-spacing:1px;margin-bottom:10px;text-transform:uppercase;">🟢 Ad Details</div>
      <table style="width:100%;border-collapse:collapse;font-size:14px;color:#3A1A00;">
        <tr><td style="padding:5px 0;color:#2E7D32;">Business</td><td style="text-align:right;font-weight:700;">${businessName}</td></tr>
        <tr><td style="padding:5px 0;color:#2E7D32;">Headline</td><td style="text-align:right;font-weight:700;">${headline}</td></tr>
        <tr><td style="padding:5px 0;color:#2E7D32;">Amount Paid</td><td style="text-align:right;font-weight:900;color:#2E7D32;">$10.00</td></tr>
        <tr><td style="padding:5px 0;color:#2E7D32;">Runs Through</td><td style="text-align:right;font-weight:700;">${expiresDate}</td></tr>
      </table>
    </div>
    <p style="color:#5A3010;font-size:14px;line-height:1.7;">Your ad is now visible on the <a href="${APP_URL}/Classifieds" style="color:#C9973A;">Deals of the Week</a> page — searchable by village and keyword.</p>
    <p style="color:#5A3010;font-size:13px;line-height:1.7;margin-top:12px;">When your ad ends, log back in to your <a href="${APP_URL}/ProviderDashboard" style="color:#C9973A;">Provider Hub</a> to select your next ad and pay to run another week. Questions? <a href="mailto:admin@v-hub.us" style="color:#E8431A;font-weight:700;">admin@v-hub.us</a></p>`;
  await sendEmail(to, `🏷️ Your V-Hub Deal is Live! Runs through ${expiresDate}`, emailWrapper("YOUR AD IS LIVE!", body));
}

// ── Main handler ─────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, stripe-signature",
  };
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });

  const STRIPE_SECRET = Deno.env.get("STRIPE_SECRET_KEY") || "";
  const WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";
  const stripe = new Stripe(STRIPE_SECRET, { apiVersion: "2023-10-16" });
  const base44 = createClientFromRequest(req);

  const rawBody = await req.text();
  const sig = req.headers.get("stripe-signature") || "";
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(rawBody, sig, WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return new Response("Webhook Error", { status: 400 });
  }

  console.log(`📩 Stripe event: ${event.type}`);

  // ── checkout.session.completed ───────────────────────────────────────────
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    // ── ONE-TIME PAYMENT: Classifieds weekly $10 ──────────────────────────
    if (session.mode === "payment") {
      const providerRecordId = session.metadata?.provider_record_id;
      const addonType        = session.metadata?.addon_type;
      const adIdToActivate   = session.metadata?.ad_id_to_activate || "";

      if (addonType === "classifieds_weekly" && providerRecordId) {
        try {
          // Calculate 7-day window from NOW (moment of payment)
          const now     = new Date();
          const expires = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
          const expiresIso = expires.toISOString();
          const expiresStr = expires.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

          // Get provider record
          let provider: any = null;
          try { provider = await base44.asServiceRole.entities.Provider.get(providerRecordId); }
          catch (_) {
            const results = await base44.asServiceRole.entities.Provider.filter({ id: providerRecordId });
            if (results.length > 0) provider = results[0];
          }

          // Deactivate any currently active ad for this provider
          const existingActive = await base44.asServiceRole.entities.ClassifiedAd.filter({ provider_id: providerRecordId, is_active: true });
          for (const oldAd of existingActive) {
            await base44.asServiceRole.entities.ClassifiedAd.update(oldAd.id, {
              is_active: false,
              is_queued_next: false,
            });
            console.log("⬇️  Deactivated old ad:", oldAd.id, oldAd.headline);
          }

          let activatedHeadline = "";

          if (adIdToActivate) {
            // Activate the specific ad the provider chose
            const adToActivate = await base44.asServiceRole.entities.ClassifiedAd.get(adIdToActivate);
            await base44.asServiceRole.entities.ClassifiedAd.update(adIdToActivate, {
              is_active: true,
              is_queued_next: false,
              deal_expires_at: expiresIso,
            });
            activatedHeadline = adToActivate?.headline || "";
            console.log("✅ Activated specific ad:", adIdToActivate, "expires:", expiresIso);
          } else {
            // Fallback: activate the queued_next or first queued ad
            const queued = await base44.asServiceRole.entities.ClassifiedAd.filter({ provider_id: providerRecordId, is_active: false });
            const toActivate = queued.find((a: any) => a.is_queued_next) || queued[0];
            if (toActivate) {
              await base44.asServiceRole.entities.ClassifiedAd.update(toActivate.id, {
                is_active: true,
                is_queued_next: false,
                deal_expires_at: expiresIso,
              });
              activatedHeadline = toActivate.headline || "";
              console.log("✅ Activated fallback queued ad:", toActivate.id, "expires:", expiresIso);
            } else {
              // No queued ads — create a blank live shell (provider fills in content after)
              await base44.asServiceRole.entities.ClassifiedAd.create({
                provider_id: providerRecordId,
                provider_name: provider?.business_name || session.metadata?.provider_name || "Provider",
                is_active: true,
                deal_expires_at: expiresIso,
                headline: "New Deal — Coming Soon",
                body: "",
                village: provider?.address || "",
              });
              console.log("✅ Created blank live ad for provider:", providerRecordId);
            }
          }

          // Mark classifieds_addon: true on provider
          await base44.asServiceRole.entities.Provider.update(providerRecordId, {
            classifieds_addon: true,
          });

          // Send confirmation email to provider
          const providerEmail = session.customer_email || provider?.login_email || provider?.email || "";
          if (providerEmail && activatedHeadline) {
            await sendClassifiedsConfirmEmail({
              to: providerEmail,
              ownerName: provider?.owner_name || provider?.business_name || "there",
              businessName: provider?.business_name || "your business",
              headline: activatedHeadline,
              expiresDate: expiresStr,
            });
          }

          // Notify admin
          const adminEmails = ["kimberlycook1980@gmail.com"];
          for (const adminEmail of adminEmails) {
            await sendEmail(adminEmail,
              `💳 New Classifieds Payment — ${provider?.business_name || providerRecordId} ($10)`,
              emailWrapper("NEW AD PAYMENT", `
                <p style="color:#1A0A00;font-size:15px;line-height:1.7;">
                  A provider just paid $10 for a Deals of the Week ad.
                </p>
                <div style="background:#E8F5E9;border:2px solid #2E7D32;border-radius:10px;padding:16px 20px;margin-bottom:16px;">
                  <table style="width:100%;border-collapse:collapse;font-size:14px;color:#3A1A00;">
                    <tr><td style="padding:5px 0;color:#2E7D32;">Business</td><td style="text-align:right;font-weight:700;">${provider?.business_name || providerRecordId}</td></tr>
                    <tr><td style="padding:5px 0;color:#2E7D32;">Ad Headline</td><td style="text-align:right;font-weight:700;">${activatedHeadline || "(blank)"}</td></tr>
                    <tr><td style="padding:5px 0;color:#2E7D32;">Amount</td><td style="text-align:right;font-weight:900;color:#2E7D32;">$10.00</td></tr>
                    <tr><td style="padding:5px 0;color:#2E7D32;">Runs Through</td><td style="text-align:right;font-weight:700;">${expiresStr}</td></tr>
                    <tr><td style="padding:5px 0;color:#2E7D32;">Provider Email</td><td style="text-align:right;">${providerEmail}</td></tr>
                  </table>
                </div>
                <div style="text-align:center;margin:16px 0;">
                  <a href="${APP_URL}/Wekcadmin" style="background:#1B3D6F;color:#fff;padding:10px 22px;border-radius:6px;font-weight:900;font-size:13px;text-decoration:none;">View in Admin Dashboard</a>
                </div>`)
            );
          }

        } catch (err) {
          console.error("Failed to activate classifieds weekly ad:", err);
        }
      }
    }

    // ── SUBSCRIPTION CHECKOUT ─────────────────────────────────────────────
    if (session.mode === "subscription") {
      // Support both old key (provider_id) and new key (provider_record_id) for backwards compat
      const providerRecordId = session.metadata?.provider_record_id || session.metadata?.provider_id || "";
      const addonType = session.metadata?.addon_type || "";
      const subscriptionId = session.subscription as string;

      if (addonType === "classifieds" && providerRecordId) {
        try {
          await base44.asServiceRole.entities.Provider.update(providerRecordId, {
            classifieds_addon: true,
            classifieds_stripe_subscription_id: subscriptionId,
          });
        } catch (err) { console.error("Failed to activate classifieds addon:", err); }
      }

      if (!addonType || addonType === "listing") {
        try {
          const trialEnd = session.metadata?.trial_end_date;
          const trialEndDate = trialEnd
            ? new Date(trialEnd).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
            : "in 45 days";
          let provider: any = null;
          try { provider = await base44.asServiceRole.entities.Provider.get(providerRecordId); }
          catch (_) {}
          if (!provider) {
            const results = await base44.asServiceRole.entities.Provider.filter({ id: providerRecordId });
            if (results.length > 0) provider = results[0];
          }
          await base44.asServiceRole.entities.Provider.update(providerRecordId, {
            stripe_subscription_id: subscriptionId,
            subscription_status: "trial",
            is_active: true,
            is_visible: true,
          });
          const providerEmail = provider?.login_email || provider?.email || session.customer_email || "";
          if (providerEmail) {
            await sendTrialStartEmail({
              to: providerEmail,
              ownerName: provider?.owner_name || provider?.business_name || "there",
              businessName: provider?.business_name || "your business",
              trialEndDate,
            });
          }
        } catch (err) { console.error("Failed to handle subscription checkout:", err); }
      }
    }
  }

  // ── invoice.payment_succeeded ────────────────────────────────────────────
  if (event.type === "invoice.payment_succeeded") {
    const invoice = event.data.object as Stripe.Invoice;
    const subscriptionId = invoice.subscription as string;
    const customerId = invoice.customer as string;
    if (!subscriptionId) return new Response("ok", { status: 200 });

    const periodStart = formatDate(invoice.period_start);
    const periodEnd   = formatDate(invoice.period_end);
    // Only send receipt when money was actually charged (skip $0 trial-start invoices)
    if (invoice.amount_paid === 0) return new Response("ok", { status: 200 });
    const isFirstPayment = invoice.billing_reason === "subscription_cycle";

    try {
      let provider: any = null;
      const results = await base44.asServiceRole.entities.Provider.filter({ stripe_subscription_id: subscriptionId });
      if (results.length > 0) provider = results[0];
      if (!provider) {
        const byCustomer = await base44.asServiceRole.entities.Provider.filter({ stripe_customer_id: customerId });
        if (byCustomer.length > 0) provider = byCustomer[0];
      }
      if (!provider) { console.log("No provider found for subscription:", subscriptionId); return new Response("ok", { status: 200 }); }

      await base44.asServiceRole.entities.Provider.update(provider.id, {
        subscription_status: "active",
        is_active: true,
        is_visible: true,
        stripe_customer_id: customerId,
      });

      const providerEmail = provider?.login_email || provider?.email || "";
      if (providerEmail) {
        await sendReceiptEmail({
          to: providerEmail,
          ownerName: provider?.owner_name || provider?.business_name || "there",
          businessName: provider?.business_name || "your business",
          amount: invoice.amount_paid,
          currency: invoice.currency,
          invoiceNumber: invoice.number || invoice.id,
          periodStart, periodEnd,
          isFirstPayment,
          hostedInvoiceUrl: invoice.hosted_invoice_url || undefined,
        });
      }
    } catch (err) { console.error("Error handling invoice.payment_succeeded:", err); }
  }

  // ── invoice.payment_failed ────────────────────────────────────────────────
  if (event.type === "invoice.payment_failed") {
    const invoice = event.data.object as Stripe.Invoice;
    const subscriptionId = invoice.subscription as string;
    if (!subscriptionId) return new Response("ok", { status: 200 });
    const nextRetry = (invoice as any).next_payment_attempt
      ? new Date((invoice as any).next_payment_attempt * 1000).toLocaleDateString("en-US", { month: "long", day: "numeric" })
      : undefined;
    try {
      const results = await base44.asServiceRole.entities.Provider.filter({ stripe_subscription_id: subscriptionId });
      if (results.length === 0) return new Response("ok", { status: 200 });
      const provider = results[0];
      await base44.asServiceRole.entities.Provider.update(provider.id, { is_visible: false });
      const providerEmail = provider?.login_email || provider?.email || "";
      if (providerEmail) {
        await sendPaymentFailedEmail({
          to: providerEmail,
          ownerName: provider?.owner_name || provider?.business_name || "there",
          businessName: provider?.business_name || "your business",
          nextRetry,
        });
      }
    } catch (err) { console.error("Error handling invoice.payment_failed:", err); }
  }

  // ── customer.subscription.deleted ────────────────────────────────────────
  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    const subscriptionId = subscription.id;
    const endDate = formatDate(subscription.current_period_end);
    try {
      const results = await base44.asServiceRole.entities.Provider.filter({ stripe_subscription_id: subscriptionId });
      if (results.length === 0) return new Response("ok", { status: 200 });
      const provider = results[0];
      await base44.asServiceRole.entities.Provider.update(provider.id, {
        subscription_status: "cancelled",
        is_active: false,
        is_visible: false,
      });
      const providerEmail = provider?.login_email || provider?.email || "";
      if (providerEmail) {
        await sendCancellationEmail({
          to: providerEmail,
          ownerName: provider?.owner_name || provider?.business_name || "there",
          businessName: provider?.business_name || "your business",
          endDate,
        });
      }
    } catch (err) { console.error("Error handling subscription.deleted:", err); }
  }

  // ── customer.subscription.trial_will_end ────────────────────────────────
  if (event.type === "customer.subscription.trial_will_end") {
    const subscription = event.data.object as Stripe.Subscription;
    const trialEnd = formatDate(subscription.trial_end!);
    const subscriptionId = subscription.id;
    try {
      const results = await base44.asServiceRole.entities.Provider.filter({ stripe_subscription_id: subscriptionId });
      if (results.length === 0) return new Response("ok", { status: 200 });
      const provider = results[0];
      const providerEmail = provider?.login_email || provider?.email || "";
      if (providerEmail) {
        await sendEmail(providerEmail,
          `⏰ V-Hub Trial Ending Soon — ${provider.business_name}`,
          emailWrapper("TRIAL ENDING SOON", `
            <p style="color:#1A0A00;font-size:17px;font-weight:700;margin:0 0 6px;">Hi ${provider.owner_name || "there"},</p>
            <p style="color:#5A3010;font-size:15px;line-height:1.7;margin:0 0 16px;">Your V-Hub free trial for <strong>${provider.business_name}</strong> ends on <strong>${trialEnd}</strong>. Your card on file will be automatically billed $12/month to keep your listing active.</p>
            <p style="color:#5A3010;font-size:14px;line-height:1.7;">To cancel before being charged, visit your <a href="${APP_URL}/ProviderDashboard" style="color:#C9973A;">Provider Hub</a>. Questions? <a href="mailto:admin@v-hub.us" style="color:#E8431A;">admin@v-hub.us</a></p>`)
        );
      }
    } catch (err) { console.error("Error handling trial_will_end:", err); }
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
