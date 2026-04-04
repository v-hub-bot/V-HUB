import { useState } from "react";

const BRAND = {
  orange: "#E8431A",
  teal: "#00BFA5",
  blue: "#0077B6",
  deepBlue: "#001F3F",
  green: "#2E9B3B",
  yellow: "#F5A623",
  paper: "#F5ECD7",
  paperDark: "#E8D5B0",
  ink: "#2C1A0E",
  inkLight: "#5C3D1E",
};

function BurgerMenu() {
  const [open, setOpen] = useState(false);
  const navLinks = [
    { label: "🏠 Home", href: "/" },
    { label: "🔍 Find Services", href: "/" },
    { label: "📋 List Your Service", href: "/list-service" },
  ];
  return (
    <>
      <button onClick={() => setOpen(true)}
        style={{ background: "rgba(255,255,255,0.15)", border: "1.5px solid rgba(255,255,255,0.3)", borderRadius: 8, padding: "9px 12px", cursor: "pointer", display: "flex", flexDirection: "column", gap: 5 }}>
        <span style={{ display: "block", width: 20, height: 2, background: "#fff", borderRadius: 2 }} />
        <span style={{ display: "block", width: 20, height: 2, background: "#fff", borderRadius: 2 }} />
        <span style={{ display: "block", width: 20, height: 2, background: "#fff", borderRadius: 2 }} />
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 199, background: "rgba(0,0,0,0.45)" }} />
          <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 280, background: BRAND.paper, zIndex: 200, boxShadow: "-4px 0 30px rgba(0,0,0,0.25)", display: "flex", flexDirection: "column", fontFamily: "Georgia, serif" }}>
            <div style={{ background: BRAND.ink, padding: "22px 20px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ color: "#F5ECD7", fontWeight: 800, fontSize: 18, fontFamily: "Georgia, serif", letterSpacing: 1 }}>V-HUB</div>
              <button onClick={() => setOpen(false)} style={{ background: "rgba(255,255,255,0.12)", border: "none", color: "#fff", borderRadius: 6, width: 30, height: 30, fontSize: 16, cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ padding: "16px 12px", flex: 1 }}>
              {navLinks.map((link, i) => (
                <a key={i} href={link.href} style={{ textDecoration: "none" }}>
                  <div style={{ padding: "15px 16px", borderRadius: 8, fontSize: 16, fontWeight: 600, color: BRAND.ink, marginBottom: 6, background: BRAND.paperDark, borderLeft: `4px solid ${["#8B4513","#E8431A","#1565C0"][i]}`, fontFamily: "Georgia, serif" }}>
                    {link.label}
                  </div>
                </a>
              ))}
            </div>
            <div style={{ padding: "14px 20px", borderTop: `1px solid ${BRAND.paperDark}`, textAlign: "center" }}>
              <div style={{ fontSize: 12, color: BRAND.inkLight, fontFamily: "Georgia, serif" }}>V-HUB — The Villages, FL</div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default function ListService() {
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    { title: "Why Advertise with Us?", content: "V-Hub is the go-to directory for The Villages community. Residents trust us to find reliable, local service providers. Get your business in front of thousands of active neighbors who are actively searching for services like yours." },
    { title: "Pricing Plans", content: "• Basic Listing — Get found by local residents\n• Featured Listing — Appear at the top of search results with a highlighted badge\n• Premium Listing — Maximum visibility with priority placement and enhanced profile\n\nContact William Evans for current pricing details." },
    { title: "How It Works", content: "1. Contact V-Hub to set up your provider profile\n2. Choose your service areas (select the villages you serve)\n3. Add your services, contact info, and business description\n4. Go live and start receiving inquiries from residents in your area" },
    { title: "What Areas Do You Cover?", content: "V-Hub covers all of The Villages, FL — including Historic Side (Spanish Springs), Established Villages (North of SR-466A), Newer Villages (South of SR-44), Eastport, and Family/Non-Age-Restricted neighborhoods." },
  ];

  return (
    <div style={{ minHeight: "100vh", background: BRAND.paper, fontFamily: "Georgia, serif" }}>

      {/* ── Header ── */}
      <div style={{ background: BRAND.ink, padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <a href="/" style={{ textDecoration: "none" }}>
            <button style={{ background: "rgba(255,255,255,0.15)", border: "1.5px solid rgba(255,255,255,0.3)", color: "#fff", borderRadius: 8, padding: "8px 16px", fontSize: 15, cursor: "pointer", fontFamily: "Georgia, serif", fontWeight: 700 }}>← Home</button>
          </a>
          <div style={{ color: BRAND.paper, fontSize: 20, fontWeight: 800, fontFamily: "Georgia, serif", letterSpacing: 1 }}>🌴 V-Hub</div>
        </div>
        <BurgerMenu />
      </div>

      {/* ── Masthead ── */}
      <div style={{ background: BRAND.paper, borderBottom: `2px solid ${BRAND.paperDark}`, padding: "24px 20px", textAlign: "center" }}>
        <div style={{ fontSize: 32, fontWeight: 900, color: BRAND.ink, fontFamily: "Georgia, serif", letterSpacing: 2 }}>List Your Service</div>
        <div style={{ fontSize: 14, color: BRAND.inkLight, fontStyle: "italic", marginTop: 4 }}>Reach thousands of residents in The Villages, FL</div>
        <div style={{ height: 2, background: `linear-gradient(90deg, transparent, ${BRAND.ink}, transparent)`, marginTop: 14 }} />
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 20px 50px" }}>

        {/* ── 3 Value Props ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginTop: 28, marginBottom: 28 }}>
          {[
            { icon: "👥", title: "Large Audience", desc: "Thousands of active Villages residents", color: "#8B4513" },
            { icon: "📍", title: "Hyper-Local", desc: "Exclusively for The Villages community", color: BRAND.orange },
            { icon: "⚡", title: "Easy Setup", desc: "Your listing goes live in minutes", color: "#1565C0" },
          ].map((item, i) => (
            <div key={i} style={{ background: BRAND.paperDark, borderRadius: 12, padding: "20px 12px", textAlign: "center", border: `1px solid ${item.color}25`, boxShadow: "0 2px 8px rgba(44,26,14,0.08)" }}>
              <div style={{ fontSize: 30, marginBottom: 8 }}>{item.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: item.color, marginBottom: 4, fontFamily: "Georgia, serif" }}>{item.title}</div>
              <div style={{ fontSize: 12, color: BRAND.inkLight, lineHeight: 1.5, fontStyle: "italic" }}>{item.desc}</div>
            </div>
          ))}
        </div>

        {/* Decorative rule */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <div style={{ flex: 1, height: 1, background: `${BRAND.ink}30` }} />
          <div style={{ fontSize: 14, color: BRAND.inkLight, fontStyle: "italic", fontFamily: "Georgia, serif" }}>Choose Your Plan</div>
          <div style={{ flex: 1, height: 1, background: `${BRAND.ink}30` }} />
        </div>

        {/* ── Listing Tiers ── */}
        <div style={{ marginBottom: 32 }}>
          {[
            { tier: "Basic", icon: "🟢", color: "#2E7D32", features: ["Searchable provider profile", "List your services & areas", "Contact info visible to residents", "Standard search placement"] },
            { tier: "Featured", icon: "⭐", color: BRAND.orange, highlight: true, badge: "Most Popular", features: ["Everything in Basic", "Featured badge on your profile", "Priority placement in search results", "Highlighted listing card"] },
            { tier: "Premium", icon: "👑", color: "#1565C0", features: ["Everything in Featured", "Top placement in all searches", "Enhanced profile with logo", "Maximum visibility across platform"] },
          ].map((plan, i) => (
            <div key={i} style={{ background: plan.highlight ? "#fff" : BRAND.paperDark, borderRadius: 12, padding: "22px 20px", marginBottom: 12, border: `2px solid ${plan.highlight ? plan.color : plan.color + "30"}`, position: "relative", boxShadow: plan.highlight ? "0 6px 20px rgba(232,67,26,0.12)" : "0 2px 8px rgba(44,26,14,0.06)" }}>
              {plan.badge && (
                <div style={{ position: "absolute", top: -12, right: 20, background: BRAND.orange, color: "#fff", borderRadius: 16, padding: "3px 12px", fontSize: 11, fontWeight: 700, fontFamily: "Georgia, serif" }}>{plan.badge}</div>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <span style={{ fontSize: 26 }}>{plan.icon}</span>
                <div style={{ fontSize: 18, fontWeight: 800, color: plan.color, fontFamily: "Georgia, serif" }}>{plan.tier} Listing</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {plan.features.map((f, j) => (
                  <div key={j} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: BRAND.ink, fontFamily: "Georgia, serif" }}>
                    <span style={{ color: plan.color, fontWeight: 700 }}>✓</span> {f}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* ── Contact CTA ── */}
        <div style={{ background: BRAND.ink, borderRadius: 16, padding: "32px 26px", textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 24, fontWeight: 900, color: BRAND.paper, fontFamily: "Georgia, serif", letterSpacing: 1, marginBottom: 8 }}>Ready to Get Listed?</div>
          <div style={{ color: `${BRAND.paper}90`, fontSize: 15, marginBottom: 26, lineHeight: 1.7, fontStyle: "italic" }}>
            Contact William Evans to set up your provider profile and start reaching customers across The Villages today.
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
            <a href="mailto:william@vhub.com" style={{ textDecoration: "none", width: "100%", maxWidth: 340 }}>
              <div style={{ background: BRAND.orange, color: "#fff", borderRadius: 10, padding: "16px 24px", fontSize: 17, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxShadow: "0 4px 16px rgba(232,67,26,0.35)", fontFamily: "Georgia, serif" }}>
                ✉️ Email to Get Started
              </div>
            </a>
            <a href="tel:+13521234567" style={{ textDecoration: "none", width: "100%", maxWidth: 340 }}>
              <div style={{ background: BRAND.paper, color: BRAND.ink, borderRadius: 10, padding: "16px 24px", fontSize: 17, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontFamily: "Georgia, serif" }}>
                📞 Call William Evans
              </div>
            </a>
          </div>
        </div>

        {/* ── FAQ ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1, height: 1, background: `${BRAND.ink}30` }} />
          <div style={{ fontSize: 14, color: BRAND.inkLight, fontStyle: "italic", fontFamily: "Georgia, serif" }}>Frequently Asked Questions</div>
          <div style={{ flex: 1, height: 1, background: `${BRAND.ink}30` }} />
        </div>
        {faqs.map((faq, i) => (
          <div key={i} style={{ background: BRAND.paperDark, borderRadius: 10, marginBottom: 8, border: `1px solid ${BRAND.ink}15`, overflow: "hidden" }}>
            <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
              style={{ width: "100%", background: "none", border: "none", padding: "16px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", fontSize: 15, fontWeight: 700, color: BRAND.ink, fontFamily: "Georgia, serif", textAlign: "left" }}>
              {faq.title}
              <span style={{ fontSize: 14, color: BRAND.inkLight, flexShrink: 0 }}>{openFaq === i ? "▲" : "▼"}</span>
            </button>
            {openFaq === i && (
              <div style={{ padding: "4px 18px 16px", fontSize: 14, color: BRAND.inkLight, lineHeight: 1.8, whiteSpace: "pre-line", fontStyle: "italic" }}>{faq.content}</div>
            )}
          </div>
        ))}

        {/* Footer */}
        <div style={{ textAlign: "center", padding: "24px 0 0" }}>
          <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${BRAND.ink}40, transparent)`, marginBottom: 16 }} />
          <div style={{ fontSize: 18, fontWeight: 800, color: BRAND.ink, fontFamily: "Georgia, serif", letterSpacing: 2 }}>🌴 V-HUB</div>
          <div style={{ color: BRAND.inkLight, fontSize: 12, marginTop: 4, fontStyle: "italic" }}>The Villages, FL</div>
        </div>
      </div>
    </div>
  );
}
