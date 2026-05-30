"use client"

import { useState, useEffect } from "react"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import AppLayout from "@/components/layout/AppLayout"
import { useAuth } from "@/context/AuthContext"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useToast } from "@/components/ui/Toast"
import PageWrapper from "@/components/ui/PageWrapper"
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
  const { success, error: showError } = useToast()
  const [editing, setEditing]       = useState(null)
  const [editValue, setEditValue]   = useState("")
  const [savedField, setSavedField] = useState(null)
  const [saving, setSaving]         = useState(false)
  const [pageLoading, setPageLoading] = useState(true)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (userDoc !== null) setPageLoading(false)
  }, [userDoc])

  const soul = userDoc?.soul || {}

  const handleEdit = (key) => {
    setEditing(key)
    setEditValue(soul[key] || "")
    setSavedField(null)
  }

  const handleCancel = () => {
    setEditing(null)
    setEditValue("")
  }

  const handleSave = async (key) => {
    if (!user) return
    setSaving(true)
    try {
      const updatedSoul = { ...soul, [key]: editValue }
      await updateDoc(doc(db, "users", user.uid), {
        soul: updatedSoul
      })
      setUserDoc(prev => ({ ...prev, soul: updatedSoul }))
      setEditing(null)
      setSavedField(key)
      success("Soul updated successfully")
      setTimeout(() => setSavedField(null), 2000)
    } catch (err) {
      console.error(err)
      showError("Failed to save. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const memories = userDoc?.soulMemory || []

  return (
    <ProtectedRoute>
      <AppLayout variant="soul">
        <PageWrapper
          loading={pageLoading}
          maxWidth="820px"
          padding="32px 36px"
        >
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
                  {savedField === key && (
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
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
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
        </PageWrapper>
      </AppLayout>
    </ProtectedRoute>
  )
}
