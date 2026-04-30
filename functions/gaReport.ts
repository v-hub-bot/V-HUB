// GA4 traffic report for V-HUB — property 534059288
import { createClientFromRequest } from "npm:@base44/sdk@0.8.23/deno";
const PROP = "properties/534059288";

export default async function handler(req: Request): Promise<Response> {
  const cors = {"Access-Control-Allow-Origin":"*","Access-Control-Allow-Methods":"POST, OPTIONS","Access-Control-Allow-Headers":"Content-Type, Authorization"};
  if (req.method === "OPTIONS") return new Response(null, {status:204,headers:cors});
  try {
    const body = await req.json().catch(()=>({}));
    const range = body.range||"30d";
    const startDate = range==="7d"?"7daysAgo":range==="365d"?"365daysAgo":range==="24h"?"1daysAgo":"30daysAgo";
    const base44 = createClientFromRequest(req);
    const {accessToken} = await base44.asServiceRole.connectors.getConnection("google_analytics");
    const ga = (payload:object)=>fetch(`https://analyticsdata.googleapis.com/v1beta/${PROP}:runReport`,{method:"POST",headers:{Authorization:`Bearer ${accessToken}`,"Content-Type":"application/json"},body:JSON.stringify(payload)}).then(r=>r.json());
    const [dd,sd,dvd,pd,td] = await Promise.all([
      ga({dateRanges:[{startDate,endDate:"today"}],dimensions:[{name:"date"}],metrics:[{name:"totalUsers"},{name:"screenPageViews"},{name:"sessions"},{name:"newUsers"},{name:"bounceRate"}],orderBys:[{dimension:{dimensionName:"date"}}]}),
      ga({dateRanges:[{startDate,endDate:"today"}],dimensions:[{name:"sessionDefaultChannelGroup"}],metrics:[{name:"sessions"},{name:"totalUsers"}],orderBys:[{metric:{metricName:"sessions"},desc:true}],limit:10}),
      ga({dateRanges:[{startDate,endDate:"today"}],dimensions:[{name:"deviceCategory"}],metrics:[{name:"sessions"},{name:"totalUsers"}],orderBys:[{metric:{metricName:"sessions"},desc:true}]}),
      ga({dateRanges:[{startDate,endDate:"today"}],dimensions:[{name:"pagePath"}],metrics:[{name:"screenPageViews"},{name:"totalUsers"}],orderBys:[{metric:{metricName:"screenPageViews"},desc:true}],limit:10}),
      ga({dateRanges:[{startDate,endDate:"today"}],metrics:[{name:"totalUsers"},{name:"newUsers"},{name:"sessions"},{name:"screenPageViews"},{name:"bounceRate"},{name:"averageSessionDuration"}]})
    ]);
    const daily=(dd.rows||[]).map((r:any)=>{const d=r.dimensionValues[0].value;return{date:`${d.slice(0,4)}-${d.slice(4,6)}-${d.slice(6,8)}`,users:+r.metricValues[0].value,pageViews:+r.metricValues[1].value,sessions:+r.metricValues[2].value,newUsers:+r.metricValues[3].value,bounceRate:parseFloat(r.metricValues[4].value)};});
    const sources=(sd.rows||[]).map((r:any)=>({channel:r.dimensionValues[0].value,sessions:+r.metricValues[0].value,users:+r.metricValues[1].value}));
    const devices=(dvd.rows||[]).map((r:any)=>({device:r.dimensionValues[0].value,sessions:+r.metricValues[0].value,users:+r.metricValues[1].value}));
    const pages=(pd.rows||[]).map((r:any)=>({path:r.dimensionValues[0].value,views:+r.metricValues[0].value,users:+r.metricValues[1].value}));
    const tv=td.rows?.[0]?.metricValues||[];
    const totals={users:+(tv[0]?.value||0),newUsers:+(tv[1]?.value||0),sessions:+(tv[2]?.value||0),pageViews:+(tv[3]?.value||0),bounceRate:parseFloat(tv[4]?.value||"0"),avgSessionDuration:parseFloat(tv[5]?.value||"0")};
    return new Response(JSON.stringify({daily,totals,sources,devices,pages,range}),{status:200,headers:{...cors,"Content-Type":"application/json"}});
  } catch(e){
    return new Response(JSON.stringify({error:String(e)}),{status:200,headers:{...cors,"Content-Type":"application/json"}});
  }
}
