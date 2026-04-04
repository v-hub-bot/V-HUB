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
};

const SECTIONS = [
  { key: "Historic Side | Spanish Springs", label: "Historic Side", sub: "Spanish Springs", emoji: "🌴", color: BRAND.orange },
  { key: "Established Villages | North of SR-466A", label: "Established Villages", sub: "North of SR-466A", emoji: "🏡", color: BRAND.teal },
  { key: "Newer Villages | South of SR-44", label: "Newer Villages", sub: "South of SR-44", emoji: "🌿", color: BRAND.green },
  { key: "Eastport | Newest Development Area", label: "Eastport", sub: "Newest Development", emoji: "🌊", color: BRAND.blue },
  { key: "Family & Non-Age-Restricted Villages", label: "Family Villages", sub: "Non-Age-Restricted", emoji: "🏠", color: BRAND.yellow },
];

function isVillageRecord(area) {
  return area.name.includes("\u2014");
}
function getVillageName(area) {
  const parts = area.name.split("\u2014");
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

export default function Home() {
  const [areas, setAreas] = useState([]);
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedArea, setSelectedArea] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [openSection, setOpenSection] = useState(null);
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [mode, setMode] = useState(null); // "find" | "list" | null

  useEffect(() => {
    ServiceArea.filter({ is_active: true }).then(setAreas);
    Category.filter({ is_active: true }).then(setCategories);
    Service.filter({ is_active: true }).then(setServices);
  }, []);

  const filteredServices = selectedCategory
    ? services.filter(s => s.category_id === selectedCategory)
    : services;

  const groupedAreas = groupAreas(areas);

  const handleSelectVillage = (area) => {
    setSelectedArea(area);
    setOpenSection(null);
  };

  const handleSearch = async () => {
    if (!selectedArea) return;
    const all = await Provider.filter({ is_visible: true });
    const filtered = all.filter(p => {
      const areaMatch = p.service_areas && p.service_areas.includes(selectedArea.id);
      const serviceMatch = !selectedService || (p.services && p.services.includes(selectedService));
      const statusMatch = p.subscription_status === "active" || p.subscription_status === "trial";
      return areaMatch && serviceMatch && statusMatch;
    });
    filtered.sort((a, b) => {
      const t = { premium: 0, featured: 1, basic: 2 };
      return (t[a.subscription_tier] ?? 3) - (t[b.subscription_tier] ?? 3);
    });
    setResults(filtered);
    setSearched(true);
  };

  const handleReset = () => {
    setSelectedArea(null);
    setSelectedCategory("");
    setSelectedService("");
    setResults([]);
    setSearched(false);
    setSelectedProvider(null);
    setOpenSection(null);
    setMode(null);
  };

  if (selectedProvider) {
    return (
      <ProviderProfile
        provider={selectedProvider}
        areas={areas}
        categories={categories}
        services={services}
        onBack={() => setSelectedProvider(null)}
      />
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: BRAND.lightBg, fontFamily: "'Segoe UI', sans-serif" }}>

      {/* ══ HERO ══ */}
      <div style={{
        background: `linear-gradient(170deg, #001F3F 0%, #003F6B 55%, #0077B6 100%)`,
        padding: "40px 24px 50px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* bg blobs */}
        <div style={{ position: "absolute", top: -60, left: -60, width: 220, height: 220, borderRadius: "50%", background: "rgba(0,191,165,0.07)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -40, right: -40, width: 260, height: 260, borderRadius: "50%", background: "rgba(232,67,26,0.07)", pointerEvents: "none" }} />

        {/* Tagline ABOVE logo */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ color: "#fff", fontSize: 28, fontWeight: 800, letterSpacing: 0.3, textShadow: "0 2px 12px rgba(0,0,0,0.35)" }}>
            The Villages Local Services
          </div>
          <div style={{ color: "rgba(255,255,255,0.78)", fontSize: 16, marginTop: 6 }}>
            Find trusted providers in your neighborhood — fast, simple, and free
          </div>
        </div>

        {/* Logo — round, slightly smaller */}
        <div style={{
          display: "inline-block",
          background: "rgba(255,255,255,0.08)",
          borderRadius: "50%",
          padding: "14px",
          backdropFilter: "blur(10px)",
          border: "1.5px solid rgba(255,255,255,0.15)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.4), 0 0 40px rgba(0,191,165,0.1)",
          marginBottom: 28,
        }}>
          <img
            src="https://media.base44.com/images/public/69d062aca815ce8e697894b1/f418f4c1d_V-Hublogo.png"
            alt="V-Hub"
            style={{ width: 200, height: 200, objectFit: "contain", display: "block", borderRadius: "50%", filter: "drop-shadow(0 8px 20px rgba(0,0,0,0.4))" }}
          />
        </div>

        {/* CTA Buttons */}
        <div style={{ display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
          <button
            onClick={() => { setMode("find"); setSearched(false); }}
            style={{
              background: mode === "find" ? "#fff" : `linear-gradient(135deg, ${BRAND.orange}, ${BRAND.yellow})`,
              color: mode === "find" ? BRAND.orange : "#fff",
              border: `2px solid ${mode === "find" ? "#fff" : "transparent"}`,
              borderRadius: 50,
              padding: "16px 36px",
              fontSize: 18,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
              letterSpacing: 0.3,
            }}
          >
            🔍 Find Services
          </button>
          <button
            onClick={() => window.location.href = "/list-service"}
            style={{
              background: mode === "list" ? "#fff" : "transparent",
              color: mode === "list" ? BRAND.teal : "#fff",
              border: "2px solid #fff",
              borderRadius: 50,
              padding: "16px 36px",
              fontSize: 18,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
              letterSpacing: 0.3,
            }}
          >
            📋 List Your Service
          </button>
        </div>

        <div style={{ width: 80, height: 4, borderRadius: 4, background: `linear-gradient(90deg, ${BRAND.orange}, ${BRAND.yellow}, ${BRAND.teal})`, margin: "24px auto 0" }} />
      </div>

      {/* ══ FIND SERVICES PANEL ══ */}
      {mode === "find" && !searched && (
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 20px 40px" }}>
          <div style={{
            background: "#fff",
            borderRadius: 24,
            padding: "32px 26px",
            boxShadow: "0 12px 48px rgba(0,0,0,0.13)",
            marginTop: -20,
            position: "relative",
            zIndex: 10,
            border: "1px solid rgba(0,0,0,0.05)"
          }}>
            {/* Section title */}
            <div style={{ fontSize: 22, fontWeight: 800, color: BRAND.text, marginBottom: 4 }}>Find a Service</div>
            <div style={{ fontSize: 15, color: BRAND.subtext, marginBottom: 24 }}>
              Choose your area then select your village below.
            </div>

            {/* Selected village chip */}
            {selectedArea && (
              <div style={{ background: `${BRAND.teal}15`, border: `2px solid ${BRAND.teal}`, borderRadius: 14, padding: "12px 18px", marginBottom: 18, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: 12, color: BRAND.teal, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>Selected Village</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: BRAND.text }}>{getVillageName(selectedArea)}</div>
                </div>
                <button onClick={() => setSelectedArea(null)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: BRAND.subtext }}>✕</button>
              </div>
            )}

            {/* ── 5 Accordion sections ── */}
            <div style={{ fontSize: 16, fontWeight: 700, color: BRAND.text, marginBottom: 12 }}>📍 Your Location</div>
            {SECTIONS.map(section => {
              const villages = groupedAreas[section.key] || [];
              const isOpen = openSection === section.key;
              return (
                <div key={section.key} style={{ marginBottom: 8 }}>
                  <button
                    onClick={() => setOpenSection(isOpen ? null : section.key)}
                    style={{
                      width: "100%",
                      background: isOpen ? section.color : "#fff",
                      color: isOpen ? "#fff" : BRAND.text,
                      border: `2px solid ${section.color}`,
                      borderRadius: isOpen ? "14px 14px 0 0" : 14,
                      padding: "15px 20px",
                      fontSize: 17,
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      textAlign: "left",
                    }}
                  >
                    <span>
                      <span style={{ fontSize: 20, marginRight: 10 }}>{section.emoji}</span>
                      <span>{section.label}</span>
                      <span style={{ fontSize: 13, fontWeight: 400, opacity: 0.75, marginLeft: 8 }}>— {section.sub}</span>
                    </span>
                    <span style={{ fontSize: 16 }}>{isOpen ? "▲" : "▼"}</span>
                  </button>
                  {isOpen && (
                    <div style={{
                      border: `2px solid ${section.color}`,
                      borderTop: "none",
                      borderRadius: "0 0 14px 14px",
                      background: "#fafafa",
                      padding: "14px",
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 8,
                    }}>
                      {villages.map(v => {
                        const isSel = selectedArea?.id === v.id;
                        return (
                          <button
                            key={v.id}
                            onClick={() => handleSelectVillage(v)}
                            style={{
                              background: isSel ? section.color : "#fff",
                              color: isSel ? "#fff" : section.color,
                              border: `2px solid ${section.color}`,
                              borderRadius: 20,
                              padding: "9px 18px",
                              fontSize: 15,
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            {getVillageName(v)}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Category */}
            <div style={{ marginTop: 24 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: BRAND.orange, marginBottom: 10 }}>📂 Service Category (optional)</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 10 }}>
                {categories.map((c, i) => {
                  const palette = [BRAND.teal, BRAND.orange, BRAND.blue, BRAND.green, BRAND.yellow, "#0099CC", BRAND.orange, BRAND.teal, BRAND.green, BRAND.blue];
                  const color = palette[i % palette.length];
                  const active = selectedCategory === c.id;
                  return (
                    <div key={c.id} onClick={() => setSelectedCategory(active ? "" : c.id)}
                      style={{
                        background: active ? color : "#fff",
                        borderRadius: 14, padding: "14px 10px", textAlign: "center",
                        cursor: "pointer",
                        boxShadow: active ? `0 4px 14px ${color}44` : "0 2px 8px rgba(0,0,0,0.07)",
                        border: `2px solid ${active ? "transparent" : color + "40"}`,
                      }}
                    >
                      <div style={{ fontSize: 26, marginBottom: 5 }}>{c.icon}</div>
                      <div style={{ color: active ? "#fff" : color, fontWeight: 700, fontSize: 13 }}>{c.name}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Service filter */}
            {selectedCategory && (
              <div style={{ marginTop: 18 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: BRAND.blue, marginBottom: 8 }}>🛠️ Specific Service (optional)</div>
                <select value={selectedService} onChange={e => setSelectedService(e.target.value)}
                  style={{ width: "100%", padding: "14px", fontSize: 16, borderRadius: 12, border: `2px solid ${BRAND.blue}50`, outline: "none", boxSizing: "border-box" }}>
                  <option value="">— All Services —</option>
                  {filteredServices.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            )}

            {/* Search button */}
            <button
              onClick={handleSearch}
              disabled={!selectedArea}
              style={{
                width: "100%",
                background: selectedArea ? `linear-gradient(135deg, ${BRAND.orange}, ${BRAND.yellow} 50%, ${BRAND.teal})` : "#ddd",
                color: "#fff",
                border: "none",
                borderRadius: 14,
                padding: "20px",
                fontSize: 20,
                fontWeight: 700,
                cursor: selectedArea ? "pointer" : "not-allowed",
                marginTop: 24,
                boxShadow: selectedArea ? "0 6px 22px rgba(232,67,26,0.3)" : "none",
              }}
            >
              {selectedArea ? `🔍 Search in ${getVillageName(selectedArea)}` : "Select a Village to Search"}
            </button>
          </div>
        </div>
      )}

      {/* ══ LIST YOUR SERVICE PANEL ══ */}
      {mode === "list" && (
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 20px 40px" }}>
          <div style={{
            background: "#fff", borderRadius: 24, padding: "40px 28px",
            boxShadow: "0 12px 48px rgba(0,0,0,0.12)", marginTop: -20,
            border: "1px solid rgba(0,0,0,0.05)", textAlign: "center"
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: BRAND.text, marginBottom: 10 }}>List Your Service</div>
            <div style={{ fontSize: 16, color: BRAND.subtext, maxWidth: 420, margin: "0 auto", lineHeight: 1.7, marginBottom: 28 }}>
              Reach thousands of Villages residents looking for trusted local providers. Join V-Hub and grow your business today.
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 32 }}>
              {[
                { icon: "👥", title: "Large Audience", desc: "Thousands of active residents" },
                { icon: "📍", title: "Local Focus", desc: "The Villages community only" },
                { icon: "💼", title: "Easy Setup", desc: "Listed in minutes" },
              ].map((item, i) => (
                <div key={i} style={{ background: `${BRAND.teal}10`, borderRadius: 14, padding: "18px 10px", border: `1px solid ${BRAND.teal}25` }}>
                  <div style={{ fontSize: 28, marginBottom: 6 }}>{item.icon}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: BRAND.text }}>{item.title}</div>
                  <div style={{ fontSize: 12, color: BRAND.subtext, marginTop: 4 }}>{item.desc}</div>
                </div>
              ))}
            </div>

            <div style={{ background: `${BRAND.orange}10`, borderRadius: 16, padding: "20px", border: `1px solid ${BRAND.orange}30`, marginBottom: 24 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: BRAND.orange, marginBottom: 6 }}>Ready to get started?</div>
              <div style={{ fontSize: 15, color: BRAND.subtext }}>Contact William Evans to list your business on V-Hub and start reaching customers in your area.</div>
            </div>

            <button onClick={handleReset}
              style={{ background: "none", border: `2px solid ${BRAND.subtext}40`, borderRadius: 12, padding: "12px 24px", fontSize: 15, color: BRAND.subtext, cursor: "pointer", fontWeight: 600 }}>
              ← Back to Home
            </button>
          </div>
        </div>
      )}

      {/* ══ RESULTS ══ */}
      {searched && (
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 20px 40px" }}>
          <div style={{
            background: `linear-gradient(135deg, ${BRAND.teal}, ${BRAND.blue})`,
            borderRadius: 16, padding: "16px 22px",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            marginTop: 24, marginBottom: 18,
          }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>
              {results.length > 0 ? `${results.length} Provider${results.length > 1 ? "s" : ""} Found` : "No Providers Found"}
            </div>
            <button onClick={handleReset} style={{ color: "#fff", background: "rgba(255,255,255,0.18)", border: "none", borderRadius: 10, fontSize: 15, cursor: "pointer", fontWeight: 600, padding: "7px 14px" }}>
              ← New Search
            </button>
          </div>

          {results.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px 20px", background: "#fff", borderRadius: 16, color: BRAND.subtext, fontSize: 18 }}>
              😔 No providers found for this area yet.<br />
              <span style={{ fontSize: 15 }}>Check back soon as more providers join V-Hub!</span>
            </div>
          )}
          {results.map(p => (
            <ProviderCard key={p.id} provider={p} categories={categories} services={services} onClick={() => setSelectedProvider(p)} />
          ))}
        </div>
      )}

      {/* ══ DEFAULT HOME (no mode selected) ══ */}
      {!mode && !searched && (
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 20px 40px" }}>

          {/* Discover section */}
          <div style={{ background: "#fff", borderRadius: 20, padding: "28px", boxShadow: "0 6px 24px rgba(0,0,0,0.08)", marginTop: 28, marginBottom: 20 }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: BRAND.text, marginBottom: 4, textAlign: "center" }}>Discover Services Near You</div>
            <div style={{ fontSize: 14, color: BRAND.subtext, textAlign: "center", marginBottom: 20 }}>Tap "Find Services" above to search by your village</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 12 }}>
              {categories.map((c, i) => {
                const palette = [BRAND.teal, BRAND.orange, BRAND.blue, BRAND.green, BRAND.yellow, "#0099CC"];
                const color = palette[i % palette.length];
                return (
                  <div key={c.id} onClick={() => { setMode("find"); setSelectedCategory(c.id); }}
                    style={{ background: "#fff", borderRadius: 14, padding: "16px 10px", textAlign: "center", cursor: "pointer", boxShadow: "0 2px 10px rgba(0,0,0,0.07)", border: `2px solid ${color}35` }}>
                    <div style={{ fontSize: 28, marginBottom: 6 }}>{c.icon}</div>
                    <div style={{ color: color, fontWeight: 700, fontSize: 13 }}>{c.name}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* How it works */}
          <div style={{ background: `linear-gradient(135deg, ${BRAND.green}, #1a7a28)`, borderRadius: 20, padding: "28px 24px", marginBottom: 20 }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", marginBottom: 20, textAlign: "center" }}>How V-Hub Works</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
              {[
                { icon: "📍", title: "Pick Your Village", desc: "Select your area" },
                { icon: "🔍", title: "Find a Service", desc: "Browse by category" },
                { icon: "📞", title: "Contact Directly", desc: "No middleman" },
              ].map((step, i) => (
                <div key={i} style={{ textAlign: "center", background: "rgba(255,255,255,0.12)", borderRadius: 14, padding: "18px 10px" }}>
                  <div style={{ fontSize: 26, marginBottom: 6 }}>{step.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 3 }}>{step.title}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.8)" }}>{step.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing accordion */}
          <PricingAccordion />

          {/* Footer */}
          <div style={{ marginTop: 20, background: `linear-gradient(135deg, ${BRAND.deepBlue}, #003F6B)`, borderRadius: 20, padding: "24px", textAlign: "center" }}>
            <img src="https://media.base44.com/images/public/69d062aca815ce8e697894b1/f418f4c1d_V-Hublogo.png"
              alt="V-Hub" style={{ width: 56, height: 56, objectFit: "contain", marginBottom: 10, borderRadius: "50%" }} />
            <div style={{ color: "#fff", fontSize: 15, fontWeight: 700 }}>V-HUB — The Villages, FL</div>
            <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, marginTop: 4 }}>Connecting residents with trusted local providers</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Pricing Accordion ────────────────────────────────────────────────────────
function PricingAccordion() {
  const [open, setOpen] = useState(null);
  const items = [
    {
      title: "Why Advertise with Us?",
      content: "V-Hub is the go-to directory for The Villages community. Residents trust us to find reliable, local service providers. Get your business in front of thousands of active neighbors who are actively searching for services like yours."
    },
    {
      title: "Pricing Plans",
      content: "• Basic Listing — Get found by local residents\n• Featured Listing — Appear at the top of search results with a highlighted badge\n• Premium Listing — Maximum visibility with priority placement and enhanced profile\n\nContact William Evans for current pricing details."
    },
    {
      title: "How It Works",
      content: "1. Contact V-Hub to set up your provider profile\n2. Choose your service areas (select the villages you serve)\n3. Add your services, contact info, and business description\n4. Go live and start receiving inquiries from residents in your area"
    },
  ];

  return (
    <div style={{ marginBottom: 20 }}>
      {items.map((item, i) => (
        <div key={i} style={{ background: "#fff", borderRadius: 14, marginBottom: 8, boxShadow: "0 2px 10px rgba(0,0,0,0.07)", overflow: "hidden" }}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            style={{ width: "100%", background: "none", border: "none", padding: "18px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", fontSize: 16, fontWeight: 700, color: BRAND.text }}
          >
            {item.title}
            <span style={{ fontSize: 18, color: BRAND.teal }}>{open === i ? "▲" : "▼"}</span>
          </button>
          {open === i && (
            <div style={{ padding: "4px 20px 18px", fontSize: 15, color: BRAND.subtext, lineHeight: 1.8, whiteSpace: "pre-line" }}>
              {item.content}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Provider Card ─────────────────────────────────────────────────────────────
function ProviderCard({ provider, categories, services, onClick }) {
  const cat = categories.find(c => c.id === provider.category_id);
  const providerServices = services.filter(s => provider.services && provider.services.includes(s.id));
  const isFeatured = provider.subscription_tier === "premium" || provider.subscription_tier === "featured";

  return (
    <div onClick={onClick} style={{ background: "#fff", borderRadius: 18, padding: "22px", marginBottom: 16, boxShadow: "0 4px 18px rgba(0,0,0,0.08)", cursor: "pointer", borderLeft: `5px solid ${isFeatured ? BRAND.orange : BRAND.teal}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 10 }}>
        {provider.logo_url
          ? <img src={provider.logo_url} style={{ width: 56, height: 56, borderRadius: 12, objectFit: "cover" }} alt="" />
          : <div style={{ width: 56, height: 56, borderRadius: 12, background: `linear-gradient(135deg, ${BRAND.orange}, ${BRAND.teal})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, color: "#fff", fontWeight: 700 }}>{provider.business_name?.[0] || "?"}</div>
        }
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 19, fontWeight: 700, color: BRAND.text }}>{provider.business_name}</div>
          {cat && <div style={{ fontSize: 13, color: BRAND.teal, fontWeight: 600 }}>{cat.icon} {cat.name}</div>}
        </div>
        {isFeatured && <div style={{ background: `linear-gradient(135deg, ${BRAND.orange}, ${BRAND.yellow})`, color: "#fff", borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 700 }}>⭐ Featured</div>}
      </div>
      {provider.description && <div style={{ fontSize: 14, color: BRAND.subtext, marginBottom: 10, lineHeight: 1.5 }}>{provider.description.slice(0, 110)}{provider.description.length > 110 ? "..." : ""}</div>}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 8 }}>
        {providerServices.slice(0, 4).map(s => <span key={s.id} style={{ background: `${BRAND.teal}18`, color: BRAND.teal, borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 600 }}>{s.name}</span>)}
        {providerServices.length > 4 && <span style={{ color: BRAND.subtext, fontSize: 12 }}>+{providerServices.length - 4} more</span>}
      </div>
      <div style={{ color: BRAND.orange, fontWeight: 600, fontSize: 14, textAlign: "right" }}>View Details →</div>
    </div>
  );
}

// ── Provider Profile ──────────────────────────────────────────────────────────
function ProviderProfile({ provider, areas, categories, services, onBack }) {
  const cat = categories.find(c => c.id === provider.category_id);
  const providerServices = services.filter(s => provider.services && provider.services.includes(s.id));
  const providerAreas = areas.filter(a => provider.service_areas && provider.service_areas.includes(a.id));

  return (
    <div style={{ minHeight: "100vh", background: BRAND.lightBg, fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ background: `linear-gradient(135deg, #001F3F, #003F6B)`, padding: "20px 24px", display: "flex", alignItems: "center", gap: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}>
        <button onClick={onBack} style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", borderRadius: 10, padding: "8px 16px", fontSize: 16, cursor: "pointer", fontWeight: 600 }}>← Back</button>
        <img src="https://media.base44.com/images/public/69d062aca815ce8e697894b1/f418f4c1d_V-Hublogo.png" style={{ height: 38, width: 38, borderRadius: "50%", objectFit: "contain" }} alt="V-Hub" />
        <div style={{ color: "#fff", fontSize: 19, fontWeight: 700 }}>Provider Profile</div>
      </div>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 20px" }}>
        <div style={{ background: `linear-gradient(135deg, ${BRAND.blue}15, ${BRAND.teal}08)`, borderRadius: 20, padding: "26px", boxShadow: "0 6px 24px rgba(0,0,0,0.09)", marginBottom: 18, border: `2px solid ${BRAND.blue}20` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 14 }}>
            {provider.logo_url
              ? <img src={provider.logo_url} style={{ width: 76, height: 76, borderRadius: 14, objectFit: "cover" }} alt="" />
              : <div style={{ width: 76, height: 76, borderRadius: 14, background: `linear-gradient(135deg, ${BRAND.orange}, ${BRAND.teal})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", fontWeight: 700 }}>{provider.business_name?.[0] || "?"}</div>
            }
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: BRAND.text }}>{provider.business_name}</div>
              {cat && <div style={{ fontSize: 15, color: BRAND.teal, fontWeight: 600 }}>{cat.icon} {cat.name}</div>}
              {provider.years_in_business && <div style={{ fontSize: 13, color: BRAND.subtext }}>{provider.years_in_business} years in business</div>}
            </div>
          </div>
          {provider.description && <div style={{ fontSize: 16, color: BRAND.subtext, lineHeight: 1.7 }}>{provider.description}</div>}
        </div>

        <div style={{ background: `linear-gradient(135deg, ${BRAND.orange}10, ${BRAND.yellow}08)`, borderRadius: 20, padding: "26px", boxShadow: "0 6px 24px rgba(0,0,0,0.08)", marginBottom: 18, border: `2px solid ${BRAND.orange}20` }}>
          <div style={{ fontSize: 19, fontWeight: 700, color: BRAND.orange, marginBottom: 16 }}>📞 Contact This Provider</div>
          {provider.phone && <a href={`tel:${provider.phone}`} style={{ textDecoration: "none" }}><div style={contactRow(BRAND.orange)}><span>📱</span><span style={{ fontSize: 21, fontWeight: 700 }}>{provider.phone}</span></div></a>}
          {provider.email && <a href={`mailto:${provider.email}`} style={{ textDecoration: "none" }}><div style={contactRow(BRAND.teal)}><span>✉️</span><span style={{ fontSize: 17, fontWeight: 600 }}>{provider.email}</span></div></a>}
          {provider.website && <a href={provider.website.startsWith("http") ? provider.website : `https://${provider.website}`} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}><div style={contactRow(BRAND.blue)}><span>🌐</span><span style={{ fontSize: 17, fontWeight: 600 }}>{provider.website}</span></div></a>}
          {!provider.phone && !provider.email && !provider.website && <div style={{ color: BRAND.subtext }}>No contact info available yet.</div>}
        </div>

        {providerServices.length > 0 && (
          <div style={{ background: `${BRAND.teal}10`, borderRadius: 20, padding: "26px", boxShadow: "0 6px 24px rgba(0,0,0,0.07)", marginBottom: 18, border: `2px solid ${BRAND.teal}20` }}>
            <div style={{ fontSize: 19, fontWeight: 700, color: BRAND.teal, marginBottom: 14 }}>🛠️ Services Offered</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {providerServices.map(s => <span key={s.id} style={{ background: BRAND.teal, color: "#fff", borderRadius: 20, padding: "8px 16px", fontSize: 15, fontWeight: 600 }}>{s.name}</span>)}
            </div>
          </div>
        )}

        {providerAreas.length > 0 && (
          <div style={{ background: `${BRAND.green}10`, borderRadius: 20, padding: "26px", boxShadow: "0 6px 24px rgba(0,0,0,0.07)", border: `2px solid ${BRAND.green}20` }}>
            <div style={{ fontSize: 19, fontWeight: 700, color: BRAND.green, marginBottom: 14 }}>📍 Service Areas</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {providerAreas.map(a => <span key={a.id} style={{ background: BRAND.green, color: "#fff", borderRadius: 20, padding: "8px 16px", fontSize: 14, fontWeight: 600 }}>{getVillageName(a)}</span>)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const contactRow = (color) => ({ display: "flex", alignItems: "center", gap: 12, background: `${color}12`, border: `2px solid ${color}30`, borderRadius: 12, padding: "14px 18px", marginBottom: 10, color, fontSize: 20 });
