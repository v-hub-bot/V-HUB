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

      // This ad has expired — check for queued next week
      const hasNextContent = ad.next_headline && ad.next_body;
      const hasNextSlot = ad.next_deal_expires_at; // Provider already paid for next week

      if (hasNextContent) {
        // Promote full queued ad with content
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
        console.log(`Rolled over ad ${ad.id} for provider ${ad.provider_id} (${ad.provider_name}) — full content promoted`);
      } else if (hasNextSlot) {
        // Provider paid for next week but hasn't filled in content yet — reset to blank active slot
        await base44.asServiceRole.entities.ClassifiedAd.update(ad.id, {
          headline: "",
          body: "",
          address: "",
          village: "",
          image_url: null,
          deal_expires_at: ad.next_deal_expires_at,
          next_headline: null,
          next_body: null,
          next_address: null,
          next_village: null,
          next_image_url: null,
          next_deal_expires_at: null,
          is_active: true,
        });
        rolled++;
        console.log(`Rolled over ad ${ad.id} (blank slot — provider needs to fill content) expires: ${ad.next_deal_expires_at}`);
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
