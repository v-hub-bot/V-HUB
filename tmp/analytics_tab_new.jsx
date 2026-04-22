function AnalyticsTab({ providers, reviews, leads, stats, catMap, svcMap, fullSvcMap, classifiedAds }) {
  const [timeRange, setTimeRange] = React.useState("30d");

  const now = new Date();
  const rangeMs = { "24h": 86400000, "7d": 7*86400000, "30d": 30*86400000, "365d": 365*86400000 };
  const cutoff = new Date(now - (rangeMs[timeRange] || rangeMs["30d"]));

  const filteredLeads = leads.filter(l => l.created_date && new Date(l.created_date) >= cutoff);
  const filteredReviews = reviews.filter(r => r.created_date && new Date(r.created_date) >= cutoff);
  const filteredProviders = providers.filter(p => p.created_date && new Date(p.created_date) >= cutoff);

  const paid = providers.filter(p => ["active","paid"].includes(p.subscription_status)).length;
  const trial = providers.filter(p => p.subscription_status === "trial").length;
  const inactive = providers.filter(p => ["inactive","expired","cancelled"].includes(p.subscription_status)).length;
  const activeAds = (classifiedAds||[]).filter(a => {
    if (!a.is_active) return false;
    if (a.deal_expires_at && new Date(a.deal_expires_at) < now) return false;
    return true;
  });
  const dealsRevenue = activeAds.length * 10;
  const totalRevenue = (paid * 12) + dealsRevenue;

  const byMonth = {};
  providers.forEach(p => {
    if (!p.created_date) return;
    const d = new Date(p.created_date);
    const k = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
    byMonth[k] = (byMonth[k]||0) + 1;
  });
  const months = Object.entries(byMonth).sort((a,b)=>a[0].localeCompare(b[0])).slice(-12);
  const maxM = Math.max(...months.map(m=>m[1]),1);

  const subMap2 = {};
  providers.forEach(p => { const s = p.subscription_status||"unknown"; subMap2[s]=(subMap2[s]||0)+1; });
  const subColors = { active:"#00BFA5", paid:"#00BFA5", trial:"#FFDB00", inactive:"#aaa", expired:"#E8431A", cancelled:"#E8431A", unknown:"#ccc" };

  const svcCount = {};
  providers.forEach(p => (Array.isArray(p.services)?p.services:[]).forEach(s => {
    const n = fullSvcMap[s]||svcMap[s]||s;
    svcCount[n] = (svcCount[n]||0)+1;
  }));
  const topSvcs = Object.entries(svcCount).sort((a,b)=>b[1]-a[1]).slice(0,8);
  const maxS = Math.max(...topSvcs.map(s=>s[1]),1);

  const topViewedProviders = [...providers].filter(p=>p.profile_views>0).sort((a,b)=>(b.profile_views||0)-(a.profile_views||0)).slice(0,8);
  const maxViews = Math.max(...topViewedProviders.map(p=>p.profile_views||0),1);

  const topSearchedProviders = [...providers].filter(p=>p.search_appearances>0).sort((a,b)=>(b.search_appearances||0)-(a.search_appearances||0)).slice(0,8);
  const maxSearch = Math.max(...topSearchedProviders.map(p=>p.search_appearances||0),1);

  const topSearches = [...stats].sort((a,b)=>(b.search_count||0)-(a.search_count||0)).slice(0,10);
  const maxSrch = Math.max(...topSearches.map(s=>s.search_count||0),1);

  const last7 = Array.from({length:7},(_,i)=>{ const d=new Date(now); d.setDate(d.getDate()-6+i); return d.toISOString().split("T")[0]; });
  const leadsByDay = {};
  leads.forEach(l => { if(!l.created_date)return; const k=l.created_date.split("T")[0]; leadsByDay[k]=(leadsByDay[k]||0)+1; });
  const last7Leads = last7.map(d=>({date:d,count:leadsByDay[d]||0}));
  const maxDayLeads = Math.max(...last7Leads.map(d=>d.count),1);

  const ratingDist = {1:0,2:0,3:0,4:0,5:0};
  reviews.forEach(r=>{ if(r.rating>=1&&r.rating<=5) ratingDist[r.rating]++; });
  const maxRatCount = Math.max(...Object.values(ratingDist),1);
  const avgRating = reviews.length>0?(reviews.reduce((s,r)=>s+(r.rating||0),0)/reviews.length).toFixed(1):"—";

  const totalViews = providers.reduce((s,p)=>s+(p.profile_views||0),0);
  const totalSearchAppearances = providers.reduce((s,p)=>s+(p.search_appearances||0),0);

  const rangeLabels = {"24h":"Last 24 Hours","7d":"Last 7 Days","30d":"Last 30 Days","365d":"Last 12 Months"};

  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>

      <div style={{...S.card,padding:"10px 16px"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
          <span style={{fontSize:12,fontWeight:700,color:T.brownLight,fontFamily:T.sans,marginRight:4}}>TIME RANGE:</span>
          {["24h","7d","30d","365d"].map(r=>(
            <button key={r} onClick={()=>setTimeRange(r)} style={{...S.filterBtn(timeRange===r),fontSize:12,padding:"5px 14px"}}>
              {r==="24h"?"24 Hours":r==="7d"?"7 Days":r==="30d"?"30 Days":"12 Months"}
            </button>
          ))}
        </div>
      </div>

      <div style={S.card}>
        <div style={S.secTitle}>📬 Activity — {rangeLabels[timeRange]}</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
          {[["New Providers",filteredProviders.length,T.teal],["New Leads",filteredLeads.length,"#1A6B3C"],["New Reviews",filteredReviews.length,T.gold]].map(([l,v,c])=>(
            <div key={l} style={{textAlign:"center",background:T.parchment,borderRadius:6,padding:"12px 6px"}}>
              <div style={{fontSize:26,fontWeight:800,color:c,fontFamily:T.sans}}>{v}</div>
              <div style={{fontSize:10,color:T.brownLight,fontFamily:T.sans,textTransform:"uppercase",letterSpacing:0.5}}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={S.card}>
        <div style={S.secTitle}>👁️ Platform Engagement (All-Time)</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
          {[["Total Profile Views",totalViews,T.brown],["Search Appearances",totalSearchAppearances,T.teal],["Total Leads Sent",leads.length,"#1A6B3C"]].map(([l,v,c])=>(
            <div key={l} style={{textAlign:"center",background:T.parchment,borderRadius:6,padding:"12px 6px"}}>
              <div style={{fontSize:26,fontWeight:800,color:c,fontFamily:T.sans}}>{v.toLocaleString()}</div>
              <div style={{fontSize:10,color:T.brownLight,fontFamily:T.sans,textTransform:"uppercase",letterSpacing:0.5}}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={S.card}>
        <div style={S.secTitle}>💰 Revenue Snapshot</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:10}}>
          {[["Est. MRR",`$${paid*12}`,T.green],["Paid Providers",paid,T.teal],["On Trial",trial,T.gold]].map(([l,v,c])=>(
            <div key={l} style={{textAlign:"center",background:T.parchment,borderRadius:6,padding:"12px 6px"}}>
              <div style={{fontSize:24,fontWeight:800,color:c,fontFamily:T.sans}}>{v}</div>
              <div style={{fontSize:10,color:T.brownLight,fontFamily:T.sans,textTransform:"uppercase",letterSpacing:0.5}}>{l}</div>
            </div>
          ))}
        </div>
        <div style={{borderTop:`1px solid ${T.border}`,paddingTop:10}}>
          <div style={{fontSize:11,fontWeight:700,color:T.brownLight,textTransform:"uppercase",letterSpacing:1,marginBottom:8,fontFamily:T.sans}}>Deals of the Week</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
            {[["Active Ads",activeAds.length,T.teal],["Ad Revenue (week)",`$${dealsRevenue}`,"#1A6B3C"],["Est. Total Revenue",`$${totalRevenue}`,T.green]].map(([l,v,c])=>(
              <div key={l} style={{textAlign:"center",background:T.parchment,borderRadius:6,padding:"12px 6px"}}>
                <div style={{fontSize:20,fontWeight:800,color:c,fontFamily:T.sans}}>{v}</div>
                <div style={{fontSize:10,color:T.brownLight,fontFamily:T.sans,textTransform:"uppercase",letterSpacing:0.5}}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={S.card}>
        <div style={S.secTitle}>📊 Subscription Breakdown</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:10}}>
          {Object.entries(subMap2).sort((a,b)=>b[1]-a[1]).map(([s,c])=>(
            <div key={s} style={{display:"flex",alignItems:"center",gap:6,background:T.parchment,borderRadius:20,padding:"5px 12px"}}>
              <div style={{width:10,height:10,borderRadius:"50%",background:subColors[s]||"#ccc"}}></div>
              <span style={{fontSize:12,color:T.brownDark,textTransform:"capitalize",fontFamily:T.sans}}>{s}</span>
              <span style={{fontSize:13,fontWeight:800,color:T.brown,fontFamily:T.sans}}>{c}</span>
            </div>
          ))}
        </div>
        <div style={{fontSize:11,color:T.brownLight,fontFamily:T.sans}}>Total: {providers.length} providers · {inactive} inactive/expired</div>
      </div>

      <div style={S.card}>
        <div style={S.secTitle}>📈 Provider Signups by Month</div>
        {months.length===0 ? <div style={{color:"#aaa",fontSize:13}}>No data yet</div> :
          <div style={{display:"flex",alignItems:"flex-end",gap:4,height:90,padding:"0 4px"}}>
            {months.map(([mo,cnt])=>(
              <div key={mo} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                <div style={{fontSize:9,color:T.brownLight,fontFamily:T.sans,fontWeight:700}}>{cnt}</div>
                <div style={{width:"100%",background:T.brown,borderRadius:"3px 3px 0 0",height:`${Math.max((cnt/maxM)*60,4)}px`}}></div>
                <div style={{fontSize:8,color:T.brownLight,fontFamily:T.sans,transform:"rotate(-45deg)",transformOrigin:"top left",marginLeft:6,whiteSpace:"nowrap"}}>
                  {mo.split("-")[1]}/{mo.split("-")[0].slice(2)}
                </div>
              </div>
            ))}
          </div>
        }
      </div>

      <div style={S.card}>
        <div style={S.secTitle}>📨 Leads Sent — Last 7 Days</div>
        <div style={{display:"flex",alignItems:"flex-end",gap:6,height:70}}>
          {last7Leads.map(({date,count})=>{
            const d=new Date(date+"T12:00:00");
            const label=d.toLocaleDateString("en-US",{weekday:"short"});
            return (
              <div key={date} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                <div style={{fontSize:9,color:T.brownLight,fontWeight:700,fontFamily:T.sans}}>{count||""}</div>
                <div style={{width:"100%",background:count>0?"#1A6B3C":"#e0d8c8",borderRadius:"3px 3px 0 0",height:`${Math.max((count/maxDayLeads)*50,3)}px`}}></div>
                <div style={{fontSize:9,color:T.brownLight,fontFamily:T.sans}}>{label}</div>
              </div>
            );
          })}
        </div>
        <div style={{marginTop:8,fontSize:11,color:T.brownLight,fontFamily:T.sans}}>
          {last7Leads.reduce((s,d)=>s+d.count,0)} leads in last 7 days · {leads.length} all-time
        </div>
      </div>

      {topViewedProviders.length>0 && (
        <div style={S.card}>
          <div style={S.secTitle}>🏆 Most Viewed Providers</div>
          {topViewedProviders.map((p,i)=>(
            <div key={p.id} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
              <div style={{fontSize:11,color:T.brownLight,fontFamily:T.sans,width:16,textAlign:"right",flexShrink:0}}>{i+1}</div>
              <div style={{fontSize:12,color:T.brownDark,fontFamily:T.sans,width:140,flexShrink:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.business_name}</div>
              <div style={{flex:1,background:T.parchmentDark,borderRadius:4,height:16}}>
                <div style={{width:`${((p.profile_views||0)/maxViews)*100}%`,background:T.brown,borderRadius:4,height:"100%",minWidth:20,display:"flex",alignItems:"center",paddingLeft:5}}>
                  <span style={{fontSize:9,color:"#fff",fontFamily:T.sans}}>{p.profile_views}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {topSearchedProviders.length>0 && (
        <div style={S.card}>
          <div style={S.secTitle}>🔎 Most Appeared in Searches</div>
          {topSearchedProviders.map((p,i)=>(
            <div key={p.id} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
              <div style={{fontSize:11,color:T.brownLight,fontFamily:T.sans,width:16,textAlign:"right",flexShrink:0}}>{i+1}</div>
              <div style={{fontSize:12,color:T.brownDark,fontFamily:T.sans,width:140,flexShrink:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.business_name}</div>
              <div style={{flex:1,background:T.parchmentDark,borderRadius:4,height:16}}>
                <div style={{width:`${((p.search_appearances||0)/maxSearch)*100}%`,background:T.teal,borderRadius:4,height:"100%",minWidth:20,display:"flex",alignItems:"center",paddingLeft:5}}>
                  <span style={{fontSize:9,color:"#fff",fontFamily:T.sans}}>{p.search_appearances}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {topSearches.length>0 && (
        <div style={S.card}>
          <div style={S.secTitle}>🔍 Top Search Terms</div>
          {topSearches.map((s,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
              <div style={{fontSize:11,color:T.brownLight,fontFamily:T.sans,width:16,textAlign:"right",flexShrink:0}}>{i+1}</div>
              <div style={{fontSize:11,color:T.brownDark,fontFamily:T.sans,width:150,flexShrink:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                {s.service_name}{s.area_key?` · ${s.area_key}`:""}
              </div>
              <div style={{flex:1,background:T.parchmentDark,borderRadius:4,height:16}}>
                <div style={{width:`${((s.search_count||0)/maxSrch)*100}%`,background:"#1A6B3C",borderRadius:4,height:"100%",minWidth:20,display:"flex",alignItems:"center",paddingLeft:5}}>
                  <span style={{fontSize:9,color:"#fff",fontFamily:T.sans}}>{s.search_count}x</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={S.card}>
        <div style={S.secTitle}>🛠️ Top Services Offered</div>
        {topSvcs.length===0 ? <div style={{color:"#aaa",fontSize:13}}>No data yet</div> :
          topSvcs.map(([svc,cnt])=>(
            <div key={svc} style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
              <div style={{fontSize:11,color:T.brownLight,fontFamily:T.sans,width:150,flexShrink:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{svc}</div>
              <div style={{flex:1,background:T.parchmentDark,borderRadius:4,height:16}}>
                <div style={{width:`${(cnt/maxS)*100}%`,background:T.teal,borderRadius:4,height:"100%",minWidth:16,display:"flex",alignItems:"center",paddingLeft:5}}>
                  <span style={{fontSize:9,color:"#fff"}}>{cnt}</span>
                </div>
              </div>
            </div>
          ))
        }
      </div>

      <div style={S.card}>
        <div style={S.secTitle}>⭐ Review Stats</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:12}}>
          {[["Total Reviews",reviews.length,T.brown],["Avg Rating",avgRating,T.gold],["Pending Approval",reviews.filter(r=>!r.is_approved).length,T.red]].map(([l,v,c])=>(
            <div key={l} style={{textAlign:"center",background:T.parchment,borderRadius:6,padding:"12px 6px"}}>
              <div style={{fontSize:24,fontWeight:800,color:c,fontFamily:T.sans}}>{v}</div>
              <div style={{fontSize:10,color:T.brownLight,fontFamily:T.sans,textTransform:"uppercase",letterSpacing:0.5}}>{l}</div>
            </div>
          ))}
        </div>
        <div style={{fontSize:11,fontWeight:700,color:T.brownLight,textTransform:"uppercase",letterSpacing:1,marginBottom:8,fontFamily:T.sans}}>Rating Distribution</div>
        {[5,4,3,2,1].map(star=>(
          <div key={star} style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
            <div style={{fontSize:11,color:T.gold,width:30,textAlign:"right",flexShrink:0,letterSpacing:-1}}>{"★".repeat(star)}</div>
            <div style={{flex:1,background:T.parchmentDark,borderRadius:4,height:14}}>
              <div style={{width:`${(ratingDist[star]/maxRatCount)*100}%`,background:T.gold,borderRadius:4,height:"100%",minWidth:ratingDist[star]>0?20:0,display:"flex",alignItems:"center",paddingLeft:4}}>
                {ratingDist[star]>0&&<span style={{fontSize:9,color:"#fff"}}>{ratingDist[star]}</span>}
              </div>
            </div>
            <div style={{fontSize:11,color:T.brownLight,fontFamily:T.sans,width:20}}>{ratingDist[star]}</div>
          </div>
        ))}
      </div>

      <div style={{...S.card,borderLeft:`4px solid ${T.teal}`}}>
        <div style={S.secTitle}>🌐 External Traffic (Google Analytics)</div>
        <div style={{fontSize:12,color:T.brownDark,fontFamily:T.sans,marginBottom:10}}>
          For site visitors, page views, and traffic sources, open GA4 directly:
        </div>
        <a href="https://analytics.google.com/analytics/web/#/p490233278/reports/reportinghub"
           target="_blank" rel="noopener noreferrer"
           style={{display:"inline-block",padding:"10px 20px",background:T.teal,color:"#fff",borderRadius:6,fontWeight:700,fontSize:13,textDecoration:"none"}}>
          📊 Open Google Analytics →
        </a>
        <div style={{marginTop:6,fontSize:10,color:"#aaa",fontFamily:T.sans}}>Property: G-1EJ40FW9E1 · www.v-hub.us</div>
      </div>

    </div>
  );
}

