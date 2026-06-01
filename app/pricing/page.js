"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { getActiveFestival, getDiscountedPrice } from "@/lib/festivals"
import { PLAN_NAMES, PLAN_PRICES, KINET_MODELS } from "@/lib/gates"
import { authenticatedFetch } from "@/lib/apiClient"
import AnimatedBackground from "@/components/ui/AnimatedBackground"
import styles from "./Pricing.module.css"

const PLANS = [
  {
    key: "spark",
    features: [
      { text: "50 messages per month",   included: true  },
      { text: "3 projects",              included: true  },
      { text: "Basic Studio access",     included: true  },
      { text: "Universe browsing",       included: true  },
      { text: "Agents",                  included: false },
      { text: "Structured Thinking",     included: false },
      { text: "Custom domain",           included: false },
    ],
  },
  {
    key: "build",
    features: [
      { text: "500 messages per month",  included: true  },
      { text: "Unlimited projects",      included: true  },
      { text: "Full Studio access",      included: true  },
      { text: "5 agents",               included: true  },
      { text: "Structured Thinking",     included: true  },
      { text: "Code export",             included: true  },
      { text: "Custom domain",           included: false },
    ],
  },
  {
    key: "pro",
    features: [
      { text: "Unlimited messages",      included: true  },
      { text: "Unlimited projects",      included: true  },
      { text: "25 agents",              included: true  },
      { text: "Unlimited builds",        included: true  },
      { text: "Custom domain",           included: true  },
      { text: "Priority support",        included: true  },
      { text: "White-label",             included: false },
    ],
  },
  {
    key: "max",
    features: [
      { text: "Everything unlimited",    included: true },
      { text: "Unlimited agents",        included: true },
      { text: "White-label export",      included: true },
      { text: "Custom domain",           included: true },
      { text: "API access",              included: true },
      { text: "Priority Kaizen 4",        included: true },
      { text: "Advanced analytics",      included: true },
    ],
  },
  {
    key: "enterprise",
    features: [
      { text: "Everything in Max",       included: true },
      { text: "10 team seats",           included: true },
      { text: "Team workspace",          included: true },
      { text: "Dedicated support",       included: true },
      { text: "Custom integrations",     included: true },
      { text: "SLA guarantee",           included: true },
      { text: "Invoice billing",         included: true },
    ],
  },
]

export default function PricingPage() {
  const { user, userDoc } = useAuth()
  const router = useRouter()
  const [annual, setAnnual] = useState(false)
  const [festival, setFestival] = useState(null)
  const [timeLeft, setTimeLeft] = useState("")
  const [loading, setLoading] = useState(null)
  const [promoCode, setPromoCode] = useState("")
  const [promoInput, setPromoInput] = useState("")

  useEffect(() => {
    const activeFestival = getActiveFestival()
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFestival(activeFestival)
  }, [])

  useEffect(() => {
    if (!festival) return
    const timer = setInterval(() => {
      const now = new Date()
      const diff = festival.endDate - now
      if (diff <= 0) { setFestival(null); clearInterval(timer); return }
      const days  = Math.floor(diff / 86400000)
      const hours = Math.floor((diff % 86400000) / 3600000)
      const mins  = Math.floor((diff % 3600000) / 60000)
      const secs  = Math.floor((diff % 60000) / 1000)
      setTimeLeft(
        days > 0
          ? `${days}d ${hours}h ${mins}m ${secs}s`
          : `${hours}h ${mins}m ${secs}s`
      )
    }, 1000)
    return () => clearInterval(timer)
  }, [festival])

  const getPrice = (planKey) => {
    const base = annual
      ? Math.round(PLAN_PRICES[planKey].annual / 12)
      : PLAN_PRICES[planKey].monthly
    if (festival && planKey !== "spark") {
      return getDiscountedPrice(base, festival.discount)
    }
    return base
  }

  const getOriginalPrice = (planKey) => {
    return annual
      ? Math.round(PLAN_PRICES[planKey].annual / 12)
      : PLAN_PRICES[planKey].monthly
  }

  const handleSubscribe = async (planKey) => {
    if (planKey === "spark") {
      if (!user) router.push("/auth")
      else router.push("/pulse")
      return
    }
    if (!user) { router.push("/auth"); return }

    setLoading(planKey)
    try {
      const priceEnvKey = annual ? "ANNUAL" : "MONTHLY"
      const priceId = process.env[`NEXT_PUBLIC_STRIPE_PRICE_${planKey.toUpperCase()}_${priceEnvKey}`]

      const res = await authenticatedFetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId,
          userId: user.uid,
          userEmail: user.email,
          promoCode: promoCode || undefined,
        }),
      })
      const data = await res.json()
      // eslint-disable-next-line react-hooks/immutability
      if (data.url) window.location.href = data.url
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(null)
    }
  }

  return (
    <>
      <AnimatedBackground variant="default" />
      <div className={styles.page}>

        <div style={{
          background: "rgba(0,212,255,0.08)",
          border: "1px solid rgba(0,212,255,0.2)",
          borderRadius: "12px",
          padding: "16px 24px",
          textAlign: "center",
          margin: "24px auto 0",
          maxWidth: "800px",
        }}>
          <div style={{
            fontSize: "12px",
            color: "#00d4ff",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: "6px",
          }}>
            Soft Launch Period
          </div>
          <div style={{
            fontSize: "15px",
            color: "white",
            fontWeight: 500,
            marginBottom: "4px",
          }}>
            All features FREE during launch
          </div>
          <div style={{
            fontSize: "12px",
            color: "#707070",
          }}>
            Pricing activates after July 31. Early users keep free access permanently.
          </div>
        </div>

        {festival && (
          <div className={styles.festivalBanner}>
            <span className={styles.festivalEmoji}>{festival.emoji}</span>
            <span className={styles.festivalText}>
              {festival.name} — {festival.discount}% off all plans
            </span>
            <span className={styles.festivalTimer}>{timeLeft}</span>
          </div>
        )}

        <div className={styles.nav}>
          <button className={styles.backBtn} onClick={() => router.push("/pulse")}>
            ← Back
          </button>
          <div className={styles.navBrand}>THE KAIZEN</div>
        </div>

        <div className={styles.hero}>
          <h1 className={styles.heroTitle}>Simple Pricing</h1>
          <p className={styles.heroSub}>Built for India. Priced in rupees. Pay only for what you need.</p>
        </div>

        <div className={styles.toggleRow}>
          <span className={`${styles.toggleLabel} ${!annual ? styles.active : ""}`}>Monthly</span>
          <button
            className={`${styles.toggle} ${annual ? styles.toggleOn : ""}`}
            onClick={() => setAnnual(!annual)}
            aria-label="Toggle annual billing"
          >
            <div className={styles.togglePill}>
              <div className={styles.toggleThumb}></div>
            </div>
          </button>
          <span className={`${styles.toggleLabel} ${annual ? styles.active : ""}`}>
            Annual
            <span className={styles.saveBadge}>2 months free</span>
          </span>
        </div>

        <div className={styles.plansGrid}>
          {PLANS.map((plan) => {
            const price = getPrice(plan.key)
            const originalPrice = getOriginalPrice(plan.key)
            const isDiscounted = festival && plan.key !== "spark" && price !== originalPrice
            const isCurrent = userDoc?.plan === plan.key
            const isPopular = plan.key === "pro"

            return (
              <div
                key={plan.key}
                className={`${styles.planCard} ${isPopular ? styles.popularCard : ""} ${isCurrent ? styles.currentCard : ""}`}
              >
                {isPopular && (
                  <div className={styles.popularBadge}>Most Popular</div>
                )}
                {isCurrent && (
                  <div className={styles.currentBadge}>Current Plan</div>
                )}

                <div className={styles.planHeader}>
                  <div className={styles.planName}>{PLAN_NAMES[plan.key]}</div>
                  <div className={styles.planModel}>{KINET_MODELS[plan.key]}</div>
                </div>

                <div className={styles.planPrice}>
                  {plan.key === "spark" ? (
                    <span className={styles.freePrice}>Free</span>
                  ) : (
                    <>
                      {isDiscounted && (
                        <span className={styles.originalPrice}>
                          ₹{originalPrice.toLocaleString("en-IN")}
                        </span>
                      )}
                      <div className={styles.priceRow}>
                        <span className={styles.currency}>₹</span>
                        <span className={styles.amount}>{price.toLocaleString("en-IN")}</span>
                        <span className={styles.period}>/mo</span>
                      </div>
                      {annual && (
                        <div className={styles.annualNote}>
                          ₹{PLAN_PRICES[plan.key].annual.toLocaleString("en-IN")} billed annually
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className={styles.featureList}>
                  {plan.features.map(f => (
                    <div key={f.text} className={styles.featureItem}>
                      <span className={f.included ? styles.checkYes : styles.checkNo}>
                        {f.included ? "✓" : "×"}
                      </span>
                      <span className={f.included ? styles.featureText : styles.featureTextNo}>
                        {f.text}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  className={`${styles.subscribeBtn} ${isPopular ? styles.featuredBtn : ""} ${isCurrent ? styles.currentBtn : ""}`}
                  onClick={() => handleSubscribe(plan.key)}
                  disabled={loading === plan.key || isCurrent}
                >
                  {loading === plan.key ? "Loading…" :
                   isCurrent ? "Current Plan" :
                   plan.key === "spark" ? "Get Started Free" :
                   `Get ${PLAN_NAMES[plan.key]}`}
                </button>
              </div>
            )
          })}
        </div>

        <div className={styles.promoSection}>
          <p className={styles.promoLabel}>Have a promo code?</p>
          <div className={styles.promoRow}>
            <input
              className={styles.promoInput}
              value={promoInput}
              onChange={e => setPromoInput(e.target.value.toUpperCase())}
              placeholder="Enter code"
            />
            <button
              className={styles.promoApply}
              onClick={() => setPromoCode(promoInput)}
            >
              Apply
            </button>
          </div>
          {promoCode && (
            <p className={styles.promoApplied}>✓ Code {promoCode} will be applied at checkout</p>
          )}
        </div>

        <div className={styles.footer}>
          <Link href="/terms" className={styles.footerLink}>Terms</Link>
          <Link href="/privacy" className={styles.footerLink}>Privacy</Link>
          <Link href="/refund" className={styles.footerLink}>Refund Policy</Link>
          <a href="mailto:support@thekaizen.ai" className={styles.footerLink}>support@thekaizen.ai</a>
        </div>
      </div>
    </>
  )
}
