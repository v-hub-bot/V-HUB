// Public endpoint — returns all active ClassifiedAd records for the Deals of the Week page
// Ads become visible the INSTANT payment is confirmed (webhook sets is_active=true + deal_expires_at)
// Ads expire exactly 7 days after payment (precise timestamp comparison, not date-only)
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
        // Compare exact timestamps — don't strip time
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

    console.log("returning live ads:", live.length, "at", now.toISOString());
    const mapped = live.map(ad => ({ ...ad, _provider_entity_id: ad.provider_id || null }));
    return Response.json({ ads: mapped }, { headers: CORS });
  } catch (err: any) {
    console.error("getDeals error:", err);
    return Response.json({ error: err.message, ads: [] }, { status: 500, headers: CORS });
  }
});
