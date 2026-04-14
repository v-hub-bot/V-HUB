// providerUpdateProfile — secure self-service update for provider hub sessions
// v4 - added password change and password_changed flag support
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

const base44 = createClient({ appId: "69d062aca815ce8e697894b1" });
const sr = base44.asServiceRole;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS_HEADERS });
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405, headers: CORS_HEADERS });

  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers: CORS_HEADERS });
  }

  const provider_id   = body.provider_id   as string | undefined;
  const new_password  = body.new_password  as string | undefined;
  const password_changed = body.password_changed as boolean | undefined;

  // ── PASSWORD CHANGE MODE (force change on first login) ────────────────
  if (provider_id && new_password && password_changed === true) {
    if (new_password.length < 6) {
      return new Response(JSON.stringify({ error: "Password must be at least 6 characters" }), { status: 400, headers: CORS_HEADERS });
    }
    try {
      let existing: Record<string, unknown> | null = null;
      try { existing = await sr.entities.Provider.get(provider_id); } catch { /* not found */ }
      if (!existing) return new Response(JSON.stringify({ error: "Provider not found" }), { status: 404, headers: CORS_HEADERS });

      const hashed = await sha256hex(new_password);
      const updated = await sr.entities.Provider.update(provider_id, {
        login_password: hashed,
        password_changed: true,
      });
      return new Response(JSON.stringify({ success: true, provider: updated }), { headers: CORS_HEADERS });
    } catch (e: unknown) {
      const msg = (e instanceof Error) ? e.message : "Password update failed";
      return new Response(JSON.stringify({ error: msg }), { status: 500, headers: CORS_HEADERS });
    }
  }

  // ── PROFILE UPDATE MODE ───────────────────────────────────────────────
  const vh_number = body.vh_number as string | undefined;
  const fields    = body.fields    as Record<string, unknown> | undefined;

  if (!provider_id || !vh_number || !fields) {
    return new Response(JSON.stringify({ error: "Missing provider_id, vh_number, or fields" }), { status: 400, headers: CORS_HEADERS });
  }

  // Auth: confirm provider_id + vh_number match
  let existing: Record<string, unknown> | null = null;
  try { existing = await sr.entities.Provider.get(provider_id); } catch { /* not found */ }
  if (!existing) return new Response(JSON.stringify({ error: "Provider not found" }), { status: 404, headers: CORS_HEADERS });
  if (existing.vh_number !== vh_number) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: CORS_HEADERS });

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

  // Handle password change via profile update too
  if (fields.new_password && typeof fields.new_password === 'string' && (fields.new_password as string).length >= 6) {
    safe.login_password = await sha256hex(fields.new_password as string);
    safe.password_changed = true;
  }

  if ('services' in safe) {
    const invalid = getInvalidIds(safe.services);
    if (invalid.length > 0) {
      return new Response(JSON.stringify({ error: `Invalid service IDs: ${invalid.join(', ')}. Please select services from the dropdown.` }), { status: 400, headers: CORS_HEADERS });
    }
    safe.services = filterValidIds(safe.services);
  }

  if ('service_areas' in safe) {
    const invalid = getInvalidIds(safe.service_areas);
    if (invalid.length > 0) {
      return new Response(JSON.stringify({ error: `Invalid village IDs: ${invalid.join(', ')}. Please select villages from the dropdown.` }), { status: 400, headers: CORS_HEADERS });
    }
    safe.service_areas = filterValidIds(safe.service_areas);
  }

  if (!Object.keys(safe).length) {
    return new Response(JSON.stringify({ error: "No updatable fields provided" }), { status: 400, headers: CORS_HEADERS });
  }

  try {
    const updated = await sr.entities.Provider.update(provider_id, safe);
    return new Response(JSON.stringify({ success: true, provider: updated }), { headers: CORS_HEADERS });
  } catch (e: unknown) {
    const msg = (e instanceof Error) ? e.message : "Update failed";
    console.error("providerUpdateProfile error:", msg);
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: CORS_HEADERS });
  }
});
