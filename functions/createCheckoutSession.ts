// v8 - Trial-aware checkout — trial_end_date passed from frontend, no DB lookup needed
import Stripe from "npm:stripe@14";

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
    // trial_end_date is passed directly from the provider's dashboard (ISO date string)
    const { provider_id, provider_email, provider_name, business_name, trial_end_date } = body;

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2023-10-16" });
    const appUrl = "https://www.v-hub.us";

    // ── Calculate trial end ──────────────────────────────────────────────
    let trialEndUnix: number | null = null;
    let trialDays = TRIAL_DAYS_DEFAULT;

    if (trial_end_date) {
      const trialEndDate = new Date(trial_end_date);
      const now = new Date();
      if (trialEndDate > now) {
        trialEndUnix = Math.floor(trialEndDate.getTime() / 1000);
        const msRemaining = trialEndDate.getTime() - now.getTime();
        trialDays = Math.ceil(msRemaining / (1000 * 60 * 60 * 24));
        console.log(`Using provided trial_end_date: ${trial_end_date} (${trialDays} days remaining)`);
      } else {
        // Trial already expired — charge immediately
        trialEndUnix = null;
        trialDays = 0;
        console.log("Trial already expired, charging immediately (no trial)");
      }
    } else {
      // No trial_end_date provided — use default 45 days from now
      const end = new Date();
      end.setDate(end.getDate() + TRIAL_DAYS_DEFAULT);
      trialEndUnix = Math.floor(end.getTime() / 1000);
      console.log(`No trial_end_date provided, using default ${TRIAL_DAYS_DEFAULT} days`);
    }

    // ── Build subscription_data ──────────────────────────────────────────
    const subscriptionData: any = {
      metadata: { provider_id, provider_name, business_name },
    };

    if (trialEndUnix && trialDays > 0) {
      subscriptionData.trial_end = trialEndUnix;
    }

    // ── Create Stripe Checkout Session ───────────────────────────────────
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: provider_email,
      line_items: [{ price: "price_1TIfRrHOk6rIFwfqk1pUiUzR", quantity: 1 }],
      subscription_data: subscriptionData,
      // Always collect card — even for $0 trial
      ...(trialDays > 0 ? { payment_method_collection: "always" } : {}),
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
