import React, { useState, useEffect } from "react";
import { ServiceArea, Category, Service, Provider, ProviderReview } from "@/api/entities";

// ─── Constants ────────────────────────────────────────────────────────────────
const VALID_PINS = ["6185"];
const BRAND = {
  orange: "#E8431A",
  teal: "#00BFA5",
  blue: "#0077B6",
  lightBg: "#F0FAF9",
  text: "#1A1A2E",
  subtext: "#555",
};
const TABS = ["Providers", "Reviews", "Categories", "Services", "Service Areas"];

const labelStyle = { display: "block", fontSize: 14, fontWeight: 600, color: "#333", marginBottom: 5 };
const inputStyle = { width: "100%", padding: "10px 12px", fontSize: 14, borderRadius: 8, border: "1.5px solid #ddd", background: "#fff", color: "#333", outline: "none", boxSizing: "border-box" };
const addBtnStyle = { background: `linear-gradient(135deg, ${BRAND.orange}, ${BRAND.teal})`, color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", fontSize: 14, fontWeight: 700, cursor: "pointer" };
const editBtnStyle = { background: "#e8f4fd", color: BRAND.blue, border: "none", borderRadius: 7, padding: "7px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" };
const deleteBtnStyle = { background: "#fdecea", color: BRAND.orange, border: "none", borderRadius: 7, padding: "7px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" };

// ─── PIN Gate ─────────────────────────────────────────────────────────────────
function PinGate({ onUnlock }) {
  const [pin, setPin] = useState("");
  const [err, setErr] = useState(false);

  const press = (d) => {
    const next = pin + d;
    setPin(next);
    setErr(false);
    if (next.length === 4) {
      if (VALID_PINS.includes(next)) {
        try { sessionStorage.setItem("vhub_admin_pin", next); } catch(e) {}
        onUnlock(next);
      } else {
        setErr(true);
        setTimeout(() => { setPin(""); setErr(false); }, 900);
      }
    }
  };

  const PAPER = "#F5E8CC";
  const BROWN = "#8B4513";

  return (
    <div style={{ minHeight: "100vh", background: "#1A0A00", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif" }}>
      <img src="https://media.base44.com/images/public/69d062aca815ce8e697894b1/a9af95bc3_V-Hublogo.png"
        style={{ width: 72, height: 72, borderRadius: 12, marginBottom: 18 }} alt="V-Hub" />
      <div style={{ color: PAPER, fontSize: 20, fontWeight: 900, letterSpacing: 3, marginBottom: 4 }}>V-HUB ADMIN</div>
      <div style={{ color: "rgba(245,232,204,0.45)", fontSize: 11, marginBottom: 28, letterSpacing: 1 }}>RESTRICTED ACCESS</div>
      <div style={{ background: "#2A1500", border: `1px solid ${BROWN}`, borderRadius: 12, padding: "24px 28px", width: 210 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: PAPER, textAlign: "center", marginBottom: 12, letterSpacing: 2 }}>ENTER PIN</div>
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 18 }}>
          {[0,1,2,3].map(i => (
            <div key={i} style={{ width: 14, height: 14, borderRadius: "50%", border: `2px solid ${BROWN}`, background: pin.length > i ? (err ? "#c00" : BROWN) : "transparent" }} />
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
          {["1","2","3","4","5","6","7","8","9"].map(d => (
            <button key={d} onClick={() => press(d)}
              style={{ padding: "11px 0", fontSize: 17, fontWeight: 700, color: PAPER, background: "#3A1A00", border: `1px solid ${BROWN}`, borderRadius: 6, cursor: "pointer" }}>
              {d}
            </button>
          ))}
          <button onClick={() => setPin(p => p.slice(0,-1))}
            style={{ padding: "11px 0", fontSize: 13, color: PAPER, background: "#3A1A00", border: `1px solid ${BROWN}`, borderRadius: 6, cursor: "pointer" }}>⌫</button>
          <button onClick={() => press("0")}
            style={{ padding: "11px 0", fontSize: 17, fontWeight: 700, color: PAPER, background: "#3A1A00", border: `1px solid ${BROWN}`, borderRadius: 6, cursor: "pointer" }}>0</button>
          <div />
        </div>
        {err && <div style={{ textAlign: "center", color: "#f66", fontSize: 11, marginTop: 8, fontStyle: "italic" }}>Incorrect PIN</div>}
      </div>
      <a href="/" style={{ color: "rgba(245,232,204,0.3)", fontSize: 11, marginTop: 24, textDecoration: "none" }}>← Back to V-Hub</a>
    </div>
  );
}

// ─── Reviews Tab ──────────────────────────────────────────────────────────────
function ReviewsTab({ reviews, providers, onRefresh }) {
  const [filter, setFilter] = useState("pending");
  const shown = reviews.filter(r => filter === "all" ? true : filter === "pending" ? !r.is_approved : r.is_approved);

  const approve = async (r) => { await ProviderReview.update(r.id, { is_approved: true }); onRefresh(); };
  const del = async (r) => { if (!window.confirm("Delete review?")) return; await ProviderReview.delete(r.id); onRefresh(); };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: BRAND.text }}>
          Reviews ({reviews.length} · {reviews.filter(r => !r.is_approved).length} pending)
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {["pending","approved","all"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ background: filter === f ? BRAND.orange : "#fff", color: filter === f ? "#fff" : BRAND.text, border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", textTransform: "capitalize" }}>
              {f}
            </button>
          ))}
        </div>
      </div>
      {shown.length === 0 && <div style={{ textAlign: "center", padding: 40, color: BRAND.subtext, fontStyle: "italic" }}>No {filter} reviews.</div>}
      {shown.map(r => {
        const prov = providers.find(p => p.id === r.provider_id);
        return (
          <div key={r.id} style={{ background: "#fff", borderRadius: 12, padding: "14px 18px", marginBottom: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.07)", borderLeft: `4px solid ${r.is_approved ? BRAND.teal : BRAND.orange}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 6 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{r.customer_name}
                  {r.customer_village && <span style={{ fontSize: 11, color: BRAND.subtext, marginLeft: 8 }}>📍 {r.customer_village}</span>}
                </div>
                <div style={{ fontSize: 12, color: BRAND.teal }}>For: <strong>{prov ? prov.business_name : r.provider_id}</strong></div>
                <div style={{ fontSize: 12, color: "#B8860B" }}>{"★".repeat(r.rating || 0)} {r.rating}/5</div>
              </div>
              <span style={{ background: r.is_approved ? BRAND.teal + "22" : BRAND.orange + "22", color: r.is_approved ? BRAND.teal : BRAND.orange, borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700, alignSelf: "flex-start" }}>
                {r.is_approved ? "✅ Approved" : "⏳ Pending"}
              </span>
            </div>
            <div style={{ fontSize: 13, color: BRAND.subtext, fontStyle: "italic", margin: "8px 0", borderLeft: "3px solid #eee", paddingLeft: 8 }}>"{r.review_text}"</div>
            <div style={{ display: "flex", gap: 6 }}>
              {!r.is_approved && <button onClick={() => approve(r)} style={{ background: BRAND.teal, color: "#fff", border: "none", borderRadius: 7, padding: "7px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>✓ Approve</button>}
              <button onClick={() => del(r)} style={{ background: "#fdecea", color: "#c00", border: "none", borderRadius: 7, padding: "7px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Delete</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Provider Form ────────────────────────────────────────────────────────────
function ProviderForm({ provider, categories, services, areas, onClose, onSaved }) {
  const blank = { business_name:"", owner_name:"", email:"", phone:"", website:"", description:"", category_id:"", service_areas:[], services:[], subscription_status:"trial", subscription_tier:"basic", is_visible:true, years_in_business:"", license_number:"" };
  const [form, setForm] = useState(provider || blank);
  const [saving, setSaving] = useState(false);

  const filteredServices = form.category_id ? services.filter(s => s.category_id === form.category_id) : services;

  const toggleArr = (key, val) => setForm(prev => ({
    ...prev, [key]: (prev[key] || []).includes(val) ? (prev[key] || []).filter(x => x !== val) : [...(prev[key] || []), val]
  }));

  const handleSave = async () => {
    setSaving(true);
    try {
      if (provider && provider.id) { await Provider.update(provider.id, form); }
      else { await Provider.create(form); }
      onSaved(); onClose();
    } catch(e) { alert("Save failed: " + e.message); }
    setSaving(false);
  };

  const F = ({ label, k, type="text" }) => (
    <div style={{ marginBottom: 12 }}>
      <label style={labelStyle}>{label}</label>
      {type === "checkbox"
        ? <input type="checkbox" checked={form[k] !== false} onChange={e => setForm({...form, [k]: e.target.checked})} style={{ width:18, height:18 }} />
        : <input type={type} value={form[k] || ""} onChange={e => setForm({...form, [k]: e.target.value})} style={inputStyle} />
      }
    </div>
  );

  return (
    <div style={{ background: "#fff", borderRadius: 16, padding: "22px", boxShadow: "0 4px 20px rgba(0,0,0,0.10)", marginBottom: 20, border: `2px solid ${BRAND.teal}30` }}>
      <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 16, color: BRAND.text }}>{provider ? "✏️ Edit Provider" : "➕ Add Provider"}</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "0 16px" }}>
        <F label="Business Name *" k="business_name" />
        <F label="Owner Name" k="owner_name" />
        <F label="Email" k="email" type="email" />
        <F label="Phone" k="phone" />
        <F label="Website" k="website" />
        <F label="Years in Business" k="years_in_business" />
        <F label="License #" k="license_number" />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={labelStyle}>Description</label>
        <textarea value={form.description || ""} onChange={e => setForm({...form, description: e.target.value})}
          style={{ ...inputStyle, minHeight: 70, resize: "vertical" }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "0 16px" }}>
        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>Category</label>
          <select value={form.category_id || ""} onChange={e => setForm({...form, category_id: e.target.value})} style={inputStyle}>
            <option value="">— Select Category —</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </select>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>Subscription Status</label>
          <select value={form.subscription_status || "trial"} onChange={e => setForm({...form, subscription_status: e.target.value})} style={inputStyle}>
            {["trial","pending","active","cancelled","expired"].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
      {/* Service areas */}
      <div style={{ marginBottom: 12 }}>
        <label style={labelStyle}>🗺️ Service Areas</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {areas.map(a => (
            <div key={a.id} onClick={() => toggleArr("service_areas", a.id)}
              style={{ background: (form.service_areas || []).includes(a.id) ? BRAND.teal : "#f0f0f0", color: (form.service_areas || []).includes(a.id) ? "#fff" : BRAND.text, borderRadius: 16, padding: "5px 12px", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
              {a.name}
            </div>
          ))}
        </div>
      </div>
      {/* Services */}
      {filteredServices.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>🛠️ Services Offered</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {filteredServices.map(s => (
              <div key={s.id} onClick={() => toggleArr("services", s.name)}
                style={{ background: (form.services || []).includes(s.name) ? BRAND.orange : "#f0f0f0", color: (form.services || []).includes(s.name) ? "#fff" : BRAND.text, borderRadius: 16, padding: "5px 12px", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                {s.name}
              </div>
            ))}
          </div>
        </div>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <input type="checkbox" id="vis" checked={form.is_visible !== false} onChange={e => setForm({...form, is_visible: e.target.checked})} style={{ width:18, height:18 }} />
        <label htmlFor="vis" style={{ fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Visible to customers</label>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={handleSave} disabled={saving || !form.business_name}
          style={{ ...addBtnStyle, opacity: saving || !form.business_name ? 0.6 : 1 }}>
          {saving ? "Saving…" : provider ? "Save Changes" : "Add Provider"}
        </button>
        <button onClick={onClose} style={{ background: "#f0f0f0", color: BRAND.text, border: "none", borderRadius: 10, padding: "10px 18px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
      </div>
    </div>
  );
}

// ─── Providers Tab ────────────────────────────────────────────────────────────
function ProvidersTab({ providers, categories, services, areas, onRefresh }) {
  const [msg, setMsg] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const flash = (m, ms = 6000) => { setMsg(m); setTimeout(() => setMsg(""), ms); };

  const del = async (id) => { if (!window.confirm("Delete provider?")) return; await Provider.delete(id); onRefresh(); };

  const sendPayLink = async (p) => {
    if (!p.email) { flash("❌ Provider has no email on file."); return; }
    flash("⏳ Generating payment link…");
    try {
      const res = await fetch("/functions/createCheckoutSession", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ provider_id: p.provider_id, provider_email: p.email, provider_name: p.owner_name, business_name: p.business_name }) });
      const d = await res.json();
      if (d.url) { try { await navigator.clipboard.writeText(d.url); } catch(e) {} flash("✅ Payment link copied! Send to " + (p.email || p.business_name)); window.open(d.url, "_blank"); }
      else flash("❌ " + (d.error || "Failed to generate link."));
    } catch(e) { flash("❌ " + e.message); }
  };

  const approveProv = async (p) => {
    if (!window.confirm(`Approve "${p.business_name}" and make them live?`)) return;
    flash("⏳ Approving…");
    try {
      const res = await fetch("/functions/approveProvider", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ provider_record_id: p.id, provider_id: p.provider_id, business_name: p.business_name, owner_name: p.owner_name, email: p.email, phone: p.phone, services: p.services||[], service_areas: p.service_areas||[] }) });
      const d = await res.json();
      if (d.ok) { flash("✅ " + p.business_name + " is now live!"); onRefresh(); }
      else flash("❌ " + (d.error || "Failed."));
    } catch(e) { flash("❌ " + e.message); }
  };

  const cancelSub = async (p) => {
    if (!p.stripe_subscription_id) { flash("❌ No Stripe subscription found."); return; }
    if (!window.confirm(`Cancel ${p.business_name}'s subscription?`)) return;
    flash("⏳ Cancelling…");
    try {
      const res = await fetch("/functions/cancelSubscription", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ stripe_subscription_id: p.stripe_subscription_id }) });
      const d = await res.json();
      if (d.success) { await Provider.update(p.id, { subscription_status:"cancelled" }); flash("✅ Subscription cancelled."); onRefresh(); }
      else flash("❌ " + (d.error || "Failed."));
    } catch(e) { flash("❌ " + e.message); }
  };

  return (
    <div>
      {msg && <div style={{ background: msg.startsWith("✅") ? "#e8f5e9" : msg.startsWith("⏳") ? "#fff8e1" : "#ffebee", border:"1px solid #ccc", borderRadius:8, padding:"10px 14px", marginBottom:10, fontSize:13, fontWeight:600 }}>{msg}</div>}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
        <div style={{ fontSize:18, fontWeight:700, color:BRAND.text }}>All Providers ({providers.length})</div>
        <button onClick={() => { setEditItem(null); setShowForm(true); }} style={addBtnStyle}>+ Add Provider</button>
      </div>
      {showForm && (
        <ProviderForm provider={editItem} categories={categories} services={services} areas={areas}
          onClose={() => { setShowForm(false); setEditItem(null); }} onSaved={() => { setShowForm(false); setEditItem(null); onRefresh(); }} />
      )}
      {providers.map(p => {
        const cat = categories.find(c => c.id === p.category_id);
        const sc = p.subscription_status === "active" ? BRAND.teal : p.subscription_status === "trial" ? BRAND.orange : p.subscription_status === "pending" ? "#c0392b" : "#999";
        return (
          <div key={p.id} style={{ background:"#fff", borderRadius:14, padding:"14px 18px", marginBottom:10, boxShadow:"0 2px 10px rgba(0,0,0,0.07)", display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
            <div style={{ flex:1, minWidth:200 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                <div style={{ fontSize:16, fontWeight:700, color:BRAND.text }}>{p.business_name}</div>
                {p.provider_id && <span style={{ background:"#f0f0f0", color:"#555", borderRadius:10, padding:"1px 7px", fontSize:11 }}>ID: {p.provider_id}</span>}
                <span style={{ background:`${sc}20`, color:sc, borderRadius:20, padding:"2px 8px", fontSize:11, fontWeight:700, textTransform:"uppercase" }}>{p.subscription_status || "pending"}</span>
                {p.is_visible === false && <span style={{ background:"#ff000015", color:"red", borderRadius:20, padding:"2px 8px", fontSize:11, fontWeight:700 }}>Hidden</span>}
              </div>
              {cat && <div style={{ fontSize:12, color:BRAND.teal, fontWeight:600 }}>{cat.icon} {cat.name}</div>}
              <div style={{ fontSize:13, color:BRAND.subtext }}>{p.phone}{p.email ? ` · ${p.email}` : ""}</div>
            </div>
            <div style={{ display:"flex", gap:5, flexWrap:"wrap", justifyContent:"flex-end" }}>
              {p.subscription_status === "pending" && <button onClick={() => approveProv(p)} style={{ background:"#2e7d32", color:"#fff", border:"none", borderRadius:7, padding:"7px 12px", fontSize:12, fontWeight:700, cursor:"pointer" }}>✅ Approve</button>}
              {!["active","pending"].includes(p.subscription_status) && <button onClick={() => sendPayLink(p)} style={{ background:BRAND.teal, color:"#fff", border:"none", borderRadius:7, padding:"7px 12px", fontSize:12, fontWeight:700, cursor:"pointer" }}>💳 Pay Link</button>}
              {p.subscription_status === "active" && <button onClick={() => cancelSub(p)} style={{ background:"#fff3e0", color:"#e65100", border:"1px solid #e65100", borderRadius:7, padding:"7px 12px", fontSize:12, fontWeight:700, cursor:"pointer" }}>✕ Cancel</button>}
              <button onClick={() => { setEditItem(p); setShowForm(true); }} style={editBtnStyle}>Edit</button>
              <button onClick={() => del(p.id)} style={deleteBtnStyle}>Delete</button>
            </div>
          </div>
        );
      })}
      {providers.length === 0 && <div style={{ textAlign:"center", padding:50, color:BRAND.subtext }}>No providers yet. Click "+ Add Provider" to get started.</div>}
    </div>
  );
}

// ─── Simple CRUD Tab ──────────────────────────────────────────────────────────
function SimpleTab({ items, entity, fields, onRefresh }) {
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const open = (item) => { setForm(item ? {...item} : {}); setEditItem(item || null); setShowForm(true); };
  const close = () => { setShowForm(false); setEditItem(null); };

  const save = async () => {
    setSaving(true);
    try {
      if (editItem && editItem.id) { await entity.update(editItem.id, form); }
      else { await entity.create(form); }
      onRefresh(); close();
    } catch(e) { alert("Save error: " + e.message); }
    setSaving(false);
  };

  const del = async (id) => { if (!window.confirm("Delete?")) return; await entity.delete(id); onRefresh(); };

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
        <div style={{ fontSize:18, fontWeight:700, color:BRAND.text }}>{items.length} items</div>
        <button onClick={() => open(null)} style={addBtnStyle}>+ Add New</button>
      </div>
      {showForm && (
        <div style={{ background:"#fff", borderRadius:14, padding:"20px", marginBottom:16, boxShadow:"0 4px 14px rgba(0,0,0,0.09)", border:`2px solid ${BRAND.teal}30` }}>
          <div style={{ fontSize:16, fontWeight:700, marginBottom:14 }}>{editItem ? "Edit" : "Add New"}</div>
          {fields.map(f => (
            <div key={f.key} style={{ marginBottom:11 }}>
              <label style={labelStyle}>{f.label}</label>
              {f.type === "checkbox"
                ? <input type="checkbox" checked={form[f.key] !== false} onChange={e => setForm({...form, [f.key]: e.target.checked})} style={{ width:18, height:18 }} />
                : f.type === "select"
                  ? <select value={form[f.key] || ""} onChange={e => setForm({...form, [f.key]: e.target.value})} style={inputStyle}>
                      <option value="">— Select —</option>
                      {f.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  : <input type={f.type || "text"} value={form[f.key] || ""} onChange={e => setForm({...form, [f.key]: e.target.value})} style={inputStyle} />
              }
            </div>
          ))}
          <div style={{ display:"flex", gap:8, marginTop:8 }}>
            <button onClick={save} disabled={saving} style={{ ...addBtnStyle, opacity: saving ? 0.7 : 1 }}>{saving ? "Saving…" : "Save"}</button>
            <button onClick={close} style={{ background:"#f0f0f0", border:"none", borderRadius:9, padding:"10px 18px", fontSize:14, cursor:"pointer" }}>Cancel</button>
          </div>
        </div>
      )}
      {items.map(item => (
        <div key={item.id} style={{ background:"#fff", borderRadius:12, padding:"13px 16px", marginBottom:8, boxShadow:"0 2px 8px rgba(0,0,0,0.06)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <div style={{ fontSize:15, fontWeight:600, color:BRAND.text }}>{item.icon ? item.icon + " " : ""}{item.name}</div>
            {item.description && <div style={{ fontSize:12, color:BRAND.subtext }}>{item.description}</div>}
            {item.is_active === false && <span style={{ color:"#999", fontSize:11 }}>Inactive</span>}
          </div>
          <div style={{ display:"flex", gap:6 }}>
            <button onClick={() => open(item)} style={editBtnStyle}>Edit</button>
            <button onClick={() => del(item.id)} style={deleteBtnStyle}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Admin ───────────────────────────────────────────────────────────────
export default function Admin() {
  const [pin, setPin] = useState(() => { try { return sessionStorage.getItem("vhub_admin_pin") || ""; } catch(e) { return ""; } });
  const unlocked = VALID_PINS.includes(pin);

  const [activeTab, setActiveTab] = useState("Providers");
  const [providers, setProviders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [areas, setAreas] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    const [p, c, s, a, r] = await Promise.allSettled([
      Provider.list(), Category.list(), Service.list(), ServiceArea.list(), ProviderReview.list()
    ]);
    setProviders(p.status === "fulfilled" ? (p.value || []) : []);
    setCategories(c.status === "fulfilled" ? (c.value || []) : []);
    setServices(s.status === "fulfilled" ? (s.value || []) : []);
    setAreas(a.status === "fulfilled" ? (a.value || []) : []);
    setReviews(r.status === "fulfilled" ? (r.value || []) : []);
    setLoading(false);
  };

  useEffect(() => { if (unlocked) loadAll(); }, [unlocked]);

  if (!unlocked) return <PinGate onUnlock={setPin} />;

  if (loading) return (
    <div style={{ minHeight:"100vh", background:"#1A0A00", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:14 }}>
      <img src="https://media.base44.com/images/public/69d062aca815ce8e697894b1/a9af95bc3_V-Hublogo.png" style={{ width:60, borderRadius:10 }} alt="" />
      <div style={{ color:"#F5E8CC", fontSize:15, fontFamily:"Georgia" }}>Loading…</div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:BRAND.lightBg, fontFamily:"'Segoe UI', sans-serif" }}>
      {/* Header */}
      <div style={{ background:`linear-gradient(135deg, ${BRAND.orange}, ${BRAND.teal})`, padding:"18px 22px", display:"flex", alignItems:"center", justifyContent:"space-between", boxShadow:"0 3px 10px rgba(0,0,0,0.12)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <img src="https://media.base44.com/images/public/69d062aca815ce8e697894b1/a9af95bc3_V-Hublogo.png" style={{ height:44, borderRadius:8 }} alt="V-Hub" />
          <div>
            <div style={{ color:"#fff", fontSize:20, fontWeight:800 }}>V-HUB Admin</div>
            <div style={{ color:"rgba(255,255,255,0.8)", fontSize:12 }}>Manage Providers & Listings</div>
          </div>
        </div>
        <a href="/" style={{ color:"#fff", textDecoration:"none", background:"rgba(255,255,255,0.2)", borderRadius:8, padding:"7px 14px", fontSize:13, fontWeight:600 }}>View Site →</a>
      </div>

      {/* Stats */}
      <div style={{ display:"flex", gap:12, padding:"16px 20px", flexWrap:"wrap" }}>
        {[
          { label:"Providers", count:providers.length, icon:"🏢", color:BRAND.orange },
          { label:"Active", count:providers.filter(p => p.subscription_status === "active").length, icon:"✅", color:BRAND.teal },
          { label:"Pending", count:providers.filter(p => p.subscription_status === "pending").length, icon:"⏳", color:BRAND.blue },
          { label:"Reviews", count:reviews.filter(r => !r.is_approved).length, icon:"⭐", color:"#7C3AED" },
        ].map(s => (
          <div key={s.label} style={{ background:"#fff", borderRadius:12, padding:"14px 18px", boxShadow:"0 2px 10px rgba(0,0,0,0.07)", minWidth:100, flex:1 }}>
            <div style={{ fontSize:22 }}>{s.icon}</div>
            <div style={{ fontSize:26, fontWeight:800, color:s.color }}>{s.count}</div>
            <div style={{ fontSize:13, color:BRAND.subtext }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", gap:6, padding:"0 20px 14px", overflowX:"auto" }}>
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{ background: activeTab === tab ? `linear-gradient(135deg, ${BRAND.orange}, ${BRAND.teal})` : "#fff", color: activeTab === tab ? "#fff" : BRAND.text, border:"none", borderRadius:10, padding:"10px 18px", fontSize:14, fontWeight:600, cursor:"pointer", whiteSpace:"nowrap", boxShadow:"0 2px 6px rgba(0,0,0,0.07)" }}>
            {tab}
          </button>
        ))}
        <button onClick={loadAll} style={{ background:"#fff", color:BRAND.subtext, border:"none", borderRadius:10, padding:"10px 14px", fontSize:14, cursor:"pointer", boxShadow:"0 2px 6px rgba(0,0,0,0.07)" }}>🔄</button>
      </div>

      {/* Content */}
      <div style={{ padding:"0 20px 40px" }}>
        {activeTab === "Providers" && (
          <ProvidersTab providers={providers} categories={categories} services={services} areas={areas} onRefresh={loadAll} />
        )}
        {activeTab === "Reviews" && (
          <ReviewsTab reviews={reviews} providers={providers} onRefresh={loadAll} />
        )}
        {activeTab === "Categories" && (
          <SimpleTab items={categories} entity={Category} onRefresh={loadAll}
            fields={[
              { key:"name", label:"Category Name", type:"text" },
              { key:"icon", label:"Icon (emoji)", type:"text" },
              { key:"description", label:"Description", type:"text" },
              { key:"is_active", label:"Active", type:"checkbox" },
            ]} />
        )}
        {activeTab === "Services" && (
          <SimpleTab items={services} entity={Service} onRefresh={loadAll}
            fields={[
              { key:"name", label:"Service Name", type:"text" },
              { key:"category_id", label:"Category", type:"select", options: categories.map(c => ({ value:c.id, label:`${c.icon||""} ${c.name}` })) },
              { key:"is_active", label:"Active", type:"checkbox" },
            ]} />
        )}
        {activeTab === "Service Areas" && (
          <SimpleTab items={areas} entity={ServiceArea} onRefresh={loadAll}
            fields={[
              { key:"name", label:"Village Name", type:"text" },
              { key:"description", label:"Section", type:"text" },
              { key:"is_active", label:"Active", type:"checkbox" },
            ]} />
        )}
      </div>
    </div>
  );
}
