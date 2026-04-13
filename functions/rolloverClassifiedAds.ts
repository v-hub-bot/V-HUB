// Rollover classified ads: when current deal expires, promote queued next ad
import { createClientFromRequest } from "npm:@base44/sdk@0.8.23";

Deno.serve(async (req: Request): Promise<Response> => {
  const base44 = createClientFromRequest(req);
  const now = new Date();
  let rolled = 0;
  let deactivated = 0;

  try {
    // Get all active classified ads
    const ads = await base44.asServiceRole.entities.ClassifiedAd.filter({ is_active: true });

    for (const ad of ads) {
      if (!ad.deal_expires_at) continue; // No expiry set — skip

      const expires = new Date(ad.deal_expires_at);
      if (expires >= now) continue; // Not expired yet

      // This ad has expired
      if (ad.next_headline && ad.next_body) {
        // Promote queued next ad
        await base44.asServiceRole.entities.ClassifiedAd.update(ad.id, {
          headline: ad.next_headline,
          body: ad.next_body,
          address: ad.next_address || ad.address,
          village: ad.next_village || ad.village,
          image_url: ad.next_image_url || ad.image_url,
          deal_expires_at: ad.next_deal_expires_at || null,
          next_headline: null,
          next_body: null,
          next_address: null,
          next_village: null,
          next_image_url: null,
          next_deal_expires_at: null,
          is_active: true,
        });
        rolled++;
        console.log(`Rolled over ad ${ad.id} for provider ${ad.provider_id} (${ad.provider_name})`);
      } else {
        // No queued ad — deactivate
        await base44.asServiceRole.entities.ClassifiedAd.update(ad.id, { is_active: false });
        deactivated++;
        console.log(`Deactivated expired ad ${ad.id} for provider ${ad.provider_id} (${ad.provider_name})`);
      }
    }

    return Response.json({
      ok: true,
      rolled,
      deactivated,
      checked: ads.length,
      timestamp: now.toISOString(),
    });
  } catch (err) {
    console.error("rolloverClassifiedAds error:", err);
    return Response.json({ ok: false, error: (err as any).message }, { status: 500 });
  }
});
