import { useState, useEffect } from "react";
import { Provider, ProviderReview, User } from "@/api/entities";

// ── SEO ───────────────────────────────────────────────────────────────────
function useMeta({ title }) {
  useEffect(() => {
    document.title = title || "Provider Hub | V-Hub";
  }, [title]);
}

// ── Design tokens ─────────────────────────────────────────────────────────
const INK       = "#1C0F00";
const INK_FADE  = "#5C3A10";
const PAPER     = "#F0E6C8";
const PAPER_MID = "#E4D5A8";
const PAPER_DK  = "#C8B07A";
const BROWN_BTN = "#7A4820";
const YELLOW    = "#FFDB00";
const RED_RULE  = "#8B1A1A";
const GREEN     = "#1A6B3C";
const TEAL      = "#00836B";

// ── Services catalog ──────────────────────────────────────────────────────
const CATS = [
  { id: "c1", name: "Home Services", icon: "🏠", services: [
    "Home Improvements","General Repairs","Cleaning Services (Home & Pool)","Painting (Interior/Exterior)",
    "Garage Door Services","Window Installation/Repair","HVAC","Plumbing","Roofing",
  ]},
  { id: "c2", name: "Home Systems & Utilities", icon: "💡", services: [
    "Handyman Services","Security & Home Watch","Pest Control","Appliance Repair",
    "Electrical & Lighting","Flooring (Tile, Wood, Carpet)","Home Organization","Smart Home Installation","Pool & Spa Services",
  ]},
  { id: "c3", name: "Yard & Outdoor", icon: "🌿", services: [
    "Lawn Mowing","Sod Installation","Tree Trimming & Pruning/Removal","Lawn Fertilization",
    "Irrigation/Sprinkler Services","Landscaping","Hardscaping","Pressure Washing","Driveway Repair/Cleaning/Painting",
  ]},
  { id: "c4", name: "Golf Cart Services", icon: "⛳", services: [
    "Rentals","Repairs","Detailing","Lighting Upgrades","Improvements/Customizations","Battery Replacement","Tire Services",
  ]},
  { id: "c5", name: "Automobile Services", icon: "🚗", services: [
    "Auto Repairs","Auto Detailing","Oil Changes","Tire Services","Mobile Mechanic",
  ]},
  { id: "c6", name: "Personal Care", icon: "💆", services: [
    "Hair Stylists","Nail Technicians","Spa Services","Home Health Aides","Massage Therapists","Personal Trainers","Makeup Artists",
  ]},
  { id: "c7", name: "Pet Services", icon: "🐾", services: [
    "Veterinary Services","Grooming","Pet Sitting/Walking","Pet Training","Mobile Grooming",
  ]},
  { id: "c8", name: "Transportation", icon: "🚐", services: [
    "Medical Transport","Airport Transport","Local Rides","Errand Services","Courier/Delivery Services",
  ]},
  { id: "c9", name: "Professional Services", icon: "💼", services: [
    "Accounting & Bookkeeping","Notary Services","IT Support","Legal Services","Business Consulting","Tax Preparation",
  ]},
];

const VILLAGES = [
  "Buttonwood","Calumet Grove","Chartres","Collier","Dabney","DeSoto","DuVal","Duval","Fenney",
  "Gilchrist","Hacienda Hills","Hamilton","Hillsborough","Chitty Chatty","Johnston","Lake Deaton",
  "Lake Sumter Landing","Lakeview","Largo","Laurel Valley","Liberty Park","Lynnhaven","Mallory Square",
  "Marsh Bend","McClure","Medallion","Mira Mesa","Monarch Grove","Mulberry Grove","Osceola Hills",
  "Palmer Legends","Pennecamp","Pine Hills","Piñellas","Poinciana","Rio Grande","Rio Ponderosa",
  "Sabal Chase","Sanibel","Santiago","Santo Domingo","Sarasota","Silver Lake","Summerhill",
  "Sumter Landing","Sunset Pointe","Tamarind Grove","Tierra Del Sol","Tierra Del Sol South",
  "Tillandsia","Titusville","Tortuga","Tri-County","Twin Lakes","Vault","Vera Cruz","Verandah",
  "Village of Bonita","Village of Chatham","Winifred","Woodbury","Woodlands"
];

// ── Helpers ───────────────────────────────────────────────────────────────
const inputStyle = {
  width: "100%", boxSizing: "border-box", background: PAPER,
  border: `1.5px solid ${PAPER_DK}`, borderRadius: 4,
  color: INK, fontFamily: "'Times New Roman', serif", fontSize: 14,
  padding: "9px 12px", outline: "none",
};
const labelStyle = {
  fontSize: 11, fontWeight: 700, color: INK_FADE, textTransform: "uppercase",
  letterSpacing: 1, marginBottom: 4, display: "block", fontFamily: "'Times New Roman', serif",
};
const sectionHead = {
  fontSize: 11, fontWeight: 900, letterSpacing: 3, textTransform: "uppercase",
  color: INK, borderBottom: `2px solid ${INK}`, paddingBottom: 4, marginBottom: 12,
  fontFamily: "'Times New Roman', serif",
};

function daysLeft(dateStr) {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
}

function Stars({ rating, size = 14 }) {
  const full = Math.floor(rating || 0);
  return <span style={{ fontSize: size, color: "#B8860B" }}>{"★".repeat(full)}{"☆".repeat(5 - full)}</span>;
}

// ── Services accordion ────────────────────────────────────────────────────
function SvcAccordion({ selSvcs, setSelSvcs }) {
  const [openCat, setOpenCat] = useState(null);
  const toggle = (name) => setSelSvcs(prev => prev.includes(name) ? prev.filter(s => s !== name) : [...prev, name]);
  return (
    <div>
      {CATS.map(cat => {
        const isOpen = openCat === cat.id;
        const count = cat.services.filter(s => selSvcs.includes(s)).length;
        return (
          <div key={cat.id} style={{ marginBottom: 4, borderRadius: 5, overflow: "hidden", border: `1.5px solid ${PAPER_DK}` }}>
            <div onClick={() => setOpenCat(isOpen ? null : cat.id)} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 13px",
              background: count > 0 ? `linear-gradient(180deg,#9A6030,${BROWN_BTN})` : `linear-gradient(180deg,${PAPER_MID},${PAPER_DK})`,
              color: count > 0 ? PAPER : INK, cursor: "pointer", fontWeight: 700, fontSize: 13,
            }}>
              <span>{cat.icon} {cat.name}{count > 0 ? `  ✓ ${count}` : ""}</span>
              <span style={{ fontSize: 11 }}>{isOpen ? "▲" : "▼"}</span>
            </div>
            {isOpen && (
              <div style={{ background: PAPER }}>
                {cat.services.map(svc => {
                  const checked = selSvcs.includes(svc);
                  return (
                    <div key={svc} onClick={() => toggle(svc)} style={{
                      display: "flex", alignItems: "center", gap: 10, padding: "9px 16px", cursor: "pointer",
                      background: checked ? "rgba(122,72,32,0.08)" : "transparent", borderBottom: `1px solid ${PAPER_MID}`,
                    }}>
                      <div style={{ width: 16, height: 16, border: `2px solid ${checked ? BROWN_BTN : PAPER_DK}`, borderRadius: 3, background: checked ? BROWN_BTN : PAPER, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {checked && <span style={{ color: PAPER, fontSize: 10 }}>✓</span>}
                      </div>
                      <span style={{ fontSize: 13, color: INK }}>{svc}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Village multi-select ──────────────────────────────────────────────────
function VillageSelect({ selAreas, setSelAreas }) {
  const [open, setOpen] = useState(false);
  const toggle = (v) => setSelAreas(p => p.includes(v) ? p.filter(a => a !== v) : [...p, v]);
  return (
    <div>
      <div onClick={() => setOpen(o => !o)} style={{
        border: `1.5px solid ${PAPER_DK}`, borderRadius: 5, padding: "10px 13px", cursor: "pointer",
        background: selAreas.length > 0 ? `linear-gradient(180deg,#9A6030,${BROWN_BTN})` : `linear-gradient(180deg,${PAPER_MID},${PAPER_DK})`,
        color: selAreas.length > 0 ? PAPER : INK, display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 13,
      }}>
        <span>📍 {selAreas.length === 0 ? "Select villages..." : `${selAreas.length} village${selAreas.length > 1 ? "s" : ""} selected`}</span>
        <span style={{ fontSize: 11 }}>{open ? "▲" : "▼"}</span>
      </div>
      {open && (
        <div style={{ border: `1.5px solid ${PAPER_DK}`, borderTop: "none", borderRadius: "0 0 5px 5px", maxHeight: 250, overflowY: "auto", background: PAPER }}>
          {VILLAGES.map(v => {
            const checked = selAreas.includes(v);
            return (
              <div key={v} onClick={() => toggle(v)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 14px", cursor: "pointer", background: checked ? "rgba(122,72,32,0.08)" : "transparent", borderBottom: `1px solid ${PAPER_MID}` }}>
                <div style={{ width: 16, height: 16, border: `2px solid ${checked ? BROWN_BTN : PAPER_DK}`, borderRadius: 3, background: checked ? BROWN_BTN : PAPER, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {checked && <span style={{ color: PAPER, fontSize: 10 }}>✓</span>}
                </div>
                <span style={{ fontSize: 13, color: INK }}>{v}</span>
              </div>
            );
          })}
        </div>
      )}
      {selAreas.length > 0 && (
        <div style={{ marginTop: 6, fontSize: 12, color: INK_FADE, lineHeight: 1.6 }}><strong style={{ color: INK }}>Serving:</strong> {selAreas.join(", ")}</div>
      )}
    </div>
  );
}

// ── Trial banner ──────────────────────────────────────────────────────────
function TrialBanner({ provider }) {
  const status = provider.subscription_status;
  const days = daysLeft(provider.trial_end_date);

  if (status === "active") return null;
  if (status === "trial_expired") return (
    <div style={{ background: "#fee", border: `1.5px solid ${RED_RULE}`, borderRadius: 8, padding: "14px 18px", marginBottom: 20 }}>
      <div style={{ fontWeight: 900, color: RED_RULE, fontSize: 14, marginBottom: 4 }}>⚠ Your Trial Has Expired</div>
      <div style={{ fontSize: 13, color: INK_FADE }}>Your listing is currently hidden. To reactivate, set up billing below for $12/month.</div>
      <button style={{ marginTop: 10, background: RED_RULE, color: "#fff", border: "none", borderRadius: 6, padding: "9px 20px", fontWeight: 700, cursor: "pointer", fontSize: 13 }}
        onClick={() => window.location.href = "mailto:admin@v-hub.us?subject=Ready to Subscribe — " + provider.business_name}>
        Contact Us to Reactivate →
      </button>
    </div>
  );
  if (status === "trial") {
    const pct = days !== null ? Math.max(5, Math.min(100, ((45 - days) / 45) * 100)) : 50;
    const urgent = days !== null && days <= 7;
    return (
      <div style={{ background: urgent ? "#fff3e0" : PAPER_MID, border: `1.5px solid ${urgent ? "#e65100" : PAPER_DK}`, borderRadius: 8, padding: "14px 18px", marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <div style={{ fontWeight: 900, color: urgent ? "#bf360c" : BROWN_BTN, fontSize: 14 }}>
            {urgent ? `⚠ Trial ends in ${days} day${days !== 1 ? "s" : ""}!` : `🕐 Free Trial Active — ${days} days remaining`}
          </div>
          <span style={{ fontSize: 12, color: INK_FADE }}>45-day trial</span>
        </div>
        <div style={{ background: "#e0e0e0", borderRadius: 4, height: 7, marginBottom: 8 }}>
          <div style={{ background: urgent ? "#e65100" : TEAL, borderRadius: 4, height: 7, width: `${pct}%`, transition: "width 0.5s" }} />
        </div>
        <div style={{ fontSize: 12, color: INK_FADE }}>
          {urgent
            ? "Set up billing to keep your listing active after your trial ends."
            : `After your trial, stay listed for just $12/month. Ends ${provider.trial_end_date ? new Date(provider.trial_end_date).toLocaleDateString("en-US", { month: "long", day: "numeric" }) : ""}.`}
        </div>
        {urgent && (
          <button style={{ marginTop: 10, background: "#e65100", color: "#fff", border: "none", borderRadius: 6, padding: "9px 20px", fontWeight: 700, cursor: "pointer", fontSize: 13 }}
            onClick={() => window.location.href = "mailto:admin@v-hub.us?subject=Ready to Subscribe — " + provider.business_name}>
            Set Up Billing — $12/mo →
          </button>
        )}
      </div>
    );
  }
  if (status === "pending") return (
    <div style={{ background: "#fff8e1", border: "1.5px solid #f59e0b", borderRadius: 8, padding: "14px 18px", marginBottom: 20 }}>
      <div style={{ fontWeight: 900, color: "#92400e", fontSize: 14 }}>🕐 Pending Admin Approval</div>
      <div style={{ fontSize: 13, color: INK_FADE, marginTop: 4 }}>Your listing has been submitted and is being reviewed. You'll get an email once it's live.</div>
    </div>
  );
  return null;
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────
export default function ProviderDashboard() {
  useMeta({ title: "Provider Hub | V-Hub — The Villages, FL" });

  const [authState, setAuthState] = useState("loading"); // loading | unauthenticated | authenticated
  const [currentUser, setCurrentUser] = useState(null);
  const [provider, setProvider] = useState(null);
  const [providerState, setProviderState] = useState("loading"); // loading | not_found | found
  const [view, setView] = useState("dashboard"); // dashboard | edit
  const [reviews, setReviews] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  // Edit form
  const [form, setForm] = useState({});
  const [selSvcs, setSelSvcs] = useState([]);
  const [selAreas, setSelAreas] = useState([]);

  // Review form
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewSaved, setReviewSaved] = useState(false);
  const [reviewForm, setReviewForm] = useState({ customer_name: "", customer_village: "", rating: 5, review_text: "", service_used: "" });

  // ── Auth check ────────────────────────────────────────────────────────
  useEffect(() => {
    User.me()
      .then(u => { setCurrentUser(u); setAuthState("authenticated"); })
      .catch(() => setAuthState("unauthenticated"));
  }, []);

  // ── Load provider once authenticated ─────────────────────────────────
  useEffect(() => {
    if (authState !== "authenticated" || !currentUser?.email) return;
    loadMyProvider();
  }, [authState, currentUser]);

  const loadMyProvider = async () => {
    setProviderState("loading");
    try {
      // Try to find provider by email match
      const all = await Provider.filter({ email: currentUser.email });
      if (all && all.length > 0) {
        const prov = all[0];
        setProvider(prov);
        seedForm(prov);
        // Load approved reviews
        try {
          const revs = await ProviderReview.filter({ provider_id: prov.id });
          setReviews((revs || []).filter(r => r.is_approved));
        } catch { setReviews([]); }
        setProviderState("found");
      } else {
        setProviderState("not_found");
      }
    } catch (e) {
      console.error("loadMyProvider error:", e);
      setProviderState("not_found");
    }
  };

  const seedForm = (prov) => {
    setForm({
      business_name: prov.business_name || "",
      owner_name: prov.owner_name || "",
      phone: prov.phone || "",
      email: prov.email || "",
      website: prov.website || "",
      address: prov.address || "",
      description: prov.description || "",
      years_in_business: prov.years_in_business || "",
      license_number: prov.license_number || "",
      google_review_url: prov.google_review_url || "",
    });
    setSelSvcs(prov.services || []);
    setSelAreas(prov.service_areas || []);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await Provider.update(provider.id, { ...form, services: selSvcs, service_areas: selAreas });
      setSaveMsg("✓ Profile updated successfully!");
      setTimeout(() => setSaveMsg(""), 4000);
      const fresh = await Provider.get(provider.id);
      setProvider(fresh);
      setView("dashboard");
    } catch (e) {
      setSaveMsg("⚠ Error saving. Please try again.");
    }
    setSaving(false);
  };

  const handleReviewSubmit = async () => {
    if (!reviewForm.customer_name || !reviewForm.review_text) return;
    await ProviderReview.create({ ...reviewForm, provider_id: provider.id, is_approved: false, helpful_count: 0 });
    setReviewSaved(true);
    setShowReviewForm(false);
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : null;

  // ─────────────────────────────────────────────────────────────────────
  // STATES
  // ─────────────────────────────────────────────────────────────────────

  // Loading auth
  if (authState === "loading") return (
    <div style={{ minHeight: "100vh", background: PAPER, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Times New Roman', serif" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🌴</div>
        <div style={{ fontSize: 16, color: INK_FADE }}>Loading your Provider Hub...</div>
      </div>
    </div>
  );

  // Not logged in — show sign in prompt
  if (authState === "unauthenticated") return (
    <div style={{ minHeight: "100vh", background: PAPER, backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 27px,rgba(28,15,0,0.03) 27px,rgba(28,15,0,0.03) 28px)", fontFamily: "'Times New Roman', Georgia, serif" }}>
      <div style={{ background: INK, padding: "10px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <a href="/" style={{ textDecoration: "none" }}>
          <button style={{ background: "rgba(255,255,255,0.1)", border: `1.5px solid ${PAPER_DK}`, color: PAPER, borderRadius: 6, padding: "7px 16px", fontSize: 13, cursor: "pointer", fontWeight: 700 }}>← Home</button>
        </a>
        <div style={{ color: PAPER, fontSize: 22, fontWeight: 900, letterSpacing: 1 }}>🌴 V-Hub</div>
        <div style={{ width: 80 }} />
      </div>

      <div style={{ textAlign: "center", padding: "24px 20px 18px", borderBottom: `3px double ${INK}` }}>
        <div style={{ fontSize: 10, letterSpacing: 5, textTransform: "uppercase", color: INK_FADE, fontStyle: "italic", marginBottom: 2 }}>The Villages, Florida</div>
        <div style={{ fontSize: 30, fontWeight: 900, color: INK, letterSpacing: 3, textTransform: "uppercase" }}>Provider Hub</div>
        <div style={{ height: 2, background: RED_RULE, margin: "8px auto", width: 200 }} />
        <div style={{ fontSize: 13, color: INK_FADE, fontStyle: "italic" }}>Manage your listing · View your stats · Read your reviews</div>
      </div>

      <div style={{ maxWidth: 480, margin: "40px auto", padding: "0 20px" }}>
        <div style={{ background: PAPER_MID, border: `2px solid ${PAPER_DK}`, borderRadius: 8, padding: "32px 28px", textAlign: "center" }}>
          <div style={{ fontSize: 42, marginBottom: 12 }}>🔐</div>
          <div style={{ fontSize: 18, fontWeight: 900, color: INK, textTransform: "uppercase", letterSpacing: 2, marginBottom: 10 }}>Provider Sign In</div>
          <div style={{ fontSize: 13, color: INK_FADE, fontStyle: "italic", marginBottom: 24, lineHeight: 1.7 }}>
            Sign in with the email address you used to register your business with V-Hub. If you were added by our team, use that same email to access your dashboard.
          </div>
          <a href="/login?redirect=/ProviderDashboard">
            <button style={{
              background: `linear-gradient(180deg,#9A6030,${BROWN_BTN} 60%,#5A3010)`,
              color: PAPER, border: `3px solid ${YELLOW}`,
              boxShadow: `0 0 0 1.5px ${YELLOW}, 0 0 10px 2px rgba(255,220,0,0.25)`,
              borderRadius: 6, padding: "14px 40px", fontSize: 14, fontWeight: 900, cursor: "pointer",
              fontFamily: "'Times New Roman', serif", letterSpacing: 2, textTransform: "uppercase", width: "100%",
            }}>
              Sign In to My Dashboard →
            </button>
          </a>
          <div style={{ marginTop: 20, fontSize: 12, color: INK_FADE, fontStyle: "italic" }}>
            New provider?{" "}
            <a href="/ListService" style={{ color: BROWN_BTN, fontWeight: 700 }}>List your business here</a>
          </div>
        </div>
      </div>
    </div>
  );

  // Authenticated but no provider record found
  if (authState === "authenticated" && providerState === "not_found") return (
    <div style={{ minHeight: "100vh", background: PAPER, fontFamily: "'Times New Roman', serif" }}>
      <div style={{ background: INK, padding: "10px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <a href="/" style={{ textDecoration: "none" }}>
          <button style={{ background: "rgba(255,255,255,0.1)", border: `1.5px solid ${PAPER_DK}`, color: PAPER, borderRadius: 6, padding: "7px 16px", fontSize: 13, cursor: "pointer", fontWeight: 700 }}>← Home</button>
        </a>
        <div style={{ color: PAPER, fontSize: 20, fontWeight: 900 }}>🌴 Provider Hub</div>
        <div style={{ width: 80 }} />
      </div>
      <div style={{ maxWidth: 500, margin: "60px auto", padding: "0 20px", textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🏗️</div>
        <div style={{ fontSize: 22, fontWeight: 900, color: INK, textTransform: "uppercase", letterSpacing: 2, marginBottom: 10 }}>No Listing Found</div>
        <div style={{ fontSize: 14, color: INK_FADE, fontStyle: "italic", lineHeight: 1.7, marginBottom: 24 }}>
          We don't have a V-Hub listing linked to <strong>{currentUser?.email}</strong>.<br />
          If you were recently added by our team, make sure you sign in with the exact email we have on file.<br /><br />
          Otherwise, list your business below to get started!
        </div>
        <a href="/ListService">
          <button style={{ background: `linear-gradient(180deg,#9A6030,${BROWN_BTN} 60%,#5A3010)`, color: PAPER, border: `3px solid ${YELLOW}`, borderRadius: 6, padding: "14px 36px", fontSize: 14, fontWeight: 900, cursor: "pointer", letterSpacing: 2, textTransform: "uppercase" }}>
            List My Business →
          </button>
        </a>
        <div style={{ marginTop: 16, fontSize: 12, color: INK_FADE }}>
          Wrong account? <a href="/login?redirect=/ProviderDashboard" style={{ color: BROWN_BTN, fontWeight: 700 }}>Sign in with a different email</a>
        </div>
        <div style={{ marginTop: 12, fontSize: 12, color: INK_FADE }}>
          Need help? <a href="mailto:admin@v-hub.us" style={{ color: BROWN_BTN, fontWeight: 700 }}>Contact admin@v-hub.us</a>
        </div>
      </div>
    </div>
  );

  // Loading provider data
  if (providerState === "loading") return (
    <div style={{ minHeight: "100vh", background: PAPER, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Times New Roman', serif" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🌴</div>
        <div style={{ fontSize: 16, color: INK_FADE }}>Loading your listing...</div>
      </div>
    </div>
  );

  // ── EDIT VIEW ─────────────────────────────────────────────────────────
  if (view === "edit") return (
    <div style={{ minHeight: "100vh", background: PAPER, backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 27px,rgba(28,15,0,0.03) 27px,rgba(28,15,0,0.03) 28px)", fontFamily: "'Times New Roman', serif" }}>
      <div style={{ background: INK, padding: "10px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <button onClick={() => setView("dashboard")} style={{ background: "rgba(255,255,255,0.1)", border: `1.5px solid ${PAPER_DK}`, color: PAPER, borderRadius: 6, padding: "7px 14px", fontSize: 13, cursor: "pointer", fontWeight: 700 }}>← Dashboard</button>
        <div style={{ color: PAPER, fontSize: 18, fontWeight: 900 }}>✏ Edit Profile</div>
        <button onClick={handleSave} disabled={saving} style={{ background: `linear-gradient(180deg,#9A6030,${BROWN_BTN})`, color: PAPER, border: `2px solid ${YELLOW}`, borderRadius: 6, padding: "7px 16px", fontSize: 13, fontWeight: 900, cursor: "pointer", letterSpacing: 1 }}>
          {saving ? "Saving…" : "Save →"}
        </button>
      </div>

      <div style={{ maxWidth: 700, margin: "0 auto", padding: "24px 16px 60px" }}>
        {saveMsg && <div style={{ marginBottom: 16, fontSize: 13, color: saveMsg.startsWith("✓") ? GREEN : RED_RULE, fontStyle: "italic", textAlign: "center" }}>{saveMsg}</div>}

        <div style={{ ...sectionHead }}>Section 1 — Business Info</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 16px", marginBottom: 20 }}>
          {[
            ["business_name", "Business Name *"],
            ["owner_name", "Owner / Contact Name *"],
            ["phone", "Phone *"],
            ["email", "Email *"],
            ["website", "Website"],
            ["address", "Address"],
            ["years_in_business", "Years in Business"],
            ["license_number", "License Number"],
          ].map(([k, l]) => (
            <div key={k} style={{ gridColumn: k === "address" ? "1 / -1" : "auto" }}>
              <label style={labelStyle}>{l}</label>
              <input value={form[k] || ""} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} style={inputStyle} />
            </div>
          ))}
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelStyle}>Google Review URL</label>
            <input value={form.google_review_url || ""} onChange={e => setForm(f => ({ ...f, google_review_url: e.target.value }))} style={inputStyle} placeholder="https://g.page/your-business/review" />
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>About Your Business</label>
          <textarea value={form.description || ""} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={4} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }} placeholder="Tell residents what makes your business special..." />
        </div>

        <div style={{ ...sectionHead }}>Section 2 — Services You Offer</div>
        <div style={{ marginBottom: 20 }}>
          <SvcAccordion selSvcs={selSvcs} setSelSvcs={setSelSvcs} />
          {selSvcs.length > 0 && <div style={{ marginTop: 8, fontSize: 12, color: TEAL, fontStyle: "italic" }}>✓ {selSvcs.length} service{selSvcs.length > 1 ? "s" : ""} selected</div>}
        </div>

        <div style={{ ...sectionHead }}>Section 3 — Villages You Serve</div>
        <div style={{ marginBottom: 24 }}>
          <VillageSelect selAreas={selAreas} setSelAreas={setSelAreas} />
        </div>

        <div style={{ textAlign: "center", borderTop: `2px solid ${INK}`, paddingTop: 20 }}>
          {saveMsg && <div style={{ fontSize: 13, color: saveMsg.startsWith("✓") ? GREEN : RED_RULE, fontStyle: "italic", marginBottom: 12 }}>{saveMsg}</div>}
          <button onClick={handleSave} disabled={saving} style={{
            background: saving ? PAPER_DK : `linear-gradient(180deg,#9A6030,${BROWN_BTN} 60%,#5A3010)`,
            color: PAPER, border: `3px solid ${YELLOW}`, boxShadow: `0 0 0 1.5px ${YELLOW}, 0 0 12px 3px rgba(255,220,0,0.3)`,
            borderRadius: 6, padding: "14px 48px", fontSize: 15, fontWeight: 900, cursor: saving ? "not-allowed" : "pointer",
            fontFamily: "'Times New Roman', serif", letterSpacing: 3, textTransform: "uppercase",
          }}>
            {saving ? "Saving…" : "Save Changes →"}
          </button>
          <div style={{ fontSize: 11, color: INK_FADE, fontStyle: "italic", marginTop: 8 }}>Changes go live immediately on your V-Hub listing.</div>
        </div>
      </div>
    </div>
  );

  // ── DASHBOARD VIEW ────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: PAPER, backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 27px,rgba(28,15,0,0.03) 27px,rgba(28,15,0,0.03) 28px)", fontFamily: "'Times New Roman', Georgia, serif" }}>

      {/* Header */}
      <div style={{ background: INK, padding: "10px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <a href="/" style={{ textDecoration: "none" }}>
          <button style={{ background: "rgba(255,255,255,0.1)", border: `1.5px solid ${PAPER_DK}`, color: PAPER, borderRadius: 6, padding: "7px 14px", fontSize: 13, cursor: "pointer", fontWeight: 700 }}>← Home</button>
        </a>
        <div style={{ color: PAPER, fontSize: 20, fontWeight: 900, letterSpacing: 1 }}>🌴 Provider Hub</div>
        <button onClick={() => setView("edit")} style={{ background: `linear-gradient(180deg,#9A6030,${BROWN_BTN})`, color: PAPER, border: `2px solid ${YELLOW}`, borderRadius: 6, padding: "7px 14px", fontSize: 12, cursor: "pointer", fontWeight: 700, letterSpacing: 1 }}>✏ Edit Profile</button>
      </div>

      {/* Masthead */}
      <div style={{ textAlign: "center", padding: "16px 20px 12px", borderBottom: `3px double ${INK}` }}>
        <div style={{ fontSize: 9, letterSpacing: 5, textTransform: "uppercase", color: INK_FADE, fontStyle: "italic", marginBottom: 2 }}>Provider Dashboard</div>
        <div style={{ fontSize: 26, fontWeight: 900, color: INK }}>{provider.business_name}</div>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, marginTop: 4, flexWrap: "wrap" }}>
          {provider.vh_number && (
            <span style={{ background: BROWN_BTN, color: PAPER, borderRadius: 20, padding: "3px 14px", fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>
              {provider.vh_number}
            </span>
          )}
          <span style={{ fontSize: 12, color: INK_FADE, fontStyle: "italic" }}>
            {provider.subscription_status === "active" ? "✅ Active Listing"
              : provider.subscription_status === "trial" ? "🕐 Trial Active"
              : provider.subscription_status === "pending" ? "⏳ Pending Approval"
              : provider.subscription_status === "trial_expired" ? "⚠ Trial Expired"
              : provider.subscription_status || ""}
          </span>
        </div>
        {saveMsg && <div style={{ marginTop: 8, fontSize: 13, color: saveMsg.startsWith("✓") ? GREEN : RED_RULE, fontStyle: "italic" }}>{saveMsg}</div>}
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "20px 16px 60px" }}>

        {/* Trial banner */}
        <TrialBanner provider={provider} />

        {/* Stats */}
        <div style={{ ...sectionHead }}>Your Performance</div>
        <div style={{ display: "flex", gap: 10, marginBottom: 28, flexWrap: "wrap" }}>
          {[
            { icon: "👁", value: provider.profile_views || 0, label: "Profile Views", sub: "Total customer clicks", color: TEAL },
            { icon: "🔍", value: provider.search_appearances || 0, label: "Search Appearances", sub: "Times shown in results", color: BROWN_BTN },
            { icon: "⭐", value: avgRating ? `${avgRating}/5` : "—", label: "V-Hub Rating", sub: reviews.length > 0 ? `${reviews.length} review${reviews.length > 1 ? "s" : ""}` : "No reviews yet", color: avgRating >= 4 ? GREEN : RED_RULE },
            { icon: "📋", value: reviews.length, label: "Reviews", sub: "Approved reviews", color: "#6B3010" },
          ].map(s => (
            <div key={s.label} style={{ background: PAPER_MID, border: `1.5px solid ${PAPER_DK}`, borderRadius: 6, padding: "14px 16px", textAlign: "center", flex: 1, minWidth: 110 }}>
              <div style={{ fontSize: 22 }}>{s.icon}</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: s.color, lineHeight: 1.1 }}>{s.value}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: INK, textTransform: "uppercase", letterSpacing: 1, marginTop: 2 }}>{s.label}</div>
              <div style={{ fontSize: 10, color: INK_FADE, fontStyle: "italic", marginTop: 2 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Profile summary */}
        <div style={{ ...sectionHead }}>Your Listing Profile</div>
        <div style={{ background: PAPER_MID, border: `1.5px solid ${PAPER_DK}`, borderRadius: 6, padding: "16px 18px", marginBottom: 28 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 20px" }}>
            {[
              ["👤 Owner", provider.owner_name],
              ["📞 Phone", provider.phone],
              ["✉️ Email", provider.email],
              ["🌐 Website", provider.website],
              ["📍 Address", provider.address],
              ["📅 Years in Business", provider.years_in_business ? `${provider.years_in_business} yrs` : null],
              ["🏷 License #", provider.license_number],
            ].filter(([, v]) => v).map(([label, value]) => (
              <div key={label} style={{ fontSize: 13, color: INK }}>
                <span style={{ fontWeight: 700 }}>{label}: </span>
                {label.includes("Website") ? <a href={value} target="_blank" rel="noreferrer" style={{ color: TEAL }}>{value}</a> : value}
              </div>
            ))}
          </div>
          {provider.description && (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${PAPER_DK}`, fontSize: 13, color: INK_FADE, fontStyle: "italic", lineHeight: 1.7 }}>
              {provider.description}
            </div>
          )}
        </div>

        {/* Services */}
        {provider.services?.length > 0 && (
          <>
            <div style={{ ...sectionHead }}>Services Offered</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 28 }}>
              {provider.services.map(s => (
                <span key={s} style={{ background: BROWN_BTN, color: PAPER, borderRadius: 20, padding: "4px 14px", fontSize: 12 }}>{s}</span>
              ))}
            </div>
          </>
        )}

        {/* Villages */}
        {provider.service_areas?.length > 0 && (
          <>
            <div style={{ ...sectionHead }}>Villages Served</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 28 }}>
              {provider.service_areas.map(a => (
                <span key={a} style={{ background: TEAL, color: "#fff", borderRadius: 20, padding: "4px 12px", fontSize: 12 }}>📍 {a}</span>
              ))}
            </div>
          </>
        )}

        {/* Reviews */}
        <div style={{ ...sectionHead }}>
          V-Hub Community Reviews
          {!showReviewForm && !reviewSaved && (
            <button onClick={() => setShowReviewForm(true)} style={{ float: "right", background: BROWN_BTN, color: PAPER, border: "none", borderRadius: 4, padding: "4px 12px", fontSize: 11, cursor: "pointer", fontWeight: 700, letterSpacing: 1 }}>
              + Leave a Review
            </button>
          )}
        </div>

        {showReviewForm && (
          <div style={{ background: PAPER_MID, border: `1.5px solid ${PAPER_DK}`, borderRadius: 6, padding: "16px 18px", marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 900, color: INK, marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>Write a V-Hub Review</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 16px", marginBottom: 10 }}>
              <div><label style={labelStyle}>Your Name *</label><input style={inputStyle} value={reviewForm.customer_name} onChange={e => setReviewForm(p => ({ ...p, customer_name: e.target.value }))} /></div>
              <div><label style={labelStyle}>Your Village</label><input style={inputStyle} value={reviewForm.customer_village} onChange={e => setReviewForm(p => ({ ...p, customer_village: e.target.value }))} /></div>
              <div><label style={labelStyle}>Service Used</label><input style={inputStyle} value={reviewForm.service_used} onChange={e => setReviewForm(p => ({ ...p, service_used: e.target.value }))} /></div>
              <div>
                <label style={labelStyle}>Rating</label>
                <select style={inputStyle} value={reviewForm.rating} onChange={e => setReviewForm(p => ({ ...p, rating: parseInt(e.target.value) }))}>
                  {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} Star{n > 1 ? "s" : ""} {"★".repeat(n)}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Your Review *</label>
              <textarea style={{ ...inputStyle, minHeight: 80, resize: "vertical", lineHeight: 1.6 }} value={reviewForm.review_text} onChange={e => setReviewForm(p => ({ ...p, review_text: e.target.value }))} />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={handleReviewSubmit} style={{ background: `linear-gradient(180deg,#9A6030,${BROWN_BTN})`, color: PAPER, border: `2px solid ${YELLOW}`, borderRadius: 5, padding: "10px 24px", fontSize: 13, fontWeight: 700, cursor: "pointer", letterSpacing: 1 }}>Submit Review</button>
              <button onClick={() => setShowReviewForm(false)} style={{ background: PAPER, border: `1.5px solid ${PAPER_DK}`, color: INK_FADE, borderRadius: 5, padding: "10px 18px", fontSize: 13, cursor: "pointer" }}>Cancel</button>
            </div>
            <div style={{ fontSize: 11, color: INK_FADE, fontStyle: "italic", marginTop: 8 }}>Reviews are reviewed by admin before appearing publicly.</div>
          </div>
        )}

        {reviewSaved && (
          <div style={{ background: "#E8F5E9", border: `1.5px solid ${GREEN}`, borderRadius: 6, padding: "12px 16px", marginBottom: 16, fontSize: 13, color: GREEN, fontStyle: "italic" }}>
            ✓ Thank you! Your review has been submitted and will appear after approval.
          </div>
        )}

        {reviews.length === 0 && !showReviewForm && (
          <div style={{ fontSize: 13, color: INK_FADE, fontStyle: "italic", marginBottom: 20, padding: "12px 0" }}>No V-Hub reviews yet — be the first to leave one!</div>
        )}

        {reviews.map(r => (
          <div key={r.id} style={{ background: PAPER_MID, border: `1.5px solid ${PAPER_DK}`, borderRadius: 6, padding: "14px 16px", marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
              <div>
                <span style={{ fontSize: 14, fontWeight: 900, color: INK }}>{r.customer_name}</span>
                {r.customer_village && <span style={{ fontSize: 12, color: INK_FADE, fontStyle: "italic", marginLeft: 8 }}>📍 {r.customer_village}</span>}
              </div>
              <Stars rating={r.rating} size={15} />
            </div>
            {r.service_used && <div style={{ fontSize: 11, color: TEAL, fontWeight: 700, marginBottom: 5, textTransform: "uppercase", letterSpacing: 1 }}>Service: {r.service_used}</div>}
            <div style={{ fontSize: 13, color: INK_FADE, fontStyle: "italic", lineHeight: 1.7 }}>&ldquo;{r.review_text}&rdquo;</div>
            <div style={{ fontSize: 10, color: INK_FADE, marginTop: 6 }}>
              {new Date(r.created_date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} · V-Hub Verified Review
            </div>
          </div>
        ))}

        {/* Edit CTA */}
        <div style={{ textAlign: "center", marginTop: 20, paddingTop: 16, borderTop: `2px solid ${INK}` }}>
          <button onClick={() => setView("edit")} style={{
            background: `linear-gradient(180deg,#9A6030,${BROWN_BTN} 60%,#5A3010)`, color: PAPER,
            border: `3px solid ${YELLOW}`, boxShadow: `0 0 0 1.5px ${YELLOW}, 0 0 12px 3px rgba(255,220,0,0.25)`,
            borderRadius: 6, padding: "13px 40px", fontSize: 14, fontWeight: 900, cursor: "pointer",
            fontFamily: "'Times New Roman', serif", letterSpacing: 2, textTransform: "uppercase",
          }}>
            ✏ Edit My Profile →
          </button>
        </div>

      </div>
    </div>
  );
}
