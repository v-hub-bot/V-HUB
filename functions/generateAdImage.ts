// v22 — gpt-image-1, quality: medium (faster, avoids timeout)
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

    if (!prompt) return Response.json({ error: "Prompt is required" }, { status: 400, headers: CORS_HEADERS });
    if (!provider_id) return Response.json({ error: "Provider ID required" }, { status: 400, headers: CORS_HEADERS });

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) return Response.json({ error: "OpenAI API key not configured" }, { status: 500, headers: CORS_HEADERS });

    const fullPrompt = `Create a professional, eye-catching advertisement image for a local service business in The Villages, Florida. ${prompt}. Style: vibrant colors, photorealistic photography, clean composition, suitable for a weekly deals/promotions advertisement. The image must contain absolutely NO text, NO words, NO letters, NO numbers, NO signs with writing — zero text of any kind. Pure visual imagery only. No watermarks. Photorealistic style only — NOT cartoon, NOT illustrated, NOT animated.`;

    console.log("Generating with gpt-image-1 (medium quality)...");
    const resp = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: { "Authorization": `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "gpt-image-1", prompt: fullPrompt, n: 1, size: "1024x1024", quality: "medium" }),
    });

    if (!resp.ok) {
      const errBody = await resp.json().catch(() => ({}));
      const msg = errBody?.error?.message || `gpt-image-1 failed (${resp.status})`;
      console.error("gpt-image-1 error:", msg);
      return Response.json({ error: msg }, { status: 500, headers: CORS_HEADERS });
    }

    const data = await resp.json();
    const b64 = data?.data?.[0]?.b64_json;
    if (!b64) {
      return Response.json({ error: "No image returned from gpt-image-1" }, { status: 500, headers: CORS_HEADERS });
    }

    // Return as data URI — frontend uploads to CDN at save time
    console.log("✅ gpt-image-1 medium quality success");
    return Response.json({ url: `data:image/png;base64,${b64}` }, { headers: CORS_HEADERS });

  } catch (err: any) {
    console.error("generateAdImage error:", err);
    return Response.json({ error: err.message || "Unknown error. Please try again." }, { status: 500, headers: CORS_HEADERS });
  }
});
