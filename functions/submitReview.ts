// submitReview — allows public (unauthenticated) users to post a review
// Runs as service role so no auth is required from the submitter
import { createClient } from "npm:@base44/sdk@0.8.25";

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
    if (!provider_id || !customer_name?.trim() || !customer_village || !service_used || !review_text?.trim() || !rating) {
      return Response.json({ error: "Missing required fields" }, { status: 400, headers: corsHeaders });
    }

    // Use service role to bypass auth requirement on entity
    const client = createClient({
      appId: "69d062aca815ce8e697894b1",
      apiKey: Deno.env.get("VHUB_SERVICE_API_KEY") || "",
    });

    await client.asServiceRole.entities.ProviderReview.create({
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
