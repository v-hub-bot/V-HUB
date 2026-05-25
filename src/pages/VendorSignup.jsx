// V-HUB — Vendor Market Signup Page
import React, { useState } from "react";
import { MarketVendor } from "@/api/entities";

const PAPER = "#FBF6EC";
const VENDOR_CATEGORIES = [
  "Farm & Fresh Produce",
  "Food, Baked Goods & Sweets",
  "Wellness & Body",
  "Art, Jewelry & Gifts",
  "Home, Yard & Golf Cart",
];

export default function VendorSignup() {
  const [form, setForm] = useState({
    name: "", category: "", description: "", email: "", phone: "",
    website: "", facebook_url: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.category || !form.email.trim()) {
      setError("Please fill in your business name, category, and email.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      // Generate a VM number
      const existing = await MarketVendor.list();
      const nextNum = 1000 + (existing?.length || 0) + 1;
      await MarketVendor.create({
        ...form,
        vendor_id: `VM-${nextNum}`,
        is_active: false,
        is_verified: false,
        location: "The Villages, FL",
        schedule: "Every Saturday 9:00 AM – 1:00 PM at Brownwood Paddock Square",
        notes: "Pending admin review — self-signup",
      });
      setSubmitted(true);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  const fieldStyle = {
    width: "100%", padding: "8px 12px", fontSize: 14, border: "1px solid #C8A96E",
    borderRadius: 6, background: "#FFFDF5", fontFamily: "'Times New Roman', serif",
    boxSizing: "border-box", marginBottom: 12,
  };
  const labelStyle = {
    display: "block", fontSize: 12, fontWeight: 700, color: "#5C3A1E",
    marginBottom: 4, fontFamily: "'Times New Roman', serif", textTransform: "uppercase", letterSpacing: 0.5,
  };

  return (
    <div style={{ background: PAPER, minHeight: "100vh", padding: "24px 16px", maxWidth: 520, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <a href="/" style={{ textDecoration: "none" }}>
          <img src="https://media.base44.com/images/public/69d062aca815ce8e697894b1/a9af95bc3_V-Hublogo.png"
            alt="V-HUB" style={{ height: 52, marginBottom: 8 }} />
        </a>
        <h1 style={{ fontSize: 22, fontWeight: 900, color: "#E8431A", fontFamily: "'Times New Roman', serif", margin: 0 }}>
          🛒 List Your Market Booth
        </h1>
        <p style={{ fontSize: 13, color: "#5C3A1E", margin: "6px 0 0", fontFamily: "'Times New Roman', serif", fontStyle: "italic" }}>
          Join 136+ vendors at the Hometown Market — Every Saturday at Brownwood Paddock Square
        </p>
      </div>

      {submitted ? (
        <div style={{ background: "#E8F5E9", border: "2px solid #1A6B3C", borderRadius: 10, padding: "28px 20px", textAlign: "center" }}>
          <div style={{ fontSize: 40 }}>✅</div>
          <h2 style={{ color: "#1A6B3C", fontFamily: "'Times New Roman', serif", margin: "10px 0 6px" }}>
            Application Received!
          </h2>
          <p style={{ fontSize: 14, color: "#3A1A0A", fontFamily: "'Times New Roman', serif", lineHeight: 1.5 }}>
            Thanks for submitting your information. Our team will review your application and reach out to you at <strong>{form.email}</strong> within 1–2 business days.
          </p>
          <a href="/" style={{ display: "inline-block", marginTop: 16, padding: "8px 20px", background: "#E8431A", color: "#fff", borderRadius: 20, fontSize: 13, fontWeight: 700, textDecoration: "none", fontFamily: "'Times New Roman', serif" }}>
            ← Back to V-HUB
          </a>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ background: "#FFFDF5", border: "1px solid #C8A96E", borderRadius: 10, padding: "22px 18px" }}>

          <label style={labelStyle}>Business / Booth Name *</label>
          <input type="text" value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Awesome Fudge" required style={fieldStyle} />

          <label style={labelStyle}>Category *</label>
          <select value={form.category} onChange={e => set("category", e.target.value)} required style={fieldStyle}>
            <option value="">— Select a category —</option>
            {VENDOR_CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <label style={labelStyle}>What do you sell / offer?</label>
          <textarea value={form.description} onChange={e => set("description", e.target.value)}
            placeholder="Brief description of your products or services..."
            rows={3} style={{ ...fieldStyle, resize: "vertical" }} />

          <label style={labelStyle}>Email Address *</label>
          <input type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="your@email.com" required style={fieldStyle} />

          <label style={labelStyle}>Phone Number</label>
          <input type="tel" value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="(352) 555-0000" style={fieldStyle} />

          <label style={labelStyle}>Website</label>
          <input type="url" value={form.website} onChange={e => set("website", e.target.value)} placeholder="https://yourwebsite.com" style={fieldStyle} />

          <label style={labelStyle}>Facebook Page URL</label>
          <input type="url" value={form.facebook_url} onChange={e => set("facebook_url", e.target.value)} placeholder="https://facebook.com/yourbusiness" style={fieldStyle} />

          {error && (
            <div style={{ background: "#FFEBEE", border: "1px solid #CC0000", color: "#CC0000", borderRadius: 6, padding: "8px 12px", fontSize: 13, marginBottom: 12, fontFamily: "'Times New Roman', serif" }}>
              ⚠️ {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            width: "100%", padding: "11px", background: loading ? "#ccc" : "#E8431A",
            color: "#fff", border: "none", borderRadius: 8, fontSize: 15, fontWeight: 900,
            cursor: loading ? "not-allowed" : "pointer", fontFamily: "'Times New Roman', serif",
            letterSpacing: 0.5,
          }}>
            {loading ? "Submitting..." : "🛒 Submit My Vendor Application"}
          </button>

          <p style={{ textAlign: "center", fontSize: 11, color: "#aaa", marginTop: 12, fontStyle: "italic", fontFamily: "'Times New Roman', serif" }}>
            Already a vendor? <a href="/" style={{ color: "#E8431A" }}>Back to homepage</a>
          </p>
        </form>
      )}
    </div>
  );
}
