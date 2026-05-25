// BUILD_FORCE_2026_04_22_T0400
// CACHE-BUST-1776648334
// build-1776648334 
import React, { useState, useEffect } from "react";
import { Provider, ProviderReview, LeadInquiry, ServiceSearchStat, Category, Service, ServiceArea, ProviderAnalytic, MarketVendor } from "@/api/entities";

const BUILD_ID = "v2026-04-20-toast-save"; const LOGO = "https://media.base44.com/images/public/69d062aca815ce8e697894b1/a9af95bc3_V-Hublogo.png";
const API_BASE = "https://api.base44.app/api/apps/69d062aca815ce8e697894b1/functions";
const FN = "https://api.base44.app/api/apps/69d062aca815ce8e697894b1/functions/adminMagicLink";

// SHA-256 for password hashing (used by admin Set Password feature)
async function sha256(plain) {
  if (!plain) return "";
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(plain));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

const T = {
  parchment: "#F5EDD6", parchmentDark: "#E8D9B0",
  brown: "#5C3317", brownLight: "#8B5E3C", brownDark: "#3B1F0A",
  gold: "#C9973A", red: "#8B1A1A", green: "#2E6B2E", teal: "#1A6B5C",
  cream: "#FFFDF4", border: "#C4A882", shadow: "rgba(92,51,23,0.15)",
  font: "'Georgia','Times New Roman',serif", sans: "'Arial',sans-serif",
};

const S = {
  page: { minHeight: "100vh", background: T.parchment, fontFamily: T.font },
  hdr: { background: `linear-gradient(135deg,${T.brownDark},${T.brown})`, padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `3px solid ${T.gold}` },
  card: { background: T.cream, borderRadius: 8, padding: "14px 16px", boxShadow: `0 2px 8px ${T.shadow}`, border: `1px solid ${T.border}` },
  tabBtn: (a) => ({ padding: "10px 14px", border: "none", cursor: "pointer", whiteSpace: "nowrap", fontFamily: T.font, fontSize: 13, fontWeight: a ? 700 : 400, background: a ? T.cream : "transparent", color: a ? T.brownDark : T.brownLight, borderBottom: a ? `3px solid ${T.brown}` : "3px solid transparent" }),
  filterBtn: (a) => ({ padding: "5px 12px", borderRadius: 6, border: `1px solid ${T.border}`, fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: T.sans, background: a ? T.brown : T.cream, color: a ? "#fff" : T.brown }),
  btn: (c = T.brown) => ({ fontSize: 12, padding: "5px 12px", borderRadius: 6, border: "none", background: c, color: "#fff", cursor: "pointer", fontWeight: 700, fontFamily: T.sans }),
  badge: (c, bg) => ({ fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 20, background: bg, color: c }),
  secTitle: { fontSize: 13, fontWeight: 700, color: T.brownLight, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10, fontFamily: T.sans, borderBottom: `1px solid ${T.border}`, paddingBottom: 6 },
  inp: { width: "100%", boxSizing: "border-box", padding: "8px 10px", borderRadius: 6, border: `1px solid ${T.border}`, fontFamily: T.sans, fontSize: 13, background: T.cream, color: T.brownDark, outline: "none" },
};

function fmt(d) { if (!d) return "—"; return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); }
function daysLeft(d) { if (!d) return null; return Math.ceil((new Date(d) - new Date()) / 86400000); }

// ── MAGIC LINK GATE ───────────────────────────────────────────────────────────
function MagicLinkGate({ onUnlock }) {
  const [step, setStep]   = useState("check"); // check | email | sent | invalid
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [err, setErr]     = useState("");
  const [reason, setReason] = useState("");

  // On mount — check for ?token= in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      setStep("verifying");
      fetch(FN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify", token }),
      })
        .then(r => r.json())
        .then(data => {
          if (data.valid) {
            // Clean token from URL without reload
            window.history.replaceState({}, "", window.location.pathname);
            onUnlock("1357");
          } else {
            const msgs = {
              expired: "This link has expired. Links are only valid for 15 minutes — please request a new one.",
              already_used: "This link has already been used. Each link can only be used once — please request a new one.",
              not_found: "This link is invalid. Please request a new one.",
            };
            setReason(msgs[data.reason] || "Invalid link. Please request a new one.");
            setStep("invalid");
          }
        })
        .catch(() => { setReason("Something went wrong. Please try again."); setStep("invalid"); });
    } else {
      setStep("email");
    }
  }, []);

  const requestLink = async () => {
    const e = email.trim().toLowerCase();
    if (!e || !e.includes("@")) { setErr("Please enter a valid email address."); return; }
    setSending(true); setErr("");
    try {
      const res = await fetch(FN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "request", email: e }),
      });
      const data = await res.json();
      if (data.status === "sent") {
        setStep("sent");
      } else if (data.status === "not_admin") {
        // Show generic "check your email" — alert already sent to admins
        setStep("sent");
      } else {
        setErr(data.error || "Something went wrong. Try again.");
      }
    } catch {
      setErr("Network error. Please try again.");
    }
    setSending(false);
  };

  const box = { background: T.cream, borderRadius: 12, padding: "40px 32px", boxShadow: `0 8px 32px ${T.shadow}`, textAlign: "center", width: 320, border: `2px solid ${T.border}` };

  if (step === "check" || step === "verifying") return (
    <div style={{ minHeight: "100vh", background: T.parchment, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={box}>
        <img src={LOGO} style={{ width: 72, borderRadius: 12, marginBottom: 16 }} alt="" />
        <div style={{ fontSize: 16, color: T.brownLight, fontStyle: "italic", fontFamily: T.sans }}>
          {step === "verifying" ? "Verifying your link…" : "Loading…"}
        </div>
      </div>
    </div>
  );

  if (step === "invalid") return (
    <div style={{ minHeight: "100vh", background: T.parchment, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={box}>
        <img src={LOGO} style={{ width: 72, borderRadius: 12, marginBottom: 16 }} alt="" />
        <div style={{ fontSize: 22, fontWeight: 800, color: T.brownDark, marginBottom: 12, fontFamily: T.font }}>V-HUB Admin</div>
        <div style={{ fontSize: 13, color: T.red, marginBottom: 20, fontFamily: T.sans, lineHeight: 1.7 }}>{reason}</div>
        <button onClick={() => { setStep("email"); setReason(""); }} style={{ ...S.btn(T.brown), width: "100%", padding: 12, fontSize: 14 }}>Request New Link</button>
        <a href="/" style={{ display: "block", marginTop: 14, fontSize: 12, color: T.brownLight, textDecoration: "none" }}>← Back to V-HUB</a>
      </div>
    </div>
  );

  if (step === "sent") return (
    <div style={{ minHeight: "100vh", background: T.parchment, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={box}>
        <img src={LOGO} style={{ width: 72, borderRadius: 12, marginBottom: 16 }} alt="" />
        <div style={{ fontSize: 22, fontWeight: 800, color: T.brownDark, marginBottom: 12, fontFamily: T.font }}>Check Your Email</div>
        <div style={{ fontSize: 42, marginBottom: 12 }}>📬</div>
        <div style={{ fontSize: 14, color: T.brownLight, marginBottom: 8, fontFamily: T.sans, lineHeight: 1.7 }}>
          If that email is authorized, a login link is on its way. Check your inbox — it expires in <strong>15 minutes</strong>.
        </div>
        <div style={{ fontSize: 12, color: T.brownLight, fontStyle: "italic", marginBottom: 20, fontFamily: T.sans }}>Don't see it? Check your spam folder.</div>
        <button onClick={() => { setStep("email"); setEmail(""); }} style={{ ...S.btn(T.brownLight), width: "100%", padding: 10, fontSize: 13 }}>Try a different email</button>
        <a href="/" style={{ display: "block", marginTop: 14, fontSize: 12, color: T.brownLight, textDecoration: "none" }}>← Back to V-HUB</a>
      </div>
    </div>
  );

  // Default: email entry
  return (
    <div style={{ minHeight: "100vh", background: T.parchment, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={box}>
        <img src={LOGO} style={{ width: 72, borderRadius: 12, marginBottom: 16 }} alt="" />
        <div style={{ fontSize: 22, fontWeight: 800, color: T.brownDark, marginBottom: 4, fontFamily: T.font }}>V-HUB Admin</div>
        <div style={{ fontSize: 13, color: T.brownLight, marginBottom: 24, fontStyle: "italic", fontFamily: T.sans, lineHeight: 1.6 }}>
          Enter your admin email and we'll send you a secure login link.
        </div>
        <input
          autoFocus
          type="email"
          value={email}
          onChange={e => { setEmail(e.target.value); setErr(""); }}
          onKeyDown={e => e.key === "Enter" && !sending && requestLink()}
          placeholder="your@email.com"
          style={{ ...S.inp, fontSize: 15, textAlign: "center", marginBottom: 10, border: err ? `2px solid ${T.red}` : `2px solid ${T.border}` }}
        />
        {err && <div style={{ color: T.red, fontSize: 13, marginBottom: 8, fontFamily: T.sans }}>{err}</div>}
        <button
          onClick={requestLink}
          disabled={sending}
          style={{ ...S.btn(T.brown), width: "100%", padding: 13, fontSize: 15, opacity: sending ? 0.7 : 1 }}
        >
          {sending ? "Sending…" : "📧 Send Me a Login Link"}
        </button>
        <a href="/" style={{ display: "block", marginTop: 14, fontSize: 12, color: T.brownLight, textDecoration: "none" }}>← Back to V-HUB</a>
      </div>
    </div>
  );
}

// ── OVERVIEW ──────────────────────────────────────────────────────────────────
function Overview({ providers, reviews, leads, fullAreaMap }) {
  const active = providers.filter(p => p.is_active).length;
  const trial = providers.filter(p => p.subscription_status === "trial").length;
  const paid = providers.filter(p => ["active", "paid"].includes(p.subscription_status)).length;
  const expiring = providers.filter(p => { const d = daysLeft(p.trial_end_date); return d !== null && d >= 0 && d <= 7; });
  const expired = providers.filter(p => { const d = daysLeft(p.trial_end_date); return d !== null && d < 0 && p.is_active; }).length;
  const totalViews = providers.reduce((s, p) => s + (p.profile_views || 0), 0);
  const totalSearch = providers.reduce((s, p) => s + (p.search_appearances || 0), 0);
  const pending = reviews.filter(r => !r.is_approved).length;

  const areaCount = {};
  providers.forEach(p => (Array.isArray(p.service_areas) ? p.service_areas : []).forEach(a => {
    // Resolve to a human-readable name
    let name = fullAreaMap?.[a] || a;
    // If it's a long entity name like "🏡 Established Villages — Alhambra", extract village name
    if (name.includes('—')) name = name.split('—').pop()?.trim() || name;
    // Strip emoji prefix if present
    name = name.replace(/^[^\w\s]+\s*/, '').trim();
    if (name && name.length > 2) areaCount[name] = (areaCount[name] || 0) + 1;
  }));
  const topAreas = Object.entries(areaCount).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const cards = [
    { label: "Total Providers", val: providers.length, color: T.brown, icon: "🏪" },
    { label: "Active", val: active, color: T.green, icon: "✅" },
    { label: "On Trial", val: trial, color: T.gold, icon: "⏳" },
    { label: "Paid Subscribers", val: paid, color: T.teal, icon: "💳" },
    { label: "Expiring ≤7 Days", val: expiring.length, color: "#c0392b", icon: "🔴" },
    { label: "Trial Expired", val: expired, color: T.red, icon: "⚠️" },
    { label: "Profile Views", val: totalViews, color: T.brownLight, icon: "👁️" },
    { label: "Search Appearances", val: totalSearch, color: T.teal, icon: "🔍" },
    { label: "New Signups Pending", val: providers.filter(p => p.subscription_status === "pending").length, color: "#E8431A", icon: "🔔" },
    { label: "Reviews Pending", val: pending, color: T.red, icon: "⭐" },
    { label: "Lead Inquiries", val: leads.length, color: T.brown, icon: "📬" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {cards.map(c => (
          <div key={c.label} style={{ ...S.card, borderLeft: `4px solid ${c.color}` }}>
            <div style={{ fontSize: 11, color: T.brownLight, fontFamily: T.sans }}>{c.icon} {c.label}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: c.color, fontFamily: T.sans }}>{c.val}</div>
          </div>
        ))}
      </div>

      {expiring.length > 0 && (
        <div style={{ ...S.card, background: "#fff8e1", borderLeft: `4px solid ${T.gold}` }}>
          <div style={S.secTitle}>⚠️ Trials Expiring Soon</div>
          {expiring.map(p => { const d = daysLeft(p.trial_end_date); return (
            <div key={p.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "4px 0", borderBottom: `1px solid ${T.parchmentDark}` }}>
              <span style={{ color: T.brownDark, fontWeight: 600 }}>{p.business_name}</span>
              <span style={{ color: d <= 3 ? T.red : T.gold, fontWeight: 700 }}>{d === 0 ? "Today!" : `${d}d left`}</span>
            </div>
          ); })}
        </div>
      )}

      <div style={S.card}>
        <div style={S.secTitle}>👁️ Most Viewed Providers</div>
        {[...providers].sort((a, b) => (b.profile_views || 0) - (a.profile_views || 0)).slice(0, 5).map((p, i) => (
          <div key={p.id} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: `1px solid ${T.parchmentDark}` }}>
            <span style={{ fontSize: 13, color: T.brownDark }}>#{i + 1} {p.business_name || "(unnamed)"}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: T.teal, fontFamily: T.sans }}>{p.profile_views || 0} views</span>
          </div>
        ))}
      </div>

      {topAreas.length > 0 && (
        <div style={S.card}>
          <div style={S.secTitle}>📍 Top Service Areas</div>
          {topAreas.map(([area, count]) => (
            <div key={area} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: `1px solid ${T.parchmentDark}` }}>
              <span style={{ fontSize: 13, color: T.brownDark }}>{area}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: T.brown, fontFamily: T.sans }}>{count}</span>
            </div>
          ))}
        </div>
      )}

      <div style={S.card}>
        <div style={S.secTitle}>🆕 Recent Signups</div>
        {[...providers].sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).slice(0, 6).map(p => (
          <div key={p.id} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: `1px solid ${T.parchmentDark}` }}>
            <div>
              <span style={{ fontSize: 13, color: T.brownDark, fontWeight: 600 }}>{p.business_name || "(unnamed)"}</span>
              <span style={{ fontSize: 11, color: T.brownLight, marginLeft: 6, fontFamily: T.sans }}>{p.subscription_status}</span>
            </div>
            <span style={{ fontSize: 11, color: T.brownLight, fontFamily: T.sans }}>{fmt(p.created_date)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── PROVIDERS TAB ─────────────────────────────────────────────────────────────
function ProvidersTab({ providers, setProviders, catMap, svcMap, areaMap, fullSvcMap, fullAreaMap, adminPin, allCategories, allServices, allAreas, showToast }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState(null);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editSaving, setEditSaving] = useState(false);
  const [setPassId, setSetPassId] = useState(null);
  const [setPassVal, setSetPassVal] = useState("");
  const [setPassMsg, setSetPassMsg] = useState("");

  // Resolve a value that might be an ID or text
  const resolveName = (val, map) => (fullSvcMap[val] || fullAreaMap[val] || map[val] || "");

  const filtered = providers.filter(p => {
    const q = search.toLowerCase();
    const m = !q || [p.business_name, p.email, p.owner_name, p.phone, p.vh_number].some(v => v?.toLowerCase().includes(q));
    if (!m) return false;
    if (filter === "active") return p.is_active;
    if (filter === "hidden") return !p.is_active;
    if (filter === "trial") return p.subscription_status === "trial";
    if (filter === "paid") return ["active", "paid"].includes(p.subscription_status);
    if (filter === "pending") return p.subscription_status === "pending";
    if (filter === "expiring") { const d = daysLeft(p.trial_end_date); return d !== null && d >= 0 && d <= 7; }
    if (filter === "archived") return p.subscription_status === "archived";
    if (filter === "incomplete") return !p.email || !p.services || p.services.length === 0 || !p.service_areas || p.service_areas.length === 0;
    if (filter === "managed_by_us") return p.managed_by !== "provider";
    if (filter === "self_managed") return p.managed_by === "provider";
    return true;
  });

  const [approving, setApproving] = useState(null);
  const [reactivating, setReactivating] = useState(null);
  const [handing, setHanding] = useState(null);

  const sendAccountToProvider = async (p) => {
    if (!p.email) return alert("No email on file — edit the provider first and add their email, then send.");
    if (!window.confirm(`Send ${p.business_name} their account credentials to ${p.email}?\n\nThis will:\n• Activate their listing\n• Mark them as Self-Managed\n• Send their login email`)) return;
    setHanding(p.id);
    try {
      // Compute trial dates
      const now = new Date();
      const trialEnd = new Date(now);
      trialEnd.setDate(trialEnd.getDate() + 45);
      const trialStartStr = now.toISOString().split('T')[0];
      const trialEndStr = trialEnd.toISOString().split('T')[0];

      const res = await fetch("https://api.base44.app/api/apps/69d062aca815ce8e697894b1/functions/approveProvider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pin: "1357",
          provider_record_id: p.id,
          business_name: p.business_name,
          owner_name: p.owner_name,
          email: p.email,
          phone: p.phone,
          services: p.services || [],
          service_areas: p.service_areas || [],
          vh_number: p.vh_number,
          login_email: p.login_email || p.email,
          email_only: false,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      // Also mark as Self-Managed
      await fetch("https://api.base44.app/api/apps/69d062aca815ce8e697894b1/functions/adminUpdateProvider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "admin_update", pin: "1357", id: p.id, fields: { managed_by: "Self-Managed" } }),
      });

      // Update local state — active, visible, trial started, Self-Managed
      setProviders(prev => prev.map(x => x.id === p.id ? {
        ...x,
        is_active: true,
        is_visible: true,
        subscription_status: x.subscription_status || "trial",
        trial_start_date: x.trial_start_date || trialStartStr,
        trial_end_date: x.trial_end_date || trialEndStr,
        managed_by: "Self-Managed",
      } : x));

      if (data.email_error) {
        showToast(`⚠️ Activated but email failed: ${data.email_error}`, "error");
      } else {
        showToast(`✅ ${p.business_name} activated! Email sent to ${p.email}`, "success");
      }
    } catch(e) {
      showToast("❌ Error: " + e.message, "error");
    }
    setHanding(null);
  };

  const reactivateArchived = async (p) => {
    if (!window.confirm(`Reactivate ${p.business_name}? This will restore their listing and start a new 45-day trial.`)) return;
    setReactivating(p.id);
    try {
      const now = new Date();
      const trialEnd = new Date(now);
      trialEnd.setDate(trialEnd.getDate() + 45);
      await Provider.update(p.id, {
        subscription_status: "trial",
        is_active: true,
        is_visible: true,
        trial_start_date: now.toISOString().split('T')[0],
        trial_end_date: trialEnd.toISOString().split('T')[0],
        grace_period_end_date: null,
        reminder_sent: false,
      });
      setProviders(prev => prev.map(x => x.id === p.id ? { ...x, subscription_status: "trial", is_active: true, is_visible: true, trial_start_date: now.toISOString().split('T')[0], trial_end_date: trialEnd.toISOString().split('T')[0], grace_period_end_date: null, reminder_sent: false } : x));
      showToast(`✅ ${p.business_name} reactivated with a new 45-day trial!`, "success");
    } catch(e) {
      showToast("Error reactivating: " + e.message, "error");
    }
    setReactivating(null);
  };

  const approveAndNotify = async (p) => {
    if (!window.confirm(`Approve ${p.business_name} and send them a confirmation email?`)) return;
    setApproving(p.id);
    try {
      // Backend handles DB update + email via service role
      const now = new Date();
      const trialEnd = new Date(now);
      trialEnd.setDate(trialEnd.getDate() + 45);
      const trialStartStr = now.toISOString().split('T')[0];
      const trialEndStr = trialEnd.toISOString().split('T')[0];
      const res = await fetch("https://api.base44.app/api/apps/69d062aca815ce8e697894b1/functions/approveProvider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pin: "1357",
          provider_record_id: p.id,
          business_name: p.business_name,
          owner_name: p.owner_name,
          email: p.email,
          phone: p.phone,
          services: p.services || [],
          service_areas: p.service_areas || [],
          vh_number: p.vh_number,
          login_email: p.login_email || p.email,
          email_only: false,
        }),
      });

      const data = await res.json().catch(() => ({}));

      setProviders(prev => prev.map(x => x.id === p.id ? {
        ...x, is_active: true, is_visible: true,
        subscription_status: "trial",
        trial_start_date: trialStartStr,
        trial_end_date: trialEndStr,
      } : x));

      if (data.email_error) {
        showToast(`⚠️ ${p.business_name} activated — email failed. Resend manually.`, "error");
      } else {
        showToast(`✅ ${p.business_name} activated! Welcome email sent to ${p.email}`, "success");
      }
    } catch (e) {
      showToast("❌ Error: " + e.message, "error");
    }
    setApproving(null);
  };

  const adminUpdate = async (id, fields) => {
    // Direct entity SDK — bypasses backend function (more reliable)
    const record = await Provider.update(id, fields);
    return { success: true, record };
  };
  const setProviderPassword = async (id, newPass) => {
    if (!newPass || newPass.length < 6) { setSetPassMsg("⚠ Password must be at least 6 characters."); return; }
    const hashed = await sha256(newPass);
    await adminUpdate(id, { login_password: hashed, login_email: providers.find(p => p.id === id)?.login_email || providers.find(p => p.id === id)?.email || "" });
    setProviders(prev => prev.map(p => p.id === id ? { ...p, login_password: hashed } : p));
    setSetPassId(null);
    setSetPassVal("");
    setSetPassMsg("");
    showToast("✅ Password set! Provider can now log into Provider Hub.", "success");
  };

  const adminDelete = async (id) => {
    await Provider.delete(id);
    return { success: true };
  };
  const toggleActive = async (p) => { await adminUpdate(p.id, { is_active: !p.is_active }); setProviders(prev => prev.map(x => x.id === p.id ? { ...x, is_active: !p.is_active } : x)); };
  const toggleVisible = async (p) => { await adminUpdate(p.id, { is_visible: !p.is_visible }); setProviders(prev => prev.map(x => x.id === p.id ? { ...x, is_visible: !p.is_visible } : x)); };
  const toggleManaged = async (p) => {
    const newVal = (p.managed_by === "provider") ? "vhub" : "provider";
    await adminUpdate(p.id, { managed_by: newVal });
    setProviders(prev => prev.map(x => x.id === p.id ? { ...x, managed_by: newVal } : x));
  };
  const startEdit = (p) => {
    setEditId(p.id);
    setEditForm({
      business_name: p.business_name || "",
      owner_name: p.owner_name || "",
      email: p.email || "",
      phone: p.phone || "",
      website: p.website || "",
      address: p.address || "",
      description: p.description || "",
      years_in_business: p.years_in_business || "",
      license_number: p.license_number || "",
      google_review_url: p.google_review_url || "",
      google_rating: p.google_rating || "",
      hours_of_operation: p.hours_of_operation || "",
      is_mobile: p.is_mobile === true,
      notes: p.notes || "",
      subscription_tier: p.subscription_tier || "basic",
      subscription_status: p.subscription_status || "trial",
      category_id: p.category_id || "",
      services: Array.isArray(p.services) ? [...p.services] : [],
      service_areas: Array.isArray(p.service_areas) ? [...p.service_areas] : [],
    });
  };

  const saveEdit = async (id) => {
    setEditSaving(true);
    const payload = {
      business_name: editForm.business_name,
      owner_name: editForm.owner_name,
      email: editForm.email,
      phone: editForm.phone,
      website: editForm.website,
      address: editForm.address,
      description: editForm.description,
      years_in_business: editForm.years_in_business ? Number(editForm.years_in_business) : null,
      license_number: editForm.license_number,
      google_review_url: editForm.google_review_url,
      google_rating: editForm.google_rating ? parseFloat(editForm.google_rating) : null,
      hours_of_operation: editForm.hours_of_operation,
      is_mobile: editForm.is_mobile === true,
      notes: editForm.notes,
      subscription_tier: editForm.subscription_tier,
      subscription_status: editForm.subscription_status,
      category_id: editForm.category_id,
      services: editForm.services,
      service_areas: editForm.service_areas,
    };
    try {
      await adminUpdate(id, payload);
      setProviders(prev => prev.map(x => x.id === id ? { ...x, ...payload } : x));
      setEditId(null);
      showToast("✅ Changes saved!", "success");
    } catch (e) {
      showToast("❌ Save failed: " + (e.message || "Unknown error"), "error");
    }
    setEditSaving(false);
  };

  const archiveProvider = async (p) => {
    if (!window.confirm(`Archive ${p.business_name}?\n\nThis hides them from the directory but keeps all their data. You can restore them anytime from the Archived filter.`)) return;
    await adminUpdate(p.id, { subscription_status: "archived", is_active: false, is_visible: false });
    setProviders(prev => prev.map(x => x.id === p.id ? { ...x, subscription_status: "archived", is_active: false, is_visible: false } : x));
  };
  const permanentDelete = async (p) => {
    const confirmed = window.confirm(`⚠️ PERMANENTLY DELETE ${p.business_name}?\n\nThis cannot be undone. All data will be gone forever.\n\nClick OK only if you are absolutely sure.`);
    if (!confirmed) return;
    const doubleCheck = window.confirm(`Last chance — permanently delete "${p.business_name}" (${p.vh_number})?`);
    if (!doubleCheck) return;
    await adminDelete(p.id);
    setProviders(prev => prev.filter(x => x.id !== p.id));
  };

  // Auto-expand when exactly 1 result
  React.useEffect(() => {
    if (filtered.length === 1) setExpanded(filtered[0].id);
    else if (filtered.length > 1) setExpanded(null);
  }, [filtered.length, filtered[0]?.id]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* ── SEARCH BAR ── */}
      <div style={{ position: "relative" }}>
        <input
          placeholder="🔍 Type a name, email, VH number, or phone..."
          value={search}
          onChange={e => { setSearch(e.target.value); setFilter("all"); }}
          style={{ ...S.inp, fontSize: 15, padding: "11px 40px 11px 14px", border: `2px solid ${search ? T.teal : T.border}`, boxShadow: search ? `0 0 0 3px rgba(26,107,92,0.15)` : "none" }}
        />
        {search && (
          <button onClick={() => { setSearch(""); setFilter("all"); }} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, color: T.brownLight }}>✕</button>
        )}
      </div>

      {/* ── RESULT COUNT when searching ── */}
      {search && (
        <div style={{ fontSize: 13, color: filtered.length === 0 ? T.red : T.teal, fontFamily: T.sans, fontWeight: 700, padding: "2px 4px" }}>
          {filtered.length === 0 ? "No accounts found" : filtered.length === 1 ? `✅ 1 account found — expanded below` : `${filtered.length} accounts match`}
        </div>
      )}

      {/* ── STATUS FILTERS (only show when not in single-search mode) ── */}
      {!search && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {["all", "incomplete", "pending", "active", "hidden", "trial", "paid", "expiring", "archived", "managed_by_us", "self_managed"].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={S.filterBtn(filter === f)}>
              {f === "all" ? `All (${providers.length})`
                : f === "archived" ? `📁 Archived (${providers.filter(p => p.subscription_status === "archived").length})`
                : f === "incomplete" ? `⚠ Incomplete (${providers.filter(p => !p.email || !p.services || p.services.length === 0 || !p.service_areas || p.service_areas.length === 0).length})`
                : f === "managed_by_us" ? `🛠 We Manage (${providers.filter(p => p.managed_by !== "provider").length})`
                : f === "self_managed" ? `✅ Self-Managed (${providers.filter(p => p.managed_by === "provider").length})`
                : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 && <div style={{ textAlign: "center", color: T.brownLight, padding: 24, fontStyle: "italic" }}>No providers match.</div>}

      {filtered.map(p => {
        const dl = daysLeft(p.trial_end_date);
        const isOpen = expanded === p.id;
        const svcList = Array.isArray(p.services) ? p.services : [];
        const areaList = Array.isArray(p.service_areas) ? p.service_areas : [];
        const catName = p.category_id ? (catMap[p.category_id] || p.category_id) : null;
        const svcNames = svcList.map(s => resolveName(s, svcMap)).filter(Boolean);
        const areaNames = areaList.map(a => resolveName(a, areaMap)).filter(Boolean);

        return (
          <div key={p.id} style={S.card}>
            {/* HEADER ROW — always visible */}
            <div onClick={() => setExpanded(isOpen ? null : p.id)} style={{ cursor: "pointer" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: 16, color: T.brownDark }}>
                    {p.business_name || <span style={{ color: "#ccc", fontStyle: "italic" }}>Unnamed Provider</span>}
                  </div>
                  <div style={{ fontSize: 12, color: T.brownLight, fontFamily: T.sans, marginTop: 2 }}>
                    {p.owner_name && <span>{p.owner_name} · </span>}
                    {p.email}
                  </div>
                  <div style={{ fontSize: 11, color: "#999", fontFamily: T.sans, marginTop: 2 }}>
                    {p.phone && <span>{p.phone} · </span>}
                    <strong style={{ color: T.brown }}>{p.vh_number || "No VH#"}</strong>
                    {" · "}Joined {fmt(p.created_date)}
                  </div>
                </div>
                <div style={{ fontSize: 18, color: T.brownLight, marginLeft: 8 }}>{isOpen ? "▲" : "▼"}</div>
              </div>

              {/* Category + quick service preview */}
              {catName && (
                <div style={{ marginTop: 5, fontSize: 12, fontFamily: T.sans }}>
                  <span style={{ ...S.badge(T.brownDark, T.parchmentDark), marginRight: 4 }}>📂 {catName}</span>
                </div>
              )}
              {svcNames.length > 0 && (
                <div style={{ marginTop: 4, fontSize: 11, color: T.teal, fontFamily: T.sans }}>
                  🛠 {svcNames.slice(0, 3).join(" · ")}{svcNames.length > 3 ? ` +${svcNames.length - 3} more` : ""}
                </div>
              )}
              {areaNames.length > 0 && (
                <div style={{ fontSize: 11, color: T.brownLight, fontFamily: T.sans }}>
                  📍 {areaNames.slice(0, 3).join(", ")}{areaNames.length > 3 ? ` +${areaNames.length - 3}` : ""}
                </div>
              )}
            </div>

            {/* STATUS BADGES */}
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: 8 }}>
              <span style={S.badge(p.is_active ? T.green : T.red, p.is_active ? "#e8f5e9" : "#fce8e8")}>{p.is_active ? "Active" : "Inactive"}</span>
              <span style={S.badge(p.is_visible !== false ? T.teal : "#888", p.is_visible !== false ? "#e0f4f1" : "#f0f0f0")}>{p.is_visible !== false ? "Visible" : "Hidden"}</span>
              {p.subscription_status && <span style={S.badge(p.subscription_status === "archived" ? "#1A237E" : T.brown, p.subscription_status === "archived" ? "#e8eaf6" : T.parchmentDark)}>{p.subscription_status === "archived" ? "📁 Archived" : p.subscription_status}</span>}
              {p.subscription_tier && <span style={S.badge(T.teal, "#e0f4f1")}>{p.subscription_tier}</span>}
              {dl !== null && dl >= 0 && <span style={S.badge(dl <= 3 ? T.red : T.gold, dl <= 3 ? "#fce8e8" : "#fff8e1")}>{dl === 0 ? "Expires today!" : `${dl}d left`}</span>}
              {dl !== null && dl < 0 && <span style={S.badge(T.red, "#fce8e8")}>Trial expired</span>}
              {!p.email && <span style={S.badge("#B71C1C", "#ffebee")}>⚠ No Email</span>}
              {(!p.services || p.services.length === 0) && <span style={S.badge("#E65100", "#fff3e0")}>⚠ No Services</span>}
              {(!p.service_areas || p.service_areas.length === 0) && <span style={S.badge("#4A148C", "#f3e5f5")}>⚠ No Areas</span>}
              {/* Management ownership badge */}
              {p.managed_by === "provider"
                ? <span style={S.badge("#1B5E20", "#E8F5E9")}>✅ Self-Managed</span>
                : p.onboarding_type === "self_signup"
                  ? <span style={S.badge("#1565C0", "#E3F2FD")}>🖥 Self Sign-Up</span>
                  : <span style={S.badge("#5D4037", "#EFEBE9")}>🛠 Managed by V-Hub</span>
              }
            </div>
            {/* Management toggle button */}
            <div style={{ marginTop: 6 }}>
              <button
                onClick={e => { e.stopPropagation(); toggleManaged(p); }}
                style={{ fontSize: 11, fontFamily: T.sans, fontWeight: 700, cursor: "pointer", padding: "4px 12px", borderRadius: 20, border: "1.5px solid", borderColor: p.managed_by === "provider" ? "#5D4037" : "#1B5E20", background: p.managed_by === "provider" ? "#EFEBE9" : "#E8F5E9", color: p.managed_by === "provider" ? "#5D4037" : "#1B5E20" }}
              >
                {p.managed_by === "provider" ? "↩ Mark as Managed by Us" : "✋ Mark as Self-Managed"}
              </button>
            </div>

            {/* EXPANDED DETAIL */}
            {isOpen && (
              <div style={{ marginTop: 14, borderTop: `1px solid ${T.border}`, paddingTop: 14 }}>

                {/* ── ACCOUNT SUMMARY BANNER ── */}
                <div style={{ background: `linear-gradient(135deg,${T.brownDark},${T.brown})`, borderRadius: 8, padding: "12px 14px", marginBottom: 12, color: "#fff" }}>
                  <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", opacity: 0.7, fontFamily: T.sans, marginBottom: 6 }}>Account Overview</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                    {[
                      ["VH Number", p.vh_number || "—"],
                      ["Status", (p.subscription_status || "—").toUpperCase()],
                      ["Tier", (p.subscription_tier || "basic").toUpperCase()],
                      ["Trial Started", fmt(p.trial_start_date)],
                      ["Trial Ends", fmt(p.trial_end_date)],
                      ["Grace Period", p.grace_period_end_date ? fmt(p.grace_period_end_date) : "—"],
                      ["Onboarding", p.onboarding_type || "—"],
                      ["Stripe Sub", p.stripe_subscription_id ? "✅ Connected" : "❌ None"],
                      ["Stripe Customer", p.stripe_customer_id ? "✅ On file" : "❌ None"],
                    ].map(([label, val]) => (
                      <div key={label}>
                        <div style={{ fontSize: 9, opacity: 0.65, fontFamily: T.sans, textTransform: "uppercase", letterSpacing: 1 }}>{label}</div>
                        <div style={{ fontSize: 12, fontWeight: 700, fontFamily: T.sans, marginTop: 1 }}>{String(val)}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stats grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                  {[
                    ["👁️ Profile Views", p.profile_views ?? 0],
                    ["🔍 Search Appearances", p.search_appearances ?? 0],
                    ["🏆 Years in Business", p.years_in_business || "—"],
                    ["📄 License #", p.license_number || "—"],
                    ["⭐ Google Rating", p.google_rating ? `${p.google_rating}★` : "—"],
                    ["📅 Joined", fmt(p.created_date)],
                    ["📱 Mobile Provider", p.is_mobile ? "Yes" : "No"],
                    ["🕐 Hours", p.hours_of_operation || "—"],
                  ].map(([label, val]) => (
                    <div key={label} style={{ background: T.parchment, borderRadius: 6, padding: "7px 10px" }}>
                      <div style={{ fontSize: 10, color: T.brownLight, fontFamily: T.sans }}>{label}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: T.brownDark, fontFamily: T.sans }}>{String(val)}</div>
                    </div>
                  ))}
                </div>

                {/* Category */}
                {catName && (
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 11, color: T.brownLight, fontFamily: T.sans, fontWeight: 700, marginBottom: 3 }}>📂 MACRO CATEGORY</div>
                    <span style={{ ...S.badge(T.brownDark, T.parchmentDark), fontSize: 13 }}>{catName}</span>
                  </div>
                )}

                {/* Services (micro) */}
                {svcNames.length > 0 && (
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 11, color: T.brownLight, fontFamily: T.sans, fontWeight: 700, marginBottom: 4 }}>🛠 SERVICES OFFERED ({svcNames.length})</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {svcNames.map(s => <span key={s} style={{ fontSize: 12, background: T.parchmentDark, color: T.brownDark, borderRadius: 4, padding: "3px 9px", fontFamily: T.sans }}>{s}</span>)}
                    </div>
                  </div>
                )}

                {/* Villages */}
                {areaNames.length > 0 && (
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 11, color: T.brownLight, fontFamily: T.sans, fontWeight: 700, marginBottom: 4 }}>📍 SERVICE AREAS ({areaNames.length})</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {areaNames.map(a => <span key={a} style={{ fontSize: 12, background: "#e0f4f1", color: T.teal, borderRadius: 4, padding: "3px 9px", fontFamily: T.sans }}>{a}</span>)}
                    </div>
                  </div>
                )}

                {/* Description */}
                {p.description && <div style={{ fontSize: 13, color: T.brownLight, fontStyle: "italic", marginBottom: 8, borderLeft: `3px solid ${T.border}`, paddingLeft: 8 }}>{p.description}</div>}

                {/* Links */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 8 }}>
                  {p.website && <a href={p.website} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: T.teal }}>🌐 Website</a>}
                  {p.google_review_url && <a href={p.google_review_url} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: T.teal }}>⭐ Google Reviews</a>}
                  {p.address && <span style={{ fontSize: 12, color: T.brownLight }}>📍 {p.address}</span>}
                </div>

                {/* Notes */}
                {p.notes && <div style={{ fontSize: 12, color: T.brownLight, background: "#fff8e1", borderRadius: 6, padding: "8px 10px", marginBottom: 10 }}>📝 {p.notes}</div>}

                {/* Login credentials */}
                <div style={{ background: p.login_password ? "#E8F5E9" : "#ffeaea", border: `1px solid ${p.login_password ? "#A5D6A7" : "#c0392b"}`, borderRadius: 8, padding: "10px 14px", marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <div style={{ fontSize: 11, color: p.login_password ? "#2E7D32" : "#c0392b", fontFamily: T.sans, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>
                      {p.login_password ? "🔐 Provider Hub Login" : "⚠️ No Login Password"}
                    </div>
                    <button
                      onClick={() => { setSetPassId(setPassId === p.id ? null : p.id); setSetPassVal(""); setSetPassMsg(""); }}
                      style={{ fontSize: 11, background: "#8B4513", color: "#fff", border: "none", borderRadius: 4, padding: "3px 10px", cursor: "pointer", fontFamily: T.sans }}
                    >
                      {setPassId === p.id ? "Cancel" : (p.login_password ? "Change Password" : "Set Password")}
                    </button>
                  </div>
                  {p.login_email && <div style={{ fontSize: 13, color: "#1A0A00", fontFamily: T.sans, marginBottom: 2 }}><strong>Email:</strong> {p.login_email || p.email}</div>}
                  {p.login_password
                    ? <div style={{ fontSize: 12, color: "#2E7D32", fontFamily: T.sans }}>✓ Password is set (hashed)</div>
                    : <div style={{ fontSize: 12, color: "#c0392b", fontFamily: T.sans }}>Provider cannot log in until a password is set.</div>
                  }
                  {setPassId === p.id && (
                    <div style={{ marginTop: 10, display: "flex", gap: 8, flexDirection: "column" }}>
                      <input
                        type="password"
                        value={setPassVal}
                        onChange={e => setSetPassVal(e.target.value)}
                        placeholder="New password (min 6 chars)..."
                        style={{ padding: "8px 10px", border: "1px solid #8B4513", borderRadius: 6, fontSize: 13, fontFamily: T.sans, width: "100%", boxSizing: "border-box" }}
                        onKeyDown={e => e.key === "Enter" && setProviderPassword(p.id, setPassVal)}
                      />
                      {setPassMsg && <div style={{ fontSize: 12, color: "#c0392b", fontFamily: T.sans }}>{setPassMsg}</div>}
                      <button
                        onClick={() => setProviderPassword(p.id, setPassVal)}
                        style={{ background: "#2e7d32", color: "#fff", border: "none", borderRadius: 6, padding: "8px 16px", cursor: "pointer", fontWeight: 700, fontSize: 13, fontFamily: T.sans }}
                      >
                        Save Password
                      </button>
                    </div>
                  )}
                </div>

                {/* Stripe info */}
                {(p.stripe_customer_id || p.stripe_subscription_id) && (
                  <div style={{ fontSize: 11, color: "#aaa", fontFamily: T.sans, marginBottom: 8 }}>
                    {p.stripe_customer_id && <div>Stripe Customer: {p.stripe_customer_id}</div>}
                    {p.stripe_subscription_id && <div>Stripe Sub: {p.stripe_subscription_id}</div>}
                  </div>
                )}

                {/* Grace period notice for trial_expired */}
                {p.subscription_status === "trial_expired" && p.grace_period_end_date && (
                  <div style={{ background: "#fff3cd", border: "1px solid #E8431A", borderRadius: 6, padding: "8px 12px", marginBottom: 8, fontSize: 12, color: "#8B0000", fontFamily: T.sans }}>
                    ⏳ Grace period ends: <strong>{fmt(p.grace_period_end_date)}</strong> — Provider can still reactivate via Stripe
                  </div>
                )}
                {/* Archived notice */}
                {p.subscription_status === "archived" && (
                  <div style={{ background: "#e8eaf6", border: "1px solid #3949AB", borderRadius: 6, padding: "8px 12px", marginBottom: 8, fontSize: 12, color: "#1A237E", fontFamily: T.sans }}>
                    📁 Archived — Provider emailed admin@v-hub.us to request reactivation. Use "Reactivate" below to restore their listing.
                  </div>
                )}
                {/* Action buttons */}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                  {p.subscription_status === "pending" && (
                    <button
                      onClick={() => approveAndNotify(p)}
                      disabled={approving === p.id}
                      style={{ ...S.btn("#2e7d32"), fontWeight: 900, fontSize: 13, opacity: approving === p.id ? 0.7 : 1 }}
                    >
                      {approving === p.id ? "Approving…" : "✅ Approve & Activate"}
                    </button>
                  )}
                  <button onClick={() => toggleActive(p)} style={S.btn(p.is_active ? "#8B4513" : "#2e7d32")}>{p.is_active ? "Deactivate" : "Activate"}</button>
                  <button onClick={() => toggleVisible(p)} style={S.btn(T.teal)}>{p.is_visible === false ? "Make Visible" : "Hide Listing"}</button>
                  <button onClick={() => startEdit(p)} style={S.btn("#5a3010")}>✏️ Edit Details</button>
                  {p.managed_by !== "provider" && (
                    <button
                      onClick={() => sendAccountToProvider(p)}
                      disabled={handing === p.id}
                      style={{ ...S.btn("#1B3D6F"), fontWeight: 900, opacity: handing === p.id ? 0.7 : 1 }}
                      title={p.email ? `Activate + mark Self-Managed + send login to ${p.email}` : "Add email first"}
                    >
                      {handing === p.id ? "Sending…" : p.email ? "📤 Send Account to Provider" : "📤 Send Account (add email first)"}
                    </button>
                  )}
                  {p.email && <a href={`mailto:${p.email}`} style={{ ...S.btn(T.brownLight), textDecoration: "none" }}>✉️ Email</a>}
                  {p.phone && <a href={`tel:${p.phone}`} style={{ ...S.btn("#777"), textDecoration: "none" }}>📞 Call</a>}
                </div>
                {/* Archive / Delete row — always visible */}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", borderTop: "1px solid #ddd", paddingTop: 8 }}>
                  {p.subscription_status === "archived" ? (
                    <>
                      <button onClick={() => reactivateArchived(p)} style={{ ...S.btn("#1A237E"), fontWeight: 900 }}>🔓 Reactivate Account</button>
                      <button onClick={() => permanentDelete(p)} style={{ ...S.btn(T.red), fontWeight: 900, fontSize: 13 }}>🗑️ Permanently Delete</button>
                    </>
                  ) : (
                    <button onClick={() => archiveProvider(p)} style={{ ...S.btn("#5C4033"), fontSize: 13 }}>📁 Archive / Remove from View</button>
                  )}
                </div>
                {/* ── INLINE EDIT FORM ── */}
                {editId === p.id && (
                  <div style={{ marginTop: 16, background: "#fff", border: `2px solid ${T.brownDark}`, borderRadius: 10, padding: 16 }}>
                    <div style={{ fontWeight: 800, fontSize: 13, color: T.brownDark, fontFamily: T.sans, marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>✏️ Edit Provider Details</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      {[
                        ["Business Name", "business_name"],
                        ["Owner Name", "owner_name"],
                        ["Email", "email"],
                        ["Phone", "phone"],
                        ["Website", "website"],
                        ["Address", "address"],
                        ["Years in Business", "years_in_business"],
                        ["License #", "license_number"],
                        ["Google Rating (1–5)", "google_rating"],
                      ].map(([label, key]) => (
                        <div key={key}>
                          <div style={{ fontSize: 10, color: T.brownLight, fontFamily: T.sans, fontWeight: 700, marginBottom: 2 }}>{label}</div>
                          <input
                            value={editForm[key] || ""}
                            onChange={e => setEditForm(f => ({ ...f, [key]: e.target.value }))}
                            style={{ width: "100%", padding: "7px 10px", fontSize: 13, fontFamily: T.sans, border: `1px solid ${T.border}`, borderRadius: 6, boxSizing: "border-box" }}
                          />
                        </div>
                      ))}
                      <div style={{ gridColumn: "1 / -1" }}>
                        <div style={{ fontSize: 10, color: T.brownLight, fontFamily: T.sans, fontWeight: 700, marginBottom: 2 }}>Google Review URL</div>
                        <input
                          type="url"
                          value={editForm.google_review_url || ""}
                          onChange={e => setEditForm(f => ({ ...f, google_review_url: e.target.value }))}
                          style={{ width: "100%", padding: "7px 10px", fontSize: 13, fontFamily: T.sans, border: `1px solid ${T.border}`, borderRadius: 6, boxSizing: "border-box" }}
                          placeholder="https://maps.app.goo.gl/..."
                        />
                        <div style={{ fontSize: 10, color: "#999", marginTop: 3, fontFamily: T.sans }}>Paste their Google Maps link — rating syncs automatically each night at 3 AM.</div>
                      </div>
                      {/* Hours of operation */}
                      <div style={{ gridColumn: "1 / -1" }}>
                        <div style={{ fontSize: 10, color: T.brownLight, fontFamily: T.sans, fontWeight: 700, marginBottom: 2 }}>Hours of Operation</div>
                        <textarea
                          value={editForm.hours_of_operation || ""}
                          onChange={e => setEditForm(f => ({ ...f, hours_of_operation: e.target.value }))}
                          rows={3}
                          placeholder={"Mon–Fri: 8am–5pm\nSat: 9am–1pm\nSun: Closed"}
                          style={{ width: "100%", padding: "7px 10px", fontSize: 13, fontFamily: T.sans, border: `1px solid ${T.border}`, borderRadius: 6, boxSizing: "border-box", resize: "vertical", lineHeight: 1.7 }}
                        />
                      </div>
                      {/* Mobile toggle */}
                      <div style={{ display: "flex", alignItems: "center", gap: 10, gridColumn: "1 / -1" }}>
                        <input type="checkbox" checked={!!editForm.is_mobile} onChange={e => setEditForm(f => ({ ...f, is_mobile: e.target.checked }))} style={{ width: 16, height: 16, cursor: "pointer" }} />
                        <span style={{ fontSize: 12, fontFamily: T.sans, color: T.brown }}>Mobile provider — travels to customers (no fixed address)</span>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: T.brownLight, fontFamily: T.sans, fontWeight: 700, marginBottom: 2 }}>Subscription Status</div>
                        <select value={editForm.subscription_status} onChange={e => setEditForm(f => ({ ...f, subscription_status: e.target.value }))}
                          style={{ width: "100%", padding: "7px 10px", fontSize: 13, fontFamily: T.sans, border: `1px solid ${T.border}`, borderRadius: 6 }}>
                          <option value="trial">Trial</option>
                          <option value="active">Active</option>
                          <option value="pending">Pending</option>
                          <option value="expired">Expired</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: T.brownLight, fontFamily: T.sans, fontWeight: 700, marginBottom: 2 }}>Subscription Tier</div>
                        <select value={editForm.subscription_tier} onChange={e => setEditForm(f => ({ ...f, subscription_tier: e.target.value }))}
                          style={{ width: "100%", padding: "7px 10px", fontSize: 13, fontFamily: T.sans, border: `1px solid ${T.border}`, borderRadius: 6 }}>
                          <option value="basic">Basic</option>
                          <option value="featured">Featured</option>
                          <option value="premium">Premium</option>
                        </select>
                      </div>
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <div style={{ fontSize: 10, color: T.brownLight, fontFamily: T.sans, fontWeight: 700, marginBottom: 2 }}>Notes (internal)</div>
                      <textarea
                        value={editForm.notes || ""}
                        onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))}
                        rows={2}
                        style={{ width: "100%", padding: "7px 10px", fontSize: 13, fontFamily: T.sans, border: `1px solid ${T.border}`, borderRadius: 6, boxSizing: "border-box", resize: "vertical" }}
                      />
                    </div>
                    {/* ── Category ── */}
                    <div style={{ marginTop: 8 }}>
                      <div style={{ fontSize: 10, color: T.brownLight, fontFamily: T.sans, fontWeight: 700, marginBottom: 2 }}>Category</div>
                      <select
                        value={editForm.category_id || ""}
                        onChange={e => setEditForm(f => ({ ...f, category_id: e.target.value, services: [] }))}
                        style={{ width: "100%", padding: "7px 10px", fontSize: 13, fontFamily: T.sans, border: `1px solid ${T.border}`, borderRadius: 6 }}
                      >
                        <option value="">— Select category —</option>
                        {allCategories.filter(c => c.is_active !== false).map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    {/* ── Services multi-select ── */}
                    <div style={{ marginTop: 8 }}>
                      <div style={{ fontSize: 10, color: T.brownLight, fontFamily: T.sans, fontWeight: 700, marginBottom: 4 }}>
                        Services <span style={{ fontWeight: 400, color: "#999" }}>(click to toggle)</span>
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {allServices
                          .filter(s => !editForm.category_id || s.category_id === editForm.category_id)
                          .filter(s => s.is_active !== false)
                          .map(s => {
                            const selected = (editForm.services || []).includes(s.id);
                            return (
                              <button key={s.id} type="button"
                                onClick={() => setEditForm(f => ({
                                  ...f,
                                  services: selected
                                    ? f.services.filter(x => x !== s.id)
                                    : [...(f.services || []), s.id]
                                }))}
                                style={{
                                  padding: "4px 10px", fontSize: 12, fontFamily: T.sans, borderRadius: 20, cursor: "pointer",
                                  border: selected ? `2px solid ${T.brownDark}` : `1px solid ${T.border}`,
                                  background: selected ? T.brownDark : "#fff",
                                  color: selected ? "#fff" : T.brownLight,
                                  fontWeight: selected ? 700 : 400,
                                }}
                              >{s.name}</button>
                            );
                          })}
                        {allServices.filter(s => !editForm.category_id || s.category_id === editForm.category_id).length === 0 &&
                          <div style={{ fontSize: 12, color: "#999", fontFamily: T.sans }}>Select a category first</div>}
                      </div>
                    </div>
                    {/* ── Service Areas (Villages) multi-select ── */}
                    <div style={{ marginTop: 8 }}>
                      <div style={{ fontSize: 10, color: T.brownLight, fontFamily: T.sans, fontWeight: 700, marginBottom: 4 }}>
                        Service Areas / Villages <span style={{ fontWeight: 400, color: "#999" }}>(click to toggle)</span>
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, maxHeight: 140, overflowY: "auto", padding: "6px", background: "#fafafa", border: `1px solid ${T.border}`, borderRadius: 6 }}>
                        {allAreas.filter(a => a.is_active !== false).map(a => {
                          const selected = (editForm.service_areas || []).includes(a.id);
                          return (
                            <button key={a.id} type="button"
                              onClick={() => setEditForm(f => ({
                                ...f,
                                service_areas: selected
                                  ? f.service_areas.filter(x => x !== a.id)
                                  : [...(f.service_areas || []), a.id]
                              }))}
                              style={{
                                padding: "3px 9px", fontSize: 11, fontFamily: T.sans, borderRadius: 14, cursor: "pointer",
                                border: selected ? `2px solid #00796B` : `1px solid ${T.border}`,
                                background: selected ? "#00796B" : "#fff",
                                color: selected ? "#fff" : "#555",
                                fontWeight: selected ? 700 : 400,
                              }}
                            >{a.name}</button>
                          );
                        })}
                      </div>
                      <div style={{ fontSize: 10, color: "#888", fontFamily: T.sans, marginTop: 4 }}>
                        {(editForm.service_areas || []).length} village{(editForm.service_areas || []).length !== 1 ? "s" : ""} selected
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => saveEdit(p.id)} disabled={editSaving} style={{ ...S.btn("#2e7d32"), opacity: editSaving ? 0.6 : 1 }}>
                        {editSaving ? "Saving..." : "💾 Save Changes"}
                      </button>
                      <button onClick={() => setEditId(null)} style={S.btn("#888")}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── REVIEWS TAB ───────────────────────────────────────────────────────────────
function ReviewsTab({ reviews, setReviews, providers, adminPin }) {
  const [filter, setFilter] = useState("pending");
  const provMap = {}; providers.forEach(p => { provMap[p.id] = p.business_name; });
  const shown = reviews.filter(r => filter === "all" ? true : filter === "pending" ? !r.is_approved : r.is_approved);
  const approve = async (r) => {
    await fetch(`https://api.base44.app/api/apps/69d062aca815ce8e697894b1/functions/adminUpdateReview`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: "1357", id: r.id, fields: { is_approved: true } }),
    });
    // Immediately recalc provider rating so it's reflected now, not at 4am
    fetch(`https://api.base44.app/api/apps/69d062aca815ce8e697894b1/functions/recalcProviderRatings`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}',
    }).catch(() => {});
    setReviews(p => p.map(x => x.id === r.id ? { ...x, is_approved: true } : x));
  };
  const remove = async (r) => {
    if (!window.confirm("Delete this review?")) return;
    await fetch(`https://api.base44.app/api/apps/69d062aca815ce8e697894b1/functions/adminUpdateReview`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: "1357", id: r.id, delete: true }),
    });
    // Recalc provider rating after deletion
    fetch(`https://api.base44.app/api/apps/69d062aca815ce8e697894b1/functions/recalcProviderRatings`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}',
    }).catch(() => {});
    setReviews(p => p.filter(x => x.id !== r.id));
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", gap: 8 }}>
        {["pending", "approved", "all"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={S.filterBtn(filter === f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)} ({f === "pending" ? reviews.filter(r => !r.is_approved).length : f === "approved" ? reviews.filter(r => r.is_approved).length : reviews.length})
          </button>
        ))}
      </div>
      {shown.length === 0 && <div style={{ textAlign: "center", color: T.brownLight, padding: 24, fontStyle: "italic" }}>No reviews here.</div>}
      {shown.map(r => (
        <div key={r.id} style={S.card}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <div><span style={{ fontWeight: 700, color: T.brownDark }}>{r.customer_name}</span>{r.customer_village && <span style={{ fontSize: 12, color: T.brownLight, marginLeft: 6 }}>· {r.customer_village}</span>}</div>
            <span style={{ color: "#DAA520" }}>{"★".repeat(r.rating || 0)}{"☆".repeat(5 - (r.rating || 0))}</span>
          </div>
          {provMap[r.provider_id] && <div style={{ fontSize: 11, color: T.brownLight, fontFamily: T.sans, marginBottom: 4 }}>For: {provMap[r.provider_id]}</div>}
          {r.service_used && <div style={{ fontSize: 11, color: T.brownLight, fontFamily: T.sans, marginBottom: 4 }}>Service: {r.service_used}</div>}
          <div style={{ fontSize: 13, color: T.brownDark, fontStyle: "italic", marginBottom: 6 }}>"{r.review_text}"</div>
          <div style={{ fontSize: 11, color: "#bbb", fontFamily: T.sans, marginBottom: 8 }}>{fmt(r.created_date)}</div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {!r.is_approved && <button onClick={() => approve(r)} style={S.btn(T.green)}>✓ Approve</button>}
            <button onClick={() => remove(r)} style={S.btn(T.red)}>✕ Delete</button>
            <span style={S.badge(r.is_approved ? T.green : T.gold, r.is_approved ? "#e8f5e9" : "#fff8e1")}>{r.is_approved ? "Approved" : "Pending"}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── LEADS TAB ─────────────────────────────────────────────────────────────────
function LeadsTab({ leads, providers }) {
  const provMap = {}; providers.forEach(p => { provMap[p.id] = p.business_name; });
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {leads.length === 0 && <div style={{ ...S.card, textAlign: "center", color: T.brownLight, padding: 30, fontStyle: "italic" }}>No lead inquiries yet.</div>}
      {[...leads].sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).map(l => (
        <div key={l.id} style={S.card}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontWeight: 700, color: T.brownDark }}>{l.customer_name}</span>
            <span style={S.badge(T.brown, T.parchmentDark)}>{l.status || "new"}</span>
          </div>
          <div style={{ fontSize: 12, color: T.brownLight, fontFamily: T.sans, marginBottom: 4 }}>{l.customer_email} · {l.customer_phone}</div>
          {provMap[l.provider_id] && <div style={{ fontSize: 12, color: T.teal, marginBottom: 4 }}>Provider: {provMap[l.provider_id]}</div>}
          {l.message && <div style={{ fontSize: 13, color: T.brownDark, fontStyle: "italic", marginBottom: 4 }}>"{l.message}"</div>}
          <div style={{ fontSize: 11, color: "#bbb", fontFamily: T.sans }}>{fmt(l.created_date)}</div>
        </div>
      ))}
    </div>
  );
}


// ── DEALS TAB ─────────────────────────────────────────────────────────────────
function DealsTab({ providers, classifiedAds }) {
  // Compute per-provider ad info
  const now = new Date();

  function daysLeft(expiresAt) {
    if (!expiresAt) return null;
    const exp = new Date(expiresAt);
    const diff = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
    return diff;
  }

  // Build provider map for quick lookup
  const provMap = {};
  (providers || []).forEach(p => { provMap[p.id] = p; });

  // Group ads by provider
  const adsByProvider = {};
  (classifiedAds || []).forEach(ad => {
    const pid = ad.provider_id;
    if (!adsByProvider[pid]) adsByProvider[pid] = { live: null, queued: [] };
    if (ad.is_active) adsByProvider[pid].live = ad;
    else adsByProvider[pid].queued.push(ad);
  });

  const providerIds = Object.keys(adsByProvider);
  const liveAds  = (classifiedAds || []).filter(a => a.is_active && (daysLeft(a.deal_expires_at) === null || daysLeft(a.deal_expires_at) >= 0));
  const expiredAds = (classifiedAds || []).filter(a => a.is_active && daysLeft(a.deal_expires_at) !== null && daysLeft(a.deal_expires_at) < 0);
  const queuedAds  = (classifiedAds || []).filter(a => !a.is_active);
  const totalRevenue = liveAds.length * 10;

  return (
    <div>
      {/* Summary row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 18 }}>
        {[
          ["🟢 Live Now", liveAds.length, "#2E7D32", "#E8F5E9"],
          ["⏰ Expired", expiredAds.length, "#E65100", "#FFF3E0"],
          ["⏭ Queued", queuedAds.length, "#1565C0", "#EFF8FF"],
          ["💰 This Week", `$${totalRevenue}`, "#1A6B3C", "#F1F8E9"],
        ].map(([label, val, color, bg]) => (
          <div key={label} style={{ background: bg, border: `2px solid ${color}`, borderRadius: 8, padding: "10px 12px", textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 900, color, fontFamily: T.font }}>{val}</div>
            <div style={{ fontSize: 10, fontWeight: 700, color, fontFamily: T.sans, letterSpacing: 1, textTransform: "uppercase" }}>{label}</div>
          </div>
        ))}
      </div>

      {providerIds.length === 0 && (
        <div style={{ textAlign: "center", padding: "32px 16px", color: "#999", fontFamily: T.sans, fontSize: 14 }}>
          No classified ads in the system yet.
        </div>
      )}

      {/* Per-provider ad cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {providerIds.sort((a, b) => {
          // Sort: live first, then queued, then expired
          const aHasLive = adsByProvider[a].live && (daysLeft(adsByProvider[a].live.deal_expires_at) === null || daysLeft(adsByProvider[a].live.deal_expires_at) >= 0);
          const bHasLive = adsByProvider[b].live && (daysLeft(adsByProvider[b].live.deal_expires_at) === null || daysLeft(adsByProvider[b].live.deal_expires_at) >= 0);
          if (aHasLive && !bHasLive) return -1;
          if (!aHasLive && bHasLive) return 1;
          return 0;
        }).map(pid => {
          const prov = provMap[pid];
          const { live, queued } = adsByProvider[pid];
          const days = live ? daysLeft(live.deal_expires_at) : null;
          const isExpired = days !== null && days < 0;
          const nextUp = queued.find(a => a.is_queued_next);

          return (
            <div key={pid} style={{
              background: "#fff",
              border: live && !isExpired ? "2px solid #2E7D32" : isExpired ? "2px solid #E65100" : `2px solid ${T.border}`,
              borderRadius: 10, padding: "12px 14px",
            }}>
              {/* Provider header */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 900, color: T.ink, fontFamily: T.font }}>
                    {prov?.business_name || pid}
                    {prov?.vh_number && <span style={{ marginLeft: 8, fontSize: 11, color: "#888", fontFamily: T.sans }}>#{prov.vh_number}</span>}
                  </div>
                  <div style={{ fontSize: 11, color: "#666", fontFamily: T.sans }}>{prov?.email || prov?.login_email || ""}</div>
                </div>
                {/* Status badge */}
                {live && !isExpired && (
                  <span style={{ background: "#E8F5E9", color: "#2E7D32", border: "1.5px solid #2E7D32", borderRadius: 12, padding: "3px 10px", fontSize: 11, fontWeight: 700, fontFamily: T.sans, whiteSpace: "nowrap" }}>
                    🟢 LIVE
                  </span>
                )}
                {isExpired && (
                  <span style={{ background: "#FFF3E0", color: "#E65100", border: "1.5px solid #E65100", borderRadius: 12, padding: "3px 10px", fontSize: 11, fontWeight: 700, fontFamily: T.sans, whiteSpace: "nowrap" }}>
                    ⏰ EXPIRED
                  </span>
                )}
                {!live && queued.length > 0 && (
                  <span style={{ background: "#EFF8FF", color: "#1565C0", border: "1.5px solid #1565C0", borderRadius: 12, padding: "3px 10px", fontSize: 11, fontWeight: 700, fontFamily: T.sans, whiteSpace: "nowrap" }}>
                    ⏭ QUEUED ONLY
                  </span>
                )}
              </div>

              {/* Live ad detail */}
              {live && (
                <div style={{ background: isExpired ? "#FFF3E0" : "#E8F5E9", borderRadius: 7, padding: "10px 12px", marginBottom: queued.length > 0 ? 8 : 0, display: "flex", gap: 10 }}>
                  {live.image_url && (
                    <img src={live.image_url} alt="" style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 5, flexShrink: 0, border: "1.5px solid rgba(0,0,0,0.1)" }} />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 900, color: isExpired ? "#E65100" : "#1B5E20", fontFamily: T.font, marginBottom: 2 }}>
                      {live.headline || "(no headline)"}
                    </div>
                    {live.body && <div style={{ fontSize: 11, color: "#555", fontFamily: T.sans, marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{live.body}</div>}
                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                      {live.village && <span style={{ fontSize: 10, color: "#00836B", fontFamily: T.sans }}>📍 {live.village}</span>}
                      {live.deal_expires_at && (
                        <span style={{ fontSize: 10, fontFamily: T.sans, fontWeight: 700, color: isExpired ? "#E65100" : "#2E7D32" }}>
                          {isExpired
                            ? `⏰ Expired ${Math.abs(days)} day${Math.abs(days) !== 1 ? "s" : ""} ago`
                            : days === 0
                              ? "⚡ Expires today"
                              : days === 1
                                ? "⚡ 1 day left"
                                : `✅ ${days} days left`
                          }
                        </span>
                      )}
                      <span style={{ fontSize: 10, fontFamily: T.sans, color: "#2E7D32", fontWeight: 700 }}>💰 $10 paid</span>
                    </div>
                    {live.deal_expires_at && (
                      <div style={{ fontSize: 10, color: "#888", fontFamily: T.sans, marginTop: 2 }}>
                        Runs through: {new Date(live.deal_expires_at).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Queued ads */}
              {queued.length > 0 && (
                <div style={{ marginTop: live ? 0 : 0 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#888", fontFamily: T.sans, letterSpacing: 1, textTransform: "uppercase", marginBottom: 5 }}>
                    Queued ({queued.length}/3)
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    {queued.map(ad => (
                      <div key={ad.id} style={{
                        display: "flex", alignItems: "center", gap: 8,
                        background: ad.is_queued_next ? "#EFF8FF" : T.parchmentMid,
                        border: ad.is_queued_next ? "1.5px solid #1565C0" : `1px solid ${T.border}`,
                        borderRadius: 6, padding: "6px 10px",
                      }}>
                        {ad.image_url && <img src={ad.image_url} alt="" style={{ width: 32, height: 32, objectFit: "cover", borderRadius: 3, flexShrink: 0 }} />}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: T.ink, fontFamily: T.font, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {ad.headline || "(no headline)"}
                            {ad.is_queued_next && <span style={{ marginLeft: 6, fontSize: 9, background: "#1565C0", color: "#fff", borderRadius: 8, padding: "1px 5px", fontFamily: T.sans }}>NEXT</span>}
                          </div>
                          {ad.village && <div style={{ fontSize: 10, color: "#00836B", fontFamily: T.sans }}>📍 {ad.village}</div>}
                        </div>
                        {ad.saved_images?.length > 0 && (
                          <span style={{ fontSize: 10, color: "#6B4090", fontFamily: T.sans, flexShrink: 0 }}>🖼 {ad.saved_images.length}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── ANALYTICS TAB ─────────────────────────────────────────────────────────────
function AnalyticsTab({ providers, reviews, leads, stats, catMap, svcMap, fullSvcMap, classifiedAds }) {
  const [timeRange, setTimeRange] = React.useState("30d");
  const [analyticEvents, setAnalyticEvents] = React.useState([]);
  const [loadingEvents, setLoadingEvents] = React.useState(true);

  React.useEffect(() => {
    loadAllEvents();
  }, []);

  const loadAllEvents = async () => {
    setLoadingEvents(true);
    try {
      // Pull last 90 days of ProviderAnalytic events
      const cutoff90 = new Date(Date.now() - 90*24*60*60*1000).toISOString().slice(0,10);
      let all = [];
      let skip = 0;
      let hasMore = true;
      while (hasMore) {
        const page = await ProviderAnalytic.filter({ limit: 500, skip });
        if (!page || page.length === 0) { hasMore = false; break; }
        all = all.concat(page);
        skip += 500;
        hasMore = page.length === 500;
        if (all.length > 20000) break; // safety cap
      }
      setAnalyticEvents(all);
    } catch(e) {
      setAnalyticEvents([]);
    }
    setLoadingEvents(false);
  };

  const now = new Date();
  const rangeMs = { "24h": 86400000, "7d": 7*86400000, "30d": 30*86400000, "90d": 90*86400000 };
  const cutoff = new Date(now - (rangeMs[timeRange] || rangeMs["30d"]));

  const filteredLeads = leads.filter(l => l.created_date && new Date(l.created_date) >= cutoff);
  const filteredReviews = reviews.filter(r => r.created_date && new Date(r.created_date) >= cutoff);
  const filteredProviders = providers.filter(p => p.created_date && new Date(p.created_date) >= cutoff);
  const filteredEvents = analyticEvents.filter(e => e.created_date && new Date(e.created_date) >= cutoff);

  // Event breakdowns
  const siteEvents = filteredEvents.filter(e => e.provider_id === "SITE");
  const providerEvents = filteredEvents.filter(e => e.provider_id !== "SITE");
  const villageSearches = siteEvents.filter(e => e.event_type === "village_search");
  const searchPerformed = siteEvents.filter(e => e.event_type === "search_performed");
  const homepageViews = siteEvents.filter(e => e.event_type === "homepage_view");
  const featuredClicks = siteEvents.filter(e => e.event_type === "featured_banner_click");
  const profileViews = providerEvents.filter(e => e.event_type === "profile_view");
  const searchAppearances = providerEvents.filter(e => e.event_type === "search_appearance");
  const adClicks = providerEvents.filter(e => e.event_type === "classified_ad_click");
  const leadEvents = providerEvents.filter(e => e.event_type === "lead_inquiry");

  // Top villages searched
  const villageCounts = {};
  villageSearches.forEach(e => {
    if (e.area_name) villageCounts[e.area_name] = (villageCounts[e.area_name]||0)+1;
  });
  // Also count from search_performed
  searchPerformed.forEach(e => {
    if (e.area_name && e.area_name !== "All Villages") villageCounts[e.area_name] = (villageCounts[e.area_name]||0)+1;
  });
  const topVillages = Object.entries(villageCounts).sort((a,b)=>b[1]-a[1]).slice(0,10);

  // Top services searched
  const serviceCounts = {};
  searchPerformed.forEach(e => {
    if (e.service_name && e.service_name !== "All Services") serviceCounts[e.service_name] = (serviceCounts[e.service_name]||0)+1;
  });
  searchAppearances.forEach(e => {
    if (e.service_name) serviceCounts[e.service_name] = (serviceCounts[e.service_name]||0)+1;
  });
  const topServices = Object.entries(serviceCounts).sort((a,b)=>b[1]-a[1]).slice(0,10);

  // Top categories searched
  const catCounts = {};
  searchAppearances.forEach(e => {
    if (e.category_name) catCounts[e.category_name] = (catCounts[e.category_name]||0)+1;
  });
  const topCats = Object.entries(catCounts).sort((a,b)=>b[1]-a[1]).slice(0,8);

  // Top providers by profile views (from events, more accurate than counter)
  const provViewCounts = {};
  profileViews.forEach(e => { provViewCounts[e.provider_id] = (provViewCounts[e.provider_id]||0)+1; });
  const topViewedProviderIds = Object.entries(provViewCounts).sort((a,b)=>b[1]-a[1]).slice(0,8);
  const topViewedProviders = topViewedProviderIds.map(([id, cnt]) => ({
    provider: providers.find(p=>p.id===id),
    count: cnt
  })).filter(x=>x.provider);

  // Top providers by search appearances
  const provSearchCounts = {};
  searchAppearances.forEach(e => { provSearchCounts[e.provider_id] = (provSearchCounts[e.provider_id]||0)+1; });
  const topSearchedProviderIds = Object.entries(provSearchCounts).sort((a,b)=>b[1]-a[1]).slice(0,8);
  const topSearchedProviders = topSearchedProviderIds.map(([id, cnt]) => ({
    provider: providers.find(p=>p.id===id),
    count: cnt
  })).filter(x=>x.provider);

  // Provider subscription stats
  const paid = providers.filter(p => ["active","paid"].includes(p.subscription_status)).length;
  const trial = providers.filter(p => p.subscription_status === "trial").length;
  const inactive = providers.filter(p => ["inactive","expired","cancelled"].includes(p.subscription_status)).length;
  const activeAds = (classifiedAds||[]).filter(a => {
    if (!a.is_active) return false;
    if (a.deal_expires_at && new Date(a.deal_expires_at) < now) return false;
    return true;
  });

  // Last 7 days trend
  const last7 = Array.from({length:7},(_,i)=>{ const d=new Date(now); d.setDate(d.getDate()-6+i); return d.toISOString().split("T")[0]; });
  const profilesByDay = {};
  const searchesByDay = {};
  profileViews.forEach(e => { if(e.date_key) profilesByDay[e.date_key]=(profilesByDay[e.date_key]||0)+1; });
  searchAppearances.forEach(e => { if(e.date_key) searchesByDay[e.date_key]=(searchesByDay[e.date_key]||0)+1; });
  const last7Data = last7.map(d=>({ date:d, views:profilesByDay[d]||0, searches:searchesByDay[d]||0 }));
  const maxDay = Math.max(...last7Data.map(d=>Math.max(d.views,d.searches)),1);

  // Rating distribution
  const ratingDist = {1:0,2:0,3:0,4:0,5:0};
  reviews.forEach(r=>{ if(r.rating>=1&&r.rating<=5) ratingDist[r.rating]++; });
  const avgRating = reviews.length>0?(reviews.reduce((s,r)=>s+(r.rating||0),0)/reviews.length).toFixed(1):"—";

  // Provider signup trend
  const byMonth = {};
  providers.forEach(p => {
    if (!p.created_date) return;
    const d = new Date(p.created_date);
    const k = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
    byMonth[k] = (byMonth[k]||0) + 1;
  });
  const months = Object.entries(byMonth).sort((a,b)=>a[0].localeCompare(b[0])).slice(-12);
  const maxM = Math.max(...months.map(m=>m[1]),1);

  const rangeLabels = {"24h":"Last 24 Hours","7d":"Last 7 Days","30d":"Last 30 Days","90d":"Last 90 Days"};

  // Bar helper
  const Bar = ({val, max, color="#1B3D6F", height=18}) => (
    <div style={{background:"#f0ece4",borderRadius:3,overflow:"hidden",height,flex:1,minWidth:60}}>
      <div style={{height:"100%",width:`${Math.max((val/Math.max(max,1))*100,2)}%`,background:color,borderRadius:3,transition:"width 0.3s"}}></div>
    </div>
  );

  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>

      {/* Time Range Selector */}
      <div style={{...S.card,padding:"10px 16px"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
          <span style={{fontSize:12,fontWeight:700,color:T.brownLight,fontFamily:T.sans,marginRight:4}}>TIME RANGE:</span>
          {["24h","7d","30d","90d"].map(r=>(
            <button key={r} onClick={()=>setTimeRange(r)} style={{...S.filterBtn(timeRange===r),fontSize:12,padding:"5px 14px"}}>
              {r==="24h"?"24 Hours":r==="7d"?"7 Days":r==="30d"?"30 Days":"90 Days"}
            </button>
          ))}
          <button onClick={loadAllEvents} style={{marginLeft:"auto",fontSize:11,padding:"5px 12px",background:"#f0ece4",border:"1px solid #ccc",borderRadius:4,cursor:"pointer",color:T.brownLight}}>
            {loadingEvents ? "Loading..." : "↻ Refresh"}
          </button>
        </div>
      </div>

      {/* Platform Activity KPIs */}
      <div style={S.card}>
        <div style={S.secTitle}>📊 Platform Activity — {rangeLabels[timeRange]}</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
          {[
            ["🏠 Homepage Views", homepageViews.length, T.brown],
            ["🔍 Searches Run", searchPerformed.length, T.teal],
            ["👁️ Profile Views", profileViews.length, "#1A6B3C"],
            ["📰 Ad Clicks", adClicks.length, "#7B3FA0"],
          ].map(([l,v,c])=>(
            <div key={l} style={{textAlign:"center",background:T.parchment,borderRadius:6,padding:"12px 6px"}}>
              <div style={{fontSize:22,fontWeight:800,color:c,fontFamily:T.sans}}>{v.toLocaleString()}</div>
              <div style={{fontSize:10,color:T.brownLight,fontFamily:T.sans,textTransform:"uppercase",letterSpacing:0.5,lineHeight:1.3}}>{l}</div>
            </div>
          ))}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginTop:8}}>
          {[
            ["📍 Village Searches", Object.values(villageCounts).reduce((a,b)=>a+b,0), "#E8431A"],
            ["📬 Leads Sent", filteredLeads.length, "#1A6B3C"],
            ["⭐ New Reviews", filteredReviews.length, T.gold],
            ["🌟 Featured Clicks", featuredClicks.length, "#CC0000"],
          ].map(([l,v,c])=>(
            <div key={l} style={{textAlign:"center",background:T.parchment,borderRadius:6,padding:"12px 6px"}}>
              <div style={{fontSize:22,fontWeight:800,color:c,fontFamily:T.sans}}>{v.toLocaleString()}</div>
              <div style={{fontSize:10,color:T.brownLight,fontFamily:T.sans,textTransform:"uppercase",letterSpacing:0.5,lineHeight:1.3}}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 7-Day Engagement Trend */}
      <div style={S.card}>
        <div style={S.secTitle}>📈 7-Day Engagement Trend</div>
        <div style={{display:"flex",gap:16,marginBottom:8}}>
          <span style={{fontSize:11,color:T.brown,fontFamily:T.sans}}>● Profile Views</span>
          <span style={{fontSize:11,color:T.teal,fontFamily:T.sans}}>● Search Appearances</span>
        </div>
        <div style={{display:"flex",alignItems:"flex-end",gap:6,height:80}}>
          {last7Data.map(({date,views,searches})=>{
            const d=new Date(date+"T12:00:00");
            const label=d.toLocaleDateString("en-US",{weekday:"short"});
            return (
              <div key={date} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                <div style={{width:"100%",display:"flex",gap:1,alignItems:"flex-end",height:60}}>
                  <div style={{flex:1,background:T.brown,borderRadius:"2px 2px 0 0",height:`${Math.max((views/maxDay)*56,views>0?4:0)}px`,transition:"height 0.3s"}} title={`${views} views`}></div>
                  <div style={{flex:1,background:T.teal,borderRadius:"2px 2px 0 0",height:`${Math.max((searches/maxDay)*56,searches>0?4:0)}px`,transition:"height 0.3s"}} title={`${searches} searches`}></div>
                </div>
                <div style={{fontSize:9,color:T.brownLight,fontFamily:T.sans}}>{label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Villages Searched */}
      <div style={S.card}>
        <div style={S.secTitle}>📍 Top Villages Searched</div>
        {loadingEvents ? <div style={{color:"#aaa",fontSize:13}}>Loading event data...</div> :
          topVillages.length === 0 ? <div style={{color:"#aaa",fontSize:13}}>No village search data yet — tracking is now active</div> :
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {topVillages.map(([village, cnt], i)=>(
              <div key={village} style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:11,fontWeight:700,color:T.brownLight,fontFamily:T.sans,width:18,textAlign:"right"}}>{i+1}.</span>
                <span style={{fontSize:13,color:T.brownDark,fontFamily:T.sans,width:160,flexShrink:0}}>{village}</span>
                <Bar val={cnt} max={topVillages[0]?.[1]||1} color="#E8431A" height={16}/>
                <span style={{fontSize:12,fontWeight:700,color:"#E8431A",fontFamily:T.sans,width:30,textAlign:"right"}}>{cnt}</span>
              </div>
            ))}
          </div>
        }
      </div>

      {/* Top Services Searched */}
      <div style={S.card}>
        <div style={S.secTitle}>🔧 Top Services Searched</div>
        {loadingEvents ? <div style={{color:"#aaa",fontSize:13}}>Loading...</div> :
          topServices.length === 0 ? <div style={{color:"#aaa",fontSize:13}}>No service search data yet</div> :
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {topServices.map(([svc, cnt], i)=>(
              <div key={svc} style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:11,fontWeight:700,color:T.brownLight,fontFamily:T.sans,width:18,textAlign:"right"}}>{i+1}.</span>
                <span style={{fontSize:13,color:T.brownDark,fontFamily:T.sans,width:160,flexShrink:0}}>{svc}</span>
                <Bar val={cnt} max={topServices[0]?.[1]||1} color={T.teal} height={16}/>
                <span style={{fontSize:12,fontWeight:700,color:T.teal,fontFamily:T.sans,width:30,textAlign:"right"}}>{cnt}</span>
              </div>
            ))}
          </div>
        }
      </div>

      {/* Top Providers — Profile Views */}
      <div style={S.card}>
        <div style={S.secTitle}>👁️ Most Viewed Providers ({rangeLabels[timeRange]})</div>
        {loadingEvents ? <div style={{color:"#aaa",fontSize:13}}>Loading...</div> :
          topViewedProviders.length === 0 ? <div style={{color:"#aaa",fontSize:13}}>No profile view data yet</div> :
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {topViewedProviders.map(({provider:p, count}, i)=>(
              <div key={p.id} style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:11,fontWeight:700,color:T.brownLight,fontFamily:T.sans,width:18,textAlign:"right"}}>{i+1}.</span>
                <span style={{fontSize:12,color:T.brownDark,fontFamily:T.sans,width:170,flexShrink:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.business_name}</span>
                <Bar val={count} max={topViewedProviders[0]?.count||1} color="#1A6B3C" height={16}/>
                <span style={{fontSize:12,fontWeight:700,color:"#1A6B3C",fontFamily:T.sans,width:30,textAlign:"right"}}>{count}</span>
              </div>
            ))}
          </div>
        }
      </div>

      {/* Top Providers — Search Appearances */}
      <div style={S.card}>
        <div style={S.secTitle}>🔍 Most Appeared in Search ({rangeLabels[timeRange]})</div>
        {loadingEvents ? <div style={{color:"#aaa",fontSize:13}}>Loading...</div> :
          topSearchedProviders.length === 0 ? <div style={{color:"#aaa",fontSize:13}}>No search data yet</div> :
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {topSearchedProviders.map(({provider:p, count}, i)=>(
              <div key={p.id} style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:11,fontWeight:700,color:T.brownLight,fontFamily:T.sans,width:18,textAlign:"right"}}>{i+1}.</span>
                <span style={{fontSize:12,color:T.brownDark,fontFamily:T.sans,width:170,flexShrink:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.business_name}</span>
                <Bar val={count} max={topSearchedProviders[0]?.count||1} color={T.teal} height={16}/>
                <span style={{fontSize:12,fontWeight:700,color:T.teal,fontFamily:T.sans,width:30,textAlign:"right"}}>{count}</span>
              </div>
            ))}
          </div>
        }
      </div>

      {/* Revenue Snapshot */}
      <div style={S.card}>
        <div style={S.secTitle}>💰 Revenue Snapshot</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
          {[["Est. MRR",`$${paid*12}`,T.teal],["Paid Providers",paid,"#1A6B3C"],["On Trial",trial,T.gold],["Active Featured Ads",activeAds.length,T.teal],["Featured Revenue",`$${activeAds.length*20}`,"#1A6B3C"],["Total Providers",providers.length,T.brown]].map(([l,v,c])=>(
            <div key={l} style={{textAlign:"center",background:T.parchment,borderRadius:6,padding:"10px 6px"}}>
              <div style={{fontSize:20,fontWeight:800,color:c,fontFamily:T.sans}}>{v}</div>
              <div style={{fontSize:10,color:T.brownLight,fontFamily:T.sans,textTransform:"uppercase",letterSpacing:0.5,lineHeight:1.3}}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Provider Signups by Month */}
      <div style={S.card}>
        <div style={S.secTitle}>📈 Provider Signups by Month</div>
        {months.length===0 ? <div style={{color:"#aaa",fontSize:13}}>No data yet</div> :
          <div style={{display:"flex",alignItems:"flex-end",gap:4,height:90,padding:"0 4px"}}>
            {months.map(([mo,cnt])=>(
              <div key={mo} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                <div style={{fontSize:9,color:T.brownLight,fontFamily:T.sans,fontWeight:700}}>{cnt}</div>
                <div style={{width:"100%",background:T.brown,borderRadius:"3px 3px 0 0",height:`${Math.max((cnt/maxM)*60,4)}px`}}></div>
                <div style={{fontSize:8,color:T.brownLight,fontFamily:T.sans,transform:"rotate(-45deg)",transformOrigin:"top left",marginLeft:6,whiteSpace:"nowrap"}}>
                  {mo.split("-")[1]}/{mo.split("-")[0].slice(2)}
                </div>
              </div>
            ))}
          </div>
        }
      </div>

      {/* Rating Distribution */}
      <div style={S.card}>
        <div style={S.secTitle}>⭐ Review Rating Distribution (All-Time · Avg: {avgRating})</div>
        <div style={{display:"flex",flexDirection:"column",gap:5}}>
          {[5,4,3,2,1].map(star=>(
            <div key={star} style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:12,color:T.gold,width:30,fontFamily:T.sans}}>{"⭐".repeat(star)}</span>
              <Bar val={ratingDist[star]} max={Math.max(...Object.values(ratingDist),1)} color={T.gold} height={14}/>
              <span style={{fontSize:12,fontWeight:700,color:T.brownLight,fontFamily:T.sans,width:24}}>{ratingDist[star]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* GA4 Link */}
      <div style={S.card}>
        <div style={S.secTitle}>🌐 External Traffic (Google Analytics)</div>
        <p style={{fontSize:13,color:T.brownLight,fontFamily:T.sans,margin:"0 0 10px 0"}}>
          For detailed traffic sources, demographics, and real-time visitors, open GA4 directly:
        </p>
        <a href="https://analytics.google.com/analytics/web/#/p490233278/reports/reportinghub"
          target="_blank" rel="noopener noreferrer"
          style={{display:"inline-block",padding:"10px 20px",background:T.brown,color:"#fff",borderRadius:5,fontSize:13,fontWeight:700,fontFamily:T.sans,textDecoration:"none"}}>
          📊 Open Google Analytics →
        </a>
        <div style={{marginTop:10,fontSize:12,color:T.brownLight,fontFamily:T.sans}}>
          Measurement ID: G-1EJ40FW9E1 · Property: V-Hub Homepage
        </div>
      </div>

    </div>
  );
}


// ── ADD PROVIDER TAB ──────────────────────────────────────────────────────────
function AddProviderTab({ onAdded, categories, services: allServices, serviceAreas: allAreas, adminPin }) {
  const activeServices = allServices.filter(s => s.is_active !== false);
  const activeAreas = allAreas.filter(a => a.is_active !== false);

  // Macro village groups (mirrors ListService)
  const MACRO_AREAS = [
    { key: "marion", label: "🟠 Marion County Villages", villages: ["Briar Meadow","Calumet Grove","Chatham","Chatham at Souilliere","Piedmont","Springdale","Woodbury","Woodbury at Phillips"] },
    { key: "sumter_north_466", label: "🔵 Sumter County — North of SR-466", villages: ["Alhambra","Belle Aire","De Allende","De La Vista","Glenbrook","Hacienda","Palo Alto","Polo Ridge","Rio Grande","Rio Ponderosa","Rio Ranchero","Santiago","Santo Domingo","Summerhill","Tierra Del Sol"] },
    { key: "sumter_between_466_466a", label: "🟢 Sumter County — SR-466 to SR-466A", villages: ["Amelia","Ashland","Belvedere","Bonita","Bonnybrook","Bridgeport at Creekside Landing","Bridgeport at Lake Miona","Bridgeport at Lakeshore Cottages","Bridgeport at Lake Sumter","Bridgeport at Laurel Valley","Bridgeport at Miona Shores","Bridgeport at Mission Hills","Buttonwood","Caroline","Duval","Hadley","Hemingway","Largo","Liberty Park","Lynnhaven","Mallory Square","Pennecamp","Poinciana","Sabal Chase","St. Charles","St. James","Sunset Pointe","Tall Trees","Tamarind Grove","Virginia Trace","Winifred"] },
    { key: "sumter_between_466a_hwy44", label: "🟡 Sumter County — SR-466A to Hwy 44", villages: ["Charlotte","Collier","Collier at Alden Bungalows","Collier at Antrim Dells","Collier at Atwood Bungalows","Dunedin","Fernandina","Gilchrist","Hillsborough","LaBelle","Lake Deaton","Osceola Hills","Osceola Hills at Soaring Eagle Preserve","Pinellas","Sanibel"] },
    { key: "sumter_south_hwy44", label: "🔴 Sumter County — South of Hwy 44", villages: ["Bradford","Cason Hammock","Chitty Chatty","Citrus Grove","DeSoto","Fenney","Hammock at Fenney","Hawkins","Linden","Marsh Bend","McClure","Monarch Grove","St. Catherine","St. John"] },
    { key: "eastport", label: "🌊 Eastport / Newest", villages: ["Dabney","Lake Denham","Moultrie Creek","Newell","Shady Brook"] },
    { key: "family", label: "🏠 Family / Non-Age-Restricted", villages: ["Bison Valley","Middleton","Oak Meadows","Oxford Oaks"] },
  ];

  // Build a name→id map for service areas
  const areaNameToId = {};
  activeAreas.forEach(a => {
    const shortName = a.name.includes(' — ') ? a.name.split(' — ').pop().trim() : a.name;
    areaNameToId[shortName] = a.id;
    areaNameToId[a.name] = a.id;
  });

  const empty = {
    business_name: "", owner_name: "", email: "", phone: "", website: "",
    description: "", address: "", license_number: "", years_in_business: "",
    google_review_url: "", notes: "", category_id: "", services: [], service_areas: [],
    trial_days: "45",
  };
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(null);
  const [svcSearch, setSvcSearch] = useState("");
  const [openMacros, setOpenMacros] = useState({});

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggleSvc = (id) => setForm(f => ({ ...f, services: f.services.includes(id) ? f.services.filter(x => x !== id) : [...f.services, id] }));
  const toggleArea = (id) => setForm(f => ({ ...f, service_areas: f.service_areas.includes(id) ? f.service_areas.filter(x => x !== id) : [...f.service_areas, id] }));
  const toggleMacro = (key) => setOpenMacros(m => ({ ...m, [key]: !m[key] }));

  // Services grouped by selected category
  const catServices = {};
  activeServices.forEach(s => { if (!catServices[s.category_id]) catServices[s.category_id] = []; catServices[s.category_id].push(s); });
  const filteredSvcs = svcSearch.trim()
    ? activeServices.filter(s => s.name.toLowerCase().includes(svcSearch.toLowerCase()))
    : (catServices[form.category_id] || []);

  const setCategory = (catId) => setForm(f => ({ ...f, category_id: catId, services: [] }));

  // Count how many villages are selected per macro group
  const macroSelectedCount = (macro) => {
    return macro.villages.filter(vName => {
      const id = areaNameToId[vName];
      return id && form.service_areas.includes(id);
    }).length;
  };

  const selectAllMacro = (macro) => {
    const ids = macro.villages.map(v => areaNameToId[v]).filter(Boolean);
    setForm(f => {
      const current = new Set(f.service_areas);
      ids.forEach(id => current.add(id));
      return { ...f, service_areas: Array.from(current) };
    });
  };

  const deselectAllMacro = (macro) => {
    const ids = new Set(macro.villages.map(v => areaNameToId[v]).filter(Boolean));
    setForm(f => ({ ...f, service_areas: f.service_areas.filter(id => !ids.has(id)) }));
  };

  const save = async () => {
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
  const [searchQ, setSearchQ] = useState("");
  const [editVendor, setEditVendor] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  useEffect(() => {
    MarketVendor.list().then(v => { setVendors(v || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const categories = ["All", "Farm & Fresh Produce", "Food, Baked Goods & Sweets", "Wellness & Body", "Art, Jewelry & Gifts", "Home, Yard & Golf Cart"];

  const filtered = vendors.filter(v => {
    const catMatch = filterCat === "All" || v.category === filterCat;
    const statusMatch = filterStatus === "All" || (filterStatus === "Active" && v.is_active) || (filterStatus === "Pending" && !v.is_active);
    const q = searchQ.trim().toLowerCase();
    const nameMatch = !q || (v.name || "").toLowerCase().includes(q);
    return catMatch && statusMatch && nameMatch;
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

  const deleteVendor = async (v) => {
    if (!window.confirm(`Delete ${v.name}? This cannot be undone.`)) return;
    await MarketVendor.delete(v.id);
    setVendors(prev => prev.filter(x => x.id !== v.id));
    showToast("🗑️ Vendor deleted");
  };

  const pendingCount = vendors.filter(v => !v.is_active).length;
  const activeCount = vendors.filter(v => v.is_active).length;

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
        ].map(s => (
          <div key={s.label} style={{ flex: 1, minWidth: 100, background: T.cream, border: `1px solid ${T.border}`, borderRadius: 8, padding: "10px 14px", textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: s.color, fontFamily: T.sans }}>{s.val}</div>
            <div style={{ fontSize: 11, color: T.brownLight, fontFamily: T.sans, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap", alignItems: "center" }}>
        <input type="text" placeholder="Search vendors..." value={searchQ} onChange={e => setSearchQ(e.target.value)}
          style={{ flex: 1, minWidth: 160, padding: "7px 12px", fontSize: 13, border: `1px solid ${T.border}`, borderRadius: 20, background: T.cream, fontFamily: T.sans }} />
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
          style={{ padding: "7px 10px", fontSize: 12, border: `1px solid ${T.border}`, borderRadius: 20, background: T.cream, fontFamily: T.sans }}>
          {categories.map(c => <option key={c} value={c}>{c === "All" ? "All Categories" : c}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          style={{ padding: "7px 10px", fontSize: 12, border: `1px solid ${T.border}`, borderRadius: 20, background: T.cream, fontFamily: T.sans }}>
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Pending">Pending</option>
        </select>
      </div>

      <div style={{ fontSize: 12, color: T.brownLight, fontFamily: T.sans, marginBottom: 10 }}>
        Showing {filtered.length} of {vendors.length} vendors
      </div>

      {loading ? (
        <div style={{ textAlign: "center", color: T.brownLight, padding: 30, fontFamily: T.sans }}>Loading vendors...</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map(v => (
            <div key={v.id} style={{ background: T.cream, border: `1px solid ${v.is_active ? T.border : "#E8431A55"}`, borderRadius: 8, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <div style={{ fontSize: 20 }}>{VENDOR_CAT_EMOJI_ADMIN[v.category] || "🏪"}</div>
              <div style={{ flex: 1, minWidth: 140 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: T.brownDark, fontFamily: T.sans }}>{v.name}</div>
                <div style={{ fontSize: 11, color: T.brownLight, fontFamily: T.sans }}>{v.category}</div>
                {v.email && <div style={{ fontSize: 11, color: T.teal, fontFamily: T.sans }}>{v.email}</div>}
                {v.phone && <div style={{ fontSize: 11, color: T.brownLight, fontFamily: T.sans }}>{v.phone}</div>}
                <div style={{ marginTop: 3 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 10, background: v.is_active ? "#E8F5E9" : "#FFEBEE", color: v.is_active ? "#1A6B3C" : "#E8431A", border: `1px solid ${v.is_active ? "#1A6B3C44" : "#E8431A44"}`, fontFamily: T.sans }}>
                    {v.is_active ? "● Live" : "● Pending"}
                  </span>
                  {v.vendor_id && <span style={{ marginLeft: 6, fontSize: 10, color: T.brownLight, fontFamily: T.sans }}>{v.vendor_id}</span>}
                </div>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <button onClick={() => toggleActive(v)} style={{ padding: "5px 10px", fontSize: 11, fontWeight: 700, background: v.is_active ? "#FFF3E0" : "#E8F5E9", color: v.is_active ? "#E65100" : "#1A6B3C", border: `1px solid ${v.is_active ? "#E65100" : "#1A6B3C"}`, borderRadius: 6, cursor: "pointer", fontFamily: T.sans }}>
                  {v.is_active ? "⏸ Hide" : "✅ Approve"}
                </button>
                <button onClick={() => openEdit(v)} style={{ padding: "5px 10px", fontSize: 11, fontWeight: 700, background: T.parchmentDark, color: T.brownDark, border: `1px solid ${T.border}`, borderRadius: 6, cursor: "pointer", fontFamily: T.sans }}>
                  ✏️ Edit
                </button>
                <button onClick={() => deleteVendor(v)} style={{ padding: "5px 10px", fontSize: 11, fontWeight: 700, background: "#FFEBEE", color: "#c0392b", border: "1px solid #c0392b44", borderRadius: 6, cursor: "pointer", fontFamily: T.sans }}>
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editVendor && (
        <div onClick={() => setEditVendor(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 9000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: T.parchment, borderRadius: 10, padding: "22px 18px", maxWidth: 420, width: "100%", maxHeight: "85vh", overflowY: "auto", boxShadow: "0 8px 32px rgba(0,0,0,0.25)", border: `2px solid ${T.border}` }}>
            <h3 style={{ margin: "0 0 14px", color: T.brownDark, fontFamily: T.font, fontSize: 16 }}>✏️ Edit Vendor: {editVendor.name}</h3>

            <label style={labelS}>Business Name</label>
            <input value={editForm.name || ""} onChange={e => setEditForm(f => ({...f, name: e.target.value}))} style={inputS} />

            <label style={labelS}>Category</label>
            <select value={editForm.category || ""} onChange={e => setEditForm(f => ({...f, category: e.target.value}))} style={inputS}>
              {["Farm & Fresh Produce","Food, Baked Goods & Sweets","Wellness & Body","Art, Jewelry & Gifts","Home, Yard & Golf Cart"].map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <label style={labelS}>Description</label>
            <textarea value={editForm.description || ""} onChange={e => setEditForm(f => ({...f, description: e.target.value}))} rows={3} style={{ ...inputS, resize: "vertical" }} />

            <label style={labelS}>Email</label>
            <input type="email" value={editForm.email || ""} onChange={e => setEditForm(f => ({...f, email: e.target.value}))} style={inputS} />

            <label style={labelS}>Phone</label>
            <input value={editForm.phone || ""} onChange={e => setEditForm(f => ({...f, phone: e.target.value}))} style={inputS} />

            <label style={labelS}>Website</label>
            <input value={editForm.website || ""} onChange={e => setEditForm(f => ({...f, website: e.target.value}))} style={inputS} />

            <label style={labelS}>Facebook URL</label>
            <input value={editForm.facebook_url || ""} onChange={e => setEditForm(f => ({...f, facebook_url: e.target.value}))} style={inputS} />

            <label style={labelS}>Logo URL</label>
            <input value={editForm.logo_url || ""} onChange={e => setEditForm(f => ({...f, logo_url: e.target.value}))} style={inputS} />

            <label style={labelS}>Notes (internal only)</label>
            <textarea value={editForm.notes || ""} onChange={e => setEditForm(f => ({...f, notes: e.target.value}))} rows={2} style={{ ...inputS, resize: "vertical" }} />

            <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
              <button onClick={saveEdit} disabled={saving} style={{ flex: 1, padding: "10px", background: "#1A6B3C", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: saving ? "not-allowed" : "pointer", fontFamily: T.sans }}>
                {saving ? "Saving…" : "💾 Save Changes"}
              </button>
              <button onClick={() => setEditVendor(null)} style={{ padding: "10px 16px", background: T.parchmentDark, color: T.brownDark, border: `1px solid ${T.border}`, borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: T.sans }}>
                Cancel
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
