import Stripe from "npm:stripe@14";
import { createClientFromRequest } from "npm:@base44/sdk@0.8.23";

Deno.serve(async (req: Request): Promise<Response> => {
  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2023-10-16" });
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig!, webhookSecret!);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return new Response(`Webhook signature verification failed: ${err}`, { status: 400 });
  }

  console.log("Stripe webhook event:", event.type);

  const base44 = createClientFromRequest(req);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.mode === "subscription") {
      const subscriptionId = session.subscription as string;
      // Try to find by provider_id in metadata (from createCheckoutSession)
      const providerRecordId = session.metadata?.provider_record_id || session.metadata?.provider_id;

      if (providerRecordId) {
        try {
          // First try direct record ID lookup
          const provider = await base44.asServiceRole.entities.Provider.get(providerRecordId);
          if (provider) {
            await base44.asServiceRole.entities.Provider.update(provider.id, {
              subscription_status: "active",
              is_visible: true,
              is_active: true,
              stripe_subscription_id: subscriptionId,
              stripe_customer_id: session.customer as string,
            });
            console.log("Provider activated via record ID:", provider.id);
          }
        } catch (e) {
          // Fallback: filter by provider_id field
          console.log("Direct lookup failed, trying filter:", e);
          const providers = await base44.asServiceRole.entities.Provider.filter({ provider_id: providerRecordId });
          if (providers.length > 0) {
            await base44.asServiceRole.entities.Provider.update(providers[0].id, {
              subscription_status: "active",
              is_visible: true,
              is_active: true,
              stripe_subscription_id: subscriptionId,
              stripe_customer_id: session.customer as string,
            });
            console.log("Provider activated via filter:", providers[0].id);
          } else {
            console.error("Could not find provider for ID:", providerRecordId);
          }
        }
      }
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription;
    try {
      const providers = await base44.asServiceRole.entities.Provider.filter({ stripe_subscription_id: sub.id });
      if (providers.length > 0) {
        await base44.asServiceRole.entities.Provider.update(providers[0].id, {
          subscription_status: "cancelled",
          is_visible: false,
          is_active: false,
        });
        console.log("Provider deactivated on subscription delete:", providers[0].id);
      }
    } catch (e) {
      console.error("Error handling subscription.deleted:", e);
    }
  }

  if (event.type === "invoice.payment_failed") {
    const invoice = event.data.object as Stripe.Invoice;
    const subId = (invoice.subscription as string);
    if (subId) {
      try {
        const providers = await base44.asServiceRole.entities.Provider.filter({ stripe_subscription_id: subId });
        if (providers.length > 0) {
          await base44.asServiceRole.entities.Provider.update(providers[0].id, {
            subscription_status: "past_due",
          });
          console.log("Provider marked past_due:", providers[0].id);
        }
      } catch (e) {
        console.error("Error handling payment_failed:", e);
      }
    }
  }

  if (event.type === "invoice.payment_succeeded") {
    const invoice = event.data.object as Stripe.Invoice;
    const subId = (invoice.subscription as string);
    if (subId) {
      try {
        const providers = await base44.asServiceRole.entities.Provider.filter({ stripe_subscription_id: subId });
        if (providers.length > 0 && providers[0].subscription_status === "past_due") {
          await base44.asServiceRole.entities.Provider.update(providers[0].id, {
            subscription_status: "active",
            is_visible: true,
            is_active: true,
          });
          console.log("Provider re-activated after payment:", providers[0].id);
        }
      } catch (e) {
        console.error("Error handling payment_succeeded:", e);
      }
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" }
  });
});
