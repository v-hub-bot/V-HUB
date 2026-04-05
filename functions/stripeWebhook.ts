import Stripe from "npm:stripe@14";
import { createClient } from "npm:@base44/sdk";

export default async function handler(req: Request): Promise<Response> {
  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2023-10-16" });
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig!, webhookSecret!);
  } catch (err) {
    return new Response(`Webhook signature verification failed: ${err}`, { status: 400 });
  }

  const base44 = createClient({ appId: Deno.env.get("APP_ID")! });

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.mode === "subscription" && session.metadata?.provider_id) {
      const providerId = session.metadata.provider_id;
      const subscriptionId = session.subscription as string;

      // Find the provider by provider_id field and activate
      const providers = await base44.asServiceRole.entities.Provider.filter({ provider_id: providerId });
      if (providers.length > 0) {
        await base44.asServiceRole.entities.Provider.update(providers[0].id, {
          subscription_status: "active",
          is_visible: true,
          stripe_subscription_id: subscriptionId,
          stripe_customer_id: session.customer as string,
        });
      }
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription;
    const providers = await base44.asServiceRole.entities.Provider.filter({ stripe_subscription_id: sub.id });
    if (providers.length > 0) {
      await base44.asServiceRole.entities.Provider.update(providers[0].id, {
        subscription_status: "cancelled",
        is_visible: false,
      });
    }
  }

  if (event.type === "invoice.payment_failed") {
    const invoice = event.data.object as Stripe.Invoice;
    const subId = (invoice.subscription as string);
    if (subId) {
      const providers = await base44.asServiceRole.entities.Provider.filter({ stripe_subscription_id: subId });
      if (providers.length > 0) {
        await base44.asServiceRole.entities.Provider.update(providers[0].id, {
          subscription_status: "past_due",
        });
      }
    }
  }

  return new Response(JSON.stringify({ received: true }), { headers: { "Content-Type": "application/json" } });
}
