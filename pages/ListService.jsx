import { useState } from "react";

const INK       = "#1C0F00";
const INK_FADE  = "#5C3A10";
const PAPER     = "#F0E6C8";
const PAPER_MID = "#E4D5A8";
const PAPER_DK  = "#C8B07A";
const BROWN_BTN = "#7A4820";
const YELLOW    = "#FFDB00";

const CATS = [
  { id: "69d09c14d5ee9e7be9aa301b", name: "Home Services", icon: "🏠", services: [
    "Home Improvements","General Repairs","Cleaning Services (Home & Pool)","Painting (Interior/Exterior)",
    "Garage Door Services","Window Installation/Repair","HVAC","Plumbing","Roofing",
  ]},
  { id: "69d181fe57b60e0aecf4067d", name: "Home Systems & Utilities", icon: "💡", services: [
    "Handyman Services","Security & Home Watch","Pest Control","Appliance Repair",
    "Electrical & Lighting","Flooring (Tile, Wood, Carpet)","Home Organization","Smart Home Installation","Pool & Spa Services",
  ]},
  { id: "69d09c14d5ee9e7be9aa301c", name: "Yard & Outdoor", icon: "🌿", services: [
    "Lawn Mowing","Sod Installation","Tree Trimming & Pruning/Removal","Lawn Fertilization",
    "Irrigation/Sprinkler Services","Landscaping","Hardscaping","Pressure Washing","Driveway Repair/Cleaning/Painting",
  ]},
  { id: "69d09c14d5ee9e7be9aa301d", name: "Golf Cart Services", icon: "⛳", services: [
    "Rentals","Repairs","Detailing","Lighting Upgrades","Improvements/Customizations","Battery Replacement","Tire Services",
  ]},
  { id: "69d09c14d5ee9e7be9aa301e", name: "Automobile Services", icon: "🚗", services: [
    "Auto Repairs","Auto Detailing","Oil Changes","Tire Services","Mobile Mechanic",
  ]},
  { id: "69d09c14d5ee9e7be9aa301f", name: "Personal Care", icon: "💆", services: [
    "Hair Stylists","Nail Technicians","Spa Services","Home Health Aides","Massage Therapists","Personal Trainers","Makeup Artists",
  ]},
  { id: "69d09c14d5ee9e7be9aa3020", name: "Pet Services", icon: "🐾", services: [
    "Veterinary Services","Grooming","Pet Sitting/Walking","Pet Training","Mobile Grooming",
  ]},
  { id: "69d09c14d5ee9e7be9aa3021", name: "Transportation", icon: "🚐", services: [
    "Medical Transport","Airport Transport","Local Rides","Errand Services","Courier/Delivery Services",
  ]},
  { id: "69d181fe57b60e0aecf4067e", name: "Professional Services", icon: "💼", services: [
    "Accounting & Bookkeeping","Notary Services","IT Support","Legal Services","Business Consulting","Tax Preparation",
  ]},
];

const SECTIONS = [
  { key: "Historic Side", label: "Historic Side", villages: [
    "Spanish Springs Town Square","De La Vista","Springdale","El Santiago","Duval",
    "Hillsborough","Orange Blossom Gardens","Tamarind Grove","Tierra del Sol","Santo Domingo",
  ]},
  { key: "Established Villages", label: "Established Villages (N of SR-466A)", villages: [
    "Lake Sumter Landing","Buttonwood","Hadley","Bonnybrook","Chatham","Glenbrook",
    "Piedmont","Fernandina","Amelia","Sanibel","Gilchrist","Pinellas","Sabal Chase","Sunset Pointe",
  ]},
  { key: "Newer Villages", label: "Newer Villages (S of SR-44)", villages: [
    "Brownwood","Fenney","Dabney","Hawkins","Marsh Bend","Osceola Hills","DeSoto",
    "Middleton","Monarch Grove","McClure","Newell","Richmond","Linden","Santiago","Liberty Park","Tall Trees",
  ]},
  { key: "Eastport", label: "Eastport (Newest Area)", villages: [
    "Eastport Town Center","Bradford","Tysen","Wasatch","Winifred","Eastmoor","Collier","Magnolia",
  ]},
  { key: "Family Villages", label: "Family & Non-Age-Restricted", villages: [
    "Sumter Landing","Pinecrest","Briar Meadow","Lake Deaton","Dunedin",
    "Hacienda East","Hacienda Hills","Captiva","Pine Hills","Mercer","Mallory Square",
  ]},
];

function BurgerMenu() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}
        style={{ background: "rgba(255,255,255,0.15)", border: `1.5px solid ${PAPER_DK}`, borderRadius: 6, padding: "8px 11px", cursor: "pointer", display: "flex", flexDirection: "column", gap: 4 }}>
        <span style={{ display: "block", width: 18, height: 2, background: PAPER, borderRadius: 2 }} />
        <span style={{ display: "block", width: 18, height: 2, background: PAPER, borderRadius: 2 }} />
        <span style={{ display: "block", width: 18, height: 2, background: PAPER, borderRadius: 2 }} />
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 199, background: "rgba(0,0,0,0.45)" }} />
          <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 260, background: PAPER, zIndex: 200, boxShadow: "-4px 0 20px rgba(0,0,0,0.3)", display: "flex", flexDirection: "column", fontFamily: "'Times New Roman', serif" }}>
            <div style={{ background: INK, padding: "18px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ color: PAPER, fontWeight: 800, fontSize: 17, letterSpacing: 1 }}>V-HUB</div>
              <button onClick={() => setOpen(false)} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", borderRadius: 5, width: 28, height: 28, fontSize: 14, cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ padding: "14px 10px", flex: 1 }}>
              {[{ label: "🏠 Home", href: "/" }, { label: "📋 List Your Service", href: "/list-service" }].map((link, i) => (
                <a key={i} href={link.href} style={{ textDecoration: "none" }}>
                  <div style={{ padding: "13px 14px", borderRadius: 6, fontSize: 15, fontWeight: 600, color: INK, marginBottom: 5, background: PAPER_MID, borderLeft: `4px solid ${[BROWN_BTN, INK][i]}` }}>
                    {link.label}
                  </div>
                </a>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default function ListService() {
  const [openCat,  setOpenCat]  = useState(null);   // expanded macro category
  const [selSvcs,  setSelSvcs]  = useState([]);      // selected micro services (strings)
  const [openSec,  setOpenSec]  = useState(null);    // expanded area section
  const [selAreas, setSelAreas] = useState([]);      // selected macro area keys

  const toggleSvc = (name) => {
    setSelSvcs(prev => prev.includes(name) ? prev.filter(s => s !== name) : [...prev, name]);
  };
  const toggleArea = (key) => {
    setSelAreas(prev => prev.includes(key) ? prev.filter(a => a !== key) : [...prev, key]);
  };

  // Derive which macro categories are selected (any sub-service selected)
  const selCatIds = CATS.filter(c => c.services.some(s => selSvcs.includes(s))).map(c => c.id);

  const handleSubmit = () => {
    if (selSvcs.length === 0 || selAreas.length === 0) {
      alert("Please select at least one service and one area you serve.");
      return;
    }
    const svcList = selSvcs.join(", ");
    const areaList = selAreas.join(", ");
    const body = encodeURIComponent(`Hi William,\n\nI'd like to list my business on V-Hub.\n\nServices I offer:\n${svcList}\n\nAreas I serve:\n${areaList}\n\nPlease contact me to get set up.\n\nThank you!`);
    window.location.href = `mailto:william@v-hub.com?subject=V-Hub Listing Request&body=${body}`;
  };

  return (
    <div style={{ minHeight: "100vh", background: PAPER, fontFamily: "'Times New Roman', Georgia, serif" }}>

      {/* Header */}
      <div style={{ background: INK, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <a href="/" style={{ textDecoration: "none" }}>
            <button style={{ background: "rgba(255,255,255,0.12)", border: `1.5px solid ${PAPER_DK}`, color: PAPER, borderRadius: 6, padding: "7px 14px", fontSize: 13, cursor: "pointer", fontFamily: "'Times New Roman', serif", fontWeight: 700 }}>← Back</button>
          </a>
          <div style={{ color: PAPER, fontSize: 19, fontWeight: 800, letterSpacing: 1 }}>🌴 V-Hub</div>
        </div>
        <BurgerMenu />
      </div>

      {/* Masthead */}
      <div style={{ borderBottom: `3px double ${INK}`, padding: "18px 16px 14px", textAlign: "center", background: PAPER_MID }}>
        <div style={{ fontSize: 26, fontWeight: 900, color: INK, letterSpacing: 2, textTransform: "uppercase" }}>List Your Service</div>
        <div style={{ fontSize: 13, color: INK_FADE, fontStyle: "italic", marginTop: 4 }}>Select your services & the areas you serve — we'll match you to residents who need you</div>
        <div style={{ height: 1, background: INK, marginTop: 12, opacity: 0.3 }} />
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "20px 16px 60px" }}>

        {/* ── Step 1: Services ── */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 13, fontWeight: 900, color: INK, textTransform: "uppercase", letterSpacing: 2, marginBottom: 4 }}>Step 1 — What services do you offer?</div>
          <div style={{ fontSize: 12, color: INK_FADE, fontStyle: "italic", marginBottom: 12 }}>Tap a category to expand, then check each service you provide.</div>

          {selSvcs.length > 0 && (
            <div style={{ background: PAPER_MID, border: `1px solid ${PAPER_DK}`, borderRadius: 5, padding: "8px 12px", marginBottom: 10, fontSize: 12, color: INK_FADE }}>
              <strong style={{ color: INK }}>Selected:</strong> {selSvcs.join(" · ")}
            </div>
          )}

          {CATS.map(cat => {
            const isOpen = openCat === cat.id;
            const selectedCount = cat.services.filter(s => selSvcs.includes(s)).length;
            return (
              <div key={cat.id} style={{ marginBottom: 6 }}>
                {/* Macro row */}
                <div onClick={() => setOpenCat(isOpen ? null : cat.id)}
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 14px", background: selectedCount > 0 ? BROWN_BTN : PAPER_DK, color: selectedCount > 0 ? PAPER : INK, borderRadius: isOpen ? "5px 5px 0 0" : 5, cursor: "pointer", border: `2px solid ${selectedCount > 0 ? BROWN_BTN : PAPER_DK}`, fontWeight: 700, fontSize: 14 }}>
                  <span>{cat.icon} {cat.name} {selectedCount > 0 ? `(${selectedCount})` : ""}</span>
                  <span style={{ fontSize: 11 }}>{isOpen ? "▲" : "▼"}</span>
                </div>
                {/* Micro services */}
                {isOpen && (
                  <div style={{ border: `2px solid ${PAPER_DK}`, borderTop: "none", borderRadius: "0 0 5px 5px", background: PAPER }}>
                    {cat.services.map(svc => {
                      const checked = selSvcs.includes(svc);
                      return (
                        <div key={svc} onClick={() => toggleSvc(svc)}
                          style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", borderBottom: `1px solid ${PAPER_MID}`, cursor: "pointer", background: checked ? "#FFF8E0" : "transparent" }}>
                          <div style={{ width: 18, height: 18, borderRadius: 3, border: `2px solid ${checked ? BROWN_BTN : PAPER_DK}`, background: checked ? BROWN_BTN : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            {checked && <span style={{ color: PAPER, fontSize: 11, fontWeight: 900 }}>✓</span>}
                          </div>
                          <span style={{ fontSize: 13, color: INK, fontWeight: checked ? 700 : 400 }}>{svc}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ height: 1, background: INK, opacity: 0.2, marginBottom: 28 }} />

        {/* ── Step 2: Areas ── */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 13, fontWeight: 900, color: INK, textTransform: "uppercase", letterSpacing: 2, marginBottom: 4 }}>Step 2 — What areas do you serve?</div>
          <div style={{ fontSize: 12, color: INK_FADE, fontStyle: "italic", marginBottom: 12 }}>Select the village communities you serve. Customers searching any village within a selected area will find you.</div>

          {selAreas.length > 0 && (
            <div style={{ background: PAPER_MID, border: `1px solid ${PAPER_DK}`, borderRadius: 5, padding: "8px 12px", marginBottom: 10, fontSize: 12, color: INK_FADE }}>
              <strong style={{ color: INK }}>Selected:</strong> {selAreas.join(" · ")}
            </div>
          )}

          {SECTIONS.map(sec => {
            const isOpen = openSec === sec.key;
            const isSelected = selAreas.includes(sec.key);
            return (
              <div key={sec.key} style={{ marginBottom: 6 }}>
                {/* Macro area row */}
                <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 0 }}>
                  {/* Checkbox on left */}
                  <div onClick={() => toggleArea(sec.key)}
                    style={{ width: 22, height: 22, borderRadius: 3, border: `2px solid ${isSelected ? BROWN_BTN : PAPER_DK}`, background: isSelected ? BROWN_BTN : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, margin: "0 8px 0 0" }}>
                    {isSelected && <span style={{ color: PAPER, fontSize: 12, fontWeight: 900 }}>✓</span>}
                  </div>
                  {/* Expand row */}
                  <div onClick={() => setOpenSec(isOpen ? null : sec.key)}
                    style={{ flex: 1, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 14px", background: isSelected ? BROWN_BTN : PAPER_DK, color: isSelected ? PAPER : INK, borderRadius: isOpen ? "5px 5px 0 0" : 5, cursor: "pointer", fontWeight: 700, fontSize: 14 }}>
                    <span>{sec.label}</span>
                    <span style={{ fontSize: 10, opacity: 0.7 }}>{isOpen ? "▲ hide" : "▼ see villages"}</span>
                  </div>
                </div>
                {/* Village list (read-only, informational) */}
                {isOpen && (
                  <div style={{ border: `2px solid ${PAPER_DK}`, borderTop: "none", borderRadius: "0 0 5px 5px", background: PAPER, padding: "10px 14px", marginLeft: 30 }}>
                    <div style={{ fontSize: 11, color: INK_FADE, fontStyle: "italic", marginBottom: 6 }}>Villages in this area:</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 10px" }}>
                      {sec.villages.map(v => (
                        <span key={v} style={{ fontSize: 12, color: INK, background: PAPER_MID, borderRadius: 3, padding: "2px 7px", border: `1px solid ${PAPER_DK}` }}>{v}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Submit ── */}
        <div style={{ background: PAPER_MID, border: `2px solid ${PAPER_DK}`, borderRadius: 8, padding: "20px 16px", textAlign: "center" }}>
          <div style={{ fontSize: 13, color: INK_FADE, fontStyle: "italic", marginBottom: 14, lineHeight: 1.6 }}>
            When you click below, we'll prepare your listing request.<br />William Evans will contact you to complete your profile and go live.
          </div>
          <button onClick={handleSubmit} style={{
            width: "100%", background: `linear-gradient(180deg,#9A6030,${BROWN_BTN} 60%,#5A3010)`,
            border: `3px solid ${YELLOW}`, boxShadow: `0 0 0 1.5px ${YELLOW}, 0 0 10px 2px rgba(255,220,0,0.35)`,
            borderRadius: 5, color: "#F5E8CC", fontFamily: "'Times New Roman', serif",
            fontWeight: 700, fontSize: 15, letterSpacing: 3, padding: "14px", cursor: "pointer",
          }}>
            SUBMIT LISTING REQUEST
          </button>
          <div style={{ fontSize: 11, color: INK_FADE, marginTop: 10, fontStyle: "italic" }}>
            {selSvcs.length} service{selSvcs.length !== 1 ? "s" : ""} selected · {selAreas.length} area{selAreas.length !== 1 ? "s" : ""} selected
          </div>
        </div>

      </div>
    </div>
  );
}
