import { useState, useEffect, useRef } from "react";
import { Provider, ProviderReview, Service, ServiceArea, Category } from "@/api/entities";

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

// ── Trial / Subscription Banner ───────────────────────────────────────────
function StatusBanner({ provider, onUpgrade, onCancel, paymentLoading, cancelLoading, paymentError }) {
  const status = provider.subscription_status;
  const days = daysLeft(provider.trial_end_date);
  const endFmt = fmt(provider.trial_end_date);

  if (status === "active" || status === "paid") {
    return (
      <div style={{ background: "#E8F5E9", border: "2px solid #4CAF50", borderRadius: 10, padding: "14px 18px", marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <div>
            <div style={{ fontWeight: 900, color: "#1B5E20", fontSize: 14, fontFamily: SERIF }}>✅ Active Subscriber</div>
            <div style={{ fontSize: 12, color: "#2E7D32", fontFamily: SANS, marginTop: 3 }}>
              Your listing is live and visible to residents across The Villages.
            </div>
          </div>
          <button onClick={onCancel} disabled={cancelLoading} style={{ background: "transparent", border: "1.5px solid #888", color: "#666", borderRadius: 6, padding: "7px 16px", fontSize: 12, cursor: cancelLoading ? "default" : "pointer", fontFamily: SANS, opacity: cancelLoading ? 0.6 : 1 }}>
            {cancelLoading ? "Processing…" : "Cancel Subscription"}
          </button>
        </div>
      </div>
    );
  }

  if (status === "trial") {
    const urgent = days !== null && days <= 7;
    const expired = days !== null && days < 0;
    if (expired) {
      return (
        <div style={{ background: "#FFF3E0", border: `2px solid ${RED_RULE}`, borderRadius: 10, padding: "16px 18px", marginBottom: 20 }}>
          <div style={{ fontWeight: 900, color: RED_RULE, fontSize: 15, fontFamily: SERIF, marginBottom: 6 }}>⚠ Your Free Trial Has Ended</div>
          <div style={{ fontSize: 13, color: INK_FADE, fontFamily: SANS, marginBottom: 12, lineHeight: 1.6 }}>
            Your listing is currently <strong>hidden</strong> from search results. Subscribe for $12/month to go live again.
          </div>
          {paymentError && <div style={{ fontSize: 12, color: RED_RULE, marginBottom: 8, fontFamily: SANS }}>{paymentError}</div>}
          <button onClick={onUpgrade} disabled={paymentLoading} style={{ background: `linear-gradient(180deg,#9A6030,${BROWN_BTN})`, color: PAPER, border: `2px solid ${YELLOW}`, borderRadius: 6, padding: "10px 24px", fontWeight: 900, fontSize: 13, cursor: paymentLoading ? "default" : "pointer", fontFamily: SERIF, letterSpacing: 1, opacity: paymentLoading ? 0.7 : 1 }}>
            {paymentLoading ? "Redirecting to Stripe…" : "Subscribe — $12/mo →"}
          </button>
        </div>
      );
    }
    const pct = days !== null ? Math.max(5, Math.min(100, ((45 - days) / 45) * 100)) : 50;
    return (
      <div style={{ background: urgent ? "#FFF3E0" : PAPER_MID, border: `2px solid ${urgent ? "#E65100" : PAPER_DK}`, borderRadius: 10, padding: "16px 18px", marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
          <div style={{ fontWeight: 900, color: urgent ? "#BF360C" : BROWN_BTN, fontSize: 14, fontFamily: SERIF }}>
            {urgent ? `⏰ Trial ends in ${days} day${days !== 1 ? "s" : ""}!` : `🎁 Free Trial Active — ${days} days left`}
          </div>
          <div style={{ fontSize: 12, color: INK_FADE, fontFamily: SANS }}>{endFmt}</div>
        </div>
        <div style={{ background: "#D4C9A0", borderRadius: 4, height: 8, marginBottom: 8 }}>
          <div style={{ background: urgent ? "#E65100" : TEAL, borderRadius: 4, height: 8, width: `${pct}%`, transition: "width 0.5s" }} />
        </div>
        <div style={{ fontSize: 12, color: INK_FADE, fontFamily: SANS, lineHeight: 1.6 }}>
          {urgent
            ? "Set up billing now to keep your listing live. Just $12/month — cancel anytime."
            : `After your trial ends on ${endFmt}, stay listed for just $12/month. Cancel anytime.`}
        </div>
        {urgent && (
          {paymentError && <div style={{ fontSize: 12, color: "#BF360C", marginTop: 6, fontFamily: SANS }}>{paymentError}</div>}
          <button onClick={onUpgrade} disabled={paymentLoading} style={{ marginTop: 10, background: "#E65100", color: "#fff", border: "none", borderRadius: 6, padding: "9px 22px", fontWeight: 700, cursor: paymentLoading ? "default" : "pointer", fontSize: 13, fontFamily: SANS, opacity: paymentLoading ? 0.7 : 1 }}>
            {paymentLoading ? "Redirecting to Stripe…" : "Set Up Billing — $12/mo →"}
          </button>
        )}
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
    <div style={{ background: "#FAFAFA", border: "2px solid #CCC", borderRadius: 10, padding: "14px 18px", marginBottom: 20 }}>
      <div style={{ fontWeight: 900, color: "#555", fontSize: 14, fontFamily: SERIF }}>⏸ Subscription Cancelled</div>
      <div style={{ fontSize: 13, color: INK_FADE, fontFamily: SANS, marginTop: 4, lineHeight: 1.6 }}>Your listing is not currently visible. Contact us to reactivate.</div>
      <button onClick={onUpgrade} disabled={paymentLoading} style={{ marginTop: 10, background: BROWN_BTN, color: PAPER, border: `2px solid ${YELLOW}`, borderRadius: 6, padding: "9px 22px", fontWeight: 700, cursor: paymentLoading ? "default" : "pointer", fontSize: 13, fontFamily: SANS, opacity: paymentLoading ? 0.7 : 1 }}>
        {paymentLoading ? "Redirecting to Stripe…" : "Reactivate — $12/mo →"}
      </button>
    </div>
  );

  return null;
}

// ── Service accordion for edit view ──────────────────────────────────────
const EDIT_CATS = [
  { id: "69d09c14d5ee9e7be9aa301b", name: "🏠 Home Services", svcs: [{ id:"s01",name:"Home Improvements"},{ id:"s02",name:"General Repairs"},{ id:"s03",name:"Cleaning Services"},{ id:"s04",name:"Painting (Interior/Exterior)"},{ id:"s05",name:"Garage Door Services"},{ id:"s06",name:"Window Installation/Repair"},{ id:"s07",name:"HVAC"},{ id:"s08",name:"Plumbing"},{ id:"s09",name:"Roofing"},{ id:"s63",name:"Home Watch"}] },
  { id: "69d181fe57b60e0aecf4067d", name: "💡 Home Systems", svcs: [{ id:"s10",name:"Handyman Services"},{ id:"s11",name:"Security & Home Watch"},{ id:"s12",name:"Pest Control"},{ id:"s13",name:"Appliance Repair"},{ id:"s14",name:"Electrical & Lighting"},{ id:"s15",name:"Flooring (Tile, Wood, Carpet)"},{ id:"s16",name:"Home Organization"},{ id:"s17",name:"Smart Home Installation"},{ id:"s18",name:"Pool & Spa Services"}] },
  { id: "69d09c14d5ee9e7be9aa301c", name: "🌿 Yard & Outdoor", svcs: [{ id:"s19",name:"Lawn Mowing"},{ id:"s20",name:"Sod Installation"},{ id:"s21",name:"Tree Trimming & Pruning/Removal"},{ id:"s22",name:"Lawn Fertilization"},{ id:"s23",name:"Irrigation/Sprinkler Services"},{ id:"s24",name:"Landscaping"},{ id:"s25",name:"Hardscaping"},{ id:"s26",name:"Pressure Washing"},{ id:"s27",name:"Driveway Repair/Cleaning/Painting"},{ id:"s64",name:"Pool & Spa Services"}] },
  { id: "69d09c14d5ee9e7be9aa301d", name: "⛳ Golf Cart", svcs: [{ id:"s28",name:"Rentals"},{ id:"s29",name:"Repairs"},{ id:"s30",name:"Detailing"},{ id:"s31",name:"Lighting Upgrades"},{ id:"s32",name:"Improvements/Customizations"},{ id:"s33",name:"Battery Replacement"},{ id:"s34",name:"Tire Services"}] },
  { id: "69d09c14d5ee9e7be9aa301e", name: "🚗 Auto Services", svcs: [{ id:"s35",name:"Auto Repairs"},{ id:"s36",name:"Auto Detailing"},{ id:"s37",name:"Oil Changes"},{ id:"s38",name:"Tire Services"},{ id:"s39",name:"Mobile Mechanic"}] },
  { id: "69d09c14d5ee9e7be9aa301f", name: "💆 Personal Care", svcs: [{ id:"s40",name:"Hair Stylists"},{ id:"s41",name:"Nail Technicians"},{ id:"s42",name:"Spa Services"},{ id:"s43",name:"Home Health Aides"},{ id:"s44",name:"Massage Therapists"},{ id:"s45",name:"Personal Trainers"},{ id:"s46",name:"Makeup Artists"}] },
  { id: "69d09c14d5ee9e7be9aa3020", name: "🐾 Pet Services", svcs: [{ id:"s47",name:"Veterinary Services"},{ id:"s48",name:"Grooming"},{ id:"s49",name:"Pet Sitting/Walking"},{ id:"s50",name:"Pet Training"},{ id:"s51",name:"Mobile Grooming"}] },
  { id: "69d09c14d5ee9e7be9aa3021", name: "🚐 Transportation", svcs: [{ id:"s52",name:"Medical Transport"},{ id:"s53",name:"Airport Transport"},{ id:"s54",name:"Local Rides"},{ id:"s55",name:"Errand Services"},{ id:"s56",name:"Courier/Delivery Services"},{ id:"s65",name:"Vehicle Transport"}] },
  { id: "69d181fe57b60e0aecf4067e", name: "💼 Professional", svcs: [{ id:"s57",name:"Accounting & Bookkeeping"},{ id:"s58",name:"Notary Services"},{ id:"s59",name:"IT Support"},{ id:"s60",name:"Legal Services"},{ id:"s61",name:"Business Consulting"},{ id:"s62",name:"Tax Preparation"}] },
];

const VILLAGE_LIST = ["Alhambra","Amelia","Ashland","Belle Aire","Belvedere","Bonita","Bonnybrook","Bradford","Briar Meadow","Bridgeport at Creekside Landing","Bridgeport at Lake Miona","Bridgeport at Lake Sumter","Bridgeport at Laurel Valley","Bridgeport at Miona Shores","Bridgeport at Mission Hills","Buttonwood","Calumet Grove","Caroline","Cason Hammock","Charlotte","Chatham","Chitty Chatty","Citrus Grove","Collier","Collier at Alden Bungalows","Collier at Antrim Dells","Country Club Hills","Dabney","De Allende","De La Vista","Del Mar","DeLuna","DeSoto","Dunedin","Duval","El Cortez","Fenney","Fernandina","Gilchrist","Glenbrook","Hacienda","Haciendas of Mission Hills","Hadley","Hammock at Fenney","Hawkins","Hemingway","Hillsborough","La Reynalda","La Zamora","LaBelle","Lake Deaton","Lake Denham","Lakeshore Cottages","Largo","Liberty Park","Linden","Lynnhaven","Mallory Square","Marsh Bend","McClure","Mira Mesa","Monarch Grove","Newell","Orange Blossom Gardens","Osceola Hills","Osceola Hills at Soaring Eagle Preserve","Palo Alto","Pennecamp","Piedmont","Pine Hills","Pine Ridge","Pinellas","Poinciana","Polo Ridge","Richmond","Rio Grande","Rio Ponderosa","Rio Ranchero","Sabal Chase","Sanibel","Santiago","Santo Domingo","Silver Lake","Springdale","St. Catherine","St. Charles","St. James","St. Johns","Summerhill","Sunset Pointe","Tall Trees","Tamarind Grove","Tierra Del Sol","Valle Verde","Virginia Trace","Winifred","Woodbury"];

function SvcAccordion({ selSvcs, setSelSvcs }) {
  const [openCat, setOpenCat] = useState(null);
  const toggle = (id) => setSelSvcs(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  return (
    <div>
      {EDIT_CATS.map(cat => {
        const count = cat.svcs.filter(s => selSvcs.includes(s.id)).length;
        const isOpen = openCat === cat.id;
        return (
          <div key={cat.id} style={{ marginBottom: 4, borderRadius: 5, overflow: "hidden", border: `1.5px solid ${PAPER_DK}` }}>
            <div onClick={() => setOpenCat(isOpen ? null : cat.id)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 13px", background: count > 0 ? `linear-gradient(180deg,#9A6030,${BROWN_BTN})` : `linear-gradient(180deg,${PAPER_MID},${PAPER_DK})`, color: count > 0 ? PAPER : INK, cursor: "pointer", fontWeight: 700, fontSize: 13, fontFamily: SERIF }}>
              <span>{cat.name}{count > 0 ? `  ✓ ${count}` : ""}</span>
              <span style={{ fontSize: 11 }}>{isOpen ? "▲" : "▼"}</span>
            </div>
            {isOpen && (
              <div style={{ background: PAPER }}>
                {cat.svcs.map(svc => {
                  const checked = selSvcs.includes(svc.id);
                  return (
                    <div key={svc.id} onClick={() => toggle(svc.id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 16px", cursor: "pointer", background: checked ? "rgba(122,72,32,0.08)" : "transparent", borderBottom: `1px solid ${PAPER_MID}` }}>
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
    </div>
  );
}

function VillageSelect({ selAreas, setSelAreas }) {
  const [open, setOpen] = useState(false);
  const toggle = (v) => setSelAreas(p => p.includes(v) ? p.filter(a => a !== v) : [...p, v]);
  return (
    <div>
      <div onClick={() => setOpen(o => !o)} style={{ border: `1.5px solid ${PAPER_DK}`, borderRadius: 5, padding: "10px 13px", cursor: "pointer", background: selAreas.length > 0 ? `linear-gradient(180deg,#9A6030,${BROWN_BTN})` : `linear-gradient(180deg,${PAPER_MID},${PAPER_DK})`, color: selAreas.length > 0 ? PAPER : INK, display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 13, fontFamily: SERIF }}>
        <span>📍 {selAreas.length === 0 ? "Select villages..." : `${selAreas.length} village${selAreas.length > 1 ? "s" : ""} selected`}</span>
        <span style={{ fontSize: 11 }}>{open ? "▲" : "▼"}</span>
      </div>
      {open && (
        <div style={{ border: `1.5px solid ${PAPER_DK}`, borderTop: "none", borderRadius: "0 0 5px 5px", maxHeight: 260, overflowY: "auto", background: PAPER }}>
          <div style={{ padding: "6px 10px", borderBottom: `1px solid ${PAPER_DK}`, display: "flex", gap: 8 }}>
            <button onClick={() => setSelAreas(VILLAGE_LIST)} style={{ fontSize: 11, background: TEAL, color: "#fff", border: "none", borderRadius: 4, padding: "4px 10px", cursor: "pointer", fontFamily: SANS }}>Select All</button>
            <button onClick={() => setSelAreas([])} style={{ fontSize: 11, background: "#888", color: "#fff", border: "none", borderRadius: 4, padding: "4px 10px", cursor: "pointer", fontFamily: SANS }}>Clear</button>
          </div>
          {VILLAGE_LIST.map(v => {
            const checked = selAreas.includes(v);
            return (
              <div key={v} onClick={() => toggle(v)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 14px", cursor: "pointer", background: checked ? "rgba(122,72,32,0.08)" : "transparent", borderBottom: `1px solid ${PAPER_MID}` }}>
                <div style={{ width: 16, height: 16, border: `2px solid ${checked ? BROWN_BTN : PAPER_DK}`, borderRadius: 3, background: checked ? BROWN_BTN : PAPER, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {checked && <span style={{ color: PAPER, fontSize: 10 }}>✓</span>}
                </div>
                <span style={{ fontSize: 13, color: INK, fontFamily: SANS }}>{v}</span>
              </div>
            );
          })}
        </div>
      )}
      {selAreas.length > 0 && (
        <div style={{ marginTop: 6, fontSize: 12, color: INK_FADE, fontFamily: SANS, lineHeight: 1.6 }}>
          <strong style={{ color: INK }}>Serving:</strong> {selAreas.join(", ")}
        </div>
      )}
    </div>
  );
}

// ── FORGOT PASSWORD SCREEN ───────────────────────────────────────────────
function ForgotPasswordScreen({ onBack }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e && e.preventDefault();
    if (!email.trim()) { setError("Please enter your email address."); return; }
    setLoading(true); setError("");
    try {
      await fetch("https://api.base44.app/api/apps/69d062aca815ce8e697894b1/functions/requestPasswordReset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      setSent(true);
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
          <div style={{ fontSize: 20, fontWeight: 900, color: INK, letterSpacing: 1, marginBottom: 6, textAlign: "center" }}>Reset Your Password</div>
          <div style={{ fontSize: 13, color: INK_FADE, textAlign: "center", marginBottom: 22, fontFamily: SANS }}>Enter your email and we'll send you a reset link.</div>

          {sent ? (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📬</div>
              <div style={{ fontSize: 15, color: GREEN, fontWeight: 700, marginBottom: 10 }}>Check your inbox!</div>
              <div style={{ fontSize: 13, color: INK_FADE, fontFamily: SANS, lineHeight: 1.6, marginBottom: 20 }}>
                If an account exists for <strong>{email}</strong>, we've sent a password reset link. It expires in 1 hour.
              </div>
              <button onClick={onBack} style={{ background: BROWN_BTN, color: PAPER, border: "none", borderRadius: 8, padding: "11px 24px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: SANS }}>← Back to Sign In</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && <div style={{ background: "#ffeaea", border: "1px solid #c0392b", borderRadius: 6, padding: "8px 12px", fontSize: 13, color: "#c0392b", fontFamily: SANS, marginBottom: 14 }}>{error}</div>}
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: INK_FADE, fontFamily: SANS, textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 6 }}>Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="The email on your V-Hub account"
                  style={{ ...inS, border: `1.5px solid ${BROWN_BTN}`, borderRadius: 8, padding: "12px 14px", fontSize: 15 }}
                  autoFocus
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                style={{ width: "100%", background: loading ? PAPER_DK : `linear-gradient(180deg,#9A6030,${BROWN_BTN} 60%,#5A3010)`, color: PAPER, border: `3px solid ${YELLOW}`, boxShadow: `0 0 0 1.5px ${YELLOW}`, borderRadius: 8, padding: "14px 20px", fontSize: 15, fontWeight: 900, cursor: loading ? "not-allowed" : "pointer", fontFamily: SERIF, letterSpacing: 2, textTransform: "uppercase" }}
              >
                {loading ? "Sending..." : "Send Reset Link →"}
              </button>
              <div style={{ textAlign: "center", marginTop: 16 }}>
                <button type="button" onClick={onBack} style={{ background: "none", border: "none", color: BROWN_BTN, fontSize: 13, cursor: "pointer", fontFamily: SANS, textDecoration: "underline" }}>← Back to Sign In</button>
              </div>
            </form>
          )}
        </div>
      </div>
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

  const handleLogin = async (e) => {
    e && e.preventDefault();
    setError("");
    if (!loginEmail.trim() || !loginPass.trim()) { setError("Please enter your email and password."); return; }
    setLoading(true);
    try {
      // Find provider by login_email (or fall back to business email)
      let results = await Provider.filter({ login_email: loginEmail.trim().toLowerCase() });
      if (!results || results.length === 0) {
        // Fallback: check business email field
        results = await Provider.filter({ email: loginEmail.trim().toLowerCase() });
      }
      if (!results || results.length === 0) {
        setError("No account found with that email. Check your login email or contact admin@v-hub.us");
        setLoading(false);
        return;
      }
      const prov = results[0];
      // Check password
      const storedPass = prov.login_password || "";
      if (!storedPass) {
        setError("Your account was set up by admin and has no password yet. Please email admin@v-hub.us to set up your login credentials.");
        setLoading(false);
        return;
      }
      // Support both legacy plaintext and new hashed passwords
      const hashedInput = await hashPassword(loginPass);
      const isMatch = storedPass === loginPass || storedPass === hashedInput;
      if (!isMatch) {
        setError("Incorrect password. Please try again or contact admin@v-hub.us for help.");
        setLoading(false);
        return;
      }
      // Success — store session in sessionStorage
      sessionStorage.setItem("vhub_provider_id", prov.id);
      onLogin(prov);
    } catch (err) {
      setError("Something went wrong. Please try again.");
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
        <div style={{ fontSize: 13, color: INK_FADE, fontStyle: "italic", fontFamily: SERIF }}>Manage your listing · View stats · Update services &amp; villages</div>
      </div>

      {/* Login card */}
      <div style={{ maxWidth: 460, margin: "40px auto", padding: "0 20px 60px" }}>
        <div style={{ background: PAPER_MID, border: `2px solid ${PAPER_DK}`, borderRadius: 10, padding: "32px 28px", boxShadow: "0 4px 24px rgba(28,15,0,0.10)" }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>🔐</div>
            <div style={{ fontSize: 16, fontWeight: 900, color: INK, textTransform: "uppercase", letterSpacing: 2, fontFamily: SERIF }}>Sign In to Your Hub</div>
            <div style={{ fontSize: 13, color: INK_FADE, fontStyle: "italic", marginTop: 6, lineHeight: 1.6, fontFamily: SERIF }}>
              Use the email &amp; password you chose when you listed your business.
            </div>
          </div>

          {error && (
            <div style={{ background: "#FEE", border: `1.5px solid ${RED_RULE}`, borderRadius: 6, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: RED_RULE, fontFamily: SANS }}>
              ⚠ {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 14 }}>
              <label style={lbS}>Email Address</label>
              <input
                type="email"
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                placeholder="you@example.com"
                style={inS}
                autoComplete="email"
              />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={lbS}>Password</label>
              <div style={{ position: "relative" }}>
                <input
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
export default function ProviderDashboard() {
  useMeta("Provider Hub | V-Hub — The Villages, FL");

  const [provider, setProvider]     = useState(null);
  const [authState, setAuthState]   = useState("loading"); // loading | login | forgot | reset | dashboard
  const [resetToken, setResetToken] = useState("");
  const [resetProviderId, setResetProviderId] = useState("");
  const [view, setView]             = useState("dashboard"); // dashboard | edit | account
  const [reviews, setReviews]       = useState([]);
  const [svcMap, setSvcMap]         = useState({});
  const [areaMap, setAreaMap]       = useState({});

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
  const [cancelLoading, setCancelLoading]   = useState(false);
  const [paymentError, setPaymentError]     = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  // Review form
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewSaved, setReviewSaved]       = useState(false);
  const [reviewForm, setReviewForm]         = useState({ customer_name: "", customer_village: "", rating: 5, review_text: "", service_used: "" });

  // ── Check for existing session on mount ───────────────────────────────
  useEffect(() => {
    const savedId = sessionStorage.getItem("vhub_provider_id");
    if (savedId) {
      Provider.get(savedId)
        .then(p => {
          if (p) {
            setProvider(p);
            seedForm(p);
            setNewLoginEmail(p.login_email || p.email || "");
            loadReviews(p.id);
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
    } else if (paymentResult === "cancelled") {
      // just clear the URL param
      window.history.replaceState({}, "", window.location.pathname);
    }

    // Load entity maps for name resolution
    Service.list().then(svcs => {
      const m = {}; (svcs || []).forEach(s => { m[s.id] = s.name; });
      setSvcMap(m);
    }).catch(() => {});
    ServiceArea.list().then(areas => {
      const m = {}; (areas || []).forEach(a => { m[a.id] = a.name; });
      setAreaMap(m);
    }).catch(() => {});
  }, []);

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
      await Provider.update(provider.id, { ...form, services: selSvcs, service_areas: selAreas });
      const fresh = await Provider.get(provider.id);
      setProvider(fresh);
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
      await Provider.update(provider.id, updates);
      const fresh = await Provider.get(provider.id);
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
      const res = await fetch("https://v-hub-app-edf7f8e8.base44.app/functions/createCheckoutSession", {
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

  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel your V-Hub subscription? Your listing will be hidden at end of billing period.")) return;
    if (!provider.stripe_subscription_id) {
      alert("No active Stripe subscription found. Please contact admin@v-hub.us to cancel.");
      return;
    }
    setCancelLoading(true);
    try {
      const res = await fetch("https://v-hub-app-edf7f8e8.base44.app/functions/cancelSubscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stripe_subscription_id: provider.stripe_subscription_id }),
      });
      const data = await res.json();
      if (data.success) {
        const cancelDate = data.cancel_at ? new Date(data.cancel_at * 1000).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "end of billing period";
        alert(`Your subscription has been cancelled. You will remain listed until ${cancelDate}.`);
        const fresh = await Provider.get(provider.id);
        setProvider(fresh);
      } else {
        alert("Could not cancel. Please contact admin@v-hub.us");
      }
    } catch {
      alert("Connection error. Please contact admin@v-hub.us");
    }
    setCancelLoading(false);
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
        <button onClick={() => setView("dashboard")} style={{ background: "transparent", border: `1.5px solid ${PAPER_DK}`, color: INK_FADE, borderRadius: 6, padding: "7px 16px", fontSize: 12, cursor: "pointer", marginBottom: 20, fontFamily: SANS }}>← Back to Dashboard</button>

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
          <SvcAccordion selSvcs={selSvcs} setSelSvcs={setSelSvcs} />
          {selSvcs.length > 0 && <div style={{ marginTop: 8, fontSize: 12, color: TEAL, fontFamily: SANS }}>✓ {selSvcs.length} service{selSvcs.length > 1 ? "s" : ""} selected</div>}
        </div>

        <div style={shS}>Section 3 — Villages You Serve</div>
        <div style={{ marginBottom: 28 }}>
          <VillageSelect selAreas={selAreas} setSelAreas={setSelAreas} />
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
        <button onClick={() => setView("dashboard")} style={{ background: "transparent", border: `1.5px solid ${PAPER_DK}`, color: INK_FADE, borderRadius: 6, padding: "7px 16px", fontSize: 12, cursor: "pointer", marginBottom: 20, fontFamily: SANS }}>← Back to Dashboard</button>

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
              <div style={{ fontWeight: 900, color: "#1B5E20", fontSize: 15, fontFamily: SERIF }}>Payment Successful — Welcome to V-Hub!</div>
              <div style={{ fontSize: 13, color: "#2E7D32", fontFamily: SANS, marginTop: 3 }}>Your subscription is active. Your listing is now live and visible to residents across The Villages.</div>
            </div>
            <button onClick={() => setPaymentSuccess(false)} style={{ marginLeft: "auto", background: "transparent", border: "none", color: "#888", fontSize: 18, cursor: "pointer" }}>✕</button>
          </div>
        )}
        <StatusBanner provider={provider} onUpgrade={handleUpgrade} onCancel={handleCancel} paymentLoading={paymentLoading} cancelLoading={cancelLoading} paymentError={paymentError} />

        {/* Quick stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 24 }}>
          {[
            ["👁 Profile Views", provider.profile_views ?? 0, TEAL],
            ["🔍 Search Hits", provider.search_appearances ?? 0, BROWN_BTN],
            ["⭐ Reviews", reviews.length, "#B8860B"],
          ].map(([label, val, color]) => (
            <div key={label} style={{ background: PAPER_MID, border: `1.5px solid ${PAPER_DK}`, borderRadius: 8, padding: "14px 10px", textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 900, color, fontFamily: SANS }}>{val}</div>
              <div style={{ fontSize: 11, color: INK_FADE, fontFamily: SANS, marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Trial timeline */}
        {provider.subscription_status === "trial" && days !== null && days >= 0 && (
          <div style={{ background: PAPER_MID, border: `1.5px solid ${PAPER_DK}`, borderRadius: 8, padding: "14px 18px", marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: INK_FADE, fontFamily: SANS, marginBottom: 6 }}>
              <span>Trial started {fmt(provider.trial_start_date)}</span>
              <span>Ends {fmt(provider.trial_end_date)}</span>
            </div>
            <div style={{ background: "#D4C9A0", borderRadius: 4, height: 10 }}>
              <div style={{ background: days <= 7 ? "#E65100" : TEAL, borderRadius: 4, height: 10, width: `${Math.max(5, Math.min(100, ((45 - days) / 45) * 100))}%`, transition: "width 0.5s" }} />
            </div>
            <div style={{ fontSize: 11, color: INK_FADE, fontFamily: SANS, marginTop: 5, textAlign: "center" }}>
              {days} day{days !== 1 ? "s" : ""} remaining of your 45-day free trial
            </div>
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
