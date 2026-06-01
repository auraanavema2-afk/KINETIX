import Link from "next/link"

export const metadata = { title: "Terms of Service" }

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

export default function TermsPage() {
  return (
    <div style={S.page}>
      <div style={S.inner}>
        <nav style={S.nav}>
          <Link href="/" style={S.back}>← The Kaizen</Link>
          <span style={S.brand}>KAIZEN</span>
        </nav>

        <h1 style={S.h1}>Terms of Service</h1>
        <span style={S.date}>Effective date: June 1, 2026</span>

        <p style={S.p}>
          Welcome to The Kaizen ("we", "us", "our"). By accessing or using
          thekaizen.vercel.app (the "Platform"), you agree to be bound by these
          Terms of Service. Please read them carefully before using the Platform.
        </p>

        <hr style={S.divider} />

        <h2 style={S.h2}>1. Eligibility</h2>
        <p style={S.p}>
          You must be at least 18 years old and capable of forming a legally
          binding agreement to use the Platform. By using the Platform you
          represent that you meet this requirement.
        </p>

        <h2 style={S.h2}>2. Account Registration</h2>
        <p style={S.p}>
          You are responsible for maintaining the confidentiality of your account
          credentials and for all activity that occurs under your account. Notify
          us immediately at{" "}
          <a href="mailto:support@thekaizen.ai" style={S.email}>support@thekaizen.ai</a>{" "}
          if you suspect unauthorised access.
        </p>

        <h2 style={S.h2}>3. Subscriptions and Payments</h2>
        <p style={S.p}>
          The Kaizen offers free and paid subscription plans. Paid subscriptions
          are billed monthly or annually in advance. All prices are listed in
          Indian Rupees (₹) and include applicable taxes. Subscriptions
          automatically renew unless cancelled before the renewal date.
        </p>
        <p style={S.p}>
          You may cancel your subscription at any time from your account settings.
          Cancellation takes effect at the end of the current billing period.
          Refunds are governed by our{" "}
          <Link href="/refund" style={S.email}>Refund Policy</Link>.
        </p>

        <h2 style={S.h2}>4. Acceptable Use</h2>
        <p style={S.p}>
          You agree not to use the Platform to: (a) violate any applicable law or
          regulation; (b) infringe the intellectual property rights of any third
          party; (c) transmit harmful, harassing, defamatory, or fraudulent content;
          (d) attempt to gain unauthorised access to the Platform or its
          infrastructure; or (e) use automated means to scrape or extract content
          without permission.
        </p>

        <h2 style={S.h2}>5. AI-Generated Content</h2>
        <p style={S.p}>
          The Kaizen uses large language models to generate responses. AI output
          may occasionally be inaccurate, incomplete, or misleading. You are
          responsible for verifying any information before relying on it for
          important decisions. We do not guarantee the accuracy or fitness for
          purpose of any AI-generated content.
        </p>

        <h2 style={S.h2}>6. Intellectual Property</h2>
        <p style={S.p}>
          You retain ownership of any content you submit to the Platform. By
          submitting content you grant us a limited, non-exclusive licence to
          process it solely to provide the service. The Platform, its design, code,
          and brand are the exclusive property of The Kaizen.
        </p>

        <h2 style={S.h2}>7. Limitation of Liability</h2>
        <p style={S.p}>
          To the maximum extent permitted by applicable law, The Kaizen shall not
          be liable for any indirect, incidental, special, or consequential damages
          arising from your use of the Platform. Our total liability to you shall
          not exceed the amount you paid us in the three months preceding the claim.
        </p>

        <h2 style={S.h2}>8. Termination</h2>
        <p style={S.p}>
          We reserve the right to suspend or terminate your account if you violate
          these Terms. You may delete your account at any time from the settings
          page.
        </p>

        <h2 style={S.h2}>9. Changes to These Terms</h2>
        <p style={S.p}>
          We may update these Terms from time to time. Continued use of the
          Platform after changes are posted constitutes acceptance of the updated
          Terms. We will notify active users of material changes by email.
        </p>

        <h2 style={S.h2}>10. Governing Law</h2>
        <p style={S.p}>
          These Terms are governed by the laws of India. Any disputes shall be
          subject to the exclusive jurisdiction of the courts of India.
        </p>

        <hr style={S.divider} />

        <h2 style={S.h2}>Contact</h2>
        <p style={S.p}>
          Questions about these Terms?{" "}
          <a href="mailto:support@thekaizen.ai" style={S.email}>support@thekaizen.ai</a>
        </p>

        <p style={{ ...S.p, marginTop: "40px" }}>
          <Link href="/privacy" style={S.email}>Privacy Policy</Link>
          {" · "}
          <Link href="/refund" style={S.email}>Refund Policy</Link>
        </p>
      </div>
    </div>
  )
}
