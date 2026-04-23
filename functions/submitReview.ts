// submitReview — handles both review loading (get_reviews) and submission
// Uses asServiceRole so no auth token is required from the submitter
// NOTE: customer_name is stored privately but NEVER returned in get_reviews — admin only
import { createClientFromRequest } from "npm:@base44/sdk@0.8.23";

Deno.serve(async (req: Request): Promise<Response> => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });

  try {
    const body = await req.json();
    const base44 = createClientFromRequest(req);

    // ── GET_REVIEWS MODE ──────────────────────────────────────────────────────
    if (body.get_reviews) {
      const { provider_id } = body;
      if (!provider_id) return Response.json({ error: "Missing provider_id" }, { status: 400, headers: corsHeaders });

      const reviews = await base44.asServiceRole.entities.ProviderReview.filter({
        provider_id,
        is_approved: true,
      });

      // Strip customer_name before returning — names are private, admin-only
      const safeReviews = (reviews || []).map(r => {
        const { customer_name, ...rest } = r;
        return rest;
      });

      return Response.json({ reviews: safeReviews }, { headers: corsHeaders });
    }

    // ── SUBMIT REVIEW MODE ────────────────────────────────────────────────────
    const { provider_id, customer_name, customer_village, rating, review_text, service_used } = body;

    if (!provider_id)         return Response.json({ error: "Missing provider_id" },   { status: 400, headers: corsHeaders });
    if (!review_text?.trim()) return Response.json({ error: "Missing review_text" },   { status: 400, headers: corsHeaders });
    if (!rating)              return Response.json({ error: "Missing rating" },         { status: 400, headers: corsHeaders });

    await base44.asServiceRole.entities.ProviderReview.create({
      provider_id,
      // customer_name is optional and stored privately — never shown publicly
      customer_name: customer_name?.trim() || "",
      customer_village: customer_village || "",
      rating: Number(rating),
      review_text: review_text.trim(),
      service_used: service_used || "",
      is_approved: false,
      helpful_count: 0,
    });

    return Response.json({ success: true }, { headers: corsHeaders });
  } catch (err) {
    console.error("submitReview error:", err);
    return Response.json({ error: (err as any).message || "Unknown error" }, { status: 500, headers: corsHeaders });
  }
});
