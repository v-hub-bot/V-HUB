// getProviderAnalytics v2 — fetches analytics for a provider bypassing RLS
// Redeployed: 2026-05-15
import { createClientFromRequest } from "npm:@base44/sdk@0.8.23";

export default async function handler(req: Request): Promise<Response> {
  try {
    const body = await req.json().catch(() => ({}));
    const { provider_id, days } = body;
    if (!provider_id) {
      return new Response(JSON.stringify({ error: "provider_id required" }), { status: 400 });
    }

    const base44 = createClientFromRequest(req).asServiceRole;
    const all = await base44.entities.ProviderAnalytic.list();
    const events = all.filter((e: any) => e.provider_id === provider_id);

    const profileViews = events.filter((e: any) => e.event_type === "profile_view").length;
    const searchAppearances = events.filter((e: any) => e.event_type === "search_appearance").length;
    const adClicks = events.filter((e: any) => e.event_type === "ad_click").length;

    return new Response(JSON.stringify({ ok: true, profileViews, searchAppearances, adClicks, total: events.length }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err: any) {
    console.error("getProviderAnalytics error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
