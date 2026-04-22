import { createClientFromRequest } from "npm:@base44/sdk@0.8.23/deno";

const GA4_PROPERTY_ID = "properties/490233278"; // G-1EJ40FW9E1

export default async function handler(req: Request): Promise<Response> {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const range = body.range || "30d";

    // Map range to GA4 date range
    const rangeMap: Record<string, string> = {
      "24h": "yesterday",
      "7d": "7daysAgo",
      "30d": "30daysAgo",
      "365d": "365daysAgo",
    };
    const startDate = rangeMap[range] || "30daysAgo";

    // Get GA4 access token from connector
    const base44 = createClientFromRequest(req);
    const { accessToken } = await base44.asServiceRole.connectors.getConnection("google_analytics");

    // Query GA4 Data API
    const gaRes = await fetch(
      `https://analyticsdata.googleapis.com/v1beta/${GA4_PROPERTY_ID}:runReport`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dateRanges: [{ startDate, endDate: "today" }],
          metrics: [
            { name: "totalUsers" },
            { name: "screenPageViews" },
            { name: "sessions" },
            { name: "averageSessionDuration" },
          ],
        }),
      }
    );

    if (!gaRes.ok) {
      const err = await gaRes.text();
      console.error("GA4 API error:", err);
      return new Response(JSON.stringify({ error: "GA4 unavailable", detail: err }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const gaData = await gaRes.json();
    const row = gaData.rows?.[0]?.metricValues || [];

    const visitors = parseInt(row[0]?.value || "0");
    const pageViews = parseInt(row[1]?.value || "0");
    const sessions = parseInt(row[2]?.value || "0");
    const avgSec = parseFloat(row[3]?.value || "0");
    const mins = Math.floor(avgSec / 60);
    const secs = Math.floor(avgSec % 60);
    const avgDuration = avgSec > 0 ? `${mins}m ${secs}s` : "—";

    return new Response(
      JSON.stringify({ visitors, pageViews, sessions, avgDuration, range }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("getGaTraffic error:", e);
    return new Response(
      JSON.stringify({ error: String(e) }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}
