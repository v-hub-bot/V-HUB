// v2
const CORS = {
  "Access-Control-Allow-Origin": "https://v-hub-app-edf7f8e8.base44.app",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
  "Vary": "Origin",
};

import { createClient } from "npm:@base44/sdk@0.8.23";

const base44 = createClient({ appId: "69d062aca815ce8e697894b1" });
const sr = base44.asServiceRole;

export default async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405, headers: CORS });

  let body: any = {};
  try { body = await req.json(); } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers: CORS });
  }

  const { provider_id, vh_number, fields } = body;

  if (!provider_id || !vh_number || !fields) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400, headers: CORS });
  }

  try {
    // Verify the provider_id + vh_number match — lightweight auth
    const provider = await sr.entities.Provider.get(provider_id);
    if (!provider) {
      return new Response(JSON.stringify({ error: "Provider not found" }), { status: 404, headers: CORS });
    }
    if (provider.vh_number !== vh_number) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: CORS });
    }

    // Whitelist the fields providers are allowed to update
    const allowed = [
      "business_name", "owner_name", "phone", "email", "website",
      "description", "address", "years_in_business", "license_number",
      "google_review_url", "services", "service_areas"
    ];
    const safe: Record<string, any> = {};
    for (const key of allowed) {
      if (key in fields) safe[key] = fields[key];
    }

    if (Object.keys(safe).length === 0) {
      return new Response(JSON.stringify({ error: "No valid fields to update" }), { status: 400, headers: CORS });
    }

    const updated = await sr.entities.Provider.update(provider_id, safe);
    return new Response(JSON.stringify({ success: true, provider: updated }), { headers: CORS });

  } catch (err: any) {
    console.error("providerUpdateProfile error:", err);
    return new Response(JSON.stringify({ error: err.message || "Server error" }), { status: 500, headers: CORS });
  }
}
