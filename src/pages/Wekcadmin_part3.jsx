    if (!form.business_name.trim()) return alert("Business name is required — everything else can be added later.");
    setSaving(true);
    try {
      const res = await fetch(`https://api.base44.app/api/apps/69d062aca815ce8e697894b1/functions/addProviderByAdmin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pin: "1357",
          business_name: form.business_name.trim(),
          owner_name: form.owner_name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          website: form.website.trim(),
          address: form.address.trim(),
          description: form.description.trim(),
          years_in_business: form.years_in_business ? Number(form.years_in_business) : null,
          license_number: form.license_number.trim(),
          google_review_url: form.google_review_url.trim(),
          services: form.services,
          service_areas: form.service_areas,
          category_id: form.category_id,
          notes: form.notes.trim(),
          trial_days: parseInt(form.trial_days) || 45,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setDone({ name: form.business_name, vh: data.vh_number, email: form.email, tempPass: data.temp_password, emailSent: data.email_sent, emailSkipped: data.email_skipped });
      onAdded({ ...form, id: data.id, vh_number: data.vh_number, managed_by: "Managed by V-Hub" });
      setForm(empty);
      setSvcSearch("");
      setOpenMacros({});
    } catch (e) { alert("Error: " + e.message); }
    setSaving(false);
  };

  return (
    <div style={S.card}>
      <div style={S.secTitle}>➕ Add Provider on Their Behalf</div>
      <div style={{ fontSize: 13, color: T.brownLight, fontFamily: T.sans, marginBottom: 16, lineHeight: 1.7, background: T.parchmentDark, borderRadius: 6, padding: "12px 14px", borderLeft: `4px solid ${T.gold}` }}>
        <strong style={{ color: T.brownDark }}>Only Business Name is required.</strong> Add what you have — fill in email, areas, and services later. The provider goes live immediately with a 45-day trial from today. Once you have their email, use <strong>"Send Account to Provider"</strong> from their profile to hand it off.
      </div>

      {done && (
        <div style={{ background: "#e8f5e9", border: `2px solid ${T.green}`, borderRadius: 10, padding: "18px 16px", marginBottom: 18, fontFamily: T.sans }}>
          <div style={{ fontSize: 15, fontWeight: 900, color: T.green, marginBottom: 8 }}>✅ {done.name} — Added Successfully!</div>
          <div style={{ fontSize: 13, color: T.brownDark, lineHeight: 1.9 }}>
            <strong>Account #:</strong> {done.vh}<br />
            {done.tempPass && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                <strong>Temp password:</strong>
                <span style={{ fontFamily: "monospace", background: "#f0f0f0", padding: "2px 10px", borderRadius: 4, fontWeight: 700, fontSize: 14, letterSpacing: 1 }}>{done.tempPass}</span>
                <button
                  onClick={() => {
                    const el = document.createElement("textarea");
                    el.value = done.tempPass;
                    el.setAttribute("readonly", "");
                    el.style.position = "absolute";
                    el.style.left = "-9999px";
                    document.body.appendChild(el);
                    el.select();
                    el.setSelectionRange(0, el.value.length);
                    try { document.execCommand("copy"); } catch(_) {}
                    document.body.removeChild(el);
                    if (navigator.clipboard) navigator.clipboard.writeText(done.tempPass).catch(() => {});
                    alert("Copied: " + done.tempPass);
                  }}
                  style={{ background: "#1B3D6F", color: "#fff", border: "none", borderRadius: 4, padding: "3px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "Arial, sans-serif" }}
                >📋 Copy</button>
              </div>
            )}
            {done.emailSent && <div style={{ color: "#2E7D32", fontWeight: 700, marginTop: 6 }}>✅ Welcome email sent to {done.email}</div>}
            {done.emailSkipped && (
              <div style={{ background: "#fff3cd", border: "1px solid #E8431A", borderRadius: 6, padding: "8px 10px", marginTop: 8, fontSize: 12 }}>
                ⚠️ <strong>No email on file</strong> — listing is live and searchable. When you get their email, find this account in Providers, edit it, and click <strong>"Send Account to Provider"</strong> to hand it off.
              </div>
            )}
          </div>
          <button onClick={() => setDone(null)} style={{ marginTop: 10, ...S.btn(T.brown), fontSize: 12 }}>Dismiss</button>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

        {/* ── SECTION: Business Info ── */}
        <div style={{ fontWeight: 900, fontSize: 11, color: T.brownLight, fontFamily: T.sans, textTransform: "uppercase", letterSpacing: 2, borderBottom: `1px solid ${T.border}`, paddingBottom: 6, marginTop: 4 }}>Business Info</div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[["Business Name ✱", "business_name", "text"], ["Owner Name", "owner_name", "text"]].map(([lbl, k, t]) => (
            <div key={k}>
              <div style={{ fontSize: 11, color: T.brownLight, fontFamily: T.sans, marginBottom: 3 }}>{lbl}</div>
              <input type={t} value={form[k]} onChange={e => set(k, e.target.value)} style={S.inp} />
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[["Email Address", "email", "email"], ["Phone Number", "phone", "tel"]].map(([lbl, k, t]) => (
            <div key={k}>
              <div style={{ fontSize: 11, color: T.brownLight, fontFamily: T.sans, marginBottom: 3 }}>{lbl}</div>
              <input type={t} value={form[k]} onChange={e => set(k, e.target.value)} style={S.inp} />
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[["Website", "website", "url"], ["Address / City", "address", "text"]].map(([lbl, k, t]) => (
            <div key={k}>
              <div style={{ fontSize: 11, color: T.brownLight, fontFamily: T.sans, marginBottom: 3 }}>{lbl}</div>
              <input type={t} value={form[k]} onChange={e => set(k, e.target.value)} style={S.inp} placeholder={k === "website" ? "https://..." : ""} />
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[["Years in Business", "years_in_business", "number"], ["License #", "license_number", "text"]].map(([lbl, k, t]) => (
            <div key={k}>
              <div style={{ fontSize: 11, color: T.brownLight, fontFamily: T.sans, marginBottom: 3 }}>{lbl}</div>
              <input type={t} value={form[k]} onChange={e => set(k, e.target.value)} style={S.inp} min={t === "number" ? 0 : undefined} />
            </div>
          ))}
        </div>

        <div>
          <div style={{ fontSize: 11, color: T.brownLight, fontFamily: T.sans, marginBottom: 3 }}>Google Review URL</div>
          <input type="url" value={form.google_review_url} onChange={e => set("google_review_url", e.target.value)} style={S.inp} placeholder="https://maps.app.goo.gl/..." />
          <div style={{ fontSize: 10, color: "#999", marginTop: 3, fontFamily: T.sans }}>Paste their Google Maps link — rating syncs automatically each night.</div>
        </div>

        <div>
          <div style={{ fontSize: 11, color: T.brownLight, fontFamily: T.sans, marginBottom: 3 }}>Business Description</div>
          <textarea value={form.description} onChange={e => set("description", e.target.value)} rows={3} style={{ ...S.inp, resize: "vertical" }} placeholder="Briefly describe what makes them stand out, their experience, specialties..." />
        </div>

        {/* ── SECTION: Trial Settings ── */}
        <div style={{ fontWeight: 900, fontSize: 11, color: T.brownLight, fontFamily: T.sans, textTransform: "uppercase", letterSpacing: 2, borderBottom: `1px solid ${T.border}`, paddingBottom: 6, marginTop: 4 }}>Trial Settings</div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, alignItems: "end" }}>
          <div>
            <div style={{ fontSize: 11, color: T.brownLight, fontFamily: T.sans, marginBottom: 3 }}>Trial Length (days)</div>
            <input type="number" value={form.trial_days} onChange={e => set("trial_days", e.target.value)} style={S.inp} min={1} max={365} />
          </div>
          <div style={{ fontSize: 12, color: T.brownLight, fontFamily: T.sans, lineHeight: 1.5, paddingBottom: 4 }}>
            Default: 45 days. Ends: <strong>{(() => { const d = new Date(); d.setDate(d.getDate() + (parseInt(form.trial_days) || 45)); return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); })()}</strong><br />
            After trial: provider can subscribe for $12/mo via their dashboard.
          </div>
        </div>

        <div>
          <div style={{ fontSize: 11, color: T.brownLight, fontFamily: T.sans, marginBottom: 3 }}>Internal Admin Notes (not sent to provider)</div>
          <textarea value={form.notes} onChange={e => set("notes", e.target.value)} rows={2} style={{ ...S.inp, resize: "vertical" }} placeholder="How you reached out, their response, any special notes..." />
        </div>

        {/* ── SECTION: Macro Category ── */}
        <div style={{ fontWeight: 900, fontSize: 11, color: T.brownLight, fontFamily: T.sans, textTransform: "uppercase", letterSpacing: 2, borderBottom: `1px solid ${T.border}`, paddingBottom: 6, marginTop: 4 }}>Service Category * (Macro)</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {categories.map(cat => (
            <div key={cat.id} onClick={() => setCategory(cat.id)}
              style={{ padding: "10px 14px", borderRadius: 8, border: `2px solid ${form.category_id === cat.id ? T.brown : T.border}`, cursor: "pointer", background: form.category_id === cat.id ? T.parchmentDark : T.cream, display: "flex", alignItems: "center", gap: 12, transition: "all 0.15s" }}>
              <span style={{ fontSize: 22 }}>{cat.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: T.brownDark, fontSize: 13 }}>{cat.name}</div>
                {cat.description && <div style={{ fontSize: 11, color: T.brownLight, fontFamily: T.sans }}>{cat.description}</div>}
              </div>
              {form.category_id === cat.id && <span style={{ color: T.brown, fontSize: 18, fontWeight: 900 }}>✓</span>}
            </div>
          ))}
        </div>

        {/* ── SECTION: Services (Micro) ── */}
        {form.category_id && (
          <>
            <div style={{ fontWeight: 900, fontSize: 11, color: T.brownLight, fontFamily: T.sans, textTransform: "uppercase", letterSpacing: 2, borderBottom: `1px solid ${T.border}`, paddingBottom: 6, marginTop: 4 }}>
              Specific Services * (Micro) — {form.services.length} selected
            </div>

            {form.services.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 4 }}>
                {form.services.map(id => {
                  const s = activeServices.find(x => x.id === id);
                  return s ? (
                    <span key={id} onClick={() => toggleSvc(id)} style={{ fontSize: 12, background: T.brown, color: "#fff", borderRadius: 20, padding: "4px 12px", cursor: "pointer", fontFamily: T.sans }}>
                      {s.name} ✕
                    </span>
                  ) : null;
                })}
              </div>
            )}

            <input placeholder="Search services..." value={svcSearch} onChange={e => setSvcSearch(e.target.value)} style={{ ...S.inp, marginBottom: 2 }} />
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {filteredSvcs.map(svc => {
                const sel = form.services.includes(svc.id);
                return (
                  <button key={svc.id} onClick={() => toggleSvc(svc.id)} style={{ fontSize: 12, padding: "6px 13px", borderRadius: 20, border: `2px solid ${sel ? T.brown : T.border}`, background: sel ? T.brown : T.cream, color: sel ? "#fff" : T.brownDark, cursor: "pointer", fontWeight: sel ? 700 : 400, fontFamily: T.sans, transition: "all 0.1s" }}>
                    {sel ? "✓ " : ""}{svc.name}
                  </button>
                );
              })}
              {filteredSvcs.length === 0 && <div style={{ fontSize: 13, color: T.brownLight, fontFamily: T.sans, fontStyle: "italic" }}>No services found. Try a different search.</div>}
            </div>
          </>
        )}

        {/* ── SECTION: Service Areas (Villages) ── */}
        <div style={{ fontWeight: 900, fontSize: 11, color: T.brownLight, fontFamily: T.sans, textTransform: "uppercase", letterSpacing: 2, borderBottom: `1px solid ${T.border}`, paddingBottom: 6, marginTop: 4 }}>
          Service Areas * (Villages) — {form.service_areas.length} selected
        </div>

        {form.service_areas.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 4 }}>
            {form.service_areas.map(id => {
              const a = activeAreas.find(x => x.id === id);
              const name = a ? (a.name.includes(' — ') ? a.name.split(' — ').pop().trim() : a.name) : id;
              return (
                <span key={id} onClick={() => toggleArea(id)} style={{ fontSize: 12, background: T.teal, color: "#fff", borderRadius: 20, padding: "4px 12px", cursor: "pointer", fontFamily: T.sans }}>
                  {name} ✕
                </span>
              );
            })}
          </div>
        )}

        {MACRO_AREAS.map(macro => {
          const isOpen = openMacros[macro.key];
          const count = macroSelectedCount(macro);
          const totalWithIds = macro.villages.filter(v => areaNameToId[v]).length;
          return (
            <div key={macro.key} style={{ border: `2px solid ${count > 0 ? T.teal : T.border}`, borderRadius: 8, overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: count > 0 ? "#e0f7f4" : T.cream, cursor: "pointer" }} onClick={() => toggleMacro(macro.key)}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 16 }}>{isOpen ? "▾" : "▸"}</span>
                  <span style={{ fontWeight: 700, fontSize: 13, color: T.brownDark }}>{macro.label}</span>
                  {count > 0 && <span style={{ fontSize: 11, background: T.teal, color: "#fff", borderRadius: 10, padding: "2px 8px", fontFamily: T.sans }}>{count} selected</span>}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {totalWithIds > 0 && (
                    <>
                      <button onClick={e => { e.stopPropagation(); selectAllMacro(macro); }} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 4, border: `1px solid ${T.teal}`, background: T.teal, color: "#fff", cursor: "pointer", fontFamily: T.sans }}>All</button>
                      {count > 0 && <button onClick={e => { e.stopPropagation(); deselectAllMacro(macro); }} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 4, border: `1px solid ${T.border}`, background: T.cream, color: T.brownDark, cursor: "pointer", fontFamily: T.sans }}>None</button>}
                    </>
                  )}
                </div>
              </div>
              {isOpen && (
                <div style={{ padding: "10px 14px", background: "#fafaf6", display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {macro.villages.map(vName => {
                    const id = areaNameToId[vName];
                    if (!id) return null;
                    const sel = form.service_areas.includes(id);
                    return (
                      <button key={vName} onClick={() => toggleArea(id)} style={{ fontSize: 12, padding: "5px 12px", borderRadius: 20, border: `2px solid ${sel ? T.teal : T.border}`, background: sel ? T.teal : T.cream, color: sel ? "#fff" : T.brownDark, cursor: "pointer", fontWeight: sel ? 700 : 400, fontFamily: T.sans, transition: "all 0.1s" }}>
                        {sel ? "✓ " : ""}{vName}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* ── SUBMIT ── */}
        <div style={{ marginTop: 10, borderTop: `1px solid ${T.border}`, paddingTop: 14 }}>
          <div style={{ fontSize: 12, color: T.brownLight, fontFamily: T.sans, marginBottom: 12, lineHeight: 1.6, background: "#fff8e1", borderRadius: 6, padding: "10px 12px" }}>
            📧 <strong>What happens when you click Add:</strong> A listing is created instantly, set to active with a {form.trial_days || 45}-day trial. The provider receives a professional email explaining that V-Hub built their profile, along with their VH account number, temporary password, and instructions to log into their Provider Hub.
          </div>
          <button onClick={save} disabled={saving} style={{ ...S.btn(saving ? T.brownLight : T.brown), padding: "12px 24px", fontSize: 14, width: "100%", opacity: saving ? 0.7 : 1, letterSpacing: 0.5 }}>
            {saving ? "⏳ Creating listing & sending email..." : "✅ Create Listing & Send Welcome Email"}
          </button>
        </div>

      </div>
    </div>
  );
}
function Dashboard({ adminPin }) {
  const [providers, setProviders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState([]);
  const [classifiedAds, setClassifiedAds] = useState([]);
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [serviceAreas, setServiceAreas] = useState([]);
  const [tab, setTab] = useState("Overview");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null); // { msg, type: "success"|"error" }
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`https://api.base44.app/api/apps/69d062aca815ce8e697894b1/functions/getAdminData`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: adminPin }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setProviders(Array.isArray(data.providers) ? data.providers : []);
      setReviews(Array.isArray(data.reviews) ? data.reviews : []);
      setLeads(Array.isArray(data.leads) ? data.leads : []);
      setStats(Array.isArray(data.stats) ? data.stats : []);
      setClassifiedAds(Array.isArray(data.classifiedAds) ? data.classifiedAds : []);
      setCategories(Array.isArray(data.categories) ? data.categories.filter(c => c.is_active) : []);
      setServices(Array.isArray(data.services) ? data.services : []);
      setServiceAreas(Array.isArray(data.serviceAreas) ? data.serviceAreas : []);
    } catch (e) { console.error('Admin data load error:', e); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // Build lookup maps: id → name (entity IDs)
  const catMap = {}; categories.forEach(c => { catMap[c.id] = c.name; });
  const svcMap = {}; services.forEach(s => { svcMap[s.id] = s.name; });
  const areaMap = {}; serviceAreas.forEach(a => { areaMap[a.id] = a.name; });

  // Legacy short-code maps for providers created before entity migration
  const LEGACY_SVC_MAP = {"s01":"Home Improvements","s02":"General Repairs","s03":"Cleaning Services","s04":"Painting (Interior/Exterior)","s05":"Garage Door Services","s06":"Window Installation/Repair","s07":"HVAC","s08":"Plumbing","s09":"Roofing","s10":"Handyman Services","s11":"Security & Home Watch","s12":"Pest Control","s13":"Appliance Repair","s14":"Electrical & Lighting","s15":"Flooring (Tile, Wood, Carpet)","s16":"Home Organization","s17":"Smart Home Installation","s18":"Pool & Spa Services","s19":"Lawn Mowing","s20":"Sod Installation","s21":"Tree Trimming & Pruning/Removal","s22":"Lawn Fertilization","s23":"Irrigation/Sprinkler Services","s24":"Landscaping","s25":"Hardscaping","s26":"Pressure Washing","s27":"Driveway Repair/Cleaning/Painting","s28":"Rentals","s29":"Repairs","s30":"Detailing","s31":"Lighting Upgrades","s32":"Improvements/Customizations","s33":"Battery Replacement","s34":"Tire Services","s35":"Auto Repairs","s36":"Auto Detailing","s37":"Oil Changes","s38":"Tire Services","s39":"Mobile Mechanic","s40":"Hair Stylists","s41":"Nail Technicians","s42":"Spa Services","s43":"Home Health Aides","s44":"Massage Therapists","s45":"Personal Trainers","s46":"Makeup Artists","s47":"Veterinary Services","s48":"Grooming","s49":"Pet Sitting/Walking","s50":"Pet Training","s51":"Mobile Grooming","s52":"Medical Transport","s53":"Airport Transport","s54":"Local Rides","s55":"Errand Services","s56":"Courier/Delivery Services","s57":"Accounting & Bookkeeping","s58":"Notary Services","s59":"IT Support","s60":"Legal Services","s61":"Business Consulting","s62":"Tax Preparation","s63":"Home Watch","s64":"Pool & Spa Services","s65":"Vehicle Transport"};
  const LEGACY_AREA_MAP = {"va001":"Alhambra","va002":"Amelia","va003":"Ashland","va004":"Belle Aire","va005":"Belvedere","va006":"Bonita","va007":"Bonnybrook","va008":"Bradford","va009":"Briar Meadow","va010":"Bridgeport at Creekside Landing","va011":"Bridgeport at Lake Miona","va012":"Bridgeport at Lake Sumter","va013":"Bridgeport at Laurel Valley","va014":"Bridgeport at Miona Shores","va015":"Bridgeport at Mission Hills","va016":"Buttonwood","va017":"Calumet Grove","va018":"Caroline","va019":"Cason Hammock","va020":"Charlotte","va021":"Chatham","va022":"Chitty Chatty","va023":"Citrus Grove","va024":"Collier","va025":"Collier at Alden Bungalows","va026":"Collier at Antrim Dells","va027":"Country Club Hills","va028":"Dabney","va029":"De Allende","va030":"De La Vista","va031":"Del Mar","va032":"DeLuna","va033":"DeSoto","va034":"Dunedin","va035":"Duval","va036":"El Cortez","va037":"Fenney","va038":"Fernandina","va039":"Gilchrist","va040":"Glenbrook","va041":"Hacienda","va042":"Haciendas of Mission Hills","va043":"Hadley","va044":"Hammock at Fenney","va045":"Hawkins","va046":"Hemingway","va047":"Hillsborough","va048":"La Reynalda","va049":"La Zamora","va050":"LaBelle","va051":"Lake Deaton","va052":"Lake Denham","va053":"Lakeshore Cottages","va054":"Largo","va055":"Liberty Park","va056":"Linden","va057":"Lynnhaven","va058":"Mallory Square","va059":"Marsh Bend","va060":"McClure","va061":"Mira Mesa","va062":"Monarch Grove","va063":"Newell","va064":"Orange Blossom Gardens","va065":"Osceola Hills","va066":"Osceola Hills at Soaring Eagle Preserve","va067":"Palo Alto","va068":"Pennecamp","va069":"Piedmont","va070":"Pine Hills","va071":"Pine Ridge","va072":"Pinellas","va073":"Poinciana","va074":"Polo Ridge","va075":"Richmond","va076":"Rio Grande","va077":"Rio Ponderosa","va078":"Rio Ranchero","va079":"Sabal Chase","va080":"Sanibel","va081":"Santiago","va082":"Santo Domingo","va083":"Silver Lake","va084":"Springdale","va085":"St. Catherine","va086":"St. Charles","va087":"St. James","va088":"St. Johns","va089":"Summerhill","va090":"Sunset Pointe","va091":"Tall Trees","va092":"Tamarind Grove","va093":"Tierra Del Sol","va094":"Valle Verde","va095":"Virginia Trace","va096":"Winifred","va097":"Woodbury"};

  // Merged maps: entity IDs take priority, legacy codes fill the gaps
  const fullSvcMap = { ...LEGACY_SVC_MAP, ...svcMap };
  const fullAreaMap = { ...LEGACY_AREA_MAP, ...areaMap };

  const pendingReviews = reviews.filter(r => !r.is_approved);
  const pendingProviders = providers.filter(p => p.subscription_status === "pending");
  const TABS = ["Overview", "Providers", "Deals", "Reviews", "Leads", "Analytics", "Vendors", "Add Provider"];

  if (loading) return (
    <div style={{ minHeight: "100vh", background: T.parchment, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
      <img src={LOGO} style={{ width: 64, borderRadius: 10 }} alt="" />
      <div style={{ color: T.brownLight, fontSize: 15, fontStyle: "italic", fontFamily: T.font }}>Loading dashboard...</div>
    </div>
  );

  return (
    <div style={S.page}>
      {/* ── TOAST NOTIFICATION ── */}
      {toast && (
        <div style={{
          position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)",
          zIndex: 9999, padding: "12px 24px", borderRadius: 8, fontFamily: T.sans,
          fontSize: 14, fontWeight: 700, boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
          background: toast.type === "success" ? "#1B5E20" : "#B71C1C",
          color: "#fff", minWidth: 260, textAlign: "center",
          animation: "fadeSlideIn 0.25s ease",
          pointerEvents: "none",
        }}>
          {toast.msg}
        </div>
      )}
      <div style={S.hdr}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img src={LOGO} style={{ height: 42, borderRadius: 8 }} alt="" />
          <div>
            <div style={{ color: "#fff", fontSize: 17, fontWeight: 800, fontFamily: T.font }}>V-HUB Admin</div>
            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, fontFamily: T.sans }}>{providers.length} providers · {pendingReviews.length} reviews pending</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button onClick={load} style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", borderRadius: 6, padding: "5px 10px", fontSize: 12, cursor: "pointer", fontFamily: T.sans }}>↻ Refresh</button>
          <a href="/" style={{ textDecoration: "none" }}>
            <button style={{ background: "linear-gradient(180deg,#9A6030,#7A4820 60%,#5A3010)", border: "2px solid #1B3D6F", borderRadius: 6, color: "#F5E8CC", fontFamily: T.sans, fontWeight: 700, fontSize: 13, padding: "8px 16px", cursor: "pointer", whiteSpace: "nowrap" }}>« Home</button>
          </a>
        </div>
      </div>

      {/* ── NEW SIGNUPS ALERT BANNER ── */}
      {pendingProviders.length > 0 && (
        <div
          onClick={() => setTab("Providers")}
          style={{ background: "#E8431A", color: "#fff", padding: "10px 16px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontFamily: T.sans, fontSize: 14, fontWeight: 700, borderBottom: "3px solid #b33010" }}
        >
          <span style={{ fontSize: 20 }}>🔔</span>
          <span>{pendingProviders.length} new listing{pendingProviders.length > 1 ? "s" : ""} waiting for your review!</span>
          <span style={{ marginLeft: "auto", background: "rgba(255,255,255,0.25)", borderRadius: 20, padding: "2px 12px", fontSize: 13 }}>Tap to review →</span>
        </div>
      )}

      {/* ── PENDING REVIEWS ALERT BANNER ── */}
      {pendingReviews.length > 0 && (
        <div
          onClick={() => setTab("Reviews")}
          style={{ background: "#5C4A1E", color: "#FFDB00", padding: "10px 16px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontFamily: T.sans, fontSize: 14, fontWeight: 700, borderBottom: "3px solid #3a2e0e" }}
        >
          <span style={{ fontSize: 20 }}>⭐</span>
          <span>{pendingReviews.length} customer review{pendingReviews.length > 1 ? "s" : ""} awaiting approval</span>
          <span style={{ marginLeft: "auto", background: "rgba(255,219,0,0.2)", borderRadius: 20, padding: "2px 12px", fontSize: 13, color: "#FFDB00" }}>Approve →</span>
        </div>
      )}

      <div style={{ background: T.parchmentDark, borderBottom: `2px solid ${T.border}`, overflowX: "auto", display: "flex" }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ ...S.tabBtn(tab === t), position: "relative" }}>
            {t}
            {t === "Reviews" && pendingReviews.length > 0 && (
              <span style={{ marginLeft: 6, background: "#E8431A", color: "#fff", borderRadius: 10, padding: "1px 6px", fontSize: 10, fontWeight: 900, fontFamily: T.sans, verticalAlign: "middle" }}>
                {pendingReviews.length}
              </span>
            )}
            {t === "Providers" && pendingProviders.length > 0 && (
              <span style={{ marginLeft: 6, background: "#E65100", color: "#fff", borderRadius: 10, padding: "1px 6px", fontSize: 10, fontWeight: 900, fontFamily: T.sans, verticalAlign: "middle" }}>
                {pendingProviders.length}
              </span>
            )}
            {t === "Leads" && leads.length > 0 && (
              <span style={{ marginLeft: 4, color: T.brownLight, fontSize: 10, fontFamily: T.sans }}>({leads.length})</span>
            )}
          </button>
        ))}
      </div>

      <div style={{ padding: 14, maxWidth: 800, margin: "0 auto" }}>
        {tab === "Overview" && <Overview providers={providers} reviews={reviews} leads={leads} fullAreaMap={fullAreaMap} />}
        {tab === "Providers" && <ProvidersTab providers={providers} setProviders={setProviders} catMap={catMap} svcMap={svcMap} areaMap={areaMap} fullSvcMap={fullSvcMap} fullAreaMap={fullAreaMap} adminPin={adminPin} allCategories={categories} allServices={services} allAreas={serviceAreas} showToast={showToast} />}
        {tab === "Reviews" && <ReviewsTab reviews={reviews} setReviews={setReviews} providers={providers} adminPin={adminPin} />}
        {tab === "Leads" && <LeadsTab leads={leads} providers={providers} />}
        {tab === "Deals" && <DealsTab providers={providers} classifiedAds={classifiedAds} />}
        {tab === "Analytics" && <AnalyticsTab providers={providers} reviews={reviews} leads={leads} stats={stats} catMap={catMap} svcMap={svcMap} fullSvcMap={fullSvcMap} classifiedAds={classifiedAds} />}
        {tab === "Vendors" && <VendorsTab />}
        {tab === "Add Provider" && <AddProviderTab onAdded={p => { setProviders(prev => [p, ...prev]); setTab("Providers"); }} categories={categories} services={services} serviceAreas={serviceAreas} adminPin={adminPin} />}
      </div>
    </div>
  );
}


// ── VENDORS TAB ───────────────────────────────────────────────────────────────
const VENDOR_CAT_EMOJI_ADMIN = {
  "Farm & Fresh Produce": "🌽",
  "Food, Baked Goods & Sweets": "🥐",
  "Wellness & Body": "🌿",
  "Art, Jewelry & Gifts": "🎨",
  "Home, Yard & Golf Cart": "🏡",
};

function VendorsTab() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCat, setFilterCat] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterAcct, setFilterAcct] = useState("All");
  const [searchQ, setSearchQ] = useState("");
  const [editVendor, setEditVendor] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [sendingWelcome, setSendingWelcome] = useState(null);
  const [setPassId, setSetPassId] = useState(null);
  const [newPass, setNewPass] = useState("");

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3500); };

  useEffect(() => {
    MarketVendor.list().then(v => { setVendors(v || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const categories = ["All", "Farm & Fresh Produce", "Food, Baked Goods & Sweets", "Wellness & Body", "Art, Jewelry & Gifts", "Home, Yard & Golf Cart"];

  const filtered = vendors.filter(v => {
    const catMatch = filterCat === "All" || v.category === filterCat;
    const statusMatch = filterStatus === "All" || (filterStatus === "Active" && v.is_active) || (filterStatus === "Pending" && !v.is_active);
    const acctMatch = filterAcct === "All"
      || (filterAcct === "HasEmail" && v.email)
      || (filterAcct === "NoEmail" && !v.email)
      || (filterAcct === "HasLogin" && v.login_email)
      || (filterAcct === "WelcomeSent" && v.welcome_sent)
      || (filterAcct === "SelfManaged" && v.managed_by === "vendor");
    const q = searchQ.trim().toLowerCase();
    const nameMatch = !q || (v.name || "").toLowerCase().includes(q) || (v.vendor_id || "").toLowerCase().includes(q) || (v.email || "").toLowerCase().includes(q);
    return catMatch && statusMatch && acctMatch && nameMatch;
  });

  const openEdit = (v) => { setEditVendor(v); setEditForm({ ...v }); };

  const saveEdit = async () => {
    setSaving(true);
    try {
      await MarketVendor.update(editVendor.id, editForm);
      setVendors(prev => prev.map(x => x.id === editVendor.id ? { ...x, ...editForm } : x));
      setEditVendor(null);
      showToast("✅ Vendor updated!");
    } catch { showToast("❌ Save failed"); }
    setSaving(false);
  };

  const toggleActive = async (v) => {
    await MarketVendor.update(v.id, { is_active: !v.is_active });
    setVendors(prev => prev.map(x => x.id === v.id ? { ...x, is_active: !v.is_active } : x));
    showToast(v.is_active ? "⚠️ Vendor hidden from public" : "✅ Vendor is now live");
  };

  const toggleManagedBy = async (v) => {
    const newVal = v.managed_by === "vendor" ? "vhub" : "vendor";
    await MarketVendor.update(v.id, { managed_by: newVal });
    setVendors(prev => prev.map(x => x.id === v.id ? { ...x, managed_by: newVal } : x));
    showToast(newVal === "vendor" ? "✅ Marked as self-managed" : "↩️ Returned to V-HUB management");
  };

  const deleteVendor = async (v) => {
    if (!window.confirm(`Delete ${v.name}? This cannot be undone.`)) return;
    await MarketVendor.delete(v.id);
    setVendors(prev => prev.filter(x => x.id !== v.id));
    showToast("🗑️ Vendor deleted");
  };

  const savePassword = async (v) => {
    if (!newPass || newPass.length < 6) { showToast("❌ Password must be at least 6 characters"); return; }
    await MarketVendor.update(v.id, { login_password: newPass, login_email: v.login_email || v.email || "" });
    setVendors(prev => prev.map(x => x.id === v.id ? { ...x, login_password: newPass, login_email: v.login_email || v.email || "" } : x));
    setSetPassId(null);
    setNewPass("");
    showToast("🔐 Password saved");
  };

  const sendWelcomeEmail = async (v) => {
    if (!v.email) { showToast("❌ No email on file for this vendor"); return; }
    if (!window.confirm(`Send welcome email to ${v.name} at ${v.email}?`)) return;
    setSendingWelcome(v.id);
    try {
      const res = await fetch("https://api.base44.app/api/apps/69d062aca815ce8e697894b1/functions/sendVendorWelcome", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendor_id: v.id })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await MarketVendor.update(v.id, { welcome_sent: true });
        setVendors(prev => prev.map(x => x.id === v.id ? { ...x, welcome_sent: true } : x));
        showToast(`✅ Welcome email sent to ${v.email}`);
      } else {
        showToast("❌ Email failed: " + (data.error || "Unknown error"));
      }
    } catch (e) {
      showToast("❌ Network error sending email");
    }
    setSendingWelcome(null);
  };

  // Stats
  const pendingCount = vendors.filter(v => !v.is_active).length;
  const activeCount = vendors.filter(v => v.is_active).length;
  const verifiedCount = vendors.filter(v => v.is_verified).length;
  const withEmail = vendors.filter(v => v.email).length;
  const withPhone = vendors.filter(v => v.phone).length;
  const withWebsite = vendors.filter(v => v.website).length;
  const withFacebook = vendors.filter(v => v.facebook_url).length;
  const withLogin = vendors.filter(v => v.login_email).length;
  const welcomeSentCount = vendors.filter(v => v.welcome_sent).length;
  const selfManagedCount = vendors.filter(v => v.managed_by === "vendor").length;
  const selfSignup = vendors.filter(v => (v.notes || "").includes("self-signup")).length;

  const CAT_COLORS = {
    "Farm & Fresh Produce": "#4CAF50",
    "Food, Baked Goods & Sweets": "#FF9800",
    "Wellness & Body": "#9C27B0",
    "Art, Jewelry & Gifts": "#E8431A",
    "Home, Yard & Golf Cart": "#2196F3",
  };
  const catCounts = ["Farm & Fresh Produce","Food, Baked Goods & Sweets","Wellness & Body","Art, Jewelry & Gifts","Home, Yard & Golf Cart"].map(cat => ({
    cat, count: vendors.filter(v => v.category === cat).length,
    active: vendors.filter(v => v.category === cat && v.is_active).length,
    color: CAT_COLORS[cat],
    short: cat === "Food, Baked Goods & Sweets" ? "Food & Baked" : cat === "Home, Yard & Golf Cart" ? "Home & Golf Cart" : cat === "Farm & Fresh Produce" ? "Farm & Produce" : cat,
  }));
  const maxCatCount = Math.max(...catCounts.map(c => c.count), 1);

  const inputS = { width: "100%", padding: "7px 10px", fontSize: 13, border: `1px solid ${T.border}`, borderRadius: 6, background: T.cream, fontFamily: T.sans, boxSizing: "border-box", marginBottom: 8 };
  const labelS = { display: "block", fontSize: 11, fontWeight: 700, color: T.brownLight, fontFamily: T.sans, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 3 };

  return (
    <div>
      {toast && <div style={{ position: "fixed", top: 20, right: 20, background: "#1A6B3C", color: "#fff", padding: "10px 18px", borderRadius: 8, fontWeight: 700, fontFamily: T.sans, zIndex: 9999, boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}>{toast}</div>}

      {/* Stats strip */}
      <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
        {[
          { label: "Total Vendors", val: vendors.length, color: T.brown },
          { label: "Active / Public", val: activeCount, color: "#1A6B3C" },
          { label: "Pending Review", val: pendingCount, color: "#E8431A" },
          { label: "Have Email", val: withEmail, color: "#00BFA5" },
          { label: "Welcome Sent", val: welcomeSentCount, color: "#9C27B0" },
          { label: "Self-Managed", val: selfManagedCount, color: "#2196F3" },
        ].map(s => (
          <div key={s.label} style={{ flex: 1, minWidth: 90, background: T.cream, border: `1px solid ${T.border}`, borderRadius: 8, padding: "10px 14px", textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 900, color: s.color, fontFamily: T.sans }}>{s.val}</div>
            <div style={{ fontSize: 10, color: T.brownLight, fontFamily: T.sans, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Analytics Toggle */}
      <div style={{ marginBottom: 12 }}>
        <button onClick={() => setShowAnalytics(s => !s)}
          style={{ padding: "7px 16px", fontSize: 12, fontWeight: 700, background: showAnalytics ? T.brownDark : T.cream, color: showAnalytics ? "#fff" : T.brownDark, border: `1px solid ${T.border}`, borderRadius: 20, cursor: "pointer", fontFamily: T.sans }}>
          📊 {showAnalytics ? "Hide Analytics" : "Show Analytics"}
        </button>
      </div>

      {/* Analytics Panel */}
      {showAnalytics && (
        <div style={{ background: T.cream, border: `1px solid ${T.border}`, borderRadius: 10, padding: "16px 16px 12px", marginBottom: 16 }}>
          <div style={{ fontWeight: 900, fontSize: 13, color: T.brownDark, fontFamily: T.sans, textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>📊 Vendor Analytics</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
            {[
              { label: "Total Vendors", val: vendors.length, color: T.brown, icon: "🏪" },
              { label: "Live / Active", val: activeCount, color: "#1A6B3C", icon: "✅" },
              { label: "Pending", val: pendingCount, color: "#E8431A", icon: "⏳" },
              { label: "Self-Signups", val: selfSignup, color: "#00BFA5", icon: "📝" },
              { label: "Verified", val: verifiedCount, color: "#9C27B0", icon: "⭐" },
              { label: "Have Login", val: withLogin, color: "#2196F3", icon: "🔐" },
              { label: "Welcome Sent", val: welcomeSentCount, color: "#FF9800", icon: "📧" },
              { label: "Self-Managed", val: selfManagedCount, color: "#5D4037", icon: "🙋" },
            ].map(s => (
              <div key={s.label} style={{ flex: 1, minWidth: 90, background: T.parchment, border: `1px solid ${T.border}`, borderRadius: 8, padding: "10px 10px", textAlign: "center" }}>
                <div style={{ fontSize: 18 }}>{s.icon}</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: s.color, fontFamily: T.sans, lineHeight: 1.2 }}>{s.val}</div>
                <div style={{ fontSize: 10, color: T.brownLight, fontFamily: T.sans, marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.brownLight, fontFamily: T.sans, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Vendors by Category</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {catCounts.sort((a,b) => b.count - a.count).map(({ cat, count, active, color, short }) => (
                <div key={cat} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 110, fontSize: 11, color: T.brownDark, fontFamily: T.sans, flexShrink: 0, textAlign: "right" }}>{short}</div>
                  <div style={{ flex: 1, background: T.parchmentDark, borderRadius: 4, height: 18, overflow: "hidden", position: "relative" }}>
                    <div style={{ width: `${(count / maxCatCount) * 100}%`, background: color, height: "100%", borderRadius: 4, opacity: 0.85 }} />
                    <div style={{ position: "absolute", right: 6, top: 0, height: "100%", display: "flex", alignItems: "center", fontSize: 10, fontWeight: 700, color: T.brownDark, fontFamily: T.sans }}>
                      {active} live / {count} total
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.brownLight, fontFamily: T.sans, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Contact Info Coverage</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[
                { label: "Have Email", val: withEmail, pct: Math.round(withEmail/Math.max(vendors.length,1)*100) },
                { label: "Have Phone", val: withPhone, pct: Math.round(withPhone/Math.max(vendors.length,1)*100) },
                { label: "Have Website", val: withWebsite, pct: Math.round(withWebsite/Math.max(vendors.length,1)*100) },
                { label: "Have Facebook", val: withFacebook, pct: Math.round(withFacebook/Math.max(vendors.length,1)*100) },
              ].map(({ label, val, pct }) => (
                <div key={label} style={{ flex: 1, minWidth: 90, background: T.parchment, border: `1px solid ${T.border}`, borderRadius: 8, padding: "8px 10px", textAlign: "center" }}>
                  <div style={{ fontSize: 18, fontWeight: 900, color: pct >= 80 ? "#1A6B3C" : pct >= 50 ? "#FF9800" : "#E8431A", fontFamily: T.sans }}>{pct}%</div>
                  <div style={{ fontSize: 10, color: T.brownLight, fontFamily: T.sans, marginTop: 1 }}>{label}</div>
                  <div style={{ fontSize: 10, color: T.brownLight, fontFamily: T.sans }}>{val} / {vendors.length}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap", alignItems: "center" }}>
        <input type="text" placeholder="Search name, VM#, email..." value={searchQ} onChange={e => setSearchQ(e.target.value)}
          style={{ flex: 2, minWidth: 160, padding: "7px 12px", fontSize: 13, border: `1px solid ${T.border}`, borderRadius: 20, background: T.cream, fontFamily: T.sans }} />
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
          style={{ flex: 1, minWidth: 130, padding: "7px 10px", fontSize: 12, border: `1px solid ${T.border}`, borderRadius: 20, background: T.cream, fontFamily: T.sans }}>
          {categories.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          style={{ flex: 1, minWidth: 110, padding: "7px 10px", fontSize: 12, border: `1px solid ${T.border}`, borderRadius: 20, background: T.cream, fontFamily: T.sans }}>
          {["All","Active","Pending"].map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={filterAcct} onChange={e => setFilterAcct(e.target.value)}
          style={{ flex: 1, minWidth: 130, padding: "7px 10px", fontSize: 12, border: `1px solid ${T.border}`, borderRadius: 20, background: T.cream, fontFamily: T.sans }}>
          <option value="All">All Accounts</option>
          <option value="HasEmail">Has Email</option>
          <option value="NoEmail">No Email</option>
          <option value="HasLogin">Has Login</option>
          <option value="WelcomeSent">Welcome Sent</option>
          <option value="SelfManaged">Self-Managed</option>
        </select>
      </div>

      <div style={{ fontSize: 11, color: T.brownLight, fontFamily: T.sans, marginBottom: 10 }}>
        Showing {filtered.length} of {vendors.length} vendors
      </div>

      {/* Vendor List */}
      {loading ? (
        <div style={{ textAlign: "center", color: T.brownLight, padding: 30, fontFamily: T.sans }}>Loading vendors...</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map(v => (
            <div key={v.id} style={{ background: T.cream, border: `1.5px solid ${v.is_active ? T.border : "#f5a623"}`, borderRadius: 10, padding: "12px 14px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                {/* Left: Info */}
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 3 }}>
                    <span style={{ fontWeight: 800, fontSize: 14, color: T.brownDark, fontFamily: T.font }}>{v.name}</span>
                    {v.vendor_id && <span style={{ fontSize: 10, color: T.brownLight, fontFamily: T.sans, background: T.parchmentDark, padding: "1px 6px", borderRadius: 10 }}>{v.vendor_id}</span>}
                    {v.is_active ? <span style={{ fontSize: 10, background: "#E8F5E9", color: "#1A6B3C", borderRadius: 10, padding: "1px 7px", fontWeight: 700, fontFamily: T.sans }}>● Live</span>
                      : <span style={{ fontSize: 10, background: "#FFF3E0", color: "#E65100", borderRadius: 10, padding: "1px 7px", fontWeight: 700, fontFamily: T.sans }}>⏳ Pending</span>}
                    {v.is_verified && <span style={{ fontSize: 10, background: "#EDE7F6", color: "#6A1B9A", borderRadius: 10, padding: "1px 7px", fontWeight: 700, fontFamily: T.sans }}>⭐ Verified</span>}
                    {v.managed_by === "vendor" && <span style={{ fontSize: 10, background: "#E3F2FD", color: "#1565C0", borderRadius: 10, padding: "1px 7px", fontWeight: 700, fontFamily: T.sans }}>🙋 Self-Managed</span>}
                    {v.welcome_sent && <span style={{ fontSize: 10, background: "#F3E5F5", color: "#6A1B9A", borderRadius: 10, padding: "1px 7px", fontWeight: 700, fontFamily: T.sans }}>📧 Welcomed</span>}
                  </div>
                  <div style={{ fontSize: 11, color: T.brownLight, fontFamily: T.sans, marginBottom: 2 }}>{v.category}</div>
                  {v.location && <div style={{ fontSize: 11, color: T.brownLight, fontFamily: T.sans }}>📍 {v.location}</div>}
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 5 }}>
                    {v.phone && <span style={{ fontSize: 11, color: T.brown, fontFamily: T.sans }}>📞 {v.phone}</span>}
                    {v.website && <a href={v.website} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: "#1565C0", fontFamily: T.sans }}>🌐 Website</a>}
                    {v.facebook_url && <a href={v.facebook_url} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: "#1565C0", fontFamily: T.sans }}>📘 Facebook</a>}
                    {v.instagram_url && <a href={v.instagram_url} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: "#C2185B", fontFamily: T.sans }}>📷 Instagram</a>}
                  </div>
                  {/* Admin-only block */}
                  <div style={{ marginTop: 6, background: T.parchment, borderRadius: 6, padding: "6px 10px", border: `1px solid ${T.border}` }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: T.brownLight, fontFamily: T.sans, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 3 }}>🔒 Admin Only</div>
                    {v.email ? <div style={{ fontSize: 12, color: T.brownDark, fontFamily: T.sans }}><strong>Email:</strong> {v.email}</div>
                      : <div style={{ fontSize: 11, color: "#999", fontFamily: T.sans, fontStyle: "italic" }}>No email — vendor can claim via admin@v-hub.us</div>}
                    {v.login_email && <div style={{ fontSize: 12, color: T.brownDark, fontFamily: T.sans, marginTop: 2 }}><strong>Login:</strong> {v.login_email}</div>}
                    {v.login_password && <div style={{ fontSize: 12, color: "#1A6B3C", fontFamily: T.sans }}><strong>Temp PW:</strong> {v.login_password}</div>}
                    {!v.login_password && <div style={{ fontSize: 11, color: "#E8431A", fontFamily: T.sans, fontStyle: "italic" }}>⚠️ No login password set</div>}
                  </div>
                </div>

                {/* Right: Action Buttons */}
                <div style={{ display: "flex", flexDirection: "column", gap: 5, minWidth: 130 }}>
                  <button onClick={() => openEdit(v)}
                    style={{ padding: "6px 12px", fontSize: 11, fontWeight: 700, background: T.parchmentDark, color: T.brownDark, border: `1px solid ${T.border}`, borderRadius: 6, cursor: "pointer", fontFamily: T.sans }}>
                    ✏️ Edit
                  </button>
                  <button onClick={() => toggleActive(v)}
                    style={{ padding: "6px 12px", fontSize: 11, fontWeight: 700, background: v.is_active ? "#FFF3E0" : "#E8F5E9", color: v.is_active ? "#E65100" : "#1A6B3C", border: `1px solid ${v.is_active ? "#FFB74D" : "#A5D6A7"}`, borderRadius: 6, cursor: "pointer", fontFamily: T.sans }}>
                    {v.is_active ? "⚠️ Hide" : "✅ Activate"}
                  </button>
                  <button onClick={() => toggleManagedBy(v)}
                    style={{ padding: "6px 12px", fontSize: 11, fontWeight: 700, background: v.managed_by === "vendor" ? "#EFEBE9" : "#E3F2FD", color: v.managed_by === "vendor" ? "#5D4037" : "#1565C0", border: `1px solid ${v.managed_by === "vendor" ? "#BCAAA4" : "#90CAF9"}`, borderRadius: 6, cursor: "pointer", fontFamily: T.sans }}>
                    {v.managed_by === "vendor" ? "↩ V-HUB Manages" : "🙋 Self-Managed"}
                  </button>
                  <button onClick={() => { setSetPassId(setPassId === v.id ? null : v.id); setNewPass(""); }}
                    style={{ padding: "6px 12px", fontSize: 11, fontWeight: 700, background: v.login_password ? "#E8F5E9" : "#FFEBEE", color: v.login_password ? "#1A6B3C" : "#c0392b", border: `1px solid ${v.login_password ? "#A5D6A7" : "#EF9A9A"}`, borderRadius: 6, cursor: "pointer", fontFamily: T.sans }}>
                    {v.login_password ? "🔐 Change PW" : "🔑 Set Password"}
                  </button>
                  {v.email && (
                    <button onClick={() => sendWelcomeEmail(v)} disabled={sendingWelcome === v.id}
                      style={{ padding: "6px 12px", fontSize: 11, fontWeight: 700, background: v.welcome_sent ? "#EDE7F6" : "#E8431A", color: v.welcome_sent ? "#6A1B9A" : "#fff", border: "none", borderRadius: 6, cursor: sendingWelcome === v.id ? "wait" : "pointer", fontFamily: T.sans, opacity: sendingWelcome === v.id ? 0.7 : 1 }}>
                      {sendingWelcome === v.id ? "Sending..." : v.welcome_sent ? "📧 Re-send" : "📧 Send Welcome"}
                    </button>
                  )}
                  <button onClick={() => deleteVendor(v)}
                    style={{ padding: "6px 12px", fontSize: 11, fontWeight: 700, background: "#FFEBEE", color: "#c0392b", border: "1px solid #EF9A9A", borderRadius: 6, cursor: "pointer", fontFamily: T.sans }}>
                    🗑️ Delete
                  </button>
                </div>
              </div>

              {/* Password Set Inline */}
              {setPassId === v.id && (
                <div style={{ marginTop: 10, background: T.parchment, borderRadius: 8, padding: "10px 12px", border: `1px solid ${T.border}` }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: T.brownDark, fontFamily: T.sans, marginBottom: 6 }}>Set vendor login password:</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input type="text" value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="Enter password..."
                      style={{ flex: 1, padding: "6px 10px", fontSize: 13, border: `1px solid ${T.border}`, borderRadius: 6, background: T.cream, fontFamily: T.sans }} />
                    <button onClick={() => savePassword(v)}
                      style={{ padding: "6px 14px", fontSize: 12, fontWeight: 700, background: "#1A6B3C", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontFamily: T.sans }}>
                      Save
                    </button>
                  </div>
                  <div style={{ fontSize: 10, color: T.brownLight, fontFamily: T.sans, marginTop: 4 }}>Login email: {v.login_email || v.email || "(none)"}</div>
                </div>
              )}

              {/* Notes */}
              {v.notes && (
                <div style={{ marginTop: 8, fontSize: 11, color: T.brownLight, fontFamily: T.sans, fontStyle: "italic", borderTop: `1px solid ${T.border}`, paddingTop: 6 }}>
                  📝 {v.notes.substring(0, 180)}{v.notes.length > 180 ? "…" : ""}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editVendor && (
        <div onClick={() => setEditVendor(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 9000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: T.parchment, borderRadius: 12, padding: 20, maxWidth: 540, width: "100%", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 8px 32px rgba(0,0,0,0.25)" }}>
            <h3 style={{ margin: "0 0 14px", color: T.brownDark, fontFamily: T.font, fontSize: 16 }}>✏️ Edit Vendor: {editVendor.name}</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }}>
              {[
                { field: "name", label: "Business Name" },
                { field: "vendor_id", label: "Vendor ID (VM-XXXX)" },
                { field: "category", label: "Category", type: "select", options: ["Farm & Fresh Produce","Food, Baked Goods & Sweets","Wellness & Body","Art, Jewelry & Gifts","Home, Yard & Golf Cart"] },
                { field: "location", label: "Location (City, FL)" },
                { field: "phone", label: "Phone (not shown publicly)" },
                { field: "email", label: "Email (admin-only, not public)" },
                { field: "website", label: "Website URL" },
                { field: "facebook_url", label: "Facebook URL" },
                { field: "instagram_url", label: "Instagram URL" },
                { field: "schedule", label: "Market Schedule" },
                { field: "login_email", label: "Login Email" },
                { field: "login_password", label: "Temp Password" },
              ].map(({ field, label, type, options }) => (
                <div key={field} style={{ marginBottom: 8 }}>
                  <label style={labelS}>{label}</label>
                  {type === "select" ? (
                    <select value={editForm[field] || ""} onChange={e => setEditForm(f => ({ ...f, [field]: e.target.value }))} style={inputS}>
                      {options.map(o => <option key={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input type="text" value={editForm[field] || ""} onChange={e => setEditForm(f => ({ ...f, [field]: e.target.value }))} style={inputS} />
                  )}
                </div>
              ))}
            </div>
            <div style={{ marginBottom: 8 }}>
              <label style={labelS}>Description</label>
              <textarea value={editForm.description || ""} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                style={{ ...inputS, height: 80, resize: "vertical" }} />
            </div>
            <div style={{ marginBottom: 8 }}>
              <label style={labelS}>Internal Notes (admin only)</label>
              <textarea value={editForm.notes || ""} onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))}
                style={{ ...inputS, height: 60, resize: "vertical" }} />
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 4, flexWrap: "wrap" }}>
              {[
                { field: "is_active", label: "Active / Public" },
                { field: "is_verified", label: "Verified" },
                { field: "welcome_sent", label: "Welcome Sent" },
                { field: "password_changed", label: "PW Changed" },
              ].map(({ field, label }) => (
                <label key={field} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontFamily: T.sans, color: T.brownDark, cursor: "pointer" }}>
                  <input type="checkbox" checked={!!editForm[field]} onChange={e => setEditForm(f => ({ ...f, [field]: e.target.checked }))} /> {label}
                </label>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 14, justifyContent: "flex-end" }}>
              <button onClick={() => setEditVendor(null)} style={{ padding: "10px 16px", background: T.parchmentDark, color: T.brownDark, border: `1px solid ${T.border}`, borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: T.sans }}>Cancel</button>
              <button onClick={saveEdit} disabled={saving} style={{ padding: "10px 20px", background: "#1A6B3C", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: T.sans }}>
                {saving ? "Saving..." : "💾 Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Wekcadmin() {
  const [unlocked, setUnlocked] = useState(false);
  const [adminPin, setAdminPin] = useState("");
  return unlocked ? <Dashboard adminPin={adminPin} /> : <MagicLinkGate onUnlock={(p) => { setAdminPin(p); setUnlocked(true); }} />;
}
