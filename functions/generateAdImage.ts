// v3 — no text in image (avoids foreign language issue entirely)
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS_HEADERS });

  try {
    const body = await req.json().catch(() => ({}));
    const { prompt, provider_id } = body;

    if (!prompt) {
      return Response.json({ error: "Prompt is required" }, { status: 400, headers: CORS_HEADERS });
    }
    if (!provider_id) {
      return Response.json({ error: "Provider ID required" }, { status: 400, headers: CORS_HEADERS });
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      return Response.json({ error: "OpenAI API key not configured" }, { status: 500, headers: CORS_HEADERS });
    }

    const fullPrompt = `Create a professional, eye-catching advertisement background image for a local service business in The Villages, Florida. ${prompt}. Style: vibrant colors, clean composition, suitable for a weekly deals/promotions advertisement. CRITICAL REQUIREMENT: The image must contain absolutely NO text, NO words, NO letters, NO numbers, NO signs with writing, NO banners with text — zero text of any kind in any language. Pure visual imagery only. No watermarks. High quality photorealistic or illustrated style.`;

    const resp = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: fullPrompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
        response_format: "url",
      }),
    });

    if (!resp.ok) {
      const errBody = await resp.json().catch(() => ({}));
      console.error("OpenAI error:", errBody);
      return Response.json({ error: errBody?.error?.message || "OpenAI image generation failed" }, { status: 500, headers: CORS_HEADERS });
    }

    const data = await resp.json();
    const url = data?.data?.[0]?.url;

    if (!url) {
      return Response.json({ error: "No image returned from OpenAI" }, { status: 500, headers: CORS_HEADERS });
    }

    return Response.json({ url }, { headers: CORS_HEADERS });

  } catch (err: any) {
    console.error("generateAdImage error:", err);
    return Response.json({ error: err.message || "Unknown error" }, { status: 500, headers: CORS_HEADERS });
  }
});
