"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import { authenticatedFetch } from "@/lib/apiClient"
import AppLayout from "@/components/layout/AppLayout"
import { useAuth } from "@/context/AuthContext"
import SoftPaywall from "@/components/paywall/SoftPaywall"
import { useToast } from "@/components/ui/Toast"
import styles from "./Thinking.module.css"

export default function ThinkingPage() {
  const router = useRouter()
  const { user, userDoc } = useAuth()
  const { success } = useToast()
  const [problem, setProblem] = useState("")
  const [thinking, setThinking] = useState(false)
  const [result, setResult] = useState(null)
  const [visibleSteps, setVisibleSteps] = useState(0)
  const [showSummary, setShowSummary] = useState(false)
  const [showActions, setShowActions] = useState(false)
  const [showPaywall, setShowPaywall] = useState(false)
  const [error, setError] = useState("")
  const [copySuccess, setCopySuccess] = useState(false)

  const textareaRef = useRef(null)
  const resultsRef = useRef(null)

  const hasAccess = true

  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = Math.min(el.scrollHeight, 200) + "px"
  }, [problem])

  useEffect(() => {
    if (result && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }, [result])

  const handleInput = (e) => {
    setProblem(e.target.value)
    e.target.style.height = "auto"
    e.target.style.height = Math.min(e.target.scrollHeight, 200) + "px"
  }

  const handleThink = async () => {
    if (!problem.trim() || thinking) return

    if (!hasAccess) {
      setShowPaywall(true)
      return
    }

    setThinking(true)
    setResult(null)
    setVisibleSteps(0)
    setShowSummary(false)
    setShowActions(false)
    setError("")

    try {
      const res = await authenticatedFetch("/api/thinking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problem,
          userId: user?.uid,
          soulData: userDoc?.soul,
          soulMemory: userDoc?.soulMemory,
        })
      })

      if (!res.ok) {
        const errorData = await res.json()
        if (res.status === 402) {
          setShowPaywall(true)
          setThinking(false)
          return
        }
        throw new Error(errorData.error || "Failed")
      }

      const data = await res.json()
      if (!data.steps || !Array.isArray(data.steps)) throw new Error("Invalid response")
      setResult(data)

      // Reveal steps one by one with timing
      for (let i = 1; i <= data.steps.length; i++) {
        await new Promise(r => setTimeout(r, 700))
        setVisibleSteps(i)
      }

      await new Promise(r => setTimeout(r, 500))
      setShowSummary(true)

      await new Promise(r => setTimeout(r, 400))
      setShowActions(true)
      success("Analysis complete")

    } catch (err) {
      if (err.name !== "AbortError") {
        setError(
          err.message === "Not authenticated"
            ? "Please sign in to use Kaizen 4 Deep"
            : "Kaizen 4 Deep encountered an issue. Please check your connection and try again."
        )
      }
    } finally {
      setThinking(false)
    }
  }

  const handleCopyAll = async () => {
    if (!result) return
    const text = `THE KAIZEN — KAIZEN 4 DEEP ANALYSIS\n\nProblem: ${problem}\n\n` +
      result.steps.map(s => `Step ${s.step}: ${s.title}\n${s.content}`).join("\n\n") +
      `\n\nSummary: ${result.summary}\n\nNext Actions:\n` +
      result.actions.map((a, i) => `${i + 1}. ${a}`).join("\n")
    try {
      await navigator.clipboard.writeText(text)
      success("Analysis copied to clipboard")
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      console.error("Failed to copy analysis:", err)
    }
  }

  const handleReset = () => {
    setProblem("")
    setResult(null)
    setVisibleSteps(0)
    setShowSummary(false)
    setShowActions(false)
    setError("")
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.focus()
    }
  }

  return (
    <ProtectedRoute>
      <AppLayout variant="default">
        <div className={styles.page}>

          <div className={styles.heroSection}>
            <div className={styles.titleWrap}>
              <div className={styles.brainGlow}></div>
              <img
                src="/images/kaizen-icon.png"
                alt="Kaizen 4 Deep"
                width={56}
                height={56}
                className={styles.deepIcon}
              />
              <h1 className={styles.heroTitle}>
                <span className={styles.titleKaizen}>Kaizen 4</span>
                <span className={styles.titleDeep}>Deep</span>
              </h1>
              <p className={styles.heroSub}>
                Structured reasoning that breaks complex problems into clear thinking steps
              </p>
            </div>
          </div>

          {!hasAccess && (
            <div className={styles.gatedBanner}>
              <span>🔒</span>
              <span>Kaizen 4 Deep requires <strong>Build</strong> or higher plan</span>
              <button onClick={() => router.push("/pricing")}>Upgrade</button>
            </div>
          )}

          <div className={styles.inputCard}>
            <div className={styles.inputHeader}>
              <span className={styles.inputLabel}>DESCRIBE YOUR PROBLEM</span>
              <span className={styles.charCount}>{problem.length} characters</span>
            </div>
            <textarea
              ref={textareaRef}
              className={styles.problemInput}
              value={problem}
              onChange={handleInput}
              placeholder="What complex problem do you need to think through?  E.g. Should I leave my job to build my startup full-time? How do I price my SaaS product? What's the best way to structure my MVP launch?"
              disabled={thinking}
            />
            <div className={styles.inputFooter}>
              <div className={styles.inputHints}>
                {!problem && (
                  <>
                    <button
                      className={styles.hintChip}
                      onClick={() => setProblem("I'm stuck deciding whether to focus on growth or revenue first for my startup. Help me think through this clearly.")}
                    >
                      💡 Strategic decision
                    </button>
                    <button
                      className={styles.hintChip}
                      onClick={() => setProblem("I need to figure out the best architecture for a real-time multiplayer game with 10,000 concurrent users.")}
                    >
                      ⚡ Technical problem
                    </button>
                  </>
                )}
              </div>
              <button
                className={styles.thinkBtn}
                onClick={handleThink}
                disabled={!problem.trim() || thinking}
              >
                {thinking ? (
                  <>
                    <span className={styles.thinkingDots}>
                      <span></span><span></span><span></span>
                    </span>
                    Kaizen 4 is thinking
                  </>
                ) : (
                  <>
                    Think Deeply
                    <span className={styles.thinkArrow}>↗</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className={styles.errorCard}>{error}</div>
          )}

          {result && (
            <div className={styles.resultsSection} ref={resultsRef}>

              <div className={styles.resultsHeader}>
                <div className={styles.resultsTitle}>
                  <span className={styles.resultsLabel}>ANALYSIS COMPLETE</span>
                  <h2>{result.steps.length} thinking steps</h2>
                </div>
                <div className={styles.resultsActions}>
                  <button
                    className={styles.copyAllBtn}
                    onClick={handleCopyAll}
                  >
                    {copySuccess ? "✓ Copied" : "⎘ Copy All"}
                  </button>
                  <button
                    className={styles.resetBtn}
                    onClick={handleReset}
                  >
                    ↻ New Analysis
                  </button>
                </div>
              </div>

              <div className={styles.stepsTimeline}>
                {result.steps.map((step, i) => (
                  <div
                    key={step.step}
                    className={`${styles.stepCard} ${i < visibleSteps ? styles.stepVisible : styles.stepHidden}`}
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    <div className={styles.stepConnector}>
                      <div className={styles.stepNumberWrap}>
                        <div className={styles.stepNumber}>
                          <span>{step.step}</span>
                        </div>
                        <div className={styles.stepNumberRing}></div>
                      </div>
                      {i < result.steps.length - 1 && (
                        <div className={styles.stepLine}>
                          <div className={`${styles.stepLineFill} ${i < visibleSteps - 1 ? styles.stepLineFilled : ""}`}></div>
                        </div>
                      )}
                    </div>
                    <div className={styles.stepContent}>
                      <div className={styles.stepLabel}>STEP {String(step.step).padStart(2, "0")}</div>
                      <h3 className={styles.stepTitle}>{step.title}</h3>
                      <p className={styles.stepText}>{step.content}</p>
                    </div>
                  </div>
                ))}
              </div>

              {showSummary && (
                <div className={styles.summaryCard}>
                  <div className={styles.summaryLabel}>
                    <span className={styles.summaryDot}></span>
                    SYNTHESIS
                  </div>
                  <p className={styles.summaryText}>{result.summary}</p>
                </div>
              )}

              {showActions && (
                <div className={styles.actionsCard}>
                  <div className={styles.actionsLabel}>NEXT ACTIONS</div>
                  <div className={styles.actionsList}>
                    {result.actions.map((action, i) => (
                      <div
                        key={i}
                        className={styles.actionItem}
                        style={{ animationDelay: `${i * 0.15}s` }}
                      >
                        <div className={styles.actionNum}>{i + 1}</div>
                        <p className={styles.actionText}>{action}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {showPaywall && (
            <SoftPaywall
              reason="Kaizen 4 Deep is the most advanced reasoning mode in The Kaizen. It requires a Build plan or higher."
              onClose={() => setShowPaywall(false)}
            />
          )}
        </div>
      </AppLayout>
    </ProtectedRoute>
  )
}
