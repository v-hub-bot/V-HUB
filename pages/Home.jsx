import { useState, useEffect } from "react";
import { ServiceArea, Category, Service, Provider } from "@/api/entities";

const BRAND = {
  orange: "#E8431A",
  teal: "#00BFA5",
  blue: "#0077B6",
  deepBlue: "#001F3F",
  green: "#2E9B3B",
  yellow: "#F5A623",
  lightBg: "#F8FFFE",
  text: "#1A1A2E",
  subtext: "#555",
  paper: "#F5ECD7",
  paperDark: "#E8D5B0",
  ink: "#2C1A0E",
  inkLight: "#5C3D1E",
};

const SECTIONS = [
  { key: "Historic Side | Spanish Springs", label: "Historic Side", sub: "Spanish Springs", emoji: "🌴", color: "#8B4513" },
  { key: "Established Villages | North of SR-466A", label: "Established Villages", sub: "North of SR-466A", emoji: "🏡", color: "#5C7A3E" },
  { key: "Newer Villages | South of SR-44", label: "Newer Villages", sub: "South of SR-44", emoji: "🌿", color: "#2E7D32" },
  { key: "Eastport | Newest Development Area", label: "Eastport", sub: "Newest Development", emoji: "🌊", color: "#1565C0" },
  { key: "Family & Non-Age-Restricted Villages", label: "Family Villages", sub: "Non-Age-Restricted", emoji: "🏠", color: "#6A4C93" },
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

// ── Burger / Nav Menu ─────────────────────────────────────────────────────────
function BurgerMenu({ darkBg = false }) {
  const [open, setOpen] = useState(false);
  const navLinks = [
    { label: "🏠 Home", href: "/" },
    { label: "🔍 Find Services", href: "/" },
    { label: "📋 List Your Service", href: "/list-service" },
  ];
  const btnColor = darkBg ? "rgba(255,255,255,0.18)" : "rgba(44,26,14,0.12)";
  const lineColor = darkBg ? "#fff" : "#2C1A0E";
  return (
    <>
      <button onClick={() => setOpen(true)}
        style={{ background: btnColor, border: `1.5px solid ${darkBg ? "rgba(255,255,255,0.3)" : "rgba(44,26,14,0.25)"}`, borderRadius: 8, padding: "9px 12px", cursor: "pointer", display: "flex", flexDirection: "column", gap: 5 }}>
        <span style={{ display: "block", width: 20, height: 2, background: lineColor, borderRadius: 2 }} />
        <span style={{ display: "block", width: 20, height: 2, background: lineColor, borderRadius: 2 }} />
        <span style={{ display: "block", width: 20, height: 2, background: lineColor, borderRadius: 2 }} />
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 199, background: "rgba(0,0,0,0.45)" }} />
          <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 280, background: BRAND.paper, zIndex: 200, boxShadow: "-4px 0 30px rgba(0,0,0,0.25)", display: "flex", flexDirection: "column", fontFamily: "Georgia, serif" }}>
            <div style={{ background: BRAND.ink, padding: "22px 20px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ color: "#F5ECD7", fontWeight: 800, fontSize: 18, fontFamily: "Georgia, serif", letterSpacing: 1 }}>V-HUB</div>
              <button onClick={() => setOpen(false)} style={{ background: "rgba(255,255,255,0.12)", border: "none", color: "#fff", borderRadius: 6, width: 30, height: 30, fontSize: 16, cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ padding: "16px 12px", flex: 1 }}>
              {navLinks.map((link, i) => (
                <a key={i} href={link.href} style={{ textDecoration: "none" }}>
                  <div style={{ padding: "15px 16px", borderRadius: 8, fontSize: 16, fontWeight: 600, color: BRAND.ink, marginBottom: 6, background: BRAND.paperDark, borderLeft: `4px solid ${["#8B4513","#E8431A","#1565C0"][i]}`, fontFamily: "Georgia, serif" }}>
                    {link.label}
                  </div>
                </a>
              ))}
            </div>
            <div style={{ padding: "14px 20px", borderTop: `1px solid ${BRAND.paperDark}`, textAlign: "center" }}>
              <div style={{ fontSize: 12, color: BRAND.inkLight, fontFamily: "Georgia, serif" }}>V-HUB — The Villages, FL</div>
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
  const [selectedService, setSelectedService] = useState("");
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
    filtered.sort((a, b) => {
      const t = { premium: 0, featured: 1, basic: 2 };
      return (t[a.subscription_tier] ?? 3) - (t[b.subscription_tier] ?? 3);
    });
    setResults(filtered);
    setSearched(true);
  };

  const handleReset = () => {
    setSelectedArea(null); setSelectedCategory(""); setSelectedService("");
    setResults([]); setSearched(false); setSelectedProvider(null);
    setVillageOpen(false); setServiceOpen(false); setOpenSection(null);
  };

  if (selectedProvider) {
    return <ProviderProfile provider={selectedProvider} areas={areas} categories={categories} services={services} onBack={() => setSelectedProvider(null)} />;
  }

  if (searched) {
    return <ResultsPage results={results} categories={categories} services={services} areas={areas} onReset={handleReset} onSelect={setSelectedProvider} selectedArea={selectedArea} />;
  }

  return (
    <div style={{ minHeight: "100vh", background: BRAND.paper, fontFamily: "Georgia, serif" }}>

      {/* ══ TOP BAR ══ */}
      <div style={{ background: BRAND.paper, borderBottom: `2px solid ${BRAND.paperDark}`, padding: "10px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ width: 40 }} /> {/* spacer */}
        {/* Masthead */}
        <div style={{ textAlign: "center", flex: 1 }}>
          <div style={{ fontSize: 48, fontWeight: 900, color: BRAND.ink, fontFamily: "Georgia, serif", letterSpacing: 2, lineHeight: 1, textShadow: "2px 2px 0px rgba(0,0,0,0.12)" }}>
            🌴 V-Hub
          </div>
          <div style={{ fontSize: 13, color: BRAND.inkLight, fontStyle: "italic", letterSpacing: 1, marginTop: 2 }}>
            Connecting You to Local Services in The Villages!
          </div>
          <div style={{ height: 2, background: `linear-gradient(90deg, transparent, ${BRAND.ink}, transparent)`, marginTop: 8 }} />
        </div>
        {/* Right: List Your Service + Burger */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <a href="/list-service" style={{ textDecoration: "none" }}>
            <button style={{ background: BRAND.orange, color: "#fff", border: "none", borderRadius: 6, padding: "10px 16px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "Georgia, serif", boxShadow: "0 3px 10px rgba(232,67,26,0.35)", whiteSpace: "nowrap" }}>
              List Your Service
            </button>
          </a>
          <BurgerMenu darkBg={false} />
        </div>
      </div>

      {/* ══ SECTION HEADERS ══ */}
      <div style={{ background: BRAND.paperDark, display: "flex", justifyContent: "space-between", padding: "6px 32px", borderBottom: `1px solid ${BRAND.ink}40` }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: BRAND.ink, fontFamily: "Georgia, serif", letterSpacing: 2, textTransform: "uppercase" }}>Local Services</div>
        <div style={{ fontSize: 18, fontWeight: 800, color: BRAND.ink, fontFamily: "Georgia, serif", letterSpacing: 2, textTransform: "uppercase" }}>Classifieds</div>
      </div>

      {/* ══ TROPICAL BANNER IMAGE ══ */}
      <div style={{ width: "100%", maxHeight: 220, overflow: "hidden", position: "relative" }}>
        <img
          src="https://media.base44.com/images/public/69d062aca815ce8e697894b1/392f3af96_generated_image.png"
          alt="The Villages"
          style={{ width: "100%", objectFit: "cover", objectPosition: "center 30%", display: "block", maxHeight: 220 }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 60%, rgba(245,236,215,0.7) 100%)" }} />
      </div>

      {/* ══ SEARCH SECTION ══ */}
      <div style={{ background: BRAND.paper, padding: "28px 20px 36px", borderTop: `2px solid ${BRAND.paperDark}` }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>

          {/* Two-column dropdowns */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24, alignItems: "start" }}>

            {/* LEFT — What service */}
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: BRAND.inkLight, fontFamily: "Georgia, serif", marginBottom: 8, fontStyle: "italic" }}>
                What service do you need?
              </div>
              {/* Custom dropdown */}
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => { setServiceOpen(!serviceOpen); setVillageOpen(false); }}
                  style={{
                    width: "100%", background: "#fff", border: `2px solid ${BRAND.ink}40`,
                    borderRadius: 6, padding: "12px 16px", fontSize: 16, fontFamily: "Georgia, serif",
                    color: selectedCategory ? BRAND.ink : BRAND.inkLight, cursor: "pointer",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    boxShadow: "inset 0 1px 3px rgba(0,0,0,0.08)",
                  }}
                >
                  <span>{selectedCategory ? categories.find(c => c.id === selectedCategory)?.name || "Select a Service" : "Select a Service"}</span>
                  <span style={{ fontSize: 12, color: BRAND.inkLight }}>▼</span>
                </button>
                {serviceOpen && (
                  <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#fff", border: `2px solid ${BRAND.ink}40`, borderTop: "none", borderRadius: "0 0 6px 6px", zIndex: 50, boxShadow: "0 8px 24px rgba(0,0,0,0.15)", maxHeight: 260, overflowY: "auto" }}>
                    <div onClick={() => { setSelectedCategory(""); setServiceOpen(false); }}
                      style={{ padding: "12px 16px", cursor: "pointer", fontSize: 15, color: BRAND.inkLight, fontFamily: "Georgia, serif", borderBottom: `1px solid ${BRAND.paperDark}` }}>
                      All Services
                    </div>
                    {categories.map(c => (
                      <div key={c.id} onClick={() => { setSelectedCategory(c.id); setServiceOpen(false); }}
                        style={{ padding: "12px 16px", cursor: "pointer", fontSize: 15, color: BRAND.ink, fontFamily: "Georgia, serif", background: selectedCategory === c.id ? BRAND.paperDark : "#fff", borderBottom: `1px solid ${BRAND.paperDark}` }}
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

            {/* RIGHT — Where */}
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: BRAND.inkLight, fontFamily: "Georgia, serif", marginBottom: 8, fontStyle: "italic" }}>
                Where do you need it?
              </div>
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => { setVillageOpen(!villageOpen); setServiceOpen(false); }}
                  style={{
                    width: "100%", background: "#fff", border: `2px solid ${BRAND.ink}40`,
                    borderRadius: 6, padding: "12px 16px", fontSize: 16, fontFamily: "Georgia, serif",
                    color: selectedArea ? BRAND.ink : BRAND.inkLight, cursor: "pointer",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    boxShadow: "inset 0 1px 3px rgba(0,0,0,0.08)",
                  }}
                >
                  <span>{selectedArea ? getVillageName(selectedArea) : "Select a Village"}</span>
                  <span style={{ fontSize: 12, color: BRAND.inkLight }}>▼</span>
                </button>

                {villageOpen && (
                  <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#fff", border: `2px solid ${BRAND.ink}40`, borderTop: "none", borderRadius: "0 0 6px 6px", zIndex: 50, boxShadow: "0 8px 24px rgba(0,0,0,0.15)", maxHeight: 360, overflowY: "auto" }}>
                    {SECTIONS.map(section => {
                      const villages = groupedAreas[section.key] || [];
                      const isOpen = openSection === section.key;
                      return (
                        <div key={section.key}>
                          {/* Section header */}
                          <div
                            onClick={() => setOpenSection(isOpen ? null : section.key)}
                            style={{ padding: "11px 16px", cursor: "pointer", fontSize: 14, fontWeight: 700, color: "#fff", background: section.color, display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: "Georgia, serif" }}
                          >
                            <span>{section.emoji} {section.label} — {section.sub}</span>
                            <span style={{ fontSize: 11 }}>{isOpen ? "▲" : "▼"}</span>
                          </div>
                          {/* Villages */}
                          {isOpen && villages.map(v => (
                            <div key={v.id}
                              onClick={() => { setSelectedArea(v); setVillageOpen(false); setOpenSection(null); }}
                              style={{ padding: "10px 28px", cursor: "pointer", fontSize: 15, color: BRAND.ink, fontFamily: "Georgia, serif", background: selectedArea?.id === v.id ? BRAND.paperDark : "#fff", borderBottom: `1px solid ${BRAND.paperDark}` }}
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
          <div style={{ textAlign: "center" }}>
            <button
              onClick={handleSearch}
              disabled={!selectedArea}
              style={{
                background: selectedArea ? BRAND.ink : "#aaa",
                color: BRAND.paper,
                border: "none",
                borderRadius: 6,
                padding: "16px 60px",
                fontSize: 18,
                fontWeight: 700,
                fontFamily: "Georgia, serif",
                letterSpacing: 2,
                textTransform: "uppercase",
                cursor: selectedArea ? "pointer" : "not-allowed",
                boxShadow: selectedArea ? "0 4px 16px rgba(44,26,14,0.35)" : "none",
              }}
            >
              Find Services
            </button>
          </div>

          {/* Decorative rule */}
          <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${BRAND.ink}40, transparent)`, margin: "32px 0 0" }} />
        </div>
      </div>

      {/* ══ CATEGORY GRID ══ */}
      <div style={{ background: BRAND.paperDark, padding: "28px 20px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: BRAND.ink, fontFamily: "Georgia, serif", letterSpacing: 1, textAlign: "center", marginBottom: 4 }}>Browse by Category</div>
          <div style={{ textAlign: "center", fontStyle: "italic", color: BRAND.inkLight, fontSize: 13, marginBottom: 20 }}>Click a category then select your village to search</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 12 }}>
            {categories.map((c, i) => {
              const colors = ["#8B4513","#E8431A","#1565C0","#2E7D32","#6A4C93","#B8860B","#C62828","#00838F","#4527A0","#2E7D32"];
              const color = colors[i % colors.length];
              const active = selectedCategory === c.id;
              return (
                <div key={c.id} onClick={() => setSelectedCategory(active ? "" : c.id)}
                  style={{ background: active ? color : "#fff", borderRadius: 10, padding: "16px 10px", textAlign: "center", cursor: "pointer", border: `2px solid ${color}50`, boxShadow: active ? `0 4px 12px ${color}44` : "0 2px 8px rgba(0,0,0,0.07)" }}>
                  <div style={{ fontSize: 26, marginBottom: 6 }}>{c.icon}</div>
                  <div style={{ color: active ? "#fff" : color, fontWeight: 700, fontSize: 13, fontFamily: "Georgia, serif" }}>{c.name}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ══ HOW IT WORKS ══ */}
      <div style={{ background: BRAND.paper, padding: "28px 20px", borderTop: `2px solid ${BRAND.paperDark}` }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: BRAND.ink, fontFamily: "Georgia, serif", letterSpacing: 1, textAlign: "center", marginBottom: 20 }}>— How V-Hub Works —</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {[
              { icon: "📍", title: "Pick Your Village", desc: "Select your area in The Villages" },
              { icon: "🔍", title: "Find a Service", desc: "Browse categories or search directly" },
              { icon: "📞", title: "Contact Directly", desc: "Call or email — no middleman" },
            ].map((step, i) => (
              <div key={i} style={{ textAlign: "center", background: BRAND.paperDark, borderRadius: 10, padding: "20px 14px", border: `1px solid ${BRAND.ink}20` }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{step.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: BRAND.ink, fontFamily: "Georgia, serif", marginBottom: 4 }}>{step.title}</div>
                <div style={{ fontSize: 12, color: BRAND.inkLight, fontStyle: "italic" }}>{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ FOOTER ══ */}
      <div style={{ background: BRAND.ink, padding: "20px", textAlign: "center" }}>
        <div style={{ color: BRAND.paper, fontSize: 22, fontWeight: 800, fontFamily: "Georgia, serif", letterSpacing: 2 }}>🌴 V-HUB</div>
        <div style={{ color: `${BRAND.paper}80`, fontSize: 13, marginTop: 4, fontStyle: "italic", fontFamily: "Georgia, serif" }}>Connecting residents with trusted local providers in The Villages, FL</div>
      </div>

    </div>
  );
}

// ── Results Page ──────────────────────────────────────────────────────────────
function ResultsPage({ results, categories, services, areas, onReset, onSelect, selectedArea }) {
  return (
    <div style={{ minHeight: "100vh", background: BRAND.paper, fontFamily: "Georgia, serif" }}>
      <div style={{ background: BRAND.ink, padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={onReset} style={{ background: "rgba(255,255,255,0.15)", border: "1.5px solid rgba(255,255,255,0.3)", color: "#fff", borderRadius: 8, padding: "8px 16px", fontSize: 15, cursor: "pointer", fontFamily: "Georgia, serif", fontWeight: 700 }}>← Home</button>
          <div style={{ color: BRAND.paper, fontSize: 20, fontWeight: 800, fontFamily: "Georgia, serif", letterSpacing: 1 }}>🌴 V-Hub</div>
        </div>
        <BurgerMenu darkBg={true} />
      </div>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 20px" }}>
        <div style={{ background: BRAND.paperDark, borderRadius: 12, padding: "16px 22px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, border: `1px solid ${BRAND.ink}30` }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: BRAND.ink, fontFamily: "Georgia, serif" }}>
            {results.length > 0 ? `${results.length} Provider${results.length > 1 ? "s" : ""} Found` : "No Providers Found"}
            {selectedArea && <span style={{ fontSize: 14, fontStyle: "italic", color: BRAND.inkLight }}> in {getVillageName(selectedArea)}</span>}
          </div>
          <button onClick={onReset} style={{ background: BRAND.ink, color: BRAND.paper, border: "none", borderRadius: 8, fontSize: 14, cursor: "pointer", fontWeight: 600, padding: "8px 14px", fontFamily: "Georgia, serif" }}>← New Search</button>
        </div>
        {results.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 20px", background: BRAND.paperDark, borderRadius: 12, color: BRAND.inkLight, fontSize: 17, fontStyle: "italic" }}>
            No providers found for this area yet.<br /><span style={{ fontSize: 14 }}>Check back soon as more providers join V-Hub!</span>
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
    <div onClick={onClick} style={{ background: "#fff", borderRadius: 12, padding: "20px", marginBottom: 14, boxShadow: "0 3px 14px rgba(44,26,14,0.12)", cursor: "pointer", borderLeft: `5px solid ${isFeatured ? BRAND.orange : "#8B4513"}`, border: `1px solid ${BRAND.paperDark}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 10 }}>
        {provider.logo_url
          ? <img src={provider.logo_url} style={{ width: 52, height: 52, borderRadius: 10, objectFit: "cover" }} alt="" />
          : <div style={{ width: 52, height: 52, borderRadius: 10, background: `linear-gradient(135deg, ${BRAND.orange}, #8B4513)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: "#fff", fontWeight: 700, fontFamily: "Georgia, serif" }}>{provider.business_name?.[0] || "?"}</div>
        }
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: BRAND.ink, fontFamily: "Georgia, serif" }}>{provider.business_name}</div>
          {cat && <div style={{ fontSize: 13, color: "#8B4513", fontStyle: "italic" }}>{cat.icon} {cat.name}</div>}
        </div>
        {isFeatured && <div style={{ background: BRAND.orange, color: "#fff", borderRadius: 16, padding: "3px 10px", fontSize: 11, fontWeight: 700, fontFamily: "Georgia, serif" }}>⭐ Featured</div>}
      </div>
      {provider.description && <div style={{ fontSize: 14, color: BRAND.inkLight, marginBottom: 8, lineHeight: 1.6, fontStyle: "italic" }}>{provider.description.slice(0, 110)}{provider.description.length > 110 ? "..." : ""}</div>}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {providerServices.slice(0, 4).map(s => <span key={s.id} style={{ background: BRAND.paperDark, color: BRAND.ink, borderRadius: 16, padding: "3px 10px", fontSize: 12, fontFamily: "Georgia, serif" }}>{s.name}</span>)}
      </div>
      <div style={{ color: BRAND.orange, fontWeight: 600, fontSize: 13, textAlign: "right", marginTop: 8, fontFamily: "Georgia, serif" }}>View Details →</div>
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
      <div style={{ background: BRAND.ink, padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={onBack} style={{ background: "rgba(255,255,255,0.15)", border: "1.5px solid rgba(255,255,255,0.3)", color: "#fff", borderRadius: 8, padding: "8px 16px", fontSize: 15, cursor: "pointer", fontFamily: "Georgia, serif", fontWeight: 700 }}>← Back</button>
          <div style={{ color: BRAND.paper, fontSize: 20, fontWeight: 800, fontFamily: "Georgia, serif", letterSpacing: 1 }}>🌴 V-Hub</div>
        </div>
        <BurgerMenu darkBg={true} />
      </div>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 20px" }}>
        <div style={{ background: BRAND.paperDark, borderRadius: 16, padding: "26px", marginBottom: 18, border: `1px solid ${BRAND.ink}20` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 14 }}>
            {provider.logo_url ? <img src={provider.logo_url} style={{ width: 72, height: 72, borderRadius: 12, objectFit: "cover" }} alt="" />
              : <div style={{ width: 72, height: 72, borderRadius: 12, background: `linear-gradient(135deg, ${BRAND.orange}, #8B4513)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, color: "#fff", fontWeight: 700 }}>{provider.business_name?.[0] || "?"}</div>}
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: BRAND.ink, fontFamily: "Georgia, serif" }}>{provider.business_name}</div>
              {cat && <div style={{ fontSize: 14, color: "#8B4513", fontStyle: "italic" }}>{cat.icon} {cat.name}</div>}
              {provider.years_in_business && <div style={{ fontSize: 13, color: BRAND.inkLight }}>{provider.years_in_business} years in business</div>}
            </div>
          </div>
          {provider.description && <div style={{ fontSize: 15, color: BRAND.inkLight, lineHeight: 1.7, fontStyle: "italic" }}>{provider.description}</div>}
        </div>

        <div style={{ background: "#fff", borderRadius: 16, padding: "24px", marginBottom: 18, border: `1px solid ${BRAND.paperDark}` }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: BRAND.ink, fontFamily: "Georgia, serif", marginBottom: 14 }}>📞 Contact This Provider</div>
          {provider.phone && <a href={`tel:${provider.phone}`} style={{ textDecoration: "none" }}><div style={cRow("#8B4513")}><span>📱</span><span style={{ fontSize: 19, fontWeight: 700 }}>{provider.phone}</span></div></a>}
          {provider.email && <a href={`mailto:${provider.email}`} style={{ textDecoration: "none" }}><div style={cRow(BRAND.blue)}><span>✉️</span><span style={{ fontSize: 16 }}>{provider.email}</span></div></a>}
          {provider.website && <a href={provider.website.startsWith("http") ? provider.website : `https://${provider.website}`} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}><div style={cRow("#1565C0")}><span>🌐</span><span style={{ fontSize: 16 }}>{provider.website}</span></div></a>}
          {!provider.phone && !provider.email && !provider.website && <div style={{ color: BRAND.inkLight, fontStyle: "italic" }}>No contact info available yet.</div>}
        </div>

        {providerServices.length > 0 && (
          <div style={{ background: BRAND.paperDark, borderRadius: 16, padding: "24px", marginBottom: 18, border: `1px solid ${BRAND.ink}20` }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: BRAND.ink, fontFamily: "Georgia, serif", marginBottom: 12 }}>🛠️ Services Offered</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {providerServices.map(s => <span key={s.id} style={{ background: BRAND.ink, color: BRAND.paper, borderRadius: 16, padding: "7px 14px", fontSize: 14, fontFamily: "Georgia, serif" }}>{s.name}</span>)}
            </div>
          </div>
        )}

        {providerAreas.length > 0 && (
          <div style={{ background: "#fff", borderRadius: 16, padding: "24px", border: `1px solid ${BRAND.paperDark}` }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: BRAND.ink, fontFamily: "Georgia, serif", marginBottom: 12 }}>📍 Service Areas</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {providerAreas.map(a => <span key={a.id} style={{ background: "#5C7A3E", color: "#fff", borderRadius: 16, padding: "7px 14px", fontSize: 13, fontFamily: "Georgia, serif" }}>{getVillageName(a)}</span>)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const BRAND_REF = { orange: "#E8431A", blue: "#0077B6", paper: "#F5ECD7", paperDark: "#E8D5B0", ink: "#2C1A0E", inkLight: "#5C3D1E" };
const cRow = (color) => ({ display: "flex", alignItems: "center", gap: 12, background: `${color}12`, border: `1px solid ${color}30`, borderRadius: 8, padding: "12px 16px", marginBottom: 8, color, fontSize: 18, fontFamily: "Georgia, serif" });
