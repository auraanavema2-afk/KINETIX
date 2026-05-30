"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import AppLayout from "@/components/layout/AppLayout"
import { useAuth } from "@/context/AuthContext"
import { authenticatedFetch } from "@/lib/apiClient"
import styles from "./Pulse.module.css"

function SubscriptionToast() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [showToast, setShowToast] = useState(false)

  useEffect(() => {
    const success = searchParams.get("subscription")
    if (success === "success") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowToast(true)
      setTimeout(() => setShowToast(false), 4000)
      router.replace("/pulse")
    }
  }, [searchParams, router])

  if (!showToast) return null

  return (
    <div className={styles.subscriptionToast}>
      ✓ Plan upgraded successfully
    </div>
  )
}

export default function PulsePage() {
  const { userDoc } = useAuth()
  const [briefing, setBriefing] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const generateBriefing = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await authenticatedFetch("/api/pulse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          soulData: userDoc?.soul,
          soulMemory: userDoc?.soulMemory,
          messageCount: userDoc?.messageCount,
          streakDays: userDoc?.streakDays,
          lastActiveDate: userDoc?.lastActiveDate,
        })
      })
      if (!res.ok) throw new Error("Failed to generate briefing")
      const data = await res.json()
      setBriefing(data)
    } catch (err) {
      console.error(err)
      setError("Could not generate your Pulse briefing. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (userDoc) generateBriefing()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userDoc])

  return (
    <ProtectedRoute>
      <Suspense>
        <SubscriptionToast />
      </Suspense>
      <AppLayout variant="default">
        <div className={styles.page}>

          <div className={styles.header}>
            <div>
              <div className={styles.headerLabel}>DAILY BRIEFING</div>
              <h1 className={styles.title}>
                {briefing?.greeting || `Good morning, ${userDoc?.soul?.name?.split(" ")[0] || "Builder"}`}
              </h1>
            </div>
            <button
              className={styles.refreshBtn}
              onClick={generateBriefing}
              disabled={loading}
            >
              {loading ? "Generating..." : "↻ Refresh"}
            </button>
          </div>

          {error && (
            <div className={styles.errorCard}>
              <p>{error}</p>
              <button onClick={generateBriefing}>Try Again</button>
            </div>
          )}

          {loading && !briefing && (
            <div className={styles.loadingGrid}>
              {[1, 2, 3, 4].map(i => (
                <div key={i} className={styles.skeletonCard}></div>
              ))}
            </div>
          )}

          {briefing && (
            <div className={styles.grid}>

              <div className={styles.focusCard}>
                <div className={styles.cardLabel}>TODAY&apos;S FOCUS</div>
                <h2 className={styles.focusTitle}>{briefing.todayFocus?.title}</h2>
                <p className={styles.focusWhy}>{briefing.todayFocus?.why}</p>
                <div className={styles.focusAction}>
                  <span className={styles.actionIcon}>→</span>
                  {briefing.todayFocus?.action}
                </div>
              </div>

              <div className={styles.insightCard}>
                <div className={styles.cardLabel}>PERSONAL INSIGHT</div>
                <p className={styles.insightPattern}>{briefing.personalInsight?.pattern}</p>
                <p className={styles.insightSuggestion}>{briefing.personalInsight?.suggestion}</p>
              </div>

              <div className={styles.pulseCard}>
                <div className={styles.cardLabel}>INDUSTRY PULSE</div>
                <div className={styles.pulseList}>
                  {briefing.industryPulse?.map((item, i) => (
                    <div key={i} className={styles.pulseItem}>
                      <span className={styles.pulseIcon}>{item.icon}</span>
                      <div className={styles.pulseContent}>
                        <div className={styles.pulseItemTitle}>{item.title}</div>
                        <div className={styles.pulseItemSummary}>{item.summary}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.quoteCard}>
                <div className={styles.cardLabel}>TODAY&apos;S QUOTE</div>
                <blockquote className={styles.quote}>
                  &ldquo;{briefing.todayQuote}&rdquo;
                </blockquote>
              </div>

            </div>
          )}

        </div>
      </AppLayout>
    </ProtectedRoute>
  )
}
