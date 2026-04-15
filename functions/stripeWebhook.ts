// stripeWebhook v3 — Trial-aware: no receipt on $0 trial setup, full receipt on first real charge & renewals
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

async function sendReceiptEmail(opts: {
  to: string;
  ownerName: string;
  businessName: string;
  amount: number;        // in cents
  currency: string;
  invoiceNumber: string;
  periodStart: string;
  periodEnd: string;
  isFirstPayment: boolean;
  hostedInvoiceUrl?: string;
}) {
  if (!SENDGRID_API_KEY) { console.error("No SendGrid key — skipping receipt"); return; }

  const { to, ownerName, businessName, amount, currency, invoiceNumber, periodStart, periodEnd, isFirstPayment, hostedInvoiceUrl } = opts;
  const formattedAmount = (amount / 100).toLocaleString("en-US", { style: "currency", currency: currency.toUpperCase() });
  const subject = isFirstPayment
    ? `V-Hub Payment Receipt — ${formattedAmount} · Your Trial Has Ended, Subscription Active`
    : `V-Hub Payment Receipt — ${formattedAmount} · Monthly Subscription Renewed`;
  const intro = isFirstPayment
    ? `Your free trial has ended and your first subscription payment has been processed. Your V-Hub listing remains <strong>active</strong> and visible to residents across The Villages.`
    : `Your V-Hub monthly subscription has been renewed successfully. Your listing remains <strong>active</strong>.`;

  const viewBtn = hostedInvoiceUrl
    ? `<div style="text-align:center;margin:24px 0;">
        <a href="${hostedInvoiceUrl}" style="background:#C9973A;color:#1A0A00;padding:12px 28px;border-radius:8px;font-weight:900;font-size:14px;text-decoration:none;letter-spacing:1px;">VIEW INVOICE</a>
      </div>`
    : "";

  const html = `
    <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;background:#F5E8CC;border:2px solid #8B4513;border-radius:12px;overflow:hidden;">
      <div style="background:#1A0A00;padding:24px;text-align:center;">
        <img src="${LOGO_URL}" style="height:60px;border-radius:10px;margin-bottom:10px;"/>
        <div style="color:#F5E8CC;font-size:20px;font-weight:900;letter-spacing:2px;">✅ PAYMENT RECEIVED</div>
        <div style="color:#C9973A;font-size:13px;margin-top:6px;font-style:italic;">V-Hub · The Villages, FL</div>
      </div>
      <div style="padding:28px 24px;">
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
        <p style="color:#5A3010;font-size:14px;line-height:1.7;">
          Log in to your <a href="${APP_URL}/ProviderDashboard" style="color:#C9973A;">Provider Hub</a> anytime to update your profile, view stats, and manage your subscription.
        </p>
        <p style="color:#5A3010;font-size:13px;line-height:1.7;margin-top:12px;">
          Questions? Contact us at <a href="mailto:admin@v-hub.us" style="color:#C9973A;">admin@v-hub.us</a>
        </p>
      </div>
      <div style="background:#3A1A00;padding:16px;text-align:center;">
        <p style="color:#C9973A;font-size:12px;margin:0;">© 2026 V-Hub · The Villages, Florida · All Rights Reserved</p>
        <p style="color:#8B7355;font-size:11px;margin:6px 0 0;">V-Hub is not affiliated with The Villages® or its affiliates.</p>
      </div>
    </div>
  `;

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

  if (!res.ok) {
    console.error("SendGrid receipt error:", await res.text());
  } else {
    console.log(`✅ Receipt email sent to ${to}`);
  }
}

async function sendTrialStartEmail(opts: {
  to: string;
  ownerName: string;
  businessName: string;
  trialEndDate: string;   // human-readable
}) {
  if (!SENDGRID_API_KEY) return;
  const { to, ownerName, businessName, trialEndDate } = opts;

  const html = `
    <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;background:#F5E8CC;border:2px solid #8B4513;border-radius:12px;overflow:hidden;">
      <div style="background:#1A0A00;padding:24px;text-align:center;">
        <img src="${LOGO_URL}" style="height:60px;border-radius:10px;margin-bottom:10px;"/>
        <div style="color:#F5E8CC;font-size:20px;font-weight:900;letter-spacing:2px;">🎉 YOUR FREE TRIAL HAS STARTED!</div>
        <div style="color:#C9973A;font-size:13px;margin-top:6px;font-style:italic;">V-Hub · The Villages, FL</div>
      </div>
      <div style="padding:28px 24px;">
        <p style="color:#1A0A00;font-size:17px;font-weight:700;margin:0 0 6px;">Hi ${ownerName},</p>
        <p style="color:#5A3010;font-size:15px;line-height:1.7;margin:0 0 20px;">
          Your V-Hub listing for <strong>${businessName}</strong> is now <strong>live</strong> and your billing information has been securely saved.
        </p>
        <div style="background:#fff8ee;border:1px solid #C9973A;border-radius:10px;padding:20px 24px;margin-bottom:20px;">
          <div style="font-size:13px;font-weight:900;color:#8B4513;letter-spacing:1px;margin-bottom:14px;text-transform:uppercase;">Trial Details</div>
          <table style="width:100%;border-collapse:collapse;font-size:14px;color:#3A1A00;">
            <tr><td style="padding:5px 0;color:#7B5230;">Amount Due Today</td><td style="text-align:right;font-weight:900;font-size:18px;color:#2E7D32;">$0.00</td></tr>
            <tr><td style="padding:5px 0;color:#7B5230;">Trial Ends</td><td style="text-align:right;font-weight:700;">${trialEndDate}</td></tr>
            <tr><td style="padding:5px 0;color:#7B5230;">After Trial</td><td style="text-align:right;">$12 / month</td></tr>
            <tr><td style="padding:5px 0;color:#7B5230;">Subscription</td><td style="text-align:right;">V-Hub Basic Listing · Monthly</td></tr>
          </table>
        </div>
        <p style="color:#5A3010;font-size:14px;line-height:1.7;">
          <strong>Nothing is charged today.</strong> Your card will be automatically billed on <strong>${trialEndDate}</strong> when your free trial ends. 
          You can cancel anytime before that date from your <a href="${APP_URL}/ProviderDashboard" style="color:#C9973A;">Provider Hub</a>.
        </p>
        <p style="color:#5A3010;font-size:13px;line-height:1.7;margin-top:12px;">
          Questions? Contact us at <a href="mailto:admin@v-hub.us" style="color:#C9973A;">admin@v-hub.us</a>
        </p>
      </div>
      <div style="background:#3A1A00;padding:16px;text-align:center;">
        <p style="color:#C9973A;font-size:12px;margin:0;">© 2026 V-Hub · The Villages, Florida · All Rights Reserved</p>
        <p style="color:#8B7355;font-size:11px;margin:6px 0 0;">V-Hub is not affiliated with The Villages® or its affiliates.</p>
      </div>
    </div>
  `;

  const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: { Authorization: `Bearer ${SENDGRID_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: "admin@v-hub.us", name: "V-Hub" },
      subject: `V-Hub — Your Free Trial is Active! First charge on ${trialEndDate}`,
      content: [{ type: "text/html", value: html }],
    }),
  });

  if (!res.ok) {
    console.error("SendGrid trial-start error:", await res.text());
  } else {
    console.log(`✅ Trial-start email sent to ${to}`);
  }
}

// ── Main webhook handler ─────────────────────────────────────────────────────

Deno.serve(async (req: Request): Promise<Response> => {
  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2023-10-16" });
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig!, webhookSecret!);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return new Response(`Webhook signature verification failed: ${err}`, { status: 400 });
  }

  console.log("Stripe webhook event:", event.type);
  const base44 = createClientFromRequest(req);

  // ── checkout.session.completed ───────────────────────────────────────────
  // Fires when provider completes the Stripe checkout (card saved).
  // If there's a trial, amount_total = 0 and NO charge has occurred.
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    // ── One-time classifieds weekly payment ───────────────────────────
    if (session.mode === "payment") {
      const providerRecordId = session.metadata?.provider_record_id;
      const addonType = session.metadata?.addon_type || "";
      const adExpires = session.metadata?.ad_expires || "";
      if (addonType === "classifieds_weekly" && providerRecordId) {
        console.log(`Classifieds weekly payment completed: ${providerRecordId}`);
        try {
          // Calculate expiry: 7 days from now
          const expires = adExpires || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
          await base44.asServiceRole.entities.Provider.update(providerRecordId, {
            classifieds_addon: true,
          });
          console.log("✅ Classifieds weekly ad activated for:", providerRecordId, "expires:", expires);
        } catch (err) {
          console.error("Failed to activate classifieds weekly addon:", err);
        }
      }
    }

    if (session.mode === "subscription") {
      const subscriptionId = session.subscription as string;
      const providerRecordId = session.metadata?.provider_record_id || session.metadata?.provider_id;
      const addonType = session.metadata?.addon_type || "";
      let provider: any = null;

      // ── Classifieds Add-On: simple branch ─────────────────────────────
      if (addonType === "classifieds" && providerRecordId) {
        console.log(`Classifieds addon checkout completed: ${providerRecordId}`);
        try {
          await base44.asServiceRole.entities.Provider.update(providerRecordId, {
            classifieds_addon: true,
            classifieds_stripe_subscription_id: subscriptionId,
          });
          console.log("✅ Classifieds addon activated for:", providerRecordId);
        } catch (err) {
          console.error("Failed to activate classifieds addon:", err);
        }
        // No email needed for classifieds addon — provider is already in dashboard
      }

      // ── Main subscription checkout (non-addon) ──────────────────────
      else if (providerRecordId) {
        try {
          provider = await base44.asServiceRole.entities.Provider.get(providerRecordId);
        } catch (_) {
          const results = await base44.asServiceRole.entities.Provider.filter({ provider_id: providerRecordId });
          if (results.length > 0) provider = results[0];
        }

        if (provider) {
          // Determine if there's an active trial on this subscription
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
            // Status: "trial" if there's a trial, "active" if charging immediately
            subscription_status: hasTrial ? "trial" : "active",
            subscription_tier: provider.subscription_tier || "basic",
            is_visible: true,
            is_active: true,
            stripe_subscription_id: subscriptionId,
            stripe_customer_id: session.customer as string,
            // Sync trial_end_date to whatever Stripe has
            ...(trialEndUnix ? {
              trial_end_date: new Date(trialEndUnix * 1000).toISOString().split("T")[0],
            } : {}),
          });
          console.log(`Provider updated: ${provider.id} | hasTrial=${hasTrial}`);

          // ── Send appropriate email ─────────────────────────────────────
          const email = session.customer_email || provider.email || provider.login_email || "";
          const ownerName = session.metadata?.provider_name || provider.owner_name || "Provider";
          const bizName = session.metadata?.business_name || provider.business_name || "";

          if (email) {
            if (hasTrial && trialEndUnix) {
              // Trial started — card saved, NOT charged yet
              const trialEndDate = new Date(trialEndUnix * 1000).toLocaleDateString("en-US", {
                weekday: "long", month: "long", day: "numeric", year: "numeric",
              });
              await sendTrialStartEmail({ to: email, ownerName, businessName: bizName, trialEndDate });
            } else {
              // No trial — immediate charge — get invoice and send receipt
              try {
                const sub = await stripe.subscriptions.retrieve(subscriptionId, { expand: ["latest_invoice"] });
                const invoice = sub.latest_invoice as Stripe.Invoice | null;
                if (invoice && (invoice.amount_paid ?? 0) > 0) {
                  await sendReceiptEmail({
                    to: email,
                    ownerName,
                    businessName: bizName,
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
      } // end else-if (main subscription)
    }
  }

  // ── invoice.payment_succeeded ────────────────────────────────────────────
  // Fires for EVERY successful charge — including the first post-trial charge.
  // billing_reason tells us what kind of charge this is:
  //   "subscription_create"  → initial setup (usually $0 during trial — skip receipt)
  //   "subscription_cycle"   → monthly renewal
  //   "subscription_update"  → plan change
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

      // ── Send receipt ONLY for real charges (amount > 0) ──────────────
      // This covers:
      //   - First charge after trial ends (billing_reason = "subscription_cycle" or "subscription_create" with amount > 0)
      //   - All monthly renewals
      // We skip "subscription_create" at $0 (that's the trial setup handled by checkout.session.completed)
      const isRealCharge = amountPaid > 0;
      const isTrialSetup = billingReason === "subscription_create" && amountPaid === 0;

      if (isRealCharge && !isTrialSetup) {
        const email = invoice.customer_email || provider?.email || provider?.login_email || "";
        const ownerName = provider?.owner_name || "Provider";
        const bizName = provider?.business_name || "";
        const isFirstRealCharge = billingReason === "subscription_create" || billingReason === "subscription_cycle";

        if (email) {
          await sendReceiptEmail({
            to: email,
            ownerName,
            businessName: bizName,
            amount: amountPaid,
            currency: invoice.currency ?? "usd",
            invoiceNumber: invoice.number ?? invoice.id ?? "N/A",
            periodStart: invoice.period_start ? formatDate(invoice.period_start) : "",
            periodEnd: invoice.period_end ? formatDate(invoice.period_end) : "",
            // isFirstPayment = true when this is the first subscription_cycle after trial
            isFirstPayment: billingReason === "subscription_create" || 
                            (billingReason === "subscription_cycle" && provider?.subscription_status === "trial"),
            hostedInvoiceUrl: invoice.hosted_invoice_url ?? undefined,
          });
        } else {
          console.warn("No email for receipt:", invoice.id);
        }

        // Update status to "active" after trial ends and first charge fires
        if (provider && provider.subscription_status === "trial") {
          await base44.asServiceRole.entities.Provider.update(provider.id, {
            subscription_status: "active",
          });
          console.log("Provider moved from trial to active:", provider.id);
        }
      } else {
        console.log(`Skipping receipt: billing_reason=${billingReason}, amount=${amountPaid} (trial $0 setup)`);
      }
    }
  }

  // ── invoice.payment_failed ───────────────────────────────────────────────
  if (event.type === "invoice.payment_failed") {
    const invoice = event.data.object as Stripe.Invoice;
    const subId = invoice.subscription as string;
    if (subId) {
      try {
        const providers = await base44.asServiceRole.entities.Provider.filter({ stripe_subscription_id: subId });
        if (providers.length > 0) {
          await base44.asServiceRole.entities.Provider.update(providers[0].id, {
            subscription_status: "past_due",
          });
          console.log("Provider marked past_due:", providers[0].id);
        }
      } catch (e) {
        console.error("Error handling payment_failed:", e);
      }
    }
  }

  // ── customer.subscription.deleted ───────────────────────────────────────
  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription;
    try {
      const providers = await base44.asServiceRole.entities.Provider.filter({ stripe_subscription_id: sub.id });
      if (providers.length > 0) {
        await base44.asServiceRole.entities.Provider.update(providers[0].id, {
          subscription_status: "cancelled",
          is_visible: false,
          is_active: false,
        });
        console.log("Provider deactivated on subscription delete:", providers[0].id);
      }
    } catch (e) {
      console.error("Error handling subscription.deleted:", e);
    }
  }

  // ── customer.subscription.trial_will_end ────────────────────────────────
  // Fires 3 days before trial ends — Stripe sends this automatically.
  // We log it; our own trialReminder automation handles 7-day notices.
  if (event.type === "customer.subscription.trial_will_end") {
    const sub = event.data.object as Stripe.Subscription;
    console.log(`Trial ending soon for subscription: ${sub.id} | trial_end=${sub.trial_end}`);
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
