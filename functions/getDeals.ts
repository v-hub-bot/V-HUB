// Public endpoint — returns all active ClassifiedAd records for the Deals of the Week page
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

    // Try filter first, fall back to list
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

    // Filter expired on our side
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const live = all.filter(ad => {
      if (!ad.is_active) return false;
      if (ad.deal_expires_at) {
        const exp = new Date(ad.deal_expires_at);
        exp.setHours(0, 0, 0, 0);
        if (exp < today) return false;
      }
      return true;
    });

    // Sort A-Z by provider name
    live.sort((a, b) => (a.provider_name || "").localeCompare(b.provider_name || ""));

    console.log("returning live ads:", live.length);
    return Response.json({ ads: live }, { headers: CORS });
  } catch (err: any) {
    console.error("getDeals error:", err);
    return Response.json({ error: err.message, ads: [] }, { status: 500, headers: CORS });
  }
});
