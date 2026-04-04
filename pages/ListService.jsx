import { useState } from "react";

const BRAND = {
  orange: "#E8431A",
  teal: "#00BFA5",
  blue: "#0077B6",
  deepBlue: "#001F3F",
  green: "#2E9B3B",
  yellow: "#F5A623",
  lightBg: "#F8FFFE",
  text: "#1A1A2E",
  subtext: "#555",
};

export default function ListService() {
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      title: "Why Advertise with Us?",
      content: "V-Hub is the go-to directory for The Villages community. Residents trust us to find reliable, local service providers. Get your business in front of thousands of active neighbors who are actively searching for services like yours."
    },
    {
      title: "Pricing Plans",
      content: "• Basic Listing — Get found by local residents\n• Featured Listing — Appear at the top of search results with a highlighted badge\n• Premium Listing — Maximum visibility with priority placement and enhanced profile\n\nContact William Evans for current pricing details."
    },
    {
      title: "How It Works",
      content: "1. Contact V-Hub to set up your provider profile\n2. Choose your service areas (select the villages you serve)\n3. Add your services, contact info, and business description\n4. Go live and start receiving inquiries from residents in your area"
    },
    {
      title: "What Areas Do You Cover?",
      content: "V-Hub covers all of The Villages, FL — including Historic Side (Spanish Springs), Established Villages (North of SR-466A), Newer Villages (South of SR-44), Eastport, and Family/Non-Age-Restricted neighborhoods."
    },
  ];

  return (
    <div style={{ minHeight: "100vh", background: BRAND.lightBg, fontFamily: "'Segoe UI', sans-serif" }}>

      {/* ── Header ── */}
      <div style={{
        background: `linear-gradient(135deg, #001F3F, #003F6B)`,
        padding: "20px 24px",
        display: "flex",
        alignItems: "center",
        gap: 14,
        boxShadow: "0 4px 16px rgba(0,0,0,0.25)"
      }}>
        <a href="/" style={{ textDecoration: "none" }}>
          <button style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", borderRadius: 10, padding: "8px 16px", fontSize: 16, cursor: "pointer", fontWeight: 600 }}>
            ← Back
          </button>
        </a>
        <img
          src="https://media.base44.com/images/public/69d062aca815ce8e697894b1/f418f4c1d_V-Hublogo.png"
          style={{ height: 42, width: 42, borderRadius: "50%", objectFit: "contain" }}
          alt="V-Hub"
        />
        <div style={{ color: "#fff", fontSize: 20, fontWeight: 800 }}>List Your Service</div>
      </div>

      {/* ── Hero Banner ── */}
      <div style={{
        background: `linear-gradient(135deg, ${BRAND.orange}, ${BRAND.yellow} 60%, ${BRAND.teal})`,
        padding: "44px 24px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -40, left: -40, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,0.06)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -30, right: -30, width: 200, height: 200, borderRadius: "50%", background: "rgba(0,0,0,0.06)", pointerEvents: "none" }} />

        <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
        <div style={{ color: "#fff", fontSize: 30, fontWeight: 900, marginBottom: 10, textShadow: "0 2px 10px rgba(0,0,0,0.2)" }}>
          Grow Your Business in<br />The Villages
        </div>
        <div style={{ color: "rgba(255,255,255,0.9)", fontSize: 17, maxWidth: 440, margin: "0 auto", lineHeight: 1.7 }}>
          Reach thousands of residents who are actively searching for trusted local service providers just like you.
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 20px 50px" }}>

        {/* ── 3 Value Props ── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 14,
          marginTop: 28,
          marginBottom: 24,
        }}>
          {[
            { icon: "👥", title: "Large Audience", desc: "Thousands of active Villages residents", color: BRAND.teal },
            { icon: "📍", title: "Hyper-Local", desc: "Exclusively for The Villages community", color: BRAND.orange },
            { icon: "⚡", title: "Easy Setup", desc: "Your listing goes live in minutes", color: BRAND.blue },
          ].map((item, i) => (
            <div key={i} style={{
              background: "#fff",
              borderRadius: 18,
              padding: "22px 14px",
              textAlign: "center",
              boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
              border: `2px solid ${item.color}25`,
            }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>{item.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: item.color, marginBottom: 4 }}>{item.title}</div>
              <div style={{ fontSize: 12, color: BRAND.subtext, lineHeight: 1.5 }}>{item.desc}</div>
            </div>
          ))}
        </div>

        {/* ── Listing Tiers ── */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: BRAND.text, marginBottom: 6, textAlign: "center" }}>Choose Your Plan</div>
          <div style={{ fontSize: 14, color: BRAND.subtext, textAlign: "center", marginBottom: 20 }}>All plans include a searchable profile visible to Villages residents</div>

          {[
            {
              tier: "Basic",
              icon: "🟢",
              color: BRAND.green,
              features: ["Searchable provider profile", "List your services & areas", "Contact info visible to residents", "Standard search placement"],
            },
            {
              tier: "Featured",
              icon: "⭐",
              color: BRAND.orange,
              highlight: true,
              badge: "Most Popular",
              features: ["Everything in Basic", "Featured badge on your profile", "Priority placement in search results", "Highlighted listing card"],
            },
            {
              tier: "Premium",
              icon: "👑",
              color: BRAND.blue,
              features: ["Everything in Featured", "Top placement in all searches", "Enhanced profile with logo", "Maximum visibility across platform"],
            },
          ].map((plan, i) => (
            <div key={i} style={{
              background: plan.highlight ? `linear-gradient(135deg, ${BRAND.orange}08, ${BRAND.yellow}08)` : "#fff",
              borderRadius: 18,
              padding: "24px 22px",
              marginBottom: 14,
              boxShadow: plan.highlight ? "0 8px 28px rgba(232,67,26,0.15)" : "0 4px 16px rgba(0,0,0,0.07)",
              border: `2px solid ${plan.highlight ? plan.color : plan.color + "30"}`,
              position: "relative",
            }}>
              {plan.badge && (
                <div style={{
                  position: "absolute", top: -12, right: 20,
                  background: `linear-gradient(135deg, ${BRAND.orange}, ${BRAND.yellow})`,
                  color: "#fff", borderRadius: 20, padding: "4px 14px",
                  fontSize: 12, fontWeight: 700,
                }}>
                  {plan.badge}
                </div>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <span style={{ fontSize: 28 }}>{plan.icon}</span>
                <div style={{ fontSize: 20, fontWeight: 800, color: plan.color }}>{plan.tier} Listing</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {plan.features.map((f, j) => (
                  <div key={j} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 15, color: BRAND.text }}>
                    <span style={{ color: plan.color, fontWeight: 700, fontSize: 16 }}>✓</span> {f}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* ── Contact CTA ── */}
        <div style={{
          background: `linear-gradient(135deg, ${BRAND.deepBlue}, #003F6B)`,
          borderRadius: 22,
          padding: "34px 28px",
          textAlign: "center",
          marginBottom: 24,
        }}>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#fff", marginBottom: 10 }}>
            Ready to Get Listed?
          </div>
          <div style={{ color: "rgba(255,255,255,0.78)", fontSize: 16, marginBottom: 28, lineHeight: 1.7 }}>
            Contact William Evans to set up your provider profile and start reaching customers across The Villages today.
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, alignItems: "center" }}>
            <a href="mailto:william@vhub.com" style={{ textDecoration: "none", width: "100%", maxWidth: 360 }}>
              <div style={{
                background: `linear-gradient(135deg, ${BRAND.orange}, ${BRAND.yellow})`,
                color: "#fff", borderRadius: 14, padding: "18px 24px",
                fontSize: 18, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                boxShadow: "0 6px 20px rgba(232,67,26,0.35)",
              }}>
                ✉️ Email to Get Started
              </div>
            </a>
            <a href="tel:+13521234567" style={{ textDecoration: "none", width: "100%", maxWidth: 360 }}>
              <div style={{
                background: BRAND.teal,
                color: "#fff", borderRadius: 14, padding: "18px 24px",
                fontSize: 18, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                boxShadow: "0 6px 20px rgba(0,191,165,0.3)",
              }}>
                📞 Call William Evans
              </div>
            </a>
          </div>
        </div>

        {/* ── FAQ Accordion ── */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: BRAND.text, marginBottom: 16 }}>Frequently Asked Questions</div>
          {faqs.map((faq, i) => (
            <div key={i} style={{ background: "#fff", borderRadius: 14, marginBottom: 8, boxShadow: "0 2px 10px rgba(0,0,0,0.07)", overflow: "hidden" }}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{ width: "100%", background: "none", border: "none", padding: "18px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", fontSize: 16, fontWeight: 700, color: BRAND.text, textAlign: "left" }}
              >
                {faq.title}
                <span style={{ fontSize: 18, color: BRAND.teal, flexShrink: 0, marginLeft: 10 }}>{openFaq === i ? "▲" : "▼"}</span>
              </button>
              {openFaq === i && (
                <div style={{ padding: "4px 20px 18px", fontSize: 15, color: BRAND.subtext, lineHeight: 1.8, whiteSpace: "pre-line" }}>
                  {faq.content}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <img src="https://media.base44.com/images/public/69d062aca815ce8e697894b1/f418f4c1d_V-Hublogo.png"
            alt="V-Hub" style={{ width: 50, height: 50, objectFit: "contain", borderRadius: "50%", marginBottom: 8 }} />
          <div style={{ color: BRAND.subtext, fontSize: 13 }}>V-HUB — The Villages, FL</div>
        </div>
      </div>
    </div>
  );
}
