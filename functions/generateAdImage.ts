// v5 — correct app ID for storage, convert to media.base44.com CDN URL
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Convert api.base44.app storage URL to media.base44.com CDN URL
function toCDNUrl(apiUrl: string): string {
  // From: https://base44.app/api/apps/APP_ID/files/mp/public/APP_ID/FILENAME
  // Or:   https://api.base44.app/api/apps/APP_ID/files/mp/public/APP_ID/FILENAME
  // To:   https://media.base44.com/images/public/APP_ID/FILENAME
  const match = apiUrl.match(/\/files\/mp\/public\/([^\/]+)\/(.+)$/);
  if (match) {
    return `https://media.base44.com/images/public/${match[1]}/${match[2]}`;
  }
  return apiUrl;
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

    const fullPrompt = `Create a professional, eye-catching advertisement background image for a local service business in The Villages, Florida. ${prompt}. Style: vibrant colors, clean composition, suitable for a weekly deals/promotions advertisement. CRITICAL REQUIREMENT: The image must contain absolutely NO text, NO words, NO letters, NO numbers, NO signs with writing, NO banners with text — zero text of any kind in any language. Pure visual imagery only. No watermarks. High quality photorealistic or illustrated style.`;

    // Step 1: Generate with OpenAI
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

    // Step 2: Download from OpenAI (expires in ~60 min) and re-upload to permanent CDN
    let permanentUrl = tempUrl;
    try {
      const imgResp = await fetch(tempUrl);
      if (imgResp.ok) {
        const imgBytes = new Uint8Array(await imgResp.arrayBuffer());
        const filename = `ai_ad_${provider_id}_${Date.now()}.png`;

        // Upload to mini-app storage (public) — no auth needed for public uploads
        const formData = new FormData();
        formData.append("file", new Blob([imgBytes], { type: "image/png" }), filename);

        const uploadResp = await fetch(
          "https://api.base44.app/api/apps/69d062aca815ce8e697894b1/storage/upload",
          {
            method: "POST",
            headers: { "Authorization": req.headers.get("Authorization") || "" },
            body: formData,
          }
        );

        if (uploadResp.ok) {
          const uploadData = await uploadResp.json();
          if (uploadData.url) {
            // Convert to public CDN URL
            permanentUrl = toCDNUrl(uploadData.url);
            console.log("Image permanently saved to CDN:", permanentUrl);
          } else {
            console.warn("Upload ok but no url in response:", uploadData);
          }
        } else {
          const errText = await uploadResp.text();
          console.warn("Upload failed:", uploadResp.status, errText);
        }
      }
    } catch (uploadErr) {
      console.error("Upload step failed, returning temp URL:", uploadErr);
    }

    // Step 3: Persist to ClassifiedAd entity
    try {
      const base44 = createClientFromRequest(req);
      const existingAds = await base44.asServiceRole.entities.ClassifiedAd.filter({ provider_id });
      if (existingAds && existingAds.length > 0) {
        const latest = existingAds.sort((a: any, b: any) => new Date(b.updated_date).getTime() - new Date(a.updated_date).getTime())[0];
        const savedImages = Array.isArray(latest.saved_images) ? latest.saved_images : [];
        const newSaved = [permanentUrl, ...savedImages.filter((u: string) => u !== permanentUrl)].slice(0, 5);
        await base44.asServiceRole.entities.ClassifiedAd.update(latest.id, {
          saved_images: newSaved,
          image_url: permanentUrl,
        });
        console.log("Saved to ClassifiedAd:", latest.id);
      }
    } catch (dbErr) {
      console.warn("Could not save to DB:", dbErr);
    }

    return Response.json({ url: permanentUrl }, { headers: CORS_HEADERS });

  } catch (err: any) {
    console.error("generateAdImage error:", err);
    return Response.json({ error: err.message || "Unknown error" }, { status: 500, headers: CORS_HEADERS });
  }
});
