import { useState, useEffect } from "react";
import { ClassifiedAd, Provider } from "@/api/entities";

const PAPER     = "#F0E6C8";
const PAPER_MID = "#E4D5A8";
const PAPER_DK  = "#C8B07A";
const INK       = "#1C0F00";
const INK_FADE  = "#5C3A10";
const BROWN_BTN = "#7A4820";
const NAVY      = "#1B3D6F";
const GREEN     = "#1A6B3C";
const TEAL      = "#00836B";
const SERIF     = "'Times New Roman', Georgia, serif";
const SANS      = "'Arial', Helvetica, sans-serif";

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

function daysUntil(d) {
  if (!d) return null;
  return Math.ceil((new Date(d) - new Date()) / 86400000);
}
function fmtDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function ExpiryBadge({ date }) {
  if (!date) return null;
  const days = daysUntil(date);
  const base = { fontFamily: SANS, fontWeight: 700, fontSize: 9, borderRadius: 2, padding: "2px 8px", letterSpacing: 0.5, textTransform: "uppercase", display: "inline-block" };
  if (days < 0)   return <span style={{ ...base, background: "#7B0000", color: "#fff" }}>Expired</span>;
  if (days === 0) return <span style={{ ...base, background: "#C62828", color: "#fff" }}>Ends Today</span>;
  if (days <= 3)  return <span style={{ ...base, background: "#E65100", color: "#fff" }}>Ends in {days}d</span>;
  return <span style={{ ...base, background: GREEN, color: "#fff" }}>Thru {fmtDate(date)}</span>;
}

function AdCard({ ad }) {
  const expired = ad.deal_expires_at && daysUntil(ad.deal_expires_at) < 0;
  return (
    <div style={{
      background: PAPER,
      border: `2px solid ${INK}`,
      display: "flex",
      flexDirection: "column",
      boxSizing: "border-box",
      width: "100%",
      opacity: expired ? 0.6 : 1,
      fontFamily: SERIF,
      overflow: "hidden",
    }}>

      {/* ── Header strip ── */}
      <div style={{
        background: INK,
        padding: "7px 10px 6px",
        textAlign: "center",
      }}>
        <div style={{ fontSize: 9, color: PAPER_DK, fontFamily: SANS, letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>
          ✦ Advertisement ✦
        </div>
        <div style={{ fontSize: 13, fontWeight: 900, color: PAPER, textTransform: "uppercase", letterSpacing: 0.5, lineHeight: 1.25, fontFamily: SERIF }}>
          {ad.headline}
        </div>
        <div style={{ marginTop: 5 }}>
          <ExpiryBadge date={ad.deal_expires_at} />
        </div>
      </div>

      {/* ── Image (optional) ── */}
      {ad.image_url && (
        <img
          src={ad.image_url}
          alt={ad.headline}
          style={{ width: "100%", height: 120, objectFit: "cover", display: "block", borderBottom: `1px solid ${PAPER_DK}`, flexShrink: 0 }}
        />
      )}

      {/* ── Body text ── */}
      <div style={{ padding: "10px 12px", fontSize: 12, color: INK, lineHeight: 1.75, flex: 1, textAlign: "justify" }}>
        {ad.body}
      </div>

      {/* ── Address ── */}
      {ad.address && (
        <div style={{ padding: "0 12px 8px", fontSize: 11, color: TEAL, fontWeight: 700, fontFamily: SANS }}>
          📍 {ad.address}
        </div>
      )}

      {/* ── Nameplate footer ── */}
      <div style={{
        borderTop: `1px solid ${PAPER_DK}`,
        background: PAPER_MID,
        padding: "6px 12px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 8,
        flexWrap: "wrap",
      }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: INK, fontFamily: SANS, letterSpacing: 0.3 }}>
          {ad.provider_name}
        </div>
        {ad.village && (
          <div style={{ fontSize: 10, color: INK_FADE, fontFamily: SERIF, fontStyle: "italic" }}>
            {ad.village}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Classifieds() {
  const [ads, setAds] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [village, setVillage] = useState("");

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get("village")) setVillage(p.get("village"));
  }, []);

  useEffect(() => {
    Promise.all([
      ClassifiedAd.filter({ is_active: true }).catch(() => []),
      Provider.filter({ classifieds_addon: true, is_active: true }).catch(() => []),
    ]).then(([adData, provData]) => {
      setAds([...adData].sort((a, b) => (a.provider_name || "").localeCompare(b.provider_name || "")));
      setProviders([...provData].sort((a, b) => (a.business_name || "").localeCompare(b.business_name || "")));
    }).finally(() => setLoading(false));
  }, []);

  const items = providers
    .map(prov => ({ prov, ad: ads.find(a => a.provider_id === prov.id) }))
    .filter(({ prov, ad }) => {
      const v = village.toLowerCase();
      const q = search.toLowerCase().trim();
      if (v) {
        const areas = (prov.service_areas || []).map(a => (typeof a === "string" ? a : a.name || "").toLowerCase());
        const adVillage = (ad?.village || "").toLowerCase();
        if (!areas.some(a => a.includes(v)) && !adVillage.includes(v) && !(prov.address || "").toLowerCase().includes(v)) return false;
      }
      if (q) {
        const hay = [prov.business_name, ad?.headline, ad?.body, ad?.village, ad?.address, prov.address].join(" ").toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

  const today = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  return (
    <div style={{
      minHeight: "100vh",
      background: PAPER,
      backgroundImage: `repeating-linear-gradient(0deg,transparent,transparent 27px,rgba(28,15,0,0.04) 27px,rgba(28,15,0,0.04) 28px)`,
      fontFamily: SERIF,
      maxWidth: 860,
      margin: "0 auto",
      overflowX: "hidden",
      boxShadow: "0 2px 40px rgba(0,0,0,0.28)",
    }}>

      {/* Load Great Vibes font */}
      <link href="https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap" rel="stylesheet" />

      {/* ── NEWSPAPER STACKED PAGES TOP EDGE ── */}
      <div style={{ position: "relative", height: 28, marginBottom: 0 }}>
        <div style={{ position: "absolute", top: 0, left: 6, right: 6, height: 28, background: "#b8a070", borderRadius: "0 0 3px 3px", boxShadow: "0 3px 6px rgba(0,0,0,0.35)" }} />
        <div style={{ position: "absolute", top: 0, left: 4, right: 4, height: 24, background: "#c9b484", borderRadius: "0 0 3px 3px", boxShadow: "0 3px 5px rgba(0,0,0,0.3)" }} />
        <div style={{ position: "absolute", top: 0, left: 3, right: 3, height: 20, background: "#d8c496", borderRadius: "0 0 2px 2px", boxShadow: "0 2px 5px rgba(0,0,0,0.25)" }} />
        <div style={{ position: "absolute", top: 0, left: 2, right: 2, height: 16, background: "#e6d4a8", borderRadius: "0 0 2px 2px", boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }} />
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 12, background: "#F0E6C8", borderRadius: "0 0 2px 2px", boxShadow: "0 4px 10px rgba(0,0,0,0.25), inset 0 -1px 0 rgba(0,0,0,0.1)" }} />
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "linear-gradient(180deg, #1a0a00 0%, #3d2200 100%)" }} />
      </div>

      {/* ════════ MASTHEAD ════════ */}
      <div style={{ background: PAPER, borderBottom: `3px double ${INK}` }}>

        {/* Dateline strip */}
        <div style={{
          borderTop: `3px double ${INK}`,
          borderBottom: `3px double ${INK}`,
          padding: "5px 14px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxSizing: "border-box",
          width: "100%",
          background: PAPER_MID,
        }}>
          <span style={{ fontSize: 10, color: INK_FADE, fontFamily: SERIF, fontStyle: "italic" }}>{today}</span>
          <span style={{ fontSize: 10, color: INK_FADE, fontFamily: SANS, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", textAlign: "center" }}>The Villages, FL</span>
          <span style={{ fontSize: 10, color: INK_FADE, fontFamily: SERIF, fontStyle: "italic" }}>Deals of the Week</span>
        </div>

        {/* Logo row — compact, same as homepage */}
        <div style={{ display: "flex", alignItems: "center", padding: "12px 14px 4px", boxSizing: "border-box" }}>
          {/* Logo icon */}
          <a href="/" style={{ textDecoration: "none", flexShrink: 0 }}>
            <img
              src="https://base44.app/api/apps/69d062aca815ce8e697894b1/files/mp/public/69d062aca815ce8e697894b1/f14a7cbd0_logo_icon_small.png"
              alt="V-Hub"
              style={{ width: 72, height: 72, objectFit: "contain", display: "block" }}
            />
          </a>

          {/* V–Hub wordmark (center) */}
          <a href="/" style={{ textDecoration: "none", flex: 1, textAlign: "center" }}>
            <div style={{ lineHeight: 1 }}>
              <div style={{ fontFamily: "'Great Vibes', cursive", fontSize: 48, color: "#003366", WebkitTextStroke: "0.5px #003366", lineHeight: 1 }}>V</div>
              <div style={{ fontSize: 16, fontWeight: 900, color: INK, letterSpacing: 3, lineHeight: 1 }}>—</div>
              <div style={{ fontSize: 38, fontWeight: 900, color: INK, letterSpacing: -1, lineHeight: 1 }}>Hub</div>
            </div>
          </a>

          {/* Back button (right) */}
          <div style={{ flexShrink: 0 }}>
            <a href="/" style={{ textDecoration: "none" }}>
              <button style={{
                background: `linear-gradient(180deg, #9A6030, ${BROWN_BTN} 60%, #5A2F10)`,
                border: `2px solid ${NAVY}`,
                borderRadius: 4,
                color: "#F5E8CC",
                fontFamily: SANS,
                fontWeight: 700,
                fontSize: 11,
                letterSpacing: 0.5,
                padding: "8px 14px",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}>← Home</button>
            </a>
          </div>
        </div>

        {/* Section nameplate */}
        <div style={{ textAlign: "center", padding: "6px 14px 4px", borderTop: `1px solid ${PAPER_DK}` }}>
          <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: 3, textTransform: "uppercase", color: INK, fontFamily: SERIF }}>
            Deals of the Week
          </div>
          <div style={{ fontSize: 11, fontStyle: "italic", color: INK_FADE, marginTop: 3, fontFamily: SERIF }}>
            Exclusive deals &amp; special offers from local service providers
          </div>
        </div>

        {/* Double rule */}
        <div style={{ margin: "6px 14px 0", borderTop: `1px solid ${INK}`, borderBottom: `3px double ${INK}`, height: 4 }} />

        {/* Search + filter */}
        <div style={{ padding: "10px 14px 14px", boxSizing: "border-box", width: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by provider, service, or keyword…"
            style={{
              width: "100%", padding: "9px 12px", fontSize: 13,
              fontFamily: SERIF, border: `2px solid ${GREEN}`,
              borderRadius: 3, background: PAPER, color: INK,
              outline: "none", boxSizing: "border-box",
            }}
          />
          <div style={{ display: "flex", gap: 8, alignItems: "center", width: "100%", boxSizing: "border-box" }}>
            <select
              value={village}
              onChange={e => setVillage(e.target.value)}
              style={{
                flex: 1, minWidth: 0, padding: "9px 10px", fontSize: 13,
                fontFamily: SERIF, border: `2px solid ${GREEN}`,
                borderRadius: 3, background: PAPER, color: INK,
                outline: "none", boxSizing: "border-box",
              }}
            >
              <option value="">All Villages</option>
              {ALL_VILLAGES.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
            {village && (
              <button
                onClick={() => setVillage("")}
                style={{
                  flexShrink: 0, background: "none",
                  border: `1px solid ${PAPER_DK}`, borderRadius: 3,
                  color: INK_FADE, fontSize: 11, padding: "8px 10px",
                  cursor: "pointer", fontFamily: SANS,
                }}>✕</button>
            )}
          </div>
        </div>
      </div>

      {/* ── Status bar ── */}
      <div style={{
        background: INK, color: PAPER,
        padding: "5px 14px", fontSize: 10,
        textAlign: "center", fontFamily: SANS,
        fontWeight: 700, letterSpacing: 1,
        textTransform: "uppercase",
        boxSizing: "border-box", width: "100%",
      }}>
        {loading ? "Loading…" : `${items.length} provider${items.length !== 1 ? "s" : ""} · ${ads.length} active deal${ads.length !== 1 ? "s" : ""}${village ? ` · ${village}` : ""}`}
      </div>

      {/* ════════ ADS GRID ════════ */}
      <div style={{ padding: "16px 12px 40px", maxWidth: 960, margin: "0 auto", boxSizing: "border-box" }}>

        {/* Section rule */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ borderTop: `3px double ${INK}` }} />
          <div style={{ textAlign: "center", padding: "5px 0", fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: INK_FADE, fontFamily: SANS }}>
            ✦ This Week's Deals — Local Service Providers ✦
          </div>
          <div style={{ borderBottom: `3px double ${INK}` }} />
        </div>

        {loading && (
          <div style={{ textAlign: "center", padding: 48, color: INK_FADE, fontSize: 14, fontStyle: "italic" }}>
            Loading deals…
          </div>
        )}

        {!loading && items.length === 0 && (
          <div style={{
            textAlign: "center", padding: "36px 20px",
            border: `2px dashed ${PAPER_DK}`, background: PAPER,
            color: INK_FADE, fontStyle: "italic", fontSize: 14,
            lineHeight: 1.7,
          }}>
            {search || village
              ? `No deals match your search. Try clearing the filter.`
              : `No deals posted yet. Check back soon!`}
          </div>
        )}

        {!loading && items.length > 0 && (
          <>
            <style>{`
              .vh-classified-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 14px;
              }
              @media (max-width: 700px) {
                .vh-classified-grid { grid-template-columns: repeat(2, 1fr); }
              }
              @media (max-width: 440px) {
                .vh-classified-grid { grid-template-columns: 1fr; }
              }
            `}</style>
            <div className="vh-classified-grid">
              {items.map(({ prov, ad }) =>
                ad ? (
                  <AdCard key={prov.id} ad={ad} />
                ) : (
                  <div key={prov.id} style={{
                    background: PAPER, border: `2px dashed ${PAPER_DK}`,
                    padding: "20px 14px", textAlign: "center",
                    fontFamily: SERIF, color: INK_FADE,
                  }}>
                    <div style={{ fontWeight: 700, fontSize: 13, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
                      {prov.business_name}
                    </div>
                    <div style={{ fontSize: 11, fontStyle: "italic" }}>No active deal — check back soon!</div>
                  </div>
                )
              )}
            </div>
          </>
        )}

        {/* ── Footer CTA ── */}
        {!loading && (
          <div style={{
            marginTop: 32, borderTop: `3px double ${INK}`,
            paddingTop: 16,
          }}>
            <div style={{
              background: PAPER, border: `2px solid ${INK}`,
              padding: "16px 18px", textAlign: "center",
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: INK, fontFamily: SANS, marginBottom: 6 }}>
                Advertise Here
              </div>
              <div style={{ fontSize: 12, color: INK_FADE, fontFamily: SERIF, lineHeight: 1.7, marginBottom: 12 }}>
                Are you a V-Hub provider? Add a classified ad for just{" "}
                <strong style={{ color: INK }}>$10/month</strong> and reach
                thousands of Villages residents.
              </div>
              <a href="/ProviderDashboard" style={{ textDecoration: "none" }}>
                <button style={{
                  background: `linear-gradient(180deg, #9A6030, ${BROWN_BTN} 60%, #5A2F10)`,
                  border: `2px solid ${NAVY}`, borderRadius: 3,
                  color: "#F5E8CC", fontFamily: SANS, fontWeight: 700,
                  fontSize: 12, letterSpacing: 0.5, padding: "9px 22px",
                  cursor: "pointer",
                }}>
                  Sign In to Provider Hub →
                </button>
              </a>
            </div>
          </div>
        )}
      </div>

      {/* ── NEWSPAPER BOTTOM EDGE ── */}
      <div style={{ background: PAPER_MID, borderTop: `3px double ${INK}`, marginTop: 0 }}>
        <div style={{ height: 2, background: INK }} />
        <div style={{ padding: "16px 20px 10px", textAlign: "center" }}>
          <div style={{ fontSize: 10, color: INK_FADE, fontStyle: "italic", fontFamily: SERIF, letterSpacing: 1 }}>
            {"© "}{new Date().getFullYear()}{" V-Hub · The Villages, Florida · All Rights Reserved"}
          </div>
          <div style={{ fontSize: 9, color: INK_FADE, marginTop: 3, fontFamily: SERIF }}>
            V-Hub is not affiliated with The Villages® or its affiliates.
          </div>
        </div>
        <div style={{ height: 1, background: INK, margin: "0 20px" }} />
        <div style={{ position: "relative", height: 28 }}>
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 28, background: "#b8a070", boxShadow: "0 -2px 6px rgba(0,0,0,0.3)" }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 22, background: "#c9b484" }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 17, background: "#d8c496" }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 12, background: "#e6d4a8" }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 8, background: PAPER }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: "linear-gradient(0deg, #1a0a00 0%, #3d2200 100%)" }} />
        </div>
      </div>
    </div>
  );
}