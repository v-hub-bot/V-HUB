// adminUpdateProvider v2 — admin CRUD + provider self-update mode
// Last updated: 2026-04-13T17:20Z
import { createClientFromRequest, createClient } from 'npm:@base44/sdk@0.8.25';

const ALLOWED_ORIGIN = "https://v-hub-app-edf7f8e8.base44.app";

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("origin") || "";
  const allowed = origin === ALLOWED_ORIGIN || origin === "";
  return {
    "Access-Control-Allow-Origin": allowed ? origin || ALLOWED_ORIGIN : "null",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Content-Type": "application/json",
    "Vary": "Origin",
  };
}

const srClient = createClient({ appId: "69d062aca815ce8e697894b1" }).asServiceRole;

const PROVIDER_SELF_FIELDS = [
  "business_name","owner_name","phone","email","website",
  "description","address","years_in_business","license_number",
  "google_review_url","services","service_areas"
];

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: getCorsHeaders(req) });
  const cors = getCorsHeaders(req);

  let body: Record<string,unknown> = {};
  try { body = await req.json(); } catch { body = {}; }

  // ── Provider self-update ──────────────────────────────────────────────
  if (body.provider_self_update === true) {
    const pid    = body.provider_id as string;
    const vhnum  = body.vh_number   as string;
    const fields = body.fields      as Record<string,unknown>;
    if (!pid || !vhnum || !fields) {
      return Response.json({ error: "Missing provider_id, vh_number, or fields" }, { status: 400, headers: cors });
    }
    let rec: Record<string,unknown> | null = null;
    try { rec = await srClient.entities.Provider.get(pid); } catch { /* */ }
    if (!rec)             return Response.json({ error: "Provider not found" },  { status: 404, headers: cors });
    if (rec.vh_number !== vhnum) return Response.json({ error: "Unauthorized" }, { status: 401, headers: cors });

    const safe: Record<string,unknown> = {};
    for (const k of PROVIDER_SELF_FIELDS) { if (k in fields) safe[k] = fields[k]; }
    if (!Object.keys(safe).length) return Response.json({ error: "No valid fields" }, { status: 400, headers: cors });

    const updated = await srClient.entities.Provider.update(pid, safe);
    return Response.json({ success: true, record: updated }, { headers: cors });
  }

  // ── Admin mode ────────────────────────────────────────────────────────
  const base44      = createClientFromRequest(req);
  const VALID_PINS  = ["1357"];
  const ADMIN_EMAILS = ["kimberlycook1980@gmail.com", "5bebegurlz@gmail.com"];
  const pinOk = body.pin && VALID_PINS.includes(String(body.pin));
  let isAdmin = false;
  try {
    const me = await base44.auth.me();
    if (me?.email && ADMIN_EMAILS.includes(me.email.toLowerCase())) isAdmin = true;
  } catch { /* */ }
  if (!pinOk && !isAdmin) return Response.json({ error: "Unauthorized" }, { status: 401, headers: cors });

  const sr = base44.asServiceRole;
  const { id, fields, delete: doDelete, create: doCreate } = body as Record<string,unknown> & { delete?: boolean; create?: boolean };

  try {
    if (doCreate)  { const r = await sr.entities.Provider.create(fields as Record<string,unknown>); return Response.json({ success: true, record: r }, { headers: cors }); }
    if (!id)       return Response.json({ error: "Missing id" },       { status: 400, headers: cors });
    if (doDelete)  { await sr.entities.Provider.delete(id as string);  return Response.json({ success: true },           { headers: cors }); }
    if (fields)    { const r = await sr.entities.Provider.update(id as string, fields as Record<string,unknown>); return Response.json({ success: true, record: r }, { headers: cors }); }
    return Response.json({ error: "No action" }, { status: 400, headers: cors });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    console.error("adminUpdateProvider:", msg);
    return Response.json({ error: msg }, { status: 500, headers: cors });
  }
});
