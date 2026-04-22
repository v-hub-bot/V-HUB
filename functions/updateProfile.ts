// updateProfile v1 — 2026-04-17 — self-service + admin profile updates
import { createClient } from "npm:@base44/sdk@0.8.25";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

async function sha256hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,"0")).join("");
}

const isId = (v: unknown) => typeof v === "string" && /^[0-9a-f]{24}$/.test(v);
const filterIds = (a: unknown) => Array.isArray(a) ? (a as unknown[]).filter(isId) as string[] : [];
const badIds = (a: unknown) => Array.isArray(a) ? (a as unknown[]).filter(v => !isId(v)).map(String) : [];

const ADMIN_EMAILS = ["kimberlycook1980@gmail.com","5bebegurlz@gmail.com"];

const sr = createClient({ appId: "69d062aca815ce8e697894b1" }).asServiceRole;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  let b: Record<string,unknown> = {};
  try { b = await req.json(); } catch { return Response.json({ error: "bad json" }, { status: 400, headers: CORS }); }

  const pid      = String(b.provider_id      || "").trim();
  const newpw    = String(b.new_password     || "").trim();
  const nemail   = String(b.new_login_email  || "").trim().toLowerCase();
  const pwChanged = b.password_changed as boolean | undefined;
  const vhn      = String(b.vh_number        || "").trim();
  const fields   = b.fields as Record<string,unknown> | undefined;
  const isAdmin  = b.admin === true && ADMIN_EMAILS.includes(String(b.admin_email || "").trim().toLowerCase());

  if (!pid) return Response.json({ error: "Missing provider_id" }, { status: 400, headers: CORS });

  let rec: Record<string,unknown> | null = null;
  try { rec = await sr.entities.Provider.get(pid); } catch {/**/}
  if (!rec) return Response.json({ error: "Provider not found" }, { status: 404, headers: CORS });

  // MODE 1 — password only
  if (newpw && pwChanged === true && !nemail && !fields) {
    if (newpw.length < 6) return Response.json({ error: "Password too short" }, { status: 400, headers: CORS });
    const updated = await sr.entities.Provider.update(pid, {
      login_password: await sha256hex(newpw),
      password_changed: true,
      managed_by: "Self-Managed",
    });
    const clean = { ...updated }; delete clean.login_password;
    return Response.json({ success: true, provider: clean }, { headers: CORS });
  }

  // MODE 2 — email/account settings
  if (nemail && !fields) {
    const u: Record<string,unknown> = { login_email: nemail };
    if (newpw.length >= 6) { u.login_password = await sha256hex(newpw); u.password_changed = true; }
    const updated = await sr.entities.Provider.update(pid, u);
    const clean = { ...updated }; delete clean.login_password;
    return Response.json({ success: true, provider: clean }, { headers: CORS });
  }

  // MODE 3 — profile fields
  if (!fields) return Response.json({ error: "Missing fields" }, { status: 400, headers: CORS });

  // Auth check: must have matching vh_number OR be admin
  if (!isAdmin) {
    if (!vhn) return Response.json({ error: "Missing vh_number" }, { status: 400, headers: CORS });
    if (rec.vh_number !== vhn) return Response.json({ error: "Unauthorized" }, { status: 401, headers: CORS });
  }

  const PROVIDER_FIELDS = ["business_name","owner_name","phone","email","website","description",
    "address","years_in_business","license_number","google_review_url",
    "services","service_areas","is_mobile","hours_of_operation","google_rating"];
  const ADMIN_FIELDS = [...PROVIDER_FIELDS,
    "subscription_status","subscription_tier","is_active","is_visible",
    "notes","trial_start_date","trial_end_date","grace_period_end_date",
    "classifieds_addon","managed_by","reminder_sent","login_email","vh_number"];

  const allowed = isAdmin ? ADMIN_FIELDS : PROVIDER_FIELDS;
  const safe: Record<string,unknown> = {};
  for (const k of allowed) if (k in fields) safe[k] = fields[k];

  if ("services" in safe) {
    const bad = badIds(safe.services);
    if (bad.length) return Response.json({ error: `Invalid service IDs: ${bad.join(",")}` }, { status: 400, headers: CORS });
    safe.services = filterIds(safe.services);
  }
  if ("service_areas" in safe) {
    const bad = badIds(safe.service_areas);
    if (bad.length) return Response.json({ error: `Invalid village IDs: ${bad.join(",")}` }, { status: 400, headers: CORS });
    safe.service_areas = filterIds(safe.service_areas);
  }

  // Handle admin password reset
  if (isAdmin && b.new_provider_password) {
    const pw = String(b.new_provider_password).trim();
    if (pw.length >= 6) {
      safe.login_password = await sha256hex(pw);
      safe.password_changed = false;
    }
  }

  if (!Object.keys(safe).length) return Response.json({ error: "No valid fields" }, { status: 400, headers: CORS });

  const updated = await sr.entities.Provider.update(pid, safe);
  const clean = { ...updated }; delete clean.login_password;
  console.log("✅ updateProfile saved:", vhn || pid, Object.keys(safe));
  return Response.json({ success: true, provider: clean }, { headers: CORS });
});
