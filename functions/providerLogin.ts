// providerLogin v4 - uses createClientFromRequest for service role
import { createClientFromRequest } from "npm:@base44/sdk@0.8.25";

const CORS = {
  "Access-Control-Allow-Origin": "https://v-hub-app-edf7f8e8.base44.app",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

async function sha256(s: string): Promise<string> {
  const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(b)).map((x: number) => x.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405, headers: CORS });

  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers: CORS });
  }

  const identifier = ((body.identifier as string) || "").trim();
  const password   = (body.password   as string) || "";
  if (!identifier || !password) {
    return new Response(JSON.stringify({ error: "Missing identifier or password" }), { status: 400, headers: CORS });
  }

  try {
    const base44 = createClientFromRequest(req);
    const sr = base44.asServiceRole;
    const isVH = /^vh-?\d{3,6}$/i.test(identifier);

    let rows: Record<string, unknown>[] = [];
    if (isVH) {
      const vhNorm = identifier.toUpperCase().replace(/^VH(\d)/, "VH-$1");
      rows = (await sr.entities.Provider.filter({ vh_number: vhNorm })) || [];
    } else {
      const em = identifier.toLowerCase();
      const a = (await sr.entities.Provider.filter({ login_email: em })) || [];
      const b = (await sr.entities.Provider.filter({ email: em }))       || [];
      const seen = new Set<string>();
      for (const p of [...a, ...b]) {
        const pid = p.id as string;
        if (!seen.has(pid)) { seen.add(pid); rows.push(p); }
      }
    }

    if (!rows.length) {
      return new Response(JSON.stringify({ error: "No account found. Try your email or VH number, or contact admin@v-hub.us" }), { status: 401, headers: CORS });
    }

    const hashed = await sha256(password);
    const match = rows.find(p => {
      const s = ((p.login_password as string) || "").trim();
      return s && (s === password || s === hashed);
    });

    if (!match) {
      if (rows.some(p => !p.login_password) && rows.length === 1) {
        return new Response(JSON.stringify({ error: "No password set. Use 'Forgot your password?' to set one up." }), { status: 401, headers: CORS });
      }
      return new Response(JSON.stringify({ error: "Incorrect password. Please try again." }), { status: 401, headers: CORS });
    }

    const safe: Record<string, unknown> = { ...match };
    delete safe.login_password;
    delete safe.notes;
    delete safe.stripe_customer_id;
    delete safe.stripe_subscription_id;

    return new Response(JSON.stringify({ success: true, provider: safe }), { headers: CORS });

  } catch (e: unknown) {
    console.error("providerLogin error:", e instanceof Error ? e.message : e);
    return new Response(JSON.stringify({ error: "Server error. Please try again." }), { status: 500, headers: CORS });
  }
});
