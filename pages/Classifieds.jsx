// BUILD_FORCE_2026_04_22_T0400
// CACHE-BUST-1776573078
// build-1776559362
// build-1776539899-PROBE 
import { useState, useEffect, useRef, useCallback } from "react";
import { ClassifiedAd, Provider } from "@/api/entities";

// ────────────────────────────────────────────────────────────────
//  V-HUB  ·  Deals of the Week
//  Shows rotating "featured deal" ads from active providers.
//  Slot rotation is handled nightly by the rolloverClassifiedAds function.
// ────────────────────────────────────────────────────────────────

const ORANGE  = "#E8431A";
const TEAL    = "#00BFA5";
const NAVY    = "#1B3D6F";
const PARCH   = "#f5f0e8";
const INK     = "#1a0a00";
const MUTED   = "#7a6652";
const WHITE   = "#ffffff";
const GREEN   = "#1A6B3C";
const RED     = "#CC0000";

const API_BASE = "https://api.base44.app/api/apps/69d062aca815ce8e697894b1/functions";

// ── tiny helpers ──────────────────────────────────────────────────
function fmt(d) {
  if (!d) return "";
  try { return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); }
  catch { return ""; }
}

function isExpired(ad) {
  if (!ad.deal_expires_at) return false;
  return new Date(ad.deal_expires_at) < new Date();
}

// ── AdCard ────────────────────────────────────────────────────────
function AdCard({ ad }) {
  const expired = isExpired(ad);

  const handleAdClick = () => {
    if (ad.provider_id) {
      fetch("https://api.base44.app/api/apps/69d062aca815ce8e697894b1/functions/trackEvent", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider_id: ad.provider_id,
          event_type: "classified_ad_click",
          source: "classifieds",
        }),
      }).catch(() => {});
    }
  };

  return (
    <div onClick={handleAdClick} style={{
      background: WHITE,
      border: `2px solid ${NAVY}`,
      borderRadius: 10,
      overflow: "hidden",
      boxShadow: "0 3px 14px rgba(0,0,0,0.13)",
      display: "flex",
      flexDirection: "column",
      cursor: "pointer",
      minHeight: 340,
      opacity: expired ? 0.55 : 1,
      position: "relative",
    }}>
      {expired && (
        <div style={{
          position: "absolute", top: 10, right: 10,
          background: MUTED, color: WHITE,
          fontSize: 10, fontWeight: 700, padding: "3px 8px",
          borderRadius: 4, textTransform: "uppercase", letterSpacing: 1,
        }}>Expired</div>
      )}

      {/* image */}
      {ad.image_url && (
        <img
          src={ad.image_url}
          alt={ad.headline}
          style={{ width: "100%", height: 180, objectFit: "cover", display: "block" }}
          onError={e => { e.target.style.display = "none"; }}
        />
      )}

      {/* body */}
      <div style={{ padding: "14px 16px", flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
        {/* provider name */}
        <div style={{ fontSize: 11, fontWeight: 700, color: TEAL, textTransform: "uppercase", letterSpacing: 1 }}>
          {ad.provider_name}
        </div>

        {/* headline */}
        <div style={{ fontSize: 17, fontWeight: 900, color: NAVY, lineHeight: 1.25 }}>
          {ad.headline}
        </div>

        {/* body */}
        <div style={{ fontSize: 13, color: INK, lineHeight: 1.6, flex: 1 }}>
          {ad.body}
        </div>

        {/* location info + expiry */}
        <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
          {/* Mobile provider: show service areas */}
          {ad._provider_is_mobile && ad._provider_areas && ad._provider_areas.length > 0 && (
            <div style={{ fontSize: 11, color: TEAL, fontWeight: 600 }}>
              🗺️ Serves: {ad._provider_areas.join(" · ")}
            </div>
          )}
          {/* Brick & mortar: show address */}
          {!ad._provider_is_mobile && ad._provider_address && (
            <div style={{ fontSize: 11, color: MUTED }}>
              📍 {ad._provider_address}
            </div>
          )}
          {/* Both mobile AND has a location (hybrid) */}
          {ad._provider_is_mobile && ad._provider_address && (
            <div style={{ fontSize: 11, color: MUTED }}>
              📍 Also at: {ad._provider_address}
            </div>
          )}
          {/* Fallback: manual village field if no provider data enrichment */}
          {!ad._provider_is_mobile && !ad._provider_address && ad.village && (
            <div style={{ fontSize: 11, color: MUTED }}>
              📍 {ad.village}
            </div>
          )}
          {ad.deal_expires_at && !expired && (
            <div style={{ fontSize: 11, color: RED, fontWeight: 700 }}>
              Expires {fmt(ad.deal_expires_at)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────
export default function Classifieds() {
  const [ads, setAds]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/getDeals`);
        if (!res.ok) throw new Error("Failed to load deals");
        const data = await res.json();
        setAds(data.ads || []);
      } catch (e) {
        setError("Could not load Deals of the Week. Please try again later.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div style={{ background: PARCH, minHeight: "100vh", fontFamily: "'Times New Roman', Georgia, serif" }}>
      {/* Header */}
      <div style={{
        background: NAVY, color: WHITE, padding: "18px 20px 14px",
        textAlign: "center", borderBottom: `4px solid ${ORANGE}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-start", marginBottom: 8 }}>
          <a href="/" style={{ textDecoration: "none" }}>
            <button style={{ background: "linear-gradient(180deg,#9A6030,#7A4820 60%,#5A3010)", border: "2px solid #1B3D6F", borderRadius: 6, color: "#F5E8CC", fontFamily: "Georgia, serif", fontWeight: 700, fontSize: 13, padding: "8px 16px", cursor: "pointer", whiteSpace: "nowrap" }}>« Home</button>
          </a>
        </div>
        <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: 1 }}>🔥 Deals of the Week!</div>
        <div style={{ fontSize: 13, opacity: 0.8, marginTop: 4 }}>
          Exclusive offers from local providers in The Villages, FL
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "20px 16px 40px" }}>
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

        {!loading && !error && ads.length === 0 && (
          <div style={{ textAlign: "center", padding: 60, color: MUTED }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🏖️</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: NAVY, marginBottom: 8 }}>No Active Deals Right Now</div>
            <div style={{ fontSize: 14 }}>Check back soon — new deals are added weekly!</div>
          </div>
        )}

        {!loading && !error && ads.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {ads.map(ad => <AdCard key={ad.id} ad={ad} />)}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ background: INK, padding: "12px 20px", textAlign: "center", fontSize: 11, color: "rgba(245,232,204,0.5)" }}>
        © 2026 V-Hub · The Villages, Florida ·{" "}
        <a href="/Terms" style={{ color: "rgba(245,232,204,0.4)" }}>Terms</a>
      </div>
    </div>
  );
}
