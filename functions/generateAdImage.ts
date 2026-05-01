// v11 — uses gpt-image-1 (latest OpenAI image model), backend uploads to CDN, returns clean URL
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

    const fullPrompt = `Create a professional, eye-catching advertisement image for a local service business in The Villages, Florida. ${prompt}. Style: vibrant colors, clean composition, suitable for a weekly deals/promotions advertisement. The image must contain absolutely NO text, NO words, NO letters, NO numbers, NO signs with writing — zero text of any kind. Pure visual imagery only. No watermarks. High quality photorealistic or illustrated style.`;

    console.log("Generating image with gpt-image-1...");

    // gpt-image-1 uses the same /v1/images/generations endpoint
    const resp = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt: fullPrompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
      }),
    });

    if (!resp.ok) {
      const errBody = await resp.json().catch(() => ({}));
      console.error("OpenAI error:", JSON.stringify(errBody));
      // If gpt-image-1 not available on this key, fall back to dall-e-3
      if (errBody?.error?.code === "model_not_found" || errBody?.error?.type === "invalid_request_error") {
        console.log("gpt-image-1 not available, falling back to dall-e-3...");
        return await generateWithDallE3(req, fullPrompt, provider_id, OPENAI_API_KEY);
      }
      return Response.json({ error: errBody?.error?.message || "Image generation failed" }, { status: 500, headers: CORS_HEADERS });
    }

    const data = await resp.json();

    // gpt-image-1 returns b64_json by default
    const b64 = data?.data?.[0]?.b64_json;
    const tempUrl = data?.data?.[0]?.url;

    if (!b64 && !tempUrl) {
      console.error("No image data returned:", JSON.stringify(data));
      return Response.json({ error: "No image returned from OpenAI" }, { status: 500, headers: CORS_HEADERS });
    }

    console.log("✅ gpt-image-1 image generated");

    // Upload to CDN
    let finalUrl = tempUrl || "";
    try {
      const base44 = createClientFromRequest(req);
      const filename = `ai_ad_${provider_id}_${Date.now()}.png`;

      let imgBlob: Blob;
      if (b64) {
        const byteArr = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
        imgBlob = new Blob([byteArr], { type: "image/png" });
      } else {
        // fetch from temp URL
        const imgResp = await fetch(tempUrl!);
        const imgBytes = await imgResp.arrayBuffer();
        imgBlob = new Blob([imgBytes], { type: "image/png" });
      }

      const uploadedFile = await base44.storage.uploadFile(imgBlob, filename);
      if (uploadedFile?.url) {
        finalUrl = uploadedFile.url;
        console.log("✅ Uploaded to CDN:", finalUrl);
      } else {
        // Fallback: return base64 data URI if no URL
        if (b64) finalUrl = `data:image/png;base64,${b64}`;
        console.warn("CDN upload returned no URL, using fallback");
      }
    } catch (uploadErr) {
      console.error("CDN upload failed:", String(uploadErr));
      if (b64) finalUrl = `data:image/png;base64,${b64}`;
    }

    if (!finalUrl) return Response.json({ error: "Failed to store generated image" }, { status: 500, headers: CORS_HEADERS });

    return Response.json({ url: finalUrl }, { headers: CORS_HEADERS });

  } catch (err: any) {
    console.error("generateAdImage error:", err);
    return Response.json({ error: err.message || "Unknown error" }, { status: 500, headers: CORS_HEADERS });
  }
});

// Fallback: dall-e-3 if gpt-image-1 not available on the API key
async function generateWithDallE3(req: Request, prompt: string, provider_id: string, apiKey: string): Promise<Response> {
  const CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  const resp = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "dall-e-3", prompt, n: 1, size: "1024x1024", quality: "standard", response_format: "url" }),
  });

  if (!resp.ok) {
    const errBody = await resp.json().catch(() => ({}));
    return Response.json({ error: errBody?.error?.message || "dall-e-3 fallback also failed" }, { status: 500, headers: CORS_HEADERS });
  }

  const data = await resp.json();
  const tempUrl = data?.data?.[0]?.url;
  if (!tempUrl) return Response.json({ error: "No image from dall-e-3 fallback" }, { status: 500, headers: CORS_HEADERS });

  const imgResp = await fetch(tempUrl);
  const imgBytes = await imgResp.arrayBuffer();
  const blob = new Blob([imgBytes], { type: "image/png" });

  const base44 = createClientFromRequest(req);
  let finalUrl = tempUrl;
  try {
    const uploaded = await base44.storage.uploadFile(blob, `ai_ad_${provider_id}_${Date.now()}.png`);
    if (uploaded?.url) finalUrl = uploaded.url;
  } catch (e) { console.error("CDN upload failed in fallback:", e); }

  return Response.json({ url: finalUrl }, { headers: CORS_HEADERS });
}
