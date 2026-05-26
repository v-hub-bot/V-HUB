import { useState, useEffect } from "react";
import { MarketVendor } from "@/api/entities";

const PAPER = "#FDF6E3";
const PAPER_MID = "#F5E6C8";
const PAPER_DK = "#E8D5A3";
const INK = "#1C0F00";
const BROWN = "#7A4820";
const TEAL = "#00897B";
const TEAL_LT = "#E0F2F1";
const RED = "#E8431A";
const FONT = "'Times New Roman', serif";
const SANS = "'Arial', sans-serif";

const VENDOR_CAT_EMOJI = {
  "Farm & Fresh Produce": "🌽",
  "Food, Baked Goods & Sweets": "🍞",
  "Wellness & Body": "🌿",
  "Art, Jewelry & Gifts": "🎨",
  "Home, Yard & Golf Cart": "🏡",
};

function Field({ label, value, onChange, type = "text", textarea = false, hint = "" }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: BROWN, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4, fontFamily: SANS }}>{label}</label>
      {hint && <div style={{ fontSize: 11, color: "#888", fontFamily: SANS, marginBottom: 4, fontStyle: "italic" }}>{hint}</div>}
      {textarea ? (
        <textarea value={value || ""} onChange={e => onChange(e.target.value)}
          style={{ width: "100%", padding: "8px 10px", fontSize: 13, border: "1px solid #C8A96E", borderRadius: 6, background: "#FFFDF5", fontFamily: FONT, boxSizing: "border-box", minHeight: 80, resize: "vertical" }} />
      ) : (
        <input type={type} value={value || ""} onChange={e => onChange(e.target.value)}
          style={{ width: "100%", padding: "8px 10px", fontSize: 13, border: "1px solid #C8A96E", borderRadius: 6, background: "#FFFDF5", fontFamily: FONT, boxSizing: "border-box" }} />
      )}
    </div>
  );
}

export default function VendorDashboard() {
  const [step, setStep] = useState("login"); // login | dashboard
  const [loginId, setLoginId] = useState("");
  const [loginPw, setLoginPw] = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  const [vendor, setVendor] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [activeTab, setActiveTab] = useState("profile");

  // Password change
  const [newPw, setNewPw] = useState("");
  const [newPw2, setNewPw2] = useState("");
  const [pwSaving, setPwSaving] = useState(false);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3500); };

  const handleLogin = async () => {
    setLoginErr("");
    if (!loginId.trim() || !loginPw.trim()) { setLoginErr("Please enter your login email (or Vendor ID) and password."); return; }
    setLoggingIn(true);
    try {
      const all = await MarketVendor.list();
      const idLower = loginId.trim().toLowerCase();
      const match = all.find(v =>
        (v.login_email || "").toLowerCase() === idLower ||
        (v.email || "").toLowerCase() === idLower ||
        (v.vendor_id || "").toLowerCase() === idLower
      );
      if (!match) { setLoginErr("No vendor account found with that ID or email."); setLoggingIn(false); return; }
      if (!match.login_password) { setLoginErr("No password set for this account. Contact admin@v-hub.us to get access."); setLoggingIn(false); return; }
      if (match.login_password !== loginPw.trim()) { setLoginErr("Incorrect password. Please try again."); setLoggingIn(false); return; }
      setVendor(match);
      setForm({ ...match });
      setStep("dashboard");
    } catch (e) {
      setLoginErr("Login failed. Please try again.");
    }
    setLoggingIn(false);
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const updates = {
        name: form.name,
        description: form.description,
        phone: form.phone,
        website: form.website,
        facebook_url: form.facebook_url,
        instagram_url: form.instagram_url,
        schedule: form.schedule,
        logo_url: form.logo_url,
      };
      await MarketVendor.update(vendor.id, updates);
      setVendor(v => ({ ...v, ...updates }));
      showToast("✅ Profile saved!");
    } catch { showToast("❌ Save failed. Please try again."); }
    setSaving(false);
  };

  const savePassword = async () => {
    if (!newPw || newPw.length < 6) { showToast("❌ Password must be at least 6 characters."); return; }
    if (newPw !== newPw2) { showToast("❌ Passwords don't match."); return; }
    setPwSaving(true);
    try {
      await MarketVendor.update(vendor.id, { login_password: newPw, password_changed: true, managed_by: "vendor" });
      setVendor(v => ({ ...v, login_password: newPw, password_changed: true, managed_by: "vendor" }));
      setNewPw(""); setNewPw2("");
      showToast("🔐 Password updated!");
    } catch { showToast("❌ Password change failed."); }
    setPwSaving(false);
  };

  const set = (field) => (val) => setForm(f => ({ ...f, [field]: val }));

  // ── LOGIN SCREEN ──────────────────────────────────────────────────────────
  if (step === "login") {
    return (
      <div style={{ minHeight: "100vh", background: PAPER, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ width: "100%", maxWidth: 380 }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <img src="https://media.base44.com/images/public/69d062aca815ce8e697894b1/a9af95bc3_V-Hublogo.png" alt="V-HUB" style={{ height: 52, marginBottom: 10 }} />
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: INK, fontFamily: FONT }}>Vendor Hub</h1>
            <div style={{ fontSize: 13, color: BROWN, fontFamily: SANS, marginTop: 4 }}>Hometown Market Vendors — manage your listing</div>
          </div>

          {/* Login card */}
          <div style={{ background: "#fff", border: "1px solid #C8A96E", borderRadius: 12, padding: "28px 24px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: BROWN, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6, fontFamily: SANS }}>Email or Vendor ID</label>
              <input
                type="text"
                value={loginId}
                onChange={e => setLoginId(e.target.value)}
                placeholder="you@email.com or VM-XXXX"
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                style={{ width: "100%", padding: "10px 12px", fontSize: 14, border: "1px solid #C8A96E", borderRadius: 7, background: "#FFFDF5", fontFamily: FONT, boxSizing: "border-box" }}
              />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: BROWN, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6, fontFamily: SANS }}>Password</label>
              <input
                type="password"
                value={loginPw}
                onChange={e => setLoginPw(e.target.value)}
                placeholder="Your password"
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                style={{ width: "100%", padding: "10px 12px", fontSize: 14, border: "1px solid #C8A96E", borderRadius: 7, background: "#FFFDF5", fontFamily: FONT, boxSizing: "border-box" }}
              />
            </div>
            {loginErr && (
              <div style={{ background: "#FFEBEE", border: "1px solid #EF9A9A", borderRadius: 6, padding: "10px 14px", fontSize: 13, color: "#c0392b", marginBottom: 16, fontFamily: SANS }}>
                {loginErr}
              </div>
            )}
            <button onClick={handleLogin} disabled={loggingIn}
              style={{ width: "100%", padding: "12px 0", background: TEAL, color: "#fff", border: "none", borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: loggingIn ? "wait" : "pointer", fontFamily: FONT, letterSpacing: 1 }}>
              {loggingIn ? "Logging in..." : "Log In →"}
            </button>
          </div>

          <div style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: "#888", fontFamily: SANS, lineHeight: 1.7 }}>
            Don't have an account?<br/>
            Email <a href="mailto:admin@v-hub.us" style={{ color: TEAL }}>admin@v-hub.us</a> to claim your listing.<br/>
            <a href="/" style={{ color: BROWN, marginTop: 8, display: "inline-block" }}>← Back to V-HUB</a>
          </div>
        </div>
      </div>
    );
  }

  // ── DASHBOARD ─────────────────────────────────────────────────────────────
  const TABS = ["profile", "contact", "password"];
  const TAB_LABELS = { profile: "📋 My Profile", contact: "📞 Contact Info", password: "🔐 Password" };

  return (
    <div style={{ minHeight: "100vh", background: PAPER, fontFamily: FONT }}>
      {toast && <div style={{ position: "fixed", top: 16, right: 16, background: "#1A6B3C", color: "#fff", padding: "10px 18px", borderRadius: 8, fontWeight: 700, fontFamily: SANS, zIndex: 9999, boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}>{toast}</div>}

      {/* Top bar */}
      <div style={{ background: INK, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img src="https://media.base44.com/images/public/69d062aca815ce8e697894b1/a9af95bc3_V-Hublogo.png" alt="V-HUB" style={{ height: 30 }} />
          <span style={{ color: "#fff", fontWeight: 900, fontSize: 15, letterSpacing: 1 }}>Vendor Hub</span>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <a href="/" style={{ color: "#ccc", fontSize: 12, textDecoration: "none", fontFamily: SANS }}>← Home</a>
          <button onClick={() => { setStep("login"); setVendor(null); setForm({}); }}
            style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", borderRadius: 5, padding: "5px 12px", fontSize: 12, cursor: "pointer", fontFamily: SANS }}>
            Log Out
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 560, margin: "0 auto", padding: "20px 16px" }}>
        {/* Vendor identity card */}
        <div style={{ background: "#fff", border: "1px solid #C8A96E", borderRadius: 12, padding: "18px 20px", marginBottom: 20, display: "flex", alignItems: "center", gap: 14, boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
          {vendor.logo_url ? (
            <img src={vendor.logo_url} alt="logo" style={{ width: 58, height: 58, borderRadius: 8, objectFit: "cover", border: "1px solid #C8A96E" }} />
          ) : (
            <div style={{ width: 58, height: 58, borderRadius: 8, background: TEAL_LT, border: "1px solid #C8A96E", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>
              {VENDOR_CAT_EMOJI[vendor.category] || "🏪"}
            </div>
          )}
          <div>
            <div style={{ fontSize: 18, fontWeight: 900, color: INK }}>{vendor.name}</div>
            <div style={{ fontSize: 12, color: BROWN, marginTop: 2 }}>{vendor.category}</div>
            {vendor.vendor_id && <div style={{ fontSize: 11, color: "#aaa", fontFamily: SANS, marginTop: 2 }}>{vendor.vendor_id}</div>}
            {!vendor.password_changed && (
              <div style={{ marginTop: 6, background: "#FFF3E0", border: "1px solid #FFB74D", borderRadius: 5, padding: "4px 10px", fontSize: 11, color: "#E65100", fontFamily: SANS }}>
                ⚠️ Please change your password in the Password tab
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 18, borderBottom: "2px solid #C8A96E", paddingBottom: 0 }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              style={{ padding: "8px 14px", fontSize: 12, fontWeight: activeTab === t ? 800 : 600, background: "none", border: "none", borderBottom: activeTab === t ? `3px solid ${TEAL}` : "3px solid transparent", color: activeTab === t ? TEAL : BROWN, cursor: "pointer", fontFamily: SANS, marginBottom: -2 }}>
              {TAB_LABELS[t]}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div style={{ background: "#fff", border: "1px solid #C8A96E", borderRadius: 10, padding: "20px 20px" }}>
            <div style={{ fontSize: 13, color: "#888", fontFamily: SANS, marginBottom: 16, fontStyle: "italic" }}>
              This information appears on your public vendor listing.
            </div>
            <Field label="Business Name" value={form.name} onChange={set("name")} />
            <Field label="Description" value={form.description} onChange={set("description")} textarea hint="Tell customers what you sell. Keep it friendly and specific." />
            <Field label="Market Schedule" value={form.schedule} onChange={set("schedule")} hint="e.g. Every Saturday 9am–1pm at Brownwood Paddock Square" />
            <Field label="Logo / Photo URL" value={form.logo_url} onChange={set("logo_url")} hint="Paste a direct image URL (from your website, Facebook, etc.)" />
            <div style={{ marginTop: 8 }}>
              <button onClick={saveProfile} disabled={saving}
                style={{ padding: "11px 28px", background: TEAL, color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: saving ? "wait" : "pointer", fontFamily: FONT, letterSpacing: 0.5 }}>
                {saving ? "Saving..." : "💾 Save Profile"}
              </button>
            </div>
          </div>
        )}

        {/* Contact Tab */}
        {activeTab === "contact" && (
          <div style={{ background: "#fff", border: "1px solid #C8A96E", borderRadius: 10, padding: "20px 20px" }}>
            <div style={{ background: TEAL_LT, border: "1px solid #80CBC4", borderRadius: 7, padding: "10px 14px", fontSize: 12, color: "#00695C", fontFamily: SANS, marginBottom: 16 }}>
              📍 <strong>Note:</strong> We never show your physical address publicly. Customers connect with you through phone, website, or social media only.
            </div>
            <Field label="Phone Number" value={form.phone} onChange={set("phone")} hint="Shown publicly — customers can tap to call" />
            <Field label="Website URL" value={form.website} onChange={set("website")} hint="e.g. https://yoursite.com" />
            <Field label="Facebook Page URL" value={form.facebook_url} onChange={set("facebook_url")} hint="e.g. https://facebook.com/yourbusiness" />
            <Field label="Instagram URL" value={form.instagram_url} onChange={set("instagram_url")} hint="e.g. https://instagram.com/yourbusiness" />
            <div style={{ marginTop: 8 }}>
              <button onClick={saveProfile} disabled={saving}
                style={{ padding: "11px 28px", background: TEAL, color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: saving ? "wait" : "pointer", fontFamily: FONT, letterSpacing: 0.5 }}>
                {saving ? "Saving..." : "💾 Save Contact Info"}
              </button>
            </div>
          </div>
        )}

        {/* Password Tab */}
        {activeTab === "password" && (
          <div style={{ background: "#fff", border: "1px solid #C8A96E", borderRadius: 10, padding: "20px 20px" }}>
            {!vendor.password_changed && (
              <div style={{ background: "#FFF3E0", border: "1px solid #FFB74D", borderRadius: 7, padding: "10px 14px", fontSize: 12, color: "#E65100", fontFamily: SANS, marginBottom: 16 }}>
                ⚠️ You're using a temporary password. Please set a personal password below.
              </div>
            )}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: BROWN, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6, fontFamily: SANS }}>New Password</label>
              <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="At least 6 characters"
                style={{ width: "100%", padding: "10px 12px", fontSize: 14, border: "1px solid #C8A96E", borderRadius: 7, background: "#FFFDF5", fontFamily: FONT, boxSizing: "border-box" }} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: BROWN, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6, fontFamily: SANS }}>Confirm New Password</label>
              <input type="password" value={newPw2} onChange={e => setNewPw2(e.target.value)} placeholder="Repeat your new password"
                style={{ width: "100%", padding: "10px 12px", fontSize: 14, border: "1px solid #C8A96E", borderRadius: 7, background: "#FFFDF5", fontFamily: FONT, boxSizing: "border-box" }} />
            </div>
            <button onClick={savePassword} disabled={pwSaving}
              style={{ padding: "11px 28px", background: "#1A6B3C", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: pwSaving ? "wait" : "pointer", fontFamily: FONT }}>
              {pwSaving ? "Saving..." : "🔐 Update Password"}
            </button>
            <div style={{ marginTop: 20, borderTop: "1px solid #eee", paddingTop: 16 }}>
              <div style={{ fontSize: 12, color: "#888", fontFamily: SANS, lineHeight: 1.7 }}>
                <strong>Login credentials:</strong><br/>
                Email: {vendor.login_email || vendor.email}<br/>
                <span style={{ fontSize: 11, color: "#aaa" }}>Contact <a href="mailto:admin@v-hub.us" style={{ color: TEAL }}>admin@v-hub.us</a> if you need help accessing your account.</span>
              </div>
            </div>
          </div>
        )}

        {/* My Public Listing preview link */}
        <div style={{ marginTop: 20, textAlign: "center" }}>
          <a href="/#vendors" style={{ fontSize: 12, color: TEAL, textDecoration: "underline", fontFamily: SANS }}>
            🏪 View Hometown Market Directory →
          </a>
        </div>
      </div>
    </div>
  );
}
