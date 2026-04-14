// providerUpdateProfile — secure self-service update for provider hub sessions
// v3 - added ID validation to prevent legacy codes from being saved
import { createClient } from "npm:@base44/sdk@0.8.25";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

// ── ID Validation ─────────────────────────────────────────────────────────────
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

  const provider_id = body.provider_id as string | undefined;
  const vh_number   = body.vh_number   as string | undefined;
  const fields      = body.fields      as Record<string, unknown> | undefined;

  if (!provider_id || !vh_number || !fields) {
    return new Response(JSON.stringify({ error: "Missing provider_id, vh_number, or fields" }), { status: 400, headers: CORS_HEADERS });
  }

  // Auth: confirm provider_id + vh_number match before allowing any write
  let existing: Record<string, unknown> | null = null;
  try { existing = await sr.entities.Provider.get(provider_id); } catch { /* not found */ }
  if (!existing) {
    return new Response(JSON.stringify({ error: "Provider not found" }), { status: 404, headers: CORS_HEADERS });
  }
  if (existing.vh_number !== vh_number) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: CORS_HEADERS });
  }

  // Whitelist: only these fields may be self-updated
  const ALLOWED = [
    "business_name", "owner_name", "phone", "email", "website",
    "description", "address", "years_in_business", "license_number",
    "google_review_url", "services", "service_areas"
  ];
  const safe: Record<string, unknown> = {};
  for (const k of ALLOWED) {
    if (k in fields) safe[k] = fields[k];
  }

  // ── Validate service and area IDs ──────────────────────────────────
  if ('services' in safe) {
    const invalid = getInvalidIds(safe.services);
    if (invalid.length > 0) {
      console.error('providerUpdateProfile: invalid service IDs rejected:', invalid);
      return new Response(JSON.stringify({
        error: `Invalid service IDs: ${invalid.join(', ')}. Please select services from the dropdown.`
      }), { status: 400, headers: CORS_HEADERS });
    }
    safe.services = filterValidIds(safe.services);
  }

  if ('service_areas' in safe) {
    const invalid = getInvalidIds(safe.service_areas);
    if (invalid.length > 0) {
      console.error('providerUpdateProfile: invalid area IDs rejected:', invalid);
      return new Response(JSON.stringify({
        error: `Invalid village IDs: ${invalid.join(', ')}. Please select villages from the dropdown.`
      }), { status: 400, headers: CORS_HEADERS });
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
