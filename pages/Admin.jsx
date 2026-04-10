import React, { useState, useEffect } from "react";
import { ServiceArea, Category, Service, Provider, ProviderReview, User } from "@/api/entities";

// Brand
const BRAND = {
  orange: "#E8431A",
  teal: "#00BFA5",
  blue: "#1A3F70",
  lightBg: "#F5F7FA",
  dark: "#1A0A00",
};

const ADMIN_EMAILS = ["kimberlycook1980@gmail.com", "5bebegurlz@gmail.com", "evansrus@comcast.net"];

// ────────────────────────────────────────────────────────
//  Access Denied screen
// ────────────────────────────────────────────────────────
function AccessDenied() {
  return (
    <div style={{ minHeight: "100vh", background: BRAND.lightBg, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, padding: 30 }}>
      <img src="https://media.base44.com/images/public/69d062aca815ce8e697894b1/a9af95bc3_V-Hublogo.png" style={{ width: 72, borderRadius: 12 }} alt="V-Hub" />
      <div style={{ fontSize: 22, fontWeight: 800, color: "#c00" }}>Access Restricted</div>
      <div style={{ fontSize: 15, color: "#555", textAlign: "center", maxWidth: 320 }}>
        This page is only available to V-Hub administrators.
        Please sign in with your admin account.
      </div>
      <a href="/" style={{ background: BRAND.orange, color: "#fff", textDecoration: "none", borderRadius: 10, padding: "12px 24px", fontWeight: 700, fontSize: 15 }}>Back to V-Hub</a>
    </div>
  );
}

// ────────────────────────────────────────────────────────
//  Provider card
// ────────────────────────────────────────────────────────
function ProviderCard({ provider, categories, onEdit, onRefresh }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(""), 3000); };

  const approve = async () => {
    setBusy(true);
    await Provider.update(provider.id, { is_visible: true, subscription_status: "active" });
    flash("Provider approved and now visible.");
    onRefresh();
    setBusy(false);
  };

  const toggleVisible = async () => {
    setBusy(true);
    await Provider.update(provider.id, { is_visible: !provider.is_visible });
    flash(provider.is_visible ? "Provider hidden." : "Provider made visible.");
    onRefresh();
    setBusy(false);
  };

  const remove = async () => {
    if (!window.confirm("Delete this provider permanently?")) return;
    setBusy(true);
    await Provider.delete(provider.id);
    onRefresh();
    setBusy(false);
  };

  const catName = categories.find(c => c.id === provider.category_id)?.name || "—";
  const statusColor = provider.is_visible ? "#00897b" : "#e65100";

  return (
    <div style={{ background: "#fff", borderRadius: 12, padding: "16px 18px", marginBottom: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.07)", borderLeft: `4px solid ${statusColor}` }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: BRAND.dark }}>{provider.business_name}</div>
          <div style={{ fontSize: 13, color: "#666", marginTop: 2 }}>{provider.owner_name} | {catName}</div>
          <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{provider.email}</div>
          {provider.phone && <div style={{ fontSize: 12, color: "#888" }}>{provider.phone}</div>}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: statusColor, background: statusColor + "18", borderRadius: 6, padding: "3px 8px" }}>
            {provider.is_visible ? "VISIBLE" : "HIDDEN"}
          </div>
          <div style={{ fontSize: 11, color: "#999" }}>{provider.subscription_tier || "free"}</div>
        </div>
      </div>

      {msg && <div style={{ marginTop: 8, fontSize: 12, color: "#00897b", fontStyle: "italic" }}>{msg}</div>}

      <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
        {!provider.is_visible && (
          <button onClick={approve} disabled={busy} style={{ background: BRAND.teal, color: "#fff", border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
            Approve
          </button>
        )}
        <button onClick={toggleVisible} disabled={busy} style={{ background: provider.is_visible ? "#e65100" : BRAND.orange, color: "#fff", border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
          {provider.is_visible ? "Hide" : "Show"}
        </button>
        <button onClick={() => onEdit(provider)} style={{ background: "#f0f0f0", color: "#333", border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
          Edit
        </button>
        <button onClick={remove} disabled={busy} style={{ background: "#fff", color: "#c00", border: "1px solid #c00", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
          Delete
        </button>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────
//  Provider edit form (modal)
// ────────────────────────────────────────────────────────
function ProviderForm({ provider, categories, onClose, onSaved }) {
  const blank = { business_name: "", owner_name: "", email: "", phone: "", category_id: "", description: "", subscription_tier: "free", subscription_status: "pending", is_visible: false };
  const [form, setForm] = useState(provider || blank);
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    if (provider) await Provider.update(provider.id, form);
    else await Provider.create(form);
    setSaving(false);
    onSaved();
  };

  const labelStyle = { fontSize: 12, fontWeight: 700, color: "#444", marginBottom: 3 };
  const inputStyle = { width: "100%", padding: "9px 10px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14, boxSizing: "border-box" };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 999, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: 24, width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 8px 40px rgba(0,0,0,0.2)" }}>
        <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 16, color: BRAND.dark }}>{provider ? "Edit Provider" : "Add Provider"}</div>

        {[
          ["business_name", "Business Name"],
          ["owner_name", "Owner Name"],
          ["email", "Email"],
          ["phone", "Phone"],
          ["website", "Website"],
          ["license_number", "License Number"],
        ].map(([k, label]) => (
          <div key={k} style={{ marginBottom: 12 }}>
            <div style={labelStyle}>{label}</div>
            <input value={form[k] || ""} onChange={e => set(k, e.target.value)} style={inputStyle} />
          </div>
        ))}

        <div style={{ marginBottom: 12 }}>
          <div style={labelStyle}>Category</div>
          <select value={form.category_id || ""} onChange={e => set("category_id", e.target.value)} style={inputStyle}>
            <option value="">- Select Category -</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: 12 }}>
          <div style={labelStyle}>Subscription Tier</div>
          <select value={form.subscription_tier || "free"} onChange={e => set("subscription_tier", e.target.value)} style={inputStyle}>
            <option value="free">Free</option>
            <option value="basic">Basic</option>
            <option value="pro">Pro</option>
            <option value="featured">Featured</option>
          </select>
        </div>

        <div style={{ marginBottom: 12 }}>
          <div style={labelStyle}>Status</div>
          <select value={form.subscription_status || "pending"} onChange={e => set("subscription_status", e.target.value)} style={inputStyle}>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
            <input type="checkbox" checked={!!form.is_visible} onChange={e => set("is_visible", e.target.checked)} />
            <span style={{ fontSize: 14, fontWeight: 600 }}>Visible in search results</span>
          </label>
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={labelStyle}>Description</div>
          <textarea value={form.description || ""} onChange={e => set("description", e.target.value)} rows={3} style={{ ...inputStyle, resize: "vertical" }} />
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ background: "#f0f0f0", color: "#333", border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 700, cursor: "pointer" }}>Cancel</button>
          <button onClick={save} disabled={saving} style={{ background: BRAND.orange, color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 700, cursor: "pointer" }}>
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────
//  Reviews tab
// ────────────────────────────────────────────────────────
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
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {["pending", "approved", "all"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ background: filter === f ? BRAND.orange : "#eee", color: filter === f ? "#fff" : "#333", border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer", textTransform: "capitalize" }}>{f}</button>
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
            <div style={{ fontSize: 18, color: "#f59e0b" }}>{"*".repeat(r.rating || 0)}</div>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            {!r.is_approved && (
              <button onClick={() => approve(r)} style={{ background: BRAND.teal, color: "#fff", border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Approve</button>
            )}
            <button onClick={() => remove(r)} style={{ background: "#fff", color: "#c00", border: "1px solid #c00", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ────────────────────────────────────────────────────────
//  Categories tab
// ────────────────────────────────────────────────────────
function CategoriesTab({ categories, onRefresh }) {
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: "", icon: "", description: "", is_active: true });
  const [saving, setSaving] = useState(false);

  const openAdd = () => { setForm({ name: "", icon: "", description: "", is_active: true }); setEditItem(null); setShowForm(true); };
  const openEdit = (c) => { setForm(c); setEditItem(c); setShowForm(true); };

  const save = async () => {
    setSaving(true);
    if (editItem) await Category.update(editItem.id, form);
    else await Category.create(form);
    setSaving(false);
    setShowForm(false);
    onRefresh();
  };

  const remove = async (c) => {
    if (!window.confirm("Delete category?")) return;
    await Category.delete(c.id);
    onRefresh();
  };

  const inputStyle = { width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14, boxSizing: "border-box", marginBottom: 10 };

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

// ────────────────────────────────────────────────────────
//  Services tab
// ────────────────────────────────────────────────────────
function ServicesTab({ services, categories, onRefresh }) {
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [filterCat, setFilterCat] = useState("all");

  const openAdd = () => { setForm({ name: "", category_id: "", is_active: true }); setEditItem(null); setShowForm(true); };
  const openEdit = (s) => { setForm(s); setEditItem(s); setShowForm(true); };

  const save = async () => {
    setSaving(true);
    if (editItem) await Service.update(editItem.id, form);
    else await Service.create(form);
    setSaving(false);
    setShowForm(false);
    onRefresh();
  };

  const remove = async (s) => {
    if (!window.confirm("Delete service?")) return;
    await Service.delete(s.id);
    onRefresh();
  };

  const filtered = filterCat === "all" ? services : services.filter(s => s.category_id === filterCat);
  const inputStyle = { width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14, boxSizing: "border-box", marginBottom: 10 };

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

// ────────────────────────────────────────────────────────
//  Service Areas tab
// ────────────────────────────────────────────────────────
function AreasTab({ areas, onRefresh }) {
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: "", is_active: true });
  const [saving, setSaving] = useState(false);

  const openAdd = () => { setForm({ name: "", is_active: true }); setEditItem(null); setShowForm(true); };
  const openEdit = (a) => { setForm(a); setEditItem(a); setShowForm(true); };

  const save = async () => {
    setSaving(true);
    if (editItem) await ServiceArea.update(editItem.id, form);
    else await ServiceArea.create(form);
    setSaving(false);
    setShowForm(false);
    onRefresh();
  };

  const remove = async (a) => {
    if (!window.confirm("Delete area?")) return;
    await ServiceArea.delete(a.id);
    onRefresh();
  };

  const inputStyle = { width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14, boxSizing: "border-box", marginBottom: 10 };

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

// ────────────────────────────────────────────────────────
//  Main Admin page
// ────────────────────────────────────────────────────────
function getWelcomeName(user) {
  if (!user) return "Admin";
  const email = user.email || "";
  if (email === "kimberlycook1980@gmail.com" || email === "5bebegurlz@gmail.com") return "Kimberly";
  if (email === "evansrus@comcast.net") return "Bill";
  return user.full_name || email;
}

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
  const [editProvider, setEditProvider] = useState(null);
  const [showProviderForm, setShowProviderForm] = useState(false);
  const [providerFilter, setProviderFilter] = useState("all");

  useEffect(() => {
    User.me()
      .then(u => { setCurrentUser(u); setChecking(false); })
      .catch(() => { setCurrentUser(null); setChecking(false); });
  }, []);

  const isAdmin = currentUser && (
    currentUser.role === "admin" ||
    ADMIN_EMAILS.includes(currentUser.email)
  );

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
    } catch (e) {
      console.error("Admin load error:", e);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) loadAll();
  }, [isAdmin]);

  // Still checking auth
  if (checking) return (
    <div style={{ minHeight: "100vh", background: BRAND.lightBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontSize: 16, color: "#888" }}>Checking access...</div>
    </div>
  );

  // Not admin
  if (!isAdmin) return <AccessDenied />;

  // Loading data
  if (loading) return (
    <div style={{ minHeight: "100vh", background: BRAND.lightBg, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 14 }}>
      <img src="https://media.base44.com/images/public/69d062aca815ce8e697894b1/a9af95bc3_V-Hublogo.png" style={{ width: 60, borderRadius: 10 }} alt="" />
      <div style={{ color: "#555", fontSize: 15 }}>Loading admin data...</div>
    </div>
  );

  const filteredProviders = providerFilter === "all" ? providers
    : providerFilter === "visible" ? providers.filter(p => p.is_visible)
    : providers.filter(p => !p.is_visible);

  const pendingReviews = reviews.filter(r => !r.is_approved).length;

  const TABS = [
    { name: "Providers", label: `Providers (${providers.length})` },
    { name: "Reviews", label: `Reviews${pendingReviews > 0 ? ` (${pendingReviews} pending)` : ""}` },
    { name: "Categories", label: `Categories (${categories.length})` },
    { name: "Services", label: `Services (${services.length})` },
    { name: "Service Areas", label: `Areas (${areas.length})` },
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
          <button onClick={loadAll} style={{ background: "rgba(255,255,255,0.2)", color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Refresh</button>
          <a href="/" style={{ color: "#fff", fontSize: 13, textDecoration: "none", opacity: 0.9 }}>View Site</a>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ display: "flex", gap: 12, padding: "14px 20px", flexWrap: "wrap", background: "#fff", borderBottom: "1px solid #eee" }}>
        {[
          { label: "Total Providers", value: providers.length, color: BRAND.orange },
          { label: "Visible", value: providers.filter(p => p.is_visible).length, color: BRAND.teal },
          { label: "Pending Approval", value: providers.filter(p => !p.is_visible).length, color: "#e65100" },
          { label: "Reviews Pending", value: pendingReviews, color: "#f59e0b" },
        ].map(s => (
          <div key={s.label} style={{ background: s.color + "12", border: `1px solid ${s.color}33`, borderRadius: 10, padding: "10px 16px", minWidth: 110 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "#666", marginTop: 1 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tab bar */}
      <div style={{ display: "flex", gap: 4, padding: "12px 20px 0", background: "#fff", borderBottom: "2px solid #eee", flexWrap: "wrap" }}>
        {TABS.map(t => (
          <button key={t.name} onClick={() => setActiveTab(t.name)}
            style={{ background: activeTab === t.name ? BRAND.orange : "transparent", color: activeTab === t.name ? "#fff" : "#555", border: "none", borderRadius: "8px 8px 0 0", padding: "9px 14px", fontWeight: 700, fontSize: 13, cursor: "pointer", borderBottom: activeTab === t.name ? `2px solid ${BRAND.orange}` : "none", marginBottom: -2 }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ padding: "20px", maxWidth: 900, margin: "0 auto" }}>

        {activeTab === "Providers" && (
          <div>
            <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
              <button onClick={() => { setEditProvider(null); setShowProviderForm(true); }}
                style={{ background: BRAND.orange, color: "#fff", border: "none", borderRadius: 10, padding: "10px 18px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                + Add Provider
              </button>
              {["all", "visible", "hidden"].map(f => (
                <button key={f} onClick={() => setProviderFilter(f)}
                  style={{ background: providerFilter === f ? BRAND.blue : "#eee", color: providerFilter === f ? "#fff" : "#333", border: "none", borderRadius: 8, padding: "9px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", textTransform: "capitalize" }}>
                  {f === "all" ? `All (${providers.length})` : f === "visible" ? `Visible (${providers.filter(p => p.is_visible).length})` : `Hidden (${providers.filter(p => !p.is_visible).length})`}
                </button>
              ))}
            </div>
            {filteredProviders.map(p => (
              <ProviderCard key={p.id} provider={p} categories={categories}
                onEdit={(prov) => { setEditProvider(prov); setShowProviderForm(true); }}
                onRefresh={loadAll} />
            ))}
            {filteredProviders.length === 0 && (
              <div style={{ textAlign: "center", color: "#aaa", padding: 40, fontSize: 15 }}>No providers found.</div>
            )}
          </div>
        )}

        {activeTab === "Reviews" && <ReviewsTab reviews={reviews} onRefresh={loadAll} />}
        {activeTab === "Categories" && <CategoriesTab categories={categories} onRefresh={loadAll} />}
        {activeTab === "Services" && <ServicesTab services={services} categories={categories} onRefresh={loadAll} />}
        {activeTab === "Service Areas" && <AreasTab areas={areas} onRefresh={loadAll} />}
      </div>

      {/* Provider form modal */}
      {showProviderForm && (
        <ProviderForm
          provider={editProvider}
          categories={categories}
          onClose={() => { setShowProviderForm(false); setEditProvider(null); }}
          onSaved={() => { setShowProviderForm(false); setEditProvider(null); loadAll(); }}
        />
      )}
    </div>
  );
}
