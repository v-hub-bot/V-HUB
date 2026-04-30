// CACHE-BUST-DEALS-CLEAN-APR30
import { useState, useEffect } from "react";

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

// ── Clean Ad Card — image first, minimal text, big CTA ──────────────
function AdCard({ ad }) {
  const expired = isExpired(ad);
  const [saved, setSaved] = useState(false);

  const goToProvider = () => {
    // Track click
    fetch(`${API_BASE}/trackEvent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        provider_id: ad._provider_entity_id || ad.provider_id,
        event_type: "classified_ad_click",
        source: "classifieds",
      }),
    }).catch(() => {});
    // Navigate to provider profile
    if (ad._provider_entity_id) {
      window.location.href = `/?provider=${ad._provider_entity_id}`;
    }
  };

  const handleSave = (e) => {
    e.stopPropagation();
    // Save image by opening in new tab for long-press save on mobile
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

      {/* Save button — top right */}
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

      {/* Full ad image — the hero */}
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

      {/* Bottom strip — provider name + expiry + CTA */}
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
  );
}

// ── Main Page ────────────────────────────────────────────────────────
export default function Classifieds() {
  const [ads, setAds]         = useState([]);
  const [areas, setAreas]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [filterArea, setFilterArea] = useState("");
  const [filterService, setFilterService] = useState("");

  // Read ?village= or ?service= from URL for deep-link from homepage search
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("village")) setFilterArea(params.get("village"));
    if (params.get("service")) setFilterService(params.get("service").toLowerCase());
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const [dealsRes, areasRes] = await Promise.all([
          fetch(`${API_BASE}/getDeals`),
          fetch(`${API_BASE}/getProviders`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "list_areas" }),
          }),
        ]);
        const dealsData = dealsRes.ok ? await dealsRes.json() : { ads: [] };
        setAds(dealsData.ads || []);
        // Try to get area names for filter dropdown
        try {
          const areasData = areasRes.ok ? await areasRes.json() : { areas: [] };
          setAreas((areasData.areas || []).sort((a, b) => a.name?.localeCompare(b.name)));
        } catch {}
      } catch (e) {
        setError("Could not load deals right now. Please try again shortly.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Filter: by village (check if provider serves that area) + by service keyword
  const visibleAds = ads.filter(ad => {
    if (isExpired(ad)) return false;

    // Village filter — check provider's service_areas names
    if (filterArea) {
      const areaLower = filterArea.toLowerCase();
      const serves = Array.isArray(ad._provider_areas)
        ? ad._provider_areas.some(a => a.toLowerCase().includes(areaLower))
        : true; // no area data = show everywhere
      if (!serves) return false;
    }

    // Service/keyword filter — match against headline, provider name, body
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

  return (
    <div style={{ background: PARCH, minHeight: "100vh", fontFamily: "'Times New Roman', Georgia, serif" }}>

      {/* Header */}
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

      {/* Filter bar */}
      <div style={{
        background: WHITE,
        borderBottom: `2px solid ${NAVY}22`,
        padding: "12px 16px",
        display: "flex", gap: 10, flexWrap: "wrap",
      }}>
        <input
          placeholder="🔍 Search by service (e.g. lawn, pool...)"
          value={filterService}
          onChange={e => setFilterService(e.target.value.toLowerCase())}
          style={{
            flex: 2, minWidth: 140,
            padding: "9px 12px", borderRadius: 8,
            border: `2px solid ${NAVY}44`, fontSize: 13,
            fontFamily: "Georgia, serif", outline: "none",
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
          }}
        />
        {(filterArea || filterService) && (
          <button onClick={() => { setFilterArea(""); setFilterService(""); }} style={{
            background: MUTED, color: WHITE, border: "none", borderRadius: 8,
            fontSize: 12, fontWeight: 700, padding: "9px 14px", cursor: "pointer",
          }}>Clear</button>
        )}
      </div>

      {/* Content */}
      <div style={{ maxWidth: 520, margin: "0 auto", padding: "20px 16px 50px" }}>

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

        {!loading && !error && visibleAds.length === 0 && (
          <div style={{ textAlign: "center", padding: 60, color: MUTED }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🏖️</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: NAVY, marginBottom: 8 }}>
              {filterArea || filterService ? "No deals match your search" : "No Active Deals Right Now"}
            </div>
            <div style={{ fontSize: 14 }}>
              {filterArea || filterService
                ? "Try a different village or service keyword."
                : "Check back soon — new deals are added weekly!"}
            </div>
          </div>
        )}

        {!loading && !error && visibleAds.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            {visibleAds.map(ad => <AdCard key={ad.id} ad={ad} />)}
          </div>
        )}
      </div>

      {/* Footer */}
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
