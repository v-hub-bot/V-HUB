import React, { useState, useEffect } from "react";
import { Provider, ProviderReview, LeadInquiry, ServiceSearchStat } from "@/api/entities";

const PINS = ["6185", "1357"];
const LOGO = "https://media.base44.com/images/public/69d062aca815ce8e697894b1/a9af95bc3_V-Hublogo.png";

const T = {
  parchment: "#F5EDD6",
  parchmentDark: "#E8D9B0",
  brown: "#5C3317",
  brownLight: "#8B5E3C",
  brownDark: "#3B1F0A",
  gold: "#C9973A",
  red: "#8B1A1A",
  green: "#2E6B2E",
  teal: "#1A6B5C",
  cream: "#FFFDF4",
  border: "#C4A882",
  shadow: "rgba(92,51,23,0.15)",
  font: "'Georgia', 'Times New Roman', serif",
  sans: "'Arial', sans-serif",
};

const styles = {
  page: { minHeight: "100vh", background: T.parchment, fontFamily: T.font },
  header: {
    background: `linear-gradient(135deg, ${T.brownDark}, ${T.brown})`,
    padding: "14px 16px",
    display: "flex", alignItems: "center", justifyContent: "space-between",
    borderBottom: `3px solid ${T.gold}`,
  },
  card: {
    background: T.cream, borderRadius: 8, padding: "14px 16px",
    boxShadow: `0 2px 8px ${T.shadow}`, border: `1px solid ${T.border}`,
  },
  tab: (active) => ({
    padding: "8px 16px", borderRadius: 6, border: `1px solid ${T.border}`,
    fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: T.font,
    background: active ? T.brown : T.cream,
    color: active ? "#fff" : T.brown,
  }),
  btn: (color = T.brown) => ({
    fontSize: 12, padding: "5px 12px", borderRadius: 6, border: "none",
    background: color, color: "#fff", cursor: "pointer", fontWeight: 700,
    fontFamily: T.sans,
  }),
  label: (color, bg) => ({
    fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 20,
    background: bg, color: color,
  }),
  sectionTitle: {
    fontSize: 13, fontWeight: 700, color: T.brownLight, textTransform: "uppercase",
    letterSpacing: 1, marginBottom: 10, fontFamily: T.sans,
    borderBottom: `1px solid ${T.border}`, paddingBottom: 6,
  },
  input: {
    width: "100%", boxSizing: "border-box", padding: "8px 10px",
    borderRadius: 6, border: `1px solid ${T.border}`, fontFamily: T.sans,
    fontSize: 13, background: T.cream, color: T.brownDark, outline: "none",
  },
};

// ── FULL SERVICE LIST (matches homepage exactly) ──────────────────────────────
const SERVICES_BY_CATEGORY = {
  "Home & Property": ["AC/HVAC","Cleaning Services","Electrical","Flooring","Garage Doors","General Contracting","Handyman","Home Inspection","Home Security","Home Watch","Housekeeping","Insulation","Landscaping","Lawn Mowing","Moving Services","Painting","Pest Control","Plumbing","Pool Care","Pressure Washing","Roofing","Screen Repair","Tree Service","Window Cleaning","Window Replacement"],
  "Automotive": ["Auto Body Repair","Auto Detailing","Auto Glass","Auto Repair","Golf Cart Repair","Golf Cart Sales","Mobile Mechanic","Oil Change","Tire Shop","Towing"],
  "Health & Wellness": ["Acupuncture","Chiropractor","Counseling / Therapy","Dentist","Home Health Aide","Massage Therapy","Medical Transport","Nutrition Coaching","Occupational Therapy","Optometrist","Personal Training","Physical Therapy","Primary Care","Skin Care / Aesthetics"],
  "Personal Services": ["Alterations / Tailoring","Barber","Dog Grooming","Dog Training","Dog Walking","Errand Services","Hair Salon","Nail Salon","Personal Assistant","Pet Sitting","Photographer","Tutoring / Education"],
  "Professional Services": ["Accounting / Bookkeeping","Estate Planning","Financial Planning","Insurance Agent","IT Support","Legal Services","Mortgage / Lending","Notary","Real Estate Agent","Tax Preparation","Technology Help","Travel Planning"],
  "Food & Catering": ["Catering","Chef / Personal Cook","Grocery Delivery","Meal Prep","Restaurant Delivery"],
  "Events & Entertainment": ["DJ Services","Event Planning","Florist","Live Music / Band","Party Rental","Photography / Videography"],
  "Fitness & Recreation": ["Golf Lessons","Group Fitness","Pickleball Coaching","Swim Lessons","Yoga / Pilates"],
  "Other": ["Consignment / Resale","Furniture Assembly","Handmade / Crafts","Senior Placement Services","Shipping / Packing","Storage Solutions","Thrift / Donation Pickup"],
};

const ALL_SERVICES = Object.entries(SERVICES_BY_CATEGORY).flatMap(([cat, svcs]) =>
  svcs.map(s => ({ category: cat, service: s }))
);

// ── FULL VILLAGE LIST (matches homepage exactly) ──────────────────────────────
const VILLAGES = [
  "Aloha","Amelia","Antrim","Ashland","Associations","Autograph","Balfour","Belvedere","Bonita","Bonnybrook",
  "Briar Meadow","Buttonwood","Calumet Grove","Captiva","Caroline","Chatham","Chinaberry","Chitty Chatty",
  "Citra","Citrus Grove","Country Club Hills","Courtyard Villas","Curlew","Del Mar","DeLuna","DeSoto",
  "Duval","Eason","El Camino Real","Fenney","Fernandina","Gilchrist","Glenbrook","Hadley",
  "Hammock at Fenney","Hemingway","Heritage","Hillsborough","Hooper","Johnston","Lake Deaton",
  "Lake Miona","Largo","Linden","Longleaf","Lynnhaven","Mallory Square","Marsh Bend","McLawren",
  "Meseta","Mira Mesa","Osceola Hills","Pennecamp","Pine Hills","Poinciana","Polo Ridge","Ritchey",
  "Sabal Chase","Santo Domingo","Sanibel","Santiago","Silver Lake","Springdale","St. Charles","St. James",
  "St. Johns","Summerhill","Sunset Pointe","Tamarind Grove","Tierra del Sol","Trilby","Truman",
  "Turtle Mound","Veras","Village of Lake Deaton","Virginia Trace","Winifred","Woodbury"
];

function fmt(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function daysLeft(endDate) {
  if (!endDate) return null;
  return Math.ceil((new Date(endDate) - new Date()) / 86400000);
}

// ── PIN GATE ──────────────────────────────────────────────────────────────────
function PinGate({ onUnlock }) {
  const [pin, setPin] = useState("");
  const [err, setErr] = useState(false);
  const submit = () => {
    if (PINS.includes(pin)) { onUnlock(); }
    else { setErr(true); setPin(""); setTimeout(() => setErr(false), 2500); }
  };
  return (
    <div style={{ minHeight: "100vh", background: T.parchment, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: T.font }}>
      <div style={{ background: T.cream, borderRadius: 12, padding: "40px 32px", boxShadow: `0 8px 32px ${T.shadow}`, textAlign: "center", width: 300, border: `2px solid ${T.border}` }}>
        <img src={LOGO} style={{ width: 72, borderRadius: 12, marginBottom: 16 }} alt="" />
        <div style={{ fontSize: 22, fontWeight: 800, color: T.brownDark, marginBottom: 4 }}>V-HUB Admin</div>
        <div style={{ fontSize: 13, color: T.brownLight, marginBottom: 22, fontStyle: "italic" }}>Enter your 4-digit PIN</div>
        <input
          autoFocus type="password" inputMode="numeric" maxLength={4} value={pin}
          onChange={e => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
          onKeyDown={e => e.key === "Enter" && submit()}
          placeholder="••••"
          style={{ ...styles.input, fontSize: 28, textAlign: "center", letterSpacing: 10, marginBottom: 10, border: err ? `2px solid ${T.red}` : `2px solid ${T.border}`, background: err ? "#fff5f5" : T.cream }}
        />
        {err && <div style={{ color: T.red, fontSize: 13, marginBottom: 8 }}>Incorrect PIN — try again</div>}
        <button onClick={submit} style={{ ...styles.btn(T.brown), width: "100%", padding: 13, fontSize: 16 }}>Unlock Dashboard</button>
        <a href="/" style={{ display: "block", marginTop: 14, fontSize: 12, color: T.brownLight, textDecoration: "none" }}>← Back to V-HUB</a>
      </div>
    </div>
  );
}

// ── OVERVIEW TAB ──────────────────────────────────────────────────────────────
function Overview({ providers, reviews, leads }) {
  const active = providers.filter(p => p.is_active);
  const trial = providers.filter(p => p.subscription_status === "trial");
  const paid = providers.filter(p => p.subscription_status === "active" || p.subscription_status === "paid");
  const expiringSoon = providers.filter(p => { const d = daysLeft(p.trial_end_date); return d !== null && d >= 0 && d <= 7; });
  const expired = providers.filter(p => { const d = daysLeft(p.trial_end_date); return d !== null && d < 0 && p.is_active; });
  const totalViews = providers.reduce((s, p) => s + (p.profile_views || 0), 0);
  const totalSearches = providers.reduce((s, p) => s + (p.search_appearances || 0), 0);
  const pendingReviews = reviews.filter(r => !r.is_approved);
  const topViewed = [...providers].sort((a, b) => (b.profile_views || 0) - (a.profile_views || 0)).slice(0, 5);
  const areaCount = {};
  providers.forEach(p => {
    const areas = Array.isArray(p.service_areas) ? p.service_areas : [];
    areas.forEach(a => { areaCount[a] = (areaCount[a] || 0) + 1; });
  });
  const topAreas = Object.entries(areaCount).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const statCards = [
    { label: "Total Providers", val: providers.length, color: T.brown, icon: "🏪" },
    { label: "Active", val: active.length, color: T.green, icon: "✅" },
    { label: "On Trial", val: trial.length, color: T.gold, icon: "⏳" },
    { label: "Paid Subscribers", val: paid.length, color: T.teal, icon: "💳" },
    { label: "Expiring ≤7 Days", val: expiringSoon.length, color: "#c0392b", icon: "🔴" },
    { label: "Trial Expired", val: expired.length, color: T.red, icon: "⚠️" },
    { label: "Profile Views", val: totalViews, color: T.brownLight, icon: "👁️" },
    { label: "Search Appearances", val: totalSearches, color: T.teal, icon: "🔍" },
    { label: "Reviews Pending", val: pendingReviews.length, color: T.red, icon: "⭐" },
    { label: "Lead Inquiries", val: leads.length, color: T.brown, icon: "📬" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
        {statCards.map(s => (
          <div key={s.label} style={{ ...styles.card, borderLeft: `4px solid ${s.color}` }}>
            <div style={{ fontSize: 11, color: T.brownLight, fontFamily: T.sans, marginBottom: 2 }}>{s.icon} {s.label}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: s.color, fontFamily: T.sans }}>{s.val}</div>
          </div>
        ))}
      </div>

      {expiringSoon.length > 0 && (
        <div style={{ ...styles.card, background: "#fff8e1", borderLeft: `4px solid ${T.gold}` }}>
          <div style={styles.sectionTitle}>⚠️ Trials Expiring Soon</div>
          {expiringSoon.map(p => {
            const d = daysLeft(p.trial_end_date);
            return (
              <div key={p.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "4px 0", borderBottom: `1px solid ${T.parchmentDark}` }}>
                <span style={{ color: T.brownDark, fontWeight: 600 }}>{p.business_name}</span>
                <span style={{ color: d <= 3 ? T.red : T.gold, fontWeight: 700 }}>{d === 0 ? "Today!" : `${d}d left`}</span>
              </div>
            );
          })}
        </div>
      )}

      <div style={styles.card}>
        <div style={styles.sectionTitle}>👁️ Most Viewed Providers</div>
        {topViewed.length === 0 ? <div style={{ color: "#aaa", fontSize: 13 }}>No view data yet</div> : topViewed.map((p, i) => (
          <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", borderBottom: `1px solid ${T.parchmentDark}` }}>
            <span style={{ fontSize: 13, color: T.brownDark }}>#{i + 1} {p.business_name}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: T.teal, fontFamily: T.sans }}>{p.profile_views || 0} views</span>
          </div>
        ))}
      </div>

      <div style={styles.card}>
        <div style={styles.sectionTitle}>📍 Top Service Areas</div>
        {topAreas.length === 0 ? <div style={{ color: "#aaa", fontSize: 13 }}>No area data yet</div> : topAreas.map(([area, count]) => (
          <div key={area} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: `1px solid ${T.parchmentDark}` }}>
            <span style={{ fontSize: 13, color: T.brownDark }}>{area}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: T.brown, fontFamily: T.sans }}>{count} providers</span>
          </div>
        ))}
      </div>

      <div style={styles.card}>
        <div style={styles.sectionTitle}>🆕 Recent Signups</div>
        {[...providers].sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).slice(0, 6).map(p => (
          <div key={p.id} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: `1px solid ${T.parchmentDark}` }}>
            <div>
              <span style={{ fontSize: 13, color: T.brownDark, fontWeight: 600 }}>{p.business_name}</span>
              <span style={{ fontSize: 11, color: T.brownLight, marginLeft: 6, fontFamily: T.sans }}>{p.subscription_status}</span>
            </div>
            <span style={{ fontSize: 12, color: T.brownLight, fontFamily: T.sans }}>{fmt(p.created_date)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── PROVIDERS TAB ─────────────────────────────────────────────────────────────
function ProvidersTab({ providers, setProviders }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState(null);

  const filtered = providers.filter(p => {
    const q = search.toLowerCase();
    const match = !q || p.business_name?.toLowerCase().includes(q) || p.email?.toLowerCase().includes(q) || p.owner_name?.toLowerCase().includes(q);
    if (!match) return false;
    if (filter === "active") return p.is_active;
    if (filter === "hidden") return !p.is_active;
    if (filter === "trial") return p.subscription_status === "trial";
    if (filter === "paid") return p.subscription_status === "active" || p.subscription_status === "paid";
    if (filter === "expiring") { const d = daysLeft(p.trial_end_date); return d !== null && d >= 0 && d <= 7; }
    return true;
  });

  const toggleActive = async (p) => {
    await Provider.update(p.id, { is_active: !p.is_active });
    setProviders(prev => prev.map(x => x.id === p.id ? { ...x, is_active: !p.is_active } : x));
  };

  const toggleVisible = async (p) => {
    await Provider.update(p.id, { is_visible: !p.is_visible });
    setProviders(prev => prev.map(x => x.id === p.id ? { ...x, is_visible: !p.is_visible } : x));
  };

  const deleteProvider = async (p) => {
    if (!window.confirm(`Delete ${p.business_name}? This cannot be undone.`)) return;
    await Provider.delete(p.id);
    setProviders(prev => prev.filter(x => x.id !== p.id));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <input placeholder="🔍 Search by name, email, owner..." value={search} onChange={e => setSearch(e.target.value)} style={styles.input} />
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {["all", "active", "hidden", "trial", "paid", "expiring"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ ...styles.tab(filter === f), padding: "5px 12px", fontSize: 12 }}>
            {f === "all" ? `All (${providers.length})` : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>
      {filtered.length === 0 && <div style={{ textAlign: "center", color: T.brownLight, padding: 30, fontStyle: "italic" }}>No providers match this filter.</div>}
      {filtered.map(p => {
        const dl = daysLeft(p.trial_end_date);
        const isExp = expanded === p.id;
        const svcList = Array.isArray(p.services) ? p.services : [];
        const areaList = Array.isArray(p.service_areas) ? p.service_areas : [];
        return (
          <div key={p.id} style={styles.card}>
            <div onClick={() => setExpanded(isExp ? null : p.id)} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", cursor: "pointer" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: T.brownDark }}>{p.business_name || "(no name)"}</div>
                <div style={{ fontSize: 12, color: T.brownLight, fontFamily: T.sans }}>{p.owner_name} · {p.email}</div>
                <div style={{ fontSize: 11, color: "#aaa", fontFamily: T.sans, marginTop: 2 }}>
                  {p.phone} {p.vh_number ? `· ${p.vh_number}` : ""} · Joined {fmt(p.created_date)}
                </div>
                {svcList.length > 0 && <div style={{ fontSize: 11, color: T.teal, marginTop: 3, fontFamily: T.sans }}>🛠 {svcList.slice(0, 3).join(", ")}{svcList.length > 3 ? ` +${svcList.length - 3}` : ""}</div>}
                {areaList.length > 0 && <div style={{ fontSize: 11, color: T.brownLight, fontFamily: T.sans }}>📍 {areaList.slice(0, 3).join(", ")}{areaList.length > 3 ? ` +${areaList.length - 3}` : ""}</div>}
              </div>
              <div style={{ fontSize: 18, color: T.brownLight, marginLeft: 8 }}>{isExp ? "▲" : "▼"}</div>
            </div>

            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
              <span style={styles.label(p.is_active ? T.green : T.red, p.is_active ? "#e8f5e9" : "#fce8e8")}>{p.is_active ? "Active" : "Inactive"}</span>
              <span style={styles.label(p.is_visible !== false ? T.teal : "#888", p.is_visible !== false ? "#e0f4f1" : "#f0f0f0")}>{p.is_visible !== false ? "Visible" : "Hidden"}</span>
              {p.subscription_status && <span style={styles.label(T.brown, T.parchmentDark)}>{p.subscription_status}</span>}
              {p.subscription_tier && <span style={styles.label(T.teal, "#e0f4f1")}>{p.subscription_tier}</span>}
              {dl !== null && dl >= 0 && <span style={styles.label(dl <= 3 ? T.red : T.gold, dl <= 3 ? "#fce8e8" : "#fff8e1")}>{dl === 0 ? "Expires today!" : `${dl}d left`}</span>}
              {dl !== null && dl < 0 && <span style={styles.label(T.red, "#fce8e8")}>Trial expired</span>}
            </div>

            {isExp && (
              <div style={{ marginTop: 12, borderTop: `1px solid ${T.border}`, paddingTop: 12 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
                  {[
                    ["Profile Views", p.profile_views || 0, "👁️"],
                    ["Search Appearances", p.search_appearances || 0, "🔍"],
                    ["Trial Start", fmt(p.trial_start_date), "📅"],
                    ["Trial End", fmt(p.trial_end_date), "📅"],
                    ["Onboarding", p.onboarding_type || "—", "🚪"],
                    ["Years in Biz", p.years_in_business || "—", "🏆"],
                    ["License #", p.license_number || "—", "📄"],
                    ["Rating", p.rating ? `${p.rating}★` : "—", "⭐"],
                  ].map(([label, val, icon]) => (
                    <div key={label} style={{ background: T.parchment, borderRadius: 6, padding: "6px 10px" }}>
                      <div style={{ fontSize: 10, color: T.brownLight, fontFamily: T.sans }}>{icon} {label}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: T.brownDark, fontFamily: T.sans }}>{String(val)}</div>
                    </div>
                  ))}
                </div>

                {/* Services */}
                {svcList.length > 0 && (
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 11, color: T.brownLight, fontFamily: T.sans, marginBottom: 4 }}>🛠 SERVICES OFFERED</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {svcList.map(s => <span key={s} style={{ fontSize: 11, background: T.parchmentDark, color: T.brownDark, borderRadius: 4, padding: "2px 8px" }}>{s}</span>)}
                    </div>
                  </div>
                )}

                {/* Areas */}
                {areaList.length > 0 && (
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 11, color: T.brownLight, fontFamily: T.sans, marginBottom: 4 }}>📍 SERVICE AREAS</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {areaList.map(a => <span key={a} style={{ fontSize: 11, background: "#e0f4f1", color: T.teal, borderRadius: 4, padding: "2px 8px" }}>{a}</span>)}
                    </div>
                  </div>
                )}

                {p.description && <div style={{ fontSize: 12, color: T.brownLight, fontStyle: "italic", marginBottom: 8 }}>{p.description}</div>}
                {p.website && <div style={{ fontSize: 12, marginBottom: 6 }}><a href={p.website} target="_blank" rel="noreferrer" style={{ color: T.teal }}>🌐 {p.website}</a></div>}
                {p.google_review_url && <div style={{ fontSize: 12, marginBottom: 6 }}><a href={p.google_review_url} target="_blank" rel="noreferrer" style={{ color: T.teal }}>⭐ Google Reviews ↗</a></div>}
                {p.notes && <div style={{ fontSize: 12, color: T.brownLight, background: "#fff8e1", borderRadius: 6, padding: 8, marginBottom: 8 }}>📝 {p.notes}</div>}
                {p.address && <div style={{ fontSize: 12, color: T.brownLight, marginBottom: 8 }}>📍 {p.address}</div>}

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
                  <button onClick={() => toggleActive(p)} style={styles.btn(p.is_active ? "#8B4513" : T.green)}>{p.is_active ? "Deactivate" : "Activate"}</button>
                  <button onClick={() => toggleVisible(p)} style={styles.btn(T.teal)}>{p.is_visible === false ? "Make Visible" : "Hide Listing"}</button>
                  <button onClick={() => deleteProvider(p)} style={styles.btn(T.red)}>Delete</button>
                  {p.email && <a href={`mailto:${p.email}`} style={{ ...styles.btn(T.brownLight), textDecoration: "none" }}>✉️ Email</a>}
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
  const provMap = {};
  providers.forEach(p => { provMap[p.id] = p.business_name; });
  const filtered = reviews.filter(r => filter === "all" ? true : filter === "pending" ? !r.is_approved : r.is_approved);

  const approve = async (r) => {
    await ProviderReview.update(r.id, { is_approved: true });
    setReviews(prev => prev.map(x => x.id === r.id ? { ...x, is_approved: true } : x));
  };
  const remove = async (r) => {
    if (!window.confirm("Delete this review?")) return;
    await ProviderReview.delete(r.id);
    setReviews(prev => prev.filter(x => x.id !== r.id));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", gap: 8 }}>
        {["pending", "approved", "all"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ ...styles.tab(filter === f), fontSize: 12 }}>
            {f.charAt(0).toUpperCase() + f.slice(1)} ({f === "pending" ? reviews.filter(r => !r.is_approved).length : f === "approved" ? reviews.filter(r => r.is_approved).length : reviews.length})
          </button>
        ))}
      </div>
      {filtered.length === 0 && <div style={{ textAlign: "center", color: T.brownLight, padding: 30, fontStyle: "italic" }}>No reviews in this category.</div>}
      {filtered.map(r => (
        <div key={r.id} style={styles.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
            <div>
              <span style={{ fontWeight: 700, fontSize: 14, color: T.brownDark }}>{r.customer_name}</span>
              {r.customer_village && <span style={{ fontSize: 12, color: T.brownLight, marginLeft: 6 }}>· {r.customer_village}</span>}
            </div>
            <span style={{ color: "#DAA520", fontSize: 16 }}>{"★".repeat(r.rating || 0)}{"☆".repeat(5 - (r.rating || 0))}</span>
          </div>
          {provMap[r.provider_id] && <div style={{ fontSize: 11, color: T.brownLight, fontFamily: T.sans, marginBottom: 4 }}>For: {provMap[r.provider_id]}</div>}
          {r.service_used && <div style={{ fontSize: 11, color: T.brownLight, fontFamily: T.sans, marginBottom: 6 }}>Service: {r.service_used}</div>}
          <div style={{ fontSize: 13, color: T.brownDark, marginBottom: 8, fontStyle: "italic" }}>"{r.review_text}"</div>
          <div style={{ fontSize: 11, color: "#bbb", fontFamily: T.sans, marginBottom: 8 }}>{fmt(r.created_date)}</div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {!r.is_approved && <button onClick={() => approve(r)} style={styles.btn(T.green)}>✓ Approve</button>}
            <button onClick={() => remove(r)} style={styles.btn(T.red)}>✕ Delete</button>
            <span style={styles.label(r.is_approved ? T.green : T.gold, r.is_approved ? "#e8f5e9" : "#fff8e1")}>{r.is_approved ? "Approved" : "Pending"}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── LEADS TAB ─────────────────────────────────────────────────────────────────
function LeadsTab({ leads, providers }) {
  const provMap = {};
  providers.forEach(p => { provMap[p.id] = p.business_name; });
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {leads.length === 0 && (
        <div style={{ ...styles.card, textAlign: "center", color: T.brownLight, padding: 30, fontStyle: "italic" }}>
          No lead inquiries yet. When customers contact providers, they'll appear here.
        </div>
      )}
      {[...leads].sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).map(l => (
        <div key={l.id} style={styles.card}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: T.brownDark }}>{l.customer_name}</span>
            <span style={styles.label(T.brown, T.parchmentDark)}>{l.status || "new"}</span>
          </div>
          <div style={{ fontSize: 12, color: T.brownLight, fontFamily: T.sans, marginBottom: 4 }}>{l.customer_email} · {l.customer_phone}</div>
          {provMap[l.provider_id] && <div style={{ fontSize: 12, color: T.teal, marginBottom: 4 }}>Provider: {provMap[l.provider_id]}</div>}
          {l.message && <div style={{ fontSize: 13, color: T.brownDark, fontStyle: "italic", marginBottom: 6 }}>"{l.message}"</div>}
          <div style={{ fontSize: 11, color: "#bbb", fontFamily: T.sans }}>{fmt(l.created_date)}</div>
        </div>
      ))}
    </div>
  );
}

// ── ANALYTICS TAB ─────────────────────────────────────────────────────────────
function AnalyticsTab({ providers, reviews, leads, stats }) {
  const paidCount = providers.filter(p => p.subscription_status === "active" || p.subscription_status === "paid").length;
  const trialCount = providers.filter(p => p.subscription_status === "trial").length;
  const estRevenue = paidCount * 29;
  const byMonth = {};
  providers.forEach(p => {
    if (!p.created_date) return;
    const d = new Date(p.created_date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    byMonth[key] = (byMonth[key] || 0) + 1;
  });
  const months = Object.entries(byMonth).sort((a, b) => a[0].localeCompare(b[0]));
  const maxM = Math.max(...months.map(m => m[1]), 1);
  const subMap = {};
  providers.forEach(p => { const s = p.subscription_status || "unknown"; subMap[s] = (subMap[s] || 0) + 1; });
  const catMap = {};
  providers.forEach(p => {
    const svcs = Array.isArray(p.services) ? p.services : [];
    svcs.forEach(s => { catMap[s] = (catMap[s] || 0) + 1; });
  });
  const catEntries = Object.entries(catMap).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const maxC = Math.max(...catEntries.map(c => c[1]), 1);
  const topSearches = [...stats].sort((a, b) => (b.search_count || 0) - (a.search_count || 0)).slice(0, 10);
  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1) : "—";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={styles.card}>
        <div style={styles.sectionTitle}>💰 Revenue Snapshot</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {[["Est. MRR", `$${estRevenue}`, T.green], ["Paid Accts", paidCount, T.teal], ["Trial Accts", trialCount, T.gold]].map(([label, val, color]) => (
            <div key={label} style={{ textAlign: "center", background: T.parchment, borderRadius: 6, padding: "10px 6px" }}>
              <div style={{ fontSize: 22, fontWeight: 800, color, fontFamily: T.sans }}>{val}</div>
              <div style={{ fontSize: 10, color: T.brownLight, fontFamily: T.sans }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.card}>
        <div style={styles.sectionTitle}>📈 Provider Signups by Month</div>
        {months.length === 0 ? <div style={{ color: "#aaa", fontSize: 13 }}>No data yet</div> : months.map(([month, count]) => (
          <div key={month} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <div style={{ fontSize: 11, color: T.brownLight, fontFamily: T.sans, width: 60, flexShrink: 0 }}>{month}</div>
            <div style={{ flex: 1, background: T.parchmentDark, borderRadius: 4, height: 18 }}>
              <div style={{ width: `${(count / maxM) * 100}%`, background: T.brown, borderRadius: 4, height: "100%", minWidth: 20, display: "flex", alignItems: "center", paddingLeft: 6 }}>
                <span style={{ fontSize: 10, color: "#fff", fontFamily: T.sans }}>{count}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={styles.card}>
        <div style={styles.sectionTitle}>📊 Subscription Breakdown</div>
        {Object.entries(subMap).map(([status, count]) => (
          <div key={status} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: `1px solid ${T.parchmentDark}` }}>
            <span style={{ fontSize: 13, color: T.brownDark, textTransform: "capitalize" }}>{status}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: T.brown, fontFamily: T.sans }}>{count}</span>
          </div>
        ))}
      </div>

      <div style={styles.card}>
        <div style={styles.sectionTitle}>🛠 Top Services Offered</div>
        {catEntries.length === 0 ? <div style={{ color: "#aaa", fontSize: 13 }}>No service data yet</div> : catEntries.map(([svc, count]) => (
          <div key={svc} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <div style={{ fontSize: 11, color: T.brownLight, fontFamily: T.sans, width: 130, flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{svc}</div>
            <div style={{ flex: 1, background: T.parchmentDark, borderRadius: 4, height: 16 }}>
              <div style={{ width: `${(count / maxC) * 100}%`, background: T.teal, borderRadius: 4, height: "100%", minWidth: 16, display: "flex", alignItems: "center", paddingLeft: 5 }}>
                <span style={{ fontSize: 10, color: "#fff", fontFamily: T.sans }}>{count}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {topSearches.length > 0 && (
        <div style={styles.card}>
          <div style={styles.sectionTitle}>🔍 Top Search Terms</div>
          {topSearches.map((s, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: `1px solid ${T.parchmentDark}` }}>
              <span style={{ fontSize: 13, color: T.brownDark }}>{s.service_name}{s.area_key ? ` · ${s.area_key}` : ""}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: T.teal, fontFamily: T.sans }}>{s.search_count}×</span>
            </div>
          ))}
        </div>
      )}

      <div style={styles.card}>
        <div style={styles.sectionTitle}>⭐ Review Stats</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {[["Total Reviews", reviews.length, T.brown], ["Avg Rating", avgRating, T.gold], ["Pending", reviews.filter(r => !r.is_approved).length, T.red]].map(([label, val, color]) => (
            <div key={label} style={{ textAlign: "center", background: T.parchment, borderRadius: 6, padding: "10px 6px" }}>
              <div style={{ fontSize: 22, fontWeight: 800, color, fontFamily: T.sans }}>{val}</div>
              <div style={{ fontSize: 10, color: T.brownLight, fontFamily: T.sans }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── ADD PROVIDER TAB ──────────────────────────────────────────────────────────
function AddProviderTab({ onAdded }) {
  const emptyForm = {
    business_name: "", owner_name: "", email: "", phone: "", website: "",
    description: "", address: "", license_number: "", years_in_business: "",
    google_review_url: "", notes: "",
    subscription_status: "trial", subscription_tier: "basic",
    onboarding_type: "admin_added", is_active: true, is_visible: true,
    services: [], service_areas: [],
  };
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(null);
  const [serviceSearch, setServiceSearch] = useState("");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const toggleService = (svc) => {
    setForm(f => ({
      ...f,
      services: f.services.includes(svc) ? f.services.filter(s => s !== svc) : [...f.services, svc]
    }));
  };

  const toggleArea = (area) => {
    setForm(f => ({
      ...f,
      service_areas: f.service_areas.includes(area) ? f.service_areas.filter(a => a !== area) : [...f.service_areas, area]
    }));
  };

  const filteredServices = serviceSearch
    ? ALL_SERVICES.filter(s => s.service.toLowerCase().includes(serviceSearch.toLowerCase()) || s.category.toLowerCase().includes(serviceSearch.toLowerCase()))
    : null;

  const save = async () => {
    if (!form.business_name || !form.email) return alert("Business name and email are required.");
    if (form.services.length === 0) return alert("Please select at least one service.");
    if (form.service_areas.length === 0) return alert("Please select at least one service area (village).");
    setSaving(true);
    const vh = "VH-" + String(Math.floor(1000 + Math.random() * 9000));
    const now = new Date().toISOString();
    const trialEnd = new Date(Date.now() + 45 * 86400000).toISOString();
    const body = {
      ...form,
      vh_number: vh,
      trial_start_date: now,
      trial_end_date: trialEnd,
      profile_views: 0,
      search_appearances: 0,
      years_in_business: form.years_in_business ? Number(form.years_in_business) : 0,
    };
    try {
      const newP = await Provider.create(body);
      setSaving(false);
      setDone({ name: newP.business_name, vh: newP.vh_number });
      onAdded(newP);
      setForm(emptyForm);
      setServiceSearch("");
      setTimeout(() => setDone(null), 5000);
    } catch (e) {
      setSaving(false);
      alert("Error saving provider: " + e.message);
    }
  };

  return (
    <div style={styles.card}>
      <div style={styles.sectionTitle}>➕ Add New Provider</div>

      {done && (
        <div style={{ background: "#e8f5e9", border: `1px solid ${T.green}`, borderRadius: 8, padding: "12px 16px", color: T.green, fontFamily: T.sans, fontSize: 13, marginBottom: 16 }}>
          ✅ <strong>{done.name}</strong> added successfully! ({done.vh})<br />
          <span style={{ fontSize: 12 }}>They are now live on the homepage under their selected services and villages.</span>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Basic info */}
        <div style={{ fontSize: 12, fontWeight: 700, color: T.brownLight, fontFamily: T.sans, textTransform: "uppercase", letterSpacing: 1, marginBottom: -4 }}>Business Info</div>
        {[
          ["Business Name *", "business_name", "text"],
          ["Owner Name", "owner_name", "text"],
          ["Email *", "email", "email"],
          ["Phone", "phone", "tel"],
          ["Website", "website", "url"],
          ["Address", "address", "text"],
          ["License #", "license_number", "text"],
          ["Years in Business", "years_in_business", "number"],
          ["Google Review URL", "google_review_url", "url"],
        ].map(([label, key, type]) => (
          <div key={key}>
            <div style={{ fontSize: 12, color: T.brownLight, fontFamily: T.sans, marginBottom: 3 }}>{label}</div>
            <input type={type} value={form[key]} onChange={e => set(key, e.target.value)} style={styles.input} />
          </div>
        ))}

        <div>
          <div style={{ fontSize: 12, color: T.brownLight, fontFamily: T.sans, marginBottom: 3 }}>Description</div>
          <textarea value={form.description} onChange={e => set("description", e.target.value)} rows={3} style={{ ...styles.input, resize: "vertical" }} />
        </div>

        <div>
          <div style={{ fontSize: 12, color: T.brownLight, fontFamily: T.sans, marginBottom: 3 }}>Admin Notes (internal only)</div>
          <textarea value={form.notes} onChange={e => set("notes", e.target.value)} rows={2} style={{ ...styles.input, resize: "vertical" }} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <div style={{ fontSize: 12, color: T.brownLight, fontFamily: T.sans, marginBottom: 3 }}>Status</div>
            <select value={form.subscription_status} onChange={e => set("subscription_status", e.target.value)} style={styles.input}>
              <option value="trial">Trial (45 days)</option>
              <option value="active">Active / Paid</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <div style={{ fontSize: 12, color: T.brownLight, fontFamily: T.sans, marginBottom: 3 }}>Tier</div>
            <select value={form.subscription_tier} onChange={e => set("subscription_tier", e.target.value)} style={styles.input}>
              <option value="basic">Basic</option>
              <option value="featured">Featured</option>
              <option value="premium">Premium</option>
            </select>
          </div>
          <div>
            <div style={{ fontSize: 12, color: T.brownLight, fontFamily: T.sans, marginBottom: 3 }}>Active on Site?</div>
            <select value={form.is_active ? "yes" : "no"} onChange={e => set("is_active", e.target.value === "yes")} style={styles.input}>
              <option value="yes">Yes — Active</option>
              <option value="no">No — Hidden</option>
            </select>
          </div>
          <div>
            <div style={{ fontSize: 12, color: T.brownLight, fontFamily: T.sans, marginBottom: 3 }}>Visible in Search?</div>
            <select value={form.is_visible ? "yes" : "no"} onChange={e => set("is_visible", e.target.value === "yes")} style={styles.input}>
              <option value="yes">Yes — Visible</option>
              <option value="no">No — Hidden</option>
            </select>
          </div>
        </div>

        {/* SERVICE SELECTION */}
        <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.brownDark, fontFamily: T.sans, marginBottom: 6 }}>
            🛠 Services Offered * <span style={{ color: T.brownLight, fontWeight: 400 }}>({form.services.length} selected)</span>
          </div>
          <input
            placeholder="Search services..."
            value={serviceSearch}
            onChange={e => setServiceSearch(e.target.value)}
            style={{ ...styles.input, marginBottom: 8 }}
          />

          {form.services.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
              {form.services.map(s => (
                <span key={s} onClick={() => toggleService(s)} style={{ fontSize: 12, background: T.brown, color: "#fff", borderRadius: 4, padding: "3px 10px", cursor: "pointer" }}>
                  {s} ✕
                </span>
              ))}
            </div>
          )}

          {serviceSearch ? (
            <div style={{ maxHeight: 200, overflowY: "auto", border: `1px solid ${T.border}`, borderRadius: 6, background: T.cream }}>
              {filteredServices.length === 0 && <div style={{ padding: 10, color: "#aaa", fontSize: 13 }}>No matches</div>}
              {filteredServices.map(({ category, service }) => (
                <div key={service} onClick={() => { toggleService(service); }}
                  style={{ padding: "7px 12px", borderBottom: `1px solid ${T.parchmentDark}`, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", background: form.services.includes(service) ? "#e8f5e9" : "transparent" }}>
                  <span style={{ fontSize: 13, color: T.brownDark }}>{service}</span>
                  <span style={{ fontSize: 10, color: T.brownLight }}>{category}</span>
                </div>
              ))}
            </div>
          ) : (
            Object.entries(SERVICES_BY_CATEGORY).map(([cat, svcs]) => (
              <div key={cat} style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 11, color: T.brownLight, fontFamily: T.sans, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>{cat}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {svcs.map(svc => (
                    <button key={svc} onClick={() => toggleService(svc)} style={{
                      fontSize: 12, padding: "4px 10px", borderRadius: 4, border: `1px solid ${T.border}`,
                      cursor: "pointer", fontFamily: T.sans,
                      background: form.services.includes(svc) ? T.brown : T.parchment,
                      color: form.services.includes(svc) ? "#fff" : T.brownDark,
                    }}>{svc}</button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* VILLAGE SELECTION */}
        <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.brownDark, fontFamily: T.sans, marginBottom: 6 }}>
            📍 Service Areas (Villages) * <span style={{ color: T.brownLight, fontWeight: 400 }}>({form.service_areas.length} selected)</span>
          </div>

          {form.service_areas.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
              {form.service_areas.map(a => (
                <span key={a} onClick={() => toggleArea(a)} style={{ fontSize: 12, background: T.teal, color: "#fff", borderRadius: 4, padding: "3px 10px", cursor: "pointer" }}>
                  {a} ✕
                </span>
              ))}
            </div>
          )}

          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <button onClick={() => setForm(f => ({ ...f, service_areas: [...VILLAGES] }))} style={{ ...styles.btn(T.teal), fontSize: 11 }}>Select All Villages</button>
            <button onClick={() => setForm(f => ({ ...f, service_areas: [] }))} style={{ ...styles.btn("#888"), fontSize: 11 }}>Clear All</button>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {VILLAGES.map(v => (
              <button key={v} onClick={() => toggleArea(v)} style={{
                fontSize: 12, padding: "4px 10px", borderRadius: 4, border: `1px solid ${T.border}`,
                cursor: "pointer", fontFamily: T.sans,
                background: form.service_areas.includes(v) ? T.teal : T.parchment,
                color: form.service_areas.includes(v) ? "#fff" : T.brownDark,
              }}>{v}</button>
            ))}
          </div>
        </div>

        <button onClick={save} disabled={saving} style={{ ...styles.btn(T.brown), padding: "13px", fontSize: 15, marginTop: 8, opacity: saving ? 0.6 : 1 }}>
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
  const [tab, setTab] = useState("Overview");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [p, r, l, s] = await Promise.all([
        Provider.list(),
        ProviderReview.list(),
        LeadInquiry.list(),
        ServiceSearchStat.list(),
      ]);
      setProviders(Array.isArray(p) ? p : []);
      setReviews(Array.isArray(r) ? r : []);
      setLeads(Array.isArray(l) ? l : []);
      setStats(Array.isArray(s) ? s : []);
    } catch (e) {
      console.error("Load error:", e);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const pendingReviews = reviews.filter(r => !r.is_approved);
  const TABS = ["Overview", "Providers", "Reviews", "Leads", "Analytics", "Add Provider"];

  if (loading) return (
    <div style={{ minHeight: "100vh", background: T.parchment, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12, fontFamily: T.font }}>
      <img src={LOGO} style={{ width: 64, borderRadius: 10 }} alt="" />
      <div style={{ color: T.brownLight, fontSize: 15, fontStyle: "italic" }}>Loading dashboard...</div>
    </div>
  );

  return (
    <div style={styles.page}>
      <div style={styles.header}>
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
          <button key={t} onClick={() => setTab(t)} style={{
            padding: "10px 14px", border: "none", cursor: "pointer", whiteSpace: "nowrap",
            fontFamily: T.font, fontSize: 13, fontWeight: tab === t ? 700 : 400,
            background: tab === t ? T.cream : "transparent",
            color: tab === t ? T.brownDark : T.brownLight,
            borderBottom: tab === t ? `3px solid ${T.brown}` : "3px solid transparent",
          }}>
            {t}{t === "Reviews" && pendingReviews.length > 0 ? ` (${pendingReviews.length})` : ""}
            {t === "Leads" && leads.length > 0 ? ` (${leads.length})` : ""}
          </button>
        ))}
      </div>

      <div style={{ padding: 14, maxWidth: 800, margin: "0 auto" }}>
        {tab === "Overview" && <Overview providers={providers} reviews={reviews} leads={leads} stats={stats} />}
        {tab === "Providers" && <ProvidersTab providers={providers} setProviders={setProviders} />}
        {tab === "Reviews" && <ReviewsTab reviews={reviews} setReviews={setReviews} providers={providers} />}
        {tab === "Leads" && <LeadsTab leads={leads} providers={providers} />}
        {tab === "Analytics" && <AnalyticsTab providers={providers} reviews={reviews} leads={leads} stats={stats} />}
        {tab === "Add Provider" && <AddProviderTab onAdded={p => { setProviders(prev => [p, ...prev]); setTab("Providers"); }} />}
      </div>
    </div>
  );
}

export default function Wekcadmin() {
  const [unlocked, setUnlocked] = useState(false);
  return unlocked ? <Dashboard /> : <PinGate onUnlock={() => setUnlocked(true)} />;
}
