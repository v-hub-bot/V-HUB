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
