// V-Hub Provider Profile Page — standalone, no homepage
import React, { useState, useEffect } from "react";
import { Provider, ProviderReview, ServiceArea, Category, Service } from "@/api/entities";

const API_BASE = "https://api.base44.app/api/apps/69d062aca815ce8e697894b1/functions";

const INK       = "#1C0F00";
const INK_FADE  = "#5C3A10";
const PAPER     = "#F0E6C8";
const PAPER_MID = "#E4D5A8";
const PAPER_DK  = "#C8B07A";
const BROWN_BTN = "#7A4820";
const TEAL      = "#00BFA5";
const NAVY      = "#1B3D6F";

function Rule({ thick = false, style = {} }) {
  return (
    <div style={style}>
      <div style={{ height: thick ? 3 : 1, background: INK }} />
      {thick && <div style={{ height: 1, background: INK, marginTop: 2 }} />}
    </div>
  );
}

function Stars({ rating, size = 14 }) {
  const full = Math.floor(rating || 0);
  const half = (rating || 0) - full >= 0.5;
  return (
    <span style={{ fontSize: size, color: "#B8860B", letterSpacing: 1 }}>
      {"★".repeat(full)}{half ? "½" : ""}{"☆".repeat(5 - full - (half ? 1 : 0))}
    </span>
  );
}

export default function ProviderPage() {
  const [prov, setProv] = useState(null);
  const [areas, setAreas] = useState([]);
  const [cats, setCats] = useState([]);
  const [svcs, setSvcs] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewSaved, setReviewSaved] = useState(false);
  const [reviewForm, setReviewForm] = useState({ customer_name: "", customer_village: "", rating: 5, review_text: "", service_used: "" });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (!id) { setNotFound(true); setLoading(false); return; }

    // Set page title while loading
    document.title = "Loading provider… | V-Hub";

    Promise.all([
      fetch(`${API_BASE}/getProviders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ get_single: true, provider_id: id }),
      }).then(r => r.json()),
      ServiceArea.list(),
      Category.list(),
      Service.list(),
    ]).then(([provData, areasData, catsData, svcsData]) => {
      const found = provData.provider || null;
      if (!found) { setNotFound(true); setLoading(false); return; }
      setProv(found);
      setAreas(areasData || []);
      setCats(catsData || []);
      setSvcs(svcsData || []);

      document.title = `${found.business_name} | V-Hub`;

      // Load reviews
      ProviderReview.filter({ provider_id: found.id })
        .then(all => setReviews((all || []).filter(r => r.is_approved)))
        .catch(() => {});

      // Track profile view
      fetch(`${API_BASE}/trackEvent`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider_id: found.id, event_type: "profile_view", source: "classifieds" }),
      }).catch(() => {});

      setLoading(false);
    }).catch(() => { setNotFound(true); setLoading(false); });
  }, []);

  const handleReviewSubmit = async () => {
    if (!reviewForm.customer_name || !reviewForm.review_text) return;
    try {
      await ProviderReview.create({ ...reviewForm, provider_id: prov.id, is_approved: false, helpful_count: 0 });
      setReviewSaved(true);
      setShowReviewForm(false);
      setReviewForm({ customer_name: "", customer_village: "", rating: 5, review_text: "", service_used: "" });
    } catch {
      alert("There was a problem submitting your review. Please try again.");
    }
  };

  if (loading) return (
    <div style={{ background: PAPER, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
      <div style={{ fontSize: 48 }}>🏡</div>
      <div style={{ fontFamily: "Georgia, serif", fontSize: 18, color: INK }}>Loading provider profile…</div>
    </div>
  );

  if (notFound || !prov) return (
    <div style={{ background: PAPER, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, fontFamily: "Georgia, serif" }}>
      <div style={{ fontSize: 48 }}>🔍</div>
      <div style={{ fontSize: 20, color: INK }}>Provider not found</div>
      <a href="/Home" style={{ color: NAVY, fontSize: 14, marginTop: 8 }}>← Back to V-Hub</a>
    </div>
  );

  const cat = cats.find(c => c.id === prov.category_id);
  const svcMap = Object.fromEntries((svcs || []).map(s => [s.id, s.name]));
  const areaMap = Object.fromEntries((areas || []).map(a => [a.id, a.name.includes(' — ') ? a.name.split(' — ').pop().trim() : a.name]));

  const resolvedServices = (prov.services || []).map(s => svcMap[s] || null).filter(Boolean);
  const rawAreas = (prov.service_areas || []).map(a => areaMap[a] || null).filter(Boolean);
  const cleanAreas = rawAreas.filter(a => !/^[0-9a-f]{24}$/i.test(a));
  const totalAreas = Object.keys(areaMap).length || 114;
  const resolvedAreas = cleanAreas.length >= totalAreas * 0.9 ? ["All Villages — The Villages, FL"] : cleanAreas.length > 20 ? ["All Villages — The Villages, FL"] : cleanAreas;

  const vhubAvg = reviews.length > 0 ? reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length : null;
  const hasGoogleRating = typeof prov.google_rating === "number" && prov.google_rating > 0;

  const inputS = { width: "100%", boxSizing: "border-box", background: PAPER, border: `1.5px solid ${PAPER_DK}`, borderRadius: 4, color: INK, fontFamily: "'Times New Roman', serif", fontSize: 13, padding: "8px 11px", outline: "none" };
  const lblS = { fontSize: 10, fontWeight: 700, color: INK_FADE, textTransform: "uppercase", letterSpacing: 1, marginBottom: 3, display: "block", fontFamily: "'Times New Roman', serif" };

  return (
    <div style={{ minHeight: "100vh", background: PAPER, fontFamily: "'Times New Roman', serif", maxWidth: 860, margin: "0 auto", boxShadow: "0 2px 40px rgba(0,0,0,0.18)" }}>

      {/* Top bar */}
      <div style={{ background: INK, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
        <a href="/Home" style={{ background: "rgba(255,255,255,0.15)", border: "none", color: PAPER, borderRadius: 3, padding: "4px 10px", fontSize: 12, cursor: "pointer", textDecoration: "none" }}>← Home</a>
        <span style={{ color: PAPER, fontWeight: 700, fontSize: 13, letterSpacing: 1 }}>V-Hub</span>
        {prov.vh_number && <span style={{ marginLeft: "auto", background: "rgba(255,255,255,0.12)", color: PAPER, fontSize: 11, padding: "2px 10px", borderRadius: 10, letterSpacing: 1 }}>{prov.vh_number}</span>}
      </div>

      <div style={{ padding: "16px" }}>

        {/* Header */}
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 8 }}>
          {prov.logo_url && <img src={prov.logo_url} alt="logo" style={{ width: 72, height: 72, borderRadius: 8, objectFit: "cover", border: `1px solid ${PAPER_DK}`, flexShrink: 0 }} />}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: INK, lineHeight: 1.15, wordBreak: "break-word" }}>{prov.business_name}</div>
            {cat && <div style={{ fontSize: 12, color: INK_FADE, marginTop: 2 }}>{cat.icon} {cat.name}</div>}
            {vhubAvg !== null && (
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 5 }}>
                <Stars rating={vhubAvg} size={14} />
                <span style={{ fontSize: 11, color: TEAL, fontWeight: 700 }}>{vhubAvg.toFixed(1)}/5</span>
                <span style={{ fontSize: 11, color: INK_FADE }}>· {reviews.length} V-Hub review{reviews.length !== 1 ? "s" : ""}</span>
              </div>
            )}
            {hasGoogleRating && (
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 3 }}>
                <span style={{ fontSize: 12, color: "#F9A825" }}>{"★".repeat(Math.round(prov.google_rating))}</span>
                <span style={{ fontSize: 11, color: "#4285F4", fontWeight: 700 }}>{prov.google_rating}/5 Google</span>
                {prov.google_review_url && (
                  <a href={prov.google_review_url} target="_blank" rel="noreferrer" style={{ fontSize: 10, color: "#4285F4", textDecoration: "underline", marginLeft: 2 }}>See reviews ↗</a>
                )}
              </div>
            )}
          </div>
        </div>

        <Rule thick style={{ marginBottom: 10 }} />

        {prov.description && <p style={{ fontSize: 13, color: INK, lineHeight: 1.7, marginBottom: 12 }}>{prov.description}</p>}

        {/* Location badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          {prov.is_mobile === true ? (
            <span style={{ background: "#E8F5E9", border: "1.5px solid #1A6B3C", borderRadius: 20, padding: "3px 12px", fontSize: 11, fontWeight: 700, color: "#1A6B3C", letterSpacing: 0.5 }}>🚐 Mobile — Travels to You</span>
          ) : prov.address ? (
            <span style={{ background: "#FFF8E1", border: "1.5px solid #B8860B", borderRadius: 20, padding: "3px 12px", fontSize: 11, fontWeight: 700, color: "#7B5E00", letterSpacing: 0.5 }}>🏪 Brick & Mortar</span>
          ) : null}
        </div>

        {/* Contact grid */}
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
              <a href={prov.website.startsWith("http") ? prov.website : "https://" + prov.website} target="_blank" rel="noreferrer" style={{ color: NAVY, wordBreak: "break-all" }}>
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
              <b>📋</b> Lic #{prov.license_number}
            </div>
          )}
        </div>

        {/* CTA buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
          {prov.phone && (
            <a href={"tel:" + prov.phone} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "#1A6B3C", color: "#fff", borderRadius: 10, padding: "14px 18px", textDecoration: "none", fontWeight: 800, fontSize: 16 }}>
              📞 Call Now
            </a>
          )}
          {prov.website && (
            <a href={prov.website.startsWith("http") ? prov.website : "https://" + prov.website} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: NAVY, color: "#fff", borderRadius: 10, padding: "13px 18px", textDecoration: "none", fontWeight: 700, fontSize: 14 }}>
              🌐 Visit Website
            </a>
          )}
        </div>

        <Rule style={{ marginBottom: 12 }} />

        {/* Services */}
        {resolvedServices.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 900, color: INK, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6 }}>Services Offered</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {resolvedServices.map((s, i) => (
                <span key={i} style={{ background: PAPER_MID, border: `1px solid ${PAPER_DK}`, borderRadius: 20, padding: "3px 10px", fontSize: 11, color: INK_FADE, fontFamily: "'Times New Roman', serif" }}>{s}</span>
              ))}
            </div>
          </div>
        )}

        {/* Areas */}
        {resolvedAreas.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 900, color: INK, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6 }}>Service Areas</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {resolvedAreas.map((a, i) => (
                <span key={i} style={{ background: "#E8F5E9", border: "1px solid #A5D6A7", borderRadius: 20, padding: "3px 10px", fontSize: 11, color: "#1A6B3C" }}>{a}</span>
              ))}
            </div>
          </div>
        )}

        <Rule style={{ marginBottom: 14 }} />

        {/* Reviews */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 900, color: INK, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10 }}>
            Villager Reviews {reviews.length > 0 && <span style={{ color: INK_FADE, fontWeight: 400 }}>({reviews.length})</span>}
          </div>

          {reviews.length === 0 && !reviewSaved && (
            <p style={{ fontSize: 12, color: INK_FADE, fontStyle: "italic", marginBottom: 10 }}>No reviews yet — be the first!</p>
          )}

          {reviewSaved && (
            <div style={{ background: "#E8F5E9", border: "1.5px solid #1A6B3C", borderRadius: 8, padding: "10px 14px", marginBottom: 12, fontSize: 13, color: "#1A6B3C", fontWeight: 700 }}>
              ✅ Thank you! Your review has been submitted for approval.
            </div>
          )}

          {reviews.map((r, i) => (
            <div key={i} style={{ borderBottom: `1px solid ${PAPER_DK}`, paddingBottom: 10, marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                <Stars rating={r.rating} size={12} />
                <span style={{ fontWeight: 700, fontSize: 12, color: INK }}>{r.customer_name}</span>
                {r.customer_village && <span style={{ fontSize: 11, color: INK_FADE }}>· {r.customer_village}</span>}
              </div>
              {r.service_used && <div style={{ fontSize: 11, color: INK_FADE, marginBottom: 3, fontStyle: "italic" }}>Service: {r.service_used}</div>}
              <p style={{ fontSize: 12, color: INK, lineHeight: 1.6, margin: 0 }}>{r.review_text}</p>
              {r.provider_reply && (
                <div style={{ background: PAPER_MID, borderLeft: `3px solid ${BROWN_BTN}`, padding: "8px 10px", marginTop: 8, borderRadius: "0 4px 4px 0" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: BROWN_BTN, marginBottom: 3, textTransform: "uppercase", letterSpacing: 0.8 }}>Response from {prov.business_name}</div>
                  <p style={{ fontSize: 12, color: INK, lineHeight: 1.6, margin: 0 }}>{r.provider_reply}</p>
                </div>
              )}
            </div>
          ))}

          {!showReviewForm && !reviewSaved && (
            <button onClick={() => setShowReviewForm(true)} style={{ background: BROWN_BTN, color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer", width: "100%", marginTop: 4 }}>
              ✍️ Leave a Review
            </button>
          )}

          {showReviewForm && (
            <div style={{ background: PAPER_MID, border: `1.5px solid ${PAPER_DK}`, borderRadius: 8, padding: "14px", marginTop: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 900, color: INK, marginBottom: 10 }}>Write a Review</div>
              <div style={{ marginBottom: 8 }}>
                <label style={lblS}>Your Name *</label>
                <input style={inputS} value={reviewForm.customer_name} onChange={e => setReviewForm(f => ({ ...f, customer_name: e.target.value }))} placeholder="Jane D." />
              </div>
              <div style={{ marginBottom: 8 }}>
                <label style={lblS}>Your Village</label>
                <input style={inputS} value={reviewForm.customer_village} onChange={e => setReviewForm(f => ({ ...f, customer_village: e.target.value }))} placeholder="e.g. Springdale" />
              </div>
              <div style={{ marginBottom: 8 }}>
                <label style={lblS}>Service Used</label>
                <input style={inputS} value={reviewForm.service_used} onChange={e => setReviewForm(f => ({ ...f, service_used: e.target.value }))} placeholder="e.g. Lawn Mowing" />
              </div>
              <div style={{ marginBottom: 8 }}>
                <label style={lblS}>Rating *</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {[1,2,3,4,5].map(n => (
                    <button key={n} onClick={() => setReviewForm(f => ({ ...f, rating: n }))}
                      style={{ background: reviewForm.rating >= n ? "#B8860B" : PAPER_MID, color: reviewForm.rating >= n ? "#fff" : INK_FADE, border: `1px solid ${PAPER_DK}`, borderRadius: 4, padding: "5px 10px", cursor: "pointer", fontSize: 14 }}>
                      ★
                    </button>
                  ))}
                  <span style={{ fontSize: 12, color: INK_FADE, alignSelf: "center" }}>{reviewForm.rating}/5</span>
                </div>
              </div>
              <div style={{ marginBottom: 10 }}>
                <label style={lblS}>Your Review *</label>
                <textarea style={{ ...inputS, minHeight: 80, resize: "vertical" }} value={reviewForm.review_text} onChange={e => setReviewForm(f => ({ ...f, review_text: e.target.value }))} placeholder="Share your experience…" />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={handleReviewSubmit} style={{ flex: 1, background: "#1A6B3C", color: "#fff", border: "none", borderRadius: 8, padding: "11px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Submit Review</button>
                <button onClick={() => setShowReviewForm(false)} style={{ background: PAPER_MID, color: INK_FADE, border: `1px solid ${PAPER_DK}`, borderRadius: 8, padding: "11px 16px", fontSize: 13, cursor: "pointer" }}>Cancel</button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", padding: "16px 0 8px", borderTop: `1px solid ${PAPER_DK}`, marginTop: 8 }}>
          <a href="/Home" style={{ color: NAVY, fontSize: 13, textDecoration: "none", fontWeight: 700 }}>← Back to V-Hub Directory</a>
        </div>

      </div>
    </div>
  );
}
