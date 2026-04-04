import { useState, useEffect } from "react";
import { ServiceArea, Category, Service, Provider } from "@/api/entities";

const INK       = "#1C0F00";
const INK_FADE  = "#5C3A10";
const PAPER     = "#F0E6C8";
const PAPER_MID = "#E4D5A8";
const PAPER_DK  = "#C8B07A";
const BROWN_BTN = "#7A4820";
const BROWN_HL  = "#6B3010";
const YELLOW    = "#FFDB00";

const FILLER = [
  "Residents across The Villages seek quality local services every day. From landscaping to home repair, demand for trusted neighborhood providers has never been stronger. Local businesses report record inquiries as the community grows. Families and retirees depend on reliable professionals who understand the Villages lifestyle.",
  "Trusted providers in The Villages have served the community for decades. From Spanish Springs to Fenney, skilled professionals are ready to serve you. Our verified directory ensures every listing meets community standards. Browse today and discover the talent right in your neighborhood.",
  "New listings are added daily as V-Hub grows its network of verified providers. Whether you need a plumber, a pet sitter, or a personal trainer, The Villages has world-class options right in your backyard. Support local businesses and build the community we all cherish.",
  "Community leaders gathered last week to discuss expanded support for local entrepreneurs. The Villages remains one of Florida's fastest-growing communities, drawing new residents every year. With tens of thousands of active members, local providers enjoy unmatched access to a loyal customer base.",
  "V-Hub makes discovery simple — search by village, browse by category, and contact providers directly. No fees, no middlemen, no hassle. Just neighbors helping neighbors across our beloved community every single day. Find your trusted provider and experience the difference.",
  "Service excellence defines The Villages. Providers here understand the lifestyle and needs of active adults. Whether it's technology help, home maintenance, pet care, or personal wellness, you'll find trusted professionals nearby ready to assist whenever you need them.",
];

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

function NewsCol({ idx = 0, lines = 2, style = {} }) {
  const text = FILLER.slice(idx, idx + lines).join(" ");
  return (
    <div style={{ fontFamily: "'Times New Roman', Georgia, serif", fontSize: 7.5, color: INK_FADE, lineHeight: 1.85, textAlign: "justify", ...style }}>
      {text}
    </div>
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
  const cat = cats.find(c => c.id === selCatId);
  return (
    <div style={{ minHeight: "100vh", background: PAPER, fontFamily: "'Times New Roman', serif", maxWidth: 860, margin: "0 auto", boxShadow: "0 2px 40px rgba(0,0,0,0.28)" }}>
      {/* Header */}
      <div style={{ background: INK, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
        <button onClick={onReset} style={{ background: "rgba(255,255,255,0.15)", border: "none", color: PAPER, borderRadius: 3, padding: "4px 10px", fontSize: 12, cursor: "pointer" }}>← Back</button>
        <span style={{ color: PAPER, fontWeight: 700, fontSize: 13, letterSpacing: 1 }}>
          {cat ? cat.name : "All Services"}{selArea ? ` · ${vName(selArea)}` : ""}
        </span>
      </div>
      {/* Results */}
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
              style={{ background: PAPER, border: `1px solid ${PAPER_DK}`, borderRadius: 5, padding: "12px 14px", marginBottom: 10, cursor: "pointer", display: "flex", gap: 12, alignItems: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.1)" }}>
              {p.logo_url
                ? <img src={p.logo_url} alt="logo" style={{ width: 52, height: 52, borderRadius: 5, objectFit: "cover", flexShrink: 0, border: `1px solid ${PAPER_DK}` }} />
                : <div style={{ width: 52, height: 52, borderRadius: 5, background: PAPER_MID, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{pCat?.icon || "🏠"}</div>
              }
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 900, color: INK, marginBottom: 2 }}>{p.business_name}</div>
                {pCat && <div style={{ fontSize: 11, color: INK_FADE }}>{pCat.icon} {pCat.name}</div>}
                {p.rating && <div style={{ fontSize: 12, color: "#B8860B" }}>{"★".repeat(Math.round(p.rating))} {p.rating}/5</div>}
                {p.phone && <div style={{ fontSize: 11, color: INK_FADE, marginTop: 2 }}>📞 {p.phone}</div>}
              </div>
              <span style={{ fontSize: 20, color: PAPER_DK, flexShrink: 0 }}>›</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Dropdown button (yellow border, burnt brown) ──────────────────────────────
function DropBtn({ label, isOpen, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        background: PAPER,
        border: `3px solid ${YELLOW}`,
        boxShadow: `0 0 0 1.5px ${YELLOW}, 0 0 10px 2px rgba(255,220,0,0.35)`,
        borderRadius: 5,
        padding: "10px 12px",
        fontSize: 13,
        fontFamily: "'Times New Roman', serif",
        color: label.startsWith("Select") ? INK_FADE : INK,
        fontWeight: label.startsWith("Select") ? 400 : 700,
        cursor: "pointer",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        textAlign: "left",
      }}>
      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "85%" }}>{label}</span>
      <span style={{ fontSize: 10, flexShrink: 0, marginLeft: 4 }}>{isOpen ? "▲" : "▼"}</span>
    </button>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Home() {
  const [areas,    setAreas]    = useState([]);
  const [cats,     setCats]     = useState([]);
  const [svcs,     setSvcs]     = useState([]);
  const [selArea,  setSelArea]  = useState(null);   // ServiceArea object
  const [selCat,   setSelCat]   = useState(null);   // Category object
  const [sOpen,    setSOpen]    = useState(false);
  const [vOpen,    setVOpen]    = useState(false);
  const [openCat,  setOpenCat]  = useState(null);
  const [openSec,  setOpenSec]  = useState(null);
  const [results,  setResults]  = useState([]);
  const [searched, setSearched] = useState(false);
  const [selProv,  setSelProv]  = useState(null);

  useEffect(() => {
    ServiceArea.filter({ is_active: true }).then(setAreas);
    Category.filter({ is_active: true }).then(setCats);
    Service.filter({ is_active: true }).then(setSvcs);
  }, []);

  const grouped = groupAreas(areas);

  // Flat village list for display (all villages across all sections)
  const allVillages = areas.filter(isVillage).sort((a, b) => vName(a).localeCompare(vName(b)));

  const closeAll = () => { setSOpen(false); setVOpen(false); };

  const doSearch = async () => {
    closeAll();
    const all = await Provider.filter({ is_visible: true });
    const out = all.filter(p => {
      const areaMatch = !selArea || p.service_areas?.includes(selArea.id);
      const catMatch  = !selCat  || p.category_id === selCat.id;
      return areaMatch && catMatch;
    });
    out.sort((a, b) => {
      const tier = { premium: 0, featured: 1, basic: 2 };
      return (tier[a.subscription_tier] ?? 3) - (tier[b.subscription_tier] ?? 3);
    });
    setResults(out);
    setSearched(true);
  };

  const reset = () => {
    setSelArea(null); setSelCat(null);
    setResults([]); setSearched(false); setSelProv(null);
    setOpenCat(null); setOpenSec(null);
    closeAll();
  };

  if (selProv)  return <ProvDetail prov={selProv} areas={areas} cats={cats} onBack={() => setSelProv(null)} />;
  if (searched) return <Results results={results} areas={areas} cats={cats} onReset={reset} onSel={setSelProv} selArea={selArea} selCatId={selCat?.id} />;

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap" rel="stylesheet" />

      <div
        onClick={closeAll}
        style={{ minHeight: "100vh", background: PAPER, backgroundImage: `repeating-linear-gradient(0deg,transparent,transparent 27px,rgba(28,15,0,0.04) 27px,rgba(28,15,0,0.04) 28px)`, fontFamily: "'Times New Roman', Georgia, serif", maxWidth: 860, margin: "0 auto", boxShadow: "0 2px 40px rgba(0,0,0,0.28)" }}>

        {/* ── MASTHEAD ── */}
        <div style={{ background: PAPER, padding: "14px 14px 8px", position: "relative", textAlign: "center" }}>
          <div style={{ position: "absolute", top: 14, right: 14 }}><Burger /></div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 4 }}>
            <span style={{ fontSize: 38, lineHeight: 1 }}>🌴🌴</span>
            <span style={{ fontSize: 52, fontWeight: 900, color: INK, fontFamily: "'Times New Roman', serif", letterSpacing: -1, lineHeight: 1 }}>
              <span style={{ fontStyle: "italic", fontWeight: 400, fontFamily: "'Great Vibes', cursive", fontSize: "1.2em", color: BROWN_BTN }}>V</span>
              <span>-Hub</span>
            </span>
          </div>
          <div style={{ fontSize: 13, fontStyle: "italic", color: INK_FADE, marginBottom: 10 }}>
            Connecting You to Local Services in The Villages!
          </div>
          <a href="/list-service" style={{ textDecoration: "none" }}>
            <button style={{ background: `linear-gradient(180deg,#9A6030,${BROWN_BTN} 60%,#5A3010)`, color: "#F5E8CC", border: "none", borderRadius: 5, padding: "9px 28px", fontSize: 13, fontWeight: 700, fontFamily: "'Times New Roman', serif", letterSpacing: 2, cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.3)" }}>
              List Your Service
            </button>
          </a>
        </div>

        <Rule thick />

        {/* NAV */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", background: PAPER }}>
          <div style={{ padding: "8px", textAlign: "center", borderRight: `1px solid ${INK}`, fontSize: 11, fontWeight: 700, letterSpacing: 2, color: INK, textTransform: "uppercase" }}>Local Services</div>
          <div style={{ padding: "8px", textAlign: "center", fontSize: 11, fontWeight: 700, letterSpacing: 2, color: INK, textTransform: "uppercase" }}>Classifieds</div>
        </div>

        <Rule />

        {/* PHOTO */}
        <img src="https://media.base44.com/images/public/69d062aca815ce8e697894b1/2b4566a86_lakesum.jpg" alt="Lake Sumter Landing"
          style={{ width: "100%", height: 160, objectFit: "cover", display: "block" }}
          onError={e => { e.target.style.display = "none"; }} />

        <Rule />

        {/* ── THREE COLUMN BODY ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.8fr 1fr", gap: 0 }}>

          {/* Left */}
          <div style={{ padding: "12px 10px", borderRight: `1px solid ${INK}` }}>
            <NewsCol idx={0} lines={2} />
          </div>

          {/* Centre — search */}
          <div style={{ padding: "12px 14px", borderRight: `1px solid ${INK}` }}>
            <NewsCol idx={2} lines={1} style={{ marginBottom: 12, fontSize: 8 }} />

            {/* ══ SEARCH PANEL ══ */}
            <div onClick={e => e.stopPropagation()} style={{ border: `2px solid ${INK}`, borderRadius: 5, background: PAPER_MID, padding: "8px 8px 10px" }}>

              {/* Labels row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 4 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: INK, fontFamily: "'Times New Roman', serif" }}>What service do you need?</div>
                <div style={{ fontSize: 9, fontWeight: 700, color: INK, fontFamily: "'Times New Roman', serif" }}>Where do you need it?</div>
              </div>

              {/* Buttons + open dropdowns row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, position: "relative" }}>

                {/* ── SERVICE column ── */}
                <div style={{ position: "relative" }}>
                  <DropBtn
                    label={selCat ? selCat.name : "Select a Service"}
                    isOpen={sOpen}
                    onClick={e => { e.stopPropagation(); setSOpen(o => !o); setVOpen(false); }}
                  />
                  {sOpen && (
                    <div
                      onClick={e => e.stopPropagation()}
                      style={{
                        position: "absolute",
                        top: "calc(100% + 3px)",
                        left: 0,
                        right: 0,
                        background: PAPER,
                        border: `2px solid ${INK}`,
                        borderRadius: 4,
                        zIndex: 9999,
                        boxShadow: "0 8px 28px rgba(0,0,0,0.4)",
                        maxHeight: 300,
                        overflowY: "auto",
                      }}>
                      <div
                        onClick={() => { setSelCat(null); setOpenCat(null); setSOpen(false); }}
                        style={{ padding: "9px 12px", fontSize: 11, color: INK_FADE, fontStyle: "italic", borderBottom: `1px solid ${PAPER_DK}`, cursor: "pointer", background: !selCat ? PAPER_MID : PAPER }}>
                        — All Services —
                      </div>
                      {cats.map(c => {
                        const catSvcs = svcs.filter(s => s.category_id === c.id);
                        const isExpanded = openCat === c.id;
                        return (
                          <div key={c.id}>
                            {/* Category header row */}
                            <div
                              onClick={e => { e.stopPropagation(); setOpenCat(isExpanded ? null : c.id); }}
                              style={{
                                padding: "10px 12px",
                                fontSize: 12,
                                fontWeight: 700,
                                color: "#fff",
                                background: selCat?.id === c.id ? BROWN_HL : "#5C2E0E",
                                borderBottom: `1px solid rgba(255,255,255,0.12)`,
                                cursor: "pointer",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}>
                              <span>{c.icon} {c.name}</span>
                              <span style={{ fontSize: 9 }}>{isExpanded ? "▲" : "▼"}</span>
                            </div>
                            {/* Subcategory rows */}
                            {isExpanded && catSvcs.map(s => (
                              <div
                                key={s.id}
                                onClick={e => { e.stopPropagation(); setSelCat(c); setSOpen(false); setOpenCat(null); }}
                                style={{
                                  padding: "9px 12px 9px 22px",
                                  fontSize: 12,
                                  color: selCat?.id === c.id ? "#fff" : INK,
                                  background: selCat?.id === c.id ? BROWN_HL : PAPER,
                                  borderBottom: `1px solid ${PAPER_DK}`,
                                  cursor: "pointer",
                                }}>
                                {s.name}
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* ── VILLAGE column ── */}
                <div style={{ position: "relative" }}>
                  <DropBtn
                    label={selArea ? vName(selArea) : "Select a Village"}
                    isOpen={vOpen}
                    onClick={e => { e.stopPropagation(); setVOpen(o => !o); setSOpen(false); }}
                  />
                  {vOpen && (
                    <div
                      onClick={e => e.stopPropagation()}
                      style={{
                        position: "absolute",
                        top: "calc(100% + 3px)",
                        left: 0,
                        right: 0,
                        background: PAPER,
                        border: `2px solid ${INK}`,
                        borderRadius: 4,
                        zIndex: 9999,
                        boxShadow: "0 8px 28px rgba(0,0,0,0.4)",
                        maxHeight: 300,
                        overflowY: "auto",
                      }}>
                      <div
                        onClick={() => { setSelArea(null); setOpenSec(null); setVOpen(false); }}
                        style={{ padding: "9px 12px", fontSize: 11, color: INK_FADE, fontStyle: "italic", borderBottom: `1px solid ${PAPER_DK}`, cursor: "pointer", background: !selArea ? PAPER_MID : PAPER }}>
                        — All Villages —
                      </div>
                      {SECTIONS.map(sec => {
                        const vils = grouped[sec.key] || [];
                        const isExpanded = openSec === sec.key;
                        const secColors = { "Historic Side | Spanish Springs": "#5C2E0E", "Established Villages | North of SR-466A": "#2E4E1A", "Newer Villages | South of SR-44": "#1E4E1E", "Eastport | Newest Development Area": "#1A3060", "Family & Non-Age-Restricted Villages": "#3A1E5C" };
                        const hdrColor = secColors[sec.key] || "#5C2E0E";
                        return (
                          <div key={sec.key}>
                            <div
                              onClick={e => { e.stopPropagation(); setOpenSec(isExpanded ? null : sec.key); }}
                              style={{ padding: "10px 12px", fontSize: 12, fontWeight: 700, color: "#fff", background: hdrColor, borderBottom: "1px solid rgba(255,255,255,0.12)", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <span>{sec.label}</span>
                              <span style={{ fontSize: 9 }}>{isExpanded ? "▲" : "▼"}</span>
                            </div>
                            {isExpanded && vils.map(v => (
                              <div
                                key={v.id}
                                onClick={e => { e.stopPropagation(); setSelArea(v); setVOpen(false); setOpenSec(null); }}
                                style={{ padding: "9px 12px 9px 22px", fontSize: 12, color: selArea?.id === v.id ? "#fff" : INK, background: selArea?.id === v.id ? BROWN_HL : PAPER, borderBottom: `1px solid ${PAPER_DK}`, cursor: "pointer" }}>
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

              {/* FIND SERVICES button — below dropdowns */}
              <div style={{ marginTop: 10 }}>
                <button
                  onClick={doSearch}
                  style={{
                    width: "100%",
                    background: `linear-gradient(180deg,#9A6030,${BROWN_BTN} 55%,#5A3010)`,
                    color: "#F5E8CC",
                    border: `3px solid ${YELLOW}`,
                    boxShadow: `0 0 0 1.5px ${YELLOW}, 0 0 12px 3px rgba(255,220,0,0.5)`,
                    borderRadius: 5,
                    padding: "12px 10px",
                    fontSize: 14,
                    fontWeight: 900,
                    fontFamily: "'Times New Roman', serif",
                    letterSpacing: 4,
                    textTransform: "uppercase",
                    cursor: "pointer",
                  }}>
                  Find Services
                </button>
              </div>

            </div>
            {/* ══ END SEARCH PANEL ══ */}

            <NewsCol idx={5} lines={1} style={{ marginTop: 12, fontSize: 8 }} />
          </div>

          {/* Right */}
          <div style={{ padding: "12px 10px" }}>
            <NewsCol idx={3} lines={2} />
          </div>

        </div>

        <Rule thick style={{ marginTop: 0 }} />

        {/* FOOTER */}
        <div style={{ padding: "10px", textAlign: "center", fontSize: 9, color: INK_FADE, letterSpacing: 1, textTransform: "uppercase" }}>
          V-HUB · The Villages, FL · Connecting Residents with Trusted Local Providers · All Rights Reserved
        </div>

      </div>
    </>
  );
}
