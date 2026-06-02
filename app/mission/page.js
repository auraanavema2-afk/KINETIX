"use client"

import { useState, useEffect } from "react"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import AppLayout from "@/components/layout/AppLayout"
import { useAuth } from "@/context/AuthContext"
import { authenticatedFetch } from "@/lib/apiClient"
import { useToast } from "@/components/ui/Toast"
import PageWrapper from "@/components/ui/PageWrapper"
import styles from "./Mission.module.css"

const PHASES = ["Planning", "Starting", "Building", "Launching", "Scaling"]

export default function MissionPage() {
  const { userDoc } = useAuth()
  const { success } = useToast()
  const [actions, setActions] = useState([])
  const [loadingActions, setLoadingActions] = useState(true)
  const [completedActions, setCompletedActions] = useState([])
  const [momentum, setMomentum] = useState(0)
  const [error, setError] = useState(null)

  const soul = userDoc?.soul
  const soulMemory = userDoc?.soulMemory || []
  const currentPhaseIndex = Math.min(
    Math.floor((userDoc?.messageCount || 0) / 20),
    4
  )
  const currentPhase = PHASES[currentPhaseIndex]

  const calculateMomentum = () => {
    const messageCount = userDoc?.messageCount || 0
    const memoryCount = userDoc?.soulMemory?.length || 0
    const score = Math.min(100, (messageCount * 2) + (memoryCount * 5))
    setMomentum(score)
  }

  const fetchActions = async () => {
    setLoadingActions(true)
    setError(null)
    try {
      const res = await authenticatedFetch("/api/mission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          soulData: userDoc?.soul,
          soulMemory: userDoc?.soulMemory,
          activityCount: userDoc?.messageCount,
          currentPhase,
        })
      })
      if (!res.ok) throw new Error("Failed to generate actions")
      const data = await res.json()
      setActions(data.actions || [])
      success("Daily actions refreshed")
    } catch (err) {
      console.error(err)
      setError("Could not load your daily actions. Please try again.")
      setActions([
        { action: "Review your main goal and write next steps", time: "10 min", priority: "high" },
        { action: "Work on your most important task", time: "1 hour", priority: "high" },
        { action: "Reflect and plan tomorrow", time: "15 min", priority: "medium" },
      ])
    } finally {
      setLoadingActions(false)
    }
  }

  useEffect(() => {
    if (userDoc) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchActions()
      calculateMomentum()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userDoc])

  const toggleAction = (index) => {
    setCompletedActions(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    )
  }

  const circumference = 2 * Math.PI * 40
  const dashOffset = circumference - (momentum / 100) * circumference

  return (
    <ProtectedRoute>
      <AppLayout imageSrc="/images/backgrounds/mission-bg.jpg" imageOpacity={0.80}>
        <PageWrapper maxWidth="900px" padding="32px 36px">
          <div className={styles.header}>
            <div>
              <h1 className={styles.title}>Mission Control</h1>
              <p className={styles.subtitle}>
                {soul?.name ? `Welcome back, ${soul.name.split(' ')[0]}` : "Your goal tracking hub"}
              </p>
            </div>
            <button className={styles.refreshBtn} onClick={fetchActions}>
              ↻ Refresh
            </button>
          </div>

          <div className={styles.grid}>
            <div className={styles.goalCard}>
              <div className={styles.cardLabel}>CURRENT GOAL</div>
              <p className={styles.goalText}>
                {soul?.bigGoal || "Set your goal in Soul Setup"}
              </p>
              <div className={styles.phaseRow}>
                <div className={styles.phaseBadge}>{currentPhase}</div>
                <div className={styles.phaseTrack}>
                  {PHASES.map((phase, i) => (
                    <div
                      key={phase}
                      className={`${styles.phaseStep} ${i <= currentPhaseIndex ? styles.phaseActive : ''}`}
                    ></div>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.momentumCard}>
              <div className={styles.cardLabel}>MOMENTUM</div>
              <div className={styles.momentumCircle}>
                <svg width="100" height="100" viewBox="0 0 100 100">
                  <circle
                    cx="50" cy="50" r="40"
                    fill="none"
                    stroke="rgba(0,212,255,0.08)"
                    strokeWidth="6"
                  />
                  <circle
                    cx="50" cy="50" r="40"
                    fill="none"
                    stroke="#00d4ff"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                    transform="rotate(-90 50 50)"
                    style={{
                      filter: "drop-shadow(0 0 6px rgba(0,212,255,0.8))",
                      transition: "stroke-dashoffset 1s ease"
                    }}
                  />
                </svg>
                <div className={styles.momentumScore}>
                  <span className={styles.momentumNum}>{momentum}</span>
                  <span className={styles.momentumPct}>%</span>
                </div>
              </div>
              <p className={styles.momentumLabel}>
                {momentum < 30 ? "Just getting started" :
                 momentum < 60 ? "Building momentum" :
                 momentum < 80 ? "Strong momentum" : "Peak momentum"}
              </p>
            </div>

            <div className={styles.statsCard}>
              <div className={styles.cardLabel}>ACTIVITY</div>
              <div className={styles.statsRow}>
                <div className={styles.stat}>
                  <div className={styles.statNum}>{userDoc?.messageCount || 0}</div>
                  <div className={styles.statLabel}>Messages</div>
                </div>
                <div className={styles.statDivider}></div>
                <div className={styles.stat}>
                  <div className={styles.statNum}>{soulMemory.length}</div>
                  <div className={styles.statLabel}>Memories</div>
                </div>
                <div className={styles.statDivider}></div>
                <div className={styles.stat}>
                  <div className={styles.statNum}>{currentPhaseIndex + 1}</div>
                  <div className={styles.statLabel}>Phase</div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.actionsSection}>
            <div className={styles.actionsHeader}>
              <h2 className={styles.actionsTitle}>Today&apos;s Actions</h2>
              <span className={styles.actionsCount}>
                {completedActions.length} / {actions.length} done
              </span>
            </div>
            {error && (
              <div style={{
                background: "rgba(255,68,68,0.06)",
                border: "1px solid rgba(255,68,68,0.15)",
                borderRadius: "10px",
                padding: "10px 16px",
                color: "#ff6b6b",
                fontSize: "13px",
                marginBottom: "12px",
              }}>
                {error}
              </div>
            )}
            <div className={styles.actionsList}>
              {loadingActions ? (
                [1, 2, 3].map(i => (
                  <div key={i} className={styles.actionSkeleton}></div>
                ))
              ) : (
                actions.map((action, i) => (
                  <div
                    key={i}
                    className={`${styles.actionCard} ${completedActions.includes(i) ? styles.actionDone : ''}`}
                    onClick={() => toggleAction(i)}
                  >
                    <div className={styles.actionCheck}>
                      {completedActions.includes(i) ? "✓" : i + 1}
                    </div>
                    <div className={styles.actionContent}>
                      <p className={styles.actionText}>{action.action}</p>
                      <div className={styles.actionMeta}>
                        <span className={styles.actionTime}>⏱ {action.time}</span>
                        <span className={`${styles.actionPriority} ${action.priority === 'high' ? styles.high : styles.medium}`}>
                          {action.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className={styles.obstacleCard}>
            <div className={styles.cardLabel}>CURRENT OBSTACLE</div>
            <p className={styles.obstacleText}>
              {soul?.bigObstacle || "No obstacle defined"}
            </p>
          </div>
        </PageWrapper>
      </AppLayout>
    </ProtectedRoute>
  )
}
