// GA4 traffic report for V-HUB — property 534059288
// redeployed: 2026-05-12
import { createClientFromRequest } from "npm:@base44/sdk@0.8.23/deno";
const PROP = "properties/534059288";

export default async function handler(req: Request): Promise<Response> {
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  };
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });

  try {
    const body = await req.json().catch(() => ({}));
    const range = body.range || "30d";
    const startDate = range === "7d" ? "7daysAgo" : range === "365d" ? "365daysAgo" : range === "24h" ? "1daysAgo" : "30daysAgo";

    const base44 = createClientFromRequest(req);
    const { accessToken } = await base44.asServiceRole.connectors.getConnection("google_analytics");

    const fetchGA4 = (payload: object) =>
      fetch(`https://analyticsdata.googleapis.com/v1beta/${PROP}:runReport`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }).then(r => r.json());

    const [dailyData, sourceData, deviceData, pageData, totalsData] = await Promise.all([
      fetchGA4({
        dateRanges: [{ startDate, endDate: "today" }],
        dimensions: [{ name: "date" }],
        metrics: [
          { name: "totalUsers" }, { name: "screenPageViews" },
          { name: "sessions" }, { name: "newUsers" }, { name: "bounceRate" }
        ],
        orderBys: [{ dimension: { dimensionName: "date" } }]
      }),
      fetchGA4({
        dateRanges: [{ startDate, endDate: "today" }],
        dimensions: [{ name: "sessionDefaultChannelGroup" }],
        metrics: [{ name: "sessions" }, { name: "totalUsers" }],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        limit: 10
      }),
      fetchGA4({
        dateRanges: [{ startDate, endDate: "today" }],
        dimensions: [{ name: "deviceCategory" }],
        metrics: [{ name: "sessions" }, { name: "totalUsers" }],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }]
      }),
      fetchGA4({
        dateRanges: [{ startDate, endDate: "today" }],
        dimensions: [{ name: "pagePath" }],
        metrics: [{ name: "screenPageViews" }, { name: "totalUsers" }],
        orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
        limit: 10
      }),
      fetchGA4({
        dateRanges: [{ startDate, endDate: "today" }],
        metrics: [
          { name: "totalUsers" }, { name: "newUsers" }, { name: "sessions" },
          { name: "screenPageViews" }, { name: "bounceRate" }, { name: "averageSessionDuration" }
        ]
      })
    ]);

    const daily = (dailyData.rows || []).map((row: any) => {
      const rd = row.dimensionValues[0].value;
      const date = `${rd.slice(0,4)}-${rd.slice(4,6)}-${rd.slice(6,8)}`;
      const [users, pageViews, sessions, newUsers, bounceRate] = row.metricValues.map((v: any, i: number) =>
        i === 4 ? parseFloat(v.value) : parseInt(v.value)
      );
      return { date, users, pageViews, sessions, newUsers, bounceRate };
    });

    const sources = (sourceData.rows || []).map((row: any) => ({
      channel: row.dimensionValues[0].value,
      sessions: parseInt(row.metricValues[0].value),
      users: parseInt(row.metricValues[1].value)
    }));

    const devices = (deviceData.rows || []).map((row: any) => ({
      device: row.dimensionValues[0].value,
      sessions: parseInt(row.metricValues[0].value),
      users: parseInt(row.metricValues[1].value)
    }));

    const pages = (pageData.rows || []).map((row: any) => ({
      path: row.dimensionValues[0].value,
      views: parseInt(row.metricValues[0].value),
      users: parseInt(row.metricValues[1].value)
    }));

    const totalsRow = totalsData.rows?.[0]?.metricValues || [];
    const totals = {
      users: parseInt(totalsRow[0]?.value || "0"),
      newUsers: parseInt(totalsRow[1]?.value || "0"),
      sessions: parseInt(totalsRow[2]?.value || "0"),
      pageViews: parseInt(totalsRow[3]?.value || "0"),
      bounceRate: parseFloat(totalsRow[4]?.value || "0"),
      avgSessionDuration: parseFloat(totalsRow[5]?.value || "0")
    };

    return new Response(
      JSON.stringify({ ok: true, daily, totals, sources, devices, pages, range }),
      { status: 200, headers: { ...cors, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: String(e) }),
      { status: 200, headers: { ...cors, "Content-Type": "application/json" } }
    );
  }
}
