// v5 - added provider ownership verification before cancellation
import Stripe from "npm:stripe@14";
import { createClientFromRequest } from "npm:@base44/sdk@0.8.23";

Deno.serve(async (req: Request): Promise<Response> => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const { stripe_subscription_id, provider_record_id } = await req.json();

    if (!stripe_subscription_id) {
      return new Response(JSON.stringify({ error: "Missing stripe_subscription_id" }), { status: 400, headers: corsHeaders });
    }
    if (!provider_record_id) {
      return new Response(JSON.stringify({ error: "Missing provider_record_id" }), { status: 400, headers: corsHeaders });
    }

    // Verify that this subscription actually belongs to the claimed provider
    const base44 = createClientFromRequest(req);
    let provider: any = null;
    try {
      provider = await base44.asServiceRole.entities.Provider.get(provider_record_id);
    } catch (_) {}

    if (!provider) {
      return new Response(JSON.stringify({ error: "Provider not found" }), { status: 404, headers: corsHeaders });
    }

    // Ownership check: the subscription ID on the provider record must match
    if (provider.stripe_subscription_id !== stripe_subscription_id) {
      console.error(`Ownership mismatch: provider ${provider_record_id} has sub ${provider.stripe_subscription_id}, requested ${stripe_subscription_id}`);
      return new Response(JSON.stringify({ error: "Subscription does not belong to this account" }), { status: 403, headers: corsHeaders });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2023-10-16" });

    // Cancel at period end — provider keeps listing until billing cycle ends
    const subscription = await stripe.subscriptions.update(stripe_subscription_id, {
      cancel_at_period_end: true,
    });

    console.log("Subscription cancel_at_period_end set for provider:", provider_record_id, stripe_subscription_id);

    return new Response(JSON.stringify({ success: true, cancel_at: subscription.cancel_at }), {
      headers: corsHeaders,
    });
  } catch (err) {
    console.error("cancelSubscription error:", err);
    return new Response(JSON.stringify({ error: (err as any).message }), { status: 500, headers: corsHeaders });
  }
});
