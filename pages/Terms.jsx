// CACHE-BUST-1776573078
// build-1776538683 
import React from "react";

const PARCHMENT = "#F5E8CC";
const INK = "#1A0A00";
const INK_FADE = "#7a5c3c";
const BROWN = "#8B4513";

const T = {
  serif: "Georgia, 'Times New Roman', serif",
  sans: "'Helvetica Neue', Arial, sans-serif",
};

export default function Terms() {
  return (
    <div style={{ background: PARCHMENT, minHeight: "100vh", fontFamily: T.serif }}>
      {/* Header */}
      <div style={{ background: INK, padding: "16px 24px", display: "flex", alignItems: "center", gap: 16 }}>
        <a href="/" style={{ textDecoration: "none" }}><button style={{ background: "linear-gradient(180deg,#9A6030,#7A4820 60%,#5A3010)", border: "2px solid #1B3D6F", borderRadius: 4, color: "#F5E8CC", fontFamily: T.sans, fontWeight: 700, fontSize: 13, padding: "8px 16px", cursor: "pointer", whiteSpace: "nowrap" }}>« Home</button></a>
        <div style={{ flex: 1, textAlign: "center" }}>
          <img src="https://media.base44.com/images/public/69d062aca815ce8e697894b1/a9af95bc3_V-Hublogo.png" style={{ height: 48, borderRadius: 8 }} alt="V-Hub" />
        </div>
        <div style={{ width: 80 }} />
      </div>

      {/* Content */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "32px 24px 60px" }}>
        <div style={{ borderBottom: `3px double ${BROWN}`, paddingBottom: 12, marginBottom: 28 }}>
          <div style={{ fontSize: 26, fontWeight: 900, color: INK, letterSpacing: 2, textAlign: "center", textTransform: "uppercase" }}>Terms of Service</div>
          <div style={{ fontSize: 13, color: INK_FADE, textAlign: "center", marginTop: 6, fontStyle: "italic" }}>V-Hub · The Villages, Florida · Last updated: April 2026</div>
        </div>

        {[
          {
            title: "1. About V-Hub",
            body: `V-Hub is a local business directory serving residents of The Villages, Florida. Our platform allows local service providers to list their businesses and allows residents to discover and contact those providers. V-Hub is a discovery platform — we do not facilitate transactions, take commissions, or act as an agent or intermediary between you and any provider.`
          },
          {
            title: "2. Acceptance of Terms",
            body: `By accessing or using the V-Hub website (v-hub.us), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the site. These terms apply to all visitors, service providers, and anyone who accesses or uses our services.`
          },
          {
            title: "3. Provider Listings",
            body: `Service providers who submit a listing agree to provide accurate, truthful information about their business. V-Hub reviews all submissions before publishing, but we do not independently verify licenses, insurance, certifications, or any other credentials. License numbers and certifications displayed are self-reported by the provider. V-Hub is not responsible for the quality, safety, or legality of any services offered by listed providers.`
          },
          {
            title: "4. No Endorsement",
            body: `Inclusion in the V-Hub directory does not constitute an endorsement, recommendation, or guarantee of any provider, their services, or their qualifications. Residents should conduct their own due diligence — including verifying licenses, checking references, and reviewing contracts — before hiring any service provider.`
          },
          {
            title: "5. Provider Subscriptions & Billing",
            body: `Provider listings are offered on a subscription basis at $12 per month following a 45-day trial period. Trial periods begin on the date of listing approval. After the trial, providers who do not subscribe will be removed from the directory. Subscriptions are billed monthly and may be cancelled at any time. Cancellation takes effect at the end of the current billing period. Refunds are not provided for partial billing periods. Pricing is subject to change with reasonable notice.`
          },
          {
            title: "6. User Conduct",
            body: `You agree not to use V-Hub for any unlawful purpose, to submit false or misleading information, to impersonate any person or business, to attempt to gain unauthorized access to any part of the platform, or to use automated tools to scrape or extract data from the site without permission.`
          },
          {
            title: "7. Intellectual Property",
            body: `All content on V-Hub — including the logo, design, text, and layout — is the property of V-Hub and may not be reproduced, copied, or used without express written permission. Provider-submitted content (business descriptions, photos, etc.) remains the property of the provider, but by submitting it, providers grant V-Hub a non-exclusive license to display it on the platform.`
          },
          {
            title: "8. Disclaimer of Warranties",
            body: `V-Hub is provided "as is" without warranties of any kind, express or implied. We do not guarantee that the site will be uninterrupted, error-free, or free of viruses. We do not warrant the accuracy or completeness of any provider information displayed on the platform.`
          },
          {
            title: "9. Limitation of Liability",
            body: `To the fullest extent permitted by law, V-Hub shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the platform or any services obtained through it. Our total liability to you for any claim shall not exceed the amount you paid to V-Hub in the three months prior to the claim.`
          },
          {
            title: "10. Reporting Concerns",
            body: `If you have a concern about a listed provider — including suspected fraud, misrepresentation, or any safety issue — please contact us directly at admin@v-hub.us. We review every report and act to protect community standards.`
          },
          {
            title: "11. Changes to Terms",
            body: `We reserve the right to update these Terms of Service at any time. Continued use of V-Hub after changes are posted constitutes your acceptance of the revised terms. We will notify active providers of material changes via email.`
          },
          {
            title: "12. Contact",
            body: `For questions about these terms, contact us at: admin@v-hub.us · V-Hub, The Villages, Florida`
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
        &copy; 2026 V-Hub · The Villages, Florida · <a href="/Privacy" style={{ color: "rgba(245,232,204,0.4)" }}>Privacy Policy</a>
      </div>
    </div>
  );
}
