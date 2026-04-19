// adminProviderOps v3 — force redeploy 2026-04-16T22:20Z
import { createClientFromRequest, createClient } from 'npm:@base44/sdk@0.8.25';

const CORS_OPEN = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Content-Type": "application/json",
};

function isValidDbId(id: unknown): boolean {
  return typeof id === 'string' && /^[0-9a-f]{24}$/.test(id);
}
function filterValidIds(ids: unknown): string[] {
  if (!Array.isArray(ids)) return [];
  return ids.filter(isValidDbId) as string[];
}
function getInvalidIds(ids: unknown): string[] {
  if (!Array.isArray(ids)) return [];
  return ids.filter((id: unknown) => !isValidDbId(id)).map(String);
}
function sanitizeFields(fields: Record<string, unknown>): { safe: Record<string, unknown> | null; errMsg: string | null } {
  const safe = { ...fields };
  if ('services' in safe) {
    const inv = getInvalidIds(safe.services);
    if (inv.length > 0) return { safe: null, errMsg: `Invalid service IDs: ${inv.join(', ')}` };
    safe.services = filterValidIds(safe.services);
  }
  if ('service_areas' in safe) {
    const inv = getInvalidIds(safe.service_areas);
    if (inv.length > 0) return { safe: null, errMsg: `Invalid village IDs: ${inv.join(', ')}` };
    safe.service_areas = filterValidIds(safe.service_areas);
  }
  return { safe, errMsg: null };
}

const srClient = createClient({ appId: "69d06ada8019d7e9edf7f8e8" }).asServiceRole;

async function sha256hex(plain: string): Promise<string> {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest("SHA-256", enc.encode(plain));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

const PROVIDER_SELF_FIELDS = [
  "business_name","owner_name","phone","email","website","description",
  "address","years_in_business","license_number","google_review_url",
  "services","service_areas","is_mobile","hours_of_operation","google_rating"
];

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS_OPEN });
  if (req.method !== "POST") return Response.json({ error: "Method not allowed" }, { status: 405, headers: CORS_OPEN });

  let body: Record<string,unknown> = {};
  try { body = await req.json(); } catch { body = {}; }

  // Health check
  if (body.ping === true) return Response.json({ ok: true, version: "v3", ts: "2026-04-16T22:20Z" }, { headers: CORS_OPEN });

  // Provider password change (no admin auth needed)
  if (body.provider_change_password === true) {
    const pid = String(body.provider_id || "").trim();
    const np  = String(body.new_password || "").trim();
    if (!pid || np.length < 6) return Response.json({ error: "Missing provider_id or password too short" }, { status: 400, headers: CORS_OPEN });
    let ex: Record<string,unknown> | null = null;
    try { ex = await srClient.entities.Provider.get(pid); } catch { /**/ }
    if (!ex) return Response.json({ error: "Provider not found" }, { status: 404, headers: CORS_OPEN });
    const upd = await srClient.entities.Provider.update(pid, { login_password: await sha256hex(np), password_changed: true });
    return Response.json({ success: true, provider: upd }, { headers: CORS_OPEN });
  }

  // Provider self-update (authenticated by vh_number ownership)
  if (body.provider_self_update === true) {
    const pid   = String(body.provider_id || "").trim();
    const vhnum = String(body.vh_number   || "").trim();
    const flds  = body.fields as Record<string,unknown> | undefined;
    if (!pid || !vhnum || !flds) return Response.json({ error: "Missing fields" }, { status: 400, headers: CORS_OPEN });
    let rec: Record<string,unknown> | null = null;
    try { rec = await srClient.entities.Provider.get(pid); } catch { /* */ }
    if (!rec) return Response.json({ error: "Provider not found" }, { status: 404, headers: CORS_OPEN });
    if (rec.vh_number !== vhnum) return Response.json({ error: "Unauthorized" }, { status: 401, headers: CORS_OPEN });
    const safe: Record<string,unknown> = {};
    for (const k of PROVIDER_SELF_FIELDS) { if (k in flds) safe[k] = flds[k]; }
    const { safe: sanitized, errMsg } = sanitizeFields(safe);
    if (errMsg) return Response.json({ error: errMsg }, { status: 400, headers: CORS_OPEN });
    if (!Object.keys(sanitized!).length) return Response.json({ error: "No valid fields" }, { status: 400, headers: CORS_OPEN });
    const updated = await srClient.entities.Provider.update(pid, sanitized!);
    return Response.json({ success: true, record: updated }, { headers: CORS_OPEN });
  }

  // ADMIN MODE — PIN or role-based auth
  const base44 = createClientFromRequest(req);
  const VALID_PINS   = ["1357"];
  const ADMIN_EMAILS = ["kimberlycook1980@gmail.com", "5bebegurlz@gmail.com"];
  const pinOk = body.pin && VALID_PINS.includes(String(body.pin));
  let isAdmin = false;
  try {
    const me = await base44.auth.me();
    if (me?.email && ADMIN_EMAILS.includes(me.email.toLowerCase())) isAdmin = true;
  } catch { /* */ }
  if (!pinOk && !isAdmin) return Response.json({ error: "Unauthorized" }, { status: 401, headers: CORS_OPEN });

  const sr = base44.asServiceRole;
  const id       = body.id       as string | undefined;
  const fields   = body.fields   as Record<string,unknown> | undefined;
  const doDelete = body.delete   as boolean | undefined;
  const doCreate = body.create   as boolean | undefined;

  try {
    if (doCreate) {
      const { safe: sanitized, errMsg } = sanitizeFields((fields || {}) as Record<string, unknown>);
      if (errMsg) return Response.json({ error: errMsg }, { status: 400, headers: CORS_OPEN });
      const r = await sr.entities.Provider.create(sanitized!);
      return Response.json({ success: true, record: r }, { headers: CORS_OPEN });
    }
    if (!id) return Response.json({ error: "Missing id" }, { status: 400, headers: CORS_OPEN });
    if (doDelete) {
      await sr.entities.Provider.delete(id);
      return Response.json({ success: true }, { headers: CORS_OPEN });
    }
    if (fields) {
      const { safe: sanitized, errMsg } = sanitizeFields(fields as Record<string, unknown>);
      if (errMsg) return Response.json({ error: errMsg }, { status: 400, headers: CORS_OPEN });
      const r = await sr.entities.Provider.update(id, sanitized!);
      return Response.json({ success: true, record: r }, { headers: CORS_OPEN });
    }
    return Response.json({ error: "No action specified" }, { status: 400, headers: CORS_OPEN });
  } catch (e: unknown) {
    return Response.json({ error: e instanceof Error ? e.message : "Server error" }, { status: 500, headers: CORS_OPEN });
  }
});
