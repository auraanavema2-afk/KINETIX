"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import Link from "next/link"
import Image from "next/image"
import styles from "./Landing.module.css"

const FEATURES = [
  {
    emoji: "🧠",
    title: "Soul Memory",
    desc: "Answer five questions when you sign up. The Kaizen remembers everything and gets smarter about you every single day.",
  },
  {
    emoji: "💬",
    title: "Kaizen 4",
    desc: "The AI that actually knows you. Every conversation is personalised to your goals, obstacles, and context.",
  },
  {
    emoji: "🎯",
    title: "Mission Control",
    desc: "Set your big goal. Get three personalised actions every morning. Track your momentum as it compounds.",
  },
  {
    emoji: "⚡",
    title: "Pulse",
    desc: "A personalised morning briefing built from your soul data. What to focus on. What matters in your field. Every day.",
  },
  {
    emoji: "✦",
    title: "Kaizen Mint",
    desc: "Build apps, websites, and decks from a single text prompt. Type what you want. Kaizen 4 mints it into existence.",
  },
  {
    emoji: "🌌",
    title: "Kines",
    desc: "A marketplace of specialised AI agents built by the community. Browse, chat, create, and share your own Kines.",
  },
  {
    emoji: "🤝",
    title: "Kaizen Arena",
    desc: "Real-time collaboration with Kaizen 4 as your shared AI brain. Build together. Think together. Grow together.",
  },
  {
    emoji: "👤",
    title: "Legacy",
    desc: "Your automatic public portfolio. Every build, every goal, every Kine builds your Legacy profile. Share it anywhere.",
  },
]

const STEPS = [
  {
    num: "01",
    title: "Answer five questions",
    desc: "Tell The Kaizen who you are, what your big goal is, and what you are building. Takes two minutes.",
  },
  {
    num: "02",
    title: "Kaizen 4 learns you",
    desc: "Every conversation makes the AI smarter about you specifically. Your context is injected into every response.",
  },
  {
    num: "03",
    title: "You improve continuously",
    desc: "Daily actions, morning briefings, goal tracking, and a second brain that never forgets. Kaizen every day.",
  },
]

const PLANS = [
  { name: "Spark", price: "Free", model: "Kinet", color: "#505050" },
  { name: "Build", price: "₹1,999", model: "Kinet Pro", color: "#00d4ff" },
  { name: "Launch", price: "₹4,999", model: "Kinet Max", color: "#00d4ff", popular: true },
  { name: "Scale", price: "₹9,999", model: "Kinet 4", color: "#00d4ff" },
]

export default function LandingPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (!loading && user) {
      router.push("/pulse")
    }
  }, [user, loading, router])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  if (loading) {
    return (
      <div className={styles.loadingPage}>
        <div className={styles.loadingDot}></div>
        <div className={styles.loadingDot}></div>
        <div className={styles.loadingDot}></div>
      </div>
    )
  }

  if (user) return null

  return (
    <div className={styles.page}>

      <nav className={`${styles.nav} ${scrolled ? styles.navScrolled : ""}`}>
        <div className={styles.navInner}>
          <a href="/" className={styles.navBrand}>
            <Image
              src="/images/kaizen-icon.png"
              alt="The Kaizen"
              width={28}
              height={28}
              className={styles.navLogo}
              priority
            />
            <span className={styles.navName}>THE KAIZEN</span>
          </a>
          <div className={styles.navLinks}>
            <a href="#features" className={styles.navLink}>Features</a>
            <a href="#how" className={styles.navLink}>How it works</a>
            <a href="#pricing" className={styles.navLink}>Pricing</a>
          </div>
          <div className={styles.navActions}>
            <Link href="/auth" className={styles.signInBtn}>Sign in</Link>
            <Link href="/auth" className={styles.getStartedBtn}>
              Get started free →
            </Link>
          </div>
          <button
            className={styles.menuBtn}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
        {menuOpen && (
          <div className={styles.mobileMenu}>
            <a href="#features" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Features</a>
            <a href="#how" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>How it works</a>
            <a href="#pricing" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Pricing</a>
            <Link href="/auth" className={styles.mobileGetStarted}>Get started free →</Link>
          </div>
        )}
      </nav>

      <main>

      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <span className={styles.heroBadgeDot}></span>
            Now live — Join free today
          </div>
          <h1 className={styles.heroTitle}>
            The AI that actually
            <br />
            <span className={styles.heroAccent}>knows who you are</span>
          </h1>
          <p className={styles.heroSub}>
            Every other AI forgets you the moment you close it.
            The Kaizen learns you, remembers everything, and gets
            smarter about you specifically every single day.
            Built on the Japanese philosophy of continuous improvement.
          </p>
          <div className={styles.heroCTAs}>
            <Link href="/auth" className={styles.primaryCTA}>
              Start for free →
            </Link>
            <a href="#how" className={styles.secondaryCTA}>
              See how it works ↓
            </a>
          </div>
          <div className={styles.heroSocial}>
            <div className={styles.heroSocialItem}>
              <span className={styles.heroSocialNum}>8</span>
              <span className={styles.heroSocialLabel}>AI features</span>
            </div>
            <div className={styles.heroSocialDivider}></div>
            <div className={styles.heroSocialItem}>
              <span className={styles.heroSocialNum}>100%</span>
              <span className={styles.heroSocialLabel}>Personalised</span>
            </div>
            <div className={styles.heroSocialDivider}></div>
            <div className={styles.heroSocialItem}>
              <span className={styles.heroSocialNum}>₹0</span>
              <span className={styles.heroSocialLabel}>To start</span>
            </div>
          </div>
        </div>
        <div className={styles.heroVisual}>
          <div className={styles.heroCard}>
            <div className={styles.heroCardHeader}>
              <Image
                src="/images/kaizen-icon.png"
                alt="Kaizen 4"
                width={32}
                height={32}
                className={styles.heroCardLogo}
                priority
              />
              <div>
                <div className={styles.heroCardTitle}>Kaizen 4</div>
                <div className={styles.heroCardSub}>Knows you personally</div>
              </div>
              <div className={styles.heroCardLive}>
                <span className={styles.liveDot}></span>
                Live
              </div>
            </div>
            <div className={styles.heroCardMsg}>
              Hey Vema. Based on your goal to launch
              The Kaizen by July 1, here are your three
              most important actions for today.
            </div>
            <div className={styles.heroCardActions}>
              <div className={styles.heroCardAction}>
                <span className={styles.actionNum}>1</span>
                <span>Complete the authentication system</span>
              </div>
              <div className={styles.heroCardAction}>
                <span className={styles.actionNum}>2</span>
                <span>Test the Stripe checkout flow</span>
              </div>
              <div className={styles.heroCardAction}>
                <span className={styles.actionNum}>3</span>
                <span>Write your Product Hunt description</span>
              </div>
            </div>
            <div className={styles.heroCardInput}>
              <span className={styles.heroCardPlaceholder}>
                Ask Kaizen 4 anything...
              </span>
              <div className={styles.heroCardSend}>↑</div>
            </div>
          </div>
          <div className={styles.heroGlow}></div>
        </div>
      </section>

      <section className={styles.marquee}>
        <div className={styles.marqueeTrack}>
          {["Soul Memory", "Kaizen 4", "Mission Control", "Pulse", "Kaizen Mint", "Kines", "Arena", "Legacy",
            "Soul Memory", "Kaizen 4", "Mission Control", "Pulse", "Kaizen Mint", "Kines", "Arena", "Legacy"].map((item, i) => (
            <span key={i} className={styles.marqueeItem}>
              {item} <span className={styles.marqueeDot}>✦</span>
            </span>
          ))}
        </div>
      </section>

      <section className={styles.problem}>
        <div className={styles.sectionInner}>
          <h2 className={styles.problemTitle}>
            Every AI tool has the same fatal flaw
          </h2>
          <div className={styles.problemGrid}>
            <div className={styles.problemCard}>
              <div className={styles.problemIcon}>😤</div>
              <h3>Starts from zero every time</h3>
              <p>You explain your context again. And again. And again. Every single conversation.</p>
            </div>
            <div className={styles.problemCard}>
              <div className={styles.problemIcon}>🤖</div>
              <h3>Generic responses for everyone</h3>
              <p>The same answer whether you are a student in India or a CEO in New York.</p>
            </div>
            <div className={styles.problemCard}>
              <div className={styles.problemIcon}>🗑️</div>
              <h3>Disposable conversations</h3>
              <p>Close the tab. Everything is gone. No memory. No growth. No continuity.</p>
            </div>
          </div>
          <div className={styles.problemSolution}>
            The Kaizen is built differently.
          </div>
        </div>
      </section>

      <section className={styles.features} id="features">
        <div className={styles.sectionInner}>
          <div className={styles.sectionLabel}>FEATURES</div>
          <h2 className={styles.sectionTitle}>
            Eight pillars of continuous improvement
          </h2>
          <p className={styles.sectionSub}>
            Every feature is connected. Your soul data flows into every conversation,
            every action, every build. The more you use it the more powerful it becomes.
          </p>
          <div className={styles.featuresGrid}>
            {FEATURES.map((feature, i) => (
              <div key={i} className={styles.featureCard}>
                <div className={styles.featureEmoji}>{feature.emoji}</div>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureDesc}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.how} id="how">
        <div className={styles.sectionInner}>
          <div className={styles.sectionLabel}>HOW IT WORKS</div>
          <h2 className={styles.sectionTitle}>
            Three steps to your second brain
          </h2>
          <div className={styles.stepsRow}>
            {STEPS.map((step, i) => (
              <div key={i} className={styles.stepCard}>
                <div className={styles.stepNum}>{step.num}</div>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDesc}>{step.desc}</p>
                {i < STEPS.length - 1 && (
                  <div className={styles.stepArrow}>→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.kaizen}>
        <div className={styles.sectionInner}>
          <div className={styles.kaizenCard}>
            <Image
              src="/images/kaizen-icon.png"
              alt="The Kaizen"
              width={64}
              height={64}
              className={styles.kaizenLogo}
            />
            <h2 className={styles.kaizenTitle}>What is Kaizen?</h2>
            <p className={styles.kaizenText}>
              改善 — Kaizen is a Japanese philosophy that means continuous improvement.
              The idea is simple — small daily improvements compound into massive transformation
              over time. One percent better every day. That is 37 times better in a year.
              The Kaizen is built on this principle. Your AI gets one percent smarter about
              you every single day.
            </p>
            <div className={styles.kaizenQuote}>
              &ldquo;Small daily progress is the path to massive results.&rdquo;
            </div>
          </div>
        </div>
      </section>

      <section className={styles.pricing} id="pricing">
        <div className={styles.sectionInner}>
          <div className={styles.sectionLabel}>PRICING</div>
          <h2 className={styles.sectionTitle}>
            Built for India. Priced in rupees.
          </h2>
          <p className={styles.sectionSub}>
            Start free. Upgrade when you are ready.
            All plans include the core Kaizen experience.
          </p>
          <div className={styles.pricingGrid}>
            {PLANS.map((plan, i) => (
              <div
                key={i}
                className={`${styles.planCard} ${plan.popular ? styles.planPopular : ""}`}
              >
                {plan.popular && (
                  <div className={styles.popularBadge}>Most Popular</div>
                )}
                <div className={styles.planName}>{plan.name}</div>
                <div className={styles.planModel}>{plan.model}</div>
                <div className={styles.planPrice}>
                  {plan.price === "Free" ? (
                    <span className={styles.planFree}>Free</span>
                  ) : (
                    <>
                      <span className={styles.planCurrency}>₹</span>
                      <span className={styles.planAmount}>
                        {plan.price.replace("₹", "")}
                      </span>
                      <span className={styles.planPer}>/mo</span>
                    </>
                  )}
                </div>
                <Link
                  href="/auth"
                  className={`${styles.planBtn} ${plan.popular ? styles.planBtnPopular : ""}`}
                >
                  {plan.price === "Free" ? "Start free" : `Get ${plan.name}`}
                </Link>
              </div>
            ))}
          </div>
          <div className={styles.pricingNote}>
            <Link href="/pricing" className={styles.pricingLink}>
              See full pricing and features →
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.finalCTA}>
        <div className={styles.sectionInner}>
          <div className={styles.finalCard}>
            <Image
              src="/images/kaizen-icon.png"
              alt="The Kaizen"
              width={56}
              height={56}
              className={styles.finalLogo}
            />
            <h2 className={styles.finalTitle}>
              Start your continuous improvement today
            </h2>
            <p className={styles.finalSub}>
              Join The Kaizen. Free forever for early users.
              The AI that knows you, remembers you, and grows with you.
            </p>
            <Link href="/auth" className={styles.finalBtn}>
              Get started free →
            </Link>
            <p className={styles.finalNote}>
              No credit card required · Free forever for early users
            </p>
          </div>
        </div>
      </section>

      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <Link href="/" className={styles.footerBrand}>
            <Image
              src="/images/kaizen-icon.png"
              alt="The Kaizen"
              width={20}
              height={20}
              className={styles.footerLogo}
            />
            <span className={styles.footerName}>THE KAIZEN</span>
          </Link>
          <div className={styles.footerLinks}>
            <Link href="/pricing" className={styles.footerLink}>Pricing</Link>
            <Link href="/terms" className={styles.footerLink}>Terms</Link>
            <Link href="/privacy" className={styles.footerLink}>Privacy</Link>
            <Link href="/refund" className={styles.footerLink}>Refund</Link>
            <a href="mailto:support@thekaizen.ai" className={styles.footerLink}>Support</a>
          </div>
          <div className={styles.footerRight}>
            <span className={styles.footerCopy}>
              © 2026 The Kaizen · Built with 改善
            </span>
          </div>
        </div>
      </footer>

    </div>
  )
}
