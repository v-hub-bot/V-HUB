import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS_HEADERS });

  try {
    const base44 = createClientFromRequest(req);
    const sr = base44.asServiceRole;

    // Fetch all approved reviews
    const reviews = await sr.entities.ProviderReview.filter({ is_approved: true });

    // Group by provider_id and calculate average
    const ratingMap: Record<string, { sum: number; count: number }> = {};
    for (const r of reviews || []) {
      if (!r.provider_id || typeof r.rating !== "number") continue;
      if (!ratingMap[r.provider_id]) ratingMap[r.provider_id] = { sum: 0, count: 0 };
      ratingMap[r.provider_id].sum += r.rating;
      ratingMap[r.provider_id].count += 1;
    }

    // Fetch all active providers
    const providers = await sr.entities.Provider.filter({ is_active: true });

    let updated = 0;
    let cleared = 0;
    const results: any[] = [];

    for (const prov of providers || []) {
      const entry = ratingMap[prov.id];
      if (entry && entry.count > 0) {
        const avg = Math.round((entry.sum / entry.count) * 10) / 10;
        if (prov.rating !== avg) {
          await sr.entities.Provider.update(prov.id, { rating: avg });
          results.push({ name: prov.business_name, rating: avg, reviews: entry.count, status: "updated" });
          updated++;
        } else {
          results.push({ name: prov.business_name, rating: avg, reviews: entry.count, status: "unchanged" });
        }
      } else {
        // No approved reviews — clear the rating so they appear at bottom
        if (prov.rating !== null && prov.rating !== undefined) {
          await sr.entities.Provider.update(prov.id, { rating: null });
          results.push({ name: prov.business_name, status: "cleared" });
          cleared++;
        }
      }
    }

    return Response.json({
      success: true,
      total_providers: (providers || []).length,
      total_reviews: (reviews || []).length,
      updated,
      cleared,
      results
    }, { headers: CORS_HEADERS });

  } catch (err: any) {
    console.error("recalcProviderRatings error:", err);
    return Response.json({ error: err.message }, { status: 500, headers: CORS_HEADERS });
  }
});
