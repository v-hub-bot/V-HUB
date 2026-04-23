import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const ALLOWED_ORIGINS = ["https://www.v-hub.us", "https://v-hub-app-edf7f8e8.base44.app"];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("origin") || "";
  const allowed = ALLOWED_ORIGINS.includes(origin) || origin === "";
  return {
    "Access-Control-Allow-Origin": allowed ? origin || ALLOWED_ORIGINS[0] : "null",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Vary": "Origin",
  };
}

const ADMIN_EMAILS = ["kimberlycook1980@gmail.com", "5bebegurlz@gmail.com"];

// Fetch ALL records from an entity — the SDK .list() returns an array directly
// Use limit=500 to get everything in one shot for entities under 500 records
async function fetchAll(entity: any): Promise<any[]> {
  const result = await entity.list({ limit: 500 });
  // SDK returns array directly
  if (Array.isArray(result)) return result;
  // Fallback for any wrapper format
  if (result?.records) return result.records;
  if (result?.data) return result.data;
  return [];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: getCorsHeaders(req) });
  }

  try {
    const base44 = createClientFromRequest(req);

    // Check if logged-in user is an admin
    let userIsAdmin = false;
    try {
      const me = await base44.auth.me();
      if (me?.email && ADMIN_EMAILS.includes(me.email.toLowerCase())) {
        userIsAdmin = true;
      }
    } catch (_) {}

    // Also accept a legacy PIN for backward compatibility
    let pinProvided = false;
    try {
      const body = await req.json().catch(() => ({}));
      const VALID_PINS = ["1357"];
      if (body.pin && VALID_PINS.includes(String(body.pin))) pinProvided = true;
    } catch (_) {}

    if (!userIsAdmin && !pinProvided) {
      const origin = req.headers.get("origin") || "";
      if (!ALLOWED_ORIGINS.includes(origin) && origin !== "") {
        return Response.json({ error: "Unauthorized" }, { status: 401, headers: getCorsHeaders(req) });
      }
    }

    const sr = base44.asServiceRole;

    // Fetch all records with limit=500 to avoid the default 100-record cap
    const [providers, reviews, leads, stats, categories, services, serviceAreas, classifiedAds, analytics] = await Promise.all([
      fetchAll(sr.entities.Provider),
      fetchAll(sr.entities.ProviderReview),
      fetchAll(sr.entities.LeadInquiry),
      fetchAll(sr.entities.ServiceSearchStat),
      fetchAll(sr.entities.Category),
      fetchAll(sr.entities.Service),
      fetchAll(sr.entities.ServiceArea),   // was capped at 100, now gets all 114+
      fetchAll(sr.entities.ClassifiedAd),
      fetchAll(sr.entities.ProviderAnalytic),
    ]);

    // Roll up analytics into per-provider counts
    const viewCounts: Record<string, number> = {};
    const searchCounts: Record<string, number> = {};
    for (const a of (analytics || [])) {
      if (a.event_type === 'profile_view') {
        viewCounts[a.provider_id] = (viewCounts[a.provider_id] || 0) + 1;
      } else if (a.event_type === 'search_appearance') {
        searchCounts[a.provider_id] = (searchCounts[a.provider_id] || 0) + 1;
      }
    }

    // Inject analytics counts into provider records
    const enrichedProviders = (providers || []).map((p: any) => ({
      ...p,
      profile_views: viewCounts[p.id] || 0,
      search_appearances: searchCounts[p.id] || 0,
    }));

    return Response.json({
      providers: enrichedProviders,
      reviews: reviews || [],
      leads: leads || [],
      stats: stats || [],
      categories: categories || [],
      services: services || [],
      serviceAreas: serviceAreas || [],
      classifiedAds: classifiedAds || [],
    }, { headers: getCorsHeaders(req) });
  } catch (error) {
    console.error('getAdminData error:', error);
    return Response.json({ error: error.message }, { status: 500, headers: getCorsHeaders(req) });
  }
});
