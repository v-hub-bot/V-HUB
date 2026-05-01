// v13 — gpt-image-1 primary, gpt-image-2 fallback. OpenAI only.
import { createClientFromRequest } from "npm:@base44/sdk@0.8.23";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

async function uploadToCDN(base44: any, imgBlob: Blob, provider_id: string): Promise<string> {
  const filename = `ai_ad_${provider_id}_${Date.now()}.png`;
  try {
    const uploadedFile = await base44.storage.uploadFile(imgBlob, filename);
    if (uploadedFile?.url) {
      console.log("✅ Uploaded to CDN:", uploadedFile.url);
      return uploadedFile.url;
    }
    console.warn("CDN upload returned no URL");
    return "";
  } catch (e) {
    console.error("CDN upload failed:", String(e));
    return "";
  }
}

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

    // Fall back to gpt-image-2 if gpt-image-1 fails
    if (result.error) {
      console.log(`gpt-image-1 failed (${result.error}), trying gpt-image-2...`);
      result = await generateImage("gpt-image-2", fullPrompt, OPENAI_API_KEY);
    }

    if (result.error) {
      return Response.json({ error: result.error }, { status: 500, headers: CORS_HEADERS });
    }

    console.log("✅ Image generated, uploading to CDN...");

    // Convert to blob
    let imgBlob: Blob;
    if (result.b64) {
      const byteArr = Uint8Array.from(atob(result.b64), (c) => c.charCodeAt(0));
      imgBlob = new Blob([byteArr], { type: "image/png" });
    } else {
      const imgResp = await fetch(result.url!);
      const imgBytes = await imgResp.arrayBuffer();
      imgBlob = new Blob([imgBytes], { type: "image/png" });
    }

    // Upload to CDN
    const base44 = createClientFromRequest(req);
    let finalUrl = await uploadToCDN(base44, imgBlob, provider_id);

    // If CDN upload failed, use inline b64 as last resort
    if (!finalUrl) {
      finalUrl = result.b64 ? `data:image/png;base64,${result.b64}` : result.url!;
      console.warn("Using inline fallback URL");
    }

    return Response.json({ url: finalUrl }, { headers: CORS_HEADERS });

  } catch (err: any) {
    console.error("generateAdImage error:", err);
    return Response.json({ error: err.message || "Unknown error. Please try again." }, { status: 500, headers: CORS_HEADERS });
  }
});
