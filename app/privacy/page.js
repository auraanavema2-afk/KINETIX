import Link from "next/link"

export const metadata = { title: "Privacy Policy" }

const S = {
  page:    { minHeight: "100vh", background: "#000000", padding: "60px 20px 80px" },
  inner:   { maxWidth: "700px", margin: "0 auto" },
  nav:     { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "48px" },
  back:    { color: "#505050", textDecoration: "none", fontSize: "13px" },
  brand:   { fontSize: "13px", fontWeight: 700, letterSpacing: "5px", color: "white" },
  h1:      { fontSize: "28px", fontWeight: 700, color: "white", margin: "0 0 8px" },
  date:    { fontSize: "13px", color: "#505050", marginBottom: "40px", display: "block" },
  h2:      { fontSize: "16px", fontWeight: 600, color: "white", margin: "32px 0 10px" },
  p:       { fontSize: "14px", color: "#707070", lineHeight: 1.75, margin: "0 0 14px" },
  divider: { border: "none", borderTop: "1px solid rgba(255,255,255,0.06)", margin: "40px 0" },
  email:   { color: "#00d4ff", textDecoration: "none" },
}

export default function PrivacyPage() {
  return (
    <div style={S.page}>
      <div style={S.inner}>
        <nav style={S.nav}>
          <Link href="/" style={S.back}>← The Kaizen</Link>
          <span style={S.brand}>KAIZEN</span>
        </nav>

        <h1 style={S.h1}>Privacy Policy</h1>
        <span style={S.date}>Effective date: June 1, 2026</span>

        <p style={S.p}>
          The Kaizen ("we", "us") is committed to protecting your privacy.
          This Policy explains how we collect, use, and safeguard information
          when you use thekaizen.vercel.app (the "Platform").
        </p>

        <hr style={S.divider} />

        <h2 style={S.h2}>1. Information We Collect</h2>
        <p style={S.p}>
          <strong style={{ color: "white" }}>Account data:</strong> When you
          register, we collect your email address and display name via Firebase
          Authentication. If you sign in with Google, we receive your Google
          profile information.
        </p>
        <p style={S.p}>
          <strong style={{ color: "white" }}>Usage data:</strong> We store the
          conversations, projects, Kines, and other content you create on the
          Platform in Firebase Firestore, linked to your user ID.
        </p>
        <p style={S.p}>
          <strong style={{ color: "white" }}>Payment data:</strong> Payments are
          processed by Stripe. We do not store full card details. We receive
          subscription status and transaction records from Stripe.
        </p>
        <p style={S.p}>
          <strong style={{ color: "white" }}>Technical data:</strong> We may
          collect standard server logs (IP address, browser type, pages visited)
          to maintain and improve the Platform.
        </p>

        <h2 style={S.h2}>2. How We Use Your Information</h2>
        <p style={S.p}>
          We use collected information to: provide and personalise the Platform;
          process payments and manage your subscription; send transactional
          emails (e.g. receipts, password resets); improve and debug the service;
          and comply with legal obligations.
        </p>
        <p style={S.p}>
          We do not sell, rent, or share your personal data with third parties
          for their marketing purposes.
        </p>

        <h2 style={S.h2}>3. Third-Party Services</h2>
        <p style={S.p}>
          The Platform uses the following third-party services, each governed
          by their own privacy policies:
        </p>
        <p style={S.p}>
          • <strong style={{ color: "white" }}>Firebase (Google)</strong> — authentication and data storage<br />
          • <strong style={{ color: "white" }}>Stripe</strong> — payment processing<br />
          • <strong style={{ color: "white" }}>Anthropic / OpenAI</strong> — AI model inference (prompts are not used for model training)<br />
          • <strong style={{ color: "white" }}>Vercel</strong> — hosting and edge delivery
        </p>

        <h2 style={S.h2}>4. Data Retention</h2>
        <p style={S.p}>
          We retain your data for as long as your account is active. If you
          delete your account, your personal data is removed within 30 days,
          except where we are required to retain it for legal or accounting
          purposes.
        </p>

        <h2 style={S.h2}>5. Cookies</h2>
        <p style={S.p}>
          We use essential cookies for authentication and session management.
          We do not use third-party advertising cookies.
        </p>

        <h2 style={S.h2}>6. Your Rights</h2>
        <p style={S.p}>
          You may request access to, correction of, or deletion of your personal
          data at any time by contacting us at{" "}
          <a href="mailto:support@thekaizen.ai" style={S.email}>support@thekaizen.ai</a>.
          You may also delete your account directly from the settings page.
        </p>

        <h2 style={S.h2}>7. Children</h2>
        <p style={S.p}>
          The Platform is not directed at children under 18. We do not knowingly
          collect personal data from minors.
        </p>

        <h2 style={S.h2}>8. Changes to This Policy</h2>
        <p style={S.p}>
          We may update this Policy periodically. We will notify active users of
          material changes by email. Continued use of the Platform after changes
          are posted constitutes acceptance.
        </p>

        <hr style={S.divider} />

        <h2 style={S.h2}>Contact</h2>
        <p style={S.p}>
          Privacy questions?{" "}
          <a href="mailto:support@thekaizen.ai" style={S.email}>support@thekaizen.ai</a>
        </p>

        <p style={{ ...S.p, marginTop: "40px" }}>
          <Link href="/terms" style={S.email}>Terms of Service</Link>
          {" · "}
          <Link href="/refund" style={S.email}>Refund Policy</Link>
        </p>
      </div>
    </div>
  )
}
