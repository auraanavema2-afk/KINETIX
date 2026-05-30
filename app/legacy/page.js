"use client"

import { useState, useEffect } from "react"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import AppLayout from "@/components/layout/AppLayout"
import { useAuth } from "@/context/AuthContext"
import {
  generateUserSlug,
  toggleLegacyPublic,
  updatePublicBio,
} from "@/lib/firestore"
import styles from "./LegacySettings.module.css"

export default function LegacySettingsPage() {
  const { user, userDoc, setUserDoc } = useAuth()
  const [slug, setSlug] = useState("")
  const [isPublic, setIsPublic] = useState(false)
  const [bio, setBio] = useState("")
  const [editingBio, setEditingBio] = useState(false)
  const [savingBio, setSavingBio] = useState(false)
  const [copied, setCopied] = useState(false)
  const [generatingSlug, setGeneratingSlug] = useState(false)

  useEffect(() => {
    if (userDoc) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSlug(userDoc.slug || "")
      setIsPublic(userDoc.isLegacyPublic || false)
      setBio(userDoc.bioPublic || "")
    }
  }, [userDoc])

  const publicUrl = slug
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/legacy/${slug}`
    : ""

  const handleGenerateSlug = async () => {
    if (!user || !userDoc?.soul?.name) return
    setGeneratingSlug(true)
    try {
      const newSlug = await generateUserSlug(user.uid, userDoc.soul.name)
      setSlug(newSlug)
      setUserDoc(prev => ({ ...prev, slug: newSlug }))
    } catch (err) {
      console.error(err)
    } finally {
      setGeneratingSlug(false)
    }
  }

  const handleTogglePublic = async () => {
    if (!user || !slug) {
      if (!slug) {
        alert("Please generate your Legacy URL first")
        return
      }
      return
    }
    const newValue = !isPublic
    setIsPublic(newValue)
    try {
      await toggleLegacyPublic(user.uid, newValue)
      setUserDoc(prev => ({ ...prev, isLegacyPublic: newValue }))
    } catch (err) {
      setIsPublic(!newValue)
      console.error(err)
    }
  }

  const handleSaveBio = async () => {
    if (!user) return
    setSavingBio(true)
    try {
      await updatePublicBio(user.uid, bio)
      setUserDoc(prev => ({ ...prev, bioPublic: bio }))
      setEditingBio(false)
    } catch (err) {
      console.error(err)
    } finally {
      setSavingBio(false)
    }
  }

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy URL:", err)
    }
  }

  return (
    <ProtectedRoute>
      <AppLayout variant="default">
        <div className={styles.page}>

          <div className={styles.header}>
            <div>
              <h1 className={styles.title}>Your Legacy</h1>
              <p className={styles.subtitle}>
                Your public profile that shows your journey on The Kaizen
              </p>
            </div>
            {isPublic && slug && (
              <button
                className={styles.viewBtn}
                onClick={() => window.open(`/legacy/${slug}`, "_blank")}
              >
                View Public Profile →
              </button>
            )}
          </div>

          <div className={styles.toggleCard}>
            <div className={styles.toggleLeft}>
              <div className={styles.toggleLabel}>LEGACY VISIBILITY</div>
              <div className={styles.toggleTitle}>
                {isPublic ? "Your Legacy is public" : "Your Legacy is private"}
              </div>
              <div className={styles.toggleDesc}>
                {isPublic
                  ? "Anyone with the link can view your profile"
                  : "Only you can see your Legacy. Make it public to share."}
              </div>
            </div>
            <button
              className={`${styles.toggle} ${isPublic ? styles.toggleOn : ""}`}
              onClick={handleTogglePublic}
            >
              <div className={styles.toggleThumb}></div>
            </button>
          </div>

          <div className={styles.urlCard}>
            <div className={styles.urlLabel}>YOUR LEGACY URL</div>
            {slug ? (
              <div className={styles.urlRow}>
                <div className={styles.urlBox}>
                  <span className={styles.urlPrefix}>thekaizen.vercel.app/legacy/</span>
                  <span className={styles.urlSlug}>{slug}</span>
                </div>
                <button className={styles.copyBtn} onClick={handleCopyUrl}>
                  {copied ? "✓ Copied" : "Copy"}
                </button>
              </div>
            ) : (
              <div className={styles.urlEmpty}>
                <p className={styles.urlEmptyText}>
                  Generate your unique URL to start sharing
                </p>
                <button
                  className={styles.generateBtn}
                  onClick={handleGenerateSlug}
                  disabled={generatingSlug || !userDoc?.soul?.name}
                >
                  {generatingSlug ? "Generating..." : "Generate URL"}
                </button>
              </div>
            )}
          </div>

          <div className={styles.bioCard}>
            <div className={styles.bioHeader}>
              <div className={styles.bioLabel}>PUBLIC BIO</div>
              {!editingBio ? (
                <button
                  className={styles.editBtn}
                  onClick={() => setEditingBio(true)}
                >
                  Edit
                </button>
              ) : (
                <div className={styles.bioActions}>
                  <button
                    className={styles.cancelBtn}
                    onClick={() => {
                      setBio(userDoc?.bioPublic || "")
                      setEditingBio(false)
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className={styles.saveBtn}
                    onClick={handleSaveBio}
                    disabled={savingBio}
                  >
                    {savingBio ? "..." : "Save"}
                  </button>
                </div>
              )}
            </div>
            {editingBio ? (
              <>
                <textarea
                  className={styles.bioInput}
                  value={bio}
                  onChange={e => setBio(e.target.value.slice(0, 280))}
                  placeholder="Tell the world about yourself in one or two sentences..."
                  rows={3}
                />
                <div className={styles.charCount}>{bio.length} / 280</div>
              </>
            ) : (
              <p className={styles.bioText}>
                {bio || "No bio set yet. Click Edit to add one."}
              </p>
            )}
          </div>

          <div className={styles.previewLabel}>WHAT VISITORS SEE</div>

          <div className={styles.previewCard}>
            <div className={styles.previewStat}>
              <div className={styles.previewStatNum}>{userDoc?.messageCount || 0}</div>
              <div className={styles.previewStatLabel}>Conversations</div>
            </div>
            <div className={styles.previewStat}>
              <div className={styles.previewStatNum}>{userDoc?.soulMemory?.length || 0}</div>
              <div className={styles.previewStatLabel}>Memories</div>
            </div>
            <div className={styles.previewStat}>
              <div className={styles.previewStatNum}>{userDoc?.streakDays || 0}</div>
              <div className={styles.previewStatLabel}>Day Streak</div>
            </div>
            <div className={styles.previewStat}>
              <div className={styles.previewStatNum}>{userDoc?.legacyViews || 0}</div>
              <div className={styles.previewStatLabel}>Profile Views</div>
            </div>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.infoTitle}>About Legacy</div>
            <p className={styles.infoText}>
              Your Legacy is automatically built as you use The Kaizen. Every conversation,
              every Kine you create, every day you show up — it all builds your public portfolio.
              Share it on LinkedIn or Twitter to show your continuous improvement journey.
            </p>
          </div>

        </div>
      </AppLayout>
    </ProtectedRoute>
  )
}
