// v25 — gpt-image-1 low quality + SDK storage upload — returns clean CDN URL
// Also handles upload_only mode for manual file uploads from the ad builder
import { createClientFromRequest } from "npm:@base44/sdk@0.8.23";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

async function uploadB64ToCDN(b64: string, provider_id: string, base44: any): Promise<string | null> {
  try {
    const byteArray = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
    const blob = new Blob([byteArray], { type: "image/png" });
    const filename = `ai_ad_${provider_id}_${Date.now()}.png`;
    const file = new File([blob], filename, { type: "image/png" });
    const uploadResult = await base44.asServiceRole.storage.upload(file);
    return uploadResult?.url || uploadResult?.file_url || null;
  } catch (err: any) {
    console.error("SDK upload error:", err?.message);
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS_HEADERS });

  try {
    const body = await req.json().catch(() => ({}));
    const { prompt, provider_id, upload_only, b64_png } = body;

    const base44 = createClientFromRequest(req);

    // ── Upload-only mode (manual file upload from ad builder) ──
    if (upload_only && b64_png && provider_id) {
      console.log("Upload-only mode...");
      const cdnUrl = await uploadB64ToCDN(b64_png, provider_id, base44);
      if (cdnUrl) {
        console.log("✅ Upload-only success:", cdnUrl);
        return Response.json({ url: cdnUrl }, { headers: CORS_HEADERS });
      }
      return Response.json({ error: "Upload failed" }, { status: 500, headers: CORS_HEADERS });
    }

    // ── Normal AI generation mode ──
    if (!prompt) return Response.json({ error: "Prompt is required" }, { status: 400, headers: CORS_HEADERS });
    if (!provider_id) return Response.json({ error: "Provider ID required" }, { status: 400, headers: CORS_HEADERS });

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) return Response.json({ error: "OpenAI API key not configured" }, { status: 500, headers: CORS_HEADERS });

    const fullPrompt = `Create a professional, eye-catching advertisement image for a local service business in The Villages, Florida. ${prompt}. Style: vibrant colors, photorealistic photography, clean composition, suitable for a weekly deals/promotions advertisement. The image must contain absolutely NO text, NO words, NO letters, NO numbers, NO signs with writing — zero text of any kind. Pure visual imagery only. No watermarks. Photorealistic style only — NOT cartoon, NOT illustrated, NOT animated.`;

    // Step 1: Generate image with OpenAI (low quality = fastest ~10-15s)
    console.log("Generating with gpt-image-1 (low quality)...");
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
    console.log("✅ Image generated, uploading to CDN...");

    // Step 2: Upload to CDN via SDK
    const cdnUrl = await uploadB64ToCDN(b64, provider_id, base44);
    if (cdnUrl) {
      console.log("✅ CDN upload success:", cdnUrl);
      return Response.json({ url: cdnUrl }, { headers: CORS_HEADERS });
    }

    // Fallback: return base64 (preview will work, save will store as-is)
    console.log("⚠️ CDN upload failed — returning base64 fallback");
    return Response.json({ url: `data:image/png;base64,${b64}` }, { headers: CORS_HEADERS });

  } catch (err: any) {
    console.error("generateAdImage error:", err);
    return Response.json({ error: err.message || "Unknown error. Please try again." }, { status: 500, headers: CORS_HEADERS });
  }
});
