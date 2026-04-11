import React, { useState, useEffect } from "react";
import { ServiceArea, Category, Service, Provider, ProviderReview, User } from "@/api/entities";

const BRAND = {
  orange: "#E8431A",
  teal: "#00BFA5",
  blue: "#1A3F70",
  lightBg: "#F5F7FA",
  dark: "#1A0A00",
};

const ADMIN_EMAILS = ["kimberlycook1980@gmail.com", "5bebegurlz@gmail.com", "evansrus@comcast.net"];

const ALL_SERVICES = [
  "Cleaning Services","Deep Cleaning","Move-In/Move-Out Cleaning","Window Cleaning","Pressure Washing",
  "Lawn Care & Mowing","Landscaping & Design","Tree Trimming & Removal","Irrigation & Sprinkler",
  "Pest Control","Pool Service & Maintenance","Pool Repair","Handyman Services","Plumbing","Electrical",
  "HVAC / Air Conditioning","Roofing","Painting (Interior)","Painting (Exterior)","Flooring Installation",
  "Tile & Grout","Drywall Repair","Cabinet Refinishing","Kitchen Remodeling","Bathroom Remodeling",
  "Home Additions","Garage Door Service","Fence Installation & Repair","Deck & Patio","Screen Enclosures",
  "Window & Door Installation","Insulation","Generator Installation","Solar Panels","Home Inspection",
  "Moving Services","Junk Removal","House Sitting","Personal Chef","Grocery Delivery",
  "Errand Services","Notary Services","Pet Sitting & Dog Walking","Pet Grooming","Veterinary Services",
  "Senior Care & Companionship","Physical Therapy","Home Health Aide","Medical Transport",
  "Financial Planning","Tax Preparation","Insurance","Real Estate","Legal Services",
  "Auto Repair","Auto Detailing","Computer & Tech Support","Photography","Event Planning",
  "Catering","Tutoring & Lessons","Golf Cart Sales & Repair","Alterations & Tailoring","Hair & Nail Services"
];

const VILLAGES = [
  "Buttonwood","Calumet Grove","Chartres","Collier","Dabney","DeSoto",
  "DuVal","Duval","Fenney","Gilchrist","Hacienda Hills","Hamilton",
  "Hillsborough","Chitty Chatty","Johnston","Lake Deaton","Lake Sumter Landing",
  "Lakeview","Largo","Laurel Valley","Liberty Park","Lynnhaven","Mallory Square",
  "Marsh Bend","McClure","Medallion","Mira Mesa","Monarch Grove","Mulberry Grove",
  "Osceola Hills","Palmer Legends","Pennecamp","Pine Hills","Piñellas",
  "Poinciana","Rio Grande","Rio Ponderosa","Sabal Chase","Sanibel",
  "Santiago","Santo Domingo","Sarasota","Silver Lake","Summerhill",
  "Sumter Landing","Sunset Pointe","Tamarind Grove","Tierra Del Sol",
  "Tierra Del Sol South","Tillandsia","Titusville","Tortuga","Tri-County",
  "Twin Lakes","Vault","Vera Cruz","Verandah","Village of Bonita",
  "Village of Chatham","Winifred","Woodbury","Woodlands"
];

// ── Helpers ───────────────────────────────────────────────────────────────
function daysLeft(trialEndDate) {
  if (!trialEndDate) return null;
  const end = new Date(trialEndDate);
  const now = new Date();
  const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  return diff;
}

function trialBadge(provider) {
  if (provider.subscription_status === "active") return { label: "ACTIVE", color: "#00897b" };
  if (provider.subscription_status === "cancelled") return { label: "CANCELLED", color: "#888" };
  if (provider.subscription_status === "trial_expired") return { label: "TRIAL EXPIRED", color: "#c00" };
  if (provider.subscription_status === "past_due") return { label: "PAST DUE", color: "#e65100" };
  if (provider.subscription_status === "pending") return { label: "PENDING", color: "#f59e0b" };
  if (provider.subscription_status === "trial") {
    const d = daysLeft(provider.trial_end_date);
    if (d === null) return { label: "TRIAL", color: BRAND.teal };
    if (d <= 0) return { label: "TRIAL EXPIRED", color: "#c00" };
    if (d <= 7) return { label: `TRIAL — ${d}d left`, color: "#e65100" };
    return { label: `TRIAL — ${d}d left`, color: BRAND.teal };
  }
  return { label: provider.subscription_status || "UNKNOWN", color: "#888" };
}

function getWelcomeName(user) {
  if (!user) return "Admin";
  const email = user.email || "";
  if (email === "kimberlycook1980@gmail.com" || email === "5bebegurlz@gmail.com") return "Kimberly";
  if (email === "evansrus@comcast.net") return "Bill";
  return user.full_name || email;
}

// ── Access Denied ─────────────────────────────────────────────────────────
function AccessDenied() {
  return (
    <div style={{ minHeight: "100vh", background: BRAND.lightBg, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, padding: 30 }}>
      <img src="https://media.base44.com/images/public/69d062aca815ce8e697894b1/a9af95bc3_V-Hublogo.png" style={{ width: 72, borderRadius: 12 }} alt="V-Hub" />
      <div style={{ fontSize: 22, fontWeight: 800, color: "#c00" }}>Access Restricted</div>
      <div style={{ fontSize: 15, color: "#555", textAlign: "center", maxWidth: 320 }}>
        This page is only available to V-Hub administrators. Please sign in with your admin account.
      </div>
      <a href="/" style={{ background: BRAND.orange, color: "#fff", textDecoration: "none", borderRadius: 10, padding: "12px 24px", fontWeight: 700, fontSize: 15 }}>Back to V-Hub</a>
    </div>
  );
}

// ── Admin Add Provider Modal ──────────────────────────────────────────────
function AdminAddProviderModal({ categories, onClose, onSaved }) {
  const blank = {
    business_name: "", owner_name: "", email: "", phone: "",
    website: "", address: "", description: "", years_in_business: "",
    license_number: "", category_id: "", notes: "",
    services: [], service_areas: []
  };
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const toggleService = (s) => {
    setForm(f => ({
      ...f,
      services: f.services.includes(s) ? f.services.filter(x => x !== s) : [...f.services, s]
    }));
  };

  const toggleArea = (a) => {
    setForm(f => ({
      ...f,
      service_areas: f.service_areas.includes(a) ? f.service_areas.filter(x => x !== a) : [...f.service_areas, a]
    }));
  };

  const save = async () => {
    setError("");
    if (!form.business_name || !form.owner_name || !form.email) {
      setError("Business name, owner name, and email are required.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("https://api.base44.app/api/apps/69d062aca815ce8e697894b1/functions/addProviderByAdmin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add provider");
      setSuccess(`✅ Provider added! VH Number: ${data.vh_number}. Welcome email sent.`);
      setTimeout(() => { onSaved(); }, 2500);
    } catch (e) {
      setError(e.message);
    }
    setSaving(false);
  };

  const labelStyle = { fontSize: 12, fontWeight: 700, color: "#444", marginBottom: 3, display: "block" };
  const inputStyle = { width: "100%", padding: "9px 10px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14, boxSizing: "border-box" };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 999, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: 24, width: "100%", maxWidth: 560, maxHeight: "92vh", overflowY: "auto", boxShadow: "0 8px 40px rgba(0,0,0,0.2)" }}>
        <div style={{ fontWeight: 800, fontSize: 19, marginBottom: 4, color: BRAND.dark }}>Add Provider (Admin)</div>
        <div style={{ fontSize: 13, color: "#888", marginBottom: 20 }}>Provider will receive a welcome email with their 45-day free trial details. No card required.</div>

        {error && <div style={{ background: "#fee", border: "1px solid #fcc", borderRadius: 8, padding: "10px 14px", marginBottom: 14, fontSize: 13, color: "#c00" }}>{error}</div>}
        {success && <div style={{ background: "#efe", border: "1px solid #bdb", borderRadius: 8, padding: "10px 14px", marginBottom: 14, fontSize: 13, color: "#2a7a2a" }}>{success}</div>}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
          {[["business_name","Business Name *"],["owner_name","Owner Name *"],["email","Email *"],["phone","Phone"],["website","Website"],["address","Address"]].map(([k,l]) => (
            <div key={k} style={{ gridColumn: k === "address" || k === "email" ? "1 / -1" : "auto" }}>
              <label style={labelStyle}>{l}</label>
              <input value={form[k] || ""} onChange={e => set(k, e.target.value)} style={inputStyle} />
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
          <div>
            <label style={labelStyle}>Years in Business</label>
            <input type="number" value={form.years_in_business || ""} onChange={e => set("years_in_business", e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>License Number</label>
            <input value={form.license_number || ""} onChange={e => set("license_number", e.target.value)} style={inputStyle} />
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>Category</label>
          <select value={form.category_id || ""} onChange={e => set("category_id", e.target.value)} style={inputStyle}>
            <option value="">- Select Category -</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>Description</label>
          <textarea value={form.description || ""} onChange={e => set("description", e.target.value)} rows={3} style={{ ...inputStyle, resize: "vertical" }} />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>Admin Notes (internal only)</label>
          <textarea value={form.notes || ""} onChange={e => set("notes", e.target.value)} rows={2} style={{ ...inputStyle, resize: "vertical" }} />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Services Offered ({form.services.length} selected)</label>
          <div style={{ maxHeight: 150, overflowY: "auto", border: "1px solid #ddd", borderRadius: 8, padding: 10, display: "flex", flexWrap: "wrap", gap: 6 }}>
            {ALL_SERVICES.map(s => (
              <button key={s} onClick={() => toggleService(s)} style={{ background: form.services.includes(s) ? BRAND.teal : "#f0f0f0", color: form.services.includes(s) ? "#fff" : "#333", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 12, cursor: "pointer", fontWeight: form.services.includes(s) ? 700 : 400 }}>{s}</button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>Villages / Areas Served ({form.service_areas.length} selected)</label>
          <div style={{ maxHeight: 150, overflowY: "auto", border: "1px solid #ddd", borderRadius: 8, padding: 10, display: "flex", flexWrap: "wrap", gap: 6 }}>
            {VILLAGES.map(v => (
              <button key={v} onClick={() => toggleArea(v)} style={{ background: form.service_areas.includes(v) ? BRAND.orange : "#f0f0f0", color: form.service_areas.includes(v) ? "#fff" : "#333", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 12, cursor: "pointer", fontWeight: form.service_areas.includes(v) ? 700 : 400 }}>{v}</button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ background: "#f0f0f0", color: "#333", border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 700, cursor: "pointer" }}>Cancel</button>
          <button onClick={save} disabled={saving || !!success} style={{ background: BRAND.orange, color: "#fff", border: "none", borderRadius: 8, padding: "10px 22px", fontWeight: 700, cursor: "pointer", opacity: saving ? 0.7 : 1 }}>
            {saving ? "Adding..." : "Add Provider & Send Email"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Provider Card ─────────────────────────────────────────────────────────
function ProviderCard({ provider, categories, onRefresh }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [expanded, setExpanded] = useState(false);
  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(""), 3000); };

  const badge = trialBadge(provider);
  const days = daysLeft(provider.trial_end_date);
  const catName = categories.find(c => c.id === provider.category_id)?.name || "—";

  const toggleActive = async () => {
    setBusy(true);
    await Provider.update(provider.id, { is_active: !provider.is_active, is_visible: !provider.is_active });
    flash(provider.is_active ? "Provider deactivated." : "Provider activated.");
    onRefresh();
    setBusy(false);
  };

  const approve = async () => {
    setBusy(true);
    await Provider.update(provider.id, { is_visible: true, subscription_status: "trial", is_active: true });
    flash("Provider approved and visible.");
    onRefresh();
    setBusy(false);
  };

  const remove = async () => {
    if (!window.confirm(`Delete ${provider.business_name} permanently?`)) return;
    setBusy(true);
    await Provider.delete(provider.id);
    onRefresh();
    setBusy(false);
  };

  return (
    <div style={{ background: "#fff", borderRadius: 12, marginBottom: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.07)", borderLeft: `4px solid ${badge.color}`, overflow: "hidden" }}>
      <div style={{ padding: "14px 16px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <div style={{ fontWeight: 800, fontSize: 15, color: BRAND.dark }}>{provider.business_name}</div>
              {provider.vh_number && <span style={{ fontSize: 11, fontWeight: 700, color: BRAND.blue, background: "#e8f0fe", borderRadius: 5, padding: "2px 7px" }}>{provider.vh_number}</span>}
              {provider.onboarding_type && <span style={{ fontSize: 10, color: "#888", background: "#f5f5f5", borderRadius: 5, padding: "2px 6px" }}>{provider.onboarding_type === "admin" ? "Admin-added" : "Self-signup"}</span>}
            </div>
            <div style={{ fontSize: 13, color: "#555", marginTop: 3 }}>{provider.owner_name} | {catName}</div>
            <div style={{ fontSize: 12, color: "#888", marginTop: 1 }}>{provider.email} {provider.phone ? `· ${provider.phone}` : ""}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: badge.color, background: badge.color + "18", borderRadius: 6, padding: "3px 8px" }}>{badge.label}</span>
            {provider.trial_end_date && (
              <span style={{ fontSize: 11, color: "#888" }}>
                Ends {new Date(provider.trial_end_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
            )}
          </div>
        </div>

        {/* Trial bar */}
        {provider.subscription_status === "trial" && days !== null && days > 0 && (
          <div style={{ marginTop: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#888", marginBottom: 3 }}>
              <span>Trial progress</span><span>{days} days remaining</span>
            </div>
            <div style={{ background: "#f0f0f0", borderRadius: 4, height: 6 }}>
              <div style={{ background: days <= 7 ? "#e65100" : BRAND.teal, borderRadius: 4, height: 6, width: `${Math.max(5, Math.min(100, ((45 - days) / 45) * 100))}%` }} />
            </div>
          </div>
        )}

        {msg && <div style={{ marginTop: 8, fontSize: 12, color: "#00897b", fontStyle: "italic" }}>{msg}</div>}

        <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap", alignItems: "center" }}>
          {provider.subscription_status === "pending" && (
            <button onClick={approve} disabled={busy} style={{ background: BRAND.teal, color: "#fff", border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>✓ Approve</button>
          )}
          <button onClick={toggleActive} disabled={busy} style={{ background: provider.is_active ? "#e65100" : BRAND.teal, color: "#fff", border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
            {provider.is_active ? "Deactivate" : "Activate"}
          </button>
          <button onClick={() => setExpanded(e => !e)} style={{ background: "#f0f0f0", color: "#333", border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            {expanded ? "▲ Less" : "▼ Details"}
          </button>
          <button onClick={remove} disabled={busy} style={{ background: "#fff", color: "#c00", border: "1px solid #c00", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer", marginLeft: "auto" }}>Delete</button>
        </div>
      </div>

      {expanded && (
        <div style={{ borderTop: "1px solid #f0f0f0", padding: "14px 16px", background: "#fafafa", fontSize: 13 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {provider.website && <div><strong>Website:</strong> <a href={provider.website} target="_blank" rel="noreferrer" style={{ color: BRAND.orange }}>{provider.website}</a></div>}
            {provider.address && <div><strong>Address:</strong> {provider.address}</div>}
            {provider.license_number && <div><strong>License:</strong> {provider.license_number}</div>}
            {provider.years_in_business > 0 && <div><strong>Years in business:</strong> {provider.years_in_business}</div>}
            {provider.stripe_customer_id && <div><strong>Stripe Customer:</strong> <span style={{ fontFamily: "monospace", fontSize: 11 }}>{provider.stripe_customer_id}</span></div>}
            <div><strong>Onboarding:</strong> {provider.onboarding_type === "admin" ? "Added by admin" : "Self-signup"}</div>
            {provider.trial_start_date && <div><strong>Trial started:</strong> {new Date(provider.trial_start_date).toLocaleDateString()}</div>}
          </div>
          {provider.services?.length > 0 && <div style={{ marginTop: 8 }}><strong>Services:</strong> {provider.services.join(", ")}</div>}
          {provider.service_areas?.length > 0 && <div style={{ marginTop: 6 }}><strong>Villages:</strong> {provider.service_areas.join(", ")}</div>}
          {provider.description && <div style={{ marginTop: 6 }}><strong>About:</strong> {provider.description}</div>}
          {provider.notes && <div style={{ marginTop: 6, background: "#fff8e1", borderRadius: 6, padding: "8px 10px" }}><strong>Admin notes:</strong> {provider.notes}</div>}
        </div>
      )}
    </div>
  );
}

// ── Reviews Tab ───────────────────────────────────────────────────────────
function ReviewsTab({ reviews, onRefresh }) {
  const [filter, setFilter] = useState("pending");
  const filtered = reviews.filter(r => filter === "all" ? true : filter === "pending" ? !r.is_approved : r.is_approved);

  const approve = async (r) => {
    await ProviderReview.update(r.id, { is_approved: true });
    onRefresh();
  };
  const remove = async (r) => {
    if (!window.confirm("Delete this review?")) return;
    await ProviderReview.delete(r.id);
    onRefresh();
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        {["pending", "approved", "all"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ background: filter === f ? BRAND.orange : "#eee", color: filter === f ? "#fff" : "#333", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", textTransform: "capitalize" }}>{f}</button>
        ))}
      </div>
      {filtered.length === 0 && <div style={{ color: "#999", fontSize: 14, padding: 20 }}>No reviews in this category.</div>}
      {filtered.map(r => (
        <div key={r.id} style={{ background: "#fff", borderRadius: 12, padding: "14px 16px", marginBottom: 10, boxShadow: "0 2px 6px rgba(0,0,0,0.07)", borderLeft: `4px solid ${r.is_approved ? BRAND.teal : "#e65100"}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{r.customer_name}</div>
              <div style={{ fontSize: 12, color: "#888" }}>{r.customer_village} | {r.service_used}</div>
              <div style={{ fontSize: 13, marginTop: 6, color: "#333" }}>{r.review_text}</div>
            </div>
            <div style={{ fontSize: 18, color: "#f59e0b" }}>{"★".repeat(r.rating || 0)}</div>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            {!r.is_approved && <button onClick={() => approve(r)} style={{ background: BRAND.teal, color: "#fff", border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Approve</button>}
            <button onClick={() => remove(r)} style={{ background: "#fff", color: "#c00", border: "1px solid #c00", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Categories Tab ────────────────────────────────────────────────────────
function CategoriesTab({ categories, onRefresh }) {
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: "", icon: "", description: "", is_active: true });
  const [saving, setSaving] = useState(false);
  const inputStyle = { width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14, boxSizing: "border-box", marginBottom: 10 };

  const openAdd = () => { setForm({ name: "", icon: "", description: "", is_active: true }); setEditItem(null); setShowForm(true); };
  const openEdit = (c) => { setForm(c); setEditItem(c); setShowForm(true); };
  const save = async () => {
    setSaving(true);
    if (editItem) await Category.update(editItem.id, form);
    else await Category.create(form);
    setSaving(false); setShowForm(false); onRefresh();
  };
  const remove = async (c) => {
    if (!window.confirm("Delete category?")) return;
    await Category.delete(c.id); onRefresh();
  };

  return (
    <div>
      <button onClick={openAdd} style={{ background: BRAND.orange, color: "#fff", border: "none", borderRadius: 10, padding: "10px 18px", fontWeight: 700, fontSize: 14, cursor: "pointer", marginBottom: 16 }}>+ Add Category</button>
      {showForm && (
        <div style={{ background: "#fff", borderRadius: 12, padding: 20, marginBottom: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          <input placeholder="Category name" value={form.name || ""} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={inputStyle} />
          <input placeholder="Icon emoji" value={form.icon || ""} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} style={inputStyle} />
          <input placeholder="Description" value={form.description || ""} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={inputStyle} />
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={save} disabled={saving} style={{ background: BRAND.orange, color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontWeight: 700, cursor: "pointer" }}>{saving ? "Saving..." : "Save"}</button>
            <button onClick={() => setShowForm(false)} style={{ background: "#eee", color: "#333", border: "none", borderRadius: 8, padding: "8px 16px", fontWeight: 700, cursor: "pointer" }}>Cancel</button>
          </div>
        </div>
      )}
      {categories.map(c => (
        <div key={c.id} style={{ background: "#fff", borderRadius: 10, padding: "12px 16px", marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div><span style={{ fontSize: 20, marginRight: 8 }}>{c.icon}</span><strong>{c.name}</strong></div>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => openEdit(c)} style={{ background: "#f0f0f0", border: "none", borderRadius: 7, padding: "5px 10px", cursor: "pointer", fontSize: 12 }}>Edit</button>
            <button onClick={() => remove(c)} style={{ background: "#fff", color: "#c00", border: "1px solid #c00", borderRadius: 7, padding: "5px 10px", cursor: "pointer", fontSize: 12 }}>Del</button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Services Tab ──────────────────────────────────────────────────────────
function ServicesTab({ services, categories, onRefresh }) {
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [filterCat, setFilterCat] = useState("all");
  const inputStyle = { width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14, boxSizing: "border-box", marginBottom: 10 };

  const openAdd = () => { setForm({ name: "", category_id: "", is_active: true }); setEditItem(null); setShowForm(true); };
  const openEdit = (s) => { setForm(s); setEditItem(s); setShowForm(true); };
  const save = async () => {
    setSaving(true);
    if (editItem) await Service.update(editItem.id, form);
    else await Service.create(form);
    setSaving(false); setShowForm(false); onRefresh();
  };
  const remove = async (s) => {
    if (!window.confirm("Delete service?")) return;
    await Service.delete(s.id); onRefresh();
  };

  const filtered = filterCat === "all" ? services : services.filter(s => s.category_id === filterCat);

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        <button onClick={openAdd} style={{ background: BRAND.orange, color: "#fff", border: "none", borderRadius: 10, padding: "9px 16px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>+ Add Service</button>
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)} style={{ padding: "9px 12px", borderRadius: 10, border: "1px solid #ddd", fontSize: 13, cursor: "pointer" }}>
          <option value="all">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      {showForm && (
        <div style={{ background: "#fff", borderRadius: 12, padding: 20, marginBottom: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          <input placeholder="Service name" value={form.name || ""} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={inputStyle} />
          <select value={form.category_id || ""} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))} style={inputStyle}>
            <option value="">- Select Category -</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={save} disabled={saving} style={{ background: BRAND.orange, color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontWeight: 700, cursor: "pointer" }}>{saving ? "Saving..." : "Save"}</button>
            <button onClick={() => setShowForm(false)} style={{ background: "#eee", color: "#333", border: "none", borderRadius: 8, padding: "8px 16px", fontWeight: 700, cursor: "pointer" }}>Cancel</button>
          </div>
        </div>
      )}
      <div style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>{filtered.length} services</div>
      {filtered.map(s => (
        <div key={s.id} style={{ background: "#fff", borderRadius: 10, padding: "11px 16px", marginBottom: 7, display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{s.name}</div>
            <div style={{ fontSize: 12, color: "#888" }}>{categories.find(c => c.id === s.category_id)?.name || "—"}</div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => openEdit(s)} style={{ background: "#f0f0f0", border: "none", borderRadius: 7, padding: "5px 10px", cursor: "pointer", fontSize: 12 }}>Edit</button>
            <button onClick={() => remove(s)} style={{ background: "#fff", color: "#c00", border: "1px solid #c00", borderRadius: 7, padding: "5px 10px", cursor: "pointer", fontSize: 12 }}>Del</button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Service Areas Tab ─────────────────────────────────────────────────────
function AreasTab({ areas, onRefresh }) {
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: "", is_active: true });
  const [saving, setSaving] = useState(false);
  const inputStyle = { width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14, boxSizing: "border-box", marginBottom: 10 };

  const openAdd = () => { setForm({ name: "", is_active: true }); setEditItem(null); setShowForm(true); };
  const openEdit = (a) => { setForm(a); setEditItem(a); setShowForm(true); };
  const save = async () => {
    setSaving(true);
    if (editItem) await ServiceArea.update(editItem.id, form);
    else await ServiceArea.create(form);
    setSaving(false); setShowForm(false); onRefresh();
  };
  const remove = async (a) => {
    if (!window.confirm("Delete area?")) return;
    await ServiceArea.delete(a.id); onRefresh();
  };

  return (
    <div>
      <button onClick={openAdd} style={{ background: BRAND.orange, color: "#fff", border: "none", borderRadius: 10, padding: "10px 18px", fontWeight: 700, fontSize: 14, cursor: "pointer", marginBottom: 16 }}>+ Add Area</button>
      {showForm && (
        <div style={{ background: "#fff", borderRadius: 12, padding: 20, marginBottom: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          <input placeholder="Village/Area name" value={form.name || ""} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={inputStyle} />
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={save} disabled={saving} style={{ background: BRAND.orange, color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontWeight: 700, cursor: "pointer" }}>{saving ? "Saving..." : "Save"}</button>
            <button onClick={() => setShowForm(false)} style={{ background: "#eee", color: "#333", border: "none", borderRadius: 8, padding: "8px 16px", fontWeight: 700, cursor: "pointer" }}>Cancel</button>
          </div>
        </div>
      )}
      {areas.map(a => (
        <div key={a.id} style={{ background: "#fff", borderRadius: 10, padding: "11px 16px", marginBottom: 7, display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div style={{ fontWeight: 600 }}>{a.name}</div>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => openEdit(a)} style={{ background: "#f0f0f0", border: "none", borderRadius: 7, padding: "5px 10px", cursor: "pointer", fontSize: 12 }}>Edit</button>
            <button onClick={() => remove(a)} style={{ background: "#fff", color: "#c00", border: "1px solid #c00", borderRadius: 7, padding: "5px 10px", cursor: "pointer", fontSize: 12 }}>Del</button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── MAIN ADMIN PAGE ───────────────────────────────────────────────────────
export default function Admin() {
  const [currentUser, setCurrentUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [activeTab, setActiveTab] = useState("Providers");
  const [providers, setProviders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [areas, setAreas] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddProvider, setShowAddProvider] = useState(false);
  const [providerFilter, setProviderFilter] = useState("all");
  const [trialFilter, setTrialFilter] = useState("all");

  useEffect(() => {
    User.me()
      .then(u => { setCurrentUser(u); setChecking(false); })
      .catch(() => { setCurrentUser(null); setChecking(false); });
  }, []);

  const isAdmin = currentUser && (currentUser.role === "admin" || ADMIN_EMAILS.includes(currentUser.email));

  const loadAll = async () => {
    setLoading(true);
    try {
      const [p, c, s, a, r] = await Promise.allSettled([
        Provider.list(), Category.list(), Service.list(), ServiceArea.list(), ProviderReview.list()
      ]);
      setProviders(p.status === "fulfilled" ? (p.value || []) : []);
      setCategories(c.status === "fulfilled" ? (c.value || []) : []);
      setServices(s.status === "fulfilled" ? (s.value || []) : []);
      setAreas(a.status === "fulfilled" ? (a.value || []) : []);
      setReviews(r.status === "fulfilled" ? (r.value || []) : []);
    } catch (e) { console.error("Admin load error:", e); }
    setLoading(false);
  };

  useEffect(() => { if (isAdmin) loadAll(); }, [isAdmin]);

  if (checking) return (
    <div style={{ minHeight: "100vh", background: BRAND.lightBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontSize: 16, color: "#888" }}>Checking access...</div>
    </div>
  );

  if (!isAdmin) return <AccessDenied />;

  if (loading) return (
    <div style={{ minHeight: "100vh", background: BRAND.lightBg, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 14 }}>
      <img src="https://media.base44.com/images/public/69d062aca815ce8e697894b1/a9af95bc3_V-Hublogo.png" style={{ width: 60, borderRadius: 10 }} alt="" />
      <div style={{ color: "#555", fontSize: 15 }}>Loading admin data...</div>
    </div>
  );

  // Provider filtering
  const trialProviders = providers.filter(p => p.subscription_status === "trial");
  const expiringSoon = trialProviders.filter(p => { const d = daysLeft(p.trial_end_date); return d !== null && d <= 7 && d > 0; });
  const pendingProviders = providers.filter(p => p.subscription_status === "pending");
  const pendingReviews = reviews.filter(r => !r.is_approved).length;

  let filteredProviders = providers;
  if (providerFilter === "active") filteredProviders = providers.filter(p => p.is_active && p.subscription_status !== "pending");
  if (providerFilter === "pending") filteredProviders = pendingProviders;
  if (providerFilter === "trial") filteredProviders = trialProviders;
  if (providerFilter === "expiring") filteredProviders = expiringSoon;
  if (providerFilter === "inactive") filteredProviders = providers.filter(p => !p.is_active);

  const TABS = [
    { name: "Providers", label: `Providers (${providers.length})` },
    { name: "Reviews", label: `Reviews${pendingReviews > 0 ? ` · ${pendingReviews} pending` : ""}` },
    { name: "Categories", label: `Categories` },
    { name: "Services", label: `Services` },
    { name: "Service Areas", label: `Areas` },
  ];

  return (
    <div style={{ minHeight: "100vh", background: BRAND.lightBg, fontFamily: "'Segoe UI', sans-serif" }}>

      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${BRAND.orange}, ${BRAND.teal})`, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 3px 10px rgba(0,0,0,0.12)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img src="https://media.base44.com/images/public/69d062aca815ce8e697894b1/a9af95bc3_V-Hublogo.png" style={{ height: 42, borderRadius: 8 }} alt="V-Hub" />
          <div>
            <div style={{ color: "#fff", fontSize: 18, fontWeight: 800 }}>Welcome, {getWelcomeName(currentUser)}!</div>
            <div style={{ color: "rgba(255,255,255,0.85)", fontSize: 12 }}>V-HUB Admin Dashboard</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button onClick={loadAll} style={{ background: "rgba(255,255,255,0.2)", color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>↻ Refresh</button>
          <a href="/" style={{ color: "#fff", fontSize: 13, textDecoration: "none", opacity: 0.9 }}>View Site</a>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ display: "flex", gap: 10, padding: "14px 20px", flexWrap: "wrap", background: "#fff", borderBottom: "1px solid #eee" }}>
        {[
          { label: "Total Providers", value: providers.length, color: BRAND.blue },
          { label: "On Trial", value: trialProviders.length, color: BRAND.teal },
          { label: "Expiring ≤ 7 days", value: expiringSoon.length, color: "#e65100" },
          { label: "Pending Approval", value: pendingProviders.length, color: "#f59e0b" },
          { label: "Reviews Pending", value: pendingReviews, color: "#8e24aa" },
        ].map(s => (
          <div key={s.label} style={{ background: s.color + "12", border: `1px solid ${s.color}30`, borderRadius: 10, padding: "10px 16px", minWidth: 100, flex: "1 1 auto" }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "#666", marginTop: 1 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tab bar */}
      <div style={{ display: "flex", gap: 2, padding: "12px 20px 0", background: "#fff", borderBottom: "2px solid #eee", flexWrap: "wrap" }}>
        {TABS.map(t => (
          <button key={t.name} onClick={() => setActiveTab(t.name)}
            style={{ background: activeTab === t.name ? BRAND.orange : "transparent", color: activeTab === t.name ? "#fff" : "#555", border: "none", borderRadius: "8px 8px 0 0", padding: "9px 14px", fontWeight: 700, fontSize: 13, cursor: "pointer", marginBottom: -2 }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: "20px", maxWidth: 920, margin: "0 auto" }}>

        {activeTab === "Providers" && (
          <div>
            {/* Toolbar */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
              <button onClick={() => setShowAddProvider(true)}
                style={{ background: BRAND.orange, color: "#fff", border: "none", borderRadius: 10, padding: "10px 18px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                + Add Provider
              </button>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {[
                  { key: "all", label: "All" },
                  { key: "pending", label: `Pending${pendingProviders.length ? ` (${pendingProviders.length})` : ""}` },
                  { key: "trial", label: `Trial${trialProviders.length ? ` (${trialProviders.length})` : ""}` },
                  { key: "expiring", label: `⚠ Expiring${expiringSoon.length ? ` (${expiringSoon.length})` : ""}` },
                  { key: "active", label: "Active" },
                  { key: "inactive", label: "Inactive" },
                ].map(f => (
                  <button key={f.key} onClick={() => setProviderFilter(f.key)}
                    style={{ background: providerFilter === f.key ? BRAND.blue : "#eee", color: providerFilter === f.key ? "#fff" : "#444", border: "none", borderRadius: 8, padding: "7px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Trial expiring alert */}
            {expiringSoon.length > 0 && (
              <div style={{ background: "#fff3e0", border: "1px solid #e65100", borderRadius: 10, padding: "12px 16px", marginBottom: 16, fontSize: 13, color: "#bf360c" }}>
                ⚠️ <strong>{expiringSoon.length} provider{expiringSoon.length > 1 ? "s" : ""}</strong> expiring within 7 days — reminder emails should be sent soon.
              </div>
            )}

            <div style={{ fontSize: 12, color: "#888", marginBottom: 10 }}>{filteredProviders.length} provider{filteredProviders.length !== 1 ? "s" : ""}</div>

            {filteredProviders.length === 0 && (
              <div style={{ textAlign: "center", padding: 40, color: "#bbb", fontSize: 15 }}>No providers in this category.</div>
            )}

            {filteredProviders.map(p => (
              <ProviderCard key={p.id} provider={p} categories={categories} onRefresh={loadAll} />
            ))}
          </div>
        )}

        {activeTab === "Reviews" && <ReviewsTab reviews={reviews} onRefresh={loadAll} />}
        {activeTab === "Categories" && <CategoriesTab categories={categories} onRefresh={loadAll} />}
        {activeTab === "Services" && <ServicesTab services={services} categories={categories} onRefresh={loadAll} />}
        {activeTab === "Service Areas" && <AreasTab areas={areas} onRefresh={loadAll} />}
      </div>

      {/* Add Provider Modal */}
      {showAddProvider && (
        <AdminAddProviderModal
          categories={categories}
          onClose={() => setShowAddProvider(false)}
          onSaved={() => { setShowAddProvider(false); loadAll(); }}
        />
      )}
    </div>
  );
}
