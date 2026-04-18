// submitReview — allows public (unauthenticated) users to post a review
// Uses asServiceRole so no auth token is required from the submitter
import { createClientFromRequest } from "npm:@base44/sdk@0.8.25";

Deno.serve(async (req: Request): Promise<Response> => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });

  try {
    const body = await req.json();
    const { provider_id, customer_name, customer_village, rating, review_text, service_used } = body;

    // Basic validation
    if (!provider_id)          return Response.json({ error: "Missing provider_id" },   { status: 400, headers: corsHeaders });
    if (!customer_name?.trim()) return Response.json({ error: "Missing customer_name" }, { status: 400, headers: corsHeaders });
    if (!customer_village)     return Response.json({ error: "Missing customer_village" },{ status: 400, headers: corsHeaders });
    if (!service_used)         return Response.json({ error: "Missing service_used" },   { status: 400, headers: corsHeaders });
    if (!review_text?.trim())  return Response.json({ error: "Missing review_text" },    { status: 400, headers: corsHeaders });
    if (!rating)               return Response.json({ error: "Missing rating" },          { status: 400, headers: corsHeaders });

    const base44 = createClientFromRequest(req);

    await base44.asServiceRole.entities.ProviderReview.create({
      provider_id,
      customer_name: customer_name.trim(),
      customer_village,
      rating: Number(rating),
      review_text: review_text.trim(),
      service_used,
      is_approved: false,
      helpful_count: 0,
    });

    return Response.json({ success: true }, { headers: corsHeaders });
  } catch (err) {
    console.error("submitReview error:", err);
    return Response.json({ error: (err as any).message || "Unknown error" }, { status: 500, headers: corsHeaders });
  }
});
