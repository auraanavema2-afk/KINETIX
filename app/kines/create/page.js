"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import AppLayout from "@/components/layout/AppLayout"
import { useAuth } from "@/context/AuthContext"
import { createKine } from "@/lib/firestore"
import { useToast } from "@/components/ui/Toast"
import styles from "./CreateKine.module.css"

const CATEGORIES = [
  { key: "education", label: "Education", emoji: "📚" },
  { key: "business", label: "Business", emoji: "💼" },
  { key: "creative", label: "Creative", emoji: "🎨" },
  { key: "technical", label: "Technical", emoji: "⚡" },
  { key: "lifestyle", label: "Lifestyle", emoji: "🌱" },
  { key: "fun", label: "Fun", emoji: "🎮" },
]

const EMOJI_OPTIONS = ["✦","🧠","💡","🎯","🚀","🔬","📚","💼","🎨","⚡","🌱","🎮","🤖","👨‍💻","🧙","🦉","🌟","🔥","💎","🌈"]

export default function CreateKinePage() {
  const router = useRouter()
  const { user, userDoc } = useAuth()
  const { success, error: showError } = useToast()
  const [step, setStep] = useState(1)
  const [creating, setCreating] = useState(false)

  const [form, setForm] = useState({
    name: "",
    emoji: "✦",
    category: "education",
    shortDescription: "",
    persona: "",
    isPublic: true,
  })

  const updateField = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const canProceed = () => {
    if (step === 1) return form.name.trim() && form.emoji
    if (step === 2) return form.shortDescription.trim() && form.category
    if (step === 3) return form.persona.trim().length > 50
    return true
  }

  const handleCreate = async () => {
    if (!user) return
    setCreating(true)
    try {
      const id = await createKine(user.uid, {
        ...form,
        creatorName: userDoc?.soul?.name || userDoc?.name || "Anonymous",
      })
      success("Kine created successfully")
      router.push(`/kines/${id}`)
    } catch (err) {
      console.error(err)
      showError("Failed to create Kine. Please try again.")
      setCreating(false)
    }
  }

  return (
    <ProtectedRoute>
      <AppLayout imageSrc="/images/backgrounds/kines-bg.jpg" imageOpacity={0.80}>
        <div className={styles.page}>
          <button
            className={styles.backBtn}
            onClick={() => router.push("/kines")}
          >
            ← All Kines
          </button>

          <div className={styles.header}>
            <h1 className={styles.title}>Create a Kine</h1>
            <p className={styles.subtitle}>Build your own specialised AI agent</p>
          </div>

          <div className={styles.steps}>
            {[1,2,3].map(s => (
              <div key={s} className={styles.stepWrap}>
                <div className={`${styles.stepDot} ${s < step ? styles.stepDone : s === step ? styles.stepActive : styles.stepFuture}`}>
                  {s < step ? "✓" : s}
                </div>
                {s < 3 && (
                  <div className={styles.stepLine}>
                    <div
                      className={styles.stepLineFill}
                      style={{ width: s < step ? "100%" : "0%" }}
                    ></div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className={styles.formCard}>
            {step === 1 && (
              <div className={styles.stepContent}>
                <h2 className={styles.stepTitle}>Identity</h2>
                <p className={styles.stepDesc}>Give your Kine a name and pick an emoji</p>

                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Kine Name</label>
                  <input
                    className={styles.input}
                    value={form.name}
                    onChange={e => updateField("name", e.target.value)}
                    placeholder="e.g. Code Reviewer, Math Tutor, Story Coach"
                    maxLength={40}
                    autoFocus
                  />
                  <div className={styles.charCount}>{form.name.length} / 40</div>
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Choose an Emoji</label>
                  <div className={styles.emojiGrid}>
                    {EMOJI_OPTIONS.map(emoji => (
                      <button
                        key={emoji}
                        className={`${styles.emojiBtn} ${form.emoji === emoji ? styles.emojiActive : ""}`}
                        onClick={() => updateField("emoji", emoji)}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className={styles.stepContent}>
                <h2 className={styles.stepTitle}>Category and Description</h2>
                <p className={styles.stepDesc}>Help users find your Kine</p>

                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Category</label>
                  <div className={styles.catGrid}>
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat.key}
                        className={`${styles.catBtn} ${form.category === cat.key ? styles.catActive : ""}`}
                        onClick={() => updateField("category", cat.key)}
                      >
                        <span>{cat.emoji}</span>
                        <span>{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Short Description</label>
                  <textarea
                    className={styles.textarea}
                    value={form.shortDescription}
                    onChange={e => updateField("shortDescription", e.target.value)}
                    placeholder="One or two sentences explaining what your Kine does..."
                    maxLength={200}
                    rows={3}
                  />
                  <div className={styles.charCount}>{form.shortDescription.length} / 200</div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className={styles.stepContent}>
                <h2 className={styles.stepTitle}>Persona</h2>
                <p className={styles.stepDesc}>Write detailed instructions defining your Kine&apos;s personality, expertise, and behaviour</p>

                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Persona Instructions</label>
                  <textarea
                    className={styles.textarea}
                    value={form.persona}
                    onChange={e => updateField("persona", e.target.value)}
                    placeholder="You are an expert at... You speak in a... way. You always... You never... When users ask about... You respond by..."
                    rows={8}
                  />
                  <div className={styles.charCount}>
                    {form.persona.length} characters
                    {form.persona.length < 50 && (
                      <span className={styles.charWarning}> (minimum 50)</span>
                    )}
                  </div>
                </div>

                <div className={styles.visibilityCard}>
                  <div className={styles.visibilityLeft}>
                    <div className={styles.visibilityTitle}>Make Public</div>
                    <div className={styles.visibilityDesc}>
                      Public Kines appear in the marketplace and anyone can use them
                    </div>
                  </div>
                  <button
                    className={`${styles.toggle} ${form.isPublic ? styles.toggleOn : ""}`}
                    onClick={() => updateField("isPublic", !form.isPublic)}
                  >
                    <div className={styles.toggleThumb}></div>
                  </button>
                </div>
              </div>
            )}

            <div className={styles.actions}>
              {step > 1 && (
                <button
                  className={styles.backStepBtn}
                  onClick={() => setStep(step - 1)}
                >
                  ← Back
                </button>
              )}
              <div style={{ flex: 1 }}></div>
              {step < 3 ? (
                <button
                  className={styles.nextBtn}
                  onClick={() => setStep(step + 1)}
                  disabled={!canProceed()}
                >
                  Next →
                </button>
              ) : (
                <button
                  className={styles.createBtn}
                  onClick={handleCreate}
                  disabled={!canProceed() || creating}
                >
                  {creating ? "Creating..." : "Create Kine ✦"}
                </button>
              )}
            </div>
          </div>
        </div>
      </AppLayout>
    </ProtectedRoute>
  )
}
