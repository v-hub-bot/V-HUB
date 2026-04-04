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


// ── Design tokens ──────────────────────────────────────────────────────────
const INK       = "#1C0F00";
const INK_FADE  = "#5C3A10";
const PAPER     = "#F0E6C8";
const PAPER_MID = "#E4D5A8";
const PAPER_DK  = "#C8B07A";
const BROWN_BTN = "#7A4820";
const YELLOW    = "#FFDB00";
const RED_RULE  = "#8B1A1A";

// ── Service categories ─────────────────────────────────────────────────────
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

// ── Macro service areas ────────────────────────────────────────────────────
const MACRO_AREAS = [
  { key: "Historic Side",        label: "Historic Side" },
  { key: "Established Villages", label: "Established Villages" },
  { key: "Newer Villages",       label: "Newer Villages" },
  { key: "Eastport",             label: "Eastport" },
  { key: "Family Villages",      label: "Family & Non-Age-Restricted Villages" },
  { key: "All Villages",         label: "All Villages (Entire Community)" },
];

// ── Sidebar stories ────────────────────────────────────────────────────────
const LEFT_STORIES = [
  { head: "The Villages' Newest Search Engine Has Arrived", sub: "Local providers get found like never before", body: "V-Hub launched quietly last spring and has already become the go-to resource for residents hunting trusted local professionals. Unlike national platforms, every listing on V-Hub is specific to The Villages — no out-of-area results, no confusion, no middleman." },
  { head: "Why Local Discovery Matters", sub: "Neighbors trust neighbors", body: "Residents here value personal recommendations above all else. V-Hub replicates that word-of-mouth trust digitally — every provider is vetted, every listing is geo-specific, and every search leads directly to a real person in the community." },
  { head: "A Directory Built for Seniors", sub: "Simple. Fast. No apps required.", body: "Forget complicated apps or confusing websites. V-Hub is designed to be used on any device — phone, tablet, or computer — with large text, clear layouts, and no technical know-how required. Just search and call." },
];

const RIGHT_STORIES = [
  { head: "Your Listing Pays for Itself", sub: "Providers see new calls within days", body: "Businesses listed on V-Hub report an average of 3–5 new customer inquiries per week. With zero commission and direct contact from residents, your listing cost is recovered the moment your first job is booked." },
  { head: "Be Seen Where Your Customers Are Looking", sub: "Residents search V-Hub first", body: "Over 65% of Villages residents say they would prefer a local directory over a national search engine when looking for home services. Your V-Hub profile puts you exactly where that search is happening." },
  { head: "Building Community Through Commerce", sub: "Strong businesses make stronger neighborhoods", body: "V-Hub is not just a directory — it's an investment in The Villages community. When residents hire local, money stays local. Businesses grow. Neighborhoods thrive. Your listing is a step toward that stronger community." },
];

// ── Responsive hook ────────────────────────────────────────────────────────
function useIsMobile() {
  const [mobile, setMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 720 : false
  );
  useEffect(() => {
    const handler = () => setMobile(window.innerWidth < 720);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return mobile;
}

// ── Shared styles ──────────────────────────────────────────────────────────
const sectionHead = (isMobile) => ({
  fontSize: isMobile ? 12 : 11, fontWeight: 900, letterSpacing: isMobile ? 1 : 3,
  textTransform: "uppercase", color: INK,
  borderBottom: `2px solid ${INK}`, paddingBottom: 5, marginBottom: isMobile ? 14 : 12,
  fontFamily: "'Times New Roman', serif",
});
const inputStyle = (isMobile) => ({
  width: "100%", boxSizing: "border-box", background: PAPER,
  border: `1.5px solid ${PAPER_DK}`, borderRadius: 4,
  color: INK, fontFamily: "'Times New Roman', serif",
  fontSize: isMobile ? 16 : 14, // 16px prevents iOS zoom
  padding: isMobile ? "12px 14px" : "9px 12px", outline: "none",
  WebkitAppearance: "none",
});
const labelStyle = (isMobile) => ({
  fontSize: isMobile ? 12 : 11, fontWeight: 700, color: INK_FADE,
  textTransform: "uppercase", letterSpacing: 1,
  marginBottom: isMobile ? 6 : 4, display: "block",
  fontFamily: "'Times New Roman', serif",
});

// ── Sub-components ─────────────────────────────────────────────────────────
function Story({ head, sub, body, isMobile }) {
  return (
    <div style={{ marginBottom: isMobile ? 0 : 20, paddingBottom: isMobile ? 0 : 16, borderBottom: isMobile ? "none" : `1px solid ${PAPER_DK}` }}>
      <div style={{ fontSize: isMobile ? 14 : 13, fontWeight: 900, color: INK, lineHeight: 1.3, marginBottom: 2, fontFamily: "'Times New Roman', serif" }}>{head}</div>
      <div style={{ fontSize: isMobile ? 12 : 11, fontStyle: "italic", color: RED_RULE, marginBottom: 5, fontFamily: "Georgia, serif" }}>{sub}</div>
      <div style={{ fontSize: isMobile ? 13 : 12, color: INK_FADE, lineHeight: 1.65, fontFamily: "Georgia, serif" }}>{body}</div>
    </div>
  );
}

function SvcCategory({ cat, openCat, setOpenCat, selSvcs, toggleSvc, isMobile }) {
  const isOpen = openCat === cat.id;
  const count = cat.services.filter(s => selSvcs.includes(s)).length;
  return (
    <div style={{ marginBottom: 6, borderRadius: 6, overflow: "hidden", border: `1.5px solid ${PAPER_DK}` }}>
      <div
        onClick={() => setOpenCat(isOpen ? null : cat.id)}
        style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: isMobile ? "14px 16px" : "11px 14px",
          background: count > 0
            ? `linear-gradient(180deg,#9A6030,${BROWN_BTN} 60%,#5A3010)`
            : `linear-gradient(180deg,${PAPER_MID},${PAPER_DK})`,
          color: count > 0 ? PAPER : INK,
          cursor: "pointer", fontWeight: 700,
          fontSize: isMobile ? 15 : 13,
          fontFamily: "'Times New Roman', serif", letterSpacing: 0.5,
          minHeight: isMobile ? 50 : "auto",
        }}
      >
        <span>{cat.icon} {cat.name}{count > 0 ? `  ✓ ${count} selected` : ""}</span>
        <span style={{ fontSize: isMobile ? 14 : 11, flexShrink: 0, marginLeft: 8 }}>{isOpen ? "▲" : "▼"}</span>
      </div>
      {isOpen && (
        <div style={{ background: PAPER }}>
          {cat.services.map(svc => {
            const checked = selSvcs.includes(svc);
            return (
              <div
                key={svc}
                onClick={() => toggleSvc(svc)}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: isMobile ? "14px 18px" : "9px 16px",
                  cursor: "pointer",
                  background: checked ? "rgba(122,72,32,0.08)" : "transparent",
                  borderBottom: `1px solid ${PAPER_MID}`,
                  minHeight: isMobile ? 50 : "auto",
                }}
              >
                <div style={{
                  width: isMobile ? 22 : 16, height: isMobile ? 22 : 16,
                  border: `2px solid ${checked ? BROWN_BTN : PAPER_DK}`,
                  borderRadius: 4, background: checked ? BROWN_BTN : PAPER,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  {checked && <span style={{ color: PAPER, fontSize: isMobile ? 13 : 10, lineHeight: 1 }}>✓</span>}
                </div>
                <span style={{ fontSize: isMobile ? 15 : 13, color: INK, fontFamily: "Georgia, serif", lineHeight: 1.3 }}>{svc}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Burger menu ────────────────────────────────────────────────────────────
function ListBurger({ isMobile }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          background: "rgba(255,255,255,0.10)", border: `1px solid rgba(240,230,200,0.3)`,
          borderRadius: 4, width: 44, height: 44, cursor: "pointer",
          display: "flex", flexDirection: "column", gap: 5,
          justifyContent: "center", alignItems: "center", flexShrink: 0, padding: 0,
        }}
      >
        {[0,1,2].map(i => <span key={i} style={{ display: "block", width: 20, height: 2, background: PAPER, borderRadius: 1 }} />)}
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 299, background: "rgba(0,0,0,0.55)" }} />
          <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 260, background: PAPER, zIndex: 300, boxShadow: "-3px 0 20px rgba(0,0,0,0.3)", fontFamily: "'Times New Roman', serif" }}>
            <div style={{ background: INK, padding: "16px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ color: PAPER, fontWeight: 900, fontSize: 16, letterSpacing: 2 }}>🌴 V-HUB</span>
              <button onClick={() => setOpen(false)} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", borderRadius: 4, width: 28, height: 28, fontSize: 14, cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ padding: "10px 8px" }}>
              {[
                { label: "🏠 Home",               href: "/",                  highlight: false },
                { label: "📋 List Your Business",  href: "/ListService",       highlight: false },
                { label: "🗂 Provider Hub",         href: "/ProviderDashboard", highlight: true  },
              ].map((l, i) => (
                <a key={i} href={l.href} style={{ textDecoration: "none" }}>
                  <div style={{
                    padding: "13px 14px", borderRadius: 4, fontSize: 15, fontWeight: 700,
                    color: l.highlight ? PAPER : INK, marginBottom: 5,
                    background: l.highlight ? BROWN_BTN : PAPER_MID,
                    borderLeft: `4px solid ${BROWN_BTN}`,
                  }}>{l.label}</div>
                </a>
              ))}
              <div style={{ margin: "14px 6px 6px", height: 1, background: PAPER_DK }} />
              <div style={{ padding: "6px 12px", fontSize: 11, color: INK_FADE, fontStyle: "italic", fontFamily: "Georgia, serif", lineHeight: 1.6 }}>
                Already listed? Visit the <strong>Provider Hub</strong> to manage your profile, view your stats, and read your reviews.
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function ListService() {
  const isMobile = useIsMobile();

  useMeta({
    title: "List Your Business | V-Hub — The Villages, FL",
    description: "List your local service business on V-Hub and get discovered by thousands of Villages residents. Free listing review by William Evans. No commissions.",
    keywords: "list local business The Villages FL, V-Hub provider listing, Villages Florida directory, advertise services Villages",
    canonical: "https://v-hub-app-edf7f8e8.base44.app/ListService",
  });

  // Form state
  const [businessName, setBusinessName] = useState("");
  const [ownerName,    setOwnerName]    = useState("");
  const [phone,        setPhone]        = useState("");
  const [email,        setEmail]        = useState("");
  const [website,      setWebsite]      = useState("");
  const [address,      setAddress]      = useState("");
  const [description,  setDescription]  = useState("");
  const [years,        setYears]        = useState("");
  const [license,      setLicense]      = useState("");

  // Services & areas
  const [openCat,  setOpenCat]  = useState(null);
  const [selSvcs,  setSelSvcs]  = useState([]);
  const [selAreas, setSelAreas] = useState([]);
  const [areaOpen, setAreaOpen] = useState(false);

  // Submission
  const [submitted, setSubmitted] = useState(false);
  const [errors,    setErrors]    = useState({});

  const toggleSvc = (name) =>
    setSelSvcs(prev => prev.includes(name) ? prev.filter(s => s !== name) : [...prev, name]);
  const toggleArea = (key) =>
    setSelAreas(prev => prev.includes(key) ? prev.filter(a => a !== key) : [...prev, key]);

  const validate = () => {
    const e = {};
    if (!businessName.trim()) e.businessName = true;
    if (!ownerName.trim())    e.ownerName    = true;
    if (!phone.trim())        e.phone        = true;
    if (!email.trim())        e.email        = true;
    if (selSvcs.length === 0) e.svcs         = true;
    if (selAreas.length === 0) e.areas       = true;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const body = encodeURIComponent(
      `Hi William,\n\nI'd like to list my business on V-Hub.\n\n` +
      `Business Name: ${businessName}\nOwner / Contact: ${ownerName}\n` +
      `Phone: ${phone}\nEmail: ${email}\nWebsite: ${website || "N/A"}\n` +
      `Address: ${address || "N/A"}\nYears in Business: ${years || "N/A"}\n` +
      `License #: ${license || "N/A"}\n\nAbout:\n${description || "N/A"}\n\n` +
      `Services:\n${selSvcs.join(", ")}\n\nAreas:\n${selAreas.join(", ")}\n\nThank you!`
    );
    window.location.href = `mailto:william@v-hub.com?subject=V-Hub Listing — ${businessName}&body=${body}`;
    setSubmitted(true);
  };

  const errBox = (key, msg) => errors[key]
    ? <div style={{ color: RED_RULE, fontSize: 11, fontStyle: "italic", marginTop: 3 }}>⚠ {msg}</div>
    : null;

  const inS = inputStyle(isMobile);
  const lbS = labelStyle(isMobile);
  const shS = sectionHead(isMobile);

  // ── Thank-you screen ────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div style={{ minHeight: "100vh", background: PAPER, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Times New Roman', serif", padding: 20 }}>
        <div style={{ textAlign: "center", maxWidth: 460 }}>
          <div style={{ fontSize: 52, marginBottom: 14 }}>📬</div>
          <div style={{ fontSize: isMobile ? 20 : 24, fontWeight: 900, color: INK, textTransform: "uppercase", letterSpacing: 2 }}>Listing Request Sent!</div>
          <div style={{ height: 2, background: INK, margin: "10px auto", width: 120, opacity: 0.25 }} />
          <div style={{ fontSize: isMobile ? 15 : 14, color: INK_FADE, fontStyle: "italic", marginBottom: 28, lineHeight: 1.7 }}>
            William Evans will review your information and reach out to complete your V-Hub listing. Welcome to the community!
          </div>
          <a href="/" style={{ textDecoration: "none" }}>
            <button style={{ background: BROWN_BTN, color: PAPER, border: "none", borderRadius: 5, padding: isMobile ? "15px 36px" : "13px 32px", fontSize: isMobile ? 15 : 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Times New Roman', serif", letterSpacing: 2, textTransform: "uppercase" }}>
              ← Back to Home
            </button>
          </a>
        </div>
      </div>
    );
  }

  // ── MOBILE LAYOUT ────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <div style={{
        minHeight: "100vh", background: PAPER,
        backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 27px,rgba(28,15,0,0.035) 27px,rgba(28,15,0,0.035) 28px)",
        fontFamily: "'Times New Roman', Georgia, serif",
      }}>
        {/* Header */}
        <div style={{ background: INK, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
          <a href="/" style={{ textDecoration: "none" }}>
            <button style={{ background: "rgba(255,255,255,0.10)", border: `1.5px solid ${PAPER_DK}`, color: PAPER, borderRadius: 6, padding: "9px 16px", fontSize: 14, cursor: "pointer", fontFamily: "'Times New Roman', serif", fontWeight: 700 }}>← Home</button>
          </a>
          <div style={{ color: PAPER, fontSize: 22, fontWeight: 900, fontFamily: "'Times New Roman', serif", letterSpacing: 1 }}>🌴 V-Hub</div>
          <ListBurger isMobile={isMobile} />
        </div>

        {/* Masthead */}
        <div style={{ textAlign: "center", padding: "20px 16px 14px", borderBottom: `3px double ${INK}` }}>
          <div style={{ fontSize: 10, letterSpacing: 4, textTransform: "uppercase", color: INK_FADE, fontStyle: "italic", marginBottom: 3 }}>The Villages, Florida · Provider Directory</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: INK, letterSpacing: 2, textTransform: "uppercase", lineHeight: 1.1 }}>List Your Business</div>
          <div style={{ height: 2, background: RED_RULE, margin: "10px auto", width: "50%" }} />
          <div style={{ fontSize: 13, color: INK_FADE, fontStyle: "italic", lineHeight: 1.6 }}>
            Complete the form below — William Evans will review and activate your listing.
          </div>
          <div style={{ fontSize: 11, color: INK_FADE, fontStyle: "italic", marginTop: 3 }}>You may return and edit your profile at any time.</div>
        </div>

        {/* Error banner */}
        {Object.keys(errors).length > 0 && (
          <div style={{ background: "#7A0000", color: "#FFE8E8", padding: "12px 16px", textAlign: "center", fontSize: 13, fontStyle: "italic" }}>
            ⚠ Please fill in the required fields below before submitting.
          </div>
        )}

        {/* ── Mobile Why V-Hub strip ── */}
        <div style={{ background: PAPER_MID, borderBottom: `1px solid ${PAPER_DK}`, padding: "14px 18px" }}>
          <div style={{ fontSize: 11, fontWeight: 900, color: INK, textTransform: "uppercase", letterSpacing: 2, marginBottom: 10, borderBottom: `2px solid ${INK}`, paddingBottom: 5 }}>Why List on V-Hub?</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {LEFT_STORIES.map((s, i) => <Story key={i} {...s} isMobile={true} />)}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14 }}>
            {[
              ["59", "Villages"],
              ["9",  "Categories"],
              ["62", "Services"],
              ["#1", "Directory"],
            ].map(([num, label]) => (
              <div key={label} style={{ textAlign: "center", background: PAPER, border: `1.5px solid ${PAPER_DK}`, borderRadius: 6, padding: "10px 8px" }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: BROWN_BTN, fontFamily: "'Times New Roman', serif" }}>{num}</div>
                <div style={{ fontSize: 10, color: INK_FADE, textTransform: "uppercase", letterSpacing: 1, fontStyle: "italic" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Mobile Form ── */}
        <div style={{ padding: "20px 16px 80px" }}>

          {/* Section 1 */}
          <div style={{ marginBottom: 28 }}>
            <div style={shS}>Section 1 — Business Information</div>

            {/* Single-column fields on mobile */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ ...lbS, color: errors.businessName ? RED_RULE : INK_FADE }}>Business Name *</label>
                <input style={{ ...inS, borderColor: errors.businessName ? RED_RULE : PAPER_DK }} value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="e.g. Sunshine Landscaping" />
                {errBox("businessName", "Required")}
              </div>
              <div>
                <label style={{ ...lbS, color: errors.ownerName ? RED_RULE : INK_FADE }}>Owner / Contact Name *</label>
                <input style={{ ...inS, borderColor: errors.ownerName ? RED_RULE : PAPER_DK }} value={ownerName} onChange={e => setOwnerName(e.target.value)} placeholder="Your full name" />
                {errBox("ownerName", "Required")}
              </div>
              <div>
                <label style={{ ...lbS, color: errors.phone ? RED_RULE : INK_FADE }}>Phone Number *</label>
                <input style={{ ...inS, borderColor: errors.phone ? RED_RULE : PAPER_DK }} value={phone} onChange={e => setPhone(e.target.value)} placeholder="(352) 555-0000" type="tel" />
                {errBox("phone", "Required")}
              </div>
              <div>
                <label style={{ ...lbS, color: errors.email ? RED_RULE : INK_FADE }}>Email Address *</label>
                <input style={{ ...inS, borderColor: errors.email ? RED_RULE : PAPER_DK }} value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" type="email" />
                {errBox("email", "Required")}
              </div>
              <div>
                <label style={lbS}>Website / Social Media URL</label>
                <input style={inS} value={website} onChange={e => setWebsite(e.target.value)} placeholder="www.yourbusiness.com" />
              </div>
              <div>
                <label style={lbS}>Business Address</label>
                <input style={inS} value={address} onChange={e => setAddress(e.target.value)} placeholder="Street, City, FL ZIP" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
                <div>
                  <label style={lbS}>Years in Business</label>
                  <input style={inS} value={years} onChange={e => setYears(e.target.value)} placeholder="e.g. 8" type="number" min="0" />
                </div>
                <div>
                  <label style={lbS}>License #</label>
                  <input style={inS} value={license} onChange={e => setLicense(e.target.value)} placeholder="Optional" />
                </div>
              </div>
              <div>
                <label style={lbS}>About Your Business</label>
                <textarea
                  style={{ ...inS, resize: "vertical", minHeight: 100, lineHeight: 1.6 }}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Tell residents what makes your business special — experience, specialties, values..."
                />
              </div>
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: INK, opacity: 0.12, margin: "0 0 24px" }} />

          {/* Section 2 — Services */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ ...shS, color: errors.svcs ? RED_RULE : INK, borderBottomColor: errors.svcs ? RED_RULE : INK }}>
              Section 2 — Services You Offer *
            </div>
            <div style={{ fontSize: 13, color: INK_FADE, fontStyle: "italic", marginBottom: 14, lineHeight: 1.5 }}>
              Tap a category to expand it, then check every service that applies. Select as many as you like.
            </div>
            {selSvcs.length > 0 && (
              <div style={{ background: PAPER_MID, border: `1px solid ${PAPER_DK}`, borderRadius: 6, padding: "10px 14px", marginBottom: 12, fontSize: 13, color: INK_FADE }}>
                <strong style={{ color: INK }}>Selected ({selSvcs.length}):</strong> {selSvcs.join(" · ")}
              </div>
            )}
            {errBox("svcs", "Please select at least one service")}
            <div style={{ marginTop: 10 }}>
              {CATS.map(cat => (
                <SvcCategory key={cat.id} cat={cat}
                  openCat={openCat} setOpenCat={setOpenCat}
                  selSvcs={selSvcs} toggleSvc={toggleSvc}
                  isMobile={true}
                />
              ))}
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: INK, opacity: 0.12, margin: "0 0 24px" }} />

          {/* Section 3 — Areas */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ ...shS, color: errors.areas ? RED_RULE : INK, borderBottomColor: errors.areas ? RED_RULE : INK }}>
              Section 3 — Areas You Serve *
            </div>
            <div style={{ fontSize: 13, color: INK_FADE, fontStyle: "italic", marginBottom: 14, lineHeight: 1.5 }}>
              Select every major area where you're available. Customers searching these areas will find you.
            </div>
            {errBox("areas", "Please select at least one area")}
            <div style={{ border: `1.5px solid ${errors.areas ? RED_RULE : PAPER_DK}`, borderRadius: 6, overflow: "hidden", marginTop: 10 }}>
              <div
                onClick={() => setAreaOpen(!areaOpen)}
                style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "14px 16px", cursor: "pointer",
                  background: selAreas.length > 0 ? `linear-gradient(180deg,#9A6030,${BROWN_BTN})` : `linear-gradient(180deg,${PAPER_MID},${PAPER_DK})`,
                  color: selAreas.length > 0 ? PAPER : INK,
                  fontWeight: 700, fontSize: 15, fontFamily: "'Times New Roman', serif",
                  minHeight: 54,
                }}
              >
                <span>{selAreas.length === 0 ? "📍 Select areas you serve..." : `📍 ${selAreas.length} area${selAreas.length > 1 ? "s" : ""} selected`}</span>
                <span style={{ fontSize: 14 }}>{areaOpen ? "▲" : "▼"}</span>
              </div>
              {areaOpen && MACRO_AREAS.map(area => {
                const checked = selAreas.includes(area.key);
                return (
                  <div key={area.key} onClick={() => toggleArea(area.key)}
                    style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", cursor: "pointer", background: checked ? "rgba(122,72,32,0.09)" : PAPER, borderBottom: `1px solid ${PAPER_MID}`, minHeight: 54 }}>
                    <div style={{ width: 24, height: 24, border: `2px solid ${checked ? BROWN_BTN : PAPER_DK}`, borderRadius: 4, background: checked ? BROWN_BTN : PAPER, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {checked && <span style={{ color: PAPER, fontSize: 14 }}>✓</span>}
                    </div>
                    <span style={{ fontSize: 15, color: INK, fontFamily: "'Times New Roman', serif", lineHeight: 1.3 }}>{area.label}</span>
                  </div>
                );
              })}
            </div>
            {selAreas.length > 0 && (
              <div style={{ background: PAPER_MID, border: `1px solid ${PAPER_DK}`, borderRadius: 6, padding: "10px 14px", marginTop: 10, fontSize: 13, color: INK_FADE }}>
                <strong style={{ color: INK }}>Serving:</strong> {selAreas.join(" · ")}
              </div>
            )}
          </div>

          {/* ── Mobile success story strip ── */}
          <div style={{ background: PAPER_MID, border: `1.5px solid ${PAPER_DK}`, borderRadius: 8, padding: "16px 16px", marginBottom: 28 }}>
            <div style={{ fontSize: 11, fontWeight: 900, color: INK, textTransform: "uppercase", letterSpacing: 2, marginBottom: 12, borderBottom: `2px solid ${INK}`, paddingBottom: 5 }}>Provider Success Stories</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {RIGHT_STORIES.map((s, i) => <Story key={i} {...s} isMobile={true} />)}
            </div>
            <div style={{ marginTop: 16, borderTop: `1px solid ${PAPER_DK}`, paddingTop: 14, textAlign: "center" }}>
              <div style={{ fontSize: 13, fontWeight: 900, color: INK, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>Questions?</div>
              <a href="mailto:william@v-hub.com" style={{ textDecoration: "none" }}>
                <div style={{ background: BROWN_BTN, color: PAPER, borderRadius: 6, padding: "11px 16px", fontSize: 14, fontWeight: 700, fontFamily: "'Times New Roman', serif", letterSpacing: 1 }}>
                  william@v-hub.com
                </div>
              </a>
            </div>
          </div>

          {/* Submit */}
          <div style={{ borderTop: `2px solid ${INK}`, paddingTop: 22, textAlign: "center" }}>
            <div style={{ fontSize: 13, color: INK_FADE, fontStyle: "italic", marginBottom: 16, lineHeight: 1.6 }}>
              By submitting, you agree to be listed in V-Hub's public directory.<br />
              William Evans will contact you to confirm and activate your profile.
            </div>
            <button
              onClick={handleSubmit}
              style={{
                width: "100%",
                background: `linear-gradient(180deg,#9A6030,${BROWN_BTN} 60%,#5A3010)`,
                color: PAPER, border: `3px solid ${YELLOW}`,
                boxShadow: `0 0 0 1.5px ${YELLOW}, 0 0 14px 4px rgba(255,220,0,0.3)`,
                borderRadius: 8, padding: "18px 20px",
                fontSize: 17, fontWeight: 900, cursor: "pointer",
                fontFamily: "'Times New Roman', serif", letterSpacing: 2, textTransform: "uppercase",
              }}
            >
              Submit My Listing →
            </button>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", padding: "14px 16px", borderTop: `2px double ${INK}`, fontSize: 11, color: INK_FADE, fontStyle: "italic", background: PAPER }}>
          © V-Hub · The Villages, Florida · <a href="/" style={{ color: INK_FADE }}>Home</a>
        </div>
      </div>
    );
  }

  // ── DESKTOP LAYOUT ───────────────────────────────────────────────────────
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
        <div style={{ color: PAPER, fontSize: 24, fontWeight: 900, fontFamily: "'Times New Roman', serif", letterSpacing: 1, display: "flex", alignItems: "center", gap: 8 }}>
          🌴 <span style={{ fontSize: 26 }}>V</span>-Hub
        </div>
        <ListBurger isMobile={false} />
      </div>

      {/* Masthead */}
      <div style={{ textAlign: "center", padding: "18px 20px 14px", background: PAPER, borderBottom: `3px double ${INK}` }}>
        <div style={{ fontSize: 10, letterSpacing: 5, textTransform: "uppercase", color: INK_FADE, fontStyle: "italic", marginBottom: 2 }}>The Villages, Florida · Provider Directory</div>
        <div style={{ fontSize: 32, fontWeight: 900, color: INK, letterSpacing: 3, textTransform: "uppercase", lineHeight: 1 }}>List Your Business</div>
        <div style={{ height: 2, background: RED_RULE, margin: "8px auto", width: "60%", maxWidth: 320 }} />
        <div style={{ fontSize: 13, color: INK_FADE, fontStyle: "italic", lineHeight: 1.6 }}>
          Complete the form below — William Evans will review and activate your listing.
        </div>
        <div style={{ fontSize: 11, color: INK_FADE, fontStyle: "italic", marginTop: 3 }}>You may return and edit your profile at any time.</div>
      </div>

      {/* Error banner */}
      {Object.keys(errors).length > 0 && (
        <div style={{ background: "#7A0000", color: "#FFE8E8", padding: "10px 20px", textAlign: "center", fontSize: 13, fontStyle: "italic" }}>
          ⚠ Please fill in the required fields highlighted below before submitting.
        </div>
      )}

      {/* Three-column layout */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,2.4fr) minmax(0,1fr)", gap: 0, maxWidth: 1100, margin: "0 auto", padding: "0 0 60px" }}>

        {/* LEFT SIDEBAR */}
        <div style={{ padding: "22px 18px 20px 20px", borderRight: `1px solid ${PAPER_DK}` }}>
          <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: 3, textTransform: "uppercase", color: INK, borderBottom: `2px solid ${INK}`, paddingBottom: 4, marginBottom: 10, textAlign: "center" }}>Why List on V-Hub?</div>
          {LEFT_STORIES.map((s, i) => (
            <div key={i} style={{ marginBottom: 20, paddingBottom: 16, borderBottom: `1px solid ${PAPER_DK}` }}>
              <div style={{ fontSize: 13, fontWeight: 900, color: INK, lineHeight: 1.3, marginBottom: 2 }}>{s.head}</div>
              <div style={{ fontSize: 11, fontStyle: "italic", color: RED_RULE, marginBottom: 6 }}>{s.sub}</div>
              <div style={{ fontSize: 12, color: INK_FADE, lineHeight: 1.65 }}>{s.body}</div>
            </div>
          ))}
          <div style={{ border: `2px solid ${BROWN_BTN}`, borderRadius: 4, padding: "12px 10px", textAlign: "center", background: PAPER_MID }}>
            <div style={{ fontSize: 14, fontWeight: 900, color: BROWN_BTN, marginBottom: 4 }}>🏆 Verified Provider</div>
            <div style={{ fontSize: 11, color: INK_FADE, fontStyle: "italic", lineHeight: 1.5 }}>All V-Hub listings are manually reviewed by William Evans before going live.</div>
          </div>
        </div>

        {/* MAIN FORM */}
        <div style={{ padding: "22px 24px 20px", borderRight: `1px solid ${PAPER_DK}` }}>

          {/* Section 1 */}
          <div style={{ marginBottom: 26 }}>
            <div style={shS}>Section 1 — Business Information</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 16px", marginBottom: 12 }}>
              {[
                ["businessName", "Business Name *",             "text",  "e.g. Sunshine Landscaping", setBusinessName, businessName],
                ["ownerName",    "Owner / Contact Name *",       "text",  "Your full name",            setOwnerName,    ownerName],
                ["phone",        "Phone Number *",               "tel",   "(352) 555-0000",             setPhone,        phone],
                ["email",        "Email Address *",              "email", "you@example.com",            setEmail,        email],
                ["website",      "Website / Social Media URL",   "text",  "www.yourbusiness.com",       setWebsite,      website],
                ["address",      "Business Address",             "text",  "Street, City, FL ZIP",       setAddress,      address],
                ["years",        "Years in Business",            "number","e.g. 8",                    setYears,        years],
                ["license",      "License / Certification #",    "text",  "Optional",                   setLicense,      license],
              ].map(([key, lbl, type, ph, setter, val]) => (
                <div key={key}>
                  <label style={{ ...lbS, color: errors[key] ? RED_RULE : INK_FADE }}>{lbl}</label>
                  <input style={{ ...inS, borderColor: errors[key] ? RED_RULE : PAPER_DK }} type={type} placeholder={ph} value={val} onChange={e => setter(e.target.value)} />
                  {errBox(key, "Required")}
                </div>
              ))}
            </div>
            <div>
              <label style={lbS}>About Your Business</label>
              <textarea style={{ ...inS, resize: "vertical", minHeight: 90, lineHeight: 1.6 }} value={description} onChange={e => setDescription(e.target.value)} placeholder="Tell residents what makes your business special..." />
            </div>
          </div>

          <div style={{ height: 1, background: INK, opacity: 0.15, margin: "6px 0 24px" }} />

          {/* Section 2 */}
          <div style={{ marginBottom: 26 }}>
            <div style={{ ...shS, color: errors.svcs ? RED_RULE : INK, borderBottomColor: errors.svcs ? RED_RULE : INK }}>Section 2 — Services You Offer *</div>
            <div style={{ fontSize: 12, color: INK_FADE, fontStyle: "italic", marginBottom: 12 }}>Click a category to expand it, then check every service that applies. Select as many as you like.</div>
            {selSvcs.length > 0 && (
              <div style={{ background: PAPER_MID, border: `1px solid ${PAPER_DK}`, borderRadius: 5, padding: "8px 12px", marginBottom: 10, fontSize: 12, color: INK_FADE }}>
                <strong style={{ color: INK }}>Selected ({selSvcs.length}):</strong> {selSvcs.join(" · ")}
              </div>
            )}
            {errBox("svcs", "Please select at least one service")}
            <div style={{ marginTop: 8 }}>
              {CATS.map(cat => (
                <SvcCategory key={cat.id} cat={cat}
                  openCat={openCat} setOpenCat={setOpenCat}
                  selSvcs={selSvcs} toggleSvc={toggleSvc}
                  isMobile={false}
                />
              ))}
            </div>
          </div>

          <div style={{ height: 1, background: INK, opacity: 0.15, margin: "6px 0 24px" }} />

          {/* Section 3 */}
          <div style={{ marginBottom: 30 }}>
            <div style={{ ...shS, color: errors.areas ? RED_RULE : INK, borderBottomColor: errors.areas ? RED_RULE : INK }}>Section 3 — Areas You Serve *</div>
            <div style={{ fontSize: 12, color: INK_FADE, fontStyle: "italic", marginBottom: 12 }}>Select every major area of The Villages where you're available.</div>
            {errBox("areas", "Please select at least one service area")}
            <div style={{ border: `1.5px solid ${errors.areas ? RED_RULE : PAPER_DK}`, borderRadius: 5, overflow: "hidden", marginTop: 8, background: PAPER }}>
              <div onClick={() => setAreaOpen(!areaOpen)} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 14px", cursor: "pointer",
                background: selAreas.length > 0 ? `linear-gradient(180deg,#9A6030,${BROWN_BTN})` : `linear-gradient(180deg,${PAPER_MID},${PAPER_DK})`,
                color: selAreas.length > 0 ? PAPER : INK, fontWeight: 700, fontSize: 13, fontFamily: "'Times New Roman', serif",
              }}>
                <span>{selAreas.length === 0 ? "📍 Select areas you serve..." : `📍 ${selAreas.length} area${selAreas.length > 1 ? "s" : ""} selected`}</span>
                <span style={{ fontSize: 11 }}>{areaOpen ? "▲" : "▼"}</span>
              </div>
              {areaOpen && MACRO_AREAS.map(area => {
                const checked = selAreas.includes(area.key);
                return (
                  <div key={area.key} onClick={() => toggleArea(area.key)}
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

          {/* Submit */}
          <div style={{ borderTop: `2px solid ${INK}`, paddingTop: 20, textAlign: "center" }}>
            <div style={{ fontSize: 12, color: INK_FADE, fontStyle: "italic", marginBottom: 14, lineHeight: 1.6 }}>
              By submitting, you agree to be listed in V-Hub's public directory.<br />
              William Evans will contact you to confirm and activate your profile.
            </div>
            <button onClick={handleSubmit} style={{
              background: `linear-gradient(180deg,#9A6030,${BROWN_BTN} 60%,#5A3010)`,
              color: PAPER, border: `3px solid ${YELLOW}`,
              boxShadow: `0 0 0 1.5px ${YELLOW}, 0 0 12px 3px rgba(255,220,0,0.3)`,
              borderRadius: 6, padding: "15px 48px",
              fontSize: 15, fontWeight: 900, cursor: "pointer",
              fontFamily: "'Times New Roman', serif", letterSpacing: 3, textTransform: "uppercase",
            }}>
              Submit My Listing →
            </button>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div style={{ padding: "22px 20px 20px 18px" }}>
          <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: 3, textTransform: "uppercase", color: INK, borderBottom: `2px solid ${INK}`, paddingBottom: 4, marginBottom: 10, textAlign: "center" }}>Provider Success Stories</div>
          {RIGHT_STORIES.map((s, i) => (
            <div key={i} style={{ marginBottom: 20, paddingBottom: 16, borderBottom: `1px solid ${PAPER_DK}` }}>
              <div style={{ fontSize: 13, fontWeight: 900, color: INK, lineHeight: 1.3, marginBottom: 2 }}>{s.head}</div>
              <div style={{ fontSize: 11, fontStyle: "italic", color: RED_RULE, marginBottom: 6 }}>{s.sub}</div>
              <div style={{ fontSize: 12, color: INK_FADE, lineHeight: 1.65 }}>{s.body}</div>
            </div>
          ))}
          <div style={{ border: `2px solid ${BROWN_BTN}`, borderRadius: 4, padding: "14px 12px", textAlign: "center", background: PAPER_MID, marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 900, color: INK, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>Questions?</div>
            <div style={{ fontSize: 12, color: INK_FADE, fontStyle: "italic", lineHeight: 1.6, marginBottom: 8 }}>Contact William Evans directly.</div>
            <a href="mailto:william@v-hub.com" style={{ textDecoration: "none" }}>
              <div style={{ background: BROWN_BTN, color: PAPER, borderRadius: 4, padding: "8px 12px", fontSize: 12, fontWeight: 700, fontFamily: "'Times New Roman', serif", letterSpacing: 1 }}>william@v-hub.com</div>
            </a>
          </div>
          <div style={{ margin: "16px 0", textAlign: "center", color: PAPER_DK, fontSize: 16 }}>✦ ✦ ✦</div>
          <div style={{ border: `1.5px solid ${PAPER_DK}`, borderRadius: 4, padding: "12px 10px", background: PAPER }}>
            <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: 3, textTransform: "uppercase", color: INK, borderBottom: `2px solid ${INK}`, paddingBottom: 4, marginBottom: 10, textAlign: "center" }}>V-Hub By the Numbers</div>
            {[["59","Villages Covered"],["9","Service Categories"],["62","Searchable Services"],["#1","Local Directory"]].map(([num, label]) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "5px 0", borderBottom: `1px solid ${PAPER_MID}` }}>
                <span style={{ fontSize: 20, fontWeight: 900, color: BROWN_BTN, fontFamily: "'Times New Roman', serif" }}>{num}</span>
                <span style={{ fontSize: 11, color: INK_FADE, fontStyle: "italic" }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: "center", padding: "14px 20px", borderTop: `2px double ${INK}`, fontSize: 11, color: INK_FADE, fontStyle: "italic", background: PAPER }}>
        © V-Hub · The Villages, Florida · A community-first directory · <a href="/" style={{ color: INK_FADE }}>Home</a>
      </div>
    </div>
  );
}
