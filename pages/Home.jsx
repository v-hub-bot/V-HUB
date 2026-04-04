import { useState, useEffect, useRef } from "react";
import { ServiceArea, Category, Service, Provider } from "@/api/entities";

const INK       = "#1C0F00";
const INK_FADE  = "#5C3A10";
const PAPER     = "#F0E6C8";
const PAPER_MID = "#E4D5A8";
const PAPER_DK  = "#C8B07A";
const BROWN_BTN = "#7A4820";
const BROWN_HL  = "#6B3010";
const YELLOW    = "#FFDB00";

// Newspaper stories — each has headline, subhead, paragraphs
const STORIES = {
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
    ]
  },
  homeServices: {
    headline: "HOME SERVICES AT YOUR DOOR",
    subhead: "From repairs to landscaping — trusted pros serve every village",
    body: [
      "Whether you need a leaky faucet fixed, windows replaced, or your lawn trimmed before the weekend, V-Hub connects you with licensed, vetted professionals across every neighborhood.",
      "Categories include Home Repair, Landscaping, Cleaning, Pet Care, Tech Help, Transportation, and Personal Assistance. Find the right provider for your village today.",
    ]
  },
};

const SECTIONS = [
  { key: "Historic Side | Spanish Springs",         label: "Historic Side" },
  { key: "Established Villages | North of SR-466A", label: "Established Villages" },
  { key: "Newer Villages | South of SR-44",         label: "Newer Villages" },
  { key: "Eastport | Newest Development Area",      label: "Eastport" },
  { key: "Family & Non-Age-Restricted Villages",    label: "Family Villages" },
];

function isVillage(a) { return a.name && a.name.includes("—"); }
function vName(a) { const p = a.name.split("—"); return p.length > 1 ? p[1].trim() : a.name; }
function groupAreas(areas) {
  const g = {};
  SECTIONS.forEach(s => { g[s.key] = []; });
  areas.filter(isVillage).forEach(a => {
    if (g[a.description] !== undefined) g[a.description].push(a);
  });
  return g;
}

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

function Burger() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} style={{ background: "rgba(28,15,0,0.12)", border: `1px solid ${INK}44`, borderRadius: 4, width: 40, height: 40, cursor: "pointer", display: "flex", flexDirection: "column", gap: 5, justifyContent: "center", alignItems: "center", flexShrink: 0, padding: 0, boxSizing: "border-box" }}>
        {[0,1,2].map(i => <span key={i} style={{ display: "block", width: 18, height: 2, background: INK, borderRadius: 1 }} />)}
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 299, background: "rgba(0,0,0,0.55)" }} />
          <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 235, background: PAPER, zIndex: 300, boxShadow: "-3px 0 20px rgba(0,0,0,0.3)", fontFamily: "'Times New Roman', serif" }}>
            <div style={{ background: INK, padding: "13px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ color: PAPER, fontWeight: 900, fontSize: 14, letterSpacing: 2 }}>🌴 V-HUB</span>
              <button onClick={() => setOpen(false)} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", borderRadius: 3, width: 22, height: 22, fontSize: 12, cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ padding: "8px 7px" }}>
              {[
                { label: "🏠 Home", href: "/" },
                { label: "📋 List Your Service", href: "/list-service" },
              ].map((l, i) => (
                <a key={i} href={l.href} style={{ textDecoration: "none" }}>
                  <div style={{ padding: "10px 12px", borderRadius: 3, fontSize: 13, fontWeight: 700, color: INK, marginBottom: 4, background: PAPER_MID, borderLeft: `4px solid ${BROWN_BTN}` }}>{l.label}</div>
                </a>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}

// ── Provider Detail ───────────────────────────────────────────────────────────
function ProvDetail({ prov, areas, cats, onBack }) {
  const pAreas = areas.filter(a => prov.service_areas?.includes(a.id));
  const cat = cats.find(c => c.id === prov.category_id);
  return (
    <div style={{ minHeight: "100vh", background: PAPER, fontFamily: "'Times New Roman', serif", maxWidth: 860, margin: "0 auto", boxShadow: "0 2px 40px rgba(0,0,0,0.28)" }}>
      <div style={{ background: INK, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
        <button onClick={onBack} style={{ background: "rgba(255,255,255,0.15)", border: "none", color: PAPER, borderRadius: 3, padding: "4px 10px", fontSize: 12, cursor: "pointer" }}>← Back</button>
        <span style={{ color: PAPER, fontWeight: 700, fontSize: 13, letterSpacing: 1 }}>Provider Detail</span>
      </div>
      <div style={{ padding: "16px" }}>
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 14 }}>
          {prov.logo_url && <img src={prov.logo_url} alt="logo" style={{ width: 64, height: 64, borderRadius: 6, objectFit: "cover", border: `1px solid ${PAPER_DK}` }} />}
          <div>
            <div style={{ fontSize: 20, fontWeight: 900, color: INK }}>{prov.business_name}</div>
            {cat && <div style={{ fontSize: 12, color: INK_FADE, marginTop: 2 }}>{cat.icon} {cat.name}</div>}
            {prov.rating && <div style={{ fontSize: 13, color: "#B8860B", marginTop: 2 }}>{"★".repeat(Math.round(prov.rating))} {prov.rating}/5</div>}
          </div>
        </div>
        <Rule thick style={{ marginBottom: 10 }} />
        {prov.description && <p style={{ fontSize: 13, color: INK, lineHeight: 1.7, marginBottom: 12 }}>{prov.description}</p>}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
          {prov.phone && <div style={{ fontSize: 12, color: INK }}><b>📞 Phone:</b> {prov.phone}</div>}
          {prov.email && <div style={{ fontSize: 12, color: INK }}><b>✉️ Email:</b> {prov.email}</div>}
          {prov.website && <div style={{ fontSize: 12, color: INK }}><b>🌐 Website:</b> <a href={prov.website} target="_blank" rel="noreferrer" style={{ color: "#1A3F70" }}>{prov.website}</a></div>}
          {prov.years_in_business && <div style={{ fontSize: 12, color: INK }}><b>📅 Years:</b> {prov.years_in_business}</div>}
        </div>
        {pAreas.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: INK_FADE, textTransform: "uppercase", letterSpacing: 1, marginBottom: 5 }}>Service Areas</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {pAreas.map(a => <span key={a.id} style={{ background: PAPER_MID, border: `1px solid ${PAPER_DK}`, borderRadius: 3, padding: "2px 8px", fontSize: 11, color: INK }}>{vName(a)}</span>)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Results ───────────────────────────────────────────────────────────────────
function Results({ results, areas, cats, onReset, onSel, selArea, selCatId }) {
  // selCatId is now the full Service object
  return (
    <div style={{ minHeight: "100vh", background: PAPER, fontFamily: "'Times New Roman', serif", maxWidth: 860, margin: "0 auto", boxShadow: "0 2px 40px rgba(0,0,0,0.28)" }}>
      <div style={{ background: INK, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
        <button onClick={onReset} style={{ background: "rgba(255,255,255,0.15)", border: "none", color: PAPER, borderRadius: 3, padding: "4px 10px", fontSize: 12, cursor: "pointer" }}>← Back</button>
        <span style={{ color: PAPER, fontWeight: 700, fontSize: 13, letterSpacing: 1 }}>
          {selCatId ? selCatId.name : "All Services"}{selArea ? ` · ${vName(selArea)}` : ""}
        </span>
      </div>
      <div style={{ padding: "14px" }}>
        <div style={{ fontSize: 11, color: INK_FADE, marginBottom: 10, fontStyle: "italic" }}>
          {results.length} provider{results.length !== 1 ? "s" : ""} found
        </div>
        {results.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px", color: INK_FADE, fontSize: 14 }}>
            No providers found for this search. Try a different village or service.
          </div>
        ) : results.map(p => {
          const pCat = cats.find(c => c.id === p.category_id);
          return (
            <div key={p.id} onClick={() => onSel(p)}
              style={{ background: PAPER_MID, borderRadius: 4, padding: "12px 14px", marginBottom: 10, border: `1px solid ${PAPER_DK}`, cursor: "pointer" }}>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                {p.logo_url && <img src={p.logo_url} alt="" style={{ width: 44, height: 44, borderRadius: 4, objectFit: "cover", flexShrink: 0 }} />}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 900, color: INK }}>{p.business_name}</div>
                  {pCat && <div style={{ fontSize: 11, color: INK_FADE }}>{pCat.icon} {pCat.name}</div>}
                  {p.phone && <div style={{ fontSize: 12, color: INK, marginTop: 3 }}>📞 {p.phone}</div>}
                  {p.subscription_tier === "featured" && <span style={{ background: BROWN_BTN, color: PAPER, borderRadius: 3, padding: "1px 7px", fontSize: 10, fontWeight: 700, marginTop: 3, display: "inline-block" }}>⭐ FEATURED</span>}
                  {p.subscription_tier === "premium" && <span style={{ background: INK, color: YELLOW, borderRadius: 3, padding: "1px 7px", fontSize: 10, fontWeight: 700, marginTop: 3, display: "inline-block" }}>👑 PREMIUM</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Dropdown Button ───────────────────────────────────────────────────────────
function DropBtn({ label, isOpen, onClick }) {
  return (
    <button onClick={onClick} style={{
      width: "100%", background: PAPER,
      border: `3px solid ${YELLOW}`,
      boxShadow: `0 0 0 1.5px ${YELLOW}, 0 0 10px 2px rgba(255,220,0,0.35)`,
      borderRadius: 5, padding: "10px 12px", fontSize: 13,
      fontFamily: "'Times New Roman', serif",
      color: (label.startsWith("Select") || label === "Select a Service...") ? INK_FADE : INK,
      fontWeight: label.startsWith("Select") ? 400 : 700,
      cursor: "pointer", display: "flex", justifyContent: "space-between",
      alignItems: "center", textAlign: "left", boxSizing: "border-box",
    }}>
      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "85%" }}>{label}</span>
      <span style={{ fontSize: 10, flexShrink: 0, marginLeft: 4 }}>{isOpen ? "▲" : "▼"}</span>
    </button>
  );
}

// ── Service Dropdown ──────────────────────────────────────────────────────────
function SvcDropdown({ open, cats, svcs, openCat, selSvc, setOpenCat, setSelSvc, setSOpen }) {
  if (!open) return null;
  return (
    <div onClick={e => e.stopPropagation()} style={{ position: "absolute", top: "100%", left: 0, right: 0, background: PAPER, border: `2px solid ${INK}`, borderRadius: 4, zIndex: 99999, boxShadow: "0 8px 28px rgba(0,0,0,0.4)", maxHeight: 300, overflowY: "auto", marginTop: 2 }}>
      {cats.length === 0 && <div style={{ padding: 12, fontSize: 12, color: INK_FADE }}>Loading...</div>}
      {cats.map(c => {
        const catSvcs = svcs.filter(s => s.category_id === c.id);
        const isExpanded = openCat === c.id;
        const parentSelected = selSvc?.category_id === c.id;
        return (
          <div key={c.id}>
            <div onClick={e => { e.stopPropagation(); setOpenCat(isExpanded ? null : c.id); }}
              style={{ padding: "10px 14px", fontSize: 13, fontWeight: 700, color: parentSelected ? "#fff" : INK, background: parentSelected ? BROWN_HL : PAPER, borderBottom: `1px solid ${PAPER_DK}`, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>{c.icon} {c.name}</span>
              <span style={{ fontSize: 10 }}>{isExpanded ? "▲" : "▼"}</span>
            </div>
            {isExpanded && catSvcs.map(s => {
              const isSvcSelected = selSvc?.id === s.id;
              return (
                <div key={s.id}
                  onClick={e => { e.stopPropagation(); setSelSvc(s); setSOpen(false); setOpenCat(null); }}
                  style={{ padding: "9px 14px 9px 30px", fontSize: 12, color: isSvcSelected ? "#fff" : INK, background: isSvcSelected ? BROWN_HL : PAPER_MID, borderBottom: `1px solid ${PAPER_DK}`, cursor: "pointer", fontWeight: isSvcSelected ? 700 : 400 }}>
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

// ── Village Dropdown ──────────────────────────────────────────────────────────
function VilDropdown({ open, grouped, openSec, selArea, setOpenSec, setSelArea, setVOpen }) {
  if (!open) return null;
  return (
    <div onClick={e => e.stopPropagation()} style={{ position: "absolute", top: "100%", left: 0, right: 0, background: PAPER, border: `2px solid ${INK}`, borderRadius: 4, zIndex: 99999, boxShadow: "0 8px 28px rgba(0,0,0,0.4)", maxHeight: 300, overflowY: "auto", marginTop: 2 }}>
      {SECTIONS.map(sec => {
        const vils = grouped[sec.key] || [];
        const isExpanded = openSec === sec.key;
        const secSelected = selArea && vils.some(v => v.id === selArea.id);
        return (
          <div key={sec.key}>
            <div onClick={e => { e.stopPropagation(); setOpenSec(isExpanded ? null : sec.key); }}
              style={{ padding: "10px 14px", fontSize: 13, fontWeight: 600, color: secSelected ? "#fff" : INK, background: secSelected ? BROWN_HL : PAPER, borderBottom: `1px solid ${PAPER_DK}`, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>{sec.label}</span>
              <span style={{ fontSize: 9 }}>{isExpanded ? "▲" : "▼"}</span>
            </div>
            {isExpanded && vils.map(v => (
              <div key={v.id} onClick={e => { e.stopPropagation(); setSelArea(v); setVOpen(false); setOpenSec(null); }}
                style={{ padding: "9px 14px 9px 28px", fontSize: 13, color: selArea?.id === v.id ? "#fff" : INK, background: selArea?.id === v.id ? BROWN_HL : PAPER_MID, borderBottom: `1px solid ${PAPER_DK}`, cursor: "pointer" }}>
                {vName(v)}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

// ── Search Box ────────────────────────────────────────────────────────────────
function SearchBox({ cats, svcs, grouped, onSearch }) {
  const [selSvc,  setSelSvc]  = useState(null);   // selected Service (subcategory)
  const [selArea, setSelArea] = useState(null);
  const [sOpen,   setSOpen]   = useState(false);
  const [vOpen,   setVOpen]   = useState(false);
  const [openCat, setOpenCat] = useState(null);
  const [openSec, setOpenSec] = useState(null);
  const sBtnRef = useRef(null);
  const vBtnRef = useRef(null);

  const closeAll = () => { setSOpen(false); setVOpen(false); };

  // Build display label: show selected service name
  const svcLabel = selSvc ? selSvc.name : "Select a Service...";

  return (
    <div onClick={closeAll} style={{ background: PAPER_MID, border: `2px solid ${PAPER_DK}`, borderRadius: 6, padding: "14px 12px", width: "100%", boxSizing: "border-box" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 5 }}>
        <div style={{ flex: 1, fontSize: 11, fontWeight: 700, color: INK, fontFamily: "'Times New Roman', serif" }}>What service do you need?</div>
        <div style={{ flex: 1, fontSize: 11, fontWeight: 700, color: INK, fontFamily: "'Times New Roman', serif" }}>Where do you need it?</div>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <div style={{ flex: 1, minWidth: 0, position: "relative" }} ref={sBtnRef}>
          <DropBtn label={svcLabel} isOpen={sOpen} onClick={e => { e.stopPropagation(); setSOpen(!sOpen); setVOpen(false); }} />
          <SvcDropdown open={sOpen} cats={cats} svcs={svcs} openCat={openCat} selSvc={selSvc} setOpenCat={setOpenCat} setSelSvc={s => { setSelSvc(s); }} setSOpen={setSOpen} />
        </div>
        <div style={{ flex: 1, minWidth: 0, position: "relative" }} ref={vBtnRef}>
          <DropBtn label={selArea ? vName(selArea) : "Select a Villa..."} isOpen={vOpen} onClick={e => { e.stopPropagation(); setVOpen(!vOpen); setSOpen(false); }} />
          <VilDropdown open={vOpen} grouped={grouped} openSec={openSec} selArea={selArea} setOpenSec={setOpenSec} setSelArea={a => { setSelArea(a); }} setVOpen={setVOpen} />
        </div>
      </div>
      <button onClick={e => { e.stopPropagation(); onSearch(selSvc, selArea); }} style={{
        width: "100%", background: `linear-gradient(180deg,#9A6030,${BROWN_BTN} 60%,#5A3010)`,
        border: `3px solid ${YELLOW}`, boxShadow: `0 0 0 1.5px ${YELLOW}, 0 0 10px 2px rgba(255,220,0,0.35)`,
        borderRadius: 5, color: "#F5E8CC", fontFamily: "'Times New Roman', serif",
        fontWeight: 700, fontSize: 14, letterSpacing: 3, padding: "13px", cursor: "pointer", boxSizing: "border-box",
      }}>
        FIND SERVICES
      </button>
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

  useEffect(() => {
    ServiceArea.filter({ is_active: true }).then(setAreas);
    Category.filter({ is_active: true }).then(setCats);
    Service.filter({ is_active: true }).then(setSvcs);
  }, []);

  const grouped = groupAreas(areas);

  const doSearch = async (selSvc, selArea) => {
    setSelAreaR(selArea);
    setSelCatR(selSvc);  // store the service object for display in Results header
    const all = await Provider.filter({ is_visible: true });
    const out = all.filter(p => {
      const areaMatch = !selArea || p.service_areas?.includes(selArea.id);
      // Match by specific service ID in provider's services array, OR by category if no services listed
      const svcMatch  = !selSvc  || 
        (p.services?.includes(selSvc.id)) ||
        (!p.services?.length && p.category_id === selSvc.category_id);
      return areaMatch && svcMatch;
    });
    out.sort((a, b) => {
      const tier = { premium: 0, featured: 1, basic: 2 };
      return (tier[a.subscription_tier] ?? 3) - (tier[b.subscription_tier] ?? 3);
    });
    setResults(out);
    setSearched(true);
  };

  const reset = () => {
    setResults([]); setSearched(false); setSelProv(null);
    setSelAreaR(null); setSelCatR(null);
  };

  // Newspaper typography
  const hd  = { margin: "0 0 2px 0", fontWeight: 900, fontSize: 9, textTransform: "uppercase", letterSpacing: 1, color: INK, fontFamily: "'Times New Roman', serif" };
  const sub = { margin: "0 0 5px 0", fontStyle: "italic", fontSize: 8, color: BROWN_BTN, fontFamily: "'Times New Roman', serif", lineHeight: 1.4 };
  const para = { margin: "0 0 7px 0", fontSize: 8.5, color: INK_FADE, fontFamily: "'Times New Roman', serif", lineHeight: 1.9, textAlign: "justify" };
  const rule = { height: 1, background: INK_FADE, margin: "8px 0", opacity: 0.4 };

  if (selProv)  return <ProvDetail prov={selProv} areas={areas} cats={cats} onBack={() => setSelProv(null)} />;
  if (searched) return <Results results={results} areas={areas} cats={cats} onReset={reset} onSel={setSelProv} selArea={selAreaR} selCatId={selCatR} />;

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
            {/* Left: palm tree — fixed 40x40 to match burger width exactly */}
            <span style={{ fontSize: 34, lineHeight: 1, flexShrink: 0, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center" }}>🌴</span>
            {/* Center: V-Hub title */}
            <span style={{ flex: 1, textAlign: "center", fontSize: 52, fontWeight: 900, color: INK, fontFamily: "'Times New Roman', serif", letterSpacing: -1, lineHeight: 1 }}>
              <span style={{ fontStyle: "italic", fontWeight: 400, fontFamily: "'Great Vibes', cursive", fontSize: "1.2em", color: BROWN_BTN }}>V</span>
              <span>-Hub</span>
            </span>
            {/* Right: burger — same size as palm */}
            <div style={{ flexShrink: 0 }}><Burger /></div>
          </div>
          {/* Tagline */}
          <div style={{ fontSize: 13, fontStyle: "italic", color: INK_FADE, textAlign: "center", margin: "6px 0 10px" }}>
            Connecting You to Local Services in The Villages!
          </div>
          {/* List Your Service button */}
          <div style={{ textAlign: "center" }}>
            <a href="/list-service" style={{ textDecoration: "none" }}>
              <button style={{ background: `linear-gradient(180deg,#9A6030,${BROWN_BTN} 60%,#5A3010)`, color: "#F5E8CC", border: "none", borderRadius: 5, padding: "9px 28px", fontSize: 13, fontWeight: 700, fontFamily: "'Times New Roman', serif", letterSpacing: 2, cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.3)" }}>
                List Your Service
              </button>
            </a>
          </div>
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
          style={{ width: "100%", height: 200, objectFit: "cover", objectPosition: "center", display: "block" }}
        />

        <Rule />

        {/* ── NEWSPAPER BODY ── */}
        <div className="np-grid">

          {/* ── LEFT COLUMN ── */}
          <div className="np-side-left np-col">
            {/* Story 1 */}
            <p style={hd}>{STORIES.neighborhoodWatch.headline}</p>
            <p style={sub}>{STORIES.neighborhoodWatch.subhead}</p>
            {STORIES.neighborhoodWatch.body.map((p,i) => <p key={i} style={para}>{p}</p>)}
            <div style={rule} />
            {/* Story 2 */}
            <p style={hd}>{STORIES.growthStory.headline}</p>
            <p style={sub}>{STORIES.growthStory.subhead}</p>
            {STORIES.growthStory.body.map((p,i) => <p key={i} style={para}>{p}</p>)}
          </div>

          {/* ── CENTER COLUMN ── */}
          <div className="np-center">
            {/* Story above search — visible on mobile too */}
            <p style={hd}>{STORIES.howItWorks.headline}</p>
            <p style={sub}>{STORIES.howItWorks.subhead}</p>
            {STORIES.howItWorks.body.map((p,i) => <p key={i} style={{...para, marginBottom: 10}}>{p}</p>)}

            {/* Search box */}
            <SearchBox cats={cats} svcs={svcs} grouped={grouped} onSearch={doSearch} />

            {/* Story below search */}
            <div style={{ marginTop: 12 }}>
              <p style={hd}>{STORIES.homeServices.headline}</p>
              <p style={sub}>{STORIES.homeServices.subhead}</p>
              {STORIES.homeServices.body.map((p,i) => <p key={i} style={para}>{p}</p>)}
            </div>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="np-side-right np-col">
            {/* Story 1 */}
            <p style={hd}>{STORIES.providerSpotlight.headline}</p>
            <p style={sub}>{STORIES.providerSpotlight.subhead}</p>
            {STORIES.providerSpotlight.body.map((p,i) => <p key={i} style={para}>{p}</p>)}
            <div style={rule} />
            {/* Classifieds */}
            <p style={hd}>{STORIES.classifieds.headline}</p>
            <p style={sub}>{STORIES.classifieds.subhead}</p>
            {STORIES.classifieds.body.map((p,i) => <p key={i} style={{...para, borderBottom: `1px dotted ${PAPER_DK}`, paddingBottom: 5}}>{p}</p>)}
          </div>

        </div>

        <Rule style={{ marginTop: 8 }} />

        {/* Footer */}
        <div style={{ padding: "10px 14px", textAlign: "center", fontSize: 10, color: INK_FADE, fontStyle: "italic" }}>
          © V-Hub · The Villages, Florida · All rights reserved
        </div>

      </div>
    </>
  );
}
