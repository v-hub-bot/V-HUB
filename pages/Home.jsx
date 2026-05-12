// FORCE_REBUILD_1776768600
// V-Hub Home — v2026-04-14c
import React, { useState, useEffect, useRef } from "react"; // v3 - expanded content
import { createPortal } from "react-dom";
import { ServiceArea, Category, Service, Provider, ProviderReview, User } from "@/api/entities";


// ── GA4 Loader ────────────────────────────────────────────────────────────
if (typeof window !== 'undefined' && !window.__ga4loaded) {
  window.__ga4loaded = true;
  const _s = document.createElement('script');
  _s.async = true;
  _s.src = 'https://www.googletagmanager.com/gtag/js?id=G-1EJ40FW9E1';
  document.head.appendChild(_s);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function(){window.dataLayer.push(arguments);};
  window.gtag('js', new Date());
  window.gtag('config', 'G-1EJ40FW9E1');
}
// ── SEO Meta Tags ──────────────────────────────────────────────────────────
function useMeta({ title, description, keywords, ogTitle, ogDescription, ogImage, canonical }) {
  useEffect(() => {
    // Title
    document.title = title || "V-Hub | The Villages, FL Local Services Directory";
    const setMeta = (name, content, prop = false) => {
      const attr = prop ? "property" : "name";
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) { el = document.createElement("meta"); el.setAttribute(attr, name); document.head.appendChild(el); }
      el.setAttribute("content", content);
    };
    setMeta("description", description || "V-Hub connects The Villages, Florida residents with trusted local service providers. Search landscaping, home repair, pet care, transportation, and more.");
    setMeta("keywords", keywords || "The Villages Florida services, local service directory, home repair Villages FL, landscaping Villages Florida, V-Hub");
    setMeta("robots", "index, follow");

    // Inject JSON-LD structured data for Google
    let jsonLd = document.getElementById("vhub-jsonld");
    if (!jsonLd) {
      jsonLd = document.createElement("script");
      jsonLd.id = "vhub-jsonld";
      jsonLd.type = "application/ld+json";
      document.head.appendChild(jsonLd);
    }
    jsonLd.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "V-Hub",
      "url": "https://www.v-hub.us/",
      "description": "V-Hub connects The Villages, Florida residents with trusted local service providers.",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://www.v-hub.us/?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    });
    setMeta("viewport", "width=device-width, initial-scale=1.0, maximum-scale=1.0");
    // Open Graph
    setMeta("og:type", "website", true);
    setMeta("og:site_name", "V-Hub", true);
    setMeta("og:url", canonical || "https://www.v-hub.us/", true);
    setMeta("og:title", ogTitle || title || "V-Hub | The Villages, FL Local Services", true);
    setMeta("og:description", ogDescription || description || "Find trusted local service providers in The Villages, Florida.", true);
    setMeta("og:image", ogImage || "https://media.base44.com/images/public/69d062aca815ce8e697894b1/a9af95bc3_V-Hublogo.png", true);
    // Twitter card
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", ogTitle || title || "V-Hub | The Villages, FL");
    setMeta("twitter:description", description || "Find trusted local service providers in The Villages, Florida.");
    setMeta("twitter:image", ogImage || "https://media.base44.com/images/public/69d062aca815ce8e697894b1/a9af95bc3_V-Hublogo.png");
    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]');
      if (!link) { link = document.createElement("link"); link.rel = "canonical"; document.head.appendChild(link); }
      link.href = canonical;
    }
  }, [title]);
}


const INK       = "#1C0F00";
const INK_FADE  = "#5C3A10";
const PAPER     = "#F0E6C8";
const PAPER_MID = "#E4D5A8";
const PAPER_DK  = "#C8B07A";
const BROWN_BTN = "#7A4820";
const BROWN_HL  = "#6B3010";
const YELLOW    = "#FFDB00";
const TEAL      = "#00BFA5";
const NAVY      = "#1B3D6F";

// Newspaper stories — each has headline, subhead, paragraphs
const NEWSPAPER_CONTENT = {
  neighborhoodWatch: {
    headline: "LOCAL SERVICES ON THE RISE",
    subhead: "Demand surges as the community expands southward",
    body: [
      "Residents report record demand for trusted local service providers. From landscaping crews in Eastport to home repair specialists in Spanish Springs, the marketplace has never been more active.",
      "Lawn care, pest control, and handyman services top the search charts each spring, with new providers joining V-Hub every week.",
      "Whether you're a longtime resident or new to the community, finding the right help has never been easier.",
    ]
  },
  growthStory: {
    headline: "COMMUNITY PULSE",
    subhead: "What neighbors are searching for this season",
    body: [
      "Spring means pool openings, golf cart tune-ups, and patio projects. Residents turn to V-Hub to find trusted local professionals before the summer heat sets in.",
      "Word travels fast in The Villages — but V-Hub travels faster. Bookmark it, share it with a neighbor, and never scramble for a referral again.",
    ]
  },
  howItWorks: {
    headline: "FIND YOUR PROVIDER IN SECONDS",
    subhead: "Search by service and village — results appear instantly",
    body: [
      "Select the service you need, pick your village, and hit Find Services. Every matching provider who serves your area appears — no middleman, no fees.",
    ]
  },
  homeServices: {
    headline: "SERVICES FOR EVERY HOME",
    subhead: "Trusted pros serve every neighborhood",
    body: [
      "Whether you need a faucet fixed, windows replaced, or your lawn trimmed, V-Hub connects you with vetted local professionals across every village.",
      "Residents can leave reviews and help their neighbors make informed choices.",
      "From one-time repairs to recurring maintenance, V-Hub providers offer flexible scheduling built around your lifestyle — no long hold times, no call centers.",
    ]
  },
  providerSpotlight: {
    headline: "TRUSTED NAMES, LOCAL ROOTS",
    subhead: "Established providers bring years of local expertise",
    body: [
      "Many of The Villages' most beloved providers have served this community for over a decade — from family-owned landscaping businesses to tradespeople who know every neighborhood by name.",
      "V-Hub reviews every listing before it goes live. Browse categories, read reviews, and contact providers directly.",
    ]
  },
  classifieds: {
    headline: "COMMUNITY SPOTLIGHT",
    subhead: "Service highlights from across The Villages",
    body: [
      "HOME SERVICES — Handyman, landscaping, pool care, and pest control.",
      "PET CARE — Dog walkers, groomers, sitters, and vet services.",
      "TECH HELP — Senior-friendly phone, tablet, and Wi-Fi support.",
      "PERSONAL CARE — Hair, nails, massage, and wellness at your door.",
    ]
  },
  safetyTrust: {
    headline: "YOUR SAFETY, OUR PRIORITY",
    subhead: "Every listing is reviewed before going live",
    body: [
      "Every business on V-Hub is reviewed before appearing in results. Resident feedback keeps quality high.",
      "Questions? Contact admin@v-hub.us — our team responds quickly.",
    ]
  },
}
function vName(a) { return a.name || ""; }

function Rule({ thick = false, style = {} }) {
  return (
    <div style={style}>
      <div style={{ height: thick ? 3 : 1, background: INK }} />
      {thick && <div style={{ height: 1, background: INK, marginTop: 2 }} />}
    </div>
  );
}

const newsStyle = {
  fontFamily: "'Times New Roman', Georgia, serif",
  fontSize: 8.5,
  color: INK_FADE,
  lineHeight: 1.9,
  textAlign: "justify",
  margin: 0,
};

function Burger({ currentUser }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)} style={{ background: "rgba(28,15,0,0.12)", border: `1px solid ${INK}44`, borderRadius: 4, width: 38, height: 38, cursor: "pointer", display: "flex", flexDirection: "column", gap: 5, justifyContent: "center", alignItems: "center", flexShrink: 0, padding: 0, boxSizing: "border-box" }}>
        {[0,1,2].map(i => <span key={i} style={{ display: "block", width: 20, height: 2, background: INK, borderRadius: 2 }} />)}
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 299, background: "rgba(0,0,0,0.55)" }} />
          <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 235, background: PAPER, zIndex: 300, boxShadow: "-3px 0 20px rgba(0,0,0,0.3)", fontFamily: "'Times New Roman', serif", display: "flex", flexDirection: "column" }}>
            <div style={{ background: INK, padding: "13px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ color: PAPER, fontWeight: 900, fontSize: 14, letterSpacing: 2 }}>V-HUB</span>
              <button onClick={() => setOpen(false)} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", borderRadius: 3, width: 22, height: 22, fontSize: 12, cursor: "pointer" }}>x</button>
            </div>
            <div style={{ padding: "8px 7px", flex: 1, overflowY: "auto" }}>
              {[
                { label: "Home", href: "/" },
                { label: "List Your Service", href: "/ListService" },
                { label: "Provider Hub", href: "/ProviderDashboard", highlight: true },
              ].map((l, i) => (
                <a key={i} href={l.href} style={{ textDecoration: "none" }}>
                  <div style={{ padding: "10px 12px", borderRadius: 3, fontSize: 13, fontWeight: 700, color: l.highlight ? PAPER : INK, marginBottom: 4, background: l.highlight ? BROWN_BTN : PAPER_MID, borderLeft: `4px solid ${BROWN_BTN}` }}>{l.label}</div>
                </a>
              ))}
              <div style={{ margin: "12px 7px 4px", height: 1, background: PAPER_DK }} />
              <div style={{ padding: "6px 12px", fontSize: 10, color: INK_FADE, fontStyle: "italic", fontFamily: "Georgia, serif", lineHeight: 1.5 }}>
                Already listed? Visit the <strong>Provider Hub</strong> to manage your profile, view your stats, and read your reviews.
              </div>


            </div>

            {currentUser && (
              <div style={{ padding: "8px 12px", borderTop: `1px solid ${PAPER_DK}` }}>
                <div style={{ fontSize: 11, color: INK_FADE, fontStyle: "italic" }}>{currentUser.full_name || currentUser.email}</div>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}

// ── Provider Detail ───────────────────────────────────────────────────────────
const MACRO_AREAS_MAP = {
  // Text keys (legacy)
  "Historic Side": "Historic Side",
  "Established Villages": "Established Villages",
  "Newer Villages": "Newer Villages",
  "Eastport": "Eastport",
  "Family Villages": "Family & Non-Age-Restricted",
  "All Villages": "All Villages",
  // Entity ID keys (current DB values)
  "69d06c4a4f1e1017a77a7018": "Historic Side",
  "69d06c4a4f1e1017a77a7019": "Established Villages",
  "69d06c4a4f1e1017a77a701a": "Newer Villages",
  "69d06c4a4f1e1017a77a701b": "Eastport",
  "69d06c4a4f1e1017a77a701c": "Family & Non-Age-Restricted",
};

function Stars({ rating, size = 14 }) {
  const full = Math.floor(rating || 0);
  const half = (rating || 0) - full >= 0.5;
  return (
    <span style={{ fontSize: size, color: "#B8860B", letterSpacing: 1 }}>
      {"★".repeat(full)}{half ? "½" : ""}{"☆".repeat(5 - full - (half ? 1 : 0))}
    </span>
  );
}

function ProvDetail({ prov, areas, cats, svcs, onBack }) {
  const [reviews, setReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewSaved, setReviewSaved] = useState(false);
  const [reviewForm, setReviewForm] = useState({ customer_name: "", customer_village: "", rating: 5, review_text: "", service_used: "" });
  const cat = cats.find(c => c.id === prov.category_id);
  const GREEN = "#1A6B3C";
  const RED_RULE = "#8B1A1A";
  const TEAL_COL = "#00836B";

  // Build lookup maps from passed entities
  const svcMap = React.useMemo(() => {
    const m = {};
    (svcs || []).forEach(s => { if (s.id) m[s.id] = s.name; });
    return m;
  }, [svcs]);

  const areaMap = React.useMemo(() => {
    const m = {};
    (areas || []).forEach(a => { if (a.id) m[a.id] = a.name.includes(' — ') ? a.name.split(' — ').pop().trim() : a.name; });
    return m;
  }, [areas]);

  const resolvedServices = (prov.services || []).map(s => svcMap[s] || s).filter(Boolean);
  const resolvedAreas    = (prov.service_areas || []).map(a => areaMap[a] || MACRO_AREAS_MAP[a] || a).filter(Boolean);

  useEffect(() => {
    ProviderReview.filter({ provider_id: prov.id })
      .then(all => setReviews((all || []).filter(r => r.is_approved)))
      .catch(() => setReviews([]));
    // increment profile view count (read fresh to avoid race condition)
    Provider.get(prov.id).then(fresh => {
      Provider.update(prov.id, { profile_views: (fresh.profile_views || 0) + 1 }).catch(() => {});
    }).catch(() => {
      Provider.update(prov.id, { profile_views: (prov.profile_views || 0) + 1 }).catch(() => {});
    });
    // Log to detailed analytics
    fetch("https://api.base44.app/api/apps/69d062aca815ce8e697894b1/functions/trackEvent", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider_id: prov.id, event_type: "profile_view", source: "homepage" }),
    }).catch(() => {});
  }, [prov.id]);

  const vhubAvg = reviews.length > 0
    ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length)
    : null;
  const vhubAvgStr = vhubAvg !== null ? vhubAvg.toFixed(1) : null;

  const handleReviewSubmit = async () => {
    if (!reviewForm.customer_name || !reviewForm.review_text) return;
    try {
      await ProviderReview.create({ ...reviewForm, provider_id: prov.id, is_approved: false, helpful_count: 0 });
      setReviewSaved(true);
      setShowReviewForm(false);
      setReviewForm({ customer_name: "", customer_village: "", rating: 5, review_text: "", service_used: "" });
    } catch(err) {
      alert("There was a problem submitting your review. Please try again.");
    }
  };

  const inputS = { width: "100%", boxSizing: "border-box", background: PAPER, border: `1.5px solid ${PAPER_DK}`, borderRadius: 4, color: INK, fontFamily: "'Times New Roman', serif", fontSize: 13, padding: "8px 11px", outline: "none" };
  const lblS = { fontSize: 10, fontWeight: 700, color: INK_FADE, textTransform: "uppercase", letterSpacing: 1, marginBottom: 3, display: "block", fontFamily: "'Times New Roman', serif" };

  const hasGoogleRating = typeof prov.google_rating === "number" && prov.google_rating > 0;

  return (
    <div style={{ minHeight: "100vh", background: PAPER, fontFamily: "'Times New Roman', serif", maxWidth: 860, margin: "0 auto", boxShadow: "0 2px 40px rgba(0,0,0,0.28)" }}>
      <div style={{ background: INK, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
        <button onClick={onBack} style={{ background: "rgba(255,255,255,0.15)", border: "none", color: PAPER, borderRadius: 3, padding: "4px 10px", fontSize: 12, cursor: "pointer" }}>← Back</button>
        <span style={{ color: PAPER, fontWeight: 700, fontSize: 13, letterSpacing: 1 }}>V-Hub</span>
        {prov.vh_number && <span style={{ marginLeft: "auto", background: "rgba(255,255,255,0.12)", color: PAPER, fontSize: 11, padding: "2px 10px", borderRadius: 10, letterSpacing: 1 }}>{prov.vh_number}</span>}
      </div>
      <div style={{ padding: "16px" }}>
        {/* ── Header ── */}
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 8 }}>
          {prov.logo_url && <img src={prov.logo_url} alt="logo" style={{ width: 72, height: 72, borderRadius: 8, objectFit: "cover", border: `1px solid ${PAPER_DK}`, flexShrink: 0 }} />}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: INK, lineHeight: 1.15, wordBreak: "break-word" }}>{prov.business_name}</div>
            {cat && <div style={{ fontSize: 12, color: INK_FADE, marginTop: 2 }}>{cat.icon} {cat.name}</div>}

            {/* V-Hub rating row */}
            {vhubAvg !== null && (
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 5 }}>
                <Stars rating={vhubAvg} size={14} />
                <span style={{ fontSize: 11, color: TEAL_COL, fontWeight: 700 }}>{vhubAvgStr}/5</span>
                <span style={{ fontSize: 11, color: INK_FADE }}>· {reviews.length} V-Hub review{reviews.length !== 1 ? "s" : ""}</span>
              </div>
            )}

            {/* Google rating row */}
            {hasGoogleRating && (
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: vhubAvg !== null ? 3 : 5 }}>
                <span style={{ fontSize: 12, color: "#F9A825" }}>{"★".repeat(Math.round(prov.google_rating))}</span>
                <span style={{ fontSize: 11, color: "#4285F4", fontWeight: 700 }}>{prov.google_rating}/5 Google</span>
                {prov.google_review_url && (
                  <a href={prov.google_review_url} target="_blank" rel="noreferrer"
                     style={{ fontSize: 10, color: "#4285F4", textDecoration: "underline", marginLeft: 2 }}>
                    See reviews ↗
                  </a>
                )}
              </div>
            )}
            {/* Google reviews link even without rating */}
            {!hasGoogleRating && prov.google_review_url && (
              <div style={{ marginTop: 4 }}>
                <a href={prov.google_review_url} target="_blank" rel="noreferrer"
                   style={{ fontSize: 11, color: "#4285F4", textDecoration: "underline" }}>
                  🔍 View Google Reviews ↗
                </a>
              </div>
            )}
          </div>
        </div>

        <Rule thick style={{ marginBottom: 10 }} />

        {/* ── Description ── */}
        {prov.description && <p style={{ fontSize: 13, color: INK, lineHeight: 1.7, marginBottom: 12 }}>{prov.description}</p>}

        {/* ── Location / Mobility Badge ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          {prov.is_mobile === true ? (
            <span style={{ background: "#E8F5E9", border: "1.5px solid #1A6B3C", borderRadius: 20, padding: "3px 12px", fontSize: 11, fontWeight: 700, color: "#1A6B3C", fontFamily: "'Times New Roman', serif", letterSpacing: 0.5 }}>
              🚐 Mobile — Travels to You
            </span>
          ) : prov.address ? (
            <span style={{ background: "#FFF8E1", border: "1.5px solid #B8860B", borderRadius: 20, padding: "3px 12px", fontSize: 11, fontWeight: 700, color: "#7B5E00", fontFamily: "'Times New Roman', serif", letterSpacing: 0.5 }}>
              🏪 Brick & Mortar
            </span>
          ) : null}
        </div>

        {/* ── Contact & Info Grid ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 12px", marginBottom: 12 }}>
          {prov.phone && (
            <div style={{ fontSize: 12, color: INK, display: "flex", alignItems: "center", gap: 4 }}>
              <b>📞</b> <a href={"tel:" + prov.phone} style={{ color: INK }}>{prov.phone}</a>
            </div>
          )}
          {prov.email && (
            <div style={{ fontSize: 12, color: INK, display: "flex", alignItems: "center", gap: 4, wordBreak: "break-all" }}>
              <b>✉️</b> <a href={"mailto:" + prov.email} style={{ color: BROWN_BTN }}>{prov.email}</a>
            </div>
          )}
          {prov.website && (
            <div style={{ fontSize: 12, color: INK, gridColumn: "1/-1", display: "flex", alignItems: "center", gap: 4 }}>
              <b>🌐</b>
              <a href={prov.website.startsWith("http") ? prov.website : "https://" + prov.website}
                 target="_blank" rel="noreferrer"
                 style={{ color: "#1A3F70", wordBreak: "break-all" }}>
                {prov.website.replace(/^https?:\/\//, "")}
              </a>
            </div>
          )}
          {prov.address && (
            <div style={{ fontSize: 12, color: INK, gridColumn: "1/-1", display: "flex", alignItems: "flex-start", gap: 4 }}>
              <b>📍</b> <span>{prov.address}</span>
            </div>
          )}
          {prov.years_in_business && (
            <div style={{ fontSize: 12, color: INK }}>
              <b>📅</b> {prov.years_in_business} yr{parseInt(prov.years_in_business) !== 1 ? "s" : ""} in business
            </div>
          )}
          {prov.license_number && (
            <div style={{ fontSize: 12, color: INK }}>
              <b>📋</b> Lic# {prov.license_number}
            </div>
          )}
        </div>

        {/* ── Hours of Operation ── */}
        {prov.hours_of_operation && (
          <div style={{ background: PAPER_MID, border: `1px solid ${PAPER_DK}`, borderRadius: 6, padding: "10px 14px", marginBottom: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: INK_FADE, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 5 }}>🕐 Hours of Operation</div>
            <div style={{ fontSize: 12, color: INK, lineHeight: 1.8, whiteSpace: "pre-line" }}>{prov.hours_of_operation}</div>
          </div>
        )}

        {/* ── Services Offered ── */}
        {resolvedServices.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: INK_FADE, textTransform: "uppercase", letterSpacing: 1, marginBottom: 5 }}>Services Offered</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {resolvedServices.map((s, i) => (
                <span key={i} style={{ background: BROWN_BTN, color: PAPER, borderRadius: 10, padding: "3px 10px", fontSize: 11, fontFamily: "'Times New Roman', serif" }}>{s}</span>
              ))}
            </div>
          </div>
        )}

        {/* ── Areas Served ── */}
        {resolvedAreas.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: INK_FADE, textTransform: "uppercase", letterSpacing: 1, marginBottom: 5 }}>Villages Served</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {resolvedAreas.map((a, i) => (
                <span key={i} style={{ background: PAPER_MID, border: `1px solid ${PAPER_DK}`, borderRadius: 3, padding: "2px 8px", fontSize: 11, color: INK }}>
                  📍 {a}
                </span>
              ))}
            </div>
          </div>
        )}

        <Rule style={{ marginBottom: 14 }} />

        {/* ── V-Hub Community Reviews ── */}
        <div style={{ marginBottom: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 12, fontWeight: 900, color: INK, textTransform: "uppercase", letterSpacing: 2 }}>
            ⭐ V-Hub Community Reviews
          </div>
          {!showReviewForm && !reviewSaved && (
            <button onClick={() => setShowReviewForm(true)} style={{ background: BROWN_BTN, color: PAPER, border: "none", borderRadius: 4, padding: "4px 12px", fontSize: 11, cursor: "pointer", fontFamily: "'Times New Roman', serif", fontWeight: 700, letterSpacing: 1 }}>
              + Write a Review
            </button>
          )}
        </div>

        {/* Review form */}
        {showReviewForm && (
          <div style={{ background: PAPER_MID, border: `1.5px solid ${PAPER_DK}`, borderRadius: 6, padding: "14px 16px", marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 900, color: INK, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>Write a V-Hub Review</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 14px", marginBottom: 8 }}>
              <div><label style={lblS}>Your Name *</label><input style={inputS} value={reviewForm.customer_name} onChange={e => setReviewForm(p => ({ ...p, customer_name: e.target.value }))} placeholder="First & Last" /></div>
              <div><label style={lblS}>Your Village</label><input style={inputS} value={reviewForm.customer_village} onChange={e => setReviewForm(p => ({ ...p, customer_village: e.target.value }))} placeholder="e.g. Buttonwood" /></div>
              <div><label style={lblS}>Service Used</label><input style={inputS} value={reviewForm.service_used} onChange={e => setReviewForm(p => ({ ...p, service_used: e.target.value }))} placeholder="e.g. Lawn Mowing" /></div>
              <div><label style={lblS}>Rating</label><select style={inputS} value={reviewForm.rating} onChange={e => setReviewForm(p => ({ ...p, rating: parseInt(e.target.value) }))}>{[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Star{n > 1 ? "s" : ""} — {"★".repeat(n)}</option>)}</select></div>
            </div>
            <div style={{ marginBottom: 10 }}><label style={lblS}>Your Review *</label><textarea style={{ ...inputS, minHeight: 70, resize: "vertical", lineHeight: 1.6 }} value={reviewForm.review_text} onChange={e => setReviewForm(p => ({ ...p, review_text: e.target.value }))} placeholder="Tell other residents about your experience..." /></div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={handleReviewSubmit} style={{ background: `linear-gradient(180deg,#9A6030,${BROWN_BTN})`, color: PAPER, border: `2px solid ${YELLOW}`, borderRadius: 5, padding: "8px 20px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Times New Roman', serif" }}>Submit</button>
              <button onClick={() => setShowReviewForm(false)} style={{ background: PAPER, border: `1.5px solid ${PAPER_DK}`, color: INK_FADE, borderRadius: 5, padding: "8px 14px", fontSize: 12, cursor: "pointer", fontFamily: "'Times New Roman', serif" }}>Cancel</button>
            </div>
            <div style={{ fontSize: 10, color: INK_FADE, fontStyle: "italic", marginTop: 6 }}>Reviews are approved by Admin before appearing publicly.</div>
          </div>
        )}

        {reviewSaved && <div style={{ background: "#E8F5E9", border: `1.5px solid ${GREEN}`, borderRadius: 6, padding: "10px 14px", marginBottom: 12, fontSize: 12, color: GREEN, fontStyle: "italic" }}>✓ Thank you! Your review will appear after approval.</div>}

        {reviews.length === 0 && !showReviewForm && !reviewSaved && (
          <div style={{ fontSize: 12, color: INK_FADE, fontStyle: "italic", padding: "8px 0 14px" }}>No V-Hub reviews yet — be the first Villages resident to leave one!</div>
        )}

        {reviews.map(r => (
          <div key={r.id} style={{ background: PAPER_MID, border: `1.5px solid ${PAPER_DK}`, borderRadius: 6, padding: "12px 14px", marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
              <div>
                <span style={{ fontSize: 13, fontWeight: 900, color: INK }}>{r.customer_name}</span>
                {r.customer_village && <span style={{ fontSize: 11, color: INK_FADE, fontStyle: "italic", marginLeft: 7 }}>📍 {r.customer_village}</span>}
              </div>
              <Stars rating={r.rating} size={13} />
            </div>
            {r.service_used && <div style={{ fontSize: 10, color: TEAL, fontWeight: 700, marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>Service: {r.service_used}</div>}
            <div style={{ fontSize: 12, color: INK_FADE, fontStyle: "italic", lineHeight: 1.65 }}>&ldquo;{r.review_text}&rdquo;</div>
            <div style={{ fontSize: 10, color: INK_FADE, marginTop: 5 }}>{new Date(r.created_date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} · V-Hub Verified Review</div>
            {r.provider_reply && r.provider_reply.trim() && (
              <div style={{ background: "#E8F5E9", border: "1px solid #A5D6A7", borderRadius: 4, padding: "8px 10px", marginTop: 8 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#2E7D32", textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 }}>Response from Owner</div>
                <div style={{ fontSize: 11, color: INK, lineHeight: 1.6, fontStyle: "italic" }}>{r.provider_reply}</div>
              </div>
            )}
          </div>
        ))}

        {/* ── Google Reviews section ── */}
        {prov.google_review_url && (
          <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px dashed ${PAPER_DK}` }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: INK_FADE, textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>Google Reviews</div>
            <a href={prov.google_review_url} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#fff", border: "1.5px solid #DADCE0", borderRadius: 8, padding: "11px 14px", cursor: "pointer" }}>
                <svg width="22" height="22" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#1C0F00" }}>See {prov.business_name} on Google</div>
                  <div style={{ fontSize: 11, color: "#5C3A10", fontStyle: "italic" }}>Read Google reviews from across the web →</div>
                </div>
              </div>
            </a>
          </div>
        )}

      </div>
    </div>
  );
}



// ── Results ───────────────────────────────────────────────────────────────────
function StarRating({ n = 5 }) {
  const full = Math.floor(n);
  const half = n - full >= 0.5;
  return (
    <span style={{ color: "#F9A825", fontSize: 13, letterSpacing: 0 }}>
      {"★".repeat(full)}{half ? "½" : ""}{"☆".repeat(Math.max(0, 5 - full - (half ? 1 : 0)))}
    </span>
  );
}

function ProviderRatingBadge({ providerId, googleRating }) {
  const [vhubRating, setVhubRating] = React.useState(null);
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    ProviderReview.filter({ provider_id: providerId, is_approved: true })
      .then(revs => {
        const approved = (revs || []);
        if (approved.length > 0) {
          const avg = approved.reduce((s, r) => s + (r.rating || 0), 0) / approved.length;
          setVhubRating(avg);
          setCount(approved.length);
        }
      }).catch(() => {});
  }, [providerId]);

  if (vhubRating !== null) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
        <StarRating n={vhubRating} />
        <span style={{ fontSize: 11, color: INK_FADE, fontFamily: "'Times New Roman', serif" }}>
          {vhubRating.toFixed(1)}/5 · <span style={{ color: TEAL, fontWeight: 700 }}>{count} Villager {count === 1 ? "review" : "reviews"}</span>
        </span>
      </div>
    );
  }
  if (typeof googleRating === "number" && googleRating > 0) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
        <StarRating n={googleRating} />
        <span style={{ fontSize: 11, color: INK_FADE, fontFamily: "'Times New Roman', serif" }}>
          {googleRating}/5 · <span style={{ color: "#4285F4", fontWeight: 700 }}>Google rating</span>
        </span>
      </div>
    );
  }
  return null;
}


function ClassifiedAd({ p, onSel, svcs }) {
  const tier = p.subscription_tier;
  const isPremium = tier === "premium";
  const isFeatured = tier === "featured";

  const borderTop = isPremium
    ? `3px solid ${INK}`
    : isFeatured
    ? `2px solid ${BROWN_BTN}`
    : `1px solid ${PAPER_DK}`;

  const handleClick = () => {
    if (onSel) onSel(p);
  };

  return (
    <div style={{
      borderTop,
      borderBottom: `1px solid ${PAPER_DK}`,
      padding: "14px 0 12px",
      marginBottom: 2,
      background: isPremium ? "rgba(28,15,0,0.03)" : "transparent",
      cursor: onSel ? "pointer" : "default",
    }}>
      {/* Tier badge */}
      {(isPremium || isFeatured) && (
        <div style={{ marginBottom: 5 }}>
          {isPremium && <span style={{ background: INK, color: YELLOW, fontSize: 9, fontWeight: 900, letterSpacing: 1.5, padding: "2px 8px", borderRadius: 2, textTransform: "uppercase" }}>👑 Premium Listing</span>}
          {isFeatured && !isPremium && <span style={{ background: BROWN_BTN, color: PAPER, fontSize: 9, fontWeight: 900, letterSpacing: 1.5, padding: "2px 8px", borderRadius: 2, textTransform: "uppercase" }}>⭐ Featured</span>}
        </div>
      )}

      {/* Business name — clickable to open detail */}
      <div onClick={handleClick} style={{ fontSize: 20, fontWeight: 900, color: onSel ? BROWN_BTN : INK, fontFamily: "'Times New Roman', serif", lineHeight: 1.1, marginBottom: 6, textDecoration: onSel ? "underline" : "none", textDecorationStyle: "dotted" }}>
        {p.business_name}
      </div>
      {p.provider_id && <div style={{ fontSize: 10, color: INK_FADE, fontStyle: "italic", marginBottom: 4, fontFamily: "Georgia, serif" }}>Provider ID: {p.provider_id}</div>}

      {/* Contact row */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 14px", marginBottom: 6 }}>
        {p.phone && (
          <a href={`tel:${p.phone}`} onClick={e => e.stopPropagation()} style={{ textDecoration: "none", color: INK, fontSize: 12, fontFamily: "'Times New Roman', serif", display: "flex", alignItems: "center", gap: 3 }}>
            <span style={{ fontSize: 13 }}>📞</span> {p.phone}
          </a>
        )}
        {p.email && (
          <a href={`mailto:${p.email}`} onClick={e => e.stopPropagation()} style={{ textDecoration: "none", color: BROWN_BTN, fontSize: 12, fontFamily: "'Times New Roman', serif", display: "flex", alignItems: "center", gap: 3, wordBreak: "break-all" }}>
            <span style={{ fontSize: 11 }}>✉</span> {p.email}
          </a>
        )}
        {p.website && (
          <a href={p.website.startsWith("http") ? p.website : `https://${p.website}`} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
            style={{ textDecoration: "none", color: "#0077B6", fontSize: 12, fontFamily: "'Times New Roman', serif", display: "flex", alignItems: "center", gap: 3, wordBreak: "break-all" }}>
            <span style={{ fontSize: 11 }}>🌐</span> {p.website.replace(/^https?:\/\//, "")}
          </a>
        )}
      </div>

      {/* Rating display — V-Hub villager rating preferred, falls back to Google rating */}
      <ProviderRatingBadge providerId={p.id} googleRating={p.rating} />

      {/* Description */}
      {p.description && (
        <div style={{ borderLeft: `3px solid ${PAPER_DK}`, paddingLeft: 10, marginTop: 4 }}>
          <p style={{ margin: 0, fontSize: 12, color: INK_FADE, fontFamily: "Georgia, serif", lineHeight: 1.7, fontStyle: "italic" }}>{p.description}</p>
        </div>
      )}

      {/* Services chips */}
      {(p.services || []).length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 8 }}>
          {(p.services || []).slice(0, 5).map(s => {
            const svcObj = (svcs || []).find(sv => sv.id === s);
            const label = svcObj ? svcObj.name : null;
            if (!label) return null;
            return <span key={s} style={{ background: PAPER_MID, border: `1px solid ${PAPER_DK}`, borderRadius: 3, padding: "1px 7px", fontSize: 10, color: INK, fontFamily: "Georgia, serif" }}>{label}</span>;
          })}
          {(p.services || []).length > 5 && <span style={{ fontSize: 10, color: INK_FADE, fontStyle: "italic", alignSelf: "center" }}>+{(p.services || []).length - 5} more</span>}
        </div>
      )}

      {/* Footer: years / license */}
      {(p.years_in_business || p.license_number) && (
        <div style={{ marginTop: 10, display: "flex", gap: 14, flexWrap: "wrap" }}>
          {p.years_in_business && <span style={{ fontSize: 10, color: INK_FADE, fontStyle: "italic", fontFamily: "'Times New Roman', serif" }}>Est. {new Date().getFullYear() - Math.round(p.years_in_business)} · {p.years_in_business} yrs in business</span>}
          {p.license_number && <span style={{ fontSize: 10, color: INK_FADE, fontStyle: "italic", fontFamily: "'Times New Roman', serif" }}>Lic# {p.license_number}</span>}
        </div>
      )}
    </div>
  );
}

function Results({ results, areas, cats, svcs, onReset, onSel, selArea, selCatId }) {
  const areaName = selArea ? selArea.name.split("—").pop()?.trim() || selArea.name : "All Villages";
  const svcName  = selCatId ? selCatId.name : "All Services";

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap" rel="stylesheet" />
      <div style={{
        minHeight: "100vh",
        background: PAPER,
        backgroundImage: `repeating-linear-gradient(0deg,transparent,transparent 27px,rgba(28,15,0,0.04) 27px,rgba(28,15,0,0.04) 28px)`,
        fontFamily: "'Times New Roman', serif",
        maxWidth: 860,
        margin: "0 auto",
        boxShadow: "0 2px 40px rgba(0,0,0,0.28)",
      }}>

        {/* ── MASTHEAD ── */}
        <div style={{ background: PAPER, padding: "12px 16px 8px", borderBottom: `3px double ${INK}` }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <button onClick={onReset} style={{ background: "none", border: `1px solid ${INK}`, color: INK, borderRadius: 3, padding: "4px 12px", fontSize: 11, cursor: "pointer", fontFamily: "'Times New Roman', serif", letterSpacing: 1 }}>
              ← Back
            </button>
            <span style={{ fontSize: 38, fontWeight: 900, color: INK, fontFamily: "'Times New Roman', serif", letterSpacing: -1, lineHeight: 1 }}>
              <span style={{ fontStyle: "italic", fontWeight: 700, fontFamily: "'Great Vibes', cursive", fontSize: "1.35em", color: BROWN_BTN, WebkitTextStroke: "0.6px " + BROWN_BTN, textShadow: `0.5px 0.5px 0 ${BROWN_BTN}` }}>V</span>
              <span>-Hub</span>
            </span>
            <span style={{ fontSize: 11, color: INK_FADE, fontStyle: "italic", minWidth: 60, textAlign: "right" }}>
              {results.length} listed
            </span>
          </div>
        </div>

        {/* ── SECTION HEADER — classified ad style ── */}
        <div style={{ background: INK, padding: "8px 16px", textAlign: "center" }}>
          <div style={{ color: PAPER, fontSize: 10, letterSpacing: 3, textTransform: "uppercase", fontWeight: 400, fontFamily: "'Times New Roman', serif" }}>Classified Directory</div>
          <div style={{ color: YELLOW, fontSize: 16, fontWeight: 900, letterSpacing: 1, fontFamily: "'Times New Roman', serif", marginTop: 2 }}>
            {svcName}
          </div>
          <div style={{ color: PAPER_DK, fontSize: 10, fontStyle: "italic", marginTop: 2, fontFamily: "'Times New Roman', serif" }}>
            Serving: {areaName}
          </div>
        </div>

        {/* ── RULE ── */}
        <div style={{ height: 3, background: `repeating-linear-gradient(90deg,${INK} 0,${INK} 8px,transparent 8px,transparent 12px)` }} />

        {/* ── ADS ── */}
        <div style={{ padding: "4px 16px 24px" }}>
          {results.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 20px" }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>🔍</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: INK, fontFamily: "'Times New Roman', serif", marginBottom: 6 }}>No providers found for this search</div>
              <div style={{ fontSize: 13, color: INK_FADE, fontStyle: "italic", marginBottom: 14 }}>Try selecting a different village, a broader service category, or clear your filters and search again.</div>
              <div style={{ fontSize: 12, color: INK_FADE }}>Know a local provider who should be listed? Have them visit <a href="/ListService" style={{ color: BROWN_BTN, fontWeight: 700 }}>List Your Service</a>.</div>
            </div>
          ) : results.map((p, i) => <ClassifiedAd key={p.id || i} p={p} onSel={onSel} svcs={svcs} />)}
        </div>

        {/* ── FOOTER ── */}
        <div style={{ borderTop: `2px solid ${INK}`, padding: "10px 16px", textAlign: "center", fontSize: 10, color: INK_FADE, fontStyle: "italic" }}>
          © 2026 V-Hub · The Villages, Florida · <a href="/Terms" style={{ color: INK_FADE }}>Terms</a> · <a href="/Privacy" style={{ color: INK_FADE }}>Privacy</a>
        </div>

      </div>
    </>
  );
}

// ── Dropdown Button ───────────────────────────────────────────────────────────
function DropBtn({ label, isOpen, onClick }) {
  const isPlaceholder = label === "Select a Service..." || label === "Select a Village...";
  return (
    <button onClick={onClick} style={{
      width: "100%", background: PAPER,
      border: "3px solid #1A6B3C",
      boxShadow: "0 0 0 1.5px #1A6B3C, 0 0 10px 2px rgba(26,107,60,0.3)",
      borderRadius: 5, padding: "10px 12px", fontSize: 13,
      fontFamily: "'Times New Roman', serif",
      color: isPlaceholder ? INK_FADE : INK,
      fontWeight: isPlaceholder ? 400 : 700,
      cursor: "pointer", display: "flex", justifyContent: "space-between",
      alignItems: "center", textAlign: "left", boxSizing: "border-box",
      WebkitTapHighlightColor: "transparent",
    }}>
      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "85%" }}>{label}</span>
      <span style={{ fontSize: 10, flexShrink: 0, marginLeft: 4 }}>{isOpen ? "▲" : "▼"}</span>
    </button>
  );
}

// ── Service Dropdown ─────────────────────────────────────────────────────────
function SvcDropdown({ open, cats, svcs, openCat, selSvc, setOpenCat, setSelSvc, setSOpen }) {
  const scrollRef = React.useRef(null);
  React.useEffect(() => {
    if (open && scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [open]);
  if (!open) return null;

  // Sort categories A-Z
  const sortedCats = [...cats].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div
      ref={scrollRef}
      onClick={e => e.stopPropagation()}
      style={{
        position: "absolute", top: "calc(100% + 2px)", left: 0, right: 0,
        background: PAPER, border: `2px solid ${INK}`, borderRadius: 4,
        zIndex: 9999, boxShadow: "0 8px 28px rgba(0,0,0,0.4)",
        maxHeight: 600, overflowY: "auto", overflowX: "hidden",
        WebkitOverflowScrolling: "touch",
      }}
    >
      {cats.length === 0 && (
        <div style={{ padding: 12, fontSize: 13, color: INK_FADE, fontFamily: "'Times New Roman', serif" }}>Loading...</div>
      )}
      {sortedCats.map(c => {
        const catSvcs = [...svcs.filter(s => s.category_id === c.id)].sort((a, b) => a.name.localeCompare(b.name));
        const isExpanded = openCat === c.id;
        const isSelected = selSvc?.category_id === c.id || selSvc?.id === c.id;
        return (
          <div key={c.id} style={{ overflowX: "hidden" }}>
            {/* Macro row — tap to expand/collapse micros */}
            <div
              onClick={e => { e.stopPropagation(); setOpenCat(isExpanded ? null : c.id); }}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "11px 14px",
                borderBottom: `1px solid ${PAPER_DK}`,
                background: isSelected ? "#e8f5ee" : PAPER,
                cursor: "pointer",
                userSelect: "none",
              }}
            >
              <span style={{
                fontSize: 13, fontWeight: 700, color: INK,
                fontFamily: "'Times New Roman', serif",
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "88%",
              }}>
                {c.icon} {c.name}
              </span>
              <span style={{ fontSize: 10, color: INK_FADE, flexShrink: 0 }}>
                {isExpanded ? "▲" : "▼"}
              </span>
            </div>
            {/* Micro rows — only shown when expanded */}
            {isExpanded && catSvcs.map(s => {
              const isSvcSelected = selSvc?.id === s.id;
              return (
                <div
                  key={s.id}
                  onClick={e => { e.stopPropagation(); setSelSvc(s); setSOpen(false); setOpenCat(null); }}
                  style={{
                    padding: "10px 14px 10px 28px",
                    fontSize: 13,
                    fontFamily: "'Times New Roman', serif",
                    color: isSvcSelected ? "#fff" : INK,
                    background: isSvcSelected ? BROWN_HL : PAPER_MID,
                    borderBottom: `1px solid ${PAPER_DK}`,
                    cursor: "pointer",
                    fontWeight: isSvcSelected ? 700 : 400,
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  }}
                >
                  {isSvcSelected ? "✓ " : "– "}{s.name}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

// ── Village Dropdown (opens ABOVE, scrolls to top on open) ──────────────────
function VilDropdown({ open, areas, selArea, setSelArea, setVOpen }) {
  const scrollRef = React.useRef(null);
  React.useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [open]);
  if (!open) return null;
  const sorted = [...areas].sort((a, b) => a.name.localeCompare(b.name));
  return (
    <div ref={scrollRef} onClick={e => e.stopPropagation()} style={{
      position: "absolute", top: "calc(100% + 2px)", left: 0, right: 0,
      background: PAPER, border: `2px solid ${INK}`, borderRadius: 4,
      zIndex: 9999, boxShadow: "0 8px 28px rgba(0,0,0,0.4)",
      maxHeight: 380, overflowY: "auto",
    }}>
      {sorted.map(v => (
        <div key={v.id}
          onClick={e => { e.stopPropagation(); setSelArea(v); setVOpen(false); }}
          style={{
            padding: "12px 16px", fontSize: 16, lineHeight: 1.4,
            color: selArea?.id === v.id ? "#fff" : INK,
            background: selArea?.id === v.id ? BROWN_HL : PAPER,
            borderBottom: `1px solid ${PAPER_DK}`,
            cursor: "pointer",
            fontFamily: "'Times New Roman', serif",
            fontWeight: selArea?.id === v.id ? 700 : 400,
          }}>
          {v.name}
        </div>
      ))}
    </div>
  );
}

// ── Search Box ────────────────────────────────────────────────────────────────
function SearchBox({ cats, svcs, areas, onSearch, selSvc, setSelSvc, selArea, setSelArea }) {
  const [sOpen,   setSOpen]   = useState(false);
  const [vOpen,   setVOpen]   = useState(false);
  const [openCat, setOpenCat] = useState(null);

  const closeAll = () => { setSOpen(false); setVOpen(false); setOpenCat(null); };

  const svcLabel = selSvc ? (selSvc._isCat ? `${selSvc.icon || ""} ${selSvc.name}` : selSvc.name) : "Select a Service...";

  return (
    <div style={{ background: PAPER_MID, border: `2px solid ${PAPER_DK}`, borderRadius: 6, padding: "14px 12px", width: "100%", boxSizing: "border-box" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 5 }}>
        <div style={{ flex: 1, fontSize: 11, fontWeight: 700, color: INK, fontFamily: "'Times New Roman', serif" }}>What service do you need?</div>
        <div style={{ flex: 1, fontSize: 11, fontWeight: 700, color: INK, fontFamily: "'Times New Roman', serif" }}>Where do you need it?</div>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <div style={{ flex: 1, minWidth: 0, position: "relative" }}>
          <DropBtn label={svcLabel} isOpen={sOpen} onClick={e => { e.stopPropagation(); if (sOpen) { setSOpen(false); setOpenCat(null); } else { setSOpen(true); setVOpen(false); } }} />
          <SvcDropdown open={sOpen} cats={cats} svcs={svcs} openCat={openCat} selSvc={selSvc} setOpenCat={setOpenCat} setSelSvc={s => { setSelSvc(s); setSOpen(false); }} setSOpen={setSOpen} />
        </div>
        <div style={{ flex: 1, minWidth: 0, position: "relative" }}>
          <DropBtn label={selArea ? selArea.name : "Select a Village..."} isOpen={vOpen} onClick={e => { e.stopPropagation(); if (vOpen) { setVOpen(false); } else { setVOpen(true); setSOpen(false); setOpenCat(null); } }} />
          <VilDropdown open={vOpen} areas={areas} selArea={selArea} setSelArea={a => { setSelArea(a); setVOpen(false); }} setVOpen={setVOpen} />
        </div>
      </div>
      {(() => {
        const bothSelected = !!(selSvc && selArea);
        return (
          <button onClick={e => { e.stopPropagation(); onSearch(selSvc, selArea); }} style={{
            width: "100%",
            background: bothSelected ? "linear-gradient(180deg,#1A6B3C,#145530)" : `linear-gradient(180deg,#9A6030,${BROWN_BTN} 60%,#5A3010)`,
            border: bothSelected ? "3px solid #1A6B3C" : `3px solid ${YELLOW}`,
            boxShadow: bothSelected ? "0 0 0 1.5px #1A6B3C, 0 0 12px 3px rgba(26,107,60,0.4)" : `0 0 0 1.5px ${YELLOW}, 0 0 10px 2px rgba(255,220,0,0.35)`,
            borderRadius: 5, color: "#F5E8CC", fontFamily: "'Times New Roman', serif",
            fontWeight: 700, fontSize: 14, letterSpacing: 3, padding: "13px", cursor: "pointer", boxSizing: "border-box",
            marginTop: 10, transition: "all 0.2s ease",
          }}>
            {bothSelected ? "✓ FIND SERVICES" : "FIND SERVICES"}
          </button>
        );
      })()}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Home() {
  const [areas,    setAreas]    = useState([]);
  const [cats,     setCats]     = useState([]);
  const [svcs,     setSvcs]     = useState([]);
  const [results,  setResults]  = useState([]);
  const [searched, setSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selProv,  setSelProv]  = useState(null);
  const [selAreaR, setSelAreaR] = useState(null);
  const [selCatR,  setSelCatR]  = useState(null);
  const [selSvc,   setSelSvc]   = useState(null);
  const [selArea,  setSelArea]  = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // Hardcoded categories & services (no auth needed on homepage)
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
    { id: "69d1822df3b2afb229b5badf", category_id: "69d09c14d5ee9e7be9aa301b", name: "Home Watch" },
    { id: "69d1822df3b2afb229b5bade", category_id: "69d181fe57b60e0aecf4067d", name: "Handyman Services" },
    { id: "69d1822df3b2afb229b5badf", category_id: "69d181fe57b60e0aecf4067d", name: "Security & Home Watch" },
    { id: "69d1822df3b2afb229b5bae0", category_id: "69d181fe57b60e0aecf4067d", name: "Pest Control" },
    { id: "69d1822df3b2afb229b5bae1", category_id: "69d181fe57b60e0aecf4067d", name: "Appliance Repair" },
    { id: "69d1822df3b2afb229b5bae2", category_id: "69d181fe57b60e0aecf4067d", name: "Electrical & Lighting" },
    { id: "69d1822df3b2afb229b5bae3", category_id: "69d181fe57b60e0aecf4067d", name: "Flooring (Tile, Wood, Carpet)" },
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
    { id: "69d1822df3b2afb229b5baee", category_id: "69d09c14d5ee9e7be9aa301c", name: "Pressure Washing" },
    { id: "69d1822df3b2afb229b5baef", category_id: "69d09c14d5ee9e7be9aa301c", name: "Driveway Repair/Cleaning/Painting" },
    { id: "69d1822df3b2afb229b5bae6", category_id: "69d09c14d5ee9e7be9aa301c", name: "Pool & Spa Services" },
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
    { id: "69d1822df3b2afb229b5bb03", category_id: "69d09c14d5ee9e7be9aa3020", name: "Veterinary Services" },
    { id: "69d1822df3b2afb229b5bb04", category_id: "69d09c14d5ee9e7be9aa3020", name: "Grooming" },
    { id: "69d1822df3b2afb229b5bb05", category_id: "69d09c14d5ee9e7be9aa3020", name: "Pet Sitting/Walking" },
    { id: "69d1822df3b2afb229b5bb06", category_id: "69d09c14d5ee9e7be9aa3020", name: "Pet Training" },
    { id: "69d1822df3b2afb229b5bb07", category_id: "69d09c14d5ee9e7be9aa3020", name: "Mobile Grooming" },
    { id: "69d1822df3b2afb229b5bb08", category_id: "69d09c14d5ee9e7be9aa3021", name: "Medical Transport" },
    { id: "69d1822df3b2afb229b5bb09", category_id: "69d09c14d5ee9e7be9aa3021", name: "Airport Transport" },
    { id: "69d1822df3b2afb229b5bb0a", category_id: "69d09c14d5ee9e7be9aa3021", name: "Local Rides" },
    { id: "69d1822df3b2afb229b5bb0b", category_id: "69d09c14d5ee9e7be9aa3021", name: "Errand Services" },
    { id: "69d1822df3b2afb229b5bb0c", category_id: "69d09c14d5ee9e7be9aa3021", name: "Courier/Delivery Services" },
    { id: "69d1822df3b2afb229b5bb0a", category_id: "69d09c14d5ee9e7be9aa3021", name: "Vehicle Transport" },
    { id: "69d1822df3b2afb229b5bb0d", category_id: "69d181fe57b60e0aecf4067e", name: "Accounting & Bookkeeping" },
    { id: "69d1822df3b2afb229b5bb0e", category_id: "69d181fe57b60e0aecf4067e", name: "Notary Services" },
    { id: "69d1822df3b2afb229b5bb0f", category_id: "69d181fe57b60e0aecf4067e", name: "IT Support" },
    { id: "69d1822df3b2afb229b5bb10", category_id: "69d181fe57b60e0aecf4067e", name: "Legal Services" },
    { id: "69d1822df3b2afb229b5bb11", category_id: "69d181fe57b60e0aecf4067e", name: "Business Consulting" },
    { id: "69d1822df3b2afb229b5bb12", category_id: "69d181fe57b60e0aecf4067e", name: "Tax Preparation" },
  ];

  useEffect(() => {
    // Load current user for admin check
    User.me().then(u => setCurrentUser(u)).catch(() => setCurrentUser(null));
    setCats(CATS_STATIC);
    setSvcs(SVCS_STATIC);
    // Village list using REAL entity IDs — matches provider service_areas exactly
    const VILLAGE_DATA = [
      { id: "69e9a307d1bc6cfe7247eac2", name: "Alden Bungalows" },
      { id: "69e9a307d1bc6cfe7247eaa1", name: "Amelia" },
      { id: "69e9a307d1bc6cfe7247eac3", name: "Antrim Dells" },
      { id: "69e9a307d1bc6cfe7247eaa2", name: "Ashland" },
      { id: "69e9a307d1bc6cfe7247eaa3", name: "Belvedere" },
      { id: "69e9a307d1bc6cfe7247eaa4", name: "Bonita" },
      { id: "69e9a307d1bc6cfe7247eaa5", name: "Bonnybrook" },
      { id: "69e9a307d1bc6cfe7247ea92", name: "Briar Meadow" },
      { id: "69e9a307d1bc6cfe7247eaa6", name: "Bridgeport at Creekside Landing" },
      { id: "69e9a307d1bc6cfe7247eaa7", name: "Bridgeport at Lake Miona" },
      { id: "69e9a307d1bc6cfe7247eaa8", name: "Bridgeport at Lake Shore Cottages" },
      { id: "69e9a307d1bc6cfe7247eaa9", name: "Bridgeport at Lake Sumter" },
      { id: "69e047e27ddcca3eaa81600e", name: "Bridgeport at Laurel Valley" },
      { id: "69e9a307d1bc6cfe7247eaaa", name: "Bridgeport at Miona Shores" },
      { id: "69e047e27ddcca3eaa81600f", name: "Bridgeport at Mission Hills" },
      { id: "69e9a307d1bc6cfe7247eaab", name: "Buttonwood" },
      { id: "69e9a307d1bc6cfe7247eaac", name: "Cabanas at Creekside Landing" },
      { id: "69e9a307d1bc6cfe7247eaad", name: "Caroline" },
      { id: "69e047e27ddcca3eaa816010", name: "Charlotte" },
      { id: "69e047e27ddcca3eaa816011", name: "Collier" },
      { id: "69e9a307d1bc6cfe7247ea93", name: "De Allende" },
      { id: "69e9a307d1bc6cfe7247ea94", name: "De La Vista" },
      { id: "69e047e27ddcca3eaa816012", name: "Dunedin" },
      { id: "69e9a307d1bc6cfe7247eaae", name: "Duval" },
      { id: "69d06c4a4f1e1017a77a701b", name: "Eastport (All)" },
      { id: "69d06c4a4f1e1017a77a7019", name: "Established Villages (All)" },
      { id: "69d06c4a4f1e1017a77a701c", name: "Family / Non-Age-Restricted (All)" },
      { id: "69e047e27ddcca3eaa816013", name: "Fernandina" },
      { id: "69e047e27ddcca3eaa816014", name: "Gilchrist" },
      { id: "69e9a307d1bc6cfe7247eab0", name: "Haciendas of Mission Hills" },
      { id: "69e9a307d1bc6cfe7247eaaf", name: "Hadley" },
      { id: "69e9a307d1bc6cfe7247eab1", name: "Hemingway" },
      { id: "69e047e27ddcca3eaa816015", name: "Hillsborough" },
      { id: "69d06c4a4f1e1017a77a7018", name: "Historic Side (All)" },
      { id: "69e047e27ddcca3eaa816016", name: "LaBelle" },
      { id: "69e9a307d1bc6cfe7247eab2", name: "Lago Vista" },
      { id: "69e047e27ddcca3eaa816017", name: "Lake Deaton" },
      { id: "69e9a307d1bc6cfe7247eab3", name: "Lakeshore Cottages" },
      { id: "69e9a307d1bc6cfe7247eab4", name: "Largo" },
      { id: "69e9a307d1bc6cfe7247eab5", name: "Liberty Park" },
      { id: "69e9a307d1bc6cfe7247eab6", name: "Lynnhaven" },
      { id: "69e9a307d1bc6cfe7247eab7", name: "Mallory Square" },
      { id: "69d06c4a4f1e1017a77a701a", name: "Newer Villages (All)" },
      { id: "69e9a307d1bc6cfe7247eac5", name: "Oak Hollow" },
      { id: "69e047e27ddcca3eaa816018", name: "Osceola Hills" },
      { id: "69e9a307d1bc6cfe7247eac4", name: "Osceola Hills at Soaring Eagle Preserve" },
      { id: "69e9a307d1bc6cfe7247ea95", name: "Palo Alto" },
      { id: "69e9a307d1bc6cfe7247eab8", name: "Pennecamp" },
      { id: "69e91929e9a419d0ed14129e", name: "Piedmont" },
      { id: "69e9a307d1bc6cfe7247ea96", name: "Pine Hills" },
      { id: "69e9a307d1bc6cfe7247ea97", name: "Pine Ridge" },
      { id: "69e047e27ddcca3eaa816019", name: "Pinellas" },
      { id: "69e9a307d1bc6cfe7247eab9", name: "Poinciana" },
      { id: "69e9a307d1bc6cfe7247ea98", name: "Polo Ridge" },
      { id: "69e9a307d1bc6cfe7247ea99", name: "Rio Grande" },
      { id: "69e9a307d1bc6cfe7247ea9a", name: "Rio Ponderosa" },
      { id: "69e9a307d1bc6cfe7247ea9b", name: "Rio Ranchero" },
      { id: "69e9a307d1bc6cfe7247eaba", name: "Sabal Chase" },
      { id: "69e047e27ddcca3eaa81601a", name: "Sanibel" },
      { id: "69e9a307d1bc6cfe7247ea9c", name: "Santo Domingo" },
      { id: "69e9a307d1bc6cfe7247ea9d", name: "Springdale" },
      { id: "69e9a307d1bc6cfe7247eabb", name: "St. Charles" },
      { id: "69e9a307d1bc6cfe7247eabc", name: "St. James" },
      { id: "69e9a307d1bc6cfe7247ea9e", name: "Summerhill" },
      { id: "69e9a307d1bc6cfe7247eabd", name: "Sunset Pointe" },
      { id: "69e9a307d1bc6cfe7247eabe", name: "Tall Trees" },
      { id: "69e9a307d1bc6cfe7247eabf", name: "Tamarind Grove" },
      { id: "69e9a307d1bc6cfe7247ea9f", name: "Tierra Del Sol" },
      { id: "69e9a307d1bc6cfe7247eac0", name: "Virginia Trace" },
      { id: "69e9a307d1bc6cfe7247eac6", name: "Waters Edge" },
      { id: "69e9a307d1bc6cfe7247eac7", name: "Well Point" },
      { id: "69e9a307d1bc6cfe7247eac1", name: "Winifred" },
      { id: "69e9a307d1bc6cfe7247eaa0", name: "Woodbury" },
    ];
            setAreas(VILLAGE_DATA);
  }, []);


  const doSearch = async (selSvc, selArea) => {
    setSelAreaR(selArea);
    setSelCatR(selSvc);
    setIsLoading(true);
    setSearched(false);
    let all = [];
    let ENTITY_AREA_MAP = {}; // real ServiceArea entity ID -> village name
    let ENTITY_SVC_MAP = {};   // real Service entity ID -> service name
    let svcEntities = [];

    // ── Step 1: Fetch providers via backend (service role — works on public page) ──
    try {
      const resp = await fetch("https://api.base44.app/api/apps/69d062aca815ce8e697894b1/functions/getProviders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "list_all" }),
      });
      if (resp.ok) {
        const data = await resp.json();
        all = Array.isArray(data) ? data : (data.providers || []);
      }
    } catch(e) { all = []; }
    // Fallback: try entity SDK if backend failed
    if (all.length === 0) {
      try {
        const PAGE_SIZE = 100;
        let skip = 0;
        let page = [];
        do {
          page = await Provider.list({ limit: PAGE_SIZE, skip }).catch(() => []);
          all = all.concat(page || []);
          skip += PAGE_SIZE;
        } while (page && page.length === PAGE_SIZE);
      } catch(e) { all = []; }
    }

    // ── Step 2: Try to enrich with entity names (optional, auth may fail on public page) ──
    try {
      const [areaEntities, svcEntitiesRaw] = await Promise.all([
        ServiceArea.list().catch(() => []),
        Service.list().catch(() => []),
      ]);
      svcEntities = svcEntitiesRaw || [];
      (areaEntities || []).forEach(a => {
        if (a.id && a.name) {
          const plainName = a.name.split('—').pop()?.trim() || a.name;
          ENTITY_AREA_MAP[a.id] = plainName.toLowerCase();
        }
      });
      svcEntities.forEach(s => {
        if (s.id && s.name) ENTITY_SVC_MAP[s.id] = s.name;
      });
    } catch(e) { /* enrichment failed — static maps cover this */ }

    // ── Legacy ID lookup maps ──────────────────────────────────────────────
    const LEGACY_VA = {"va001":"Alhambra","va002":"Amelia","va003":"Ashland","va004":"Belle Aire","va005":"Belvedere","va006":"Bonita","va007":"Bonnybrook","va008":"Bradford","va009":"Briar Meadow","va010":"Bridgeport at Creekside Landing","va011":"Bridgeport at Lake Miona","va012":"Bridgeport at Lake Sumter","va013":"Bridgeport at Laurel Valley","va014":"Bridgeport at Miona Shores","va015":"Bridgeport at Mission Hills","va016":"Buttonwood","va017":"Calumet Grove","va018":"Caroline","va019":"Cason Hammock","va020":"Charlotte","va021":"Chatham","va022":"Chitty Chatty","va023":"Citrus Grove","va024":"Collier","va025":"Collier at Alden Bungalows","va026":"Collier at Antrim Dells","va027":"Country Club Hills","va028":"Dabney","va029":"De Allende","va030":"De La Vista","va031":"Del Mar","va032":"DeLuna","va033":"DeSoto","va034":"Dunedin","va035":"Duval","va036":"El Cortez","va037":"Fenney","va038":"Fernandina","va039":"Gilchrist","va040":"Glenbrook","va041":"Hacienda","va042":"Haciendas of Mission Hills","va043":"Hadley","va044":"Hammock at Fenney","va045":"Hawkins","va046":"Hemingway","va047":"Hillsborough","va048":"La Reynalda","va049":"La Zamora","va050":"LaBelle","va051":"Lake Deaton","va052":"Lake Denham","va053":"Lakeshore Cottages","va054":"Largo","va055":"Liberty Park","va056":"Linden","va057":"Lynnhaven","va058":"Mallory Square","va059":"Marsh Bend","va060":"McClure","va061":"Mira Mesa","va062":"Monarch Grove","va063":"Newell","va064":"Orange Blossom Gardens","va065":"Osceola Hills","va066":"Osceola Hills at Soaring Eagle Preserve","va067":"Palo Alto","va068":"Pennecamp","va069":"Piedmont","va070":"Pine Hills","va071":"Pine Ridge","va072":"Pinellas","va073":"Poinciana","va074":"Polo Ridge","va075":"Richmond","va076":"Rio Grande","va077":"Rio Ponderosa","va078":"Rio Ranchero","va079":"Sabal Chase","va080":"Sanibel","va081":"Santiago","va082":"Santo Domingo","va083":"Silver Lake","va084":"Springdale","va085":"St. Catherine","va086":"St. Charles","va087":"St. James","va088":"St. Johns","va089":"Summerhill","va090":"Sunset Pointe","va091":"Tall Trees","va092":"Tamarind Grove","va093":"Tierra Del Sol","va094":"Valle Verde","va095":"Virginia Trace","va096":"Winifred","va097":"Woodbury","va098":"Bison Valley","va099":"Country Club","va100":"Middleton","va101":"Moultrie Creek","va102":"Oak Meadows","va103":"Orange Blossom","va104":"Oxford Oaks","va105":"Shady Brook","va106":"Spring Arbor"};
    const LEGACY_SVC_MAP = {"s01":"Home Improvements","s02":"General Repairs","s03":"Cleaning Services","s04":"Painting (Interior/Exterior)","s05":"Garage Door Services","s06":"Window Installation/Repair","s07":"HVAC","s08":"Plumbing","s09":"Roofing","s10":"Handyman Services","s11":"Security & Home Watch","s12":"Pest Control","s13":"Appliance Repair","s14":"Electrical & Lighting","s15":"Flooring (Tile, Wood, Carpet)","s16":"Home Organization","s17":"Smart Home Installation","s18":"Pool & Spa Services","s19":"Lawn Mowing","s20":"Sod Installation","s21":"Tree Trimming & Pruning/Removal","s22":"Lawn Fertilization","s23":"Irrigation/Sprinkler Services","s24":"Landscaping","s25":"Hardscaping","s26":"Pressure Washing","s27":"Driveway Repair/Cleaning/Painting","s28":"Rentals","s29":"Repairs","s30":"Detailing","s31":"Lighting Upgrades","s32":"Improvements/Customizations","s33":"Battery Replacement","s34":"Tire Services","s35":"Auto Repairs","s36":"Auto Detailing","s37":"Oil Changes","s38":"Tire Services","s39":"Mobile Mechanic","s40":"Barber / Stylist","s41":"Nail Technicians","s42":"Spa Services","s43":"Home Health Aides","s44":"Massage Therapists","s45":"Personal Trainers","s46":"Makeup Artists","s47":"Veterinary Services","s48":"Grooming","s49":"Pet Sitting/Walking","s50":"Pet Training","s51":"Mobile Grooming","s52":"Medical Transport","s53":"Airport Transport","s54":"Local Rides","s55":"Errand Services","s56":"Courier/Delivery Services","s57":"Accounting & Bookkeeping","s58":"Notary Services","s59":"IT Support","s60":"Legal Services","s61":"Business Consulting","s62":"Tax Preparation","s63":"Home Watch","s64":"Pool & Spa Services","s65":"Vehicle Transport"};
    // Macro entity ID → group name (for old test providers)
    const MACRO_AREA = {"69d06c4a4f1e1017a77a7018":"historic","69d06c4a4f1e1017a77a7019":"established","69d06c4a4f1e1017a77a701a":"newer","69d06c4a4f1e1017a77a701b":"eastport","69d06c4a4f1e1017a77a701c":"family"};

    // HARDCODED entity ID → plain village name (never depends on runtime fetch)
    // This is the source of truth — baked from the ServiceArea DB records
    const STATIC_ENTITY_AREA_MAP = {
      // OLD IDs (legacy support)
      "69d06c54c9c22e67aed3c0ff":"alhambra","69d06c54c9c22e67aed3c100":"country club",
      "69d06c54c9c22e67aed3c101":"del mar","69d06c54c9c22e67aed3c102":"el cortez",
      "69d06c54c9c22e67aed3c103":"hacienda","69d06c54c9c22e67aed3c104":"la reynalda",
      "69d06c54c9c22e67aed3c105":"la zamora","69d06c54c9c22e67aed3c106":"mira mesa",
      "69d06c54c9c22e67aed3c107":"orange blossom","69d06c54c9c22e67aed3c108":"silver lake",
      "69d06c54c9c22e67aed3c109":"spring arbor","69d06c54c9c22e67aed3c10a":"valle verde",
      "69d06c54c9c22e67aed3c10b":"ashland","69d06c54c9c22e67aed3c10c":"belle aire",
      "69d06c54c9c22e67aed3c10d":"belvedere","69d06c54c9c22e67aed3c10e":"bonita",
      "69d06c54c9c22e67aed3c10f":"bonnybrook","69d06c54c9c22e67aed3c110":"calumet grove",
      "69d06c54c9c22e67aed3c111":"caroline","69d06c54c9c22e67aed3c112":"chatham",
      "69d06c54c9c22e67aed3c113":"duval","69d06c54c9c22e67aed3c114":"glenbrook",
      "69d06c54c9c22e67aed3c115":"hadley","69d06c54c9c22e67aed3c116":"hemingway",
      "69d06c54c9c22e67aed3c117":"lynnhaven","69d06c54c9c22e67aed3c118":"mallory square",
      "69d06c54c9c22e67aed3c119":"pennecamp","69d06c54c9c22e67aed3c11a":"poinciana",
      "69d06c54c9c22e67aed3c11b":"sabal chase","69d06c54c9c22e67aed3c11c":"santiago",
      "69d06c54c9c22e67aed3c11d":"sunset pointe","69d06c54c9c22e67aed3c11e":"tall trees",
      "69d06c54c9c22e67aed3c11f":"virginia trace","69d06c54c9c22e67aed3c120":"winifred",
      "69d06c54c9c22e67aed3c121":"bradford","69d06c54c9c22e67aed3c122":"cason hammock",
      "69d06c54c9c22e67aed3c123":"chitty chatty","69d06c54c9c22e67aed3c124":"citrus grove",
      "69d06c54c9c22e67aed3c125":"deluna","69d06c54c9c22e67aed3c126":"desoto",
      "69d06c54c9c22e67aed3c127":"fenney","69d06c54c9c22e67aed3c128":"hammock at fenney",
      "69d06c54c9c22e67aed3c129":"hawkins","69d06c54c9c22e67aed3c12a":"linden",
      "69d06c54c9c22e67aed3c12b":"marsh bend","69d06c54c9c22e67aed3c12c":"mcclure",
      "69d06c54c9c22e67aed3c12d":"monarch grove","69d06c54c9c22e67aed3c12e":"richmond",
      "69d06c54c9c22e67aed3c12f":"st. catherine","69d06c54c9c22e67aed3c130":"st. johns",
      "69d06c54c9c22e67aed3c131":"moultrie creek","69d06c54c9c22e67aed3c132":"newell",
      "69d06c54c9c22e67aed3c133":"lake denham","69d06c54c9c22e67aed3c134":"dabney",
      "69d06c54c9c22e67aed3c135":"shady brook","69d06c54c9c22e67aed3c136":"bison valley",
      "69d06c54c9c22e67aed3c137":"oak meadows","69d06c54c9c22e67aed3c138":"oxford oaks",
      "69d06c54c9c22e67aed3c139":"middleton",
      // NEW IDs (current production ServiceArea entity IDs)
      "69e9a307d1bc6cfe7247ea92":"briar meadow","69e9a307d1bc6cfe7247ea93":"de allende",
      "69e9a307d1bc6cfe7247ea94":"de la vista","69e9a307d1bc6cfe7247ea95":"palo alto",
      "69e9a307d1bc6cfe7247ea96":"pine hills","69e9a307d1bc6cfe7247ea97":"pine ridge",
      "69e9a307d1bc6cfe7247ea98":"polo ridge","69e9a307d1bc6cfe7247ea99":"rio grande",
      "69e9a307d1bc6cfe7247ea9a":"rio ponderosa","69e9a307d1bc6cfe7247ea9b":"rio ranchero",
      "69e9a307d1bc6cfe7247ea9c":"santo domingo","69e9a307d1bc6cfe7247ea9d":"springdale",
      "69e9a307d1bc6cfe7247ea9e":"summerhill","69e9a307d1bc6cfe7247ea9f":"tierra del sol",
      "69e9a307d1bc6cfe7247eaa0":"woodbury","69e9a307d1bc6cfe7247eaa1":"amelia",
      "69e9a307d1bc6cfe7247eaa2":"ashland","69e9a307d1bc6cfe7247eaa3":"belvedere",
      "69e9a307d1bc6cfe7247eaa4":"bonita","69e9a307d1bc6cfe7247eaa5":"bonnybrook",
      "69e9a307d1bc6cfe7247eaa6":"bridgeport at creekside landing","69e9a307d1bc6cfe7247eaa7":"bridgeport at lake miona",
      "69e9a307d1bc6cfe7247eaa8":"bridgeport at lake shore cottages","69e9a307d1bc6cfe7247eaa9":"bridgeport at lake sumter",
      "69e9a307d1bc6cfe7247eaaa":"bridgeport at miona shores","69e9a307d1bc6cfe7247eaab":"buttonwood",
      "69e9a307d1bc6cfe7247eaac":"cabanas at creekside landing","69e9a307d1bc6cfe7247eaad":"caroline",
      "69e9a307d1bc6cfe7247eaae":"duval","69e9a307d1bc6cfe7247eaaf":"hadley",
      "69e9a307d1bc6cfe7247eab0":"haciendas of mission hills","69e9a307d1bc6cfe7247eab1":"hemingway",
      "69e9a307d1bc6cfe7247eab2":"lago vista","69e9a307d1bc6cfe7247eab3":"lakeshore cottages",
      "69e9a307d1bc6cfe7247eab4":"largo","69e9a307d1bc6cfe7247eab5":"liberty park",
      "69e9a307d1bc6cfe7247eab6":"lynnhaven","69e9a307d1bc6cfe7247eab7":"mallory square",
      "69e9a307d1bc6cfe7247eab8":"pennecamp","69e9a307d1bc6cfe7247eab9":"poinciana",
      "69e9a307d1bc6cfe7247eaba":"sabal chase","69e9a307d1bc6cfe7247eabb":"st. charles",
      "69e9a307d1bc6cfe7247eabc":"st. james","69e9a307d1bc6cfe7247eabd":"sunset pointe",
      "69e9a307d1bc6cfe7247eabe":"tall trees","69e9a307d1bc6cfe7247eabf":"tamarind grove",
      "69e9a307d1bc6cfe7247eac0":"virginia trace","69e9a307d1bc6cfe7247eac1":"winifred",
      "69e9a307d1bc6cfe7247eac2":"alden bungalows","69e9a307d1bc6cfe7247eac3":"antrim dells",
      "69e9a307d1bc6cfe7247eac4":"osceola hills at soaring eagle preserve","69e9a307d1bc6cfe7247eac5":"oak hollow",
      "69e9a307d1bc6cfe7247eac6":"waters edge","69e9a307d1bc6cfe7247eac7":"well point",
      "69e91929e9a419d0ed14129e":"piedmont",
      "69e047e27ddcca3eaa81600e":"bridgeport at laurel valley","69e047e27ddcca3eaa81600f":"bridgeport at mission hills",
      "69e047e27ddcca3eaa816010":"charlotte","69e047e27ddcca3eaa816011":"collier",
      "69e047e27ddcca3eaa816012":"dunedin","69e047e27ddcca3eaa816013":"fernandina",
      "69e047e27ddcca3eaa816014":"gilchrist","69e047e27ddcca3eaa816015":"hillsborough",
      "69e047e27ddcca3eaa816016":"labelle","69e047e27ddcca3eaa816017":"lake deaton",
      "69e047e27ddcca3eaa816018":"osceola hills","69e047e27ddcca3eaa816019":"pinellas",
      "69e047e27ddcca3eaa81601a":"sanibel",
      // Macro group IDs
      "69d06c4a4f1e1017a77a7018":"historic","69d06c4a4f1e1017a77a7019":"established",
      "69d06c4a4f1e1017a77a701a":"newer","69d06c4a4f1e1017a77a701b":"eastport",
      "69d06c4a4f1e1017a77a701c":"family",
    };

    // Resolve a provider area value to a lowercase name string
    const resolveAreaName = (a) => {
      const s = String(a).toLowerCase().trim();
      if (LEGACY_VA[s]) return LEGACY_VA[s].toLowerCase();
      if (MACRO_AREA[a]) return MACRO_AREA[a]; // "historic", "established", etc.
      // Use hardcoded static map FIRST (always works, no runtime dependency)
      if (STATIC_ENTITY_AREA_MAP[a]) return STATIC_ENTITY_AREA_MAP[a];
      // Fall back to runtime-fetched map if available
      if (ENTITY_AREA_MAP[a]) return ENTITY_AREA_MAP[a];
      return s; // raw value fallback
    };

    // Check if a provider area value matches the selected village name
    const areaValMatchesVillage = (aVal, villageName) => {
      const vl = villageName.toLowerCase();
      const resolved = resolveAreaName(aVal);
      if (resolved === vl) return true;
      if (resolved.includes(vl) || vl.includes(resolved)) return true;
      // For macro text codes: "historic"/"established"/"newer"/"eastport"/"family" — always show
      const macroGroups = ["historic", "established", "newer", "eastport", "family", "all", "all villages"];
      if (macroGroups.includes(resolved)) return true;
      return false;
    };

    // Build a complete s-code → category_id lookup (hardcoded, no runtime dependency)
    const SCODE_TO_CAT = {};
    SVCS_STATIC.forEach(s => { SCODE_TO_CAT[s.id] = s.category_id; });

    // Build real entity svc ID → category_id from runtime fetch (if available)
    const ENTITY_SVC_TO_CAT = {};
    (svcEntities || []).forEach(s => { if (s.id && s.category_id) ENTITY_SVC_TO_CAT[s.id] = s.category_id; });

    // Determine what category a provider belongs to — check category_id AND services
    const getProviderCatId = (p) => {
      if (p.category_id) return p.category_id;
      const svcs = Array.isArray(p.services) ? p.services : [];
      for (const sid of svcs) {
        if (SCODE_TO_CAT[sid]) return SCODE_TO_CAT[sid];
        if (ENTITY_SVC_TO_CAT[sid]) return ENTITY_SVC_TO_CAT[sid];
      }
      return null;
    };

    // ── PROVIDER_MATCH_DEBUG INSTRUMENTATION ────────────────────────────────
    const debugLog = {
      selectedVillage: selArea ? { id: selArea.id, name: selArea.name } : null,
      selectedService: selSvc  ? { id: selSvc.id,  name: selSvc.name, _isCat: selSvc._isCat } : null,
      candidateCount: all.length,
      matchedProviders: [],
      excludedProviders: [],
    };

    // Build macro-group lookup once (reused in area matching)
    const MACRO_VILLAGES_MAP = {
      "69d06c4a4f1e1017a77a7018": [
        "69e9a307d1bc6cfe7247ea92","69e9a307d1bc6cfe7247ea93","69e9a307d1bc6cfe7247ea94",
        "69e9a307d1bc6cfe7247ea95","69e9a307d1bc6cfe7247ea96","69e9a307d1bc6cfe7247ea97",
        "69e9a307d1bc6cfe7247ea98","69e9a307d1bc6cfe7247ea99","69e9a307d1bc6cfe7247ea9a",
        "69e9a307d1bc6cfe7247ea9b","69e9a307d1bc6cfe7247ea9c","69e9a307d1bc6cfe7247ea9d",
        "69e9a307d1bc6cfe7247ea9e","69e9a307d1bc6cfe7247ea9f","69e9a307d1bc6cfe7247eaa0",
        "69e91929e9a419d0ed14129e"
      ],
      "69d06c4a4f1e1017a77a7019": [
        "69e9a307d1bc6cfe7247eaa1","69e9a307d1bc6cfe7247eaa2","69e9a307d1bc6cfe7247eaa3",
        "69e9a307d1bc6cfe7247eaa4","69e9a307d1bc6cfe7247eaa5","69e9a307d1bc6cfe7247eaa6",
        "69e9a307d1bc6cfe7247eaa7","69e9a307d1bc6cfe7247eaa8","69e9a307d1bc6cfe7247eaa9",
        "69e9a307d1bc6cfe7247eaaa","69e9a307d1bc6cfe7247eaab","69e9a307d1bc6cfe7247eaac",
        "69e9a307d1bc6cfe7247eaad","69e9a307d1bc6cfe7247eaae","69e9a307d1bc6cfe7247eaaf",
        "69e9a307d1bc6cfe7247eab0","69e9a307d1bc6cfe7247eab1","69e9a307d1bc6cfe7247eab2",
        "69e9a307d1bc6cfe7247eab3","69e9a307d1bc6cfe7247eab4","69e9a307d1bc6cfe7247eab5",
        "69e9a307d1bc6cfe7247eab6","69e9a307d1bc6cfe7247eab7","69e9a307d1bc6cfe7247eab8",
        "69e9a307d1bc6cfe7247eab9","69e9a307d1bc6cfe7247eaba","69e9a307d1bc6cfe7247eabb",
        "69e9a307d1bc6cfe7247eabc","69e9a307d1bc6cfe7247eabd","69e9a307d1bc6cfe7247eabe",
        "69e9a307d1bc6cfe7247eabf","69e9a307d1bc6cfe7247eac0","69e9a307d1bc6cfe7247eac1",
        "69e047e27ddcca3eaa81600e","69e047e27ddcca3eaa81600f",
        "69e9a307d1bc6cfe7247eac2","69e9a307d1bc6cfe7247eac3","69e9a307d1bc6cfe7247eac4",
        "69e047e27ddcca3eaa816010","69e047e27ddcca3eaa816011","69e047e27ddcca3eaa816012",
        "69e047e27ddcca3eaa816013","69e047e27ddcca3eaa816014","69e047e27ddcca3eaa816015",
        "69e047e27ddcca3eaa816016","69e047e27ddcca3eaa816017","69e047e27ddcca3eaa816018",
        "69e047e27ddcca3eaa816019","69e047e27ddcca3eaa81601a"
      ],
      "69d06c4a4f1e1017a77a701a": [
        "69e9a307d1bc6cfe7247eac2","69e9a307d1bc6cfe7247eac3","69e9a307d1bc6cfe7247eac4",
        "69e047e27ddcca3eaa816010","69e047e27ddcca3eaa816011","69e047e27ddcca3eaa816012",
        "69e047e27ddcca3eaa816013","69e047e27ddcca3eaa816014","69e047e27ddcca3eaa816015",
        "69e047e27ddcca3eaa816016","69e047e27ddcca3eaa816017","69e047e27ddcca3eaa816018",
        "69e047e27ddcca3eaa816019","69e047e27ddcca3eaa81601a"
      ],
      "69d06c4a4f1e1017a77a701b": [
        "69e9a307d1bc6cfe7247eac5","69e9a307d1bc6cfe7247eac6","69e9a307d1bc6cfe7247eac7"
      ],
      "69d06c4a4f1e1017a77a701c": [],
    };
    const VILLAGE_TO_MACRO_MAP = {};
    Object.entries(MACRO_VILLAGES_MAP).forEach(([macroId, vids]) => { vids.forEach(vid => { VILLAGE_TO_MACRO_MAP[vid] = macroId; }); });

    const out = all.filter(p => {
      const provSvcs  = Array.isArray(p.services)      ? p.services      : [];
      const provAreas = Array.isArray(p.service_areas)  ? p.service_areas : [];
      const provCatId = p.category_id || "";
      const exclusionReasons = [];

      // ── STATUS GATES ────────────────────────────────────────────────────
      if (!p.is_active)           exclusionReasons.push("inactive");
      if (p.is_visible === false)  exclusionReasons.push("not_visible");
      const subStatus = (p.subscription_status || "").toLowerCase();
      if (subStatus === "cancelled" || subStatus === "expired") exclusionReasons.push("subscription_" + subStatus);

      if (exclusionReasons.length === 0) {

        // ── SERVICE MATCH ──────────────────────────────────────────────────
        if (selSvc) {
          const isCatSearch   = !!selSvc._isCat;
          const targetCatId   = isCatSearch ? selSvc.id : (selSvc.category_id || null);

          if (isCatSearch) {
            // Category-level search: match if provider's category_id OR any service's category matches
            const catMatch = (provCatId === targetCatId) ||
              provSvcs.some(sid => (ENTITY_SVC_TO_CAT[sid] || SCODE_TO_CAT[sid]) === targetCatId);
            if (!catMatch) exclusionReasons.push(`no_matching_service_category (wanted cat=${targetCatId}, provider cat=${provCatId}, provider services=[${provSvcs.slice(0,3).join(",")}])`);
          } else {
            // Specific service search:
            // PRIMARY: direct DB ID match (the only reliable method)
            const directMatch = provSvcs.includes(selSvc.id);
            if (!directMatch) {
              // FALLBACK: name-based match for any remaining text-based legacy entries
              const selName = (selSvc.name || "").toLowerCase().trim();
              const nameMatch = provSvcs.some(sv => {
                const resolved = (ENTITY_SVC_MAP[sv] || LEGACY_SVC_MAP[sv] || "").toLowerCase().trim();
                return resolved === selName;
              });
              if (!nameMatch) {
                exclusionReasons.push(`no_matching_service (wanted id=${selSvc.id} name="${selSvc.name}", provider services=[${provSvcs.join(",")}])`);
              }
            }
          }
        }

        // ── AREA MATCH ────────────────────────────────────────────────────
        if (selArea) {
          // PRIMARY: direct DB ID match
          const directAreaMatch = provAreas.includes(selArea.id);

          if (!directAreaMatch) {
            // SECONDARY: macro group — if user picked a group, check if any provider area is in it
            const macroGroupVillages = MACRO_VILLAGES_MAP[selArea.id];
            const macroMatch = macroGroupVillages
              ? provAreas.some(a => macroGroupVillages.includes(a)) || provAreas.includes(selArea.id)
              : false;

            // TERTIARY: if user picked a village, check if provider has the parent macro group
            const selMacroId = VILLAGE_TO_MACRO_MAP[selArea.id];
            const reverseMacroMatch = selMacroId ? provAreas.includes(selMacroId) : false;

            // QUATERNARY: name-based for legacy text entries only
            const rawName = selArea.name || "";
            const dashIdx = rawName.indexOf(" — ");
            const plainVillageName = (dashIdx >= 0 ? rawName.slice(dashIdx + 3) : rawName).toLowerCase().trim();
            const nameAreaMatch = provAreas.some(a => areaValMatchesVillage(a, plainVillageName));

            if (!macroMatch && !reverseMacroMatch && !nameAreaMatch) {
              exclusionReasons.push(`no_matching_village (wanted id=${selArea.id} name="${selArea.name}", provider has ${provAreas.length} areas)`);
            }
          }
        }
      }

      // ── LOG AND RETURN ─────────────────────────────────────────────────
      const pass = exclusionReasons.length === 0;
      const debugEntry = {
        provider_id:        p.id,
        business_name:      p.business_name,
        is_active:          p.is_active,
        is_visible:         p.is_visible,
        subscription_status: p.subscription_status,
        category_id:        p.category_id,
        services:           provSvcs,
        service_areas_count: provAreas.length,
        result:             pass ? "MATCHED" : "EXCLUDED",
        exclusion_reasons:  exclusionReasons,
      };
      if (pass) {
        debugLog.matchedProviders.push(debugEntry);
      } else {
        debugLog.excludedProviders.push(debugEntry);
      }
      return pass;
    });

    // Sort by rating field (no auth-gated calls on public page)
    const getScore = (p) => typeof p.rating === "number" ? p.rating : 0;

    out.sort((a, b) => {
      // Higher rating first; same rating → tier order
      const ratingDiff = getScore(b) - getScore(a);
      if (ratingDiff !== 0) return ratingDiff;
      const tier = { premium: 0, featured: 1, standard: 2, basic: 3 };
      return (tier[a.subscription_tier] ?? 3) - (tier[b.subscription_tier] ?? 3);
    });
    setResults(out);
    setIsLoading(false);
    setSearched(true);
    // Track search appearances — fire & forget to backend analytics
    if (out.length > 0) {
      const areaLabel = selArea ? (areas.find(a => a.id === selArea || a.name === selArea)?.name || selArea) : "";
      const svcObj = selSvc ? svcs.find(s => s.id === selSvc) : null;
      const catObj = svcObj ? cats.find(c => c.id === svcObj.category_id) : null;
      const events = out.map(p => ({
        provider_id: p.id,
        event_type: "search_appearance",
        service_name: svcObj?.name || "",
        category_name: catObj?.name || "",
        area_name: areaLabel,
        source: "homepage",
      }));
      fetch("https://api.base44.app/api/apps/69d062aca815ce8e697894b1/functions/trackEvent", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(events),
      }).catch(() => {});
    }
  };

  const reset = () => {
    setResults([]); setSearched(false); setSelProv(null);
    setSelAreaR(null); setSelCatR(null);
    setSelSvc(null); setSelArea(null);
  };

  useMeta({
    title: "V-Hub | Find Local Services in The Villages, Florida",
    description: "V-Hub is The Villages, Florida's local service directory. Search landscaping, home repair, cleaning, pet care, transportation and more across all 97 villages.",
    keywords: "The Villages FL services, local service directory, home repair, landscaping, cleaning, pet care, golf cart services, The Villages Florida",
    ogTitle: "V-Hub — The Villages Local Services Directory",
    ogDescription: "Find local service providers across all 97 villages in The Villages, FL. No fees. No middlemen. Just neighbors serving neighbors.",
    ogImage: "https://media.base44.com/images/public/69d062aca815ce8e697894b1/baa1f63dd_ronnie_hero_with_credit.jpg",
    canonical: "https://www.v-hub.us/",
  });

  // Newspaper typography
  const hd  = { margin: "0 0 3px 0", fontWeight: 900, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5, color: INK, fontFamily: "'Times New Roman', serif", lineHeight: 1.2, borderBottom: `1px solid ${INK}`, paddingBottom: 3 };
  const sub = { margin: "0 0 6px 0", fontStyle: "italic", fontSize: 10.5, color: BROWN_BTN, fontFamily: "'Times New Roman', serif", lineHeight: 1.4 };
  const para = { margin: "0 0 8px 0", fontSize: 11, color: INK, fontFamily: "'Times New Roman', serif", lineHeight: 1.75, textAlign: "justify" };
  const rule = { height: 2, background: INK, margin: "10px 0", opacity: 0.15 };

  if (selProv)  return <ProvDetail prov={selProv} areas={areas} cats={cats} svcs={svcs} onBack={() => setSelProv(null)} />;
  if (isLoading) return (
    <div style={{ background: "#f5f0e8", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
      <div style={{ fontSize: 40 }}>🔍</div>
      <div style={{ fontFamily: "Georgia, serif", fontSize: 20, color: "#3b2a1a" }}>Finding providers near you...</div>
    </div>
  );
  if (searched) return <Results results={results} areas={areas} cats={cats} svcs={svcs} onReset={reset} onSel={setSelProv} selArea={selAreaR} selCatId={selCatR} />;

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap" rel="stylesheet" />
      <style>{`
        * { box-sizing: border-box; }
        body, html { margin: 0; padding: 0; overflow-x: hidden; }

        /* Newspaper column base */
        .np-col { font-family: 'Times New Roman', Georgia, serif; font-size: 12px; color: ${INK}; line-height: 1.7; text-align: justify; }

        /* Mobile: 2-column newspaper grid */
        .np-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0;
          padding: 0;
          border-top: 2px solid ${INK};
        }
        .np-side-left {
          display: block;
          padding: 10px 8px 10px 10px;
          border-right: 1px solid ${INK};
        }
        .np-center {
          display: none;
        }
        .np-side-right {
          display: block;
          padding: 10px 10px 10px 8px;
        }

        /* Tablet / Desktop: 3-column newspaper */
        @media (min-width: 580px) {
          .np-grid {
            grid-template-columns: 1fr 2fr 1fr;
          }
          .np-side-left {
            padding: 10px 9px 10px 12px;
            border-right: 1px solid ${INK};
          }
          .np-center {
            display: block;
            padding: 10px 12px;
            border-right: 1px solid ${INK};
          }
          .np-side-right {
            padding: 10px 12px 10px 9px;
          }
        }

        /* Mobile newsprint strips above/below search */
        .np-mobile-top { display: block; }
        .np-mobile-bot { display: block; }
        @media (min-width: 580px) {
          .np-mobile-top, .np-mobile-bot { display: none; }
        }
      `}</style>
      {/* Preload logo so it's ready instantly on navigation */}
      <link rel="preload" as="image" href="https://base44.app/api/apps/69d062aca815ce8e697894b1/files/mp/public/69d062aca815ce8e697894b1/f14a7cbd0_logo_icon_small.png" />
      {/* Preload hero image — highest priority, loads with app */}
      <link rel="preload" as="image" href="https://media.base44.com/images/public/69d062aca815ce8e697894b1/baa1f63dd_ronnie_hero_with_credit.jpg" fetchpriority="high" />

      <div style={{
        minHeight: "100vh",
        background: PAPER,
        backgroundImage: `repeating-linear-gradient(0deg,transparent,transparent 27px,rgba(28,15,0,0.04) 27px,rgba(28,15,0,0.04) 28px)`,
        fontFamily: "'Times New Roman', Georgia, serif",
        maxWidth: 860,
        margin: "0 auto",
        overflowX: "hidden",
        boxShadow: "0 2px 40px rgba(0,0,0,0.28)",
      }}>

        {/* ── NEWSPAPER STACKED PAGES EDGE ── */}
        <div style={{ position: "relative", height: 28, marginBottom: 0 }}>
          {/* Page 5 — deepest/darkest */}
          <div style={{ position: "absolute", top: 0, left: 6, right: 6, height: 28, background: "#b8a070", borderRadius: "0 0 3px 3px", boxShadow: "0 3px 6px rgba(0,0,0,0.35)" }} />
          {/* Page 4 */}
          <div style={{ position: "absolute", top: 0, left: 4, right: 4, height: 24, background: "#c9b484", borderRadius: "0 0 3px 3px", boxShadow: "0 3px 5px rgba(0,0,0,0.3)" }} />
          {/* Page 3 */}
          <div style={{ position: "absolute", top: 0, left: 3, right: 3, height: 20, background: "#d8c496", borderRadius: "0 0 2px 2px", boxShadow: "0 2px 5px rgba(0,0,0,0.25)" }} />
          {/* Page 2 */}
          <div style={{ position: "absolute", top: 0, left: 2, right: 2, height: 16, background: "#e6d4a8", borderRadius: "0 0 2px 2px", boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }} />
          {/* Page 1 — top/front page, matches PAPER */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 12, background: "#F0E6C8", borderRadius: "0 0 2px 2px", boxShadow: "0 4px 10px rgba(0,0,0,0.25), inset 0 -1px 0 rgba(0,0,0,0.1)" }} />
          {/* Dark top binding line */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "linear-gradient(180deg, #1a0a00 0%, #3d2200 100%)" }} />
        </div>

        {/* ── MASTHEAD ── */}
        <div style={{ background: PAPER, padding: "12px 10px 8px" }}>
          {/* Single row: logo | V-Hub title inline | burger — logo and burger same width for true centering */}
          <div style={{ display: "flex", alignItems: "center" }}>
            {/* Left: logo — fixed width 64 */}
            <div style={{ flexShrink: 0, width: 64, height: 64, display: "flex", alignItems: "center", justifyContent: "flex-start" }}>
              <img
                src="https://base44.app/api/apps/69d062aca815ce8e697894b1/files/mp/public/69d062aca815ce8e697894b1/f14a7cbd0_logo_icon_small.png"
                alt="V-Hub logo icon"
                loading="eager"
                fetchPriority="high"
                decoding="sync"
                style={{ width: 56, height: 56, objectFit: "contain", display: "block" }}
              />
            </div>
            {/* Center: V-Hub title — flex:1 so it takes remaining space and centers itself */}
            <div style={{ flex: 1, textAlign: "center", display: "flex", alignItems: "baseline", justifyContent: "center", gap: 0 }}>
              <span style={{ fontStyle: "italic", fontWeight: 700, fontFamily: "'Great Vibes', cursive", fontSize: 52, color: "#003366", WebkitTextStroke: "0.5px #003366", textShadow: "0.5px 0.5px 0 #001a40", lineHeight: 1 }}>V</span>
              <span style={{ fontSize: 36, fontWeight: 900, color: INK, fontFamily: "'Times New Roman', serif", lineHeight: 1, margin: "0 2px" }}>-</span>
              <span style={{ fontSize: 44, fontWeight: 900, color: INK, fontFamily: "'Times New Roman', serif", letterSpacing: -1, lineHeight: 1 }}>Hub</span>
            </div>
            {/* Right: burger — SAME fixed width 64 as logo to balance layout */}
            <div style={{ flexShrink: 0, width: 64, display: "flex", justifyContent: "flex-end", alignItems: "center" }}><Burger currentUser={currentUser} /></div>
          </div>
          {/* Tagline */}
          <div style={{ fontSize: 13, fontStyle: "italic", color: INK_FADE, textAlign: "center", margin: "6px 0 10px" }}>
            Connecting You to Local Services in The Villages!
          </div>
        </div>

        <Rule thick />

        {/* FIND SERVICES SEARCH BLOCK — full width, green bordered */}
        <div style={{
          border: "4px solid #1A6B3C",
          outline: "1.5px solid #1A6B3C",
          outlineOffset: "0px",
          boxShadow: "0 0 10px 2px rgba(26,107,60,0.3)",
          background: PAPER,
          width: "100%", boxSizing: "border-box",
        }}>
          {/* Header label */}
          <div style={{
            padding: "5px 16px", textAlign: "center", fontSize: 13, fontWeight: 900,
            letterSpacing: 2, color: "#000", textTransform: "uppercase",
            borderBottom: "1px solid #1A6B3C88",
          }}>Classifieds</div>
          {/* Search box */}
          <div style={{ padding: "4px 12px 2px" }}>
            <SearchBox cats={cats} svcs={svcs} areas={areas} onSearch={doSearch} selSvc={selSvc} setSelSvc={setSelSvc} selArea={selArea} setSelArea={setSelArea} />
          </div>
        </div>

        {/* PHOTO */}
        <div style={{ position: "relative", width: "100%", lineHeight: 0 }}>
          <img
            src="https://media.base44.com/images/public/69d062aca815ce8e697894b1/baa1f63dd_ronnie_hero_with_credit.jpg"
            alt="The Villages, FL"
            fetchpriority="high"
            loading="eager"
            decoding="sync"
            style={{ width: "100%", display: "block" }}
          />
          <div style={{ position: "absolute", bottom: 8, right: 10, background: "rgba(0,0,0,0.55)", color: "#fff", fontSize: 13, fontWeight: 500, padding: "3px 9px", borderRadius: 4, fontFamily: "sans-serif", letterSpacing: 0.4, lineHeight: "normal" }}>
            © Photo: Ronnie Clark
          </div>
        </div>

        {/* PHOTO CREDIT BAR */}
        <div style={{ width: "100%", background: "#F5E6C8", borderTop: "1px solid #C8A96E", borderBottom: "1px solid #C8A96E", textAlign: "center", padding: "5px 0", fontSize: 12, fontFamily: "'Times New Roman', serif", color: "#5C3A1E", letterSpacing: 0.5, fontStyle: "italic" }}>
           Photo courtesy of Ronnie Clark 
        </div>

        {/* CLASSIFIEDS — full width, thick red border, links to Classifieds */}
        <a href="/Classifieds" style={{ textDecoration: "none", display: "block", width: "100%" }}>
          <div style={{
            border: "4px solid #CC0000",
            outline: "1.5px solid #CC0000",
            outlineOffset: "0px",
            boxShadow: "0 0 10px 2px rgba(204,0,0,0.3)",
            background: PAPER,
            width: "100%", boxSizing: "border-box",
            cursor: "pointer",
          }}>
            <div style={{ padding: "5px 16px 2px", textAlign: "center", fontSize: 13, fontWeight: 900, letterSpacing: 2, color: "#CC0000", textTransform: "uppercase", fontFamily: "'Times New Roman', serif" }}>🔥 Deals of the Week!</div>
            <div style={{ padding: "0 16px 5px", textAlign: "center", fontSize: 11, fontStyle: "italic", color: "#CC0000", fontFamily: "'Times New Roman', serif", opacity: 0.8 }}>Click here to see this week's deals →</div>
          </div>
        </a>

        {/* LIST MY SERVICE — full width, deep navy blue */}
        <a href="/ListService" style={{ textDecoration: "none", display: "block", width: "100%" }}>
          <div style={{
            padding: "14px 8px", textAlign: "center", fontSize: 13, fontWeight: 900,
            letterSpacing: 2, color: "#FFFFFF", textTransform: "uppercase",
            background: `linear-gradient(180deg,#1B3D6F,#0d2447)`,
            border: `3px solid #1B3D6F`,
            boxShadow: `0 0 0 1.5px #1B3D6F, 0 2px 12px rgba(27,61,111,0.4)`,
            boxSizing: "border-box", cursor: "pointer", lineHeight: 1.4, width: "100%",
          }}>📋 List My Service</div>
        </a>

        <Rule />

        {/* ── NEWSPAPER BODY ── */}
        <div className="np-grid">

          {/* ── LEFT COLUMN ── */}
          <div className="np-side-left np-col">
            <p style={hd}>{NEWSPAPER_CONTENT.neighborhoodWatch.headline}</p>
            <p style={sub}>{NEWSPAPER_CONTENT.neighborhoodWatch.subhead}</p>
            {NEWSPAPER_CONTENT.neighborhoodWatch.body.map((p,i) => <p key={i} style={para}>{p}</p>)}
            <div style={rule} />
            <p style={hd}>{NEWSPAPER_CONTENT.safetyTrust.headline}</p>
            <p style={sub}>{NEWSPAPER_CONTENT.safetyTrust.subhead}</p>
            {NEWSPAPER_CONTENT.safetyTrust.body.map((p,i) => <p key={i} style={para}>{p}</p>)}
          </div>

          {/* ── CENTER COLUMN ── */}
          <div className="np-center">
            <p style={hd}>{NEWSPAPER_CONTENT.growthStory.headline}</p>
            <p style={sub}>{NEWSPAPER_CONTENT.growthStory.subhead}</p>
            {NEWSPAPER_CONTENT.growthStory.body.map((p,i) => <p key={i} style={{...para, marginBottom: 10}}>{p}</p>)}
            <div style={rule} />
            <p style={hd}>{NEWSPAPER_CONTENT.howItWorks.headline}</p>
            <p style={sub}>{NEWSPAPER_CONTENT.howItWorks.subhead}</p>
            {NEWSPAPER_CONTENT.howItWorks.body.map((p,i) => <p key={i} style={{...para, marginBottom: 10}}>{p}</p>)}
            <div style={{ marginTop: 12 }}>
              <p style={hd}>{NEWSPAPER_CONTENT.homeServices.headline}</p>
              <p style={sub}>{NEWSPAPER_CONTENT.homeServices.subhead}</p>
              {NEWSPAPER_CONTENT.homeServices.body.map((p,i) => <p key={i} style={para}>{p}</p>)}
            </div>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="np-side-right np-col">
            <p style={hd}>{NEWSPAPER_CONTENT.providerSpotlight.headline}</p>
            <p style={sub}>{NEWSPAPER_CONTENT.providerSpotlight.subhead}</p>
            {NEWSPAPER_CONTENT.providerSpotlight.body.map((p,i) => <p key={i} style={para}>{p}</p>)}
            <div style={rule} />
            <p style={hd}>{NEWSPAPER_CONTENT.classifieds.headline}</p>
            <p style={sub}>{NEWSPAPER_CONTENT.classifieds.subhead}</p>
            {NEWSPAPER_CONTENT.classifieds.body.map((p,i) => <p key={i} style={{...para, borderBottom: `1px dotted ${PAPER_DK}`, paddingBottom: 5}}>{p}</p>)}
          </div>

        </div>

        <Rule style={{ marginTop: 8 }} />

        {/* ── FULL WIDTH BOTTOM SECTION ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px", padding: "10px 0" }}>
          <div>
            <p style={hd}>ABOUT THE VILLAGES</p>
            <p style={sub}>Florida's premier active adult community</p>
            <p style={para}>The Villages spans three counties — Sumter, Lake, and Marion — with more than 80,000 residents, 97 distinct villages, and three vibrant town squares. It is one of the most dynamic communities in the United States.</p>
            <p style={para}>From Spanish Springs to Brownwood to the newest streets of Eastport, every corner of The Villages has its own character — and its own service needs. V-Hub serves all of them.</p>
          </div>
          <div>
            <p style={hd}>LIST YOUR SERVICE</p>
            <p style={sub}>Reach residents searching for exactly what you offer</p>
            <p style={para}>Listing on V-Hub puts your business directly in front of Villages residents. Choose which villages and categories you appear under — your profile is always in your control and editable anytime.</p>
            <p style={para}>Providers across The Villages are already being found every day. Start your 45-day trial above — takes just a few minutes.</p>
          </div>
        </div>

        {/* ── NEWSPAPER FOOTER ── */}
        <div style={{ background: PAPER_MID, borderTop: `3px double ${INK}`, marginTop: 24 }}>

          {/* Thick rule */}
          <div style={{ height: 2, background: INK, margin: "0 0 0 0" }} />

          {/* Footer content */}
          <div style={{ padding: "20px 20px 10px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 20px" }}>
            {/* Col 1 - About */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 900, color: INK, letterSpacing: 2, textTransform: "uppercase", borderBottom: `1px solid ${INK}`, paddingBottom: 4, marginBottom: 8 }}>About V-Hub</div>
              <div style={{ fontSize: 11, color: INK, lineHeight: 1.6, fontFamily: "'Times New Roman', serif" }}>
                V-Hub is the local services directory for residents of The Villages, FL — connecting neighbors with trusted local providers.
              </div>
            </div>
            {/* Col 2 - Quick Links */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 900, color: INK, letterSpacing: 2, textTransform: "uppercase", borderBottom: `1px solid ${INK}`, paddingBottom: 4, marginBottom: 8 }}>Quick Links</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <a href="/ListService" style={{ fontSize: 11, color: INK, textDecoration: "none", fontFamily: "'Times New Roman', serif" }}>📋 List Your Service</a>
                <a href="/ProviderDashboard" style={{ fontSize: 11, color: INK, textDecoration: "none", fontFamily: "'Times New Roman', serif" }}>🔑 Provider Login</a>
                <a href="/Terms" style={{ fontSize: 11, color: INK, textDecoration: "none", fontFamily: "'Times New Roman', serif" }}>📜 Terms of Service</a>
                <a href="/Privacy" style={{ fontSize: 11, color: INK, textDecoration: "none", fontFamily: "'Times New Roman', serif" }}>🔒 Privacy Policy</a>
              </div>
            </div>
            {/* Col 3 - Contact */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 900, color: INK, letterSpacing: 2, textTransform: "uppercase", borderBottom: `1px solid ${INK}`, paddingBottom: 4, marginBottom: 8 }}>Contact</div>
              <div style={{ fontSize: 11, color: INK, lineHeight: 1.7, fontFamily: "'Times New Roman', serif" }}>
                <div>✉️ <a href="mailto:admin@v-hub.us" style={{ color: INK }}>admin@v-hub.us</a></div>
                <div>📍 The Villages, Florida</div>
              </div>
            </div>
            {/* Col 4 - Legal */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 900, color: INK, letterSpacing: 2, textTransform: "uppercase", borderBottom: `1px solid ${INK}`, paddingBottom: 4, marginBottom: 8 }}>Legal</div>
              <div style={{ fontSize: 11, color: INK, lineHeight: 1.6, fontFamily: "'Times New Roman', serif" }}>
                V-Hub is a directory service. We do not endorse, guarantee, or warrant any provider listed herein. Use of this site constitutes acceptance of our <a href="/Terms" style={{ color: INK }}>Terms of Service</a> and <a href="/Privacy" style={{ color: INK }}>Privacy Policy</a>.
              </div>
            </div>
          </div>

          {/* Bottom rule + copyright */}
          <div style={{ height: 1, background: INK, margin: "0 20px" }} />
          <div style={{ padding: "10px 20px 18px", textAlign: "center" }}>
            <div style={{ fontSize: 10, color: INK_FADE, fontStyle: "italic", fontFamily: "'Times New Roman', serif", letterSpacing: 1 }}>
              © {new Date().getFullYear()} V-Hub · The Villages, Florida · All Rights Reserved
            </div>
            <div style={{ fontSize: 9, color: INK_FADE, marginTop: 3, fontFamily: "'Times New Roman', serif", letterSpacing: 0.5 }}>
              V-Hub is not affiliated with The Villages® or its affiliates. Provider listings are independent businesses.
            </div>
          </div>

          {/* Newspaper bottom edge — stacked pages */}
          <div style={{ position: "relative", height: 24 }}>
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 24, background: "#b8a070", boxShadow: "0 -2px 6px rgba(0,0,0,0.3)" }} />
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 20, background: "#c9b484" }} />
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 16, background: "#d8c496" }} />
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 12, background: "#e6d4a8" }} />
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 8, background: PAPER }} />
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: "linear-gradient(0deg, #1a0a00 0%, #3d2200 100%)" }} />
          </div>

        </div>

      </div>
    </>
  );
}


// V-HUB Search v3.0 — entity-ID based village+service matching
