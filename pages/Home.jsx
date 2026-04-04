import { useState, useEffect } from "react";
import { ServiceArea, Category, Service, Provider } from "@/api/entities";

const BRAND = {
  orange: "#E8431A",
  paper: "#F5ECD7",
  paperDark: "#E8D5B0",
  ink: "#2C1A0E",
  inkLight: "#5C3D1E",
  blue: "#0077B6",
};

const SECTIONS = [
  { key: "Historic Side | Spanish Springs",        label: "Historic Side",        sub: "Spanish Springs",    emoji: "🌴", color: "#8B4513" },
  { key: "Established Villages | North of SR-466A", label: "Established Villages", sub: "North of SR-466A",   emoji: "🏡", color: "#5C7A3E" },
  { key: "Newer Villages | South of SR-44",         label: "Newer Villages",       sub: "South of SR-44",     emoji: "🌿", color: "#2E7D32" },
  { key: "Eastport | Newest Development Area",      label: "Eastport",             sub: "Newest Development", emoji: "🌊", color: "#1565C0" },
  { key: "Family & Non-Age-Restricted Villages",    label: "Family Villages",      sub: "Non-Age-Restricted", emoji: "🏠", color: "#6A4C93" },
];

function isVillageRecord(area) { return area.name.includes("—"); }
function getVillageName(area) {
  const parts = area.name.split("—");
  return parts.length > 1 ? parts[1].trim() : area.name;
}
function groupAreas(areas) {
  const groups = {};
  SECTIONS.forEach(s => (groups[s.key] = []));
  areas.filter(isVillageRecord).forEach(a => {
    if (groups[a.description] !== undefined) groups[a.description].push(a);
  });
  return groups;
}

// ── Burger Menu ───────────────────────────────────────────────────────────────
function BurgerMenu({ dark = false }) {
  const [open, setOpen] = useState(false);
  const lineColor = dark ? "#fff" : BRAND.ink;
  const btnBorder = dark ? "rgba(255,255,255,0.3)" : "rgba(44,26,14,0.25)";
  const btnBg = dark ? "rgba(255,255,255,0.15)" : "rgba(44,26,14,0.08)";
  const navLinks = [
    { label: "🏠 Home", href: "/", color: "#8B4513" },
    { label: "🔍 Find Services", href: "/", color: BRAND.orange },
    { label: "📋 List Your Service", href: "/list-service", color: "#1565C0" },
  ];
  return (
    <>
      <button onClick={() => setOpen(true)}
        style={{ background: btnBg, border: `1.5px solid ${btnBorder}`, borderRadius: 8, padding: "9px 12px", cursor: "pointer", display: "flex", flexDirection: "column", gap: 5 }}>
        <span style={{ display: "block", width: 20, height: 2, background: lineColor, borderRadius: 2 }} />
        <span style={{ display: "block", width: 20, height: 2, background: lineColor, borderRadius: 2 }} />
        <span style={{ display: "block", width: 20, height: 2, background: lineColor, borderRadius: 2 }} />
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 199, background: "rgba(0,0,0,0.45)" }} />
          <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 270, background: BRAND.paper, zIndex: 200, boxShadow: "-4px 0 28px rgba(0,0,0,0.25)", display: "flex", flexDirection: "column", fontFamily: "Georgia, serif" }}>
            <div style={{ background: BRAND.ink, padding: "20px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ color: BRAND.paper, fontWeight: 900, fontSize: 18, letterSpacing: 2 }}>🌴 V-HUB</span>
              <button onClick={() => setOpen(false)} style={{ background: "rgba(255,255,255,0.12)", border: "none", color: "#fff", borderRadius: 6, width: 28, height: 28, fontSize: 15, cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ padding: "14px 12px", flex: 1 }}>
              {navLinks.map((link, i) => (
                <a key={i} href={link.href} style={{ textDecoration: "none" }}>
                  <div style={{ padding: "14px 16px", borderRadius: 8, fontSize: 15, fontWeight: 600, color: BRAND.ink, marginBottom: 6, background: BRAND.paperDark, borderLeft: `4px solid ${link.color}`, fontFamily: "Georgia, serif" }}>
                    {link.label}
                  </div>
                </a>
              ))}
            </div>
            <div style={{ padding: "12px 18px", borderTop: `1px solid ${BRAND.paperDark}`, textAlign: "center" }}>
              <div style={{ fontSize: 11, color: BRAND.inkLight, fontStyle: "italic" }}>V-HUB — The Villages, FL</div>
            </div>
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
  const [services, setServices] = useState([]);
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
    Service.filter({ is_active: true }).then(setServices);
  }, []);

  const groupedAreas = groupAreas(areas);

  const handleSearch = async () => {
    if (!selectedArea) return;
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

  if (selectedProvider) return <ProviderProfile provider={selectedProvider} areas={areas} categories={categories} services={services} onBack={() => setSelectedProvider(null)} />;
  if (searched) return <ResultsPage results={results} categories={categories} services={services} areas={areas} onReset={handleReset} onSelect={setSelectedProvider} selectedArea={selectedArea} />;

  return (
    <div style={{ minHeight: "100vh", background: BRAND.paper, fontFamily: "Georgia, serif" }}>

      {/* ══ MASTHEAD ══ */}
      <div style={{ background: BRAND.paper, padding: "12px 20px 10px", position: "relative" }}>
        {/* Top rule */}
        <div style={{ height: 3, background: BRAND.ink, marginBottom: 10 }} />

        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          {/* Left spacer to balance the right buttons */}
          <div style={{ width: 160 }} />

          {/* Center: Masthead */}
          <div style={{ textAlign: "center", flex: 1 }}>
            <div style={{ fontSize: 52, fontWeight: 900, color: BRAND.ink, fontFamily: "Georgia, serif", letterSpacing: 3, lineHeight: 1, textShadow: "1px 2px 0px rgba(0,0,0,0.10)" }}>
              🌴 V-Hub
            </div>
            <div style={{ fontSize: 13, color: BRAND.inkLight, fontStyle: "italic", letterSpacing: 0.5, marginTop: 5 }}>
              Connecting You to Local Services in The Villages!
            </div>
          </div>

          {/* Right: List Your Service + Burger */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, width: 160, justifyContent: "flex-end" }}>
            <a href="/list-service" style={{ textDecoration: "none" }}>
              <button style={{ background: BRAND.orange, color: "#fff", border: "none", borderRadius: 6, padding: "9px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "Georgia, serif", boxShadow: "0 3px 8px rgba(232,67,26,0.35)", whiteSpace: "nowrap" }}>
                List Your Service
              </button>
            </a>
            <BurgerMenu dark={false} />
          </div>
        </div>

        {/* Bottom double rule */}
        <div style={{ height: 3, background: BRAND.ink, marginTop: 10 }} />
        <div style={{ height: 1, background: BRAND.ink, marginTop: 3 }} />
      </div>

      {/* ══ LOCAL SERVICES | CLASSIFIEDS ══ */}
      <div style={{ background: BRAND.paperDark, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 28px", borderBottom: `2px solid ${BRAND.ink}` }}>
        <div style={{ fontSize: 17, fontWeight: 900, color: BRAND.ink, fontFamily: "Georgia, serif", letterSpacing: 3, textTransform: "uppercase" }}>◆ Local Services</div>
        <div style={{ width: 1, height: 20, background: BRAND.ink }} />
        <div style={{ fontSize: 17, fontWeight: 900, color: BRAND.ink, fontFamily: "Georgia, serif", letterSpacing: 3, textTransform: "uppercase" }}>Classifieds ◆</div>
      </div>

      {/* ══ TROPICAL BANNER ══ */}
      <div style={{ width: "100%", height: 200, overflow: "hidden", position: "relative", borderBottom: `2px solid ${BRAND.ink}` }}>
        <img
          src="https://media.base44.com/images/public/69d062aca815ce8e697894b1/392f3af96_generated_image.png"
          alt="The Villages"
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 35%", display: "block" }}
        />
        {/* Parchment fade on sides to blend into newspaper */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(245,236,215,0.35) 0%, transparent 12%, transparent 88%, rgba(245,236,215,0.35) 100%)" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 65%, rgba(232,213,176,0.55) 100%)" }} />
      </div>

      {/* ══ SEARCH AREA (newspaper columns look) ══ */}
      <div style={{ background: BRAND.paper, padding: "24px 28px 32px" }}>
        {/* Faint column lines — newspaper feel */}
        <div style={{ maxWidth: 760, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 2px 1fr", gap: 0, alignItems: "start" }}>

          {/* LEFT COLUMN — Service */}
          <div style={{ paddingRight: 28 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: BRAND.inkLight, fontFamily: "Georgia, serif", marginBottom: 8, fontStyle: "italic", letterSpacing: 0.5 }}>
              What service do you need?
            </div>
            <div style={{ position: "relative" }}>
              <button
                onClick={() => { setServiceOpen(!serviceOpen); setVillageOpen(false); }}
                style={{ width: "100%", background: "#fff", border: `1.5px solid ${BRAND.ink}50`, borderRadius: 4, padding: "10px 14px", fontSize: 15, fontFamily: "Georgia, serif", color: selectedCategory ? BRAND.ink : BRAND.inkLight, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "inset 0 1px 3px rgba(0,0,0,0.06)" }}
              >
                <span>{selectedCategory ? categories.find(c => c.id === selectedCategory)?.name || "Select a Service" : "Select a Service"}</span>
                <span style={{ fontSize: 11, color: BRAND.inkLight }}>▼</span>
              </button>
              {serviceOpen && (
                <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#fff", border: `1.5px solid ${BRAND.ink}50`, borderTop: "none", borderRadius: "0 0 4px 4px", zIndex: 50, boxShadow: "0 8px 24px rgba(0,0,0,0.15)", maxHeight: 280, overflowY: "auto" }}>
                  <div onClick={() => { setSelectedCategory(""); setServiceOpen(false); }}
                    style={{ padding: "10px 14px", cursor: "pointer", fontSize: 14, color: BRAND.inkLight, fontFamily: "Georgia, serif", borderBottom: `1px solid ${BRAND.paperDark}`, fontStyle: "italic" }}>
                    All Services
                  </div>
                  {categories.map(c => (
                    <div key={c.id} onClick={() => { setSelectedCategory(c.id); setServiceOpen(false); }}
                      style={{ padding: "10px 14px", cursor: "pointer", fontSize: 14, color: BRAND.ink, fontFamily: "Georgia, serif", background: selectedCategory === c.id ? BRAND.paperDark : "#fff", borderBottom: `1px solid ${BRAND.paperDark}` }}
                      onMouseEnter={e => e.currentTarget.style.background = BRAND.paperDark}
                      onMouseLeave={e => e.currentTarget.style.background = selectedCategory === c.id ? BRAND.paperDark : "#fff"}
                    >
                      {c.icon} {c.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* CENTER DIVIDER */}
          <div style={{ background: `${BRAND.ink}30`, alignSelf: "stretch", minHeight: 40 }} />

          {/* RIGHT COLUMN — Village */}
          <div style={{ paddingLeft: 28 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: BRAND.inkLight, fontFamily: "Georgia, serif", marginBottom: 8, fontStyle: "italic", letterSpacing: 0.5 }}>
              Where do you need it?
            </div>
            <div style={{ position: "relative" }}>
              <button
                onClick={() => { setVillageOpen(!villageOpen); setServiceOpen(false); }}
                style={{ width: "100%", background: "#fff", border: `1.5px solid ${BRAND.ink}50`, borderRadius: 4, padding: "10px 14px", fontSize: 15, fontFamily: "Georgia, serif", color: selectedArea ? BRAND.ink : BRAND.inkLight, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "inset 0 1px 3px rgba(0,0,0,0.06)" }}
              >
                <span>{selectedArea ? getVillageName(selectedArea) : "Select a Village"}</span>
                <span style={{ fontSize: 11, color: BRAND.inkLight }}>▼</span>
              </button>
              {villageOpen && (
                <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#fff", border: `1.5px solid ${BRAND.ink}50`, borderTop: "none", borderRadius: "0 0 4px 4px", zIndex: 50, boxShadow: "0 8px 24px rgba(0,0,0,0.18)", maxHeight: 320, overflowY: "auto" }}>
                  {SECTIONS.map(section => {
                    const villages = groupedAreas[section.key] || [];
                    const isOpen = openSection === section.key;
                    return (
                      <div key={section.key}>
                        <div onClick={() => setOpenSection(isOpen ? null : section.key)}
                          style={{ padding: "10px 14px", cursor: "pointer", fontSize: 13, fontWeight: 700, color: "#fff", background: section.color, display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: "Georgia, serif" }}>
                          <span>{section.emoji} {section.label} — {section.sub}</span>
                          <span style={{ fontSize: 11, opacity: 0.85 }}>{isOpen ? "▲" : "▼"}</span>
                        </div>
                        {isOpen && villages.map(v => (
                          <div key={v.id}
                            onClick={() => { setSelectedArea(v); setVillageOpen(false); setOpenSection(null); }}
                            style={{ padding: "9px 24px", cursor: "pointer", fontSize: 14, color: BRAND.ink, fontFamily: "Georgia, serif", background: selectedArea?.id === v.id ? BRAND.paperDark : "#fff", borderBottom: `1px solid ${BRAND.paperDark}` }}
                            onMouseEnter={e => e.currentTarget.style.background = BRAND.paperDark}
                            onMouseLeave={e => e.currentTarget.style.background = selectedArea?.id === v.id ? BRAND.paperDark : "#fff"}
                          >
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
        </div>

        {/* FIND SERVICES button */}
        <div style={{ textAlign: "center", marginTop: 28 }}>
          <button
            onClick={handleSearch}
            disabled={!selectedArea}
            style={{
              background: selectedArea ? BRAND.ink : `${BRAND.ink}55`,
              color: BRAND.paper,
              border: "none",
              borderRadius: 5,
              padding: "14px 56px",
              fontSize: 17,
              fontWeight: 700,
              fontFamily: "Georgia, serif",
              letterSpacing: 2,
              textTransform: "uppercase",
              cursor: selectedArea ? "pointer" : "not-allowed",
              boxShadow: selectedArea ? "0 4px 14px rgba(44,26,14,0.3)" : "none",
            }}
          >
            Find Services
          </button>
        </div>
      </div>

      {/* ══ NEWSPAPER FOOTER RULE ══ */}
      <div style={{ padding: "0 20px 20px" }}>
        <div style={{ height: 3, background: BRAND.ink }} />
        <div style={{ height: 1, background: BRAND.ink, marginTop: 3 }} />
        <div style={{ textAlign: "center", marginTop: 10, fontSize: 11, color: BRAND.inkLight, fontStyle: "italic", letterSpacing: 1 }}>
          V-HUB · The Villages, FL · Connecting Residents with Trusted Local Providers
        </div>
      </div>

    </div>
  );
}

// ── Results Page ──────────────────────────────────────────────────────────────
function ResultsPage({ results, categories, services, areas, onReset, onSelect, selectedArea }) {
  return (
    <div style={{ minHeight: "100vh", background: BRAND.paper, fontFamily: "Georgia, serif" }}>
      <div style={{ background: BRAND.ink, padding: "13px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={onReset} style={{ background: "rgba(255,255,255,0.15)", border: "1.5px solid rgba(255,255,255,0.3)", color: "#fff", borderRadius: 7, padding: "7px 15px", fontSize: 14, cursor: "pointer", fontFamily: "Georgia, serif", fontWeight: 700 }}>← Home</button>
          <span style={{ color: BRAND.paper, fontSize: 20, fontWeight: 900, fontFamily: "Georgia, serif", letterSpacing: 2 }}>🌴 V-Hub</span>
        </div>
        <BurgerMenu dark={true} />
      </div>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 20px" }}>
        <div style={{ background: BRAND.paperDark, borderRadius: 10, padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, border: `1px solid ${BRAND.ink}30` }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: BRAND.ink, fontFamily: "Georgia, serif" }}>
            {results.length > 0 ? `${results.length} Provider${results.length > 1 ? "s" : ""} Found` : "No Providers Found"}
            {selectedArea && <span style={{ fontSize: 13, fontStyle: "italic", color: BRAND.inkLight }}> · {getVillageName(selectedArea)}</span>}
          </div>
          <button onClick={onReset} style={{ background: BRAND.ink, color: BRAND.paper, border: "none", borderRadius: 7, fontSize: 13, cursor: "pointer", fontWeight: 700, padding: "7px 14px", fontFamily: "Georgia, serif" }}>← New Search</button>
        </div>
        {results.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 20px", background: BRAND.paperDark, borderRadius: 10, color: BRAND.inkLight, fontSize: 16, fontStyle: "italic" }}>
            No providers found for this area yet.<br /><span style={{ fontSize: 13 }}>Check back soon as more providers join V-Hub!</span>
          </div>
        )}
        {results.map(p => <ProviderCard key={p.id} provider={p} categories={categories} services={services} onClick={() => onSelect(p)} />)}
      </div>
    </div>
  );
}

// ── Provider Card ─────────────────────────────────────────────────────────────
function ProviderCard({ provider, categories, services, onClick }) {
  const cat = categories.find(c => c.id === provider.category_id);
  const providerServices = services.filter(s => provider.services && provider.services.includes(s.id));
  const isFeatured = provider.subscription_tier === "premium" || provider.subscription_tier === "featured";
  return (
    <div onClick={onClick} style={{ background: "#fff", borderRadius: 10, padding: "18px 20px", marginBottom: 12, boxShadow: "0 2px 10px rgba(44,26,14,0.10)", cursor: "pointer", borderLeft: `5px solid ${isFeatured ? BRAND.orange : "#8B4513"}`, border: `1px solid ${BRAND.paperDark}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
        {provider.logo_url
          ? <img src={provider.logo_url} style={{ width: 50, height: 50, borderRadius: 8, objectFit: "cover" }} alt="" />
          : <div style={{ width: 50, height: 50, borderRadius: 8, background: `linear-gradient(135deg, ${BRAND.orange}, #8B4513)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: "#fff", fontWeight: 700 }}>{provider.business_name?.[0] || "?"}</div>
        }
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: BRAND.ink, fontFamily: "Georgia, serif" }}>{provider.business_name}</div>
          {cat && <div style={{ fontSize: 12, color: "#8B4513", fontStyle: "italic" }}>{cat.icon} {cat.name}</div>}
        </div>
        {isFeatured && <div style={{ background: BRAND.orange, color: "#fff", borderRadius: 14, padding: "3px 10px", fontSize: 11, fontWeight: 700, fontFamily: "Georgia, serif" }}>⭐ Featured</div>}
      </div>
      {provider.description && <div style={{ fontSize: 13, color: BRAND.inkLight, marginBottom: 8, lineHeight: 1.6, fontStyle: "italic" }}>{provider.description.slice(0, 110)}{provider.description.length > 110 ? "..." : ""}</div>}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {providerServices.slice(0, 4).map(s => <span key={s.id} style={{ background: BRAND.paperDark, color: BRAND.ink, borderRadius: 12, padding: "3px 10px", fontSize: 12, fontFamily: "Georgia, serif" }}>{s.name}</span>)}
      </div>
      <div style={{ color: BRAND.orange, fontWeight: 600, fontSize: 12, textAlign: "right", marginTop: 6, fontFamily: "Georgia, serif" }}>View Details →</div>
    </div>
  );
}

// ── Provider Profile ──────────────────────────────────────────────────────────
function ProviderProfile({ provider, areas, categories, services, onBack }) {
  const cat = categories.find(c => c.id === provider.category_id);
  const providerServices = services.filter(s => provider.services && provider.services.includes(s.id));
  const providerAreas = areas.filter(a => provider.service_areas && provider.service_areas.includes(a.id));
  return (
    <div style={{ minHeight: "100vh", background: BRAND.paper, fontFamily: "Georgia, serif" }}>
      <div style={{ background: BRAND.ink, padding: "13px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={onBack} style={{ background: "rgba(255,255,255,0.15)", border: "1.5px solid rgba(255,255,255,0.3)", color: "#fff", borderRadius: 7, padding: "7px 15px", fontSize: 14, cursor: "pointer", fontFamily: "Georgia, serif", fontWeight: 700 }}>← Back</button>
          <span style={{ color: BRAND.paper, fontSize: 20, fontWeight: 900, fontFamily: "Georgia, serif", letterSpacing: 2 }}>🌴 V-Hub</span>
        </div>
        <BurgerMenu dark={true} />
      </div>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 20px" }}>
        <div style={{ background: BRAND.paperDark, borderRadius: 14, padding: "24px", marginBottom: 16, border: `1px solid ${BRAND.ink}20` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
            {provider.logo_url ? <img src={provider.logo_url} style={{ width: 68, height: 68, borderRadius: 10, objectFit: "cover" }} alt="" />
              : <div style={{ width: 68, height: 68, borderRadius: 10, background: `linear-gradient(135deg, ${BRAND.orange}, #8B4513)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, color: "#fff", fontWeight: 700 }}>{provider.business_name?.[0] || "?"}</div>}
            <div>
              <div style={{ fontSize: 21, fontWeight: 800, color: BRAND.ink, fontFamily: "Georgia, serif" }}>{provider.business_name}</div>
              {cat && <div style={{ fontSize: 13, color: "#8B4513", fontStyle: "italic" }}>{cat.icon} {cat.name}</div>}
              {provider.years_in_business && <div style={{ fontSize: 12, color: BRAND.inkLight }}>{provider.years_in_business} years in business</div>}
            </div>
          </div>
          {provider.description && <div style={{ fontSize: 14, color: BRAND.inkLight, lineHeight: 1.7, fontStyle: "italic" }}>{provider.description}</div>}
        </div>

        <div style={{ background: "#fff", borderRadius: 14, padding: "22px", marginBottom: 16, border: `1px solid ${BRAND.paperDark}` }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: BRAND.ink, fontFamily: "Georgia, serif", marginBottom: 12 }}>📞 Contact This Provider</div>
          {provider.phone && <a href={`tel:${provider.phone}`} style={{ textDecoration: "none" }}><div style={cRow("#8B4513")}><span>📱</span><span style={{ fontSize: 18, fontWeight: 700 }}>{provider.phone}</span></div></a>}
          {provider.email && <a href={`mailto:${provider.email}`} style={{ textDecoration: "none" }}><div style={cRow(BRAND.blue)}><span>✉️</span><span>{provider.email}</span></div></a>}
          {provider.website && <a href={provider.website.startsWith("http") ? provider.website : `https://${provider.website}`} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}><div style={cRow("#1565C0")}><span>🌐</span><span>{provider.website}</span></div></a>}
          {!provider.phone && !provider.email && !provider.website && <div style={{ color: BRAND.inkLight, fontStyle: "italic", fontSize: 14 }}>No contact info available yet.</div>}
        </div>

        {providerServices.length > 0 && (
          <div style={{ background: BRAND.paperDark, borderRadius: 14, padding: "22px", marginBottom: 16, border: `1px solid ${BRAND.ink}20` }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: BRAND.ink, fontFamily: "Georgia, serif", marginBottom: 10 }}>🛠️ Services Offered</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {providerServices.map(s => <span key={s.id} style={{ background: BRAND.ink, color: BRAND.paper, borderRadius: 14, padding: "6px 14px", fontSize: 13, fontFamily: "Georgia, serif" }}>{s.name}</span>)}
            </div>
          </div>
        )}

        {providerAreas.length > 0 && (
          <div style={{ background: "#fff", borderRadius: 14, padding: "22px", border: `1px solid ${BRAND.paperDark}` }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: BRAND.ink, fontFamily: "Georgia, serif", marginBottom: 10 }}>📍 Service Areas</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {providerAreas.map(a => <span key={a.id} style={{ background: "#5C7A3E", color: "#fff", borderRadius: 14, padding: "6px 14px", fontSize: 12, fontFamily: "Georgia, serif" }}>{getVillageName(a)}</span>)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const cRow = (color) => ({ display: "flex", alignItems: "center", gap: 12, background: `${color}12`, border: `1px solid ${color}30`, borderRadius: 7, padding: "11px 15px", marginBottom: 8, color, fontSize: 16, fontFamily: "Georgia, serif" });
