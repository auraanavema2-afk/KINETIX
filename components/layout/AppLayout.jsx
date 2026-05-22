"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { signOutUser } from "@/lib/auth";
import VideoBackground from "@/components/ui/VideoBackground";
import styles from "./AppLayout.module.css";

const NAV = [
  { section: "Core" },
  { href: "/chat",       emoji: "💬", label: "Chat" },
  { href: "/soul",       emoji: "🧠", label: "Soul" },
  { href: "/pulse",      emoji: "📊", label: "Pulse" },
  { href: "/mission",    emoji: "🎯", label: "Mission" },
  { section: "Create" },
  { href: "/projects",   emoji: "📁", label: "Projects" },
  { href: "/studio",     emoji: "🛠️",  label: "Studio" },
  { href: "/thinking",   emoji: "⚡", label: "Deep Think" },
  { section: "Explore" },
  { href: "/universe",   emoji: "🌌", label: "Universe" },
  { href: "/settings",   emoji: "⚙️",  label: "Settings" },
];

export default function AppLayout({
  children,
  videoSrc = "/videos/dashboard-bg.mp4",
  videoOpacity = 0.88,
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, userDoc } = useAuth();

  async function handleSignOut() {
    await signOutUser();
    router.push("/auth");
  }

  const initials = userDoc?.name
    ? userDoc.name.trim()[0].toUpperCase()
    : user?.email?.[0].toUpperCase() ?? "K";

  return (
    <div className={styles.shell}>
      <VideoBackground src={videoSrc} opacity={videoOpacity} />

      <aside className={styles.sidebar}>
        <div className={styles.sidebarTop}>
          <div className={styles.brand}>
            <svg
              className={styles.prismIcon}
              viewBox="0 0 24 24"
              width="22"
              height="22"
              fill="none"
            >
              <polygon
                points="12,2 22,20 2,20"
                stroke="#00d4ff"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
            <span className={styles.brandName}>KINETIX</span>
          </div>
        </div>

        <nav className={styles.nav}>
          {NAV.map((item, i) => {
            if (item.section) {
              return (
                <div key={i} className={styles.navSection}>
                  {item.section}
                </div>
              );
            }
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navItem} ${isActive ? styles.active : ""}`}
              >
                {isActive && <span className={styles.activeDot} />}
                <span className={styles.navEmoji}>{item.emoji}</span>
                <span className={styles.navLabel}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className={styles.divider} />

        <div className={styles.sidebarBottom}>
          <div className={styles.userCard}>
            <div className={styles.avatar}>{initials}</div>
            <div className={styles.userInfo}>
              <div className={styles.userName}>
                {userDoc?.name || user?.email || "User"}
              </div>
              <div className={styles.userPlan}>{userDoc?.plan ?? "spark"}</div>
            </div>
            <button
              className={styles.signOutBtn}
              onClick={handleSignOut}
              title="Sign out"
            >
              ↩
            </button>
          </div>
        </div>
      </aside>

      <main className={styles.main}>{children}</main>
    </div>
  );
}
