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
  cardBg: "#FFFFFF",
  text: "#1A1A2E",
  subtext: "#555",
};

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

export default function Home() {
  const [areas, setAreas] = useState([]);
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedArea, setSelectedArea] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);

  useEffect(() => {
    ServiceArea.filter({ is_active: true }).then(setAreas);
    Category.filter({ is_active: true }).then(setCategories);
    Service.filter({ is_active: true }).then(setServices);
  }, []);

  const filteredServices = selectedCategory
    ? services.filter((s) => s.category_id === selectedCategory)
    : services;

  const groupedAreas = groupAreas(areas);

  const handleSearch = async () => {
    if (!selectedArea) return;
    const all = await Provider.filter({ is_visible: true });
    const filtered = all.filter((p) => {
      const areaMatch = p.service_areas && p.service_areas.includes(selectedArea);
      const serviceMatch = !selectedService || (p.services && p.services.includes(selectedService));
      const statusMatch = p.subscription_status === "active" || p.subscription_status === "trial";
      return areaMatch && serviceMatch && statusMatch;
    });
    filtered.sort((a, b) => {
      const tierOrder = { premium: 0, featured: 1, basic: 2 };
      return (tierOrder[a.subscription_tier] ?? 3) - (tierOrder[b.subscription_tier] ?? 3);
    });
    setResults(filtered);
    setSearched(true);
  };

  const handleReset = () => {
    setSelectedArea("");
    setSelectedCategory("");
    setSelectedService("");
    setResults([]);
    setSearched(false);
    setSelectedProvider(null);
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

      {/* ── HERO — Deep Ocean Blue ── */}
      <div style={{
        background: `linear-gradient(170deg, #001F3F 0%, #003F6B 55%, #0077B6 100%)`,
        padding: "52px 24px 64px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -70, left: -70, width: 240, height: 240, borderRadius: "50%", background: "rgba(0,191,165,0.07)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -50, right: -50, width: 280, height: 280, borderRadius: "50%", background: "rgba(232,67,26,0.07)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 30, right: 60, width: 130, height: 130, borderRadius: "50%", background: "rgba(245,166,35,0.06)", pointerEvents: "none" }} />

        {/* Logo card */}
        <div style={{
          display: "inline-block",
          background: "rgba(255,255,255,0.07)",
          borderRadius: 36,
          padding: "24px 32px",
          backdropFilter: "blur(10px)",
          border: "1.5px solid rgba(255,255,255,0.13)",
          boxShadow: "0 24px 70px rgba(0,0,0,0.4), 0 0 50px rgba(0,191,165,0.12)",
          marginBottom: 30,
        }}>
          <img
            src="https://media.base44.com/images/public/69d062aca815ce8e697894b1/f418f4c1d_V-Hublogo.png"
            alt="V-Hub"
            style={{ width: 230, height: 230, objectFit: "contain", display: "block", filter: "drop-shadow(0 10px 28px rgba(0,0,0,0.45))" }}
          />
        </div>

        <div style={{ color: "#fff", fontSize: 33, fontWeight: 800, letterSpacing: 0.5, marginBottom: 10, textShadow: "0 2px 14px rgba(0,0,0,0.4)" }}>
          The Villages Local Services
        </div>
        <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 18, maxWidth: 460, margin: "0 auto", lineHeight: 1.6 }}>
          Find trusted providers in your neighborhood — fast, simple, and free
        </div>
        <div style={{ width: 90, height: 4, borderRadius: 4, background: `linear-gradient(90deg, ${BRAND.orange}, ${BRAND.yellow}, ${BRAND.teal})`, margin: "22px auto 0" }} />
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 20px 40px" }}>

        {/* ── SEARCH CARD — White elevated, floats over hero ── */}
        <div style={{
          background: "#fff",
          borderRadius: 24,
          padding: "36px 30px",
          boxShadow: "0 12px 48px rgba(0,0,0,0.13)",
          marginTop: -32,
          position: "relative",
          zIndex: 10,
          border: "1px solid rgba(0,0,0,0.05)"
        }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: BRAND.text, marginBottom: 6 }}>
            🔍 Find a Service Provider
          </div>
          <div style={{ fontSize: 15, color: BRAND.subtext, marginBottom: 6 }}>
            Select your village, then choose a service to find providers near you.
          </div>

          {/* Village — teal accent */}
          <label style={{ ...labelStyle, color: BRAND.teal }}>📍 Your Village *</label>
          <select value={selectedArea} onChange={(e) => setSelectedArea(e.target.value)}
            style={{ ...selectStyle, borderColor: selectedArea ? BRAND.teal : "#e0e0e0" }}>
            <option value="">— Select your village —</option>
            {SECTION_ORDER.map(section => {
              const sectionAreas = groupedAreas[section] || [];
              if (sectionAreas.length === 0) return null;
              return (
                <optgroup key={section} label={SECTION_LABELS[section]}>
                  {sectionAreas.map(a => (
                    <option key={a.id} value={a.id}>{getVillageName(a)}</option>
                  ))}
                </optgroup>
              );
            })}
          </select>

          {/* Category — orange accent */}
          <label style={{ ...labelStyle, color: BRAND.orange }}>📂 Category (optional)</label>
          <select value={selectedCategory} onChange={(e) => { setSelectedCategory(e.target.value); setSelectedService(""); }}
            style={{ ...selectStyle, borderColor: selectedCategory ? BRAND.orange : "#e0e0e0" }}>
            <option value="">— All Categories —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
            ))}
          </select>

          {/* Service — blue accent */}
          <label style={{ ...labelStyle, color: BRAND.blue }}>🛠️ Service (optional)</label>
          <select value={selectedService} onChange={(e) => setSelectedService(e.target.value)}
            style={{ ...selectStyle, borderColor: selectedService ? BRAND.blue : "#e0e0e0" }}>
            <option value="">— All Services —</option>
            {filteredServices.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

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
              marginTop: 22,
              letterSpacing: 0.5,
              boxShadow: selectedArea ? "0 6px 22px rgba(232,67,26,0.32)" : "none",
            }}
          >
            Search Providers
          </button>
        </div>

        {/* ── RESULTS ── */}
        {searched && (
          <div style={{ marginTop: 32 }}>
            {/* Results header — teal band */}
            <div style={{
              background: `linear-gradient(135deg, ${BRAND.teal}, ${BRAND.blue})`,
              borderRadius: 16,
              padding: "16px 22px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 18,
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

            {results.map((p) => (
              <ProviderCard key={p.id} provider={p} categories={categories} services={services} onClick={() => setSelectedProvider(p)} />
            ))}
          </div>
        )}

        {/* ── CATEGORY GRID — each card gets a logo color ── */}
        {!searched && (
          <div style={{ marginTop: 40 }}>
            {/* Section header — orange band */}
            <div style={{
              background: `linear-gradient(135deg, ${BRAND.orange}, ${BRAND.yellow})`,
              borderRadius: 16,
              padding: "18px 22px",
              marginBottom: 20,
            }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>Browse by Category</div>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.85)", marginTop: 3 }}>Tap a category to filter your search</div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(145px, 1fr))", gap: 14 }}>
              {categories.map((c, i) => {
                const palette = [
                  BRAND.teal, BRAND.orange, BRAND.blue, BRAND.green,
                  BRAND.yellow, "#0099CC", BRAND.orange, BRAND.teal,
                  BRAND.green, BRAND.blue
                ];
                const color = palette[i % palette.length];
                const active = selectedCategory === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCategory(active ? "" : c.id)}
                    style={{
                      background: active ? color : "#fff",
                      color: active ? "#fff" : BRAND.text,
                      borderRadius: 16,
                      padding: "20px 12px",
                      textAlign: "center",
                      cursor: "pointer",
                      boxShadow: active ? `0 6px 20px ${color}55` : "0 3px 14px rgba(0,0,0,0.08)",
                      fontSize: 15,
                      fontWeight: 600,
                      border: `2px solid ${active ? "transparent" : color + "40"}`,
                      transition: "all 0.18s",
                    }}
                  >
                    <div style={{ fontSize: 30, marginBottom: 8 }}>{c.icon}</div>
                    <div style={{ color: active ? "#fff" : color, fontWeight: 700 }}>{c.name}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── HOW IT WORKS — green band ── */}
        {!searched && (
          <div style={{ marginTop: 44 }}>
            <div style={{
              background: `linear-gradient(135deg, ${BRAND.green}, #1a7a28)`,
              borderRadius: 20,
              padding: "28px 24px",
            }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", marginBottom: 20, textAlign: "center" }}>
                How V-Hub Works
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                {[
                  { icon: "📍", title: "Select Your Village", desc: "Pick your area in The Villages" },
                  { icon: "🔍", title: "Find a Service", desc: "Browse categories or search directly" },
                  { icon: "📞", title: "Contact Directly", desc: "Call or email the provider — no middleman" },
                ].map((step, i) => (
                  <div key={i} style={{ textAlign: "center", background: "rgba(255,255,255,0.12)", borderRadius: 14, padding: "18px 10px" }}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>{step.icon}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{step.title}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)" }}>{step.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── FOOTER BAND — deep blue ── */}
        {!searched && (
          <div style={{
            marginTop: 32,
            background: `linear-gradient(135deg, ${BRAND.deepBlue}, #003F6B)`,
            borderRadius: 20,
            padding: "24px",
            textAlign: "center",
          }}>
            <img
              src="https://media.base44.com/images/public/69d062aca815ce8e697894b1/f418f4c1d_V-Hublogo.png"
              alt="V-Hub"
              style={{ width: 60, height: 60, objectFit: "contain", marginBottom: 10 }}
            />
            <div style={{ color: "#fff", fontSize: 16, fontWeight: 700 }}>V-HUB — The Villages, FL</div>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, marginTop: 4 }}>
              Connecting residents with trusted local providers
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Provider Card ─────────────────────────────────────────────────────────────
function ProviderCard({ provider, categories, services, onClick }) {
  const cat = categories.find((c) => c.id === provider.category_id);
  const providerServices = services.filter((s) => provider.services && provider.services.includes(s.id));
  const isFeatured = provider.subscription_tier === "premium" || provider.subscription_tier === "featured";

  return (
    <div onClick={onClick} style={{
      background: "#fff",
      borderRadius: 18,
      padding: "22px",
      marginBottom: 16,
      boxShadow: "0 4px 18px rgba(0,0,0,0.08)",
      cursor: "pointer",
      borderLeft: `5px solid ${isFeatured ? BRAND.orange : BRAND.teal}`,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 10 }}>
        {provider.logo_url ? (
          <img src={provider.logo_url} style={{ width: 56, height: 56, borderRadius: 12, objectFit: "cover" }} alt="" />
        ) : (
          <div style={{ width: 56, height: 56, borderRadius: 12, background: `linear-gradient(135deg, ${BRAND.orange}, ${BRAND.teal})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, color: "#fff", fontWeight: 700 }}>
            {provider.business_name?.[0] || "?"}
          </div>
        )}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: BRAND.text }}>{provider.business_name}</div>
          {cat && <div style={{ fontSize: 14, color: BRAND.teal, fontWeight: 600 }}>{cat.icon} {cat.name}</div>}
        </div>
        {isFeatured && (
          <div style={{ background: `linear-gradient(135deg, ${BRAND.orange}, ${BRAND.yellow})`, color: "#fff", borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 700 }}>
            ⭐ Featured
          </div>
        )}
      </div>
      {provider.description && (
        <div style={{ fontSize: 15, color: BRAND.subtext, marginBottom: 10, lineHeight: 1.5 }}>
          {provider.description.slice(0, 110)}{provider.description.length > 110 ? "..." : ""}
        </div>
      )}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
        {providerServices.slice(0, 4).map((s) => (
          <span key={s.id} style={{ background: `${BRAND.teal}18`, color: BRAND.teal, borderRadius: 20, padding: "4px 12px", fontSize: 13, fontWeight: 600 }}>
            {s.name}
          </span>
        ))}
        {providerServices.length > 4 && <span style={{ color: BRAND.subtext, fontSize: 13 }}>+{providerServices.length - 4} more</span>}
      </div>
      <div style={{ color: BRAND.orange, fontWeight: 600, fontSize: 15, textAlign: "right" }}>View Details →</div>
    </div>
  );
}

// ── Provider Profile ──────────────────────────────────────────────────────────
function ProviderProfile({ provider, areas, categories, services, onBack }) {
  const cat = categories.find((c) => c.id === provider.category_id);
  const providerServices = services.filter((s) => provider.services && provider.services.includes(s.id));
  const providerAreas = areas.filter((a) => provider.service_areas && provider.service_areas.includes(a.id));

  return (
    <div style={{ minHeight: "100vh", background: BRAND.lightBg, fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{
        background: `linear-gradient(135deg, #001F3F, #003F6B)`,
        padding: "20px 24px",
        display: "flex", alignItems: "center", gap: 12,
        boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
      }}>
        <button onClick={onBack} style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", borderRadius: 10, padding: "8px 16px", fontSize: 16, cursor: "pointer", fontWeight: 600 }}>
          ← Back
        </button>
        <img src="https://media.base44.com/images/public/69d062aca815ce8e697894b1/f418f4c1d_V-Hublogo.png"
          style={{ height: 40, width: 40, borderRadius: 6, objectFit: "contain" }} alt="V-Hub" />
        <div style={{ color: "#fff", fontSize: 20, fontWeight: 700 }}>Provider Profile</div>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 20px" }}>
        {/* Profile — blue */}
        <div style={{ background: `linear-gradient(135deg, ${BRAND.blue}18, ${BRAND.teal}10)`, borderRadius: 20, padding: "28px", boxShadow: "0 6px 24px rgba(0,0,0,0.09)", marginBottom: 20, border: `2px solid ${BRAND.blue}25` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
            {provider.logo_url ? (
              <img src={provider.logo_url} style={{ width: 80, height: 80, borderRadius: 16, objectFit: "cover", border: `3px solid ${BRAND.blue}` }} alt="" />
            ) : (
              <div style={{ width: 80, height: 80, borderRadius: 16, background: `linear-gradient(135deg, ${BRAND.orange}, ${BRAND.teal})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, color: "#fff", fontWeight: 700 }}>
                {provider.business_name?.[0] || "?"}
              </div>
            )}
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, color: BRAND.text }}>{provider.business_name}</div>
              {cat && <div style={{ fontSize: 16, color: BRAND.teal, fontWeight: 600 }}>{cat.icon} {cat.name}</div>}
              {provider.years_in_business && <div style={{ fontSize: 14, color: BRAND.subtext }}>{provider.years_in_business} years in business</div>}
            </div>
          </div>
          {provider.description && (
            <div style={{ fontSize: 17, color: BRAND.subtext, lineHeight: 1.7 }}>{provider.description}</div>
          )}
        </div>

        {/* Contact — orange */}
        <div style={{ background: `linear-gradient(135deg, ${BRAND.orange}12, ${BRAND.yellow}10)`, borderRadius: 20, padding: "28px", boxShadow: "0 6px 24px rgba(0,0,0,0.08)", marginBottom: 20, border: `2px solid ${BRAND.orange}25` }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: BRAND.orange, marginBottom: 18 }}>📞 Contact This Provider</div>
          {provider.phone && (
            <a href={`tel:${provider.phone}`} style={{ textDecoration: "none" }}>
              <div style={contactRowStyle(BRAND.orange)}><span style={{ fontSize: 22 }}>📱</span><span style={{ fontSize: 22, fontWeight: 700 }}>{provider.phone}</span></div>
            </a>
          )}
          {provider.email && (
            <a href={`mailto:${provider.email}`} style={{ textDecoration: "none" }}>
              <div style={contactRowStyle(BRAND.teal)}><span style={{ fontSize: 22 }}>✉️</span><span style={{ fontSize: 18, fontWeight: 600 }}>{provider.email}</span></div>
            </a>
          )}
          {provider.website && (
            <a href={provider.website.startsWith("http") ? provider.website : `https://${provider.website}`} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
              <div style={contactRowStyle(BRAND.blue)}><span style={{ fontSize: 22 }}>🌐</span><span style={{ fontSize: 18, fontWeight: 600 }}>{provider.website}</span></div>
            </a>
          )}
          {!provider.phone && !provider.email && !provider.website && (
            <div style={{ color: BRAND.subtext, fontSize: 16 }}>No contact info available yet.</div>
          )}
        </div>

        {/* Services — teal */}
        {providerServices.length > 0 && (
          <div style={{ background: `linear-gradient(135deg, ${BRAND.teal}12, ${BRAND.blue}08)`, borderRadius: 20, padding: "28px", boxShadow: "0 6px 24px rgba(0,0,0,0.08)", marginBottom: 20, border: `2px solid ${BRAND.teal}25` }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: BRAND.teal, marginBottom: 16 }}>🛠️ Services Offered</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {providerServices.map((s) => (
                <span key={s.id} style={{ background: BRAND.teal, color: "#fff", borderRadius: 20, padding: "8px 18px", fontSize: 16, fontWeight: 600 }}>
                  {s.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Areas — green */}
        {providerAreas.length > 0 && (
          <div style={{ background: `linear-gradient(135deg, ${BRAND.green}12, #1a7a2810)`, borderRadius: 20, padding: "28px", boxShadow: "0 6px 24px rgba(0,0,0,0.08)", border: `2px solid ${BRAND.green}25` }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: BRAND.green, marginBottom: 16 }}>📍 Service Areas</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {providerAreas.map((a) => (
                <span key={a.id} style={{ background: BRAND.green, color: "#fff", borderRadius: 20, padding: "8px 18px", fontSize: 15, fontWeight: 600 }}>
                  {getVillageName(a)}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const labelStyle = { display: "block", fontSize: 17, fontWeight: 700, marginBottom: 8, marginTop: 20 };
const selectStyle = { width: "100%", padding: "16px 14px", fontSize: 17, borderRadius: 12, border: "2px solid #e0e0e0", background: "#fff", color: "#333", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" };
const contactRowStyle = (color) => ({ display: "flex", alignItems: "center", gap: 14, background: `${color}12`, border: `2px solid ${color}35`, borderRadius: 14, padding: "16px 20px", marginBottom: 12, color: color });
