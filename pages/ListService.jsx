import { useState, useEffect, useRef } from "react"; // v3-static-fix
import { Provider, Category, Service, ServiceArea } from "@/api/entities";

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

// ── Service categories (STATIC - v3) ────────────────────────────────────────
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
  { key: "historic", label: "🌴 Historic Side", villages: [
    "Alhambra","Ashland","Belle Aire","Belvedere","Bonita","Buttonwood","Calumet Grove",
    "Country Club Hills","De Allende","De La Vista","Del Mar","DeLuna","El Cortez","Hacienda",
    "Haciendas of Mission Hills","La Reynalda","La Zamora","LaBelle","Largo","Orange Blossom Gardens",
    "Pennecamp","Piedmont","Pine Ridge","Poinciana","Rio Ranchero","Santo Domingo","Spanish Springs",
    "Tamarind Grove","Valle Verde","Virginia Trace",
  ]},
  { key: "established", label: "🏡 Established Villages", villages: [
    "Amelia","Bonnybrook","Caroline","Charlotte","Chatham","DeSoto","Dunedin","Fernandina",
    "Gilchrist","Glenbrook","Hadley","Hawkins","Hemingway","Hillsborough","Lake Deaton",
    "Lynnhaven","Mira Mesa","Palo Alto","Pinellas","Polo Ridge","Rio Grande","Rio Ponderosa",
    "Sabal Chase","Silver Lake","Springdale","Summerhill","Sunset Pointe","Tierra Del Sol","Woodbury",
  ]},
  { key: "newer", label: "🌿 Newer Villages", villages: [
    "Chitty Chatty","Citrus Grove","Dabney","Duval","Fenney","Hammock at Fenney","Lakeshore Cottages",
    "Liberty Park","Linden","Mallory Square","Marsh Bend","McClure","Monarch Grove",
    "Newell","Pine Hills","Richmond","Sanibel","Santiago","Tall Trees",
  ]},
  { key: "eastport", label: "🌊 Eastport", villages: [
    "Bradford","Bridgeport at Creekside Landing","Bridgeport at Lake Miona","Bridgeport at Lake Sumter",
    "Bridgeport at Laurel Valley","Bridgeport at Miona Shores","Bridgeport at Mission Hills",
    "Cason Hammock","Collier","Collier at Alden Bungalows","Collier at Antrim Dells",
    "Lake Denham","Osceola Hills","Osceola Hills at Soaring Eagle Preserve","Winifred",
  ]},
  { key: "st_john", label: "⛪ St. John's Area", villages: [
    "St. Catherine","St. Charles","St. James","St. Johns",
  ]},
  { key: "fenney", label: "🌿 Fenney & South", villages: [
    "Briar Meadow","Haciendas of Mission Hills","La Zamora","LaBelle",
  ]},
];

// ── Sidebar stories ────────────────────────────────────────────────────────
const LEFT_STORIES = [
  { head: "Built Exclusively for The Villages", sub: "Local providers, local residents — no middleman", body: "V-Hub is the only directory built specifically for The Villages, FL. Unlike national platforms, every listing is geo-specific — no out-of-area results, no confusion. Residents search V-Hub to find real local professionals in their own neighborhood." },
  { head: "Why Local Discovery Matters", sub: "Neighbors trust neighbors", body: "Residents here value personal recommendations above all else. V-Hub replicates that word-of-mouth trust digitally — every provider is vetted, every listing is geo-specific, and every search leads directly to a real person in the community." },
  { head: "A Directory Built for Seniors", sub: "Simple. Fast. No apps required.", body: "Forget complicated apps or confusing websites. V-Hub is designed to be used on any device — phone, tablet, or computer — with large text, clear layouts, and no technical know-how required. Just search and call." },
];

const RIGHT_STORIES = [
  { head: "Direct Connections, No Commission", sub: "Residents contact you directly — we never take a cut", body: "V-Hub connects residents directly with you — no booking fees, no commissions, no middlemen. Your contact info is right on your listing. When a resident reaches out, the conversation is entirely between you and them." },
  { head: "Be Seen Where Your Customers Are Looking", sub: "A community-focused alternative to national search engines", body: "V-Hub is designed specifically for The Villages — a local, community-focused directory for residents who want to hire local. Your profile puts you in front of neighbors actively looking for the services you provide." },
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
  // cat.services is now an array of {id, name} objects from the DB
  const isOpen = openCat === cat.id;
  const count = (cat.services || []).filter(s => selSvcs.includes(s.id)).length;
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
          {(cat.services || []).map(svc => {
            const checked = selSvcs.includes(svc.id);
            return (
              <div
                key={svc.id}
                onClick={() => toggleSvc(svc.id)}
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
                <span style={{ fontSize: isMobile ? 15 : 13, color: INK, fontFamily: "Georgia, serif", lineHeight: 1.3 }}>{svc.name}</span>
              </div>
            );
          })}
          {(cat.services || []).length === 0 && (
            <div style={{ padding: "10px 16px", fontSize: 13, color: "#aaa", fontStyle: "italic" }}>No services in this category yet.</div>
          )}
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
    description: "List your local service business on V-Hub and get discovered by Villages residents. Free listing review. No commissions — contact directly.",
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
  const [loginEmail,   setLoginEmail]   = useState("");
  const [loginPass,    setLoginPass]    = useState("");
  const [loginPass2,   setLoginPass2]   = useState("");
  const [showPass,     setShowPass]     = useState(false);

  // Services & areas
  const [openCat,  setOpenCat]  = useState(null);
  const [selSvcs,  setSelSvcs]  = useState([]);
  const [selAreas, setSelAreas] = useState([]);
  const [areaOpen, setAreaOpen] = useState(false);
  const [openMacro, setOpenMacro] = useState(null); // which macro is expanded

  // Submission
  const [submitted,  setSubmitted]  = useState(false);
  const [errors,     setErrors]     = useState({});
  const [accountNum, setAccountNum] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Real entity data
  const [dbCategories, setDbCategories] = useState([]);
  const [dbServices,   setDbServices]   = useState([]);
  const [dbAreas,      setDbAreas]       = useState([]);
  const [selCatId,     setSelCatId]      = useState("");

  useEffect(() => {
    // Hardcoded static data — no auth required for public listing form
    const CATS_STATIC = [
      { id: "69d09c14d5ee9e7be9aa301b", name: "Home Services", icon: "🏠", is_active: true },
      { id: "69d181fe57b60e0aecf4067d", name: "Home Systems & Utilities", icon: "💡", is_active: true },
      { id: "69d09c14d5ee9e7be9aa301c", name: "Yard & Outdoor", icon: "🌿", is_active: true },
      { id: "69d09c14d5ee9e7be9aa301d", name: "Golf Cart Services", icon: "⛳", is_active: true },
      { id: "69d09c14d5ee9e7be9aa301e", name: "Automobile Services", icon: "🚗", is_active: true },
      { id: "69d09c14d5ee9e7be9aa301f", name: "Personal Care", icon: "💆", is_active: true },
      { id: "69d09c14d5ee9e7be9aa3020", name: "Pet Services", icon: "🐾", is_active: true },
      { id: "69d09c14d5ee9e7be9aa3021", name: "Transportation", icon: "🚐", is_active: true },
      { id: "69d181fe57b60e0aecf4067e", name: "Professional Services", icon: "💼", is_active: true },
    ];
    const SVCS_STATIC = [
      { id: "s01", category_id: "69d09c14d5ee9e7be9aa301b", name: "Home Improvements", is_active: true },
      { id: "s02", category_id: "69d09c14d5ee9e7be9aa301b", name: "General Repairs", is_active: true },
      { id: "s03", category_id: "69d09c14d5ee9e7be9aa301b", name: "Cleaning Services (Home & Pool)", is_active: true },
      { id: "s04", category_id: "69d09c14d5ee9e7be9aa301b", name: "Painting (Interior/Exterior)", is_active: true },
      { id: "s05", category_id: "69d09c14d5ee9e7be9aa301b", name: "Garage Door Services", is_active: true },
      { id: "s06", category_id: "69d09c14d5ee9e7be9aa301b", name: "Window Installation/Repair", is_active: true },
      { id: "s07", category_id: "69d09c14d5ee9e7be9aa301b", name: "HVAC", is_active: true },
      { id: "s08", category_id: "69d09c14d5ee9e7be9aa301b", name: "Plumbing", is_active: true },
      { id: "s09", category_id: "69d09c14d5ee9e7be9aa301b", name: "Roofing", is_active: true },
      { id: "s10", category_id: "69d181fe57b60e0aecf4067d", name: "Handyman Services", is_active: true },
      { id: "s11", category_id: "69d181fe57b60e0aecf4067d", name: "Security & Home Watch", is_active: true },
      { id: "s12", category_id: "69d181fe57b60e0aecf4067d", name: "Pest Control", is_active: true },
      { id: "s13", category_id: "69d181fe57b60e0aecf4067d", name: "Appliance Repair", is_active: true },
      { id: "s14", category_id: "69d181fe57b60e0aecf4067d", name: "Electrical & Lighting", is_active: true },
      { id: "s15", category_id: "69d181fe57b60e0aecf4067d", name: "Flooring (Tile, Wood, Carpet)", is_active: true },
      { id: "s16", category_id: "69d181fe57b60e0aecf4067d", name: "Home Organization", is_active: true },
      { id: "s17", category_id: "69d181fe57b60e0aecf4067d", name: "Smart Home Installation", is_active: true },
      { id: "s18", category_id: "69d181fe57b60e0aecf4067d", name: "Pool & Spa Services", is_active: true },
      { id: "s19", category_id: "69d09c14d5ee9e7be9aa301c", name: "Lawn Mowing", is_active: true },
      { id: "s20", category_id: "69d09c14d5ee9e7be9aa301c", name: "Sod Installation", is_active: true },
      { id: "s21", category_id: "69d09c14d5ee9e7be9aa301c", name: "Tree Trimming & Pruning/Removal", is_active: true },
      { id: "s22", category_id: "69d09c14d5ee9e7be9aa301c", name: "Lawn Fertilization", is_active: true },
      { id: "s23", category_id: "69d09c14d5ee9e7be9aa301c", name: "Irrigation/Sprinkler Services", is_active: true },
      { id: "s24", category_id: "69d09c14d5ee9e7be9aa301c", name: "Landscaping", is_active: true },
      { id: "s25", category_id: "69d09c14d5ee9e7be9aa301c", name: "Hardscaping", is_active: true },
      { id: "s26", category_id: "69d09c14d5ee9e7be9aa301c", name: "Pressure Washing", is_active: true },
      { id: "s27", category_id: "69d09c14d5ee9e7be9aa301c", name: "Driveway Repair/Cleaning/Painting", is_active: true },
      { id: "s28", category_id: "69d09c14d5ee9e7be9aa301d", name: "Rentals", is_active: true },
      { id: "s29", category_id: "69d09c14d5ee9e7be9aa301d", name: "Repairs", is_active: true },
      { id: "s30", category_id: "69d09c14d5ee9e7be9aa301d", name: "Detailing", is_active: true },
      { id: "s31", category_id: "69d09c14d5ee9e7be9aa301d", name: "Lighting Upgrades", is_active: true },
      { id: "s32", category_id: "69d09c14d5ee9e7be9aa301d", name: "Improvements/Customizations", is_active: true },
      { id: "s33", category_id: "69d09c14d5ee9e7be9aa301d", name: "Battery Replacement", is_active: true },
      { id: "s34", category_id: "69d09c14d5ee9e7be9aa301d", name: "Tire Services", is_active: true },
      { id: "s35", category_id: "69d09c14d5ee9e7be9aa301e", name: "Auto Repairs", is_active: true },
      { id: "s36", category_id: "69d09c14d5ee9e7be9aa301e", name: "Auto Detailing", is_active: true },
      { id: "s37", category_id: "69d09c14d5ee9e7be9aa301e", name: "Oil Changes", is_active: true },
      { id: "s38", category_id: "69d09c14d5ee9e7be9aa301e", name: "Tire Services", is_active: true },
      { id: "s39", category_id: "69d09c14d5ee9e7be9aa301e", name: "Mobile Mechanic", is_active: true },
      { id: "s40", category_id: "69d09c14d5ee9e7be9aa301f", name: "Hair Stylists", is_active: true },
      { id: "s41", category_id: "69d09c14d5ee9e7be9aa301f", name: "Nail Technicians", is_active: true },
      { id: "s42", category_id: "69d09c14d5ee9e7be9aa301f", name: "Spa Services", is_active: true },
      { id: "s43", category_id: "69d09c14d5ee9e7be9aa301f", name: "Home Health Aides", is_active: true },
      { id: "s44", category_id: "69d09c14d5ee9e7be9aa301f", name: "Massage Therapists", is_active: true },
      { id: "s45", category_id: "69d09c14d5ee9e7be9aa301f", name: "Personal Trainers", is_active: true },
      { id: "s46", category_id: "69d09c14d5ee9e7be9aa301f", name: "Makeup Artists", is_active: true },
      { id: "s47", category_id: "69d09c14d5ee9e7be9aa3020", name: "Veterinary Services", is_active: true },
      { id: "s48", category_id: "69d09c14d5ee9e7be9aa3020", name: "Grooming", is_active: true },
      { id: "s49", category_id: "69d09c14d5ee9e7be9aa3020", name: "Pet Sitting/Walking", is_active: true },
      { id: "s50", category_id: "69d09c14d5ee9e7be9aa3020", name: "Pet Training", is_active: true },
      { id: "s51", category_id: "69d09c14d5ee9e7be9aa3020", name: "Mobile Grooming", is_active: true },
      { id: "s52", category_id: "69d09c14d5ee9e7be9aa3021", name: "Medical Transport", is_active: true },
      { id: "s53", category_id: "69d09c14d5ee9e7be9aa3021", name: "Airport Transport", is_active: true },
      { id: "s54", category_id: "69d09c14d5ee9e7be9aa3021", name: "Local Rides", is_active: true },
      { id: "s55", category_id: "69d09c14d5ee9e7be9aa3021", name: "Errand Services", is_active: true },
      { id: "s56", category_id: "69d09c14d5ee9e7be9aa3021", name: "Courier/Delivery Services", is_active: true },
      { id: "s57", category_id: "69d181fe57b60e0aecf4067e", name: "Accounting & Bookkeeping", is_active: true },
      { id: "s58", category_id: "69d181fe57b60e0aecf4067e", name: "Notary Services", is_active: true },
      { id: "s59", category_id: "69d181fe57b60e0aecf4067e", name: "IT Support", is_active: true },
      { id: "s60", category_id: "69d181fe57b60e0aecf4067e", name: "Legal Services", is_active: true },
      { id: "s61", category_id: "69d181fe57b60e0aecf4067e", name: "Business Consulting", is_active: true },
      { id: "s62", category_id: "69d181fe57b60e0aecf4067e", name: "Tax Preparation", is_active: true },
    ];
    const AREAS_STATIC = [
      { id: "va001", name: "Alhambra", is_active: true },
      { id: "va002", name: "Amelia", is_active: true },
      { id: "va003", name: "Ashland", is_active: true },
      { id: "va004", name: "Belle Aire", is_active: true },
      { id: "va005", name: "Belvedere", is_active: true },
      { id: "va006", name: "Bonita", is_active: true },
      { id: "va007", name: "Bonnybrook", is_active: true },
      { id: "va008", name: "Bradford", is_active: true },
      { id: "va009", name: "Briar Meadow", is_active: true },
      { id: "va010", name: "Bridgeport at Creekside Landing", is_active: true },
      { id: "va011", name: "Bridgeport at Lake Miona", is_active: true },
      { id: "va012", name: "Bridgeport at Lake Sumter", is_active: true },
      { id: "va013", name: "Bridgeport at Laurel Valley", is_active: true },
      { id: "va014", name: "Bridgeport at Miona Shores", is_active: true },
      { id: "va015", name: "Bridgeport at Mission Hills", is_active: true },
      { id: "va016", name: "Buttonwood", is_active: true },
      { id: "va017", name: "Calumet Grove", is_active: true },
      { id: "va018", name: "Caroline", is_active: true },
      { id: "va019", name: "Cason Hammock", is_active: true },
      { id: "va020", name: "Charlotte", is_active: true },
      { id: "va021", name: "Chatham", is_active: true },
      { id: "va022", name: "Chitty Chatty", is_active: true },
      { id: "va023", name: "Citrus Grove", is_active: true },
      { id: "va024", name: "Collier", is_active: true },
      { id: "va025", name: "Collier at Alden Bungalows", is_active: true },
      { id: "va026", name: "Collier at Antrim Dells", is_active: true },
      { id: "va027", name: "Country Club Hills", is_active: true },
      { id: "va028", name: "Dabney", is_active: true },
      { id: "va029", name: "De Allende", is_active: true },
      { id: "va030", name: "De La Vista", is_active: true },
      { id: "va031", name: "Del Mar", is_active: true },
      { id: "va032", name: "DeLuna", is_active: true },
      { id: "va033", name: "DeSoto", is_active: true },
      { id: "va034", name: "Dunedin", is_active: true },
      { id: "va035", name: "Duval", is_active: true },
      { id: "va036", name: "El Cortez", is_active: true },
      { id: "va037", name: "Fenney", is_active: true },
      { id: "va038", name: "Fernandina", is_active: true },
      { id: "va039", name: "Gilchrist", is_active: true },
      { id: "va040", name: "Glenbrook", is_active: true },
      { id: "va041", name: "Hacienda", is_active: true },
      { id: "va042", name: "Haciendas of Mission Hills", is_active: true },
      { id: "va043", name: "Hadley", is_active: true },
      { id: "va044", name: "Hammock at Fenney", is_active: true },
      { id: "va045", name: "Hawkins", is_active: true },
      { id: "va046", name: "Hemingway", is_active: true },
      { id: "va047", name: "Hillsborough", is_active: true },
      { id: "va048", name: "La Reynalda", is_active: true },
      { id: "va049", name: "La Zamora", is_active: true },
      { id: "va050", name: "LaBelle", is_active: true },
      { id: "va051", name: "Lake Deaton", is_active: true },
      { id: "va052", name: "Lake Denham", is_active: true },
      { id: "va053", name: "Lakeshore Cottages", is_active: true },
      { id: "va054", name: "Largo", is_active: true },
      { id: "va055", name: "Liberty Park", is_active: true },
      { id: "va056", name: "Linden", is_active: true },
      { id: "va057", name: "Lynnhaven", is_active: true },
      { id: "va058", name: "Mallory Square", is_active: true },
      { id: "va059", name: "Marsh Bend", is_active: true },
      { id: "va060", name: "McClure", is_active: true },
      { id: "va061", name: "Mira Mesa", is_active: true },
      { id: "va062", name: "Monarch Grove", is_active: true },
      { id: "va063", name: "Newell", is_active: true },
      { id: "va064", name: "Orange Blossom Gardens", is_active: true },
      { id: "va065", name: "Osceola Hills", is_active: true },
      { id: "va066", name: "Osceola Hills at Soaring Eagle Preserve", is_active: true },
      { id: "va067", name: "Palo Alto", is_active: true },
      { id: "va068", name: "Pennecamp", is_active: true },
      { id: "va069", name: "Piedmont", is_active: true },
      { id: "va070", name: "Pine Hills", is_active: true },
      { id: "va071", name: "Pine Ridge", is_active: true },
      { id: "va072", name: "Pinellas", is_active: true },
      { id: "va073", name: "Poinciana", is_active: true },
      { id: "va074", name: "Polo Ridge", is_active: true },
      { id: "va075", name: "Richmond", is_active: true },
      { id: "va076", name: "Rio Grande", is_active: true },
      { id: "va077", name: "Rio Ponderosa", is_active: true },
      { id: "va078", name: "Rio Ranchero", is_active: true },
      { id: "va079", name: "Sabal Chase", is_active: true },
      { id: "va080", name: "Sanibel", is_active: true },
      { id: "va081", name: "Santiago", is_active: true },
      { id: "va082", name: "Santo Domingo", is_active: true },
      { id: "va083", name: "Silver Lake", is_active: true },
      { id: "va084", name: "Springdale", is_active: true },
      { id: "va085", name: "St. Catherine", is_active: true },
      { id: "va086", name: "St. Charles", is_active: true },
      { id: "va087", name: "St. James", is_active: true },
      { id: "va088", name: "St. Johns", is_active: true },
      { id: "va089", name: "Summerhill", is_active: true },
      { id: "va090", name: "Sunset Pointe", is_active: true },
      { id: "va091", name: "Tall Trees", is_active: true },
      { id: "va092", name: "Tamarind Grove", is_active: true },
      { id: "va093", name: "Tierra Del Sol", is_active: true },
      { id: "va094", name: "Valle Verde", is_active: true },
      { id: "va095", name: "Virginia Trace", is_active: true },
      { id: "va096", name: "Winifred", is_active: true },
      { id: "va097", name: "Woodbury", is_active: true },
    ];
    setDbCategories(CATS_STATIC);
    setDbServices(SVCS_STATIC);
    setDbAreas(AREAS_STATIC);
  }, []);

  const toggleSvc = (id) => {
    setSelSvcs(prev => {
      const next = prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id];
      // Auto-set category from the first selected service
      if (next.length > 0) {
        const firstSvc = dbServices.find(s => s.id === next[0]);
        if (firstSvc) setSelCatId(firstSvc.category_id);
      } else {
        setSelCatId("");
      }
      return next;
    });
  };
  const toggleArea = (id) =>
    setSelAreas(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
  const toggleVillage = (id) =>
    setSelAreas(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
  const toggleMacro = (areaIds) => {
    const allChecked = areaIds.every(id => selAreas.includes(id));
    if (allChecked) {
      setSelAreas(prev => prev.filter(a => !areaIds.includes(a)));
    } else {
      setSelAreas(prev => [...new Set([...prev, ...areaIds])]);
    }
  };

  const validate = () => {
    const e = {};
    if (!businessName.trim()) e.businessName = true;
    if (!ownerName.trim())    e.ownerName    = true;
    if (!phone.trim())        e.phone        = true;
    if (!email.trim())        e.email        = true;
    if (selSvcs.length === 0) e.svcs         = true;
    if (selAreas.length === 0) e.areas       = true;
    if (!loginEmail.trim()) e.loginEmail = true;
    if (!loginPass.trim() || loginPass.length < 6) e.loginPass = true;
    if (loginPass !== loginPass2) e.loginPass2 = true;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const genAccountNum = () => {
    const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    const L1 = letters[Math.floor(Math.random() * letters.length)];
    const L2 = letters[Math.floor(Math.random() * letters.length)];
    const digits = String(Math.floor(100000 + Math.random() * 900000));
    return L1 + L2 + digits;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setSubmitting(true);
    try {
      const acct = genAccountNum();
      // Use backend function to bypass RLS for unauthenticated submissions
      // Build human-readable names for the admin email
      const svcNames = selSvcs.map(id => { const s = dbServices.find(x => x.id === id); return s ? s.name : id; });
      const areaNames = selAreas.map(id => { const a = dbAreas.find(x => x.id === id); return a ? a.name : id; });
      const catObj = dbCategories.find(c => c.id === selCatId);
      const catName = catObj ? catObj.name : "";

      const res = await fetch("https://api.base44.app/api/apps/69d062aca815ce8e697894b1/functions/submitListing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_name:     businessName,
          owner_name:        ownerName,
          phone:             phone,
          email:             email,
          website:           website || "",
          address:           address || "",
          description:       description || "",
          years_in_business: years ? Number(years) : 0,
          license_number:    license || "",
          services:          selSvcs,
          service_areas:     selAreas,
          category_id:       selCatId || null,
          service_names:     svcNames,
          area_names:        areaNames,
          category_name:     catName,
          login_email:       loginEmail || email,
          login_password:    loginPass,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");
      setAccountNum(data.vh_number || "VH-???");
      setSubmitted(true);
    } catch(err) {
      console.error("Submission error:", err);
      alert("There was a problem submitting your listing. Please try again.");
    } finally {
      setSubmitting(false);
    }
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
        <div style={{ textAlign: "center", maxWidth: 500 }}>
          <div style={{ fontSize: 52, marginBottom: 14 }}>🎉</div>
          <div style={{ fontSize: isMobile ? 22 : 26, fontWeight: 900, color: INK, textTransform: "uppercase", letterSpacing: 2, marginBottom: 6 }}>
            Thank You for Your Listing!
          </div>
          <div style={{ height: 2, background: INK, margin: "10px auto 20px", width: 140, opacity: 0.25 }} />

          {/* Account Number Box */}
          <div style={{ background: PAPER_MID, border: `2px solid ${BROWN_BTN}`, borderRadius: 8, padding: "20px 24px", marginBottom: 22, boxShadow: "0 3px 12px rgba(0,0,0,0.12)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: INK_FADE, marginBottom: 8 }}>Your V-Hub Account Number</div>
            <div style={{ fontSize: isMobile ? 32 : 38, fontWeight: 900, color: BROWN_BTN, letterSpacing: 6, fontFamily: "'Courier New', monospace", marginBottom: 6 }}>{accountNum}</div>
            <div style={{ fontSize: 11, color: INK_FADE, fontStyle: "italic" }}>Save this number — it identifies your provider account</div>
          </div>

          <div style={{ fontSize: isMobile ? 14 : 13, color: INK_FADE, lineHeight: 1.8, marginBottom: 10, textAlign: "left", background: PAPER_MID, border: `1px solid ${PAPER_DK}`, borderRadius: 6, padding: "14px 18px" }}>
            <div style={{ fontWeight: 700, color: INK, marginBottom: 8, fontSize: 13 }}>What happens next:</div>
            <div>📋 <strong>Step 1</strong> — Your listing is now pending review by our Admin.</div>
            <div style={{ marginTop: 6 }}>✅ <strong>Step 2</strong> — Once approved, you'll get a confirmation email at <strong>{email || "the address you provided"}</strong>.</div>
            <div style={{ marginTop: 6 }}>🗂 <strong>Step 3</strong> — Sign into your <strong>Provider Hub</strong> at any time using this email address to manage your listing, view stats, and update your profile.</div>
          </div>

          <div style={{ fontSize: 12, color: INK_FADE, fontStyle: "italic", marginBottom: 24 }}>
            Questions? Contact us at <a href="mailto:admin@v-hub.us" style={{ color: BROWN_BTN }}>admin@v-hub.us</a>
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
            Complete the form below — Admin will review and activate your listing.
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
              ["97", "Villages"],
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
                <input style={{ ...inS, borderColor: errors.email ? RED_RULE : PAPER_DK }} value={email} onChange={e => { setEmail(e.target.value); if (!loginEmail || loginEmail === email) setLoginEmail(e.target.value); }} placeholder="you@example.com" type="email" />
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
                  onChange={e => setDescription(e.target.value.slice(0, 150))}
                  maxLength={150}
                  placeholder="Tell residents what makes your business special — experience, specialties, values..."
                />
                <div style={{ textAlign: "right", fontSize: 11, color: description.length >= 140 ? "#cc0000" : INK_FADE, marginTop: 3 }}>{description.length}/150</div>
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
                <strong style={{ color: INK }}>Selected ({selSvcs.length}):</strong> {selSvcs.map(id => { const s = dbServices.find(x => x.id === id); return s ? s.name : id; }).join(" · ")}
              </div>
            )}
            {errBox("svcs", "Please select at least one service")}
            <div style={{ marginTop: 10 }}>
              {dbCategories.map(cat => {
                const catSvcs = dbServices.filter(s => s.category_id === cat.id);
                return (
                  <SvcCategory key={cat.id} cat={{ ...cat, services: catSvcs }}
                    openCat={openCat} setOpenCat={setOpenCat}
                    selSvcs={selSvcs} toggleSvc={toggleSvc}
                    isMobile={true}
                  />
                );
              })}
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
              {areaOpen && (() => {
                // Group by macro region using MACRO_AREAS
                return MACRO_AREAS.map(macro => {
                  // Find db villages whose name matches this macro's village list
                  const macroVillages = dbAreas.filter(a =>
                    macro.villages.some(v => v.toLowerCase() === a.name.toLowerCase())
                  );
                  if (macroVillages.length === 0) return null;
                  const isExpanded = openMacro === macro.key;
                  const macroIds = macroVillages.map(a => a.id);
                  const checkedCount = macroIds.filter(id => selAreas.includes(id)).length;
                  const allChecked = checkedCount === macroIds.length;
                  const someChecked = checkedCount > 0 && !allChecked;
                  return (
                    <div key={macro.key}>
                      <div style={{ display: "flex", alignItems: "center", borderBottom: `1px solid ${PAPER_DK}`, background: someChecked || allChecked ? "rgba(122,72,32,0.08)" : "transparent" }}>
                        <div onClick={() => toggleMacro(macroIds)} style={{ width: 20, height: 20, border: `2px solid ${allChecked ? BROWN_BTN : someChecked ? BROWN_BTN : PAPER_DK}`, borderRadius: 3, background: allChecked ? BROWN_BTN : PAPER, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, margin: "12px 10px 12px 14px", cursor: "pointer" }}>
                          {allChecked && <span style={{ color: PAPER, fontSize: 11 }}>✓</span>}
                          {someChecked && <span style={{ color: BROWN_BTN, fontSize: 11 }}>–</span>}
                        </div>
                        <div onClick={() => setOpenMacro(isExpanded ? null : macro.key)} style={{ flex: 1, padding: "12px 0", cursor: "pointer", fontWeight: 700, fontSize: 13, color: INK, fontFamily: "'Times New Roman', serif" }}>
                          {macro.label} {checkedCount > 0 ? <span style={{ fontSize: 11, color: BROWN_BTN }}>({checkedCount} selected)</span> : ""}
                        </div>
                        <div onClick={() => setOpenMacro(isExpanded ? null : macro.key)} style={{ padding: "12px 14px", cursor: "pointer", fontSize: 11, color: INK }}>{isExpanded ? "▲" : "▼"}</div>
                      </div>
                      {isExpanded && macroVillages.sort((a,b) => a.name.localeCompare(b.name)).map(area => {
                        const checked = selAreas.includes(area.id);
                        return (
                          <div key={area.id} onClick={() => toggleVillage(area.id)}
                            style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 14px 9px 44px", cursor: "pointer", background: checked ? "rgba(122,72,32,0.06)" : PAPER_MID, borderBottom: `1px solid ${PAPER_DK}` }}>
                            <div style={{ width: 16, height: 16, border: `2px solid ${checked ? BROWN_BTN : PAPER_DK}`, borderRadius: 3, background: checked ? BROWN_BTN : PAPER, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              {checked && <span style={{ color: PAPER, fontSize: 10 }}>✓</span>}
                            </div>
                            <span style={{ fontSize: 13, color: INK, fontFamily: "'Times New Roman', serif" }}>{area.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  );
                });
              })()}
            </div>
            {selAreas.length > 0 && (
              <div style={{ background: PAPER_MID, border: `1px solid ${PAPER_DK}`, borderRadius: 5, padding: "8px 12px", marginTop: 8, fontSize: 12, color: INK_FADE }}>
                <strong style={{ color: INK }}>📍 {selAreas.length} village{selAreas.length > 1 ? "s" : ""} selected:</strong> {selAreas.map(id => { const a = dbAreas.find(x => x.id === id); return a ? a.name : id; }).join(", ")}
              </div>
            )}
          </div>

          {/* ── Mobile success story strip ── */}
          <div style={{ background: PAPER_MID, border: `1.5px solid ${PAPER_DK}`, borderRadius: 8, padding: "16px 16px", marginBottom: 28 }}>
            <div style={{ fontSize: 11, fontWeight: 900, color: INK, textTransform: "uppercase", letterSpacing: 2, marginBottom: 12, borderBottom: `2px solid ${INK}`, paddingBottom: 5 }}>Why List on V-Hub?</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {RIGHT_STORIES.map((s, i) => <Story key={i} {...s} isMobile={true} />)}
            </div>
            <div style={{ marginTop: 16, borderTop: `1px solid ${PAPER_DK}`, paddingTop: 14, textAlign: "center" }}>
              <div style={{ fontSize: 13, fontWeight: 900, color: INK, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>Questions?</div>
              <a href="mailto:admin@v-hub.us" style={{ textDecoration: "none" }}>
                <div style={{ background: BROWN_BTN, color: PAPER, borderRadius: 6, padding: "11px 16px", fontSize: 14, fontWeight: 700, fontFamily: "'Times New Roman', serif", letterSpacing: 1 }}>
                  admin@v-hub.us
                </div>
              </a>
            </div>
          </div>

          {/* Section 4 — Account Setup */}
          <div style={{ borderTop: `2px solid ${INK}`, paddingTop: 22, marginBottom: 8 }}>
            <div style={{ ...shS, marginBottom: 18 }}>Section 4 — Provider Hub Login *</div>
            <div style={{ background: "#E8F5E9", border: "2px solid #4CAF50", borderRadius: 10, padding: "14px 16px", marginBottom: 18, fontSize: 13, color: "#2E7D32", lineHeight: 1.7 }}>
              🔐 <strong>Choose your login credentials</strong> for the V-Hub Provider Hub. You'll use these to access your dashboard, view stats, and manage your listing after approval.
            </div>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "12px 16px" }}>
              <div style={{ gridColumn: isMobile ? "1" : "1 / -1" }}>
                <label style={{ ...lbS, color: errors.loginEmail ? RED_RULE : INK_FADE }}>Login Email *</label>
                <input
                  style={{ ...inS, borderColor: errors.loginEmail ? RED_RULE : PAPER_DK }}
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  placeholder="The email you'll use to log in"
                  type="email"
                />
                {errors.loginEmail && <div style={{ fontSize: 11, color: RED_RULE, marginTop: 3 }}>Required</div>}
                <div style={{ fontSize: 11, color: INK_FADE, marginTop: 4, fontStyle: "italic" }}>Can be the same as your business email above, or a different one.</div>
              </div>

              <div>
                <label style={{ ...lbS, color: errors.loginPass ? RED_RULE : INK_FADE }}>Password * <span style={{ fontWeight: 400, textTransform: "none", fontSize: 11 }}>(min. 6 characters)</span></label>
                <div style={{ position: "relative" }}>
                  <input
                    style={{ ...inS, borderColor: errors.loginPass ? RED_RULE : PAPER_DK, paddingRight: 44 }}
                    value={loginPass}
                    onChange={e => setLoginPass(e.target.value)}
                    placeholder="Create a password"
                    type={showPass ? "text" : "password"}
                  />
                  <button onClick={() => setShowPass(p => !p)} type="button" style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, color: INK_FADE }}>
                    {showPass ? "🙈" : "👁️"}
                  </button>
                </div>
                {errors.loginPass && <div style={{ fontSize: 11, color: RED_RULE, marginTop: 3 }}>Must be at least 6 characters</div>}
              </div>

              <div>
                <label style={{ ...lbS, color: errors.loginPass2 ? RED_RULE : INK_FADE }}>Confirm Password *</label>
                <input
                  style={{ ...inS, borderColor: errors.loginPass2 ? RED_RULE : PAPER_DK }}
                  value={loginPass2}
                  onChange={e => setLoginPass2(e.target.value)}
                  placeholder="Re-enter your password"
                  type={showPass ? "text" : "password"}
                />
                {errors.loginPass2 && <div style={{ fontSize: 11, color: RED_RULE, marginTop: 3 }}>Passwords do not match</div>}
              </div>
            </div>
          </div>

          {/* Submit */}
          <div style={{ borderTop: `2px solid ${INK}`, paddingTop: 22, textAlign: "center" }}>
            <div style={{ fontSize: 13, color: INK_FADE, fontStyle: "italic", marginBottom: 16, lineHeight: 1.6 }}>
              By submitting, you agree to V-Hub's{" "}
              <a href="/Terms" style={{ color: BROWN_BTN }}>Terms of Service</a> and{" "}
              <a href="/Privacy" style={{ color: BROWN_BTN }}>Privacy Policy</a>, and consent to your business being listed in V-Hub's public directory.
              Admin will review and activate your profile — usually within 1 business day.
            </div>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              style={{
                width: "100%",
                background: submitting ? PAPER_DK : `linear-gradient(180deg,#9A6030,${BROWN_BTN} 60%,#5A3010)`,
                color: submitting ? INK_FADE : PAPER, border: `3px solid ${YELLOW}`,
                boxShadow: `0 0 0 1.5px ${YELLOW}, 0 0 14px 4px rgba(255,220,0,0.3)`,
                borderRadius: 8, padding: "18px 20px",
                fontSize: 17, fontWeight: 900, cursor: submitting ? "not-allowed" : "pointer",
                fontFamily: "'Times New Roman', serif", letterSpacing: 2, textTransform: "uppercase",
              }}
            >
              {submitting ? "Submitting..." : "Submit My Listing →"}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", padding: "14px 16px", borderTop: `2px double ${INK}`, fontSize: 11, color: INK_FADE, fontStyle: "italic", background: PAPER }}>
          © 2026 V-Hub · The Villages, Florida · <a href="/" style={{ color: INK_FADE }}>Home</a> · <a href="/Terms" style={{ color: INK_FADE }}>Terms</a> · <a href="/Privacy" style={{ color: INK_FADE }}>Privacy</a>
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
          Complete the form below — Admin will review and activate your listing.
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
            <div style={{ fontSize: 11, color: INK_FADE, fontStyle: "italic", lineHeight: 1.5 }}>All V-Hub listings are manually reviewed by Admin before going live.</div>
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
              <textarea style={{ ...inS, resize: "vertical", minHeight: 90, lineHeight: 1.6 }} value={description} onChange={e => setDescription(e.target.value.slice(0, 150))} maxLength={150} placeholder="Tell residents what makes your business special..." />
              <div style={{ textAlign: "right", fontSize: 11, color: description.length >= 140 ? "#cc0000" : INK_FADE, marginTop: 3 }}>{description.length}/150</div>
            </div>
          </div>

          <div style={{ height: 1, background: INK, opacity: 0.15, margin: "6px 0 24px" }} />

          {/* Section 2 */}
          <div style={{ marginBottom: 26 }}>
            <div style={{ ...shS, color: errors.svcs ? RED_RULE : INK, borderBottomColor: errors.svcs ? RED_RULE : INK }}>Section 2 — Services You Offer *</div>
            <div style={{ fontSize: 12, color: INK_FADE, fontStyle: "italic", marginBottom: 12 }}>Click a category to expand it, then check every service that applies. Select as many as you like.</div>
            {selSvcs.length > 0 && (
              <div style={{ background: PAPER_MID, border: `1px solid ${PAPER_DK}`, borderRadius: 5, padding: "8px 12px", marginBottom: 10, fontSize: 12, color: INK_FADE }}>
                <strong style={{ color: INK }}>Selected ({selSvcs.length}):</strong> {selSvcs.map(id => { const s = dbServices.find(x => x.id === id); return s ? s.name : id; }).join(" · ")}
              </div>
            )}
            {errBox("svcs", "Please select at least one service")}
            <div style={{ marginTop: 8 }}>
              {dbCategories.map(cat => {
                const catSvcs = dbServices.filter(s => s.category_id === cat.id);
                return (
                  <SvcCategory key={cat.id} cat={{ ...cat, services: catSvcs }}
                    openCat={openCat} setOpenCat={setOpenCat}
                    selSvcs={selSvcs} toggleSvc={toggleSvc}
                    isMobile={false}
                  />
                );
              })}
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
              {areaOpen && (() => {
                // Group by macro region using MACRO_AREAS
                return MACRO_AREAS.map(macro => {
                  // Find db villages whose name matches this macro's village list
                  const macroVillages = dbAreas.filter(a =>
                    macro.villages.some(v => v.toLowerCase() === a.name.toLowerCase())
                  );
                  if (macroVillages.length === 0) return null;
                  const isExpanded = openMacro === macro.key;
                  const macroIds = macroVillages.map(a => a.id);
                  const checkedCount = macroIds.filter(id => selAreas.includes(id)).length;
                  const allChecked = checkedCount === macroIds.length;
                  const someChecked = checkedCount > 0 && !allChecked;
                  return (
                    <div key={macro.key}>
                      <div style={{ display: "flex", alignItems: "center", borderBottom: `1px solid ${PAPER_DK}`, background: someChecked || allChecked ? "rgba(122,72,32,0.08)" : "transparent" }}>
                        <div onClick={() => toggleMacro(macroIds)} style={{ width: 20, height: 20, border: `2px solid ${allChecked ? BROWN_BTN : someChecked ? BROWN_BTN : PAPER_DK}`, borderRadius: 3, background: allChecked ? BROWN_BTN : PAPER, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, margin: "12px 10px 12px 14px", cursor: "pointer" }}>
                          {allChecked && <span style={{ color: PAPER, fontSize: 11 }}>✓</span>}
                          {someChecked && <span style={{ color: BROWN_BTN, fontSize: 11 }}>–</span>}
                        </div>
                        <div onClick={() => setOpenMacro(isExpanded ? null : macro.key)} style={{ flex: 1, padding: "12px 0", cursor: "pointer", fontWeight: 700, fontSize: 13, color: INK, fontFamily: "'Times New Roman', serif" }}>
                          {macro.label} {checkedCount > 0 ? <span style={{ fontSize: 11, color: BROWN_BTN }}>({checkedCount} selected)</span> : ""}
                        </div>
                        <div onClick={() => setOpenMacro(isExpanded ? null : macro.key)} style={{ padding: "12px 14px", cursor: "pointer", fontSize: 11, color: INK }}>{isExpanded ? "▲" : "▼"}</div>
                      </div>
                      {isExpanded && macroVillages.sort((a,b) => a.name.localeCompare(b.name)).map(area => {
                        const checked = selAreas.includes(area.id);
                        return (
                          <div key={area.id} onClick={() => toggleVillage(area.id)}
                            style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 14px 9px 44px", cursor: "pointer", background: checked ? "rgba(122,72,32,0.06)" : PAPER_MID, borderBottom: `1px solid ${PAPER_DK}` }}>
                            <div style={{ width: 16, height: 16, border: `2px solid ${checked ? BROWN_BTN : PAPER_DK}`, borderRadius: 3, background: checked ? BROWN_BTN : PAPER, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              {checked && <span style={{ color: PAPER, fontSize: 10 }}>✓</span>}
                            </div>
                            <span style={{ fontSize: 13, color: INK, fontFamily: "'Times New Roman', serif" }}>{area.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  );
                });
              })()}
            </div>
            {selAreas.length > 0 && (
              <div style={{ background: PAPER_MID, border: `1px solid ${PAPER_DK}`, borderRadius: 5, padding: "8px 12px", marginTop: 8, fontSize: 12, color: INK_FADE }}>
                <strong style={{ color: INK }}>📍 {selAreas.length} village{selAreas.length > 1 ? "s" : ""} selected:</strong> {selAreas.map(id => { const a = dbAreas.find(x => x.id === id); return a ? a.name : id; }).join(", ")}
              </div>
            )}
          </div>


          {/* Section 4 — Account Setup */}
          <div style={{ borderTop: `2px solid ${INK}`, paddingTop: 22, marginBottom: 8 }}>
            <div style={{ ...shS, marginBottom: 18 }}>Section 4 — Provider Hub Login *</div>
            <div style={{ background: "#E8F5E9", border: "2px solid #4CAF50", borderRadius: 10, padding: "14px 16px", marginBottom: 18, fontSize: 13, color: "#2E7D32", lineHeight: 1.7 }}>
              🔐 <strong>Choose your login credentials</strong> for the V-Hub Provider Hub. You'll use these to access your dashboard, view stats, and manage your listing after approval.
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 16px" }}>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ ...lbS, color: errors.loginEmail ? RED_RULE : INK_FADE }}>Login Email *</label>
                <input
                  style={{ ...inS, borderColor: errors.loginEmail ? RED_RULE : PAPER_DK }}
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  placeholder="The email you'll use to log in"
                  type="email"
                />
                {errors.loginEmail && <div style={{ fontSize: 11, color: RED_RULE, marginTop: 3 }}>Required</div>}
                <div style={{ fontSize: 11, color: INK_FADE, marginTop: 4, fontStyle: "italic" }}>Can be the same as your business email above, or a different one.</div>
              </div>
              <div>
                <label style={{ ...lbS, color: errors.loginPass ? RED_RULE : INK_FADE }}>Password * <span style={{ fontWeight: 400, textTransform: "none", fontSize: 11 }}>(min. 6 characters)</span></label>
                <div style={{ position: "relative" }}>
                  <input
                    style={{ ...inS, borderColor: errors.loginPass ? RED_RULE : PAPER_DK, paddingRight: 44 }}
                    value={loginPass}
                    onChange={e => setLoginPass(e.target.value)}
                    placeholder="Create a password"
                    type={showPass ? "text" : "password"}
                  />
                  <button onClick={() => setShowPass(p => !p)} type="button" style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, color: INK_FADE }}>
                    {showPass ? "🙈" : "👁️"}
                  </button>
                </div>
                {errors.loginPass && <div style={{ fontSize: 11, color: RED_RULE, marginTop: 3 }}>Must be at least 6 characters</div>}
              </div>
              <div>
                <label style={{ ...lbS, color: errors.loginPass2 ? RED_RULE : INK_FADE }}>Confirm Password *</label>
                <input
                  style={{ ...inS, borderColor: errors.loginPass2 ? RED_RULE : PAPER_DK }}
                  value={loginPass2}
                  onChange={e => setLoginPass2(e.target.value)}
                  placeholder="Re-enter your password"
                  type={showPass ? "text" : "password"}
                />
                {errors.loginPass2 && <div style={{ fontSize: 11, color: RED_RULE, marginTop: 3 }}>Passwords do not match</div>}
              </div>
            </div>
          </div>

          {/* Submit */}
          <div style={{ borderTop: `2px solid ${INK}`, paddingTop: 20, textAlign: "center" }}>
            <div style={{ fontSize: 12, color: INK_FADE, fontStyle: "italic", marginBottom: 14, lineHeight: 1.6 }}>
              By submitting, you agree to be listed in V-Hub's public directory.<br />
              Admin will contact you to confirm and activate your profile.
            </div>
            <button onClick={handleSubmit} disabled={submitting} style={{
              background: submitting ? PAPER_DK : `linear-gradient(180deg,#9A6030,${BROWN_BTN} 60%,#5A3010)`,
              color: submitting ? INK_FADE : PAPER, border: `3px solid ${YELLOW}`,
              boxShadow: `0 0 0 1.5px ${YELLOW}, 0 0 12px 3px rgba(255,220,0,0.3)`,
              borderRadius: 6, padding: "15px 48px",
              fontSize: 15, fontWeight: 900, cursor: submitting ? "not-allowed" : "pointer",
              fontFamily: "'Times New Roman', serif", letterSpacing: 3, textTransform: "uppercase",
            }}>
              {submitting ? "Submitting..." : "Submit My Listing →"}
            </button>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div style={{ padding: "22px 20px 20px 18px" }}>
          <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: 3, textTransform: "uppercase", color: INK, borderBottom: `2px solid ${INK}`, paddingBottom: 4, marginBottom: 10, textAlign: "center" }}>Why List on V-Hub?</div>
          {RIGHT_STORIES.map((s, i) => (
            <div key={i} style={{ marginBottom: 20, paddingBottom: 16, borderBottom: `1px solid ${PAPER_DK}` }}>
              <div style={{ fontSize: 13, fontWeight: 900, color: INK, lineHeight: 1.3, marginBottom: 2 }}>{s.head}</div>
              <div style={{ fontSize: 11, fontStyle: "italic", color: RED_RULE, marginBottom: 6 }}>{s.sub}</div>
              <div style={{ fontSize: 12, color: INK_FADE, lineHeight: 1.65 }}>{s.body}</div>
            </div>
          ))}
          <div style={{ border: `2px solid ${BROWN_BTN}`, borderRadius: 4, padding: "14px 12px", textAlign: "center", background: PAPER_MID, marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 900, color: INK, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>Questions?</div>
            <div style={{ fontSize: 12, color: INK_FADE, fontStyle: "italic", lineHeight: 1.6, marginBottom: 8 }}>Contact Admin directly.</div>
            <a href="mailto:admin@v-hub.us" style={{ textDecoration: "none" }}>
              <div style={{ background: BROWN_BTN, color: PAPER, borderRadius: 4, padding: "8px 12px", fontSize: 12, fontWeight: 700, fontFamily: "'Times New Roman', serif", letterSpacing: 1 }}>admin@v-hub.us</div>
            </a>
          </div>
          <div style={{ margin: "16px 0", textAlign: "center", color: PAPER_DK, fontSize: 16 }}>✦ ✦ ✦</div>
          <div style={{ border: `1.5px solid ${PAPER_DK}`, borderRadius: 4, padding: "12px 10px", background: PAPER }}>
            <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: 3, textTransform: "uppercase", color: INK, borderBottom: `2px solid ${INK}`, paddingBottom: 4, marginBottom: 10, textAlign: "center" }}>V-Hub By the Numbers</div>
            {[["97","Villages Covered"],["9","Service Categories"],["62","Searchable Services"],["#1","Local Directory"]].map(([num, label]) => (
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
        © 2026 V-Hub · The Villages, Florida · <a href="/" style={{ color: INK_FADE }}>Home</a> · <a href="/Terms" style={{ color: INK_FADE }}>Terms</a> · <a href="/Privacy" style={{ color: INK_FADE }}>Privacy</a>
      </div>
    </div>
  );
}
