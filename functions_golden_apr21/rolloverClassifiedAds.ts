// Rollover classified ads — daily cron
// New schema: each ClassifiedAd is a separate record (is_active=true = live, false = queued)
// When active ad expires: deactivate it. The provider must come back and pay $10 to launch next.
import { createClientFromRequest } from "npm:@base44/sdk@0.8.23";

Deno.serve(async (req: Request): Promise<Response> => {
  const base44 = createClientFromRequest(req);
  const now = new Date();
  let deactivated = 0;

  try {
    const ads = await base44.asServiceRole.entities.ClassifiedAd.filter({ is_active: true });

    for (const ad of ads) {
      if (!ad.deal_expires_at) continue;
      const expires = new Date(ad.deal_expires_at);
      if (expires >= now) continue;

      // Expired — deactivate it
      await base44.asServiceRole.entities.ClassifiedAd.update(ad.id, {
        is_active: false,
        is_queued_next: false,
      });
      deactivated++;
      console.log(`⬇️ Deactivated expired ad: ${ad.id} — "${ad.headline}" (provider: ${ad.provider_id})`);

      // Also reset classifieds_addon flag on provider so UI shows "ready to pay again"
      try {
        await base44.asServiceRole.entities.Provider.update(ad.provider_id, {
          classifieds_addon: false,
        });
      } catch (_) { /* provider update is best-effort */ }
    }

    return Response.json({ ok: true, deactivated, checked: ads.length, timestamp: now.toISOString() });
  } catch (err) {
    console.error("rolloverClassifiedAds error:", err);
    return Response.json({ ok: false, error: (err as any).message }, { status: 500 });
  }
});
