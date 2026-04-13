import { useState, useEffect } from "react";
import { ClassifiedAd, Provider } from "@/api/entities";

// ── Brand constants ──────────────────────────────────────────────────────────
const PAPER      = "#F5EDD6";
const PAPER_MID  = "#EDE0C0";
const PAPER_DK   = "#C8B89A";
const INK        = "#1A1209";
const INK_FADE   = "#6B5B3E";
const BROWN_BTN  = "#7A4520";
const GREEN      = "#2E7D32";
const NAVY       = "#1B3D6F";
const TEAL       = "#00836B";

// All 72 villages for dropdown
const ALL_VILLAGES = [
  "Alhambra","Amelia","Ashland","Belle Aire","Belvedere","Bonita","Bonnybrook",
  "Bradford","Briar Meadow","Bridgeport at Creekside Landing","Bridgeport at Lake Miona",
  "Bridgeport at Lake Sumter","Bridgeport at Laurel Valley","Bridgeport at Miona Shores",
  "Bridgeport at Mission Hills","Buttonwood","Calumet Grove","Caroline","Cason Hammock",
  "Charlotte","Chatham","Chitty Chatty","Citrus Grove","Collier","Collier at Alden Bungalows",
  "Collier at Antrim Dells","Country Club Hills","Dabney","De Allende","De La Vista",
  "Del Mar","DeLuna","DeSoto","Dunedin","Duval","El Cortez","Fenney","Fernandina",
  "Gilchrist","Glenbrook","Hacienda","Haciendas of Mission Hills","Hadley","Hammock at Fenney",
  "Hawkins","Hemingway","Hillsborough","La Reynalda","La Zamora","LaBelle","Lake Deaton",
  "Lake Denham","Lakeshore Cottages","Largo","Liberty Park","Linden","Lynnhaven",
  "Mallory Square","Marsh Bend","McClure","Mira Mesa","Monarch Grove","Newell",
  "Orange Blossom Gardens","Osceola Hills","Osceola Hills at Soaring Eagle Preserve",
  "Palo Alto","Pennecamp","Piedmont","Pine Hills","Pine Ridge","Pinellas","Poinciana",
  "Polo Ridge","Richmond","Rio Grande","Rio Ponderosa","Rio Ranchero","Sabal Chase",
  "Sanibel","Santiago","Santo Domingo","Silver Lake","Springdale","St. Catherine",
  "St. Charles","St. James","St. Johns","Summerhill","Sunset Pointe","Tall Trees",
  "Tamarind Grove","Tierra Del Sol","Valle Verde","Virginia Trace","Winifred","Woodbury"
];

function Rule({ thick } = {}) {
  return <div style={{ borderTop: thick ? `3px double ${INK}` : `1px solid ${INK}`, margin: 0 }} />;
}

function daysUntil(dateStr) {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr) - new Date()) / 86400000);
}

function fmtDate(d) {
  if (!d) return null;
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function ExpiryBadge({ date }) {
  if (!date) return null;
  const days = daysUntil(date);
  if (days < 0) return <span style={{ background: "#c00", color: "#fff", fontSize: 9, borderRadius: 3, padding: "2px 6px", fontWeight: 700, letterSpacing: 0.5 }}>EXPIRED</span>;
  if (days === 0) return <span style={{ background: "#E65100", color: "#fff", fontSize: 9, borderRadius: 3, padding: "2px 6px", fontWeight: 700 }}>ENDS TODAY</span>;
  if (days <= 3) return <span style={{ background: "#FF6F00", color: "#fff", fontSize: 9, borderRadius: 3, padding: "2px 6px", fontWeight: 700 }}>ENDS IN {days}D</span>;
  return <span style={{ background: GREEN, color: "#fff", fontSize: 9, borderRadius: 3, padding: "2px 6px", fontWeight: 700 }}>THRU {fmtDate(date)}</span>;
}

function AdCard({ ad }) {
  const expired = ad.deal_expires_at && daysUntil(ad.deal_expires_at) < 0;

  const trackClick = () => {
    fetch("https://api.base44.app/api/apps/69d062aca815ce8e697894b1/functions/trackEvent", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        provider_id: ad.provider_id,
        event_type: "classified_click",
        area_name: ad.village || "",
        source: "classifieds_page",
      }),
    }).catch(() => {});
  };

  return (
    <div
      onClick={trackClick}
      style={{
        background: expired ? "#F0EAD6" : PAPER,
        border: `2px solid ${expired ? PAPER_DK : INK}`,
        borderRadius: 2,
        padding: "14px 14px 12px",
        fontFamily: "'Times New Roman', serif",
        display: "flex",
        flexDirection: "column",
        gap: 5,
        boxSizing: "border-box",
        width: "100%",
        minHeight: 240,
        position: "relative",
        opacity: expired ? 0.7 : 1,
        cursor: "pointer",
      }}>
      {/* Decorative inner border */}
      <div style={{ position: "absolute", top: 4, left: 4, right: 4, borderTop: `1px solid ${INK}` }} />
      <div style={{ position: "absolute", bottom: 4, left: 4, right: 4, borderBottom: `1px solid ${INK}` }} />

      {/* Image */}
      {ad.image_url && (
        <img
          src={ad.image_url}
          alt={ad.headline}
          style={{ width: "100%", height: 110, objectFit: "cover", borderRadius: 1, border: `1px solid ${PAPER_DK}`, display: "block", flexShrink: 0 }}
        />
      )}

      {/* Headline + expiry badge */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, borderBottom: `1px solid ${PAPER_DK}`, paddingBottom: 5 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: INK, textAlign: "center", textTransform: "uppercase", letterSpacing: 1, lineHeight: 1.3 }}>
          {ad.headline}
        </div>
        <ExpiryBadge date={ad.deal_expires_at} />
      </div>

      {/* Body */}
      <div style={{ fontSize: 12, color: INK, lineHeight: 1.6, flex: 1 }}>
        {ad.body}
      </div>

      {/* Address */}
      {ad.address && (
        <div style={{ fontSize: 11, color: TEAL, fontWeight: 700, display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
          📍 {ad.address}
        </div>
      )}

      {/* Footer — provider + village */}
      <div style={{
        fontSize: 10, color: INK_FADE, textAlign: "center",
        borderTop: `1px solid ${PAPER_DK}`, paddingTop: 5, marginTop: 2,
        fontStyle: "italic", letterSpacing: 0.5,
      }}>
        <strong style={{ fontStyle: "normal" }}>{ad.provider_name}</strong>
        {ad.village ? ` · ${ad.village}` : ""}
      </div>
    </div>
  );
}

// Card shown when a provider has the add-on but no active ad yet
function PlaceholderCard({ provider }) {
  return (
    <div style={{
      background: PAPER, border: `2px dashed ${PAPER_DK}`, borderRadius: 2,
      padding: "20px 14px", fontFamily: "'Times New Roman', serif",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      gap: 8, boxSizing: "border-box", width: "100%", minHeight: 180, textAlign: "center",
    }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: INK_FADE, textTransform: "uppercase", letterSpacing: 1 }}>
        {provider.business_name}
      </div>
      <div style={{ fontSize: 11, color: INK_FADE, fontStyle: "italic" }}>
        No active deal at the moment — check back soon!
      </div>
      {provider.address && (
        <div style={{ fontSize: 11, color: TEAL, fontWeight: 700 }}>📍 {provider.address}</div>
      )}
      <div style={{ fontSize: 10, color: INK_FADE }}>{provider.service_areas_text || ""}</div>
    </div>
  );
}

export default function Classifieds() {
  const [ads, setAds] = useState([]);          // active ClassifiedAd records
  const [addonProviders, setAddonProviders] = useState([]); // all providers with classifieds_addon
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [villageFilter, setVillageFilter] = useState("");

  // Read ?village= from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const v = params.get("village");
    if (v) setVillageFilter(v);
  }, []);

  useEffect(() => {
    Promise.all([
      ClassifiedAd.filter({ is_active: true }).catch(() => []),
      Provider.filter({ classifieds_addon: true, is_active: true }).catch(() => []),
    ]).then(([adData, provData]) => {
      // Sort ads A-Z by provider name
      const sorted = [...adData].sort((a, b) => (a.provider_name || "").localeCompare(b.provider_name || ""));
      setAds(sorted);
      // Sort providers A-Z
      const sortedProv = [...provData].sort((a, b) => (a.business_name || "").localeCompare(b.business_name || ""));
      setAddonProviders(sortedProv);
    }).finally(() => setLoading(false));
  }, []);

  // Build the combined display list:
  // - Show all providers with classifieds_addon (even if no active ad)
  // - Merge in their active ad if they have one
  // - Filter by search text and village
  const displayItems = (() => {
    const q = search.toLowerCase().trim();
    const v = villageFilter.toLowerCase().trim();

    return addonProviders
      .map(provider => {
        const ad = ads.find(a => a.provider_id === provider.id);
        return { provider, ad };
      })
      .filter(({ provider, ad }) => {
        // Village filter — check provider's service_areas array AND ad.village
        if (v) {
          const provAreas = (provider.service_areas || []).map(a => (typeof a === "string" ? a : a.name || "").toLowerCase());
          const adVillage = (ad?.village || "").toLowerCase();
          const provAddress = (provider.address || "").toLowerCase();
          const matchesVillage = provAreas.some(a => a.includes(v)) || adVillage.includes(v) || provAddress.includes(v);
          if (!matchesVillage) return false;
        }
        // Text search — provider name, services, headline, body, address, village
        if (q) {
          const haystack = [
            provider.business_name,
            ad?.provider_name,
            ad?.village,
            ad?.headline,
            ad?.body,
            ad?.address,
            provider.address,
            ...(provider.service_areas || []).map(a => typeof a === "string" ? a : a.name || ""),
          ].join(" ").toLowerCase();
          if (!haystack.includes(q)) return false;
        }
        return true;
      });
  })();

  const hasActiveAd = (providerId) => ads.some(a => a.provider_id === providerId);

  return (
    <div style={{ minHeight: "100vh", background: PAPER_MID, fontFamily: "'Times New Roman', serif" }}>

      {/* ── MASTHEAD ── */}
      <div style={{ background: PAPER, borderBottom: `3px double ${INK}`, padding: "14px 16px 10px" }}>
        <div style={{ textAlign: "center", marginBottom: 6 }}>
          <a href="/" style={{ textDecoration: "none" }}>
            <img src="https://media.base44.com/images/public/69d062aca815ce8e697894b1/a9af95bc3_V-Hublogo.png" alt="V-Hub" style={{ height: 52, marginBottom: 2 }} />
          </a>
        </div>
        <Rule thick />
        <div style={{ textAlign: "center", padding: "8px 0 4px" }}>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: INK }}>
            THE VILLAGES CLASSIFIEDS
          </div>
          <div style={{ fontSize: 12, fontStyle: "italic", color: INK_FADE, marginTop: 2 }}>
            Exclusive deals & special offers from local service providers
          </div>
        </div>
        <Rule />

        {/* Controls */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
          {/* Row 1: Back + search */}
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <a href="/" style={{ textDecoration: "none", flexShrink: 0 }}>
              <button style={{
                background: `linear-gradient(180deg,#9A6030,${BROWN_BTN} 60%,#5A3010)`,
                border: `2px solid ${NAVY}`, borderRadius: 4, color: "#F5E8CC",
                fontFamily: "'Times New Roman', serif", fontWeight: 700, fontSize: 11,
                letterSpacing: 1, padding: "8px 12px", cursor: "pointer",
              }}>← Home</button>
            </a>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search provider name, service, deal…"
              style={{
                flex: 1, padding: "8px 12px", fontSize: 13,
                fontFamily: "'Times New Roman', serif",
                border: `2px solid ${GREEN}`, borderRadius: 4,
                background: PAPER, color: INK, outline: "none", boxSizing: "border-box",
              }}
            />
          </div>

          {/* Row 2: Village filter */}
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: INK_FADE, letterSpacing: 1, textTransform: "uppercase", flexShrink: 0, fontFamily: "'Times New Roman', serif" }}>
              📍 Village:
            </div>
            <select
              value={villageFilter}
              onChange={e => setVillageFilter(e.target.value)}
              style={{
                flex: 1, padding: "8px 12px", fontSize: 13,
                fontFamily: "'Times New Roman', serif",
                border: `2px solid ${GREEN}`, borderRadius: 4,
                background: PAPER, color: INK, outline: "none", boxSizing: "border-box",
              }}
            >
              <option value="">All Villages — Show Everything</option>
              {ALL_VILLAGES.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
            {villageFilter && (
              <button
                onClick={() => setVillageFilter("")}
                style={{ background: "none", border: `1px solid ${PAPER_DK}`, borderRadius: 4, color: INK_FADE, fontSize: 11, padding: "6px 10px", cursor: "pointer", flexShrink: 0, fontFamily: "'Times New Roman', serif" }}
              >✕ Clear</button>
            )}
          </div>
        </div>
      </div>

      {/* ── STATS BAR ── */}
      <div style={{ background: INK, color: PAPER, padding: "5px 16px", fontSize: 11, letterSpacing: 1, textAlign: "center" }}>
        {loading ? "Loading classifieds…" : (
          <>
            {displayItems.length} {displayItems.length === 1 ? "provider" : "providers"}
            {villageFilter ? ` in ${villageFilter}` : " across The Villages"}
            {" — "}{ads.length} active deal{ads.length !== 1 ? "s" : ""} — A–Z order
          </>
        )}
      </div>

      {/* ── CONTENT ── */}
      <div style={{ padding: "16px 12px", maxWidth: 960, margin: "0 auto" }}>
        {loading && (
          <div style={{ textAlign: "center", padding: 40, color: INK_FADE, fontSize: 14 }}>
            Loading classifieds…
          </div>
        )}

        {!loading && (
          <>
            <style>{`
              .ad-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 14px;
              }
              @media (max-width: 720px) { .ad-grid { grid-template-columns: repeat(2, 1fr); } }
              @media (max-width: 460px) { .ad-grid { grid-template-columns: 1fr; } }
            `}</style>

            {displayItems.length === 0 ? (
              <div style={{
                textAlign: "center", padding: "40px 20px", color: INK_FADE,
                fontStyle: "italic", fontSize: 15, border: `1px dashed ${PAPER_DK}`,
                borderRadius: 4, background: PAPER, margin: "20px 0",
              }}>
                {search || villageFilter
                  ? `No results for "${[villageFilter, search].filter(Boolean).join(" · ")}" — try a different search or clear the filter.`
                  : "No providers have active classifieds yet. Check back soon!"}
              </div>
            ) : (
              <div className="ad-grid">
                {displayItems.map(({ provider, ad }) =>
                  ad
                    ? <AdCard key={provider.id} ad={ad} />
                    : <PlaceholderCard key={provider.id} provider={provider} />
                )}
              </div>
            )}
          </>
        )}

        {/* Footer CTA */}
        <div style={{
          marginTop: 24, padding: "12px 16px",
          borderTop: `2px double ${INK}`, textAlign: "center",
          fontSize: 11, color: INK_FADE, fontStyle: "italic",
        }}>
          Are you a V-Hub provider?{" "}
          <a href="/ProviderDashboard" style={{ color: BROWN_BTN, fontWeight: 700 }}>Sign in to your Provider Hub</a>{" "}
          and add a classified ad for just $10/month.
        </div>
      </div>
    </div>
  );
}
