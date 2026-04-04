import { useState, useEffect } from "react";
import { ServiceArea, Category, Service, Provider } from "@/api/entities";

const BRAND = {
  orange: "#E8431A",
  paper: "#D4C5A0",
  paperLight: "#E8DCC0",
  paperDark: "#B8A882",
  ink: "#1A1008",
  inkLight: "#3D2E14",
  inkFade: "#6B5A3E",
  blue: "#1565C0",
};

const SECTIONS = [
  { key: "Historic Side | Spanish Springs",         label: "Historic Side",        sub: "Spanish Springs",    emoji: "🌴", color: "#6B3A1F" },
  { key: "Established Villages | North of SR-466A", label: "Established Villages", sub: "North of SR-466A",   emoji: "🏡", color: "#3D5C2A" },
  { key: "Newer Villages | South of SR-44",         label: "Newer Villages",       sub: "South of SR-44",     emoji: "🌿", color: "#2A5C2A" },
  { key: "Eastport | Newest Development Area",      label: "Eastport",             sub: "Newest Development", emoji: "🌊", color: "#1A3F6F" },
  { key: "Family & Non-Age-Restricted Villages",    label: "Family Villages",      sub: "Non-Age-Restricted", emoji: "🏠", color: "#4A2E6B" },
];

const FILLER = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation. Duis aute irure dolor in reprehenderit voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident. Sunt in culpa qui officia deserunt mollit anim id est laborum. Curabitur pretium tincidunt lacus nulla sapien semper ligula, laoreet fames vel.";
const FILLER2 = "Pellentesque habitant morbi tristique senectus et netus malesuada fames ac turpis egestas. Vestibulum tortor quam feugiat vitae ultricies eget tempor. Donec eu libero sit amet quam egestas semper. Aenean ultricies mi vitae est mauris placerat eleifend. Nam libero tempore cum soluta nobis eligendi optio cumque nihil impedit quo minus.";
const FILLER3 = "Temporibus autem quibusdam et aut officiis debitis rerum necessitatibus saepe eveniet voluptates repudiandae molestiae recusandae. Itaque earum rerum hic tenetur sapiente delectus aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat occaecati cupiditate non provident.";

function isVillageRecord(a) { return a.name.includes("—"); }
function getVillageName(a) { const p = a.name.split("—"); return p.length > 1 ? p[1].trim() : a.name; }
function groupAreas(areas) {
  const g = {};
  SECTIONS.forEach(s => (g[s.key] = []));
  areas.filter(isVillageRecord).forEach(a => { if (g[a.description] !== undefined) g[a.description].push(a); });
  return g;
}

// ── Burger Menu ───────────────────────────────────────────────────────────────
function BurgerMenu({ dark = false }) {
  const [open, setOpen] = useState(false);
  const lc = dark ? BRAND.paperLight : BRAND.ink;
  const links = [
    { label: "🏠 Home", href: "/", color: "#6B3A1F" },
    { label: "🔍 Find Services", href: "/", color: BRAND.orange },
    { label: "📋 List Your Service", href: "/list-service", color: "#1A3F6F" },
  ];
  return (
    <>
      <button onClick={() => setOpen(true)} style={{ background: dark ? "rgba(255,255,255,0.12)" : "rgba(26,16,8,0.08)", border: `1.5px solid ${dark ? "rgba(255,255,255,0.25)" : "rgba(26,16,8,0.2)"}`, borderRadius: 6, padding: "8px 11px", cursor: "pointer", display: "flex", flexDirection: "column", gap: 4 }}>
        <span style={{ display: "block", width: 18, height: 2, background: lc, borderRadius: 1 }} />
        <span style={{ display: "block", width: 18, height: 2, background: lc, borderRadius: 1 }} />
        <span style={{ display: "block", width: 18, height: 2, background: lc, borderRadius: 1 }} />
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 199, background: "rgba(0,0,0,0.5)" }} />
          <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 260, background: BRAND.paperLight, zIndex: 200, boxShadow: "-4px 0 24px rgba(0,0,0,0.3)", display: "flex", flexDirection: "column", fontFamily: "'Times New Roman', serif" }}>
            <div style={{ background: BRAND.ink, padding: "18px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ color: BRAND.paperLight, fontWeight: 900, fontSize: 17, letterSpacing: 2, fontFamily: "'Times New Roman', serif" }}>V-HUB</span>
              <button onClick={() => setOpen(false)} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", borderRadius: 5, width: 26, height: 26, fontSize: 14, cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ padding: "12px 10px", flex: 1 }}>
              {links.map((l, i) => (
                <a key={i} href={l.href} style={{ textDecoration: "none" }}>
                  <div style={{ padding: "13px 14px", borderRadius: 6, fontSize: 15, fontWeight: 700, color: BRAND.ink, marginBottom: 5, background: BRAND.paper, borderLeft: `4px solid ${l.color}`, fontFamily: "'Times New Roman', serif" }}>{l.label}</div>
                </a>
              ))}
            </div>
            <div style={{ padding: "10px 16px", borderTop: `1px solid ${BRAND.paperDark}`, textAlign: "center", fontSize: 10, color: BRAND.inkFade, fontStyle: "italic" }}>V-HUB · The Villages, FL</div>
          </div>
        </>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function Home() {
  const [areas, setAreas] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedArea, setSelectedArea] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [villageOpen, setVillageOpen] = useState(false);
  const [serviceOpen, setServiceOpen] = useState(false);
  const [openSection, setOpenSection] = useState(null);
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);

  useEffect(() => {
    ServiceArea.filter({ is_active: true }).then(setAreas);
    Category.filter({ is_active: true }).then(setCategories);
  }, []);

  const groupedAreas = groupAreas(areas);

  const handleSearch = async () => {
    if (!selectedArea) return;
    const { Provider, Service } = await import("@/api/entities");
    const all = await Provider.filter({ is_visible: true });
    const filtered = all.filter(p => {
      const areaMatch = p.service_areas && p.service_areas.includes(selectedArea.id);
      const catMatch = !selectedCategory || p.category_id === selectedCategory;
      const statusMatch = p.subscription_status === "active" || p.subscription_status === "trial";
      return areaMatch && catMatch && statusMatch;
    });
    filtered.sort((a, b) => ({ premium: 0, featured: 1, basic: 2 }[a.subscription_tier] ?? 3) - ({ premium: 0, featured: 1, basic: 2 }[b.subscription_tier] ?? 3));
    setResults(filtered);
    setSearched(true);
  };

  const handleReset = () => {
    setSelectedArea(null); setSelectedCategory("");
    setResults([]); setSearched(false); setSelectedProvider(null);
    setVillageOpen(false); setServiceOpen(false); setOpenSection(null);
  };

  if (selectedProvider) return <ProviderProfile provider={selectedProvider} areas={areas} categories={categories} onBack={() => setSelectedProvider(null)} />;
  if (searched) return <ResultsPage results={results} areas={areas} categories={categories} onReset={handleReset} onSelect={setSelectedProvider} selectedArea={selectedArea} />;

  // Close dropdowns on outside click
  const closeAll = () => { setVillageOpen(false); setServiceOpen(false); };

  return (
    <div onClick={closeAll} style={{ minHeight: "100vh", background: BRAND.paper, fontFamily: "'Times New Roman', Georgia, serif", position: "relative", overflow: "hidden" }}>

      {/* ── Aged paper texture overlay ── */}
      <div style={{ position: "fixed", inset: 0, backgroundImage: "url('https://www.transparenttextures.com/patterns/old-mathematics.png')", opacity: 0.08, pointerEvents: "none", zIndex: 0 }} />

      <div style={{ position: "relative", zIndex: 1 }}>

        {/* ══ TOP STRIP ══ */}
        <div style={{ background: BRAND.ink, padding: "4px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: BRAND.paperLight, fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Local News</span>
          <span style={{ color: BRAND.paperLight, fontSize: 11, fontWeight: 900, letterSpacing: 3, textTransform: "uppercase" }}>The Villages Daily</span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ color: BRAND.paperLight, fontSize: 9, letterSpacing: 1, textTransform: "uppercase" }}>Serving Our Community · Est. 1985</div>
            </div>
            <BurgerMenu dark={true} />
          </div>
        </div>

        {/* ══ MASTHEAD ══ */}
        <div style={{ background: BRAND.paperLight, padding: "0 16px 0", borderBottom: `3px solid ${BRAND.ink}` }}>
          {/* Top thin rule */}
          <div style={{ height: 1, background: BRAND.ink, marginBottom: 0 }} />

          {/* Three column headers */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1px 1fr 1px 1fr", gap: 0, borderBottom: `1px solid ${BRAND.ink}`, padding: "8px 0" }}>
            <div style={{ paddingRight: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 900, color: BRAND.ink, letterSpacing: 1, textTransform: "uppercase", lineHeight: 1.2 }}>Community Connections</div>
              <div style={{ fontSize: 9, color: BRAND.inkFade, fontStyle: "italic", marginTop: 2 }}>Bringing Local Services to You</div>
            </div>
            <div style={{ background: BRAND.ink, alignSelf: "stretch" }} />
            <div style={{ padding: "0 12px", textAlign: "center" }}>
              <div style={{ fontSize: 11, fontWeight: 900, color: BRAND.ink, letterSpacing: 1, textTransform: "uppercase", lineHeight: 1.3 }}>Support Local<br/>Build Community</div>
            </div>
            <div style={{ background: BRAND.ink, alignSelf: "stretch" }} />
            <div style={{ paddingLeft: 12, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 900, color: BRAND.ink, letterSpacing: 1, textTransform: "uppercase", lineHeight: 1.3 }}>Your Guide to<br/>The Villages</div>
              </div>
              <a href="/list-service" style={{ textDecoration: "none" }} onClick={e => e.stopPropagation()}>
                <button style={{ background: BRAND.orange, color: "#fff", border: "none", borderRadius: 4, padding: "6px 12px", fontSize: 10, fontWeight: 900, cursor: "pointer", fontFamily: "'Times New Roman', serif", letterSpacing: 1, textTransform: "uppercase", whiteSpace: "nowrap", boxShadow: "0 2px 6px rgba(0,0,0,0.25)" }}>
                  List Your Service
                </button>
              </a>
            </div>
          </div>

          {/* ── BIG V-HUB LOGO CENTER ── */}
          <div style={{ textAlign: "center", padding: "8px 0 4px", position: "relative" }}>
            <div style={{ display: "inline-block", position: "relative" }}>
              {/* Palm tree silhouette left */}
              <span style={{ position: "absolute", left: -20, bottom: 8, fontSize: 52, lineHeight: 1, opacity: 0.85, filter: "grayscale(100%) brightness(0.15)" }}>🌴</span>
              {/* Main title */}
              <div style={{ fontSize: 76, fontWeight: 900, color: BRAND.ink, fontFamily: "'Times New Roman', serif", letterSpacing: 4, lineHeight: 1, textShadow: "3px 3px 0 rgba(0,0,0,0.15)", display: "inline-block", paddingLeft: 40 }}>
                V-HUB
              </div>
            </div>
            {/* Double rule + tagline */}
            <div style={{ height: 3, background: BRAND.ink, margin: "6px 0 2px" }} />
            <div style={{ height: 1, background: BRAND.ink, marginBottom: 5 }} />
            <div style={{ fontSize: 14, fontStyle: "italic", color: BRAND.ink, fontWeight: 700, letterSpacing: 1 }}>
              Connecting You to Local Services in The Villages!
            </div>
            <div style={{ height: 1, background: BRAND.ink, marginTop: 5 }} />
            <div style={{ height: 3, background: BRAND.ink, marginTop: 2, marginBottom: 0 }} />
          </div>
        </div>

        {/* ══ NEWSPAPER BODY — 3 COLUMNS ══ */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1px 1.4fr 1px 1fr", gap: 0, background: BRAND.paperLight, borderBottom: `2px solid ${BRAND.ink}` }}>

          {/* LEFT COLUMN */}
          <div style={{ padding: "10px 12px" }}>
            <div style={{ fontSize: 11, fontWeight: 900, color: BRAND.ink, textTransform: "uppercase", letterSpacing: 1, borderBottom: `1px solid ${BRAND.ink}`, paddingBottom: 3, marginBottom: 6 }}>Local Businesses<br/>Stronger Together</div>
            <div style={{ fontSize: 9, color: BRAND.inkFade, lineHeight: 1.7, textAlign: "justify" }}>{FILLER}</div>
            <div style={{ fontSize: 9, color: BRAND.inkFade, lineHeight: 1.7, textAlign: "justify", marginTop: 6 }}>{FILLER2.slice(0, 180)}</div>
          </div>

          {/* DIVIDER */}
          <div style={{ background: BRAND.ink }} />

          {/* CENTER COLUMN — SEARCH */}
          <div style={{ padding: "12px 16px" }} onClick={e => e.stopPropagation()}>

            {/* Small filler text above */}
            <div style={{ fontSize: 8, color: BRAND.inkFade, lineHeight: 1.6, textAlign: "justify", marginBottom: 10 }}>{FILLER3.slice(0, 120)}</div>

            {/* Vintage illustration box */}
            <div style={{ border: `1px solid ${BRAND.paperDark}`, borderRadius: 2, overflow: "hidden", marginBottom: 10, height: 90, background: BRAND.paper, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
              <img src="https://media.base44.com/images/public/69d062aca815ce8e697894b1/392f3af96_generated_image.png"
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 40%", filter: "sepia(80%) contrast(0.85) brightness(0.92)", display: "block" }} alt="" />
              <div style={{ position: "absolute", inset: 0, background: "rgba(212,197,160,0.2)" }} />
            </div>

            {/* Search section styled as a classified ad box */}
            <div style={{ border: `2px solid ${BRAND.ink}`, borderRadius: 2, padding: "10px 12px", background: BRAND.paper }}>
              <div style={{ textAlign: "center", borderBottom: `1px solid ${BRAND.ink}`, paddingBottom: 6, marginBottom: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: 2, color: BRAND.ink }}>Find Local Services</div>
              </div>

              {/* Service dropdown */}
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: BRAND.inkFade, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>What service do you need?</div>
                <div style={{ position: "relative" }}>
                  <button onClick={(e) => { e.stopPropagation(); setServiceOpen(!serviceOpen); setVillageOpen(false); }}
                    style={{ width: "100%", background: BRAND.paperLight, border: `1.5px solid ${BRAND.ink}60`, borderRadius: 2, padding: "7px 10px", fontSize: 12, fontFamily: "'Times New Roman', serif", color: selectedCategory ? BRAND.ink : BRAND.inkFade, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", textAlign: "left" }}>
                    <span>{selectedCategory ? categories.find(c => c.id === selectedCategory)?.name || "Select a Service" : "Select a Service"}</span>
                    <span style={{ fontSize: 9, color: BRAND.inkFade }}>▼</span>
                  </button>
                  {serviceOpen && (
                    <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: BRAND.paperLight, border: `1.5px solid ${BRAND.ink}60`, borderTop: "none", zIndex: 100, boxShadow: "0 6px 18px rgba(0,0,0,0.2)", maxHeight: 200, overflowY: "auto" }}>
                      <div onClick={() => { setSelectedCategory(""); setServiceOpen(false); }} style={{ padding: "8px 10px", cursor: "pointer", fontSize: 12, color: BRAND.inkFade, fontStyle: "italic", borderBottom: `1px solid ${BRAND.paperDark}`, fontFamily: "'Times New Roman', serif" }}>All Services</div>
                      {categories.map(c => (
                        <div key={c.id} onClick={() => { setSelectedCategory(c.id); setServiceOpen(false); }}
                          style={{ padding: "8px 10px", cursor: "pointer", fontSize: 12, color: BRAND.ink, background: selectedCategory === c.id ? BRAND.paper : BRAND.paperLight, borderBottom: `1px solid ${BRAND.paperDark}`, fontFamily: "'Times New Roman', serif" }}
                          onMouseEnter={e => e.currentTarget.style.background = BRAND.paper}
                          onMouseLeave={e => e.currentTarget.style.background = selectedCategory === c.id ? BRAND.paper : BRAND.paperLight}>
                          {c.icon} {c.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Village dropdown */}
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: BRAND.inkFade, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Where do you need it?</div>
                <div style={{ position: "relative" }}>
                  <button onClick={(e) => { e.stopPropagation(); setVillageOpen(!villageOpen); setServiceOpen(false); }}
                    style={{ width: "100%", background: BRAND.paperLight, border: `1.5px solid ${BRAND.ink}60`, borderRadius: 2, padding: "7px 10px", fontSize: 12, fontFamily: "'Times New Roman', serif", color: selectedArea ? BRAND.ink : BRAND.inkFade, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", textAlign: "left" }}>
                    <span>{selectedArea ? getVillageName(selectedArea) : "Select a Village"}</span>
                    <span style={{ fontSize: 9, color: BRAND.inkFade }}>▼</span>
                  </button>
                  {villageOpen && (
                    <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: BRAND.paperLight, border: `1.5px solid ${BRAND.ink}60`, borderTop: "none", zIndex: 100, boxShadow: "0 6px 18px rgba(0,0,0,0.2)", maxHeight: 260, overflowY: "auto" }}>
                      {SECTIONS.map(section => {
                        const villages = groupedAreas[section.key] || [];
                        const isOpen = openSection === section.key;
                        return (
                          <div key={section.key}>
                            <div onClick={(e) => { e.stopPropagation(); setOpenSection(isOpen ? null : section.key); }}
                              style={{ padding: "8px 10px", cursor: "pointer", fontSize: 11, fontWeight: 700, color: "#fff", background: section.color, display: "flex", justifyContent: "space-between", fontFamily: "'Times New Roman', serif" }}>
                              <span>{section.emoji} {section.label} — {section.sub}</span>
                              <span style={{ fontSize: 9 }}>{isOpen ? "▲" : "▼"}</span>
                            </div>
                            {isOpen && villages.map(v => (
                              <div key={v.id} onClick={(e) => { e.stopPropagation(); setSelectedArea(v); setVillageOpen(false); setOpenSection(null); }}
                                style={{ padding: "7px 20px", cursor: "pointer", fontSize: 12, color: BRAND.ink, background: selectedArea?.id === v.id ? BRAND.paper : BRAND.paperLight, borderBottom: `1px solid ${BRAND.paperDark}`, fontFamily: "'Times New Roman', serif" }}
                                onMouseEnter={e => e.currentTarget.style.background = BRAND.paper}
                                onMouseLeave={e => e.currentTarget.style.background = selectedArea?.id === v.id ? BRAND.paper : BRAND.paperLight}>
                                {getVillageName(v)}
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* FIND SERVICES */}
              <button onClick={handleSearch} disabled={!selectedArea}
                style={{ width: "100%", background: selectedArea ? BRAND.ink : `${BRAND.ink}50`, color: BRAND.paperLight, border: "none", borderRadius: 2, padding: "10px", fontSize: 13, fontWeight: 900, fontFamily: "'Times New Roman', serif", letterSpacing: 2, textTransform: "uppercase", cursor: selectedArea ? "pointer" : "not-allowed" }}>
                Find Services
              </button>
            </div>

            <div style={{ fontSize: 8, color: BRAND.inkFade, lineHeight: 1.6, textAlign: "justify", marginTop: 8 }}>{FILLER.slice(0, 100)}</div>
          </div>

          {/* DIVIDER */}
          <div style={{ background: BRAND.ink }} />

          {/* RIGHT COLUMN */}
          <div style={{ padding: "10px 12px" }}>
            <div style={{ fontSize: 11, fontWeight: 900, color: BRAND.ink, textTransform: "uppercase", letterSpacing: 1, borderBottom: `1px solid ${BRAND.ink}`, paddingBottom: 3, marginBottom: 6 }}>Services You<br/>Can Trust</div>
            <div style={{ fontSize: 9, color: BRAND.inkFade, lineHeight: 1.7, textAlign: "justify" }}>{FILLER2}</div>
            <div style={{ fontSize: 9, color: BRAND.inkFade, lineHeight: 1.7, textAlign: "justify", marginTop: 6 }}>{FILLER3.slice(0, 160)}</div>
          </div>
        </div>

        {/* ══ BOTTOM RULE ══ */}
        <div style={{ background: BRAND.paperLight, padding: "4px 16px 6px" }}>
          <div style={{ height: 2, background: BRAND.ink }} />
          <div style={{ height: 1, background: BRAND.ink, marginTop: 2 }} />
          <div style={{ textAlign: "center", marginTop: 4, fontSize: 9, color: BRAND.inkFade, fontStyle: "italic", letterSpacing: 1 }}>
            V-HUB · The Villages, FL · Connecting Residents with Trusted Local Providers · All Rights Reserved
          </div>
        </div>

      </div>
    </div>
  );
}

// ── Results Page ──────────────────────────────────────────────────────────────
function ResultsPage({ results, areas, categories, onReset, onSelect, selectedArea }) {
  return (
    <div style={{ minHeight: "100vh", background: BRAND.paperLight, fontFamily: "'Times New Roman', serif" }}>
      <div style={{ background: BRAND.ink, padding: "11px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={onReset} style={{ background: "rgba(255,255,255,0.12)", border: "1.5px solid rgba(255,255,255,0.25)", color: BRAND.paperLight, borderRadius: 5, padding: "6px 14px", fontSize: 13, cursor: "pointer", fontFamily: "'Times New Roman', serif", fontWeight: 700 }}>← Home</button>
          <span style={{ color: BRAND.paperLight, fontSize: 18, fontWeight: 900, letterSpacing: 3 }}>V-HUB</span>
        </div>
        <BurgerMenu dark={true} />
      </div>
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "22px 18px" }}>
        <div style={{ background: BRAND.paper, border: `2px solid ${BRAND.ink}`, borderRadius: 4, padding: "12px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: BRAND.ink, fontFamily: "'Times New Roman', serif" }}>
            {results.length > 0 ? `${results.length} Provider${results.length > 1 ? "s" : ""} Found` : "No Providers Found"}
            {selectedArea && <span style={{ fontSize: 12, fontStyle: "italic", color: BRAND.inkFade }}> · {getVillageName(selectedArea)}</span>}
          </div>
          <button onClick={onReset} style={{ background: BRAND.ink, color: BRAND.paperLight, border: "none", borderRadius: 4, fontSize: 12, cursor: "pointer", fontWeight: 700, padding: "6px 12px", fontFamily: "'Times New Roman', serif" }}>← New Search</button>
        </div>
        {results.length === 0 && (
          <div style={{ textAlign: "center", padding: "36px 18px", background: BRAND.paper, border: `1px solid ${BRAND.paperDark}`, borderRadius: 4, color: BRAND.inkFade, fontSize: 15, fontStyle: "italic" }}>
            No providers found for this area yet.<br /><span style={{ fontSize: 13 }}>Check back soon!</span>
          </div>
        )}
        {results.map(p => <ProviderCard key={p.id} provider={p} categories={categories} onClick={() => onSelect(p)} />)}
      </div>
    </div>
  );
}

function ProviderCard({ provider, categories, onClick }) {
  const cat = categories.find(c => c.id === provider.category_id);
  const isFeatured = provider.subscription_tier === "premium" || provider.subscription_tier === "featured";
  return (
    <div onClick={onClick} style={{ background: BRAND.paper, border: `1px solid ${BRAND.paperDark}`, borderLeft: `4px solid ${isFeatured ? BRAND.orange : BRAND.ink}`, borderRadius: 4, padding: "14px 16px", marginBottom: 10, cursor: "pointer" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
        {provider.logo_url
          ? <img src={provider.logo_url} style={{ width: 44, height: 44, borderRadius: 6, objectFit: "cover", filter: "sepia(20%)" }} alt="" />
          : <div style={{ width: 44, height: 44, borderRadius: 6, background: `linear-gradient(135deg, ${BRAND.orange}, #6B3A1F)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "#fff", fontWeight: 700 }}>{provider.business_name?.[0] || "?"}</div>
        }
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: BRAND.ink, fontFamily: "'Times New Roman', serif" }}>{provider.business_name}</div>
          {cat && <div style={{ fontSize: 11, color: BRAND.inkFade, fontStyle: "italic" }}>{cat.icon} {cat.name}</div>}
        </div>
        {isFeatured && <div style={{ background: BRAND.orange, color: "#fff", borderRadius: 10, padding: "2px 8px", fontSize: 10, fontWeight: 700 }}>⭐ Featured</div>}
      </div>
      {provider.description && <div style={{ fontSize: 12, color: BRAND.inkFade, lineHeight: 1.6, fontStyle: "italic" }}>{provider.description.slice(0, 100)}{provider.description.length > 100 ? "..." : ""}</div>}
      <div style={{ color: BRAND.orange, fontWeight: 700, fontSize: 11, textAlign: "right", marginTop: 6, fontFamily: "'Times New Roman', serif" }}>View Details →</div>
    </div>
  );
}

function ProviderProfile({ provider, areas, categories, onBack }) {
  const [services, setServices] = useState([]);
  useEffect(() => { import("@/api/entities").then(({ Service }) => Service.filter({ is_active: true }).then(setServices)); }, []);
  const cat = categories.find(c => c.id === provider.category_id);
  const providerServices = services.filter(s => provider.services && provider.services.includes(s.id));
  const providerAreas = areas.filter(a => provider.service_areas && provider.service_areas.includes(a.id));
  return (
    <div style={{ minHeight: "100vh", background: BRAND.paperLight, fontFamily: "'Times New Roman', serif" }}>
      <div style={{ background: BRAND.ink, padding: "11px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={onBack} style={{ background: "rgba(255,255,255,0.12)", border: "1.5px solid rgba(255,255,255,0.25)", color: BRAND.paperLight, borderRadius: 5, padding: "6px 14px", fontSize: 13, cursor: "pointer", fontFamily: "'Times New Roman', serif", fontWeight: 700 }}>← Back</button>
          <span style={{ color: BRAND.paperLight, fontSize: 18, fontWeight: 900, letterSpacing: 3 }}>V-HUB</span>
        </div>
        <BurgerMenu dark={true} />
      </div>
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "22px 18px" }}>
        <div style={{ background: BRAND.paper, border: `2px solid ${BRAND.ink}`, borderRadius: 4, padding: "22px", marginBottom: 14 }}>
          <div style={{ display: "flex", gap: 14, marginBottom: 12 }}>
            {provider.logo_url ? <img src={provider.logo_url} style={{ width: 64, height: 64, borderRadius: 8, objectFit: "cover", filter: "sepia(15%)" }} alt="" />
              : <div style={{ width: 64, height: 64, borderRadius: 8, background: `linear-gradient(135deg, ${BRAND.orange}, #6B3A1F)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, color: "#fff", fontWeight: 700 }}>{provider.business_name?.[0] || "?"}</div>}
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: BRAND.ink }}>{provider.business_name}</div>
              {cat && <div style={{ fontSize: 12, color: BRAND.inkFade, fontStyle: "italic" }}>{cat.icon} {cat.name}</div>}
              {provider.years_in_business && <div style={{ fontSize: 11, color: BRAND.inkFade }}>{provider.years_in_business} years in business</div>}
            </div>
          </div>
          {provider.description && <div style={{ fontSize: 13, color: BRAND.inkFade, lineHeight: 1.7, fontStyle: "italic" }}>{provider.description}</div>}
        </div>
        <div style={{ background: BRAND.paper, border: `1px solid ${BRAND.paperDark}`, borderRadius: 4, padding: "18px", marginBottom: 14 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: BRAND.ink, marginBottom: 10, borderBottom: `1px solid ${BRAND.paperDark}`, paddingBottom: 6 }}>📞 Contact</div>
          {provider.phone && <a href={`tel:${provider.phone}`} style={{ textDecoration: "none" }}><div style={cRow("#6B3A1F")}><span>📱</span><span style={{ fontWeight: 700 }}>{provider.phone}</span></div></a>}
          {provider.email && <a href={`mailto:${provider.email}`} style={{ textDecoration: "none" }}><div style={cRow(BRAND.blue)}><span>✉️</span><span>{provider.email}</span></div></a>}
          {provider.website && <a href={provider.website.startsWith("http") ? provider.website : `https://${provider.website}`} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}><div style={cRow("#1A3F6F")}><span>🌐</span><span>{provider.website}</span></div></a>}
          {!provider.phone && !provider.email && !provider.website && <div style={{ fontSize: 13, fontStyle: "italic", color: BRAND.inkFade }}>No contact info available.</div>}
        </div>
        {providerServices.length > 0 && (
          <div style={{ background: BRAND.paper, border: `1px solid ${BRAND.paperDark}`, borderRadius: 4, padding: "18px", marginBottom: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: BRAND.ink, marginBottom: 10, borderBottom: `1px solid ${BRAND.paperDark}`, paddingBottom: 6 }}>🛠️ Services</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {providerServices.map(s => <span key={s.id} style={{ background: BRAND.ink, color: BRAND.paperLight, borderRadius: 10, padding: "5px 12px", fontSize: 12 }}>{s.name}</span>)}
            </div>
          </div>
        )}
        {providerAreas.length > 0 && (
          <div style={{ background: BRAND.paper, border: `1px solid ${BRAND.paperDark}`, borderRadius: 4, padding: "18px" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: BRAND.ink, marginBottom: 10, borderBottom: `1px solid ${BRAND.paperDark}`, paddingBottom: 6 }}>📍 Service Areas</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {providerAreas.map(a => <span key={a.id} style={{ background: "#3D5C2A", color: "#fff", borderRadius: 10, padding: "5px 12px", fontSize: 11 }}>{getVillageName(a)}</span>)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const cRow = (color) => ({ display: "flex", alignItems: "center", gap: 10, background: `${color}12`, border: `1px solid ${color}25`, borderRadius: 5, padding: "9px 12px", marginBottom: 7, color, fontSize: 14, fontFamily: "'Times New Roman', serif" });
