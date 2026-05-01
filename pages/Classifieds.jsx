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

// ── Single Ad Card (used inside carousel) ───────────────────────────
function AdCard({ ad, active, onClick }) {
  const expired = isExpired(ad);
  const [saved, setSaved] = useState(false);
  const [showContact, setShowContact] = useState(false);

  const goToProvider = (e) => {
    e.stopPropagation();
    fetch(`${API_BASE}/trackEvent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        provider_id: ad._provider_entity_id || ad.provider_id,
        event_type: "classified_ad_click",
        source: "classifieds",
      }),
    }).catch(() => {});
    setShowContact(true);
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    const shareUrl = ad._provider_entity_id
      ? `${window.location.origin}/Home?provider=${ad._provider_entity_id}`
      : window.location.href;
    const shareData = {
      title: ad.provider_name,
      text: ad.headline ? `${ad.provider_name} — ${ad.headline}` : ad.provider_name,
      url: shareUrl,
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch (_) {}
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } catch (_) { window.open(shareUrl, "_blank"); }
    }
  };

  return (
    <div
      onClick={!active ? onClick : undefined}
      style={{
        transition: "transform 0.35s cubic-bezier(.4,0,.2,1)",
        transform: "scale(1)",
        opacity: 1,
        cursor: active ? "default" : "pointer",
        flexShrink: 0,
        width: "100%",
        userSelect: "none",
      }}
    >
      {/* Image section */}
      <div style={{
        borderRadius: "16px 16px 0 0",
        overflow: "hidden",
        boxShadow: expired ? `0 0 0 2px #7a6652` : active ? "0 0 0 2px #FFDB00, 0 -2px 0 0 #FFDB00" : "0 0 0 2px rgba(255,219,0,0.3)",
        opacity: expired ? 0.5 : 1,
        position: "relative",
      }}>
        {!expired && <div style={{ height: 5, background: "linear-gradient(90deg,#E8431A,#FFDB00,#00BFA5)" }} />}
        {expired && (
          <div style={{ position:"absolute",top:12,left:12,zIndex:10,background:"rgba(0,0,0,0.7)",color:"#fff",fontSize:11,fontWeight:700,padding:"4px 10px",borderRadius:20,textTransform:"uppercase",letterSpacing:1 }}>Expired</div>
        )}
        {active && !expired && (
          <button onClick={handleShare} style={{
            position:"absolute",top:12,right:12,zIndex:10,
            background: saved ? "#1A6B3C" : "rgba(0,0,0,0.55)",
            border:"none",borderRadius:20,color:"#fff",fontSize:11,fontWeight:700,
            padding:"5px 12px",cursor:"pointer",display:"flex",alignItems:"center",gap:4,
            backdropFilter:"blur(4px)",
          }}>
            {saved ? "✓ Link Copied!" : "↗ Share"}
          </button>
        )}
        {ad.image_url ? (
          <img
            src={ad.image_url}
            alt={ad.headline || ad.provider_name}
            style={{ width:"100%", height:"auto", display:"block" }}
            onError={e => { e.target.style.display = "none"; }}
          />
        ) : (
          <div style={{ width:"100%",paddingTop:"100%",position:"relative",background:`linear-gradient(135deg,#1B3D6F,#00BFA5)` }}>
            <span style={{ position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",color:"#fff",fontSize:48 }}>🏷️</span>
          </div>
        )}
      </div>

      {/* Yellow divider */}
      <div style={{ height:3, background: expired ? "#7a6652" : "#FFDB00" }} />

      {/* Banner */}
      <div style={{
        borderRadius:"0 0 16px 16px",
        overflow:"hidden",
        boxShadow: expired ? `0 0 0 2px #7a6652` : active ? "0 2px 0 2px #FFDB00, 0 8px 32px rgba(232,67,26,0.25)" : "none",
        opacity: expired ? 0.5 : 1,
        padding: active ? "14px 16px 18px" : "10px 12px 14px",
        background:"#ffffff",
        display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,
      }}>
        <div style={{ display:"flex",flexDirection:"column",gap:2, minWidth:0, flex:1 }}>
          <div style={{
            fontSize: 13, fontWeight:900, color:"#1B3D6F",
            whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"
          }}>{ad.provider_name}</div>
          {ad.headline && active && (
            <div style={{
              fontSize:11, color:"#1a0a00", fontStyle:"italic",
              whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"
            }}>{ad.headline}</div>
          )}
          {ad.deal_expires_at && !expired && active && (
            <div style={{ fontSize:10, color:"#CC0000", fontWeight:600, whiteSpace:"nowrap" }}>
              Expires {fmt(ad.deal_expires_at)}
            </div>
          )}
        </div>
        {active && !expired && ad._provider_entity_id && (
          <button onClick={goToProvider} style={{
            background:"linear-gradient(135deg,#E8431A,#c93510)",
            color:"#fff",border:"none",borderRadius:8,
            fontWeight:800,fontSize:12,padding:"8px 14px",
            cursor:"pointer",whiteSpace:"nowrap",
            boxShadow:"0 2px 8px rgba(232,67,26,0.4)",
            flexShrink:0,
          }}>
            Contact →
          </button>
        )}
      </div>

      {/* ── Contact Modal / Bottom Sheet ── */}
      {showContact && (
        <div
          onClick={() => setShowContact(false)}
          style={{
            position:"fixed",inset:0,zIndex:1000,
            background:"rgba(0,0,0,0.6)",
            display:"flex",alignItems:"flex-end",justifyContent:"center",
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width:"100%",maxWidth:480,
              background:"#fff",borderRadius:"20px 20px 0 0",
              padding:"24px 20px 36px",
              boxShadow:"0 -4px 32px rgba(0,0,0,0.25)",
              animation:"slideUp 0.25s ease",
            }}
          >
            <style>{`@keyframes slideUp { from { transform: translateY(100%); opacity:0; } to { transform: translateY(0); opacity:1; } }`}</style>

            {/* Handle */}
            <div style={{ width:40,height:4,borderRadius:2,background:"#ddd",margin:"0 auto 20px" }} />

            {/* Business name */}
            <div style={{ fontSize:20,fontWeight:900,color:"#1B3D6F",marginBottom:4 }}>
              {ad.provider_name}
            </div>

            {/* Category / headline */}
            {ad._provider_category && (
              <div style={{ fontSize:13,color:"#7a6652",marginBottom:12 }}>{ad._provider_category}</div>
            )}
            {ad.headline && (
              <div style={{
                background:"#fffbe6",border:"1px solid #FFDB00",
                borderRadius:8,padding:"10px 14px",marginBottom:16,
                fontSize:14,color:"#1a0a00",fontStyle:"italic",lineHeight:1.5,
              }}>
                🏷️ {ad.headline}
              </div>
            )}
            {ad.body && (
              <div style={{ fontSize:13,color:"#444",lineHeight:1.6,marginBottom:16 }}>
                {ad.body}
              </div>
            )}

            {/* Contact actions */}
            <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
              {ad._provider_phone && (
                <a href={`tel:${ad._provider_phone}`} style={{
                  display:"flex",alignItems:"center",gap:10,
                  background:"#1A6B3C",color:"#fff",
                  borderRadius:10,padding:"13px 18px",
                  textDecoration:"none",fontWeight:800,fontSize:15,
                }}>
                  📞 Call {ad._provider_phone}
                </a>
              )}
              {ad._provider_website && (
                <a href={ad._provider_website.startsWith("http") ? ad._provider_website : `https://${ad._provider_website}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{
                    display:"flex",alignItems:"center",gap:10,
                    background:"#1B3D6F",color:"#fff",
                    borderRadius:10,padding:"13px 18px",
                    textDecoration:"none",fontWeight:800,fontSize:15,
                  }}
                >
                  🌐 Visit Website
                </a>
              )}
              {ad._provider_entity_id && (
                <a href={`/Home?provider=${ad._provider_entity_id}`}
                  style={{
                    display:"flex",alignItems:"center",gap:10,
                    background:"#f5f0e8",color:"#1B3D6F",
                    borderRadius:10,padding:"13px 18px",
                    textDecoration:"none",fontWeight:700,fontSize:14,
                    border:"1px solid #ddd",
                  }}
                >
                  👤 View Full Profile & Reviews
                </a>
              )}
            </div>

            {/* Expiry */}
            {ad.deal_expires_at && !isExpired(ad) && (
              <div style={{ marginTop:16,textAlign:"center",fontSize:12,color:"#CC0000",fontWeight:600 }}>
                Offer expires {fmt(ad.deal_expires_at)}
              </div>
            )}

            <button
              onClick={() => setShowContact(false)}
              style={{
                marginTop:18,width:"100%",background:"none",border:"none",
                color:"#aaa",fontSize:14,cursor:"pointer",padding:8,
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Netflix-style Peek Carousel ──────────────────────────────────────
function PeekCarousel({ ads, currentIndex, onPrev, onNext, setIndex }) {
  const total = ads.length;
  if (total === 0) return null;

  const prevAd   = total > 1 ? ads[(currentIndex - 1 + total) % total] : null;
  const activeAd = ads[currentIndex];
  const nextAd   = total > 1 ? ads[(currentIndex + 1) % total] : null;

  // Single ad — just center it
  if (total === 1) {
    return (
      <div style={{ padding: "0 16px", maxWidth: 480, margin: "0 auto" }}>
        <AdCard ad={activeAd} active={true} />
      </div>
    );
  }

  return (
    <div
      style={{ position:"relative", width:"100%", userSelect:"none" }}
      onTouchStart={e => { window._tStart = e.touches[0].clientX; }}
      onTouchEnd={e => {
        const dx = e.changedTouches[0].clientX - (window._tStart || 0);
        if (Math.abs(dx) > 40) { dx < 0 ? onNext() : onPrev(); }
      }}
    >
      {/* 3-card layout: flanking cards visible, center card pops out */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        padding: "8px 4px 16px",
      }}>
        {/* Left card */}
        <div
          onClick={onPrev}
          style={{
            flex: "0 0 30%",
            maxWidth: 220,
            cursor: "pointer",
            transition: "transform 0.35s cubic-bezier(.4,0,.2,1)",
            borderRadius: 16,
            overflow: "hidden",
          }}
        >
          {prevAd && <AdCard ad={prevAd} active={false} onClick={onPrev} />}
        </div>

        {/* Center card — same image size, pops with shadow + gold border only */}
        <div style={{
          flex: "0 0 30%",
          maxWidth: 220,
          transition: "transform 0.35s cubic-bezier(.4,0,.2,1)",
          zIndex: 2,
          borderRadius: 16,
          overflow: "visible",
          boxShadow: "0 12px 40px rgba(0,0,0,0.55), 0 0 0 2.5px #FFDB00",
          position: "relative",
          top: -8,
        }}>
          <AdCard ad={activeAd} active={true} />
        </div>

        {/* Right card */}
        <div
          onClick={onNext}
          style={{
            flex: "0 0 30%",
            maxWidth: 220,
            cursor: "pointer",
            transition: "transform 0.35s cubic-bezier(.4,0,.2,1)",
            borderRadius: 16,
            overflow: "hidden",
          }}
        >
          {nextAd && <AdCard ad={nextAd} active={false} onClick={onNext} />}
        </div>
      </div>

      {/* Prev arrow */}
      <div onClick={onPrev} style={{
        position:"absolute", left:4, top:"35%",
        width:36, height:36, borderRadius:"50%",
        background:"rgba(0,0,0,0.5)", backdropFilter:"blur(4px)",
        display:"flex", alignItems:"center", justifyContent:"center",
        color:"#fff", fontSize:20, fontWeight:900, cursor:"pointer", zIndex:10,
      }}>‹</div>

      {/* Next arrow */}
      <div onClick={onNext} style={{
        position:"absolute", right:4, top:"35%",
        width:36, height:36, borderRadius:"50%",
        background:"rgba(0,0,0,0.5)", backdropFilter:"blur(4px)",
        display:"flex", alignItems:"center", justifyContent:"center",
        color:"#fff", fontSize:20, fontWeight:900, cursor:"pointer", zIndex:10,
      }}>›</div>

      {/* Dot indicators */}
      <div style={{ display:"flex", justifyContent:"center", gap:6, marginTop:4 }}>
        {ads.map((_,i) => (
          <div
            key={i}
            onClick={() => setIndex(i)}
            style={{
              width: i===currentIndex ? 20 : 6,
              height: 6, borderRadius: 3,
              background: i===currentIndex ? "#FFDB00" : "rgba(255,255,255,0.35)",
              cursor: "pointer",
              transition: "width 0.3s ease, background 0.3s ease",
            }}
          />
        ))}
      </div>

      {/* Counter */}
      {total > 1 && (
        <div style={{ textAlign:"center", marginTop:8, fontSize:12, color:"rgba(255,255,255,0.6)", fontWeight:600 }}>
          {currentIndex+1} of {total}
        </div>
      )}
    </div>
  );
}

export default function Classifieds() {
  const [ads, setAds]               = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [filterArea, setFilterArea] = useState("");
  const [filterService, setFilterService] = useState("");
  const [currentIndex, setCurrentIndex]   = useState(0);
  const [showAll, setShowAll]             = useState(false);
  // Dropdown state
  const [svcOpen,  setSvcOpen]  = useState(false);
  const [vilOpen,  setVilOpen]  = useState(false);
  const [openCat,  setOpenCat]  = useState(null);
  const [selSvcObj, setSelSvcObj] = useState(null);
  const [selVilObj, setSelVilObj] = useState(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = () => { setSvcOpen(false); setVilOpen(false); setOpenCat(null); };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  // Deep-link: ?village= or ?service=
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const v = params.get("village");
    const s = params.get("service");
    if (v) setFilterArea(v);
    if (s) setFilterService(s.toLowerCase());
  }, []);

  // Static data for dropdowns
  const CATS_STATIC = [
    { id: "69d09c14d5ee9e7be9aa301b", name: "Home Services", icon: "🏠" },
    { id: "69d181fe57b60e0aecf4067d", name: "Home Systems & Utilities", icon: "💡" },
    { id: "69d09c14d5ee9e7be9aa301c", name: "Yard & Outdoor", icon: "🌿" },
    { id: "69d09c14d5ee9e7be9aa301d", name: "Golf Cart Services", icon: "⛳" },
    { id: "69d09c14d5ee9e7be9aa301e", name: "Automobile Services", icon: "🚗" },
    { id: "69d09c14d5ee9e7be9aa301f", name: "Personal Care", icon: "💆" },
    { id: "69d09c14d5ee9e7be9aa3020", name: "Pet Services", icon: "🐾" },
    { id: "69d09c14d5ee9e7be9aa3021", name: "Transportation", icon: "🚐" },
    { id: "69d181fe57b60e0aecf4067e", name: "Professional Services", icon: "💼" },
  ];
  const SVCS_STATIC = [
    { id: "69d1822df3b2afb229b5bad5", category_id: "69d09c14d5ee9e7be9aa301b", name: "Home Improvements" },
    { id: "69d1822df3b2afb229b5bad6", category_id: "69d09c14d5ee9e7be9aa301b", name: "General Repairs" },
    { id: "69d1822df3b2afb229b5bad7", category_id: "69d09c14d5ee9e7be9aa301b", name: "Cleaning Services" },
    { id: "69d1822df3b2afb229b5bad8", category_id: "69d09c14d5ee9e7be9aa301b", name: "Painting (Interior/Exterior)" },
    { id: "69d1822df3b2afb229b5bad9", category_id: "69d09c14d5ee9e7be9aa301b", name: "Garage Door Services" },
    { id: "69d1822df3b2afb229b5bada", category_id: "69d09c14d5ee9e7be9aa301b", name: "Window Installation/Repair" },
    { id: "69d1822df3b2afb229b5badb", category_id: "69d09c14d5ee9e7be9aa301b", name: "HVAC" },
    { id: "69d1822df3b2afb229b5badc", category_id: "69d09c14d5ee9e7be9aa301b", name: "Plumbing" },
    { id: "69d1822df3b2afb229b5badd", category_id: "69d09c14d5ee9e7be9aa301b", name: "Roofing" },
    { id: "69d1822df3b2afb229b5badf", category_id: "69d09c14d5ee9e7be9aa301b", name: "Security & Home Watch" },
    { id: "69d1822df3b2afb229b5bade", category_id: "69d09c14d5ee9e7be9aa301b", name: "Handyman Services" },
    { id: "69d1822df3b2afb229b5bae3", category_id: "69d09c14d5ee9e7be9aa301b", name: "Flooring (Tile, Wood, Carpet)" },
    { id: "69d1822df3b2afb229b5baee", category_id: "69d09c14d5ee9e7be9aa301b", name: "Pressure Washing" },
    { id: "69d1822df3b2afb229b5baef", category_id: "69d09c14d5ee9e7be9aa301b", name: "Driveway Repair/Cleaning/Painting" },
    { id: "69d1822df3b2afb229b5bae0", category_id: "69d181fe57b60e0aecf4067d", name: "Pest Control" },
    { id: "69d1822df3b2afb229b5bae1", category_id: "69d181fe57b60e0aecf4067d", name: "Appliance Repair" },
    { id: "69d1822df3b2afb229b5bae2", category_id: "69d181fe57b60e0aecf4067d", name: "Electrical & Lighting" },
    { id: "69d1822df3b2afb229b5bae4", category_id: "69d181fe57b60e0aecf4067d", name: "Home Organization" },
    { id: "69d1822df3b2afb229b5bae5", category_id: "69d181fe57b60e0aecf4067d", name: "Smart Home Installation" },
    { id: "69d1822df3b2afb229b5bae6", category_id: "69d181fe57b60e0aecf4067d", name: "Pool & Spa Services" },
    { id: "69d1822df3b2afb229b5bae7", category_id: "69d09c14d5ee9e7be9aa301c", name: "Lawn Mowing" },
    { id: "69d1822df3b2afb229b5bae8", category_id: "69d09c14d5ee9e7be9aa301c", name: "Sod Installation" },
    { id: "69d1822df3b2afb229b5bae9", category_id: "69d09c14d5ee9e7be9aa301c", name: "Tree Trimming & Pruning/Removal" },
    { id: "69d1822df3b2afb229b5baea", category_id: "69d09c14d5ee9e7be9aa301c", name: "Lawn Fertilization" },
    { id: "69d1822df3b2afb229b5baeb", category_id: "69d09c14d5ee9e7be9aa301c", name: "Irrigation/Sprinkler Services" },
    { id: "69d1822df3b2afb229b5baec", category_id: "69d09c14d5ee9e7be9aa301c", name: "Landscaping" },
    { id: "69d1822df3b2afb229b5baed", category_id: "69d09c14d5ee9e7be9aa301c", name: "Hardscaping" },
    { id: "69d1822df3b2afb229b5baf0", category_id: "69d09c14d5ee9e7be9aa301d", name: "Rentals" },
    { id: "69d1822df3b2afb229b5baf1", category_id: "69d09c14d5ee9e7be9aa301d", name: "Repairs" },
    { id: "69d1822df3b2afb229b5baf2", category_id: "69d09c14d5ee9e7be9aa301d", name: "Detailing" },
    { id: "69d1822df3b2afb229b5baf3", category_id: "69d09c14d5ee9e7be9aa301d", name: "Lighting Upgrades" },
    { id: "69d1822df3b2afb229b5baf4", category_id: "69d09c14d5ee9e7be9aa301d", name: "Improvements/Customizations" },
    { id: "69d1822df3b2afb229b5baf5", category_id: "69d09c14d5ee9e7be9aa301d", name: "Battery Replacement" },
    { id: "69d1822df3b2afb229b5baf6", category_id: "69d09c14d5ee9e7be9aa301d", name: "Tire Services" },
    { id: "69d1822df3b2afb229b5baf7", category_id: "69d09c14d5ee9e7be9aa301e", name: "Auto Repairs" },
    { id: "69d1822df3b2afb229b5baf8", category_id: "69d09c14d5ee9e7be9aa301e", name: "Auto Detailing" },
    { id: "69d1822df3b2afb229b5baf9", category_id: "69d09c14d5ee9e7be9aa301e", name: "Oil Changes" },
    { id: "69d1822df3b2afb229b5bafa", category_id: "69d09c14d5ee9e7be9aa301e", name: "Tire Services" },
    { id: "69d1822df3b2afb229b5bafb", category_id: "69d09c14d5ee9e7be9aa301e", name: "Mobile Mechanic" },
    { id: "69d1822df3b2afb229b5bafc", category_id: "69d09c14d5ee9e7be9aa301f", name: "Barber / Stylist" },
    { id: "69d1822df3b2afb229b5bafd", category_id: "69d09c14d5ee9e7be9aa301f", name: "Nail Technicians" },
    { id: "69d1822df3b2afb229b5bafe", category_id: "69d09c14d5ee9e7be9aa301f", name: "Spa Services" },
    { id: "69d1822df3b2afb229b5baff", category_id: "69d09c14d5ee9e7be9aa301f", name: "Home Health Aides" },
    { id: "69d1822df3b2afb229b5bb00", category_id: "69d09c14d5ee9e7be9aa301f", name: "Massage Therapists" },
    { id: "69d1822df3b2afb229b5bb01", category_id: "69d09c14d5ee9e7be9aa301f", name: "Personal Trainers" },
    { id: "69d1822df3b2afb229b5bb02", category_id: "69d09c14d5ee9e7be9aa301f", name: "Makeup Artists" },
    { id: "69d1822df3b2afb229b5bb04", category_id: "69d09c14d5ee9e7be9aa3020", name: "Grooming" },
    { id: "69d1822df3b2afb229b5bb05", category_id: "69d09c14d5ee9e7be9aa3020", name: "Pet Sitting/Walking" },
    { id: "69d1822df3b2afb229b5bb06", category_id: "69d09c14d5ee9e7be9aa3020", name: "Pet Training" },
    { id: "69d1822df3b2afb229b5bb07", category_id: "69d09c14d5ee9e7be9aa3020", name: "Mobile Grooming" },
    { id: "69d1822df3b2afb229b5bb08", category_id: "69d09c14d5ee9e7be9aa3021", name: "Medical Transport" },
    { id: "69d1822df3b2afb229b5bb09", category_id: "69d09c14d5ee9e7be9aa3021", name: "Airport Transport" },
    { id: "69d1822df3b2afb229b5bb0a", category_id: "69d09c14d5ee9e7be9aa3021", name: "Local Rides" },
    { id: "69d1822df3b2afb229b5bb0b", category_id: "69d09c14d5ee9e7be9aa3021", name: "Errand Services" },
    { id: "69d1822df3b2afb229b5bb0c", category_id: "69d09c14d5ee9e7be9aa3021", name: "Courier/Delivery Services" },
    { id: "69d1822df3b2afb229b5bb0f", category_id: "69d181fe57b60e0aecf4067e", name: "IT Support" },
    { id: "69d1822df3b2afb229b5bb10", category_id: "69d181fe57b60e0aecf4067e", name: "Legal Services" },
    { id: "69d1822df3b2afb229b5bb11", category_id: "69d181fe57b60e0aecf4067e", name: "Business Consulting" },
    { id: "69d1822df3b2afb229b5bb12", category_id: "69d181fe57b60e0aecf4067e", name: "Tax Preparation" },
    { id: "69d1822df3b2afb229b5bb18", category_id: "69d181fe57b60e0aecf4067e", name: "Tattoo & Body Art" },
  ];
  const VILLAGE_DATA = [
    { id: "69e9a307d1bc6cfe7247eac2", name: "Alden Bungalows" },
    { id: "69d06c54c9c22e67aed3c0ff", name: "Alhambra" },
    { id: "69e9a307d1bc6cfe7247eaa1", name: "Amelia" },
    { id: "69e9a307d1bc6cfe7247eac3", name: "Antrim Dells" },
    { id: "69e9a307d1bc6cfe7247eaa2", name: "Ashland" },
    { id: "69e9a307d1bc6cfe7247eaa3", name: "Belvedere" },
    { id: "69d06c54c9c22e67aed3c10c", name: "Belle Aire" },
    { id: "69e9a307d1bc6cfe7247eaa4", name: "Bonita" },
    { id: "69e9a307d1bc6cfe7247eaa5", name: "Bonnybrook" },
    { id: "69d06c54c9c22e67aed3c121", name: "Bradford" },
    { id: "69e9a307d1bc6cfe7247ea92", name: "Briar Meadow" },
    { id: "69e9a307d1bc6cfe7247eaa6", name: "Bridgeport at Creekside Landing" },
    { id: "69e047e27ddcca3eaa81600e", name: "Bridgeport at Laurel Valley" },
    { id: "69e9a307d1bc6cfe7247eaa7", name: "Bridgeport at Lake Miona" },
    { id: "69e9a307d1bc6cfe7247eaa8", name: "Bridgeport at Lake Shore Cottages" },
    { id: "69e9a307d1bc6cfe7247eaa9", name: "Bridgeport at Lake Sumter" },
    { id: "69e047e27ddcca3eaa81600f", name: "Bridgeport at Mission Hills" },
    { id: "69e9a307d1bc6cfe7247eaaa", name: "Bridgeport at Miona Shores" },
    { id: "69d06c54c9c22e67aed3c136", name: "Bison Valley" },
    { id: "69e9a307d1bc6cfe7247eaab", name: "Buttonwood" },
    { id: "69e9a307d1bc6cfe7247eaac", name: "Cabanas at Creekside Landing" },
    { id: "69d06c54c9c22e67aed3c110", name: "Calumet Grove" },
    { id: "69e9a307d1bc6cfe7247eaad", name: "Caroline" },
    { id: "69d06c54c9c22e67aed3c122", name: "Cason Hammock" },
    { id: "69e047e27ddcca3eaa816010", name: "Charlotte" },
    { id: "69d06c54c9c22e67aed3c112", name: "Chatham" },
    { id: "69d06c54c9c22e67aed3c123", name: "Chitty Chatty" },
    { id: "69d06c54c9c22e67aed3c124", name: "Citrus Grove" },
    { id: "69e047e27ddcca3eaa816011", name: "Collier" },
    { id: "69d06c54c9c22e67aed3c100", name: "Country Club Hills" },
    { id: "69d06c54c9c22e67aed3c134", name: "Dabney" },
    { id: "69e9a307d1bc6cfe7247ea93", name: "De Allende" },
    { id: "69e9a307d1bc6cfe7247ea94", name: "De La Vista" },
    { id: "69d06c54c9c22e67aed3c101", name: "Del Mar" },
    { id: "69d06c54c9c22e67aed3c125", name: "DeLuna" },
    { id: "69d06c54c9c22e67aed3c126", name: "DeSoto" },
    { id: "69e047e27ddcca3eaa816012", name: "Dunedin" },
    { id: "69e9a307d1bc6cfe7247eaae", name: "Duval" },
    { id: "69d06c4a4f1e1017a77a701b", name: "Eastport (All)" },
    { id: "69d06c54c9c22e67aed3c102", name: "El Cortez" },
    { id: "69d06c4a4f1e1017a77a7019", name: "Established Villages (All)" },
    { id: "69d06c4a4f1e1017a77a701c", name: "Family / Non-Age-Restricted (All)" },
    { id: "69d06c54c9c22e67aed3c127", name: "Fenney" },
    { id: "69e047e27ddcca3eaa816013", name: "Fernandina" },
    { id: "69e047e27ddcca3eaa816014", name: "Gilchrist" },
    { id: "69d06c54c9c22e67aed3c114", name: "Glenbrook" },
    { id: "69e9a307d1bc6cfe7247eab0", name: "Haciendas of Mission Hills" },
    { id: "69d06c54c9c22e67aed3c103", name: "Hacienda" },
    { id: "69e9a307d1bc6cfe7247eaaf", name: "Hadley" },
    { id: "69d06c54c9c22e67aed3c128", name: "Hammock at Fenney" },
    { id: "69d06c54c9c22e67aed3c129", name: "Hawkins" },
    { id: "69e9a307d1bc6cfe7247eab1", name: "Hemingway" },
    { id: "69e047e27ddcca3eaa816015", name: "Hillsborough" },
    { id: "69d06c4a4f1e1017a77a7018", name: "Historic Side (All)" },
    { id: "69e047e27ddcca3eaa816016", name: "LaBelle" },
    { id: "69e9a307d1bc6cfe7247eab2", name: "Lago Vista" },
    { id: "69d06c54c9c22e67aed3c133", name: "Lake Denham" },
    { id: "69e047e27ddcca3eaa816017", name: "Lake Deaton" },
    { id: "69e9a307d1bc6cfe7247eab3", name: "Lakeshore Cottages" },
    { id: "69e9a307d1bc6cfe7247eab4", name: "Largo" },
    { id: "69d06c54c9c22e67aed3c104", name: "La Reynalda" },
    { id: "69d06c54c9c22e67aed3c105", name: "La Zamora" },
    { id: "69e9a307d1bc6cfe7247eab5", name: "Liberty Park" },
    { id: "69d06c54c9c22e67aed3c12a", name: "Linden" },
    { id: "69e9a307d1bc6cfe7247eab6", name: "Lynnhaven" },
    { id: "69e9a307d1bc6cfe7247eab7", name: "Mallory Square" },
    { id: "69d06c54c9c22e67aed3c12b", name: "Marsh Bend" },
    { id: "69d06c54c9c22e67aed3c12c", name: "McClure" },
    { id: "69d06c54c9c22e67aed3c139", name: "Middleton" },
    { id: "69d06c54c9c22e67aed3c106", name: "Mira Mesa" },
    { id: "69d06c54c9c22e67aed3c12d", name: "Monarch Grove" },
    { id: "69d06c54c9c22e67aed3c131", name: "Moultrie Creek" },
    { id: "69d06c4a4f1e1017a77a701a", name: "Newer Villages (All)" },
    { id: "69d06c54c9c22e67aed3c132", name: "Newell" },
    { id: "69e9a307d1bc6cfe7247eac5", name: "Oak Hollow" },
    { id: "69d06c54c9c22e67aed3c137", name: "Oak Meadows" },
    { id: "69d06c54c9c22e67aed3c107", name: "Orange Blossom Gardens" },
    { id: "69e047e27ddcca3eaa816018", name: "Osceola Hills" },
    { id: "69e9a307d1bc6cfe7247eac4", name: "Osceola Hills at Soaring Eagle Preserve" },
    { id: "69d06c54c9c22e67aed3c138", name: "Oxford Oaks" },
    { id: "69e9a307d1bc6cfe7247ea95", name: "Palo Alto" },
    { id: "69e9a307d1bc6cfe7247eab8", name: "Pennecamp" },
    { id: "69e91929e9a419d0ed14129e", name: "Piedmont" },
    { id: "69e9a307d1bc6cfe7247ea96", name: "Pine Hills" },
    { id: "69e9a307d1bc6cfe7247ea97", name: "Pine Ridge" },
    { id: "69e047e27ddcca3eaa816019", name: "Pinellas" },
    { id: "69e9a307d1bc6cfe7247eab9", name: "Poinciana" },
    { id: "69e9a307d1bc6cfe7247ea98", name: "Polo Ridge" },
    { id: "69d06c54c9c22e67aed3c12e", name: "Richmond" },
    { id: "69e9a307d1bc6cfe7247ea99", name: "Rio Grande" },
    { id: "69e9a307d1bc6cfe7247ea9a", name: "Rio Ponderosa" },
    { id: "69e9a307d1bc6cfe7247ea9b", name: "Rio Ranchero" },
    { id: "69e9a307d1bc6cfe7247eaba", name: "Sabal Chase" },
    { id: "69e047e27ddcca3eaa81601a", name: "Sanibel" },
    { id: "69d06c54c9c22e67aed3c11c", name: "Santiago" },
    { id: "69e9a307d1bc6cfe7247ea9c", name: "Santo Domingo" },
    { id: "69d06c54c9c22e67aed3c135", name: "Shady Brook" },
    { id: "69d06c54c9c22e67aed3c108", name: "Silver Lake" },
    { id: "69d06c54c9c22e67aed3c109", name: "Spring Arbor" },
    { id: "69e9a307d1bc6cfe7247ea9d", name: "Springdale" },
    { id: "69e9a307d1bc6cfe7247eabb", name: "St. Charles" },
    { id: "69d06c54c9c22e67aed3c12f", name: "St. Catherine" },
    { id: "69e9a307d1bc6cfe7247eabc", name: "St. James" },
    { id: "69d06c54c9c22e67aed3c130", name: "St. Johns" },
    { id: "69e9a307d1bc6cfe7247ea9e", name: "Summerhill" },
    { id: "69e9a307d1bc6cfe7247eabd", name: "Sunset Pointe" },
    { id: "69e9a307d1bc6cfe7247eabe", name: "Tall Trees" },
    { id: "69e9a307d1bc6cfe7247eabf", name: "Tamarind Grove" },
    { id: "69e9a307d1bc6cfe7247ea9f", name: "Tierra Del Sol" },
    { id: "69d06c54c9c22e67aed3c10a", name: "Valle Verde" },
    { id: "69e9a307d1bc6cfe7247eac6", name: "Waters Edge" },
    { id: "69e9a307d1bc6cfe7247eac7", name: "Well Point" },
    { id: "69e9a307d1bc6cfe7247eac1", name: "Winifred" },
    { id: "69e9a307d1bc6cfe7247eaa0", name: "Woodbury" },
    { id: "69e047e27ddcca3eaa81601b", name: "Brownwood" },
  ];

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
    if (filterArea || filterService) setShowAll(false);
  }, [filterArea, filterService]);

  // Filter logic:
  // Area only → show all providers who serve that village (including mobile = ALL)
  // Service only → show all providers who offer that service (any area)
  // Both → show providers matching BOTH area AND service
  const hasFilter = !!(filterArea || filterService);

  const visibleAds = (showAll && !filterArea && !filterService)
    ? ads.filter(ad => !isExpired(ad))
    : ads.filter(ad => {
    if (isExpired(ad)) return false;

    // Area filter — match against provider's actual service_areas list
    if (filterArea) {
      // Strip "(All)" suffix from macro group selections e.g. "Eastport (All)" → "Eastport"
      const areaLower = filterArea.toLowerCase().replace(/\s*\(all\)\s*$/i, "").trim();
      const areas = ad._provider_areas || [];
      // "ALL" means mobile provider — serves every village
      const serves = areas.includes("ALL") ||
        areas.some((a: string) => a.toLowerCase().includes(areaLower));
      if (!serves) return false;
    }

    // Service filter — match ONLY against provider's services list and category name
    // NOT against headline/body (too loose — nail tech ads shouldn't show for lawn searches)
    if (filterService) {
      const kw = filterService.toLowerCase().trim();
      const haystack = [
        ...(ad._provider_services || []),
        ad._provider_category || "",
        ad.provider_name || "",
      ].join(" ").toLowerCase();
      if (!haystack.includes(kw)) return false;
    }

    return true;
  });

  const currentAd = visibleAds[currentIndex] || null;

  const handlePrev = useCallback(() => {
    setCurrentIndex(i => (i - 1 + visibleAds.length) % visibleAds.length);
  }, [visibleAds.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex(i => (i + 1) % visibleAds.length);
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
    <div style={{ background: "linear-gradient(160deg,#1B3D6F 0%,#0e2548 40%,#1a0a00 100%)", minHeight: "100vh", fontFamily: "'Times New Roman', Georgia, serif" }}>

      {/* ── Header ── */}
      <div style={{
        background: "linear-gradient(135deg,#E8431A 0%,#c93510 40%,#8B0000 100%)",
        color: WHITE,
        padding: "6px 16px 8px",
        borderBottom: "4px solid #FFDB00",
        boxShadow: "0 4px 20px rgba(232,67,26,0.5)",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Decorative burst rings */}
        <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,219,0,0.08)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,219,0,0.08)", pointerEvents: "none" }} />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <a href="/" style={{ textDecoration: "none" }}>
            <button style={{
              background: "rgba(0,0,0,0.3)",
              border: "2px solid rgba(255,255,255,0.4)", borderRadius: 6,
              color: WHITE, fontFamily: "Georgia, serif",
              fontWeight: 700, fontSize: 13, padding: "7px 14px", cursor: "pointer",
              backdropFilter: "blur(4px)",
            }}>« Home</button>
          </a>
          <img
            src="https://media.base44.com/images/public/69d062aca815ce8e697894b1/a9af95bc3_V-Hublogo.png"
            alt="V-Hub"
            style={{ height: 36, filter: "brightness(0) invert(1)" }}
          />
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{
            fontSize: 20, fontWeight: 900, letterSpacing: 1,
            textShadow: "0 2px 8px rgba(0,0,0,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}>
            🔥 Deals of the Week 🔥
          </div>

        </div>
      </div>

      {/* ── Filter bar ── */}
      <div style={{
        background: "linear-gradient(180deg,#1e3a6e,#162d56)",
        borderBottom: "3px solid #FFDB00",
        padding: "6px 12px 8px",
      }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
          <div style={{ flex: 1, fontSize: 11, fontWeight: 700, color: "#FFDB00", fontFamily: "'Times New Roman', serif", letterSpacing: 0.5 }}>
            What service do you need?
          </div>
          <div style={{ flex: 1, fontSize: 11, fontWeight: 700, color: "#FFDB00", fontFamily: "'Times New Roman', serif", letterSpacing: 0.5 }}>
            Where do you need it?
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {/* Service dropdown */}
          <div style={{ flex: 1, minWidth: 0, position: "relative" }}>
            <button
              onClick={e => { e.stopPropagation(); setSvcOpen(o => !o); setVilOpen(false); setOpenCat(null); }}
              style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "10px 12px",
                border: selSvcObj ? "2px solid #FFDB00" : "2px solid rgba(255,255,255,0.3)",
                borderRadius: 8,
                background: selSvcObj ? "rgba(255,219,0,0.15)" : "rgba(255,255,255,0.12)",
                fontFamily: "'Times New Roman', serif", fontSize: 13,
                color: selSvcObj ? "#FFDB00" : "rgba(255,255,255,0.85)",
                cursor: "pointer", fontWeight: selSvcObj ? 700 : 400, textAlign: "left",
                backdropFilter: "blur(4px)",
              }}
            >
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {selSvcObj ? selSvcObj.name : "🔍 Select a Service..."}
              </span>
              <span style={{ fontSize: 10, flexShrink: 0, marginLeft: 4, color: "rgba(255,255,255,0.6)" }}>
                {svcOpen ? "▲" : "▼"}
              </span>
            </button>
            {svcOpen && (
              <div
                onClick={e => e.stopPropagation()}
                style={{
                  position: "absolute", top: "calc(100% + 2px)", left: 0, right: 0,
                  background: "#f5f0e8", border: `2px solid ${INK}`, borderRadius: 4,
                  zIndex: 9999, boxShadow: "0 8px 28px rgba(0,0,0,0.4)",
                  maxHeight: 500, overflowY: "auto",
                }}
              >
                {CATS_STATIC.sort((a, b) => a.name.localeCompare(b.name)).map(c => {
                  const catSvcs = SVCS_STATIC.filter(s => s.category_id === c.id).sort((a, b) => a.name.localeCompare(b.name));
                  const isExpanded = openCat === c.id;
                  return (
                    <div key={c.id}>
                      <div
                        onClick={() => setOpenCat(isExpanded ? null : c.id)}
                        style={{
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                          padding: "11px 14px", borderBottom: "1px solid #ddd6c8",
                          background: "#f5f0e8", cursor: "pointer", userSelect: "none",
                        }}
                      >
                        <span style={{ fontSize: 13, fontWeight: 700, color: INK, fontFamily: "'Times New Roman', serif" }}>
                          {c.icon} {c.name}
                        </span>
                        <span style={{ fontSize: 10, color: MUTED }}>{isExpanded ? "▲" : "▼"}</span>
                      </div>
                      {isExpanded && catSvcs.map(s => (
                        <div
                          key={s.id}
                          onClick={() => { setSelSvcObj(s); setFilterService(s.name.toLowerCase()); setSvcOpen(false); setOpenCat(null); }}
                          style={{
                            padding: "10px 14px 10px 28px", fontSize: 13,
                            fontFamily: "'Times New Roman', serif",
                            color: selSvcObj?.id === s.id ? "#fff" : INK,
                            background: selSvcObj?.id === s.id ? "#7A4820" : "#e8e0d0",
                            borderBottom: "1px solid #ddd6c8", cursor: "pointer",
                            fontWeight: selSvcObj?.id === s.id ? 700 : 400,
                          }}
                        >
                          {selSvcObj?.id === s.id ? "✓ " : "– "}{s.name}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Village dropdown */}
          <div style={{ flex: 1, minWidth: 0, position: "relative" }}>
            <button
              onClick={e => { e.stopPropagation(); setVilOpen(o => !o); setSvcOpen(false); setOpenCat(null); }}
              style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "10px 12px",
                border: selVilObj ? "2px solid #FFDB00" : "2px solid rgba(255,255,255,0.3)",
                borderRadius: 8,
                background: selVilObj ? "rgba(255,219,0,0.15)" : "rgba(255,255,255,0.12)",
                fontFamily: "'Times New Roman', serif", fontSize: 13,
                color: selVilObj ? "#FFDB00" : "rgba(255,255,255,0.85)",
                cursor: "pointer", fontWeight: selVilObj ? 700 : 400, textAlign: "left",
                backdropFilter: "blur(4px)",
              }}
            >
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {selVilObj ? selVilObj.name : "📍 Select a Village..."}
              </span>
              <span style={{ fontSize: 10, flexShrink: 0, marginLeft: 4, color: "rgba(255,255,255,0.6)" }}>
                {vilOpen ? "▲" : "▼"}
              </span>
            </button>
            {vilOpen && (
              <div
                onClick={e => e.stopPropagation()}
                style={{
                  position: "absolute", top: "calc(100% + 2px)", left: 0, right: 0,
                  background: "#f5f0e8", border: `2px solid ${INK}`, borderRadius: 4,
                  zIndex: 9999, boxShadow: "0 8px 28px rgba(0,0,0,0.4)",
                  maxHeight: 380, overflowY: "auto",
                }}
              >
                {VILLAGE_DATA.sort((a, b) => a.name.localeCompare(b.name)).map(v => (
                  <div
                    key={v.id}
                    onClick={() => { setSelVilObj(v); setFilterArea(v.name); setVilOpen(false); }}
                    style={{
                      padding: "12px 16px", fontSize: 14,
                      color: selVilObj?.id === v.id ? "#fff" : INK,
                      background: selVilObj?.id === v.id ? "#7A4820" : "#f5f0e8",
                      borderBottom: "1px solid #ddd6c8", cursor: "pointer",
                      fontFamily: "'Times New Roman', serif",
                      fontWeight: selVilObj?.id === v.id ? 700 : 400,
                    }}
                  >
                    {v.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {!!(filterArea || filterService) && (
          <button
            onClick={() => { setFilterArea(""); setFilterService(""); setSelSvcObj(null); setSelVilObj(null); setSvcOpen(false); setVilOpen(false); }}
            style={{
              marginTop: 8, background: "rgba(255,255,255,0.15)", color: WHITE,
              border: "1px solid rgba(255,255,255,0.3)", borderRadius: 20,
              fontSize: 12, fontWeight: 700, padding: "7px 16px", cursor: "pointer",
              backdropFilter: "blur(4px)",
            }}
          >✕ Clear Filters</button>
        )}
      </div>

      {/* ── Content ── */}
      <div style={{ maxWidth: 520, margin: "0 auto", padding: "20px 16px 60px" }}>

        {loading && (
          <div style={{ textAlign: "center", padding: 60, color: "rgba(255,255,255,0.7)", fontSize: 16 }}>
            Loading deals…
          </div>
        )}

        {error && (
          <div style={{ background: "#fff3f3", border: `1px solid ${RED}`, borderRadius: 8, padding: 20, textAlign: "center", color: RED }}>
            {error}
          </div>
        )}

        {/* Prompt to search */}
        {!loading && !error && !hasFilter && !showAll && (
          <div style={{ textAlign: "center", padding: "50px 20px 60px" }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>🔥</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: WHITE, marginBottom: 8, textShadow: "0 2px 8px rgba(0,0,0,0.4)" }}>
              Hot Deals Near You
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.8, color: "rgba(255,255,255,0.75)" }}>
              Select a service and your village above<br />
              to see exclusive deals this week.
            </div>
            {ads.length > 0 && (
              <div
                onClick={() => { setFilterArea(""); setFilterService(""); setCurrentIndex(0); setShowAll(true); setTimeout(() => { const el = document.getElementById("deals-carousel"); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); }, 80); }}
                style={{
                  display: "inline-block", marginTop: 20,
                  background: "rgba(255,219,0,0.15)", border: "1px solid #FFDB00",
                  color: "#FFDB00", fontSize: 12, fontWeight: 700,
                  padding: "6px 18px", borderRadius: 20,
                  cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3,
                }}
              >
                🏷️ {ads.filter(a => !isExpired(a)).length} active deal{ads.filter(a => !isExpired(a)).length !== 1 ? "s" : ""} available this week — tap to browse
              </div>
            )}
          </div>
        )}

        {/* No results */}
        {!loading && !error && hasFilter && visibleAds.length === 0 && (
          <div style={{ textAlign: "center", padding: 60, color: "rgba(255,255,255,0.75)" }}>
            <div style={{ fontSize: 44, marginBottom: 4 }}>🏖️</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: WHITE, marginBottom: 8 }}>
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

        {/* Netflix-style peek carousel */}
        {!loading && !error && (hasFilter || showAll) && visibleAds.length > 0 && (
          <div id="deals-carousel">
          <PeekCarousel
            ads={visibleAds}
            currentIndex={currentIndex}
            onPrev={handlePrev}
            onNext={handleNext}
            setIndex={setCurrentIndex}
          />
          </div>
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
