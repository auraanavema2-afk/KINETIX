"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import AppLayout from "@/components/layout/AppLayout"
import { useAuth } from "@/context/AuthContext"
import { createArena, getUserArenas } from "@/lib/firestore"
import styles from "./Arena.module.css"

export default function ArenaPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [arenas, setArenas] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState("")
  const [showCreate, setShowCreate] = useState(false)

  useEffect(() => {
    if (!user || authLoading) return
    const unsub = getUserArenas(user.uid, (data) => {
      setArenas(data)
      setLoading(false)
    })
    return () => unsub()
  }, [user, authLoading])

  const handleCreate = async () => {
    if (!newName.trim() || !user || creating) return
    setCreating(true)
    try {
      const id = await createArena(user.uid, newName.trim())
      router.push(`/arena/${id}`)
    } catch (err) {
      console.error(err)
      setCreating(false)
    }
  }

  const handleQuickCreate = async () => {
    if (!user || creating) return
    setCreating(true)
    try {
      const name = `Arena ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`
      const id = await createArena(user.uid, name)
      router.push(`/arena/${id}`)
    } catch (err) {
      console.error(err)
      setCreating(false)
    }
  }

  if (authLoading) {
    return (
      <ProtectedRoute>
        <AppLayout variant="default">
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            gap: "6px",
          }}>
            <div className={styles.skeleton} style={{ width: 6, height: 6, borderRadius: "50%", animation: "shimmer 1s infinite" }}></div>
            <div className={styles.skeleton} style={{ width: 6, height: 6, borderRadius: "50%", animation: "shimmer 1s infinite 0.2s" }}></div>
            <div className={styles.skeleton} style={{ width: 6, height: 6, borderRadius: "50%", animation: "shimmer 1s infinite 0.4s" }}></div>
          </div>
        </AppLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <AppLayout variant="default">
        <div className={styles.page}>
          <div className={styles.header}>
            <div>
              <h1 className={styles.title}>Kaizen Arena</h1>
              <p className={styles.subtitle}>
                Real-time collaboration with Kaizen 4 as your shared AI brain
              </p>
            </div>
            <div className={styles.headerActions}>
              <button
                className={styles.quickBtn}
                onClick={handleQuickCreate}
                disabled={creating}
              >
                {creating ? "Creating..." : "⚡ Quick Arena"}
              </button>
              <button
                className={styles.createBtn}
                onClick={() => setShowCreate(true)}
              >
                + Named Arena
              </button>
            </div>
          </div>

          {showCreate && (
            <div className={styles.createCard}>
              <div className={styles.createRow}>
                <input
                  className={styles.createInput}
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter") handleCreate()
                    if (e.key === "Escape") {
                      setShowCreate(false)
                      setNewName("")
                    }
                  }}
                  placeholder="Arena name e.g. Product Brainstorm..."
                  autoFocus
                />
                <button
                  className={styles.createSave}
                  onClick={handleCreate}
                  disabled={!newName.trim() || creating}
                >
                  {creating ? "..." : "Create"}
                </button>
                <button
                  className={styles.createCancel}
                  onClick={() => {
                    setShowCreate(false)
                    setNewName("")
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className={styles.howItWorks}>
            <div className={styles.howLabel}>HOW IT WORKS</div>
            <div className={styles.howSteps}>
              <div className={styles.howStep}>
                <div className={styles.howNum}>1</div>
                <div className={styles.howText}>Create an Arena and share the link</div>
              </div>
              <div className={styles.howArrow}>→</div>
              <div className={styles.howStep}>
                <div className={styles.howNum}>2</div>
                <div className={styles.howText}>Friends join and everyone chats together</div>
              </div>
              <div className={styles.howArrow}>→</div>
              <div className={styles.howStep}>
                <div className={styles.howNum}>3</div>
                <div className={styles.howText}>Kaizen 4 is your shared AI brain for the group</div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className={styles.grid}>
              {[1,2,3].map(i => (
                <div key={i} className={styles.skeleton}></div>
              ))}
            </div>
          ) : arenas.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>🤝</div>
              <p className={styles.emptyTitle}>No arenas yet</p>
              <p className={styles.emptySub}>
                Create your first Arena and invite collaborators
              </p>
              <button
                className={styles.emptyBtn}
                onClick={handleQuickCreate}
                disabled={creating}
              >
                {creating ? "Creating..." : "Create your first Arena"}
              </button>
            </div>
          ) : (
            <div className={styles.grid}>
              {arenas.map(arena => (
                <div
                  key={arena.id}
                  className={styles.arenaCard}
                  onClick={() => router.push(`/arena/${arena.id}`)}
                >
                  <div className={styles.arenaHeader}>
                    <div className={styles.arenaName}>{arena.name}</div>
                    <div className={`${styles.arenaStatus} ${arena.isActive ? styles.statusActive : ""}`}>
                      {arena.isActive ? "● Live" : "● Closed"}
                    </div>
                  </div>
                  <div className={styles.arenaMeta}>
                    <span>{arena.members?.length || 1} member{arena.members?.length !== 1 ? "s" : ""}</span>
                    <span>·</span>
                    <span>{arena.messageCount || 0} messages</span>
                  </div>
                  <div className={styles.arenaFooter}>
                    <button
                      className={styles.joinBtn}
                      onClick={e => {
                        e.stopPropagation()
                        router.push(`/arena/${arena.id}`)
                      }}
                    >
                      Join Arena →
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
