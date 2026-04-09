import React, { useState, useEffect } from "react";

// ── SEO Meta Tags ──────────────────────────────────────────────────────────
function useMeta({ title, description, keywords, ogTitle, ogDescription, ogImage, canonical }) {
  useEffect(() => {
    // Title
    document.title = title || "V-Hub | The Villages, FL Local Services Directory";
    const setMeta = (name, content, prop = false) => {
      const attr = prop ? "property" : "name";
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) { el = document.createElement("meta"); el.setAttribute(attr, name); document.head.appendChild(el); }
      el.setAttribute("content", content);
    };
    setMeta("description", description || "V-Hub connects The Villages, Florida residents with trusted local service providers. Search landscaping, home repair, pet care, transportation, and more.");
    setMeta("keywords", keywords || "The Villages Florida services, local service directory, home repair Villages FL, landscaping Villages Florida, V-Hub");
    setMeta("robots", "index, follow");
    setMeta("viewport", "width=device-width, initial-scale=1.0, maximum-scale=1.0");
    // Open Graph
    setMeta("og:type", "website", true);
    setMeta("og:site_name", "V-Hub", true);
    setMeta("og:title", ogTitle || title || "V-Hub | The Villages, FL Local Services", true);
    setMeta("og:description", ogDescription || description || "Find trusted local service providers in The Villages, Florida.", true);
    setMeta("og:image", ogImage || "https://media.base44.com/images/public/69d062aca815ce8e697894b1/a9af95bc3_V-Hublogo.png", true);
    // Twitter card
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", ogTitle || title || "V-Hub | The Villages, FL");
    setMeta("twitter:description", description || "Find trusted local service providers in The Villages, Florida.");
    setMeta("twitter:image", ogImage || "https://media.base44.com/images/public/69d062aca815ce8e697894b1/a9af95bc3_V-Hublogo.png");
    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]');
      if (!link) { link = document.createElement("link"); link.rel = "canonical"; document.head.appendChild(link); }
      link.href = canonical;
    }
  }, [title]);
}

import { ServiceArea, Category, Service, Provider, ProviderReview } from "@/api/entities";

const BRAND = {
  orange: "#E8431A",
  teal: "#00BFA5",
  blue: "#0077B6",
  lightBg: "#F8FFFE",
  cardBg: "#FFFFFF",
  text: "#1A1A2E",
  subtext: "#555",
};

const TABS = ["Providers", "Reviews", "Categories", "Services", "Service Areas"];

const SECTION_ORDER = [
  "Historic Side | Spanish Springs",
  "Established Villages | North of SR-466A",
  "Newer Villages | South of SR-44",
  "Eastport | Newest Development Area",
  "Family & Non-Age-Restricted Villages",
];

const SECTION_LABELS = {
  "Historic Side | Spanish Springs": "🌴 Historic Side (Spanish Springs)",
  "Established Villages | North of SR-466A": "🏡 Established Villages (North of SR-466A)",
  "Newer Villages | South of SR-44": "🌿 Newer Villages (South of SR-44)",
  "Eastport | Newest Development Area": "🌊 Eastport / Newest",
  "Family & Non-Age-Restricted Villages": "🏠 Family / Non-Age-Restricted",
};

function groupAreas(areas) {
  const groups = {};
  SECTION_ORDER.forEach(s => groups[s] = []);
  areas.forEach(a => {
    const key = a.description;
    if (groups[key]) groups[key].push(a);
    else groups[key] = [a];
  });
  return groups;
}

function getVillageName(area) {
  const parts = area.name.split("—");
  return parts.length > 1 ? parts[1].trim() : area.name;
}

const VALID_PINS = ["6185", "1357"];

function AdminPinGate({ onUnlock }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  const handleKey = (digit) => {
    const next = pin + digit;
    setPin(next);
    setError(false);
    if (next.length === 4) {
      if (VALID_PINS.includes(next)) {
        sessionStorage.setItem("vhub_admin_pin", next);
        onUnlock(next);
      } else {
        setError(true);
        setTimeout(() => { setPin(""); setError(false); }, 900);
      }
    }
  };

  const INK = "#1A0A00";
  const BROWN = "#8B4513";
  const PAPER = "#F5E8CC";

  return (
    <div style={{ minHeight: "100vh", background: "#1A0A00", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Times New Roman', Georgia, serif" }}>
      <img src="https://media.base44.com/images/public/69d062aca815ce8e697894b1/a9af95bc3_V-Hublogo.png" style={{ width: 80, height: 80, borderRadius: 12, marginBottom: 20 }} alt="V-Hub" />
      <div style={{ color: PAPER, fontSize: 22, fontWeight: 900, letterSpacing: 3, marginBottom: 4 }}>V-HUB ADMIN</div>
      <div style={{ color: "rgba(245,232,204,0.5)", fontSize: 12, marginBottom: 32, letterSpacing: 1 }}>RESTRICTED ACCESS</div>
      <div style={{ background: "#2A1500", border: `1px solid ${BROWN}`, borderRadius: 12, padding: "28px 32px", width: 220, boxSizing: "border-box" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: PAPER, textAlign: "center", marginBottom: 14, letterSpacing: 2 }}>ENTER PIN</div>
        <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 20 }}>
          {[0,1,2,3].map(i => (
            <div key={i} style={{ width: 16, height: 16, borderRadius: "50%", border: `2px solid ${BROWN}`, background: pin.length > i ? (error ? "#cc0000" : BROWN) : "transparent", transition: "background 0.15s" }} />
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
          {["1","2","3","4","5","6","7","8","9"].map(d => (
            <button key={d} onClick={() => handleKey(d)}
              style={{ padding: "12px 0", fontSize: 18, fontWeight: 700, color: PAPER, background: "#3A1A00", border: `1px solid ${BROWN}`, borderRadius: 6, cursor: "pointer", fontFamily: "'Times New Roman', serif" }}>
              {d}
            </button>
          ))}
          <button onClick={() => { setPin(p => p.slice(0,-1)); setError(false); }}
            style={{ padding: "12px 0", fontSize: 14, color: PAPER, background: "#3A1A00", border: `1px solid ${BROWN}`, borderRadius: 6, cursor: "pointer" }}>
            ⌫
          </button>
          <button onClick={() => handleKey("0")}
            style={{ padding: "12px 0", fontSize: 18, fontWeight: 700, color: PAPER, background: "#3A1A00", border: `1px solid ${BROWN}`, borderRadius: 6, cursor: "pointer", fontFamily: "'Times New Roman', serif" }}>
            0
          </button>
          <div />
        </div>
        {error && <div style={{ textAlign: "center", color: "#cc4444", fontSize: 11, marginTop: 10, fontStyle: "italic" }}>Incorrect PIN</div>}
      </div>
      <a href="/" style={{ color: "rgba(245,232,204,0.35)", fontSize: 11, marginTop: 28, textDecoration: "none" }}>← Back to V-Hub</a>
    </div>
  );
}

export default function Admin() {
  useMeta({
    title: "V-Hub Admin",
    description: "V-Hub admin panel — manage providers, categories, services, and reviews.",
    keywords: "",
    canonical: "https://v-hub-app-edf7f8e8.base44.app/Admin",
  });

  const [activeTab, setActiveTab] = useState("Providers");
  const [providers, setProviders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [areas, setAreas] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const [reviews, setReviews] = useState([]);

  // PIN gate state
  const storedPin = sessionStorage.getItem("vhub_admin_pin") || "";
  const [adminPin, setAdminPin] = useState(storedPin);
  const isUnlocked = VALID_PINS.includes(adminPin);

  const [loadError, setLoadError] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [provList, catList, svcList, areaList, revList] = await Promise.allSettled([
        Provider.list(),
        Category.list(),
        Service.list(),
        ServiceArea.list(),
        ProviderReview.list(),
      ]);
      setProviders(provList.status === "fulfilled" ? (provList.value || []) : []);
      setCategories(catList.status === "fulfilled" ? (catList.value || []) : []);
      setServices(svcList.status === "fulfilled" ? (svcList.value || []) : []);
      setAreas(areaList.status === "fulfilled" ? (areaList.value || []) : []);
      setReviews(revList.status === "fulfilled" ? (revList.value || []) : []);
    } catch (e) {
      console.error("loadAll error", e);
      setLoadError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (isUnlocked) loadAll(); }, [adminPin]);

  const openAdd = () => { setEditItem(null); setShowForm(true); };
  const openEdit = (item) => { setEditItem(item); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditItem(null); };

  const handleDelete = async (entity, id) => {
    if (!window.confirm("Are you sure you want to delete this?")) return;
    await entity.delete(id);
    loadAll();
  };

  // Show PIN gate if not unlocked
  if (!isUnlocked) {
    return <AdminPinGate onUnlock={(pin) => setAdminPin(pin)} />;
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#1A0A00", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
        <img src="https://media.base44.com/images/public/69d062aca815ce8e697894b1/a9af95bc3_V-Hublogo.png" style={{ width: 64, borderRadius: 10 }} />
        <div style={{ color: "#F5E8CC", fontSize: 16, fontFamily: "Georgia, serif" }}>Loading admin data...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: BRAND.lightBg, fontFamily: "'Segoe UI', sans-serif" }}>
      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, ${BRAND.orange}, ${BRAND.teal})`,
        padding: "20px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img src="https://media.base44.com/images/public/69d062aca815ce8e697894b1/a9af95bc3_V-Hublogo.png"
            style={{ height: 48, width: 48, borderRadius: 8 }} alt="V-Hub" />
          <div>
            <div style={{ color: "#fff", fontSize: 22, fontWeight: 800 }}>V-HUB Admin</div>
            <div style={{ color: "rgba(255,255,255,0.85)", fontSize: 13 }}>Admin · Manage Providers & Listings</div>
          </div>
        </div>
        <a href="/" style={{ color: "#fff", textDecoration: "none", background: "rgba(255,255,255,0.2)", borderRadius: 10, padding: "8px 16px", fontSize: 14, fontWeight: 600 }}>
          View Site →
        </a>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: 14, padding: "20px 24px", flexWrap: "wrap" }}>
        {[
          { label: "Providers", count: providers.length, icon: "🏢", color: BRAND.orange },
          { label: "Active", count: providers.filter(p => p.subscription_status === "active").length, icon: "✅", color: BRAND.teal },
          { label: "Trial", count: providers.filter(p => p.subscription_status === "trial").length, icon: "🕐", color: BRAND.blue },
          { label: "Villages", count: areas.length, icon: "📍", color: "#7C3AED" },
        ].map((stat) => (
          <div key={stat.label} style={{ background: "#fff", borderRadius: 14, padding: "16px 20px", boxShadow: "0 3px 12px rgba(0,0,0,0.08)", minWidth: 110, flex: 1 }}>
            <div style={{ fontSize: 24 }}>{stat.icon}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: stat.color }}>{stat.count}</div>
            <div style={{ fontSize: 14, color: BRAND.subtext }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, padding: "0 24px 16px", overflowX: "auto" }}>
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setShowForm(false); }}
            style={{
              background: activeTab === tab ? `linear-gradient(135deg, ${BRAND.orange}, ${BRAND.teal})` : "#fff",
              color: activeTab === tab ? "#fff" : BRAND.text,
              border: "none",
              borderRadius: 12,
              padding: "12px 20px",
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
              whiteSpace: "nowrap",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: "0 24px 40px" }}>
        {activeTab === "Providers" && (
          <ProvidersTab
            providers={providers}
            categories={categories}
            services={services}
            areas={areas}
            onAdd={openAdd}
            onEdit={openEdit}
            onDelete={(id) => handleDelete(Provider, id)}
            showForm={showForm}
            editItem={editItem}
            onClose={closeForm}
            onSaved={loadAll}
          />
        )}
        {activeTab === "Categories" && (
          <SimpleTab
            items={categories}
            entity={Category}
            fields={[
              { key: "name", label: "Category Name", type: "text" },
              { key: "icon", label: "Icon (emoji)", type: "text" },
              { key: "description", label: "Description", type: "text" },
              { key: "is_active", label: "Active", type: "checkbox" },
            ]}
            onSaved={loadAll}
          />
        )}
        {activeTab === "Services" && (
          <SimpleTab
            items={services}
            entity={Service}
            fields={[
              { key: "name", label: "Service Name", type: "text" },
              { key: "category_id", label: "Category", type: "select", options: categories.map(c => ({ value: c.id, label: `${c.icon || ""} ${c.name}` })) },
              { key: "is_active", label: "Active", type: "checkbox" },
            ]}
            onSaved={loadAll}
          />
        )}
        {activeTab === "Service Areas" && (
          <SimpleTab
            items={areas}
            entity={ServiceArea}
            fields={[
              { key: "name", label: "Area Name", type: "text" },
              { key: "description", label: "Section", type: "text" },
              { key: "is_active", label: "Active", type: "checkbox" },
            ]}
            onSaved={loadAll}
          />
        )}
        {activeTab === "Reviews" && (
          <ReviewsTab reviews={reviews} providers={providers} onSaved={loadAll} />
        )}
      </div>
    </div>
  );
}


// ── Reviews Tab ───────────────────────────────────────────────────────────────
function ReviewsTab({ reviews, providers, onSaved }) {
  const [filter, setFilter] = useState("pending"); // pending | approved | all

  const filtered = reviews.filter(r => {
    if (filter === "pending") return !r.is_approved;
    if (filter === "approved") return r.is_approved;
    return true;
  });

  const handleApprove = async (r) => {
    await ProviderReview.update(r.id, { is_approved: true });
    onSaved();
  };
  const handleDelete = async (r) => {
    if (!window.confirm("Delete this review?")) return;
    await ProviderReview.delete(r.id);
    onSaved();
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: BRAND.text }}>
          Reviews ({reviews.length} total · {reviews.filter(r => !r.is_approved).length} pending)
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {["pending","approved","all"].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ background: filter === f ? BRAND.orange : "#fff", color: filter === f ? "#fff" : BRAND.text, border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", textTransform: "capitalize" }}>{f}</button>
          ))}
        </div>
      </div>
      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: 40, color: BRAND.subtext, fontStyle: "italic" }}>No {filter} reviews.</div>
      )}
      {filtered.map(r => {
        const prov = providers.find(p => p.id === r.provider_id);
        return (
          <div key={r.id} style={{ background: "#fff", borderRadius: 14, padding: "16px 20px", marginBottom: 10, boxShadow: "0 2px 10px rgba(0,0,0,0.07)", borderLeft: r.is_approved ? "4px solid " + BRAND.teal : "4px solid " + BRAND.orange }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: BRAND.text }}>{r.customer_name}
                  {r.customer_village && <span style={{ fontSize: 12, color: BRAND.subtext, marginLeft: 8 }}>· 📍 {r.customer_village}</span>}
                </div>
                <div style={{ fontSize: 12, color: BRAND.teal, marginTop: 2 }}>
                  For: <strong>{prov ? prov.business_name : r.provider_id}</strong>
                  {prov?.provider_id && <span style={{ marginLeft: 6, color: "#999", fontSize: 11 }}>({prov.provider_id})</span>}
                </div>
                {r.service_used && <div style={{ fontSize: 12, color: BRAND.subtext, marginTop: 1 }}>Service: {r.service_used}</div>}
                <div style={{ fontSize: 13, color: "#B8860B", marginTop: 3 }}>{"★".repeat(r.rating || 0)} {r.rating}/5</div>
              </div>
              <span style={{ background: r.is_approved ? BRAND.teal + "20" : BRAND.orange + "20", color: r.is_approved ? BRAND.teal : BRAND.orange, borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 700, textTransform: "uppercase" }}>
                {r.is_approved ? "✅ Approved" : "⏳ Pending"}
              </span>
            </div>
            <div style={{ fontSize: 13, color: BRAND.subtext, fontStyle: "italic", margin: "10px 0 10px", lineHeight: 1.6, borderLeft: "3px solid #eee", paddingLeft: 10 }}>"{r.review_text}"</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {!r.is_approved && (
                <button onClick={() => handleApprove(r)} style={{ background: BRAND.teal, color: "#fff", border: "none", borderRadius: 8, padding: "8px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>✓ Approve & Publish</button>
              )}
              <button onClick={() => handleDelete(r)} style={{ background: "#ffeeee", color: "#c00", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Delete</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Providers Tab ────────────────────────────────────────────────────────────
function ProvidersTab({ providers, categories, services, areas, onAdd, onEdit, onDelete, showForm, editItem, onClose, onSaved }) {
  const [actionMsg, setActionMsg] = React.useState("");

  const handleSendPaymentLink = async (p) => {
    if (!p.email) { setActionMsg("❌ Provider has no email on file."); return; }
    setActionMsg("⏳ Generating payment link...");
    try {
      const res = await fetch("/functions/createCheckoutSession", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider_id: p.provider_id, provider_email: p.email, provider_name: p.owner_name, business_name: p.business_name }),
      });
      const data = await res.json();
      if (data.url) {
        // Copy to clipboard
        await navigator.clipboard.writeText(data.url).catch(() => {});
        setActionMsg("✅ Payment link copied to clipboard! Send it to " + (p.email || p.business_name));
        window.open(data.url, "_blank");
      } else {
        setActionMsg("❌ Failed to generate link.");
      }
    } catch (e) {
      setActionMsg("❌ Error: " + e.message);
    }
    setTimeout(() => setActionMsg(""), 6000);
  };

  const handleCancelSubscription = async (p) => {
    if (!p.stripe_subscription_id) { setActionMsg("❌ No active Stripe subscription found for this provider."); setTimeout(() => setActionMsg(""), 5000); return; }
    if (!window.confirm(`Cancel subscription for ${p.business_name}? They will keep access until end of billing period.`)) return;
    setActionMsg("⏳ Cancelling subscription...");
    try {
      const res = await fetch("/functions/cancelSubscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stripe_subscription_id: p.stripe_subscription_id }),
      });
      const data = await res.json();
      if (data.success) {
        await Provider.update(p.id, { subscription_status: "cancelled" });
        setActionMsg("✅ Subscription cancelled. Access ends at billing period.");
      } else {
        setActionMsg("❌ " + (data.error || "Failed to cancel."));
      }
    } catch (e) {
      setActionMsg("❌ Error: " + e.message);
    }
    setTimeout(() => setActionMsg(""), 6000);
  };

  const handleApproveProvider = async (p) => {
    if (!window.confirm(`Approve "${p.business_name}" and make them live on V-Hub?`)) return;
    setActionMsg("⏳ Approving provider...");
    try {
      const res = await fetch("/functions/approveProvider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider_record_id: p.id,
          provider_id: p.provider_id,
          business_name: p.business_name,
          owner_name: p.owner_name,
          email: p.email,
          phone: p.phone,
          services: p.services || [],
          service_areas: p.service_areas || [],
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setActionMsg(`✅ ${p.business_name} is now live on V-Hub! Confirmation email sent.`);
        onSaved();
      } else {
        setActionMsg("❌ " + (data.error || "Approval failed."));
      }
    } catch (e) {
      setActionMsg("❌ Error: " + e.message);
    }
    setTimeout(() => setActionMsg(""), 7000);
  };

  return (
    <div>
      {actionMsg && (
        <div style={{ background: actionMsg.startsWith("✅") ? "#e8f5e9" : actionMsg.startsWith("⏳") ? "#fff8e1" : "#ffebee", border: "1px solid #ccc", borderRadius: 8, padding: "10px 16px", marginBottom: 12, fontSize: 13, fontWeight: 600, color: "#333" }}>
          {actionMsg}
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: BRAND.text }}>All Providers ({providers.length})</div>
        <button onClick={onAdd} style={addBtnStyle}>+ Add Provider</button>
      </div>

      {showForm && (
        <ProviderForm
          provider={editItem}
          categories={categories}
          services={services}
          areas={areas}
          onClose={onClose}
          onSaved={onSaved}
        />
      )}

      <div>
        {providers.map((p) => {
          const cat = categories.find(c => c.id === p.category_id);
          const statusColor = p.subscription_status === "active" ? BRAND.teal : p.subscription_status === "trial" ? BRAND.orange : p.subscription_status === "pending" ? "#c0392b" : "#999";
          return (
            <div key={p.id} style={{ background: "#fff", borderRadius: 16, padding: "18px 20px", marginBottom: 12, boxShadow: "0 3px 14px rgba(0,0,0,0.08)", display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: BRAND.text }}>{p.business_name}</div>
                  {p.provider_id && <span style={{ background: "#f0f0f0", color: "#555", borderRadius: 10, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>ID: {p.provider_id}</span>}
                  <span style={{ background: `${statusColor}20`, color: statusColor, borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 700, textTransform: "uppercase" }}>
                    {p.subscription_status || "pending"}
                  </span>
                  {p.is_visible === false && <span style={{ background: "#ff000020", color: "red", borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 700 }}>Hidden</span>}
                </div>
                {cat && <div style={{ fontSize: 13, color: BRAND.teal, fontWeight: 600 }}>{cat.icon} {cat.name}</div>}
                <div style={{ fontSize: 14, color: BRAND.subtext }}>{p.phone}{p.email ? ` · ${p.email}` : ""}</div>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
                {p.subscription_status === "pending" && (
                  <button onClick={() => handleApproveProvider(p)} style={{ background: "#2e7d32", color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                    ✅ Approve &amp; Go Live
                  </button>
                )}
                {p.subscription_status !== "active" && p.subscription_status !== "pending" && (
                  <button onClick={() => handleSendPaymentLink(p)} style={{ background: BRAND.teal, color: "#fff", border: "none", borderRadius: 8, padding: "8px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                    💳 Send Payment Link
                  </button>
                )}
                {p.subscription_status === "active" && (
                  <button onClick={() => handleCancelSubscription(p)} style={{ background: "#fff3e0", color: "#e65100", border: "1px solid #e65100", borderRadius: 8, padding: "8px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                    ✕ Cancel Sub
                  </button>
                )}
                <button onClick={() => onEdit(p)} style={editBtnStyle}>Edit</button>
                <button onClick={() => onDelete(p.id)} style={deleteBtnStyle}>Delete</button>
              </div>
            </div>
          );
        })}
        {providers.length === 0 && (
          <div style={{ textAlign: "center", padding: "50px", color: BRAND.subtext, fontSize: 17 }}>
            No providers yet. Click "+ Add Provider" to get started.
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Provider Form ────────────────────────────────────────────────────────────
function ProviderForm({ provider, categories, services, areas, onClose, onSaved }) {
  const [form, setForm] = useState(provider || {
    business_name: "", owner_name: "", email: "", phone: "", website: "",
    description: "", logo_url: "", category_id: "", service_areas: [],
    services: [], subscription_status: "trial", subscription_tier: "basic",
    is_visible: true, years_in_business: "", license_number: "",
  });
  const [saving, setSaving] = useState(false);

  const groupedAreas = groupAreas(areas);

  const filteredServices = form.category_id
    ? services.filter(s => s.category_id === form.category_id)
    : services;

  const toggleArr = (key, val) => {
    setForm(prev => ({
      ...prev,
      [key]: prev[key]?.includes(val) ? prev[key].filter(x => x !== val) : [...(prev[key] || []), val]
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    if (provider?.id) {
      await Provider.update(provider.id, form);
    } else {
      await Provider.create(form);
    }
    setSaving(false);
    onSaved();
    onClose();
  };

  return (
    <div style={{ background: "#fff", borderRadius: 20, padding: "28px", boxShadow: "0 6px 24px rgba(0,0,0,0.12)", marginBottom: 24, border: `2px solid ${BRAND.teal}40` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: BRAND.text }}>{provider ? "✏️ Edit Provider" : "➕ Add New Provider"}</div>
        <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: BRAND.subtext }}>✕</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Field label="Business Name *" value={form.business_name} onChange={v => setForm({ ...form, business_name: v })} />
        <Field label="Owner Name" value={form.owner_name} onChange={v => setForm({ ...form, owner_name: v })} />
        <Field label="Phone" value={form.phone} onChange={v => setForm({ ...form, phone: v })} />
        <Field label="Email" value={form.email} onChange={v => setForm({ ...form, email: v })} />
        <Field label="Website" value={form.website} onChange={v => setForm({ ...form, website: v })} />
        <Field label="Years in Business" value={form.years_in_business} onChange={v => setForm({ ...form, years_in_business: v })} type="number" />
        <Field label="License Number" value={form.license_number} onChange={v => setForm({ ...form, license_number: v })} />
        <Field label="Logo URL" value={form.logo_url} onChange={v => setForm({ ...form, logo_url: v })} />
      </div>

      <div style={{ marginTop: 16 }}>
        <label style={labelStyle}>Description</label>
        <textarea value={form.description || ""} onChange={e => setForm({ ...form, description: e.target.value })}
          rows={3} style={{ ...inputStyle, resize: "vertical" }} placeholder="Brief description of the business..." />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 12 }}>
        <div>
          <label style={labelStyle}>Subscription Status</label>
          <select value={form.subscription_status || "trial"} onChange={e => setForm({ ...form, subscription_status: e.target.value })} style={inputStyle}>
            <option value="trial">Trial</option>
            <option value="active">Active (Paid)</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>Subscription Tier</label>
          <select value={form.subscription_tier || "basic"} onChange={e => setForm({ ...form, subscription_tier: e.target.value })} style={inputStyle}>
            <option value="basic">Basic</option>
            <option value="featured">Featured</option>
            <option value="premium">Premium</option>
          </select>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <label style={labelStyle}>Category</label>
        <select value={form.category_id || ""} onChange={e => setForm({ ...form, category_id: e.target.value, services: [] })} style={inputStyle}>
          <option value="">— Select Category —</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
        </select>
      </div>

      {/* Service Areas — macro keys, consistent with filter logic */}
      <div style={{ marginTop: 20 }}>
        <label style={labelStyle}>📍 Service Areas (select all that apply — each covers all villages within)</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {[
            { key: "historic",     label: "🌴 Historic Side" },
            { key: "established",  label: "🏡 Established Villages" },
            { key: "newer",        label: "🌿 Newer Villages" },
            { key: "eastport",     label: "🌊 Eastport" },
            { key: "family",       label: "🏠 Family Villages" },
            { key: "all villages", label: "🗺️ All Villages" },
          ].map(area => (
            <div key={area.key} onClick={() => toggleArr("service_areas", area.key)}
              style={{
                background: (form.service_areas || []).includes(area.key) ? BRAND.orange : "#f0f0f0",
                color: (form.service_areas || []).includes(area.key) ? "#fff" : BRAND.text,
                borderRadius: 20, padding: "9px 18px", cursor: "pointer", fontSize: 13, fontWeight: 600
              }}>
              {area.label}
            </div>
          ))}
        </div>
      </div>

      {/* Services */}
      {filteredServices.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <label style={labelStyle}>🛠️ Services Offered (select all that apply)</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {filteredServices.map(s => (
              <div key={s.id} onClick={() => toggleArr("services", s.name)}
                style={{
                  background: (form.services || []).includes(s.name) ? BRAND.teal : "#f0f0f0",
                  color: (form.services || []).includes(s.name) ? "#fff" : BRAND.text,
                  borderRadius: 20, padding: "8px 16px", cursor: "pointer", fontSize: 14, fontWeight: 600
                }}>
                {s.name}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Visibility */}
      <div style={{ marginTop: 18, display: "flex", alignItems: "center", gap: 10 }}>
        <input type="checkbox" id="visible" checked={form.is_visible !== false}
          onChange={e => setForm({ ...form, is_visible: e.target.checked })}
          style={{ width: 22, height: 22, cursor: "pointer" }} />
        <label htmlFor="visible" style={{ fontSize: 16, fontWeight: 600, cursor: "pointer" }}>Visible to customers</label>
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
        <button onClick={handleSave} disabled={saving || !form.business_name}
          style={{ background: `linear-gradient(135deg, ${BRAND.orange}, ${BRAND.teal})`, color: "#fff", border: "none", borderRadius: 12, padding: "14px 32px", fontSize: 17, fontWeight: 700, cursor: "pointer", opacity: saving || !form.business_name ? 0.6 : 1 }}>
          {saving ? "Saving..." : provider ? "Save Changes" : "Add Provider"}
        </button>
        <button onClick={onClose} style={{ background: "#f0f0f0", color: BRAND.text, border: "none", borderRadius: 12, padding: "14px 24px", fontSize: 17, fontWeight: 600, cursor: "pointer" }}>
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─── Simple CRUD Tab ──────────────────────────────────────────────────────────
function SimpleTab({ items, entity, fields, onSaved }) {
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const openAdd = () => { setForm({}); setEditItem(null); setShowForm(true); };
  const openEdit = (item) => { setForm({ ...item }); setEditItem(item); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditItem(null); };

  const handleSave = async () => {
    setSaving(true);
    if (editItem?.id) { await entity.update(editItem.id, form); }
    else { await entity.create(form); }
    setSaving(false);
    onSaved();
    closeForm();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this item?")) return;
    await entity.delete(id);
    onSaved();
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: BRAND.text }}>({items.length} items)</div>
        <button onClick={openAdd} style={addBtnStyle}>+ Add New</button>
      </div>

      {showForm && (
        <div style={{ background: "#fff", borderRadius: 16, padding: "24px", marginBottom: 20, boxShadow: "0 4px 16px rgba(0,0,0,0.10)", border: `2px solid ${BRAND.teal}40` }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: BRAND.text, marginBottom: 16 }}>{editItem ? "Edit Item" : "Add New Item"}</div>
          {fields.map(f => (
            <div key={f.key} style={{ marginBottom: 14 }}>
              <label style={labelStyle}>{f.label}</label>
              {f.type === "checkbox" ? (
                <input type="checkbox" checked={form[f.key] !== false} onChange={e => setForm({ ...form, [f.key]: e.target.checked })} style={{ width: 20, height: 20 }} />
              ) : f.type === "select" ? (
                <select value={form[f.key] || ""} onChange={e => setForm({ ...form, [f.key]: e.target.value })} style={inputStyle}>
                  <option value="">— Select —</option>
                  {f.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              ) : (
                <input type={f.type || "text"} value={form[f.key] || ""} onChange={e => setForm({ ...form, [f.key]: e.target.value })} style={inputStyle} />
              )}
            </div>
          ))}
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button onClick={handleSave} disabled={saving} style={{ background: `linear-gradient(135deg, ${BRAND.orange}, ${BRAND.teal})`, color: "#fff", border: "none", borderRadius: 10, padding: "12px 24px", fontSize: 16, fontWeight: 700, cursor: "pointer" }}>
              {saving ? "Saving..." : "Save"}
            </button>
            <button onClick={closeForm} style={{ background: "#f0f0f0", border: "none", borderRadius: 10, padding: "12px 20px", fontSize: 16, cursor: "pointer" }}>Cancel</button>
          </div>
        </div>
      )}

      {items.map((item) => (
        <div key={item.id} style={{ background: "#fff", borderRadius: 14, padding: "16px 18px", marginBottom: 10, boxShadow: "0 2px 10px rgba(0,0,0,0.07)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: BRAND.text }}>{item.icon ? `${item.icon} ` : ""}{getVillageName(item)}</div>
            {item.description && <div style={{ fontSize: 13, color: BRAND.subtext }}>{item.description}</div>}
            {item.is_active === false && <span style={{ color: "#999", fontSize: 12 }}>Inactive</span>}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => openEdit(item)} style={editBtnStyle}>Edit</button>
            <button onClick={() => handleDelete(item.id)} style={deleteBtnStyle}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input type={type} value={value || ""} onChange={e => onChange(e.target.value)} style={inputStyle} />
    </div>
  );
}

const labelStyle = { display: "block", fontSize: 15, fontWeight: 600, color: "#333", marginBottom: 6 };
const inputStyle = { width: "100%", padding: "12px 14px", fontSize: 15, borderRadius: 10, border: "2px solid #e0e0e0", background: "#fff", color: "#333", outline: "none", boxSizing: "border-box" };
const addBtnStyle = { background: `linear-gradient(135deg, #E8431A, #00BFA5)`, color: "#fff", border: "none", borderRadius: 12, padding: "12px 22px", fontSize: 16, fontWeight: 700, cursor: "pointer" };
const editBtnStyle = { background: "#f0f8ff", color: "#0077B6", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 14, fontWeight: 600, cursor: "pointer" };
const deleteBtnStyle = { background: "#fff0f0", color: "#E8431A", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 14, fontWeight: 600, cursor: "pointer" };
