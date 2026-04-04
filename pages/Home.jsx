import { useState, useEffect } from "react";
import { ServiceArea, Category, Service, Provider } from "@/api/entities";

const BRAND = {
  orange: "#E8431A",
  teal: "#00BFA5",
  blue: "#0077B6",
  lightBg: "#F8FFFE",
  cardBg: "#FFFFFF",
  text: "#1A1A2E",
  subtext: "#555",
};

export default function Home() {
  const [areas, setAreas] = useState([]);
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [providers, setProviders] = useState([]);

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

  const handleSearch = async () => {
    if (!selectedArea) return;
    const all = await Provider.filter({ is_visible: true });
    const filtered = all.filter((p) => {
      const areaMatch = p.service_areas && p.service_areas.includes(selectedArea);
      const serviceMatch =
        !selectedService ||
        (p.services && p.services.includes(selectedService));
      const statusMatch =
        p.subscription_status === "active" || p.subscription_status === "trial";
      return areaMatch && serviceMatch && statusMatch;
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
      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, ${BRAND.orange}, ${BRAND.teal})`,
        padding: "20px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img src="https://media.base44.com/images/public/69d062aca815ce8e697894b1/a9af95bc3_V-Hublogo.png"
            style={{ height: 54, width: 54, borderRadius: 8 }} alt="V-Hub Logo" />
          <div>
            <div style={{ color: "#fff", fontSize: 26, fontWeight: 800, letterSpacing: 1 }}>V-HUB</div>
            <div style={{ color: "rgba(255,255,255,0.88)", fontSize: 13 }}>The Villages Local Services</div>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div style={{ background: `linear-gradient(135deg, ${BRAND.orange}15, ${BRAND.teal}15)`, padding: "36px 24px 28px", textAlign: "center" }}>
        <div style={{ fontSize: 30, fontWeight: 800, color: BRAND.text, marginBottom: 8 }}>
          Find Local Services in The Villages
        </div>
        <div style={{ fontSize: 18, color: BRAND.subtext }}>
          Trusted providers in your neighborhood — just a tap away
        </div>
      </div>

      {/* Search Card */}
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 20px 40px" }}>
        <div style={{
          background: BRAND.cardBg,
          borderRadius: 20,
          padding: "32px 28px",
          boxShadow: "0 6px 30px rgba(0,0,0,0.10)",
          marginTop: -10
        }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: BRAND.text, marginBottom: 24 }}>
            🔍 Search for a Service
          </div>

          {/* Area */}
          <label style={labelStyle}>📍 Your Area *</label>
          <select
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
            style={selectStyle}
          >
            <option value="">— Select your area —</option>
            {areas.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
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
              background: selectedArea ? `linear-gradient(135deg, ${BRAND.orange}, ${BRAND.teal})` : "#ccc",
              color: "#fff",
              border: "none",
              borderRadius: 14,
              padding: "18px",
              fontSize: 20,
              fontWeight: 700,
              cursor: selectedArea ? "pointer" : "not-allowed",
              marginTop: 8,
              letterSpacing: 0.5,
              boxShadow: selectedArea ? "0 4px 16px rgba(232,67,26,0.35)" : "none"
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
                {results.length > 0 ? `${results.length} Provider${results.length > 1 ? "s" : ""} Found` : "No Providers Found"}
              </div>
              <button onClick={handleReset} style={{ color: BRAND.teal, background: "none", border: "none", fontSize: 16, cursor: "pointer", fontWeight: 600 }}>
                ← New Search
              </button>
            </div>

            {results.length === 0 && (
              <div style={{ textAlign: "center", padding: "40px 20px", background: "#fff", borderRadius: 16, color: BRAND.subtext, fontSize: 18 }}>
                😔 No providers found for this area and service yet.<br />
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

        {/* Categories grid when not searched */}
        {!searched && (
          <div style={{ marginTop: 36 }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: BRAND.text, marginBottom: 16 }}>Browse by Category</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 14 }}>
              {categories.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  style={{
                    background: selectedCategory === c.id ? `linear-gradient(135deg, ${BRAND.orange}, ${BRAND.teal})` : "#fff",
                    color: selectedCategory === c.id ? "#fff" : BRAND.text,
                    borderRadius: 14,
                    padding: "18px 12px",
                    textAlign: "center",
                    cursor: "pointer",
                    boxShadow: "0 3px 12px rgba(0,0,0,0.08)",
                    fontSize: 15,
                    fontWeight: 600,
                    border: `2px solid ${selectedCategory === c.id ? "transparent" : "#eee"}`
                  }}
                >
                  <div style={{ fontSize: 28, marginBottom: 6 }}>{c.icon}</div>
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
        borderLeft: `5px solid ${BRAND.orange}`,
        transition: "transform 0.1s",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 10 }}>
        {provider.logo_url ? (
          <img src={provider.logo_url} style={{ width: 52, height: 52, borderRadius: 12, objectFit: "cover" }} alt="" />
        ) : (
          <div style={{ width: 52, height: 52, borderRadius: 12, background: `linear-gradient(135deg, ${BRAND.orange}, ${BRAND.teal})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: "#fff", fontWeight: 700 }}>
            {provider.business_name?.[0] || "?"}
          </div>
        )}
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: BRAND.text }}>{provider.business_name}</div>
          {cat && <div style={{ fontSize: 14, color: BRAND.teal, fontWeight: 600 }}>{cat.icon} {cat.name}</div>}
        </div>
        {provider.subscription_tier === "featured" || provider.subscription_tier === "premium" ? (
          <div style={{ marginLeft: "auto", background: BRAND.orange, color: "#fff", borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 700 }}>
            ⭐ Featured
          </div>
        ) : null}
      </div>

      {provider.description && (
        <div style={{ fontSize: 15, color: BRAND.subtext, marginBottom: 10, lineHeight: 1.5 }}>
          {provider.description.slice(0, 100)}{provider.description.length > 100 ? "..." : ""}
        </div>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
        {providerServices.slice(0, 4).map((s) => (
          <span key={s.id} style={{ background: `${BRAND.teal}18`, color: BRAND.teal, borderRadius: 20, padding: "4px 12px", fontSize: 13, fontWeight: 600 }}>
            {s.name}
          </span>
        ))}
        {providerServices.length > 4 && (
          <span style={{ color: BRAND.subtext, fontSize: 13, padding: "4px 4px" }}>+{providerServices.length - 4} more</span>
        )}
      </div>

      <div style={{ color: BRAND.orange, fontWeight: 600, fontSize: 15, textAlign: "right" }}>
        View Details →
      </div>
    </div>
  );
}

function ProviderProfile({ provider, areas, categories, services, onBack }) {
  const cat = categories.find((c) => c.id === provider.category_id);
  const providerServices = services.filter((s) => provider.services && provider.services.includes(s.id));
  const providerAreas = areas.filter((a) => provider.service_areas && provider.service_areas.includes(a.id));

  return (
    <div style={{ minHeight: "100vh", background: BRAND.lightBg, fontFamily: "'Segoe UI', sans-serif" }}>
      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, ${BRAND.orange}, ${BRAND.teal})`,
        padding: "20px 24px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
      }}>
        <button onClick={onBack} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", borderRadius: 10, padding: "8px 14px", fontSize: 16, cursor: "pointer", fontWeight: 600 }}>
          ← Back
        </button>
        <div style={{ color: "#fff", fontSize: 20, fontWeight: 700 }}>Provider Profile</div>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 20px" }}>
        {/* Profile Card */}
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
            <div style={{ fontSize: 17, color: BRAND.subtext, lineHeight: 1.7, marginBottom: 16 }}>
              {provider.description}
            </div>
          )}

          {provider.rating && (
            <div style={{ fontSize: 18, marginBottom: 8 }}>
              {"⭐".repeat(Math.round(provider.rating))} <span style={{ color: BRAND.subtext, fontSize: 15 }}>({provider.rating}/5)</span>
            </div>
          )}
        </div>

        {/* Contact Card */}
        <div style={{ background: "#fff", borderRadius: 20, padding: "28px", boxShadow: "0 6px 24px rgba(0,0,0,0.10)", marginBottom: 20 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: BRAND.text, marginBottom: 18 }}>📞 Contact This Provider</div>

          {provider.phone && (
            <a href={`tel:${provider.phone}`} style={{ textDecoration: "none" }}>
              <div style={contactRowStyle(BRAND.orange)}>
                <span>📱</span>
                <span style={{ fontSize: 20, fontWeight: 700 }}>{provider.phone}</span>
              </div>
            </a>
          )}
          {provider.email && (
            <a href={`mailto:${provider.email}`} style={{ textDecoration: "none" }}>
              <div style={contactRowStyle(BRAND.teal)}>
                <span>✉️</span>
                <span style={{ fontSize: 18, fontWeight: 600 }}>{provider.email}</span>
              </div>
            </a>
          )}
          {provider.website && (
            <a href={provider.website.startsWith("http") ? provider.website : `https://${provider.website}`} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
              <div style={contactRowStyle(BRAND.blue)}>
                <span>🌐</span>
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
                <span key={a.id} style={{ background: `${BRAND.orange}15`, color: BRAND.orange, borderRadius: 20, padding: "8px 16px", fontSize: 16, fontWeight: 600 }}>
                  {a.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const labelStyle = {
  display: "block",
  fontSize: 17,
  fontWeight: 600,
  color: "#333",
  marginBottom: 8,
  marginTop: 18,
};

const selectStyle = {
  width: "100%",
  padding: "16px 14px",
  fontSize: 17,
  borderRadius: 12,
  border: "2px solid #e0e0e0",
  background: "#fff",
  color: "#333",
  outline: "none",
  boxSizing: "border-box",
};

const contactRowStyle = (color) => ({
  display: "flex",
  alignItems: "center",
  gap: 14,
  background: `${color}12`,
  border: `2px solid ${color}30`,
  borderRadius: 14,
  padding: "16px 20px",
  marginBottom: 12,
  color: color,
});
