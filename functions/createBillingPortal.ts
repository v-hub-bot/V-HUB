// Creates a Stripe Customer Portal session for a provider to manage/cancel their subscription
import Stripe from "npm:stripe@14";
import { createClientFromRequest } from "npm:@base44/sdk@0.8.23";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });

  try {
    const { provider_id } = await req.json();
    if (!provider_id) return Response.json({ error: "Missing provider_id" }, { status: 400, headers: CORS });

    const base44 = createClientFromRequest(req);
    let provider: any = null;
    try {
      provider = await base44.asServiceRole.entities.Provider.get(provider_id);
    } catch (_) {
      provider = await base44.entities.Provider.get(provider_id);
    }

    if (!provider) return Response.json({ error: "Provider not found" }, { status: 404, headers: CORS });
    if (!provider.stripe_customer_id) {
      return Response.json({ error: "No Stripe customer on file. Please contact admin@v-hub.us to set up billing." }, { status: 400, headers: CORS });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2023-10-16" });

    const session = await stripe.billingPortal.sessions.create({
      customer: provider.stripe_customer_id,
      return_url: `https://v-hub-app-edf7f8e8.base44.app/ProviderDashboard?payment=portal_return&acct=${provider_id}`,
    });

    return Response.json({ url: session.url }, { headers: CORS });
  } catch (err: any) {
    console.error("createBillingPortal error:", err);
    return Response.json({ error: err.message }, { status: 500, headers: CORS });
  }
});
