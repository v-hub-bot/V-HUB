import React from "react";

const PARCHMENT = "#F5E8CC";
const INK = "#1A0A00";
const INK_FADE = "#7a5c3c";
const BROWN = "#8B4513";

const T = {
  serif: "Georgia, 'Times New Roman', serif",
  sans: "'Helvetica Neue', Arial, sans-serif",
};

export default function Privacy() {
  return (
    <div style={{ background: PARCHMENT, minHeight: "100vh", fontFamily: T.serif }}>
      {/* Header */}
      <div style={{ background: INK, padding: "16px 24px", display: "flex", alignItems: "center", gap: 16 }}>
        <a href="/" style={{ color: "#C9973A", textDecoration: "none", fontSize: 13, fontFamily: T.sans }}>← Back to V-Hub</a>
        <div style={{ flex: 1, textAlign: "center" }}>
          <img src="https://media.base44.com/images/public/69d062aca815ce8e697894b1/a9af95bc3_V-Hublogo.png" style={{ height: 48, borderRadius: 8 }} alt="V-Hub" />
        </div>
        <div style={{ width: 80 }} />
      </div>

      {/* Content */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "32px 24px 60px" }}>
        <div style={{ borderBottom: `3px double ${BROWN}`, paddingBottom: 12, marginBottom: 28 }}>
          <div style={{ fontSize: 26, fontWeight: 900, color: INK, letterSpacing: 2, textAlign: "center", textTransform: "uppercase" }}>Privacy Policy</div>
          <div style={{ fontSize: 13, color: INK_FADE, textAlign: "center", marginTop: 6, fontStyle: "italic" }}>V-Hub · The Villages, Florida · Last updated: April 2026</div>
        </div>

        {[
          {
            title: "1. Who We Are",
            body: `V-Hub (v-hub.us) is a local services directory for The Villages, Florida. We connect residents with local service providers. For questions about this policy, contact us at admin@v-hub.us.`
          },
          {
            title: "2. Information We Collect",
            body: `From service providers: business name, owner name, phone number, email address, business address, website, business description, license number, and payment information (processed securely by Stripe — we never store your full card details). From residents using the search: we do not require you to create an account or share personal information to search the directory. If you submit an inquiry to a provider, we collect your name, email, phone number, and message.`
          },
          {
            title: "3. How We Use Your Information",
            body: `We use provider information to create and display your directory listing. We use inquiry information to forward your message to the relevant provider. We use your email to send service-related communications such as listing approval, trial reminders, and billing notifications. We do not sell your personal information to third parties. We do not use your information for advertising profiling.`
          },
          {
            title: "4. Cookies & Tracking",
            body: `V-Hub uses minimal browser storage (sessionStorage) to keep you logged in to your Provider Hub during a session. This data is cleared when you close your browser. We do not use third-party advertising cookies or cross-site tracking technologies. We may use basic analytics to understand how the site is used (such as page visits) to improve our service.`
          },
          {
            title: "5. Data Sharing",
            body: `We share provider listing information (business name, phone, email, website, description) publicly on the V-Hub directory — this is the purpose of your listing. We use Stripe to process subscription payments. Stripe's privacy policy applies to data processed through their service. We do not share your personal information with any other third parties except as required by law.`
          },
          {
            title: "6. Data Retention",
            body: `We retain your information for as long as your provider account is active and for a reasonable period afterward in case of billing disputes or legal requirements. You may request deletion of your account and personal data by contacting admin@v-hub.us.`
          },
          {
            title: "7. Security",
            body: `We take reasonable measures to protect your information, including using HTTPS encryption for data transmission and secure cloud infrastructure. However, no online service can guarantee absolute security. Please use a strong, unique password for your Provider Hub account.`
          },
          {
            title: "8. Your Rights",
            body: `You have the right to access the personal information we hold about you, request corrections to inaccurate data, request deletion of your data, and opt out of non-essential communications. To exercise any of these rights, contact us at admin@v-hub.us.`
          },
          {
            title: "9. Children's Privacy",
            body: `V-Hub is not directed at children under 13. We do not knowingly collect personal information from children under 13. If you believe we have inadvertently collected such information, please contact us immediately.`
          },
          {
            title: "10. Changes to This Policy",
            body: `We may update this Privacy Policy from time to time. We will notify active providers of material changes via email. Continued use of V-Hub after changes are posted constitutes acceptance of the revised policy.`
          },
          {
            title: "11. Contact Us",
            body: `For any privacy-related questions or requests, please contact: admin@v-hub.us · V-Hub, The Villages, Florida`
          },
        ].map((s, i) => (
          <div key={i} style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: BROWN, marginBottom: 8, borderLeft: `3px solid ${BROWN}`, paddingLeft: 12 }}>{s.title}</div>
            <p style={{ fontSize: 14, color: INK, lineHeight: 1.8, margin: 0 }}>{s.body}</p>
          </div>
        ))}

        <div style={{ borderTop: `2px solid ${BROWN}`, paddingTop: 20, textAlign: "center", fontSize: 13, color: INK_FADE, fontStyle: "italic" }}>
          Questions? Email us at <a href="mailto:admin@v-hub.us" style={{ color: BROWN }}>admin@v-hub.us</a>
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: INK, padding: "12px 24px", textAlign: "center", fontSize: 11, color: "rgba(245,232,204,0.5)", fontFamily: T.sans }}>
        © 2026 V-Hub · The Villages, Florida · <a href="/Terms" style={{ color: "rgba(245,232,204,0.4)" }}>Terms of Service</a>
      </div>
    </div>
  );
}
