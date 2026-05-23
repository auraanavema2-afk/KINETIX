"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import AppLayout from "@/components/layout/AppLayout"
import { useAuth } from "@/context/AuthContext"
import { createKine } from "@/lib/firestore"
import styles from "./CreateKine.module.css"

const CATEGORIES = [
  { value: "assistant",   label: "Assistant",   emoji: "🤖" },
  { value: "creative",    label: "Creative",    emoji: "🎨" },
  { value: "coach",       label: "Coach",       emoji: "💪" },
  { value: "companion",   label: "Companion",   emoji: "🫂" },
  { value: "teacher",     label: "Teacher",     emoji: "📚" },
  { value: "analyst",     label: "Analyst",     emoji: "📊" },
  { value: "general",     label: "General",     emoji: "✦" },
]

const EMOJI_OPTIONS = ["🤖", "🧠", "⚡", "🌌", "🎯", "🔥", "💡", "🦋", "🐉", "🌟", "💎", "🚀", "🎭", "🧬", "🌊", "✦"]

export default function CreateKinePage() {
  const router = useRouter()
  const { user, userDoc } = useAuth()

  const [form, setForm] = useState({
    name: "",
    emoji: "✦",
    category: "general",
    shortDescription: "",
    persona: "",
    isPublic: true,
  })
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  const set = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }))
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = "Name is required"
    if (form.name.trim().length > 50) e.name = "Name must be 50 characters or less"
    if (!form.shortDescription.trim()) e.shortDescription = "Short description is required"
    if (form.shortDescription.trim().length > 200) e.shortDescription = "Keep it under 200 characters"
    if (!form.persona.trim()) e.persona = "Persona is required"
    if (form.persona.trim().length < 20) e.persona = "Persona must be at least 20 characters"
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setSaving(true)
    try {
      const kineId = await createKine({
        ...form,
        name: form.name.trim(),
        shortDescription: form.shortDescription.trim(),
        persona: form.persona.trim(),
        userId: user.uid,
        creatorName: userDoc?.name || user?.email || "Anonymous",
      })
      router.push(`/kines/${kineId}`)
    } catch (err) {
      console.error(err)
      setSaving(false)
    }
  }

  return (
    <ProtectedRoute>
      <AppLayout variant="universe">
        <div className={styles.page}>
          <button className={styles.backBtn} onClick={() => router.push("/kines")}>
            ← All Kines
          </button>

          <div className={styles.header}>
            <h1 className={styles.title}>Create a Kine</h1>
            <p className={styles.subtitle}>Build an AI persona for the community</p>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.emojiSection}>
              <button
                type="button"
                className={styles.emojiBtn}
                onClick={() => setShowEmojiPicker(v => !v)}
              >
                <span className={styles.emojiDisplay}>{form.emoji}</span>
                <span className={styles.emojiHint}>tap to change</span>
              </button>
              {showEmojiPicker && (
                <div className={styles.emojiPicker}>
                  {EMOJI_OPTIONS.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      className={`${styles.emojiOption} ${form.emoji === emoji ? styles.emojiSelected : ""}`}
                      onClick={() => { set("emoji", emoji); setShowEmojiPicker(false) }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Name *</label>
              <input
                className={`${styles.input} ${errors.name ? styles.inputError : ""}`}
                placeholder="e.g. Nova, Sage, Ember..."
                value={form.name}
                onChange={e => set("name", e.target.value)}
                maxLength={50}
              />
              {errors.name && <span className={styles.error}>{errors.name}</span>}
              <span className={styles.counter}>{form.name.length}/50</span>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Category *</label>
              <div className={styles.catGrid}>
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.value}
                    type="button"
                    className={`${styles.catOption} ${form.category === cat.value ? styles.catSelected : ""}`}
                    onClick={() => set("category", cat.value)}
                  >
                    <span>{cat.emoji}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Short Description *</label>
              <input
                className={`${styles.input} ${errors.shortDescription ? styles.inputError : ""}`}
                placeholder="What does this Kine do? (shown on cards)"
                value={form.shortDescription}
                onChange={e => set("shortDescription", e.target.value)}
                maxLength={200}
              />
              {errors.shortDescription && <span className={styles.error}>{errors.shortDescription}</span>}
              <span className={styles.counter}>{form.shortDescription.length}/200</span>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Persona *</label>
              <p className={styles.fieldHint}>
                Define the personality, behavior, and instructions for this Kine. Be detailed — this is its system prompt.
              </p>
              <textarea
                className={`${styles.textarea} ${errors.persona ? styles.inputError : ""}`}
                placeholder="You are Nova, a creative writing assistant with a warm and encouraging personality. You help users unlock their storytelling potential by..."
                value={form.persona}
                onChange={e => set("persona", e.target.value)}
                rows={8}
              />
              {errors.persona && <span className={styles.error}>{errors.persona}</span>}
              <span className={styles.counter}>{form.persona.length} chars</span>
            </div>

            <div className={styles.field}>
              <label className={styles.visibilityRow}>
                <span className={styles.label} style={{ margin: 0 }}>Public</span>
                <div
                  className={`${styles.toggle} ${form.isPublic ? styles.toggleOn : ""}`}
                  onClick={() => set("isPublic", !form.isPublic)}
                >
                  <div className={styles.toggleThumb} />
                </div>
              </label>
              <p className={styles.fieldHint}>
                {form.isPublic ? "Visible in the Kines marketplace" : "Only you can see and use this Kine"}
              </p>
            </div>

            <div className={styles.actions}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={() => router.push("/kines")}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={styles.submitBtn}
                disabled={saving}
              >
                {saving ? "Creating..." : "Create Kine"}
              </button>
            </div>
          </form>
        </div>
      </AppLayout>
    </ProtectedRoute>
  )
}
