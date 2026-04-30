// v3-rebuild-1777581248
import { createClientFromRequest } from "npm:@base44/sdk@0.8.23/deno";
const GA4_PROPERTY_ID = "properties/490233278";
export default async function handler(req: Request): Promise<Response> {
  const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type, Authorization" };
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  try {
    const body = await req.json().catch(() => ({}));
    const range = body.range || "30d";
    const rangeMap: Record<string,string> = { "7d":"7daysAgo","30d":"30daysAgo","365d":"365daysAgo" };
    const startDate = rangeMap[range] || "30daysAgo";
    const base44 = createClientFromRequest(req);
    const { accessToken } = await base44.asServiceRole.connectors.getConnection("google_analytics");
    const r = await fetch(`https://analyticsdata.googleapis.com/v1beta/${GA4_PROPERTY_ID}:runReport`, {
      method:"POST", headers:{ Authorization:`Bearer ${accessToken}`,"Content-Type":"application/json" },
      body: JSON.stringify({ dateRanges:[{startDate,endDate:"today"}], dimensions:[{name:"date"}],
        metrics:[{name:"totalUsers"},{name:"screenPageViews"},{name:"sessions"},{name:"newUsers"}],
        orderBys:[{dimension:{dimensionName:"date"}}] })
    });
    const txt = await r.text();
    if (!r.ok) return new Response(JSON.stringify({error:"GA4 error",detail:txt}),{status:200,headers:{...cors,"Content-Type":"application/json"}});
    const d = JSON.parse(txt);
    const daily = (d.rows||[]).map((row:any)=>{
      const rd=row.dimensionValues[0].value;
      const date=`${rd.slice(0,4)}-${rd.slice(4,6)}-${rd.slice(6,8)}`;
      const [users,pageViews,sessions,newUsers]=row.metricValues.map((v:any)=>parseInt(v.value));
      return {date,users,pageViews,sessions,newUsers};
    });
    const totals=daily.reduce((a:any,x:any)=>({users:a.users+x.users,pageViews:a.pageViews+x.pageViews,sessions:a.sessions+x.sessions,newUsers:a.newUsers+x.newUsers}),{users:0,pageViews:0,sessions:0,newUsers:0});
    return new Response(JSON.stringify({daily,totals,range}),{status:200,headers:{...cors,"Content-Type":"application/json"}});
  } catch(e) {
    return new Response(JSON.stringify({error:String(e)}),{status:200,headers:{"Content-Type":"application/json"}});
  }
}
