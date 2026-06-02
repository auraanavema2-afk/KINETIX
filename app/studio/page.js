"use client"

import { useState, useRef, useEffect } from "react"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import AppLayout from "@/components/layout/AppLayout"
import { useAuth } from "@/context/AuthContext"
import { authenticatedFetch } from "@/lib/apiClient"
import { useToast } from "@/components/ui/Toast"
import styles from "./Mint.module.css"

const BUILD_TYPES = [
  { id: "app",     emoji: "⚡", label: "App" },
  { id: "website", emoji: "🌐", label: "Website" },
  { id: "deck",    emoji: "📊", label: "Deck" },
]

const EXAMPLES = {
  app: [
    "A habit tracker with streaks and satisfying check-off animations",
    "A Pomodoro timer with ambient sounds and focus statistics",
    "A mood journal that visualises patterns over 30 days",
    "A personal finance dashboard with spending categories",
    "A vocabulary flashcard app with spaced repetition",
  ],
  website: [
    "A SaaS landing page for an AI writing tool, dark theme",
    "A portfolio site for a UX designer with project cards",
    "A startup homepage for a fintech app targeting Gen Z",
    "A personal blog homepage with featured articles",
    "A fitness coaching page with testimonials and pricing",
  ],
  deck: [
    "A pitch deck for an AI startup raising a seed round",
    "A quarterly business review for a D2C brand",
    "A personal brand deck explaining my journey and vision",
    "A product roadmap presentation for Q3 2025",
    "A TEDx-style talk on the future of remote work",
  ],
}

const DEVICES = [
  { id: "desktop", icon: "🖥", width: "100%" },
  { id: "tablet",  icon: "▭",  width: "768px" },
  { id: "mobile",  icon: "▯",  width: "375px" },
]

export default function MintPage() {
  const { user, userDoc } = useAuth()
  const { success } = useToast()

  const [type,        setType]        = useState("app")
  const [prompt,      setPrompt]      = useState("")
  const [building,    setBuilding]    = useState(false)
  const [progress,    setProgress]    = useState(0)
  const [code,        setCode]        = useState("")
  const [tab,         setTab]         = useState("preview")
  const [device,      setDevice]      = useState("desktop")
  const [iterateText, setIterateText] = useState("")
  const [copied,      setCopied]      = useState(false)
  const [error,       setError]       = useState("")
  const [buildError,  setBuildError]  = useState("")

  const abortRef    = useRef(null)
  const progressRef = useRef(null)

  useEffect(() => () => {
    if (abortRef.current) abortRef.current.abort()
    if (progressRef.current) clearInterval(progressRef.current)
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
    setTimeout(() => setProgress(0), 600)
  }

  const handleBuild = async (isIteration = false) => {
    const trigger = isIteration ? iterateText : prompt
    if (!trigger.trim() || building) return

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

      const res = await authenticatedFetch("/api/mint", {
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

      stopProgress()
      if (isIteration) setIterateText("")
      setTab("preview")
      success("Build complete")
    } catch (err) {
      if (err.name !== "AbortError") {
        setBuildError(
          err.message === "Not authenticated"
            ? "Please sign in to use Kaizen Mint"
            : "Build failed. Please try again."
        )
        setTimeout(() => setBuildError(""), 4000)
        stopProgress()
      }
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
    a.style.display = "none"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch (err) {
      console.error("Failed to copy code:", err)
    }
  }

  const deviceWidth = DEVICES.find(d => d.id === device)?.width || "100%"
  const lineCount   = code ? code.split("\n").length : 0

  return (
    <ProtectedRoute>
      <AppLayout imageSrc="/images/backgrounds/mint-bg.jpg" imageOpacity={0.78}>
        <div className={styles.page}>

          {/* ── LEFT PANEL ─────────────────────── */}
          <div className={styles.left}>

            <div className={styles.leftHeader}>
              <div className={styles.brand}>
                <svg className={styles.brandIcon} viewBox="0 0 24 24" width="18" height="18" fill="none">
                  <polygon points="12,2 22,20 2,20" stroke="#00d4ff" strokeWidth="1.5" strokeLinejoin="round" />
                </svg>
                Kaizen Mint
              </div>
              <span className={styles.buildBadge}>AI Builder</span>
            </div>

            {/* Type selector */}
            <div className={styles.types}>
              {BUILD_TYPES.map(t => (
                <button
                  key={t.id}
                  className={`${styles.typeBtn} ${type === t.id ? styles.typeOn : ""}`}
                  onClick={() => setType(t.id)}
                >
                  <span style={{ fontSize: 18 }}>{t.emoji}</span>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Prompt */}
            <div className={styles.inputWrap}>
              <div className={styles.inputLabel}>DESCRIBE YOUR BUILD</div>
              <div className={styles.textWrap}>
                <textarea
                  className={styles.textarea}
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  placeholder={`What ${type} do you want to build?`}
                  rows={4}
                  disabled={building}
                />
                <span className={styles.hint}>{prompt.length} chars</span>
              </div>
            </div>

            {/* Examples */}
            <div className={styles.examples}>
              <div className={styles.examplesLabel}>EXAMPLES</div>
              {EXAMPLES[type].map((ex, i) => (
                <button
                  key={i}
                  className={styles.exampleBtn}
                  onClick={() => setPrompt(ex)}
                  disabled={building}
                >
                  {ex}
                </button>
              ))}
            </div>

            {/* Build / Stop */}
            <button
              className={`${styles.buildBtn} ${building ? styles.stopBtn : ""}`}
              onClick={building ? handleStop : () => handleBuild(false)}
              disabled={!building && !prompt.trim()}
            >
              {building ? (
                <>
                  <div className={styles.dots}>
                    <span /><span /><span />
                  </div>
                  Stop
                </>
              ) : (
                <>Build {BUILD_TYPES.find(t => t.id === type)?.label} →</>
              )}
            </button>

            {error && <div style={{ fontSize: 12, color: "#ff7070", lineHeight: 1.5 }}>{error}</div>}

            {/* Iterate + Actions */}
            {code && !building && (
              <div className={styles.iterate}>
                <div className={styles.iterateRow}>
                  <input
                    className={styles.iterateInput}
                    value={iterateText}
                    onChange={e => setIterateText(e.target.value)}
                    placeholder="Describe a change to iterate…"
                    onKeyDown={e => e.key === "Enter" && handleBuild(true)}
                  />
                  <button
                    className={styles.iterateBtn}
                    onClick={() => handleBuild(true)}
                    disabled={!iterateText.trim()}
                    title="Apply iteration"
                  >
                    ↑
                  </button>
                </div>

                <div className={styles.actions}>
                  <button className={styles.downloadBtn} onClick={handleDownload}>↓ Download</button>
                  <button className={styles.copyBtn} onClick={handleCopy}>
                    {copied ? "✓ Copied" : "⧉ Copy"}
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* ── RIGHT PANEL ─────────────────────── */}
          <div className={styles.right}>

            {/* Tab bar */}
            <div className={styles.tabBar}>
              <div className={styles.tabs}>
                <button
                  className={`${styles.tab} ${tab === "preview" ? styles.tabOn : ""}`}
                  onClick={() => setTab("preview")}
                >
                  Preview
                </button>
                <button
                  className={`${styles.tab} ${tab === "code" ? styles.tabOn : ""}`}
                  onClick={() => setTab("code")}
                  disabled={!code}
                >
                  Code
                </button>
              </div>

              {tab === "preview" && (
                <div className={styles.devices}>
                  {DEVICES.map(d => (
                    <button
                      key={d.id}
                      className={`${styles.deviceBtn} ${device === d.id ? styles.deviceOn : ""}`}
                      onClick={() => setDevice(d.id)}
                      title={d.id}
                    >
                      {d.icon}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Progress bar */}
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${progress}%` }} />
            </div>

            {/* Preview area */}
            <div className={styles.preview} style={{ position: "relative" }}>
              {buildError && (
                <div style={{
                  position: "absolute",
                  bottom: "20px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "rgba(255,68,68,0.1)",
                  border: "1px solid rgba(255,68,68,0.2)",
                  borderRadius: "10px",
                  padding: "10px 20px",
                  color: "#ff6b6b",
                  fontSize: "13px",
                  whiteSpace: "nowrap",
                  zIndex: 10,
                }}>
                  {buildError}
                </div>
              )}
              {!code && !building ? (
                <div className={styles.empty}>
                  <svg className={styles.emptyPrism} viewBox="0 0 48 48" width="64" height="64" fill="none">
                    <polygon
                      points="24,4 44,40 4,40"
                      stroke="rgba(0,212,255,0.6)"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />
                    <polygon
                      points="24,12 38,36 10,36"
                      stroke="rgba(0,212,255,0.2)"
                      strokeWidth="1"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <p className={styles.emptyTitle}>Your build appears here</p>
                  <p className={styles.emptySub}>
                    Describe what you want, choose a type, and hit Build.
                    It streams live as it&apos;s generated.
                  </p>
                </div>
              ) : tab === "code" ? (
                <div className={styles.codeWrap}>
                  <div className={styles.codeHeader}>
                    <span className={styles.codeLines}>{lineCount} lines</span>
                    <button className={styles.codeCopy} onClick={handleCopy}>
                      {copied ? "✓ Copied" : "Copy"}
                    </button>
                  </div>
                  {code ? (
                    <pre className={styles.code}>{code}</pre>
                  ) : (
                    <div className={styles.emptyCode}>Building…</div>
                  )}
                </div>
              ) : (
                <div className={styles.iframeWrap} style={{ width: deviceWidth }}>
                  {building && (
                    <div className={styles.buildingBadge}>
                      Building your {type}…
                    </div>
                  )}
                  <iframe
                    className={styles.iframe}
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
