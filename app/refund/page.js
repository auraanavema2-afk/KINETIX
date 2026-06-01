import Link from "next/link"

export const metadata = { title: "Refund Policy" }

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
  box:     { background: "rgba(0,212,255,0.04)", border: "1px solid rgba(0,212,255,0.12)", borderRadius: "10px", padding: "18px 22px", margin: "16px 0 24px" },
}

export default function RefundPage() {
  return (
    <div style={S.page}>
      <div style={S.inner}>
        <nav style={S.nav}>
          <Link href="/" style={S.back}>← The Kaizen</Link>
          <span style={S.brand}>KAIZEN</span>
        </nav>

        <h1 style={S.h1}>Refund Policy</h1>
        <span style={S.date}>Effective date: June 1, 2026</span>

        <p style={S.p}>
          We want you to feel confident purchasing a subscription to The Kaizen.
          This Policy explains when you can request a refund and how to do so.
        </p>

        <hr style={S.divider} />

        <h2 style={S.h2}>7-Day Money-Back Guarantee</h2>
        <div style={S.box}>
          <p style={{ ...S.p, color: "white", margin: 0 }}>
            If you are not satisfied with your subscription for any reason,
            you may request a full refund within <strong>7 days</strong> of
            your initial purchase or annual renewal date. No questions asked.
          </p>
        </div>
        <p style={S.p}>
          Refund requests made after 7 days of the purchase date will not be
          eligible under this guarantee, except in the cases described below.
        </p>

        <h2 style={S.h2}>Plan Upgrades</h2>
        <p style={S.p}>
          When you upgrade to a higher plan mid-cycle, you will be charged only
          the prorated difference for the remaining period. The previous plan
          amount is not refunded.
        </p>

        <h2 style={S.h2}>Technical Failures</h2>
        <p style={S.p}>
          If you experience a significant service outage or technical failure
          that prevents you from using the Platform for more than 24 consecutive
          hours, and we are unable to resolve it, you may be eligible for a
          prorated credit or refund at our discretion. Please contact us with
          details of the issue.
        </p>

        <h2 style={S.h2}>Annual Subscriptions</h2>
        <p style={S.p}>
          Annual subscriptions qualify for the 7-day money-back guarantee.
          After 7 days, annual subscriptions are non-refundable. You may cancel
          at any time to prevent renewal at the end of the annual term.
        </p>

        <h2 style={S.h2}>How to Request a Refund</h2>
        <p style={S.p}>
          Email us at{" "}
          <a href="mailto:support@thekaizen.ai" style={S.email}>support@thekaizen.ai</a>{" "}
          with the subject line <strong style={{ color: "white" }}>Refund Request</strong>.
          Include your registered email address and the date of purchase. We aim
          to process all refund requests within 5 business days. Refunds are
          returned to the original payment method.
        </p>

        <h2 style={S.h2}>Free Plan</h2>
        <p style={S.p}>
          The Spark free plan does not involve any payment and is therefore not
          subject to this Policy.
        </p>

        <hr style={S.divider} />

        <h2 style={S.h2}>Contact</h2>
        <p style={S.p}>
          Refund questions?{" "}
          <a href="mailto:support@thekaizen.ai" style={S.email}>support@thekaizen.ai</a>
        </p>

        <p style={{ ...S.p, marginTop: "40px" }}>
          <Link href="/terms" style={S.email}>Terms of Service</Link>
          {" · "}
          <Link href="/privacy" style={S.email}>Privacy Policy</Link>
        </p>
      </div>
    </div>
  )
}
