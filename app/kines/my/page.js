"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import AppLayout from "@/components/layout/AppLayout"
import { useAuth } from "@/context/AuthContext"
import { getUserKines, deleteKine, updateKine } from "@/lib/firestore"
import styles from "./MyKines.module.css"

export default function MyKinesPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [kines, setKines] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const unsub = getUserKines(user.uid, (data) => {
      setKines(data)
      setLoading(false)
    })
    return () => unsub()
  }, [user])

  const handleDelete = async (id, name) => {
    if (confirm(`Delete "${name}"? This cannot be undone.`)) {
      await deleteKine(id)
    }
  }

  const togglePublic = async (id, isPublic) => {
    await updateKine(id, { isPublic: !isPublic })
  }

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

          <div className={styles.header}>
            <div>
              <h1 className={styles.title}>My Kines</h1>
              <p className={styles.subtitle}>
                {kines.length} Kine{kines.length !== 1 ? "s" : ""} created
              </p>
            </div>
            <button
              className={styles.createBtn}
              onClick={() => router.push("/kines/create")}
            >
              + Create New
            </button>
          </div>

          {loading ? (
            <div className={styles.grid}>
              {[1,2,3].map(i => (
                <div key={i} className={styles.skeleton}></div>
              ))}
            </div>
          ) : kines.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>
                <img
                  src="/images/kaizen-icon.png"
                  alt="The Kaizen"
                  width={56}
                  height={56}
                  style={{
                    opacity: 0.4,
                    filter: "drop-shadow(0 0 12px rgba(255,45,45,0.5))",
                    animation: "logoFloat 3s ease-in-out infinite",
                  }}
                />
              </div>
              <p className={styles.emptyTitle}>No Kines yet</p>
              <p className={styles.emptySub}>Create your first Kine and share it with the world</p>
              <button
                className={styles.emptyBtn}
                onClick={() => router.push("/kines/create")}
              >
                Create your first Kine
              </button>
            </div>
          ) : (
            <div className={styles.grid}>
              {kines.map(kine => (
                <div key={kine.id} className={styles.kineCard}>
                  <div className={styles.cardTop}>
                    <div className={styles.avatar}>
                      {kine.emoji || "✦"}
                    </div>
                    <div className={styles.kineMeta}>
                      <div className={styles.kineName}>{kine.name}</div>
                      <div className={styles.kineCategory}>{kine.category}</div>
                    </div>
                    <div className={styles.publicTag}>
                      {kine.isPublic ? (
                        <span className={styles.publicYes}>● Public</span>
                      ) : (
                        <span className={styles.publicNo}>● Private</span>
                      )}
                    </div>
                  </div>

                  <p className={styles.kineDesc}>{kine.shortDescription}</p>

                  <div className={styles.kineStats}>
                    <div className={styles.stat}>
                      <span className={styles.statNum}>{kine.usageCount || 0}</span>
                      <span className={styles.statLabel}>uses</span>
                    </div>
                    {kine.rating > 0 && (
                      <div className={styles.stat}>
                        <span className={styles.statNum}>★ {kine.rating.toFixed(1)}</span>
                        <span className={styles.statLabel}>{kine.ratingCount} reviews</span>
                      </div>
                    )}
                  </div>

                  <div className={styles.cardActions}>
                    <button
                      className={styles.viewBtn}
                      onClick={() => router.push(`/kines/${kine.id}`)}
                    >
                      View
                    </button>
                    <button
                      className={styles.chatBtn}
                      onClick={() => router.push(`/kines/${kine.id}/chat`)}
                    >
                      Chat
                    </button>
                    <button
                      className={styles.toggleBtn}
                      onClick={() => togglePublic(kine.id, kine.isPublic)}
                      title={kine.isPublic ? "Make private" : "Make public"}
                    >
                      {kine.isPublic ? "🌐" : "🔒"}
                    </button>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => handleDelete(kine.id, kine.name)}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </AppLayout>
    </ProtectedRoute>
  )
}
