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

// Retry wrapper for flaky SDK calls
async function withRetry<T>(fn: () => Promise<T>, label = "", retries = 3): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try { return await fn(); } catch (e) {
      console.warn(`[retry ${i+1}/${retries}] ${label}:`, e?.message);
      if (i === retries - 1) throw e;
      await new Promise(r => setTimeout(r, 400 * (i + 1)));
    }
  }
  throw new Error(`${label} failed after ${retries} retries`);
}

// Fetch all pages — SDK 0.8.23: call list() with no args for first page, 
// then paginate using filter/skip for subsequent pages
async function fetchAllPages(entity: any, label = ""): Promise<any[]> {
  // First call with no args (golden pattern that works)
  const first = await withRetry(() => entity.list(), label);
  const firstPage = Array.isArray(first) ? first : [];
  
  if (firstPage.length < 100) {
    // Less than 100 records, definitely got everything
    return firstPage;
  }

  // More records may exist — paginate with skip
  let all = [...firstPage];
  let skip = firstPage.length;
  while (true) {
    try {
      const page = await withRetry(() => entity.list({ limit: 500, skip }), `${label}_page_${skip}`);
      const records = Array.isArray(page) ? page : [];
      if (records.length === 0) break;
      all = all.concat(records);
      if (records.length < 500) break;
      skip += records.length;
    } catch(e) {
      console.error(`[fetchAllPages] ${label} stopped at skip=${skip}:`, e?.message);
      break;
    }
  }
  console.log(`[fetchAllPages] ${label}: ${all.length} total records`);
  return all;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: getCorsHeaders(req) });
  }

  const CORS = getCorsHeaders(req);

  try {
    // Read body ONCE
    const body = await req.json().catch(() => ({}));
    const VALID_PINS = ["1357"];
    const pinOk = body.pin && VALID_PINS.includes(String(body.pin));

    const base44 = createClientFromRequest(req);
    const sr = base44.asServiceRole;

    // Auth check
    let authorized = pinOk;
    if (!authorized) {
      try {
        const me = await base44.auth.me();
        if (me?.email && ADMIN_EMAILS.includes(me.email.toLowerCase())) authorized = true;
      } catch (_) {}
    }
    if (!authorized) {
      const origin = req.headers.get("origin") || "";
      if (ALLOWED_ORIGINS.includes(origin)) authorized = true;
    }
    if (!authorized) {
      return Response.json({ error: "Unauthorized" }, { status: 401, headers: CORS });
    }

    // Fetch all entities — small ones use golden no-arg pattern, 
    // ProviderAnalytic needs full pagination
    const [providers, reviews, leads, stats, categories, services, serviceAreas, classifiedAds, analytics] = await Promise.all([
      withRetry(() => sr.entities.Provider.list(), "providers"),
      withRetry(() => sr.entities.ProviderReview.list(), "reviews"),
      withRetry(() => sr.entities.LeadInquiry.list(), "leads"),
      withRetry(() => sr.entities.ServiceSearchStat.list(), "stats"),
      withRetry(() => sr.entities.Category.list(), "categories"),
      withRetry(() => sr.entities.Service.list(), "services"),
      withRetry(() => sr.entities.ServiceArea.list(), "areas"),
      withRetry(() => sr.entities.ClassifiedAd.list(), "classifieds"),
      fetchAllPages(sr.entities.ProviderAnalytic, "analytics"), // needs full pagination
    ]);

    const pArr = Array.isArray(providers) ? providers : [];
    const aArr = Array.isArray(analytics) ? analytics : [];

    console.log(`[getAdminData] providers=${pArr.length} analytics=${aArr.length} reviews=${Array.isArray(reviews)?reviews.length:0}`);

    // Roll up analytics into per-provider counts
    const viewCounts: Record<string, number> = {};
    const searchCounts: Record<string, number> = {};
    for (const a of aArr) {
      if (a.event_type === 'profile_view') {
        viewCounts[a.provider_id] = (viewCounts[a.provider_id] || 0) + 1;
      } else if (a.event_type === 'search_appearance') {
        searchCounts[a.provider_id] = (searchCounts[a.provider_id] || 0) + 1;
      }
    }

    const enrichedProviders = pArr.map((p: any) => ({
      ...p,
      profile_views: viewCounts[p.id] || 0,
      search_appearances: searchCounts[p.id] || 0,
    }));

    return Response.json({
      providers: enrichedProviders,
      reviews: Array.isArray(reviews) ? reviews : [],
      leads: Array.isArray(leads) ? leads : [],
      stats: Array.isArray(stats) ? stats : [],
      categories: Array.isArray(categories) ? categories : [],
      services: Array.isArray(services) ? services : [],
      serviceAreas: Array.isArray(serviceAreas) ? serviceAreas : [],
      classifiedAds: Array.isArray(classifiedAds) ? classifiedAds : [],
    }, { headers: CORS });

  } catch (error) {
    console.error('[getAdminData] error:', error);
    return Response.json({ error: error.message }, { status: 500, headers: CORS });
  }
});
