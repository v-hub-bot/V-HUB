// v16 — gpt-image-1 primary, dall-e-3 fallback. Returns b64; frontend handles save.
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

async function generateImage(model: string, prompt: string, apiKey: string): Promise<{ b64?: string; url?: string; error?: string }> {
  const resp = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      prompt,
      n: 1,
      size: "1024x1024",
      quality: "high",
    }),
  });

  if (!resp.ok) {
    const errBody = await resp.json().catch(() => ({}));
    console.error(`${model} error:`, JSON.stringify(errBody));
    return { error: errBody?.error?.message || `${model} failed` };
  }

  const data = await resp.json();
  const b64 = data?.data?.[0]?.b64_json;
  const url = data?.data?.[0]?.url;

  if (!b64 && !url) return { error: `No image returned from ${model}` };
  return { b64, url };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS_HEADERS });

  try {
    const body = await req.json().catch(() => ({}));
    const { prompt, provider_id } = body;

    if (!prompt) return Response.json({ error: "Prompt is required" }, { status: 400, headers: CORS_HEADERS });
    if (!provider_id) return Response.json({ error: "Provider ID required" }, { status: 400, headers: CORS_HEADERS });

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) return Response.json({ error: "OpenAI API key not configured" }, { status: 500, headers: CORS_HEADERS });

    const fullPrompt = `Create a professional, eye-catching advertisement image for a local service business in The Villages, Florida. ${prompt}. Style: vibrant colors, clean composition, suitable for a weekly deals/promotions advertisement. The image must contain absolutely NO text, NO words, NO letters, NO numbers, NO signs with writing — zero text of any kind. Pure visual imagery only. No watermarks. High quality photorealistic or illustrated style.`;

    // Try gpt-image-1 first
    console.log("Trying gpt-image-1...");
    let result = await generateImage("gpt-image-1", fullPrompt, OPENAI_API_KEY);

    // Fall back to dall-e-3 if gpt-image-1 fails
    if (result.error) {
      console.log(`gpt-image-1 failed (${result.error}), trying dall-e-3...`);
      result = await generateImage("dall-e-3", fullPrompt, OPENAI_API_KEY);
    }

    if (result.error) {
      return Response.json({ error: result.error }, { status: 500, headers: CORS_HEADERS });
    }

    // Return the URL directly if available, otherwise b64
    // The frontend is responsible for uploading b64 images to its own CDN
    const imageUrl = result.url || (result.b64 ? `data:image/png;base64,${result.b64}` : null);

    if (!imageUrl) {
      return Response.json({ error: "No image data returned" }, { status: 500, headers: CORS_HEADERS });
    }

    console.log("✅ Image generated successfully");
    return Response.json({ url: imageUrl }, { headers: CORS_HEADERS });

  } catch (err: any) {
    console.error("generateAdImage error:", err);
    return Response.json({ error: err.message || "Unknown error. Please try again." }, { status: 500, headers: CORS_HEADERS });
  }
});
