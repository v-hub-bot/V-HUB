// v5 - fresh deploy 2026-04-12 using Deno.serve pattern
import Stripe from "npm:stripe@14";

Deno.serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const { provider_id, provider_email, provider_name, business_name } = await req.json();

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2023-10-16" });

    const appUrl = "https://v-hub-app-edf7f8e8.base44.app";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: provider_email,
      line_items: [{ price: "price_1TIfRrHOk6rIFwfqk1pUiUzR", quantity: 1 }],
      metadata: { provider_id, provider_name, business_name },
      success_url: `${appUrl}/ProviderDashboard?payment=success&acct=${provider_id}`,
      cancel_url: `${appUrl}/ProviderDashboard?payment=cancelled`,
    });

    return Response.json({ url: session.url, session_id: session.id }, { headers: corsHeaders });
  } catch (err) {
    console.error("createCheckoutSession error:", err);
    return Response.json({ error: (err as any).message }, { status: 500, headers: corsHeaders });
  }
});
