// V-Hub Home — PRODUCTION v2026-04-20-R4-CDN-BUST
import React, { useState, useEffect, useRef } from "react";
import { User, Category, Service, ServiceArea, Provider, ProviderReview } from "@/api/entities";

function useMeta({ title, description, canonical }) {
  useEffect(() => {
    const t = title || "V-Hub | The Villages, FL Local Services Directory";
    const d = description || "Find trusted local service providers in The Villages, FL. Search HVAC, lawn care, golf cart repair, pet services, and more — all in one place.";
    const url = canonical || "https://www.v-hub.us/";
    const img = "https://media.base44.com/images/public/69d062aca815ce8e697894b1/a9af95bc3_V-Hublogo.png";

    document.title = t;

    const setMeta = (name, content, prop = false) => {
      const attr = prop ? "property" : "name";
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) { el = document.createElement("meta"); el.setAttribute(attr, name); document.head.appendChild(el); }
      el.setAttribute("content", content);
    };
    const setLink = (rel, href) => {
      let el = document.querySelector(`link[rel="${rel}"]`);
      if (!el) { el = document.createElement("link"); el.rel = rel; document.head.appendChild(el); }
      el.href = href;
    };

    // Core
    setMeta("description", d);
    setMeta("robots", "index, follow");
    setMeta("viewport", "width=device-width, initial-scale=1.0");
    setMeta("keywords", "The Villages FL services, local contractors The Villages, home services The Villages Florida, golf cart repair, lawn care, HVAC The Villages, pet services, local directory");
    setMeta("author", "V-Hub");

    // Canonical
    setLink("canonical", url);

    // Open Graph (Facebook, Google rich results, messaging previews)
    setMeta("og:type", "website", true);
    setMeta("og:url", url, true);
    setMeta("og:site_name", "V-Hub", true);
    setMeta("og:title", t, true);
    setMeta("og:description", d, true);
    setMeta("og:image", img, true);
    setMeta("og:image:width", "1200", true);
    setMeta("og:image:height", "630", true);
    setMeta("og:locale", "en_US", true);

    // Twitter Card
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", t);
    setMeta("twitter:description", d);
    setMeta("twitter:image", img);
    setMeta("twitter:site", "@vhubvillages");

    // Mobile / PWA hints
    setMeta("theme-color", "#E8431A");
    setMeta("mobile-web-app-capable", "yes");
    setMeta("apple-mobile-web-app-capable", "yes");
    setMeta("apple-mobile-web-app-title", "V-Hub");
    setMeta("apple-mobile-web-app-status-bar-style", "default");
    setLink("apple-touch-icon", img);

    // Google / Bing verification hint
    setMeta("geo.region", "US-FL");
    setMeta("geo.placename", "The Villages, Florida");

    // JSON-LD Structured Data
    const existing = document.querySelector('script[data-vh-ld]');
    if (existing) existing.remove();
    const ld = document.createElement("script");
    ld.type = "application/ld+json";
    ld.setAttribute("data-vh-ld", "1");
    ld.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "V-Hub",
      "url": "https://www.v-hub.us/",
      "description": d,
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://www.v-hub.us/?q={search_term_string}",
        "query-input": "required name=search_term_string"
      },
      "publisher": {
        "@type": "Organization",
        "name": "V-Hub",
        "url": "https://www.v-hub.us/",
        "logo": {
          "@type": "ImageObject",
          "url": img
        },
        "areaServed": {
          "@type": "City",
          "name": "The Villages",
          "addressRegion": "FL",
          "addressCountry": "US"
        }
      }
    });
    document.head.appendChild(ld);
  }, [title]);
}

const INK       = "#1C0F00";
const INK_FADE  = "#5C3A10";
const PAPER     = "#F0E6C8";
const PAPER_MID = "#E4D5A8";
const PAPER_DK  = "#C8B07A";
const BROWN     = "#7A4820";
const YELLOW    = "#FFDB00";
const NAVY      = "#1B3D6F";
const GREEN     = "#1A6B3C";
const TEAL      = "#00BFA5";

const API_BASE = "https://api.base44.app/api/apps/69d062aca815ce8e697894b1/functions";

const ALL_VILLAGES = [
  "Altamonte","Altoona","Amelia","Antrim","Arlington","Ashland","Autumn Glen","Bayside",
  "Belvedere","Bonita","Bonnybrook","Bradford","Briar Meadow","Bridgeport at Laurel Valley",
  "Bridgeport at Lake Miona","Bridgeport at Miona Shores","Brightwood","Brookfield","Buttonwood",
  "Cambridge","Calumet Grove","Carbondale","Caroline","Caselberry","Charlotte",
  "Chatham","Chitty Chatty","Citra","Citrus Grove","Cleveland","Collier","Cortez","Cottage Grove",
  "Countryside","Dahlia","De La Vista East","De La Vista North","De La Vista South","De La Vista West",
  "Desoto","Dunedin","Duval","Earlsboro","El Camino Real","Enclave at Marsh Bend",
  "Fenney","Fitch","Floridian","Forte","Foxboro","Fury's Cove",
  "Glenbrook","Grand Oaks","Greystone","Hadley","Hamilton","Haverford Place",
  "Hawkins","Hemingway","Hillsborough","Holiday","Hooper","Howie","Hulett","Hunt",
  "Indigo East","Irene","Jacobs","Johnston","Kedron",
  "Lake Deaton","Lake Miona","Lancaster","Laurel Run","Laurel Valley",
  "LaBelle","Largo","Lee","Liberty Park","Linville","Linden","Lynnhaven",
  "Magnolia","Mallory Square","Marion","Marsh Bend","Mira Mesa","Mission Hills",
  "Monarch","Moultrie Creek","Mulberry Grove","Newell","Nichols","Nipe",
  "Orange Blossom Gardens","Osceola Hills","Palo Alto","Palmer Legends","Pennecamp",
  "Perry","Pine Hills","Pine Ridge","Pinellas","Polo Ridge","Poinciana",
  "Preserve","Richland","Richmond","Rio Grande","Rio Ponderosa","Rio Ponderosa East",
  "Rohan","Roosevelt","Royal Highlands","Sabado","Saint Catherine",
  "Santo Domingo","Sarasota","Sasser","Sanchez","Seabreeze","Sheridan",
  "Silver Lake","Silver Oak","Simmons","Southern Oaks","Southern Trace","Springfield",
  "Springdale","Stonecrest","Sugar Hill","Summerhill","Sumter","Sunset Pointe",
  "Tamarind Grove","Tall Trees","Taos","Tierra del Sol","Tierra del Sol South",
  "Triadelphia","Truman","Twain","Umatilla","Van Buren","Vera Cruz",
  "Virginia Trace","Wanamaker","Wasatch","Washington","Winifred","Woodbury",
  "Woodstock","Worthington","Zephyr"
];

const MACRO_AREAS = ["Historic Side","Established Villages","Newer Villages","Eastport","Family/Non-Age-Restricted"];

function Stars({ rating, size = 14 }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <span style={{ color: "#D4A017", fontSize: size, lineHeight: 1 }}>
      {"★".repeat(full)}{half ? "½" : ""}{"☆".repeat(empty)}
    </span>
  );
}

function Rule({ thick = false, style = {} }) {
  return (
    <div style={style}>
      <div style={{ height: thick ? 3 : 1, background: INK }} />
      {thick && <div style={{ height: 1, background: INK, marginTop: 2 }} />}
    </div>
  );
}

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
                  <div style={{ padding: "10px 12px", borderRadius: 3, fontSize: 13, fontWeight: 700, color: l.highlight ? PAPER : INK, marginBottom: 4, background: l.highlight ? BROWN : PAPER_MID, borderLeft: `4px solid ${BROWN}` }}>{l.label}</div>
                </a>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}

// ── Provider Detail with Working Review Form ────────────────────────────────
function ProvDetail({ prov, areas, cats, svcs, onBack }) {
  const [reviews, setReviews]         = useState([]);
  const [showForm, setShowForm]       = useState(false);
  const [saved, setSaved]             = useState(false);
  const [submitting, setSubmitting]   = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [form, setForm] = useState({
    customer_name: "", customer_village: "", rating: 5, review_text: "", service_used: ""
  });

  const cat = cats.find(c => c.id === prov.category_id);

  const svcMap = React.useMemo(() => {
    const m = {};
    (svcs || []).forEach(s => { if (s.id) m[s.id] = s.name; });
    return m;
  }, [svcs]);

  const areaMap = React.useMemo(() => {
    const m = {};
    (areas || []).forEach(a => {
      if (a.id) m[a.id] = a.name.includes(" — ") ? a.name.split(" — ").pop().trim() : a.name;
    });
    return m;
  }, [areas]);

  const resolvedServices = (prov.services || []).map(s => svcMap[s]).filter(Boolean);
  const resolvedAreas    = (prov.service_areas || [])
    .map(a => areaMap[a] || a)
    .filter(v => v && v.length < 40 && !v.startsWith("va") && !/^[0-9a-f]{24}$/.test(v));

  // Check if this is provider's own profile
  const isOwnProfile = (() => {
    try { const id = sessionStorage.getItem("vhub_provider_id"); return !!(id && id === prov.id); }
    catch(e) { return false; }
  })();

  useEffect(() => {
    // Load approved reviews via entity SDK (client-side)
    ProviderReview.filter({ provider_id: prov.id, is_approved: true })
      .then(data => {
        const sorted = (data || []).sort((a, b) => {
          const h = (b.helpful_count || 0) - (a.helpful_count || 0);
          return h !== 0 ? h : new Date(b.created_date || 0) - new Date(a.created_date || 0);
        });
        // Strip customer_name for privacy
        setReviews(sorted.map(({ customer_name, ...r }) => r));
      })
      .catch(() => setReviews([]));
    // Track profile view
    fetch(API_BASE + "/trackEvent", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider_id: prov.id, event_type: "profile_view", source: "homepage" }),
    }).catch(() => {});
  }, [prov.id]);

  const vhubAvg = reviews.length > 0
    ? reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length
    : null;
  const hasGoogle = typeof prov.google_rating === "number" && prov.google_rating > 0;

  const handleSubmit = async () => {
    setReviewError("");
    if (!form.customer_village)      { setReviewError("Please select your village."); return; }
    if (!form.service_used)          { setReviewError("Please select the service you used."); return; }
    if (!form.review_text.trim())    { setReviewError("Please write your review."); return; }
    if (isOwnProfile)                { setReviewError("You cannot review your own business."); return; }

    setSubmitting(true);
    try {
      const resp = await fetch(API_BASE + "/submitReview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, provider_id: prov.id }),
      });
      const data = await resp.json();
      if (!resp.ok || data.error) {
        setReviewError(data.error || "Submission failed. Please try again.");
        setSubmitting(false);
        return;
      }
      setSaved(true);
      setShowForm(false);
      setForm({ customer_name: "", customer_village: "", rating: 5, review_text: "", service_used: "" });
    } catch(e) {
      setReviewError("Network error. Please try again.");
    }
    setSubmitting(false);
  };

  const inp = { width: "100%", boxSizing: "border-box", background: PAPER, border: "1.5px solid " + PAPER_DK, borderRadius: 4, color: INK, fontFamily: "'Times New Roman', serif", fontSize: 13, padding: "8px 11px" };
  const lbl = { fontSize: 10, fontWeight: 700, color: INK_FADE, textTransform: "uppercase", letterSpacing: 1, marginBottom: 3, display: "block" };

  return (
    <div style={{ minHeight: "100vh", background: PAPER, fontFamily: "'Times New Roman', serif", maxWidth: 860, margin: "0 auto", boxShadow: "0 2px 40px rgba(0,0,0,0.28)" }}>
      <link href="https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ background: INK, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
        <button onClick={onBack} style={{ background: "rgba(255,255,255,0.15)", border: "none", color: PAPER, borderRadius: 3, padding: "4px 10px", fontSize: 12, cursor: "pointer" }}>{"<"} Back</button>
        <span style={{ color: PAPER, fontWeight: 700, fontSize: 14, letterSpacing: 1 }}>
          <span style={{ fontFamily: "'Great Vibes', cursive", fontSize: "1.4em", color: TEAL }}>V</span>-Hub
        </span>
        {prov.vh_number && <span style={{ marginLeft: "auto", background: "rgba(255,255,255,0.12)", color: PAPER, fontSize: 11, padding: "2px 10px", borderRadius: 10 }}>{prov.vh_number}</span>}
      </div>

      <div style={{ padding: "16px" }}>
        {/* Business header */}
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 10 }}>
          {prov.logo_url && <img src={prov.logo_url} alt="logo" style={{ width: 72, height: 72, borderRadius: 8, objectFit: "cover", border: "1px solid " + PAPER_DK, flexShrink: 0 }} />}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: INK, lineHeight: 1.15 }}>{prov.business_name}</div>
            {cat && <div style={{ fontSize: 12, color: INK_FADE, marginTop: 2 }}>{cat.icon} {cat.name}</div>}
            {vhubAvg !== null && (
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 5 }}>
                <Stars rating={vhubAvg} size={14} />
                <span style={{ fontSize: 11, color: "#00836B", fontWeight: 700 }}>{vhubAvg.toFixed(1)}/5</span>
                <span style={{ fontSize: 11, color: INK_FADE }}>· {reviews.length} V-Hub review{reviews.length !== 1 ? "s" : ""}</span>
              </div>
            )}
            {hasGoogle && (
              <div style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 4, background: "#fff", border: "1.5px solid #dadce0", borderRadius: 20, padding: "3px 10px 3px 6px", boxShadow: "0 1px 3px rgba(0,0,0,0.10)" }}>
                <span style={{ fontWeight: 900, fontSize: 13, fontFamily: "Arial, sans-serif", letterSpacing: -0.5 }}>
                  <span style={{ color: "#4285F4" }}>G</span><span style={{ color: "#EA4335" }}>o</span><span style={{ color: "#FBBC05" }}>o</span><span style={{ color: "#4285F4" }}>g</span><span style={{ color: "#34A853" }}>l</span><span style={{ color: "#EA4335" }}>e</span>
                </span>
                <span style={{ fontSize: 13, color: "#FBBC05", letterSpacing: -1 }}>{"★".repeat(Math.round(prov.google_rating))}{"☆".repeat(5 - Math.round(prov.google_rating))}</span>
                <span style={{ fontSize: 12, color: "#3c4043", fontWeight: 700, fontFamily: "Arial, sans-serif" }}>{prov.google_rating.toFixed(1)}</span>
                {prov.google_review_url && <a href={prov.google_review_url} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} style={{ fontSize: 10, color: "#4285F4", fontFamily: "Arial, sans-serif", textDecoration: "underline" }}>See reviews</a>}
              </div>
            )}
          </div>
        </div>

        <Rule thick style={{ marginBottom: 12 }} />

        {/* Success message */}
        {saved && (
          <div style={{ background: "#E8F5E9", border: "2px solid #2E7D32", borderRadius: 8, padding: "12px 16px", marginBottom: 14, fontSize: 13, color: GREEN, fontWeight: 700 }}>
            Thank you! Your review has been submitted and will appear after approval.
          </div>
        )}

        {/* Business details */}
        {prov.description && <p style={{ fontSize: 13, color: INK, lineHeight: 1.7, marginBottom: 12 }}>{prov.description}</p>}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 12px", marginBottom: 12 }}>
          {prov.phone && <div style={{ fontSize: 12, color: INK }}><b>Phone:</b> <a href={"tel:" + prov.phone} style={{ color: INK }}>{prov.phone}</a></div>}
          {prov.email && <div style={{ fontSize: 12, color: INK, wordBreak: "break-all" }}><b>Email:</b> <a href={"mailto:" + prov.email} style={{ color: BROWN }}>{prov.email}</a></div>}
          {prov.website && (
            <div style={{ fontSize: 12, color: INK, gridColumn: "1/-1" }}>
              <b>Web:</b> <a href={prov.website.startsWith("http") ? prov.website : "https://" + prov.website} target="_blank" rel="noreferrer" style={{ color: NAVY, wordBreak: "break-all" }}>{prov.website.replace(/^https?:\/\//, "")}</a>
            </div>
          )}
          {prov.address && <div style={{ fontSize: 12, color: INK, gridColumn: "1/-1" }}><b>Address:</b> {prov.address}</div>}
          {prov.years_in_business && <div style={{ fontSize: 12, color: INK_FADE }}>{prov.years_in_business} yrs in business</div>}
          {prov.license_number && <div style={{ fontSize: 11, color: INK_FADE, fontStyle: "italic" }}>Lic# {prov.license_number}</div>}
        </div>

        {prov.is_mobile && (
          <span style={{ background: "#E8F5E9", border: "1.5px solid #1A6B3C", borderRadius: 20, padding: "3px 12px", fontSize: 11, fontWeight: 700, color: GREEN, display: "inline-block", marginBottom: 10 }}>Mobile — Travels to You</span>
        )}

        {prov.hours_of_operation && (
          <div style={{ marginBottom: 12, background: PAPER_MID, borderRadius: 6, padding: "10px 12px", fontSize: 12 }}>
            <div style={{ fontWeight: 700, color: INK_FADE, textTransform: "uppercase", fontSize: 10, letterSpacing: 1, marginBottom: 4 }}>Hours</div>
            <div style={{ color: INK, whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{prov.hours_of_operation}</div>
          </div>
        )}

        {resolvedServices.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: INK_FADE, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Services Offered</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {resolvedServices.map((s, i) => (
                <span key={i} style={{ background: PAPER_MID, border: "1px solid " + PAPER_DK, borderRadius: 3, padding: "2px 9px", fontSize: 11, color: INK }}>{s}</span>
              ))}
            </div>
          </div>
        )}

        {resolvedAreas.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: INK_FADE, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Villages Served</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {resolvedAreas.map((a, i) => (
                <span key={i} style={{ background: "#EEF6FB", border: "1px solid #B0CEE0", borderRadius: 3, padding: "2px 9px", fontSize: 11, color: NAVY }}>{a}</span>
              ))}
            </div>
          </div>
        )}

        <Rule style={{ marginBottom: 16 }} />

        {/* ── REVIEWS SECTION ── */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ fontSize: 15, fontWeight: 900, color: INK, textTransform: "uppercase", letterSpacing: 2 }}>
              Customer Reviews
            </div>
            {!showForm && !saved && !isOwnProfile && (
              <button
                onClick={() => setShowForm(true)}
                style={{ background: "linear-gradient(180deg,#9A6030," + BROWN + ")", color: PAPER, border: "2px solid " + NAVY, borderRadius: 5, padding: "8px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Times New Roman', serif" }}
              >
                Write a Review
              </button>
            )}
            {isOwnProfile && <span style={{ fontSize: 11, color: INK_FADE, fontStyle: "italic" }}>You cannot review your own listing.</span>}
          </div>

          {/* Review submission form */}
          {showForm && (
            <div style={{ background: PAPER_MID, border: "2px solid " + PAPER_DK, borderRadius: 8, padding: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 900, color: INK, marginBottom: 12 }}>Share Your Experience</div>
              <div style={{ marginBottom: 10 }}>
                <label style={lbl}>Your Village *</label>
                <select style={inp} value={form.customer_village} onChange={e => setForm(f => ({ ...f, customer_village: e.target.value }))}>
                  <option value="">Select your village...</option>
                  {ALL_VILLAGES.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                <div>
                  <label style={lbl}>Service Used *</label>
                  <select style={inp} value={form.service_used} onChange={e => setForm(f => ({ ...f, service_used: e.target.value }))}>
                    <option value="">Select a service...</option>
                    {resolvedServices.length > 0
                      ? resolvedServices.map((s, i) => <option key={i} value={s}>{s}</option>)
                      : (cat ? [<option key="cat" value={cat.name}>{cat.name}</option>] : null)
                    }
                  </select>
                </div>
                <div>
                  <label style={lbl}>Star Rating *</label>
                  <div style={{ display: "flex", gap: 6, alignItems: "center", paddingTop: 8 }}>
                    {[1,2,3,4,5].map(n => (
                      <span key={n}
                        onClick={() => setForm(f => ({ ...f, rating: n }))}
                        style={{ fontSize: 28, cursor: "pointer", color: n <= form.rating ? "#D4A017" : PAPER_DK, lineHeight: 1 }}>
                        ★
                      </span>
                    ))}
                    <span style={{ fontSize: 12, color: INK_FADE, marginLeft: 4 }}>{form.rating}/5</span>
                  </div>
                </div>
              </div>
              <div style={{ marginBottom: 10 }}>
                <label style={lbl}>Your Review *</label>
                <textarea
                  style={{ ...inp, minHeight: 90, resize: "vertical" }}
                  value={form.review_text}
                  onChange={e => setForm(f => ({ ...f, review_text: e.target.value }))}
                  placeholder="Tell neighbors about your experience..."
                />
              </div>
              {reviewError && (
                <div style={{ color: "#8B1A1A", fontSize: 12, marginBottom: 8, fontStyle: "italic" }}>{reviewError}</div>
              )}
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={handleSubmit} disabled={submitting}
                  style={{ background: submitting ? PAPER_DK : "linear-gradient(180deg,#9A6030," + BROWN + ")", color: PAPER, border: "2px solid " + NAVY, borderRadius: 5, padding: "9px 22px", fontSize: 13, fontWeight: 700, cursor: submitting ? "wait" : "pointer", fontFamily: "'Times New Roman', serif" }}>
                  {submitting ? "Submitting..." : "Submit Review"}
                </button>
                <button onClick={() => { setShowForm(false); setReviewError(""); }}
                  style={{ background: "none", border: "1px solid " + PAPER_DK, borderRadius: 5, padding: "9px 16px", fontSize: 12, cursor: "pointer", color: INK_FADE }}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Empty state */}
          {reviews.length === 0 && !showForm && !saved && (
            <div style={{ textAlign: "center", padding: "24px 0", color: INK_FADE, fontSize: 12, fontStyle: "italic" }}>
              No reviews yet — be the first to share your experience!
            </div>
          )}

          {/* Review list */}
          {reviews.map((r, i) => (
            <div key={r.id || i} style={{ borderTop: "1px solid " + PAPER_DK, padding: "12px 0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                <Stars rating={r.rating} size={13} />
                <span style={{ fontSize: 10, color: INK_FADE }}>· {r.customer_village}</span>
                {r.service_used && (
                  <span style={{ fontSize: 10, color: TEAL, background: "#E0F7F4", borderRadius: 10, padding: "1px 7px" }}>{r.service_used}</span>
                )}
              </div>
              <div style={{ fontSize: 12, color: INK, lineHeight: 1.65, fontStyle: "italic" }}>"{r.review_text}"</div>
              {r.provider_reply && (
                <div style={{ marginTop: 8, background: PAPER_MID, border: "1px solid " + PAPER_DK, borderRadius: 6, padding: "8px 12px" }}>
                  <div style={{ fontSize: 10, color: BROWN, fontWeight: 700, marginBottom: 3 }}>Owner Response:</div>
                  <div style={{ fontSize: 12, color: INK, lineHeight: 1.6 }}>{r.provider_reply}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Result Card ─────────────────────────────────────────────────────────────
function ProvCard({ p, onSel, svcs }) {
  const tier = p.subscription_tier;
  const isPremium = tier === "premium";
  const isFeatured = tier === "featured";

  return (
    <div style={{ borderTop: "2px solid " + (isPremium ? BROWN : isFeatured ? TEAL : PAPER_DK), padding: "14px 0 12px", marginBottom: 2 }}>
      {isPremium && <span style={{ background: BROWN, color: PAPER, fontSize: 9, fontWeight: 900, letterSpacing: 1.5, padding: "2px 8px", borderRadius: 2, textTransform: "uppercase", display: "inline-block", marginBottom: 5 }}>Premium Listing</span>}
      {isFeatured && !isPremium && <span style={{ background: TEAL, color: "#fff", fontSize: 9, fontWeight: 900, letterSpacing: 1.5, padding: "2px 8px", borderRadius: 2, textTransform: "uppercase", display: "inline-block", marginBottom: 5 }}>Featured</span>}

      <div onClick={() => onSel && onSel(p)} style={{ fontSize: 20, fontWeight: 900, color: TEAL, lineHeight: 1.1, marginBottom: 6, textDecoration: "underline", textDecorationStyle: "dotted", cursor: "pointer" }}>
        {p.business_name}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 14px", marginBottom: 6 }}>
        {p.phone && <a href={"tel:" + p.phone} onClick={e => e.stopPropagation()} style={{ textDecoration: "none", color: BROWN, fontSize: 12 }}>Phone: {p.phone}</a>}
        {p.email && <a href={"mailto:" + p.email} onClick={e => e.stopPropagation()} style={{ textDecoration: "none", color: BROWN, fontSize: 12 }}>Email: {p.email}</a>}
        {p.website && <a href={p.website.startsWith("http") ? p.website : "https://" + p.website} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} style={{ textDecoration: "none", color: NAVY, fontSize: 12 }}>{p.website.replace(/^https?:\/\//, "")}</a>}
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 6, alignItems: "center" }}>
        {typeof p.rating === "number" && p.rating > 0 && (
          <span style={{ fontSize: 11, color: INK_FADE }}><Stars rating={p.rating} size={11} /> {p.rating.toFixed(1)} V-Hub</span>
        )}
        {typeof p.google_rating === "number" && p.google_rating > 0 && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 3, background: "#fff", border: "1px solid #dadce0", borderRadius: 20, padding: "2px 8px 2px 5px", boxShadow: "0 1px 2px rgba(0,0,0,0.08)" }}>
            <span style={{ fontWeight: 900, fontSize: 10, fontFamily: "Arial, sans-serif", letterSpacing: -0.5 }}>
              <span style={{ color: "#4285F4" }}>G</span><span style={{ color: "#EA4335" }}>o</span><span style={{ color: "#FBBC05" }}>o</span><span style={{ color: "#4285F4" }}>g</span><span style={{ color: "#34A853" }}>l</span><span style={{ color: "#EA4335" }}>e</span>
            </span>
            <span style={{ fontSize: 10, color: "#FBBC05" }}>★</span>
            <span style={{ fontSize: 10, color: "#3c4043", fontWeight: 700, fontFamily: "Arial, sans-serif" }}>{p.google_rating.toFixed(1)}</span>
          </span>
        )}
      </div>

      {p.description && <div style={{ fontSize: 12, color: INK_FADE, fontStyle: "italic", lineHeight: 1.6, marginBottom: 6 }}>{p.description.slice(0, 130)}{p.description.length > 130 ? "..." : ""}</div>}

      {(p.services || []).length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
          {(p.services || []).slice(0, 5).map(sid => {
            const s = (svcs || []).find(x => x.id === sid);
            return s ? <span key={sid} style={{ background: PAPER_MID, border: "1px solid " + PAPER_DK, borderRadius: 3, padding: "1px 7px", fontSize: 10, color: INK }}>{s.name}</span> : null;
          })}
          {(p.services || []).length > 5 && <span style={{ fontSize: 10, color: INK_FADE }}>+{(p.services || []).length - 5} more</span>}
        </div>
      )}

      {onSel && (
        <button
          onClick={() => onSel(p)}
          style={{ background: "linear-gradient(180deg,#9A6030," + BROWN + ")", color: PAPER, border: "2px solid " + NAVY, borderRadius: 5, padding: "8px 18px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Times New Roman', serif" }}
        >
          View Full Profile + Reviews
        </button>
      )}
    </div>
  );
}

// ── Results Page ────────────────────────────────────────────────────────────
function Results({ results, areas, cats, svcs, onReset, onSel, selArea, selCatId }) {
  const areaLabel = selArea ? (selArea.name.includes(" — ") ? selArea.name.split(" — ").pop().trim() : selArea.name) : "All Villages";
  const catLabel  = selCatId ? ((cats.find(c => c.id === selCatId) || {}).name || "All Services") : "All Services";

  return (
    <div style={{ minHeight: "100vh", background: PAPER, fontFamily: "'Times New Roman', serif", maxWidth: 860, margin: "0 auto", boxShadow: "0 2px 40px rgba(0,0,0,0.28)" }}>
      <link href="https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap" rel="stylesheet" />
      <div style={{ background: PAPER, padding: "12px 16px 8px", borderBottom: "3px double " + INK }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button onClick={onReset} style={{ background: "none", border: "1px solid " + INK, color: INK, borderRadius: 3, padding: "4px 12px", fontSize: 11, cursor: "pointer" }}>Back</button>
          <span style={{ fontSize: 32, fontWeight: 900, color: INK }}>
            <span style={{ fontFamily: "'Great Vibes', cursive", fontSize: "1.3em", color: TEAL }}>V</span>-Hub
          </span>
          <span style={{ fontSize: 11, color: INK_FADE, fontStyle: "italic" }}>{results.length} results</span>
        </div>
      </div>
      <div style={{ background: INK, padding: "8px 16px", textAlign: "center" }}>
        <div style={{ color: YELLOW, fontSize: 16, fontWeight: 900, letterSpacing: 1 }}>{catLabel}</div>
        <div style={{ color: PAPER_DK, fontSize: 10, fontStyle: "italic", marginTop: 2 }}>Serving: {areaLabel}</div>
      </div>
      <div style={{ padding: "0 16px" }}>
        {results.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: INK_FADE, fontSize: 13, fontStyle: "italic" }}>
            No providers found. Try a different service or village.
            <div style={{ marginTop: 16 }}>
              <a href="/ListService" style={{ color: BROWN, fontWeight: 700 }}>List Your Service</a>
            </div>
          </div>
        ) : (
          results.map((p, i) => <ProvCard key={p.id || i} p={p} onSel={onSel} svcs={svcs} />)
        )}
      </div>
      <div style={{ borderTop: "2px solid " + INK, padding: "10px 16px", textAlign: "center", fontSize: 10, color: INK_FADE, fontStyle: "italic" }}>
        V-Hub The Villages, Florida
      </div>
    </div>
  );
}

// ── Village Dropdown ────────────────────────────────────────────────────────
function VillageDropdown({ areas, value, onChange }) {
  const [open, setOpen]     = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const macros   = areas.filter(a => MACRO_AREAS.includes(a.name));
  const villages = areas.filter(a => {
    if (MACRO_AREAS.includes(a.name)) return false;
    const label = a.name.includes(" — ") ? a.name.split(" — ").pop().trim() : a.name;
    return label.toLowerCase().includes(search.toLowerCase());
  });
  const selectedLabel = value ? (value.name.includes(" — ") ? value.name.split(" — ").pop().trim() : value.name) : null;

  return (
    <div ref={ref} style={{ position: "relative", flex: 1, minWidth: 0 }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ width: "100%", background: PAPER, border: "2.5px solid " + YELLOW, boxShadow: "0 0 0 1.5px " + YELLOW + "55", borderRadius: 6, padding: "11px 13px", fontSize: 14, fontFamily: "'Times New Roman', serif", color: value ? INK : INK_FADE, cursor: "pointer", textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>{selectedLabel || "Select a Village..."}</span>
        {value && <span onClick={e => { e.stopPropagation(); onChange(null); }} style={{ fontSize: 14, color: INK_FADE }}>x</span>}
      </button>
      {open && (
        <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 200, background: PAPER, border: "2px solid " + YELLOW, borderRadius: 6, boxShadow: "0 6px 24px rgba(0,0,0,0.18)", maxHeight: 320, display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "6px 8px", borderBottom: "1px solid " + PAPER_DK }}>
            <input autoFocus value={search} onChange={e => setSearch(e.target.value)} placeholder="Search village..."
              style={{ width: "100%", boxSizing: "border-box", border: "1px solid " + PAPER_DK, borderRadius: 4, padding: "5px 8px", fontSize: 12, fontFamily: "'Times New Roman', serif", background: PAPER_MID }} />
          </div>
          <div style={{ overflowY: "auto", flex: 1 }}>
            {!search && (
              <>
                <div style={{ padding: "4px 10px 2px", fontSize: 9, color: INK_FADE, textTransform: "uppercase", letterSpacing: 1 }}>Search By Region</div>
                {macros.map(a => (
                  <div key={a.id} onClick={() => { onChange(a); setOpen(false); setSearch(""); }}
                    style={{ padding: "9px 12px", cursor: "pointer", fontSize: 12, color: NAVY, fontWeight: 700, background: value?.id === a.id ? PAPER_MID : "transparent" }}>
                    {a.name}
                  </div>
                ))}
                <div style={{ height: 1, background: PAPER_DK, margin: "4px 0" }} />
                <div style={{ padding: "4px 10px 2px", fontSize: 9, color: INK_FADE, textTransform: "uppercase", letterSpacing: 1 }}>Individual Village</div>
              </>
            )}
            {villages.map(a => {
              const label = a.name.includes(" — ") ? a.name.split(" — ").pop().trim() : a.name;
              return (
                <div key={a.id} onClick={() => { onChange(a); setOpen(false); setSearch(""); }}
                  style={{ padding: "8px 12px", cursor: "pointer", fontSize: 13, color: INK, background: value?.id === a.id ? PAPER_MID : "transparent" }}>
                  {label}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Service Dropdown ────────────────────────────────────────────────────────
// Two-level: tap a category (macro) → see its services (micro) → tap service → closes & displays choice
function ServiceDropdown({ cats, svcs, value, onChange }) {
  const [open, setOpen]           = useState(false);
  const [activeCat, setActiveCat] = useState(null);
  const [rect, setRect]           = useState(null);
  const btnRef = useRef(null);
  const panelRef = useRef(null);

  // Measure button position for fixed-position portal
  const openDropdown = () => {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setRect(r);
    }
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const h = e => {
      if (panelRef.current && !panelRef.current.contains(e.target) &&
          btnRef.current && !btnRef.current.contains(e.target)) {
        setOpen(false); setActiveCat(null);
      }
    };
    document.addEventListener("mousedown", h);
    document.addEventListener("touchstart", h);
    return () => { document.removeEventListener("mousedown", h); document.removeEventListener("touchstart", h); };
  }, [open]);

  const sortedCats    = cats.filter(c => c.is_active !== false);
  const selectedSvc   = value ? svcs.find(s => s.id === value) : null;
  const selectedLabel = selectedSvc
    ? (cats.find(c => c.id === selectedSvc.category_id)?.name
        ? cats.find(c => c.id === selectedSvc.category_id).name + " › " + selectedSvc.name
        : selectedSvc.name)
    : null;

  const handleCatClick = (cat) => {
    const catSvcs = svcs.filter(s => s.category_id === cat.id && s.is_active !== false);
    if (!catSvcs.length) return;
    setActiveCat(prev => prev?.id === cat.id ? null : cat);
  };

  const handleSvcClick = (svcId) => {
    onChange(svcId);
    setOpen(false);
    setActiveCat(null);
  };

  // Portal panel style — fixed to viewport, always opens downward, tall enough for all 9 categories
  const panelStyle = rect ? {
    position: "fixed",
    top: rect.bottom + 4,
    left: rect.left,
    width: rect.width,
    zIndex: 9999,
    background: PAPER,
    border: "2px solid " + YELLOW,
    borderRadius: 6,
    boxShadow: "0 8px 28px rgba(0,0,0,0.22)",
    maxHeight: Math.min(window.innerHeight - rect.bottom - 10, 520),
    overflowY: "auto",
    WebkitOverflowScrolling: "touch",
  } : {};

  return (
    <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
      {/* Trigger button */}
      <button ref={btnRef}
        onClick={() => { if (open) { setOpen(false); setActiveCat(null); } else { openDropdown(); } }}
        style={{ width: "100%", background: PAPER, border: "2.5px solid " + YELLOW, boxShadow: "0 0 0 1.5px " + YELLOW + "55", borderRadius: 6, padding: "11px 13px", fontSize: 14, fontFamily: "'Times New Roman', serif", color: value ? INK : INK_FADE, cursor: "pointer", textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6 }}>
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{selectedLabel || "Select a Service..."}</span>
        {value
          ? <span onClick={e => { e.stopPropagation(); onChange(null); setActiveCat(null); }} style={{ fontSize: 14, color: INK_FADE, flexShrink: 0, lineHeight: 1 }}>✕</span>
          : <span style={{ fontSize: 10, color: INK_FADE, flexShrink: 0 }}>{open ? "▲" : "▼"}</span>
        }
      </button>

      {/* Fixed-position dropdown panel — escapes all overflow clipping */}
      {open && rect && (
        <div ref={panelRef} style={panelStyle}>

          {/* Category list (macro) */}
          {!activeCat && (
            <>
              <div style={{ padding: "4px 10px 3px", fontSize: 9, color: INK_FADE, textTransform: "uppercase", letterSpacing: 1, borderBottom: "1px solid " + PAPER_DK, position: "sticky", top: 0, background: PAPER, zIndex: 1 }}>
                Tap a category to see services
              </div>
              {sortedCats.map(cat => {
                const catSvcs = svcs.filter(s => s.category_id === cat.id && s.is_active !== false);
                if (!catSvcs.length) return null;
                return (
                  <div key={cat.id}
                    onClick={() => handleCatClick(cat)}
                    style={{ padding: "7px 12px", cursor: "pointer", fontSize: 12, fontWeight: 700, color: INK, background: "transparent", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid " + PAPER_DK + "88" }}>
                    <span>{cat.icon} {cat.name}</span>
                    <span style={{ fontSize: 11, color: BROWN }}>▶</span>
                  </div>
                );
              })}
            </>
          )}

          {/* Services list (micro) */}
          {activeCat && (
            <>
              <div onClick={() => setActiveCat(null)}
                style={{ padding: "10px 14px", cursor: "pointer", fontSize: 12, fontWeight: 700, color: NAVY, background: PAPER_MID, borderBottom: "2px solid " + YELLOW, display: "flex", alignItems: "center", gap: 6, position: "sticky", top: 0, zIndex: 1 }}>
                <span style={{ fontSize: 14 }}>◀</span> {activeCat.icon} {activeCat.name}
              </div>
              {svcs.filter(s => s.category_id === activeCat.id && s.is_active !== false).map(s => (
                <div key={s.id}
                  onClick={() => handleSvcClick(s.id)}
                  style={{ padding: "11px 16px 11px 22px", cursor: "pointer", fontSize: 13, color: value === s.id ? BROWN : INK, fontWeight: value === s.id ? 700 : 400, background: value === s.id ? PAPER_MID : "transparent", borderBottom: "1px solid " + PAPER_DK + "55" }}>
                  {s.name}
                  {value === s.id && <span style={{ marginLeft: 6, color: BROWN }}>✓</span>}
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── MAIN EXPORT ─────────────────────────────────────────────────────────────
export default function Home() {
  useMeta({ title: "V-Hub | The Villages, FL Local Services Directory", description: "Find trusted local service providers in The Villages, FL. Search HVAC, lawn care, golf cart repair, pet services, cleaning, and more — all in one place.", canonical: "https://www.v-hub.us/" });

  const [areas,     setAreas]     = useState([]);
  const [cats,      setCats]      = useState([]);
  const [svcs,      setSvcs]      = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  const [selSvc,   setSelSvc]   = useState(null);
  const [selArea,  setSelArea]  = useState(null);
  const [results,  setResults]  = useState([]);
  const [searched, setSearched] = useState(false);
  const [selProv,  setSelProv]  = useState(null);
  const [selAreaR, setSelAreaR] = useState(null);
  const [selCatR,  setSelCatR]  = useState(null);

  useEffect(() => {
    // Load lookup data + providers via entity SDK (client-side, no backend needed)
    Promise.all([
      Category.list({ limit: 200 }).catch(() => []),
      Service.list({ limit: 500 }).catch(() => []),
      ServiceArea.list({ limit: 500 }).catch(() => []),
      (async () => {
        let all = [], skip = 0;
        while (true) {
          const page = await Provider.list({ limit: 500, skip }).catch(() => []);
          if (!page || page.length === 0) break;
          all = all.concat(page);
          if (page.length < 500) break;
          skip += 500;
        }
        return all;
      })().catch(() => []),
      User.me().catch(() => null),
    ]).then(([cats, svcs, areas, allProviders, u]) => {
      setAreas(areas || []);
      setCats(cats || []);
      setSvcs(svcs || []);
      // Only show active + visible providers
      const active = (allProviders || []).filter(p => p.is_active && p.is_visible);
      setProviders(active);
      setCurrentUser(u);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleSearch = () => {
    if (!selSvc) return;  // service is required; village is optional
    const isMacro = selArea ? MACRO_AREAS.includes(selArea.name) : false;
    const targetName = selArea && selArea.name.includes(" — ") ? selArea.name.split(" — ").pop().trim() : (selArea?.name || "");

    const matched = providers.filter(p => {
      if (!(p.services || []).includes(selSvc)) return false;
      // If no area selected — show all providers for that service
      if (!selArea) return true;
      const pAreas = p.service_areas || [];
      if (pAreas.includes(selArea.id)) return true;
      return pAreas.some(aid => {
        const a = areas.find(x => x.id === aid);
        if (!a) return false;
        if (isMacro) return a.name.startsWith(selArea.name) || a.name === selArea.name;
        const aName = a.name.includes(" — ") ? a.name.split(" — ").pop().trim() : a.name;
        return aName === targetName;
      });
    });

    matched.sort((a, b) => {
      const ts = t => t === "premium" ? 2 : t === "featured" ? 1 : 0;
      const d = ts(b.subscription_tier) - ts(a.subscription_tier);
      if (d !== 0) return d;
      const rA = (typeof a.rating === "number" && a.rating > 0) ? a.rating : (typeof a.google_rating === "number" ? a.google_rating : 0);
      const rB = (typeof b.rating === "number" && b.rating > 0) ? b.rating : (typeof b.google_rating === "number" ? b.google_rating : 0);
      return rB - rA;
    });

    fetch(API_BASE + "/trackEvent", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event_type: "search", service_id: selSvc, area_id: selArea?.id || null }),
    }).catch(() => {});

    setResults(matched);
    setSearched(true);
    setSelAreaR(selArea);
    setSelCatR((svcs.find(s => s.id === selSvc) || {}).category_id || null);
  };

  const reset = () => { setResults([]); setSearched(false); setSelProv(null); setSelAreaR(null); setSelCatR(null); setSelSvc(null); setSelArea(null); };

  if (selProv) return <ProvDetail prov={selProv} areas={areas} cats={cats} svcs={svcs} onBack={() => setSelProv(null)} />;
  if (searched) return <Results results={results} areas={areas} cats={cats} svcs={svcs} onReset={reset} onSel={setSelProv} selArea={selAreaR} selCatId={selCatR} />;

  const svcSelected = !!selSvc;  // village is optional — only service required to search

  return (
    <div style={{ minHeight: "100vh", background: PAPER, backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 27px,rgba(28,15,0,0.04) 27px,rgba(28,15,0,0.04) 28px)", fontFamily: "'Times New Roman', serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap" rel="stylesheet" />
      <style>{"* { box-sizing: border-box; } body, html { margin: 0; padding: 0; overflow-x: hidden; }"}</style>

      {/* Masthead */}
      <div style={{ background: PAPER, borderBottom: "3px double " + INK, padding: "8px 14px 6px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <a href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
            <img src="https://media.base44.com/images/public/69d062aca815ce8e697894b1/a9af95bc3_V-Hublogo.png" alt="V-Hub" style={{ height: 48, width: 48, objectFit: "contain" }} />
            <div>
              <div style={{ fontFamily: "'Great Vibes', cursive", fontSize: 32, color: TEAL, lineHeight: 1 }}>V</div>
              <div style={{ fontFamily: "'Times New Roman', serif", fontSize: 13, fontWeight: 900, color: INK, letterSpacing: 3, lineHeight: 1, textTransform: "uppercase" }}>Hub</div>
            </div>
          </a>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 9, letterSpacing: 3, color: INK_FADE, textTransform: "uppercase" }}>Est. 2026</div>
            <div style={{ fontSize: 11, color: INK_FADE, fontStyle: "italic" }}>The Villages, Florida</div>
          </div>
          <Burger currentUser={currentUser} />
        </div>
        <Rule thick style={{ maxWidth: 860, margin: "6px auto 0" }} />
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 12px" }}>
        {/* Find Services box */}
        <div style={{ margin: "18px 0", border: "4px solid " + GREEN, borderRadius: 8, background: PAPER_MID, overflow: "visible" }}>
          <div style={{ background: INK, padding: "8px 14px", textAlign: "center" }}>
            <div style={{ color: PAPER, fontWeight: 900, fontSize: 15, textTransform: "uppercase", letterSpacing: 3 }}>Find Services</div>
            <div style={{ color: PAPER_DK, fontSize: 10, fontStyle: "italic", marginTop: 1 }}>Select a service · village is optional</div>
          </div>
          <div style={{ padding: "14px 12px" }}>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
              <ServiceDropdown cats={cats} svcs={svcs} value={selSvc} onChange={setSelSvc} />
              <VillageDropdown areas={areas} value={selArea} onChange={setSelArea} />
            </div>
            <button
              onClick={handleSearch}
              disabled={!svcSelected}
              style={{ width: "100%", background: svcSelected ? "linear-gradient(180deg,#2E7D32," + GREEN + ")" : PAPER_DK, color: svcSelected ? "#fff" : INK_FADE, border: "3px solid " + (svcSelected ? GREEN : PAPER_DK), borderRadius: 6, padding: "13px 0", fontSize: 15, fontWeight: 900, cursor: svcSelected ? "pointer" : "not-allowed", fontFamily: "'Times New Roman', serif", letterSpacing: 2, textTransform: "uppercase" }}
            >
              Find Services
            </button>
          </div>
        </div>

        {/* Hero image */}
        <div style={{ borderRadius: 8, overflow: "hidden", marginBottom: 18, border: "2px solid " + PAPER_DK, maxHeight: 220 }}>
          <img src="https://media.base44.com/images/public/69d062aca815ce8e697894b1/1148d0041_V-HublocalservicesinTheVillages.png" alt="V-Hub The Villages" style={{ width: "100%", height: 220, objectFit: "cover" }} />
        </div>

        {/* Deals of the Week — sale tag style */}
        <div style={{ marginBottom: 18, textAlign: "center" }}>
          <a href="/Classifieds" style={{ textDecoration: "none" }}>
            <div style={{
              background: "linear-gradient(160deg, #D10000 0%, #FF1A1A 45%, #B80000 100%)",
              border: "3px solid #8B0000",
              borderRadius: 6,
              padding: "14px 28px 16px",
              display: "inline-block",
              minWidth: 260,
              boxShadow: "0 4px 18px rgba(180,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.15)",
              position: "relative",
              overflow: "visible"
            }}>
              {/* "LIMITED TIME" ribbon label */}
              <div style={{ color: "#FFE066", fontSize: 10, fontWeight: 900, letterSpacing: 4, textTransform: "uppercase", marginBottom: 6, fontFamily: "Arial, sans-serif" }}>
                🔥 LIMITED TIME ONLY 🔥
              </div>
              {/* Main deal text */}
              <div style={{ color: "#FFFFFF", fontSize: 26, fontWeight: 900, fontFamily: "Arial Black, Arial, sans-serif", letterSpacing: 0, lineHeight: 1.1, textTransform: "uppercase", textShadow: "0 2px 6px rgba(0,0,0,0.4)" }}>
                DEALS OF THE WEEK
              </div>
              {/* Sub-label */}
              <div style={{ color: "#FFCCCC", fontSize: 11, fontWeight: 700, fontFamily: "Arial, sans-serif", marginTop: 7, letterSpacing: 1, textTransform: "uppercase" }}>
                Local Specials &amp; Offers — Don&apos;t Miss Out!
              </div>
            </div>
          </a>
        </div>

        {/* List / Provider Hub */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
          <a href="/ListService" style={{ textDecoration: "none" }}>
            <div style={{ background: PAPER, border: "3px solid " + NAVY, borderRadius: 8, padding: "14px 12px", textAlign: "center" }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>📋</div>
              <div style={{ color: NAVY, fontWeight: 900, fontSize: 13, textTransform: "uppercase", letterSpacing: 1 }}>List My Service</div>
              <div style={{ color: INK_FADE, fontSize: 10, fontStyle: "italic", marginTop: 4 }}>Get discovered by neighbors</div>
            </div>
          </a>
          <a href="/ProviderDashboard" style={{ textDecoration: "none" }}>
            <div style={{ background: PAPER, border: "3px solid " + NAVY, borderRadius: 8, padding: "14px 12px", textAlign: "center" }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>🔑</div>
              <div style={{ color: NAVY, fontWeight: 900, fontSize: 13, textTransform: "uppercase", letterSpacing: 1 }}>Provider Hub</div>
              <div style={{ color: INK_FADE, fontSize: 10, fontStyle: "italic", marginTop: 4 }}>Manage your listing</div>
            </div>
          </a>
        </div>

        {/* Newspaper columns */}
        <Rule thick style={{ marginBottom: 16 }} />
        <div style={{ textAlign: "center", fontSize: 11, color: INK_FADE, textTransform: "uppercase", letterSpacing: 4, marginBottom: 14 }}>Community News</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0 18px", marginBottom: 24 }}>
          {[
            { head: "LOCAL SERVICES ON THE RISE", body: "Residents report record demand for trusted local service providers. From landscaping crews in Eastport to home repair specialists in Spanish Springs, the marketplace has never been more active." },
            { head: "COMMUNITY PULSE", body: "Spring means pool openings, golf cart tune-ups, and patio projects. Residents turn to V-Hub to find trusted local professionals. New to The Villages? V-Hub helps newcomers find reliable providers fast." },
            { head: "YOUR SAFETY, OUR PRIORITY", body: "Every business on V-Hub is reviewed before appearing in results. Resident feedback keeps quality high. Questions? Contact admin@v-hub.us — our team responds quickly." },
          ].map((col, i) => (
            <div key={i} style={{ borderLeft: i > 0 ? "1px solid " + PAPER_DK : "none", paddingLeft: i > 0 ? 18 : 0 }}>
              <Rule style={{ marginBottom: 8 }} />
              <div style={{ fontSize: 10, fontWeight: 900, color: INK, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6, lineHeight: 1.2 }}>{col.head}</div>
              <div style={{ fontSize: 11, color: INK, lineHeight: 1.6, fontFamily: "Georgia, serif" }}>{col.body}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: INK, borderTop: "3px double " + PAPER_DK, padding: "14px 16px", textAlign: "center" }}>
        <div style={{ color: PAPER_DK, fontSize: 11 }}>
          2026 V-Hub The Villages, Florida
          {" · "}
          <a href="/Terms" style={{ color: PAPER_DK }}>Terms</a>
          {" · "}
          <a href="/Privacy" style={{ color: PAPER_DK }}>Privacy</a>
          {" · "}
          <a href="mailto:admin@v-hub.us" style={{ color: PAPER_DK }}>admin@v-hub.us</a>
        </div>
      </div>
    </div>
  );
}
