import React, { useState, useEffect, useRef } from "react"; // v3 - expanded content
import { createPortal } from "react-dom";
import { ServiceArea, Category, Service, Provider, ProviderReview, User } from "@/api/entities";

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
    setMeta("viewport", "width=device-width, initial-scale=1.0, maximum-scale=1.0");
    // Open Graph
    setMeta("og:type", "website", true);
    setMeta("og:site_name", "V-Hub", true);
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

// Newspaper stories — each has headline, subhead, paragraphs
const NEWSPAPER_CONTENT = {
  neighborhoodWatch: {
    headline: "LOCAL SERVICES ON THE RISE",
    subhead: "Demand surges as Villages community expands southward",
    body: [
      "Residents across The Villages report record demand for trusted local service providers this season. From landscaping crews working the new Eastport neighborhoods to home repair specialists fielding calls from Brownwood to Spanish Springs, the marketplace has never been more active.",
      "Community association leaders say the growth reflects the Villages' continued expansion. 'We need reliable, vetted professionals who understand our lifestyle,' said one resident near Lake Sumter Landing.",
    ]
  },
  providerSpotlight: {
    headline: "TRUSTED NAMES, LOCAL ROOTS",
    subhead: "Established providers bring decades of expertise to your door",
    body: [
      "Many of The Villages' most beloved service providers have called this community home for over a decade. From family-owned landscaping operations to licensed electricians who know every neighborhood street by name, local expertise makes all the difference.",
      "V-Hub's verified directory ensures every listing meets the community's high standards. Browse by home repair, landscaping, pet care, tech help, cleaning, transportation, and more — contact providers directly, no fees, no middlemen.",
    ]
  },
  howItWorks: {
    headline: "FIND YOUR PROVIDER IN SECONDS",
    subhead: "Search by service, then by your village — results appear instantly",
    body: [
      "Simply select the service you need from the dropdown — choose a specific subcategory like 'Window Replacement' or 'Pet Grooming' — then pick your village from the list. Hit Find Services and see every matching provider who serves your area.",
    ]
  },
  growthStory: {
    headline: "VILLAGES ECONOMY THRIVES",
    subhead: "Small businesses flourish as new residents arrive weekly",
    body: [
      "The Villages remains one of Florida's fastest-growing communities, drawing hundreds of new residents every month. With that growth comes opportunity — for local entrepreneurs, tradespeople, and service professionals eager to build their client base.",
      "Community leaders gathered recently to discuss expanded support for small business owners. New listing tiers on V-Hub allow providers to reach exactly the neighborhoods they serve.",
      "From plumbers and electricians to dog groomers and personal shoppers, the demand for skilled local help has surged across all 97 villages — from Alhambra to Woodbury.",
      "V-Hub was built specifically for this community. No national spam, no out-of-area listings — just real neighbors helping real neighbors, one village at a time.",
      "Local service businesses report a 40% increase in new customer inquiries since listing on V-Hub. Providers say the platform delivers exactly the kind of community-focused exposure that national directories cannot match.",
      "Residents in newer developments like Eastport and Fenney say finding reliable local help used to mean long waits and out-of-area contractors. V-Hub has changed that — connecting them with pros who already know the streets, the homes, and the community standards.",
      "The directory currently lists providers across more than a dozen service categories, with new businesses joining every week. Whether you need a last-minute repair or a recurring weekly service, V-Hub has you covered.",
    ]
  },
  classifieds: {
    headline: "CLASSIFIEDS & NOTICES",
    subhead: "Local announcements from across the community",
    body: [
      "HANDYMAN SERVICES — Experienced, licensed contractor available for all interior and exterior repairs. Serving Historic Side and Established Villages. Call for free estimate.",
      "PET SITTING — Loving, attentive care while you travel. References available. Villages of Poinciana area.",
      "TECH HELP — Smartphone, tablet, and computer setup for seniors. Patient, friendly instruction at your home.",
      "LANDSCAPING — Weekly lawn maintenance, seasonal cleanup, and irrigation inspection. All Villages areas served.",
      "HOUSE CLEANING — Reliable, thorough cleaning service available weekly or bi-weekly. Serving Brownwood, Lake Sumter Landing, and surrounding villages. References upon request.",
      "TRANSPORTATION — Safe, dependable rides to medical appointments, shopping, and community events. Serving all Villages areas. Call to schedule.",
      "PET GROOMING — Full-service mobile grooming coming to your driveway. Dogs and cats welcome. Serving Spanish Springs and surrounding neighborhoods.",
      "POOL SERVICE — Licensed pool technician available for weekly maintenance, repairs, and seasonal openings. All Villages communities served.",
    ]
  },
  safetyTrust: {
    headline: "YOUR SAFETY, OUR PRIORITY",
    subhead: "V-Hub verifies every provider before they appear in results",
    body: [
      "Every business listed on V-Hub goes through a review process before appearing in search results. We check licensing where applicable, verify service areas, and monitor resident feedback to ensure quality stays high.",
      "Residents are encouraged to leave honest reviews after working with any provider. Your feedback helps your neighbors make better decisions — and keeps the directory trustworthy for the whole community.",
      "If you ever have a concern about a listed provider, V-Hub makes it easy to report. Our team reviews every submission and acts quickly to protect the community's standards.",
    ]
  },
  homeServices: {
    headline: "HOME SERVICES AT YOUR DOOR",
    subhead: "From repairs to landscaping — trusted pros serve every village",
    body: [
      "Whether you need a leaky faucet fixed, windows replaced, or your lawn trimmed before the weekend, V-Hub connects you with licensed, vetted professionals across every neighborhood.",
      "Categories include Home Repair, Landscaping, Cleaning, Pet Care, Tech Help, Transportation, and Personal Assistance. Find the right provider for your village today.",
      "Every provider listed on V-Hub is geo-specific to The Villages — so results are always relevant to your street, your neighborhood, your community.",
      "Look up a handyman in Fenney, a pet groomer near Marsh Bend, or a tech helper in Brownwood Square — V-Hub surfaces exactly who serves your area, nothing more.",
      "Providers are vetted by the V-Hub team before listing. Residents can leave reviews, rate their experience, and help neighbors make confident, informed choices.",
      "Whether you are new to The Villages or have lived here for years, V-Hub is the go-to directory for finding trusted help — fast, local, and always free to search.",
      "Home repair specialists on V-Hub range from licensed general contractors handling major renovations to skilled handymen available for same-week appointments. No job is too small when the right pro is just a click away.",
      "Landscaping professionals listed on V-Hub maintain hundreds of Villages properties each week — from manicured front lawns to full irrigation system installations. Many offer seasonal packages tailored to Florida's year-round growing season.",
      "Tech help providers specialize in working with seniors — setting up smartphones, configuring tablets, troubleshooting Wi-Fi, and teaching residents how to use video calling to stay connected with family. Patience and clarity are their hallmarks.",
      "Cleaning services range from weekly housekeeping to deep move-in cleans. Many providers serve specific villages and can accommodate residents with special scheduling needs or health sensitivities.",
    ]
  },
};

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
      <button onClick={() => setOpen(true)} style={{ background: "rgba(28,15,0,0.12)", border: `1px solid ${INK}44`, borderRadius: 4, width: 72, height: 72, cursor: "pointer", display: "flex", flexDirection: "column", gap: 6, justifyContent: "center", alignItems: "center", flexShrink: 0, padding: 0, boxSizing: "border-box" }}>
        {[0,1,2].map(i => <span key={i} style={{ display: "block", width: 24, height: 3, background: INK, borderRadius: 2 }} />)}
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
  "Historic Side": "Historic Side",
  "Established Villages": "Established Villages",
  "Newer Villages": "Newer Villages",
  "Eastport": "Eastport",
  "Family Villages": "Family & Non-Age-Restricted",
  "All Villages": "All Villages",
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

function ProvDetail({ prov, areas, cats, onBack }) {
  const [reviews, setReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewSaved, setReviewSaved] = useState(false);
  const [reviewForm, setReviewForm] = useState({ customer_name: "", customer_village: "", rating: 5, review_text: "", service_used: "" });
  const cat = cats.find(c => c.id === prov.category_id);
  const GREEN = "#1A6B3C";
  const RED_RULE = "#8B1A1A";
  const TEAL = "#00836B";

  useEffect(() => {
    ProviderReview.filter({ provider_id: prov.id })
      .then(all => setReviews((all || []).filter(r => r.is_approved)))
      .catch(() => setReviews([]));
    // increment profile view count
    Provider.update(prov.id, { profile_views: (prov.profile_views || 0) + 1 }).catch(() => {});
  }, [prov.id]);

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : null;

  const handleReviewSubmit = async () => {
    if (!reviewForm.customer_name || !reviewForm.review_text) return;
    await ProviderReview.create({ ...reviewForm, provider_id: prov.id, is_approved: false, helpful_count: 0 });
    setReviewSaved(true);
    setShowReviewForm(false);
  };

  const inputS = { width: "100%", boxSizing: "border-box", background: PAPER, border: `1.5px solid ${PAPER_DK}`, borderRadius: 4, color: INK, fontFamily: "'Times New Roman', serif", fontSize: 13, padding: "8px 11px", outline: "none" };
  const lblS = { fontSize: 10, fontWeight: 700, color: INK_FADE, textTransform: "uppercase", letterSpacing: 1, marginBottom: 3, display: "block", fontFamily: "'Times New Roman', serif" };

  return (
    <div style={{ minHeight: "100vh", background: PAPER, fontFamily: "'Times New Roman', serif", maxWidth: 860, margin: "0 auto", boxShadow: "0 2px 40px rgba(0,0,0,0.28)" }}>
      <div style={{ background: INK, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
        <button onClick={onBack} style={{ background: "rgba(255,255,255,0.15)", border: "none", color: PAPER, borderRadius: 3, padding: "4px 10px", fontSize: 12, cursor: "pointer" }}>← Back</button>
        <span style={{ color: PAPER, fontWeight: 700, fontSize: 13, letterSpacing: 1 }}>Provider Detail</span>
        {prov.provider_id && <span style={{ marginLeft: "auto", background: "rgba(255,255,255,0.12)", color: PAPER, fontSize: 11, padding: "2px 10px", borderRadius: 10, letterSpacing: 1 }}>ID: {prov.provider_id}</span>}
      </div>
      <div style={{ padding: "16px" }}>
        {/* Header */}
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 10 }}>
          {prov.logo_url && <img src={prov.logo_url} alt="logo" style={{ width: 64, height: 64, borderRadius: 6, objectFit: "cover", border: `1px solid ${PAPER_DK}` }} />}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: INK, lineHeight: 1.1 }}>{prov.business_name}</div>
            {cat && <div style={{ fontSize: 12, color: INK_FADE, marginTop: 2 }}>{cat.icon} {cat.name}</div>}
            {avgRating && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                <Stars rating={parseFloat(avgRating)} size={15} />
                <span style={{ fontSize: 12, color: INK_FADE }}>{avgRating}/5 · {reviews.length} V-Hub review{reviews.length !== 1 ? "s" : ""}</span>
              </div>
            )}
          </div>
        </div>

        <Rule thick style={{ marginBottom: 10 }} />

        {/* Description */}
        {prov.description && <p style={{ fontSize: 13, color: INK, lineHeight: 1.7, marginBottom: 12 }}>{prov.description}</p>}

        {/* Contact grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
          {prov.phone && <div style={{ fontSize: 12, color: INK }}><b>📞 Phone:</b> <a href={"tel:" + prov.phone} style={{ color: INK }}>{prov.phone}</a></div>}
          {prov.email && <div style={{ fontSize: 12, color: INK }}><b>✉️ Email:</b> <a href={"mailto:" + prov.email} style={{ color: BROWN_BTN }}>{prov.email}</a></div>}
          {prov.website && <div style={{ fontSize: 12, color: INK }}><b>🌐 Website:</b> <a href={prov.website} target="_blank" rel="noreferrer" style={{ color: "#1A3F70" }}>{prov.website.replace(/^https?:\/\//, "")}</a></div>}
          {prov.years_in_business && <div style={{ fontSize: 12, color: INK }}><b>📅 Years:</b> {prov.years_in_business}</div>}
          {prov.address && <div style={{ fontSize: 12, color: INK, gridColumn: "1/-1" }}><b>📍 Address:</b> {prov.address}</div>}
        </div>

        {/* Service areas */}
        {(prov.service_areas || []).length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: INK_FADE, textTransform: "uppercase", letterSpacing: 1, marginBottom: 5 }}>Areas Served</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {(prov.service_areas || []).map(a => (
                <span key={a} style={{ background: PAPER_MID, border: `1px solid ${PAPER_DK}`, borderRadius: 3, padding: "2px 8px", fontSize: 11, color: INK }}>
                  📍 {MACRO_AREAS_MAP[a] || a}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Services */}
        {(prov.services || []).length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: INK_FADE, textTransform: "uppercase", letterSpacing: 1, marginBottom: 5 }}>Services Offered</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {(prov.services || []).map(s => (
                <span key={s} style={{ background: BROWN_BTN, color: PAPER, borderRadius: 10, padding: "3px 10px", fontSize: 11, fontFamily: "'Times New Roman', serif" }}>{s}</span>
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

      {/* Footer: years / license / view profile */}
      <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          {p.years_in_business && <span style={{ fontSize: 10, color: INK_FADE, fontStyle: "italic", fontFamily: "'Times New Roman', serif" }}>Est. {new Date().getFullYear() - Math.round(p.years_in_business)} · {p.years_in_business} yrs in business</span>}
          {p.license_number && <span style={{ fontSize: 10, color: INK_FADE, fontStyle: "italic", fontFamily: "'Times New Roman', serif" }}>Lic# {p.license_number}</span>}
        </div>
        {onSel && (
          <button onClick={handleClick} style={{ background: BROWN_BTN, color: PAPER, border: "none", borderRadius: 4, padding: "5px 14px", fontSize: 11, cursor: "pointer", fontFamily: "'Times New Roman', serif", fontWeight: 700, letterSpacing: 1 }}>
            View Profile →
          </button>
        )}
      </div>
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
            <div style={{ textAlign: "center", padding: "60px 20px", color: INK_FADE, fontSize: 14, fontStyle: "italic" }}>
              No providers found for this search.<br />Try a different village or service.
            </div>
          ) : results.map((p, i) => <ClassifiedAd key={p.id || i} p={p} onSel={onSel} svcs={svcs} />)}
        </div>

        {/* ── FOOTER ── */}
        <div style={{ borderTop: `2px solid ${INK}`, padding: "10px 16px", textAlign: "center", fontSize: 10, color: INK_FADE, fontStyle: "italic" }}>
          © 2026 V-Hub · The Villages, Florida · Find Local Services · All rights reserved
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
      border: `3px solid ${YELLOW}`,
      boxShadow: `0 0 0 1.5px ${YELLOW}, 0 0 10px 2px rgba(255,220,0,0.35)`,
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

// ── Service Dropdown (inline, no portal) ─────────────────────────────────────
function SvcDropdown({ open, cats, svcs, openCat, selSvc, setOpenCat, setSelSvc, setSOpen }) {
  if (!open) return null;
  return (
    <div onClick={e => e.stopPropagation()} style={{
      position: "absolute", top: "calc(100% + 2px)", left: 0, right: 0,
      background: PAPER, border: `2px solid ${INK}`, borderRadius: 4,
      zIndex: 9999, boxShadow: "0 8px 28px rgba(0,0,0,0.4)",
      maxHeight: 400, overflowY: "auto",
    }}>
      {cats.length === 0 && <div style={{ padding: 12, fontSize: 12, color: INK_FADE }}>Loading...</div>}
      {cats.map(c => {
        const catSvcs = svcs.filter(s => s.category_id === c.id);
        const isExpanded = openCat === c.id;
        const parentSelected = selSvc?.category_id === c.id;
        return (
          <div key={c.id}>
            <div style={{ display: "flex", borderBottom: `1px solid ${PAPER_DK}`, background: parentSelected ? BROWN_HL : PAPER }}>
              <div
                onClick={e => { e.stopPropagation(); setSelSvc({ id: c.id, name: c.name, category_id: c.id, icon: c.icon, _isCat: true }); setSOpen(false); setOpenCat(null); }}
                style={{ flex: 1, padding: "12px 16px", fontSize: 16, fontWeight: 700, color: parentSelected ? "#fff" : INK, cursor: "pointer" }}>
                {c.icon} {c.name}
              </div>
              <div
                onClick={e => { e.stopPropagation(); setOpenCat(isExpanded ? null : c.id); }}
                style={{ padding: "10px 14px", fontSize: 10, color: parentSelected ? "#fff" : INK, cursor: "pointer", borderLeft: `1px solid ${PAPER_DK}`, display: "flex", alignItems: "center" }}>
                {isExpanded ? "▲" : "▼"}
              </div>
            </div>
            {isExpanded && catSvcs.map(s => {
              const isSvcSelected = selSvc?.id === s.id;
              return (
                <div key={s.id}
                  onClick={e => { e.stopPropagation(); setSelSvc(s); setSOpen(false); setOpenCat(null); }}
                  style={{ padding: "10px 16px 10px 32px", fontSize: 15, color: isSvcSelected ? "#fff" : INK, background: isSvcSelected ? BROWN_HL : PAPER_MID, borderBottom: `1px solid ${PAPER_DK}`, cursor: "pointer", fontWeight: isSvcSelected ? 700 : 400 }}>
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

// ── Village Dropdown (inline, no portal) ─────────────────────────────────────
function VilDropdown({ open, areas, selArea, setSelArea, setVOpen }) {
  if (!open) return null;
  const sorted = [...areas].sort((a, b) => a.name.localeCompare(b.name));
  return (
    <div onClick={e => e.stopPropagation()} style={{
      position: "absolute", top: "calc(100% + 2px)", left: 0, right: 0,
      background: PAPER, border: `2px solid ${INK}`, borderRadius: 4,
      zIndex: 9999, boxShadow: "0 8px 28px rgba(0,0,0,0.4)",
      maxHeight: 400, overflowY: "auto",
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
      {/* Split provider buttons */}
      <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
        <a href="/ListService" style={{ textDecoration: "none", flex: 1 }}>
          <button style={{
            width: "100%", background: `linear-gradient(180deg,#9A6030,${BROWN_BTN} 60%,#5A3010)`,
            border: `3px solid ${BROWN_BTN}`,
            borderRadius: 5, color: "#F5E8CC", fontFamily: "'Times New Roman', serif",
            fontWeight: 700, fontSize: 11, letterSpacing: 1.5, padding: "12px 6px", cursor: "pointer", boxSizing: "border-box",
            textTransform: "uppercase", lineHeight: 1.3,
          }}>
            📋 List Your<br/>Service
          </button>
        </a>
        <a href="/ProviderDashboard" style={{ textDecoration: "none", flex: 1 }}>
          <button style={{
            width: "100%", background: `linear-gradient(180deg,#9A6030,${BROWN_BTN} 60%,#5A3010)`,
            border: `3px solid ${BROWN_BTN}`,
            borderRadius: 5, color: "#F5E8CC", fontFamily: "'Times New Roman', serif",
            fontWeight: 700, fontSize: 11, letterSpacing: 1.5, padding: "12px 6px", cursor: "pointer", boxSizing: "border-box",
            textTransform: "uppercase", lineHeight: 1.3,
          }}>
            🔐 Provider<br/>Hub Sign In
          </button>
        </a>
      </div>
      <button onClick={e => { e.stopPropagation(); onSearch(selSvc, selArea); }} style={{
        width: "100%", background: `linear-gradient(180deg,#9A6030,${BROWN_BTN} 60%,#5A3010)`,
        border: `3px solid ${YELLOW}`, boxShadow: `0 0 0 1.5px ${YELLOW}, 0 0 10px 2px rgba(255,220,0,0.35)`,
        borderRadius: 5, color: "#F5E8CC", fontFamily: "'Times New Roman', serif",
        fontWeight: 700, fontSize: 14, letterSpacing: 3, padding: "13px", cursor: "pointer", boxSizing: "border-box",
        marginBottom: 12,
      }}>
        FIND SERVICES
      </button>
      <div style={{ display: "flex", gap: 8, marginBottom: 5 }}>
        <div style={{ flex: 1, fontSize: 11, fontWeight: 700, color: INK, fontFamily: "'Times New Roman', serif" }}>What service do you need?</div>
        <div style={{ flex: 1, fontSize: 11, fontWeight: 700, color: INK, fontFamily: "'Times New Roman', serif" }}>Where do you need it?</div>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0, position: "relative" }}>
          <DropBtn label={svcLabel} isOpen={sOpen} onClick={e => { e.stopPropagation(); if (sOpen) { setSOpen(false); setOpenCat(null); } else { setSOpen(true); setVOpen(false); } }} />
          <SvcDropdown open={sOpen} cats={cats} svcs={svcs} openCat={openCat} selSvc={selSvc} setOpenCat={setOpenCat} setSelSvc={s => { setSelSvc(s); setSOpen(false); }} setSOpen={setSOpen} />
        </div>
        <div style={{ flex: 1, minWidth: 0, position: "relative" }}>
          <DropBtn label={selArea ? selArea.name : "Select a Village..."} isOpen={vOpen} onClick={e => { e.stopPropagation(); if (vOpen) { setVOpen(false); } else { setVOpen(true); setSOpen(false); setOpenCat(null); } }} />
          <VilDropdown open={vOpen} areas={areas} selArea={selArea} setSelArea={a => { setSelArea(a); setVOpen(false); }} setVOpen={setVOpen} />
        </div>
      </div>
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
  const [selProv,  setSelProv]  = useState(null);
  const [selAreaR, setSelAreaR] = useState(null);
  const [selCatR,  setSelCatR]  = useState(null);
  const [selSvc,   setSelSvc]   = useState(null);
  const [selArea,  setSelArea]  = useState(null);

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
    { id: "s01", category_id: "69d09c14d5ee9e7be9aa301b", name: "Home Improvements" },
    { id: "s02", category_id: "69d09c14d5ee9e7be9aa301b", name: "General Repairs" },
    { id: "s03", category_id: "69d09c14d5ee9e7be9aa301b", name: "Cleaning Services (Home & Pool)" },
    { id: "s04", category_id: "69d09c14d5ee9e7be9aa301b", name: "Painting (Interior/Exterior)" },
    { id: "s05", category_id: "69d09c14d5ee9e7be9aa301b", name: "Garage Door Services" },
    { id: "s06", category_id: "69d09c14d5ee9e7be9aa301b", name: "Window Installation/Repair" },
    { id: "s07", category_id: "69d09c14d5ee9e7be9aa301b", name: "HVAC" },
    { id: "s08", category_id: "69d09c14d5ee9e7be9aa301b", name: "Plumbing" },
    { id: "s09", category_id: "69d09c14d5ee9e7be9aa301b", name: "Roofing" },
    { id: "s10", category_id: "69d181fe57b60e0aecf4067d", name: "Handyman Services" },
    { id: "s11", category_id: "69d181fe57b60e0aecf4067d", name: "Security & Home Watch" },
    { id: "s12", category_id: "69d181fe57b60e0aecf4067d", name: "Pest Control" },
    { id: "s13", category_id: "69d181fe57b60e0aecf4067d", name: "Appliance Repair" },
    { id: "s14", category_id: "69d181fe57b60e0aecf4067d", name: "Electrical & Lighting" },
    { id: "s15", category_id: "69d181fe57b60e0aecf4067d", name: "Flooring (Tile, Wood, Carpet)" },
    { id: "s16", category_id: "69d181fe57b60e0aecf4067d", name: "Home Organization" },
    { id: "s17", category_id: "69d181fe57b60e0aecf4067d", name: "Smart Home Installation" },
    { id: "s18", category_id: "69d181fe57b60e0aecf4067d", name: "Pool & Spa Services" },
    { id: "s19", category_id: "69d09c14d5ee9e7be9aa301c", name: "Lawn Mowing" },
    { id: "s20", category_id: "69d09c14d5ee9e7be9aa301c", name: "Sod Installation" },
    { id: "s21", category_id: "69d09c14d5ee9e7be9aa301c", name: "Tree Trimming & Pruning/Removal" },
    { id: "s22", category_id: "69d09c14d5ee9e7be9aa301c", name: "Lawn Fertilization" },
    { id: "s23", category_id: "69d09c14d5ee9e7be9aa301c", name: "Irrigation/Sprinkler Services" },
    { id: "s24", category_id: "69d09c14d5ee9e7be9aa301c", name: "Landscaping" },
    { id: "s25", category_id: "69d09c14d5ee9e7be9aa301c", name: "Hardscaping" },
    { id: "s26", category_id: "69d09c14d5ee9e7be9aa301c", name: "Pressure Washing" },
    { id: "s27", category_id: "69d09c14d5ee9e7be9aa301c", name: "Driveway Repair/Cleaning/Painting" },
    { id: "s28", category_id: "69d09c14d5ee9e7be9aa301d", name: "Rentals" },
    { id: "s29", category_id: "69d09c14d5ee9e7be9aa301d", name: "Repairs" },
    { id: "s30", category_id: "69d09c14d5ee9e7be9aa301d", name: "Detailing" },
    { id: "s31", category_id: "69d09c14d5ee9e7be9aa301d", name: "Lighting Upgrades" },
    { id: "s32", category_id: "69d09c14d5ee9e7be9aa301d", name: "Improvements/Customizations" },
    { id: "s33", category_id: "69d09c14d5ee9e7be9aa301d", name: "Battery Replacement" },
    { id: "s34", category_id: "69d09c14d5ee9e7be9aa301d", name: "Tire Services" },
    { id: "s35", category_id: "69d09c14d5ee9e7be9aa301e", name: "Auto Repairs" },
    { id: "s36", category_id: "69d09c14d5ee9e7be9aa301e", name: "Auto Detailing" },
    { id: "s37", category_id: "69d09c14d5ee9e7be9aa301e", name: "Oil Changes" },
    { id: "s38", category_id: "69d09c14d5ee9e7be9aa301e", name: "Tire Services" },
    { id: "s39", category_id: "69d09c14d5ee9e7be9aa301e", name: "Mobile Mechanic" },
    { id: "s40", category_id: "69d09c14d5ee9e7be9aa301f", name: "Hair Stylists" },
    { id: "s41", category_id: "69d09c14d5ee9e7be9aa301f", name: "Nail Technicians" },
    { id: "s42", category_id: "69d09c14d5ee9e7be9aa301f", name: "Spa Services" },
    { id: "s43", category_id: "69d09c14d5ee9e7be9aa301f", name: "Home Health Aides" },
    { id: "s44", category_id: "69d09c14d5ee9e7be9aa301f", name: "Massage Therapists" },
    { id: "s45", category_id: "69d09c14d5ee9e7be9aa301f", name: "Personal Trainers" },
    { id: "s46", category_id: "69d09c14d5ee9e7be9aa301f", name: "Makeup Artists" },
    { id: "s47", category_id: "69d09c14d5ee9e7be9aa3020", name: "Veterinary Services" },
    { id: "s48", category_id: "69d09c14d5ee9e7be9aa3020", name: "Grooming" },
    { id: "s49", category_id: "69d09c14d5ee9e7be9aa3020", name: "Pet Sitting/Walking" },
    { id: "s50", category_id: "69d09c14d5ee9e7be9aa3020", name: "Pet Training" },
    { id: "s51", category_id: "69d09c14d5ee9e7be9aa3020", name: "Mobile Grooming" },
    { id: "s52", category_id: "69d09c14d5ee9e7be9aa3021", name: "Medical Transport" },
    { id: "s53", category_id: "69d09c14d5ee9e7be9aa3021", name: "Airport Transport" },
    { id: "s54", category_id: "69d09c14d5ee9e7be9aa3021", name: "Local Rides" },
    { id: "s55", category_id: "69d09c14d5ee9e7be9aa3021", name: "Errand Services" },
    { id: "s56", category_id: "69d09c14d5ee9e7be9aa3021", name: "Courier/Delivery Services" },
    { id: "s57", category_id: "69d181fe57b60e0aecf4067e", name: "Accounting & Bookkeeping" },
    { id: "s58", category_id: "69d181fe57b60e0aecf4067e", name: "Notary Services" },
    { id: "s59", category_id: "69d181fe57b60e0aecf4067e", name: "IT Support" },
    { id: "s60", category_id: "69d181fe57b60e0aecf4067e", name: "Legal Services" },
    { id: "s61", category_id: "69d181fe57b60e0aecf4067e", name: "Business Consulting" },
    { id: "s62", category_id: "69d181fe57b60e0aecf4067e", name: "Tax Preparation" },
  ];

  useEffect(() => {
    // Load current user for admin check
    User.me().then(u => setCurrentUser(u)).catch(() => setCurrentUser(null));
    setCats(CATS_STATIC);
    setSvcs(SVCS_STATIC);
    // Hardcoded villages — no auth needed
            const VILLAGE_DATA = [
      { id: "v001", name: "Alhambra" },
      { id: "v002", name: "Amelia" },
      { id: "v003", name: "Ashland" },
      { id: "v004", name: "Belle Aire" },
      { id: "v005", name: "Belvedere" },
      { id: "v006", name: "Bonita" },
      { id: "v007", name: "Bonnybrook" },
      { id: "v008", name: "Bradford" },
      { id: "v009", name: "Briar Meadow" },
      { id: "v010", name: "Bridgeport at Creekside Landing" },
      { id: "v011", name: "Bridgeport at Lake Miona" },
      { id: "v012", name: "Bridgeport at Lake Sumter" },
      { id: "v013", name: "Bridgeport at Laurel Valley" },
      { id: "v014", name: "Bridgeport at Miona Shores" },
      { id: "v015", name: "Bridgeport at Mission Hills" },
      { id: "v016", name: "Buttonwood" },
      { id: "v017", name: "Calumet Grove" },
      { id: "v018", name: "Caroline" },
      { id: "v019", name: "Cason Hammock" },
      { id: "v020", name: "Charlotte" },
      { id: "v021", name: "Chatham" },
      { id: "v022", name: "Chitty Chatty" },
      { id: "v023", name: "Citrus Grove" },
      { id: "v024", name: "Collier" },
      { id: "v025", name: "Collier at Alden Bungalows" },
      { id: "v026", name: "Collier at Antrim Dells" },
      { id: "v027", name: "Country Club Hills" },
      { id: "v028", name: "Dabney" },
      { id: "v029", name: "De Allende" },
      { id: "v030", name: "De La Vista" },
      { id: "v031", name: "Del Mar" },
      { id: "v032", name: "DeLuna" },
      { id: "v033", name: "DeSoto" },
      { id: "v034", name: "Dunedin" },
      { id: "v035", name: "Duval" },
      { id: "v036", name: "El Cortez" },
      { id: "v037", name: "Fenney" },
      { id: "v038", name: "Fernandina" },
      { id: "v039", name: "Gilchrist" },
      { id: "v040", name: "Glenbrook" },
      { id: "v041", name: "Hacienda" },
      { id: "v042", name: "Haciendas of Mission Hills" },
      { id: "v043", name: "Hadley" },
      { id: "v044", name: "Hammock at Fenney" },
      { id: "v045", name: "Hawkins" },
      { id: "v046", name: "Hemingway" },
      { id: "v047", name: "Hillsborough" },
      { id: "v048", name: "La Reynalda" },
      { id: "v049", name: "La Zamora" },
      { id: "v050", name: "LaBelle" },
      { id: "v051", name: "Lake Deaton" },
      { id: "v052", name: "Lake Denham" },
      { id: "v053", name: "Lakeshore Cottages" },
      { id: "v054", name: "Largo" },
      { id: "v055", name: "Liberty Park" },
      { id: "v056", name: "Linden" },
      { id: "v057", name: "Lynnhaven" },
      { id: "v058", name: "Mallory Square" },
      { id: "v059", name: "Marsh Bend" },
      { id: "v060", name: "McClure" },
      { id: "v061", name: "Mira Mesa" },
      { id: "v062", name: "Monarch Grove" },
      { id: "v063", name: "Newell" },
      { id: "v064", name: "Orange Blossom Gardens" },
      { id: "v065", name: "Osceola Hills" },
      { id: "v066", name: "Osceola Hills at Soaring Eagle Preserve" },
      { id: "v067", name: "Palo Alto" },
      { id: "v068", name: "Pennecamp" },
      { id: "v069", name: "Piedmont" },
      { id: "v070", name: "Pine Hills" },
      { id: "v071", name: "Pine Ridge" },
      { id: "v072", name: "Pinellas" },
      { id: "v073", name: "Poinciana" },
      { id: "v074", name: "Polo Ridge" },
      { id: "v075", name: "Richmond" },
      { id: "v076", name: "Rio Grande" },
      { id: "v077", name: "Rio Ponderosa" },
      { id: "v078", name: "Rio Ranchero" },
      { id: "v079", name: "Sabal Chase" },
      { id: "v080", name: "Sanibel" },
      { id: "v081", name: "Santiago" },
      { id: "v082", name: "Santo Domingo" },
      { id: "v083", name: "Silver Lake" },
      { id: "v084", name: "Springdale" },
      { id: "v085", name: "St. Catherine" },
      { id: "v086", name: "St. Charles" },
      { id: "v087", name: "St. James" },
      { id: "v088", name: "St. Johns" },
      { id: "v089", name: "Summerhill" },
      { id: "v090", name: "Sunset Pointe" },
      { id: "v091", name: "Tall Trees" },
      { id: "v092", name: "Tamarind Grove" },
      { id: "v093", name: "Tierra Del Sol" },
      { id: "v094", name: "Valle Verde" },
      { id: "v095", name: "Virginia Trace" },
      { id: "v096", name: "Winifred" },
      { id: "v097", name: "Woodbury" },
    ];
    setAreas(VILLAGE_DATA);
  }, []);


  const doSearch = async (selSvc, selArea) => {
    setSelAreaR(selArea);
    setSelCatR(selSvc);
    let all = [];
    try {
      const resp = await fetch('https://v-hub-697894b1.base44.app/functions/getProviders', { method: 'POST', headers: { 'Content-Type': 'application/json' } });
      const data = await resp.json();
      all = data.providers || [];
    } catch(e) { all = []; }

    // Match providers by village name (case-insensitive) or "all villages"
      const areaMatch = !selArea || (() => {
        const village = selArea.name.toLowerCase();
        const provAreas = (p.service_areas || []);
        return provAreas.some(a => {
          const aLow = String(a).toLowerCase();
          return aLow === "all" || aLow === "all villages" || aLow.includes(village) || village.includes(aLow);
        });
      })();
      return areaMatch && svcMatch;
    });
    // Fetch approved V-Hub reviews for matched providers and sort by rating
    const ids = out.map(p => p.id);
    let reviewMap = {};
    try {
      const allRevs = await ProviderReview.filter({ is_approved: true });
      (allRevs || []).forEach(r => {
        if (!reviewMap[r.provider_id]) reviewMap[r.provider_id] = [];
        reviewMap[r.provider_id].push(r.rating);
      });
    } catch(e) { /* silently continue */ }

    const getScore = (p) => {
      const revs = reviewMap[p.id];
      if (revs && revs.length > 0) {
        // V-Hub villager rating — primary sort
        return revs.reduce((s, r) => s + r, 0) / revs.length;
      }
      // Fall back to Google/seeded rating field
      return typeof p.rating === "number" ? p.rating : 0;
    };

    out.sort((a, b) => {
      // Higher rating first; same rating → tier order
      const ratingDiff = getScore(b) - getScore(a);
      if (ratingDiff !== 0) return ratingDiff;
      const tier = { premium: 0, featured: 1, basic: 2 };
      return (tier[a.subscription_tier] ?? 3) - (tier[b.subscription_tier] ?? 3);
    });
    setResults(out);
    setSearched(true);
    // Silently increment search_appearances for each matched provider
    out.forEach(p => {
      Provider.update(p.id, { search_appearances: (p.search_appearances || 0) + 1 }).catch(() => {});
    });
  };

  const reset = () => {
    setResults([]); setSearched(false); setSelProv(null);
    setSelAreaR(null); setSelCatR(null);
    setSelSvc(null); setSelArea(null);
  };

  useMeta({
    title: "V-Hub | Find Local Services in The Villages, Florida",
    description: "V-Hub is The Villages, Florida's trusted local service directory. Search landscaping, home repair, cleaning, pet care, golf cart services, transportation and more across all 59 villages.",
    keywords: "The Villages FL services, local service directory, home repair, landscaping, cleaning, pet care, golf cart services, The Villages Florida",
    ogTitle: "V-Hub — The Villages Local Services Directory",
    ogDescription: "Find trusted, vetted local service providers across all 59 villages in The Villages, FL. No fees. No middlemen. Just neighbors serving neighbors.",
    ogImage: "https://media.base44.com/images/public/69d062aca815ce8e697894b1/f19aa517d_generated_image.png",
    canonical: "https://v-hub-app-edf7f8e8.base44.app/",
  });

  // Newspaper typography
  const hd  = { margin: "0 0 2px 0", fontWeight: 900, fontSize: 9, textTransform: "uppercase", letterSpacing: 1, color: INK, fontFamily: "'Times New Roman', serif" };
  const sub = { margin: "0 0 5px 0", fontStyle: "italic", fontSize: 8, color: BROWN_BTN, fontFamily: "'Times New Roman', serif", lineHeight: 1.4 };
  const para = { margin: "0 0 7px 0", fontSize: 8.5, color: INK_FADE, fontFamily: "'Times New Roman', serif", lineHeight: 1.9, textAlign: "justify" };
  const rule = { height: 1, background: INK_FADE, margin: "8px 0", opacity: 0.4 };

  if (selProv)  return <ProvDetail prov={selProv} areas={areas} cats={cats} onBack={() => setSelProv(null)} />;
  if (searched) return <Results results={results} areas={areas} cats={cats} svcs={svcs} onReset={reset} onSel={setSelProv} selArea={selAreaR} selCatId={selCatR} />;

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap" rel="stylesheet" />
      <style>{`
        * { box-sizing: border-box; }
        body, html { margin: 0; padding: 0; overflow-x: hidden; }

        .np-col { font-family: 'Times New Roman', Georgia, serif; font-size: 8.5px; color: ${INK_FADE}; line-height: 1.9; text-align: justify; }

        /* Mobile: single column, all news text stacked */
        .np-grid {
          display: flex;
          flex-direction: column;
          padding: 10px 12px;
          gap: 10px;
        }
        .np-side-left, .np-side-right { display: none; }
        .np-center { width: 100%; }

        /* Tablet / Desktop: 3-column newspaper */
        @media (min-width: 580px) {
          .np-grid {
            display: grid;
            grid-template-columns: 1fr 2fr 1fr;
            grid-template-rows: auto auto auto;
            gap: 0;
            padding: 0;
          }
          .np-side-left {
            display: block;
            padding: 10px 9px 10px 12px;
            border-right: 1px solid ${INK};
          }
          .np-center {
            padding: 10px 12px;
            border-right: 1px solid ${INK};
          }
          .np-side-right {
            display: block;
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

        {/* ── MASTHEAD ── */}
        <div style={{ background: PAPER, padding: "14px 14px 8px" }}>
          {/* Top row: palm | title (centered) | burger */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            {/* Left: user palm tree image */}
            <div style={{ flexShrink: 0, width: 72, height: 72, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
              <img
                src="https://base44.app/api/apps/69d062aca815ce8e697894b1/files/mp/public/69d062aca815ce8e697894b1/db767c521_palm_user_raw.png"
                alt="Palm trees"
                loading="eager"
                fetchPriority="high"
                decoding="sync"
                style={{
                  width: 72, height: 72,
                  objectFit: "contain",
                  objectPosition: "bottom center",
                  display: "block",
                }}
              />
            </div>
            {/* Center: V-Hub title */}
            <span style={{ flex: 1, textAlign: "center", fontSize: 52, fontWeight: 900, color: INK, fontFamily: "'Times New Roman', serif", letterSpacing: -1, lineHeight: 1 }}>
              <span style={{ fontStyle: "italic", fontWeight: 700, fontFamily: "'Great Vibes', cursive", fontSize: "1.35em", color: BROWN_BTN, WebkitTextStroke: "0.6px " + BROWN_BTN, textShadow: `0.5px 0.5px 0 ${BROWN_BTN}` }}>V</span>
              <span>-Hub</span>
            </span>
            {/* Right: burger — same size as palm */}
            <div style={{ flexShrink: 0 }}><Burger currentUser={currentUser} /></div>
          </div>
          {/* Tagline */}
          <div style={{ fontSize: 13, fontStyle: "italic", color: INK_FADE, textAlign: "center", margin: "6px 0 10px" }}>
            Connecting You to Local Services in The Villages!
          </div>
          {/* List Your Service button removed — accessible via burger menu */}
        </div>

        <Rule thick />

        {/* NAV */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", background: PAPER }}>
          <div style={{ padding: "8px", textAlign: "center", borderRight: `1px solid ${INK}`, fontSize: 11, fontWeight: 700, letterSpacing: 2, color: INK, textTransform: "uppercase" }}>Local Services</div>
          <div style={{ padding: "8px", textAlign: "center", fontSize: 11, fontWeight: 700, letterSpacing: 2, color: INK, textTransform: "uppercase" }}>Classifieds</div>
        </div>

        <Rule />

        {/* PHOTO */}
        <img
          src="https://media.base44.com/images/public/69d062aca815ce8e697894b1/f19aa517d_generated_image.png"
          alt="Lake Sumter Landing"
          style={{ width: "100%", height: 200, objectFit: "cover", objectPosition: "center 60%", display: "block" }}
        />

        <Rule />

        {/* ── NEWSPAPER BODY ── */}
        <div className="np-grid">

          {/* ── LEFT COLUMN ── */}
          <div className="np-side-left np-col">
            {/* Story 1 */}
            <p style={hd}>{NEWSPAPER_CONTENT.neighborhoodWatch.headline}</p>
            <p style={sub}>{NEWSPAPER_CONTENT.neighborhoodWatch.subhead}</p>
            {NEWSPAPER_CONTENT.neighborhoodWatch.body.map((p,i) => <p key={i} style={para}>{p}</p>)}
            <div style={rule} />
            {/* Story 2 */}
            <p style={hd}>{NEWSPAPER_CONTENT.growthStory.headline}</p>
            <p style={sub}>{NEWSPAPER_CONTENT.growthStory.subhead}</p>
            {NEWSPAPER_CONTENT.growthStory.body.map((p,i) => <p key={i} style={para}>{p}</p>)}
          </div>

          {/* ── CENTER COLUMN ── */}
          <div className="np-center">
            {/* Story above search — visible on mobile too */}
            <p style={hd}>{NEWSPAPER_CONTENT.howItWorks.headline}</p>
            <p style={sub}>{NEWSPAPER_CONTENT.howItWorks.subhead}</p>
            {NEWSPAPER_CONTENT.howItWorks.body.map((p,i) => <p key={i} style={{...para, marginBottom: 10}}>{p}</p>)}

            {/* Search box */}
            <SearchBox cats={cats} svcs={svcs} areas={areas} onSearch={doSearch} selSvc={selSvc} setSelSvc={setSelSvc} selArea={selArea} setSelArea={setSelArea} />

            {/* Story below search */}
            <div style={{ marginTop: 12 }}>
              <p style={hd}>{NEWSPAPER_CONTENT.homeServices.headline}</p>
              <p style={sub}>{NEWSPAPER_CONTENT.homeServices.subhead}</p>
              {NEWSPAPER_CONTENT.homeServices.body.map((p,i) => <p key={i} style={para}>{p}</p>)}
            </div>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="np-side-right np-col">
            {/* Story 1 */}
            <p style={hd}>{NEWSPAPER_CONTENT.providerSpotlight.headline}</p>
            <p style={sub}>{NEWSPAPER_CONTENT.providerSpotlight.subhead}</p>
            {NEWSPAPER_CONTENT.providerSpotlight.body.map((p,i) => <p key={i} style={para}>{p}</p>)}
            <div style={rule} />
            {/* Classifieds */}
            <p style={hd}>{NEWSPAPER_CONTENT.classifieds.headline}</p>
            <p style={sub}>{NEWSPAPER_CONTENT.classifieds.subhead}</p>
            {NEWSPAPER_CONTENT.classifieds.body.map((p,i) => <p key={i} style={{...para, borderBottom: `1px dotted ${PAPER_DK}`, paddingBottom: 5}}>{p}</p>)}
            <div style={rule} />
            {/* Safety & Trust */}
            <p style={hd}>{NEWSPAPER_CONTENT.safetyTrust.headline}</p>
            <p style={sub}>{NEWSPAPER_CONTENT.safetyTrust.subhead}</p>
            {NEWSPAPER_CONTENT.safetyTrust.body.map((p,i) => <p key={i} style={para}>{p}</p>)}
          </div>

        </div>

        <Rule style={{ marginTop: 8 }} />

        {/* ── FULL WIDTH BOTTOM SECTION ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px", padding: "10px 0" }}>
          <div>
            <p style={hd}>ABOUT THE VILLAGES</p>
            <p style={sub}>Florida's premier active adult community</p>
            <p style={para}>The Villages is home to more than 80,000 residents and spans three counties — Sumter, Lake, and Marion. With 97 distinct villages, three vibrant town squares, and hundreds of clubs and activities, it is one of the most dynamic communities in the United States.</p>
            <p style={para}>From the historic charm of Spanish Springs to the waterfront energy of Brownwood Paddock Square and the family-friendly streets of the newer Eastport district, every corner of The Villages has its own character — and its own service needs.</p>
            <p style={para}>V-Hub was designed to serve all of them equally. Whether you live in a cottage near Lake Sumter Landing or a newer home in Fenney, you deserve fast, reliable access to trusted local professionals.</p>
          </div>
          <div>
            <p style={hd}>HOW V-HUB WORKS FOR PROVIDERS</p>
            <p style={sub}>Reach the exact neighborhoods you serve</p>
            <p style={para}>Listing your business on V-Hub puts you in front of thousands of Villages residents who are actively searching for the services you offer. No cold calls, no wasted advertising — just direct connections with neighbors who need exactly what you do.</p>
            <p style={para}>Providers choose which villages they serve, which categories they appear under, and what their profile says. Your listing is always in your control, and upgrades are available to boost your visibility across additional neighborhoods.</p>
            <p style={para}>Join dozens of trusted local providers already growing their business through V-Hub. Click List Your Service above to get started — it only takes a few minutes to create your profile and start being found.</p>
          </div>
        </div>

        <Rule style={{ marginTop: 8 }} />

        {/* Footer */}
        <div style={{ padding: "10px 14px", textAlign: "center", fontSize: 10, color: INK_FADE, fontStyle: "italic" }}>
          © 2026 V-Hub · The Villages, Florida · Find Local Services · All rights reserved
        </div>

      </div>
    </>
  );
}

