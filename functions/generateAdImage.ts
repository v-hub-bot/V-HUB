// v26 — gpt-image-1 with reference image support (edits endpoint)
// If reference_image_url is provided, uses /images/edits to blend prompt + photo
// Otherwise falls back to pure /images/generations
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

async function fetchImageAsBlob(url: string): Promise<Blob | null> {
  try {
    const resp = await fetch(url, { headers: { "User-Agent": "V-HUB/1.0" } });
    if (!resp.ok) { console.error("Failed to fetch reference image:", resp.status); return null; }
    const contentType = resp.headers.get("content-type") || "image/png";
    const buffer = await resp.arrayBuffer();
    return new Blob([buffer], { type: contentType });
  } catch (err: any) {
    console.error("fetchImageAsBlob error:", err?.message);
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS_HEADERS });

  try {
    const body = await req.json().catch(() => ({}));
    const { prompt, provider_id, upload_only, b64_png, reference_image_url } = body;

    const base44 = createClientFromRequest(req);

    // ── Upload-only mode ──────────────────────────────────────────────────
    if (upload_only && b64_png && provider_id) {
      console.log("Upload-only mode...");
      const cdnUrl = await uploadB64ToCDN(b64_png, provider_id, base44);
      if (cdnUrl) {
        console.log("✅ Upload-only success:", cdnUrl);
        return Response.json({ url: cdnUrl }, { headers: CORS_HEADERS });
      }
      return Response.json({ error: "Upload failed" }, { status: 500, headers: CORS_HEADERS });
    }

    // ── Validate inputs ───────────────────────────────────────────────────
    if (!prompt) return Response.json({ error: "Prompt is required" }, { status: 400, headers: CORS_HEADERS });
    if (!provider_id) return Response.json({ error: "Provider ID required" }, { status: 400, headers: CORS_HEADERS });

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) return Response.json({ error: "OpenAI API key not configured" }, { status: 500, headers: CORS_HEADERS });

    const fullPrompt = `Create a professional, eye-catching advertisement image for a local service business in The Villages, Florida. ${prompt}. Style: vibrant colors, photorealistic photography, clean composition, suitable for a weekly deals/promotions advertisement. The image must contain absolutely NO text, NO words, NO letters, NO numbers, NO signs with writing — zero text of any kind. Pure visual imagery only. No watermarks. Photorealistic style only — NOT cartoon, NOT illustrated, NOT animated.`;

    let b64: string | null = null;

    // ── Mode A: Image + Prompt (edits endpoint) ───────────────────────────
    if (reference_image_url) {
      console.log("Using gpt-image-1 edits endpoint with reference image...");
      const refBlob = await fetchImageAsBlob(reference_image_url);

      if (refBlob) {
        const fd = new FormData();
        fd.append("model", "gpt-image-1");
        fd.append("prompt", fullPrompt);
        fd.append("n", "1");
        fd.append("size", "1024x1024");
        fd.append("quality", "low");
        // Append the reference image — gpt-image-1 edits uses 'image[]' or 'image'
        fd.append("image", refBlob, "reference.png");

        const resp = await fetch("https://api.openai.com/v1/images/edits", {
          method: "POST",
          headers: { "Authorization": `Bearer ${OPENAI_API_KEY}` },
          body: fd,
        });

        if (resp.ok) {
          const data = await resp.json();
          b64 = data?.data?.[0]?.b64_json || null;
          if (b64) {
            console.log("✅ Image edit generated successfully");
          } else {
            console.warn("⚠️ Edits endpoint returned no b64, falling back to generations...");
          }
        } else {
          const errBody = await resp.json().catch(() => ({}));
          console.warn("⚠️ Edits endpoint failed:", errBody?.error?.message, "— falling back to generations");
        }
      } else {
        console.warn("⚠️ Could not fetch reference image — falling back to generations");
      }
    }

    // ── Mode B: Prompt only (generations endpoint) — also used as fallback ─
    if (!b64) {
      console.log("Using gpt-image-1 generations endpoint (prompt only)...");
      const resp = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: { "Authorization": `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "gpt-image-1", prompt: fullPrompt, n: 1, size: "1024x1024", quality: "low" }),
      });

      if (!resp.ok) {
        const errBody = await resp.json().catch(() => ({}));
        const msg = errBody?.error?.message || `gpt-image-1 failed (${resp.status})`;
        console.error("generations error:", msg);
        return Response.json({ error: msg }, { status: 500, headers: CORS_HEADERS });
      }

      const data = await resp.json();
      b64 = data?.data?.[0]?.b64_json || null;
    }

    if (!b64) {
      return Response.json({ error: "No image returned from OpenAI" }, { status: 500, headers: CORS_HEADERS });
    }

    console.log("✅ Image ready, uploading to CDN...");
    const cdnUrl = await uploadB64ToCDN(b64, provider_id, base44);
    if (cdnUrl) {
      console.log("✅ CDN upload success:", cdnUrl);
      return Response.json({ url: cdnUrl }, { headers: CORS_HEADERS });
    }

    // Fallback: return base64 directly
    console.log("⚠️ CDN upload failed — returning base64 fallback");
    return Response.json({ url: `data:image/png;base64,${b64}` }, { headers: CORS_HEADERS });

  } catch (err: any) {
    console.error("generateAdImage error:", err);
    return Response.json({ error: err.message || "Unknown error. Please try again." }, { status: 500, headers: CORS_HEADERS });
  }
});
