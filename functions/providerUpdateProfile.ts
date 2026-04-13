// providerUpdateProfile — secure self-service update for provider hub sessions
// Deployed: 2026-04-13
import { createClient } from "npm:@base44/sdk@0.8.25";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "https://v-hub-app-edf7f8e8.base44.app",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

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
