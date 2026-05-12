// getProviderAnalytics — fetches analytics for a provider using service role (bypasses RLS)
import { createClientFromRequest } from "npm:@base44/sdk@0.8.23";

export default async function handler(req: Request): Promise<Response> {
  try {
    const { provider_id } = await req.json();
    if (!provider_id) {
      return new Response(JSON.stringify({ error: "provider_id required" }), { status: 400 });
    }

    const base44 = createClientFromRequest(req).asServiceRole;

    // Fetch all analytics for this provider using service role
    const all = await base44.entities.ProviderAnalytic.list();
    const events = all.filter((e: any) => e.provider_id === provider_id);

    return new Response(JSON.stringify({ ok: true, events }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err: any) {
    console.error("getProviderAnalytics error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
