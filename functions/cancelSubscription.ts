// Cancels a provider's Stripe subscription directly (at period end)
import Stripe from "npm:stripe@14";
import { createClientFromRequest } from "npm:@base44/sdk@0.8.23";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

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

    // Cancel at period end (they keep access until billing cycle ends)
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
      : null;

    return Response.json({ success: true, access_until: periodEnd }, { headers: CORS });
  } catch (err: any) {
    console.error("cancelSubscription error:", err);
    return Response.json({ error: err.message }, { status: 500, headers: CORS });
  }
});
