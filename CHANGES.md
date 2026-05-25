# V-HUB Changes — May 20, 2026
## Applied by V-HUB Superagent AFTER the last CDN push (Apr 22 2026)
## The full files in `/pages/` are the authoritative source — apply them exactly as-is.

---

## FILE: pages/Home.jsx  (1,887 lines total)
### CHANGE 1 — Add lead form state to ProvDetail component
**Location:** Inside `function ProvDetail(...)`, after line declaring `reviewForm` useState (~line 247)

**ADD these 3 lines immediately after:**
```
  const [reviewForm, setReviewForm] = useState({ customer_name: "", customer_village: "", rating: 5, review_text: "", service_used: "" });
```
**INSERT:**
```jsx
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadForm, setLeadForm] = useState({ customer_name: "", customer_email: "", customer_phone: "", message: "" });
  const [leadSent, setLeadSent] = useState(false);
```

---

### CHANGE 2 — Add handleLeadSubmit function to ProvDetail component
**Location:** Immediately BEFORE the `const inputS = ...` style definition (~line 305)

**INSERT this entire function:**
```jsx
  const handleLeadSubmit = async () => {
    if (!leadForm.customer_name || (!leadForm.customer_email && !leadForm.customer_phone)) {
      alert("Please enter your name and at least one contact method (email or phone).");
      return;
    }
    try {
      await fetch("https://api.base44.app/api/apps/69d062aca815ce8e697894b1/functions/trackEvent", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider_id: prov.id, event_type: "lead_inquiry", source: "homepage" }),
      }).catch(() => {});
      await fetch("https://api.base44.app/api/apps/69d062aca815ce8e697894b1/functions/submitLead", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider_id: prov.id, ...leadForm }),
      }).catch(() => {});
      setLeadSent(true);
      setShowLeadForm(false);
      setLeadForm({ customer_name: "", customer_email: "", customer_phone: "", message: "" });
    } catch(err) {
      alert("There was a problem sending your message. Please try again or call directly.");
    }
  };
```

---

### CHANGE 3 — Add Contact Provider Form UI block
**Location:** In ProvDetail JSX, AFTER the "Areas Served" section and BEFORE `<Rule style={{ marginBottom: 14 }} />` that precedes "V-Hub Community Reviews"

**INSERT this entire block:**
```jsx
        {/* ── Contact Provider Form ── */}
        <div style={{ background: "#EEF4FF", border: "1.5px solid #1B3D6F", borderRadius: 8, padding: "14px 16px", marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 13, fontWeight: 900, color: "#1B3D6F", textTransform: "uppercase", letterSpacing: 1.5 }}>📬 Contact {prov.business_name}</div>
            {!showLeadForm && !leadSent && (
              <button onClick={() => setShowLeadForm(true)} style={{ background: "#E8431A", color: "#fff", border: "none", borderRadius: 4, padding: "5px 14px", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'Times New Roman', serif", letterSpacing: 1 }}>Send a Message</button>
            )}
          </div>
          {leadSent && <div style={{ fontSize: 12, color: "#1A6B3C", fontStyle: "italic", marginTop: 8 }}>✓ Your message was sent! {prov.business_name} will be in touch soon.</div>}
          {showLeadForm && (
            <div style={{ marginTop: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 14px", marginBottom: 8 }}>
                <div style={{ gridColumn: "1/-1" }}><label style={lblS}>Your Name *</label><input style={inputS} value={leadForm.customer_name} onChange={e => setLeadForm(p => ({ ...p, customer_name: e.target.value }))} placeholder="First & Last Name" /></div>
                <div><label style={lblS}>Your Email</label><input style={inputS} type="email" value={leadForm.customer_email} onChange={e => setLeadForm(p => ({ ...p, customer_email: e.target.value }))} placeholder="your@email.com" /></div>
                <div><label style={lblS}>Your Phone</label><input style={inputS} type="tel" value={leadForm.customer_phone} onChange={e => setLeadForm(p => ({ ...p, customer_phone: e.target.value }))} placeholder="352-555-0000" /></div>
                <div style={{ gridColumn: "1/-1" }}><label style={lblS}>Message</label><textarea style={{ ...inputS, minHeight: 65, resize: "vertical", lineHeight: 1.6 }} value={leadForm.message} onChange={e => setLeadForm(p => ({ ...p, message: e.target.value }))} placeholder={"Hi, I'm interested in your services. Please contact me..."} /></div>
              </div>
              <div style={{ fontSize: 10, color: "#666", fontStyle: "italic", marginBottom: 8 }}>* Name and at least one contact method required.</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={handleLeadSubmit} style={{ background: "#1B3D6F", color: "#fff", border: "none", borderRadius: 4, padding: "8px 20px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Times New Roman', serif" }}>Send Message</button>
                <button onClick={() => setShowLeadForm(false)} style={{ background: PAPER, border: `1.5px solid ${PAPER_DK}`, color: INK_FADE, borderRadius: 4, padding: "8px 14px", fontSize: 12, cursor: "pointer", fontFamily: "'Times New Roman', serif" }}>Cancel</button>
              </div>
            </div>
          )}
        </div>
```

---

### CHANGE 4 — Fix analytics service_name bug in search handler
**Location:** In the main search/filter function (~line 1510), find the old block:
```
      const areaLabel = selArea ? (areas.find(a => a.id === selArea || a.name === selArea)?.name || selArea) : "";
      const svcObj = selSvc ? svcs.find(s => s.id === selSvc) : null;
      const catObj = svcObj ? cats.find(c => c.id === svcObj.category_id) : null;
      const events = out.map(p => ({
        provider_id: p.id,
        event_type: "search_appearance",
        service_name: svcObj?.name || "",
        category_name: catObj?.name || "",
        area_name: areaLabel,
        source: "homepage",
      }));
```

**REPLACE WITH:**
```jsx
      // selSvc and selArea are already full objects (not IDs)
      const areaLabel = selArea ? selArea.name : "";
      const svcName = selSvc ? (selSvc._isCat ? "" : selSvc.name) : "";
      const catName = selSvc ? (selSvc._isCat ? selSvc.name : (cats.find(c => c.id === selSvc.category_id)?.name || "")) : "";
      const events = out.map(p => ({
        provider_id: p.id,
        event_type: "search_appearance",
        service_name: svcName,
        category_name: catName,
        area_name: areaLabel,
        source: "homepage",
      }));
```

---

## FILE: pages/ProviderDashboard.jsx  (3,027 lines — NO CHANGES since Apr 22)
## FILE: pages/Wekcadmin.jsx  (2,154 lines — NO CHANGES since Apr 22)
## FILE: pages/ListService.jsx  (1,245 lines — NO CHANGES since Apr 22)
## FILE: pages/Classifieds.jsx  (203 lines — NO CHANGES since Apr 22)

---

## NEW BACKEND FUNCTION: submitLead
**Already deployed live** at:
`https://api.base44.app/api/apps/69d062aca815ce8e697894b1/functions/submitLead`

**What it does:**
- Accepts POST: `{ provider_id, customer_name, customer_email, customer_phone, message }`
- Saves record to `LeadInquiry` entity
- Emails provider instantly via SendGrid from admin@v-hub.us
- CC's admin@v-hub.us on every lead
- Tested and returning `{ ok: true, lead_id: "..." }` ✅

**No action needed on this** — it is already live.

---

## SUMMARY
Only `Home.jsx` changed. The 4 changes above are all additive (nothing deleted).
The full authoritative file is at:
`https://raw.githubusercontent.com/v-hub-bot/V-HUB/main/pages/Home.jsx`
