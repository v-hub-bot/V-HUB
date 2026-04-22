import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// V2 - uses createClientFromRequest instead of hardcoded srPublic

const SENSITIVE_FIELDS = ['login_email', 'login_password', 'stripe_customer_id', 'stripe_subscription_id', 'notes', 'classifieds_stripe_subscription_id'];

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

async function withRetry<T>(fn: () => Promise<T>, label = "op", maxAttempts = 4): Promise<T> {
  let lastErr: any;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try { return await fn(); } catch (e: any) {
      lastErr = e;
      const msg = String(e?.message || "");
      const isRetryable = msg.includes("403") || msg.includes("401") || msg.includes("429") || msg.includes("auth_required") || msg.includes("private") || msg.includes("Authentication");
      if (isRetryable && attempt < maxAttempts) { await sleep(attempt * 500); }
      else { throw e; }
    }
  }
  throw lastErr;
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
        console.log(`[getProviders] lookup: cats=${(cats||[]).length} svcs=${(svcs||[]).length} areas=${(areas||[]).length}`);
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

    // ── PROVIDER SELF-UPDATE ──────────────────────────────────────────
    if (body?.provider_update === true) {
      const { provider_id, vh_number, fields } = body;
      if (!provider_id || !vh_number || !fields) return Response.json({ error: "Missing fields" }, { status: 400, headers: CORS });
      let rec: any = null;
      try { rec = await withRetry(() => sr.entities.Provider.get(provider_id), "get-prov"); } catch {}
      if (!rec) return Response.json({ error: "Provider not found" }, { status: 404, headers: CORS });
      if (rec.vh_number !== vh_number) return Response.json({ error: "Unauthorized" }, { status: 401, headers: CORS });
      const ALLOWED = ["business_name","owner_name","phone","email","website","description","address","years_in_business","license_number","google_review_url","services","service_areas","is_mobile","hours_of_operation","google_rating"];
      const safe: any = {}; for (const k of ALLOWED) { if (k in (fields as any)) safe[k] = (fields as any)[k]; }
      const validId = (id: any) => typeof id === 'string' && /^[0-9a-f]{24}$/.test(id);
      if ('services' in safe) {
        const bad = (safe.services||[]).filter((id:any)=>!validId(id));
        if (bad.length > 0) return Response.json({ error: `Invalid service IDs: ${bad.join(', ')}` }, { status: 400, headers: CORS });
        safe.services = (safe.services||[]).filter(validId);
      }
      if ('service_areas' in safe) {
        const bad = (safe.service_areas||[]).filter((id:any)=>!validId(id));
        if (bad.length > 0) return Response.json({ error: `Invalid village IDs: ${bad.join(', ')}` }, { status: 400, headers: CORS });
        safe.service_areas = (safe.service_areas||[]).filter(validId);
      }
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
      let results: any[] = [];
      if (isVH) {
        const vhNorm = inp.toUpperCase().replace(/^VH(\d)/, "VH-$1");
        results = await withRetry(() => sr.entities.Provider.filter({ vh_number: vhNorm }), "login-vh");
      } else {
        results = await withRetry(() => sr.entities.Provider.filter({ login_email: inp.toLowerCase() }), "login-email");
        if (!results?.length) results = await withRetry(() => sr.entities.Provider.filter({ email: inp.toLowerCase() }), "login-email2");
      }
      if (!results?.length) return Response.json({ error: "No account found with that email or VH number." }, { status: 401, headers: CORS });
      const hash = await sha256hex(password.trim());
      const match = results.find((p: any) => p.login_password === hash);
      if (!match) return Response.json({ error: "Incorrect password. Please try again or use Forgot Password." }, { status: 401, headers: CORS });
      return Response.json({ success: true, provider: sanitize(match) }, { headers: CORS });
    }

    // ── MAIN PROVIDER LIST ────────────────────────────────────────────
    const PAGE_SIZE = 100;
    let providers: any[] = [];
    let skip = 0;
    for (let page = 1; page <= 30; page++) {
      const chunk = await withRetry(() => sr.entities.Provider.list({ limit: PAGE_SIZE, skip }), `page-${page}`).catch(() => []);
      if (!chunk || chunk.length === 0) break;
      providers = providers.concat(chunk);
      if (chunk.length < PAGE_SIZE) break;
      skip += PAGE_SIZE;
    }

    // Fetch approved reviews
    let allReviews: any[] = [];
    try {
      let rSkip = 0;
      for (let page = 1; page <= 20; page++) {
        let chunk: any[] = [];
        try { chunk = await withRetry(() => sr.entities.ProviderReview.filter({ is_approved: true }, { limit: 200, skip: rSkip }), `rev-${page}`); }
        catch { chunk = (await withRetry(() => sr.entities.ProviderReview.list({ limit: 200, skip: rSkip }), `rev-list-${page}`).catch(()=>[])).filter((r:any)=>r.is_approved===true); }
        if (!chunk || chunk.length === 0) break;
        allReviews = allReviews.concat(chunk);
        if (chunk.length < 200) break;
        rSkip += 200;
      }
    } catch { /* reviews optional */ }

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
