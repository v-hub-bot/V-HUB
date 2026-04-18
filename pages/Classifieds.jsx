import { useState, useEffect, useRef, useCallback } from "react";

// ── SEO Meta Tags ──────────────────────────────────────────────────────────
function useMeta({ title, description, canonical }) {
  useEffect(() => {
    document.title = title || "Deals of the Week | V-Hub — The Villages, FL";
    const setMeta = (name, content, prop = false) => {
      const attr = prop ? "property" : "name";
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) { el = document.createElement("meta"); el.setAttribute(attr, name); document.head.appendChild(el); }
      el.setAttribute("content", content);
    };
    setMeta("description", description || "Browse weekly deals and special offers from local service providers in The Villages, FL. Exclusive discounts updated every week.");
    setMeta("robots", "index, follow");
    setMeta("og:type", "website", true);
    setMeta("og:site_name", "V-Hub", true);
    setMeta("og:url", canonical || "https://www.v-hub.us/Classifieds", true);
    setMeta("og:title", title || "Deals of the Week | V-Hub", true);
    setMeta("og:description", description || "Browse weekly deals from local service providers in The Villages, FL.", true);
    setMeta("og:image", "https://media.base44.com/images/public/69d062aca815ce8e697894b1/a9af95bc3_V-Hublogo.png", true);
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", title || "Deals of the Week | V-Hub");
    setMeta("twitter:description", description || "Browse weekly deals from local service providers in The Villages, FL.");
    setMeta("twitter:image", "https://media.base44.com/images/public/69d062aca815ce8e697894b1/a9af95bc3_V-Hublogo.png");
    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]');
      if (!link) { link = document.createElement("link"); link.rel = "canonical"; document.head.appendChild(link); }
      link.href = canonical;
    }
  }, [title]);
}

const PAPER     = "#F0E6C8";
const PAPER_MID = "#E4D5A8";
const PAPER_DK  = "#C8B07A";
const INK       = "#1C0F00";
const INK_FADE  = "#5C3A10";
const BROWN_BTN = "#7A4820";
const NAVY      = "#1B3D6F";
const GREEN     = "#1A6B3C";
const TEAL      = "#00836B";
const YELLOW    = "#FFDB00";
const SERIF     = "'Times New Roman', Georgia, serif";
const SANS      = "'Arial', Helvetica, sans-serif";

const ALL_VILLAGES = [
  "Alhambra","Amelia","Ashland","Belle Aire","Belvedere","Bonita","Bonnybrook",
  "Bradford","Briar Meadow","Bridgeport at Creekside Landing","Bridgeport at Lake Miona",
  "Bridgeport at Lake Sumter","Bridgeport at Laurel Valley","Bridgeport at Miona Shores",
  "Bridgeport at Mission Hills","Brownwood","Buttonwood","Calumet Grove","Caroline",
  "Cason Hammock","Charlotte","Chatham","Chitty Chatty","Citrus Grove","Collier",
  "Collier at Alden Bungalows","Collier at Antrim Dells","Country Club Hills","Dabney",
  "De Allende","De La Vista","Del Mar","DeLuna","DeSoto","Dunedin","Duval","Eastport",
  "El Cortez","Fenney","Fernandina","Gilchrist","Glenbrook","Hacienda",
  "Haciendas of Mission Hills","Hadley","Hammock at Fenney","Hawkins","Hemingway",
  "Hillsborough","La Reynalda","La Zamora","LaBelle","Lady Lake","Lake Deaton",
  "Lake Denham","Lakeshore Cottages","Largo","Liberty Park","Linden","Lynnhaven",
  "Mallory Square","Marsh Bend","McClure","Mira Mesa","Monarch Grove","Newell",
  "Orange Blossom Gardens","Osceola Hills","Osceola Hills at Soaring Eagle Preserve",
  "Palo Alto","Pennecamp","Piedmont","Pine Hills","Pine Ridge","Pinellas","Poinciana",
  "Polo Ridge","Richmond","Rio Grande","Rio Ponderosa","Rio Ranchero","Sabal Chase",
  "Sanibel","Santiago","Santo Domingo","Silver Lake","Spanish Springs","Springdale",
  "St. Catherine","St. Charles","St. James","St. Johns","Summerhill","Sunset Pointe",
  "Tall Trees","Tamarind Grove","Tierra Del Sol","Valle Verde","Virginia Trace",
  "Winifred","Woodbury"
];

function daysUntil(d) {
  if (!d) return null;
  const now = new Date(); now.setHours(0,0,0,0);
  const end = new Date(d); end.setHours(0,0,0,0);
  return Math.ceil((end - now) / 86400000);
}
function fmtDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function ExpiryBadge({ date }) {
  if (!date) return null;
  const days = daysUntil(date);
  const base = {
    fontFamily: SANS, fontWeight: 700, fontSize: 9, borderRadius: 2,
    padding: "2px 8px", letterSpacing: 0.5, textTransform: "uppercase",
    display: "inline-block", marginTop: 4,
  };
  if (days < 0)   return <span style={{ ...base, background: "#7B0000", color: "#fff" }}>Expired</span>;
  if (days === 0) return <span style={{ ...base, background: "#C62828", color: "#fff" }}>Ends Today!</span>;
  if (days <= 3)  return <span style={{ ...base, background: "#E65100", color: "#fff" }}>Ends in {days} day{days !== 1 ? "s" : ""}!</span>;
  if (days <= 7)  return <span style={{ ...base, background: "#F9A825", color: "#1C0F00" }}>Thru {fmtDate(date)}</span>;
  return <span style={{ ...base, background: GREEN, color: "#fff" }}>Good Thru {fmtDate(date)}</span>;
}

// Full-size ad card — same width as page content area
function AdCard({ ad }) {
  const days = daysUntil(ad.deal_expires_at);
  const expired = days !== null && days < 0;

  return (
    <div style={{
      background: PAPER,
      border: `2px solid ${INK}`,
      borderRadius: 2,
      display: "flex",
      flexDirection: "column",
      boxSizing: "border-box",
      opacity: expired ? 0.55 : 1,
      fontFamily: SERIF,
      overflow: "hidden",
      boxShadow: "3px 3px 10px rgba(0,0,0,0.22)",
      height: "100%",
    }}>
      {/* ── Header strip ── */}
      <div style={{ background: INK, padding: "10px 14px 9px", textAlign: "center" }}>
        <div style={{ fontSize: 9, color: PAPER_DK, fontFamily: SANS, letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>
          ✦ Deal of the Week ✦
        </div>
        <div style={{
          fontSize: 17, fontWeight: 900, color: YELLOW,
          textTransform: "uppercase", letterSpacing: 0.5,
          lineHeight: 1.25, fontFamily: SERIF,
        }}>
          {ad.headline}
        </div>
        <ExpiryBadge date={ad.deal_expires_at} />
      </div>

      {/* ── Image (optional) ── */}
      {ad.image_url && (
        <img
          src={ad.image_url}
          alt={ad.headline}
          style={{ width: "100%", height: 160, objectFit: "cover", display: "block", borderBottom: `1px solid ${PAPER_DK}` }}
        />
      )}

      {/* ── Deal body ── */}
      <div style={{ padding: "14px 16px 8px", fontSize: 14, color: INK, lineHeight: 1.8, flex: 1, fontFamily: SERIF }}>
        {ad.body}
      </div>

      {/* ── Address ── */}
      {ad.address && (
        <div style={{ padding: "4px 16px 10px", fontSize: 12, color: TEAL, fontWeight: 700, fontFamily: SANS }}>
          📍 {ad.address}
        </div>
      )}

      {/* ── Footer nameplate ── */}
      <div style={{
        borderTop: `1px solid ${PAPER_DK}`,
        background: PAPER_MID,
        padding: "9px 14px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 8,
        flexWrap: "wrap",
      }}>
        <div style={{ fontSize: 13, fontWeight: 900, color: NAVY, fontFamily: SANS, letterSpacing: 0.2 }}>
          {ad.provider_name}
        </div>
        {ad.village && (
          <div style={{
            fontSize: 11, color: INK_FADE, fontFamily: SERIF, fontStyle: "italic",
            background: PAPER_DK, borderRadius: 2, padding: "2px 8px",
          }}>
            📌 {ad.village}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Carousel component ──────────────────────────────────────────────────────
function DealsCarousel({ ads }) {
  const [idx, setIdx] = useState(0);
  const total = ads.length;

  const prev = () => setIdx(i => (i - 1 + total) % total);
  const next = () => setIdx(i => (i + 1) % total);

  // Touch/swipe support
  const touchStartX = useRef(null);
  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd   = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) { diff > 0 ? next() : prev(); }
    touchStartX.current = null;
  };

  if (total === 0) return null;

  const arrowBtn = (dir, onClick) => (
    <button
      onClick={onClick}
      aria-label={dir === "left" ? "Previous deal" : "Next deal"}
      style={{
        flexShrink: 0,
        width: 44,
        height: 44,
        borderRadius: "50%",
        border: `2px solid ${INK}`,
        background: PAPER_MID,
        color: INK,
        fontSize: 20,
        fontWeight: 900,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "1px 1px 4px rgba(0,0,0,0.2)",
        transition: "background 0.15s",
        userSelect: "none",
        WebkitUserSelect: "none",
      }}
      onMouseEnter={e => e.currentTarget.style.background = PAPER_DK}
      onMouseLeave={e => e.currentTarget.style.background = PAPER_MID}
    >
      {dir === "left" ? "‹" : "›"}
    </button>
  );

  return (
    <div style={{ padding: "0 0 8px" }}>
      {/* Counter */}
      <div style={{
        textAlign: "center", fontFamily: SANS, fontSize: 11,
        color: INK_FADE, letterSpacing: 1, marginBottom: 10,
        fontWeight: 700, textTransform: "uppercase",
      }}>
        Deal {idx + 1} of {total}
      </div>

      {/* Carousel row */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {arrowBtn("left", prev)}

        {/* Card wrapper — full width */}
        <div
          style={{ flex: 1, minWidth: 0 }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <AdCard ad={ads[idx]} />
        </div>

        {arrowBtn("right", next)}
      </div>

      {/* Dot indicators */}
      {total > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 14 }}>
          {ads.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              style={{
                width: i === idx ? 18 : 8,
                height: 8,
                borderRadius: 4,
                border: "none",
                background: i === idx ? INK : PAPER_DK,
                cursor: "pointer",
                padding: 0,
                transition: "all 0.2s",
              }}
              aria-label={`Go to deal ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* Swipe hint — shown only when >1 deal */}
      {total > 1 && (
        <div style={{
          textAlign: "center", marginTop: 10, fontFamily: SERIF,
          fontSize: 11, color: INK_FADE, fontStyle: "italic",
        }}>
          ← Swipe or use arrows to browse all {total} deals →
        </div>
      )}
    </div>
  );
}

export default function Classifieds() {
  useMeta({
    title: "Deals of the Week | V-Hub — The Villages, FL",
    description: "Browse weekly deals and special offers from local service providers in The Villages, FL. Exclusive discounts updated every week on V-Hub.",
    canonical: "https://www.v-hub.us/Classifieds",
  });

  const [ads, setAds]         = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [village, setVillage] = useState("");
  const [villageOpen, setVillageOpen] = useState(false);

  // Pre-populate village from URL param (e.g. ?village=Brownwood)
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get("village")) setVillage(p.get("village"));
  }, []);

  useEffect(() => {
    fetch("https://api.base44.app/api/apps/69d062aca815ce8e697894b1/functions/getDeals", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })
      .then(r => r.json())
      .then(data => {
        const sorted = [...(data.ads || [])].sort((a, b) =>
          (a.provider_name || "").localeCompare(b.provider_name || "")
        );
        setAds(sorted);
      })
      .catch(() => setAds([]))
      .finally(() => setLoading(false));
  }, []);

  // Filter logic
  const filtered = ads.filter(ad => {
    const q = search.toLowerCase().trim();
    const v = village.toLowerCase().trim();
    if (v) {
      const adVillage = (ad.village || "").toLowerCase();
      const adAddress = (ad.address || "").toLowerCase();
      if (!adVillage.includes(v) && !adAddress.includes(v)) return false;
    }
    if (q) {
      const hay = [ad.provider_name, ad.headline, ad.body, ad.village, ad.address].join(" ").toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const live = filtered.filter(ad => {
    const days = daysUntil(ad.deal_expires_at);
    return days === null || days >= 0;
  });

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

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

      <link href="https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap" rel="stylesheet" />

      {/* ── Stacked newspaper edge ── */}
      <div style={{ position: "relative", height: 28 }}>
        {[{l:6,r:6,h:28,bg:"#b8a070"},{l:4,r:4,h:24,bg:"#c9b484"},{l:3,r:3,h:20,bg:"#d8c496"},{l:2,r:2,h:16,bg:"#e6d4a8"},{l:0,r:0,h:12,bg:"#F0E6C8"}].map((s,i)=>(
          <div key={i} style={{ position:"absolute",top:0,left:s.l,right:s.r,height:s.h,background:s.bg,borderRadius:"0 0 3px 3px",boxShadow:"0 3px 6px rgba(0,0,0,0.2)" }} />
        ))}
        <div style={{ position:"absolute",top:0,left:0,right:0,height:4,background:"linear-gradient(180deg,#1a0a00,#3d2200)" }} />
      </div>

      {/* ════════ MASTHEAD ════════ */}
      <div style={{ background: PAPER, borderBottom: `3px double ${INK}` }}>
        {/* Dateline */}
        <div style={{
          borderTop: `3px double ${INK}`, borderBottom: `3px double ${INK}`,
          padding: "5px 14px", display: "flex", justifyContent: "space-between",
          alignItems: "center", background: PAPER_MID,
        }}>
          <span style={{ fontSize: 10, color: INK_FADE, fontFamily: SERIF, fontStyle: "italic" }}>{today}</span>
          <span style={{ fontSize: 10, color: INK_FADE, fontFamily: SANS, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>The Villages, FL</span>
          <span style={{ fontSize: 10, color: INK_FADE, fontFamily: SERIF, fontStyle: "italic" }}>Deals of the Week</span>
        </div>

        {/* Logo row */}
        <div style={{ display: "flex", alignItems: "center", padding: "10px 14px 6px" }}>
          <a href="/" style={{ textDecoration: "none", flexShrink: 0, width: 56 }}>
            <img
              src="https://media.base44.com/images/public/69d062aca815ce8e697894b1/a9af95bc3_V-Hublogo.png"
              alt="V-Hub"
              style={{ width: 48, height: 48, objectFit: "contain" }}
            />
          </a>
          <a href="/" style={{ textDecoration: "none", flex: 1, display: "flex", alignItems: "baseline", justifyContent: "center" }}>
            <span style={{ fontStyle: "italic", fontWeight: 700, fontFamily: "'Great Vibes', cursive", fontSize: 48, color: "#003366", lineHeight: 1 }}>V</span>
            <span style={{ fontSize: 32, fontWeight: 900, color: INK, fontFamily: "'Times New Roman', serif", lineHeight: 1, margin: "0 2px" }}>-</span>
            <span style={{ fontSize: 40, fontWeight: 900, color: INK, fontFamily: "'Times New Roman', serif", letterSpacing: -1, lineHeight: 1 }}>Hub</span>
          </a>
          <div style={{ flexShrink: 0, width: 56, display: "flex", justifyContent: "flex-end" }}>
            <a href="/" style={{ textDecoration: "none" }}>
              <button style={{
                background: `linear-gradient(180deg,#9A6030,${BROWN_BTN} 60%,#5A2F10)`,
                border: `2px solid ${NAVY}`, borderRadius: 4,
                color: "#F5E8CC", fontFamily: SANS, fontWeight: 700,
                fontSize: 10, letterSpacing: 0.5, padding: "6px 10px", cursor: "pointer",
              }}>← Home</button>
            </a>
          </div>
        </div>

        {/* Section nameplate */}
        <div style={{ textAlign: "center", padding: "4px 14px 4px", borderTop: `1px solid ${PAPER_DK}` }}>
          <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: 3, textTransform: "uppercase", color: INK, fontFamily: SERIF }}>
            🏷️ Deals of the Week
          </div>
          <div style={{ fontSize: 11, fontStyle: "italic", color: INK_FADE, marginTop: 2, fontFamily: SERIF }}>
            Exclusive deals & discounts from local service providers in The Villages
          </div>
        </div>

        <div style={{ margin: "6px 14px 0", borderTop: `1px solid ${INK}`, borderBottom: `3px double ${INK}`, height: 4 }} />

        {/* ── Search & Village Filter ── */}
        <div style={{ padding: "12px 14px 14px", display: "flex", flexDirection: "column", gap: 10, boxSizing: "border-box" }}>
          {/* Keyword search */}
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by provider name, service, or keyword…"
            style={{
              width: "100%", padding: "10px 14px", fontSize: 13,
              fontFamily: SERIF, border: `3px solid ${GREEN}`,
              borderRadius: 3, background: PAPER, color: INK,
              outline: "none", boxSizing: "border-box",
              boxShadow: `0 0 0 1.5px ${GREEN}`,
            }}
          />

          {/* Village picker */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setVillageOpen(o => !o)}
              style={{
                width: "100%", padding: "10px 14px", fontSize: 13,
                fontFamily: SERIF, border: `3px solid ${GREEN}`,
                borderRadius: 3, background: PAPER, color: village ? INK : INK_FADE,
                outline: "none", boxSizing: "border-box", textAlign: "left",
                cursor: "pointer", display: "flex", justifyContent: "space-between",
                alignItems: "center", boxShadow: `0 0 0 1.5px ${GREEN}`,
              }}
            >
              <span>{village || "Filter by Village…"}</span>
              <span style={{ fontSize: 10, color: INK_FADE }}>{villageOpen ? "▲" : "▼"}</span>
            </button>
            {village && (
              <button
                onClick={() => { setVillage(""); setVillageOpen(false); }}
                style={{
                  position: "absolute", right: 36, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", color: INK_FADE,
                  fontSize: 14, cursor: "pointer", padding: "0 6px",
                }}
              >✕</button>
            )}
            {villageOpen && (
              <div style={{
                position: "absolute", top: "100%", left: 0, right: 0, zIndex: 999,
                background: PAPER, border: `2px solid ${GREEN}`,
                borderTop: "none", borderRadius: "0 0 4px 4px",
                maxHeight: 260, overflowY: "auto",
                boxShadow: "0 6px 20px rgba(0,0,0,0.22)",
              }}>
                <div
                  onClick={() => { setVillage(""); setVillageOpen(false); }}
                  style={{
                    padding: "9px 14px", fontSize: 13, color: INK_FADE,
                    fontFamily: SERIF, fontStyle: "italic", cursor: "pointer",
                    borderBottom: `1px solid ${PAPER_DK}`,
                  }}
                >— All Villages —</div>
                {ALL_VILLAGES.map(v => (
                  <div
                    key={v}
                    onClick={() => { setVillage(v); setVillageOpen(false); }}
                    style={{
                      padding: "8px 14px", fontSize: 13, color: INK,
                      fontFamily: SERIF, cursor: "pointer",
                      background: village === v ? PAPER_MID : "transparent",
                      fontWeight: village === v ? 700 : 400,
                      borderBottom: `1px solid rgba(200,176,122,0.3)`,
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = PAPER_MID}
                    onMouseLeave={e => e.currentTarget.style.background = village === v ? PAPER_MID : "transparent"}
                  >{v}</div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Status bar ── */}
      <div style={{
        background: INK, color: PAPER, padding: "5px 14px",
        fontSize: 10, textAlign: "center", fontFamily: SANS,
        fontWeight: 700, letterSpacing: 1, textTransform: "uppercase",
      }}>
        {loading
          ? "Loading deals…"
          : `${live.length} active deal${live.length !== 1 ? "s" : ""}${village ? ` · ${village}` : ""}${search ? ` · "${search}"` : ""}`
        }
      </div>

      {/* ════════ ADS GRID ════════ */}
      <div style={{ padding: "16px 14px 48px", boxSizing: "border-box" }}>

        {/* Section rule */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ borderTop: `3px double ${INK}` }} />
          <div style={{ textAlign: "center", padding: "6px 0", fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: INK_FADE, fontFamily: SANS }}>
            ✦ This Week's Deals from Local Service Providers ✦
          </div>
          <div style={{ borderBottom: `3px double ${INK}` }} />
        </div>

        {loading && (
          <div style={{ textAlign: "center", padding: 60, color: INK_FADE, fontSize: 14, fontStyle: "italic" }}>Loading deals…</div>
        )}

        {!loading && live.length === 0 && (
          <div style={{ padding: "28px 20px 40px", textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🏘️</div>
            <div style={{ fontSize: 16, fontWeight: 900, letterSpacing: 2, textTransform: "uppercase", color: INK, fontFamily: SERIF, marginBottom: 8 }}>
              {search || village ? "No Matching Deals Found" : "New Deals Coming Soon!"}
            </div>
            <div style={{ fontSize: 13, fontStyle: "italic", color: INK_FADE, fontFamily: SERIF, lineHeight: 1.8 }}>
              {search || village
                ? "Try a different village or search term."
                : "Local providers post their deals and specials here every week. Check back soon!"}
            </div>
            {(search || village) && (
              <button onClick={() => { setSearch(""); setVillage(""); }}
                style={{ marginTop: 16, padding: "8px 18px", fontFamily: SANS, fontSize: 12, fontWeight: 700, cursor: "pointer", background: PAPER_MID, border: `2px solid ${INK}`, borderRadius: 3, color: INK }}>
                Clear Filters
              </button>
            )}
          </div>
        )}

        {!loading && live.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {live.map(ad => <AdCard key={ad.id} ad={ad} />)}
          </div>
        )}

        {/* ── Divider ── */}
        <div style={{ margin: "32px 0 24px" }}>
          <div style={{ borderTop: `3px double ${INK}` }} />
        </div>

        {/* ── CTA box ── */}
        <div style={{ border: `2px solid ${INK}`, borderRadius: 2, padding: "20px 18px", background: PAPER_MID, textAlign: "center", boxShadow: "2px 2px 6px rgba(0,0,0,0.15)" }}>
          <div style={{ fontSize: 14, fontWeight: 900, letterSpacing: 2, textTransform: "uppercase", color: INK, fontFamily: SERIF, marginBottom: 8 }}>
            Are You a Local Provider?
          </div>
          <div style={{ fontSize: 12, fontStyle: "italic", color: INK_FADE, fontFamily: SERIF, lineHeight: 1.8, marginBottom: 14 }}>
            Reach thousands of Villages residents with your weekly deal or special offer.
            Log in to your Provider Hub to build and queue ads — pay just $10 when you're ready to go live.
          </div>
          <a href="/ProviderDashboard" style={{ textDecoration: "none" }}>
            <button style={{ background: `linear-gradient(180deg,#9A6030,${BROWN_BTN} 60%,#5A2F10)`, border: `3px solid ${NAVY}`, borderRadius: 4, color: "#F5E8CC", fontFamily: SANS, fontWeight: 700, fontSize: 13, letterSpacing: 1, textTransform: "uppercase", padding: "12px 24px", cursor: "pointer", boxShadow: `0 0 0 1.5px ${NAVY}` }}>
              Post Your Deal → Provider Hub
            </button>
          </a>
        </div>
      </div>
    </div>
  );
}
