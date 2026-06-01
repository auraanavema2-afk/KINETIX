"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { getUserPublicProfile, incrementLegacyView } from "@/lib/firestore"
import AnimatedBackground from "@/components/ui/AnimatedBackground"
import styles from "./Legacy.module.css"

export default function PublicLegacyPage() {
  const params = useParams()
  const router = useRouter()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [copyState, setCopyState] = useState("")

  const loadProfile = async () => {
    setLoading(true)
    try {
      const data = await getUserPublicProfile(params.slug)
      if (!data || !data.isLegacyPublic) {
        setNotFound(true)
      } else {
        setProfile(data)
        incrementLegacyView(data.uid)
      }
    } catch (err) {
      console.error(err)
      setNotFound(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadProfile()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.slug])

  const handleShareLinkedIn = () => {
    const url = `${window.location.origin}/legacy/${profile.slug}`
    const text = `Check out my Legacy on The Kaizen — the AI platform built on continuous improvement.`
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&summary=${encodeURIComponent(text)}`, "_blank")
  }

  const handleShareTwitter = () => {
    const url = `${window.location.origin}/legacy/${profile.slug}`
    const text = `My Legacy on The Kaizen 🧠✨ The AI that knows me and grows with me. Built on continuous improvement.`
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, "_blank")
  }

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/legacy/${profile.slug}`
    try {
      await navigator.clipboard.writeText(url)
      setCopyState("Copied!")
      setTimeout(() => setCopyState(""), 2000)
    } catch (err) {
      console.error("Failed to copy link:", err)
    }
  }

  if (loading) {
    return (
      <>
        <AnimatedBackground variant="default" />
        <div className={styles.page}>
          <div className={styles.loadingState}>
            <div className={styles.loadingDot}></div>
            <div className={styles.loadingDot}></div>
            <div className={styles.loadingDot}></div>
          </div>
        </div>
      </>
    )
  }

  if (notFound) {
    return (
      <>
        <AnimatedBackground variant="default" />
        <div className={styles.page}>
          <div className={styles.notFoundCard}>
            <div className={styles.notFoundIcon}>✦</div>
            <h1 className={styles.notFoundTitle}>Legacy not found</h1>
            <p className={styles.notFoundText}>
              This profile does not exist or is private.
            </p>
            <button
              className={styles.notFoundBtn}
              onClick={() => router.push("/auth")}
            >
              Get your own Legacy →
            </button>
          </div>
        </div>
      </>
    )
  }

  const initials = (profile.name || "K")
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const joinDate = profile.joinedDate?.toDate
    ? profile.joinedDate.toDate().toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric"
      })
    : "Recently"

  return (
    <>
      <AnimatedBackground variant="default" />
      <div className={styles.page}>

        <nav className={styles.nav}>
          <Link className={styles.navBrand} href="/">
            <Image
              src="/images/kaizen-icon.png"
              alt="The Kaizen"
              width={24}
              height={24}
              className={styles.navLogo}
              priority
            />
            <span>THE KAIZEN</span>
          </Link>
          <Link className={styles.navBtn} href="/auth">
            Get your Legacy →
          </Link>
        </nav>

        <div className={styles.profileCard}>
          <div className={styles.profileGlow}></div>

          <div className={styles.avatarWrap}>
            <div className={styles.avatar}>
              {profile.avatar ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={profile.avatar} alt={profile.name} />
              </>
            ) : (
              initials
            )}
            </div>
            <div className={styles.avatarRing}></div>
          </div>

          <h1 className={styles.profileName}>{profile.name || "Builder"}</h1>

          {profile.publicBio && (
            <p className={styles.profileBio}>{profile.publicBio}</p>
          )}

          <div className={styles.profileMeta}>
            <span className={styles.metaItem}>
              <span className={styles.metaIcon}>🎯</span>
              {profile.bigGoal || "Building meaningful things"}
            </span>
            <span className={styles.metaDivider}>·</span>
            <span className={styles.metaItem}>Joined {joinDate}</span>
          </div>

          <div className={styles.shareRow}>
            <button className={styles.shareBtn} onClick={handleShareLinkedIn}>
              <span>in</span> LinkedIn
            </button>
            <button className={styles.shareBtn} onClick={handleShareTwitter}>
              <span>𝕏</span> Twitter
            </button>
            <button className={styles.shareBtn} onClick={handleCopyLink}>
              <span>⎘</span> {copyState || "Copy Link"}
            </button>
          </div>
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statNum}>{profile.conversationCount || 0}</div>
            <div className={styles.statLabel}>Conversations</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNum}>{profile.memoryCount || 0}</div>
            <div className={styles.statLabel}>Memories</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNum}>{profile.kineCount || 0}</div>
            <div className={styles.statLabel}>Kines Built</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNum}>{profile.streakDays || 0}</div>
            <div className={styles.statLabel}>Day Streak</div>
          </div>
        </div>

        {profile.recentKines && profile.recentKines.length > 0 && (
          <div className={styles.kinesSection}>
            <h2 className={styles.sectionTitle}>Public Kines</h2>
            <div className={styles.kinesGrid}>
              {profile.recentKines.map(kine => (
                <Link
                  key={kine.id}
                  className={styles.kineCard}
                  href={`/kines/${kine.id}`}
                >
                  <div className={styles.kineAvatar}>{kine.emoji || "✦"}</div>
                  <div className={styles.kineInfo}>
                    <div className={styles.kineName}>{kine.name}</div>
                    <div className={styles.kineUses}>{kine.usageCount || 0} uses</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className={styles.philosophyCard}>
          <div className={styles.philosophyLabel}>PHILOSOPHY</div>
          <p className={styles.philosophyText}>
            Built on <strong>kaizen</strong> — the Japanese principle of continuous improvement.
            Small daily progress compounds into massive transformation.
          </p>
        </div>

        <div className={styles.ctaCard}>
          <h3 className={styles.ctaTitle}>Build your own Legacy</h3>
          <p className={styles.ctaText}>
            Join The Kaizen. The AI that knows you, remembers everything, and grows with you every day.
          </p>
          <button
            className={styles.ctaBtn}
            onClick={() => router.push("/auth")}
          >
            Start Free →
          </button>
        </div>

        <footer className={styles.footer}>
          <p>Made with The Kaizen · <Link href="/">thekaizen.vercel.app</Link></p>
        </footer>

      </div>
    </>
  )
}
