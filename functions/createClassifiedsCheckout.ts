// Classifieds Ad Checkout — $10 one-time payment for 1 week
import Stripe from "npm:stripe@14";

Deno.serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });

  try {
    const { provider_record_id, provider_email, provider_name, ad_id_to_activate } = await req.json();
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2023-10-16" });
    const appUrl = "https://www.v-hub.us";

    // 7 days from now for display purposes (actual expiry set by webhook at time of payment)
    const weekEnd = new Date();
    weekEnd.setDate(weekEnd.getDate() + 7);
    const weekEndStr = weekEnd.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: provider_email,
      line_items: [{
        price_data: {
          currency: "usd",
          unit_amount: 1000, // $10.00
          product_data: {
            name: "V-Hub Deals of the Week — 7-Day Ad",
            description: `Your ad runs on V-Hub's Deals of the Week page for 7 days (through ${weekEndStr}).`,
          },
        },
        quantity: 1,
      }],
      metadata: {
        provider_record_id: provider_record_id || "",
        provider_name: provider_name || "",
        addon_type: "classifieds_weekly",
        ad_id_to_activate: ad_id_to_activate || "",   // ← which queued ad to flip live
      },
      success_url: `${appUrl}/ProviderDashboard?classifieds_payment=success&acct=${provider_record_id}`,
      cancel_url:  `${appUrl}/ProviderDashboard?classifieds_payment=cancelled`,
    });

    return Response.json({ url: session.url }, { headers: corsHeaders });
  } catch (err) {
    console.error("createClassifiedsCheckout error:", err);
    return Response.json({ error: (err as any).message }, { status: 500, headers: corsHeaders });
  }
});
