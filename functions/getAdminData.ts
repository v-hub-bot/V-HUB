import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const ALLOWED_ORIGINS = ["https://www.v-hub.us", "https://v-hub-app-edf7f8e8.base44.app"];
const GA_PROP = "properties/534059288";

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

const ADMIN_EMAILS = ["kimberlycook1980@gmail.com", "5bebegurlz@gmail.com", "evansrus@comcast.net"];

async function withRetry<T>(fn: () => Promise<T>, label = "", retries = 3): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try { return await fn(); } catch (e) {
      console.warn(`[retry ${i+1}/${retries}] ${label}:`, (e as any)?.message);
      if (i === retries - 1) throw e;
      await new Promise(r => setTimeout(r, 400 * (i + 1)));
    }
  }
  throw new Error(`${label} failed after ${retries} retries`);
}

async function fetchAllPages(entity: any, label = ""): Promise<any[]> {
  const first = await withRetry(() => entity.list(), label);
  const firstPage = Array.isArray(first) ? first : [];
  if (firstPage.length < 100) return firstPage;
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
      console.error(`[fetchAllPages] ${label} stopped at skip=${skip}:`, (e as any)?.message);
      break;
    }
  }
  return all;
}

async function fetchGA4(accessToken: string, payload: object) {
  try {
    const res = await fetch(`https://analyticsdata.googleapis.com/v1beta/${GA_PROP}:runReport`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    return res.ok ? res.json() : null;
  } catch(e) { return null; }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: getCorsHeaders(req) });
  const CORS = getCorsHeaders(req);

  try {
    const body = await req.json().catch(() => ({}));
    const VALID_PINS = ["1357"];
    const pinOk = body.pin && VALID_PINS.includes(String(body.pin));
    const gaRange = body.gaRange || "30d";
    const gaStartDate = gaRange === "7d" ? "7daysAgo" : gaRange === "24h" ? "1daysAgo" : gaRange === "365d" ? "365daysAgo" : "30daysAgo";

    const base44 = createClientFromRequest(req);
    const sr = base44.asServiceRole;

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
    if (!authorized) return Response.json({ error: "Unauthorized" }, { status: 401, headers: CORS });

    // Fetch GA4 token (non-blocking — if it fails, ga data is null)
    let gaData: any = null;
    try {
      const { accessToken } = await sr.connectors.getConnection("google_analytics");
      const [gaDaily, gaSources, gaDevices, gaPages, gaTotals] = await Promise.all([
        fetchGA4(accessToken, {
          dateRanges:[{startDate:gaStartDate,endDate:"today"}],
          dimensions:[{name:"date"}],
          metrics:[{name:"totalUsers"},{name:"screenPageViews"},{name:"sessions"},{name:"newUsers"},{name:"bounceRate"}],
          orderBys:[{dimension:{dimensionName:"date"}}]
        }),
        fetchGA4(accessToken, {
          dateRanges:[{startDate:gaStartDate,endDate:"today"}],
          dimensions:[{name:"sessionDefaultChannelGroup"}],
          metrics:[{name:"sessions"},{name:"totalUsers"}],
          orderBys:[{metric:{metricName:"sessions"},desc:true}],
          limit:10
        }),
        fetchGA4(accessToken, {
          dateRanges:[{startDate:gaStartDate,endDate:"today"}],
          dimensions:[{name:"deviceCategory"}],
          metrics:[{name:"sessions"},{name:"totalUsers"}]
        }),
        fetchGA4(accessToken, {
          dateRanges:[{startDate:gaStartDate,endDate:"today"}],
          dimensions:[{name:"pagePath"}],
          metrics:[{name:"screenPageViews"},{name:"totalUsers"}],
          orderBys:[{metric:{metricName:"screenPageViews"},desc:true}],
          limit:10
        }),
        fetchGA4(accessToken, {
          dateRanges:[{startDate:gaStartDate,endDate:"today"}],
          metrics:[{name:"totalUsers"},{name:"newUsers"},{name:"sessions"},{name:"screenPageViews"},{name:"bounceRate"},{name:"averageSessionDuration"}]
        })
      ]);

      const daily = (gaDaily?.rows||[]).map((r:any)=>{
        const d=r.dimensionValues[0].value;
        return {date:`${d.slice(0,4)}-${d.slice(4,6)}-${d.slice(6,8)}`,users:+r.metricValues[0].value,pageViews:+r.metricValues[1].value,sessions:+r.metricValues[2].value,newUsers:+r.metricValues[3].value,bounceRate:parseFloat(r.metricValues[4].value)};
      });
      const sources = (gaSources?.rows||[]).map((r:any)=>({channel:r.dimensionValues[0].value,sessions:+r.metricValues[0].value,users:+r.metricValues[1].value}));
      const devices = (gaDevices?.rows||[]).map((r:any)=>({device:r.dimensionValues[0].value,sessions:+r.metricValues[0].value,users:+r.metricValues[1].value}));
      const pages = (gaPages?.rows||[]).map((r:any)=>({path:r.dimensionValues[0].value,views:+r.metricValues[0].value,users:+r.metricValues[1].value}));
      const tv = gaTotals?.rows?.[0]?.metricValues||[];
      const totals = {users:+(tv[0]?.value||0),newUsers:+(tv[1]?.value||0),sessions:+(tv[2]?.value||0),pageViews:+(tv[3]?.value||0),bounceRate:parseFloat(tv[4]?.value||"0"),avgSessionDuration:parseFloat(tv[5]?.value||"0")};
      gaData = { daily, sources, devices, pages, totals, range: gaRange };
    } catch(e) {
      console.warn("[getAdminData] GA4 fetch failed:", (e as any)?.message);
    }

    const [providers, reviews, leads, stats, categories, services, serviceAreas, classifiedAds, analytics] = await Promise.all([
      withRetry(() => sr.entities.Provider.list(), "providers"),
      withRetry(() => sr.entities.ProviderReview.list(), "reviews"),
      withRetry(() => sr.entities.LeadInquiry.list(), "leads"),
      withRetry(() => sr.entities.ServiceSearchStat.list(), "stats"),
      withRetry(() => sr.entities.Category.list(), "categories"),
      withRetry(() => sr.entities.Service.list(), "services"),
      withRetry(() => sr.entities.ServiceArea.list(), "areas"),
      withRetry(() => sr.entities.ClassifiedAd.list(), "classifieds"),
      fetchAllPages(sr.entities.ProviderAnalytic, "analytics"),
    ]);

    const pArr = Array.isArray(providers) ? providers : [];
    const aArr = Array.isArray(analytics) ? analytics : [];
    console.log(`[getAdminData] providers=${pArr.length} analytics=${aArr.length} ga=${gaData?'ok':'unavailable'}`);

    const viewCounts: Record<string,number> = {};
    const searchCounts: Record<string,number> = {};
    const adClickCounts: Record<string,number> = {};
    const leadCounts: Record<string,number> = {};
    for (const a of aArr) {
      if (a.event_type === 'profile_view') viewCounts[a.provider_id] = (viewCounts[a.provider_id]||0)+1;
      else if (a.event_type === 'search_appearance') searchCounts[a.provider_id] = (searchCounts[a.provider_id]||0)+1;
      else if (a.event_type === 'ad_click') adClickCounts[a.provider_id] = (adClickCounts[a.provider_id]||0)+1;
      else if (a.event_type === 'lead_inquiry') leadCounts[a.provider_id] = (leadCounts[a.provider_id]||0)+1;
    }

    const enrichedProviders = pArr.map((p:any) => ({
      ...p,
      profile_views: viewCounts[p.id]||0,
      search_appearances: searchCounts[p.id]||0,
      ad_clicks: adClickCounts[p.id]||0,
      lead_count: leadCounts[p.id]||0,
    }));

    const siteViewsByDay: Record<string,number> = {};
    const searchesByDay: Record<string,number> = {};
    const adClicksByDay: Record<string,number> = {};
    for (const a of aArr) {
      const day = a.date_key || (a.created_date ? String(a.created_date).split("T")[0] : null);
      if (!day) continue;
      if (a.event_type==='profile_view'||a.event_type==='homepage_view') siteViewsByDay[day]=(siteViewsByDay[day]||0)+1;
      else if (a.event_type==='search_appearance') searchesByDay[day]=(searchesByDay[day]||0)+1;
      else if (a.event_type==='ad_click') adClicksByDay[day]=(adClicksByDay[day]||0)+1;
    }

    const totalSiteViews = Object.values(siteViewsByDay).reduce((s,v)=>s+v,0);
    const totalAdClicks = Object.values(adClicksByDay).reduce((s,v)=>s+v,0);

    return Response.json({
      providers: enrichedProviders,
      reviews: Array.isArray(reviews)?reviews:[],
      leads: Array.isArray(leads)?leads:[],
      stats: Array.isArray(stats)?stats:[],
      categories: Array.isArray(categories)?categories:[],
      services: Array.isArray(services)?services:[],
      serviceAreas: Array.isArray(serviceAreas)?serviceAreas:[],
      classifiedAds: Array.isArray(classifiedAds)?classifiedAds:[],
      siteViewsByDay, searchesByDay, adClicksByDay,
      totalSiteViews, totalAdClicks,
      gaData,  // ← real GA4 data (null if unavailable)
    }, { headers: CORS });

  } catch (error) {
    console.error('[getAdminData] error:', error);
    return Response.json({ error: (error as any).message }, { status: 500, headers: CORS });
  }
});
