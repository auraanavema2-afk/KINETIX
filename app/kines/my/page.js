"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import AppLayout from "@/components/layout/AppLayout"
import { useAuth } from "@/context/AuthContext"
import { getUserKines, deleteKine } from "@/lib/firestore"
import styles from "./MyKines.module.css"

export default function MyKinesPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [kines, setKines] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    if (!user) return
    const unsub = getUserKines(user.uid, (data) => {
      setKines(data)
      setLoading(false)
    })
    return () => unsub()
  }, [user])

  const handleDelete = async (kine) => {
    if (!confirm(`Delete "${kine.name}"? This cannot be undone.`)) return
    setDeletingId(kine.id)
    try {
      await deleteKine(kine.id)
    } catch (err) {
      console.error(err)
    } finally {
      setDeletingId(null)
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
            <div>
              <h1 className={styles.title}>My Kines</h1>
              <p className={styles.subtitle}>{kines.length} kine{kines.length !== 1 ? "s" : ""} created</p>
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
              {[1, 2, 3].map(i => (
                <div key={i} className={styles.skeleton} />
              ))}
            </div>
          ) : kines.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>🌌</div>
              <p className={styles.emptyTitle}>No Kines yet</p>
              <p className={styles.emptySub}>Create your first AI persona</p>
              <button
                className={styles.emptyBtn}
                onClick={() => router.push("/kines/create")}
              >
                Create a Kine
              </button>
            </div>
          ) : (
            <div className={styles.list}>
              {kines.map(kine => (
                <div key={kine.id} className={styles.kineRow}>
                  <div className={styles.kineLeft}>
                    <div className={styles.kineAvatar}>{kine.emoji || "✦"}</div>
                    <div className={styles.kineInfo}>
                      <div className={styles.kineName}>{kine.name}</div>
                      <div className={styles.kineMeta}>
                        <span className={styles.catTag}>{kine.category || "general"}</span>
                        <span className={styles.metaDot}>·</span>
                        <span className={styles.metaText}>{kine.usageCount || 0} uses</span>
                        {kine.rating > 0 && (
                          <>
                            <span className={styles.metaDot}>·</span>
                            <span className={styles.metaRating}>★ {kine.rating.toFixed(1)}</span>
                          </>
                        )}
                        <span className={styles.metaDot}>·</span>
                        <span className={`${styles.visTag} ${kine.isPublic ? styles.visPublic : styles.visPrivate}`}>
                          {kine.isPublic ? "Public" : "Private"}
                        </span>
                      </div>
                      <p className={styles.kineDesc}>{kine.shortDescription}</p>
                    </div>
                  </div>

                  <div className={styles.kineActions}>
                    <button
                      className={styles.chatBtn}
                      onClick={() => router.push(`/kines/${kine.id}/chat`)}
                    >
                      Chat
                    </button>
                    <button
                      className={styles.editBtn}
                      onClick={() => router.push(`/kines/${kine.id}/edit`)}
                    >
                      Edit
                    </button>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => handleDelete(kine)}
                      disabled={deletingId === kine.id}
                    >
                      {deletingId === kine.id ? "..." : "Delete"}
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
