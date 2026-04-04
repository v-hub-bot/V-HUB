import { useState, useEffect } from "react";
import { ServiceArea, Category, Service, Provider } from "@/api/entities";

// ── Palette ───────────────────────────────────────────────────────────────────
const P = {
  paper:     "#EDE0C4",
  paperMid:  "#E0D0A8",
  paperDark: "#C8B888",
  ink:       "#1C1108",
  inkMid:    "#3A2A0E",
  inkFade:   "#6A5430",
  orange:    "#C8400A",
  blue:      "#1A3F70",
};

// ── Village data ──────────────────────────────────────────────────────────────
const SECTIONS = [
  { key: "Historic Side | Spanish Springs",         label: "Historic Side",        sub: "Spanish Springs",    color: "#6B3A1F" },
  { key: "Established Villages | North of SR-466A", label: "Established Villages", sub: "North of SR-466A",   color: "#3D5C2A" },
  { key: "Newer Villages | South of SR-44",         label: "Newer Villages",       sub: "South of SR-44",     color: "#2A5C2A" },
  { key: "Eastport | Newest Development Area",      label: "Eastport",             sub: "Newest Development", color: "#1A3F6F" },
  { key: "Family & Non-Age-Restricted Villages",    label: "Family Villages",      sub: "Non-Age-Restricted", color: "#4A2E6B" },
];

function isVillage(a) { return a.name.includes("—"); }
function villageName(a) { const p = a.name.split("—"); return p.length > 1 ? p[1].trim() : a.name; }
function groupAreas(areas) {
  const g = {};
  SECTIONS.forEach(s => (g[s.key] = []));
  areas.filter(isVillage).forEach(a => { if (g[a.description] !== undefined) g[a.description].push(a); });
  return g;
}

// ── Filler text (newspaper columns) ──────────────────────────────────────────
const F1 = "Residents across The Villages continue to seek quality local services. From landscaping to home repair, the demand for trusted neighborhood providers has never been stronger. Local businesses report record inquiries as the community grows. Families and retirees alike depend on reliable service professionals who understand the unique needs of Villages living. Our directory connects neighbors with neighbors.";
const F2 = "Community leaders gathered last week to discuss expanded support for local entrepreneurs. New listings are added daily as V-Hub continues to grow its network of verified service providers. Whether you need a plumber, a pet sitter, or a personal trainer, The Villages has world-class options right in your backyard. Support local and build the community we all love.";
const F3 = "The Villages remains one of Florida's fastest-growing communities. With tens of thousands of active residents, local service providers enjoy unmatched access to a loyal customer base. V-Hub makes it simple — search by village, browse by category, and contact providers directly. No fees, no middlemen. Just neighbors helping neighbors across our beloved community.";
const F4 = "Trusted providers in The Villages have served the community for decades. From Spanish Springs to Fenney, from Chatham to Moultrie Creek, skilled professionals are ready to serve you. Our verified directory ensures every listing meets community standards. Browse today and discover the talent right in your neighborhood. The Villages is stronger when we work together.";

// ── Burger Menu ───────────────────────────────────────────────────────────────
function BurgerMenu({ dark = false }) {
  const [open, setOpen] = useState(false);
  const lc = dark ? P.paper : P.ink;
  const bb = dark ? "rgba(255,255,255,0.25)" : "rgba(28,17,8,0.2)";
  const bg = dark ? "rgba(255,255,255,0.1)" : "rgba(28,17,8,0.07)";
  const links = [
    { label: "🏠 Home", href: "/", color: "#6B3A1F" },
    { label: "🔍 Find Services", href: "/", color: P.orange },
    { label: "📋 List Your Service", href: "/list-service", color: P.blue },
  ];
  return (
    <>
      <button onClick={() => setOpen(true)} style={{ background: bg, border: `1.5px solid ${bb}`, borderRadius: 5, padding: "7px 10px", cursor: "pointer", display: "flex", flexDirection: "column", gap: 4, flexShrink: 0 }}>
        <span style={{ display: "block", width: 18, height: 2, background: lc, borderRadius: 1 }} />
        <span style={{ display: "block", width: 18, height: 2, background: lc, borderRadius: 1 }} />
        <span style={{ display: "block", width: 18, height: 2, background: lc, borderRadius: 1 }} />
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 299, background: "rgba(0,0,0,0.55)" }} />
          <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 255, background: P.paper, zIndex: 300, boxShadow: "-4px 0 22px rgba(0,0,0,0.3)", display: "flex", flexDirection: "column", fontFamily: "'Times New Roman', Georgia, serif" }}>
            <div style={{ background: P.ink, padding: "16px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ color: P.paper, fontWeight: 900, fontSize: 16, letterSpacing: 3 }}>V-HUB</span>
              <button onClick={() => setOpen(false)} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", borderRadius: 4, width: 26, height: 26, fontSize: 14, cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ padding: "10px 9px", flex: 1 }}>
              {links.map((l, i) => (
                <a key={i} href={l.href} style={{ textDecoration: "none" }}>
                  <div style={{ padding: "12px 13px", borderRadius: 5, fontSize: 14, fontWeight: 700, color: P.ink, marginBottom: 5, background: P.paperMid, borderLeft: `4px solid ${l.color}` }}>{l.label}</div>
                </a>
              ))}
            </div>
            <div style={{ padding: "9px 14px", borderTop: `1px solid ${P.paperDark}`, textAlign: "center", fontSize: 9, color: P.inkFade, fontStyle: "italic" }}>V-HUB · The Villages, FL</div>
          </div>
        </>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function Home() {
  const [areas, setAreas]         = useState([]);
  const [categories, setCategories] = useState([]);
  const [selArea, setSelArea]     = useState(null);
  const [selCat, setSelCat]       = useState("");
  const [villageOpen, setVillageOpen] = useState(false);
  const [serviceOpen, setServiceOpen] = useState(false);
  const [openSection, setOpenSection] = useState(null);
  const [results, setResults]     = useState([]);
  const [searched, setSearched]   = useState(false);
  const [selProvider, setSelProvider] = useState(null);

  useEffect(() => {
    ServiceArea.filter({ is_active: true }).then(setAreas);
    Category.filter({ is_active: true }).then(setCategories);
  }, []);

  const grouped = groupAreas(areas);

  const doSearch = async () => {
    if (!selArea) return;
    const all = await Provider.filter({ is_visible: true });
    const out = all.filter(p => {
      const aM = p.service_areas?.includes(selArea.id);
      const cM = !selCat || p.category_id === selCat;
      const sM = p.subscription_status === "active" || p.subscription_status === "trial";
      return aM && cM && sM;
    });
    out.sort((a, b) => ({ premium: 0, featured: 1, basic: 2 }[a.subscription_tier] ?? 3) - ({ premium: 0, featured: 1, basic: 2 }[b.subscription_tier] ?? 3));
    setResults(out); setSearched(true);
  };

  const reset = () => {
    setSelArea(null); setSelCat(""); setResults([]); setSearched(false);
    setSelProvider(null); setVillageOpen(false); setServiceOpen(false); setOpenSection(null);
  };

  const closeDrops = () => { setVillageOpen(false); setServiceOpen(false); };

  if (selProvider) return <ProviderDetail provider={selProvider} areas={areas} categories={categories} onBack={() => setSelProvider(null)} />;
  if (searched)    return <ResultsPage results={results} areas={areas} categories={categories} onReset={reset} onSelect={setSelProvider} selArea={selArea} />;

  return (
    <div onClick={closeDrops} style={{ minHeight: "100vh", background: P.paper, fontFamily: "'Times New Roman', Georgia, serif", overflowX: "hidden" }}>

      {/* ══ TOP STRIP — black bar ══ */}
      <div style={{ background: P.ink, padding: "3px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: P.paperMid, fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Local News</span>
        <span style={{ color: P.paper, fontSize: 10, fontWeight: 900, letterSpacing: 3, textTransform: "uppercase" }}>The Villages Daily</span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: P.paperMid, fontSize: 8, letterSpacing: 1, textAlign: "right" }}>Serving Our Community · Est. 1985</span>
          <BurgerMenu dark={true} />
        </div>
      </div>

      {/* ══ HEADER — 3 columns ══ */}
      <div style={{ background: P.paper, borderTop: `2px solid ${P.ink}`, borderBottom: `1px solid ${P.ink}` }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1px 1fr 1px 1fr", padding: "7px 14px", gap: 0 }}>

          {/* Col 1 */}
          <div style={{ paddingRight: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 900, color: P.ink, textTransform: "uppercase", letterSpacing: 1.5, lineHeight: 1.2 }}>Community Connections</div>
            <div style={{ fontSize: 8, color: P.inkFade, fontStyle: "italic", marginTop: 2 }}>Bringing Local Services to You</div>
          </div>
          <div style={{ background: P.ink }} />

          {/* Col 2 */}
          <div style={{ padding: "0 12px", textAlign: "center" }}>
            <div style={{ fontSize: 10, fontWeight: 900, color: P.ink, textTransform: "uppercase", letterSpacing: 1.5, lineHeight: 1.3 }}>Support Local · Build Community</div>
          </div>
          <div style={{ background: P.ink }} />

          {/* Col 3 */}
          <div style={{ paddingLeft: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 10, fontWeight: 900, color: P.ink, textTransform: "uppercase", letterSpacing: 1.5, lineHeight: 1.3 }}>Your Guide to<br/>The Villages</div>
            <a href="/list-service" style={{ textDecoration: "none" }} onClick={e => e.stopPropagation()}>
              <button style={{ background: P.orange, color: "#fff", border: "none", borderRadius: 3, padding: "5px 10px", fontSize: 9, fontWeight: 900, cursor: "pointer", letterSpacing: 1, textTransform: "uppercase", whiteSpace: "nowrap", boxShadow: "0 2px 5px rgba(0,0,0,0.3)" }}>
                List Your Service
              </button>
            </a>
          </div>
        </div>
      </div>

      {/* ══ MASTHEAD — Logo image ══ */}
      <div style={{ background: P.paper, borderBottom: `3px solid ${P.ink}`, textAlign: "center", padding: "0" }}>
        <div style={{ height: 2, background: P.ink }} />
        <img
          src="https://media.base44.com/images/public/69d062aca815ce8e697894b1/1148d0041_V-HublocalservicesinTheVillages.png"
          alt="V-Hub"
          style={{ width: "100%", maxWidth: 680, height: "auto", display: "block", margin: "0 auto", filter: "sepia(10%) contrast(1.02)" }}
        />
        <div style={{ height: 3, background: P.ink }} />
        <div style={{ height: 1, background: P.ink, marginTop: 2, marginBottom: 2 }} />
      </div>

      {/* ══ BODY — 3 newspaper columns ══ */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1px 1.55fr 1px 1fr", background: P.paper, borderBottom: `2px solid ${P.ink}` }}>

        {/* ── LEFT column ── */}
        <div style={{ padding: "10px 12px 16px" }}>
          <div style={{ borderBottom: `2px solid ${P.ink}`, paddingBottom: 4, marginBottom: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 900, color: P.ink, textTransform: "uppercase", letterSpacing: 1, lineHeight: 1.2 }}>Local Businesses<br/>Stronger Together</div>
          </div>
          <div style={{ fontSize: 8.5, color: P.inkFade, lineHeight: 1.75, textAlign: "justify", columnCount: 1 }}>{F1}</div>
          <div style={{ margin: "8px 0", height: 1, background: `${P.ink}40` }} />
          <div style={{ fontSize: 8.5, color: P.inkFade, lineHeight: 1.75, textAlign: "justify" }}>{F4.slice(0, 200)}</div>
        </div>

        {/* divider */}
        <div style={{ background: P.ink }} />

        {/* ── CENTER column — search ── */}
        <div style={{ padding: "10px 16px 16px" }} onClick={e => e.stopPropagation()}>

          {/* Small filler above image */}
          <div style={{ fontSize: 8, color: P.inkFade, lineHeight: 1.7, textAlign: "justify", marginBottom: 8 }}>{F2.slice(0, 130)}</div>

          {/* Tropical image — sepia toned */}
          <div style={{ border: `1px solid ${P.paperDark}`, overflow: "hidden", marginBottom: 10, height: 100 }}>
            <img
              src="https://media.base44.com/images/public/69d062aca815ce8e697894b1/392f3af96_generated_image.png"
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 40%", display: "block", filter: "sepia(70%) contrast(0.88) brightness(0.90)" }}
            />
          </div>

          {/* ── Search box styled as classified ad ── */}
          <div style={{ border: `2px solid ${P.ink}`, background: P.paperMid, padding: "10px 12px" }}>
            <div style={{ textAlign: "center", borderBottom: `1px solid ${P.ink}60`, paddingBottom: 6, marginBottom: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: 2.5, color: P.ink, fontFamily: "'Times New Roman', serif" }}>Find Local Services</div>
            </div>

            {/* Service dropdown */}
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 8, fontWeight: 700, color: P.inkMid, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 3 }}>What service do you need?</div>
              <div style={{ position: "relative" }}>
                <button
                  onClick={e => { e.stopPropagation(); setServiceOpen(!serviceOpen); setVillageOpen(false); }}
                  style={{ width: "100%", background: P.paper, border: `1.5px solid ${P.ink}70`, padding: "7px 10px", fontSize: 12, fontFamily: "'Times New Roman', serif", color: selCat ? P.ink : P.inkFade, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", textAlign: "left" }}
                >
                  <span>{selCat ? (categories.find(c => c.id === selCat)?.name || "Select a Service") : "Select a Service"}</span>
                  <span style={{ fontSize: 9, color: P.inkFade, marginLeft: 6 }}>▼</span>
                </button>
                {serviceOpen && (
                  <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: P.paper, border: `1.5px solid ${P.ink}70`, borderTop: "none", zIndex: 100, boxShadow: "0 6px 16px rgba(0,0,0,0.22)", maxHeight: 220, overflowY: "auto" }}>
                    <div onClick={() => { setSelCat(""); setServiceOpen(false); }} style={{ padding: "8px 10px", cursor: "pointer", fontSize: 12, color: P.inkFade, fontStyle: "italic", borderBottom: `1px solid ${P.paperDark}` }}>All Services</div>
                    {categories.map(c => (
                      <div key={c.id} onClick={() => { setSelCat(c.id); setServiceOpen(false); }}
                        style={{ padding: "8px 10px", cursor: "pointer", fontSize: 12, color: P.ink, background: selCat === c.id ? P.paperMid : P.paper, borderBottom: `1px solid ${P.paperDark}` }}
                        onMouseEnter={e => e.currentTarget.style.background = P.paperMid}
                        onMouseLeave={e => e.currentTarget.style.background = selCat === c.id ? P.paperMid : P.paper}
                      >
                        {c.icon} {c.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Village dropdown */}
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 8, fontWeight: 700, color: P.inkMid, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 3 }}>Where do you need it?</div>
              <div style={{ position: "relative" }}>
                <button
                  onClick={e => { e.stopPropagation(); setVillageOpen(!villageOpen); setServiceOpen(false); }}
                  style={{ width: "100%", background: P.paper, border: `1.5px solid ${P.ink}70`, padding: "7px 10px", fontSize: 12, fontFamily: "'Times New Roman', serif", color: selArea ? P.ink : P.inkFade, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", textAlign: "left" }}
                >
                  <span>{selArea ? villageName(selArea) : "Select a Village"}</span>
                  <span style={{ fontSize: 9, color: P.inkFade, marginLeft: 6 }}>▼</span>
                </button>
                {villageOpen && (
                  <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: P.paper, border: `1.5px solid ${P.ink}70`, borderTop: "none", zIndex: 100, boxShadow: "0 6px 16px rgba(0,0,0,0.22)", maxHeight: 280, overflowY: "auto" }}>
                    {SECTIONS.map(sec => {
                      const vils = grouped[sec.key] || [];
                      const open = openSection === sec.key;
                      return (
                        <div key={sec.key}>
                          <div onClick={e => { e.stopPropagation(); setOpenSection(open ? null : sec.key); }}
                            style={{ padding: "8px 10px", cursor: "pointer", fontSize: 11, fontWeight: 700, color: "#fff", background: sec.color, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span>{sec.label} — {sec.sub}</span>
                            <span style={{ fontSize: 9 }}>{open ? "▲" : "▼"}</span>
                          </div>
                          {open && vils.map(v => (
                            <div key={v.id}
                              onClick={e => { e.stopPropagation(); setSelArea(v); setVillageOpen(false); setOpenSection(null); }}
                              style={{ padding: "7px 20px", cursor: "pointer", fontSize: 12, color: P.ink, background: selArea?.id === v.id ? P.paperMid : P.paper, borderBottom: `1px solid ${P.paperDark}` }}
                              onMouseEnter={e => e.currentTarget.style.background = P.paperMid}
                              onMouseLeave={e => e.currentTarget.style.background = selArea?.id === v.id ? P.paperMid : P.paper}
                            >
                              {villageName(v)}
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
            <button
              onClick={doSearch}
              disabled={!selArea}
              style={{ width: "100%", background: selArea ? P.ink : `${P.ink}55`, color: P.paper, border: "none", padding: "10px", fontSize: 14, fontWeight: 900, fontFamily: "'Times New Roman', serif", letterSpacing: 2.5, textTransform: "uppercase", cursor: selArea ? "pointer" : "not-allowed" }}
            >
              Find Services
            </button>
          </div>

          <div style={{ fontSize: 8, color: P.inkFade, lineHeight: 1.7, textAlign: "justify", marginTop: 8 }}>{F3.slice(0, 110)}</div>
        </div>

        {/* divider */}
        <div style={{ background: P.ink }} />

        {/* ── RIGHT column ── */}
        <div style={{ padding: "10px 12px 16px" }}>
          <div style={{ borderBottom: `2px solid ${P.ink}`, paddingBottom: 4, marginBottom: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 900, color: P.ink, textTransform: "uppercase", letterSpacing: 1, lineHeight: 1.2 }}>Services You<br/>Can Trust</div>
          </div>
          <div style={{ fontSize: 8.5, color: P.inkFade, lineHeight: 1.75, textAlign: "justify" }}>{F2}</div>
          <div style={{ margin: "8px 0", height: 1, background: `${P.ink}40` }} />
          <div style={{ fontSize: 8.5, color: P.inkFade, lineHeight: 1.75, textAlign: "justify" }}>{F3.slice(0, 180)}</div>
        </div>
      </div>

      {/* ══ FOOTER RULE ══ */}
      <div style={{ background: P.paper, padding: "4px 14px 8px" }}>
        <div style={{ height: 2, background: P.ink }} />
        <div style={{ height: 1, background: P.ink, marginTop: 2 }} />
        <div style={{ textAlign: "center", marginTop: 5, fontSize: 8, color: P.inkFade, fontStyle: "italic", letterSpacing: 1 }}>
          V-HUB · The Villages, FL · Connecting Residents with Trusted Local Providers · All Rights Reserved
        </div>
      </div>
    </div>
  );
}

// ── Results Page ──────────────────────────────────────────────────────────────
function ResultsPage({ results, areas, categories, onReset, onSelect, selArea }) {
  return (
    <div style={{ minHeight: "100vh", background: P.paper, fontFamily: "'Times New Roman', serif" }}>
      <div style={{ background: P.ink, padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={onReset} style={{ background: "rgba(255,255,255,0.1)", border: "1.5px solid rgba(255,255,255,0.2)", color: P.paper, borderRadius: 4, padding: "6px 13px", fontSize: 12, cursor: "pointer", fontWeight: 700 }}>← Home</button>
          <span style={{ color: P.paper, fontSize: 17, fontWeight: 900, letterSpacing: 3 }}>V-HUB</span>
        </div>
        <BurgerMenu dark={true} />
      </div>
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "20px 16px" }}>
        <div style={{ background: P.paperMid, border: `2px solid ${P.ink}`, padding: "11px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: P.ink }}>
            {results.length > 0 ? `${results.length} Provider${results.length > 1 ? "s" : ""} Found` : "No Providers Found"}
            {selArea && <span style={{ fontSize: 11, fontStyle: "italic", color: P.inkFade }}> · {villageName(selArea)}</span>}
          </div>
          <button onClick={onReset} style={{ background: P.ink, color: P.paper, border: "none", borderRadius: 3, fontSize: 11, cursor: "pointer", fontWeight: 700, padding: "5px 11px" }}>← New Search</button>
        </div>
        {results.length === 0 && (
          <div style={{ textAlign: "center", padding: "34px 16px", background: P.paperMid, border: `1px solid ${P.paperDark}`, color: P.inkFade, fontSize: 14, fontStyle: "italic" }}>
            No providers found for this area yet.<br /><span style={{ fontSize: 12 }}>Check back soon!</span>
          </div>
        )}
        {results.map(p => <ProviderCard key={p.id} provider={p} categories={categories} onClick={() => onSelect(p)} />)}
      </div>
    </div>
  );
}

function ProviderCard({ provider, categories, onClick }) {
  const cat = categories.find(c => c.id === provider.category_id);
  const feat = provider.subscription_tier === "premium" || provider.subscription_tier === "featured";
  return (
    <div onClick={onClick} style={{ background: P.paper, border: `1px solid ${P.paperDark}`, borderLeft: `4px solid ${feat ? P.orange : P.ink}`, padding: "13px 15px", marginBottom: 9, cursor: "pointer" }}>
      <div style={{ display: "flex", gap: 11, marginBottom: 5 }}>
        {provider.logo_url
          ? <img src={provider.logo_url} style={{ width: 42, height: 42, borderRadius: 5, objectFit: "cover", filter: "sepia(15%)" }} alt="" />
          : <div style={{ width: 42, height: 42, borderRadius: 5, background: `linear-gradient(135deg, ${P.orange}, #6B3A1F)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "#fff", fontWeight: 700 }}>{provider.business_name?.[0] || "?"}</div>
        }
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: P.ink }}>{provider.business_name}</div>
          {cat && <div style={{ fontSize: 10, color: P.inkFade, fontStyle: "italic" }}>{cat.icon} {cat.name}</div>}
        </div>
        {feat && <div style={{ background: P.orange, color: "#fff", borderRadius: 9, padding: "2px 7px", fontSize: 9, fontWeight: 700, alignSelf: "flex-start" }}>⭐ Featured</div>}
      </div>
      {provider.description && <div style={{ fontSize: 11, color: P.inkFade, lineHeight: 1.6, fontStyle: "italic" }}>{provider.description.slice(0, 100)}{provider.description.length > 100 ? "..." : ""}</div>}
      <div style={{ color: P.orange, fontWeight: 700, fontSize: 10, textAlign: "right", marginTop: 5 }}>View Details →</div>
    </div>
  );
}

function ProviderDetail({ provider, areas, categories, onBack }) {
  const [services, setServices] = useState([]);
  useEffect(() => { Service.filter({ is_active: true }).then(setServices); }, []);
  const cat = categories.find(c => c.id === provider.category_id);
  const pServices = services.filter(s => provider.services?.includes(s.id));
  const pAreas    = areas.filter(a => provider.service_areas?.includes(a.id));
  return (
    <div style={{ minHeight: "100vh", background: P.paper, fontFamily: "'Times New Roman', serif" }}>
      <div style={{ background: P.ink, padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={onBack} style={{ background: "rgba(255,255,255,0.1)", border: "1.5px solid rgba(255,255,255,0.2)", color: P.paper, borderRadius: 4, padding: "6px 13px", fontSize: 12, cursor: "pointer", fontWeight: 700 }}>← Back</button>
          <span style={{ color: P.paper, fontSize: 17, fontWeight: 900, letterSpacing: 3 }}>V-HUB</span>
        </div>
        <BurgerMenu dark={true} />
      </div>
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "20px 16px" }}>
        {/* Profile card */}
        <div style={{ background: P.paperMid, border: `2px solid ${P.ink}`, padding: "20px", marginBottom: 12 }}>
          <div style={{ display: "flex", gap: 14, marginBottom: 10 }}>
            {provider.logo_url
              ? <img src={provider.logo_url} style={{ width: 62, height: 62, borderRadius: 7, objectFit: "cover", filter: "sepia(12%)" }} alt="" />
              : <div style={{ width: 62, height: 62, borderRadius: 7, background: `linear-gradient(135deg, ${P.orange}, #6B3A1F)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, color: "#fff", fontWeight: 700 }}>{provider.business_name?.[0] || "?"}</div>
            }
            <div>
              <div style={{ fontSize: 19, fontWeight: 800, color: P.ink }}>{provider.business_name}</div>
              {cat && <div style={{ fontSize: 11, color: P.inkFade, fontStyle: "italic" }}>{cat.icon} {cat.name}</div>}
              {provider.years_in_business && <div style={{ fontSize: 10, color: P.inkFade }}>{provider.years_in_business} years in business</div>}
            </div>
          </div>
          {provider.description && <div style={{ fontSize: 12, color: P.inkFade, lineHeight: 1.7, fontStyle: "italic" }}>{provider.description}</div>}
        </div>
        {/* Contact */}
        <div style={{ background: P.paper, border: `1px solid ${P.paperDark}`, padding: "16px", marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: P.ink, borderBottom: `1px solid ${P.paperDark}`, paddingBottom: 5, marginBottom: 9 }}>📞 Contact</div>
          {provider.phone   && <a href={`tel:${provider.phone}`}    style={{ textDecoration:"none" }}><div style={cRow("#6B3A1F")}><span>📱</span><span style={{fontWeight:700}}>{provider.phone}</span></div></a>}
          {provider.email   && <a href={`mailto:${provider.email}`} style={{ textDecoration:"none" }}><div style={cRow(P.blue)}><span>✉️</span><span>{provider.email}</span></div></a>}
          {provider.website && <a href={provider.website.startsWith("http") ? provider.website : `https://${provider.website}`} target="_blank" rel="noreferrer" style={{ textDecoration:"none" }}><div style={cRow("#1A3F70")}><span>🌐</span><span>{provider.website}</span></div></a>}
          {!provider.phone && !provider.email && !provider.website && <div style={{ fontSize:12, fontStyle:"italic", color:P.inkFade }}>No contact info available.</div>}
        </div>
        {pServices.length > 0 && (
          <div style={{ background: P.paper, border: `1px solid ${P.paperDark}`, padding: "16px", marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: P.ink, borderBottom: `1px solid ${P.paperDark}`, paddingBottom: 5, marginBottom: 9 }}>🛠️ Services</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {pServices.map(s => <span key={s.id} style={{ background: P.ink, color: P.paper, borderRadius: 9, padding: "4px 11px", fontSize: 11 }}>{s.name}</span>)}
            </div>
          </div>
        )}
        {pAreas.length > 0 && (
          <div style={{ background: P.paper, border: `1px solid ${P.paperDark}`, padding: "16px" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: P.ink, borderBottom: `1px solid ${P.paperDark}`, paddingBottom: 5, marginBottom: 9 }}>📍 Service Areas</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {pAreas.map(a => <span key={a.id} style={{ background: "#3D5C2A", color: "#fff", borderRadius: 9, padding: "4px 11px", fontSize: 10 }}>{villageName(a)}</span>)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const cRow = color => ({ display:"flex", alignItems:"center", gap:9, background:`${color}10`, border:`1px solid ${color}22`, borderRadius:4, padding:"8px 11px", marginBottom:7, color, fontSize:13, fontFamily:"'Times New Roman', serif" });
