// v24 — gpt-image-1 + server-side CDN upload — returns clean CDN URL, no base64 blob
import { createClient } from "npm:@base44/sdk@0.8.23";

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

    // Step 1: Generate image with OpenAI (returns base64)
    console.log("Generating with gpt-image-1 (low quality for speed)...");
    const resp = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: { "Authorization": `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "gpt-image-1", prompt: fullPrompt, n: 1, size: "1024x1024", quality: "low" }),
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

    // Step 2: Upload directly to Base44 CDN from backend
    console.log("Uploading to CDN...");
    const byteArray = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
    const blob = new Blob([byteArray], { type: "image/png" });
    const filename = `ai_ad_${provider_id}_${Date.now()}.png`;

    const formData = new FormData();
    formData.append("file", blob, filename);

    const uploadResp = await fetch("https://api.base44.app/api/apps/69d06ada8019d7e9edf7f8e8/storage/upload", {
      method: "POST",
      body: formData,
    });

    if (!uploadResp.ok) {
      console.error("CDN upload failed, returning base64 fallback");
      // fallback: return base64 — frontend will handle it
      return Response.json({ url: `data:image/png;base64,${b64}` }, { headers: CORS_HEADERS });
    }

    const uploadData = await uploadResp.json();
    const rawUrl = uploadData?.url || "";

    // Convert storage URL to CDN URL
    const cdnUrl = rawUrl.replace(
      "https://api.base44.app/api/apps/69d06ada8019d7e9edf7f8e8/storage/files/",
      "https://media.base44.com/images/public/69d06ada8019d7e9edf7f8e8/"
    );

    const finalUrl = cdnUrl || rawUrl;
    console.log("✅ Done — CDN URL:", finalUrl);
    return Response.json({ url: finalUrl }, { headers: CORS_HEADERS });

  } catch (err: any) {
    console.error("generateAdImage error:", err);
    return Response.json({ error: err.message || "Unknown error. Please try again." }, { status: 500, headers: CORS_HEADERS });
  }
});
