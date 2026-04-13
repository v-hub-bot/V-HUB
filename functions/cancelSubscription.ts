// v4 - Deno.serve pattern, matches all other functions
import Stripe from "npm:stripe@14";

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
    const { stripe_subscription_id } = await req.json();

    if (!stripe_subscription_id) {
      return new Response(JSON.stringify({ error: "Missing stripe_subscription_id" }), { status: 400, headers: corsHeaders });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2023-10-16" });

    // Cancel at period end — provider keeps listing until billing cycle ends
    const subscription = await stripe.subscriptions.update(stripe_subscription_id, {
      cancel_at_period_end: true,
    });

    console.log("Subscription cancel_at_period_end set for:", stripe_subscription_id);

    return new Response(JSON.stringify({ success: true, cancel_at: subscription.cancel_at }), {
      headers: corsHeaders,
    });
  } catch (err) {
    console.error("cancelSubscription error:", err);
    return new Response(JSON.stringify({ error: (err as any).message }), { status: 500, headers: corsHeaders });
  }
});
