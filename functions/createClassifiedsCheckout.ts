// Classifieds Add-On Checkout — $10/month
import Stripe from "npm:stripe@14";

Deno.serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });

  try {
    const { provider_record_id, provider_email, provider_name } = await req.json();
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2023-10-16" });
    const appUrl = "https://v-hub-app-edf7f8e8.base44.app";

    // Look up or create the $10/mo classifieds add-on price
    let priceId: string;
    try {
      const prices = await stripe.prices.list({ lookup_keys: ["vhub_classifieds_addon_monthly"], limit: 1 });
      if (prices.data.length > 0) {
        priceId = prices.data[0].id;
      } else {
        const product = await stripe.products.create({
          name: "V-Hub Classifieds Add-On",
          description: "Run a classified ad on the V-Hub Classifieds page — $10/month",
        });
        const price = await stripe.prices.create({
          product: product.id,
          unit_amount: 1000,
          currency: "usd",
          recurring: { interval: "month" },
          lookup_key: "vhub_classifieds_addon_monthly",
        });
        priceId = price.id;
      }
    } catch (e) {
      console.error("Price lookup/create error:", e);
      throw e;
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: provider_email,
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: {
        provider_record_id,
        provider_name,
        addon_type: "classifieds",
      },
      success_url: `${appUrl}/ProviderDashboard?classifieds_payment=success&acct=${provider_record_id}`,
      cancel_url: `${appUrl}/ProviderDashboard?classifieds_payment=cancelled`,
    });

    return Response.json({ url: session.url }, { headers: corsHeaders });
  } catch (err) {
    console.error("createClassifiedsCheckout error:", err);
    return Response.json({ error: (err as any).message }, { status: 500, headers: corsHeaders });
  }
});
