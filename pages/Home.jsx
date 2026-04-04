import { useState, useEffect } from "react";
import { ServiceArea, Category, Service, Provider } from "@/api/entities";

const BRAND = {
  orange: "#E8431A",
  teal: "#00BFA5",
  blue: "#0077B6",
  deepBlue: "#003F6B",
  navyBlue: "#001F3F",
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

      {/* ── HERO SECTION ── */}
      <div style={{
        background: `linear-gradient(170deg, #001F3F 0%, #003F6B 50%, #005f99 100%)`,
        padding: "48px 24px 56px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Decorative background circles */}
        <div style={{
          position: "absolute", top: -60, left: -60,
          width: 220, height: 220, borderRadius: "50%",
          background: "rgba(0,191,165,0.08)", pointerEvents: "none"
        }} />
        <div style={{
          position: "absolute", bottom: -40, right: -40,
          width: 260, height: 260, borderRadius: "50%",
          background: "rgba(232,67,26,0.07)", pointerEvents: "none"
        }} />
        <div style={{
          position: "absolute", top: 20, right: 80,
          width: 120, height: 120, borderRadius: "50%",
          background: "rgba(0,119,182,0.10)", pointerEvents: "none"
        }} />

        {/* Logo */}
        <div style={{
          display: "inline-block",
          background: "rgba(255,255,255,0.06)",
          borderRadius: 32,
          padding: "20px 28px",
          backdropFilter: "blur(8px)",
          border: "1.5px solid rgba(255,255,255,0.12)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.35), 0 0 40px rgba(0,191,165,0.15)",
          marginBottom: 28,
        }}>
          <img
            src="https://media.base44.com/images/public/69d062aca815ce8e697894b1/f418f4c1d_V-Hublogo.png"
            alt="V-Hub"
            style={{
              width: 220,
              height: 220,
              objectFit: "contain",
              display: "block",
              filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.4))",
            }}
          />
        </div>

        {/* Tagline */}
        <div style={{
          color: "#ffffff",
          fontSize: 32,
          fontWeight: 800,
          letterSpacing: 0.5,
          marginBottom: 10,
          textShadow: "0 2px 12px rgba(0,0,0,0.4)",
        }}>
          The Villages Local Services
        </div>
        <div style={{
          color: "rgba(255,255,255,0.75)",
          fontSize: 18,
          fontWeight: 400,
          maxWidth: 480,
          margin: "0 auto",
          lineHeight: 1.6,
        }}>
          Find trusted providers in your neighborhood — fast, simple, and free
        </div>

        {/* Decorative divider */}
        <div style={{
          width: 80, height: 4, borderRadius: 4,
          background: `linear-gradient(90deg, ${BRAND.orange}, ${BRAND.teal})`,
          margin: "22px auto 0",
        }} />
      </div>

      {/* ── SEARCH SECTION ── */}
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 20px 40px" }}>
        <div style={{
          background: BRAND.cardBg,
          borderRadius: 24,
          padding: "36px 30px",
          boxShadow: "0 10px 40px rgba(0,0,0,0.12)",
          marginTop: -28,
          position: "relative",
          zIndex: 10,
          border: "1px solid rgba(0,0,0,0.06)"
        }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: BRAND.text, marginBottom: 6 }}>
            🔍 Find a Service Provider
          </div>
          <div style={{ fontSize: 15, color: BRAND.subtext, marginBottom: 24 }}>
            Select your village, then choose a service to find providers near you.
          </div>

          {/* Village Dropdown */}
          <label style={labelStyle}>📍 Your Village *</label>
          <select
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
            style={selectStyle}
          >
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

          {/* Category */}
          <label style={labelStyle}>📂 Category (optional)</label>
          <select
            value={selectedCategory}
            onChange={(e) => { setSelectedCategory(e.target.value); setSelectedService(""); }}
            style={selectStyle}
          >
            <option value="">— All Categories —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
            ))}
          </select>

          {/* Service */}
          <label style={labelStyle}>🛠️ Service (optional)</label>
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            style={selectStyle}
          >
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
              background: selectedArea
                ? `linear-gradient(135deg, ${BRAND.orange}, ${BRAND.teal})`
                : "#ddd",
              color: "#fff",
              border: "none",
              borderRadius: 14,
              padding: "20px",
              fontSize: 20,
              fontWeight: 700,
              cursor: selectedArea ? "pointer" : "not-allowed",
              marginTop: 20,
              letterSpacing: 0.5,
              boxShadow: selectedArea ? "0 6px 20px rgba(232,67,26,0.35)" : "none",
              transition: "all 0.2s"
            }}
          >
            Search Providers
          </button>
        </div>

        {/* Results */}
        {searched && (
          <div style={{ marginTop: 32 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: BRAND.text }}>
                {results.length > 0
                  ? `${results.length} Provider${results.length > 1 ? "s" : ""} Found`
                  : "No Providers Found"}
              </div>
              <button onClick={handleReset} style={{ color: BRAND.teal, background: "none", border: "none", fontSize: 16, cursor: "pointer", fontWeight: 600 }}>
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
              <ProviderCard
                key={p.id}
                provider={p}
                categories={categories}
                services={services}
                onClick={() => setSelectedProvider(p)}
              />
            ))}
          </div>
        )}

        {/* Category Grid */}
        {!searched && (
          <div style={{ marginTop: 40 }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: BRAND.text, marginBottom: 4 }}>Browse by Category</div>
            <div style={{ fontSize: 15, color: BRAND.subtext, marginBottom: 18 }}>Tap a category to filter your search</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 14 }}>
              {categories.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  style={{
                    background: selectedCategory === c.id
                      ? `linear-gradient(135deg, ${BRAND.orange}, ${BRAND.teal})`
                      : "#fff",
                    color: selectedCategory === c.id ? "#fff" : BRAND.text,
                    borderRadius: 16,
                    padding: "20px 12px",
                    textAlign: "center",
                    cursor: "pointer",
                    boxShadow: "0 3px 14px rgba(0,0,0,0.08)",
                    fontSize: 15,
                    fontWeight: 600,
                    border: `2px solid ${selectedCategory === c.id ? "transparent" : "#eee"}`,
                    transition: "all 0.15s"
                  }}
                >
                  <div style={{ fontSize: 30, marginBottom: 8 }}>{c.icon}</div>
                  {c.name}
                </div>
              ))}
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

  return (
    <div
      onClick={onClick}
      style={{
        background: "#fff",
        borderRadius: 18,
        padding: "22px",
        marginBottom: 16,
        boxShadow: "0 4px 18px rgba(0,0,0,0.08)",
        cursor: "pointer",
        borderLeft: `5px solid ${provider.subscription_tier === "premium" || provider.subscription_tier === "featured" ? BRAND.orange : BRAND.teal}`,
      }}
    >
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
        {(provider.subscription_tier === "featured" || provider.subscription_tier === "premium") && (
          <div style={{ background: BRAND.orange, color: "#fff", borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 700 }}>
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
        {providerServices.length > 4 && (
          <span style={{ color: BRAND.subtext, fontSize: 13 }}>+{providerServices.length - 4} more</span>
        )}
      </div>

      <div style={{ color: BRAND.orange, fontWeight: 600, fontSize: 15, textAlign: "right" }}>
        View Details →
      </div>
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
        display: "flex",
        alignItems: "center",
        gap: 12,
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
        <div style={{ background: "#fff", borderRadius: 20, padding: "28px", boxShadow: "0 6px 24px rgba(0,0,0,0.10)", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
            {provider.logo_url ? (
              <img src={provider.logo_url} style={{ width: 72, height: 72, borderRadius: 16, objectFit: "cover" }} alt="" />
            ) : (
              <div style={{ width: 72, height: 72, borderRadius: 16, background: `linear-gradient(135deg, ${BRAND.orange}, ${BRAND.teal})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", fontWeight: 700 }}>
                {provider.business_name?.[0] || "?"}
              </div>
            )}
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, color: BRAND.text }}>{provider.business_name}</div>
              {cat && <div style={{ fontSize: 16, color: BRAND.teal, fontWeight: 600 }}>{cat.icon} {cat.name}</div>}
              {provider.years_in_business && (
                <div style={{ fontSize: 14, color: BRAND.subtext }}>{provider.years_in_business} years in business</div>
              )}
            </div>
          </div>
          {provider.description && (
            <div style={{ fontSize: 17, color: BRAND.subtext, lineHeight: 1.7 }}>{provider.description}</div>
          )}
        </div>

        {/* Contact */}
        <div style={{ background: "#fff", borderRadius: 20, padding: "28px", boxShadow: "0 6px 24px rgba(0,0,0,0.10)", marginBottom: 20 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: BRAND.text, marginBottom: 18 }}>📞 Contact This Provider</div>
          {provider.phone && (
            <a href={`tel:${provider.phone}`} style={{ textDecoration: "none" }}>
              <div style={contactRowStyle(BRAND.orange)}>
                <span style={{ fontSize: 22 }}>📱</span>
                <span style={{ fontSize: 22, fontWeight: 700 }}>{provider.phone}</span>
              </div>
            </a>
          )}
          {provider.email && (
            <a href={`mailto:${provider.email}`} style={{ textDecoration: "none" }}>
              <div style={contactRowStyle(BRAND.teal)}>
                <span style={{ fontSize: 22 }}>✉️</span>
                <span style={{ fontSize: 18, fontWeight: 600 }}>{provider.email}</span>
              </div>
            </a>
          )}
          {provider.website && (
            <a href={provider.website.startsWith("http") ? provider.website : `https://${provider.website}`} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
              <div style={contactRowStyle(BRAND.blue)}>
                <span style={{ fontSize: 22 }}>🌐</span>
                <span style={{ fontSize: 18, fontWeight: 600 }}>{provider.website}</span>
              </div>
            </a>
          )}
          {!provider.phone && !provider.email && !provider.website && (
            <div style={{ color: BRAND.subtext, fontSize: 16 }}>No contact info available yet.</div>
          )}
        </div>

        {/* Services */}
        {providerServices.length > 0 && (
          <div style={{ background: "#fff", borderRadius: 20, padding: "28px", boxShadow: "0 6px 24px rgba(0,0,0,0.10)", marginBottom: 20 }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: BRAND.text, marginBottom: 16 }}>🛠️ Services Offered</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {providerServices.map((s) => (
                <span key={s.id} style={{ background: `${BRAND.teal}18`, color: BRAND.teal, borderRadius: 20, padding: "8px 16px", fontSize: 16, fontWeight: 600 }}>
                  {s.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Areas */}
        {providerAreas.length > 0 && (
          <div style={{ background: "#fff", borderRadius: 20, padding: "28px", boxShadow: "0 6px 24px rgba(0,0,0,0.10)" }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: BRAND.text, marginBottom: 16 }}>📍 Service Areas</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {providerAreas.map((a) => (
                <span key={a.id} style={{ background: `${BRAND.orange}15`, color: BRAND.orange, borderRadius: 20, padding: "8px 16px", fontSize: 15, fontWeight: 600 }}>
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

const labelStyle = { display: "block", fontSize: 17, fontWeight: 600, color: "#333", marginBottom: 8, marginTop: 18 };
const selectStyle = { width: "100%", padding: "16px 14px", fontSize: 17, borderRadius: 12, border: "2px solid #e0e0e0", background: "#fff", color: "#333", outline: "none", boxSizing: "border-box" };
const contactRowStyle = (color) => ({ display: "flex", alignItems: "center", gap: 14, background: `${color}12`, border: `2px solid ${color}30`, borderRadius: 14, padding: "16px 20px", marginBottom: 12, color: color });
