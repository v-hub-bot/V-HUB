// Cancels a provider's Stripe subscription at period end + sends confirmation email
import Stripe from "npm:stripe@14";
import { createClientFromRequest } from "npm:@base44/sdk@0.8.25";

const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY") || "";
const LOGO_URL = "https://media.base44.com/images/public/69d06ada8019d7e9edf7f8e8/a9af95bc3_V-Hublogo.png";
const APP_URL = "https://www.v-hub.us";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

async function sendCancellationEmail(opts: {
  to: string; ownerName: string; businessName: string; accessUntil: string;
}) {
  if (!SENDGRID_API_KEY) return;
  const { to, ownerName, businessName, accessUntil } = opts;

  const html = `
    <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;background:#F5E8CC;border:2px solid #8B4513;border-radius:12px;overflow:hidden;">
      <div style="background:#1A0A00;padding:24px;text-align:center;">
        <img src="${LOGO_URL}" style="height:60px;border-radius:10px;margin-bottom:10px;"/>
        <div style="color:#F5E8CC;font-size:20px;font-weight:900;letter-spacing:2px;">🔔 SUBSCRIPTION CANCELLED</div>
        <div style="color:#C9973A;font-size:13px;margin-top:6px;font-style:italic;">V-Hub · The Villages, FL</div>
      </div>
      <div style="padding:28px 24px;">
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
        <p style="color:#5A3010;font-size:13px;line-height:1.7;margin-top:12px;">Questions? Contact us at <a href="mailto:admin@v-hub.us" style="color:#C9973A;">admin@v-hub.us</a></p>
      </div>
      <div style="background:#3A1A00;padding:16px;text-align:center;">
        <p style="color:#C9973A;font-size:12px;margin:0;">© 2026 V-Hub · The Villages, Florida · All Rights Reserved</p>
        <p style="color:#8B7355;font-size:11px;margin:6px 0 0;">V-Hub is not affiliated with The Villages® or its affiliates.</p>
      </div>
    </div>`;

  const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: { Authorization: `Bearer ${SENDGRID_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: "admin@v-hub.us", name: "V-Hub" },
subject: `V-Hub - Subscription Cancelled | ${businessName}`,
      content: [{ type: "text/html", value: html }],
    }),
  });

  if (!res.ok) console.error("SendGrid cancellation email error:", await res.text());
  else console.log(`✅ Cancellation email sent to ${to}`);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });

  try {
    const { provider_id } = await req.json();
    if (!provider_id) return Response.json({ error: "Missing provider_id" }, { status: 400, headers: CORS });

    const base44 = createClientFromRequest(req);
    let provider: any = null;
    try {
      provider = await base44.asServiceRole.entities.Provider.get(provider_id);
    } catch (_) {
      provider = await base44.entities.Provider.get(provider_id);
    }

    if (!provider) return Response.json({ error: "Provider not found" }, { status: 404, headers: CORS });
    if (!provider.stripe_subscription_id) {
      return Response.json({ error: "No active subscription found." }, { status: 400, headers: CORS });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2023-10-16" });

    // Cancel at period end — provider keeps access until billing cycle ends
    const updated = await stripe.subscriptions.update(provider.stripe_subscription_id, {
      cancel_at_period_end: true,
    });

    // Update our DB
    try {
      await base44.asServiceRole.entities.Provider.update(provider_id, {
        subscription_status: "cancelled",
      });
    } catch (_) {
      await base44.entities.Provider.update(provider_id, {
        subscription_status: "cancelled",
      });
    }

    const periodEnd = updated.current_period_end
      ? new Date(updated.current_period_end * 1000).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
      : "the end of your billing period";

    // ── Send cancellation confirmation email ────────────────────────────
    const email = provider.email || provider.login_email || "";
    if (email) {
      await sendCancellationEmail({
        to: email,
        ownerName: provider.owner_name || "Provider",
        businessName: provider.business_name || "",
        accessUntil: periodEnd,
      });
    }

    return Response.json({ success: true, access_until: periodEnd }, { headers: CORS });
  } catch (err: any) {
    console.error("cancelSubscription error:", err);
    return Response.json({ error: err.message }, { status: 500, headers: CORS });
  }
});
