import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Fields that must never be returned in the public provider listing
const SENSITIVE_FIELDS = ['login_email', 'login_password', 'stripe_customer_id', 'stripe_subscription_id', 'notes'];

function sanitize(provider: any) {
  const p = { ...provider };
  for (const field of SENSITIVE_FIELDS) {
    delete p[field];
  }
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

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });

  try {
    const base44 = createClientFromRequest(req);

    // ── LOGIN MODE ──────────────────────────────────────────────────────────────
    // POST with { login: true, identifier, password } → authenticate a provider
    if (req.method === "POST") {
      let body: any;
      try { body = await req.json(); } catch { 
        return Response.json({ error: "Invalid JSON" }, { status: 400, headers: CORS });
      }

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

        // Strip sensitive fields from the response
        const { login_password, login_email, notes, stripe_customer_id, stripe_subscription_id, ...safe } = prov;
        return Response.json({ success: true, provider: safe }, { status: 200, headers: CORS });
      }
    }

    // ── LISTING MODE (original behaviour) ──────────────────────────────────────
    let providers: any[] = [];
    try {
      providers = await base44.asServiceRole.entities.Provider.list();
    } catch(e1: any) {
      try {
        providers = await base44.entities.Provider.list();
      } catch(e2: any) {
        return Response.json({ error: `Both failed: ${e1.message} | ${e2.message}` }, { status: 500, headers: CORS });
      }
    }
    const sanitized = (providers || []).map(sanitize);
    return Response.json({ providers: sanitized, count: sanitized.length }, { headers: CORS });

  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500, headers: CORS });
  }
});
