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
const SERIF      = "'Times New Roman', Georgia, serif";
const SANS       = "'Arial', sans-serif";

// All villages for dropdown
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

function daysUntil(dateStr) {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr) - new Date()) / 86400000);
}

function fmtDate(d) {
  if (!d) return null;
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function todayLine() {
  return new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

function ExpiryBadge({ date }) {
  if (!date) return null;
  const days = daysUntil(date);
  if (days < 0)  return <span style={{ background: "#8B0000", color: "#fff", fontSize: 9, borderRadius: 2, padding: "2px 7px", fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", fontFamily: SANS }}>Expired</span>;
  if (days === 0) return <span style={{ background: "#C62828", color: "#fff", fontSize: 9, borderRadius: 2, padding: "2px 7px", fontWeight: 700, letterSpacing: 0.8, fontFamily: SANS }}>Ends Today</span>;
  if (days <= 3)  return <span style={{ background: "#E65100", color: "#fff", fontSize: 9, borderRadius: 2, padding: "2px 7px", fontWeight: 700, letterSpacing: 0.8, fontFamily: SANS }}>Ends in {days} day{days > 1 ? "s" : ""}</span>;
  if (days <= 14) return <span style={{ background: BROWN_BTN, color: "#F5E8CC", fontSize: 9, borderRadius: 2, padding: "2px 7px", fontWeight: 700, letterSpacing: 0.8, fontFamily: SANS }}>Thru {fmtDate(date)}</span>;
  return <span style={{ background: GREEN, color: "#fff", fontSize: 9, borderRadius: 2, padding: "2px 7px", fontWeight: 700, letterSpacing: 0.8, fontFamily: SANS }}>Thru {fmtDate(date)}</span>;
}

function AdCard({ ad }) {
  const expired = ad.deal_expires_at && daysUntil(ad.deal_expires_at) < 0;
  const [hovered, setHovered] = useState(false);

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
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: expired ? "#EEE5CC" : PAPER,
        border: `2px solid ${INK}`,
        borderRadius: 0,                    // sharp newspaper corners
        padding: "0",
        fontFamily: SERIF,
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
        width: "100%",
        minHeight: 260,
        position: "relative",
        opacity: expired ? 0.65 : 1,
        cursor: "pointer",
        boxShadow: hovered && !expired ? "3px 3px 10px rgba(26,18,9,0.18)" : "2px 2px 6px rgba(26,18,9,0.08)",
        transition: "box-shadow 0.15s",
      }}>

      {/* ── Top rule strip ── */}
      <div style={{ borderBottom: `3px double ${INK}`, padding: "8px 12px 6px", background: expired ? "#E8DEC5" : PAPER_MID }}>
        {/* Category tag line */}
        <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: INK_FADE, fontFamily: SANS, textAlign: "center", marginBottom: 4 }}>
          ✦ Advertisement ✦
        </div>
        {/* Big headline */}
        <div style={{ fontSize: 14, fontWeight: 900, color: INK, textAlign: "center", textTransform: "uppercase", letterSpacing: 0.8, lineHeight: 1.25, fontFamily: SERIF }}>
          {ad.headline}
        </div>
        {/* Expiry badge */}
        <div style={{ textAlign: "center", marginTop: 5 }}>
          <ExpiryBadge date={ad.deal_expires_at} />
        </div>
      </div>

      {/* ── Image (if any) ── */}
      {ad.image_url && (
        <img
          src={ad.image_url}
          alt={ad.headline}
          style={{ width: "100%", height: 115, objectFit: "cover", display: "block", borderBottom: `1px solid ${INK}`, flexShrink: 0 }}
        />
      )}

      {/* ── Body copy ── */}
      <div style={{ padding: "10px 12px", fontSize: 12, color: INK, lineHeight: 1.75, flex: 1, fontFamily: SERIF, textAlign: "justify" }}>
        {ad.body}
      </div>

      {/* ── Address ── */}
      {ad.address && (
        <div style={{ padding: "0 12px 8px", fontSize: 11, color: TEAL, fontWeight: 700, fontFamily: SANS, display: "flex", alignItems: "center", gap: 4 }}>
          📍 {ad.address}
        </div>
      )}

      {/* ── Footer nameplate ── */}
      <div style={{
        borderTop: `2px solid ${INK}`,
        padding: "6px 12px 8px",
        background: INK,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 6,
        flexWrap: "wrap",
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: PAPER, fontFamily: SANS, letterSpacing: 0.5 }}>
          {ad.provider_name}
        </div>
        {ad.village && (
          <div style={{ fontSize: 10, color: PAPER_DK, fontFamily: SERIF, fontStyle: "italic" }}>
            📍 {ad.village}
          </div>
        )}
      </div>
    </div>
  );
}

// Placeholder — provider has addon but no active ad
function PlaceholderCard({ provider }) {
  return (
    <div style={{
      background: PAPER,
      border: `2px dashed ${PAPER_DK}`,
      borderRadius: 0,
      padding: "0",
      fontFamily: SERIF,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      boxSizing: "border-box",
      width: "100%",
      minHeight: 200,
      textAlign: "center",
      gap: 0,
    }}>
      <div style={{ borderBottom: `1px solid ${PAPER_DK}`, width: "100%", padding: "8px 12px 6px", background: PAPER_MID, textAlign: "center" }}>
        <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: 2, color: INK_FADE, fontFamily: SANS }}>✦ Coming Soon ✦</div>
      </div>
      <div style={{ padding: "18px 16px", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
        <div style={{ fontSize: 14, fontWeight: 900, color: INK, textTransform: "uppercase", letterSpacing: 0.8 }}>
          {provider.business_name}
        </div>
        <div style={{ width: 40, borderTop: `1px solid ${PAPER_DK}` }} />
        <div style={{ fontSize: 11, color: INK_FADE, fontStyle: "italic", lineHeight: 1.6 }}>
          No active deal at the moment.<br />Check back soon!
        </div>
        {provider.address && (
          <div style={{ fontSize: 11, color: TEAL, fontWeight: 700, fontFamily: SANS }}>📍 {provider.address}</div>
        )}
      </div>
    </div>
  );
}

export default function Classifieds() {
  const [ads, setAds] = useState([]);
  const [addonProviders, setAddonProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [villageFilter, setVillageFilter] = useState("");

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
      const sorted = [...adData].sort((a, b) => (a.provider_name || "").localeCompare(b.provider_name || ""));
      setAds(sorted);
      const sortedProv = [...provData].sort((a, b) => (a.business_name || "").localeCompare(b.business_name || ""));
      setAddonProviders(sortedProv);
    }).finally(() => setLoading(false));
  }, []);

  const displayItems = (() => {
    const q = search.toLowerCase().trim();
    const v = villageFilter.toLowerCase().trim();
    return addonProviders
      .map(provider => {
        const ad = ads.find(a => a.provider_id === provider.id);
        return { provider, ad };
      })
      .filter(({ provider, ad }) => {
        if (v) {
          const provAreas = (provider.service_areas || []).map(a => (typeof a === "string" ? a : a.name || "").toLowerCase());
          const adVillage = (ad?.village || "").toLowerCase();
          const provAddress = (provider.address || "").toLowerCase();
          if (![...provAreas, adVillage, provAddress].some(s => s.includes(v))) return false;
        }
        if (q) {
          const haystack = [provider.business_name, ad?.provider_name, ad?.village, ad?.headline, ad?.body, ad?.address, provider.address, ...(provider.service_areas || []).map(a => typeof a === "string" ? a : a.name || "")].join(" ").toLowerCase();
          if (!haystack.includes(q)) return false;
        }
        return true;
      });
  })();

  return (
    <div style={{ minHeight: "100vh", background: "#DDD3B0", fontFamily: SERIF }}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap" rel="stylesheet" />

      {/* ═══════════ MASTHEAD ═══════════ */}
      <div style={{ background: PAPER, borderBottom: `4px double ${INK}` }}>

        {/* Top strip — date + edition */}
        <div style={{ borderBottom: `1px solid ${INK}`, padding: "4px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 4, overflow: "hidden" }}>
          <div style={{ fontSize: 10, color: INK_FADE, fontFamily: SERIF, fontStyle: "italic", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "40%" }}>
            {todayLine()}
          </div>
          <div style={{ fontSize: 10, color: INK_FADE, fontFamily: SERIF, letterSpacing: 1, textTransform: "uppercase", flexShrink: 0 }}>
            The Villages, Florida
          </div>
          <div style={{ fontSize: 10, color: INK_FADE, fontFamily: SERIF, fontStyle: "italic", flexShrink: 0 }}>
            Complimentary
          </div>
        </div>

        {/* Logo + nameplate — same layout as homepage */}
        <div style={{ padding: "18px 14px 8px" }}>
          {/* Logo row: icon | stacked title */}
          <a href="/" style={{ textDecoration: "none" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
              <img
                src="https://base44.app/api/apps/69d062aca815ce8e697894b1/files/mp/public/69d062aca815ce8e697894b1/f14a7cbd0_logo_icon_small.png"
                alt="V-Hub logo"
                style={{ width: 100, height: 100, objectFit: "contain", flexShrink: 0 }}
              />
              <div style={{ textAlign: "center", lineHeight: 1, fontFamily: SERIF }}>
                <div style={{ fontStyle: "italic", fontWeight: 700, fontFamily: "'Great Vibes', cursive", fontSize: 62, color: "#003366", WebkitTextStroke: "0.6px #003366", textShadow: "0.5px 0.5px 0 #001a40", lineHeight: 1 }}>V</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: INK, letterSpacing: 4, lineHeight: 1, margin: "1px 0" }}>—</div>
                <div style={{ fontSize: 52, fontWeight: 900, color: INK, letterSpacing: -1, lineHeight: 1 }}>Hub</div>
              </div>
            </div>
          </a>
          {/* Section title below logo */}
          <div style={{ textAlign: "center", marginTop: 10 }}>
            <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: 4, textTransform: "uppercase", color: INK, fontFamily: SERIF, lineHeight: 1.2 }}>
              The Villages Classifieds
            </div>
            <div style={{ fontSize: 11, fontStyle: "italic", color: INK_FADE, marginTop: 4, letterSpacing: 0.5, fontFamily: SERIF }}>
              Exclusive deals &amp; special offers from your local service providers
            </div>
          </div>
        </div>

        {/* Rule */}
        <div style={{ borderTop: `1px solid ${INK}`, borderBottom: `3px double ${INK}`, height: 4, margin: "8px 16px" }} />

        {/* ── Controls ── */}
        <div style={{ padding: "10px 16px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <a href="/" style={{ textDecoration: "none", flexShrink: 0 }}>
              <button style={{
                background: `linear-gradient(180deg, #9A6030, ${BROWN_BTN} 60%, #5A2F10)`,
                border: `2px solid ${NAVY}`,
                borderRadius: 3, color: "#F5E8CC",
                fontFamily: SERIF, fontWeight: 700, fontSize: 12,
                letterSpacing: 1, padding: "8px 14px", cursor: "pointer",
                boxShadow: "1px 1px 3px rgba(0,0,0,0.3)",
              }}>← Home</button>
            </a>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search ads — provider name, deal, keyword…"
              style={{
                flex: 1, padding: "9px 13px", fontSize: 13,
                fontFamily: SERIF,
                border: `2px solid ${GREEN}`,
                borderRadius: 3,
                background: PAPER, color: INK, outline: "none", boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: INK_FADE, letterSpacing: 1, textTransform: "uppercase", flexShrink: 0, fontFamily: SANS }}>
              📍 Filter by Village:
            </span>
            <select
              value={villageFilter}
              onChange={e => setVillageFilter(e.target.value)}
              style={{
                flex: 1, padding: "8px 12px", fontSize: 13,
                fontFamily: SERIF,
                border: `2px solid ${GREEN}`,
                borderRadius: 3,
                background: PAPER, color: INK, outline: "none", boxSizing: "border-box",
              }}
            >
              <option value="">All Villages — Show Everything</option>
              {ALL_VILLAGES.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
            {villageFilter && (
              <button
                onClick={() => setVillageFilter("")}
                style={{ background: "none", border: `1px solid ${PAPER_DK}`, borderRadius: 3, color: INK_FADE, fontSize: 11, padding: "7px 10px", cursor: "pointer", flexShrink: 0, fontFamily: SANS }}>
                ✕ Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Ink banner bar ── */}
      <div style={{ background: INK, color: PAPER, padding: "5px 12px", fontSize: 10, letterSpacing: 1, textAlign: "center", textTransform: "uppercase", fontFamily: SANS, fontWeight: 700, wordBreak: "break-word" }}>
        {loading ? "Loading…" : (
          <>
            {displayItems.length} {displayItems.length === 1 ? "Advertiser" : "Advertisers"}
            {villageFilter ? ` · ${villageFilter}` : " · All Villages"}
            {" · "}{ads.length} Active Deal{ads.length !== 1 ? "s" : ""}
          </>
        )}
      </div>

      {/* ═══════════ ADS GRID ═══════════ */}
      <div style={{ padding: "18px 14px 32px", maxWidth: 980, margin: "0 auto" }}>

        {loading && (
          <div style={{ textAlign: "center", padding: 48, color: INK_FADE, fontSize: 15, fontStyle: "italic", fontFamily: SERIF }}>
            Setting type… loading classifieds…
          </div>
        )}

        {!loading && (
          <>
            <style>{`
              .classified-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 16px;
              }
              @media (max-width: 740px) { .classified-grid { grid-template-columns: repeat(2, 1fr); } }
              @media (max-width: 480px) { .classified-grid { grid-template-columns: 1fr; } }
            `}</style>

            {/* Section header rule */}
            <div style={{ textAlign: "center", marginBottom: 14 }}>
              <div style={{ borderTop: `3px double ${INK}`, marginBottom: 5 }} />
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: INK_FADE, fontFamily: SANS }}>
                ✦ &nbsp; Paid Advertisements — Local Service Providers &nbsp; ✦
              </div>
              <div style={{ borderBottom: `3px double ${INK}`, marginTop: 5 }} />
            </div>

            {displayItems.length === 0 ? (
              <div style={{
                textAlign: "center", padding: "40px 20px",
                color: INK_FADE, fontStyle: "italic", fontSize: 15,
                border: `2px dashed ${PAPER_DK}`,
                background: PAPER, margin: "20px 0", fontFamily: SERIF,
              }}>
                {search || villageFilter
                  ? `No ads match "${[villageFilter, search].filter(Boolean).join(" · ")}" — try clearing the filter.`
                  : "No classifieds posted yet. Check back soon!"}
              </div>
            ) : (
              <div className="classified-grid">
                {displayItems.map(({ provider, ad }) =>
                  ad
                    ? <AdCard key={provider.id} ad={ad} />
                    : <PlaceholderCard key={provider.id} provider={provider} />
                )}
              </div>
            )}

            {/* ── FOOTER CTA ── */}
            <div style={{ marginTop: 28, borderTop: `3px double ${INK}`, paddingTop: 14 }}>
              <div style={{ background: PAPER, border: `2px solid ${INK}`, padding: "14px 18px", textAlign: "center" }}>
                <div style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: INK, fontFamily: SANS, marginBottom: 5 }}>
                  Advertise Here
                </div>
                <div style={{ fontSize: 12, color: INK_FADE, fontFamily: SERIF, lineHeight: 1.7 }}>
                  Are you a V-Hub provider? Add a classified ad to your listing for just{" "}
                  <strong style={{ color: INK }}>$10/month</strong> and reach thousands of Villages residents.
                </div>
                <div style={{ marginTop: 10 }}>
                  <a href="/ProviderDashboard" style={{ textDecoration: "none" }}>
                    <button style={{
                      background: `linear-gradient(180deg, #9A6030, ${BROWN_BTN} 60%, #5A2F10)`,
                      border: `2px solid ${NAVY}`, borderRadius: 3,
                      color: "#F5E8CC", fontFamily: SANS, fontWeight: 700,
                      fontSize: 12, letterSpacing: 1, padding: "9px 20px", cursor: "pointer",
                      boxShadow: "1px 1px 3px rgba(0,0,0,0.25)",
                    }}>
                      Sign In to Provider Hub →
                    </button>
                  </a>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
