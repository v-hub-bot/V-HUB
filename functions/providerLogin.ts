import base44 from "../.base44/sdk.js";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

async function sha256(plain: string): Promise<string> {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest("SHA-256", enc.encode(plain));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

// v2
export default async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405, headers: CORS });

  let body: any;
  try { body = await req.json(); } catch { return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers: { ...CORS, "Content-Type": "application/json" } }); }

  const { identifier, password } = body || {};
  if (!identifier || !password) {
    return new Response(JSON.stringify({ error: "Missing identifier or password" }), { status: 400, headers: { ...CORS, "Content-Type": "application/json" } });
  }

  try {
    const db = base44.asServiceRole.entities;
    const loginInput = identifier.trim();
    const isVH = /^vh-?\d{4}$/i.test(loginInput);

    let results: any[] = [];
    if (isVH) {
      const vhNorm = loginInput.toUpperCase().replace(/^VH(\d)/, "VH-$1");
      results = await db.Provider.filter({ vh_number: vhNorm });
    } else {
      const email = loginInput.toLowerCase();
      const byLoginEmail = await db.Provider.filter({ login_email: email });
      const byEmail = await db.Provider.filter({ email: email });
      const seen = new Set<string>();
      for (const p of [...(byLoginEmail || []), ...(byEmail || [])]) {
        if (!seen.has(p.id)) { seen.add(p.id); results.push(p); }
      }
    }

    if (!results.length) {
      return new Response(JSON.stringify({ error: "No account found. Try your email or VH number (e.g. VH-1234), or contact admin@v-hub.us" }), { status: 401, headers: { ...CORS, "Content-Type": "application/json" } });
    }

    // Hash the submitted password
    const hashedInput = await sha256(password);

    // Find matching account
    const prov = results.find(p => {
      const stored = (p.login_password || "").trim();
      if (!stored) return false;
      return stored === password || stored === hashedInput;
    });

    if (!prov) {
      const hasNoPass = results.some(p => !p.login_password);
      if (hasNoPass && results.length === 1) {
        return new Response(JSON.stringify({ error: "No password set for this account. Use 'Forgot your password?' to set one up." }), { status: 401, headers: { ...CORS, "Content-Type": "application/json" } });
      }
      return new Response(JSON.stringify({ error: "Incorrect password. Please try again." }), { status: 401, headers: { ...CORS, "Content-Type": "application/json" } });
    }

    // Return provider data — strip sensitive fields
    const { login_password, notes, stripe_customer_id, stripe_subscription_id, ...safe } = prov;

    return new Response(JSON.stringify({ success: true, provider: safe }), { status: 200, headers: { ...CORS, "Content-Type": "application/json" } });

  } catch (err: any) {
    console.error("providerLogin error:", err);
    return new Response(JSON.stringify({ error: "Server error. Please try again." }), { status: 500, headers: { ...CORS, "Content-Type": "application/json" } });
  }
}
