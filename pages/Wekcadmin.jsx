import React, { useState, useEffect } from "react";
import { Provider, ProviderReview, Category, Service, ServiceArea } from "@/api/entities";

const PINS = ["6185"];

const BRAND = {
  orange: "#E8431A",
  teal: "#00BFA5",
  blue: "#1A3F70",
  bg: "#F5F7FA",
};

function PinGate({ onUnlock }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  const check = () => {
    if (PINS.includes(pin)) {
      onUnlock();
    } else {
      setError(true);
      setPin("");
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: BRAND.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Arial, sans-serif" }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: "40px 32px", boxShadow: "0 8px 32px rgba(0,0,0,0.12)", textAlign: "center", width: 300 }}>
        <img src="https://media.base44.com/images/public/69d062aca815ce8e697894b1/a9af95bc3_V-Hublogo.png" style={{ width: 64, borderRadius: 12, marginBottom: 16 }} alt="V-Hub" />
        <div style={{ fontSize: 20, fontWeight: 800, color: "#1A0A00", marginBottom: 6 }}>Admin Access</div>
        <div style={{ fontSize: 13, color: "#999", marginBottom: 24 }}>Enter your 4-digit PIN</div>
        <input
          type="password"
          inputMode="numeric"
          maxLength={4}
          value={pin}
          autoFocus
          onChange={e => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
          onKeyDown={e => e.key === "Enter" && check()}
          placeholder="••••"
          style={{
            width: "100%", boxSizing: "border-box", fontSize: 28, textAlign: "center",
            letterSpacing: 10, padding: "12px", borderRadius: 10,
            border: error ? "2px solid #e00" : "2px solid #ddd",
            background: error ? "#fff5f5" : "#f9f9f9",
            marginBottom: 10, outline: "none"
          }}
        />
        {error && <div style={{ color: "#c00", fontSize: 13, marginBottom: 8 }}>Incorrect PIN — try again</div>}
        <button
          onClick={check}
          style={{ width: "100%", background: BRAND.orange, color: "#fff", border: "none", borderRadius: 10, padding: 13, fontSize: 16, fontWeight: 700, cursor: "pointer" }}
        >
          Unlock →
        </button>
        <a href="/" style={{ display: "block", marginTop: 14, fontSize: 12, color: "#bbb", textDecoration: "none" }}>← Back to V-Hub</a>
      </div>
    </div>
  );
}

function Dashboard() {
  const [tab, setTab] = useState("Providers");
  const [providers, setProviders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    Promise.allSettled([Provider.list(), ProviderReview.list()]).then(([p, r]) => {
      setProviders(p.status === "fulfilled" ? p.value || [] : []);
      setReviews(r.status === "fulfilled" ? r.value || [] : []);
      setLoading(false);
    });
  }, []);

  const active = providers.filter(p => p.is_active && p.subscription_status !== "pending");
  const pending = providers.filter(p => p.subscription_status === "pending" || !p.is_active);
  const pendingReviews = reviews.filter(r => !r.is_approved);

  const tabs = ["Providers", "Reviews"];

  const toggleActive = async (prov) => {
    await Provider.update(prov.id, { is_active: !prov.is_active });
    setProviders(prev => prev.map(p => p.id === prov.id ? { ...p, is_active: !prov.is_active } : p));
  };

  const approveReview = async (rev) => {
    await ProviderReview.update(rev.id, { is_approved: true });
    setReviews(prev => prev.map(r => r.id === rev.id ? { ...r, is_approved: true } : r));
  };

  const deleteReview = async (rev) => {
    await ProviderReview.delete(rev.id);
    setReviews(prev => prev.filter(r => r.id !== rev.id));
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: BRAND.bg, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12, fontFamily: "Arial, sans-serif" }}>
      <img src="https://media.base44.com/images/public/69d062aca815ce8e697894b1/a9af95bc3_V-Hublogo.png" style={{ width: 56, borderRadius: 10 }} alt="" />
      <div style={{ color: "#888", fontSize: 15 }}>Loading...</div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: BRAND.bg, fontFamily: "Arial, sans-serif" }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${BRAND.orange}, ${BRAND.teal})`, padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img src="https://media.base44.com/images/public/69d062aca815ce8e697894b1/a9af95bc3_V-Hublogo.png" style={{ height: 40, borderRadius: 8 }} alt="" />
          <div>
            <div style={{ color: "#fff", fontSize: 17, fontWeight: 800 }}>V-HUB Admin</div>
            <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 11 }}>{providers.length} providers · {pendingReviews.length} reviews pending</div>
          </div>
        </div>
        <a href="/" style={{ color: "#fff", fontSize: 13, textDecoration: "none", opacity: 0.85 }}>View Site →</a>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: 12, padding: "16px 16px 0", flexWrap: "wrap" }}>
        {[
          { label: "Total Providers", val: providers.length, color: BRAND.blue },
          { label: "Active", val: active.length, color: "#00897b" },
          { label: "Pending", val: pending.length, color: "#f59e0b" },
          { label: "Reviews Pending", val: pendingReviews.length, color: BRAND.orange },
        ].map(s => (
          <div key={s.label} style={{ background: "#fff", borderRadius: 10, padding: "12px 16px", flex: "1 1 120px", boxShadow: "0 1px 6px rgba(0,0,0,0.07)", borderTop: `3px solid ${s.color}` }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.val}</div>
            <div style={{ fontSize: 11, color: "#888" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, padding: "16px 16px 0" }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: "8px 18px", borderRadius: 8, border: "none", fontWeight: 700, fontSize: 13, cursor: "pointer", background: tab === t ? BRAND.orange : "#fff", color: tab === t ? "#fff" : "#555", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
            {t}
          </button>
        ))}
      </div>

      <div style={{ padding: 16 }}>

        {/* PROVIDERS TAB */}
        {tab === "Providers" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {providers.length === 0 && <div style={{ color: "#999", textAlign: "center", padding: 40 }}>No providers yet.</div>}
            {providers.map(p => (
              <div key={p.id} style={{ background: "#fff", borderRadius: 10, padding: "14px 16px", boxShadow: "0 1px 6px rgba(0,0,0,0.07)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 180 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "#1A0A00" }}>{p.business_name}</div>
                  <div style={{ fontSize: 12, color: "#888" }}>{p.owner_name} · {p.email}</div>
                  <div style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>{p.phone} {p.vh_number ? `· VH-${p.vh_number}` : ""}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 20, background: p.subscription_status === "active" ? "#e0f7f4" : p.subscription_status === "trial" ? "#fff3e0" : "#fce8e8", color: p.subscription_status === "active" ? "#00897b" : p.subscription_status === "trial" ? "#e65100" : "#c00" }}>
                    {p.subscription_status || "unknown"}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 20, background: p.is_active ? "#e8f5e9" : "#fce8e8", color: p.is_active ? "#388e3c" : "#c00" }}>
                    {p.is_active ? "Visible" : "Hidden"}
                  </span>
                  <button onClick={() => toggleActive(p)} style={{ fontSize: 12, padding: "5px 12px", borderRadius: 8, border: "1px solid #ddd", background: "#f5f5f5", cursor: "pointer", fontWeight: 600 }}>
                    {p.is_active ? "Deactivate" : "Activate"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* REVIEWS TAB */}
        {tab === "Reviews" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {reviews.length === 0 && <div style={{ color: "#999", textAlign: "center", padding: 40 }}>No reviews yet.</div>}
            {reviews.map(r => (
              <div key={r.id} style={{ background: "#fff", borderRadius: 10, padding: "14px 16px", boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{r.customer_name} <span style={{ color: "#f59e0b" }}>{"★".repeat(r.rating || 0)}</span></div>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 20, background: r.is_approved ? "#e8f5e9" : "#fff3e0", color: r.is_approved ? "#388e3c" : "#e65100" }}>
                    {r.is_approved ? "Approved" : "Pending"}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: "#555", marginBottom: 10 }}>{r.review_text}</div>
                <div style={{ display: "flex", gap: 8 }}>
                  {!r.is_approved && (
                    <button onClick={() => approveReview(r)} style={{ fontSize: 12, padding: "5px 14px", borderRadius: 8, border: "none", background: BRAND.teal, color: "#fff", cursor: "pointer", fontWeight: 700 }}>✓ Approve</button>
                  )}
                  <button onClick={() => deleteReview(r)} style={{ fontSize: 12, padding: "5px 14px", borderRadius: 8, border: "1px solid #eee", background: "#fff", color: "#c00", cursor: "pointer", fontWeight: 700 }}>✕ Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

export default function Wekcadmin() {
  const [unlocked, setUnlocked] = useState(false);
  if (!unlocked) return <PinGate onUnlock={() => setUnlocked(true)} />;
  return <Dashboard />;
}
