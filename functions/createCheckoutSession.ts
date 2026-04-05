// v2 - force redeploy
import Stripe from "npm:stripe@14";

export default async function handler(req: Request): Promise<Response> {
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

  return new Response(JSON.stringify({ url: session.url, session_id: session.id }), {
    headers: { "Content-Type": "application/json" },
  });
}
