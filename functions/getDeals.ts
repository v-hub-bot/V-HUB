// Public endpoint — returns all active ClassifiedAd records for the Deals of the Week page
// Ads become visible the INSTANT payment is confirmed (webhook sets is_active=true + deal_expires_at)
// Ads expire exactly 7 days after payment (precise timestamp comparison, not date-only)
// v2: enriches each ad with provider location info (service areas for mobile, address for B&M)
import { createClientFromRequest } from "npm:@base44/sdk@0.8.23";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// Legacy area code → name map (matches approveProvider.ts)
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

async function resolveAreaNames(base44: any, ids: string[]): Promise<string[]> {
  if (!ids || ids.length === 0) return [];
  try {
    const all = await base44.asServiceRole.entities.ServiceArea.list();
    const map = new Map(all.map((a: any) => [a.id, a.name]));
    return ids
      .map(id => map.get(id) || AREA_LEGACY_MAP[id] || null)
      .filter(Boolean)
      .map(cleanName) as string[];
  } catch {
    return ids.map(id => AREA_LEGACY_MAP[id] || null).filter(Boolean).map(cleanName) as string[];
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });

  try {
    const base44 = createClientFromRequest(req);

    // Fetch all active ads
    let all: any[] = [];
    try {
      all = await base44.asServiceRole.entities.ClassifiedAd.filter({ is_active: true });
      console.log("filter returned:", all.length);
    } catch (e1) {
      console.log("filter failed, trying list:", String(e1));
      try {
        all = await base44.asServiceRole.entities.ClassifiedAd.list({ limit: 500 });
        console.log("list returned:", all.length);
      } catch (e2) {
        console.error("list also failed:", String(e2));
      }
    }

    // Use exact timestamp comparison — ad is live until the millisecond it expires
    const now = new Date();

    const live = all.filter(ad => {
      if (!ad.is_active) return false;
      if (ad.deal_expires_at) {
        if (new Date(ad.deal_expires_at) <= now) return false;
      }
      return true;
    });

    // Sort: slot_number ascending first (featured slots), then A-Z by provider name
    live.sort((a, b) => {
      const slotA = a.slot_number ?? 99;
      const slotB = b.slot_number ?? 99;
      if (slotA !== slotB) return slotA - slotB;
      return (a.provider_name || "").localeCompare(b.provider_name || "");
    });

    // Fetch all providers once (keyed by provider_id / vh_number)
    let providerMap: Map<string, any> = new Map();
    try {
      const providers = await base44.asServiceRole.entities.Provider.list({ limit: 500 });
      for (const p of providers) {
        if (p.vh_number) providerMap.set(p.vh_number, p);
        if (p.id)        providerMap.set(p.id, p);
      }
      console.log("loaded providers:", providers.length);
    } catch (pe) {
      console.error("provider load failed:", String(pe));
    }

    // Fetch all ServiceArea names once
    let areaNameMap: Map<string, string> = new Map();
    try {
      const areas = await base44.asServiceRole.entities.ServiceArea.list();
      for (const a of areas) {
        areaNameMap.set(a.id, cleanName(a.name));
      }
    } catch (ae) {
      console.error("area load failed:", String(ae));
    }

    // Enrich each ad with provider location info
    const enriched = live.map(ad => {
      const prov = providerMap.get(ad.provider_id);
      if (!prov) return ad;

      const isMobile  = !!prov.is_mobile;
      const hasBM     = !!(prov.address && prov.address.trim());
      // Resolve service area IDs to names
      const areaIds: string[] = Array.isArray(prov.service_areas) ? prov.service_areas : [];
      const areaNames = areaIds
        .map(id => areaNameMap.get(id) || AREA_LEGACY_MAP[id] || null)
        .filter(Boolean) as string[];

      return {
        ...ad,
        _provider_is_mobile: isMobile,
        _provider_address:   prov.address || null,
        _provider_areas:     areaNames,   // array of human-readable area names
      };
    });

    console.log("returning live ads:", enriched.length, "at", now.toISOString());
    return Response.json({ ads: enriched }, { headers: CORS });
  } catch (err: any) {
    console.error("getDeals error:", err);
    return Response.json({ error: err.message, ads: [] }, { status: 500, headers: CORS });
  }
});
