import { useState, useEffect } from "react";
import { ServiceArea, Category, Service, Provider } from "@/api/entities";

const P = {
  paper:    "#E8D9B5",
  paperMid: "#DDD0A0",
  paperDk:  "#C4B080",
  ink:      "#1A0F00",
  inkMid:   "#3A2800",
  inkFade:  "#5C4020",
  orange:   "#B83A08",
  blue:     "#1A3F70",
};

const SECTIONS = [
  { key: "Historic Side | Spanish Springs",         label: "Historic Side",        sub: "Spanish Springs",    color: "#5C2E0E" },
  { key: "Established Villages | North of SR-466A", label: "Established Villages", sub: "North of SR-466A",   color: "#2E4E1A" },
  { key: "Newer Villages | South of SR-44",         label: "Newer Villages",       sub: "South of SR-44",     color: "#1E4E1E" },
  { key: "Eastport | Newest Development Area",      label: "Eastport",             sub: "Newest Development", color: "#1A3060" },
  { key: "Family & Non-Age-Restricted Villages",    label: "Family Villages",      sub: "Non-Age-Restricted", color: "#3A1E5C" },
];

const F1 = "Residents across The Villages continue to seek quality local services. From landscaping to home repair, the demand for trusted neighborhood providers has never been stronger. Local businesses report record inquiries as the community grows. Families and retirees alike depend on reliable service professionals who understand the unique needs of Villages living.";
const F2 = "New listings are added daily as V-Hub grows its network of verified service providers. Whether you need a plumber, a pet sitter, or a personal trainer, The Villages has world-class options right in your backyard. Support local and build the community we all love together every day.";
const F3 = "Community leaders gathered last week to discuss expanded support for local entrepreneurs. The Villages remains one of Florida's fastest-growing communities. With tens of thousands of active residents, local providers enjoy unmatched access to a loyal customer base. No middlemen — just neighbors.";
const F4 = "Trusted providers in The Villages have served the community for decades. From Spanish Springs to Fenney, skilled professionals are ready to serve you. Our verified directory ensures every listing meets community standards. Browse today and discover the talent right in your neighborhood.";
const F5 = "V-Hub makes it simple — search by village, browse by category, and contact providers directly. No fees, no middlemen. Just neighbors helping neighbors across our beloved community each and every day of the year.";

function isVillage(a) { return a.name && a.name.includes("—"); }
function vName(a) { const p = a.name.split("—"); return p.length > 1 ? p[1].trim() : a.name; }
function groupAreas(areas) {
  const g = {}; SECTIONS.forEach(s => (g[s.key] = []));
  areas.filter(isVillage).forEach(a => { if (g[a.description] !== undefined) g[a.description].push(a); });
  return g;
}

// ── tiny serif text block ─────────────────────────────────────────────────────
const Col = ({ text, header, style = {} }) => (
  <div style={style}>
    {header && (
      <div style={{ borderBottom: `2px solid ${P.ink}`, marginBottom: 5, paddingBottom: 3 }}>
        <div style={{ fontWeight: 900, fontSize: 10.5, textTransform: "uppercase", letterSpacing: 1, color: P.ink, lineHeight: 1.25 }}>{header}</div>
      </div>
    )}
    <div style={{ fontSize: 8, color: P.inkFade, lineHeight: 1.8, textAlign: "justify", fontFamily: "'Times New Roman', serif" }}>{text}</div>
  </div>
);

// ── Burger ────────────────────────────────────────────────────────────────────
function Burger({ dark = false }) {
  const [open, setOpen] = useState(false);
  const lc = dark ? P.paper : P.ink;
  const links = [
    { label: "🏠 Home", href: "/", color: "#5C2E0E" },
    { label: "🔍 Find Services", href: "/", color: P.orange },
    { label: "📋 List Your Service", href: "/list-service", color: P.blue },
  ];
  return (
    <>
      <button onClick={() => setOpen(true)} style={{ background: "transparent", border: `1px solid ${lc}55`, borderRadius: 4, padding: "6px 9px", cursor: "pointer", display: "flex", flexDirection: "column", gap: 4, flexShrink: 0 }}>
        {[0,1,2].map(i => <span key={i} style={{ display: "block", width: 17, height: 2, background: lc, borderRadius: 1 }} />)}
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 299, background: "rgba(0,0,0,0.55)" }} />
          <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 240, background: P.paper, zIndex: 300, boxShadow: "-3px 0 18px rgba(0,0,0,0.3)", display: "flex", flexDirection: "column", fontFamily: "'Times New Roman', serif" }}>
            <div style={{ background: P.ink, padding: "14px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ color: P.paper, fontWeight: 900, fontSize: 15, letterSpacing: 3 }}>V-HUB</span>
              <button onClick={() => setOpen(false)} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", borderRadius: 3, width: 24, height: 24, fontSize: 13, cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ padding: "9px 8px", flex: 1 }}>
              {links.map((l, i) => (
                <a key={i} href={l.href} style={{ textDecoration: "none" }}>
                  <div style={{ padding: "11px 12px", borderRadius: 4, fontSize: 13, fontWeight: 700, color: P.ink, marginBottom: 4, background: P.paperMid, borderLeft: `4px solid ${l.color}` }}>{l.label}</div>
                </a>
              ))}
            </div>
            <div style={{ padding: "8px 12px", borderTop: `1px solid ${P.paperDk}`, textAlign: "center", fontSize: 8, color: P.inkFade, fontStyle: "italic" }}>V-HUB · The Villages, FL</div>
          </div>
        </>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function Home() {
  const [areas, setAreas]         = useState([]);
  const [cats, setCats]           = useState([]);
  const [selArea, setSelArea]     = useState(null);
  const [selCat, setSelCat]       = useState("");
  const [vOpen, setVOpen]         = useState(false);
  const [sOpen, setSOpen]         = useState(false);
  const [openSec, setOpenSec]     = useState(null);
  const [results, setResults]     = useState([]);
  const [searched, setSearched]   = useState(false);
  const [selProv, setSelProv]     = useState(null);

  useEffect(() => {
    ServiceArea.filter({ is_active: true }).then(setAreas);
    Category.filter({ is_active: true }).then(setCats);
  }, []);

  const grouped = groupAreas(areas);

  const doSearch = async () => {
    if (!selArea) return;
    const all = await Provider.filter({ is_visible: true });
    const out = all.filter(p =>
      p.service_areas?.includes(selArea.id) &&
      (!selCat || p.category_id === selCat) &&
      (p.subscription_status === "active" || p.subscription_status === "trial")
    );
    out.sort((a, b) => ({ premium:0, featured:1, basic:2 }[a.subscription_tier]??3) - ({ premium:0, featured:1, basic:2 }[b.subscription_tier]??3));
    setResults(out); setSearched(true);
  };

  const reset = () => { setSelArea(null); setSelCat(""); setResults([]); setSearched(false); setSelProv(null); setVOpen(false); setSOpen(false); setOpenSec(null); };
  const closeAll = () => { setVOpen(false); setSOpen(false); };

  if (selProv)  return <ProvDetail prov={selProv} areas={areas} cats={cats} onBack={() => setSelProv(null)} />;
  if (searched) return <Results results={results} areas={areas} cats={cats} onReset={reset} onSel={setSelProv} selArea={selArea} />;

  return (
    <div onClick={closeAll} style={{ minHeight: "100vh", background: P.paper, fontFamily: "'Times New Roman', Georgia, serif", maxWidth: 900, margin: "0 auto", boxShadow: "0 0 40px rgba(0,0,0,0.25)" }}>

      {/* ══ ROW 1 — thin black top bar ══ */}
      <div style={{ background: P.ink, padding: "3px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ color: P.paperMid, fontSize: 8, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Local News</span>
        <span style={{ color: P.paper, fontSize: 9.5, fontWeight: 900, letterSpacing: 3.5, textTransform: "uppercase" }}>The Villages Daily</span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: P.paperMid, fontSize: 7.5, letterSpacing: 1 }}>Serving Our Community · Est. 1985</span>
          <Burger dark={true} />
        </div>
      </div>

      {/* ══ ROW 2 — 3 column subhead + List button ══ */}
      <div style={{ background: P.paper, borderTop: `2px solid ${P.ink}`, borderBottom: `1px solid ${P.ink}` }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1px 1fr 1px 1fr", padding: "6px 14px", gap: 0, alignItems: "center" }}>
          {/* col 1 */}
          <div style={{ paddingRight: 10 }}>
            <div style={{ fontSize: 9, fontWeight: 900, color: P.ink, textTransform: "uppercase", letterSpacing: 1.2 }}>Community Connections</div>
            <div style={{ fontSize: 7.5, color: P.inkFade, fontStyle: "italic" }}>Bringing Local Services to You</div>
          </div>
          <div style={{ background: P.ink, alignSelf: "stretch" }} />
          {/* col 2 */}
          <div style={{ padding: "0 10px", textAlign: "center" }}>
            <div style={{ fontSize: 9, fontWeight: 900, color: P.ink, textTransform: "uppercase", letterSpacing: 1.2 }}>Support Local · Build Community</div>
          </div>
          <div style={{ background: P.ink, alignSelf: "stretch" }} />
          {/* col 3 */}
          <div style={{ paddingLeft: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontSize: 9, fontWeight: 900, color: P.ink, textTransform: "uppercase", letterSpacing: 1.2, lineHeight: 1.3 }}>Your Guide to<br/>The Villages</div>
            <a href="/list-service" style={{ textDecoration: "none" }} onClick={e => e.stopPropagation()}>
              <button style={{ background: P.orange, color: "#fff", border: "none", borderRadius: 3, padding: "5px 10px", fontSize: 8, fontWeight: 900, cursor: "pointer", letterSpacing: 1, textTransform: "uppercase", whiteSpace: "nowrap", boxShadow: "0 2px 6px rgba(0,0,0,0.35)" }}>
                List Your Service
              </button>
            </a>
          </div>
        </div>
      </div>

      {/* ══ ROW 3 — Logo masthead (full width, no box) ══ */}
      <div style={{ background: P.paper, lineHeight: 0 }}>
        <div style={{ height: 2, background: P.ink }} />
        <img
          src="https://base44.app/api/apps/69d062aca815ce8e697894b1/files/mp/public/69d062aca815ce8e697894b1/fa53ca67e_logo_crop.png"
          alt="V-Hub — The Villages Daily"
          style={{ width: "100%", display: "block", filter: "sepia(8%) contrast(1.03)" }}
        />
        <div style={{ height: 2, background: P.ink }} />
        <div style={{ height: 1, background: P.ink, marginTop: 2 }} />
      </div>

      {/* ══ ROW 4 — 3 newspaper columns ══ */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1px 1.5fr 1px 1fr", background: P.paper, minHeight: 320 }}>

        {/* LEFT col */}
        <div style={{ padding: "10px 13px 18px" }}>
          <Col header={"Local Businesses\nStronger Together"} text={F1} />
          <div style={{ height: 1, background: `${P.ink}35`, margin: "9px 0" }} />
          <Col text={F4} />
        </div>

        <div style={{ background: P.ink }} />

        {/* CENTER col — search */}
        <div style={{ padding: "10px 14px 18px" }} onClick={e => e.stopPropagation()}>
          {/* tiny filler above image */}
          <div style={{ fontSize: 7.5, color: P.inkFade, lineHeight: 1.75, textAlign: "justify", marginBottom: 8, fontFamily: "'Times New Roman', serif" }}>{F3.slice(0, 140)}</div>

          {/* sepia tropical photo */}
          <div style={{ overflow: "hidden", height: 90, marginBottom: 10, border: `1px solid ${P.paperDk}` }}>
            <img
              src="https://media.base44.com/images/public/69d062aca815ce8e697894b1/392f3af96_generated_image.png"
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 38%", display: "block", filter: "sepia(75%) contrast(0.85) brightness(0.88)" }}
            />
          </div>

          {/* classified-ad search box */}
          <div style={{ border: `2px solid ${P.ink}`, background: P.paperMid, padding: "10px 11px" }}>
            <div style={{ textAlign: "center", borderBottom: `1px solid ${P.inkMid}60`, paddingBottom: 5, marginBottom: 9 }}>
              <span style={{ fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: 3, color: P.ink, fontFamily: "'Times New Roman', serif" }}>Find Local Services</span>
            </div>

            {/* Service */}
            <div style={{ marginBottom: 7 }}>
              <div style={{ fontSize: 7.5, fontWeight: 700, color: P.inkMid, textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 }}>What service do you need?</div>
              <div style={{ position: "relative" }}>
                <button onClick={e => { e.stopPropagation(); setSOpen(!sOpen); setVOpen(false); }}
                  style={{ width: "100%", background: P.paper, border: `1.5px solid ${P.ink}65`, padding: "6px 9px", fontSize: 12, fontFamily: "'Times New Roman', serif", color: selCat ? P.ink : P.inkFade, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>{selCat ? (cats.find(c => c.id === selCat)?.name || "Select a Service") : "Select a Service"}</span>
                  <span style={{ fontSize: 8, color: P.inkFade }}>▼</span>
                </button>
                {sOpen && (
                  <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: P.paper, border: `1.5px solid ${P.ink}65`, borderTop: "none", zIndex: 100, boxShadow: "0 5px 14px rgba(0,0,0,0.22)", maxHeight: 200, overflowY: "auto" }}>
                    <div onClick={() => { setSelCat(""); setSOpen(false); }} style={{ padding: "7px 9px", cursor: "pointer", fontSize: 11, color: P.inkFade, fontStyle: "italic", borderBottom: `1px solid ${P.paperDk}` }}>All Services</div>
                    {cats.map(c => (
                      <div key={c.id} onClick={() => { setSelCat(c.id); setSOpen(false); }}
                        style={{ padding: "7px 9px", cursor: "pointer", fontSize: 11, color: P.ink, background: selCat === c.id ? P.paperMid : P.paper, borderBottom: `1px solid ${P.paperDk}` }}
                        onMouseEnter={e => e.currentTarget.style.background = P.paperMid}
                        onMouseLeave={e => e.currentTarget.style.background = selCat === c.id ? P.paperMid : P.paper}>
                        {c.icon} {c.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Village */}
            <div style={{ marginBottom: 9 }}>
              <div style={{ fontSize: 7.5, fontWeight: 700, color: P.inkMid, textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 }}>Where do you need it?</div>
              <div style={{ position: "relative" }}>
                <button onClick={e => { e.stopPropagation(); setVOpen(!vOpen); setSOpen(false); }}
                  style={{ width: "100%", background: P.paper, border: `1.5px solid ${P.ink}65`, padding: "6px 9px", fontSize: 12, fontFamily: "'Times New Roman', serif", color: selArea ? P.ink : P.inkFade, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>{selArea ? vName(selArea) : "Select a Village"}</span>
                  <span style={{ fontSize: 8, color: P.inkFade }}>▼</span>
                </button>
                {vOpen && (
                  <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: P.paper, border: `1.5px solid ${P.ink}65`, borderTop: "none", zIndex: 100, boxShadow: "0 5px 14px rgba(0,0,0,0.22)", maxHeight: 260, overflowY: "auto" }}>
                    {SECTIONS.map(sec => {
                      const vils = grouped[sec.key] || [];
                      const isOpen = openSec === sec.key;
                      return (
                        <div key={sec.key}>
                          <div onClick={e => { e.stopPropagation(); setOpenSec(isOpen ? null : sec.key); }}
                            style={{ padding: "7px 9px", cursor: "pointer", fontSize: 10, fontWeight: 700, color: "#fff", background: sec.color, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span>{sec.label} — {sec.sub}</span>
                            <span style={{ fontSize: 8 }}>{isOpen ? "▲" : "▼"}</span>
                          </div>
                          {isOpen && vils.map(v => (
                            <div key={v.id} onClick={e => { e.stopPropagation(); setSelArea(v); setVOpen(false); setOpenSec(null); }}
                              style={{ padding: "6px 18px", cursor: "pointer", fontSize: 11, color: P.ink, background: selArea?.id === v.id ? P.paperMid : P.paper, borderBottom: `1px solid ${P.paperDk}` }}
                              onMouseEnter={e => e.currentTarget.style.background = P.paperMid}
                              onMouseLeave={e => e.currentTarget.style.background = selArea?.id === v.id ? P.paperMid : P.paper}>
                              {vName(v)}
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <button onClick={doSearch} disabled={!selArea}
              style={{ width: "100%", background: selArea ? P.ink : `${P.ink}50`, color: P.paper, border: "none", padding: "9px", fontSize: 13, fontWeight: 900, fontFamily: "'Times New Roman', serif", letterSpacing: 3, textTransform: "uppercase", cursor: selArea ? "pointer" : "not-allowed" }}>
              Find Services
            </button>
          </div>

          <div style={{ fontSize: 7.5, color: P.inkFade, lineHeight: 1.75, textAlign: "justify", marginTop: 7, fontFamily: "'Times New Roman', serif" }}>{F5}</div>
        </div>

        <div style={{ background: P.ink }} />

        {/* RIGHT col */}
        <div style={{ padding: "10px 13px 18px" }}>
          <Col header={"Services You\nCan Trust"} text={F2} />
          <div style={{ height: 1, background: `${P.ink}35`, margin: "9px 0" }} />
          <Col text={F3} />
        </div>
      </div>

      {/* ══ ROW 5 — footer rule ══ */}
      <div style={{ background: P.paper, padding: "4px 14px 10px" }}>
        <div style={{ height: 2, background: P.ink }} />
        <div style={{ height: 1, background: P.ink, marginTop: 2 }} />
        <div style={{ textAlign: "center", marginTop: 5, fontSize: 7.5, color: P.inkFade, fontStyle: "italic", letterSpacing: 1 }}>
          V-HUB · The Villages, FL · Connecting Residents with Trusted Local Providers · All Rights Reserved
        </div>
      </div>
    </div>
  );
}

// ─── Results ──────────────────────────────────────────────────────────────────
function Results({ results, areas, cats, onReset, onSel, selArea }) {
  return (
    <div style={{ minHeight: "100vh", background: P.paper, fontFamily: "'Times New Roman', serif" }}>
      <div style={{ background: P.ink, padding: "9px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button onClick={onReset} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.25)", color: P.paper, borderRadius: 3, padding: "5px 12px", fontSize: 11, cursor: "pointer", fontWeight: 700 }}>← Home</button>
          <span style={{ color: P.paper, fontSize: 16, fontWeight: 900, letterSpacing: 3 }}>V-HUB</span>
        </div>
        <Burger dark={true} />
      </div>
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "18px 14px" }}>
        <div style={{ background: P.paperMid, border: `2px solid ${P.ink}`, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: P.ink }}>
            {results.length > 0 ? `${results.length} Provider${results.length !== 1 ? "s" : ""} Found` : "No Providers Found"}
            {selArea && <span style={{ fontSize: 10, fontStyle: "italic", color: P.inkFade }}> · {vName(selArea)}</span>}
          </span>
          <button onClick={onReset} style={{ background: P.ink, color: P.paper, border: "none", borderRadius: 3, padding: "4px 10px", fontSize: 10, cursor: "pointer", fontWeight: 700 }}>← New Search</button>
        </div>
        {results.length === 0 && (
          <div style={{ textAlign: "center", padding: "32px", background: P.paperMid, border: `1px solid ${P.paperDk}`, color: P.inkFade, fontSize: 13, fontStyle: "italic" }}>
            No providers found for this area yet.<br /><small>Check back soon!</small>
          </div>
        )}
        {results.map(p => <PCard key={p.id} p={p} cats={cats} onClick={() => onSel(p)} />)}
      </div>
    </div>
  );
}

function PCard({ p, cats, onClick }) {
  const cat = cats.find(c => c.id === p.category_id);
  const feat = p.subscription_tier === "premium" || p.subscription_tier === "featured";
  return (
    <div onClick={onClick} style={{ background: P.paper, border: `1px solid ${P.paperDk}`, borderLeft: `4px solid ${feat ? P.orange : P.ink}`, padding: "12px 14px", marginBottom: 8, cursor: "pointer" }}>
      <div style={{ display: "flex", gap: 10, marginBottom: 5 }}>
        {p.logo_url
          ? <img src={p.logo_url} style={{ width: 40, height: 40, borderRadius: 4, objectFit: "cover", filter: "sepia(10%)" }} alt="" />
          : <div style={{ width: 40, height: 40, borderRadius: 4, background: `linear-gradient(135deg, ${P.orange}, #5C2E0E)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, color: "#fff", fontWeight: 700 }}>{p.business_name?.[0] || "?"}</div>}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: P.ink }}>{p.business_name}</div>
          {cat && <div style={{ fontSize: 9.5, color: P.inkFade, fontStyle: "italic" }}>{cat.icon} {cat.name}</div>}
        </div>
        {feat && <div style={{ background: P.orange, color: "#fff", borderRadius: 8, padding: "2px 7px", fontSize: 8, fontWeight: 700, alignSelf: "flex-start" }}>⭐ Featured</div>}
      </div>
      {p.description && <div style={{ fontSize: 10.5, color: P.inkFade, lineHeight: 1.6, fontStyle: "italic" }}>{p.description.slice(0, 100)}{p.description.length > 100 ? "..." : ""}</div>}
      <div style={{ color: P.orange, fontWeight: 700, fontSize: 9.5, textAlign: "right", marginTop: 5 }}>View Details →</div>
    </div>
  );
}

function ProvDetail({ prov, areas, cats, onBack }) {
  const [services, setServices] = useState([]);
  useEffect(() => { Service.filter({ is_active: true }).then(setServices); }, []);
  const cat = cats.find(c => c.id === prov.category_id);
  const pSvcs  = services.filter(s => prov.services?.includes(s.id));
  const pAreas = areas.filter(a => prov.service_areas?.includes(a.id));
  return (
    <div style={{ minHeight: "100vh", background: P.paper, fontFamily: "'Times New Roman', serif" }}>
      <div style={{ background: P.ink, padding: "9px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button onClick={onBack} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.25)", color: P.paper, borderRadius: 3, padding: "5px 12px", fontSize: 11, cursor: "pointer", fontWeight: 700 }}>← Back</button>
          <span style={{ color: P.paper, fontSize: 16, fontWeight: 900, letterSpacing: 3 }}>V-HUB</span>
        </div>
        <Burger dark={true} />
      </div>
      <div style={{ maxWidth: 660, margin: "0 auto", padding: "18px 14px" }}>
        <div style={{ background: P.paperMid, border: `2px solid ${P.ink}`, padding: "18px", marginBottom: 10 }}>
          <div style={{ display: "flex", gap: 12, marginBottom: 10 }}>
            {prov.logo_url
              ? <img src={prov.logo_url} style={{ width: 58, height: 58, borderRadius: 6, objectFit: "cover", filter: "sepia(10%)" }} alt="" />
              : <div style={{ width: 58, height: 58, borderRadius: 6, background: `linear-gradient(135deg,${P.orange},#5C2E0E)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: "#fff", fontWeight: 700 }}>{prov.business_name?.[0] || "?"}</div>}
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: P.ink }}>{prov.business_name}</div>
              {cat && <div style={{ fontSize: 10, color: P.inkFade, fontStyle: "italic" }}>{cat.icon} {cat.name}</div>}
              {prov.years_in_business && <div style={{ fontSize: 9.5, color: P.inkFade }}>{prov.years_in_business} years in business</div>}
            </div>
          </div>
          {prov.description && <div style={{ fontSize: 11, color: P.inkFade, lineHeight: 1.7, fontStyle: "italic" }}>{prov.description}</div>}
        </div>
        <div style={{ background: P.paper, border: `1px solid ${P.paperDk}`, padding: "14px", marginBottom: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: P.ink, borderBottom: `1px solid ${P.paperDk}`, paddingBottom: 5, marginBottom: 8 }}>📞 Contact</div>
          {prov.phone   && <a href={`tel:${prov.phone}`}    style={{ textDecoration: "none" }}><div style={cRow("#5C2E0E")}><span>📱</span><b>{prov.phone}</b></div></a>}
          {prov.email   && <a href={`mailto:${prov.email}`} style={{ textDecoration: "none" }}><div style={cRow(P.blue)}><span>✉️</span><span>{prov.email}</span></div></a>}
          {prov.website && <a href={prov.website.startsWith("http") ? prov.website : `https://${prov.website}`} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}><div style={cRow("#1A3F70")}><span>🌐</span><span>{prov.website}</span></div></a>}
          {!prov.phone && !prov.email && !prov.website && <div style={{ fontSize: 11, fontStyle: "italic", color: P.inkFade }}>No contact info available.</div>}
        </div>
        {pSvcs.length > 0 && (
          <div style={{ background: P.paper, border: `1px solid ${P.paperDk}`, padding: "14px", marginBottom: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: P.ink, borderBottom: `1px solid ${P.paperDk}`, paddingBottom: 5, marginBottom: 8 }}>🛠️ Services</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>{pSvcs.map(s => <span key={s.id} style={{ background: P.ink, color: P.paper, borderRadius: 8, padding: "4px 10px", fontSize: 10 }}>{s.name}</span>)}</div>
          </div>
        )}
        {pAreas.length > 0 && (
          <div style={{ background: P.paper, border: `1px solid ${P.paperDk}`, padding: "14px" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: P.ink, borderBottom: `1px solid ${P.paperDk}`, paddingBottom: 5, marginBottom: 8 }}>📍 Service Areas</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>{pAreas.map(a => <span key={a.id} style={{ background: "#2E4E1A", color: "#fff", borderRadius: 8, padding: "4px 10px", fontSize: 9.5 }}>{vName(a)}</span>)}</div>
          </div>
        )}
      </div>
    </div>
  );
}

const cRow = c => ({ display: "flex", alignItems: "center", gap: 8, background: `${c}10`, border: `1px solid ${c}20`, borderRadius: 3, padding: "7px 10px", marginBottom: 6, color: c, fontSize: 12, fontFamily: "'Times New Roman', serif" });
