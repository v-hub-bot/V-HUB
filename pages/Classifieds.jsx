import { useState, useEffect, useRef } from "react";
import { ClassifiedAd } from "@/api/entities";

// ── Brand constants ──────────────────────────────────────────────────────────
const PAPER      = "#F5EDD6";
const PAPER_MID  = "#EDE0C0";
const PAPER_DK   = "#C8B89A";
const INK        = "#1A1209";
const INK_FADE   = "#6B5B3E";
const BROWN_BTN  = "#7A4520";
const YELLOW     = "#FFDB00";
const GREEN      = "#2E7D32";
const GREEN_LT   = "#4CAF50";
const NAVY       = "#1B3D6F";

function Rule({ thick } = {}) {
  return (
    <div style={{
      borderTop: thick ? `3px double ${INK}` : `1px solid ${INK}`,
      margin: "0",
    }} />
  );
}

function AdCard({ ad }) {
  return (
    <div style={{
      background: PAPER,
      border: `2px solid ${INK}`,
      borderRadius: 2,
      padding: "14px 14px 12px",
      fontFamily: "'Times New Roman', serif",
      display: "flex",
      flexDirection: "column",
      gap: 6,
      boxSizing: "border-box",
      width: "100%",
      minHeight: 220,
      position: "relative",
      breakInside: "avoid",
    }}>
      {/* Decorative corner rule */}
      <div style={{ position: "absolute", top: 4, left: 4, right: 4, borderTop: `1px solid ${INK}` }} />
      <div style={{ position: "absolute", bottom: 4, left: 4, right: 4, borderBottom: `1px solid ${INK}` }} />

      {/* Image */}
      {ad.image_url && (
        <img
          src={ad.image_url}
          alt={ad.headline}
          style={{ width: "100%", height: 110, objectFit: "cover", borderRadius: 1, border: `1px solid ${PAPER_DK}`, display: "block" }}
        />
      )}

      {/* Headline */}
      <div style={{
        fontSize: 13, fontWeight: 700, color: INK, textAlign: "center",
        textTransform: "uppercase", letterSpacing: 1, lineHeight: 1.3,
        borderBottom: `1px solid ${PAPER_DK}`, paddingBottom: 5,
      }}>
        {ad.headline}
      </div>

      {/* Body */}
      <div style={{ fontSize: 12, color: INK, lineHeight: 1.55, flex: 1 }}>
        {ad.body}
      </div>

      {/* Footer — provider name + village */}
      <div style={{
        fontSize: 10, color: INK_FADE, textAlign: "center",
        borderTop: `1px solid ${PAPER_DK}`, paddingTop: 5,
        fontStyle: "italic", letterSpacing: 0.5,
      }}>
        {ad.provider_name}{ad.village ? ` · ${ad.village}` : ""}
      </div>
    </div>
  );
}

export default function Classifieds() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    ClassifiedAd.filter({ is_active: true })
      .then(data => {
        const sorted = [...data].sort((a, b) =>
          (a.provider_name || "").localeCompare(b.provider_name || "")
        );
        setAds(sorted);
      })
      .catch(() => setAds([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = ads.filter(ad => {
    const q = search.toLowerCase();
    if (!q) return true;
    return (
      (ad.provider_name || "").toLowerCase().includes(q) ||
      (ad.village || "").toLowerCase().includes(q) ||
      (ad.headline || "").toLowerCase().includes(q) ||
      (ad.body || "").toLowerCase().includes(q)
    );
  });

  return (
    <div style={{
      minHeight: "100vh",
      background: PAPER_MID,
      fontFamily: "'Times New Roman', serif",
    }}>
      {/* ── MASTHEAD ────────────────────────────────────────────── */}
      <div style={{ background: PAPER, borderBottom: `3px double ${INK}`, padding: "14px 16px 10px" }}>
        <div style={{ textAlign: "center", marginBottom: 6 }}>
          <a href="/" style={{ textDecoration: "none" }}>
            <img
              src="https://media.base44.com/images/public/69d062aca815ce8e697894b1/a9af95bc3_V-Hublogo.png"
              alt="V-Hub"
              style={{ height: 52, marginBottom: 2 }}
            />
          </a>
        </div>
        <Rule thick />
        <div style={{ textAlign: "center", padding: "8px 0 4px" }}>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: INK }}>
            THE VILLAGES CLASSIFIEDS
          </div>
          <div style={{ fontSize: 12, fontStyle: "italic", color: INK_FADE, marginTop: 2 }}>
            Exclusive deals & offers from local service providers — updated weekly
          </div>
        </div>
        <Rule />

        {/* Back + search row */}
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 10 }}>
          <a href="/" style={{ textDecoration: "none", flexShrink: 0 }}>
            <button style={{
              background: `linear-gradient(180deg,#9A6030,${BROWN_BTN} 60%,#5A3010)`,
              border: `2px solid ${NAVY}`, borderRadius: 4, color: "#F5E8CC",
              fontFamily: "'Times New Roman', serif", fontWeight: 700, fontSize: 11,
              letterSpacing: 1, padding: "8px 14px", cursor: "pointer",
            }}>← Home</button>
          </a>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search provider, village, or deal…"
            style={{
              flex: 1, padding: "9px 12px", fontSize: 13,
              fontFamily: "'Times New Roman', serif",
              border: `2px solid ${GREEN}`,
              boxShadow: `0 0 0 1px ${GREEN}`,
              borderRadius: 4, background: PAPER, color: INK,
              outline: "none", boxSizing: "border-box",
            }}
          />
        </div>
      </div>

      {/* ── STATS BAR ───────────────────────────────────────────── */}
      <div style={{
        background: INK, color: PAPER, padding: "5px 16px",
        fontSize: 11, letterSpacing: 1, textAlign: "center",
        fontFamily: "'Times New Roman', serif",
      }}>
        {loading ? "Loading classifieds…" : `${filtered.length} ${filtered.length === 1 ? "classified ad" : "classified ads"} — listed A–Z by provider name`}
      </div>

      {/* ── AD GRID ─────────────────────────────────────────────── */}
      <div style={{ padding: "16px 12px", maxWidth: 900, margin: "0 auto" }}>
        {loading && (
          <div style={{ textAlign: "center", padding: 40, color: INK_FADE, fontSize: 14 }}>
            Loading classifieds…
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div style={{
            textAlign: "center", padding: "40px 20px", color: INK_FADE,
            fontStyle: "italic", fontSize: 15, border: `1px dashed ${PAPER_DK}`,
            borderRadius: 4, background: PAPER, margin: "20px 0",
          }}>
            {search
              ? `No classifieds found matching "${search}"`
              : "No classified ads are currently running. Check back soon!"}
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <>
            {/* Column layout — 3 on desktop, 2 on tablet, 1 on mobile */}
            <style>{`
              .ad-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 14px;
              }
              @media (max-width: 700px) {
                .ad-grid { grid-template-columns: repeat(2, 1fr); }
              }
              @media (max-width: 440px) {
                .ad-grid { grid-template-columns: 1fr; }
              }
            `}</style>
            <div className="ad-grid">
              {filtered.map(ad => <AdCard key={ad.id} ad={ad} />)}
            </div>
          </>
        )}

        {/* Footer notice */}
        <div style={{
          marginTop: 24, padding: "12px 16px",
          borderTop: `2px double ${INK}`, textAlign: "center",
          fontSize: 11, color: INK_FADE, fontStyle: "italic",
        }}>
          Are you a V-Hub provider? Add a classified ad from your{" "}
          <a href="/ProviderDashboard" style={{ color: BROWN_BTN, fontWeight: 700 }}>Provider Hub</a>{" "}
          for just $10/month.
        </div>
      </div>
    </div>
  );
}
