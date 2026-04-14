import React, { useState, useEffect, useRef } from "react";
import { Provider, ProviderReview, Service, ServiceArea, Category, ClassifiedAd, ProviderAnalytic } from "@/api/entities";

// ── SEO ───────────────────────────────────────────────────────────────────
function useMeta(title) {
  useEffect(() => { document.title = title || "Provider Hub | V-Hub"; }, [title]);
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
  return Math.ceil((new Date(dateStr) - new Date()) / 86400000);
}
function fmt(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}
function resolveSvc(id, svcMap) { return svcMap[id] || LEGACY_SVC[id] || id; }
function resolveArea(id, areaMap) { return areaMap[id] || LEGACY_AREA[id] || id; }

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
function StatusBanner({ provider, onUpgrade, onManageBilling, paymentLoading, billingLoading, paymentError }) {
  const status = provider.subscription_status;
  const days = daysLeft(provider.trial_end_date);
  const endFmt = fmt(provider.trial_end_date);

  // Active paid subscriber
  if (status === "active" || status === "paid") {
    return (
      <div style={{ background: "#E8F5E9", border: "2px solid #4CAF50", borderRadius: 10, padding: "18px 20px", marginBottom: 20 }}>
        <div style={{ fontWeight: 900, color: "#1B5E20", fontSize: 15, fontFamily: SERIF, marginBottom: 4 }}>✅ Subscription Active</div>
        <div style={{ fontSize: 13, color: "#2E7D32", fontFamily: SANS, marginBottom: 12, lineHeight: 1.6 }}>
          Your listing is <strong>live</strong> and visible to residents across The Villages. Your subscription renews automatically each month.
        </div>
        <button
          onClick={onManageBilling}
          disabled={billingLoading}
          style={{ background: "transparent", border: "1.5px solid #2E7D32", color: "#2E7D32", borderRadius: 6, padding: "8px 18px", fontSize: 12, fontWeight: 700, cursor: billingLoading ? "default" : "pointer", fontFamily: SANS, opacity: billingLoading ? 0.6 : 1 }}
        >
          {billingLoading ? "Opening Stripe…" : "Manage or Cancel Subscription →"}
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
          <div style={{ fontWeight: 900, color: RED_RULE, fontSize: 15, fontFamily: SERIF, marginBottom: 6 }}>⚠ Your Free Trial Has Ended</div>
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
            {urgent ? `⏰ Trial ends in ${days} day${days !== 1 ? "s" : ""}!` : `🎁 Free Trial — ${days} day${days !== 1 ? "s" : ""} remaining`}
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
      <div style={{ fontWeight: 900, color: RED_RULE, fontSize: 15, fontFamily: SERIF, marginBottom: 6 }}>⚠ Your Free Trial Has Ended</div>
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
function VillageSelect({ selAreas, setSelAreas, dbAreas }) {
  const [openGroup, setOpenGroup] = useState(null);

  const MACRO_GROUPS = [
    { key: "historic",     label: "🌴 Historic Side / Spanish Springs Area", villages: ["Alhambra","Country Club","Del Mar","El Cortez","Hacienda","La Reynalda","La Zamora","Mira Mesa","Orange Blossom","Silver Lake","Spring Arbor","Valle Verde"] },
    { key: "established_n", label: "🏡 Established Villages (North of SR-466A)", villages: ["Ashland","Belle Aire","Belvedere","Bonita","Bonnybrook","Bridgeport at Laurel Valley","Bridgeport at Mission Hills","Calumet Grove","Caroline","Chatham","Duval","Glenbrook","Hadley","Hemingway","Lynnhaven","Mallory Square","Pennecamp","Poinciana","Sabal Chase","Santiago","Sunset Pointe","Tall Trees","Virginia Trace","Winifred"] },
    { key: "established_s", label: "🏡 Established Villages (South of SR-466A)", villages: ["Charlotte","Collier","Dunedin","Fernandina","Gilchrist","Hillsborough","LaBelle","Lake Deaton","Osceola Hills","Pinellas","Sanibel"] },
    { key: "newer",        label: "🌿 Newer Villages (south of SR 44)", villages: ["Bradford","Cason Hammock","Chitty Chatty","Citrus Grove","DeLuna","DeSoto","Fenney","Hammock at Fenney","Hawkins","Linden","Marsh Bend","McClure","Monarch Grove","Richmond","St. Catherine","St. Johns"] },
    { key: "eastport",     label: "🌊 Eastport / newest development area", villages: ["Moultrie Creek","Newell","Lake Denham","Dabney","Shady Brook"] },
    { key: "family",       label: "🏠 Family / non-age-restricted villages", villages: ["Bison Valley","Oak Meadows","Oxford Oaks","Middleton"] },
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
    const key = id || vName;
    setSelAreas(prev => prev.includes(key) ? prev.filter(a => a !== key) : [...prev, key]);
  };

  const selectAll = (group) => {
    const keys = group.villages.map(v => nameToId[v] || v).filter(Boolean);
    setSelAreas(prev => {
      const s = new Set(prev);
      keys.forEach(k => s.add(k));
      return Array.from(s);
    });
  };

  const deselectAll = (group) => {
    const keys = new Set(group.villages.map(v => nameToId[v] || v).filter(Boolean));
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
            const name = area ? (area.name.includes(' — ') ? area.name.split(' — ').pop().trim() : area.name) : (isLegacyName(id) ? id : id);
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
                  return (
                    <button key={vName} onClick={() => toggle(vName)}
                      style={{ fontSize: 12, padding: "5px 12px", borderRadius: 20, border: `2px solid ${sel ? TEAL : PAPER_DK}`, background: sel ? TEAL : PAPER, color: sel ? "#fff" : INK, cursor: "pointer", fontWeight: sel ? 700 : 400, fontFamily: SANS, transition: "all 0.1s" }}>
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
    // Fallback: read from DOM directly in case React state didn't update (e.g. autofill or automation)
    const emailVal = loginEmail.trim() || (document.querySelector('input[autocomplete="email"]')?.value || "").trim();
    const passVal  = loginPass.trim()  || (document.querySelector('input[autocomplete="current-password"]')?.value || "").trim();
    if (!emailVal || !passVal) { setError("Please enter your email and password."); return; }
    if (!loginEmail) setLoginEmail(emailVal);
    if (!loginPass)  setLoginPass(passVal);
    setLoading(true);
    try {
      // Authenticate server-side so login_password never hits the client
      const res = await fetch("https://api.base44.app/api/apps/69d062aca815ce8e697894b1/functions/getProviders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login: true, identifier: emailVal, password: passVal }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Login failed. Please try again.");
        setLoading(false);
        return;
      }
      // Success — store session
      sessionStorage.setItem("vhub_provider_id", data.provider.id);
      onLogin(data.provider);
    } catch (err) {
      setError("Something went wrong. Please check your connection and try again.");
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: PAPER, backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 27px,rgba(28,15,0,0.03) 27px,rgba(28,15,0,0.03) 28px)", fontFamily: SERIF }}>
      {/* Top bar */}
      <div style={{ background: INK, padding: "10px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <a href="/" style={{ textDecoration: "none" }}>
          <button style={{ background: "rgba(255,255,255,0.1)", border: `1.5px solid ${PAPER_DK}`, color: PAPER, borderRadius: 6, padding: "7px 16px", fontSize: 13, cursor: "pointer", fontWeight: 700, fontFamily: SERIF }}>← Home</button>
        </a>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img src="https://media.base44.com/images/public/69d062aca815ce8e697894b1/a9af95bc3_V-Hublogo.png" style={{ height: 36, borderRadius: 6 }} alt="V-Hub" />
          <div style={{ color: PAPER, fontSize: 18, fontWeight: 900, letterSpacing: 1 }}>V-Hub</div>
        </div>
        <div style={{ width: 80 }} />
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
              Use your email or VH account number, plus the password you created when you listed your business.
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

  const [provider, setProvider]     = useState(null);
  const [authState, setAuthState]   = useState("loading"); // loading | login | forgot | reset | dashboard
  const [resetToken, setResetToken] = useState("");
  const [resetProviderId, setResetProviderId] = useState("");
  const [view, setView]             = useState("dashboard"); // dashboard | edit | account
  const [reviews, setReviews]       = useState([]);
  const [classifiedAd, setClassifiedAd] = useState(null);
  const [classifiedForm, setClassifiedForm] = useState({ headline: "", body: "", image_url: "", village: "", address: "", deal_expires_at: "" });
  const [classifiedSaving, setClassifiedSaving] = useState(false);
  const [classifiedSaved, setClassifiedSaved] = useState(false);
  const [classifiedImageFile, setClassifiedImageFile] = useState(null);
  const [classifiedImagePreview, setClassifiedImagePreview] = useState(null);
  const classifiedImageRef = useRef(null);
  const [nextAdForm, setNextAdForm] = useState({ headline: "", body: "", address: "", village: "", deal_expires_at: "" });
  const [nextAdSaving, setNextAdSaving] = useState(false);
  const [nextAdSaved, setNextAdSaved] = useState(false);
  const [svcMap, setSvcMap]         = useState({});
  const [areaMap, setAreaMap]       = useState({});
  const [dbCategories, setDbCategories] = useState([]);
  const [dbServices, setDbServices]     = useState([]);
  const [dbAreas, setDbAreas]           = useState([]);

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
      // Use backend function instead of entity SDK — works without Base44 auth session
      fetch("https://api.base44.app/api/apps/69d062aca815ce8e697894b1/functions/getProviders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_restore: true, provider_id: savedId }),
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
        fetch("https://api.base44.app/api/apps/69d062aca815ce8e697894b1/functions/getProviders", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_restore: true, provider_id: acctId }),
        }).then(r => r.json()).then(d => { if (d.success && d.provider) { setProvider(d.provider); seedForm(d.provider); } }).catch(() => {});
      }
    } else if (paymentResult === "portal_return") {
      // Returned from Stripe billing portal — re-fetch provider to get updated status
      window.history.replaceState({}, "", window.location.pathname);
      const acctId = urlParams.get("acct") || sessionStorage.getItem("vhub_provider_id");
      if (acctId) {
        fetch("https://api.base44.app/api/apps/69d062aca815ce8e697894b1/functions/getProviders", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_restore: true, provider_id: acctId }),
        }).then(r => r.json()).then(d => { if (d.success && d.provider) { setProvider(d.provider); seedForm(d.provider); setCancelSuccess(true); } }).catch(() => {});
      }
    } else if (paymentResult === "cancelled") {
      // User clicked "Back" on Stripe checkout — just clear the URL
      window.history.replaceState({}, "", window.location.pathname);
    }

    // Load entity data for name resolution and edit pickers
    Promise.all([
      Category.list().catch(() => []),
      Service.list().catch(() => []),
      ServiceArea.list().catch(() => []),
    ]).then(([cats, svcs, areas]) => {
      setDbCategories(cats || []);
      setDbServices(svcs || []);
      setDbAreas(areas || []);
      const sm = {}; (svcs || []).forEach(s => { sm[s.id] = s.name; });
      setSvcMap(sm);
      const am = {}; (areas || []).forEach(a => { am[a.id] = a.name; });
      setAreaMap(am);
    });
  }, []);

  const loadClassified = async (pid) => {
    try {
      const ads = await ClassifiedAd.filter({ provider_id: pid });
      const active = (ads || []).find(a => a.is_active) || null;
      const anyAd = active || (ads || [])[0] || null;
      setClassifiedAd(active);
      if (active) {
        setClassifiedForm({
          headline: active.headline || "", body: active.body || "",
          image_url: active.image_url || "", village: active.village || "",
          address: active.address || "", deal_expires_at: active.deal_expires_at ? active.deal_expires_at.slice(0,10) : "",
        });
      }
      if (anyAd && anyAd.next_headline) {
        setNextAdForm({
          headline: anyAd.next_headline || "", body: anyAd.next_body || "",
          address: anyAd.next_address || "", village: anyAd.next_village || "",
          deal_expires_at: anyAd.next_deal_expires_at ? anyAd.next_deal_expires_at.slice(0,10) : "",
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
    });
    setSelSvcs(Array.isArray(prov.services) ? prov.services : []);
    setSelAreas(Array.isArray(prov.service_areas) ? prov.service_areas : []);
  };

  const handleLogin = (prov) => {
    setProvider(prov);
    seedForm(prov);
    setNewLoginEmail(prov.login_email || prov.email || "");
    loadReviews(prov.id);
    setAuthState("dashboard");
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
    try {
      const res = await fetch("https://api.base44.app/api/apps/69d062aca815ce8e697894b1/functions/adminUpdateProvider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pin: "6185",
          id: provider.id,
          fields: { ...form, services: selSvcs, service_areas: selAreas }
        })
      });
      const data = await res.json();
      if (!data.success) { setSaveMsg("⚠ " + (data.error || "Error saving.")); setSaving(false); return; }
      // Use the returned record directly (avoids a second auth-gated fetch)
      if (data.record) { setProvider(data.record); seedForm(data.record); }
      setSaveMsg("✓ Profile updated successfully!");
      setTimeout(() => { setSaveMsg(""); setView("dashboard"); }, 2000);
    } catch { setSaveMsg("⚠ Error saving. Please try again."); }
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

    const updates = { login_email: newEmail };
    if (newPass) updates.login_password = await hashPassword(newPass);
    try {
      const accRes = await fetch("https://api.base44.app/api/apps/69d062aca815ce8e697894b1/functions/adminUpdateProvider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: "6185", id: provider.id, fields: updates })
      });
      const accData = await accRes.json();
      if (!accData.success) { setAccMsg("⚠ " + (accData.error || "Error updating.")); return; }
      const fresh = accData.record || { ...provider, ...updates };
      setProvider(fresh);
      sessionStorage.setItem("vhub_provider_id", fresh.id);
      setNewPass(""); setNewPass2("");

      // Send email change notification to OLD address
      if (emailChanged) {
        fetch("https://api.base44.app/api/apps/69d062aca815ce8e697894b1/functions/notifyEmailChange", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            old_email: oldEmail,
            new_email: newEmail,
            business_name: provider.business_name,
          }),
        }).catch(() => {});
      }

      if (emailChanged) {
        setAccMsg("✓ Account updated! A confirmation was sent to your old email address.");
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
    // Redirect to Stripe billing portal for cancellation (cleaner UX)
    await handleManageBilling();
  };

    const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : null;

  // ── Resolved service & area names ─────────────────────────────────────
  const svcNames  = provider ? (provider.services  || []).map(id => resolveSvc(id, svcMap)).filter(Boolean) : [];
  const areaNames = provider ? (provider.service_areas || []).map(id => resolveArea(id, areaMap)).filter(Boolean) : [];

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

  // ── TOP NAV (shared across dashboard/edit/account) ────────────────────
  const TopNav = ({ rightContent }) => (
    <div style={{ background: INK, padding: "10px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
      <a href="/" style={{ textDecoration: "none" }}>
        <button style={{ background: "rgba(255,255,255,0.1)", border: `1.5px solid ${PAPER_DK}`, color: PAPER, borderRadius: 6, padding: "7px 14px", fontSize: 13, cursor: "pointer", fontWeight: 700, fontFamily: SERIF }}>← Home</button>
      </a>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <img src="https://media.base44.com/images/public/69d062aca815ce8e697894b1/a9af95bc3_V-Hublogo.png" style={{ height: 32, borderRadius: 5 }} alt="V-Hub" />
        <div style={{ color: PAPER, fontSize: 16, fontWeight: 900, letterSpacing: 1, fontFamily: SERIF }}>Provider Hub</div>
      </div>
      {rightContent || <div style={{ width: 80 }} />}
    </div>
  );

  // ── EDIT VIEW ─────────────────────────────────────────────────────────
  if (view === "edit") return (
    <div style={{ minHeight: "100vh", background: PAPER, backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 27px,rgba(28,15,0,0.03) 27px,rgba(28,15,0,0.03) 28px)", fontFamily: SERIF }}>
      <TopNav rightContent={
        <button onClick={handleSave} disabled={saving} style={{ background: `linear-gradient(180deg,#9A6030,${BROWN_BTN})`, color: PAPER, border: `2px solid ${YELLOW}`, borderRadius: 6, padding: "7px 16px", fontSize: 13, fontWeight: 900, cursor: "pointer", letterSpacing: 1, fontFamily: SERIF }}>
          {saving ? "Saving…" : "Save →"}
        </button>
      } />

      <div style={{ maxWidth: 700, margin: "0 auto", padding: "24px 16px 60px" }}>
        <button onClick={() => setView("dashboard")} style={{ background: "transparent", border: `1.5px solid ${PAPER_DK}`, color: INK_FADE, borderRadius: 6, padding: "7px 16px", fontSize: 12, cursor: "pointer", marginBottom: 20, fontFamily: SANS }}>← Back to Hub</button>

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
            <input value={form.google_review_url || ""} onChange={e => setForm(f => ({ ...f, google_review_url: e.target.value }))} style={inS} placeholder="https://g.page/your-business/review" />
          </div>
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={lbS}>About Your Business</label>
          <textarea value={form.description || ""} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={4} style={{ ...inS, resize: "vertical", lineHeight: 1.6 }} placeholder="Tell residents what makes your business special..." />
        </div>

        <div style={shS}>Section 2 — Services You Offer</div>
        <div style={{ marginBottom: 24 }}>
          <SvcAccordion selSvcs={selSvcs} setSelSvcs={setSelSvcs} dbCategories={dbCategories} dbServices={dbServices} />
          {selSvcs.length > 0 && <div style={{ marginTop: 8, fontSize: 12, color: TEAL, fontFamily: SANS }}>✓ {selSvcs.length} service{selSvcs.length > 1 ? "s" : ""} selected</div>}
        </div>

        <div style={shS}>Section 3 — Villages You Serve</div>
        <div style={{ marginBottom: 28 }}>
          <VillageSelect selAreas={selAreas} setSelAreas={setSelAreas} dbAreas={dbAreas} />
        </div>

        <div style={{ textAlign: "center", borderTop: `2px solid ${INK}`, paddingTop: 20 }}>
          {saveMsg && <div style={{ fontSize: 13, color: saveMsg.startsWith("✓") ? GREEN : RED_RULE, fontStyle: "italic", marginBottom: 12 }}>{saveMsg}</div>}
          <button onClick={handleSave} disabled={saving} style={{ background: saving ? PAPER_DK : `linear-gradient(180deg,#9A6030,${BROWN_BTN} 60%,#5A3010)`, color: PAPER, border: `3px solid ${YELLOW}`, boxShadow: `0 0 0 1.5px ${YELLOW}, 0 0 12px 3px rgba(255,220,0,0.3)`, borderRadius: 6, padding: "14px 48px", fontSize: 15, fontWeight: 900, cursor: saving ? "not-allowed" : "pointer", fontFamily: SERIF, letterSpacing: 3, textTransform: "uppercase" }}>
            {saving ? "Saving…" : "Save Changes →"}
          </button>
          <div style={{ fontSize: 11, color: INK_FADE, fontStyle: "italic", marginTop: 8, fontFamily: SANS }}>Changes go live immediately on your V-Hub listing.</div>
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
        <button onClick={() => setView("dashboard")} style={{ background: "transparent", border: `1.5px solid ${PAPER_DK}`, color: INK_FADE, borderRadius: 6, padding: "7px 16px", fontSize: 12, cursor: "pointer", marginBottom: 20, fontFamily: SANS }}>← Back to Hub</button>

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
          <button onClick={handleSaveAccount} style={{ background: `linear-gradient(180deg,#9A6030,${BROWN_BTN})`, color: PAPER, border: `2px solid ${YELLOW}`, borderRadius: 6, padding: "11px 28px", fontWeight: 900, fontSize: 13, cursor: "pointer", fontFamily: SERIF, letterSpacing: 1, textTransform: "uppercase" }}>
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

      <TopNav rightContent={
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <button onClick={() => setView("account")} style={{ background: "rgba(255,255,255,0.1)", border: `1.5px solid ${PAPER_DK}`, color: PAPER, borderRadius: 6, padding: "6px 12px", fontSize: 12, cursor: "pointer", fontFamily: SANS }}>⚙ Account</button>
          <button onClick={handleLogout} style={{ background: "rgba(255,255,255,0.1)", border: `1.5px solid ${PAPER_DK}`, color: PAPER, borderRadius: 6, padding: "6px 12px", fontSize: 12, cursor: "pointer", fontFamily: SANS }}>Sign Out</button>
        </div>
      } />

      {/* Masthead */}
      <div style={{ textAlign: "center", padding: "24px 20px 18px", borderBottom: `3px double ${INK}` }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 4, color: INK_FADE, fontFamily: SERIF, marginBottom: 4 }}>PROVIDER HUB</div>
        <div style={{ fontSize: 22, fontWeight: 900, color: INK, letterSpacing: 2, fontFamily: SERIF }}>{provider.business_name}</div>
        <div style={{ height: 2, background: RED_RULE, margin: "8px auto", width: 140 }} />
        <div style={{ fontSize: 12, color: INK_FADE, fontStyle: "italic", fontFamily: SERIF }}>
          {provider.owner_name} · <strong style={{ color: INK }}>{provider.vh_number || "VH-????"}</strong>
          {avgRating && <span> · <Stars rating={parseFloat(avgRating)} size={12} /> {avgRating} ({reviews.length})</span>}
        </div>
        <div style={{ marginTop: 6 }}>
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
          <div style={{ background: "#F3F4F6", border: "2px solid #9CA3AF", borderRadius: 10, padding: "16px 18px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ fontSize: 24 }}>✅</div>
            <div>
              <div style={{ fontWeight: 900, color: "#374151", fontSize: 14, fontFamily: SERIF }}>Subscription Cancelled</div>
              <div style={{ fontSize: 13, color: "#6B7280", fontFamily: SANS, marginTop: 3 }}>Your cancellation was processed. Your listing will remain visible until the end of your current billing period.</div>
            </div>
            <button onClick={() => setCancelSuccess(false)} style={{ marginLeft: "auto", background: "transparent", border: "none", color: "#888", fontSize: 18, cursor: "pointer" }}>✕</button>
          </div>
        )}
        <StatusBanner provider={provider} onUpgrade={handleUpgrade} onManageBilling={handleManageBilling} paymentLoading={paymentLoading} billingLoading={billingLoading} paymentError={paymentError} />

        {/* ── ANALYTICS DASHBOARD ─────────────────────────────── */}
        <AnalyticsDashboard provider={provider} reviews={reviews} />



        {/* Business Info */}
        <div style={{ ...shS }}>📋 Business Info</div>
        <div style={{ background: PAPER_MID, border: `1.5px solid ${PAPER_DK}`, borderRadius: 8, padding: "16px 18px", marginBottom: 24 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 16px" }}>
            {[
              ["📞 Phone", provider.phone],
              ["✉️ Email", provider.email],
              ["🌐 Website", provider.website],
              ["📍 Address", provider.address],
              ["🏆 Years in Business", provider.years_in_business ? `${provider.years_in_business} yrs` : null],
              ["🏷 License #", provider.license_number],
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

        {/* Services */}
        <div style={shS}>🛠 Services Offered</div>
        {svcNames.length > 0 ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
            {svcNames.map(s => (
              <span key={s} style={{ background: BROWN_BTN, color: PAPER, borderRadius: 20, padding: "5px 14px", fontSize: 12, fontFamily: SANS }}>{s}</span>
            ))}
          </div>
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
        ) : (
          <div style={{ fontSize: 13, color: INK_FADE, fontStyle: "italic", marginBottom: 24, fontFamily: SANS }}>No service areas listed yet.</div>
        )}

        {/* Edit profile CTA */}
        <div style={{ textAlign: "center", background: PAPER_MID, border: `2px solid ${PAPER_DK}`, borderRadius: 10, padding: "18px 20px", marginBottom: 28 }}>
          <div style={{ fontSize: 13, color: INK_FADE, fontStyle: "italic", marginBottom: 12, fontFamily: SERIF }}>Update your services, villages, or business info at any time.</div>
          <button onClick={() => setView("edit")} style={{ background: `linear-gradient(180deg,#9A6030,${BROWN_BTN} 60%,#5A3010)`, color: PAPER, border: `3px solid ${YELLOW}`, boxShadow: `0 0 0 1.5px ${YELLOW}, 0 0 12px 3px rgba(255,220,0,0.25)`, borderRadius: 6, padding: "13px 40px", fontSize: 14, fontWeight: 900, cursor: "pointer", fontFamily: SERIF, letterSpacing: 2, textTransform: "uppercase" }}>
            ✏ Edit My Profile →
          </button>
        </div>

        {/* ── CLASSIFIED AD SECTION ─────────────────────────── */}
        <div style={{ ...shS, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span>📰 My Classified Ad</span>
          <span style={{ fontSize: 10, fontWeight: 400, color: INK_FADE, fontFamily: SANS, letterSpacing: 0.5 }}>$10/month add-on</span>
        </div>

        {/* ── NOT SUBSCRIBED — Stripe buy button ── */}
        {!provider.classifieds_addon && (
          <div style={{ background: "#F9F3E3", border: "2px solid #2E7D32", borderRadius: 8, padding: "16px 18px", marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 900, color: "#2E7D32", marginBottom: 6, fontFamily: SERIF, textTransform: "uppercase", letterSpacing: 1 }}>
              📰 Run a Classified Ad — $10/Month
            </div>
            <div style={{ fontSize: 13, color: INK, lineHeight: 1.7, fontFamily: SANS, marginBottom: 10 }}>
              Get your deals and specials in front of every resident searching The Villages. Your ad goes live the moment you subscribe.
            </div>
            <div style={{ fontSize: 12, color: INK_FADE, fontFamily: SANS, marginBottom: 14, lineHeight: 1.8 }}>
              ✓ A–Z listing with your deal &nbsp;·&nbsp; ✓ Address & directions &nbsp;·&nbsp; ✓ Expiration date on the deal &nbsp;·&nbsp; ✓ Queue your next ad &nbsp;·&nbsp; ✓ Photo optional
            </div>
            <button
              onClick={async () => {
                try {
                  const resp = await fetch("https://api.base44.app/api/apps/69d062aca815ce8e697894b1/functions/createClassifiedsCheckout", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      provider_record_id: provider.id,
                      provider_email: provider.login_email || provider.email,
                      provider_name: provider.business_name,
                    }),
                  });
                  const data = await resp.json();
                  if (data.url) window.location.href = data.url;
                  else alert("Could not start checkout: " + (data.error || "unknown error"));
                } catch (e) {
                  alert("Error starting checkout. Please try again.");
                }
              }}
              style={{
                background: `linear-gradient(180deg,#9A6030,${BROWN_BTN})`,
                color: PAPER, border: "2px solid #2E7D32", borderRadius: 6,
                padding: "11px 28px", fontSize: 13, fontWeight: 900,
                cursor: "pointer", letterSpacing: 1, fontFamily: SERIF,
              }}
            >
              Subscribe — $10/mo →
            </button>
          </div>
        )}

        {/* ── SUBSCRIBED — Ad editor ── */}
        {provider.classifieds_addon && (
          <div style={{ background: PAPER_MID, border: "1.5px solid #2E7D32", borderRadius: 8, padding: "16px 18px", marginBottom: 16 }}>

            {/* Status bar */}
            <div style={{ fontSize: 13, color: "#2E7D32", fontWeight: 700, fontFamily: SANS, marginBottom: 14, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              ✅ Classifieds Add-On Active
              {classifiedAd ? (
                <span style={{ fontSize: 11, background: "#2E7D32", color: "#fff", borderRadius: 10, padding: "2px 10px" }}>Ad Live</span>
              ) : (
                <span style={{ fontSize: 11, background: "#888", color: "#fff", borderRadius: 10, padding: "2px 10px" }}>No ad yet</span>
              )}
            </div>

            {/* Live preview */}
            {classifiedAd && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: INK_FADE, fontFamily: SANS, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1, fontWeight: 700 }}>Current Live Ad</div>
                <div style={{
                  background: "#F5EDD6", border: "2px solid #1A1209", borderRadius: 2,
                  padding: "12px 12px 10px", fontFamily: "'Times New Roman', serif",
                  maxWidth: 260, position: "relative",
                }}>
                  <div style={{ position: "absolute", top: 4, left: 4, right: 4, borderTop: "1px solid #1A1209" }} />
                  <div style={{ position: "absolute", bottom: 4, left: 4, right: 4, borderBottom: "1px solid #1A1209" }} />
                  {classifiedAd.image_url && (
                    <img src={classifiedAd.image_url} alt="" style={{ width: "100%", height: 90, objectFit: "cover", borderRadius: 1, marginBottom: 6, display: "block" }} />
                  )}
                  <div style={{ fontSize: 12, fontWeight: 700, textAlign: "center", textTransform: "uppercase", letterSpacing: 1, borderBottom: "1px solid #C8B89A", paddingBottom: 4, marginBottom: 5 }}>
                    {classifiedAd.headline}
                  </div>
                  {classifiedAd.deal_expires_at && (
                    <div style={{ fontSize: 10, color: "#2E7D32", fontWeight: 700, textAlign: "center", marginBottom: 4 }}>
                      Deal thru {new Date(classifiedAd.deal_expires_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </div>
                  )}
                  <div style={{ fontSize: 11, color: "#1A1209", lineHeight: 1.5 }}>{classifiedAd.body}</div>
                  {classifiedAd.address && <div style={{ fontSize: 10, color: "#00836B", fontWeight: 700, marginTop: 5 }}>📍 {classifiedAd.address}</div>}
                  <div style={{ fontSize: 10, color: "#6B5B3E", textAlign: "center", borderTop: "1px solid #C8B89A", paddingTop: 4, marginTop: 5, fontStyle: "italic" }}>
                    {classifiedAd.provider_name}{classifiedAd.village ? ` · ${classifiedAd.village}` : ""}
                  </div>
                </div>
              </div>
            )}

            {/* ── Current / Edit Ad Form ── */}
            <div style={{ fontSize: 12, fontWeight: 700, color: INK, fontFamily: SANS, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
              {classifiedAd ? "✏️ Edit Current Ad" : "➕ Create Your Ad"}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 14px", marginBottom: 10 }}>
              <div style={{ gridColumn: "1/-1" }}>
                <label style={lbS}>Ad Headline * <span style={{ fontSize: 10, fontWeight: 400, color: INK_FADE }}>(max 80 chars)</span></label>
                <input
                  style={inS}
                  placeholder="e.g. Buy 2 Get 2 Free — Summer Tire Special"
                  value={classifiedForm.headline}
                  onChange={e => setClassifiedForm(p => ({ ...p, headline: e.target.value.slice(0, 80) }))}
                />
                <div style={{ fontSize: 10, color: INK_FADE, fontFamily: SANS, marginTop: 1 }}>{classifiedForm.headline.length}/80</div>
              </div>
              <div style={{ gridColumn: "1/-1" }}>
                <label style={lbS}>Ad Body — Describe the deal * <span style={{ fontSize: 10, fontWeight: 400, color: INK_FADE }}>(max 300 chars)</span></label>
                <textarea
                  style={{ ...inS, minHeight: 78, resize: "vertical", lineHeight: 1.6 }}
                  placeholder="Describe the deal, offer, or promotion in detail…"
                  value={classifiedForm.body}
                  onChange={e => setClassifiedForm(p => ({ ...p, body: e.target.value.slice(0, 300) }))}
                />
                <div style={{ fontSize: 10, color: INK_FADE, fontFamily: SANS, marginTop: 1 }}>{classifiedForm.body.length}/300</div>
              </div>
              <div>
                <label style={lbS}>Business Address</label>
                <input style={inS} placeholder="123 Main St, The Villages" value={classifiedForm.address} onChange={e => setClassifiedForm(p => ({ ...p, address: e.target.value }))} />
              </div>
              <div>
                <label style={lbS}>Village / Area</label>
                <input style={inS} placeholder="e.g. Brownwood" value={classifiedForm.village} onChange={e => setClassifiedForm(p => ({ ...p, village: e.target.value }))} />
              </div>
              <div>
                <label style={lbS}>Deal Expires On</label>
                <input type="date" style={inS} value={classifiedForm.deal_expires_at ? classifiedForm.deal_expires_at.slice(0, 10) : ""} onChange={e => setClassifiedForm(p => ({ ...p, deal_expires_at: e.target.value }))} />
                <div style={{ fontSize: 10, color: INK_FADE, fontFamily: SANS, marginTop: 1 }}>Leave blank if ongoing</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                <label style={lbS}>Ad Photo (optional)</label>
                <input ref={classifiedImageRef} type="file" accept="image/*" style={{ display: "none" }}
                  onChange={e => {
                    const file = e.target.files[0];
                    if (!file) return;
                    setClassifiedImageFile(file);
                    const reader = new FileReader();
                    reader.onload = ev => setClassifiedImagePreview(ev.target.result);
                    reader.readAsDataURL(file);
                  }}
                />
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <button type="button" onClick={() => classifiedImageRef.current?.click()}
                    style={{ background: PAPER, border: `1.5px solid ${PAPER_DK}`, color: INK, borderRadius: 4, padding: "7px 12px", fontSize: 12, cursor: "pointer", fontFamily: SANS }}
                  >
                    📷 {classifiedImagePreview || classifiedForm.image_url ? "Change" : "Upload"}
                  </button>
                  {(classifiedImagePreview || classifiedForm.image_url) && (
                    <>
                      <img src={classifiedImagePreview || classifiedForm.image_url} alt="preview"
                        style={{ height: 38, width: 60, objectFit: "cover", borderRadius: 3, border: `1px solid ${PAPER_DK}` }} />
                      <button type="button"
                        onClick={() => { setClassifiedImageFile(null); setClassifiedImagePreview(null); setClassifiedForm(p => ({ ...p, image_url: "" })); if (classifiedImageRef.current) classifiedImageRef.current.value = ""; }}
                        style={{ background: "none", border: "none", color: "#c00", fontSize: 18, cursor: "pointer", padding: 0 }}
                      >✕</button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {classifiedSaved && (
              <div style={{ background: "#E8F5E9", border: "1.5px solid #2E7D32", borderRadius: 6, padding: "9px 14px", marginBottom: 10, fontSize: 13, color: "#2E7D32", fontFamily: SANS }}>
                ✓ Your classified ad has been saved and is now live!
              </div>
            )}

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
              <button
                onClick={async () => {
                  if (!classifiedForm.headline.trim() || !classifiedForm.body.trim()) { alert("Please fill in the headline and body."); return; }
                  setClassifiedSaving(true); setClassifiedSaved(false);
                  try {
                    let imageUrl = classifiedForm.image_url;
                    if (classifiedImageFile) {
                      const fd = new FormData(); fd.append("file", classifiedImageFile);
                      const up = await fetch("https://api.base44.app/api/apps/69d062aca815ce8e697894b1/storage/upload", { method: "POST", body: fd });
                      const upd = await up.json();
                      imageUrl = upd.file_url || upd.url || imageUrl;
                    }
                    const adData = {
                      provider_id: provider.id,
                      provider_name: provider.business_name,
                      village: classifiedForm.village,
                      address: classifiedForm.address,
                      headline: classifiedForm.headline,
                      body: classifiedForm.body,
                      image_url: imageUrl,
                      deal_expires_at: classifiedForm.deal_expires_at || null,
                      is_active: true,
                    };
                    if (classifiedAd) { await ClassifiedAd.update(classifiedAd.id, adData); }
                    else { await ClassifiedAd.create(adData); }
                    await loadClassified(provider.id);
                    setClassifiedSaved(true); setClassifiedImageFile(null); setClassifiedImagePreview(null);
                  } catch { alert("Error saving ad. Please try again."); }
                  finally { setClassifiedSaving(false); }
                }}
                style={{ background: `linear-gradient(180deg,#9A6030,${BROWN_BTN})`, color: PAPER, border: "2px solid #2E7D32", borderRadius: 5, padding: "10px 22px", fontSize: 13, fontWeight: 700, cursor: classifiedSaving ? "not-allowed" : "pointer", letterSpacing: 1, fontFamily: SERIF, opacity: classifiedSaving ? 0.7 : 1 }}
              >
                {classifiedSaving ? "Saving…" : classifiedAd ? "Update Ad" : "Publish Ad"}
              </button>
              {classifiedAd && (
                <button
                  onClick={async () => {
                    if (!window.confirm("Remove your current classified ad?")) return;
                    await ClassifiedAd.update(classifiedAd.id, { is_active: false });
                    setClassifiedAd(null); setClassifiedForm({ headline: "", body: "", image_url: "", village: "", address: "", deal_expires_at: "" }); setClassifiedSaved(false);
                  }}
                  style={{ background: PAPER, border: "1.5px solid #c00", color: "#c00", borderRadius: 5, padding: "10px 16px", fontSize: 13, cursor: "pointer", fontFamily: SANS }}
                >Remove Ad</button>
              )}
            </div>

            {/* ── QUEUE NEXT AD ── */}
            <div style={{ borderTop: `2px dashed ${PAPER_DK}`, paddingTop: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: INK, fontFamily: SANS, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
                📅 Queue Next Ad
              </div>
              <div style={{ fontSize: 12, color: INK_FADE, fontFamily: SANS, marginBottom: 10, lineHeight: 1.6 }}>
                When your current deal expires, this ad goes live automatically — zero downtime.
                {classifiedAd?.next_headline && <span style={{ color: "#2E7D32", fontWeight: 700 }}> ✓ Next ad is queued!</span>}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 14px" }}>
                <div style={{ gridColumn: "1/-1" }}>
                  <label style={lbS}>Next Headline</label>
                  <input style={inS} placeholder="Next deal headline…" value={nextAdForm.headline}
                    onChange={e => setNextAdForm(p => ({ ...p, headline: e.target.value.slice(0, 80) }))} />
                </div>
                <div style={{ gridColumn: "1/-1" }}>
                  <label style={lbS}>Next Ad Body</label>
                  <textarea style={{ ...inS, minHeight: 70, resize: "vertical", lineHeight: 1.6 }} placeholder="Describe the next deal…"
                    value={nextAdForm.body} onChange={e => setNextAdForm(p => ({ ...p, body: e.target.value.slice(0, 300) }))} />
                </div>
                <div>
                  <label style={lbS}>Address</label>
                  <input style={inS} placeholder="Business address" value={nextAdForm.address}
                    onChange={e => setNextAdForm(p => ({ ...p, address: e.target.value }))} />
                </div>
                <div>
                  <label style={lbS}>Village / Area</label>
                  <input style={inS} placeholder="e.g. Brownwood" value={nextAdForm.village}
                    onChange={e => setNextAdForm(p => ({ ...p, village: e.target.value }))} />
                </div>
                <div>
                  <label style={lbS}>Next Deal Expires On</label>
                  <input type="date" style={inS} value={nextAdForm.deal_expires_at}
                    onChange={e => setNextAdForm(p => ({ ...p, deal_expires_at: e.target.value }))} />
                </div>
              </div>

              {nextAdSaved && (
                <div style={{ background: "#E8F5E9", border: "1.5px solid #2E7D32", borderRadius: 6, padding: "9px 14px", marginTop: 10, fontSize: 13, color: "#2E7D32", fontFamily: SANS }}>
                  ✓ Next ad queued! It will go live when your current deal expires.
                </div>
              )}

              <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                <button
                  onClick={async () => {
                    if (!nextAdForm.headline.trim() || !nextAdForm.body.trim()) { alert("Please fill in the next ad headline and body."); return; }
                    setNextAdSaving(true); setNextAdSaved(false);
                    try {
                      const target = classifiedAd || { id: null };
                      const nextData = {
                        next_headline: nextAdForm.headline,
                        next_body: nextAdForm.body,
                        next_address: nextAdForm.address,
                        next_village: nextAdForm.village,
                        next_deal_expires_at: nextAdForm.deal_expires_at || null,
                      };
                      if (target.id) {
                        await ClassifiedAd.update(target.id, nextData);
                      } else {
                        // No current ad — create a placeholder with the queued data
                        await ClassifiedAd.create({
                          provider_id: provider.id, provider_name: provider.business_name,
                          is_active: false, ...nextData,
                        });
                      }
                      await loadClassified(provider.id);
                      setNextAdSaved(true);
                    } catch { alert("Error saving next ad. Please try again."); }
                    finally { setNextAdSaving(false); }
                  }}
                  style={{ background: PAPER_MID, border: "1.5px solid #2E7D32", color: "#2E7D32", borderRadius: 5, padding: "9px 20px", fontSize: 12, fontWeight: 700, cursor: nextAdSaving ? "not-allowed" : "pointer", fontFamily: SANS, opacity: nextAdSaving ? 0.7 : 1 }}
                >
                  {nextAdSaving ? "Saving…" : "Save Queued Ad"}
                </button>
                {(classifiedAd?.next_headline) && (
                  <button
                    onClick={async () => {
                      if (!window.confirm("Clear the queued next ad?")) return;
                      await ClassifiedAd.update(classifiedAd.id, { next_headline: null, next_body: null, next_address: null, next_village: null, next_deal_expires_at: null });
                      await loadClassified(provider.id);
                      setNextAdForm({ headline: "", body: "", address: "", village: "", deal_expires_at: "" });
                      setNextAdSaved(false);
                    }}
                    style={{ background: PAPER, border: "1.5px solid #c00", color: "#c00", borderRadius: 5, padding: "9px 14px", fontSize: 12, cursor: "pointer", fontFamily: SANS }}
                  >Clear Queue</button>
                )}
              </div>
            </div>

          </div>
        )}

        {/* Reviews */}
        <div style={{ ...shS, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span>⭐ V-Hub Reviews</span>
          {!showReviewForm && !reviewSaved && (
            <button onClick={() => setShowReviewForm(true)} style={{ background: BROWN_BTN, color: PAPER, border: "none", borderRadius: 4, padding: "4px 12px", fontSize: 11, cursor: "pointer", fontWeight: 700, fontFamily: SANS, letterSpacing: 1 }}>
              + Leave a Review
            </button>
          )}
        </div>

        {showReviewForm && (
          <div style={{ background: PAPER_MID, border: `1.5px solid ${PAPER_DK}`, borderRadius: 8, padding: "16px 18px", marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 900, color: INK, marginBottom: 12, textTransform: "uppercase", letterSpacing: 1, fontFamily: SERIF }}>Write a Review</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 16px", marginBottom: 10 }}>
              <div><label style={lbS}>Your Name *</label><input style={inS} value={reviewForm.customer_name} onChange={e => setReviewForm(p => ({ ...p, customer_name: e.target.value }))} /></div>
              <div><label style={lbS}>Your Village</label><input style={inS} value={reviewForm.customer_village} onChange={e => setReviewForm(p => ({ ...p, customer_village: e.target.value }))} /></div>
              <div><label style={lbS}>Service Used</label><input style={inS} value={reviewForm.service_used} onChange={e => setReviewForm(p => ({ ...p, service_used: e.target.value }))} /></div>
              <div><label style={lbS}>Rating</label>
                <select style={inS} value={reviewForm.rating} onChange={e => setReviewForm(p => ({ ...p, rating: parseInt(e.target.value) }))}>
                  {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Star{n > 1 ? "s" : ""} {"★".repeat(n)}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={lbS}>Your Review *</label>
              <textarea style={{ ...inS, minHeight: 80, resize: "vertical", lineHeight: 1.6 }} value={reviewForm.review_text} onChange={e => setReviewForm(p => ({ ...p, review_text: e.target.value }))} />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={handleReviewSubmit} style={{ background: `linear-gradient(180deg,#9A6030,${BROWN_BTN})`, color: PAPER, border: `2px solid ${YELLOW}`, borderRadius: 5, padding: "10px 24px", fontSize: 13, fontWeight: 700, cursor: "pointer", letterSpacing: 1, fontFamily: SERIF }}>Submit Review</button>
              <button onClick={() => setShowReviewForm(false)} style={{ background: PAPER, border: `1.5px solid ${PAPER_DK}`, color: INK_FADE, borderRadius: 5, padding: "10px 18px", fontSize: 13, cursor: "pointer", fontFamily: SANS }}>Cancel</button>
            </div>
            <div style={{ fontSize: 11, color: INK_FADE, fontStyle: "italic", marginTop: 8, fontFamily: SANS }}>Reviews appear publicly after admin approval.</div>
          </div>
        )}

        {reviewSaved && (
          <div style={{ background: "#E8F5E9", border: `1.5px solid ${GREEN}`, borderRadius: 6, padding: "12px 16px", marginBottom: 16, fontSize: 13, color: GREEN, fontFamily: SANS }}>
            ✓ Thank you! Your review has been submitted and will appear after approval.
          </div>
        )}

        {reviews.length === 0 && !showReviewForm && (
          <div style={{ fontSize: 13, color: INK_FADE, fontStyle: "italic", padding: "12px 0", marginBottom: 20, fontFamily: SANS }}>No V-Hub reviews yet.</div>
        )}

        {reviews.map(r => (
          <div key={r.id} style={{ background: PAPER_MID, border: `1.5px solid ${PAPER_DK}`, borderRadius: 8, padding: "14px 16px", marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
              <div>
                <span style={{ fontSize: 14, fontWeight: 900, color: INK, fontFamily: SERIF }}>{r.customer_name}</span>
                {r.customer_village && <span style={{ fontSize: 12, color: INK_FADE, fontStyle: "italic", marginLeft: 8, fontFamily: SERIF }}>📍 {r.customer_village}</span>}
              </div>
              <Stars rating={r.rating} size={15} />
            </div>
            {r.service_used && <div style={{ fontSize: 11, color: TEAL, fontWeight: 700, marginBottom: 5, textTransform: "uppercase", letterSpacing: 1, fontFamily: SANS }}>Service: {r.service_used}</div>}
            <div style={{ fontSize: 13, color: INK_FADE, fontStyle: "italic", lineHeight: 1.7, fontFamily: SERIF }}>&ldquo;{r.review_text}&rdquo;</div>
            <div style={{ fontSize: 10, color: INK_FADE, marginTop: 6, fontFamily: SANS }}>
              {new Date(r.created_date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} · V-Hub Verified Review
            </div>
          </div>
        ))}

      </div>

      {/* Footer */}
      <div style={{ textAlign: "center", padding: "14px 16px", borderTop: `2px double ${INK}`, fontSize: 11, color: INK_FADE, fontStyle: "italic", background: PAPER, fontFamily: SERIF }}>
        © 2026 V-Hub · The Villages, Florida · <a href="/" style={{ color: INK_FADE }}>Home</a> · <a href="/Terms" style={{ color: INK_FADE }}>Terms</a> · <a href="/Privacy" style={{ color: INK_FADE }}>Privacy</a> · <a href="mailto:admin@v-hub.us" style={{ color: INK_FADE }}>admin@v-hub.us</a>
      </div>
    </div>
  );
}
