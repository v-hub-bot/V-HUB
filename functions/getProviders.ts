import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

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

async function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}

// Retry wrapper — handles intermittent 403/429 from service role
async function withRetry<T>(fn: () => Promise<T>, label = "op", maxAttempts = 4): Promise<T> {
  let lastErr: any;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (e: any) {
      lastErr = e;
      const msg = String(e?.message || "");
      const isRetryable = msg.includes("403") || msg.includes("429") || msg.includes("auth_required") || msg.includes("private");
      if (isRetryable && attempt < maxAttempts) {
        const delay = attempt * 500;
        console.log(`[getProviders] ${label} attempt ${attempt} failed (${msg.slice(0,60)}), retrying in ${delay}ms`);
        await sleep(delay);
      } else {
        throw e;
      }
    }
  }
  throw lastErr;
}

async function fetchAllProvidersWithRetry(db: any): Promise<any[]> {
  const PAGE_SIZE = 100;
  let all: any[] = [];
  let skip = 0;
  let pageNum = 0;

  while (true) {
    pageNum++;
    if (pageNum > 30) break;
    const page = await withRetry(() => db.Provider.list({ limit: PAGE_SIZE, skip }), `page-${pageNum}`);
    if (!page || page.length === 0) break;
    all = all.concat(page);
    console.log(`[getProviders] fetched page ${pageNum}: ${page.length} records (total=${all.length})`);
    if (page.length < PAGE_SIZE) break;
    skip += PAGE_SIZE;
  }
  return all;
}

async function fetchAllApprovedReviews(db: any): Promise<any[]> {
  const PAGE_SIZE = 200;
  let all: any[] = [];
  let skip = 0;
  let pageNum = 0;

  while (true) {
    pageNum++;
    if (pageNum > 20) break;
    let page: any[] = [];
    try {
      page = await withRetry(() => db.ProviderReview.filter({ is_approved: true }, { limit: PAGE_SIZE, skip }), `reviews-page-${pageNum}`);
    } catch {
      try {
        page = await withRetry(() => db.ProviderReview.list({ limit: PAGE_SIZE, skip }), `reviews-list-${pageNum}`);
        page = (page || []).filter((r: any) => r.is_approved === true);
      } catch { break; }
    }
    if (!page || page.length === 0) break;
    all = all.concat(page);
    if (page.length < PAGE_SIZE) break;
    skip += PAGE_SIZE;
  }
  console.log(`[getProviders] fetched ${all.length} approved reviews`);
  return all;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });

  try {
    const base44 = createClientFromRequest(req);

    if (req.method === "POST") {
      let body: any = null;
      try { body = await req.json(); } catch { /* no body */ }

      // ── PUBLIC LOOKUP DATA (categories, services, areas) ─────────────
      if (body?.get_lookup_data === true) {
        try {
          const db = base44.asServiceRole.entities;
          const [cats, svcs, areas] = await Promise.all([
            withRetry(() => db.Category.list(), "categories"),
            withRetry(() => db.Service.list(), "services"),
            withRetry(() => db.ServiceArea.list(), "areas"),
          ]);
          return Response.json({ ok: true, categories: cats || [], services: svcs || [], areas: areas || [] }, { headers: CORS });
        } catch (e: any) {
          console.log(`[getProviders] lookup_data error: ${e.message}`);
          return Response.json({ ok: false, error: e.message, categories: [], services: [], areas: [] }, { headers: CORS });
        }
      }

      // ── GET REVIEWS FOR A SPECIFIC PROVIDER (public) ─────────────────
      if (body?.get_reviews === true) {
        const { provider_id } = body;
        if (!provider_id) return Response.json({ error: "Missing provider_id" }, { status: 400, headers: CORS });
        try {
          const db = base44.asServiceRole.entities;
          let reviews: any[] = [];
          try {
            reviews = await withRetry(() => db.ProviderReview.filter({ provider_id, is_approved: true }), "get-reviews-filter");
          } catch {
            const all = await withRetry(() => db.ProviderReview.list({ limit: 500 }), "get-reviews-list");
            reviews = (all || []).filter((r: any) => r.provider_id === provider_id && r.is_approved === true);
          }
          // Sort by helpful_count desc, then created_date desc
          reviews.sort((a: any, b: any) => {
            const hDiff = (b.helpful_count || 0) - (a.helpful_count || 0);
            if (hDiff !== 0) return hDiff;
            return new Date(b.created_date || 0).getTime() - new Date(a.created_date || 0).getTime();
          });
          return Response.json({ success: true, reviews }, { headers: CORS });
        } catch (e: any) {
          console.log(`[getProviders] get_reviews error: ${e.message}`);
          return Response.json({ success: false, error: e.message, reviews: [] }, { headers: CORS });
        }
      }

      // ── PROVIDER SELF-UPDATE (services, areas, profile) ─────────────
      if (body?.provider_update === true) {
        const { provider_id, vh_number, fields } = body;
        if (!provider_id || !vh_number || !fields) {
          return Response.json({ error: "Missing provider_id, vh_number, or fields" }, { status: 400, headers: CORS });
        }
        const db = base44.asServiceRole.entities;
        let rec: any = null;
        try { rec = await withRetry(() => db.Provider.get(provider_id), "get-provider-update"); } catch {}
        if (!rec) return Response.json({ error: "Provider not found" }, { status: 404, headers: CORS });
        if (rec.vh_number !== vh_number) return Response.json({ error: "Unauthorized" }, { status: 401, headers: CORS });

        const ALLOWED = ["business_name","owner_name","phone","email","website",
          "description","address","years_in_business","license_number",
          "google_review_url","services","service_areas","is_mobile","hours_of_operation","google_rating"];
        const safe: any = {};
        for (const k of ALLOWED) { if (k in (fields as any)) safe[k] = (fields as any)[k]; }

        const validId = (id: any) => typeof id === 'string' && /^[0-9a-f]{24}$/.test(id);
        if ('services' in safe) {
          const bad = (safe.services || []).filter((id: any) => !validId(id));
          if (bad.length > 0) return Response.json({ error: `Invalid service IDs: ${bad.join(', ')}` }, { status: 400, headers: CORS });
          safe.services = (safe.services || []).filter(validId);
        }
        if ('service_areas' in safe) {
          const bad = (safe.service_areas || []).filter((id: any) => !validId(id));
          if (bad.length > 0) return Response.json({ error: `Invalid village IDs: ${bad.join(', ')}` }, { status: 400, headers: CORS });
          safe.service_areas = (safe.service_areas || []).filter(validId);
        }
        if (!Object.keys(safe).length) return Response.json({ error: "No valid fields" }, { status: 400, headers: CORS });

        try {
          const updated = await withRetry(() => db.Provider.update(provider_id, safe), "update-provider");
          console.log('[getProviders] provider_update:', provider_id, Object.keys(safe));
          return Response.json({ success: true, record: sanitize(updated) }, { headers: CORS });
        } catch (e: any) {
          return Response.json({ error: e.message || "Update failed" }, { status: 500, headers: CORS });
        }
      }

      // ── SESSION RESTORE ───────────────────────────────────────────────
      if (body?.session_restore === true) {
        const { provider_id } = body;
        if (!provider_id) return Response.json({ error: "Missing provider_id" }, { status: 400, headers: CORS });
        try {
          const prov = await withRetry(() => base44.asServiceRole.entities.Provider.get(provider_id), "session-restore");
          if (!prov) return Response.json({ success: false, error: "Not found" }, { status: 404, headers: CORS });
          return Response.json({ success: true, provider: sanitize(prov) }, { headers: CORS });
        } catch (e: any) {
          return Response.json({ success: false, error: e.message }, { status: 500, headers: CORS });
        }
      }

      // ── LOGIN ─────────────────────────────────────────────────────────
      if (body?.login === true) {
        const { identifier, password } = body;
        if (!identifier?.trim() || !password?.trim()) {
          return Response.json({ error: "Missing credentials" }, { status: 400, headers: CORS });
        }

        const db = base44.asServiceRole.entities;
        const inp = identifier.trim();
        const isVH = /^vh-?\d{4}$/i.test(inp);
        let results: any[] = [];

        if (isVH) {
          const vhNorm = inp.toUpperCase().replace(/^VH(\d)/, "VH-$1");
          results = await withRetry(() => db.Provider.filter({ vh_number: vhNorm }), "login-vh-filter");
        } else {
          const email = inp.toLowerCase();
          const [a, b] = await Promise.all([
            withRetry(() => db.Provider.filter({ login_email: email }), "login-email-a"),
            withRetry(() => db.Provider.filter({ email: email }), "login-email-b"),
          ]);
          const seen = new Set<string>();
          for (const p of [...(a || []), ...(b || [])]) {
            if (!seen.has(p.id)) { seen.add(p.id); results.push(p); }
          }
        }

        if (!results.length) {
          return Response.json({ error: "No account found. Try your email or VH number (e.g. VH-1234), or contact admin@v-hub.us" }, { status: 401, headers: CORS });
        }

        const hashed = await sha256hex(password.trim());
        const prov = results.find(p => {
          const stored = (p.login_password || "").trim();
          if (!stored) return false;
          return stored === password.trim() || stored === hashed;
        });

        if (!prov) {
          const anyNoPass = results.some(p => !p.login_password);
          if (anyNoPass && results.length === 1) {
            return Response.json({ error: "No password set. Use 'Forgot your password?' to create one." }, { status: 401, headers: CORS });
          }
          return Response.json({ error: "Incorrect password. Please try again." }, { status: 401, headers: CORS });
        }

        return Response.json({ success: true, provider: sanitize(prov) }, { status: 200, headers: CORS });
      }
    }

    // ── LISTING MODE ──────────────────────────────────────────────────────
    console.log("[getProviders] Starting provider listing...");
    let providers: any[] = [];

    try {
      try {
        providers = await withRetry(() => base44.asServiceRole.entities.Provider.filter({ is_active: true }), "filter-active");
        console.log(`[getProviders] filter(active) got ${providers.length} providers`);
        const inactive = await withRetry(() => base44.asServiceRole.entities.Provider.filter({ is_active: false }), "filter-inactive").catch(() => []);
        providers = [...providers, ...(inactive || [])];
        console.log(`[getProviders] total with inactive: ${providers.length}`);
      } catch (filterErr: any) {
        console.log(`[getProviders] filter failed (${filterErr.message}), trying list...`);
        providers = await fetchAllProvidersWithRetry(base44.asServiceRole.entities);
      }
      console.log(`[getProviders] final count: ${providers.length}`);
    } catch (e: any) {
      console.log(`[getProviders] fetch failed: ${e.message}`);
      return Response.json({ error: `Fetch failed: ${e.message}`, providers: [], count: 0 }, { status: 500, headers: CORS });
    }

    // ── FETCH ALL APPROVED REVIEWS & ATTACH TO PROVIDERS ─────────────────
    let allReviews: any[] = [];
    try {
      allReviews = await fetchAllApprovedReviews(base44.asServiceRole.entities);
    } catch (e: any) {
      console.log(`[getProviders] reviews fetch failed: ${e.message} — continuing without reviews`);
    }

    // Group reviews by provider_id
    const reviewsByProvider: Record<string, any[]> = {};
    for (const r of allReviews) {
      if (!reviewsByProvider[r.provider_id]) reviewsByProvider[r.provider_id] = [];
      reviewsByProvider[r.provider_id].push(r);
    }

    // Attach reviews to providers and sort providers by rating desc
    const sanitized = providers.map(p => {
      const s = sanitize(p);
      const provReviews = (reviewsByProvider[p.id] || []).sort((a: any, b: any) => {
        const hDiff = (b.helpful_count || 0) - (a.helpful_count || 0);
        if (hDiff !== 0) return hDiff;
        return new Date(b.created_date || 0).getTime() - new Date(a.created_date || 0).getTime();
      });
      s.reviews = provReviews;
      return s;
    });

    // Sort providers by V-Hub rating descending, then by name
    sanitized.sort((a: any, b: any) => {
      const rA = typeof a.rating === 'number' ? a.rating : 0;
      const rB = typeof b.rating === 'number' ? b.rating : 0;
      if (rB !== rA) return rB - rA;
      return (a.business_name || "").localeCompare(b.business_name || "");
    });

    return Response.json({ providers: sanitized, count: sanitized.length }, { headers: CORS });

  } catch (error: any) {
    console.log(`[getProviders] Unhandled error: ${error.message}`);
    return Response.json({ error: error.message, providers: [], count: 0 }, { status: 500, headers: CORS });
  }
});
