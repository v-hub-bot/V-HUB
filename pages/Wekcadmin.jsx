import React, { useState, useEffect } from "react";

const PINS = ["6185", "1357"];
const API = "https://api.base44.app/api/apps/69d062aca815ce8e697894b1";
const BRAND = { orange: "#E8431A", teal: "#00BFA5", blue: "#1A3F70", bg: "#F5F7FA" };
const LOGO = "https://media.base44.com/images/public/69d062aca815ce8e697894b1/a9af95bc3_V-Hublogo.png";

function PinGate({ onUnlock }) {
  const [pin, setPin] = useState("");
  const [err, setErr] = useState(false);
  const submit = () => {
    if (PINS.includes(pin)) { onUnlock(); }
    else { setErr(true); setPin(""); setTimeout(() => setErr(false), 2000); }
  };
  return (
    <div style={{ minHeight: "100vh", background: BRAND.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Arial, sans-serif" }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: "40px 32px", boxShadow: "0 8px 32px rgba(0,0,0,0.12)", textAlign: "center", width: 300 }}>
        <img src={LOGO} style={{ width: 64, borderRadius: 12, marginBottom: 16 }} alt="" />
        <div style={{ fontSize: 20, fontWeight: 800, color: "#222", marginBottom: 6 }}>Admin Access</div>
        <div style={{ fontSize: 13, color: "#999", marginBottom: 20 }}>Enter your 4-digit PIN</div>
        <input
          autoFocus type="password" inputMode="numeric" maxLength={4} value={pin}
          onChange={e => setPin(e.target.value.replace(/\D/g,"").slice(0,4))}
          onKeyDown={e => e.key === "Enter" && submit()}
          placeholder="••••"
          style={{ width:"100%", boxSizing:"border-box", fontSize:28, textAlign:"center", letterSpacing:10, padding:"12px", borderRadius:10, border: err ? "2px solid #e00" : "2px solid #ddd", background: err ? "#fff5f5" : "#f9f9f9", marginBottom:10, outline:"none" }}
        />
        {err && <div style={{ color:"#c00", fontSize:13, marginBottom:8 }}>Incorrect PIN</div>}
        <button onClick={submit} style={{ width:"100%", background:BRAND.orange, color:"#fff", border:"none", borderRadius:10, padding:13, fontSize:16, fontWeight:700, cursor:"pointer" }}>Unlock</button>
        <a href="/" style={{ display:"block", marginTop:14, fontSize:12, color:"#bbb", textDecoration:"none" }}>Back to V-Hub</a>
      </div>
    </div>
  );
}

function Dashboard() {
  const [providers, setProviders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [tab, setTab] = useState("Providers");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.allSettled([
      fetch(`${API}/functions/getProviders`, { method:"POST", headers:{"Content-Type":"application/json"}, body:"{}" }).then(r => r.json()),
      fetch(`${API}/entities/ProviderReview`).then(r => r.ok ? r.json() : [])
    ]).then(([p, r]) => {
      const pd = p.status === "fulfilled" ? p.value : [];
      const rd = r.status === "fulfilled" ? r.value : [];
      setProviders(Array.isArray(pd) ? pd : pd.providers || []);
      setReviews(Array.isArray(rd) ? rd : []);
      setLoading(false);
    });
  }, []);

  const pending = reviews.filter(r => !r.is_approved);

  const toggleActive = async (p) => {
    await fetch(`${API}/entities/Provider/${p.id}`, { method:"PUT", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ is_active: !p.is_active }) });
    setProviders(prev => prev.map(x => x.id === p.id ? {...x, is_active: !p.is_active} : x));
  };

  const approveReview = async (r) => {
    await fetch(`${API}/entities/ProviderReview/${r.id}`, { method:"PUT", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ is_approved: true }) });
    setReviews(prev => prev.map(x => x.id === r.id ? {...x, is_approved: true} : x));
  };

  const deleteReview = async (r) => {
    if (!window.confirm("Delete this review?")) return;
    await fetch(`${API}/entities/ProviderReview/${r.id}`, { method:"DELETE" });
    setReviews(prev => prev.filter(x => x.id !== r.id));
  };

  if (loading) return (
    <div style={{ minHeight:"100vh", background:BRAND.bg, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:12, fontFamily:"Arial,sans-serif" }}>
      <img src={LOGO} style={{ width:56, borderRadius:10 }} alt="" />
      <div style={{ color:"#888", fontSize:15 }}>Loading...</div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:BRAND.bg, fontFamily:"Arial,sans-serif" }}>
      <div style={{ background:`linear-gradient(135deg,${BRAND.orange},${BRAND.teal})`, padding:"14px 20px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <img src={LOGO} style={{ height:40, borderRadius:8 }} alt="" />
          <div>
            <div style={{ color:"#fff", fontSize:17, fontWeight:800 }}>V-HUB Admin</div>
            <div style={{ color:"rgba(255,255,255,0.8)", fontSize:11 }}>{providers.length} providers · {pending.length} reviews pending</div>
          </div>
        </div>
        <a href="/" style={{ color:"#fff", fontSize:13, textDecoration:"none" }}>View Site</a>
      </div>

      <div style={{ display:"flex", gap:12, padding:"16px 16px 0", flexWrap:"wrap" }}>
        {[
          { label:"Total", val:providers.length, c:BRAND.blue },
          { label:"Active", val:providers.filter(p=>p.is_active).length, c:"#00897b" },
          { label:"Hidden", val:providers.filter(p=>!p.is_active).length, c:"#f59e0b" },
          { label:"Reviews Pending", val:pending.length, c:BRAND.orange },
        ].map(s => (
          <div key={s.label} style={{ background:"#fff", borderRadius:10, padding:"12px 16px", flex:"1 1 100px", boxShadow:"0 1px 6px rgba(0,0,0,0.07)", borderTop:`3px solid ${s.c}` }}>
            <div style={{ fontSize:26, fontWeight:800, color:s.c }}>{s.val}</div>
            <div style={{ fontSize:11, color:"#888" }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display:"flex", gap:8, padding:"16px 16px 0" }}>
        {["Providers","Reviews"].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding:"8px 18px", borderRadius:8, border:"none", fontWeight:700, fontSize:13, cursor:"pointer", background: tab===t ? BRAND.orange : "#fff", color: tab===t ? "#fff" : "#555" }}>
            {t}{t==="Reviews" && pending.length > 0 ? ` (${pending.length})` : ""}
          </button>
        ))}
      </div>

      <div style={{ padding:16 }}>
        {tab === "Providers" && (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {providers.length === 0 && <div style={{ textAlign:"center", color:"#999", padding:40 }}>No providers yet.</div>}
            {providers.map(p => (
              <div key={p.id} style={{ background:"#fff", borderRadius:10, padding:"14px 16px", boxShadow:"0 1px 6px rgba(0,0,0,0.07)", display:"flex", alignItems:"center", justifyContent:"space-between", gap:10, flexWrap:"wrap" }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:15 }}>{p.business_name}</div>
                  <div style={{ fontSize:12, color:"#888" }}>{p.owner_name} · {p.email}</div>
                  <div style={{ fontSize:11, color:"#aaa" }}>{p.phone}{p.vh_number ? ` · VH-${p.vh_number}` : ""}</div>
                </div>
                <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
                  <span style={{ fontSize:11, fontWeight:700, padding:"3px 9px", borderRadius:20, background: p.is_active ? "#e8f5e9" : "#fce8e8", color: p.is_active ? "#388e3c" : "#c00" }}>{p.is_active ? "Active" : "Hidden"}</span>
                  <span style={{ fontSize:11, fontWeight:700, padding:"3px 9px", borderRadius:20, background:"#f0f0f0", color:"#555" }}>{p.subscription_status || "—"}</span>
                  <button onClick={() => toggleActive(p)} style={{ fontSize:12, padding:"5px 12px", borderRadius:8, border:"1px solid #ddd", background:"#f5f5f5", cursor:"pointer", fontWeight:600 }}>{p.is_active ? "Deactivate" : "Activate"}</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "Reviews" && (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {reviews.length === 0 && <div style={{ textAlign:"center", color:"#999", padding:40 }}>No reviews yet.</div>}
            {reviews.map(r => (
              <div key={r.id} style={{ background:"#fff", borderRadius:10, padding:"14px 16px", boxShadow:"0 1px 6px rgba(0,0,0,0.07)" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                  <div style={{ fontWeight:700, fontSize:14 }}>{r.customer_name} <span style={{ color:"#f59e0b" }}>{"★".repeat(r.rating||0)}</span></div>
                  <span style={{ fontSize:11, fontWeight:700, padding:"3px 9px", borderRadius:20, background: r.is_approved ? "#e8f5e9" : "#fff3e0", color: r.is_approved ? "#388e3c" : "#e65100" }}>{r.is_approved ? "Approved" : "Pending"}</span>
                </div>
                <div style={{ fontSize:13, color:"#555", marginBottom:10 }}>{r.review_text}</div>
                <div style={{ display:"flex", gap:8 }}>
                  {!r.is_approved && <button onClick={() => approveReview(r)} style={{ fontSize:12, padding:"5px 14px", borderRadius:8, border:"none", background:BRAND.teal, color:"#fff", cursor:"pointer", fontWeight:700 }}>Approve</button>}
                  <button onClick={() => deleteReview(r)} style={{ fontSize:12, padding:"5px 14px", borderRadius:8, border:"1px solid #eee", background:"#fff", color:"#c00", cursor:"pointer", fontWeight:700 }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Wekcadmin() {
  const [unlocked, setUnlocked] = useState(false);
  return unlocked ? <Dashboard /> : <PinGate onUnlock={() => setUnlocked(true)} />;
}
