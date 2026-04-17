import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const GOOGLE_API_KEY = Deno.env.get("GOOGLE_PLACES_API_KEY");

function extractPlaceId(url: string): string | null {
  if (!url) return null;
  const placeIdMatch = url.match(/place_id[=:]([A-Za-z0-9_-]+)/);
  if (placeIdMatch) return placeIdMatch[1];
  const cidMatch = url.match(/[?&]cid=(\d+)/);
  if (cidMatch) return null; // cid needs text search
  return null;
}

async function getGoogleRating(businessName: string, googleUrl: string): Promise<number | null> {
  if (!GOOGLE_API_KEY) return null;

  // Try Place ID first if extractable from URL
  const placeId = extractPlaceId(googleUrl);
  if (placeId) {
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=rating&key=${GOOGLE_API_KEY}`
      );
      const data = await res.json();
      if (data.result?.rating) return data.result.rating;
    } catch (_) {}
  }

  // Fallback: Text Search by business name
  try {
    const q = encodeURIComponent(`${businessName} The Villages Florida`);
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${q}&key=${GOOGLE_API_KEY}`
    );
    const data = await res.json();
    if (data.results?.[0]?.rating) return data.results[0].rating;
  } catch (_) {}

  return null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS_HEADERS });

  try {
    const base44 = createClientFromRequest(req);
    const sr = base44.asServiceRole;

    if (!GOOGLE_API_KEY) {
      return Response.json({ error: "GOOGLE_PLACES_API_KEY not configured" }, { status: 400, headers: CORS_HEADERS });
    }

    // Use filter to get providers with a google_review_url
    const allProviders = await sr.entities.Provider.filter({ is_active: true, is_visible: true });
    const targets = (allProviders || []).filter((p: any) => p.google_review_url && p.google_review_url.trim() !== "");

    console.log(`Found ${targets.length} providers with Google URLs`);

    const results: any[] = [];
    let updated = 0;
    let failed = 0;

    for (const prov of targets) {
      try {
        console.log(`Syncing: ${prov.business_name} — ${prov.google_review_url}`);
        const newRating = await getGoogleRating(prov.business_name, prov.google_review_url);
        if (newRating !== null) {
          const rounded = Math.round(newRating * 10) / 10;
          if (prov.google_rating !== rounded) {
            await sr.entities.Provider.update(prov.id, { google_rating: rounded });
            results.push({ name: prov.business_name, old: prov.google_rating, new: rounded, status: "updated" });
            updated++;
          } else {
            results.push({ name: prov.business_name, rating: rounded, status: "unchanged" });
          }
        } else {
          failed++;
          results.push({ name: prov.business_name, status: "no_rating_found" });
        }
        await new Promise(r => setTimeout(r, 200));
      } catch (err: any) {
        failed++;
        results.push({ name: prov.business_name, status: "error", error: err.message });
      }
    }

    return Response.json({ success: true, total: targets.length, updated, failed, results }, { headers: CORS_HEADERS });

  } catch (err: any) {
    console.error("syncGoogleRatings error:", err);
    return Response.json({ error: err.message }, { status: 500, headers: CORS_HEADERS });
  }
});
