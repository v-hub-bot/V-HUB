import { useState, useEffect } from "react";
import { ServiceArea, Category, Service, Provider } from "@/api/entities";

// ── Brand palette ─────────────────────────────────────────────────────────────
const INK       = "#1C0F00";
const INK_FADE  = "#5C3A10";
const PAPER     = "#F0E6C8";
const PAPER_MID = "#E4D5A8";
const PAPER_DK  = "#C8B07A";
const BROWN_BTN = "#7A4820";
const FIND_BTN  = "#3A2008";

// ── Filler text ───────────────────────────────────────────────────────────────
const FILLER = [
  "Residents across The Villages continue to seek quality local services. From landscaping to home repair, the demand for trusted neighborhood providers has never been stronger. Local businesses report record inquiries as the community grows. Families and retirees alike depend on reliable professionals who understand the unique needs of Villages living.",
  "New listings are added daily as V-Hub grows its network of verified service providers. Whether you need a plumber, a pet sitter, or a personal trainer, The Villages has world-class options right in your backyard. Support local and build the community we all cherish.",
  "Community leaders gathered last week to discuss expanded support for local entrepreneurs. The Villages remains one of Florida's fastest-growing communities. With tens of thousands of active residents, local providers enjoy unmatched access to a loyal customer base.",
  "Trusted providers in The Villages have served the community for decades. From Spanish Springs to Fenney, skilled professionals are ready to serve you. Our verified directory ensures every listing meets community standards. Browse today and discover the talent right in your neighborhood.",
  "V-Hub makes discovery simple — search by village, browse by category, and contact providers directly. No fees, no middlemen. Just neighbors helping neighbors across our beloved community each and every day.",
  "Service excellence defines The Villages difference. Providers here understand the lifestyle and needs of active adults. Whether it's technology help, home maintenance, pet care, or personal wellness, you'll find trusted professionals nearby ready to assist.",
];

// ── Village groups ────────────────────────────────────────────────────────────
const SECTIONS = [
  { key: "Historic Side | Spanish Springs",         label: "Historic Side",        sub: "Spanish Springs",    color: "#5C2E0E" },
  { key: "Established Villages | North of SR-466A", label: "Established Villages", sub: "North of SR-466A",   color: "#2E4E1A" },
  { key: "Newer Villages | South of SR-44",         label: "Newer Villages",       sub: "South of SR-44",     color: "#1E4E1E" },
  { key: "Eastport | Newest Development Area",      label: "Eastport",             sub: "Newest Development", color: "#1A3060" },
  { key: "Family & Non-Age-Restricted Villages",    label: "Family Villages",      sub: "Non-Age-Restricted", color: "#3A1E5C" },
];

function isVillage(a) { return a.name && a.name.includes("—"); }
function vName(a) { const p = a.name.split("—"); return p.length > 1 ? p[1].trim() : a.name; }
function groupAreas(areas) {
  const g = {}; SECTIONS.forEach(s => (g[s.key] = []));
  areas.filter(isVillage).forEach(a => { if (g[a.description] !== undefined) g[a.description].push(a); });
  return g;
}

// ── Newspaper column of filler text ──────────────────────────────────────────
function NewsCol({ idx = 0, lines = 2, style = {} }) {
  const text = FILLER.slice(idx, idx + lines).join(" ");
  return (
    <div style={{ fontFamily: "'Times New Roman', Georgia, serif", fontSize: 7.5, color: INK_FADE, lineHeight: 1.85, textAlign: "justify", ...style }}>
      {text}
    </div>
  );
}

// ── Decorative rule ───────────────────────────────────────────────────────────
function Rule({ thick = false, style = {} }) {
  return (
    <div style={{ ...style }}>
      <div style={{ height: thick ? 3 : 1, background: INK }} />
      {thick && <div style={{ height: 1, background: INK, marginTop: 2 }} />}
    </div>
  );
}

// ── Burger menu ───────────────────────────────────────────────────────────────
function Burger() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} style={{ background: "rgba(28,15,0,0.12)", border: `1px solid ${INK}44`, borderRadius: 3, padding: "5px 8px", cursor: "pointer", display: "flex", flexDirection: "column", gap: 3.5, flexShrink: 0 }}>
        {[0,1,2].map(i => <span key={i} style={{ display: "block", width: 16, height: 2, background: INK, borderRadius: 1 }} />)}
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
                { label: "🏠 Home", href: "/", color: "#5C2E0E" },
                { label: "🔍 Find Services", href: "/", color: "#B83A08" },
                { label: "📋 List Your Service", href: "/list-service", color: "#1A3F70" },
              ].map((l, i) => (
                <a key={i} href={l.href} style={{ textDecoration: "none" }}>
                  <div style={{ padding: "10px 12px", borderRadius: 3, fontSize: 13, fontWeight: 700, color: INK, marginBottom: 4, background: PAPER_MID, borderLeft: `4px solid ${l.color}` }}>{l.label}</div>
                </a>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function Home() {
  const [areas, setAreas]     = useState([]);
  const [cats, setCats]       = useState([]);
  const [selArea, setSelArea] = useState(null);
  const [selCat, setSelCat]   = useState("");
  const [vOpen, setVOpen]     = useState(false);
  const [sOpen, setSOpen]     = useState(false);
  const [openSec, setOpenSec] = useState(null);
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [selProv, setSelProv] = useState(null);

  useEffect(() => {
    ServiceArea.filter({ is_active: true }).then(setAreas);
    Category.filter({ is_active: true }).then(setCats);
  }, []);

  const grouped = groupAreas(areas);
  const closeAll = () => { setVOpen(false); setSOpen(false); };

  const doSearch = async () => {
    if (!selArea) return;
    const all = await Provider.filter({ is_visible: true });
    const out = all.filter(p =>
      p.service_areas?.includes(selArea.id) &&
      (!selCat || p.category_id === selCat) &&
      (p.subscription_status === "active" || p.subscription_status === "trial")
    );
    out.sort((a, b) => ({premium:0,featured:1,basic:2}[a.subscription_tier]??3) - ({premium:0,featured:1,basic:2}[b.subscription_tier]??3));
    setResults(out); setSearched(true);
  };

  const reset = () => { setSelArea(null); setSelCat(""); setResults([]); setSearched(false); setSelProv(null); setVOpen(false); setSOpen(false); setOpenSec(null); };

  if (selProv)  return <ProvDetail prov={selProv} areas={areas} cats={cats} onBack={() => setSelProv(null)} />;
  if (searched) return <Results results={results} areas={areas} cats={cats} onReset={reset} onSel={setSelProv} selArea={selArea} />;

  return (
    <div onClick={closeAll} style={{
      minHeight: "100vh",
      background: PAPER,
      backgroundImage: `
        repeating-linear-gradient(0deg, transparent, transparent 27px, rgba(28,15,0,0.04) 27px, rgba(28,15,0,0.04) 28px),
        repeating-linear-gradient(90deg, transparent, transparent 27px, rgba(28,15,0,0.02) 27px, rgba(28,15,0,0.02) 28px)
      `,
      fontFamily: "'Times New Roman', Georgia, serif",
      maxWidth: 860,
      margin: "0 auto",
      boxShadow: "0 2px 40px rgba(0,0,0,0.28)",
    }}>

      {/* ════════════════════════════════════════════════════════
          HEADER — Palm tree, V-Hub, tagline, nav
      ════════════════════════════════════════════════════════ */}
      <div style={{ position: "relative", padding: "16px 18px 12px", borderBottom: `2px solid ${INK}`, textAlign: "center" }}>
        {/* Centered title + tagline */}
        <div style={{ fontSize: 58, fontWeight: 900, color: INK, letterSpacing: -1, lineHeight: 1, fontFamily: "'Times New Roman', serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <span style={{ fontSize: 50 }}>🌴</span>
          <span>V-Hub</span>
        </div>
        <div style={{ fontSize: 12, fontStyle: "italic", color: INK_FADE, marginTop: 5, letterSpacing: 0.3 }}>
          Connecting You to Local Services in The Villages!
        </div>

        {/* Absolutely positioned right — List button + burger */}
        <div style={{ position: "absolute", top: "50%", right: 18, transform: "translateY(-50%)", display: "flex", alignItems: "center", gap: 8 }} onClick={e => e.stopPropagation()}>
          <a href="/list-service" style={{ textDecoration: "none" }}>
            <button style={{
              background: `linear-gradient(180deg, #9A6030 0%, ${BROWN_BTN} 50%, #5A3010 100%)`,
              color: "#F5E8CC",
              border: `1px solid #3A1800`,
              borderRadius: 5,
              padding: "8px 14px",
              fontSize: 11,
              fontWeight: 700,
              fontFamily: "'Times New Roman', serif",
              cursor: "pointer",
              letterSpacing: 0.5,
              boxShadow: "0 2px 6px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15)",
              whiteSpace: "nowrap",
            }}>
              List Your Service
            </button>
          </a>
          <Burger />
        </div>
      </div>

      <Rule thick style={{ margin: "0 0 0" }} />

      {/* ════════════════════════════════════════════════════════
          SECTION HEADERS — LOCAL SERVICES | CLASSIFIEDS
      ════════════════════════════════════════════════════════ */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1px 1fr", background: PAPER_MID }}>
        <div style={{ textAlign: "center", padding: "5px 0" }}>
          <span style={{ fontSize: 13, fontWeight: 900, letterSpacing: 3, textTransform: "uppercase", color: INK }}>Local Services</span>
        </div>
        <div style={{ background: INK }} />
        <div style={{ textAlign: "center", padding: "5px 0" }}>
          <span style={{ fontSize: 13, fontWeight: 900, letterSpacing: 3, textTransform: "uppercase", color: INK }}>Classifieds</span>
        </div>
      </div>

      <Rule />

      {/* ════════════════════════════════════════════════════════
          TROPICAL BANNER IMAGE — full width
      ════════════════════════════════════════════════════════ */}
      <div style={{ height: 140, overflow: "hidden", lineHeight: 0 }}>
        <img
          src="https://media.base44.com/images/public/69d062aca815ce8e697894b1/392f3af96_generated_image.png"
          alt=""
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 35%", display: "block", filter: "sepia(50%) contrast(0.9) brightness(0.92) saturate(1.1)" }}
        />
      </div>

      <Rule />

      {/* ════════════════════════════════════════════════════════
          BODY — 3 newspaper columns
          Left col | center search | right col
      ════════════════════════════════════════════════════════ */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1px 1.6fr 1px 1fr" }}>

        {/* ── Left column ── */}
        <div style={{ padding: "10px 14px 20px" }}>
          <NewsCol idx={0} lines={2} />
          <div style={{ height: 1, background: `${INK}30`, margin: "9px 0" }} />
          <NewsCol idx={3} lines={1} />
          <div style={{ height: 1, background: `${INK}30`, margin: "9px 0" }} />
          <NewsCol idx={5} lines={1} />
        </div>

        <div style={{ background: INK }} />

        {/* ── Center column — search ── */}
        <div style={{ padding: "12px 16px 20px" }} onClick={e => e.stopPropagation()}>

          {/* Small filler above search */}
          <NewsCol idx={2} lines={1} style={{ marginBottom: 12, fontSize: 8 }} />

          {/* ── Search panel ── */}
          <div style={{ border: `1.5px solid ${INK}`, background: PAPER_MID }}>
            {/* Labels row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: `1px solid ${INK}` }}>
              <div style={{ padding: "5px 10px", borderRight: `1px solid ${INK}` }}>
                <div style={{ fontSize: 8.5, fontWeight: 700, color: INK_FADE, textTransform: "uppercase", letterSpacing: 1 }}>What service do you need?</div>
              </div>
              <div style={{ padding: "5px 10px" }}>
                <div style={{ fontSize: 8.5, fontWeight: 700, color: INK_FADE, textTransform: "uppercase", letterSpacing: 1 }}>Where do you need it?</div>
              </div>
            </div>

            {/* Dropdowns row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: `1px solid ${INK}` }}>
              {/* Service dropdown */}
              <div style={{ borderRight: `1px solid ${INK}`, position: "relative" }}>
                <button onClick={e => { e.stopPropagation(); setSOpen(!sOpen); setVOpen(false); }}
                  style={{ width: "100%", background: PAPER, border: "none", padding: "8px 10px", fontSize: 12, fontFamily: "'Times New Roman', serif", color: selCat ? INK : INK_FADE, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: 0 }}>
                  <span>{selCat ? (cats.find(c => c.id === selCat)?.name || "Select a Service") : "Select a Service"}</span>
                  <span style={{ fontSize: 9, color: INK_FADE, flexShrink: 0 }}>▼</span>
                </button>
                {sOpen && (
                  <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: PAPER, border: `1.5px solid ${INK}`, borderTop: "none", zIndex: 100, boxShadow: "0 5px 16px rgba(0,0,0,0.25)", maxHeight: 220, overflowY: "auto" }}>
                    <div onClick={() => { setSelCat(""); setSOpen(false); }} style={{ padding: "7px 10px", cursor: "pointer", fontSize: 11, color: INK_FADE, fontStyle: "italic", borderBottom: `1px solid ${PAPER_DK}` }}>All Services</div>
                    {cats.map(c => (
                      <div key={c.id} onClick={() => { setSelCat(c.id); setSOpen(false); }}
                        style={{ padding: "7px 10px", cursor: "pointer", fontSize: 12, color: INK, background: selCat === c.id ? PAPER_MID : PAPER, borderBottom: `1px solid ${PAPER_DK}` }}
                        onMouseEnter={e => e.currentTarget.style.background = PAPER_MID}
                        onMouseLeave={e => e.currentTarget.style.background = selCat === c.id ? PAPER_MID : PAPER}>
                        {c.icon} {c.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Village dropdown */}
              <div style={{ position: "relative" }}>
                <button onClick={e => { e.stopPropagation(); setVOpen(!vOpen); setSOpen(false); }}
                  style={{ width: "100%", background: PAPER, border: "none", padding: "8px 10px", fontSize: 12, fontFamily: "'Times New Roman', serif", color: selArea ? INK : INK_FADE, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>{selArea ? vName(selArea) : "Select a Village"}</span>
                  <span style={{ fontSize: 9, color: INK_FADE, flexShrink: 0 }}>▼</span>
                </button>
                {vOpen && (
                  <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: PAPER, border: `1.5px solid ${INK}`, borderTop: "none", zIndex: 100, boxShadow: "0 5px 16px rgba(0,0,0,0.25)", maxHeight: 280, overflowY: "auto" }}>
                    {SECTIONS.map(sec => {
                      const vils = grouped[sec.key] || [];
                      const isOpen = openSec === sec.key;
                      return (
                        <div key={sec.key}>
                          <div onClick={e => { e.stopPropagation(); setOpenSec(isOpen ? null : sec.key); }}
                            style={{ padding: "7px 10px", cursor: "pointer", fontSize: 10, fontWeight: 700, color: "#fff", background: sec.color, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span>{sec.label} — {sec.sub}</span>
                            <span style={{ fontSize: 8 }}>{isOpen ? "▲" : "▼"}</span>
                          </div>
                          {isOpen && vils.map(v => (
                            <div key={v.id} onClick={e => { e.stopPropagation(); setSelArea(v); setVOpen(false); setOpenSec(null); }}
                              style={{ padding: "6px 18px", cursor: "pointer", fontSize: 12, color: INK, background: selArea?.id === v.id ? PAPER_MID : PAPER, borderBottom: `1px solid ${PAPER_DK}` }}
                              onMouseEnter={e => e.currentTarget.style.background = PAPER_MID}
                              onMouseLeave={e => e.currentTarget.style.background = selArea?.id === v.id ? PAPER_MID : PAPER}>
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

            {/* FIND SERVICES button */}
            <button onClick={doSearch} disabled={!selArea}
              style={{ width: "100%", background: selArea ? FIND_BTN : `${FIND_BTN}80`, color: "#F0E6C8", border: "none", padding: "11px", fontSize: 13, fontWeight: 900, fontFamily: "'Times New Roman', serif", letterSpacing: 4, textTransform: "uppercase", cursor: selArea ? "pointer" : "not-allowed", boxShadow: selArea ? "inset 0 1px 0 rgba(255,255,255,0.08)" : "none" }}>
              Find Services
            </button>
          </div>

          {/* Filler below */}
          <NewsCol idx={4} lines={1} style={{ marginTop: 10, fontSize: 8 }} />
        </div>

        <div style={{ background: INK }} />

        {/* ── Right column ── */}
        <div style={{ padding: "10px 14px 20px" }}>
          <NewsCol idx={1} lines={2} />
          <div style={{ height: 1, background: `${INK}30`, margin: "9px 0" }} />
          <NewsCol idx={4} lines={1} />
          <div style={{ height: 1, background: `${INK}30`, margin: "9px 0" }} />
          <NewsCol idx={5} lines={1} />
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════ */}
      <Rule thick />
      <div style={{ textAlign: "center", padding: "5px 14px 8px", fontSize: 8, color: INK_FADE, fontStyle: "italic", letterSpacing: 0.8 }}>
        V-HUB · The Villages, FL · Connecting Residents with Trusted Local Providers · All Rights Reserved
      </div>
    </div>
  );
}

// ─── Results Page ─────────────────────────────────────────────────────────────
function Results({ results, areas, cats, onReset, onSel, selArea }) {
  return (
    <div style={{ minHeight: "100vh", background: PAPER, fontFamily: "'Times New Roman', serif", maxWidth: 860, margin: "0 auto", boxShadow: "0 2px 40px rgba(0,0,0,0.28)" }}>
      {/* Header bar */}
      <div style={{ background: INK, padding: "8px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button onClick={onReset} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.25)", color: PAPER, borderRadius: 3, padding: "5px 12px", fontSize: 11, cursor: "pointer", fontWeight: 700 }}>← Home</button>
          <span style={{ color: PAPER, fontSize: 16, fontWeight: 900, letterSpacing: 2 }}>🌴 V-HUB</span>
        </div>
        <Burger />
      </div>
      <Rule thick />
      <div style={{ maxWidth: 660, margin: "0 auto", padding: "18px 14px" }}>
        <div style={{ background: PAPER_MID, border: `2px solid ${INK}`, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: INK }}>
            {results.length > 0 ? `${results.length} Provider${results.length !== 1 ? "s" : ""} Found` : "No Providers Found"}
            {selArea && <span style={{ fontSize: 10, fontStyle: "italic", color: INK_FADE }}> · {vName(selArea)}</span>}
          </span>
          <button onClick={onReset} style={{ background: INK, color: PAPER, border: "none", borderRadius: 3, padding: "4px 10px", fontSize: 10, cursor: "pointer", fontWeight: 700 }}>← New Search</button>
        </div>
        {results.length === 0 && (
          <div style={{ textAlign: "center", padding: "32px", background: PAPER_MID, border: `1px solid ${PAPER_DK}`, color: INK_FADE, fontSize: 13, fontStyle: "italic" }}>
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
    <div onClick={onClick} style={{ background: PAPER, border: `1px solid ${PAPER_DK}`, borderLeft: `4px solid ${feat ? BROWN_BTN : INK}`, padding: "12px 14px", marginBottom: 8, cursor: "pointer" }}>
      <div style={{ display: "flex", gap: 10, marginBottom: 5 }}>
        {p.logo_url
          ? <img src={p.logo_url} style={{ width: 40, height: 40, borderRadius: 4, objectFit: "cover", filter: "sepia(10%)" }} alt="" />
          : <div style={{ width: 40, height: 40, borderRadius: 4, background: `linear-gradient(135deg, ${BROWN_BTN}, #3A1800)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, color: "#fff", fontWeight: 700 }}>{p.business_name?.[0] || "?"}</div>}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: INK }}>{p.business_name}</div>
          {cat && <div style={{ fontSize: 9.5, color: INK_FADE, fontStyle: "italic" }}>{cat.icon} {cat.name}</div>}
        </div>
        {feat && <div style={{ background: BROWN_BTN, color: "#F5E8CC", borderRadius: 8, padding: "2px 7px", fontSize: 8, fontWeight: 700 }}>⭐ Featured</div>}
      </div>
      {p.description && <div style={{ fontSize: 10.5, color: INK_FADE, lineHeight: 1.6, fontStyle: "italic" }}>{p.description.slice(0, 100)}{p.description.length > 100 ? "..." : ""}</div>}
      <div style={{ color: BROWN_BTN, fontWeight: 700, fontSize: 9.5, textAlign: "right", marginTop: 5 }}>View Details →</div>
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
    <div style={{ minHeight: "100vh", background: PAPER, fontFamily: "'Times New Roman', serif", maxWidth: 860, margin: "0 auto", boxShadow: "0 2px 40px rgba(0,0,0,0.28)" }}>
      <div style={{ background: INK, padding: "8px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button onClick={onBack} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.25)", color: PAPER, borderRadius: 3, padding: "5px 12px", fontSize: 11, cursor: "pointer", fontWeight: 700 }}>← Back</button>
          <span style={{ color: PAPER, fontSize: 16, fontWeight: 900, letterSpacing: 2 }}>🌴 V-HUB</span>
        </div>
        <Burger />
      </div>
      <Rule thick />
      <div style={{ maxWidth: 660, margin: "0 auto", padding: "18px 14px" }}>
        <div style={{ background: PAPER_MID, border: `2px solid ${INK}`, padding: "18px", marginBottom: 10 }}>
          <div style={{ display: "flex", gap: 12, marginBottom: 10 }}>
            {prov.logo_url
              ? <img src={prov.logo_url} style={{ width: 58, height: 58, borderRadius: 6, objectFit: "cover", filter: "sepia(10%)" }} alt="" />
              : <div style={{ width: 58, height: 58, borderRadius: 6, background: `linear-gradient(135deg,${BROWN_BTN},#3A1800)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: "#fff", fontWeight: 700 }}>{prov.business_name?.[0] || "?"}</div>}
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: INK }}>{prov.business_name}</div>
              {cat && <div style={{ fontSize: 10, color: INK_FADE, fontStyle: "italic" }}>{cat.icon} {cat.name}</div>}
              {prov.years_in_business && <div style={{ fontSize: 9.5, color: INK_FADE }}>{prov.years_in_business} years in business</div>}
            </div>
          </div>
          {prov.description && <div style={{ fontSize: 11, color: INK_FADE, lineHeight: 1.7, fontStyle: "italic" }}>{prov.description}</div>}
        </div>
        <div style={{ background: PAPER, border: `1px solid ${PAPER_DK}`, padding: "14px", marginBottom: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: INK, borderBottom: `1px solid ${PAPER_DK}`, paddingBottom: 5, marginBottom: 8 }}>📞 Contact</div>
          {prov.phone   && <a href={`tel:${prov.phone}`}    style={{ textDecoration:"none" }}><CRow color={BROWN_BTN}><span>📱</span><b>{prov.phone}</b></CRow></a>}
          {prov.email   && <a href={`mailto:${prov.email}`} style={{ textDecoration:"none" }}><CRow color="#1A3F70"><span>✉️</span><span>{prov.email}</span></CRow></a>}
          {prov.website && <a href={prov.website.startsWith("http") ? prov.website : `https://${prov.website}`} target="_blank" rel="noreferrer" style={{ textDecoration:"none" }}><CRow color="#1A3F70"><span>🌐</span><span>{prov.website}</span></CRow></a>}
          {!prov.phone && !prov.email && !prov.website && <div style={{ fontSize: 11, fontStyle: "italic", color: INK_FADE }}>No contact info available.</div>}
        </div>
        {pSvcs.length > 0 && (
          <div style={{ background: PAPER, border: `1px solid ${PAPER_DK}`, padding: "14px", marginBottom: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: INK, borderBottom: `1px solid ${PAPER_DK}`, paddingBottom: 5, marginBottom: 8 }}>🛠️ Services</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>{pSvcs.map(s => <span key={s.id} style={{ background: INK, color: PAPER, borderRadius: 8, padding: "4px 10px", fontSize: 10 }}>{s.name}</span>)}</div>
          </div>
        )}
        {pAreas.length > 0 && (
          <div style={{ background: PAPER, border: `1px solid ${PAPER_DK}`, padding: "14px" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: INK, borderBottom: `1px solid ${PAPER_DK}`, paddingBottom: 5, marginBottom: 8 }}>📍 Service Areas</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>{pAreas.map(a => <span key={a.id} style={{ background: "#2E4E1A", color: "#fff", borderRadius: 8, padding: "4px 10px", fontSize: 9.5 }}>{vName(a)}</span>)}</div>
          </div>
        )}
      </div>
    </div>
  );
}

function CRow({ color, children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, background: `${color}10`, border: `1px solid ${color}20`, borderRadius: 3, padding: "7px 10px", marginBottom: 6, color, fontSize: 12, fontFamily: "'Times New Roman', serif" }}>
      {children}
    </div>
  );
}
