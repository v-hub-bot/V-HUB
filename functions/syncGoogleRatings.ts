// syncGoogleRatings — fetches live Google rating for each provider that has a google_review_url
// Uses Google Places Text Search or Place Details API
// Runs on a schedule (set via automation) — daily recommended

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const GOOGLE_API_KEY = Deno.env.get("GOOGLE_PLACES_API_KEY");

// Extract place_id from a Google Maps URL or Maps search URL
function extractPlaceId(url: string): string | null {
  if (!url) return null;
  // Format: ?cid=XXXXX or /place/... or place_id=XXXXX
  const cidMatch = url.match(/[?&]cid=(\d+)/);
  if (cidMatch) return `cid:${cidMatch[1]}`;
  const placeIdMatch = url.match(/place_id[=:]([A-Za-z0-9_-]+)/);
  if (placeIdMatch) return placeIdMatch[1];
  return null;
}

// Extract the business name from the google_review_url for text search fallback
function extractSearchQuery(url: string, businessName: string): string {
  return businessName;
}

async function getGoogleRating(businessName: string, googleUrl: string): Promise<number | null> {
  if (!GOOGLE_API_KEY) return null;

  // Try Place ID first if extractable
  const placeId = extractPlaceId(googleUrl);
  if (placeId && !placeId.startsWith('cid:')) {
    try {
      const detailsRes = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=rating&key=${GOOGLE_API_KEY}`
      );
      const data = await detailsRes.json();
      if (data.result?.rating) return data.result.rating;
    } catch (_) {}
  }

  // Fallback: Text Search using business name
  try {
    const q = encodeURIComponent(`${businessName} The Villages Florida`);
    const searchRes = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${q}&fields=rating&key=${GOOGLE_API_KEY}`
    );
    const data = await searchRes.json();
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

    // Get all active providers that have a google_review_url
    const allProviders = await sr.entities.Provider.list({ limit: 500 });
    const targets = (allProviders || []).filter(
      (p: any) => p.google_review_url && p.is_active && p.is_visible
    );

    const results: any[] = [];
    let updated = 0;
    let failed = 0;

    for (const prov of targets) {
      try {
        const newRating = await getGoogleRating(prov.business_name, prov.google_review_url);
        if (newRating !== null) {
          const rounded = Math.round(newRating * 10) / 10; // e.g. 4.3
          if (prov.google_rating !== rounded) {
            await sr.entities.Provider.update(prov.id, { google_rating: rounded });
            results.push({ id: prov.id, name: prov.business_name, old: prov.google_rating, new: rounded });
            updated++;
          } else {
            results.push({ id: prov.id, name: prov.business_name, unchanged: rounded });
          }
        } else {
          failed++;
          results.push({ id: prov.id, name: prov.business_name, error: "no rating found" });
        }
        // Small delay to avoid rate limiting
        await new Promise(r => setTimeout(r, 200));
      } catch (err: any) {
        failed++;
        results.push({ id: prov.id, name: prov.business_name, error: err.message });
      }
    }

    return Response.json({
      success: true,
      total: targets.length,
      updated,
      failed,
      results
    }, { headers: CORS_HEADERS });

  } catch (err: any) {
    console.error("syncGoogleRatings error:", err);
    return Response.json({ error: err.message }, { status: 500, headers: CORS_HEADERS });
  }
});
