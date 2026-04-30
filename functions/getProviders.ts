import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const SENSITIVE_FIELDS = ['login_email', 'login_password', 'stripe_customer_id', 'stripe_subscription_id', 'notes', 'classifieds_stripe_subscription_id'];
const APP_ID = "69d062aca815ce8e697894b1";

function sanitize(provider: any) {
  const p = { ...provider };
  for (const field of SENSITIVE_FIELDS) delete p[field];
  return p;
}

async function sha256hex(plain: string): Promise<string> {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest("SHA-256", enc.encode(plain));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-base44-app-id",
};

async function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

async function withRetry<T>(fn: () => Promise<T>, label = "op", maxAttempts = 3): Promise<T> {
  let lastErr: any;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try { return await fn(); } catch (e: any) {
      lastErr = e;
      if (attempt < maxAttempts) await sleep(attempt * 400);
      else throw e;
    }
  }
  throw lastErr;
}

// Fetch all pages of an entity via direct REST API (bypasses SDK auth issues)
async function fetchAllPages(entity: string, pageSize = 100): Promise<any[]> {
  const results: any[] = [];
  let skip = 0;
  for (let page = 1; page <= 30; page++) {
    const resp = await fetch(
      `https://api.base44.app/api/apps/${APP_ID}/entities/${entity}?limit=${pageSize}&skip=${skip}`,
      { headers: { "Content-Type": "application/json", "x-base44-app-id": APP_ID } }
    );
    if (!resp.ok) {
      console.error(`[getProviders] fetchAllPages ${entity} failed: ${resp.status}`);
      break;
    }
    const data = await resp.json();
    const chunk = Array.isArray(data) ? data : (data.results || data.records || []);
    if (!chunk || chunk.length === 0) break;
    results.push(...chunk);
    if (chunk.length < pageSize) break;
    skip += pageSize;
  }
  return results;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });

  try {
    if (req.method !== "POST") return Response.json({ error: "Method not allowed" }, { status: 405, headers: CORS });

    const sr = createClientFromRequest(req).asServiceRole;

    let body: any = null;
    try { body = await req.json(); } catch {}

    // ── LOOKUP DATA ───────────────────────────────────────────────────
    if (body?.get_lookup_data === true) {
      try {
        const [cats, svcs, areas] = await Promise.all([
          withRetry(() => sr.entities.Category.list({ limit: 200 }), "cats"),
          withRetry(() => sr.entities.Service.list({ limit: 500 }), "svcs"),
          withRetry(() => sr.entities.ServiceArea.list({ limit: 500 }), "areas"),
        ]);
        return Response.json({ ok: true, categories: cats||[], services: svcs||[], areas: areas||[] }, { headers: CORS });
      } catch (e: any) {
        return Response.json({ ok: false, error: e.message, categories: [], services: [], areas: [] }, { headers: CORS });
      }
    }

    // ── REVIEWS ───────────────────────────────────────────────────────
    if (body?.get_reviews === true) {
      const { provider_id } = body;
      if (!provider_id) return Response.json({ error: "Missing provider_id" }, { status: 400, headers: CORS });
      try {
        let reviews: any[] = [];
        try {
          reviews = await withRetry(() => sr.entities.ProviderReview.filter({ provider_id, is_approved: true }), "reviews");
        } catch {
          const all = await withRetry(() => sr.entities.ProviderReview.list({ limit: 500 }), "reviews-list");
          reviews = (all||[]).filter((r:any) => r.provider_id === provider_id && r.is_approved === true);
        }
        reviews.sort((a:any,b:any) => {
          const h = (b.helpful_count||0)-(a.helpful_count||0);
          return h !== 0 ? h : new Date(b.created_date||0).getTime()-new Date(a.created_date||0).getTime();
        });
        return Response.json({ success: true, reviews: reviews.map(({customer_name,...r}:any) => r) }, { headers: CORS });
      } catch (e: any) {
        return Response.json({ success: false, error: e.message, reviews: [] }, { headers: CORS });
      }
    }

    // ── GET SINGLE PROVIDER BY ID ──────────────────────────────────────
    if (body?.get_single === true) {
      const { provider_id } = body;
      if (!provider_id) return Response.json({ error: "Missing provider_id" }, { status: 400, headers: CORS });
      try {
        const prov = await withRetry(() => sr.entities.Provider.get(provider_id), "get-single");
        if (!prov) return Response.json({ error: "Not found" }, { status: 404, headers: CORS });
        let reviews: any[] = [];
        try {
          reviews = await withRetry(() => sr.entities.ProviderReview.filter({ provider_id, is_approved: true }), "single-reviews");
        } catch {}
        reviews.sort((a:any,b:any) => (b.helpful_count||0)-(a.helpful_count||0));
        let rating = prov.rating || 0;
        if (reviews.length > 0) {
          const avg = reviews.reduce((s:number,r:any)=>s+(r.rating||0),0)/reviews.length;
          rating = Math.round(avg*10)/10;
        }
        return Response.json({ provider: { ...sanitize(prov), reviews, rating } }, { headers: CORS });
      } catch (e: any) {
        return Response.json({ error: e.message }, { status: 500, headers: CORS });
      }
    }

    // ── PROVIDER SELF-UPDATE ──────────────────────────────────────────
    if (body?.provider_update === true) {
      const { provider_id, vh_number, fields } = body;
      if (!provider_id || !vh_number || !fields) return Response.json({ error: "Missing fields" }, { status: 400, headers: CORS });
      let rec: any = null;
      try { rec = await withRetry(() => sr.entities.Provider.get(provider_id), "get-prov"); } catch {}
      if (!rec) return Response.json({ error: "Provider not found" }, { status: 404, headers: CORS });
      if (rec.vh_number !== vh_number) return Response.json({ error: "Unauthorized" }, { status: 401, headers: CORS });
      const ALLOWED = ["business_name","owner_name","phone","email","website","description","address","years_in_business","license_number","google_review_url","services","service_areas","is_mobile","hours_of_operation","google_rating"];
      const safe: any = {};
      for (const k of ALLOWED) { if (k in (fields as any)) safe[k] = (fields as any)[k]; }
      const validId = (id: any) => typeof id === 'string' && /^[0-9a-f]{24}$/.test(id);
      if ('services' in safe) safe.services = (safe.services||[]).filter(validId);
      if ('service_areas' in safe) safe.service_areas = (safe.service_areas||[]).filter(validId);
      if (!Object.keys(safe).length) return Response.json({ error: "No valid fields" }, { status: 400, headers: CORS });
      try {
        const updated = await withRetry(() => sr.entities.Provider.update(provider_id, safe), "update");
        return Response.json({ success: true, record: sanitize(updated) }, { headers: CORS });
      } catch (e: any) {
        return Response.json({ error: e.message||"Update failed" }, { status: 500, headers: CORS });
      }
    }

    // ── SESSION RESTORE ───────────────────────────────────────────────
    if (body?.session_restore === true) {
      const { provider_id } = body;
      if (!provider_id) return Response.json({ error: "Missing provider_id" }, { status: 400, headers: CORS });
      try {
        const prov = await withRetry(() => sr.entities.Provider.get(provider_id), "session");
        if (!prov) return Response.json({ success: false, error: "Not found" }, { status: 404, headers: CORS });
        return Response.json({ success: true, provider: sanitize(prov) }, { headers: CORS });
      } catch (e: any) {
        return Response.json({ success: false, error: e.message }, { status: 500, headers: CORS });
      }
    }

    // ── LOGIN ─────────────────────────────────────────────────────────
    if (body?.login === true) {
      const { identifier, password } = body;
      if (!identifier?.trim() || !password?.trim()) return Response.json({ error: "Missing credentials" }, { status: 400, headers: CORS });
      const inp = identifier.trim();
      const isVH = /^VH-/i.test(inp);
      let loginResults: any[] = [];
      if (isVH) {
        const vhNorm = inp.toUpperCase().replace(/^VH(\d)/, "VH-$1");
        loginResults = await withRetry(() => sr.entities.Provider.filter({ vh_number: vhNorm }), "login-vh");
      } else {
        loginResults = await withRetry(() => sr.entities.Provider.filter({ login_email: inp.toLowerCase() }), "login-email");
        if (!loginResults?.length) loginResults = await withRetry(() => sr.entities.Provider.filter({ email: inp.toLowerCase() }), "login-email2");
      }
      if (!loginResults?.length) return Response.json({ error: "No account found with that email or VH number." }, { status: 401, headers: CORS });
      const hash = await sha256hex(password.trim());
      const match = loginResults.find((p: any) => p.login_password === hash);
      if (!match) return Response.json({ error: "Incorrect password. Please try again or use Forgot Password." }, { status: 401, headers: CORS });
      return Response.json({ success: true, provider: sanitize(match) }, { headers: CORS });
    }

    // ── MAIN PROVIDER LIST ────────────────────────────────────────────
    // Primary: SDK asServiceRole. Fallback: direct REST API (bypasses SDK auth flakiness)
    let providers: any[] = [];

    try {
      let skip = 0;
      const PAGE_SIZE = 100;
      for (let page = 1; page <= 30; page++) {
        const chunk = await sr.entities.Provider.list({ limit: PAGE_SIZE, skip });
        if (!chunk || chunk.length === 0) break;
        providers = providers.concat(chunk);
        if (chunk.length < PAGE_SIZE) break;
        skip += PAGE_SIZE;
      }
      console.log(`[getProviders] SDK loaded ${providers.length} providers`);
    } catch (e: any) {
      console.warn("[getProviders] SDK failed, trying direct REST:", e.message);
    }

    if (providers.length === 0) {
      console.log("[getProviders] Using direct REST API fallback");
      providers = await fetchAllPages("Provider", 100);
      console.log(`[getProviders] REST API loaded ${providers.length} providers`);
    }

    // Fetch approved reviews — use direct REST API (SDK auth flaky)
    let allReviews: any[] = [];
    try {
      const allRevs = await fetchAllPages("ProviderReview", 200);
      allReviews = allRevs.filter((r: any) => r.is_approved === true);
      console.log(`[getProviders] loaded ${allReviews.length} approved reviews`);
    } catch (e: any) {
      console.warn("[getProviders] reviews fetch failed:", e.message);
    }

    const reviewMap: Record<string, any[]> = {};
    for (const r of allReviews) {
      if (!reviewMap[r.provider_id]) reviewMap[r.provider_id] = [];
      reviewMap[r.provider_id].push(r);
    }

    const enriched = providers.map((p: any) => {
      const reviews = reviewMap[p.id] || [];
      let rating = p.rating || 0;
      if (reviews.length > 0) {
        const avg = reviews.reduce((s:number,r:any)=>s+(r.rating||0),0)/reviews.length;
        rating = Math.round(avg*10)/10;
      }
      return { ...sanitize(p), reviews, rating };
    });

    console.log(`[getProviders] returning ${enriched.length} providers, ${allReviews.length} reviews`);
    return Response.json({ providers: enriched }, { headers: CORS });

  } catch (e: any) {
    console.error("[getProviders] unhandled:", e);
    return Response.json({ error: e.message||"Internal server error" }, { status: 500, headers: CORS });
  }
});
