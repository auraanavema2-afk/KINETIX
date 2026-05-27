"use client"

import { useState } from "react"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import AppLayout from "@/components/layout/AppLayout"
import { useAuth } from "@/context/AuthContext"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import styles from "./Soul.module.css"

const SOUL_FIELDS = [
  { key: "name",         label: "Your Name",         placeholder: "What should Kaizen call you?" },
  { key: "bigGoal",      label: "Big Goal",           placeholder: "What's the one thing you're building toward?" },
  { key: "bigObstacle",  label: "Biggest Obstacle",   placeholder: "What's standing in your way?" },
  { key: "helpNeeded",   label: "Help Needed",        placeholder: "What kind of support do you need most?" },
  { key: "weeklyIntent", label: "This Week's Intent", placeholder: "What do you want to accomplish this week?" },
]

export default function SoulPage() {
  const { user, userDoc, setUserDoc } = useAuth()
  const [editing, setEditing]   = useState(null)
  const [draft, setDraft]       = useState("")
  const [saved, setSaved]       = useState(null)
  const [saving, setSaving]     = useState(false)

  const soul = userDoc?.soul || {}

  const handleEdit = (key) => {
    setEditing(key)
    setDraft(soul[key] || "")
    setSaved(null)
  }

  const handleCancel = () => {
    setEditing(null)
    setDraft("")
  }

  const handleSave = async (key) => {
    if (!user) return
    setSaving(true)
    const updated = { ...soul, [key]: draft.trim() }
    setUserDoc((prev) => ({ ...prev, soul: updated }))
    try {
      await updateDoc(doc(db, "users", user.uid), { soul: updated })
    } catch (err) {
      console.error(err)
    }
    setSaving(false)
    setEditing(null)
    setDraft("")
    setSaved(key)
    setTimeout(() => setSaved(null), 2000)
  }

  const memories = userDoc?.soulMemory || []

  return (
    <ProtectedRoute>
      <AppLayout variant="soul">
        <div className={styles.page}>
          <div className={styles.header}>
            <div>
              <h1 className={styles.title}>Soul Profile</h1>
              <p className={styles.subtitle}>
                {soul.name ? `${soul.name}'s inner blueprint` : "Your inner blueprint — shape who Kaizen thinks you are"}
              </p>
            </div>
            <div className={styles.prismWrap}>
              <svg viewBox="0 0 24 24" width="36" height="36" fill="none" className={styles.prism}>
                <polygon
                  points="12,2 22,20 2,20"
                  stroke="#00d4ff"
                  strokeWidth="1.2"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          <div className={styles.fieldsGrid}>
            {SOUL_FIELDS.map(({ key, label, placeholder }) => (
              <div
                key={key}
                className={`${styles.fieldCard} ${editing === key ? styles.fieldCardEditing : ""}`}
              >
                <div className={styles.fieldHeader}>
                  <span className={styles.fieldLabel}>{label}</span>
                  {saved === key && (
                    <span className={styles.savedBadge}>✓ saved</span>
                  )}
                  {editing !== key && (
                    <button className={styles.editBtn} onClick={() => handleEdit(key)}>
                      Edit
                    </button>
                  )}
                </div>

                {editing === key ? (
                  <div className={styles.editArea}>
                    <textarea
                      className={styles.textarea}
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      placeholder={placeholder}
                      rows={3}
                      autoFocus
                    />
                    <div className={styles.editActions}>
                      <button
                        className={styles.saveBtn}
                        onClick={() => handleSave(key)}
                        disabled={saving}
                      >
                        {saving ? "Saving…" : "Save"}
                      </button>
                      <button className={styles.cancelBtn} onClick={handleCancel}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className={`${styles.fieldValue} ${!soul[key] ? styles.fieldEmpty : ""}`}>
                    {soul[key] || placeholder}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className={styles.memoriesSection}>
            <div className={styles.memoriesHeader}>
              <h2 className={styles.memoriesTitle}>Soul Memories</h2>
              <span className={styles.memoriesCount}>{memories.length} insights</span>
            </div>
            {memories.length === 0 ? (
              <p className={styles.memoriesEmpty}>
                Kaizen will store key insights here as you chat — your values, patterns, and breakthroughs.
              </p>
            ) : (
              <div className={styles.memoriesGrid}>
                {memories.map((memory, i) => (
                  <div key={i} className={styles.memoryChip}>
                    <span className={styles.memoryDot}></span>
                    {memory}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </AppLayout>
    </ProtectedRoute>
  )
}
