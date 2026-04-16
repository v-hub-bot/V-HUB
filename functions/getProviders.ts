import { createClientFromRequest, createClient } from 'npm:@base44/sdk@0.8.25';

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

async function fetchAllProvidersWithRetry(db: any): Promise<any[]> {
  const PAGE_SIZE = 100;
  let all: any[] = [];
  let skip = 0;
  let pageNum = 0;

  while (true) {
    pageNum++;
    if (pageNum > 30) break;
    let page: any[] | null = null;
    let lastErr: any = null;
    for (let attempt = 1; attempt <= 4; attempt++) {
      try {
        page = await db.Provider.list({ limit: PAGE_SIZE, skip });
        break;
      } catch (e: any) {
        lastErr = e;
        const msg = String(e?.message || "");
        if (msg.includes("429") && attempt < 4) {
          console.log(`[getProviders] 429 on page ${pageNum} attempt ${attempt}, retrying in ${attempt * 600}ms`);
          await sleep(attempt * 600);
        } else {
          throw e;
        }
      }
    }
    if (!page || page.length === 0) break;
    all = all.concat(page);
    console.log(`[getProviders] fetched page ${pageNum}: ${page.length} records (total=${all.length})`);
    if (page.length < PAGE_SIZE) break;
    skip += PAGE_SIZE;
  }
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
            db.Category.list().catch(() => []),
            db.Service.list().catch(() => []),
            db.ServiceArea.list().catch(() => []),
          ]);
          return Response.json({ ok: true, categories: cats || [], services: svcs || [], areas: areas || [] }, { headers: CORS });
        } catch (e: any) {
          return Response.json({ ok: false, error: e.message, categories: [], services: [], areas: [] }, { headers: CORS });
        }
      }

      // ── SESSION RESTORE ───────────────────────────────────────────────
      if (body?.session_restore === true) {
        const { provider_id } = body;
        if (!provider_id) return Response.json({ error: "Missing provider_id" }, { status: 400, headers: CORS });
        try {
          const prov = await base44.asServiceRole.entities.Provider.get(provider_id);
          if (!prov) return Response.json({ success: false, error: "Not found" }, { status: 404, headers: CORS });
          return Response.json({ success: true, provider: sanitize(prov) }, { status: 200, headers: CORS });
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
          results = await db.Provider.filter({ vh_number: vhNorm });
        } else {
          const email = inp.toLowerCase();
          const a = await db.Provider.filter({ login_email: email });
          const b = await db.Provider.filter({ email: email });
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
    const usedFallback = false;

    try {
      providers = await fetchAllProvidersWithRetry(base44.asServiceRole.entities);
      console.log(`[getProviders] got ${providers.length} providers`);
    } catch (e: any) {
      console.log(`[getProviders] fetch failed: ${e.message}`);
      return Response.json({ error: `Fetch failed: ${e.message}`, providers: [], count: 0 }, { status: 500, headers: CORS });
    }

    const sanitized = providers.map(sanitize);
    return Response.json({ providers: sanitized, count: sanitized.length, usedFallback }, { headers: CORS });

  } catch (error: any) {
    console.log(`[getProviders] Unhandled error: ${error.message}`);
    return Response.json({ error: error.message, providers: [], count: 0 }, { status: 500, headers: CORS });
  }
});
