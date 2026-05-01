// v10 — backend uploads image to CDN directly, returns clean URL (no giant b64 to frontend)
import { createClientFromRequest } from "npm:@base44/sdk@0.8.23";

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

    const fullPrompt = `Create a professional, eye-catching advertisement background image for a local service business in The Villages, Florida. ${prompt}. Style: vibrant colors, clean composition, suitable for a weekly deals/promotions advertisement. CRITICAL REQUIREMENT: The image must contain absolutely NO text, NO words, NO letters, NO numbers, NO signs with writing, NO banners with text — zero text of any kind in any language. Pure visual imagery only. No watermarks. High quality photorealistic or illustrated style.`;

    // Step 1: Generate with DALL-E 3 using URL response (simpler, no giant b64)
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
    const tempUrl = data?.data?.[0]?.url;
    if (!tempUrl) return Response.json({ error: "No image returned from OpenAI" }, { status: 500, headers: CORS_HEADERS });

    console.log("✅ DALL-E image generated, fetching from temp URL...");

    // Step 2: Fetch the image bytes from OpenAI's temp URL (server-side, no CORS issues)
    const imgResp = await fetch(tempUrl);
    if (!imgResp.ok) {
      console.error("Failed to fetch temp image:", imgResp.status);
      return Response.json({ error: "Failed to fetch generated image" }, { status: 500, headers: CORS_HEADERS });
    }
    const imgBytes = await imgResp.arrayBuffer();
    console.log("Image fetched, size:", Math.round(imgBytes.byteLength / 1024), "KB");

    // Step 3: Upload to Base44 CDN storage
    const base44 = createClientFromRequest(req);
    const filename = `ai_ad_${provider_id}_${Date.now()}.png`;
    const blob = new Blob([imgBytes], { type: "image/png" });

    let finalUrl = tempUrl; // fallback to temp URL if upload fails
    try {
      const uploadedFile = await base44.storage.uploadFile(blob, filename);
      if (uploadedFile?.url) {
        finalUrl = uploadedFile.url;
        console.log("✅ Uploaded to CDN:", finalUrl);
      } else {
        console.warn("CDN upload returned no URL, using temp URL");
      }
    } catch (uploadErr) {
      console.error("CDN upload failed:", uploadErr, "— falling back to temp URL");
    }

    return Response.json({ url: finalUrl }, { headers: CORS_HEADERS });

  } catch (err: any) {
    console.error("generateAdImage error:", err);
    return Response.json({ error: err.message || "Unknown error" }, { status: 500, headers: CORS_HEADERS });
  }
});
