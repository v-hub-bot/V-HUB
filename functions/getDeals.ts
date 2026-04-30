// getDeals v4 — entity id passthrough fixed, service/area enrichment
import { createClientFromRequest } from "npm:@base44/sdk@0.8.23";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const AREA_LEGACY_MAP: Record<string, string> = {
  va001:"Alhambra",va002:"Amelia",va003:"Antelope",va004:"Ashland",va005:"Bonnybrook",
  va006:"Calumet Grove",va007:"Chatham",va008:"Citrus Grove",va009:"Collier",
  va010:"Countryman",va011:"Cypress Landing",va012:"DeSoto",va013:"Dunedin",
  va014:"El Camino Real",va015:"Fenney",va016:"Fernandina",va017:"Gilchrist",
  va018:"Glenbrook",va019:"Gilchrist",va020:"Hadley",va021:"Hammond",
  va022:"Harbor Hills",va023:"Hemming",va024:"Hernando",va025:"Hillsborough",
  va026:"Hooten",va027:"Hutchinson",va028:"Indigo East",va029:"Jaguar",
  va030:"Lake Deaton",va031:"Lake Miona Heights",va032:"Largo Vista",
  va033:"Linden",va034:"Magnolia",va035:"Mallory Square",va036:"Marion Landing",
  va037:"Marsh Bend",va038:"McAlister",va039:"Midway",va040:"Moultrie Creek",
  va041:"Mubarak",va042:"Myrtlewood",va043:"Nassau",va044:"Newell",
  va045:"Orange Blossom Gardens",va046:"Osceola Hills",va047:"Palmer",
  va048:"Pennecamp",va049:"Pine Hills",va050:"Pinellas",va051:"Poinciana",
  va052:"Polo Ridge",va053:"Redhawk",va054:"Rio Grande",va055:"Romero",
  va056:"Sanibel",va057:"Santiago",va058:"Sarasota",va059:"Sharon Rose Wilder",
  va060:"Silver Lake",va061:"Simms",va062:"Soaring Eagle",va063:"Springdale",
  va064:"Summerhill",va065:"Sumter Landing Area",va066:"Sunset Pointe",
  va067:"Tamarind Grove",va068:"Tamarind Hills",va069:"Tierra del Sol",
  va070:"Treasury",va071:"Turtle Mound",va072:"Twin Oaks",va073:"Umber Ridge",
  va074:"Updike",va075:"Velocity",va076:"Vera Cruz",va077:"Vicar",
  va078:"Victoria",va079:"Villa Valencia",va080:"Virginia Trace",
  va081:"Vista Lago",va082:"Volusia",va083:"Wahoo",va084:"Walnut Grove",
  va085:"Waterford",va086:"Wellington",va087:"Westport",va088:"Weybridge",
  va089:"Whispering Pines",va090:"Whitfield",va091:"Windsor Park",
  va092:"Woodbury",va093:"Woodlands",va094:"Woodstock",va095:"Worthington",
  va096:"Wyndham",va097:"Yellar",
};

function cleanName(n: string): string {
  return n.includes(' — ') ? n.split(' — ').pop()!.trim() : n;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });

  try {
    const base44 = createClientFromRequest(req);

    // Fetch active ads
    let all: any[] = [];
    try {
      all = await base44.asServiceRole.entities.ClassifiedAd.filter({ is_active: true });
    } catch {
      try { all = await base44.asServiceRole.entities.ClassifiedAd.list(); } catch {}
    }

    const now = new Date();
    const live = all.filter(ad => {
      if (!ad.is_active) return false;
      if (ad.deal_expires_at && new Date(ad.deal_expires_at) <= now) return false;
      return true;
    });

    live.sort((a, b) => {
      const sa = a.slot_number ?? 99, sb = b.slot_number ?? 99;
      if (sa !== sb) return sa - sb;
      return (a.provider_name || "").localeCompare(b.provider_name || "");
    });

    // Load lookup tables
    let providerMap: Map<string, any> = new Map();
    let areaNameMap: Map<string, string> = new Map();
    let serviceNameMap: Map<string, string> = new Map();
    let categoryNameMap: Map<string, string> = new Map();

    try {
      // SDK 0.8.23: call list() with NO args for first page
      const providers = await base44.asServiceRole.entities.Provider.list();
      for (const p of providers) {
        if (p.vh_number) providerMap.set(p.vh_number, p);
        if (p.id) providerMap.set(p.id, p);
      }
      console.log("providers loaded:", providers.length);
    } catch (e) { console.error("provider load:", e); }

    try {
      const areas = await base44.asServiceRole.entities.ServiceArea.list();
      for (const a of areas) areaNameMap.set(a.id, cleanName(a.name));
    } catch {}

    try {
      const svcs = await base44.asServiceRole.entities.Service.list();
      for (const s of svcs) serviceNameMap.set(s.id, s.name);
    } catch {}

    try {
      const cats = await base44.asServiceRole.entities.Category.list();
      for (const c of cats) categoryNameMap.set(c.id, c.name);
    } catch {}

    // Enrich each ad
    const enriched = live.map(ad => {
      const prov = providerMap.get(ad.provider_id);

      // Even if provider not found in map, pass the provider_id as entity id
      // since ClassifiedAd.provider_id stores the entity UUID directly
      if (!prov) {
        return {
          ...ad,
          _provider_entity_id: ad.provider_id || null,
        };
      }

      const areaIds: string[] = Array.isArray(prov.service_areas) ? prov.service_areas : [];
      const areaNames = areaIds
        .map(id => areaNameMap.get(id) || AREA_LEGACY_MAP[id] || null)
        .filter(Boolean) as string[];

      const svcIds: string[] = Array.isArray(prov.services) ? prov.services : [];
      const svcNames = svcIds
        .map(id => serviceNameMap.get(id) || null)
        .filter(Boolean) as string[];

      const catName = categoryNameMap.get(prov.category_id || "") || "";

      return {
        ...ad,
        _provider_entity_id: prov.id,
        _provider_is_mobile: !!prov.is_mobile,
        _provider_address:   prov.address || null,
        _provider_areas:     areaNames,
        _provider_services:  svcNames,
        _provider_category:  catName,
      };
    });

    console.log("returning", enriched.length, "live ads");
    return Response.json({ ads: enriched }, { headers: CORS });
  } catch (err: any) {
    console.error("getDeals error:", err);
    return Response.json({ error: err.message, ads: [] }, { status: 500, headers: CORS });
  }
});
