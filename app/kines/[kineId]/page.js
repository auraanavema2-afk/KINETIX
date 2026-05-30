"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import AppLayout from "@/components/layout/AppLayout"
import { useAuth } from "@/context/AuthContext"
import { getKineById, rateKine } from "@/lib/firestore"
import styles from "./KineDetail.module.css"

export default function KineDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [kine, setKine] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userRating, setUserRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [ratingSubmitted, setRatingSubmitted] = useState(false)

  const loadKine = async () => {
    setLoading(true)
    try {
      const data = await getKineById(params.kineId)
      setKine(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadKine()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.kineId])

  const handleRate = async (rating) => {
    if (!user || ratingSubmitted) return
    setUserRating(rating)
    setRatingSubmitted(true)
    try {
      await rateKine(params.kineId, user.uid, rating)
      setTimeout(() => loadKine(), 800)
    } catch (err) {
      console.error(err)
      setRatingSubmitted(false)
    }
  }

  const handleStartChat = () => {
    router.push(`/kines/${params.kineId}/chat`)
  }

  const handleShare = async () => {
    const url = `${window.location.origin}/kines/${params.kineId}`
    try {
      await navigator.clipboard.writeText(url)
      alert("Link copied to clipboard")
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <AppLayout variant="universe">
          <div className={styles.page}>
            <div className={styles.skeleton}></div>
          </div>
        </AppLayout>
      </ProtectedRoute>
    )
  }

  if (!kine) {
    return (
      <ProtectedRoute>
        <AppLayout variant="universe">
          <div className={styles.page}>
            <div className={styles.notFound}>
              <p>Kine not found</p>
              <button onClick={() => router.push("/kines")}>
                ← Back to Kines
              </button>
            </div>
          </div>
        </AppLayout>
      </ProtectedRoute>
    )
  }

  const isOwner = user?.uid === kine.userId

  return (
    <ProtectedRoute>
      <AppLayout variant="universe">
        <div className={styles.page}>
          <button
            className={styles.backBtn}
            onClick={() => router.push("/kines")}
          >
            ← All Kines
          </button>

          <div className={styles.heroCard}>
            <div className={styles.heroLeft}>
              <div className={styles.heroAvatar}>
                {kine.emoji || "✦"}
              </div>
              <div className={styles.heroAvatarRing}></div>
            </div>

            <div className={styles.heroContent}>
              <div className={styles.categoryTag}>
                {kine.category || "general"}
              </div>
              <h1 className={styles.kineName}>{kine.name}</h1>
              <p className={styles.creator}>
                Created by <span className={styles.creatorName}>{kine.creatorName || "Anonymous"}</span>
              </p>
              <p className={styles.description}>
                {kine.shortDescription || "No description provided"}
              </p>

              <div className={styles.heroActions}>
                <button
                  className={styles.chatBtn}
                  onClick={handleStartChat}
                >
                  💬 Chat with {kine.name}
                </button>
                <button
                  className={styles.shareBtn}
                  onClick={handleShare}
                >
                  ↗ Share
                </button>
                {isOwner && (
                  <button
                    className={styles.editBtn}
                    onClick={() => router.push(`/kines/${params.kineId}/edit`)}
                  >
                    ✎ Edit
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className={styles.statsRow}>
            <div className={styles.statCard}>
              <div className={styles.statNum}>{kine.usageCount || 0}</div>
              <div className={styles.statLabel}>Total Uses</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNum}>
                {kine.rating > 0 ? kine.rating.toFixed(1) : "—"}
              </div>
              <div className={styles.statLabel}>Average Rating</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNum}>{kine.ratingCount || 0}</div>
              <div className={styles.statLabel}>Reviews</div>
            </div>
          </div>

          <div className={styles.personaCard}>
            <div className={styles.personaHeader}>
              <h2 className={styles.sectionTitle}>About this Kine</h2>
            </div>
            <p className={styles.personaText}>
              {kine.persona || "No persona description provided."}
            </p>
          </div>

          {user && !isOwner && (
            <div className={styles.ratingCard}>
              <h3 className={styles.sectionTitle}>Rate this Kine</h3>
              <div className={styles.starsRow}>
                {[1,2,3,4,5].map(star => (
                  <button
                    key={star}
                    className={`${styles.star} ${(hoverRating || userRating) >= star ? styles.starActive : ""}`}
                    onClick={() => handleRate(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    disabled={ratingSubmitted}
                  >
                    ★
                  </button>
                ))}
              </div>
              {ratingSubmitted && (
                <p className={styles.ratingThanks}>Thanks for rating!</p>
              )}
            </div>
          )}

          <div className={styles.bottomCta}>
            <button
              className={styles.bigChatBtn}
              onClick={handleStartChat}
            >
              Start chatting with {kine.name}
            </button>
          </div>
        </div>
      </AppLayout>
    </ProtectedRoute>
  )
}
