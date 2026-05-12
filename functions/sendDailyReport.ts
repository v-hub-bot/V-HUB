import { createClientFromRequest } from "npm:@base44/sdk@0.8.23";

export default async function handler(req: Request): Promise<Response> {
  const base44 = createClientFromRequest(req).asServiceRole;

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const todayKey = today.toISOString().split("T")[0];
  const yesterdayKey = yesterday.toISOString().split("T")[0];
  const reportDate = today.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "America/New_York" });

  // Pull ALL analytics (paginate)
  let allAnalytics: any[] = [];
  let skip = 0;
  while (true) {
    const res = await base44.entities.ProviderAnalytic.list({ limit: 500, skip });
    allAnalytics = allAnalytics.concat(res);
    if (res.length < 500) break;
    skip += 500;
  }

  // Pull providers for name lookup
  let allProviders: any[] = [];
  skip = 0;
  while (true) {
    const res = await base44.entities.Provider.list({ limit: 500, skip });
    allProviders = allProviders.concat(res);
    if (res.length < 500) break;
    skip += 500;
  }
  const providerMap: Record<string, string> = {};
  for (const p of allProviders) {
    providerMap[p.id] = p.business_name || p.owner_name || "Unknown";
  }

  // Filter: today vs yesterday
  const todayEvents = allAnalytics.filter(e => e.date_key === todayKey && e.provider_id !== "test123");
  const yestEvents  = allAnalytics.filter(e => e.date_key === yesterdayKey && e.provider_id !== "test123");

  // Site-level stats (today)
  const homepageViews    = todayEvents.filter(e => e.event_type === "homepage_view" && e.provider_id === "SITE").length;
  const profileViews     = todayEvents.filter(e => e.event_type === "profile_view" && e.provider_id !== "SITE").length;
  const searchAppear     = todayEvents.filter(e => e.event_type === "search_appearance").length;
  const classifiedClicks = todayEvents.filter(e => e.event_type === "classified_click").length;
  const leadInquiries    = todayEvents.filter(e => e.event_type === "lead_inquiry").length;

  // Yesterday comparisons
  const yHomepage    = yestEvents.filter(e => e.event_type === "homepage_view" && e.provider_id === "SITE").length;
  const yProfile     = yestEvents.filter(e => e.event_type === "profile_view" && e.provider_id !== "SITE").length;
  const ySearch      = yestEvents.filter(e => e.event_type === "search_appearance").length;
  const yClassified  = yestEvents.filter(e => e.event_type === "classified_click").length;
  const yLeads       = yestEvents.filter(e => e.event_type === "lead_inquiry").length;

  const delta = (a: number, b: number) => {
    if (b === 0) return a > 0 ? `<span style="color:#00BFA5">+${a} new</span>` : `<span style="color:#999">—</span>`;
    const d = a - b;
    const pct = Math.round((d / b) * 100);
    if (d > 0) return `<span style="color:#00BFA5">▲ +${d} (${pct}%)</span>`;
    if (d < 0) return `<span style="color:#E8431A">▼ ${d} (${pct}%)</span>`;
    return `<span style="color:#999">→ No change</span>`;
  };

  // Top 10 providers by profile views today
  const pvMap: Record<string, number> = {};
  for (const e of todayEvents.filter(e => e.event_type === "profile_view" && e.provider_id !== "SITE")) {
    pvMap[e.provider_id] = (pvMap[e.provider_id] || 0) + 1;
  }
  const topProviders = Object.entries(pvMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([id, count]) => ({ name: providerMap[id] || id, count }));

  // Top villages searched
  const villageMap: Record<string, number> = {};
  for (const e of todayEvents.filter(e => e.event_type === "search_appearance" && e.area_name)) {
    villageMap[e.area_name!] = (villageMap[e.area_name!] || 0) + 1;
  }
  const topVillages = Object.entries(villageMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  // 7-day trend
  const trend: { date: string; views: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const views = allAnalytics.filter(e => e.date_key === key && e.event_type === "homepage_view" && e.provider_id === "SITE").length;
    trend.push({ date: label, views });
  }
  const maxTrend = Math.max(...trend.map(t => t.views), 1);

  const trendBars = trend.map(t => {
    const pct = Math.round((t.views / maxTrend) * 80);
    return `
      <td style="text-align:center;padding:0 4px;vertical-align:bottom;">
        <div style="background:#E8431A;width:28px;height:${pct}px;border-radius:4px 4px 0 0;margin:0 auto;min-height:4px;"></div>
        <div style="font-size:10px;color:#888;margin-top:4px;">${t.date}</div>
        <div style="font-size:11px;font-weight:bold;color:#333;">${t.views}</div>
      </td>`;
  }).join("");

  const topProviderRows = topProviders.length > 0
    ? topProviders.map((p, i) => `
      <tr style="background:${i % 2 === 0 ? "#fff" : "#fafafa"}">
        <td style="padding:8px 12px;color:#666;">${i + 1}</td>
        <td style="padding:8px 12px;font-weight:600;color:#1B3D6F;">${p.name}</td>
        <td style="padding:8px 12px;text-align:center;color:#E8431A;font-weight:bold;">${p.count}</td>
      </tr>`).join("")
    : `<tr><td colspan="3" style="padding:16px;text-align:center;color:#999;">No profile views recorded yet today</td></tr>`;

  const topVillageRows = topVillages.length > 0
    ? topVillages.map((v, i) => `
      <tr>
        <td style="padding:6px 12px;color:#666;">${i + 1}.</td>
        <td style="padding:6px 12px;color:#1B3D6F;font-weight:600;">${v.name}</td>
        <td style="padding:6px 12px;text-align:right;color:#00BFA5;font-weight:bold;">${v.count} searches</td>
      </tr>`).join("")
    : `<tr><td colspan="3" style="padding:12px;color:#999;text-align:center;">No village searches recorded yet today</td></tr>`;

  const totalProviders = allProviders.filter(p => p.is_active && p.is_visible && p.id !== "test123").length;
  const trialProviders = allProviders.filter(p => p.subscription_status === "trial" && p.is_active).length;
  const paidProviders  = allProviders.filter(p => p.subscription_status === "active" && p.is_active).length;

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f1eb;font-family:Georgia,serif;">

  <!-- Header -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#1B3D6F 0%,#0d2444 100%);">
    <tr>
      <td style="padding:32px 40px;text-align:center;">
        <img src="https://media.base44.com/images/public/69d062aca815ce8e697894b1/a9af95bc3_V-Hublogo.png" width="60" style="margin-bottom:12px;" /><br>
        <span style="font-family:Georgia,serif;font-size:32px;color:#fff;font-style:italic;font-weight:bold;">V-Hub</span>
        <span style="font-family:Georgia,serif;font-size:32px;color:#E8431A;font-weight:bold;"></span><br>
        <span style="font-family:Arial,sans-serif;font-size:12px;color:#a0b8d8;letter-spacing:3px;text-transform:uppercase;">Daily Performance Report v2</span><br>
        <span style="font-family:Arial,sans-serif;font-size:13px;color:#7a9cbf;margin-top:6px;display:block;">${reportDate}</span>
      </td>
    </tr>
  </table>

  <!-- Intro -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#1B3D6F;">
    <tr>
      <td style="padding:12px 40px 20px;text-align:center;">
        <span style="color:#E8431A;font-size:13px;font-family:Arial,sans-serif;">📊 Here's everything that happened on V-Hub in the last 24 hours</span>
      </td>
    </tr>
  </table>

  <table width="640" cellpadding="0" cellspacing="0" align="center" style="margin:24px auto;">

    <!-- SITE TRAFFIC STATS -->
    <tr><td style="padding:0 0 20px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
        <tr style="background:#E8431A;">
          <td style="padding:14px 20px;">
            <span style="color:#fff;font-size:14px;font-family:Arial,sans-serif;font-weight:bold;letter-spacing:1px;">🔥 SITE TRAFFIC — TODAY</span>
          </td>
        </tr>
        <tr><td style="padding:20px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="width:20%;text-align:center;padding:16px 8px;">
                <div style="font-size:36px;font-weight:bold;color:#1B3D6F;">${homepageViews}</div>
                <div style="font-size:11px;color:#888;font-family:Arial,sans-serif;text-transform:uppercase;margin-top:4px;">Homepage<br>Visits</div>
                <div style="font-size:11px;margin-top:6px;">${delta(homepageViews, yHomepage)}</div>
              </td>
              <td style="width:20%;text-align:center;padding:16px 8px;border-left:1px solid #f0ebe0;">
                <div style="font-size:36px;font-weight:bold;color:#1B3D6F;">${profileViews}</div>
                <div style="font-size:11px;color:#888;font-family:Arial,sans-serif;text-transform:uppercase;margin-top:4px;">Profile<br>Views</div>
                <div style="font-size:11px;margin-top:6px;">${delta(profileViews, yProfile)}</div>
              </td>
              <td style="width:20%;text-align:center;padding:16px 8px;border-left:1px solid #f0ebe0;">
                <div style="font-size:36px;font-weight:bold;color:#1B3D6F;">${searchAppear}</div>
                <div style="font-size:11px;color:#888;font-family:Arial,sans-serif;text-transform:uppercase;margin-top:4px;">Search<br>Appearances</div>
                <div style="font-size:11px;margin-top:6px;">${delta(searchAppear, ySearch)}</div>
              </td>
              <td style="width:20%;text-align:center;padding:16px 8px;border-left:1px solid #f0ebe0;">
                <div style="font-size:36px;font-weight:bold;color:#E8431A;">${classifiedClicks}</div>
                <div style="font-size:11px;color:#888;font-family:Arial,sans-serif;text-transform:uppercase;margin-top:4px;">Ad<br>Clicks</div>
                <div style="font-size:11px;margin-top:6px;">${delta(classifiedClicks, yClassified)}</div>
              </td>
              <td style="width:20%;text-align:center;padding:16px 8px;border-left:1px solid #f0ebe0;">
                <div style="font-size:36px;font-weight:bold;color:#00BFA5;">${leadInquiries}</div>
                <div style="font-size:11px;color:#888;font-family:Arial,sans-serif;text-transform:uppercase;margin-top:4px;">Lead<br>Inquiries</div>
                <div style="font-size:11px;margin-top:6px;">${delta(leadInquiries, yLeads)}</div>
              </td>
            </tr>
          </table>
        </td></tr>
      </table>
    </td></tr>

    <!-- 7-DAY TREND -->
    <tr><td style="padding:0 0 20px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
        <tr style="background:#1B3D6F;">
          <td style="padding:14px 20px;">
            <span style="color:#fff;font-size:14px;font-family:Arial,sans-serif;font-weight:bold;letter-spacing:1px;">📈 7-DAY HOMEPAGE VISITS</span>
          </td>
        </tr>
        <tr><td style="padding:24px 20px;">
          <table align="center" cellpadding="0" cellspacing="0">
            <tr style="vertical-align:bottom;">${trendBars}</tr>
          </table>
        </td></tr>
      </table>
    </td></tr>

    <!-- TOP PROVIDERS -->
    <tr><td style="padding:0 0 20px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
        <tr style="background:#00BFA5;">
          <td style="padding:14px 20px;">
            <span style="color:#fff;font-size:14px;font-family:Arial,sans-serif;font-weight:bold;letter-spacing:1px;">👀 TOP 10 PROVIDERS BY PROFILE VIEWS TODAY</span>
          </td>
        </tr>
        <tr><td>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr style="background:#f0ebe0;">
              <th style="padding:8px 12px;text-align:left;font-size:11px;color:#888;font-family:Arial,sans-serif;">#</th>
              <th style="padding:8px 12px;text-align:left;font-size:11px;color:#888;font-family:Arial,sans-serif;">PROVIDER</th>
              <th style="padding:8px 12px;text-align:center;font-size:11px;color:#888;font-family:Arial,sans-serif;">VIEWS</th>
            </tr>
            ${topProviderRows}
          </table>
        </td></tr>
      </table>
    </td></tr>

    <!-- TOP VILLAGES -->
    <tr><td style="padding:0 0 20px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
        <tr style="background:#1B3D6F;">
          <td style="padding:14px 20px;">
            <span style="color:#fff;font-size:14px;font-family:Arial,sans-serif;font-weight:bold;letter-spacing:1px;">📍 TOP VILLAGES SEARCHED TODAY</span>
          </td>
        </tr>
        <tr><td style="padding:8px 0;">
          <table width="100%" cellpadding="0" cellspacing="0">${topVillageRows}</table>
        </td></tr>
      </table>
    </td></tr>

    <!-- DIRECTORY HEALTH -->
    <tr><td style="padding:0 0 20px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
        <tr style="background:#E8431A;">
          <td style="padding:14px 20px;">
            <span style="color:#fff;font-size:14px;font-family:Arial,sans-serif;font-weight:bold;letter-spacing:1px;">🏠 DIRECTORY HEALTH</span>
          </td>
        </tr>
        <tr><td style="padding:20px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="text-align:center;padding:12px;">
                <div style="font-size:40px;font-weight:bold;color:#1B3D6F;">${totalProviders}</div>
                <div style="font-size:11px;color:#888;font-family:Arial,sans-serif;text-transform:uppercase;margin-top:4px;">Active Listings</div>
              </td>
              <td style="text-align:center;padding:12px;border-left:1px solid #f0ebe0;">
                <div style="font-size:40px;font-weight:bold;color:#E8431A;">${trialProviders}</div>
                <div style="font-size:11px;color:#888;font-family:Arial,sans-serif;text-transform:uppercase;margin-top:4px;">On Trial</div>
              </td>
              <td style="text-align:center;padding:12px;border-left:1px solid #f0ebe0;">
                <div style="font-size:40px;font-weight:bold;color:#00BFA5;">${paidProviders}</div>
                <div style="font-size:11px;color:#888;font-family:Arial,sans-serif;text-transform:uppercase;margin-top:4px;">Paid Subscribers</div>
              </td>
            </tr>
          </table>
        </td></tr>
      </table>
    </td></tr>

    <!-- FOOTER -->
    <tr><td style="padding:0 0 40px;text-align:center;">
      <img src="https://media.base44.com/images/public/69d062aca815ce8e697894b1/0a0a19a9f_ronnie_hero_fixed.jpg" width="640" style="border-radius:12px;width:100%;max-width:640px;height:160px;object-fit:cover;display:block;" /><br>
      <p style="font-family:Arial,sans-serif;font-size:11px;color:#999;margin-top:16px;">
        This report is sent daily at noon ET by V-Hub Intelligence.<br>
        <a href="https://www.v-hub.us/Wekcadmin" style="color:#E8431A;">Open Admin Dashboard</a> · 
        <a href="https://www.v-hub.us/Home" style="color:#1B3D6F;">View Live Site</a>
      </p>
    </td></tr>

  </table>
</body>
</html>`;

  // Send via SendGrid
  const SENDGRID_KEY = Deno.env.get("SENDGRID_API_KEY");
  const recipients = [
    { email: "kimberlycook1980@gmail.com", name: "Kimberly" },
    { email: "evansrus@comcast.net", name: "William" }
  ];

  for (const r of recipients) {
    await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: { "Authorization": `Bearer ${SENDGRID_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: { email: "admin@v-hub.us", name: "V-Hub Intelligence" },
        to: [{ email: r.email, name: r.name }],
        subject: `📊 V-Hub Daily Report — ${reportDate}`,
        content: [{ type: "text/html", value: html }]
      })
    });
  }

  return new Response(JSON.stringify({ ok: true, stats: { homepageViews, profileViews, searchAppear, classifiedClicks, leadInquiries, totalProviders } }), {
    headers: { "Content-Type": "application/json" }
  });
}
