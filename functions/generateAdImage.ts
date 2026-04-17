import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS_HEADERS });

  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { prompt, provider_id } = body;

    if (!prompt) {
      return Response.json({ error: "Prompt is required" }, { status: 400, headers: CORS_HEADERS });
    }

    // Verify provider exists
    if (!provider_id) {
      return Response.json({ error: "Provider ID required" }, { status: 400, headers: CORS_HEADERS });
    }

    // Call base44 AI image generation
    const imageResult = await base44.ai.images.generate({
      prompt: `Create a professional, eye-catching advertisement image for a local service business in The Villages, Florida. ${prompt}. Style: vibrant, clear text space, tropical Florida feel. Make it suitable for a deals/promotions advertisement.`,
    });

    if (!imageResult?.url) {
      return Response.json({ error: "Image generation failed" }, { status: 500, headers: CORS_HEADERS });
    }

    return Response.json({ url: imageResult.url }, { headers: CORS_HEADERS });
  } catch (err: any) {
    console.error("generateAdImage error:", err);
    return Response.json({ error: err.message || "Unknown error" }, { status: 500, headers: CORS_HEADERS });
  }
});
