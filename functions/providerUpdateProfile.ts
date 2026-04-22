// providerUpdateProfile — secure self-service update for provider hub sessions
// v16 - managed_by_fix-1776472782
import { createClient } from "npm:@base44/sdk@0.8.25";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

async function sha256hex(plain: string): Promise<string> {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest("SHA-256", enc.encode(plain));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

function isValidDbId(id: string): boolean {
  return typeof id === 'string' && /^[0-9a-f]{24}$/.test(id);
}

function filterValidIds(ids: unknown): string[] {
  if (!Array.isArray(ids)) return [];
  return ids.filter((id: unknown) => isValidDbId(String(id))) as string[];
}

function getInvalidIds(ids: unknown): string[] {
  if (!Array.isArray(ids)) return [];
  return ids.filter((id: unknown) => !isValidDbId(String(id))).map(String);
}

function sanitize(p: Record<string, unknown>): Record<string, unknown> {
  const safe = { ...p };
  delete safe.login_password;
  delete safe.notes;
  delete safe.stripe_customer_id;
  delete safe.stripe_subscription_id;
  return safe;
}

const _DEPLOY_TS = 1776472782;
const base44 = createClient({ appId: "69d062aca815ce8e697894b1" });
const sr = base44.asServiceRole;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS_HEADERS });
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405, headers: CORS_HEADERS });

  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers: CORS_HEADERS });
  }

  const provider_id      = (body.provider_id      as string || "").trim();
  const new_password     = (body.new_password     as string || "").trim();
  const new_login_email  = (body.new_login_email  as string || "").trim().toLowerCase();
  const password_changed = body.password_changed as boolean | undefined;
  const vh_number        = (body.vh_number        as string || "").trim();
  const fields           = body.fields as Record<string, unknown> | undefined;

  console.log("📥 providerUpdateProfile called — provider_id:", provider_id, "vh_number:", vh_number);

  if (!provider_id) {
    return new Response(JSON.stringify({ error: "Missing provider_id" }), { status: 400, headers: CORS_HEADERS });
  }

  let existing: Record<string, unknown> | null = null;
  try { existing = await sr.entities.Provider.get(provider_id); } catch { /* not found */ }
  if (!existing) {
    console.error("❌ Provider not found:", provider_id);
    return new Response(JSON.stringify({ error: "Provider not found" }), { status: 404, headers: CORS_HEADERS });
  }

  console.log("✅ Provider found:", existing.vh_number, existing.business_name);

  // MODE 1: Force password change
  if (new_password && password_changed === true && !new_login_email && !fields) {
    if (new_password.length < 6) {
      return new Response(JSON.stringify({ error: "Password must be at least 6 characters" }), { status: 400, headers: CORS_HEADERS });
    }
    try {
      const hashed = await sha256hex(new_password);
      const updated = await sr.entities.Provider.update(provider_id, {
        login_password: hashed,
        password_changed: true,
        managed_by: "Self-Managed",
      });
      console.log("✅ Password changed for:", provider_id);
      return new Response(JSON.stringify({ success: true, provider: sanitize(updated) }), { headers: CORS_HEADERS });
    } catch (e: unknown) {
      const msg = (e instanceof Error) ? e.message : "Password update failed";
      console.error("❌ Password change error:", msg);
      return new Response(JSON.stringify({ error: msg }), { status: 500, headers: CORS_HEADERS });
    }
  }

  // MODE 2: Account settings (email + optional password)
  if (new_login_email && !fields) {
    const updates: Record<string, unknown> = { login_email: new_login_email };
    if (new_password && new_password.length >= 6) {
      updates.login_password = await sha256hex(new_password);
      updates.password_changed = true;
    }
    try {
      const updated = await sr.entities.Provider.update(provider_id, updates);
      console.log("✅ Account settings updated for:", provider_id);
      return new Response(JSON.stringify({ success: true, provider: sanitize(updated) }), { headers: CORS_HEADERS });
    } catch (e: unknown) {
      const msg = (e instanceof Error) ? e.message : "Account update failed";
      console.error("❌ Account update error:", msg);
      return new Response(JSON.stringify({ error: msg }), { status: 500, headers: CORS_HEADERS });
    }
  }

  // MODE 3: Profile update (business info, services, villages)
  if (!vh_number || !fields) {
    console.warn("⚠️ Missing vh_number or fields for MODE 3");
    return new Response(JSON.stringify({ error: "Missing vh_number or fields" }), { status: 400, headers: CORS_HEADERS });
  }

  if (existing.vh_number !== vh_number) {
    console.error("❌ VH number mismatch — existing:", existing.vh_number, "provided:", vh_number);
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: CORS_HEADERS });
  }

  const ALLOWED = [
    "business_name", "owner_name", "phone", "email", "website",
    "description", "address", "years_in_business", "license_number",
    "google_review_url", "services", "service_areas", "is_mobile",
    "hours_of_operation", "google_rating",
  ];
  const safe: Record<string, unknown> = {};
  for (const k of ALLOWED) {
    if (k in fields) safe[k] = fields[k];
  }

  if ('services' in safe) {
    const invalid = getInvalidIds(safe.services);
    if (invalid.length > 0) {
      console.error("❌ Invalid service IDs:", invalid);
      return new Response(JSON.stringify({ error: `Invalid service IDs: ${invalid.join(', ')}.` }), { status: 400, headers: CORS_HEADERS });
    }
    safe.services = filterValidIds(safe.services);
  }

  if ('service_areas' in safe) {
    const invalid = getInvalidIds(safe.service_areas);
    if (invalid.length > 0) {
      console.error("❌ Invalid village IDs:", invalid);
      return new Response(JSON.stringify({ error: `Invalid village IDs: ${invalid.join(', ')}.` }), { status: 400, headers: CORS_HEADERS });
    }
    safe.service_areas = filterValidIds(safe.service_areas);
  }

  if (!Object.keys(safe).length) {
    return new Response(JSON.stringify({ error: "No updatable fields provided" }), { status: 400, headers: CORS_HEADERS });
  }

  console.log("📝 Updating fields:", Object.keys(safe));

  try {
    const updated = await sr.entities.Provider.update(provider_id, safe);
    console.log("✅ Profile saved for:", vh_number, "fields:", Object.keys(safe));
    return new Response(JSON.stringify({ success: true, provider: sanitize(updated) }), { headers: CORS_HEADERS });
  } catch (e: unknown) {
    const msg = (e instanceof Error) ? e.message : "Update failed";
    console.error("❌ providerUpdateProfile save error:", msg);
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: CORS_HEADERS });
  }
});
