import Stripe from "npm:stripe@14";

export default async function handler(req: Request): Promise<Response> {
  const { stripe_subscription_id } = await req.json();

  if (!stripe_subscription_id) {
    return new Response(JSON.stringify({ error: "Missing stripe_subscription_id" }), { status: 400 });
  }

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2023-10-16" });

  // Cancel at period end (provider keeps access until billing cycle ends)
  const subscription = await stripe.subscriptions.update(stripe_subscription_id, {
    cancel_at_period_end: true,
  });

  return new Response(JSON.stringify({ success: true, cancel_at: subscription.cancel_at }), {
    headers: { "Content-Type": "application/json" },
  });
}
