"use client"

import { useState } from "react"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import AppLayout from "@/components/layout/AppLayout"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { signOutUser } from "@/lib/auth"
import { PLAN_NAMES, PLAN_PRICES, KINET_MODELS, getLimit } from "@/lib/gates"
import styles from "./Settings.module.css"

export default function SettingsPage() {
  const { user, userDoc } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("billing")
  const [portalLoading, setPortalLoading] = useState(false)

  const plan = userDoc?.plan || "spark"
  const messageCount = userDoc?.messageCount || 0
  const messageLimit = getLimit(plan, "messages")

  const handlePortal = async () => {
    setPortalLoading(true)
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.uid }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch (err) {
      console.error(err)
    } finally {
      setPortalLoading(false)
    }
  }

  const handleSignOut = async () => {
    await signOutUser()
    router.push("/auth")
  }

  const TABS = [
    { key: "billing", label: "Billing" },
    { key: "account", label: "Account" },
  ]

  return (
    <ProtectedRoute>
      <AppLayout variant="default">
        <div className={styles.page}>
          <h1 className={styles.title}>Settings</h1>

          <div className={styles.tabs}>
            {TABS.map(tab => (
              <button
                key={tab.key}
                className={`${styles.tab} ${activeTab === tab.key ? styles.activeTab : ""}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "billing" && (
            <div className={styles.tabContent}>
              <div className={styles.planCard}>
                <div className={styles.planTop}>
                  <div>
                    <div className={styles.planLabel}>CURRENT PLAN</div>
                    <div className={styles.planName}>{PLAN_NAMES[plan] || PLAN_NAMES.spark}</div>
                    <div className={styles.planModel}>{KINET_MODELS[plan] || KINET_MODELS.spark}</div>
                  </div>
                  <div className={`${styles.planBadge} ${plan === "spark" ? styles.freeBadge : styles.paidBadge}`}>
                    {plan === "spark" ? "Free" : "Active"}
                  </div>
                </div>

                {messageLimit !== Infinity && (
                  <div className={styles.usageSection}>
                    <div className={styles.usageRow}>
                      <span className={styles.usageLabel}>Messages this month</span>
                      <span className={styles.usageCount}>{messageCount} / {messageLimit}</span>
                    </div>
                    <div className={styles.usageBar}>
                      <div
                        className={styles.usageFill}
                        style={{ width: `${Math.min(100, (messageCount / messageLimit) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {messageLimit === Infinity && (
                  <div className={styles.unlimitedBadge}>
                    ∞ Unlimited messages
                  </div>
                )}

                <div className={styles.planActions}>
                  {plan !== "spark" && (
                    <button
                      className={styles.portalBtn}
                      onClick={handlePortal}
                      disabled={portalLoading}
                    >
                      {portalLoading ? "Loading…" : "Manage Subscription"}
                    </button>
                  )}
                  <button
                    className={styles.upgradeBtn}
                    onClick={() => router.push("/pricing")}
                  >
                    {plan === "spark" ? "Upgrade Plan" : "Change Plan"} →
                  </button>
                </div>
              </div>

              <div className={styles.infoCard}>
                <h3 className={styles.infoTitle}>Plan Features</h3>
                <div className={styles.featureGrid}>
                  {[
                    { label: "Messages",     value: messageLimit === Infinity ? "Unlimited" : `${messageLimit}/mo` },
                    { label: "Projects",     value: getLimit(plan, "projects") === Infinity ? "Unlimited" : getLimit(plan, "projects") },
                    { label: "Agents",       value: getLimit(plan, "agents") === 0 ? "Not included" : getLimit(plan, "agents") === Infinity ? "Unlimited" : getLimit(plan, "agents") },
                    { label: "Studio Builds", value: getLimit(plan, "studioBuilds") === Infinity ? "Unlimited" : `${getLimit(plan, "studioBuilds")}/mo` },
                  ].map(item => (
                    <div key={item.label} className={styles.featureItem}>
                      <div className={styles.featureLabel}>{item.label}</div>
                      <div className={styles.featureValue}>{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "account" && (
            <div className={styles.tabContent}>
              <div className={styles.accountCard}>
                <div className={styles.avatarLarge}>
                  {user?.email?.[0]?.toUpperCase() || "K"}
                </div>
                <div className={styles.accountInfo}>
                  <div className={styles.accountName}>
                    {userDoc?.soul?.name || userDoc?.name || "Builder"}
                  </div>
                  <div className={styles.accountEmail}>{user?.email}</div>
                </div>
              </div>

              <div className={styles.dangerZone}>
                <button className={styles.signOutBtn} onClick={handleSignOut}>
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </AppLayout>
    </ProtectedRoute>
  )
}
