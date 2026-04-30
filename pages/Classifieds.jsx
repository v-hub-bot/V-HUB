// DEALS-CAROUSEL-APR30
import { useState, useEffect, useCallback } from "react";

const ORANGE = "#E8431A";
const TEAL   = "#00BFA5";
const NAVY   = "#1B3D6F";
const PARCH  = "#f5f0e8";
const INK    = "#1a0a00";
const MUTED  = "#7a6652";
const WHITE  = "#ffffff";
const RED    = "#CC0000";
const GREEN  = "#1A6B3C";

const API_BASE = "https://api.base44.app/api/apps/69d062aca815ce8e697894b1/functions";

function isExpired(ad) {
  if (!ad.deal_expires_at) return false;
  return new Date(ad.deal_expires_at) < new Date();
}

function fmt(d) {
  if (!d) return "";
  try { return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); }
  catch { return ""; }
}

// ── Single Ad Card ────────────────────────────────────────────────────
function AdCard({ ad, index, total, onPrev, onNext }) {
  const expired = isExpired(ad);
  const [saved, setSaved] = useState(false);

  const goToProvider = () => {
    fetch(`${API_BASE}/trackEvent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        provider_id: ad._provider_entity_id || ad.provider_id,
        event_type: "classified_ad_click",
        source: "classifieds",
      }),
    }).catch(() => {});
    if (ad._provider_entity_id) {
      window.location.href = `/?provider=${ad._provider_entity_id}`;
    }
  };

  const handleSave = (e) => {
    e.stopPropagation();
    if (ad.image_url) {
      const a = document.createElement("a");
      a.href = ad.image_url;
      a.target = "_blank";
      a.rel = "noopener";
      a.click();
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ position: "relative" }}>

      {/* ── Carousel counter ── */}
      {total > 1 && (
        <div style={{
          textAlign: "center", marginBottom: 10,
          fontSize: 13, color: MUTED, fontWeight: 600,
          fontFamily: "Georgia, serif",
        }}>
          Deal {index + 1} of {total}
        </div>
      )}

      {/* ── Card ── */}
      <div style={{
        background: WHITE,
        borderRadius: 14,
        overflow: "hidden",
        boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
        opacity: expired ? 0.5 : 1,
        position: "relative",
        border: expired ? `2px solid ${MUTED}` : `2px solid ${NAVY}`,
      }}>
        {/* Expired badge */}
        {expired && (
          <div style={{
            position: "absolute", top: 12, left: 12, zIndex: 10,
            background: "rgba(0,0,0,0.7)", color: WHITE,
            fontSize: 11, fontWeight: 700, padding: "4px 10px",
            borderRadius: 20, textTransform: "uppercase", letterSpacing: 1,
          }}>Expired</div>
        )}

        {/* Save button */}
        {!expired && (
          <button onClick={handleSave} style={{
            position: "absolute", top: 12, right: 12, zIndex: 10,
            background: saved ? GREEN : "rgba(0,0,0,0.55)",
            border: "none", borderRadius: 20,
            color: WHITE, fontSize: 11, fontWeight: 700,
            padding: "5px 12px", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 4,
            backdropFilter: "blur(4px)",
          }}>
            {saved ? "✓ Saved!" : "⬇ Save"}
          </button>
        )}

        {/* Hero image */}
        {ad.image_url ? (
          <img
            src={ad.image_url}
            alt={ad.headline || ad.provider_name}
            style={{ width: "100%", display: "block", maxHeight: 480, objectFit: "cover" }}
            onError={e => { e.target.style.display = "none"; }}
          />
        ) : (
          <div style={{
            background: `linear-gradient(135deg, ${NAVY}, ${TEAL})`,
            height: 220, display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ color: WHITE, fontSize: 48 }}>🏷️</span>
          </div>
        )}

        {/* Bottom strip */}
        <div style={{
          padding: "14px 16px 16px",
          background: WHITE,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <div style={{ fontSize: 15, fontWeight: 900, color: NAVY }}>
              {ad.provider_name}
            </div>
            {ad.headline && (
              <div style={{ fontSize: 13, color: INK, fontStyle: "italic" }}>
                {ad.headline}
              </div>
            )}
            {ad.deal_expires_at && !expired && (
              <div style={{ fontSize: 11, color: RED, fontWeight: 600 }}>
                Offer expires {fmt(ad.deal_expires_at)}
              </div>
            )}
          </div>

          {!expired && ad._provider_entity_id && (
            <button onClick={goToProvider} style={{
              background: `linear-gradient(135deg, ${ORANGE}, #c93510)`,
              color: WHITE, border: "none", borderRadius: 8,
              fontWeight: 800, fontSize: 13, padding: "10px 18px",
              cursor: "pointer", whiteSpace: "nowrap",
              boxShadow: "0 2px 8px rgba(232,67,26,0.4)",
            }}>
              Contact Provider →
            </button>
          )}
        </div>
      </div>

      {/* ── Left / Right nav arrows ── */}
      {total > 1 && (
        <div style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 16,
          marginTop: 18,
        }}>
          <button
            onClick={onPrev}
            disabled={index === 0}
            style={{
              width: 48, height: 48, borderRadius: "50%",
              background: index === 0 ? "#ddd" : NAVY,
              color: index === 0 ? "#aaa" : WHITE,
              border: "none", fontSize: 22, fontWeight: 900,
              cursor: index === 0 ? "default" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: index === 0 ? "none" : "0 2px 8px rgba(27,61,111,0.4)",
              transition: "all 0.15s",
            }}
            title="Previous deal"
          >‹</button>

          {/* Dot indicators */}
          <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
            {Array.from({ length: total }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: i === index ? 10 : 7,
                  height: i === index ? 10 : 7,
                  borderRadius: "50%",
                  background: i === index ? ORANGE : "#ccc",
                  transition: "all 0.15s",
                  cursor: "pointer",
                }}
                onClick={() => {
                  if (i < index) { for (let j = 0; j < index - i; j++) onPrev(); }
                  else { for (let j = 0; j < i - index; j++) onNext(); }
                }}
              />
            ))}
          </div>

          <button
            onClick={onNext}
            disabled={index === total - 1}
            style={{
              width: 48, height: 48, borderRadius: "50%",
              background: index === total - 1 ? "#ddd" : NAVY,
              color: index === total - 1 ? "#aaa" : WHITE,
              border: "none", fontSize: 22, fontWeight: 900,
              cursor: index === total - 1 ? "default" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: index === total - 1 ? "none" : "0 2px 8px rgba(27,61,111,0.4)",
              transition: "all 0.15s",
            }}
            title="Next deal"
          >›</button>
        </div>
      )}
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────
export default function Classifieds() {
  const [ads, setAds]               = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [filterArea, setFilterArea] = useState("");
  const [filterService, setFilterService] = useState("");
  const [currentIndex, setCurrentIndex]   = useState(0);

  // Deep-link: ?village= or ?service=
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const v = params.get("village");
    const s = params.get("service");
    if (v) setFilterArea(v);
    if (s) setFilterService(s.toLowerCase());
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/getDeals`);
        const data = res.ok ? await res.json() : { ads: [] };
        setAds(data.ads || []);
      } catch {
        setError("Could not load deals right now. Please try again shortly.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Reset to first card whenever filter changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [filterArea, filterService]);

  // Filter logic
  const visibleAds = ads.filter(ad => {
    if (isExpired(ad)) return false;

    if (filterArea) {
      const areaLower = filterArea.toLowerCase();
      const serves = Array.isArray(ad._provider_areas)
        ? ad._provider_areas.some(a => a.toLowerCase().includes(areaLower))
        : true;
      if (!serves) return false;
    }

    if (filterService) {
      const kw = filterService.toLowerCase();
      const haystack = [
        ad.provider_name || "",
        ad.headline || "",
        ad.body || "",
        ...(ad._provider_services || []),
        ad._provider_category || "",
      ].join(" ").toLowerCase();
      if (!haystack.includes(kw)) return false;
    }

    return true;
  });

  const hasFilter = !!(filterArea || filterService);
  const currentAd = visibleAds[currentIndex] || null;

  const handlePrev = useCallback(() => {
    setCurrentIndex(i => Math.max(0, i - 1));
  }, []);

  const handleNext = useCallback(() => {
    setCurrentIndex(i => Math.min(visibleAds.length - 1, i + 1));
  }, [visibleAds.length]);

  // Keyboard arrow support
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handlePrev, handleNext]);

  return (
    <div style={{ background: PARCH, minHeight: "100vh", fontFamily: "'Times New Roman', Georgia, serif" }}>

      {/* ── Header ── */}
      <div style={{
        background: NAVY, color: WHITE,
        padding: "14px 16px 12px",
        borderBottom: `4px solid ${ORANGE}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <a href="/" style={{ textDecoration: "none" }}>
            <button style={{
              background: "linear-gradient(180deg,#9A6030,#7A4820 60%,#5A3010)",
              border: "2px solid #1B3D6F", borderRadius: 6,
              color: "#F5E8CC", fontFamily: "Georgia, serif",
              fontWeight: 700, fontSize: 13, padding: "7px 14px", cursor: "pointer",
            }}>« Home</button>
          </a>
          <img
            src="https://media.base44.com/images/public/69d062aca815ce8e697894b1/a9af95bc3_V-Hublogo.png"
            alt="V-Hub"
            style={{ height: 36 }}
          />
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: 1 }}>🔥 Deals of the Week</div>
          <div style={{ fontSize: 12, opacity: 0.75, marginTop: 3 }}>
            Exclusive offers from local providers in The Villages, FL
          </div>
        </div>
      </div>

      {/* ── Filter bar ── */}
      <div style={{
        background: WHITE,
        borderBottom: `2px solid ${NAVY}22`,
        padding: "12px 16px",
        display: "flex", gap: 10, flexWrap: "wrap",
      }}>
        <input
          placeholder="🔍 Service (e.g. lawn, pool, cleaning...)"
          value={filterService}
          onChange={e => setFilterService(e.target.value.toLowerCase())}
          style={{
            flex: 2, minWidth: 140,
            padding: "9px 12px", borderRadius: 8,
            border: `2px solid ${NAVY}44`, fontSize: 13,
            fontFamily: "Georgia, serif", outline: "none",
            background: filterService ? "#fffbf0" : WHITE,
          }}
        />
        <input
          placeholder="📍 Village (e.g. Pennecamp)"
          value={filterArea}
          onChange={e => setFilterArea(e.target.value)}
          style={{
            flex: 1, minWidth: 130,
            padding: "9px 12px", borderRadius: 8,
            border: `2px solid ${NAVY}44`, fontSize: 13,
            fontFamily: "Georgia, serif", outline: "none",
            background: filterArea ? "#fffbf0" : WHITE,
          }}
        />
        {hasFilter && (
          <button onClick={() => { setFilterArea(""); setFilterService(""); }} style={{
            background: MUTED, color: WHITE, border: "none", borderRadius: 8,
            fontSize: 12, fontWeight: 700, padding: "9px 14px", cursor: "pointer",
          }}>✕ Clear</button>
        )}
      </div>

      {/* ── Content ── */}
      <div style={{ maxWidth: 520, margin: "0 auto", padding: "20px 16px 60px" }}>

        {loading && (
          <div style={{ textAlign: "center", padding: 60, color: MUTED, fontSize: 16 }}>
            Loading deals…
          </div>
        )}

        {error && (
          <div style={{ background: "#fff3f3", border: `1px solid ${RED}`, borderRadius: 8, padding: 20, textAlign: "center", color: RED }}>
            {error}
          </div>
        )}

        {/* Prompt to search */}
        {!loading && !error && !hasFilter && (
          <div style={{ textAlign: "center", padding: 60, color: MUTED }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>🔍</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: NAVY, marginBottom: 8 }}>
              Find Deals Near You
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.7 }}>
              Enter a service type <strong>(e.g. lawn, pool)</strong><br />
              or your village name above to see active deals.
            </div>
            {ads.length > 0 && (
              <div style={{ marginTop: 18, fontSize: 12, color: MUTED }}>
                {ads.filter(a => !isExpired(a)).length} active deal{ads.filter(a => !isExpired(a)).length !== 1 ? "s" : ""} available this week
              </div>
            )}
          </div>
        )}

        {/* No results */}
        {!loading && !error && hasFilter && visibleAds.length === 0 && (
          <div style={{ textAlign: "center", padding: 60, color: MUTED }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>🏖️</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: NAVY, marginBottom: 8 }}>
              No deals match your search
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.7 }}>
              {filterArea && filterService
                ? `No providers offering "${filterService}" in "${filterArea}" have active deals right now.`
                : filterArea
                  ? `No providers in "${filterArea}" have active deals right now.`
                  : `No providers offering "${filterService}" have active deals right now.`
              }
            </div>
            <button
              onClick={() => { setFilterArea(""); setFilterService(""); }}
              style={{
                marginTop: 20, background: NAVY, color: WHITE,
                border: "none", borderRadius: 8, padding: "10px 22px",
                fontSize: 13, fontWeight: 700, cursor: "pointer",
              }}
            >
              Clear Search
            </button>
          </div>
        )}

        {/* Single ad carousel */}
        {!loading && !error && hasFilter && visibleAds.length > 0 && currentAd && (
          <AdCard
            ad={currentAd}
            index={currentIndex}
            total={visibleAds.length}
            onPrev={handlePrev}
            onNext={handleNext}
          />
        )}
      </div>

      {/* ── Footer ── */}
      <div style={{
        background: INK, padding: "12px 20px",
        textAlign: "center", fontSize: 11,
        color: "rgba(245,232,204,0.5)",
      }}>
        © 2026 V-Hub · The Villages, Florida
      </div>
    </div>
  );
}
