import Stripe from "npm:stripe@14";
import { createClientFromRequest } from "npm:@base44/sdk@0.8.23";

const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY") || "";
const LOGO_URL = "https://media.base44.com/images/public/69d062aca815ce8e697894b1/a9af95bc3_V-Hublogo.png";
const APP_URL = "https://v-hub-app-edf7f8e8.base44.app";

async function sendReceiptEmail(
  to: string,
  ownerName: string,
  businessName: string,
  amount: number,
  currency: string,
  invoiceNumber: string,
  periodStart: string,
  periodEnd: string,
  isFirstPayment: boolean,
  hostedInvoiceUrl?: string
) {
  if (!SENDGRID_API_KEY) { console.error("No SendGrid key"); return; }

  const formattedAmount = (amount / 100).toLocaleString("en-US", { style: "currency", currency: currency.toUpperCase() });
  const receiptType = isFirstPayment ? "Welcome — First Payment Receipt" : "Monthly Subscription Receipt";
  const intro = isFirstPayment
    ? `Thank you for joining V-Hub! Your listing is now <strong>active</strong> and visible to residents across The Villages.`
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
          Your listing is live at <a href="${APP_URL}" style="color:#C9973A;">${APP_URL}</a>. 
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
      subject: `V-Hub Payment Receipt — ${formattedAmount} · ${receiptType}`,
      content: [{ type: "text/html", value: html }],
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    console.error("SendGrid receipt error:", err);
  } else {
    console.log(`✅ Receipt email sent to ${to}`);
  }
}

function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

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

  // ── checkout.session.completed ─────────────────────────────────────────
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.mode === "subscription") {
      const subscriptionId = session.subscription as string;
      const providerRecordId = session.metadata?.provider_record_id || session.metadata?.provider_id;

      let provider: any = null;

      if (providerRecordId) {
        try {
          provider = await base44.asServiceRole.entities.Provider.get(providerRecordId);
          if (provider) {
            await base44.asServiceRole.entities.Provider.update(provider.id, {
              subscription_status: "active",
              subscription_tier: provider.subscription_tier || "basic",
              is_visible: true,
              is_active: true,
              stripe_subscription_id: subscriptionId,
              stripe_customer_id: session.customer as string,
            });
            console.log("Provider activated via record ID:", provider.id);
          }
        } catch (e) {
          console.log("Direct lookup failed, trying filter:", e);
          const providers = await base44.asServiceRole.entities.Provider.filter({ provider_id: providerRecordId });
          if (providers.length > 0) {
            provider = providers[0];
            await base44.asServiceRole.entities.Provider.update(provider.id, {
              subscription_status: "active",
              is_visible: true,
              is_active: true,
              stripe_subscription_id: subscriptionId,
              stripe_customer_id: session.customer as string,
            });
            console.log("Provider activated via filter:", provider.id);
          } else {
            console.error("Could not find provider for ID:", providerRecordId);
          }
        }
      }

      // ── Send first-payment receipt ──────────────────────────────────────
      // Get invoice details from the subscription
      try {
        const sub = await stripe.subscriptions.retrieve(subscriptionId, { expand: ["latest_invoice"] });
        const invoice = sub.latest_invoice as Stripe.Invoice | null;
        const email = session.customer_email || provider?.email || provider?.login_email || "";
        const ownerName = session.metadata?.provider_name || provider?.owner_name || "Provider";
        const bizName = session.metadata?.business_name || provider?.business_name || "";

        if (email && invoice) {
          const amount = invoice.amount_paid ?? (invoice.total ?? 0);
          const currency = invoice.currency ?? "usd";
          const invNum = invoice.number ?? invoice.id ?? "N/A";
          const start = invoice.period_start ? formatDate(invoice.period_start) : "";
          const end = invoice.period_end ? formatDate(invoice.period_end) : "";
          const hostedUrl = invoice.hosted_invoice_url ?? undefined;

          await sendReceiptEmail(email, ownerName, bizName, amount, currency, invNum, start, end, true, hostedUrl);
        }
      } catch (receiptErr) {
        console.error("Receipt email error (checkout):", receiptErr);
      }
    }
  }

  // ── invoice.payment_succeeded (monthly renewals) ───────────────────────
  if (event.type === "invoice.payment_succeeded") {
    const invoice = event.data.object as Stripe.Invoice;
    const subId = invoice.subscription as string;

    if (subId) {
      let provider: any = null;
      try {
        const providers = await base44.asServiceRole.entities.Provider.filter({ stripe_subscription_id: subId });
        if (providers.length > 0) {
          provider = providers[0];
          // Re-activate if past_due
          if (provider.subscription_status === "past_due") {
            await base44.asServiceRole.entities.Provider.update(provider.id, {
              subscription_status: "active",
              is_visible: true,
              is_active: true,
            });
            console.log("Provider re-activated after payment:", provider.id);
          }
        }
      } catch (e) {
        console.error("Error handling payment_succeeded:", e);
      }

      // ── Send monthly receipt (skip if billing_reason is subscription_create — that's covered by checkout.session.completed) ──
      try {
        const billingReason = invoice.billing_reason;
        // Only send for renewals, not the initial checkout (which sends via checkout.session.completed)
        const isRenewal = billingReason === "subscription_cycle" || billingReason === "subscription_update";

        if (isRenewal) {
          const email = invoice.customer_email || provider?.email || provider?.login_email || "";
          const ownerName = provider?.owner_name || "Provider";
          const bizName = provider?.business_name || "";
          const amount = invoice.amount_paid ?? invoice.total ?? 0;
          const currency = invoice.currency ?? "usd";
          const invNum = invoice.number ?? invoice.id ?? "N/A";
          const start = invoice.period_start ? formatDate(invoice.period_start) : "";
          const end = invoice.period_end ? formatDate(invoice.period_end) : "";
          const hostedUrl = invoice.hosted_invoice_url ?? undefined;

          if (email) {
            await sendReceiptEmail(email, ownerName, bizName, amount, currency, invNum, start, end, false, hostedUrl);
          } else {
            console.warn("No email found for invoice receipt:", invoice.id);
          }
        } else {
          console.log(`Skipping receipt for billing_reason: ${billingReason}`);
        }
      } catch (receiptErr) {
        console.error("Receipt email error (renewal):", receiptErr);
      }
    }
  }

  // ── invoice.payment_failed ─────────────────────────────────────────────
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

  // ── customer.subscription.deleted ─────────────────────────────────────
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

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
