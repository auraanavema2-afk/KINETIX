"use client"

import { useState, useRef, useEffect } from "react"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import AppLayout from "@/components/layout/AppLayout"
import { useAuth } from "@/context/AuthContext"
import styles from "./Mint.module.css"

const BUILD_TYPES = [
  { id: "app",     emoji: "⚡", label: "App",     desc: "Interactive web app" },
  { id: "website", emoji: "🌐", label: "Website",  desc: "Landing page / site" },
  { id: "deck",    emoji: "📊", label: "Deck",     desc: "Presentation slides" },
]

const EXAMPLES = {
  app: [
    "A habit tracker with streaks and a satisfying check-off animation",
    "A Pomodoro timer with ambient sounds and focus statistics",
    "A mood journal that shows patterns over the last 30 days",
    "A personal finance dashboard with spending categories",
    "A vocabulary flashcard app with spaced repetition",
  ],
  website: [
    "A SaaS landing page for an AI writing tool, dark theme",
    "A portfolio site for a UX designer with project cards",
    "A startup homepage for a fintech app targeting Gen Z",
    "A personal blog homepage with featured articles section",
    "A fitness coaching landing page with testimonials and pricing",
  ],
  deck: [
    "A pitch deck for an AI startup raising a seed round",
    "A quarterly business review for a D2C brand",
    "A personal brand deck explaining my journey and vision",
    "A product roadmap presentation for Q3 2025",
    "A TEDx-style talk on the future of remote work",
  ],
}

const DEVICE_SIZES = {
  desktop: "100%",
  tablet:  "768px",
  mobile:  "375px",
}

export default function MintPage() {
  const { user, userDoc } = useAuth()

  const [type,        setType]        = useState("app")
  const [prompt,      setPrompt]      = useState("")
  const [building,    setBuilding]    = useState(false)
  const [progress,    setProgress]    = useState(0)
  const [code,        setCode]        = useState("")
  const [tab,         setTab]         = useState("preview")
  const [device,      setDevice]      = useState("desktop")
  const [iterateMode, setIterateMode] = useState(false)
  const [iterateText, setIterateText] = useState("")
  const [error,       setError]       = useState("")

  const abortRef    = useRef(null)
  const iframeRef   = useRef(null)
  const progressRef = useRef(null)

  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort()
      if (progressRef.current) clearInterval(progressRef.current)
    }
  }, [])

  const startProgress = () => {
    setProgress(0)
    progressRef.current = setInterval(() => {
      setProgress(p => {
        if (p >= 92) { clearInterval(progressRef.current); return p }
        return p + (92 - p) * 0.04
      })
    }, 200)
  }

  const stopProgress = () => {
    clearInterval(progressRef.current)
    setProgress(100)
    setTimeout(() => setProgress(0), 800)
  }

  const handleBuild = async (isIteration = false) => {
    const buildPrompt = isIteration ? iterateText : prompt
    if (!buildPrompt.trim() || building) return

    setBuilding(true)
    setError("")
    if (!isIteration) setCode("")
    startProgress()

    const ctrl = new AbortController()
    abortRef.current = ctrl

    try {
      const body = {
        prompt,
        type,
        userId: user?.uid,
        soulData: userDoc?.soul || null,
      }
      if (isIteration) {
        body.iterating        = true
        body.previousCode     = code
        body.iterationRequest = iterateText
      }

      const res = await fetch("/api/mint", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
        signal:  ctrl.signal,
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Build failed")
      }

      const reader  = res.body.getReader()
      const decoder = new TextDecoder()
      let   built   = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        built += decoder.decode(value, { stream: true })
        setCode(built)
      }

      setCode(built)
      stopProgress()
      if (isIteration) {
        setIterateText("")
        setIterateMode(false)
      }
      setTab("preview")
    } catch (err) {
      if (err.name === "AbortError") return
      setError(err.message || "Something went wrong. Please try again.")
      stopProgress()
    } finally {
      setBuilding(false)
    }
  }

  const handleStop = () => {
    if (abortRef.current) abortRef.current.abort()
    setBuilding(false)
    stopProgress()
  }

  const handleDownload = () => {
    const blob = new Blob([code], { type: "text/html" })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement("a")
    a.href     = url
    a.download = `kaizen-mint-${Date.now()}.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
  }

  const soulData = userDoc?.soul || null

  return (
    <ProtectedRoute>
      <AppLayout variant="studio">
        <div className={styles.workspace}>

          {/* ── LEFT PANEL ───────────────────────────── */}
          <div className={styles.leftPanel}>

            <div className={styles.panelHeader}>
              <span className={styles.panelLabel}>KAIZEN MINT</span>
              <span className={styles.panelSub}>Build anything with one prompt</span>
            </div>

            {/* Type selector */}
            <div className={styles.typeGrid}>
              {BUILD_TYPES.map(t => (
                <button
                  key={t.id}
                  className={`${styles.typeBtn} ${type === t.id ? styles.typeActive : ""}`}
                  onClick={() => setType(t.id)}
                >
                  <span className={styles.typeEmoji}>{t.emoji}</span>
                  <span className={styles.typeLabel}>{t.label}</span>
                  <span className={styles.typeDesc}>{t.desc}</span>
                </button>
              ))}
            </div>

            {/* Prompt */}
            <div className={styles.promptWrap}>
              <textarea
                className={styles.promptInput}
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder={`Describe the ${type} you want to build...`}
                rows={5}
              />
              <div className={styles.promptHint}>Be specific. More detail = better output.</div>
            </div>

            {/* Examples */}
            <div className={styles.examplesWrap}>
              <div className={styles.examplesLabel}>Examples</div>
              <div className={styles.examplesList}>
                {EXAMPLES[type].map((ex, i) => (
                  <button
                    key={i}
                    className={styles.exampleBtn}
                    onClick={() => setPrompt(ex)}
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>

            {/* Build button */}
            {building ? (
              <button className={styles.stopBtn} onClick={handleStop}>
                <span className={styles.stopDot} />
                Stop
              </button>
            ) : (
              <button
                className={styles.buildBtn}
                onClick={() => handleBuild(false)}
                disabled={!prompt.trim()}
              >
                <span className={styles.buildShimmer} />
                Build {BUILD_TYPES.find(t => t.id === type)?.label}
                <span className={styles.buildArrow}>→</span>
              </button>
            )}

            {error && <div className={styles.errorMsg}>{error}</div>}

            {/* Iterate section */}
            {code && !building && (
              <div className={styles.iterateSection}>
                <div className={styles.divider} />
                {!iterateMode ? (
                  <button
                    className={styles.iterateToggle}
                    onClick={() => setIterateMode(true)}
                  >
                    ✦ Iterate on this build
                  </button>
                ) : (
                  <div className={styles.iterateWrap}>
                    <div className={styles.iterateLabel}>WHAT SHOULD CHANGE?</div>
                    <textarea
                      className={styles.iterateInput}
                      value={iterateText}
                      onChange={e => setIterateText(e.target.value)}
                      placeholder="Describe what you want to change or improve..."
                      rows={3}
                    />
                    <div className={styles.iterateBtns}>
                      <button
                        className={styles.cancelIterateBtn}
                        onClick={() => { setIterateMode(false); setIterateText("") }}
                      >
                        Cancel
                      </button>
                      <button
                        className={styles.applyIterateBtn}
                        onClick={() => handleBuild(true)}
                        disabled={!iterateText.trim()}
                      >
                        Apply Changes
                      </button>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className={styles.actionsGrid}>
                  <button className={styles.actionBtn} onClick={handleDownload}>
                    ↓ Download
                  </button>
                  <button className={styles.actionBtn} onClick={handleCopy}>
                    ⧉ Copy HTML
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* ── RIGHT PANEL ──────────────────────────── */}
          <div className={styles.rightPanel}>

            {/* Tab bar */}
            <div className={styles.tabBar}>
              <div className={styles.tabs}>
                <button
                  className={`${styles.tab} ${tab === "preview" ? styles.tabActive : ""}`}
                  onClick={() => setTab("preview")}
                >
                  Preview
                </button>
                <button
                  className={`${styles.tab} ${tab === "code" ? styles.tabActive : ""}`}
                  onClick={() => setTab("code")}
                  disabled={!code}
                >
                  Code
                </button>
              </div>
              {tab === "preview" && (
                <div className={styles.deviceBtns}>
                  {Object.keys(DEVICE_SIZES).map(d => (
                    <button
                      key={d}
                      className={`${styles.deviceBtn} ${device === d ? styles.deviceActive : ""}`}
                      onClick={() => setDevice(d)}
                      title={d}
                    >
                      {d === "desktop" ? "🖥" : d === "tablet" ? "📱" : "📲"}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Progress bar */}
            {progress > 0 && (
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${progress}%` }} />
              </div>
            )}

            {/* Content area */}
            <div className={styles.previewArea}>
              {!code && !building ? (
                <div className={styles.emptyState}>
                  <svg className={styles.emptyPrism} viewBox="0 0 24 24" width="52" height="52" fill="none">
                    <polygon
                      points="12,2 22,20 2,20"
                      stroke="rgba(0,212,255,0.4)"
                      strokeWidth="1.2"
                      strokeLinejoin="round"
                    />
                    <polygon
                      points="12,6 19,18 5,18"
                      stroke="rgba(0,212,255,0.15)"
                      strokeWidth="0.8"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className={styles.emptyTitle}>Your build appears here</div>
                  <div className={styles.emptyText}>
                    Describe what you want, hit Build, and watch it come to life.
                  </div>
                </div>
              ) : tab === "code" && code ? (
                <div className={styles.codeView}>
                  <pre className={styles.codeContent}>{code}</pre>
                </div>
              ) : (
                <div
                  className={styles.iframeWrap}
                  style={{ maxWidth: DEVICE_SIZES[device] }}
                >
                  {building && (
                    <div className={styles.buildingBadge}>
                      <span className={styles.dot} />
                      <span className={styles.dot} />
                      <span className={styles.dot} />
                      Building
                    </div>
                  )}
                  <iframe
                    ref={iframeRef}
                    className={styles.preview}
                    srcDoc={code || "<html><body style='background:#050508'></body></html>"}
                    sandbox="allow-scripts"
                    title="Mint Preview"
                  />
                </div>
              )}
            </div>

          </div>
        </div>
      </AppLayout>
    </ProtectedRoute>
  )
}
