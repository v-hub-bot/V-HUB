import { useState, useEffect } from "react";

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

import { Provider, ProviderReview, ServiceSearchStat } from "@/api/entities";

// ── Design tokens (newspaper palette) ────────────────────────────────────────
const INK       = "#1C0F00";
const INK_FADE  = "#5C3A10";
const PAPER     = "#F0E6C8";
const PAPER_MID = "#E4D5A8";
const PAPER_DK  = "#C8B07A";
const BROWN_BTN = "#7A4820";
const YELLOW    = "#FFDB00";
const RED_RULE  = "#8B1A1A";
const GREEN     = "#1A6B3C";
const TEAL      = "#00836B";

// ── Service categories (full list hardcoded for the form) ─────────────────────
const CATS = [
  { id: "c1", name: "Home Services", icon: "🏠", services: [
    "Home Improvements","General Repairs","Cleaning Services (Home & Pool)","Painting (Interior/Exterior)",
    "Garage Door Services","Window Installation/Repair","HVAC","Plumbing","Roofing",
  ]},
  { id: "c2", name: "Home Systems & Utilities", icon: "💡", services: [
    "Handyman Services","Security & Home Watch","Pest Control","Appliance Repair",
    "Electrical & Lighting","Flooring (Tile, Wood, Carpet)","Home Organization","Smart Home Installation","Pool & Spa Services",
  ]},
  { id: "c3", name: "Yard & Outdoor", icon: "🌿", services: [
    "Lawn Mowing","Sod Installation","Tree Trimming & Pruning/Removal","Lawn Fertilization",
    "Irrigation/Sprinkler Services","Landscaping","Hardscaping","Pressure Washing","Driveway Repair/Cleaning/Painting",
  ]},
  { id: "c4", name: "Golf Cart Services", icon: "⛳", services: [
    "Rentals","Repairs","Detailing","Lighting Upgrades","Improvements/Customizations","Battery Replacement","Tire Services",
  ]},
  { id: "c5", name: "Automobile Services", icon: "🚗", services: [
    "Auto Repairs","Auto Detailing","Oil Changes","Tire Services","Mobile Mechanic",
  ]},
  { id: "c6", name: "Personal Care", icon: "💆", services: [
    "Hair Stylists","Nail Technicians","Spa Services","Home Health Aides","Massage Therapists","Personal Trainers","Makeup Artists",
  ]},
  { id: "c7", name: "Pet Services", icon: "🐾", services: [
    "Veterinary Services","Grooming","Pet Sitting/Walking","Pet Training","Mobile Grooming",
  ]},
  { id: "c8", name: "Transportation", icon: "🚐", services: [
    "Medical Transport","Airport Transport","Local Rides","Errand Services","Courier/Delivery Services",
  ]},
  { id: "c9", name: "Professional Services", icon: "💼", services: [
    "Accounting & Bookkeeping","Notary Services","IT Support","Legal Services","Business Consulting","Tax Preparation",
  ]},
];

const MACRO_AREAS = [
  { key: "Historic Side",        label: "Historic Side" },
  { key: "Established Villages", label: "Established Villages" },
  { key: "Newer Villages",       label: "Newer Villages" },
  { key: "Eastport",             label: "Eastport" },
  { key: "Family Villages",      label: "Family & Non-Age-Restricted Villages" },
  { key: "All Villages",         label: "All Villages (Entire Community)" },
];

// ── Shared styles ─────────────────────────────────────────────────────────────
const sectionHead = {
  fontSize: 11, fontWeight: 900, letterSpacing: 3, textTransform: "uppercase",
  color: INK, borderBottom: `2px solid ${INK}`, paddingBottom: 4, marginBottom: 12,
  fontFamily: "'Times New Roman', serif",
};
const inputStyle = {
  width: "100%", boxSizing: "border-box", background: PAPER,
  border: `1.5px solid ${PAPER_DK}`, borderRadius: 4,
  color: INK, fontFamily: "'Times New Roman', serif", fontSize: 14,
  padding: "9px 12px", outline: "none",
};
const labelStyle = {
  fontSize: 11, fontWeight: 700, color: INK_FADE, textTransform: "uppercase",
  letterSpacing: 1, marginBottom: 4, display: "block", fontFamily: "'Times New Roman', serif",
};

// ── Star display ──────────────────────────────────────────────────────────────
function Stars({ rating, size = 14 }) {
  const full = Math.floor(rating || 0);
  const half = (rating || 0) - full >= 0.5;
  return (
    <span style={{ fontSize: size, color: "#B8860B", letterSpacing: 1 }}>
      {"★".repeat(full)}{half ? "½" : ""}{"☆".repeat(5 - full - (half ? 1 : 0))}
    </span>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ icon, value, label, sub, color }) {
  return (
    <div style={{
      background: PAPER_MID, border: `1.5px solid ${PAPER_DK}`, borderRadius: 6,
      padding: "14px 16px", textAlign: "center", flex: 1, minWidth: 110,
    }}>
      <div style={{ fontSize: 22 }}>{icon}</div>
      <div style={{ fontSize: 28, fontWeight: 900, color: color || BROWN_BTN, fontFamily: "'Times New Roman', serif", lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: 11, fontWeight: 700, color: INK, textTransform: "uppercase", letterSpacing: 1, marginTop: 2 }}>{label}</div>
      {sub && <div style={{ fontSize: 10, color: INK_FADE, fontStyle: "italic", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

// ── Services accordion for profile edit ──────────────────────────────────────
function SvcAccordion({ selSvcs, setSelSvcs }) {
  const [openCat, setOpenCat] = useState(null);
  const toggle = (name) =>
    setSelSvcs(prev => prev.includes(name) ? prev.filter(s => s !== name) : [...prev, name]);
  return (
    <div>
      {CATS.map(cat => {
        const isOpen = openCat === cat.id;
        const count = cat.services.filter(s => selSvcs.includes(s)).length;
        return (
          <div key={cat.id} style={{ marginBottom: 4, borderRadius: 5, overflow: "hidden", border: `1.5px solid ${PAPER_DK}` }}>
            <div onClick={() => setOpenCat(isOpen ? null : cat.id)} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "10px 13px",
              background: count > 0 ? `linear-gradient(180deg,#9A6030,${BROWN_BTN})` : `linear-gradient(180deg,${PAPER_MID},${PAPER_DK})`,
              color: count > 0 ? PAPER : INK,
              cursor: "pointer", fontWeight: 700, fontSize: 13, fontFamily: "'Times New Roman', serif",
            }}>
              <span>{cat.icon} {cat.name}{count > 0 ? `  ✓ ${count}` : ""}</span>
              <span style={{ fontSize: 11 }}>{isOpen ? "▲" : "▼"}</span>
            </div>
            {isOpen && (
              <div style={{ background: PAPER }}>
                {cat.services.map(svc => {
                  const checked = selSvcs.includes(svc);
                  return (
                    <div key={svc} onClick={() => toggle(svc)} style={{
                      display: "flex", alignItems: "center", gap: 10, padding: "9px 16px",
                      cursor: "pointer", background: checked ? "rgba(122,72,32,0.08)" : "transparent",
                      borderBottom: `1px solid ${PAPER_MID}`,
                    }}>
                      <div style={{
                        width: 16, height: 16, border: `2px solid ${checked ? BROWN_BTN : PAPER_DK}`,
                        borderRadius: 3, background: checked ? BROWN_BTN : PAPER,
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                      }}>
                        {checked && <span style={{ color: PAPER, fontSize: 10, lineHeight: 1 }}>✓</span>}
                      </div>
                      <span style={{ fontSize: 13, color: INK, fontFamily: "Georgia, serif" }}>{svc}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function ProviderDashboard() {
  useMeta({
    title: "Provider Hub | V-Hub — The Villages, FL",
    description: "V-Hub Provider Hub — manage your business listing, view your search stats, read customer reviews, and update your profile at any time.",
    keywords: "V-Hub provider dashboard, manage listing Villages FL, provider hub, business directory management",
    canonical: "https://v-hub-app-edf7f8e8.base44.app/ProviderDashboard",
  });

  const [view, setView]           = useState("lookup"); // lookup | dashboard | edit
  const [lookupId, setLookupId]   = useState("");
  const [lookupErr, setLookupErr] = useState("");
  const [provider, setProvider]   = useState(null);
  const [reviews, setReviews]     = useState([]);
  const [saving, setSaving]       = useState(false);
  const [saveMsg, setSaveMsg]     = useState("");

  // Edit form state
  const [form, setForm] = useState({});
  const [selSvcs, setSelSvcs]   = useState([]);
  const [selAreas, setSelAreas] = useState([]);
  const [areaOpen, setAreaOpen] = useState(false);

  // New review state
  const [reviewForm, setReviewForm] = useState({ customer_name: "", customer_village: "", rating: 5, review_text: "", service_used: "" });
  const [reviewSaved, setReviewSaved] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const loadProvider = async (prov) => {
    setProvider(prov);
    // Load reviews
    try {
      const all = await ProviderReview.filter({ provider_id: prov.id });
      setReviews(all.filter(r => r.is_approved));
    } catch(e) { setReviews([]); }
    // Seed form
    setForm({
      business_name:  prov.business_name  || "",
      owner_name:     prov.owner_name     || "",
      phone:          prov.phone          || "",
      email:          prov.email          || "",
      website:        prov.website        || "",
      address:        prov.address        || "",
      description:    prov.description    || "",
      years_in_business: prov.years_in_business || "",
      license_number: prov.license_number || "",
      google_review_url: prov.google_review_url || "",
    });
    setSelSvcs(prov.services   || []);
    setSelAreas(prov.service_areas || []);
    setView("dashboard");
  };

  const handleLookup = async () => {
    setLookupErr("");
    const q = lookupId.trim().toUpperCase();
    if (!q) { setLookupErr("Enter your Provider ID."); return; }
    try {
      const results = await Provider.filter({ provider_id: q });
      if (results.length === 0) {
        setLookupErr("No provider found with that ID. Contact Admin if you need help.");
        return;
      }
      loadProvider(results[0]);
    } catch(e) {
      setLookupErr("Error looking up your ID. Please try again.");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await Provider.update(provider.id, {
        ...form,
        services: selSvcs,
        service_areas: selAreas,
      });
      setSaveMsg("✓ Profile updated successfully!");
      setTimeout(() => setSaveMsg(""), 4000);
      // Reload provider
      const fresh = await Provider.get(provider.id);
      setProvider(fresh);
      setView("dashboard");
    } catch(e) {
      setSaveMsg("⚠ Error saving. Please try again.");
    }
    setSaving(false);
  };

  const handleReviewSubmit = async () => {
    if (!reviewForm.customer_name || !reviewForm.review_text) return;
    await ProviderReview.create({
      ...reviewForm,
      provider_id: provider.id,
      is_approved: false, // admin approves first
      helpful_count: 0,
    });
    setReviewSaved(true);
    setShowReviewForm(false);
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : null;

  // ── LOOKUP VIEW ──────────────────────────────────────────────────────────────
  if (view === "lookup") {
    return (
      <div style={{
        minHeight: "100vh", background: PAPER,
        backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 27px,rgba(28,15,0,0.035) 27px,rgba(28,15,0,0.035) 28px)",
        fontFamily: "'Times New Roman', Georgia, serif",
      }}>
        {/* Header */}
        <div style={{ background: INK, padding: "10px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
          <a href="/" style={{ textDecoration: "none" }}>
            <button style={{ background: "rgba(255,255,255,0.10)", border: `1.5px solid ${PAPER_DK}`, color: PAPER, borderRadius: 6, padding: "7px 16px", fontSize: 13, cursor: "pointer", fontFamily: "'Times New Roman', serif", fontWeight: 700 }}>← Home</button>
          </a>
          <div style={{ color: PAPER, fontSize: 22, fontWeight: 900, fontFamily: "'Times New Roman', serif", letterSpacing: 1 }}>🌴 V-Hub</div>
          <div style={{ width: 80 }} />
        </div>

        {/* Masthead */}
        <div style={{ textAlign: "center", padding: "24px 20px 18px", borderBottom: `3px double ${INK}` }}>
          <div style={{ fontSize: 10, letterSpacing: 5, textTransform: "uppercase", color: INK_FADE, fontStyle: "italic", marginBottom: 2 }}>The Villages, Florida</div>
          <div style={{ fontSize: 30, fontWeight: 900, color: INK, letterSpacing: 3, textTransform: "uppercase" }}>Provider Hub</div>
          <div style={{ height: 2, background: RED_RULE, margin: "8px auto", width: 200 }} />
          <div style={{ fontSize: 13, color: INK_FADE, fontStyle: "italic" }}>Manage your listing · View your stats · Read your reviews</div>
        </div>

        {/* Lookup box */}
        <div style={{ maxWidth: 480, margin: "40px auto", padding: "0 20px" }}>
          <div style={{ background: PAPER_MID, border: `2px solid ${PAPER_DK}`, borderRadius: 8, padding: "28px 28px 24px", textAlign: "center" }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>🔐</div>
            <div style={{ fontSize: 16, fontWeight: 900, color: INK, textTransform: "uppercase", letterSpacing: 2, marginBottom: 6 }}>Provider Sign-In</div>
            <div style={{ fontSize: 12, color: INK_FADE, fontStyle: "italic", marginBottom: 20, lineHeight: 1.6 }}>
              Enter your V-Hub Provider ID to access your dashboard.<br />
              Your ID was assigned by Admin when your listing was activated.<br />
              <span style={{ fontWeight: 700 }}>Format: VH-XXXXX</span>
            </div>
            <input
              value={lookupId}
              onChange={e => setLookupId(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === "Enter" && handleLookup()}
              placeholder="e.g. VH-00142"
              style={{ ...inputStyle, textAlign: "center", fontSize: 18, fontWeight: 700, letterSpacing: 3, marginBottom: 12, border: `2px solid ${PAPER_DK}` }}
            />
            {lookupErr && <div style={{ color: RED_RULE, fontSize: 12, fontStyle: "italic", marginBottom: 10 }}>⚠ {lookupErr}</div>}
            <button onClick={handleLookup} style={{
              background: `linear-gradient(180deg,#9A6030,${BROWN_BTN} 60%,#5A3010)`,
              color: PAPER, border: `3px solid ${YELLOW}`,
              boxShadow: `0 0 0 1.5px ${YELLOW}, 0 0 10px 2px rgba(255,220,0,0.25)`,
              borderRadius: 6, padding: "13px 36px",
              fontSize: 14, fontWeight: 900, cursor: "pointer",
              fontFamily: "'Times New Roman', serif", letterSpacing: 2, textTransform: "uppercase",
            }}>
              Access My Dashboard →
            </button>
            <div style={{ marginTop: 18, fontSize: 11, color: INK_FADE, fontStyle: "italic" }}>
              Don't have a Provider ID?{" "}
              <a href="/ListService" style={{ color: BROWN_BTN, fontWeight: 700 }}>List your business</a> and an admin will assign you one.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── DASHBOARD VIEW ────────────────────────────────────────────────────────────
  if (view === "dashboard") {
    return (
      <div style={{
        minHeight: "100vh", background: PAPER,
        backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 27px,rgba(28,15,0,0.035) 27px,rgba(28,15,0,0.035) 28px)",
        fontFamily: "'Times New Roman', Georgia, serif",
      }}>
        {/* Header */}
        <div style={{ background: INK, padding: "10px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
          <a href="/" style={{ textDecoration: "none" }}>
            <button style={{ background: "rgba(255,255,255,0.10)", border: `1.5px solid ${PAPER_DK}`, color: PAPER, borderRadius: 6, padding: "7px 14px", fontSize: 13, cursor: "pointer", fontFamily: "'Times New Roman', serif", fontWeight: 700 }}>← Home</button>
          </a>
          <div style={{ color: PAPER, fontSize: 20, fontWeight: 900, fontFamily: "'Times New Roman', serif", letterSpacing: 1 }}>🌴 Provider Hub</div>
          <button onClick={() => setView("edit")} style={{
            background: `linear-gradient(180deg,#9A6030,${BROWN_BTN})`,
            color: PAPER, border: `2px solid ${YELLOW}`,
            borderRadius: 6, padding: "7px 14px", fontSize: 12,
            cursor: "pointer", fontFamily: "'Times New Roman', serif", fontWeight: 700, letterSpacing: 1,
          }}>✏ Edit Profile</button>
        </div>

        {/* Masthead */}
        <div style={{ textAlign: "center", padding: "16px 20px 12px", borderBottom: `3px double ${INK}` }}>
          <div style={{ fontSize: 9, letterSpacing: 5, textTransform: "uppercase", color: INK_FADE, fontStyle: "italic", marginBottom: 2 }}>Provider Dashboard</div>
          <div style={{ fontSize: 26, fontWeight: 900, color: INK }}>{provider.business_name}</div>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, marginTop: 4, flexWrap: "wrap" }}>
            <span style={{ background: BROWN_BTN, color: PAPER, borderRadius: 20, padding: "3px 14px", fontSize: 12, fontWeight: 700, fontFamily: "'Times New Roman', serif", letterSpacing: 1 }}>
              ID: {provider.provider_id}
            </span>
            <span style={{ fontSize: 12, color: INK_FADE, fontStyle: "italic" }}>
              {provider.subscription_status === "active" ? "✅ Active Listing" : "🕐 " + (provider.subscription_status || "Pending")}
            </span>
          </div>
          {saveMsg && <div style={{ marginTop: 8, fontSize: 13, color: saveMsg.startsWith("✓") ? GREEN : RED_RULE, fontStyle: "italic" }}>{saveMsg}</div>}
        </div>

        <div style={{ maxWidth: 900, margin: "0 auto", padding: "20px 16px 60px" }}>

          {/* ── Stats row ── */}
          <div style={{ ...sectionHead }}>Your Performance</div>
          <div style={{ display: "flex", gap: 10, marginBottom: 28, flexWrap: "wrap" }}>
            <StatCard icon="👁" value={provider.profile_views || 0} label="Profile Views" sub="Total customer clicks" color={TEAL} />
            <StatCard icon="🔍" value={provider.search_appearances || 0} label="Search Appearances" sub="Times shown in results" color={BROWN_BTN} />
            <StatCard icon="⭐" value={avgRating ? `${avgRating}/5` : "—"} label="V-Hub Rating" sub={reviews.length > 0 ? `${reviews.length} review${reviews.length > 1 ? "s" : ""}` : "No reviews yet"} color={avgRating >= 4 ? GREEN : RED_RULE} />
            <StatCard icon="📋" value={reviews.length} label="Reviews" sub="Approved V-Hub reviews" color="#6B3010" />
          </div>

          {/* ── Profile summary ── */}
          <div style={{ ...sectionHead }}>Your Listing Profile</div>
          <div style={{ background: PAPER_MID, border: `1.5px solid ${PAPER_DK}`, borderRadius: 6, padding: "16px 18px", marginBottom: 28 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 20px" }}>
              {[
                ["👤 Owner",       provider.owner_name],
                ["📞 Phone",       provider.phone],
                ["✉️ Email",       provider.email],
                ["🌐 Website",     provider.website],
                ["📍 Address",     provider.address],
                ["📅 Years in Biz",provider.years_in_business ? `${provider.years_in_business} yrs` : null],
                ["🏷 License #",   provider.license_number],
              ].filter(([,v]) => v).map(([label, value]) => (
                <div key={label} style={{ fontSize: 13, color: INK }}>
                  <span style={{ fontWeight: 700 }}>{label}: </span>
                  {label.includes("Website")
                    ? <a href={value} target="_blank" rel="noreferrer" style={{ color: "#1A3F70" }}>{value}</a>
                    : value}
                </div>
              ))}
            </div>
            {provider.description && (
              <div style={{ marginTop: 12, fontSize: 13, color: INK_FADE, fontStyle: "italic", lineHeight: 1.7, borderTop: `1px solid ${PAPER_DK}`, paddingTop: 10 }}>
                {provider.description}
              </div>
            )}
          </div>

          {/* ── Services ── */}
          <div style={{ ...sectionHead }}>Services You Offer</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 28 }}>
            {(provider.services || []).length === 0
              ? <div style={{ fontSize: 12, color: INK_FADE, fontStyle: "italic" }}>No services listed yet. Edit your profile to add them.</div>
              : (provider.services || []).map(s => (
                  <span key={s} style={{ background: BROWN_BTN, color: PAPER, borderRadius: 20, padding: "4px 12px", fontSize: 12, fontFamily: "'Times New Roman', serif" }}>{s}</span>
                ))
            }
          </div>

          {/* ── Areas ── */}
          <div style={{ ...sectionHead }}>Areas You Serve</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 28 }}>
            {(provider.service_areas || []).length === 0
              ? <div style={{ fontSize: 12, color: INK_FADE, fontStyle: "italic" }}>No service areas listed yet.</div>
              : (provider.service_areas || []).map(a => {
                  const found = MACRO_AREAS.find(m => m.key === a);
                  return (
                    <span key={a} style={{ background: TEAL, color: "#fff", borderRadius: 20, padding: "4px 12px", fontSize: 12, fontFamily: "'Times New Roman', serif" }}>
                      📍 {found ? found.label : a}
                    </span>
                  );
                })
            }
          </div>

          {/* ── Reviews ── */}
          <div style={{ ...sectionHead }}>
            V-Hub Community Reviews
            {!showReviewForm && !reviewSaved && (
              <button onClick={() => setShowReviewForm(true)} style={{ float: "right", background: BROWN_BTN, color: PAPER, border: "none", borderRadius: 4, padding: "4px 12px", fontSize: 11, cursor: "pointer", fontFamily: "'Times New Roman', serif", fontWeight: 700, letterSpacing: 1 }}>
                + Leave a Review
              </button>
            )}
          </div>

          {/* Review submission form */}
          {showReviewForm && (
            <div style={{ background: PAPER_MID, border: `1.5px solid ${PAPER_DK}`, borderRadius: 6, padding: "16px 18px", marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 900, color: INK, marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>Write a V-Hub Review</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 16px", marginBottom: 10 }}>
                <div>
                  <label style={labelStyle}>Your Name *</label>
                  <input style={inputStyle} value={reviewForm.customer_name} onChange={e => setReviewForm(p => ({ ...p, customer_name: e.target.value }))} placeholder="First & Last" />
                </div>
                <div>
                  <label style={labelStyle}>Your Village</label>
                  <input style={inputStyle} value={reviewForm.customer_village} onChange={e => setReviewForm(p => ({ ...p, customer_village: e.target.value }))} placeholder="e.g. Buttonwood" />
                </div>
                <div>
                  <label style={labelStyle}>Service Used</label>
                  <input style={inputStyle} value={reviewForm.service_used} onChange={e => setReviewForm(p => ({ ...p, service_used: e.target.value }))} placeholder="e.g. Lawn Mowing" />
                </div>
                <div>
                  <label style={labelStyle}>Rating</label>
                  <select style={inputStyle} value={reviewForm.rating} onChange={e => setReviewForm(p => ({ ...p, rating: parseInt(e.target.value) }))}>
                    {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Star{n > 1 ? "s" : ""} — {"★".repeat(n)}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={labelStyle}>Your Review *</label>
                <textarea style={{ ...inputStyle, minHeight: 80, resize: "vertical", lineHeight: 1.6 }}
                  value={reviewForm.review_text}
                  onChange={e => setReviewForm(p => ({ ...p, review_text: e.target.value }))}
                  placeholder="Tell other residents about your experience with this provider..." />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={handleReviewSubmit} style={{ background: `linear-gradient(180deg,#9A6030,${BROWN_BTN})`, color: PAPER, border: `2px solid ${YELLOW}`, borderRadius: 5, padding: "10px 24px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Times New Roman', serif", letterSpacing: 1 }}>
                  Submit Review
                </button>
                <button onClick={() => setShowReviewForm(false)} style={{ background: PAPER, border: `1.5px solid ${PAPER_DK}`, color: INK_FADE, borderRadius: 5, padding: "10px 18px", fontSize: 13, cursor: "pointer", fontFamily: "'Times New Roman', serif" }}>
                  Cancel
                </button>
              </div>
              <div style={{ fontSize: 11, color: INK_FADE, fontStyle: "italic", marginTop: 8 }}>Reviews are reviewed by Admin before appearing publicly.</div>
            </div>
          )}

          {reviewSaved && (
            <div style={{ background: "#E8F5E9", border: `1.5px solid ${GREEN}`, borderRadius: 6, padding: "12px 16px", marginBottom: 16, fontSize: 13, color: GREEN, fontStyle: "italic" }}>
              ✓ Thank you! Your review has been submitted and will appear after approval.
            </div>
          )}

          {/* V-Hub reviews */}
          {reviews.length === 0 && !showReviewForm && !reviewSaved && (
            <div style={{ fontSize: 13, color: INK_FADE, fontStyle: "italic", marginBottom: 20, padding: "12px 0" }}>
              No V-Hub reviews yet — be the first Villages resident to leave one!
            </div>
          )}

          {reviews.map(r => (
            <div key={r.id} style={{ background: PAPER_MID, border: `1.5px solid ${PAPER_DK}`, borderRadius: 6, padding: "14px 16px", marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                <div>
                  <span style={{ fontSize: 14, fontWeight: 900, color: INK }}>{r.customer_name}</span>
                  {r.customer_village && <span style={{ fontSize: 12, color: INK_FADE, fontStyle: "italic", marginLeft: 8 }}>📍 {r.customer_village}</span>}
                </div>
                <Stars rating={r.rating} size={15} />
              </div>
              {r.service_used && <div style={{ fontSize: 11, color: TEAL, fontWeight: 700, marginBottom: 5, textTransform: "uppercase", letterSpacing: 1 }}>Service: {r.service_used}</div>}
              <div style={{ fontSize: 13, color: INK_FADE, fontStyle: "italic", lineHeight: 1.7 }}>&ldquo;{r.review_text}&rdquo;</div>
              <div style={{ fontSize: 10, color: INK_FADE, marginTop: 6 }}>
                {new Date(r.created_date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} · V-Hub Verified Review
              </div>
            </div>
          ))}

          {/* Google Reviews CTA */}
          {provider.google_review_url && (
            <div style={{ marginTop: 10, marginBottom: 20 }}>
              <div style={{ height: 1, background: INK, opacity: 0.15, margin: "4px 0 16px" }} />
              <div style={{ fontSize: 11, fontWeight: 900, color: INK_FADE, textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>Google Reviews</div>
              <a href={provider.google_review_url} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#fff", border: `1.5px solid #DADCE0`, borderRadius: 8, padding: "12px 16px", cursor: "pointer" }}>
                  <div style={{ fontSize: 24 }}>
                    <svg width="24" height="24" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#1C0F00" }}>See {provider.business_name} on Google</div>
                    <div style={{ fontSize: 11, color: "#5C3A10", fontStyle: "italic" }}>Read Google reviews from across the web →</div>
                  </div>
                </div>
              </a>
            </div>
          )}

          {/* Edit CTA */}
          <div style={{ textAlign: "center", marginTop: 20, paddingTop: 16, borderTop: `2px solid ${INK}`, opacity: 0.2 + 0.8 }}>
            <button onClick={() => setView("edit")} style={{
              background: `linear-gradient(180deg,#9A6030,${BROWN_BTN} 60%,#5A3010)`,
              color: PAPER, border: `3px solid ${YELLOW}`,
              boxShadow: `0 0 0 1.5px ${YELLOW}, 0 0 12px 3px rgba(255,220,0,0.25)`,
              borderRadius: 6, padding: "13px 40px",
              fontSize: 14, fontWeight: 900, cursor: "pointer",
              fontFamily: "'Times New Roman', serif", letterSpacing: 2, textTransform: "uppercase",
            }}>
              ✏ Edit My Profile →
            </button>
          </div>

          {/* Danger Zone — Delete Account */}
          <div style={{ marginTop: 40, borderTop: `1px solid rgba(139,26,26,0.3)`, paddingTop: 20 }}>
            <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: 3, textTransform: "uppercase", color: RED_RULE, marginBottom: 12, fontFamily: "'Times New Roman', serif" }}>
              ⚠ Danger Zone
            </div>
            <div style={{ background: "#FFF5F5", border: `1.5px solid rgba(139,26,26,0.25)`, borderRadius: 8, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: INK, fontFamily: "'Times New Roman', serif" }}>Delete My Account</div>
                <div style={{ fontSize: 11, color: INK_FADE, fontStyle: "italic", marginTop: 3 }}>Permanently removes your listing from V-Hub. This cannot be undone.</div>
              </div>
              <button onClick={async () => {
                if (!window.confirm("Are you sure you want to permanently delete your V-Hub listing? This cannot be undone.")) return;
                if (!window.confirm("Last warning: your listing, stats, and reviews will all be removed. Continue?")) return;
                try {
                  await Provider.delete(provider.id);
                  setProvider(null);
                  setView("lookup");
                  alert("Your account has been deleted. Sorry to see you go!");
                } catch(e) {
                  alert("Error deleting account. Please contact Admin for help.");
                }
              }} style={{
                background: RED_RULE, color: "#fff", border: "none", borderRadius: 6,
                padding: "10px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer",
                fontFamily: "'Times New Roman', serif", letterSpacing: 1,
              }}>
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── EDIT VIEW ─────────────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: "100vh", background: PAPER,
      backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 27px,rgba(28,15,0,0.035) 27px,rgba(28,15,0,0.035) 28px)",
      fontFamily: "'Times New Roman', Georgia, serif",
    }}>
      {/* Header */}
      <div style={{ background: INK, padding: "10px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <button onClick={() => setView("dashboard")} style={{ background: "rgba(255,255,255,0.10)", border: `1.5px solid ${PAPER_DK}`, color: PAPER, borderRadius: 6, padding: "7px 14px", fontSize: 13, cursor: "pointer", fontFamily: "'Times New Roman', serif", fontWeight: 700 }}>
          ← Dashboard
        </button>
        <div style={{ color: PAPER, fontSize: 18, fontWeight: 900, fontFamily: "'Times New Roman', serif" }}>✏ Edit Profile</div>
        <button onClick={handleSave} disabled={saving} style={{
          background: saving ? PAPER_DK : `linear-gradient(180deg,#9A6030,${BROWN_BTN})`,
          color: PAPER, border: `2px solid ${YELLOW}`,
          borderRadius: 6, padding: "7px 18px", fontSize: 13,
          cursor: saving ? "not-allowed" : "pointer",
          fontFamily: "'Times New Roman', serif", fontWeight: 700, letterSpacing: 1,
        }}>
          {saving ? "Saving…" : "Save ✓"}
        </button>
      </div>

      {/* Masthead */}
      <div style={{ textAlign: "center", padding: "14px 20px 10px", borderBottom: `3px double ${INK}` }}>
        <div style={{ fontSize: 22, fontWeight: 900, color: INK }}>{provider.business_name}</div>
        <div style={{ fontSize: 11, color: INK_FADE, fontStyle: "italic", marginTop: 2 }}>
          Provider ID: <strong>{provider.provider_id}</strong> · Edit and save any time
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "22px 16px 60px" }}>

        {/* ── Section 1: Business Info ── */}
        <div style={{ marginBottom: 28 }}>
          <div style={sectionHead}>Section 1 — Business Information</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 16px" }}>
            {[
              ["business_name",    "Business Name *",              "text",  "Sunshine Landscaping"],
              ["owner_name",       "Owner / Contact Name",         "text",  "Your full name"],
              ["phone",            "Phone Number",                 "tel",   "(352) 555-0000"],
              ["email",            "Email Address",                "email", "you@example.com"],
              ["website",          "Website / Social Media URL",   "text",  "www.yourbusiness.com"],
              ["address",          "Business Address",             "text",  "Street, City, FL ZIP"],
              ["years_in_business","Years in Business",            "number","e.g. 8"],
              ["license_number",   "License / Certification #",    "text",  "Optional"],
              ["google_review_url","Google Reviews URL",           "text",  "https://g.page/your-business/review"],
            ].map(([key, lbl, type, ph]) => (
              <div key={key} style={key === "google_review_url" ? { gridColumn: "1 / -1" } : {}}>
                <label style={labelStyle}>{lbl}</label>
                <input
                  style={inputStyle} type={type} placeholder={ph}
                  value={form[key] || ""}
                  onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                />
                {key === "google_review_url" && (
                  <div style={{ fontSize: 10, color: INK_FADE, fontStyle: "italic", marginTop: 3 }}>
                    Paste your Google Business review link — it will appear below your V-Hub reviews so customers can also check Google.
                  </div>
                )}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12 }}>
            <label style={labelStyle}>About Your Business</label>
            <textarea style={{ ...inputStyle, resize: "vertical", minHeight: 90, lineHeight: 1.6 }}
              value={form.description || ""}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Tell residents what makes your business special..." />
          </div>
        </div>

        {/* ── Section 2: Services ── */}
        <div style={{ marginBottom: 28 }}>
          <div style={sectionHead}>Section 2 — Services You Offer</div>
          <div style={{ fontSize: 12, color: INK_FADE, fontStyle: "italic", marginBottom: 12 }}>
            Click a category to expand, then check every service that applies. Add or remove at any time.
          </div>
          {selSvcs.length > 0 && (
            <div style={{ background: PAPER_MID, border: `1px solid ${PAPER_DK}`, borderRadius: 5, padding: "8px 12px", marginBottom: 10, fontSize: 12, color: INK_FADE }}>
              <strong style={{ color: INK }}>Selected ({selSvcs.length}):</strong> {selSvcs.join(" · ")}
            </div>
          )}
          <SvcAccordion selSvcs={selSvcs} setSelSvcs={setSelSvcs} />
        </div>

        {/* ── Section 3: Areas ── */}
        <div style={{ marginBottom: 32 }}>
          <div style={sectionHead}>Section 3 — Areas You Serve</div>
          <div style={{ fontSize: 12, color: INK_FADE, fontStyle: "italic", marginBottom: 12 }}>
            Select the major areas of The Villages where you're available. Customers searching these areas will find you.
          </div>
          <div style={{ border: `1.5px solid ${PAPER_DK}`, borderRadius: 5, overflow: "hidden", background: PAPER }}>
            <div onClick={() => setAreaOpen(!areaOpen)} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 14px",
              background: selAreas.length > 0 ? `linear-gradient(180deg,#9A6030,${BROWN_BTN})` : `linear-gradient(180deg,${PAPER_MID},${PAPER_DK})`,
              color: selAreas.length > 0 ? PAPER : INK,
              cursor: "pointer", fontWeight: 700, fontSize: 13, fontFamily: "'Times New Roman', serif",
            }}>
              <span>{selAreas.length === 0 ? "📍 Select areas..." : `📍 ${selAreas.length} area${selAreas.length > 1 ? "s" : ""} selected`}</span>
              <span style={{ fontSize: 11 }}>{areaOpen ? "▲" : "▼"}</span>
            </div>
            {areaOpen && MACRO_AREAS.map(area => {
              const checked = selAreas.includes(area.key);
              return (
                <div key={area.key} onClick={() => setSelAreas(p => p.includes(area.key) ? p.filter(a => a !== area.key) : [...p, area.key])}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", cursor: "pointer", background: checked ? "rgba(122,72,32,0.09)" : "transparent", borderBottom: `1px solid ${PAPER_MID}` }}>
                  <div style={{ width: 18, height: 18, border: `2px solid ${checked ? BROWN_BTN : PAPER_DK}`, borderRadius: 3, background: checked ? BROWN_BTN : PAPER, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {checked && <span style={{ color: PAPER, fontSize: 12 }}>✓</span>}
                  </div>
                  <span style={{ fontSize: 13, color: INK, fontFamily: "'Times New Roman', serif" }}>{area.label}</span>
                </div>
              );
            })}
          </div>
          {selAreas.length > 0 && (
            <div style={{ background: PAPER_MID, border: `1px solid ${PAPER_DK}`, borderRadius: 5, padding: "8px 12px", marginTop: 8, fontSize: 12, color: INK_FADE }}>
              <strong style={{ color: INK }}>Serving:</strong> {selAreas.join(" · ")}
            </div>
          )}
        </div>

        {/* Save */}
        <div style={{ textAlign: "center", borderTop: `2px solid ${INK}`, paddingTop: 20 }}>
          {saveMsg && <div style={{ fontSize: 13, color: saveMsg.startsWith("✓") ? GREEN : RED_RULE, fontStyle: "italic", marginBottom: 12 }}>{saveMsg}</div>}
          <button onClick={handleSave} disabled={saving} style={{
            background: saving ? PAPER_DK : `linear-gradient(180deg,#9A6030,${BROWN_BTN} 60%,#5A3010)`,
            color: PAPER, border: `3px solid ${YELLOW}`,
            boxShadow: `0 0 0 1.5px ${YELLOW}, 0 0 12px 3px rgba(255,220,0,0.3)`,
            borderRadius: 6, padding: "14px 48px",
            fontSize: 15, fontWeight: 900, cursor: saving ? "not-allowed" : "pointer",
            fontFamily: "'Times New Roman', serif", letterSpacing: 3, textTransform: "uppercase",
          }}>
            {saving ? "Saving…" : "Save Changes →"}
          </button>
          <div style={{ fontSize: 11, color: INK_FADE, fontStyle: "italic", marginTop: 8 }}>Changes go live immediately on your V-Hub listing.</div>
        </div>
      </div>
    </div>
  );
}
