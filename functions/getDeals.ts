// Public endpoint — returns all active ClassifiedAd records for the Deals of the Week page
// Enriches each ad with provider service_areas (as names), services, and category for filtering
import { createClientFromRequest } from "npm:@base44/sdk@0.8.23";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });

  try {
    const base44 = createClientFromRequest(req);
    const db = base44.asServiceRole.entities;

    // Fetch all active ads
    let all: any[] = [];
    try {
      all = await db.ClassifiedAd.filter({ is_active: true });
    } catch {
      all = await db.ClassifiedAd.list({ limit: 500 });
    }

    const now = new Date();
    const live = all.filter(ad => {
      if (!ad.is_active) return false;
      if (ad.deal_expires_at && new Date(ad.deal_expires_at) <= now) return false;
      return true;
    });

    if (live.length === 0) {
      return Response.json({ ads: [] }, { headers: CORS });
    }

    // Fetch all lookup tables in parallel
    const [providers, areas, services, categories] = await Promise.all([
      db.Provider.list().catch(() => []),
      db.ServiceArea.list().catch(() => []),
      db.Service.list().catch(() => []),
      db.Category.list().catch(() => []),
    ]);

    // Build lookup maps
    const providerMap = new Map(providers.map((p: any) => [p.id, p]));
    const areaMap     = new Map(areas.map((a: any) => [a.id, a.name]));
    const serviceMap  = new Map(services.map((s: any) => [s.id, s.name]));
    const categoryMap = new Map(categories.map((c: any) => [c.id, c.name]));

    // Sort ads
    live.sort((a, b) => {
      const slotA = a.slot_number ?? 99;
      const slotB = b.slot_number ?? 99;
      if (slotA !== slotB) return slotA - slotB;
      return (a.provider_name || "").localeCompare(b.provider_name || "");
    });

    // Enrich each ad with provider data
    const mapped = live.map(ad => {
      const provider = providerMap.get(ad.provider_id);

      // Resolve area IDs → names
      const providerAreaNames: string[] = provider?.service_areas
        ? provider.service_areas.map((id: string) => areaMap.get(id)).filter(Boolean)
        : [];

      // Resolve service IDs → names
      const providerServiceNames: string[] = provider?.services
        ? provider.services.map((id: string) => serviceMap.get(id)).filter(Boolean)
        : [];

      // Resolve category ID → name
      const providerCategoryName: string = provider?.category_id
        ? (categoryMap.get(provider.category_id) || "")
        : "";

      // is_mobile = comes to the customer, but still has specific service_areas
      // Always use actual service_areas — only fall back to ALL if no areas are set at all
      const isMobile = provider?.is_mobile === true;
      const effectiveAreas = providerAreaNames.length > 0 ? providerAreaNames : (isMobile ? ["ALL"] : []);

      return {
        ...ad,
        _provider_entity_id: ad.provider_id || null,
        _provider_areas: effectiveAreas,
        _provider_services: providerServiceNames,
        _provider_category: providerCategoryName,
        _is_mobile: isMobile,
      };
    });

    console.log("returning live ads:", mapped.length, "enriched with provider data");
    return Response.json({ ads: mapped }, { headers: CORS });
  } catch (err: any) {
    console.error("getDeals error:", err);
    return Response.json({ error: err.message, ads: [] }, { status: 500, headers: CORS });
  }
});
