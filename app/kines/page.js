"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import AppLayout from "@/components/layout/AppLayout"
import { getPublicKines } from "@/lib/firestore"
import styles from "./Kines.module.css"

const CATEGORIES = [
  { key: "all",       label: "All",       emoji: "✨" },
  { key: "education", label: "Education", emoji: "📚" },
  { key: "business",  label: "Business",  emoji: "💼" },
  { key: "creative",  label: "Creative",  emoji: "🎨" },
  { key: "technical", label: "Technical", emoji: "⚡" },
  { key: "lifestyle", label: "Lifestyle", emoji: "🌱" },
  { key: "fun",       label: "Fun",       emoji: "🎮" },
]

const SORT_OPTIONS = [
  { key: "popular", label: "Most Popular" },
  { key: "newest",  label: "Newest First" },
  { key: "rating",  label: "Top Rated"    },
  { key: "alpha",   label: "A to Z"       },
]

export default function KinesPage() {
  const router = useRouter()
  const [kines, setKines] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")
  const [sort, setSort] = useState("popular")

  useEffect(() => {
    try {
      const unsub = getPublicKines((data) => {
        setKines(data)
        setLoading(false)
      })
      return () => unsub()
    } catch (err) {
      console.error(err)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError("Failed to load Kines. Please refresh.")
      setLoading(false)
    }
  }, [])

  const filteredKines = kines
    .filter(k => category === "all" || k.category === category)
    .filter(k => {
      if (!search.trim()) return true
      const q = search.toLowerCase()
      return (
        k.name?.toLowerCase().includes(q) ||
        k.shortDescription?.toLowerCase().includes(q) ||
        k.creatorName?.toLowerCase().includes(q)
      )
    })
    .sort((a, b) => {
      if (sort === "popular") return (b.usageCount || 0) - (a.usageCount || 0)
      if (sort === "newest")  return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
      if (sort === "rating")  return (b.rating || 0) - (a.rating || 0)
      if (sort === "alpha")   return (a.name || "").localeCompare(b.name || "")
      return 0
    })

  return (
    <ProtectedRoute>
      <AppLayout variant="universe">
        <div className={styles.page}>
          <div className={styles.header}>
            <div>
              <h1 className={styles.title}>Kines</h1>
              <p className={styles.subtitle}>
                {kines.length} specialised AI agents built by the community
              </p>
            </div>
            <div className={styles.headerActions}>
              <button
                className={styles.myKinesBtn}
                onClick={() => router.push("/kines/my")}
              >
                My Kines
              </button>
              <button
                className={styles.createBtn}
                onClick={() => router.push("/kines/create")}
              >
                + Create Kine
              </button>
            </div>
          </div>

          <div className={styles.controls}>
            <div className={styles.searchWrap}>
              <span className={styles.searchIcon}>🔍</span>
              <input
                className={styles.search}
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search Kines by name, description, or creator..."
              />
              {search && (
                <button
                  className={styles.searchClear}
                  onClick={() => setSearch("")}
                >×</button>
              )}
            </div>
            <select
              className={styles.sortSelect}
              value={sort}
              onChange={e => setSort(e.target.value)}
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.key} value={opt.key}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className={styles.categories}>
            {CATEGORIES.map(cat => (
              <button
                key={cat.key}
                className={`${styles.catBtn} ${category === cat.key ? styles.catActive : ""}`}
                onClick={() => setCategory(cat.key)}
              >
                <span className={styles.catEmoji}>{cat.emoji}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {error && (
            <div className={styles.errorBanner}>
              {error}
              <button onClick={() => window.location.reload()}>Refresh</button>
            </div>
          )}

          {loading ? (
            <div className={styles.grid}>
              {[1,2,3,4,5,6,7,8].map(i => (
                <div key={i} className={styles.skeleton}></div>
              ))}
            </div>
          ) : filteredKines.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>🌌</div>
              <p className={styles.emptyTitle}>
                {search || category !== "all" ? "No Kines found" : "No Kines yet"}
              </p>
              <p className={styles.emptySub}>
                {search || category !== "all"
                  ? "Try a different search or category"
                  : "Be the first to create a Kine"}
              </p>
              {!search && category === "all" && (
                <button
                  className={styles.emptyBtn}
                  onClick={() => router.push("/kines/create")}
                >
                  Create the first Kine
                </button>
              )}
            </div>
          ) : (
            <div className={styles.grid}>
              {filteredKines.map(kine => (
                <div
                  key={kine.id}
                  className={styles.kineCard}
                  onClick={() => router.push(`/kines/${kine.id}`)}
                >
                  <div className={styles.kineHeader}>
                    <div className={styles.kineAvatar}>
                      {kine.emoji || "✦"}
                    </div>
                    <div className={styles.kineInfo}>
                      <div className={styles.kineName}>{kine.name}</div>
                      <div className={styles.kineCreator}>
                        by {kine.creatorName || "Anonymous"}
                      </div>
                    </div>
                  </div>
                  <p className={styles.kineDesc}>
                    {kine.shortDescription || "No description provided"}
                  </p>
                  <div className={styles.kineFooter}>
                    <div className={styles.kineStats}>
                      <span className={styles.kineUses}>
                        {kine.usageCount || 0} uses
                      </span>
                      {kine.rating > 0 && (
                        <span className={styles.kineRating}>
                          ★ {kine.rating.toFixed(1)}
                        </span>
                      )}
                    </div>
                    <button
                      className={styles.kineChatBtn}
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/kines/${kine.id}/chat`)
                      }}
                    >
                      Chat
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
