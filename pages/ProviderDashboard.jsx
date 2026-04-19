// CACHE-BUST-1776573078
// build-1776559362 
// @build 2026-04-18-b
// ProviderDashboard — REBUILD 1776411339
import React, { useState, useEffect, useRef } from "react";
const _BUILD = "1776475996"; // cache-bust
import { Provider, ProviderReview, Service, ServiceArea, Category, ClassifiedAd, ProviderAnalytic } from "@/api/entities";

// ── SEO ───────────────────────────────────────────────────────────────────
function useMeta(title) {
  useEffect(() => {
    document.title = title || "Provider Hub | V-Hub";
    let el = document.querySelector('meta[name="robots"]');
    if (!el) { el = document.createElement("meta"); el.name = "robots"; document.head.appendChild(el); }
    el.content = "noindex, nofollow";
  }, [title]);
}

// ── Design tokens ─────────────────────────────────────────────────────────
const INK       = "#1C0F00";
const INK_FADE  = "#5C3A10";
const PAPER     = "#F0E6C8";
const PAPER_MID = "#E4D5A8";
const PAPER_DK  = "#C8B07A";
const BROWN_BTN = "#7A4820";
const YELLOW    = "#FFDB00";
const RED_RULE  = "#8B1A1A";
const GREEN     = "#1A6B3C";
const TEAL      = "#00836B";
const NAVY      = "#1B3D6F";
const GREEN_BORDER = "#2E7D32";
const SANS      = "'Helvetica Neue', Arial, sans-serif";
const SERIF     = "'Times New Roman', Georgia, serif";

// ── Legacy short-code lookup maps (providers created before entity migration)
const LEGACY_SVC = {"s01":"Home Improvements","s02":"General Repairs","s03":"Cleaning Services","s04":"Painting (Interior/Exterior)","s05":"Garage Door Services","s06":"Window Installation/Repair","s07":"HVAC","s08":"Plumbing","s09":"Roofing","s10":"Handyman Services","s11":"Security & Home Watch","s12":"Pest Control","s13":"Appliance Repair","s14":"Electrical & Lighting","s15":"Flooring (Tile, Wood, Carpet)","s16":"Home Organization","s17":"Smart Home Installation","s18":"Pool & Spa Services","s19":"Lawn Mowing","s20":"Sod Installation","s21":"Tree Trimming & Pruning/Removal","s22":"Lawn Fertilization","s23":"Irrigation/Sprinkler Services","s24":"Landscaping","s25":"Hardscaping","s26":"Pressure Washing","s27":"Driveway Repair/Cleaning/Painting","s28":"Rentals","s29":"Repairs","s30":"Detailing","s31":"Lighting Upgrades","s32":"Improvements/Customizations","s33":"Battery Replacement","s34":"Tire Services","s35":"Auto Repairs","s36":"Auto Detailing","s37":"Oil Changes","s38":"Tire Services","s39":"Mobile Mechanic","s40":"Hair Stylists","s41":"Nail Technicians","s42":"Spa Services","s43":"Home Health Aides","s44":"Massage Therapists","s45":"Personal Trainers","s46":"Makeup Artists","s47":"Veterinary Services","s48":"Grooming","s49":"Pet Sitting/Walking","s50":"Pet Training","s51":"Mobile Grooming","s52":"Medical Transport","s53":"Airport Transport","s54":"Local Rides","s55":"Errand Services","s56":"Courier/Delivery Services","s57":"Accounting & Bookkeeping","s58":"Notary Services","s59":"IT Support","s60":"Legal Services","s61":"Business Consulting","s62":"Tax Preparation","s63":"Home Watch","s64":"Pool & Spa Services","s65":"Vehicle Transport"};
const LEGACY_AREA = {"va001":"Alhambra","va002":"Amelia","va003":"Ashland","va004":"Belle Aire","va005":"Belvedere","va006":"Bonita","va007":"Bonnybrook","va008":"Bradford","va009":"Briar Meadow","va010":"Bridgeport at Creekside Landing","va011":"Bridgeport at Lake Miona","va012":"Bridgeport at Lake Sumter","va013":"Bridgeport at Laurel Valley","va014":"Bridgeport at Miona Shores","va015":"Bridgeport at Mission Hills","va016":"Buttonwood","va017":"Calumet Grove","va018":"Caroline","va019":"Cason Hammock","va020":"Charlotte","va021":"Chatham","va022":"Chitty Chatty","va023":"Citrus Grove","va024":"Collier","va025":"Collier at Alden Bungalows","va026":"Collier at Antrim Dells","va027":"Country Club Hills","va028":"Dabney","va029":"De Allende","va030":"De La Vista","va031":"Del Mar","va032":"DeLuna","va033":"DeSoto","va034":"Dunedin","va035":"Duval","va036":"El Cortez","va037":"Fenney","va038":"Fernandina","va039":"Gilchrist","va040":"Glenbrook","va041":"Hacienda","va042":"Haciendas of Mission Hills","va043":"Hadley","va044":"Hammock at Fenney","va045":"Hawkins","va046":"Hemingway","va047":"Hillsborough","va048":"La Reynalda","va049":"La Zamora","va050":"LaBelle","va051":"Lake Deaton","va052":"Lake Denham","va053":"Lakeshore Cottages","va054":"Largo","va055":"Liberty Park","va056":"Linden","va057":"Lynnhaven","va058":"Mallory Square","va059":"Marsh Bend","va060":"McClure","va061":"Mira Mesa","va062":"Monarch Grove","va063":"Newell","va064":"Orange Blossom Gardens","va065":"Osceola Hills","va066":"Osceola Hills at Soaring Eagle Preserve","va067":"Palo Alto","va068":"Pennecamp","va069":"Piedmont","va070":"Pine Hills","va071":"Pine Ridge","va072":"Pinellas","va073":"Poinciana","va074":"Polo Ridge","va075":"Richmond","va076":"Rio Grande","va077":"Rio Ponderosa","va078":"Rio Ranchero","va079":"Sabal Chase","va080":"Sanibel","va081":"Santiago","va082":"Santo Domingo","va083":"Silver Lake","va084":"Springdale","va085":"St. Catherine","va086":"St. Charles","va087":"St. James","va088":"St. Johns","va089":"Summerhill","va090":"Sunset Pointe","va091":"Tall Trees","va092":"Tamarind Grove","va093":"Tierra Del Sol","va094":"Valle Verde","va095":"Virginia Trace","va096":"Winifred","va097":"Woodbury"};

// ── Helpers ───────────────────────────────────────────────────────────────
function daysLeft(dateStr) {
  if (!dateStr) return null;
  const d = Math.ceil((new Date(dateStr) - new Date()) / 86400000);
  return isNaN(d) ? null : d;
}
function fmt(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}
function resolveSvc(id, svcMap) { return svcMap[id] || LEGACY_SVC[id] || ""; }
function resolveArea(id, areaMap) { const raw = areaMap[id] || LEGACY_AREA[id] || ""; return raw.includes(" — ") ? raw.split(" — ").pop().trim() : raw; }

const inS = {
  width: "100%", boxSizing: "border-box", background: PAPER,
  border: `1.5px solid ${PAPER_DK}`, borderRadius: 4,
  color: INK, fontFamily: SERIF, fontSize: 14,
  padding: "9px 12px", outline: "none",
};
const lbS = {
  fontSize: 11, fontWeight: 700, color: INK_FADE, textTransform: "uppercase",
  letterSpacing: 1, marginBottom: 4, display: "block", fontFamily: SERIF,
};
const shS = {
  fontSize: 11, fontWeight: 900, letterSpacing: 3, textTransform: "uppercase",
  color: INK, borderBottom: `2px solid ${INK}`, paddingBottom: 4, marginBottom: 16,
  fontFamily: SERIF,
};

// ── Stars ─────────────────────────────────────────────────────────────────
function Stars({ rating = 0, size = 14 }) {
  return <span style={{ fontSize: size, color: "#B8860B" }}>{"★".repeat(Math.floor(rating))}{"☆".repeat(5 - Math.floor(rating))}</span>;
}

// ── Trial / Subscription Banner ─────────────────────────────────────────
function StatusBanner({ provider, onUpgrade, onCancel, onManageBilling, paymentLoading, cancelLoading, billingLoading, paymentError, cancelError }) {
  const status = provider.subscription_status;
  const days = daysLeft(provider.trial_end_date);
  const endFmt = fmt(provider.trial_end_date);

  // Active paid subscriber
  if (status === "active" || status === "paid") {
    return (
      <div style={{ background: "#E8F5E9", border: "2px solid #4CAF50", borderRadius: 10, padding: "18px 20px", marginBottom: 20 }}>
        <div style={{ fontWeight: 900, color: "#1B5E20", fontSize: 15, fontFamily: SERIF, marginBottom: 6 }}>✅ Subscription Active</div>
        <div style={{ fontSize: 13, color: "#2E7D32", fontFamily: SANS, marginBottom: 4, lineHeight: 1.7 }}>
          Your listing is <strong>live</strong> and visible to residents across The Villages.
        </div>
        <div style={{ fontSize: 13, color: "#2E7D32", fontFamily: SANS, marginBottom: 14, lineHeight: 1.7 }}>
          Your subscription will remain active and you will be charged <strong>$12/month</strong> automatically. You can cancel at any time.
        </div>
        {cancelError && <div style={{ fontSize: 12, color: "#B71C1C", marginBottom: 10, fontFamily: SANS, background: "#FFEBEE", borderRadius: 6, padding: "8px 12px" }}>{cancelError}</div>}
        <button
          onClick={onCancel}
          disabled={cancelLoading}
          style={{ background: "transparent", border: "2px solid #C62828", color: "#C62828", borderRadius: 6, padding: "9px 20px", fontSize: 13, fontWeight: 700, cursor: cancelLoading ? "not-allowed" : "pointer", fontFamily: SANS, opacity: cancelLoading ? 0.6 : 1 }}
        >
          {cancelLoading ? "Cancelling…" : "Cancel My Subscription"}
        </button>
      </div>
    );
  }

  // Active trial
  if (status === "trial") {
    const expired = days !== null && days < 0;
    const urgent = !expired && days !== null && days <= 7;
    const pct = days !== null ? Math.max(5, Math.min(100, ((45 - days) / 45) * 100)) : 50;

    if (expired) {
      return (
        <div style={{ background: "#FFF3E0", border: `2px solid ${RED_RULE}`, borderRadius: 10, padding: "18px 20px", marginBottom: 20 }}>
          <div style={{ fontWeight: 900, color: RED_RULE, fontSize: 15, fontFamily: SERIF, marginBottom: 6 }}>⚠ Your Trial Has Ended</div>
          <div style={{ fontSize: 13, color: INK_FADE, fontFamily: SANS, marginBottom: 14, lineHeight: 1.6 }}>Your listing is currently <strong>hidden</strong> from search results. Subscribe for $12/month to go live again.</div>
          {paymentError && <div style={{ fontSize: 12, color: RED_RULE, marginBottom: 10, fontFamily: SANS }}>{paymentError}</div>}
          <button onClick={onUpgrade} disabled={paymentLoading} style={{ background: `linear-gradient(180deg,#9A6030,${BROWN_BTN})`, color: PAPER, border: `2px solid ${YELLOW}`, boxShadow: `0 0 10px 2px rgba(255,220,0,0.3)`, borderRadius: 8, padding: "12px 28px", fontWeight: 900, fontSize: 14, cursor: paymentLoading ? "default" : "pointer", fontFamily: SERIF, letterSpacing: 1, opacity: paymentLoading ? 0.7 : 1 }}>
            {paymentLoading ? "Redirecting to Stripe…" : "Subscribe Now — $12/mo →"}
          </button>
        </div>
      );
    }

    return (
      <div style={{ background: urgent ? "#FFF3E0" : PAPER_MID, border: `2px solid ${urgent ? "#E65100" : PAPER_DK}`, borderRadius: 10, padding: "18px 20px", marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
          <div style={{ fontWeight: 900, color: urgent ? "#BF360C" : BROWN_BTN, fontSize: 14, fontFamily: SERIF }}>
            {urgent ? `⏰ Trial ends in ${days} day${days !== 1 ? "s" : ""}!` : days !== null ? `Trial — ${days} day${days !== 1 ? "s" : ""} remaining` : "Trial Active"}
          </div>
          <div style={{ fontSize: 12, color: INK_FADE, fontFamily: SANS }}>Ends {endFmt}</div>
        </div>
        <div style={{ background: "#D4C9A0", borderRadius: 4, height: 8, marginBottom: 14 }}>
          <div style={{ background: urgent ? "#E65100" : TEAL, borderRadius: 4, height: 8, width: `${pct}%`, transition: "width 0.5s" }} />
        </div>
        <div style={{ background: "rgba(0,0,0,0.04)", borderRadius: 8, padding: "14px 16px" }}>
          <div style={{ fontSize: 13, fontWeight: 900, color: INK, fontFamily: SERIF, marginBottom: 4 }}>Subscribe to keep your listing live after your trial</div>
          <div style={{ fontSize: 12, color: INK_FADE, fontFamily: SANS, marginBottom: 12, lineHeight: 1.6 }}>
            <strong>$12/month</strong> — Stay live and searchable. Cancel anytime. If you subscribe during your trial, billing won't start until after your trial ends.
          </div>
          {paymentError && <div style={{ fontSize: 12, color: RED_RULE, marginBottom: 8, fontFamily: SANS }}>{paymentError}</div>}
          <button
            onClick={onUpgrade}
            disabled={paymentLoading}
            style={{
              background: paymentLoading ? PAPER_DK : `linear-gradient(180deg,#9A6030,${BROWN_BTN} 60%,#5A3010)`,
              color: PAPER, border: `3px solid ${YELLOW}`,
              boxShadow: `0 0 0 1.5px ${YELLOW}, 0 0 14px 3px rgba(255,220,0,0.3)`,
              borderRadius: 8, padding: "13px 0", fontSize: 15, fontWeight: 900,
              cursor: paymentLoading ? "not-allowed" : "pointer",
              fontFamily: SERIF, letterSpacing: 1, textTransform: "uppercase",
              width: "100%", opacity: paymentLoading ? 0.7 : 1,
            }}
          >
            {paymentLoading ? "Redirecting to Stripe…" : "Subscribe Now — $12/month →"}
          </button>
          <div style={{ fontSize: 11, color: INK_FADE, fontFamily: SANS, marginTop: 8, textAlign: "center" }}>Secure payment via Stripe · Cancel anytime</div>
        </div>
      </div>
    );
  }

  if (status === "pending") return (
    <div style={{ background: "#FFF8E1", border: "2px solid #F59E0B", borderRadius: 10, padding: "14px 18px", marginBottom: 20 }}>
      <div style={{ fontWeight: 900, color: "#92400E", fontSize: 14, fontFamily: SERIF }}>🕐 Pending Admin Approval</div>
      <div style={{ fontSize: 13, color: INK_FADE, fontFamily: SANS, marginTop: 4, lineHeight: 1.6 }}>Your listing is under review. You'll receive an email once it's live — usually within 1 business day.</div>
    </div>
  );

  if (status === "cancelled") return (
    <div style={{ background: "#FAFAFA", border: "2px solid #CCC", borderRadius: 10, padding: "16px 18px", marginBottom: 20 }}>
      <div style={{ fontWeight: 900, color: "#555", fontSize: 14, fontFamily: SERIF }}>⏸ Subscription Cancelled</div>
      <div style={{ fontSize: 13, color: INK_FADE, fontFamily: SANS, marginTop: 4, marginBottom: 12, lineHeight: 1.6 }}>Your listing is not currently visible. Resubscribe to go live again.</div>
      {paymentError && <div style={{ fontSize: 12, color: RED_RULE, marginBottom: 8, fontFamily: SANS }}>{paymentError}</div>}
      <button onClick={onUpgrade} disabled={paymentLoading} style={{ background: BROWN_BTN, color: PAPER, border: `2px solid ${YELLOW}`, borderRadius: 6, padding: "10px 24px", fontWeight: 700, cursor: paymentLoading ? "default" : "pointer", fontSize: 13, fontFamily: SERIF, opacity: paymentLoading ? 0.7 : 1 }}>
        {paymentLoading ? "Redirecting to Stripe…" : "Reactivate — $12/mo →"}
      </button>
    </div>
  );

  if (status === "trial_expired") return (
    <div style={{ background: "#FFF3E0", border: `2px solid ${RED_RULE}`, borderRadius: 10, padding: "18px 20px", marginBottom: 20 }}>
      <div style={{ fontWeight: 900, color: RED_RULE, fontSize: 15, fontFamily: SERIF, marginBottom: 6 }}>⚠ Your Trial Has Ended</div>
      <div style={{ fontSize: 13, color: INK_FADE, fontFamily: SANS, marginBottom: 14, lineHeight: 1.6 }}>Your listing is currently <strong>hidden</strong> from search results. Subscribe for $12/month to go live again.</div>
      {paymentError && <div style={{ fontSize: 12, color: RED_RULE, marginBottom: 10, fontFamily: SANS }}>{paymentError}</div>}
      <button onClick={onUpgrade} disabled={paymentLoading} style={{ background: `linear-gradient(180deg,#9A6030,${BROWN_BTN})`, color: PAPER, border: `2px solid ${YELLOW}`, borderRadius: 8, padding: "12px 28px", fontWeight: 900, fontSize: 14, cursor: paymentLoading ? "default" : "pointer", fontFamily: SERIF, letterSpacing: 1, opacity: paymentLoading ? 0.7 : 1 }}>
        {paymentLoading ? "Redirecting to Stripe…" : "Subscribe Now — $12/mo →"}
      </button>
    </div>
  );

  if (status === "past_due") return (
    <div style={{ background: "#FFF3E0", border: "2px solid #E65100", borderRadius: 10, padding: "14px 18px", marginBottom: 20 }}>
      <div style={{ fontWeight: 900, color: "#BF360C", fontSize: 14, fontFamily: SERIF }}>⚠ Payment Failed — Action Required</div>
      <div style={{ fontSize: 13, color: INK_FADE, fontFamily: SANS, marginTop: 4, marginBottom: 12, lineHeight: 1.6 }}>Your last payment was not processed. Update your billing to keep your listing live.</div>
      <button onClick={onManageBilling} disabled={billingLoading} style={{ background: RED_RULE, color: "#fff", border: "none", borderRadius: 6, padding: "9px 22px", fontWeight: 700, cursor: billingLoading ? "default" : "pointer", fontSize: 13, fontFamily: SANS, opacity: billingLoading ? 0.7 : 1 }}>
        {billingLoading ? "Opening…" : "Update Billing Info →"}
      </button>
    </div>
  );

  return null;
}

// ── Service accordion for edit view ──────────────────────────────────────
// Supports both real entity IDs and legacy short codes (s01, s19, etc.)
// Categories and services are loaded from DB at runtime.

// Legacy short-code → real service name map (for providers created before entity migration)
const LEGACY_SVC_NAMES = {
  s01:"Home Improvements",s02:"General Repairs",s03:"Cleaning Services",s04:"Painting (Interior/Exterior)",
  s05:"Garage Door Services",s06:"Window Installation/Repair",s07:"HVAC",s08:"Plumbing",s09:"Roofing",
  s10:"Handyman Services",s11:"Security & Home Watch",s12:"Pest Control",s13:"Appliance Repair",
  s14:"Electrical & Lighting",s15:"Flooring (Tile, Wood, Carpet)",s16:"Home Organization",
  s17:"Smart Home Installation",s18:"Pool & Spa Services",s19:"Lawn Mowing",s20:"Sod Installation",
  s21:"Tree Trimming & Pruning/Removal",s22:"Lawn Fertilization",s23:"Irrigation/Sprinkler Services",
  s24:"Landscaping",s25:"Hardscaping",s26:"Pressure Washing",s27:"Driveway Repair/Cleaning/Painting",
  s28:"Rentals",s29:"Repairs",s30:"Detailing",s31:"Lighting Upgrades",s32:"Improvements/Customizations",
  s33:"Battery Replacement",s34:"Tire Services",s35:"Auto Repairs",s36:"Auto Detailing",
  s37:"Oil Changes",s38:"Tire Services",s39:"Mobile Mechanic",s40:"Hair Stylists",
  s41:"Nail Technicians",s42:"Spa Services",s43:"Home Health Aides",s44:"Massage Therapists",
  s45:"Personal Trainers",s46:"Makeup Artists",s47:"Veterinary Services",s48:"Grooming",
  s49:"Pet Sitting/Walking",s50:"Pet Training",s51:"Mobile Grooming",s52:"Medical Transport",
  s53:"Airport Transport",s54:"Local Rides",s55:"Errand Services",s56:"Courier/Delivery Services",
  s57:"Accounting & Bookkeeping",s58:"Notary Services",s59:"IT Support",s60:"Legal Services",
  s61:"Business Consulting",s62:"Tax Preparation",s63:"Home Watch",s64:"Pool Cleaning",
  s65:"Golf Cart Repair",s66:"Auto Detailing",
};

// Legacy cat ID → icon/name (so legacy providers still see grouped categories)
const LEGACY_CAT_META = {
  "69d09c14d5ee9e7be9aa301b": { icon: "🏠", name: "Home Services" },
  "69d181fe57b60e0aecf4067d": { icon: "💡", name: "Home Systems & Utilities" },
  "69d09c14d5ee9e7be9aa301c": { icon: "🌿", name: "Yard & Outdoor" },
  "69d09c14d5ee9e7be9aa301d": { icon: "⛳", name: "Golf Cart Services" },
  "69d09c14d5ee9e7be9aa301e": { icon: "🚗", name: "Automobile Services" },
  "69d09c14d5ee9e7be9aa301f": { icon: "💆", name: "Personal Care" },
  "69d09c14d5ee9e7be9aa3020": { icon: "🐾", name: "Pet Services" },
  "69d09c14d5ee9e7be9aa3021": { icon: "🚌", name: "Transportation" },
  "69d181fe57b60e0aecf4067e": { icon: "💼", name: "Professional Services" },
};

function SvcAccordion({ selSvcs, setSelSvcs, dbCategories, dbServices }) {
  const [openCat, setOpenCat] = useState(null);

  // Auto-open first category that has selected services
  useEffect(() => {
    if (!dbCategories || !dbServices || dbCategories.length === 0) return;
    const firstMatch = (dbCategories || []).find(cat =>
      (dbServices || []).some(s => s.category_id === cat.id && selSvcs.includes(s.id))
    );
    if (firstMatch && !openCat) setOpenCat(firstMatch.id);
  }, [dbCategories, dbServices]);

  // If data not loaded yet, show a spinner
  if (!dbCategories || dbCategories.length === 0) {
    return <div style={{ padding: "14px 0", fontSize: 13, color: INK_FADE, fontFamily: SANS, fontStyle: "italic" }}>Loading services…</div>;
  }

  // Build category list: use live DB data, fall back to legacy meta
  const cats = (dbCategories || []).filter(c => c.is_active !== false).map(cat => {
    const meta = LEGACY_CAT_META[cat.id] || {};
    return {
      id: cat.id,
      name: (meta.icon ? meta.icon + " " : (cat.icon ? cat.icon + " " : "")) + cat.name,
      svcs: (dbServices || []).filter(s => s.category_id === cat.id && s.is_active !== false),
    };
  }).filter(c => c.svcs.length > 0);

  // Also collect any legacy-code services that are currently selected but not in DB
  const dbSvcIds = new Set((dbServices || []).map(s => s.id));
  const legacySelected = selSvcs.filter(id => !dbSvcIds.has(id) && LEGACY_SVC_NAMES[id]);

  const toggle = (id) => setSelSvcs(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);

  return (
    <div>
      {cats.map(cat => {
        const count = cat.svcs.filter(s => selSvcs.includes(s.id)).length;
        const isOpen = openCat === cat.id;
        return (
          <div key={cat.id} style={{ marginBottom: 4, borderRadius: 5, overflow: "hidden", border: `1.5px solid ${PAPER_DK}` }}>
            <div onClick={() => setOpenCat(isOpen ? null : cat.id)}
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 13px", background: count > 0 ? `linear-gradient(180deg,#9A6030,${BROWN_BTN})` : `linear-gradient(180deg,${PAPER_MID},${PAPER_DK})`, color: count > 0 ? PAPER : INK, cursor: "pointer", fontWeight: 700, fontSize: 13, fontFamily: SERIF }}>
              <span>{cat.name}{count > 0 ? `  ✓ ${count}` : ""}</span>
              <span style={{ fontSize: 11 }}>{isOpen ? "▲" : "▼"}</span>
            </div>
            {isOpen && (
              <div style={{ background: PAPER }}>
                {cat.svcs.map(svc => {
                  const checked = selSvcs.includes(svc.id);
                  return (
                    <div key={svc.id} onClick={() => toggle(svc.id)}
                      style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 16px", cursor: "pointer", background: checked ? "rgba(122,72,32,0.08)" : "transparent", borderBottom: `1px solid ${PAPER_MID}` }}>
                      <div style={{ width: 16, height: 16, border: `2px solid ${checked ? BROWN_BTN : PAPER_DK}`, borderRadius: 3, background: checked ? BROWN_BTN : PAPER, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {checked && <span style={{ color: PAPER, fontSize: 10 }}>✓</span>}
                      </div>
                      <span style={{ fontSize: 13, color: INK, fontFamily: SANS }}>{svc.name}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
      {/* Show legacy selected services that aren't in the DB (read-only display) */}
      {legacySelected.length > 0 && (
        <div style={{ marginTop: 8, padding: "8px 12px", background: "#fffbe6", border: `1px solid ${PAPER_DK}`, borderRadius: 5 }}>
          <div style={{ fontSize: 11, color: INK_FADE, fontFamily: SANS, marginBottom: 4 }}>Previously selected services:</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {legacySelected.map(id => (
              <span key={id} onClick={() => toggle(id)}
                style={{ fontSize: 12, background: BROWN_BTN, color: PAPER, borderRadius: 20, padding: "3px 10px", cursor: "pointer", fontFamily: SANS }}>
                {LEGACY_SVC_NAMES[id]} ✕
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Village picker — grouped by region, works with entity IDs ─────────────
function VillageSelect({ selAreas, setSelAreas, dbAreas, areaMap }) {
  const [openGroup, setOpenGroup] = useState(null);

  const MACRO_GROUPS = [
    { key: "historic",     label: "🌴 Historic Side / Spanish Springs Area", villages: ["Alhambra","Country Club","Del Mar","El Cortez","Hacienda","La Reynalda","La Zamora","Mira Mesa","Orange Blossom","Silver Lake","Spring Arbor","Valle Verde"] },
    { key: "established_n", label: "🏡 Established Villages (North of SR-466A)", villages: ["Ashland","Belle Aire","Belvedere","Bonita","Bonnybrook","Calumet Grove","Caroline","Chatham","Duval","Glenbrook","Hadley","Hemingway","Lynnhaven","Mallory Square","Pennecamp","Poinciana","Sabal Chase","Santiago","Sunset Pointe","Tall Trees","Virginia Trace","Winifred"] },
    { key: "established_s", label: "🏡 Established Villages (South of SR-466A)", villages: ["Bridgeport at Laurel Valley","Bridgeport at Mission Hills","Charlotte","Collier","Dunedin","Fernandina","Gilchrist","Hillsborough","LaBelle","Lake Deaton","Osceola Hills","Pinellas","Sanibel"] },
    { key: "newer",        label: "🌿 Newer Villages (South of SR-44)", villages: ["Bradford","Brownwood","Cason Hammock","Chitty Chatty","Citrus Grove","DeLuna","DeSoto","Fenney","Hammock at Fenney","Hawkins","Linden","Marsh Bend","McClure","Monarch Grove","Richmond","St. Catherine","St. Johns"] },
    { key: "eastport",     label: "🌊 Eastport / Newest Development Area", villages: ["Dabney","Lake Denham","Moultrie Creek","Newell","Shady Brook"] },
    { key: "family",       label: "🏠 Family / Non-Age-Restricted Villages", villages: ["Bison Valley","Middleton","Oak Meadows","Oxford Oaks"] },
  ];

  // Build name→id map from live DB areas
  const nameToId = {};
  (dbAreas || []).forEach(a => {
    const short = a.name.includes(' — ') ? a.name.split(' — ').pop().trim() : a.name;
    nameToId[short] = a.id;
    nameToId[a.name] = a.id;
  });

  // Also handle legacy: if selAreas contains village names (strings, not IDs), keep them as-is
  const isLegacyName = (v) => !v.match(/^[0-9a-f]{24}$/i);

  const isSelected = (vName) => {
    const id = nameToId[vName];
    return id ? selAreas.includes(id) : selAreas.includes(vName);
  };

  const toggle = (vName) => {
    const id = nameToId[vName];
    // Only allow toggling if we have a valid DB ID — prevents saving plain village name strings
    if (!id) return;
    setSelAreas(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
  };

  const selectAll = (group) => {
    // Only add villages that have a valid DB ID
    const keys = group.villages.map(v => nameToId[v]).filter(Boolean);
    setSelAreas(prev => {
      const s = new Set(prev);
      keys.forEach(k => s.add(k));
      return Array.from(s);
    });
  };

  const deselectAll = (group) => {
    const keys = new Set(group.villages.map(v => nameToId[v]).filter(Boolean));
    setSelAreas(prev => prev.filter(k => !keys.has(k)));
  };

  const groupCount = (group) => group.villages.filter(v => isSelected(v)).length;

  // Any selected areas that don't appear in any macro group (edge cases)
  const allGroupVillages = new Set(MACRO_GROUPS.flatMap(g => g.villages.map(v => nameToId[v] || v)));
  const orphans = selAreas.filter(id => !allGroupVillages.has(id));

  return (
    <div>
      {selAreas.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 10 }}>
          {selAreas.map(id => {
            const area = (dbAreas || []).find(a => a.id === id);
            const legAreaName = LEGACY_AREA[id] || null;
            const areaRaw = area ? area.name : (areaMap && areaMap[id]) || legAreaName || null;
            const name = areaRaw ? (areaRaw.includes(' — ') ? areaRaw.split(' — ').pop().trim() : areaRaw) : (legAreaName || id);
            return (
              <span key={id} onClick={() => setSelAreas(prev => prev.filter(a => a !== id))}
                style={{ fontSize: 12, background: TEAL, color: "#fff", borderRadius: 20, padding: "4px 11px", cursor: "pointer", fontFamily: SANS }}>
                {name} ✕
              </span>
            );
          })}
        </div>
      )}

      {MACRO_GROUPS.map(group => {
        const count = groupCount(group);
        const isOpen = openGroup === group.key;
        return (
          <div key={group.key} style={{ marginBottom: 4, borderRadius: 5, overflow: "hidden", border: `1.5px solid ${count > 0 ? TEAL : PAPER_DK}` }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 13px", background: count > 0 ? `linear-gradient(180deg,#006B5C,${TEAL})` : `linear-gradient(180deg,${PAPER_MID},${PAPER_DK})`, color: count > 0 ? "#fff" : INK, cursor: "pointer" }}
              onClick={() => setOpenGroup(isOpen ? null : group.key)}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 11 }}>{isOpen ? "▲" : "▼"}</span>
                <span style={{ fontWeight: 700, fontSize: 13, fontFamily: SERIF }}>{group.label}</span>
                {count > 0 && <span style={{ fontSize: 11, background: "rgba(255,255,255,0.25)", borderRadius: 10, padding: "1px 7px", fontFamily: SANS }}>{count} selected</span>}
              </div>
              <div style={{ display: "flex", gap: 6 }} onClick={e => e.stopPropagation()}>
                <button onClick={() => selectAll(group)} style={{ fontSize: 11, background: "rgba(255,255,255,0.2)", color: count > 0 ? "#fff" : INK, border: "1px solid rgba(255,255,255,0.3)", borderRadius: 4, padding: "3px 9px", cursor: "pointer", fontFamily: SANS }}>All</button>
                {count > 0 && <button onClick={() => deselectAll(group)} style={{ fontSize: 11, background: "rgba(0,0,0,0.15)", color: count > 0 ? "#fff" : INK, border: "1px solid rgba(255,255,255,0.2)", borderRadius: 4, padding: "3px 9px", cursor: "pointer", fontFamily: SANS }}>None</button>}
              </div>
            </div>
            {isOpen && (
              <div style={{ background: PAPER, padding: "8px 10px", display: "flex", flexWrap: "wrap", gap: 6 }}>
                {group.villages.map(vName => {
                  const sel = isSelected(vName);
                  const hasId = !!nameToId[vName];
                  return (
                    <button key={vName} onClick={() => toggle(vName)}
                      disabled={!hasId}
                      title={!hasId ? "Loading..." : vName}
                      style={{ fontSize: 12, padding: "5px 12px", borderRadius: 20, border: `2px solid ${sel ? TEAL : PAPER_DK}`, background: sel ? TEAL : PAPER, color: sel ? "#fff" : (!hasId ? "#bbb" : INK), cursor: hasId ? "pointer" : "not-allowed", fontWeight: sel ? 700 : 400, fontFamily: SANS, transition: "all 0.1s", opacity: hasId ? 1 : 0.5 }}>
                      {sel ? "✓ " : ""}{vName}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
      {selAreas.length > 0 && (
        <div style={{ marginTop: 6, fontSize: 12, color: INK_FADE, fontFamily: SANS }}>
          {selAreas.length} village{selAreas.length !== 1 ? "s" : ""} selected
        </div>
      )}
    </div>
  );
}


// ── RESET PASSWORD SCREEN ─────────────────────────────────────────────────
function ResetPasswordScreen({ token, providerId, onSuccess }) {
  const [pass, setPass] = useState("");
  const [pass2, setPass2] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e && e.preventDefault();
    if (pass.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (pass !== pass2) { setError("Passwords don't match."); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch("https://api.base44.app/api/apps/69d062aca815ce8e697894b1/functions/resetPassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider_id: providerId, token, new_password: pass }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); setLoading(false); return; }
      setDone(true);
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: PAPER, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: SERIF }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <a href="/" style={{ textDecoration: "none" }}>
          <img src="https://media.base44.com/images/public/69d062aca815ce8e697894b1/a9af95bc3_V-Hublogo.png" style={{ height: 60, display: "block", margin: "0 auto 24px", borderRadius: 10 }} alt="V-Hub" />
        </a>
        <div style={{ background: PAPER_MID, border: `2px solid ${BROWN_BTN}`, borderRadius: 12, padding: 28, boxShadow: "0 4px 24px rgba(0,0,0,0.18)" }}>
          <div style={{ fontSize: 20, fontWeight: 900, color: INK, letterSpacing: 1, marginBottom: 6, textAlign: "center" }}>Set New Password</div>

          {done ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
              <div style={{ fontSize: 15, color: GREEN, fontWeight: 700, marginBottom: 10 }}>Password updated!</div>
              <div style={{ fontSize: 13, color: INK_FADE, fontFamily: SANS, lineHeight: 1.6, marginBottom: 20 }}>
                Your password has been changed. You can now sign in with your new password.
              </div>
              <button onClick={onSuccess} style={{ background: BROWN_BTN, color: PAPER, border: "none", borderRadius: 8, padding: "12px 28px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: SANS, letterSpacing: 1 }}>Sign In Now →</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && <div style={{ background: "#ffeaea", border: "1px solid #c0392b", borderRadius: 6, padding: "8px 12px", fontSize: 13, color: "#c0392b", fontFamily: SANS, marginBottom: 14 }}>{error}</div>}
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: INK_FADE, fontFamily: SANS, textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 6 }}>New Password</label>
                <div style={{ position: "relative" }}>
                  <input type={showPass ? "text" : "password"} value={pass} onChange={e => setPass(e.target.value)} placeholder="Min 6 characters" style={{ ...inS, border: `1.5px solid ${BROWN_BTN}`, borderRadius: 8, padding: "12px 44px 12px 14px", fontSize: 15 }} autoFocus />
                  <button type="button" onClick={() => setShowPass(v => !v)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, color: INK_FADE }}>{showPass ? "🙈" : "👁"}</button>
                </div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: INK_FADE, fontFamily: SANS, textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 6 }}>Confirm Password</label>
                <input type={showPass ? "text" : "password"} value={pass2} onChange={e => setPass2(e.target.value)} placeholder="Re-enter new password" style={{ ...inS, border: `1.5px solid ${BROWN_BTN}`, borderRadius: 8, padding: "12px 14px", fontSize: 15 }} />
              </div>
              <button
                type="submit"
                disabled={loading}
                style={{ width: "100%", background: loading ? PAPER_DK : `linear-gradient(180deg,#9A6030,${BROWN_BTN} 60%,#5A3010)`, color: PAPER, border: `3px solid ${YELLOW}`, boxShadow: `0 0 0 1.5px ${YELLOW}`, borderRadius: 8, padding: "14px 20px", fontSize: 15, fontWeight: 900, cursor: loading ? "not-allowed" : "pointer", fontFamily: SERIF, letterSpacing: 2, textTransform: "uppercase" }}
              >
                {loading ? "Saving..." : "Set New Password →"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}




// ── FORCE PASSWORD CHANGE SCREEN (admin-added accounts, first login) ─────────
// Uses requestPasswordReset (email-based) since it's the most reliable flow
function ForcePasswordChangeScreen({ provider, onComplete }) {
  const [newPass, setNewPass]   = useState("");
  const [newPass2, setNewPass2] = useState("");
  const [showP1, setShowP1]     = useState(false);
  const [showP2, setShowP2]     = useState(false);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");
  const [copied, setCopied]     = useState(false);

  const firstName = (provider.owner_name || "").split(" ")[0] || "there";

  // Determine what the temp password is to show it for reference
  // We show it from context — the user just logged in with it
  const tempPass = provider._tempPassDisplay || "";

  const handleCopy = (text) => {
    // Use a textarea to copy — most reliable cross-browser, preserves special chars
    const el = document.createElement("textarea");
    el.value = text;
    el.setAttribute("readonly", "");
    el.style.position = "absolute";
    el.style.left = "-9999px";
    document.body.appendChild(el);
    el.select();
    el.setSelectionRange(0, el.value.length);
    try { document.execCommand("copy"); } catch (_) {}
    document.body.removeChild(el);
    // Also try navigator.clipboard
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e) => {
    e && e.preventDefault();
    setError("");
    if (!newPass || newPass.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (newPass !== newPass2) { setError("Passwords do not match — please try again."); return; }
    setSaving(true);
    let fresh = null;
    try {
      // Use backend function — works for unauthenticated visitors
      const res = await fetch("https://api.base44.app/api/apps/69d062aca815ce8e697894b1/functions/providerLogin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save_password", provider_id: provider.id, vh_number: provider.vh_number, new_password: newPass }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Something went wrong. Please try again.");
        setSaving(false);
        return;
      }
      fresh = { ...provider, ...data.provider, login_password: undefined };
    } catch (err) {
      console.error(err);
      setError("Something went wrong saving your password. Please try again.");
      setSaving(false);
      return;
    }
    // Call onComplete OUTSIDE the try/catch so any React state errors don't falsely show an error
    if (fresh) onComplete(fresh);
  };

  const inputStyle = {
    width: "100%", padding: "10px 12px", fontSize: 15, borderRadius: 6,
    border: `1.5px solid ${PAPER_DK}`, background: "#FFFDF5", color: INK,
    fontFamily: SANS, boxSizing: "border-box", outline: "none",
  };

  return (
    <div style={{ minHeight: "100vh", background: PAPER, backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 27px,rgba(28,15,0,0.03) 27px,rgba(28,15,0,0.03) 28px)", fontFamily: SERIF }}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap" rel="stylesheet" />
      <div style={{ background: PAPER, borderBottom: `3px double ${INK}` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px 8px", boxSizing: "border-box" }}>
          <a href="/" style={{ textDecoration: "none", display: "flex", alignItems: "baseline" }}>
            <span style={{ fontStyle: "italic", fontWeight: 700, fontFamily: "'Great Vibes', cursive", fontSize: 42, color: "#003366", lineHeight: 1 }}>V</span>
            <span style={{ fontSize: 28, fontWeight: 900, color: INK, fontFamily: "'Times New Roman', serif", lineHeight: 1, margin: "0 2px" }}>-</span>
            <span style={{ fontSize: 34, fontWeight: 900, color: INK, fontFamily: "'Times New Roman', serif", letterSpacing: -1, lineHeight: 1 }}>Hub</span>
          </a>
          <a href="/" style={{ textDecoration: "none" }}>
            <button onClick={() => window.location.href = '/'} style={{ background: `linear-gradient(180deg,#9A6030,${BROWN_BTN} 60%,#5A3010)`, border: `2px solid #1B3D6F`, borderRadius: 4, color: "#F5E8CC", fontFamily: SANS, fontWeight: 700, fontSize: 13, padding: "8px 18px", cursor: "pointer", whiteSpace: "nowrap" }>{"«"} Home</button>
          </a>
        </div>
      </div>

      <div style={{ textAlign: "center", padding: "28px 20px 20px", borderBottom: `3px double ${INK}` }}>
        <div style={{ fontSize: 28, fontWeight: 900, color: INK, letterSpacing: 3, textTransform: "uppercase", fontFamily: SERIF }}>Provider Hub</div>
        <div style={{ height: 2, background: RED_RULE, margin: "10px auto", width: 180 }} />
        <div style={{ fontSize: 13, color: INK_FADE, fontStyle: "italic", fontFamily: SERIF }}>Create your permanent password</div>
      </div>

      <div style={{ maxWidth: 460, margin: "36px auto", padding: "0 20px 60px" }}>
        <div style={{ background: PAPER_MID, border: `2px solid ${PAPER_DK}`, borderRadius: 10, padding: "32px 28px", boxShadow: "0 4px 24px rgba(28,15,0,0.10)" }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>🔑</div>
            <div style={{ fontSize: 17, fontWeight: 900, color: INK, textTransform: "uppercase", letterSpacing: 2, fontFamily: SERIF }}>
              Welcome, {firstName}!
            </div>
            <div style={{ fontSize: 13, color: INK_FADE, fontStyle: "italic", marginTop: 8, lineHeight: 1.7, fontFamily: SERIF }}>
              You're signed in with your temporary password.<br/>Please create a permanent one to continue.
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: INK_FADE, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6, fontFamily: SANS }}>New Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showP1 ? "text" : "password"}
                  value={newPass}
                  onChange={e => setNewPass(e.target.value)}
                  placeholder="At least 6 characters"
                  style={inputStyle}
                  autoComplete="new-password"
                />
                <button type="button" onClick={() => setShowP1(v => !v)}
                  style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, color: INK_FADE }}>
                  {showP1 ? "🙈" : "👁"}
                </button>
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: INK_FADE, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6, fontFamily: SANS }}>Confirm New Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showP2 ? "text" : "password"}
                  value={newPass2}
                  onChange={e => setNewPass2(e.target.value)}
                  placeholder="Re-enter password"
                  style={inputStyle}
                  autoComplete="new-password"
                />
                <button type="button" onClick={() => setShowP2(v => !v)}
                  style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, color: INK_FADE }}>
                  {showP2 ? "🙈" : "👁"}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ background: "#FEE", border: `1.5px solid ${RED_RULE}`, borderRadius: 6, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: RED_RULE, fontFamily: SANS }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              style={{ width: "100%", padding: "13px", background: saving ? "#aaa" : `linear-gradient(180deg,#9A6030,${BROWN_BTN} 60%,#5A3010)`, border: `2px solid #1B3D6F`, borderRadius: 7, color: "#F5E8CC", fontFamily: SERIF, fontWeight: 900, fontSize: 15, letterSpacing: 1, cursor: saving ? "not-allowed" : "pointer" }}
            >
              {saving ? "Saving…" : "Set My Password & Enter Hub →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}


// ── FORGOT PASSWORD SCREEN ────────────────────────────────────────────────
function ForgotPasswordScreen({ onBack }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e && e.preventDefault();
    const val = email.trim();
    if (!val) { setError("Please enter your email address."); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch("https://api.base44.app/api/apps/69d062aca815ce8e697894b1/functions/requestPasswordReset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: val }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); setLoading(false); return; }
      setSent(true);
    } catch {
      setError("Something went wrong. Please try again or email admin@v-hub.us.");
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: PAPER, backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 27px,rgba(28,15,0,0.03) 27px,rgba(28,15,0,0.03) 28px)", fontFamily: SERIF }}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap" rel="stylesheet" />
      <div style={{ background: PAPER, borderBottom: `3px double ${INK}` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px 8px", boxSizing: "border-box" }}>
          <a href="/" style={{ textDecoration: "none", display: "flex", alignItems: "baseline" }}>
            <span style={{ fontStyle: "italic", fontWeight: 700, fontFamily: "'Great Vibes', cursive", fontSize: 42, color: "#003366", lineHeight: 1 }}>V</span>
            <span style={{ fontSize: 28, fontWeight: 900, color: INK, fontFamily: "'Times New Roman', serif", lineHeight: 1, margin: "0 2px" }}>-</span>
            <span style={{ fontSize: 34, fontWeight: 900, color: INK, fontFamily: "'Times New Roman', serif", letterSpacing: -1, lineHeight: 1 }}>Hub</span>
          </a>
          <a href="/" style={{ textDecoration: "none" }}>
            <button onClick={() => window.location.href = '/'} style={{ background: `linear-gradient(180deg,#9A6030,${BROWN_BTN} 60%,#5A3010)`, border: `2px solid #1B3D6F`, borderRadius: 4, color: "#F5E8CC", fontFamily: SANS, fontWeight: 700, fontSize: 13, padding: "8px 18px", cursor: "pointer", whiteSpace: "nowrap" }>{"«"} Home</button>
          </a>
        </div>
      </div>
      <div style={{ textAlign: "center", padding: "32px 20px 24px", borderBottom: `3px double ${INK}` }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 4, color: INK_FADE, textTransform: "uppercase", fontFamily: SERIF, marginBottom: 6 }}>The Villages, Florida</div>
        <div style={{ fontSize: 28, fontWeight: 900, color: INK, letterSpacing: 3, textTransform: "uppercase", fontFamily: SERIF }}>Provider Hub</div>
        <div style={{ height: 2, background: RED_RULE, margin: "10px auto", width: 180 }} />
      </div>
      <div style={{ maxWidth: 460, margin: "40px auto", padding: "0 20px 60px" }}>
        <div style={{ background: PAPER_MID, border: `2px solid ${PAPER_DK}`, borderRadius: 10, padding: "32px 28px", boxShadow: "0 4px 24px rgba(28,15,0,0.10)" }}>
          {sent ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📬</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: INK, marginBottom: 10 }}>Check Your Email</div>
              <div style={{ fontSize: 14, color: INK_FADE, fontFamily: SANS, lineHeight: 1.7, marginBottom: 24 }}>
                If an account exists for <strong>{email}</strong>, a password reset link has been sent.<br/>
                Check your spam folder if you don't see it within a few minutes.
              </div>
              <button onClick={onBack} style={{ background: `linear-gradient(180deg,#9A6030,${BROWN_BTN} 60%,#5A3010)`, color: PAPER, border: `3px solid ${YELLOW}`, boxShadow: `0 0 0 1.5px ${YELLOW}`, borderRadius: 8, padding: "12px 28px", fontSize: 14, fontWeight: 900, cursor: "pointer", fontFamily: SERIF, letterSpacing: 2, textTransform: "uppercase" }}>
                Back to Sign In →
              </button>
            </div>
          ) : (
            <>
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>🔑</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: INK, textTransform: "uppercase", letterSpacing: 2, fontFamily: SERIF }}>Reset Your Password</div>
                <div style={{ fontSize: 13, color: INK_FADE, fontStyle: "italic", marginTop: 6, lineHeight: 1.6, fontFamily: SERIF }}>
                  Enter the email address on your account and we'll send you a reset link.
                </div>
              </div>
              {error && (
                <div style={{ background: "#FEE", border: `1.5px solid ${RED_RULE}`, borderRadius: 6, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: RED_RULE, fontFamily: SANS }}>
                  ⚠ {error}
                </div>
              )}
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 20 }}>
                  <label style={lbS}>Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    style={inS}
                    autoFocus
                    autoComplete="email"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  style={{ width: "100%", background: loading ? PAPER_DK : `linear-gradient(180deg,#9A6030,${BROWN_BTN} 60%,#5A3010)`, color: PAPER, border: `3px solid ${YELLOW}`, boxShadow: `0 0 0 1.5px ${YELLOW}, 0 0 12px 3px rgba(255,220,0,0.25)`, borderRadius: 8, padding: "15px 20px", fontSize: 15, fontWeight: 900, cursor: loading ? "not-allowed" : "pointer", fontFamily: SERIF, letterSpacing: 2, textTransform: "uppercase" }}
                >
                  {loading ? "Sending..." : "Send Reset Link →"}
                </button>
              </form>
              <div style={{ textAlign: "center", marginTop: 20, paddingTop: 16, borderTop: `1px solid ${PAPER_DK}` }}>
                <button onClick={onBack} style={{ background: "none", border: "none", color: BROWN_BTN, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: SANS, textDecoration: "underline" }}>
                  ← Back to Sign In
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── LOGIN SCREEN ──────────────────────────────────────────────────────────
// ── SHA-256 password hashing (Web Crypto API) ─────────────────────────────
async function hashPassword(plain) {
  if (!plain) return "";
  // If already a 64-char hex SHA-256, return as-is (already hashed)
  if (/^[0-9a-f]{64}$/.test(plain)) return plain;
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest("SHA-256", enc.encode(plain));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

function LoginScreen({ onLogin, onForgot }) {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass]   = useState("");
  const [showPass, setShowPass]     = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");
  const emailRef = useRef(null);
  const passRef  = useRef(null);

  const handleLogin = async (e) => {
    e && e.preventDefault();
    setError("");
    const emailVal = (loginEmail || (emailRef.current && emailRef.current.value) || "").trim();
    const passVal  = loginPass || (passRef.current && passRef.current.value) || "";
    if (!emailVal || !passVal) { setError("Please enter your email/VH number and password."); return; }
    setLoading(true);
    try {
      // Use backend function so entity reads work for unauthenticated visitors
      const res = await fetch("https://api.base44.app/api/apps/69d062aca815ce8e697894b1/functions/providerLogin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: emailVal, password: passVal }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Login failed. Please try again.");
        setLoading(false);
        return;
      }
      const prov = data.provider;
      // Block inactive accounts UNLESS they are admin-added (pending approval) — those can always log in
      if (!prov.is_active && prov.onboarding_type !== "admin_added") {
        setError("Your account is not yet active. Contact admin@v-hub.us.");
        setLoading(false);
        return;
      }
      sessionStorage.setItem("vhub_provider_id", prov.id);
      onLogin(prov);
    } catch (err) {
      console.error("Login error:", err);
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: PAPER, backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 27px,rgba(28,15,0,0.03) 27px,rgba(28,15,0,0.03) 28px)", fontFamily: SERIF }}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap" rel="stylesheet" />
      {/* Masthead — matches homepage style */}
      <div style={{ background: PAPER, borderBottom: `3px double ${INK}` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px 8px", boxSizing: "border-box" }}>
          <a href="/" style={{ textDecoration: "none", display: "flex", alignItems: "baseline" }}>
            <span style={{ fontStyle: "italic", fontWeight: 700, fontFamily: "'Great Vibes', cursive", fontSize: 42, color: "#003366", lineHeight: 1 }}>V</span>
            <span style={{ fontSize: 28, fontWeight: 900, color: INK, fontFamily: "'Times New Roman', serif", lineHeight: 1, margin: "0 2px" }}>-</span>
            <span style={{ fontSize: 34, fontWeight: 900, color: INK, fontFamily: "'Times New Roman', serif", letterSpacing: -1, lineHeight: 1 }}>Hub</span>
          </a>
          <a href="/" style={{ textDecoration: "none" }}>
            <button onClick={() => window.location.href = '/'} style={{ background: `linear-gradient(180deg,#9A6030,${BROWN_BTN} 60%,#5A3010)`, border: `2px solid #1B3D6F`, borderRadius: 4, color: "#F5E8CC", fontFamily: SANS, fontWeight: 700, fontSize: 13, padding: "8px 18px", cursor: "pointer", whiteSpace: "nowrap" }>{"«"} Home</button>
          </a>
        </div>
      </div>

      {/* Page header */}
      <div style={{ textAlign: "center", padding: "32px 20px 24px", borderBottom: `3px double ${INK}` }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 4, color: INK_FADE, textTransform: "uppercase", fontFamily: SERIF, marginBottom: 6 }}>The Villages, Florida</div>
        <div style={{ fontSize: 28, fontWeight: 900, color: INK, letterSpacing: 3, textTransform: "uppercase", fontFamily: SERIF }}>Provider Hub</div>
        <div style={{ height: 2, background: RED_RULE, margin: "10px auto", width: 180 }} />
        <div style={{ fontSize: 13, color: INK_FADE, fontStyle: "italic", fontFamily: SERIF }}>Manage your listing · View stats · Update services & villages</div>
      </div>

      {/* Login card */}
      <div style={{ maxWidth: 460, margin: "40px auto", padding: "0 20px 60px" }}>
        <div style={{ background: PAPER_MID, border: `2px solid ${PAPER_DK}`, borderRadius: 10, padding: "32px 28px", boxShadow: "0 4px 24px rgba(28,15,0,0.10)" }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>🔐</div>
            <div style={{ fontSize: 16, fontWeight: 900, color: INK, textTransform: "uppercase", letterSpacing: 2, fontFamily: SERIF }}>Sign In to Your Hub</div>
            <div style={{ fontSize: 13, color: INK_FADE, fontStyle: "italic", marginTop: 6, lineHeight: 1.6, fontFamily: SERIF }}>
              Use your email or VH account number, plus your password. First time? Use the temporary password from your welcome email.
            </div>
          </div>

          {error && (
            <div style={{ background: "#FEE", border: `1.5px solid ${RED_RULE}`, borderRadius: 6, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: RED_RULE, fontFamily: SANS }}>
              ⚠ {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 14 }}>
              <label style={lbS}>Email Address or VH Number</label>
              <input
                ref={emailRef}
                type="text"
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                placeholder="your@email.com or VH-1234"
                style={inS}
                autoComplete="email"
              />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={lbS}>Password</label>
              <div style={{ position: "relative" }}>
                <input
                  ref={passRef}
                  type={showPass ? "text" : "password"}
                  value={loginPass}
                  onChange={e => setLoginPass(e.target.value)}
                  placeholder="Your V-Hub password"
                  style={{ ...inS, paddingRight: 44 }}
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPass(p => !p)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, color: INK_FADE }}>
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%", background: loading ? PAPER_DK : `linear-gradient(180deg,#9A6030,${BROWN_BTN} 60%,#5A3010)`,
                color: PAPER, border: `3px solid ${YELLOW}`, boxShadow: `0 0 0 1.5px ${YELLOW}, 0 0 12px 3px rgba(255,220,0,0.25)`,
                borderRadius: 8, padding: "15px 20px", fontSize: 15, fontWeight: 900,
                cursor: loading ? "not-allowed" : "pointer", fontFamily: SERIF, letterSpacing: 2, textTransform: "uppercase",
              }}
            >
              {loading ? "Signing In..." : "Sign In →"}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: 20, paddingTop: 16, borderTop: `1px solid ${PAPER_DK}` }}>
            <button
              type="button"
              onClick={onForgot}
              style={{ background: "none", border: "none", color: BROWN_BTN, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: SANS, textDecoration: "underline" }}
            >
              Forgot your password?
            </button>
            <div style={{ marginTop: 10, fontSize: 12, color: INK_FADE, fontFamily: SANS }}>
              Having trouble?{" "}
              <a href="mailto:admin@v-hub.us?subject=Provider Hub Login Help" style={{ color: BROWN_BTN, fontWeight: 700, textDecoration: "none" }}>
                Contact admin@v-hub.us
              </a>
            </div>
          </div>

          <div style={{ textAlign: "center", marginTop: 16, fontSize: 12, color: INK_FADE, fontStyle: "italic", fontFamily: SANS }}>
            Not listed yet?{" "}
            <a href="/ListService" style={{ color: BROWN_BTN, fontWeight: 700, textDecoration: "none" }}>List your business here →</a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────

//   is_active=true  → LIVE ad (paid, visible on site for 7 days)
//   is_active=false → QUEUED ad (pre-built, up to 3 in queue)
//   is_queued_next=true → marked as the next one to launch
//   saved_images[]  → up to 3 stored image URLs per ad
//
// Flow: Build ad → save to queue → preview it → mark "next" →
//       pay $10 via Stripe → goes live immediately for 7 days.
//       NOT charged again until they manually launch another ad.

function ClassifiedAdSection({ provider }) {
  const [adSlots, setAdSlots]         = React.useState([]);
  const [liveAd, setLiveAd]           = React.useState(null);
  const [loading, setLoading]         = React.useState(true);
  const [editingSlot, setEditingSlot] = React.useState(null); // record obj | "new" | null
  const [previewAd, setPreviewAd]     = React.useState(null); // ad to preview (can be queued or form data)
  const [previewFromEditor, setPreviewFromEditor] = React.useState(false);

  const [form, setForm] = React.useState({ headline: "", body: "", village: "", address: "", image_url: "" });
  const [saving, setSaving]   = React.useState(false);
  const [saveMsg, setSaveMsg] = React.useState("");
  const [saveErr, setSaveErr] = React.useState("");
  const [savedAdRecord, setSavedAdRecord] = React.useState(null); // last saved ad — for inline pay button

  const fileRef               = React.useRef(null);
  const [filePreview, setFilePreview] = React.useState(null);
  const [fileObj, setFileObj]         = React.useState(null);
  const [uploading, setUploading]     = React.useState(false);

  const [showImagePicker, setShowImagePicker] = React.useState(false);
  const [aiPrompt, setAiPrompt]   = React.useState("");
  const [aiGenerating, setAiGenerating] = React.useState(false);
  const [aiError, setAiError]     = React.useState("");

  const [checkoutLoading, setCheckoutLoading] = React.useState(false);
  const [checkoutErr, setCheckoutErr]         = React.useState("");

  // ── Styles (local constants matching dashboard palette) ──────────────────
  const SERIF     = "'Times New Roman', Georgia, serif";
  const SANS      = "'Helvetica Neue', Arial, sans-serif";
  const PAPER     = "#F5EDD6";
  const PAPER_MID = "#EDE0BE";
  const PAPER_DK  = "#C8B89A";
  const INK       = "#1C0F00";
  const INK_FADE  = "#6B5744";
  const TEAL      = "#00897B";
  const NAVY      = "#1B3D6F";
  const GREEN     = "#1A6B3C";
  const BROWN_BTN = "#7A4820";
  const YELLOW    = "#FFDB00";
  const lbS = { display: "block", fontSize: 11, fontWeight: 700, color: INK_FADE, fontFamily: SANS, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 4 };
  const inS = { width: "100%", boxSizing: "border-box", background: "#FFFDF5", border: `1.5px solid ${PAPER_DK}`, borderRadius: 5, padding: "9px 10px", fontSize: 13, color: INK, fontFamily: SANS, outline: "none" };

  // ── Load ─────────────────────────────────────────────────────────────────
  const loadAds = React.useCallback(async () => {
    if (!provider?.id) return;
    setLoading(true);
    try {
      const ads = await ClassifiedAd.filter({ provider_id: provider.id });
      const sorted = [...(ads || [])].sort((a, b) => (a.slot_number || 99) - (b.slot_number || 99));
      setLiveAd(sorted.find(a => a.is_active) || null);
      setAdSlots(sorted);
    } catch { setAdSlots([]); setLiveAd(null); }
    finally { setLoading(false); }
  }, [provider?.id]);

  React.useEffect(() => { loadAds(); }, [loadAds]);

  const queued      = adSlots.filter(a => !a.is_active);
  const nextUp      = queued.find(a => a.is_queued_next) || null;
  const liveExpired = liveAd?.deal_expires_at && new Date(liveAd.deal_expires_at) < new Date();

  // ── Open editor ──────────────────────────────────────────────────────────
  const openEdit = (slot) => {
    setEditingSlot(slot || "new");
    setForm({
      headline:  slot?.headline || "",
      body:      slot?.body     || "",
      village:   slot?.village  || "",
      address:   slot?.address  || "",
      image_url: slot?.image_url || "",
    });
    setFilePreview(null); setFileObj(null);
    setAiPrompt(slot?.ai_prompt || "");
    setAiError(""); setSaveErr(""); setSaveMsg(""); setSavedAdRecord(null);
    setShowImagePicker(false);
  };
  const closeEdit = () => { setEditingSlot(null); setFilePreview(null); setFileObj(null); setSaveErr(""); setSaveMsg(""); setSavedAdRecord(null); };

  // ── File upload ──────────────────────────────────────────────────────────
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileObj(file);
    const reader = new FileReader();
    reader.onload = ev => setFilePreview(ev.target.result);
    reader.readAsDataURL(file);
    // Upload immediately so we have a real URL
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const upResp = await fetch("https://api.base44.app/api/apps/69d062aca815ce8e697894b1/storage/upload", { method: "POST", body: fd });
      const upData = await upResp.json();
      if (upData.url) {
        setForm(p => ({ ...p, image_url: upData.url }));
        setFilePreview(upData.url);
        setFileObj(null);
      }
    } catch { /* keep filePreview, will re-upload on save */ }
    finally { setUploading(false); }
  };

  // ── AI image ─────────────────────────────────────────────────────────────
  const handleGenerateAI = async () => {
    if (!aiPrompt.trim()) return;
    setAiError(""); setAiGenerating(true);
    try {
      const resp = await fetch("https://api.base44.app/api/apps/69d062aca815ce8e697894b1/functions/generateAdImage", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt, provider_id: provider.id }),
      });
      const data = await resp.json();
      if (data.url) {
        setForm(p => ({ ...p, image_url: data.url }));
        setFilePreview(null); setFileObj(null);
        // Persist to saved_images on existing record
        const existingRecord = editingSlot !== "new" ? editingSlot : null;
        if (existingRecord?.id) {
          const existingSaved = existingRecord.saved_images || [];
          const newSaved = [data.url, ...existingSaved.filter(u => u !== data.url)].slice(0, 3);
          await ClassifiedAd.update(existingRecord.id, { ai_prompt: aiPrompt, image_url: data.url, saved_images: newSaved });
          await loadAds();
          const fresh = await ClassifiedAd.filter({ provider_id: provider.id });
          const updated = fresh.find(a => a.id === existingRecord.id);
          if (updated) setEditingSlot(updated);
        }
      } else { setAiError("Generation failed: " + (data.error || "unknown error")); }
    } catch { setAiError("Error generating. Please try again."); }
    finally { setAiGenerating(false); }
  };

  // ── Save draft ───────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.headline.trim()) { setSaveErr("Please enter a headline."); return; }
    if (!form.body.trim()) { setSaveErr("Please enter a description."); return; }
    setSaveErr(""); setSaving(true); setSaveMsg("");
    try {
      let imageUrl = form.image_url;
      if (fileObj) {
        const fd = new FormData();
        fd.append("file", fileObj);
        const upResp = await fetch("https://api.base44.app/api/apps/69d062aca815ce8e697894b1/storage/upload", { method: "POST", body: fd });
        const upData = await upResp.json();
        imageUrl = upData.url || imageUrl;
      }
      const existingRecord = editingSlot !== "new" ? editingSlot : null;
      const existingSaved = existingRecord?.saved_images || [];
      const newSaved = imageUrl && !existingSaved.includes(imageUrl)
        ? [imageUrl, ...existingSaved].slice(0, 3)
        : existingSaved.slice(0, 3);
      const data = {
        provider_id:   provider.id,
        provider_name: provider.business_name,
        headline:  form.headline,
        body:      form.body,
        village:   form.village,
        address:   form.address,
        image_url: imageUrl || "",
        ai_prompt: aiPrompt,
        saved_images: newSaved,
        is_active:    existingRecord?.is_active || false,
        slot_number:  existingRecord?.slot_number || (queued.length + 2),
      };
      if (existingRecord?.id) {
        await ClassifiedAd.update(existingRecord.id, data);
      } else {
        await ClassifiedAd.create(data);
      }
      const freshAds = await ClassifiedAd.filter({ provider_id: provider.id });
      const justSaved = existingRecord?.id
        ? freshAds.find(a => a.id === existingRecord.id)
        : [...freshAds].sort((a,b) => new Date(b.created_date)-new Date(a.created_date))[0];
      setSavedAdRecord(justSaved || null);
      await loadAds();
      setSaveMsg("saved");
      setFileObj(null); setFilePreview(null);
    } catch { setSaveErr("Error saving. Please try again."); }
    finally { setSaving(false); }
  };

  // ── Mark Next Up ─────────────────────────────────────────────────────────
  const handleMarkNext = async (ad) => {
    for (const a of queued) {
      if (a.id !== ad.id && a.is_queued_next) await ClassifiedAd.update(a.id, { is_queued_next: false });
    }
    await ClassifiedAd.update(ad.id, { is_queued_next: !ad.is_queued_next });
    await loadAds();
  };

  const handleDeleteQueued = async (ad) => {
    if (!window.confirm("Delete this queued ad?")) return;
    await ClassifiedAd.delete(ad.id);
    await loadAds();
  };

  // ── Stripe Checkout — ALWAYS required to go live ─────────────────────────
  const handleCheckout = async (adToActivate) => {
    setCheckoutErr(""); setCheckoutLoading(true);
    try {
      const resp = await fetch("https://api.base44.app/api/apps/69d062aca815ce8e697894b1/functions/createClassifiedsCheckout", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider_record_id: provider.id,
          provider_email:     provider.login_email || provider.email,
          provider_name:      provider.business_name,
          ad_id_to_activate:  adToActivate?.id || null,
        }),
      });
      const data = await resp.json();
      if (data.url) window.location.href = data.url;
      else setCheckoutErr("Could not start checkout: " + (data.error || "unknown error"));
    } catch { setCheckoutErr("Error connecting to Stripe. Please try again."); }
    finally { setCheckoutLoading(false); }
  };

  // ── Preview modal data ───────────────────────────────────────────────────
  const openPreviewFromEditor = () => {
    setPreviewAd({
      headline:      form.headline || "Your Headline Here",
      body:          form.body     || "Your deal description here.",
      village:       form.village  || "",
      address:       form.address  || "",
      image_url:     filePreview   || form.image_url || "",
      provider_name: provider.business_name || "",
      deal_expires_at: null, // not yet set — webhook sets this at payment time
    });
    setPreviewFromEditor(true);
  };

  const openPreviewQueued = (ad) => {
    setPreviewAd(ad);
    setPreviewFromEditor(false);
  };

  const currentRecord = editingSlot !== "new" && editingSlot !== null ? editingSlot : null;
  const pickerImages  = currentRecord?.saved_images || [];
  const displayImage  = filePreview || form.image_url;

  if (loading) return <div style={{ padding: 16, fontSize: 13, color: INK_FADE, fontFamily: SANS }}>Loading ads…</div>;

  return (
    <div style={{ marginBottom: 24 }}>

      {/* ── STEP INDICATOR (when no live ad and nothing in queue) ── */}
      {!liveAd && queued.length === 0 && editingSlot === null && (
        <div style={{ background: PAPER_MID, border: `2px dashed ${PAPER_DK}`, borderRadius: 10, padding: "20px 16px", textAlign: "center", marginBottom: 14 }}>
          <div style={{ fontSize: 22, marginBottom: 8 }}>📣</div>
          <div style={{ fontSize: 14, fontWeight: 900, color: INK, fontFamily: SERIF, marginBottom: 6 }}>Advertise on Deals of the Week</div>
          <div style={{ fontSize: 12, color: INK_FADE, fontFamily: SANS, lineHeight: 1.8, marginBottom: 14 }}>
            <span style={{ color: NAVY, fontWeight: 700 }}>Step 1</span> — Build your ad (headline, image, description)<br/>
            <span style={{ color: NAVY, fontWeight: 700 }}>Step 2</span> — Preview it exactly as visitors will see it<br/>
            <span style={{ color: NAVY, fontWeight: 700 }}>Step 3</span> — Pay <strong>$10</strong> via Stripe · runs 7 days · no auto-charge
          </div>
          <button data-testid="create-first-ad-btn" onClick={() => openEdit(null)} style={{ background: `linear-gradient(180deg,#9A6030,${BROWN_BTN})`, color: PAPER, border: `2px solid ${NAVY}`, borderRadius: 6, padding: "11px 28px", fontSize: 13, fontWeight: 900, cursor: "pointer", fontFamily: SERIF }}>
            ✚ Create My First Ad
          </button>
        </div>
      )}

      {/* ── LIVE AD STATUS ── */}
      {liveAd && !liveExpired && (
        <div style={{ background: "#E8F5E9", border: "2px solid #2E7D32", borderRadius: 8, padding: "12px 16px", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 4 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 900, color: "#1B5E20", fontFamily: SERIF }}>🟢 Live Now:</span>
              <span style={{ fontSize: 13, color: "#2E7D32", fontFamily: SANS, fontWeight: 700 }}>{liveAd.headline}</span>
            </div>
            <button onClick={() => openPreviewQueued(liveAd)} style={{ background: "none", border: `1.5px solid ${TEAL}`, color: TEAL, borderRadius: 4, padding: "4px 10px", fontSize: 11, cursor: "pointer", fontFamily: SANS, fontWeight: 700 }}>👁 Preview</button>
          </div>
          {liveAd.deal_expires_at && (
            <div style={{ fontSize: 11, color: "#388E3C", fontFamily: SANS }}>
              Runs through {new Date(liveAd.deal_expires_at).toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}
            </div>
          )}
          {nextUp && (
            <div style={{ marginTop: 6, fontSize: 11, color: "#1A6B3C", fontFamily: SANS, fontStyle: "italic" }}>
              ⏭ Queued next: <strong>{nextUp.headline}</strong>
            </div>
          )}
        </div>
      )}

      {/* ── EXPIRED — need new payment to relaunch ── */}
      {liveExpired && (
        <div style={{ background: "#FFF3E0", border: "2px solid #E65100", borderRadius: 8, padding: "14px 16px", marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 900, color: "#E65100", fontFamily: SERIF, marginBottom: 6 }}>⏰ Your Ad Has Ended</div>
          <div style={{ fontSize: 12, color: INK, fontFamily: SANS, lineHeight: 1.7, marginBottom: 10 }}>
            <strong>"{liveAd.headline}"</strong> has expired.{" "}
            {nextUp
              ? <>Pick <strong>"{nextUp.headline}"</strong> below and pay <strong>$10</strong> to go live for another 7 days.</>
              : <>Build a new ad or mark a queued one "Next Up", then pay <strong>$10</strong> to go live.</>}
          </div>
          {checkoutErr && <div style={{ marginTop: 8, fontSize: 12, color: "#c00", fontFamily: SANS }}>{checkoutErr}</div>}
        </div>
      )}

      {/* ── QUEUED ADS LIST ── */}
      {queued.length > 0 && editingSlot === null && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: INK_FADE, fontFamily: SANS, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>
            Your Ad Queue ({queued.length}/3) — pre-built, not yet live
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {queued.map(ad => (
              <div key={ad.id} style={{
                background: ad.is_queued_next ? "#EFF8FF" : PAPER,
                border: ad.is_queued_next ? "2px solid #1565C0" : `1.5px solid ${PAPER_DK}`,
                borderRadius: 8, padding: "10px 12px",
                display: "flex", alignItems: "flex-start", gap: 10,
              }}>
                {/* Thumbnail */}
                {ad.image_url
                  ? <img src={ad.image_url} alt="" style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 4, flexShrink: 0, border: `1.5px solid ${PAPER_DK}` }} />
                  : <div style={{ width: 56, height: 56, background: PAPER_MID, borderRadius: 4, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>📄</div>
                }
                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 900, color: INK, fontFamily: SERIF, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {ad.headline}
                    {ad.is_queued_next && <span style={{ marginLeft: 8, fontSize: 10, background: "#1565C0", color: "#fff", borderRadius: 10, padding: "2px 7px", fontFamily: SANS }}>⏭ NEXT UP</span>}
                  </div>
                  <div style={{ fontSize: 11, color: INK_FADE, fontFamily: SANS, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ad.body}</div>
                  {ad.village && <div style={{ fontSize: 10, color: TEAL, fontFamily: SANS, marginTop: 2 }}>📍 {ad.village}</div>}
                </div>
                {/* Actions */}
                <div style={{ display: "flex", flexDirection: "column", gap: 4, flexShrink: 0 }}>
                  <button onClick={() => openPreviewQueued(ad)} style={{ background: PAPER, border: `1.5px solid ${TEAL}`, color: TEAL, borderRadius: 4, padding: "4px 10px", fontSize: 10, cursor: "pointer", fontFamily: SANS, fontWeight: 700 }}>👁 Preview</button>
                  <button onClick={() => openEdit(ad)} style={{ background: PAPER, border: `1.5px solid ${PAPER_DK}`, color: INK_FADE, borderRadius: 4, padding: "4px 10px", fontSize: 10, cursor: "pointer", fontFamily: SANS, fontWeight: 700 }}>✏ Edit</button>
                  <button onClick={() => handleMarkNext(ad)} style={{ background: ad.is_queued_next ? "#1565C0" : PAPER, color: ad.is_queued_next ? "#fff" : "#1565C0", border: "1.5px solid #1565C0", borderRadius: 4, padding: "4px 10px", fontSize: 10, cursor: "pointer", fontFamily: SANS, fontWeight: 700 }}>
                    {ad.is_queued_next ? "✓ Next Up" : "⏭ Set Next"}
                  </button>
                  <button onClick={() => handleDeleteQueued(ad)} style={{ background: "transparent", border: "1.5px solid #c00", color: "#c00", borderRadius: 4, padding: "4px 8px", fontSize: 10, cursor: "pointer", fontFamily: SANS }}>🗑</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── PAY TO GO LIVE — shown when an ad is marked Next Up ── */}
      {nextUp && editingSlot === null && (
        <div style={{ background: "#F0FBF4", border: "2px solid #2E7D32", borderRadius: 8, padding: "14px 16px", marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 900, color: "#2E7D32", fontFamily: SERIF, marginBottom: 4 }}>
            ✅ Ready to Launch — <span style={{ color: INK }}>"{nextUp.headline}"</span>
          </div>
          <div style={{ fontSize: 12, color: INK_FADE, fontFamily: SANS, lineHeight: 1.7, marginBottom: 10 }}>
            Pay <strong style={{ color: INK }}>$10</strong> to go live for <strong style={{ color: INK }}>7 days</strong>. You won't be charged again unless you launch another ad.
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <button disabled={checkoutLoading} onClick={() => handleCheckout(nextUp)}
              style={{ background: "linear-gradient(180deg,#1A6B3C,#145530)", color: "#fff", border: "2px solid #1A6B3C", borderRadius: 6, padding: "11px 28px", fontSize: 13, fontWeight: 900, cursor: checkoutLoading ? "not-allowed" : "pointer", fontFamily: SERIF, opacity: checkoutLoading ? 0.7 : 1 }}>
              {checkoutLoading ? "Redirecting to Stripe…" : `💳 Pay $10 — Launch Ad for 7 Days →`}
            </button>
            <button onClick={() => openPreviewQueued(nextUp)} style={{ background: "none", border: `1.5px solid ${TEAL}`, color: TEAL, borderRadius: 6, padding: "10px 16px", fontSize: 12, cursor: "pointer", fontFamily: SANS, fontWeight: 700 }}>👁 Preview First</button>
          </div>
          {checkoutErr && <div style={{ marginTop: 8, fontSize: 12, color: "#c00", fontFamily: SANS }}>{checkoutErr}</div>}
        </div>
      )}

      {/* Hint: they have queued ads but haven't marked one Next */}
      {queued.length > 0 && !nextUp && editingSlot === null && (
        <div style={{ background: "#EFF8FF", border: "1.5px solid #1565C0", borderRadius: 8, padding: "10px 14px", marginBottom: 14, fontSize: 12, color: "#1565C0", fontFamily: SANS, lineHeight: 1.7 }}>
          ⏭ <strong>Ready to go live?</strong> Click <strong>"Set Next"</strong> on the ad you want to run, then pay $10 to launch it for 7 days.
        </div>
      )}

      {/* Add another to queue button */}
      {queued.length > 0 && queued.length < 3 && editingSlot === null && (
        <button onClick={() => openEdit(null)} style={{ width: "100%", background: PAPER, border: `1.5px dashed ${PAPER_DK}`, color: INK_FADE, borderRadius: 6, padding: "9px", fontSize: 12, cursor: "pointer", fontFamily: SANS, marginBottom: 14 }}>
          ✚ Queue Another Ad ({queued.length}/3 slots used)
        </button>
      )}

      {/* ── AD EDITOR ── */}
      {editingSlot !== null && (
        <div style={{ background: PAPER_MID, border: `2px solid ${PAPER_DK}`, borderRadius: 10, padding: "16px 14px", marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 900, color: INK, fontFamily: SERIF }}>
              {currentRecord ? "✏ Edit Ad" : "✚ Build New Ad"}
            </div>
            <button onClick={closeEdit} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: INK_FADE }}>✕</button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 14px" }}>
            <div style={{ gridColumn: "1/-1" }}>
              <label style={lbS}>Headline * <span style={{ fontSize: 10, fontWeight: 400, textTransform: "none" }}>(max 80 chars)</span></label>
              <input style={inS} placeholder="e.g. Buy 3 Tires Get 1 Free — This Week Only"
                value={form.headline} onChange={e => setForm(p => ({ ...p, headline: e.target.value.slice(0,80) }))} />
              <div style={{ fontSize: 10, color: INK_FADE, fontFamily: SANS, textAlign: "right" }}>{form.headline.length}/80</div>
            </div>
            <div style={{ gridColumn: "1/-1" }}>
              <label style={lbS}>Deal Description * <span style={{ fontSize: 10, fontWeight: 400, textTransform: "none" }}>(max 300 chars)</span></label>
              <textarea style={{ ...inS, minHeight: 80, resize: "vertical", lineHeight: 1.6 }}
                placeholder="Describe your deal — what it is, how to redeem it, any conditions…"
                value={form.body} onChange={e => setForm(p => ({ ...p, body: e.target.value.slice(0,300) }))} />
              <div style={{ fontSize: 10, color: INK_FADE, fontFamily: SANS, textAlign: "right" }}>{form.body.length}/300</div>
            </div>
            <div>
              <label style={lbS}>Village / Area</label>
              <input style={inS} placeholder="e.g. Brownwood" value={form.village} onChange={e => setForm(p => ({ ...p, village: e.target.value }))} />
            </div>
            <div>
              <label style={lbS}>Business Address</label>
              <input style={inS} placeholder="123 Main St" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} />
            </div>
          </div>

          {/* ── Image Section ── */}
          <div style={{ marginTop: 14, background: PAPER, border: `1.5px solid ${PAPER_DK}`, borderRadius: 8, padding: "12px 14px" }}>
            <label style={{ ...lbS, marginBottom: 8 }}>Ad Image <span style={{ fontSize: 10, fontWeight: 400, textTransform: "none" }}>(upload or AI-generate)</span></label>

            {/* Current image preview */}
            {displayImage && (
              <div style={{ marginBottom: 10, position: "relative", display: "inline-block" }}>
                <img src={displayImage} alt="Ad" style={{ width: "100%", maxWidth: 280, height: 140, objectFit: "cover", borderRadius: 6, border: `2px solid ${TEAL}`, display: "block" }} />
                <button onClick={() => { setForm(p => ({ ...p, image_url: "" })); setFilePreview(null); setFileObj(null); }}
                  style={{ position: "absolute", top: 4, right: 4, background: "rgba(0,0,0,0.6)", color: "#fff", border: "none", borderRadius: "50%", width: 22, height: 22, fontSize: 13, cursor: "pointer", lineHeight: "22px", textAlign: "center", padding: 0 }}>✕</button>
              </div>
            )}

            {/* Upload button */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 10 }}>
              <button onClick={() => fileRef.current?.click()} disabled={uploading}
                style={{ background: PAPER_MID, border: `1.5px solid ${PAPER_DK}`, color: INK, borderRadius: 5, padding: "7px 14px", fontSize: 12, cursor: uploading ? "not-allowed" : "pointer", fontFamily: SANS, fontWeight: 700 }}>
                {uploading ? "Uploading…" : "📁 Upload Image"}
              </button>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileChange} />
              {pickerImages.length > 0 && (
                <button onClick={() => setShowImagePicker(p => !p)}
                  style={{ background: PAPER_MID, border: `1.5px solid ${PAPER_DK}`, color: INK, borderRadius: 5, padding: "7px 14px", fontSize: 12, cursor: "pointer", fontFamily: SANS, fontWeight: 700 }}>
                  🖼 Saved Images ({pickerImages.length})
                </button>
              )}
            </div>

            {/* Saved image picker */}
            {showImagePicker && pickerImages.length > 0 && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                {pickerImages.map((url, i) => (
                  <div key={i} onClick={() => { setForm(p => ({ ...p, image_url: url })); setFilePreview(null); setFileObj(null); setShowImagePicker(false); }}
                    style={{ cursor: "pointer", border: form.image_url === url ? `3px solid ${TEAL}` : `2px solid ${PAPER_DK}`, borderRadius: 5, overflow: "hidden" }}>
                    <img src={url} alt="" style={{ width: 72, height: 72, objectFit: "cover", display: "block" }} />
                  </div>
                ))}
              </div>
            )}

            {/* AI generator */}
            <div style={{ borderTop: `1px solid ${PAPER_DK}`, paddingTop: 10, marginTop: 4 }}>
              <label style={{ ...lbS, marginBottom: 6 }}>✨ AI Image Generator</label>
              <div style={{ display: "flex", gap: 8 }}>
                <input style={{ ...inS, flex: 1 }} placeholder="e.g. Pool cleaning service, sunny Florida backyard"
                  value={aiPrompt} onChange={e => setAiPrompt(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleGenerateAI()} />
                <button onClick={handleGenerateAI} disabled={aiGenerating || !aiPrompt.trim()}
                  style={{ background: `linear-gradient(180deg,#9A6030,${BROWN_BTN})`, color: PAPER, border: `1.5px solid ${NAVY}`, borderRadius: 5, padding: "8px 14px", fontSize: 12, fontWeight: 700, cursor: aiGenerating || !aiPrompt.trim() ? "not-allowed" : "pointer", fontFamily: SANS, whiteSpace: "nowrap", opacity: aiGenerating ? 0.7 : 1 }}>
                  {aiGenerating ? "Generating…" : "✨ Generate"}
                </button>
              </div>
              {aiGenerating && <div style={{ marginTop: 6, fontSize: 11, color: INK_FADE, fontFamily: SANS }}>Creating your image — takes ~10 seconds…</div>}
              {aiError && <div style={{ marginTop: 6, fontSize: 11, color: "#c00", fontFamily: SANS }}>{aiError}</div>}
            </div>
          </div>

          {/* Save + Preview buttons */}
          {saveErr && <div style={{ marginTop: 10, fontSize: 12, color: "#c00", fontFamily: SANS }}>{saveErr}</div>}
          {saveMsg !== "saved" && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginTop: 14 }}>
              <button data-testid="save-ad-btn" onClick={handleSave} disabled={saving}
                style={{ background: `linear-gradient(180deg,#9A6030,${BROWN_BTN})`, color: PAPER, border: `2px solid ${NAVY}`, borderRadius: 5, padding: "11px 24px", fontSize: 13, fontWeight: 900, cursor: saving ? "not-allowed" : "pointer", fontFamily: SERIF, opacity: saving ? 0.7 : 1 }}>
                {saving ? "Saving…" : "💾 Save Ad"}
              </button>
              <button onClick={openPreviewFromEditor}
                style={{ background: PAPER, border: `2px solid ${TEAL}`, color: TEAL, borderRadius: 5, padding: "11px 18px", fontSize: 13, fontWeight: 900, cursor: "pointer", fontFamily: SERIF }}>
                👁 Preview Ad
              </button>
              <button onClick={closeEdit} style={{ background: "none", border: `1.5px solid ${PAPER_DK}`, color: INK_FADE, borderRadius: 5, padding: "10px 16px", fontSize: 12, cursor: "pointer", fontFamily: SANS }}>Cancel</button>
            </div>
          )}
          {saveMsg === "saved" && savedAdRecord && (
            <div style={{ marginTop: 12, background: "#F0FBF4", border: "2px solid #2E7D32", borderRadius: 8, padding: "14px 16px" }}>
              <div style={{ fontSize: 13, fontWeight: 900, color: "#1B5E20", fontFamily: SERIF, marginBottom: 6 }}>✅ Ad saved!</div>
              <div style={{ fontSize: 12, color: INK_FADE, fontFamily: SANS, lineHeight: 1.8, marginBottom: 12 }}>
                Your ad <strong style={{ color: INK }}>"{savedAdRecord.headline}"</strong> is ready.<br/>
                Preview it first, then pay <strong style={{ color: INK }}>$10</strong> to post it live for <strong style={{ color: INK }}>7 days</strong>.<br/>
                <span style={{ fontSize: 11 }}>You won't be charged again unless you manually launch another ad.</span>
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                <button data-testid="pay-now-btn" disabled={checkoutLoading} onClick={() => { closeEdit(); handleCheckout(savedAdRecord); }}
                  style={{ background: "linear-gradient(180deg,#1A6B3C,#145530)", color: "#fff", border: "2px solid #1A6B3C", borderRadius: 6, padding: "11px 24px", fontSize: 13, fontWeight: 900, cursor: checkoutLoading ? "not-allowed" : "pointer", fontFamily: SERIF, opacity: checkoutLoading ? 0.7 : 1 }}>
                  {checkoutLoading ? "Redirecting to Stripe…" : "💳 Pay $10 — Post Live for 7 Days →"}
                </button>
                <button onClick={() => { setPreviewAd({ ...savedAdRecord, image_url: filePreview || savedAdRecord.image_url }); setPreviewFromEditor(false); }}
                  style={{ background: "none", border: `1.5px solid ${TEAL}`, color: TEAL, borderRadius: 6, padding: "10px 16px", fontSize: 12, cursor: "pointer", fontFamily: SANS, fontWeight: 700 }}>
                  👁 Preview First
                </button>
                <button onClick={closeEdit}
                  style={{ background: "none", border: `1.5px solid ${PAPER_DK}`, color: INK_FADE, borderRadius: 5, padding: "10px 14px", fontSize: 12, cursor: "pointer", fontFamily: SANS }}>
                  Save for Later
                </button>
              </div>
              {checkoutErr && <div style={{ marginTop: 8, fontSize: 12, color: "#c00", fontFamily: SANS }}>{checkoutErr}</div>}
            </div>
          )}
        </div>
      )}

      {/* ── HOW IT WORKS ── */}
      {editingSlot === null && (
        <div style={{ fontSize: 11, color: INK_FADE, fontFamily: SANS, lineHeight: 1.9, background: PAPER, border: `1px solid ${PAPER_DK}`, borderRadius: 6, padding: "8px 12px" }}>
          <strong style={{ fontFamily: SERIF, color: INK }}>How Deals of the Week works:</strong>{" "}
          Build up to 3 ads · Upload your own image or use AI to generate one · Preview exactly how it will look · Mark one "Next Up" · Pay <strong>$10</strong> → runs live for <strong>7 days</strong> · You're never auto-charged again
        </div>
      )}

      {/* ── AD PREVIEW MODAL ── */}
      {previewAd && (
        <div onClick={() => setPreviewAd(null)} style={{
          position: "fixed", inset: 0, zIndex: 9999,
          background: "rgba(0,0,0,0.75)",
          display: "flex", alignItems: "flex-start", justifyContent: "center",
          overflowY: "auto", padding: "24px 16px 48px",
        }}>
          <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 380 }}>
            {/* Modal header */}
            <div style={{ background: INK, color: PAPER, borderRadius: "8px 8px 0 0", padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, fontWeight: 700, fontFamily: SANS, letterSpacing: 0.5 }}>👁 Preview — How Visitors Will See Your Ad</span>
              <button onClick={() => setPreviewAd(null)} style={{ background: "none", border: "none", color: PAPER, fontSize: 20, cursor: "pointer", lineHeight: 1 }}>✕</button>
            </div>
            {/* Ad card — exact same style as Classifieds page */}
            {(() => {
              const ad = previewAd;
              const fmtD = d => new Date(d).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});
              const days = ad.deal_expires_at ? Math.ceil((new Date(ad.deal_expires_at) - new Date().setHours(0,0,0,0)) / 86400000) : null;
              let badge = null;
              if (days !== null) {
                if (days < 0)    badge = <span style={{ display:"inline-block", marginTop:4, padding:"2px 8px", background:"#7B0000", color:"#fff", fontSize:9, fontWeight:700, borderRadius:2, letterSpacing:0.5, textTransform:"uppercase" }}>Expired</span>;
                else if (days===0) badge = <span style={{ display:"inline-block", marginTop:4, padding:"2px 8px", background:"#C62828", color:"#fff", fontSize:9, fontWeight:700, borderRadius:2, letterSpacing:0.5, textTransform:"uppercase" }}>Ends Today!</span>;
                else if (days<=3) badge = <span style={{ display:"inline-block", marginTop:4, padding:"2px 8px", background:"#E65100", color:"#fff", fontSize:9, fontWeight:700, borderRadius:2, letterSpacing:0.5, textTransform:"uppercase" }}>Ends in {days} day{days!==1?"s":""}!</span>;
                else              badge = <span style={{ display:"inline-block", marginTop:4, padding:"2px 8px", background:"#1A6B3C", color:"#fff", fontSize:9, fontWeight:700, borderRadius:2, letterSpacing:0.5, textTransform:"uppercase" }}>Thru {fmtD(ad.deal_expires_at)}</span>;
              }
              return (
                <div style={{ background:"#F0E6C8", border:"2px solid #1C0F00", display:"flex", flexDirection:"column", overflow:"hidden", boxShadow:"3px 3px 12px rgba(0,0,0,0.4)" }}>
                  <div style={{ background:"#1C0F00", padding:"10px 14px 9px", textAlign:"center" }}>
                    <div style={{ fontSize:9, color:"#C8B07A", fontFamily:SANS, letterSpacing:2, textTransform:"uppercase", marginBottom:4 }}>✦ Deal of the Week ✦</div>
                    <div style={{ fontSize:17, fontWeight:900, color:YELLOW, textTransform:"uppercase", letterSpacing:0.5, lineHeight:1.25, fontFamily:SERIF }}>{ad.headline || "Your Headline Here"}</div>
                    {badge}
                  </div>
                  {ad.image_url && (
                    <img src={ad.image_url} alt={ad.headline} style={{ width:"100%", height:160, objectFit:"cover", display:"block", borderBottom:"1px solid #C8B07A" }} />
                  )}
                  {!ad.image_url && (
                    <div style={{ width:"100%", height:100, background:PAPER_MID, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, color:INK_FADE, fontFamily:SANS, fontStyle:"italic" }}>No image selected</div>
                  )}
                  <div style={{ padding:"14px 16px 8px", fontSize:14, color:"#1C0F00", lineHeight:1.8, fontFamily:SERIF }}>{ad.body || "Your deal description will appear here."}</div>
                  {ad.address && <div style={{ padding:"4px 16px 10px", fontSize:12, color:"#00836B", fontWeight:700, fontFamily:SANS }}>📍 {ad.address}</div>}
                  <div style={{ borderTop:"1px solid #C8B07A", background:"#E4D5A8", padding:"9px 14px", display:"flex", justifyContent:"space-between", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                    <div style={{ fontSize:13, fontWeight:900, color:NAVY, fontFamily:SANS }}>{ad.provider_name || provider.business_name}</div>
                    {ad.village && <div style={{ fontSize:11, color:"#5C3A10", fontFamily:SERIF, fontStyle:"italic", background:"#C8B07A", borderRadius:2, padding:"2px 8px" }}>📌 {ad.village}</div>}
                  </div>
                </div>
              );
            })()}
            {/* Actions under preview */}
            <div style={{ background: "#1C0F00", borderRadius: "0 0 8px 8px", padding: "12px 14px", display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
              {previewFromEditor ? (
                <button onClick={() => setPreviewAd(null)} style={{ background: "none", border: `1.5px solid ${PAPER_DK}`, color: PAPER, borderRadius: 6, padding: "8px 20px", fontSize: 12, cursor: "pointer", fontFamily: SANS }}>← Back to Editor</button>
              ) : (
                <>
                  {/* If this is the nextUp ad, show Pay button right from preview */}
                  {nextUp?.id === previewAd.id && (
                    <button disabled={checkoutLoading} onClick={() => { setPreviewAd(null); handleCheckout(previewAd); }}
                      style={{ background: "linear-gradient(180deg,#1A6B3C,#145530)", color: "#fff", border: "2px solid #1A6B3C", borderRadius: 6, padding: "10px 22px", fontSize: 13, fontWeight: 900, cursor: "pointer", fontFamily: SERIF }}>
                      {checkoutLoading ? "Redirecting…" : "💳 Looks good — Pay $10 & Go Live →"}
                    </button>
                  )}
                  <button onClick={() => setPreviewAd(null)} style={{ background: "none", border: `1.5px solid ${PAPER_DK}`, color: PAPER, borderRadius: 6, padding: "8px 18px", fontSize: 12, cursor: "pointer", fontFamily: SANS }}>✕ Close</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
// ── Reviews Section — provider reads & responds, cannot self-review ──────────
function ReviewsSection({ provider }) {
  const [allReviews, setAllReviews] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [replyText, setReplyText]   = useState({});   // { [reviewId]: string }
  const [replySaving, setReplySaving] = useState({}); // { [reviewId]: bool }
  const [replySaved, setReplySaved]  = useState({}); // { [reviewId]: bool }

  const SERIF = "'Times New Roman', Georgia, serif";
  const SANS  = "'Helvetica Neue', Arial, sans-serif";
  const PAPER      = "#F5EDD6";
  const PAPER_MID  = "#EDE0BE";
  const PAPER_DK   = "#C8B89A";
  const INK        = "#1C0F00";
  const INK_FADE   = "#6B5744";
  const TEAL       = "#00897B";
  const BROWN_BTN  = "#7A4820";
  const YELLOW     = "#FFDB00";
  const GREEN      = "#2E7D32";

  const load = async () => {
    setLoading(true);
    try {
      const revs = await ProviderReview.filter({ provider_id: provider.id });
      // Sort: unapproved first (needs attention), then by date desc
      const sorted = (revs || []).sort((a, b) => {
        if (!a.is_approved && b.is_approved) return -1;
        if (a.is_approved && !b.is_approved) return 1;
        return new Date(b.created_date) - new Date(a.created_date);
      });
      setAllReviews(sorted);
    } catch { setAllReviews([]); }
    setLoading(false);
  };

  useEffect(() => { if (provider?.id) load(); }, [provider?.id]);

  const handleReply = async (reviewId) => {
    const text = (replyText[reviewId] || "").trim();
    if (!text) return;
    setReplySaving(p => ({ ...p, [reviewId]: true }));
    try {
      await ProviderReview.update(reviewId, {
        provider_reply: text,
        provider_reply_date: new Date().toISOString(),
      });
      setReplySaved(p => ({ ...p, [reviewId]: true }));
      setReplyText(p => ({ ...p, [reviewId]: "" }));
      load();
    } catch {}
    setReplySaving(p => ({ ...p, [reviewId]: false }));
  };

  const approved   = allReviews.filter(r => r.is_approved);
  const pending    = allReviews.filter(r => !r.is_approved);
  const avgRating  = approved.length > 0
    ? (approved.reduce((s, r) => s + (r.rating || 0), 0) / approved.length).toFixed(1)
    : null;

  const shS = { fontSize: 13, fontWeight: 900, color: INK, letterSpacing: 2, textTransform: "uppercase", fontFamily: SERIF, padding: "10px 0 6px", borderBottom: `2px solid ${INK}`, marginBottom: 14 };
  const inS = { width: "100%", boxSizing: "border-box", background: PAPER, border: `1.5px solid ${PAPER_DK}`, borderRadius: 4, color: INK, fontFamily: SERIF, fontSize: 13, padding: "8px 10px", outline: "none", resize: "vertical" };

  const ReviewCard = ({ r }) => {
    const [showReply, setShowReply] = useState(false);
    const hasReply = r.provider_reply && r.provider_reply.trim();
    return (
      <div style={{ background: r.is_approved ? PAPER_MID : "#FFF8E1", border: `1.5px solid ${r.is_approved ? PAPER_DK : "#FFD54F"}`, borderRadius: 8, padding: "14px 16px", marginBottom: 12 }}>
        {/* Status badge */}
        {!r.is_approved && (
          <div style={{ fontSize: 10, fontWeight: 900, color: "#E65100", letterSpacing: 1, textTransform: "uppercase", fontFamily: SANS, marginBottom: 8, background: "#FFF3E0", border: "1px solid #FFCC80", borderRadius: 3, display: "inline-block", padding: "2px 8px" }}>
            ⏳ Pending Admin Approval
          </div>
        )}
        {/* Reviewer info + stars */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
          <div>
            <span style={{ fontSize: 14, fontWeight: 900, color: INK, fontFamily: SERIF }}>{r.customer_name}</span>
            {r.customer_village && <span style={{ fontSize: 12, color: INK_FADE, fontStyle: "italic", marginLeft: 8, fontFamily: SERIF }}>📍 {r.customer_village}</span>}
          </div>
          <div style={{ display: "flex", gap: 1 }}>
            {[1,2,3,4,5].map(i => <span key={i} style={{ fontSize: 14, color: i <= (r.rating||0) ? "#B8860B" : PAPER_DK }}>★</span>)}
          </div>
        </div>
        {r.service_used && <div style={{ fontSize: 11, color: TEAL, fontWeight: 700, marginBottom: 5, textTransform: "uppercase", letterSpacing: 1, fontFamily: SANS }}>Service: {r.service_used}</div>}
        <div style={{ fontSize: 13, color: INK, fontStyle: "italic", lineHeight: 1.7, fontFamily: SERIF, marginBottom: 6 }}>&ldquo;{r.review_text}&rdquo;</div>
        <div style={{ fontSize: 10, color: INK_FADE, fontFamily: SANS, marginBottom: hasReply ? 8 : 0 }}>
          {new Date(r.created_date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
        </div>

        {/* Existing reply */}
        {hasReply && (
          <div style={{ background: "#E8F5E9", border: `1px solid #A5D6A7`, borderRadius: 5, padding: "10px 12px", marginTop: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 900, color: GREEN, textTransform: "uppercase", letterSpacing: 1, fontFamily: SANS, marginBottom: 4 }}>Your Response</div>
            <div style={{ fontSize: 12, color: INK, lineHeight: 1.6, fontFamily: SERIF }}>{r.provider_reply}</div>
            {r.provider_reply_date && (
              <div style={{ fontSize: 10, color: INK_FADE, marginTop: 4, fontFamily: SANS }}>
                {new Date(r.provider_reply_date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              </div>
            )}
            <button onClick={() => { setShowReply(!showReply); setReplyText(p => ({ ...p, [r.id]: r.provider_reply })); }} style={{ fontSize: 11, color: TEAL, background: "none", border: "none", cursor: "pointer", fontFamily: SANS, padding: "4px 0 0", textDecoration: "underline" }}>
              {showReply ? "Cancel Edit" : "Edit Response"}
            </button>
          </div>
        )}

        {/* Reply form */}
        {!hasReply && !showReply && (
          <button onClick={() => setShowReply(true)} style={{ fontSize: 11, color: TEAL, background: "none", border: `1px solid ${TEAL}`, borderRadius: 4, cursor: "pointer", fontFamily: SANS, padding: "5px 12px", marginTop: 6 }}>
            💬 Reply to this review
          </button>
        )}
        {showReply && (
          <div style={{ marginTop: 10 }}>
            <textarea
              rows={3}
              style={inS}
              placeholder="Write a professional response to this review…"
              value={replyText[r.id] || ""}
              onChange={e => setReplyText(p => ({ ...p, [r.id]: e.target.value }))}
            />
            <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
              <button
                onClick={() => handleReply(r.id)}
                disabled={replySaving[r.id]}
                style={{ background: `linear-gradient(180deg,#9A6030,${BROWN_BTN})`, color: PAPER, border: `2px solid ${YELLOW}`, borderRadius: 4, padding: "7px 18px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: SANS }}>
                {replySaving[r.id] ? "Saving…" : replySaved[r.id] ? "✓ Saved!" : "Post Response"}
              </button>
              <button onClick={() => setShowReply(false)} style={{ background: "none", border: `1.5px solid ${PAPER_DK}`, borderRadius: 4, padding: "7px 14px", fontSize: 12, color: INK_FADE, cursor: "pointer", fontFamily: SANS }}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ marginTop: 8 }}>
      {/* Section header */}
      <div style={{ ...shS, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span>⭐ V-Hub Reviews</span>
        {avgRating && (
          <span style={{ fontSize: 12, fontWeight: 700, color: "#B8860B", fontFamily: SANS }}>
            {avgRating} ★ · {approved.length} review{approved.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {loading && <div style={{ fontSize: 13, color: INK_FADE, fontStyle: "italic", fontFamily: SANS, padding: "12px 0" }}>Loading reviews…</div>}

      {!loading && allReviews.length === 0 && (
        <div style={{ fontSize: 13, color: INK_FADE, fontStyle: "italic", padding: "12px 0 20px", fontFamily: SANS, lineHeight: 1.7 }}>
          No reviews yet. Reviews left by customers on your public profile will appear here — you'll be able to read and respond to each one.
        </div>
      )}

      {/* Pending reviews — needs attention */}
      {!loading && pending.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 900, color: "#E65100", letterSpacing: 1, textTransform: "uppercase", fontFamily: SANS, marginBottom: 8 }}>
            ⏳ Awaiting Approval ({pending.length})
          </div>
          {pending.map(r => <ReviewCard key={r.id} r={r} />)}
        </div>
      )}

      {/* Approved reviews */}
      {!loading && approved.length > 0 && (
        <div>
          {pending.length > 0 && (
            <div style={{ fontSize: 11, fontWeight: 900, color: GREEN, letterSpacing: 1, textTransform: "uppercase", fontFamily: SANS, marginBottom: 8 }}>
              ✓ Live Reviews ({approved.length})
            </div>
          )}
          {approved.map(r => <ReviewCard key={r.id} r={r} />)}
        </div>
      )}
    </div>
  );
}

// ── Analytics Dashboard Component ────────────────────────────────────────────
function AnalyticsDashboard({ provider, reviews }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState(30); // days

  useEffect(() => {
    if (!provider?.id) return;
    loadAnalytics();
  }, [provider?.id, range]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // Pull all analytic events for this provider
      const events = await ProviderAnalytic.filter({ provider_id: provider.id });

      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - range);
      const cutoffKey = cutoff.toISOString().slice(0, 10);

      const inRange = (events || []).filter(e => (e.date_key || "") >= cutoffKey);
      const allTime = events || [];

      // Tally by type
      const searches   = inRange.filter(e => e.event_type === "search_appearance");
      const views      = inRange.filter(e => e.event_type === "profile_view");
      const adClicks   = inRange.filter(e => e.event_type === "classified_click");
      const leads      = inRange.filter(e => e.event_type === "lead_inquiry");

      // Searches by service
      const byService = {};
      searches.forEach(e => {
        const k = e.service_name || "General Search";
        byService[k] = (byService[k] || 0) + 1;
      });

      // Searches + views by area/village
      const byArea = {};
      [...searches, ...views].forEach(e => {
        const k = e.area_name || "Unknown";
        if (k && k !== "Unknown") byArea[k] = (byArea[k] || 0) + 1;
      });

      // Daily trend — last 14 days
      const trend = {};
      const today = new Date();
      for (let i = 13; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        trend[d.toISOString().slice(0, 10)] = 0;
      }
      inRange.forEach(e => {
        if (e.date_key && trend[e.date_key] !== undefined) trend[e.date_key]++;
      });

      setAnalytics({
        searches: searches.length,
        views: views.length,
        adClicks: adClicks.length,
        leads: leads.length,
        allTimeSearches: allTime.filter(e => e.event_type === "search_appearance").length,
        allTimeViews: allTime.filter(e => e.event_type === "profile_view").length,
        byService: Object.entries(byService).sort((a, b) => b[1] - a[1]).slice(0, 8),
        byArea: Object.entries(byArea).sort((a, b) => b[1] - a[1]).slice(0, 8),
        trend: Object.entries(trend),
      });
    } catch (e) {
      console.error("Analytics load error:", e);
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  };

  const maxTrend = analytics ? Math.max(1, ...analytics.trend.map(([, v]) => v)) : 1;

  return (
    <div style={{ marginBottom: 24 }}>
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
        <div style={{ ...shS, marginBottom: 0, borderBottom: "none", paddingBottom: 0 }}>📊 Your Activity Report</div>
        <div style={{ display: "flex", gap: 4 }}>
          {[7, 30, 90].map(d => (
            <button key={d} onClick={() => setRange(d)}
              style={{ background: range === d ? TEAL : PAPER_MID, color: range === d ? "#fff" : INK, border: `1.5px solid ${range === d ? TEAL : PAPER_DK}`, borderRadius: 20, padding: "4px 12px", fontSize: 11, cursor: "pointer", fontFamily: SANS, fontWeight: range === d ? 700 : 400 }}>
              {d}d
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ padding: "20px 0", textAlign: "center", fontSize: 13, color: INK_FADE, fontFamily: SANS }}>Loading your stats…</div>
      ) : !analytics ? (
        <div style={{ padding: "16px 0", textAlign: "center", fontSize: 13, color: INK_FADE, fontFamily: SANS, fontStyle: "italic" }}>Stats not available.</div>
      ) : (
        <>
          {/* ── Top 4 stat cards ── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8, marginBottom: 14 }}>
            {[
              { icon: "🔍", label: "Times You Appeared in Search", value: analytics.searches, sub: `${range}-day window`, color: TEAL },
              { icon: "👁", label: "People Clicked Your Profile", value: analytics.views, sub: `${range}-day window`, color: BROWN_BTN },
              { icon: "📰", label: "Classified Ad Clicks", value: analytics.adClicks, sub: provider.classifieds_addon ? `${range}-day window` : "Add-on not active", color: "#7B3FA0" },
              { icon: "⭐", label: "Reviews", value: reviews.length, sub: "All time", color: "#B8860B" },
            ].map(({ icon, label, value, sub, color }) => (
              <div key={label} style={{ background: PAPER_MID, border: `1.5px solid ${PAPER_DK}`, borderRadius: 8, padding: "14px 12px", textAlign: "center" }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>{icon}</div>
                <div style={{ fontSize: 26, fontWeight: 900, color, fontFamily: SANS, lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: 11, color: INK, fontFamily: SANS, marginTop: 4, fontWeight: 700, lineHeight: 1.4 }}>{label}</div>
                <div style={{ fontSize: 10, color: INK_FADE, fontFamily: SANS, marginTop: 2 }}>{sub}</div>
              </div>
            ))}
          </div>

          {/* ── All-time totals ── */}
          <div style={{ background: PAPER, border: `1px solid ${PAPER_DK}`, borderRadius: 8, padding: "10px 14px", marginBottom: 14, display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center" }}>
            <div style={{ fontSize: 12, color: INK_FADE, fontFamily: SANS, textAlign: "center" }}>
              <span style={{ fontWeight: 900, color: INK, fontSize: 16 }}>{analytics.allTimeSearches.toLocaleString()}</span>
              <br />All-time search appearances
            </div>
            <div style={{ fontSize: 12, color: INK_FADE, fontFamily: SANS, textAlign: "center" }}>
              <span style={{ fontWeight: 900, color: INK, fontSize: 16 }}>{analytics.allTimeViews.toLocaleString()}</span>
              <br />All-time profile views
            </div>
            <div style={{ fontSize: 12, color: INK_FADE, fontFamily: SANS, textAlign: "center" }}>
              <span style={{ fontWeight: 900, color: INK, fontSize: 16 }}>{analytics.leads}</span>
              <br />Leads in {range} days
            </div>
          </div>

          {/* ── 14-day trend bar chart ── */}
          {analytics.trend.some(([, v]) => v > 0) && (
            <div style={{ background: PAPER_MID, border: `1.5px solid ${PAPER_DK}`, borderRadius: 8, padding: "14px 14px 10px", marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: INK_FADE, textTransform: "uppercase", letterSpacing: 1, fontFamily: SANS, marginBottom: 10 }}>14-Day Activity Trend</div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 52 }}>
                {analytics.trend.map(([date, count]) => {
                  const h = Math.max(4, Math.round((count / maxTrend) * 48));
                  const isToday = date === new Date().toISOString().slice(0, 10);
                  return (
                    <div key={date} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, height: "100%", justifyContent: "flex-end" }} title={`${date}: ${count} events`}>
                      <div style={{ width: "100%", height: h, background: isToday ? TEAL : BROWN_BTN, borderRadius: "2px 2px 0 0", opacity: count === 0 ? 0.2 : 1, transition: "height 0.3s" }} />
                    </div>
                  );
                })}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 9, color: INK_FADE, fontFamily: SANS }}>
                <span>{analytics.trend[0]?.[0]?.slice(5)}</span>
                <span style={{ color: TEAL, fontWeight: 700 }}>Today</span>
              </div>
            </div>
          )}

          {/* ── What are people searching? ── */}
          {analytics.byService.length > 0 && (
            <div style={{ background: PAPER_MID, border: `1.5px solid ${PAPER_DK}`, borderRadius: 8, padding: "14px", marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: INK_FADE, textTransform: "uppercase", letterSpacing: 1, fontFamily: SANS, marginBottom: 10 }}>
                🔍 What Customers Searched For
              </div>
              {analytics.byService.map(([svc, cnt]) => {
                const pct = Math.round((cnt / (analytics.searches || 1)) * 100);
                return (
                  <div key={svc} style={{ marginBottom: 7 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontFamily: SANS, marginBottom: 2 }}>
                      <span style={{ color: INK, fontWeight: svc !== "General Search" ? 700 : 400 }}>{svc}</span>
                      <span style={{ color: INK_FADE }}>{cnt}x</span>
                    </div>
                    <div style={{ background: PAPER_DK, borderRadius: 3, height: 6 }}>
                      <div style={{ background: TEAL, borderRadius: 3, height: 6, width: `${pct}%`, transition: "width 0.4s" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Where are customers coming from? ── */}
          {analytics.byArea.length > 0 && (
            <div style={{ background: PAPER_MID, border: `1.5px solid ${PAPER_DK}`, borderRadius: 8, padding: "14px", marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: INK_FADE, textTransform: "uppercase", letterSpacing: 1, fontFamily: SANS, marginBottom: 10 }}>
                📍 Where Customers Are Coming From
              </div>
              {analytics.byArea.map(([area, cnt]) => {
                const maxArea = analytics.byArea[0]?.[1] || 1;
                const pct = Math.round((cnt / maxArea) * 100);
                return (
                  <div key={area} style={{ marginBottom: 7 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontFamily: SANS, marginBottom: 2 }}>
                      <span style={{ color: INK, fontWeight: 700 }}>📍 {area}</span>
                      <span style={{ color: INK_FADE }}>{cnt} searches</span>
                    </div>
                    <div style={{ background: PAPER_DK, borderRadius: 3, height: 6 }}>
                      <div style={{ background: BROWN_BTN, borderRadius: 3, height: 6, width: `${pct}%`, transition: "width 0.4s" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty state — no data yet */}
          {analytics.searches === 0 && analytics.views === 0 && analytics.adClicks === 0 && (
            <div style={{ background: PAPER, border: `1px dashed ${PAPER_DK}`, borderRadius: 8, padding: "16px", textAlign: "center", marginBottom: 8 }}>
              <div style={{ fontSize: 13, color: INK_FADE, fontFamily: SANS, fontStyle: "italic", lineHeight: 1.8 }}>
                No activity recorded in the last {range} days yet.<br />
                As customers search V-Hub, your real stats will appear here.
              </div>
            </div>
          )}

          <div style={{ fontSize: 10, color: INK_FADE, fontFamily: SANS, fontStyle: "italic", textAlign: "right", marginTop: 4 }}>
            All data is from real customer interactions — never estimated.
          </div>
        </>
      )}
    </div>
  );
}


export default function ProviderDashboard() {
  useMeta("Provider Hub | V-Hub — The Villages, FL");


  // Helper: fetch provider by ID via backend (works for unauthenticated visitors)
  const fetchProviderById = async (id) => {
    const res = await fetch("https://api.base44.app/api/apps/69d062aca815ce8e697894b1/functions/providerLogin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ restore_id: id }),
    });
    const data = await res.json();
    return (data.success && data.provider) ? data.provider : null;
  };

  const [provider, setProvider]     = useState(null);
  const [authState, setAuthState]   = useState("loading"); // loading | login | forgot | reset | dashboard
  const [resetToken, setResetToken] = useState("");
  const [resetProviderId, setResetProviderId] = useState("");
  const [view, setView]             = useState("dashboard"); // dashboard | edit | account
  const [reviews, setReviews]       = useState([]);
  const [classifiedAd, setClassifiedAd] = useState(null);
  const [adSlots, setAdSlots] = useState([null, null, null]); // 3 saved ad slots
  const [activeSlot, setActiveSlot] = useState(0); // which slot is currently being edited
  const [classifiedForm, setClassifiedForm] = useState({ headline: "", body: "", image_url: "", village: "", address: "", deal_expires_at: "" });
  const [classifiedSaving, setClassifiedSaving] = useState(false);
  const [classifiedSaved, setClassifiedSaved] = useState(false);
  const [classifiedImageFile, setClassifiedImageFile] = useState(null);
  const [classifiedImagePreview, setClassifiedImagePreview] = useState(null);
  const classifiedImageRef = useRef(null);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiGenerated, setAiGenerated] = useState(null);
  const [aiError, setAiError] = useState("");
  const [classifiedError, setClassifiedError] = useState("");
  const [nextAdForm, setNextAdForm] = useState({ headline: "", body: "", address: "", village: "", deal_expires_at: "" });
  const [nextAdSaving, setNextAdSaving] = useState(false);
  const [nextAdSaved, setNextAdSaved] = useState(false);
  const [svcMap, setSvcMap]         = useState({});
  const [areaMap, setAreaMap]       = useState({});
  const [dbCategories, setDbCategories] = useState([]);
  const [dbServices, setDbServices]     = useState([]);
  const [dbAreas, setDbAreas]           = useState([]);
  const [mapsReady, setMapsReady]       = useState(false);

  // Edit form state
  const [form, setForm]             = useState({});
  const [selSvcs, setSelSvcs]       = useState([]);
  const [selAreas, setSelAreas]     = useState([]);
  const [saving, setSaving]         = useState(false);
  const [saveMsg, setSaveMsg]       = useState("");

  // Account settings state
  const [newPass, setNewPass]       = useState("");
  const [newPass2, setNewPass2]     = useState("");
  const [newLoginEmail, setNewLoginEmail] = useState("");
  const [accMsg, setAccMsg]         = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [billingLoading, setBillingLoading] = useState(false);
  const [cancelLoading, setCancelLoading]   = useState(false);
  const [paymentError, setPaymentError]     = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [cancelSuccess, setCancelSuccess]   = useState(false);
  const [cancelError, setCancelError]       = useState("");
  const [cancelAccessUntil, setCancelAccessUntil] = useState("");
  const [showNewPass, setShowNewPass] = useState(false);

  // Review form
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewSaved, setReviewSaved]       = useState(false);
  const [reviewForm, setReviewForm]         = useState({ customer_name: "", customer_village: "", rating: 5, review_text: "", service_used: "" });

  // ── Check for existing session on mount ───────────────────────────────
  useEffect(() => {
    // URL auto-login: ?auto=PROVIDERID or #auto=PROVIDERID (dev/testing only)
    const autoParams = new URLSearchParams(window.location.search);
    let autoId = autoParams.get("auto");
    // Also check hash fragment: #auto=PROVIDERID
    if (!autoId && window.location.hash.startsWith("#auto=")) {
      autoId = window.location.hash.slice(6);
    }
    if (autoId) {
      window.history.replaceState({}, "", window.location.pathname);
      sessionStorage.setItem("vhub_provider_id", autoId);
    }
    const savedId = sessionStorage.getItem("vhub_provider_id");
    if (savedId) {
      // Restore session via backend function (works for unauthenticated visitors)
      fetch("https://api.base44.app/api/apps/69d062aca815ce8e697894b1/functions/providerLogin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restore_id: savedId }),
      })
        .then(r => r.json())
        .then(data => {
          if (data.success && data.provider) {
            const p = data.provider;
            setProvider(p);
            seedForm(p);
            setNewLoginEmail(p.login_email || p.email || "");
            loadReviews(p.id);
            loadClassified(p.id);
            setAuthState("dashboard");
          } else {
            sessionStorage.removeItem("vhub_provider_id");
            setAuthState("login");
          }
        })
        .catch(() => { sessionStorage.removeItem("vhub_provider_id"); setAuthState("login"); });
    } else {
      setAuthState("login");
    }

    // Check for Stripe return params or password reset token
    const urlParams = new URLSearchParams(window.location.search);
    const resetTok = urlParams.get("reset_token");
    const resetPid = urlParams.get("provider_id");
    if (resetTok && resetPid) {
      setResetToken(resetTok);
      setResetProviderId(resetPid);
      window.history.replaceState({}, "", window.location.pathname);
      setAuthState("reset");
      return;
    }
    const paymentResult = urlParams.get("payment");
    if (paymentResult === "success") {
      setPaymentSuccess(true);
      window.history.replaceState({}, "", window.location.pathname);
      // Re-fetch provider so subscription_status reflects Stripe webhook update
      const acctId = urlParams.get("acct") || sessionStorage.getItem("vhub_provider_id");
      if (acctId) {
        fetchProviderById(acctId).then(p => { if (p && p.id) { setProvider(p); seedForm(p); } }).catch(() => {});
      }
    } else if (paymentResult === "portal_return") {
      // Returned from Stripe billing portal — re-fetch provider to get updated status
      window.history.replaceState({}, "", window.location.pathname);
      const acctId = urlParams.get("acct") || sessionStorage.getItem("vhub_provider_id");
      if (acctId) {
        fetchProviderById(acctId).then(p => { if (p && p.id) { setProvider(p); seedForm(p); setCancelSuccess(true); } }).catch(() => {});
      }
    } else if (paymentResult === "cancelled") {
      // User clicked "Back" on Stripe checkout — just clear the URL
      window.history.replaceState({}, "", window.location.pathname);
    }

    // Handle classifieds add-on payment return
    const classifiedsResult = urlParams.get("classifieds_payment");
    if (classifiedsResult === "success") {
      window.history.replaceState({}, "", window.location.pathname);
      const acctId = urlParams.get("acct") || sessionStorage.getItem("vhub_provider_id");
      if (acctId) {
        // Poll for a few seconds to give the Stripe webhook time to activate classifieds_addon
        const poll = async () => {
          for (let i = 0; i < 5; i++) {
            await new Promise(r => setTimeout(r, 1500));
            try {
              const p = await fetchProviderById(acctId);
              if (p && p.id) {
                setProvider(p);
                seedForm(p);
                if (p.classifieds_addon) break;
              }
            } catch (_) {}
          }
        };
        poll();
      }
    }

    // Load entity data via backend (service role — works without Base44 auth)
    fetch("https://api.base44.app/api/apps/69d062aca815ce8e697894b1/functions/getProviders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ get_lookup_data: true }),
    })
      .then(r => r.json())
      .then(data => {
        const cats  = data.categories || [];
        const svcs  = data.services   || [];
        const areas = data.areas      || [];
        setDbCategories(cats);
        setDbServices(svcs);
        setDbAreas(areas);
        const sm = {}; svcs.forEach(s => { sm[s.id] = s.name; });
        setSvcMap(sm);
        const am = {}; areas.forEach(a => {
          am[a.id] = a.name.includes(" — ") ? a.name.split(" — ").pop().trim() : a.name;
        });
        setAreaMap(am);
        setMapsReady(true);
      })
      .catch(err => {
        console.error("Lookup data load failed:", err);
        // Still mark ready so UI doesn't stay stuck on "Loading..."
        setMapsReady(true);
      });
  }, []);

  const loadClassified = async (pid) => {
    try {
      const ads = await ClassifiedAd.filter({ provider_id: pid });
      const sorted = [...(ads || [])].sort((a,b) => (a.slot_number||0) - (b.slot_number||0));
      // Build 3 slots — slot_number 1,2,3
      const slots = [null, null, null];
      sorted.forEach(ad => {
        const idx = (ad.slot_number || 1) - 1;
        if (idx >= 0 && idx < 3) slots[idx] = ad;
      });
      // Legacy: if ads exist without slot_number, put them in slot 0
      if (!slots[0] && sorted.length > 0) slots[0] = sorted[0];
      setAdSlots(slots);
      const active = slots.find(s => s && s.is_active) || null;
      setClassifiedAd(active);
      // Seed form from slot 0 by default
      const first = slots[0];
      if (first) {
        setClassifiedForm({
          headline: first.headline || "", body: first.body || "",
          image_url: first.image_url || "", village: first.village || "",
          address: first.address || "", deal_expires_at: first.deal_expires_at ? first.deal_expires_at.slice(0,10) : "",
        });
      }
    } catch { setClassifiedAd(null); }
  };

  const loadReviews = async (pid) => {
    try {
      const revs = await ProviderReview.filter({ provider_id: pid });
      setReviews((revs || []).filter(r => r.is_approved));
    } catch { setReviews([]); }
  };

  const seedForm = (prov) => {
    setForm({
      business_name: prov.business_name || "",
      owner_name: prov.owner_name || "",
      phone: prov.phone || "",
      email: prov.email || "",
      website: prov.website || "",
      address: prov.address || "",
      description: prov.description || "",
      years_in_business: prov.years_in_business || "",
      license_number: prov.license_number || "",
      google_review_url: prov.google_review_url || "",
      google_rating: prov.google_rating || "",
      hours_of_operation: prov.hours_of_operation || "",
      is_mobile: prov.is_mobile === true,
    });
    setSelSvcs(Array.isArray(prov.services) ? prov.services : []);
    setSelAreas(Array.isArray(prov.service_areas) ? prov.service_areas : []);
  };

  const handleLogin = (prov) => {
    setProvider(prov);
    seedForm(prov);
    setNewLoginEmail(prov.login_email || prov.email || "");
    loadReviews(prov.id);
    loadClassified(prov.id);
    // If admin-added account, force password change on first login
    if (prov.onboarding_type === "admin_added" && !prov.password_changed) {
      setAuthState("force_change_password");
    } else {
      setAuthState("dashboard");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("vhub_provider_id");
    setProvider(null);
    setAuthState("login");
    setView("dashboard");
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg("");

    // If lookup data isn't ready yet, fetch it now before proceeding
    let svcs = dbServices;
    let areas = dbAreas;
    if (!mapsReady || svcs.length === 0 || areas.length === 0) {
      try {
        const lkup = await fetch("https://api.base44.app/api/apps/69d062aca815ce8e697894b1/functions/getProviders", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ get_lookup_data: true }),
        }).then(r => r.json());
        svcs  = lkup.services || [];
        areas = lkup.areas    || [];
        setDbServices(svcs);
        setDbAreas(areas);
        setMapsReady(true);
      } catch (e) {
        console.warn("[V-Hub Save] Could not reload lookup data, proceeding anyway:", e);
      }
    }

    try {
      const ALLOWED = ["business_name","owner_name","phone","email","website","description","address",
        "years_in_business","license_number","google_review_url","is_mobile","hours_of_operation","google_rating"];
      const NUMERIC = ["google_rating"];
      const updates = {};
      for (const k of ALLOWED) {
        if (k in form) {
          if (NUMERIC.includes(k)) {
            const v = form[k];
            if (v !== "" && v !== null && v !== undefined) updates[k] = Number(v);
          } else {
            updates[k] = form[k];
          }
        }
      }
      // Strip any legacy string values — only send valid 24-char DB IDs
      const validId = id => typeof id === 'string' && /^[0-9a-f]{24}$/.test(id);
      const svcsToSave  = selSvcs.filter(validId);
      const areasToSave = selAreas.filter(validId);
      updates.services      = svcsToSave;
      updates.service_areas = areasToSave;
      console.log("[V-Hub Save] services:", svcsToSave, "areas:", areasToSave, "updates:", updates);

      // Save via getProviders provider_update path (service role, no auth needed)
      let json = null;
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const res = await fetch("https://api.base44.app/api/apps/69d062aca815ce8e697894b1/functions/getProviders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              provider_update: true,
              provider_id: provider.id,
              vh_number: provider.vh_number,
              fields: updates,
            }),
          });
          json = await res.json();
          if (json.success || json.error) break; // got a real response
        } catch (netErr) {
          console.warn(`[V-Hub Save] attempt ${attempt} failed:`, netErr);
          if (attempt < 3) await new Promise(r => setTimeout(r, 800 * attempt));
        }
      }

      if (!json || !json.success) throw new Error((json && json.error) || "Save failed — please try again.");
      const saved = json.record;
      // Update local state immediately so changes are visible without a page reload
      setProvider(prev => ({ ...prev, ...saved }));
      setSelSvcs(Array.isArray(saved.services) ? saved.services : svcsToSave);
      setSelAreas(Array.isArray(saved.service_areas) ? saved.service_areas : areasToSave);
      setForm({
        business_name: saved.business_name || "",
        owner_name: saved.owner_name || "",
        phone: saved.phone || "",
        email: saved.email || "",
        website: saved.website || "",
        address: saved.address || "",
        description: saved.description || "",
        years_in_business: saved.years_in_business || "",
        license_number: saved.license_number || "",
        google_review_url: saved.google_review_url || "",
        google_rating: saved.google_rating || "",
        hours_of_operation: saved.hours_of_operation || "",
        is_mobile: saved.is_mobile === true,
      });
      setSaveMsg("✓ Profile updated! Your listing is now live.");
      // Stay on edit page so provider can see the success — they can navigate away themselves
      setTimeout(() => setSaveMsg(""), 5000);
    } catch (err) {
      setSaveMsg("⚠ " + (err.message || "Error saving. Please try again."));
      console.error("[V-Hub Save Error]", err);
    }
    setSaving(false);
  };

  const handleSaveAccount = async () => {
    setAccMsg("");
    if (!newLoginEmail.trim()) { setAccMsg("⚠ Email cannot be empty."); return; }
    if (newPass && newPass.length < 6) { setAccMsg("⚠ Password must be at least 6 characters."); return; }
    if (newPass && newPass !== newPass2) { setAccMsg("⚠ Passwords do not match."); return; }

    const oldEmail = (provider.login_email || provider.email || "").trim().toLowerCase();
    const newEmail = newLoginEmail.trim().toLowerCase();
    const emailChanged = oldEmail && newEmail && oldEmail !== newEmail;

    try {
      // Use providerLogin backend function ONLY for password hashing (needs server-side SHA-256)
      // For email-only changes with no password, use entity SDK directly
      if (newPass) {
        // Password change — needs backend for hashing (save_account action)
        const res = await fetch("https://api.base44.app/api/apps/69d062aca815ce8e697894b1/functions/providerLogin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "save_account",
            provider_id: provider.id,
            vh_number: provider.vh_number,
            new_password: newPass,
            new_login_email: newEmail,
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) { setAccMsg("⚠ " + (data.error || "Error updating.")); return; }
        const fresh = data.provider || provider;
        setProvider(fresh);
        sessionStorage.setItem("vhub_provider_id", fresh.id);
      } else {
        // Email-only update — entity SDK directly
        const saved = await Provider.update(provider.id, { login_email: newEmail });
        setProvider(prev => ({ ...prev, ...saved }));
        sessionStorage.setItem("vhub_provider_id", provider.id);
      }

      setNewPass(""); setNewPass2("");
      if (emailChanged) {
        setAccMsg("✓ Account updated! Your login email has been changed.");
      } else if (newPass) {
        setAccMsg("✓ Password updated successfully!");
      } else {
        setAccMsg("✓ Account settings updated!");
      }
      setTimeout(() => setAccMsg(""), 6000);
    } catch { setAccMsg("⚠ Error updating. Please try again."); }
  };

  const handleReviewSubmit = async () => {
    if (!reviewForm.customer_name || !reviewForm.review_text) return;
    await ProviderReview.create({ ...reviewForm, provider_id: provider.id, is_approved: false, helpful_count: 0 });
    setReviewSaved(true);
    setShowReviewForm(false);
  };

  const handleUpgrade = async () => {
    setPaymentLoading(true);
    setPaymentError("");
    try {
      const res = await fetch("https://api.base44.app/api/apps/69d062aca815ce8e697894b1/functions/createCheckoutSession", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider_id: provider.id,
          provider_email: provider.email,
          provider_name: provider.owner_name || provider.business_name,
          business_name: provider.business_name,
          trial_end_date: provider.trial_end_date || null,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setPaymentError("Could not start checkout. Please try again or contact admin@v-hub.us");
      }
    } catch (err) {
      setPaymentError("Connection error. Please try again.");
    }
    setPaymentLoading(false);
  };

  const handleManageBilling = async () => {
    setBillingLoading(true);
    setPaymentError("");
    try {
      const res = await fetch("https://api.base44.app/api/apps/69d062aca815ce8e697894b1/functions/createBillingPortal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider_id: provider.id }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setPaymentError(data.error || "Could not open billing portal. Contact admin@v-hub.us");
      }
    } catch {
      setPaymentError("Connection error. Please try again or contact admin@v-hub.us");
    }
    setBillingLoading(false);
  };

  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel your subscription? You'll keep access until your current billing period ends.")) return;
    setCancelLoading(true);
    setCancelError("");
    try {
      const res = await fetch("https://api.base44.app/api/apps/69d062aca815ce8e697894b1/functions/cancelSubscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider_id: provider.id }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Cancellation failed");
      // Update local provider state
      setProvider(prev => ({ ...prev, subscription_status: "cancelled" }));
      setCancelAccessUntil(data.access_until || "");
      setCancelSuccess(true);
      setTimeout(() => setCancelSuccess(false), 8000);
    } catch (err) {
      setCancelError(err.message || "Something went wrong. Please try again.");
    } finally {
      setCancelLoading(false);
    }
  };

    const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : null;

  // ── Resolved service & area names ─────────────────────────────────────
  // Build inline maps directly from dbServices/dbAreas as fallback if svcMap/areaMap not ready yet
  const liveSvcMap = {};
  (dbServices || []).forEach(s => { liveSvcMap[s.id] = s.name; });
  const liveAreaMap = {};
  (dbAreas || []).forEach(a => { liveAreaMap[a.id] = a.name.includes(" — ") ? a.name.split(" — ").pop().trim() : a.name; });
  const mergedSvcMap  = Object.keys(svcMap).length  > 0 ? svcMap  : liveSvcMap;
  const mergedAreaMap = Object.keys(areaMap).length > 0 ? areaMap : liveAreaMap;
  const svcNames = React.useMemo(() => {
    if (!provider) return [];
    const ids = provider.services || [];
    if (ids.length === 0) return [];
    // Build fresh map from dbServices (most reliable source)
    const freshMap = {};
    (dbServices || []).forEach(s => { freshMap[s.id] = s.name; });
    // Also fold in svcMap in case dbServices not loaded yet
    Object.assign(freshMap, svcMap);
    return ids.map(id => resolveSvc(id, freshMap)).filter(Boolean);
  }, [provider, dbServices, svcMap]);

  const areaNames = React.useMemo(() => {
    if (!provider) return [];
    const ids = provider.service_areas || [];
    if (ids.length === 0) return [];
    // Build fresh map from dbAreas (most reliable source)
    const freshMap = {};
    (dbAreas || []).forEach(a => {
      freshMap[a.id] = a.name.includes(' — ') ? a.name.split(' — ').pop().trim() : a.name;
    });
    // Also fold in areaMap in case dbAreas not loaded yet
    Object.assign(freshMap, areaMap);
    return ids.map(id => resolveArea(id, freshMap)).filter(Boolean);
  }, [provider, dbAreas, areaMap]);

  // ── STATES ────────────────────────────────────────────────────────────
  if (authState === "loading") return (
    <div style={{ minHeight: "100vh", background: PAPER, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SERIF }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🌴</div>
        <div style={{ fontSize: 16, color: INK_FADE }}>Loading your Provider Hub...</div>
      </div>
    </div>
  );

  if (authState === "forgot") return <ForgotPasswordScreen onBack={() => setAuthState("login")} />;
  if (authState === "reset") return <ResetPasswordScreen token={resetToken} providerId={resetProviderId} onSuccess={() => setAuthState("login")} />;
  if (authState === "login") return <LoginScreen onLogin={handleLogin} onForgot={() => setAuthState("forgot")} />;
  if (authState === "force_change_password") return <ForcePasswordChangeScreen provider={provider} onComplete={(updatedProv) => { setProvider(updatedProv); seedForm(updatedProv); setAuthState("dashboard"); }} />;

  // ── TOP NAV (shared across dashboard/edit/account) ────────────────────
  const TopNav = ({ rightContent }) => (
    <div style={{ background: PAPER, borderBottom: `3px double ${INK}`, position: "sticky", top: 0, zIndex: 50 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px 8px", boxSizing: "border-box" }}>
        {/* Left — V-Hub wordmark links home */}
        <a href="/" style={{ textDecoration: "none", display: "flex", alignItems: "baseline" }}>
          <span style={{ fontStyle: "italic", fontWeight: 700, fontFamily: "'Great Vibes', cursive", fontSize: 42, color: "#003366", lineHeight: 1 }}>V</span>
          <span style={{ fontSize: 28, fontWeight: 900, color: INK, fontFamily: "'Times New Roman', serif", lineHeight: 1, margin: "0 2px" }}>-</span>
          <span style={{ fontSize: 34, fontWeight: 900, color: INK, fontFamily: "'Times New Roman', serif", letterSpacing: -1, lineHeight: 1 }}>Hub</span>
        </a>
        {/* Right — Home always visible, plus any contextual action */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <a href="/" style={{ textDecoration: "none" }}>
            <button style={{ background: `linear-gradient(180deg,#9A6030,${BROWN_BTN} 60%,#5A3010)`, border: `2px solid #1B3D6F`, borderRadius: 4, color: "#F5E8CC", fontFamily: SANS, fontWeight: 700, fontSize: 13, padding: "8px 16px", cursor: "pointer", whiteSpace: "nowrap" }}>{"«"} Home</button>
          </a>
          {rightContent && rightContent}
        </div>
      </div>
    </div>
  );


  // ── EDIT VIEW ─────────────────────────────────────────────────────────
  if (view === "edit") return (
    <div style={{ minHeight: "100vh", background: PAPER, backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 27px,rgba(28,15,0,0.03) 27px,rgba(28,15,0,0.03) 28px)", fontFamily: SERIF }}>
      <TopNav rightContent={
        <button onClick={() => setView("dashboard")} style={{ background: "transparent", border: `1.5px solid ${PAPER_DK}`, color: INK_FADE, borderRadius: 6, padding: "7px 16px", fontSize: 12, cursor: "pointer", fontFamily: SANS }>{"«"} Back</button>
      } />

      <div style={{ maxWidth: 700, margin: "0 auto", padding: "24px 16px 60px" }}>

        {saveMsg && <div style={{ textAlign: "center", fontSize: 13, color: saveMsg.startsWith("✓") ? GREEN : RED_RULE, fontStyle: "italic", marginBottom: 16 }}>{saveMsg}</div>}

        <div style={shS}>Section 1 — Business Info</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 16px", marginBottom: 20 }}>
          {[["business_name","Business Name *"],["owner_name","Owner / Contact Name *"],["phone","Phone *"],["email","Business Email *"],["website","Website"],["address","Address"],["years_in_business","Years in Business"],["license_number","License Number"]].map(([k, l]) => (
            <div key={k} style={{ gridColumn: k === "address" ? "1 / -1" : "auto" }}>
              <label style={lbS}>{l}</label>
              <input value={form[k] || ""} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} style={inS} />
            </div>
          ))}
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={lbS}>Google Review URL</label>
            <input value={form.google_review_url || ""} onChange={e => setForm(f => ({ ...f, google_review_url: e.target.value }))} style={inS} placeholder="https://maps.app.goo.gl/..." />
            <div style={{ fontSize: 11, color: "#888", marginTop: 4, fontFamily: "Arial, sans-serif" }}>Paste your Google Maps business link here — your star rating will sync automatically each night.</div>
          </div>
          <div>
            <label style={lbS}>Google Rating (e.g. 4.7)</label>
            <input type="number" step="0.1" min="1" max="5" value={form.google_rating || ""} onChange={e => setForm(f => ({ ...f, google_rating: e.target.value ? parseFloat(e.target.value) : "" }))} style={inS} placeholder="4.5" />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <label style={{ ...lbS, margin: 0 }}>Mobile Provider (travels to you)?</label>
            <input type="checkbox" checked={!!form.is_mobile} onChange={e => setForm(f => ({ ...f, is_mobile: e.target.checked }))} style={{ width: 18, height: 18, cursor: "pointer" }} />
            <span style={{ fontSize: 11, color: INK_FADE, fontFamily: SANS }}>Check if you travel to clients (no fixed location)</span>
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={lbS}>Hours of Operation</label>
          <textarea value={form.hours_of_operation || ""} onChange={e => setForm(f => ({ ...f, hours_of_operation: e.target.value }))} rows={3} style={{ ...inS, resize: "vertical", lineHeight: 1.8 }} placeholder={"Mon–Fri: 8am–5pm\nSat: 9am–1pm\nSun: Closed"} />
          <div style={{ fontSize: 10, color: INK_FADE, marginTop: 3, fontFamily: SANS }}>Enter each day or range on its own line</div>
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={lbS}>About Your Business</label>
          <textarea value={form.description || ""} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={4} style={{ ...inS, resize: "vertical", lineHeight: 1.6 }} placeholder="Tell residents what makes your business special..." />
        </div>

        <div style={shS}>Section 2 — Services You Offer</div>
        <div style={{ marginBottom: 24 }}>
          {dbServices.length > 0
            ? <><SvcAccordion selSvcs={selSvcs} setSelSvcs={setSelSvcs} dbCategories={dbCategories} dbServices={dbServices} />{selSvcs.length > 0 && <div style={{ marginTop: 8, fontSize: 12, color: TEAL, fontFamily: SANS }}>✓ {selSvcs.length} service{selSvcs.length > 1 ? "s" : ""} selected</div>}</>
            : <div style={{ fontSize: 13, color: INK_FADE, fontStyle: "italic", fontFamily: SANS, padding: "12px 0" }}>Loading services...</div>
          }
        </div>

        <div style={shS}>Section 3 — Villages You Serve</div>
        <div style={{ marginBottom: 28 }}>
          {dbAreas.length > 0
            ? <VillageSelect selAreas={selAreas} setSelAreas={setSelAreas} dbAreas={dbAreas} areaMap={mergedAreaMap} />
            : <div style={{ fontSize: 13, color: INK_FADE, fontStyle: "italic", fontFamily: SANS, padding: "12px 0" }}>Loading villages...</div>
          }
        </div>

        <div style={{ textAlign: "center", borderTop: `2px solid ${INK}`, paddingTop: 20 }}>
          {saveMsg && <div style={{ fontSize: 13, color: saveMsg.startsWith("✓") ? GREEN : RED_RULE, fontStyle: "italic", marginBottom: 12 }}>{saveMsg}</div>}
          <button data-testid="save-changes-btn" onClick={handleSave} disabled={saving} style={{ background: saving ? PAPER_DK : `linear-gradient(180deg,#9A6030,${BROWN_BTN} 60%,#5A3010)`, color: PAPER, border: `3px solid ${YELLOW}`, boxShadow: `0 0 0 1.5px ${YELLOW}, 0 0 12px 3px rgba(255,220,0,0.3)`, borderRadius: 6, padding: "14px 48px", fontSize: 15, fontWeight: 900, cursor: saving ? "not-allowed" : "pointer", fontFamily: SERIF, letterSpacing: 3, textTransform: "uppercase" }}>
            {saving ? "Saving…" : "Save Changes →"}
          </button>
          <div style={{ fontSize: 11, color: INK_FADE, fontStyle: "italic", marginTop: 8, fontFamily: SANS }}>Changes go live immediately on your V-Hub listing.</div>
          <button onClick={() => setView("dashboard")} style={{ marginTop: 16, background: "transparent", border: `1.5px solid ${PAPER_DK}`, color: INK_FADE, borderRadius: 6, padding: "10px 28px", fontSize: 13, cursor: "pointer", fontFamily: SANS }>{"«"} Return to Hub</button>
        </div>
      </div>
    </div>
  );

  // ── ACCOUNT SETTINGS VIEW ─────────────────────────────────────────────
  if (view === "account") return (
    <div style={{ minHeight: "100vh", background: PAPER, backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 27px,rgba(28,15,0,0.03) 27px,rgba(28,15,0,0.03) 28px)", fontFamily: SERIF }}>
      <TopNav rightContent={
        <button onClick={handleLogout} style={{ background: "rgba(255,255,255,0.1)", border: `1.5px solid ${PAPER_DK}`, color: PAPER, borderRadius: 6, padding: "7px 14px", fontSize: 12, cursor: "pointer", fontFamily: SANS }}>Sign Out</button>
      } />

      <div style={{ maxWidth: 560, margin: "0 auto", padding: "24px 16px 60px" }}>
        <button onClick={() => setView("dashboard")} style={{ background: "transparent", border: `1.5px solid ${PAPER_DK}`, color: INK_FADE, borderRadius: 6, padding: "7px 16px", fontSize: 12, cursor: "pointer", marginBottom: 20, fontFamily: SANS }>{"«"} Back to Hub</button>

        <div style={shS}>Account Settings</div>

        <div style={{ background: PAPER_MID, border: `2px solid ${PAPER_DK}`, borderRadius: 10, padding: "22px 20px", marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 900, color: INK, textTransform: "uppercase", letterSpacing: 2, marginBottom: 14, fontFamily: SERIF }}>🔐 Login Credentials</div>

          {accMsg && (
            <div style={{ background: accMsg.startsWith("✓") ? "#E8F5E9" : "#FEE", border: `1.5px solid ${accMsg.startsWith("✓") ? "#4CAF50" : RED_RULE}`, borderRadius: 6, padding: "9px 12px", marginBottom: 14, fontSize: 13, color: accMsg.startsWith("✓") ? GREEN : RED_RULE, fontFamily: SANS }}>
              {accMsg}
            </div>
          )}

          <div style={{ marginBottom: 14 }}>
            <label style={lbS}>Login Email</label>
            <input type="email" value={newLoginEmail} onChange={e => setNewLoginEmail(e.target.value)} style={inS} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={lbS}>New Password <span style={{ fontWeight: 400, textTransform: "none", fontSize: 11 }}>(leave blank to keep current)</span></label>
            <div style={{ position: "relative" }}>
              <input type={showNewPass ? "text" : "password"} value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="New password..." style={{ ...inS, paddingRight: 44 }} />
              <button type="button" onClick={() => setShowNewPass(p => !p)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, color: INK_FADE }}>
                {showNewPass ? "🙈" : "👁️"}
              </button>
            </div>
          </div>
          {newPass && (
            <div style={{ marginBottom: 14 }}>
              <label style={lbS}>Confirm New Password</label>
              <input type={showNewPass ? "text" : "password"} value={newPass2} onChange={e => setNewPass2(e.target.value)} placeholder="Re-enter new password..." style={inS} />
            </div>
          )}
          <button data-testid="save-account-btn" onClick={handleSaveAccount} style={{ background: `linear-gradient(180deg,#9A6030,${BROWN_BTN})`, color: PAPER, border: `2px solid ${YELLOW}`, borderRadius: 6, padding: "11px 28px", fontWeight: 900, fontSize: 13, cursor: "pointer", fontFamily: SERIF, letterSpacing: 1, textTransform: "uppercase" }}>
            Save Changes
          </button>
        </div>

        <div style={{ background: PAPER_MID, border: `2px solid ${PAPER_DK}`, borderRadius: 10, padding: "22px 20px", marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 900, color: INK, textTransform: "uppercase", letterSpacing: 2, marginBottom: 10, fontFamily: SERIF }}>📋 Account Info</div>
          {[["VH Account #", provider.vh_number],["Business", provider.business_name],["Owner", provider.owner_name],["Business Email", provider.email],["Status", provider.subscription_status],["Member Since", fmt(provider.created_date)]].map(([l, v]) => v ? (
            <div key={l} style={{ display: "flex", gap: 12, padding: "7px 0", borderBottom: `1px solid ${PAPER_DK}`, fontSize: 13, fontFamily: SANS }}>
              <div style={{ fontWeight: 700, color: INK_FADE, minWidth: 130 }}>{l}</div>
              <div style={{ color: INK }}>{v}</div>
            </div>
          ) : null)}
        </div>

        <div style={{ background: "#FFF8E1", border: "1.5px solid #E6C84A", borderRadius: 10, padding: "18px 20px" }}>
          <div style={{ fontSize: 13, fontWeight: 900, color: "#7C5C00", textTransform: "uppercase", letterSpacing: 2, marginBottom: 8, fontFamily: SERIF }}>Need Help?</div>
          <div style={{ fontSize: 13, color: INK_FADE, fontFamily: SANS, lineHeight: 1.7 }}>
            For billing changes, account issues, or to cancel, email us at:<br />
            <a href="mailto:admin@v-hub.us" style={{ color: BROWN_BTN, fontWeight: 700 }}>admin@v-hub.us</a>
          </div>
        </div>
      </div>
    </div>
  );

  // ── DASHBOARD VIEW ────────────────────────────────────────────────────
  const days = daysLeft(provider.trial_end_date);
  const isLive = provider.is_active && provider.is_visible;

  return (
    <div style={{ minHeight: "100vh", background: PAPER, backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 27px,rgba(28,15,0,0.03) 27px,rgba(28,15,0,0.03) 28px)", fontFamily: SERIF }}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap" rel="stylesheet" />

      <TopNav />

      {/* Masthead */}
      <div style={{ textAlign: "center", padding: "24px 20px 18px", borderBottom: `3px double ${INK}` }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 4, color: INK_FADE, fontFamily: SERIF, marginBottom: 4 }}>PROVIDER HUB</div>
        <div style={{ fontSize: 22, fontWeight: 900, color: INK, letterSpacing: 2, fontFamily: SERIF }}>{provider.business_name}</div>
        <div style={{ height: 2, background: RED_RULE, margin: "8px auto", width: 140 }} />
        <div style={{ fontSize: 12, color: INK_FADE, fontStyle: "italic", fontFamily: SERIF }}>
          {provider.owner_name} · <strong style={{ color: INK }}>{provider.vh_number || "VH-????"}</strong>
          {avgRating && <span> · <Stars rating={parseFloat(avgRating)} size={12} /> {avgRating} ({reviews.length})</span>}
        </div>
        <div style={{ marginTop: 6, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 11, fontFamily: SANS, background: isLive ? "#E8F5E9" : "#FEE", color: isLive ? GREEN : RED_RULE, border: `1px solid ${isLive ? "#4CAF50" : RED_RULE}`, borderRadius: 20, padding: "3px 12px", fontWeight: 700 }}>
            {isLive ? "🟢 Live on V-Hub" : provider.is_active ? "👁 Hidden from Search" : "⏸ Not Yet Active"}
          </span>

        </div>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "22px 16px 60px" }}>

        {/* Status Banner */}
        {paymentSuccess && (
          <div style={{ background: "#E8F5E9", border: "2px solid #4CAF50", borderRadius: 10, padding: "16px 18px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ fontSize: 28 }}>🎉</div>
            <div>
              <div style={{ fontWeight: 900, color: "#1B5E20", fontSize: 15, fontFamily: SERIF }}>Payment Successful — You're Subscribed!</div>
              <div style={{ fontSize: 13, color: "#2E7D32", fontFamily: SANS, marginTop: 3 }}>Your subscription is active at $12/month. Your listing is now live and visible to residents across The Villages.</div>
            </div>
            <button onClick={() => setPaymentSuccess(false)} style={{ marginLeft: "auto", background: "transparent", border: "none", color: "#888", fontSize: 18, cursor: "pointer" }}>✕</button>
          </div>
        )}
        {cancelSuccess && (
          <div style={{
            position: "fixed", top: 24, left: "50%", transform: "translateX(-50%)",
            background: "#1B5E20", color: "#fff", borderRadius: 12,
            padding: "16px 24px", zIndex: 9999, boxShadow: "0 4px 24px rgba(0,0,0,0.25)",
            display: "flex", alignItems: "center", gap: 14, minWidth: 300, maxWidth: "90vw"
          }}>
            <div style={{ fontSize: 26 }}>✅</div>
            <div>
              <div style={{ fontWeight: 900, fontSize: 14, fontFamily: SERIF, marginBottom: 3 }}>Subscription Cancelled</div>
              <div style={{ fontSize: 13, opacity: 0.9, fontFamily: SANS, lineHeight: 1.5 }}>
                {cancelAccessUntil
                  ? `Your listing stays live until ${cancelAccessUntil}. No future charges.`
                  : "Your cancellation was processed. No future charges."}
              </div>
            </div>
            <button onClick={() => setCancelSuccess(false)} style={{ marginLeft: "auto", background: "transparent", border: "none", color: "rgba(255,255,255,0.7)", fontSize: 20, cursor: "pointer", lineHeight: 1 }}>✕</button>
          </div>
        )}
        {/* Business Info */}
        <div style={{ ...shS }}>📋 Business Info</div>
        <div style={{ background: PAPER_MID, border: `1.5px solid ${PAPER_DK}`, borderRadius: 8, padding: "16px 18px", marginBottom: 24 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 16px" }}>
            {[
              ["📞 Phone", provider.phone],
              ["✉️ Email", provider.email],
              ["🌐 Website", provider.website],
              ["📍 Address", provider.address],
              ["🕐 Hours", provider.hours_of_operation ? provider.hours_of_operation.split("\n")[0] + (provider.hours_of_operation.includes("\n") ? "…" : "") : null],
              ["🏆 Years in Business", provider.years_in_business ? `${provider.years_in_business} yrs` : null],
              ["🏷 License #", provider.license_number],
              ["📍 Location Type", provider.is_mobile ? "Mobile — travels to you" : (provider.address ? "Brick & Mortar" : null)],
            ].filter(([, v]) => v).map(([l, v]) => (
              <div key={l} style={{ fontSize: 13, color: INK, fontFamily: SANS, gridColumn: l.includes("Address") ? "1 / -1" : "auto" }}>
                <span style={{ fontWeight: 700 }}>{l}: </span>
                {l.includes("Website") ? <a href={v} target="_blank" rel="noreferrer" style={{ color: TEAL }}>{v}</a> : v}
              </div>
            ))}
          </div>
          {provider.description && (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${PAPER_DK}`, fontSize: 13, color: INK_FADE, fontStyle: "italic", lineHeight: 1.7, fontFamily: SERIF }}>
              {provider.description}
            </div>
          )}
          {provider.google_review_url && (
            <div style={{ marginTop: 10 }}>
              <a href={provider.google_review_url} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: TEAL, fontFamily: SANS }}>⭐ View Google Reviews →</a>
            </div>
          )}
        </div>


        <StatusBanner provider={provider} onUpgrade={handleUpgrade} onCancel={handleCancel} onManageBilling={handleManageBilling} paymentLoading={paymentLoading} cancelLoading={cancelLoading} billingLoading={billingLoading} paymentError={paymentError} cancelError={cancelError} />

        {/* ── ANALYTICS DASHBOARD ─────────────────────────────── */}
        <AnalyticsDashboard provider={provider} reviews={reviews} />



        {/* Services */}
        <div style={shS}>🛠 Services Offered</div>
        {svcNames.length > 0 ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
            {svcNames.map(s => (
              <span key={s} style={{ background: BROWN_BTN, color: PAPER, borderRadius: 20, padding: "5px 14px", fontSize: 12, fontFamily: SANS }}>{s}</span>
            ))}
          </div>
        ) : dbServices.length === 0 ? (
          <div style={{ fontSize: 13, color: INK_FADE, fontStyle: "italic", marginBottom: 24, fontFamily: SANS }}>Loading services...</div>
        ) : (
          <div style={{ fontSize: 13, color: INK_FADE, fontStyle: "italic", marginBottom: 24, fontFamily: SANS }}>No services listed yet.</div>
        )}

        {/* Villages */}
        <div style={shS}>📍 Villages Served</div>
        {areaNames.length > 0 ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
            {areaNames.map(a => (
              <span key={a} style={{ background: TEAL, color: "#fff", borderRadius: 20, padding: "5px 12px", fontSize: 12, fontFamily: SANS }}>📍 {a}</span>
            ))}
          </div>
        ) : dbAreas.length === 0 ? (
          <div style={{ fontSize: 13, color: INK_FADE, fontStyle: "italic", marginBottom: 24, fontFamily: SANS }}>Loading villages...</div>
        ) : (
          <div style={{ fontSize: 13, color: INK_FADE, fontStyle: "italic", marginBottom: 24, fontFamily: SANS }}>No service areas listed yet.</div>
        )}

        {/* Edit profile CTA */}
        <div style={{ textAlign: "center", background: PAPER_MID, border: `2px solid ${PAPER_DK}`, borderRadius: 10, padding: "18px 20px", marginBottom: 28 }}>
          <div style={{ fontSize: 13, color: INK_FADE, fontStyle: "italic", marginBottom: 12, fontFamily: SERIF }}>Update your services, villages, or business info at any time.</div>
          <button data-testid="edit-profile-btn" onClick={() => setView("edit")} style={{ background: `linear-gradient(180deg,#9A6030,${BROWN_BTN} 60%,#5A3010)`, color: PAPER, border: `3px solid ${YELLOW}`, boxShadow: `0 0 0 1.5px ${YELLOW}, 0 0 12px 3px rgba(255,220,0,0.25)`, borderRadius: 6, padding: "13px 40px", fontSize: 14, fontWeight: 900, cursor: "pointer", fontFamily: SERIF, letterSpacing: 2, textTransform: "uppercase" }}>
            ✏ Edit My Profile →
          </button>
          <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 14 }}>
            <button onClick={() => setView("account")} style={{ background: "transparent", border: `1.5px solid ${PAPER_DK}`, color: INK_FADE, borderRadius: 6, padding: "7px 16px", fontSize: 12, cursor: "pointer", fontFamily: SANS }}>⚙ Account Settings</button>
            <button onClick={handleLogout} style={{ background: "transparent", border: `1.5px solid ${PAPER_DK}`, color: INK_FADE, borderRadius: 6, padding: "7px 16px", fontSize: 12, cursor: "pointer", fontFamily: SANS }}>Sign Out</button>
          </div>
        </div>

        {/* ── CLASSIFIED AD SECTION ─────────────────────────── */}
        <div style={{ ...shS, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span>📰 Deals of the Week</span>
          <span style={{ fontSize: 10, fontWeight: 400, color: INK_FADE, fontFamily: SANS, letterSpacing: 0.5 }}>$10/week · 7-day ad</span>
        </div>
        <ClassifiedAdSection provider={provider} />

        {/* Reviews — provider reads & responds, cannot self-review */}
        <ReviewsSection provider={provider} />

      </div>

      {/* Footer */}
      <div style={{ textAlign: "center", padding: "14px 16px", borderTop: `2px double ${INK}`, fontSize: 11, color: INK_FADE, fontStyle: "italic", background: PAPER, fontFamily: SERIF }}>
        © 2026 V-Hub · The Villages, Florida · <a href="/" style={{ color: INK_FADE }}>Home</a> · <a href="/Terms" style={{ color: INK_FADE }}>Terms</a> · <a href="/Privacy" style={{ color: INK_FADE }}>Privacy</a> · <a href="mailto:admin@v-hub.us" style={{ color: INK_FADE }}>admin@v-hub.us</a>
      </div>
    </div>
  );
}
