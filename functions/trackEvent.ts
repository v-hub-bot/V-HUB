// trackEvent — real analytics for V-Hub providers
// Called by Home.jsx (search/profile) and Classifieds.jsx (ad clicks)
// event_type: "search_appearance" | "profile_view" | "classified_click" | "lead_inquiry"
import { createClientFromRequest } from "npm:@base44/sdk@0.8.23";

Deno.serve(async (req: Request): Promise<Response> => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });

  try {
    const body = await req.json();
    // events: array of { provider_id, event_type, service_name?, category_name?, area_name?, source? }
    const events: Array<{
      provider_id: string;
      event_type: string;
      service_name?: string;
      category_name?: string;
      area_name?: string;
      source?: string;
    }> = Array.isArray(body) ? body : [body];

    if (!events.length) return Response.json({ ok: true, created: 0 }, { headers: corsHeaders });

    const base44 = createClientFromRequest(req);
    const dateKey = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    let created = 0;
    for (const ev of events) {
      if (!ev.provider_id || !ev.event_type) continue;
      try {
        await base44.asServiceRole.entities.ProviderAnalytic.create({
          provider_id: ev.provider_id,
          event_type: ev.event_type,
          service_name: ev.service_name || null,
          category_name: ev.category_name || null,
          area_name: ev.area_name || null,
          date_key: dateKey,
          source: ev.source || "homepage",
        });
        created++;

        // Also update the fast counter on Provider for quick dashboard display
        if (ev.event_type === "profile_view") {
          const prov = await base44.asServiceRole.entities.Provider.get(ev.provider_id);
          if (prov) {
            await base44.asServiceRole.entities.Provider.update(ev.provider_id, {
              profile_views: (prov.profile_views || 0) + 1,
            });
          }
        } else if (ev.event_type === "search_appearance") {
          const prov = await base44.asServiceRole.entities.Provider.get(ev.provider_id);
          if (prov) {
            await base44.asServiceRole.entities.Provider.update(ev.provider_id, {
              search_appearances: (prov.search_appearances || 0) + 1,
            });
          }
        }
      } catch (e) {
        console.error("Error creating analytic event:", e, ev);
      }
    }

    return Response.json({ ok: true, created }, { headers: corsHeaders });
  } catch (err) {
    console.error("trackEvent error:", err);
    return Response.json({ ok: false, error: (err as any).message }, { status: 500, headers: corsHeaders });
  }
});
