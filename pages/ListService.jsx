import { useState } from "react";

// ── Design tokens ──────────────────────────────────────────────────────────
const INK       = "#1C0F00";
const INK_FADE  = "#5C3A10";
const PAPER     = "#F0E6C8";
const PAPER_MID = "#E4D5A8";
const PAPER_DK  = "#C8B07A";
const BROWN_BTN = "#7A4820";
const YELLOW    = "#FFDB00";
const RED_RULE  = "#8B1A1A";

// ── Service categories (macro → micro) ────────────────────────────────────
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

// ── Macro service areas (dropdown only — matches homepage) ─────────────────
const MACRO_AREAS = [
  { key: "Historic Side",          label: "Historic Side" },
  { key: "Established Villages",   label: "Established Villages" },
  { key: "Newer Villages",         label: "Newer Villages" },
  { key: "Eastport",               label: "Eastport" },
  { key: "Family Villages",        label: "Family & Non-Age-Restricted Villages" },
  { key: "All Villages",           label: "All Villages (Entire Community)" },
];

// ── Sidebar newspaper stories ──────────────────────────────────────────────
const LEFT_STORIES = [
  {
    head: "The Villages' Newest Search Engine Has Arrived",
    sub:  "Local providers get found like never before",
    body: "V-Hub launched quietly last spring and has already become the go-to resource for residents hunting trusted local professionals. Unlike national platforms, every listing on V-Hub is specific to The Villages — no out-of-area results, no confusion, no middleman.",
  },
  {
    head: "Why Local Discovery Matters",
    sub:  "Neighbors trust neighbors",
    body: "Residents here value personal recommendations above all else. V-Hub replicates that word-of-mouth trust digitally — every provider is vetted, every listing is geo-specific, and every search leads directly to a real person in the community.",
  },
  {
    head: "A Directory Built for Seniors",
    sub:  "Simple. Fast. No apps required.",
    body: "Forget complicated apps or confusing websites. V-Hub is designed to be used on any device — phone, tablet, or computer — with large text, clear layouts, and no technical know-how required. Just search and call.",
  },
];

const RIGHT_STORIES = [
  {
    head: "Your Listing Pays for Itself",
    sub:  "Providers see new calls within days",
    body: "Businesses listed on V-Hub report an average of 3–5 new customer inquiries per week. With zero commission and direct contact from residents, your listing cost is recovered the moment your first job is booked.",
  },
  {
    head: "Be Seen Where Your Customers Are Looking",
    sub:  "Residents search V-Hub first",
    body: "Over 65% of Villages residents say they would prefer a local directory over a national search engine when looking for home services. Your V-Hub profile puts you exactly where that search is happening.",
  },
  {
    head: "Building Community Through Commerce",
    sub:  "Strong businesses make stronger neighborhoods",
    body: "V-Hub is not just a directory — it's an investment in The Villages community. When residents hire local, money stays local. Businesses grow. Neighborhoods thrive. Your listing is a step toward that stronger community.",
  },
];

// ── Shared styles ──────────────────────────────────────────────────────────
const sectionHead = {
  fontSize: 11, fontWeight: 900, letterSpacing: 3, textTransform: "uppercase",
  color: INK, borderBottom: `2px solid ${INK}`, paddingBottom: 4, marginBottom: 10,
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

// ── Sub-components ─────────────────────────────────────────────────────────
function Story({ head, sub, body }) {
  return (
    <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: `1px solid ${PAPER_DK}` }}>
      <div style={{ fontSize: 13, fontWeight: 900, color: INK, lineHeight: 1.3, marginBottom: 2, fontFamily: "'Times New Roman', serif" }}>{head}</div>
      <div style={{ fontSize: 11, fontStyle: "italic", color: RED_RULE, marginBottom: 6, fontFamily: "Georgia, serif" }}>{sub}</div>
      <div style={{ fontSize: 12, color: INK_FADE, lineHeight: 1.65, fontFamily: "Georgia, serif" }}>{body}</div>
    </div>
  );
}

function AreaCheckbox({ area, checked, onToggle }) {
  return (
    <div
      onClick={() => onToggle(area.key)}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "10px 14px", cursor: "pointer",
        background: checked ? "rgba(122,72,32,0.09)" : "transparent",
        borderBottom: `1px solid ${PAPER_MID}`,
        transition: "background 0.12s",
      }}
    >
      <div style={{
        width: 18, height: 18, border: `2px solid ${checked ? BROWN_BTN : PAPER_DK}`,
        borderRadius: 3, background: checked ? BROWN_BTN : PAPER,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, transition: "all 0.12s",
      }}>
        {checked && <span style={{ color: PAPER, fontSize: 12, lineHeight: 1 }}>✓</span>}
      </div>
      <span style={{ fontSize: 13, color: INK, fontFamily: "'Times New Roman', serif", lineHeight: 1.4 }}>{area.label}</span>
    </div>
  );
}

function SvcCategory({ cat, openCat, setOpenCat, selSvcs, toggleSvc }) {
  const isOpen = openCat === cat.id;
  const count = cat.services.filter(s => selSvcs.includes(s)).length;
  return (
    <div style={{ marginBottom: 5, borderRadius: 5, overflow: "hidden", border: `1.5px solid ${PAPER_DK}` }}>
      <div
        onClick={() => setOpenCat(isOpen ? null : cat.id)}
        style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "11px 14px",
          background: count > 0
            ? `linear-gradient(180deg,#9A6030,${BROWN_BTN} 60%,#5A3010)`
            : `linear-gradient(180deg,${PAPER_MID},${PAPER_DK})`,
          color: count > 0 ? PAPER : INK,
          cursor: "pointer", fontWeight: 700, fontSize: 13,
          fontFamily: "'Times New Roman', serif", letterSpacing: 0.5,
        }}
      >
        <span>{cat.icon} {cat.name}{count > 0 ? `  ✓ ${count} selected` : ""}</span>
        <span style={{ fontSize: 11 }}>{isOpen ? "▲" : "▼"}</span>
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
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "9px 16px", cursor: "pointer",
                  background: checked ? "rgba(122,72,32,0.08)" : "transparent",
                  borderBottom: `1px solid ${PAPER_MID}`,
                }}
              >
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
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function ListService() {
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

  // Services state
  const [openCat,  setOpenCat]  = useState(null);
  const [selSvcs,  setSelSvcs]  = useState([]);

  // Areas state (macro only)
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
    const svcList  = selSvcs.join(", ");
    const areaList = selAreas.join(", ");
    const body = encodeURIComponent(
      `Hi William,\n\nI'd like to list my business on V-Hub.\n\n` +
      `Business Name: ${businessName}\n` +
      `Owner / Contact: ${ownerName}\n` +
      `Phone: ${phone}\n` +
      `Email: ${email}\n` +
      `Website: ${website || "N/A"}\n` +
      `Address: ${address || "N/A"}\n` +
      `Years in Business: ${years || "N/A"}\n` +
      `License #: ${license || "N/A"}\n\n` +
      `About the Business:\n${description || "N/A"}\n\n` +
      `Services Offered:\n${svcList}\n\n` +
      `Service Areas:\n${areaList}\n\n` +
      `Please contact me to complete my listing. Thank you!`
    );
    window.location.href = `mailto:william@v-hub.com?subject=V-Hub Listing Request — ${businessName}&body=${body}`;
    setSubmitted(true);
  };

  // ── Thank-you screen ─────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div style={{ minHeight: "100vh", background: PAPER, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Times New Roman', serif" }}>
        <div style={{ textAlign: "center", padding: 40, maxWidth: 480 }}>
          <div style={{ fontSize: 52, marginBottom: 14 }}>📬</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: INK, marginBottom: 8, textTransform: "uppercase", letterSpacing: 2 }}>Listing Request Sent!</div>
          <div style={{ height: 2, background: INK, margin: "10px auto", width: 120, opacity: 0.25 }} />
          <div style={{ fontSize: 14, color: INK_FADE, fontStyle: "italic", marginBottom: 28, lineHeight: 1.7 }}>
            William Evans will review your information and reach out to complete your V-Hub listing. Welcome to the community!
          </div>
          <a href="/" style={{ textDecoration: "none" }}>
            <button style={{ background: BROWN_BTN, color: PAPER, border: "none", borderRadius: 5, padding: "13px 32px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Times New Roman', serif", letterSpacing: 2, textTransform: "uppercase" }}>
              ← Back to Home
            </button>
          </a>
        </div>
      </div>
    );
  }

  // ── Main render ──────────────────────────────────────────────────────────
  const errBox = (key, msg) => errors[key]
    ? <div style={{ color: RED_RULE, fontSize: 11, fontStyle: "italic", marginTop: 3 }}>⚠ {msg}</div>
    : null;

  return (
    <div style={{
      minHeight: "100vh", background: PAPER,
      backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 27px,rgba(28,15,0,0.035) 27px,rgba(28,15,0,0.035) 28px)",
      fontFamily: "'Times New Roman', Georgia, serif",
    }}>

      {/* ── Sticky Header ───────────────────────────────────────────────── */}
      <div style={{
        background: INK, padding: "10px 20px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 50,
      }}>
        <a href="/" style={{ textDecoration: "none" }}>
          <button style={{
            background: "rgba(255,255,255,0.10)", border: `1.5px solid ${PAPER_DK}`,
            color: PAPER, borderRadius: 6, padding: "7px 16px", fontSize: 13,
            cursor: "pointer", fontFamily: "'Times New Roman', serif", fontWeight: 700,
          }}>
            ← Home
          </button>
        </a>
        <div style={{
          color: PAPER, fontSize: 24, fontWeight: 900, fontFamily: "'Times New Roman', serif", letterSpacing: 1,
          display: "flex", alignItems: "center", gap: 8,
        }}>
          🌴 <span style={{ fontSize: 26 }}>V</span>-Hub
        </div>
        <div style={{ width: 80 }} />
      </div>

      {/* ── Newspaper Masthead ───────────────────────────────────────────── */}
      <div style={{ textAlign: "center", padding: "18px 20px 14px", background: PAPER, borderBottom: `3px double ${INK}` }}>
        <div style={{ fontSize: 10, letterSpacing: 5, textTransform: "uppercase", color: INK_FADE, fontStyle: "italic", marginBottom: 2 }}>
          The Villages, Florida · Provider Directory
        </div>
        <div style={{ fontSize: 32, fontWeight: 900, color: INK, letterSpacing: 3, textTransform: "uppercase", lineHeight: 1 }}>
          List Your Business
        </div>
        <div style={{ height: 2, background: RED_RULE, margin: "8px auto", width: "60%", maxWidth: 320 }} />
        <div style={{ fontSize: 13, color: INK_FADE, fontStyle: "italic", lineHeight: 1.6 }}>
          Complete the form below — William Evans will review and activate your listing.
        </div>
        <div style={{ fontSize: 11, color: INK_FADE, fontStyle: "italic", marginTop: 3 }}>
          You may return and edit your profile at any time.
        </div>
      </div>

      {/* ── Error banner ─────────────────────────────────────────────────── */}
      {Object.keys(errors).length > 0 && (
        <div style={{
          background: "#7A0000", color: "#FFE8E8", padding: "10px 20px", textAlign: "center",
          fontSize: 13, fontStyle: "italic", fontFamily: "'Times New Roman', serif",
        }}>
          ⚠ Please fill in the required fields highlighted below before submitting.
        </div>
      )}

      {/* ── Three-column newspaper layout ───────────────────────────────── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "minmax(0,1fr) minmax(0,2.4fr) minmax(0,1fr)",
        gap: 0,
        maxWidth: 1100, margin: "0 auto",
        padding: "0 0 60px",
      }}>

        {/* ── LEFT SIDEBAR ── */}
        <div style={{
          padding: "22px 18px 20px 20px",
          borderRight: `1px solid ${PAPER_DK}`,
        }}>
          <div style={{ ...sectionHead, textAlign: "center" }}>Why List on V-Hub?</div>
          {LEFT_STORIES.map((s, i) => <Story key={i} {...s} />)}
          {/* small decorative ad box */}
          <div style={{
            border: `2px solid ${BROWN_BTN}`, borderRadius: 4, padding: "12px 10px",
            textAlign: "center", marginTop: 6, background: PAPER_MID,
          }}>
            <div style={{ fontSize: 14, fontWeight: 900, color: BROWN_BTN, marginBottom: 4, fontFamily: "'Times New Roman', serif" }}>🏆 Verified Provider</div>
            <div style={{ fontSize: 11, color: INK_FADE, fontStyle: "italic", lineHeight: 1.5, fontFamily: "Georgia, serif" }}>
              All V-Hub listings are manually reviewed by William Evans before going live — giving customers confidence in every result.
            </div>
          </div>
        </div>

        {/* ── MAIN FORM ── */}
        <div style={{ padding: "22px 24px 20px", borderRight: `1px solid ${PAPER_DK}` }}>

          {/* ─ Business Info ─ */}
          <div style={{ marginBottom: 26 }}>
            <div style={sectionHead}>Section 1 — Business Information</div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 16px", marginBottom: 12 }}>
              <div>
                <label style={{ ...labelStyle, color: errors.businessName ? RED_RULE : INK_FADE }}>Business Name *</label>
                <input style={{ ...inputStyle, borderColor: errors.businessName ? RED_RULE : PAPER_DK }}
                  value={businessName} onChange={e => setBusinessName(e.target.value)}
                  placeholder="e.g. Sunshine Landscaping" />
                {errBox("businessName", "Required")}
              </div>
              <div>
                <label style={{ ...labelStyle, color: errors.ownerName ? RED_RULE : INK_FADE }}>Owner / Contact Name *</label>
                <input style={{ ...inputStyle, borderColor: errors.ownerName ? RED_RULE : PAPER_DK }}
                  value={ownerName} onChange={e => setOwnerName(e.target.value)}
                  placeholder="Your full name" />
                {errBox("ownerName", "Required")}
              </div>
              <div>
                <label style={{ ...labelStyle, color: errors.phone ? RED_RULE : INK_FADE }}>Phone Number *</label>
                <input style={{ ...inputStyle, borderColor: errors.phone ? RED_RULE : PAPER_DK }}
                  value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder="(352) 555-0000" type="tel" />
                {errBox("phone", "Required")}
              </div>
              <div>
                <label style={{ ...labelStyle, color: errors.email ? RED_RULE : INK_FADE }}>Email Address *</label>
                <input style={{ ...inputStyle, borderColor: errors.email ? RED_RULE : PAPER_DK }}
                  value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com" type="email" />
                {errBox("email", "Required")}
              </div>
              <div>
                <label style={labelStyle}>Website / Social Media URL</label>
                <input style={inputStyle}
                  value={website} onChange={e => setWebsite(e.target.value)}
                  placeholder="www.yourbusiness.com" />
              </div>
              <div>
                <label style={labelStyle}>Business Address</label>
                <input style={inputStyle}
                  value={address} onChange={e => setAddress(e.target.value)}
                  placeholder="Street, City, FL ZIP" />
              </div>
              <div>
                <label style={labelStyle}>Years in Business</label>
                <input style={inputStyle}
                  value={years} onChange={e => setYears(e.target.value)}
                  placeholder="e.g. 8" type="number" min="0" />
              </div>
              <div>
                <label style={labelStyle}>License / Certification #</label>
                <input style={inputStyle}
                  value={license} onChange={e => setLicense(e.target.value)}
                  placeholder="Optional" />
              </div>
            </div>

            <div>
              <label style={labelStyle}>About Your Business</label>
              <textarea
                style={{ ...inputStyle, resize: "vertical", minHeight: 90, lineHeight: 1.6 }}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Tell residents what makes your business special — experience, specialties, values, anything that sets you apart..."
              />
            </div>
          </div>

          {/* ─ Divider ─ */}
          <div style={{ height: 1, background: INK, opacity: 0.15, margin: "6px 0 24px" }} />

          {/* ─ Services ─ */}
          <div style={{ marginBottom: 26 }}>
            <div style={{ ...sectionHead, color: errors.svcs ? RED_RULE : INK, borderBottomColor: errors.svcs ? RED_RULE : INK }}>
              Section 2 — Services You Offer *
            </div>
            <div style={{ fontSize: 12, color: INK_FADE, fontStyle: "italic", marginBottom: 12 }}>
              Click a category to expand it, then check every service that applies. Select as many as you like.
            </div>

            {selSvcs.length > 0 && (
              <div style={{
                background: PAPER_MID, border: `1px solid ${PAPER_DK}`, borderRadius: 5,
                padding: "8px 12px", marginBottom: 10, fontSize: 12, color: INK_FADE,
              }}>
                <strong style={{ color: INK }}>Selected ({selSvcs.length}):</strong> {selSvcs.join(" · ")}
              </div>
            )}
            {errBox("svcs", "Please select at least one service")}

            <div style={{ marginTop: 8 }}>
              {CATS.map(cat => (
                <SvcCategory key={cat.id} cat={cat}
                  openCat={openCat} setOpenCat={setOpenCat}
                  selSvcs={selSvcs} toggleSvc={toggleSvc}
                />
              ))}
            </div>
          </div>

          {/* ─ Divider ─ */}
          <div style={{ height: 1, background: INK, opacity: 0.15, margin: "6px 0 24px" }} />

          {/* ─ Service Areas ─ */}
          <div style={{ marginBottom: 30 }}>
            <div style={{ ...sectionHead, color: errors.areas ? RED_RULE : INK, borderBottomColor: errors.areas ? RED_RULE : INK }}>
              Section 3 — Areas You Serve *
            </div>
            <div style={{ fontSize: 12, color: INK_FADE, fontStyle: "italic", marginBottom: 12 }}>
              Select every major area of The Villages where you're available. These determine when customers find you in search results.
            </div>
            {errBox("areas", "Please select at least one service area")}

            <div style={{
              border: `1.5px solid ${errors.areas ? RED_RULE : PAPER_DK}`,
              borderRadius: 5, overflow: "hidden", marginTop: 8,
              background: PAPER,
            }}>
              {/* dropdown toggle */}
              <div
                onClick={() => setAreaOpen(!areaOpen)}
                style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "11px 14px", cursor: "pointer",
                  background: selAreas.length > 0
                    ? `linear-gradient(180deg,#9A6030,${BROWN_BTN} 60%,#5A3010)`
                    : `linear-gradient(180deg,${PAPER_MID},${PAPER_DK})`,
                  color: selAreas.length > 0 ? PAPER : INK,
                  fontWeight: 700, fontSize: 13,
                  fontFamily: "'Times New Roman', serif", letterSpacing: 0.5,
                }}
              >
                <span>
                  {selAreas.length === 0
                    ? "📍 Select areas you serve..."
                    : `📍 ${selAreas.length} area${selAreas.length > 1 ? "s" : ""} selected`}
                </span>
                <span style={{ fontSize: 11 }}>{areaOpen ? "▲" : "▼"}</span>
              </div>

              {areaOpen && (
                <div>
                  {MACRO_AREAS.map(area => (
                    <AreaCheckbox key={area.key} area={area}
                      checked={selAreas.includes(area.key)}
                      onToggle={toggleArea}
                    />
                  ))}
                </div>
              )}
            </div>

            {selAreas.length > 0 && (
              <div style={{
                background: PAPER_MID, border: `1px solid ${PAPER_DK}`, borderRadius: 5,
                padding: "8px 12px", marginTop: 8, fontSize: 12, color: INK_FADE,
              }}>
                <strong style={{ color: INK }}>Serving:</strong> {selAreas.join(" · ")}
              </div>
            )}
          </div>

          {/* ─ Submit ─ */}
          <div style={{ borderTop: `2px solid ${INK}`, paddingTop: 20, textAlign: "center" }}>
            <div style={{ fontSize: 12, color: INK_FADE, fontStyle: "italic", marginBottom: 14, lineHeight: 1.6 }}>
              By submitting, you agree to be listed in V-Hub's public directory.<br />
              William Evans will contact you to confirm and activate your profile.
            </div>
            <button
              onClick={handleSubmit}
              style={{
                background: `linear-gradient(180deg,#9A6030,${BROWN_BTN} 60%,#5A3010)`,
                color: PAPER, border: `3px solid ${YELLOW}`,
                boxShadow: `0 0 0 1.5px ${YELLOW}, 0 0 12px 3px rgba(255,220,0,0.3)`,
                borderRadius: 6, padding: "15px 48px",
                fontSize: 15, fontWeight: 900, cursor: "pointer",
                fontFamily: "'Times New Roman', serif", letterSpacing: 3,
                textTransform: "uppercase",
              }}
            >
              Submit My Listing →
            </button>
          </div>
        </div>

        {/* ── RIGHT SIDEBAR ── */}
        <div style={{ padding: "22px 20px 20px 18px" }}>
          <div style={{ ...sectionHead, textAlign: "center" }}>Provider Success Stories</div>
          {RIGHT_STORIES.map((s, i) => <Story key={i} {...s} />)}
          {/* Contact box */}
          <div style={{
            border: `2px solid ${BROWN_BTN}`, borderRadius: 4, padding: "14px 12px",
            textAlign: "center", background: PAPER_MID, marginTop: 6,
          }}>
            <div style={{ fontSize: 13, fontWeight: 900, color: INK, marginBottom: 6, fontFamily: "'Times New Roman', serif", textTransform: "uppercase", letterSpacing: 1 }}>Questions?</div>
            <div style={{ fontSize: 12, color: INK_FADE, fontStyle: "italic", lineHeight: 1.6, fontFamily: "Georgia, serif", marginBottom: 8 }}>
              Contact William Evans directly — he personally manages every provider listing on V-Hub.
            </div>
            <a href="mailto:william@v-hub.com" style={{ textDecoration: "none" }}>
              <div style={{
                background: BROWN_BTN, color: PAPER, borderRadius: 4, padding: "8px 12px",
                fontSize: 12, fontWeight: 700, fontFamily: "'Times New Roman', serif",
                letterSpacing: 1, cursor: "pointer",
              }}>
                william@v-hub.com
              </div>
            </a>
          </div>

          {/* Decorative rule */}
          <div style={{ margin: "18px 0", textAlign: "center", color: PAPER_DK, fontSize: 16 }}>✦ ✦ ✦</div>

          {/* Stats box */}
          <div style={{
            border: `1.5px solid ${PAPER_DK}`, borderRadius: 4, padding: "12px 10px",
            background: PAPER,
          }}>
            <div style={{ ...sectionHead, textAlign: "center", fontSize: 10 }}>V-Hub By the Numbers</div>
            {[
              ["59", "Villages Covered"],
              ["9",  "Service Categories"],
              ["62", "Searchable Services"],
              ["#1", "Local Directory"],
            ].map(([num, label]) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "5px 0", borderBottom: `1px solid ${PAPER_MID}` }}>
                <span style={{ fontSize: 20, fontWeight: 900, color: BROWN_BTN, fontFamily: "'Times New Roman', serif" }}>{num}</span>
                <span style={{ fontSize: 11, color: INK_FADE, fontStyle: "italic", fontFamily: "Georgia, serif" }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <div style={{
        textAlign: "center", padding: "14px 20px", borderTop: `2px double ${INK}`,
        fontSize: 11, color: INK_FADE, fontStyle: "italic", background: PAPER,
      }}>
        © V-Hub · The Villages, Florida · A community-first directory · <a href="/" style={{ color: INK_FADE }}>Home</a>
      </div>

    </div>
  );
}
