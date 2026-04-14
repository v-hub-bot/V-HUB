// v6 - Trial-aware checkout — card collected now, charged after trial ends
import Stripe from "npm:stripe@14";
import { createClientFromRequest } from "npm:@base44/sdk@0.8.25";

const TRIAL_DAYS_DEFAULT = 45;

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
    const body = await req.json();
    const { provider_id, provider_email, provider_name, business_name } = body;

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2023-10-16" });
    const base44 = createClientFromRequest(req);
    const appUrl = "https://v-hub-app-edf7f8e8.base44.app";

    // ── Look up the provider's existing trial_end_date from the DB ──────
    // We want Stripe's trial to end exactly when V-Hub's trial ends.
    let trialEndUnix: number | null = null;
    let trialDays = TRIAL_DAYS_DEFAULT;

    if (provider_id) {
      try {
        // Try direct record lookup first
        let provider: any = null;
        try {
          provider = await base44.asServiceRole.entities.Provider.get(provider_id);
        } catch (_) {
          const results = await base44.asServiceRole.entities.Provider.filter({ provider_id });
          if (results.length > 0) provider = results[0];
        }

        if (provider?.trial_end_date) {
          const trialEndDate = new Date(provider.trial_end_date);
          const now = new Date();
          // Only use DB trial end if it's in the future
          if (trialEndDate > now) {
            trialEndUnix = Math.floor(trialEndDate.getTime() / 1000);
            const msRemaining = trialEndDate.getTime() - now.getTime();
            trialDays = Math.ceil(msRemaining / (1000 * 60 * 60 * 24));
            console.log(`Using existing trial_end_date: ${provider.trial_end_date} (${trialDays} days remaining)`);
          } else {
            // Trial already expired — charge immediately (no trial)
            trialEndUnix = null;
            trialDays = 0;
            console.log("Trial already expired, no trial period for Stripe");
          }
        } else {
          // No trial_end_date stored — give full 45 days from now
          const end = new Date();
          end.setDate(end.getDate() + TRIAL_DAYS_DEFAULT);
          trialEndUnix = Math.floor(end.getTime() / 1000);
          console.log(`No trial_end_date on provider, using default ${TRIAL_DAYS_DEFAULT} days`);
        }
      } catch (lookupErr) {
        // Non-fatal — fall back to default trial
        console.warn("Provider lookup failed, using default trial:", lookupErr);
        const end = new Date();
        end.setDate(end.getDate() + TRIAL_DAYS_DEFAULT);
        trialEndUnix = Math.floor(end.getTime() / 1000);
      }
    } else {
      // No provider_id — use default 45-day trial
      const end = new Date();
      end.setDate(end.getDate() + TRIAL_DAYS_DEFAULT);
      trialEndUnix = Math.floor(end.getTime() / 1000);
    }

    // ── Build subscription_data with trial ──────────────────────────────
    // trial_end tells Stripe: collect the card now, but DON'T charge until this timestamp.
    // payment_behavior: "default_incomplete" ensures the card is authorized/saved but not charged.
    const subscriptionData: any = {
      metadata: { provider_id, provider_name, business_name },
    };

    if (trialEndUnix && trialDays > 0) {
      subscriptionData.trial_end = trialEndUnix;
    }

    // ── Create Stripe Checkout Session ──────────────────────────────────
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: provider_email,
      line_items: [{ price: "price_1TIfRrHOk6rIFwfqk1pUiUzR", quantity: 1 }],

      // Trial settings:
      // - card is collected and saved now
      // - Stripe will NOT charge until trial_end
      // - Provider sees "$0 due today, then $XX/month after trial"
      subscription_data: subscriptionData,

      // Show the trial end date clearly on the checkout page
      ...(trialDays > 0 ? {
        payment_method_collection: "always", // always collect card even if $0 due today
      } : {}),

      metadata: { provider_id, provider_name, business_name },
      success_url: `${appUrl}/ProviderDashboard?payment=success&acct=${provider_id}`,
      cancel_url: `${appUrl}/ProviderDashboard?payment=cancelled`,
    });

    console.log(`Checkout session created: ${session.id} | trial_days=${trialDays} | trial_end_unix=${trialEndUnix}`);

    return Response.json(
      { url: session.url, session_id: session.id, trial_days: trialDays },
      { headers: corsHeaders }
    );
  } catch (err) {
    console.error("createCheckoutSession error:", err);
    return Response.json({ error: (err as any).message }, { status: 500, headers: corsHeaders });
  }
});
