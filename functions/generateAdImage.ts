// v12 — gpt-image-1 ONLY. No DALL-E fallback.
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
      console.error("OpenAI gpt-image-1 error:", JSON.stringify(errBody));
      return Response.json({ error: errBody?.error?.message || "Image generation failed. Please try again." }, { status: 500, headers: CORS_HEADERS });
    }

    const data = await resp.json();
    const b64 = data?.data?.[0]?.b64_json;
    const tempUrl = data?.data?.[0]?.url;

    if (!b64 && !tempUrl) {
      console.error("No image data returned:", JSON.stringify(data));
      return Response.json({ error: "No image returned from OpenAI. Please try again." }, { status: 500, headers: CORS_HEADERS });
    }

    console.log("✅ gpt-image-1 image generated, uploading to CDN...");

    // Upload to Base44 CDN
    const base44 = createClientFromRequest(req);
    const filename = `ai_ad_${provider_id}_${Date.now()}.png`;

    let imgBlob: Blob;
    if (b64) {
      const byteArr = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
      imgBlob = new Blob([byteArr], { type: "image/png" });
    } else {
      const imgResp = await fetch(tempUrl!);
      const imgBytes = await imgResp.arrayBuffer();
      imgBlob = new Blob([imgBytes], { type: "image/png" });
    }

    let finalUrl = b64 ? `data:image/png;base64,${b64}` : tempUrl!;
    try {
      const uploadedFile = await base44.storage.uploadFile(imgBlob, filename);
      if (uploadedFile?.url) {
        finalUrl = uploadedFile.url;
        console.log("✅ Uploaded to CDN:", finalUrl);
      } else {
        console.warn("CDN upload returned no URL, using inline fallback");
      }
    } catch (uploadErr) {
      console.error("CDN upload failed:", String(uploadErr), "— using inline fallback");
    }

    return Response.json({ url: finalUrl }, { headers: CORS_HEADERS });

  } catch (err: any) {
    console.error("generateAdImage error:", err);
    return Response.json({ error: err.message || "Unknown error. Please try again." }, { status: 500, headers: CORS_HEADERS });
  }
});
