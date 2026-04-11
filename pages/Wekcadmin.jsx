import React, { useState, useEffect } from "react";
import { Provider, ProviderReview, LeadInquiry, ServiceSearchStat, Category, Service, ServiceArea } from "@/api/entities";

const PINS = ["6185", "1357"];
const LOGO = "https://media.base44.com/images/public/69d062aca815ce8e697894b1/a9af95bc3_V-Hublogo.png";

const T = {
  parchment: "#F5EDD6", parchmentDark: "#E8D9B0",
  brown: "#5C3317", brownLight: "#8B5E3C", brownDark: "#3B1F0A",
  gold: "#C9973A", red: "#8B1A1A", green: "#2E6B2E", teal: "#1A6B5C",
  cream: "#FFFDF4", border: "#C4A882", shadow: "rgba(92,51,23,0.15)",
  font: "'Georgia','Times New Roman',serif", sans: "'Arial',sans-serif",
};

const S = {
  page: { minHeight: "100vh", background: T.parchment, fontFamily: T.font },
  hdr: { background: `linear-gradient(135deg,${T.brownDark},${T.brown})`, padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `3px solid ${T.gold}` },
  card: { background: T.cream, borderRadius: 8, padding: "14px 16px", boxShadow: `0 2px 8px ${T.shadow}`, border: `1px solid ${T.border}` },
  tabBtn: (a) => ({ padding: "10px 14px", border: "none", cursor: "pointer", whiteSpace: "nowrap", fontFamily: T.font, fontSize: 13, fontWeight: a ? 700 : 400, background: a ? T.cream : "transparent", color: a ? T.brownDark : T.brownLight, borderBottom: a ? `3px solid ${T.brown}` : "3px solid transparent" }),
  filterBtn: (a) => ({ padding: "5px 12px", borderRadius: 6, border: `1px solid ${T.border}`, fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: T.sans, background: a ? T.brown : T.cream, color: a ? "#fff" : T.brown }),
  btn: (c = T.brown) => ({ fontSize: 12, padding: "5px 12px", borderRadius: 6, border: "none", background: c, color: "#fff", cursor: "pointer", fontWeight: 700, fontFamily: T.sans }),
  badge: (c, bg) => ({ fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 20, background: bg, color: c }),
  secTitle: { fontSize: 13, fontWeight: 700, color: T.brownLight, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10, fontFamily: T.sans, borderBottom: `1px solid ${T.border}`, paddingBottom: 6 },
  inp: { width: "100%", boxSizing: "border-box", padding: "8px 10px", borderRadius: 6, border: `1px solid ${T.border}`, fontFamily: T.sans, fontSize: 13, background: T.cream, color: T.brownDark, outline: "none" },
};

function fmt(d) { if (!d) return "—"; return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); }
function daysLeft(d) { if (!d) return null; return Math.ceil((new Date(d) - new Date()) / 86400000); }

// ── PIN GATE ──────────────────────────────────────────────────────────────────
function PinGate({ onUnlock }) {
  const [pin, setPin] = useState(""); const [err, setErr] = useState(false);
  const go = () => { if (PINS.includes(pin)) onUnlock(); else { setErr(true); setPin(""); setTimeout(() => setErr(false), 2500); } };
  return (
    <div style={{ minHeight: "100vh", background: T.parchment, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: T.cream, borderRadius: 12, padding: "40px 32px", boxShadow: `0 8px 32px ${T.shadow}`, textAlign: "center", width: 300, border: `2px solid ${T.border}` }}>
        <img src={LOGO} style={{ width: 72, borderRadius: 12, marginBottom: 16 }} alt="" />
        <div style={{ fontSize: 22, fontWeight: 800, color: T.brownDark, marginBottom: 4, fontFamily: T.font }}>V-HUB Admin</div>
        <div style={{ fontSize: 13, color: T.brownLight, marginBottom: 22, fontStyle: "italic", fontFamily: T.sans }}>Enter your 4-digit PIN</div>
        <input autoFocus type="password" inputMode="numeric" maxLength={4} value={pin}
          onChange={e => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
          onKeyDown={e => e.key === "Enter" && go()} placeholder="••••"
          style={{ ...S.inp, fontSize: 28, textAlign: "center", letterSpacing: 10, marginBottom: 10, border: err ? `2px solid ${T.red}` : `2px solid ${T.border}` }} />
        {err && <div style={{ color: T.red, fontSize: 13, marginBottom: 8 }}>Incorrect PIN — try again</div>}
        <button onClick={go} style={{ ...S.btn(T.brown), width: "100%", padding: 13, fontSize: 16 }}>Unlock Dashboard</button>
        <a href="/" style={{ display: "block", marginTop: 14, fontSize: 12, color: T.brownLight, textDecoration: "none" }}>← Back to V-HUB</a>
      </div>
    </div>
  );
}

// ── OVERVIEW ──────────────────────────────────────────────────────────────────
function Overview({ providers, reviews, leads }) {
  const active = providers.filter(p => p.is_active).length;
  const trial = providers.filter(p => p.subscription_status === "trial").length;
  const paid = providers.filter(p => ["active", "paid"].includes(p.subscription_status)).length;
  const expiring = providers.filter(p => { const d = daysLeft(p.trial_end_date); return d !== null && d >= 0 && d <= 7; });
  const expired = providers.filter(p => { const d = daysLeft(p.trial_end_date); return d !== null && d < 0 && p.is_active; }).length;
  const totalViews = providers.reduce((s, p) => s + (p.profile_views || 0), 0);
  const totalSearch = providers.reduce((s, p) => s + (p.search_appearances || 0), 0);
  const pending = reviews.filter(r => !r.is_approved).length;

  const areaCount = {};
  providers.forEach(p => (Array.isArray(p.service_areas) ? p.service_areas : []).forEach(a => { if (!a.includes("69d")) areaCount[a] = (areaCount[a] || 0) + 1; }));
  const topAreas = Object.entries(areaCount).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const cards = [
    { label: "Total Providers", val: providers.length, color: T.brown, icon: "🏪" },
    { label: "Active", val: active, color: T.green, icon: "✅" },
    { label: "On Trial", val: trial, color: T.gold, icon: "⏳" },
    { label: "Paid Subscribers", val: paid, color: T.teal, icon: "💳" },
    { label: "Expiring ≤7 Days", val: expiring.length, color: "#c0392b", icon: "🔴" },
    { label: "Trial Expired", val: expired, color: T.red, icon: "⚠️" },
    { label: "Profile Views", val: totalViews, color: T.brownLight, icon: "👁️" },
    { label: "Search Appearances", val: totalSearch, color: T.teal, icon: "🔍" },
    { label: "Reviews Pending", val: pending, color: T.red, icon: "⭐" },
    { label: "Lead Inquiries", val: leads.length, color: T.brown, icon: "📬" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {cards.map(c => (
          <div key={c.label} style={{ ...S.card, borderLeft: `4px solid ${c.color}` }}>
            <div style={{ fontSize: 11, color: T.brownLight, fontFamily: T.sans }}>{c.icon} {c.label}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: c.color, fontFamily: T.sans }}>{c.val}</div>
          </div>
        ))}
      </div>

      {expiring.length > 0 && (
        <div style={{ ...S.card, background: "#fff8e1", borderLeft: `4px solid ${T.gold}` }}>
          <div style={S.secTitle}>⚠️ Trials Expiring Soon</div>
          {expiring.map(p => { const d = daysLeft(p.trial_end_date); return (
            <div key={p.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "4px 0", borderBottom: `1px solid ${T.parchmentDark}` }}>
              <span style={{ color: T.brownDark, fontWeight: 600 }}>{p.business_name}</span>
              <span style={{ color: d <= 3 ? T.red : T.gold, fontWeight: 700 }}>{d === 0 ? "Today!" : `${d}d left`}</span>
            </div>
          ); })}
        </div>
      )}

      <div style={S.card}>
        <div style={S.secTitle}>👁️ Most Viewed Providers</div>
        {[...providers].sort((a, b) => (b.profile_views || 0) - (a.profile_views || 0)).slice(0, 5).map((p, i) => (
          <div key={p.id} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: `1px solid ${T.parchmentDark}` }}>
            <span style={{ fontSize: 13, color: T.brownDark }}>#{i + 1} {p.business_name || "(unnamed)"}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: T.teal, fontFamily: T.sans }}>{p.profile_views || 0} views</span>
          </div>
        ))}
      </div>

      {topAreas.length > 0 && (
        <div style={S.card}>
          <div style={S.secTitle}>📍 Top Service Areas</div>
          {topAreas.map(([area, count]) => (
            <div key={area} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: `1px solid ${T.parchmentDark}` }}>
              <span style={{ fontSize: 13, color: T.brownDark }}>{area}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: T.brown, fontFamily: T.sans }}>{count}</span>
            </div>
          ))}
        </div>
      )}

      <div style={S.card}>
        <div style={S.secTitle}>🆕 Recent Signups</div>
        {[...providers].sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).slice(0, 6).map(p => (
          <div key={p.id} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: `1px solid ${T.parchmentDark}` }}>
            <div>
              <span style={{ fontSize: 13, color: T.brownDark, fontWeight: 600 }}>{p.business_name || "(unnamed)"}</span>
              <span style={{ fontSize: 11, color: T.brownLight, marginLeft: 6, fontFamily: T.sans }}>{p.subscription_status}</span>
            </div>
            <span style={{ fontSize: 11, color: T.brownLight, fontFamily: T.sans }}>{fmt(p.created_date)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── PROVIDERS TAB ─────────────────────────────────────────────────────────────
function ProvidersTab({ providers, setProviders, catMap, svcMap, areaMap }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState(null);

  // Resolve a value that might be an ID or text
  const resolveName = (val, map) => map[val] || val;

  const filtered = providers.filter(p => {
    const q = search.toLowerCase();
    const m = !q || [p.business_name, p.email, p.owner_name, p.phone, p.vh_number].some(v => v?.toLowerCase().includes(q));
    if (!m) return false;
    if (filter === "active") return p.is_active;
    if (filter === "hidden") return !p.is_active;
    if (filter === "trial") return p.subscription_status === "trial";
    if (filter === "paid") return ["active", "paid"].includes(p.subscription_status);
    if (filter === "expiring") { const d = daysLeft(p.trial_end_date); return d !== null && d >= 0 && d <= 7; }
    return true;
  });

  const [approving, setApproving] = useState(null);

  const approveAndNotify = async (p) => {
    if (!window.confirm(`Approve ${p.business_name} and send them a confirmation email?`)) return;
    setApproving(p.id);
    try {
      const res = await fetch("https://api.base44.com/api/apps/69d062aca815ce8e697894b1/functions/approveProvider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider_record_id: p.id,
          business_name: p.business_name,
          owner_name: p.owner_name,
          email: p.email,
          phone: p.phone,
          services: p.services || [],
          service_areas: p.service_areas || [],
          vh_number: p.vh_number,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setProviders(prev => prev.map(x => x.id === p.id ? {
          ...x, is_active: true, is_visible: true,
          subscription_status: "trial",
          trial_start_date: data.trial_start,
          trial_end_date: data.trial_end,
        } : x));
        alert(`✅ ${p.business_name} has been approved and notified by email!`);
      } else {
        alert("❌ Error: " + (data.error || "Unknown error"));
      }
    } catch (e) {
      alert("❌ Network error: " + e.message);
    }
    setApproving(null);
  };

  const toggleActive = async (p) => { await Provider.update(p.id, { is_active: !p.is_active }); setProviders(prev => prev.map(x => x.id === p.id ? { ...x, is_active: !p.is_active } : x)); };
  const toggleVisible = async (p) => { await Provider.update(p.id, { is_visible: !p.is_visible }); setProviders(prev => prev.map(x => x.id === p.id ? { ...x, is_visible: !p.is_visible } : x)); };
  const del = async (p) => { if (!window.confirm(`Delete ${p.business_name}?`)) return; await Provider.delete(p.id); setProviders(prev => prev.filter(x => x.id !== p.id)); };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <input placeholder="🔍 Search name, email, phone, VH#..." value={search} onChange={e => setSearch(e.target.value)} style={S.inp} />
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {["all", "active", "hidden", "trial", "paid", "expiring"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={S.filterBtn(filter === f)}>
            {f === "all" ? `All (${providers.length})` : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {filtered.length === 0 && <div style={{ textAlign: "center", color: T.brownLight, padding: 24, fontStyle: "italic" }}>No providers match.</div>}

      {filtered.map(p => {
        const dl = daysLeft(p.trial_end_date);
        const isOpen = expanded === p.id;
        const svcList = Array.isArray(p.services) ? p.services : [];
        const areaList = Array.isArray(p.service_areas) ? p.service_areas : [];
        const catName = p.category_id ? (catMap[p.category_id] || p.category_id) : null;
        const svcNames = svcList.map(s => resolveName(s, svcMap)).filter(Boolean);
        const areaNames = areaList.map(a => resolveName(a, areaMap)).filter(Boolean);

        return (
          <div key={p.id} style={S.card}>
            {/* HEADER ROW — always visible */}
            <div onClick={() => setExpanded(isOpen ? null : p.id)} style={{ cursor: "pointer" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: 16, color: T.brownDark }}>
                    {p.business_name || <span style={{ color: "#ccc", fontStyle: "italic" }}>Unnamed Provider</span>}
                  </div>
                  <div style={{ fontSize: 12, color: T.brownLight, fontFamily: T.sans, marginTop: 2 }}>
                    {p.owner_name && <span>{p.owner_name} · </span>}
                    {p.email}
                  </div>
                  <div style={{ fontSize: 11, color: "#999", fontFamily: T.sans, marginTop: 2 }}>
                    {p.phone && <span>{p.phone} · </span>}
                    <strong style={{ color: T.brown }}>{p.vh_number || "No VH#"}</strong>
                    {" · "}Joined {fmt(p.created_date)}
                  </div>
                </div>
                <div style={{ fontSize: 18, color: T.brownLight, marginLeft: 8 }}>{isOpen ? "▲" : "▼"}</div>
              </div>

              {/* Category + quick service preview */}
              {catName && (
                <div style={{ marginTop: 5, fontSize: 12, fontFamily: T.sans }}>
                  <span style={{ ...S.badge(T.brownDark, T.parchmentDark), marginRight: 4 }}>📂 {catName}</span>
                </div>
              )}
              {svcNames.length > 0 && (
                <div style={{ marginTop: 4, fontSize: 11, color: T.teal, fontFamily: T.sans }}>
                  🛠 {svcNames.slice(0, 3).join(" · ")}{svcNames.length > 3 ? ` +${svcNames.length - 3} more` : ""}
                </div>
              )}
              {areaNames.length > 0 && (
                <div style={{ fontSize: 11, color: T.brownLight, fontFamily: T.sans }}>
                  📍 {areaNames.slice(0, 3).join(", ")}{areaNames.length > 3 ? ` +${areaNames.length - 3}` : ""}
                </div>
              )}
            </div>

            {/* STATUS BADGES */}
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: 8 }}>
              <span style={S.badge(p.is_active ? T.green : T.red, p.is_active ? "#e8f5e9" : "#fce8e8")}>{p.is_active ? "Active" : "Inactive"}</span>
              <span style={S.badge(p.is_visible !== false ? T.teal : "#888", p.is_visible !== false ? "#e0f4f1" : "#f0f0f0")}>{p.is_visible !== false ? "Visible" : "Hidden"}</span>
              {p.subscription_status && <span style={S.badge(T.brown, T.parchmentDark)}>{p.subscription_status}</span>}
              {p.subscription_tier && <span style={S.badge(T.teal, "#e0f4f1")}>{p.subscription_tier}</span>}
              {dl !== null && dl >= 0 && <span style={S.badge(dl <= 3 ? T.red : T.gold, dl <= 3 ? "#fce8e8" : "#fff8e1")}>{dl === 0 ? "Expires today!" : `${dl}d left`}</span>}
              {dl !== null && dl < 0 && <span style={S.badge(T.red, "#fce8e8")}>Trial expired</span>}
            </div>

            {/* EXPANDED DETAIL */}
            {isOpen && (
              <div style={{ marginTop: 14, borderTop: `1px solid ${T.border}`, paddingTop: 14 }}>

                {/* Stats grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                  {[
                    ["👁️ Profile Views", p.profile_views ?? 0],
                    ["🔍 Search Appearances", p.search_appearances ?? 0],
                    ["📅 Trial Start", fmt(p.trial_start_date)],
                    ["📅 Trial End", fmt(p.trial_end_date)],
                    ["🚪 Onboarding", p.onboarding_type || "—"],
                    ["🏆 Years in Business", p.years_in_business || "—"],
                    ["📄 License #", p.license_number || "—"],
                    ["⭐ Rating", p.rating ? `${p.rating}★` : "—"],
                  ].map(([label, val]) => (
                    <div key={label} style={{ background: T.parchment, borderRadius: 6, padding: "7px 10px" }}>
                      <div style={{ fontSize: 10, color: T.brownLight, fontFamily: T.sans }}>{label}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: T.brownDark, fontFamily: T.sans }}>{String(val)}</div>
                    </div>
                  ))}
                </div>

                {/* Category */}
                {catName && (
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 11, color: T.brownLight, fontFamily: T.sans, fontWeight: 700, marginBottom: 3 }}>📂 MACRO CATEGORY</div>
                    <span style={{ ...S.badge(T.brownDark, T.parchmentDark), fontSize: 13 }}>{catName}</span>
                  </div>
                )}

                {/* Services (micro) */}
                {svcNames.length > 0 && (
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 11, color: T.brownLight, fontFamily: T.sans, fontWeight: 700, marginBottom: 4 }}>🛠 SERVICES OFFERED ({svcNames.length})</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {svcNames.map(s => <span key={s} style={{ fontSize: 12, background: T.parchmentDark, color: T.brownDark, borderRadius: 4, padding: "3px 9px", fontFamily: T.sans }}>{s}</span>)}
                    </div>
                  </div>
                )}

                {/* Villages */}
                {areaNames.length > 0 && (
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 11, color: T.brownLight, fontFamily: T.sans, fontWeight: 700, marginBottom: 4 }}>📍 SERVICE AREAS ({areaNames.length})</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {areaNames.map(a => <span key={a} style={{ fontSize: 12, background: "#e0f4f1", color: T.teal, borderRadius: 4, padding: "3px 9px", fontFamily: T.sans }}>{a}</span>)}
                    </div>
                  </div>
                )}

                {/* Description */}
                {p.description && <div style={{ fontSize: 13, color: T.brownLight, fontStyle: "italic", marginBottom: 8, borderLeft: `3px solid ${T.border}`, paddingLeft: 8 }}>{p.description}</div>}

                {/* Links */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 8 }}>
                  {p.website && <a href={p.website} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: T.teal }}>🌐 Website</a>}
                  {p.google_review_url && <a href={p.google_review_url} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: T.teal }}>⭐ Google Reviews</a>}
                  {p.address && <span style={{ fontSize: 12, color: T.brownLight }}>📍 {p.address}</span>}
                </div>

                {/* Notes */}
                {p.notes && <div style={{ fontSize: 12, color: T.brownLight, background: "#fff8e1", borderRadius: 6, padding: "8px 10px", marginBottom: 10 }}>📝 {p.notes}</div>}

                {/* Stripe info */}
                {(p.stripe_customer_id || p.stripe_subscription_id) && (
                  <div style={{ fontSize: 11, color: "#aaa", fontFamily: T.sans, marginBottom: 8 }}>
                    {p.stripe_customer_id && <div>Stripe Customer: {p.stripe_customer_id}</div>}
                    {p.stripe_subscription_id && <div>Stripe Sub: {p.stripe_subscription_id}</div>}
                  </div>
                )}

                {/* Action buttons */}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {(!p.is_active || p.subscription_status === "pending") && (
                    <button
                      onClick={() => approveAndNotify(p)}
                      disabled={approving === p.id}
                      style={S.btn("#2e7d32")}
                    >
                      {approving === p.id ? "Approving..." : "✅ Approve & Notify"}
                    </button>
                  )}
                  <button onClick={() => toggleActive(p)} style={S.btn(p.is_active ? "#8B4513" : "#555")}>{p.is_active ? "Deactivate" : "Activate Only"}</button>
                  <button onClick={() => toggleVisible(p)} style={S.btn(T.teal)}>{p.is_visible === false ? "Make Visible" : "Hide Listing"}</button>
                  <button onClick={() => del(p)} style={S.btn(T.red)}>Delete</button>
                  {p.email && <a href={`mailto:${p.email}`} style={{ ...S.btn(T.brownLight), textDecoration: "none" }}>✉️ Email</a>}
                  {p.phone && <a href={`tel:${p.phone}`} style={{ ...S.btn("#777"), textDecoration: "none" }}>📞 Call</a>}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── REVIEWS TAB ───────────────────────────────────────────────────────────────
function ReviewsTab({ reviews, setReviews, providers }) {
  const [filter, setFilter] = useState("pending");
  const provMap = {}; providers.forEach(p => { provMap[p.id] = p.business_name; });
  const shown = reviews.filter(r => filter === "all" ? true : filter === "pending" ? !r.is_approved : r.is_approved);
  const approve = async (r) => { await ProviderReview.update(r.id, { is_approved: true }); setReviews(p => p.map(x => x.id === r.id ? { ...x, is_approved: true } : x)); };
  const remove = async (r) => { if (!window.confirm("Delete?")) return; await ProviderReview.delete(r.id); setReviews(p => p.filter(x => x.id !== r.id)); };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", gap: 8 }}>
        {["pending", "approved", "all"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={S.filterBtn(filter === f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)} ({f === "pending" ? reviews.filter(r => !r.is_approved).length : f === "approved" ? reviews.filter(r => r.is_approved).length : reviews.length})
          </button>
        ))}
      </div>
      {shown.length === 0 && <div style={{ textAlign: "center", color: T.brownLight, padding: 24, fontStyle: "italic" }}>No reviews here.</div>}
      {shown.map(r => (
        <div key={r.id} style={S.card}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <div><span style={{ fontWeight: 700, color: T.brownDark }}>{r.customer_name}</span>{r.customer_village && <span style={{ fontSize: 12, color: T.brownLight, marginLeft: 6 }}>· {r.customer_village}</span>}</div>
            <span style={{ color: "#DAA520" }}>{"★".repeat(r.rating || 0)}{"☆".repeat(5 - (r.rating || 0))}</span>
          </div>
          {provMap[r.provider_id] && <div style={{ fontSize: 11, color: T.brownLight, fontFamily: T.sans, marginBottom: 4 }}>For: {provMap[r.provider_id]}</div>}
          {r.service_used && <div style={{ fontSize: 11, color: T.brownLight, fontFamily: T.sans, marginBottom: 4 }}>Service: {r.service_used}</div>}
          <div style={{ fontSize: 13, color: T.brownDark, fontStyle: "italic", marginBottom: 6 }}>"{r.review_text}"</div>
          <div style={{ fontSize: 11, color: "#bbb", fontFamily: T.sans, marginBottom: 8 }}>{fmt(r.created_date)}</div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {!r.is_approved && <button onClick={() => approve(r)} style={S.btn(T.green)}>✓ Approve</button>}
            <button onClick={() => remove(r)} style={S.btn(T.red)}>✕ Delete</button>
            <span style={S.badge(r.is_approved ? T.green : T.gold, r.is_approved ? "#e8f5e9" : "#fff8e1")}>{r.is_approved ? "Approved" : "Pending"}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── LEADS TAB ─────────────────────────────────────────────────────────────────
function LeadsTab({ leads, providers }) {
  const provMap = {}; providers.forEach(p => { provMap[p.id] = p.business_name; });
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {leads.length === 0 && <div style={{ ...S.card, textAlign: "center", color: T.brownLight, padding: 30, fontStyle: "italic" }}>No lead inquiries yet.</div>}
      {[...leads].sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).map(l => (
        <div key={l.id} style={S.card}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontWeight: 700, color: T.brownDark }}>{l.customer_name}</span>
            <span style={S.badge(T.brown, T.parchmentDark)}>{l.status || "new"}</span>
          </div>
          <div style={{ fontSize: 12, color: T.brownLight, fontFamily: T.sans, marginBottom: 4 }}>{l.customer_email} · {l.customer_phone}</div>
          {provMap[l.provider_id] && <div style={{ fontSize: 12, color: T.teal, marginBottom: 4 }}>Provider: {provMap[l.provider_id]}</div>}
          {l.message && <div style={{ fontSize: 13, color: T.brownDark, fontStyle: "italic", marginBottom: 4 }}>"{l.message}"</div>}
          <div style={{ fontSize: 11, color: "#bbb", fontFamily: T.sans }}>{fmt(l.created_date)}</div>
        </div>
      ))}
    </div>
  );
}

// ── ANALYTICS TAB ─────────────────────────────────────────────────────────────
function AnalyticsTab({ providers, reviews, leads, stats, catMap, svcMap }) {
  const paid = providers.filter(p => ["active", "paid"].includes(p.subscription_status)).length;
  const trial = providers.filter(p => p.subscription_status === "trial").length;
  const byMonth = {};
  providers.forEach(p => { if (!p.created_date) return; const d = new Date(p.created_date); const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; byMonth[k] = (byMonth[k] || 0) + 1; });
  const months = Object.entries(byMonth).sort((a, b) => a[0].localeCompare(b[0]));
  const maxM = Math.max(...months.map(m => m[1]), 1);
  const subMap2 = {}; providers.forEach(p => { const s = p.subscription_status || "unknown"; subMap2[s] = (subMap2[s] || 0) + 1; });
  const svcCount = {}; providers.forEach(p => (Array.isArray(p.services) ? p.services : []).forEach(s => { const n = svcMap[s] || s; svcCount[n] = (svcCount[n] || 0) + 1; }));
  const topSvcs = Object.entries(svcCount).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const maxS = Math.max(...topSvcs.map(s => s[1]), 1);
  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1) : "—";
  const topSearches = [...stats].sort((a, b) => (b.search_count || 0) - (a.search_count || 0)).slice(0, 10);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={S.card}>
        <div style={S.secTitle}>💰 Revenue Snapshot</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {[["Est. MRR", `$${paid * 29}`, T.green], ["Paid", paid, T.teal], ["Trial", trial, T.gold]].map(([l, v, c]) => (
            <div key={l} style={{ textAlign: "center", background: T.parchment, borderRadius: 6, padding: "10px 6px" }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: c, fontFamily: T.sans }}>{v}</div>
              <div style={{ fontSize: 10, color: T.brownLight, fontFamily: T.sans }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={S.card}>
        <div style={S.secTitle}>📈 Provider Signups by Month</div>
        {months.length === 0 ? <div style={{ color: "#aaa", fontSize: 13 }}>No data yet</div> : months.map(([mo, cnt]) => (
          <div key={mo} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
            <div style={{ fontSize: 11, color: T.brownLight, fontFamily: T.sans, width: 58, flexShrink: 0 }}>{mo}</div>
            <div style={{ flex: 1, background: T.parchmentDark, borderRadius: 4, height: 18 }}>
              <div style={{ width: `${(cnt / maxM) * 100}%`, background: T.brown, borderRadius: 4, height: "100%", minWidth: 24, display: "flex", alignItems: "center", paddingLeft: 6 }}>
                <span style={{ fontSize: 10, color: "#fff" }}>{cnt}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={S.card}>
        <div style={S.secTitle}>📊 Subscription Breakdown</div>
        {Object.entries(subMap2).map(([s, c]) => (
          <div key={s} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: `1px solid ${T.parchmentDark}` }}>
            <span style={{ fontSize: 13, color: T.brownDark, textTransform: "capitalize" }}>{s}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: T.brown, fontFamily: T.sans }}>{c}</span>
          </div>
        ))}
      </div>
      <div style={S.card}>
        <div style={S.secTitle}>🛠 Top Services Offered</div>
        {topSvcs.length === 0 ? <div style={{ color: "#aaa", fontSize: 13 }}>No data yet</div> : topSvcs.map(([svc, cnt]) => (
          <div key={svc} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
            <div style={{ fontSize: 11, color: T.brownLight, fontFamily: T.sans, width: 130, flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{svc}</div>
            <div style={{ flex: 1, background: T.parchmentDark, borderRadius: 4, height: 16 }}>
              <div style={{ width: `${(cnt / maxS) * 100}%`, background: T.teal, borderRadius: 4, height: "100%", minWidth: 16, display: "flex", alignItems: "center", paddingLeft: 5 }}>
                <span style={{ fontSize: 10, color: "#fff" }}>{cnt}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {topSearches.length > 0 && (
        <div style={S.card}>
          <div style={S.secTitle}>🔍 Top Search Terms</div>
          {topSearches.map((s, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: `1px solid ${T.parchmentDark}` }}>
              <span style={{ fontSize: 13, color: T.brownDark }}>{s.service_name}{s.area_key ? ` · ${s.area_key}` : ""}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: T.teal, fontFamily: T.sans }}>{s.search_count}×</span>
            </div>
          ))}
        </div>
      )}
      <div style={S.card}>
        <div style={S.secTitle}>⭐ Review Stats</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {[["Total", reviews.length, T.brown], ["Avg Rating", avgRating, T.gold], ["Pending", reviews.filter(r => !r.is_approved).length, T.red]].map(([l, v, c]) => (
            <div key={l} style={{ textAlign: "center", background: T.parchment, borderRadius: 6, padding: "10px 6px" }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: c, fontFamily: T.sans }}>{v}</div>
              <div style={{ fontSize: 10, color: T.brownLight, fontFamily: T.sans }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── ADD PROVIDER TAB ──────────────────────────────────────────────────────────
function AddProviderTab({ onAdded, categories, services, serviceAreas }) {
  const empty = { business_name: "", owner_name: "", email: "", phone: "", website: "", description: "", address: "", license_number: "", years_in_business: "", google_review_url: "", notes: "", subscription_status: "trial", subscription_tier: "basic", onboarding_type: "admin_added", is_active: true, is_visible: true, category_id: "", services: [], service_areas: [] };
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(null);
  const [svcSearch, setSvcSearch] = useState("");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggle = (k, val) => setForm(f => ({ ...f, [k]: f[k].includes(val) ? f[k].filter(x => x !== val) : [...f[k], val] }));

  // Group services by category
  const catServices = {};
  services.forEach(s => { if (!catServices[s.category_id]) catServices[s.category_id] = []; catServices[s.category_id].push(s); });

  // Filter services when searching
  const filteredSvcs = svcSearch ? services.filter(s => s.name.toLowerCase().includes(svcSearch.toLowerCase())) : null;

  // Get selected category's services if category is chosen
  const relevantCatId = form.category_id;

  // When category changes, clear services
  const setCategory = (catId) => setForm(f => ({ ...f, category_id: catId, services: [] }));

  const save = async () => {
    if (!form.business_name || !form.email) return alert("Business name and email are required.");
    if (!form.category_id) return alert("Please select a category.");
    if (form.services.length === 0) return alert("Please select at least one service.");
    if (form.service_areas.length === 0) return alert("Please select at least one village.");
    setSaving(true);
    const vh = "VH-" + String(Math.floor(1000 + Math.random() * 9000));
    const now = new Date().toISOString();
    const trialEnd = new Date(Date.now() + 45 * 86400000).toISOString();
    try {
      const body = { ...form, vh_number: vh, trial_start_date: now, trial_end_date: trialEnd, profile_views: 0, search_appearances: 0, years_in_business: form.years_in_business ? Number(form.years_in_business) : 0 };
      const newP = await Provider.create(body);
      setDone({ name: newP.business_name, vh: newP.vh_number });
      onAdded(newP);
      setForm(empty);
      setSvcSearch("");
      setTimeout(() => setDone(null), 6000);
    } catch (e) { alert("Error: " + e.message); }
    setSaving(false);
  };

  return (
    <div style={S.card}>
      <div style={S.secTitle}>➕ Add New Provider</div>
      {done && (
        <div style={{ background: "#e8f5e9", border: `1px solid ${T.green}`, borderRadius: 8, padding: "12px 16px", color: T.green, fontFamily: T.sans, fontSize: 13, marginBottom: 16 }}>
          ✅ <strong>{done.name}</strong> added! Account #{done.vh}<br />
          <span style={{ fontSize: 12 }}>They are now live on the homepage under their selected services and villages.</span>
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>

        {/* Business info */}
        <div style={{ fontWeight: 700, fontSize: 12, color: T.brownLight, fontFamily: T.sans, textTransform: "uppercase", letterSpacing: 1 }}>— Business Info —</div>
        {[["Business Name *", "business_name", "text"], ["Owner Name", "owner_name", "text"], ["Email *", "email", "email"], ["Phone", "phone", "tel"], ["Website", "website", "url"], ["Address", "address", "text"], ["License #", "license_number", "text"], ["Years in Business", "years_in_business", "number"], ["Google Review URL", "google_review_url", "url"]].map(([lbl, k, t]) => (
          <div key={k}>
            <div style={{ fontSize: 12, color: T.brownLight, fontFamily: T.sans, marginBottom: 2 }}>{lbl}</div>
            <input type={t} value={form[k]} onChange={e => set(k, e.target.value)} style={S.inp} />
          </div>
        ))}
        <div>
          <div style={{ fontSize: 12, color: T.brownLight, fontFamily: T.sans, marginBottom: 2 }}>Description</div>
          <textarea value={form.description} onChange={e => set("description", e.target.value)} rows={3} style={{ ...S.inp, resize: "vertical" }} />
        </div>
        <div>
          <div style={{ fontSize: 12, color: T.brownLight, fontFamily: T.sans, marginBottom: 2 }}>Admin Notes (internal)</div>
          <textarea value={form.notes} onChange={e => set("notes", e.target.value)} rows={2} style={{ ...S.inp, resize: "vertical" }} />
        </div>

        {/* Subscription */}
        <div style={{ fontWeight: 700, fontSize: 12, color: T.brownLight, fontFamily: T.sans, textTransform: "uppercase", letterSpacing: 1 }}>— Account Settings —</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[["Status", "subscription_status", [["trial", "Trial (45 days)"], ["active", "Active/Paid"], ["pending", "Pending"], ["cancelled", "Cancelled"]]], ["Tier", "subscription_tier", [["basic", "Basic"], ["featured", "Featured"], ["premium", "Premium"]]], ["Active?", "is_active", [["true", "Yes — Active"], ["false", "No — Inactive"]]], ["Visible?", "is_visible", [["true", "Yes — Visible"], ["false", "No — Hidden"]]]].map(([lbl, k, opts]) => (
            <div key={k}>
              <div style={{ fontSize: 12, color: T.brownLight, fontFamily: T.sans, marginBottom: 2 }}>{lbl}</div>
              <select value={String(form[k])} onChange={e => set(k, k === "is_active" || k === "is_visible" ? e.target.value === "true" : e.target.value)} style={S.inp}>
                {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          ))}
        </div>

        {/* CATEGORY (Macro) */}
        <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 12, color: T.brownLight, fontFamily: T.sans, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>— Macro Category * —</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {categories.map(cat => (
              <div key={cat.id} onClick={() => setCategory(cat.id)}
                style={{ padding: "10px 12px", borderRadius: 8, border: `2px solid ${form.category_id === cat.id ? T.brown : T.border}`, cursor: "pointer", background: form.category_id === cat.id ? T.parchmentDark : T.cream, display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 20 }}>{cat.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, color: T.brownDark, fontSize: 14 }}>{cat.name}</div>
                  <div style={{ fontSize: 11, color: T.brownLight, fontFamily: T.sans }}>{cat.description}</div>
                </div>
                {form.category_id === cat.id && <span style={{ marginLeft: "auto", color: T.brown, fontSize: 18 }}>✓</span>}
              </div>
            ))}
          </div>
        </div>

        {/* SERVICES (Micro) — filtered by selected category */}
        {form.category_id && (
          <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 12, color: T.brownLight, fontFamily: T.sans, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
              — Services Offered * — <span style={{ fontWeight: 400, textTransform: "none" }}>({form.services.length} selected)</span>
            </div>
            <input placeholder="Search services..." value={svcSearch} onChange={e => setSvcSearch(e.target.value)} style={{ ...S.inp, marginBottom: 8 }} />
            {form.services.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
                {form.services.map(id => { const s = services.find(x => x.id === id); return s ? <span key={id} onClick={() => toggle("services", id)} style={{ fontSize: 12, background: T.brown, color: "#fff", borderRadius: 4, padding: "3px 10px", cursor: "pointer" }}>{s.name} ✕</span> : null; })}
              </div>
            )}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {(filteredSvcs || (catServices[form.category_id] || [])).map(svc => (
                <button key={svc.id} onClick={() => toggle("services", svc.id)} style={{ fontSize: 12, padding: "5px 11px", borderRadius: 5, border: `1px solid ${T.border}`, cursor: "pointer", fontFamily: T.sans, background: form.services.includes(svc.id) ? T.brown : T.parchment, color: form.services.includes(svc.id) ? "#fff" : T.brownDark }}>
                  {svc.name}
                </button>
              ))}
            </div>
            {!svcSearch && catServices[form.category_id]?.length === 0 && (
              <div style={{ fontSize: 12, color: "#aaa", fontStyle: "italic" }}>No services in this category yet.</div>
            )}
          </div>
        )}

        {/* VILLAGES */}
        <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 12, color: T.brownLight, fontFamily: T.sans, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
            — Service Villages * — <span style={{ fontWeight: 400, textTransform: "none" }}>({form.service_areas.length} selected)</span>
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <button onClick={() => set("service_areas", serviceAreas.map(a => a.id))} style={{ ...S.btn(T.teal), fontSize: 11 }}>Select All</button>
            <button onClick={() => set("service_areas", [])} style={{ ...S.btn("#888"), fontSize: 11 }}>Clear</button>
          </div>
          {form.service_areas.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
              {form.service_areas.map(id => { const a = serviceAreas.find(x => x.id === id); return a ? <span key={id} onClick={() => toggle("service_areas", id)} style={{ fontSize: 12, background: T.teal, color: "#fff", borderRadius: 4, padding: "3px 10px", cursor: "pointer" }}>{a.name} ✕</span> : null; })}
            </div>
          )}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {serviceAreas.map(a => (
              <button key={a.id} onClick={() => toggle("service_areas", a.id)} style={{ fontSize: 12, padding: "4px 10px", borderRadius: 4, border: `1px solid ${T.border}`, cursor: "pointer", fontFamily: T.sans, background: form.service_areas.includes(a.id) ? T.teal : T.parchment, color: form.service_areas.includes(a.id) ? "#fff" : T.brownDark }}>
                {a.name}
              </button>
            ))}
          </div>
        </div>

        <button onClick={save} disabled={saving} style={{ ...S.btn(T.brown), padding: 13, fontSize: 15, marginTop: 8, opacity: saving ? 0.6 : 1 }}>
          {saving ? "Saving..." : "✅ Add Provider to V-HUB"}
        </button>
      </div>
    </div>
  );
}

// ── MAIN DASHBOARD ────────────────────────────────────────────────────────────
function Dashboard() {
  const [providers, setProviders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState([]);
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [serviceAreas, setServiceAreas] = useState([]);
  const [tab, setTab] = useState("Overview");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [p, r, l, s, cats, svcs, areas] = await Promise.all([
        Provider.list(), ProviderReview.list(), LeadInquiry.list(),
        ServiceSearchStat.list(), Category.list(), Service.list(), ServiceArea.list(),
      ]);
      setProviders(Array.isArray(p) ? p : []);
      setReviews(Array.isArray(r) ? r : []);
      setLeads(Array.isArray(l) ? l : []);
      setStats(Array.isArray(s) ? s : []);
      setCategories(Array.isArray(cats) ? cats.filter(c => c.is_active) : []);
      setServices(Array.isArray(svcs) ? svcs.filter(s => s.is_active) : []);
      setServiceAreas(Array.isArray(areas) ? areas.filter(a => a.is_active) : []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // Build lookup maps: id → name
  const catMap = {}; categories.forEach(c => { catMap[c.id] = c.name; });
  const svcMap = {}; services.forEach(s => { svcMap[s.id] = s.name; });
  const areaMap = {}; serviceAreas.forEach(a => { areaMap[a.id] = a.name; });

  const pendingReviews = reviews.filter(r => !r.is_approved);
  const TABS = ["Overview", "Providers", "Reviews", "Leads", "Analytics", "Add Provider"];

  if (loading) return (
    <div style={{ minHeight: "100vh", background: T.parchment, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
      <img src={LOGO} style={{ width: 64, borderRadius: 10 }} alt="" />
      <div style={{ color: T.brownLight, fontSize: 15, fontStyle: "italic", fontFamily: T.font }}>Loading dashboard...</div>
    </div>
  );

  return (
    <div style={S.page}>
      <div style={S.hdr}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img src={LOGO} style={{ height: 42, borderRadius: 8 }} alt="" />
          <div>
            <div style={{ color: "#fff", fontSize: 17, fontWeight: 800, fontFamily: T.font }}>V-HUB Admin</div>
            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, fontFamily: T.sans }}>{providers.length} providers · {pendingReviews.length} reviews pending</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button onClick={load} style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", borderRadius: 6, padding: "5px 10px", fontSize: 12, cursor: "pointer", fontFamily: T.sans }}>↻ Refresh</button>
          <a href="/" style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, textDecoration: "none", fontFamily: T.sans }}>View Site →</a>
        </div>
      </div>

      <div style={{ background: T.parchmentDark, borderBottom: `2px solid ${T.border}`, overflowX: "auto", display: "flex" }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={S.tabBtn(tab === t)}>
            {t}{t === "Reviews" && pendingReviews.length > 0 ? ` (${pendingReviews.length})` : ""}
            {t === "Leads" && leads.length > 0 ? ` (${leads.length})` : ""}
          </button>
        ))}
      </div>

      <div style={{ padding: 14, maxWidth: 800, margin: "0 auto" }}>
        {tab === "Overview" && <Overview providers={providers} reviews={reviews} leads={leads} />}
        {tab === "Providers" && <ProvidersTab providers={providers} setProviders={setProviders} catMap={catMap} svcMap={svcMap} areaMap={areaMap} />}
        {tab === "Reviews" && <ReviewsTab reviews={reviews} setReviews={setReviews} providers={providers} />}
        {tab === "Leads" && <LeadsTab leads={leads} providers={providers} />}
        {tab === "Analytics" && <AnalyticsTab providers={providers} reviews={reviews} leads={leads} stats={stats} catMap={catMap} svcMap={svcMap} />}
        {tab === "Add Provider" && <AddProviderTab onAdded={p => { setProviders(prev => [p, ...prev]); setTab("Providers"); }} categories={categories} services={services} serviceAreas={serviceAreas} />}
      </div>
    </div>
  );
}

export default function Wekcadmin() {
  const [unlocked, setUnlocked] = useState(false);
  return unlocked ? <Dashboard /> : <PinGate onUnlock={() => setUnlocked(true)} />;
}
