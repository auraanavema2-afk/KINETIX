"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { signOutUser } from "@/lib/auth";
import { getUserConversations, createConversation } from "@/lib/firestore";
import AnimatedBackground from "@/components/ui/AnimatedBackground";
import styles from "./AppLayout.module.css";

const CORE_NAV = [
  { href: "/chat",    emoji: "💬", label: "Chat" },
  { href: "/soul",    emoji: "🧠", label: "Soul" },
  { href: "/pulse",   emoji: "📊", label: "Pulse" },
  { href: "/mission", emoji: "🎯", label: "Mission" },
];

const TOOLS_NAV = [
  { section: "Create" },
  { href: "/projects",  emoji: "📁", label: "Projects" },
  { href: "/studio",    emoji: "🛠️",  label: "Studio" },
  { href: "/thinking",  emoji: "⚡", label: "Deep Think" },
  { section: "Explore" },
  { href: "/universe",  emoji: "🌌", label: "Universe" },
  { href: "/settings",  emoji: "⚙️",  label: "Settings" },
];

export default function AppLayout({
  children,
  variant = "default",
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, userDoc } = useAuth();

  const [conversations, setConversations] = useState([]);
  const [convLoading, setConvLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const unsub = getUserConversations(user.uid, (convs) => {
        setConversations(convs);
        setConvLoading(false);
      });
      return () => unsub();
    } else {
      setConvLoading(false);
    }
  }, [user]);

  async function handleSignOut() {
    await signOutUser();
    router.push("/auth");
  }

  const handleNewChat = async () => {
    if (!user) return;
    const newId = await createConversation(user.uid);
    router.push(`/chat/${newId}`);
  };

  const initials = userDoc?.name
    ? userDoc.name.trim()[0].toUpperCase()
    : user?.email?.[0].toUpperCase() ?? "K";

  const renderNavItem = (item) => {
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
  };

  return (
    <div className={styles.shell}>
      <AnimatedBackground variant={variant} />

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

        <div className={styles.coreNav}>
          <div className={styles.navSectionLabel}>Core</div>
          {CORE_NAV.map(renderNavItem)}
        </div>

        <div className={styles.convSection}>
          <div className={styles.convHeader}>
            <span className={styles.navSectionLabel}>CHATS</span>
            <button className={styles.newConvBtn} onClick={handleNewChat} title="New chat">+</button>
          </div>
          <div className={styles.convList}>
            {convLoading ? (
              <div className={styles.convLoading}>
                {[1, 2, 3].map(i => (
                  <div key={i} className={styles.convSkeleton}></div>
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div className={styles.convEmpty}>No conversations yet</div>
            ) : (
              conversations.map(conv => (
                <Link
                  key={conv.id}
                  href={`/chat/${conv.id}`}
                  className={`${styles.convItem} ${pathname === `/chat/${conv.id}` ? styles.convActive : ""}`}
                >
                  <span className={styles.convTitle}>{conv.title || "New Conversation"}</span>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className={styles.toolsNav}>
          {TOOLS_NAV.map((item, i) => {
            if (item.section) {
              return <div key={i} className={styles.navSectionLabel}>{item.section}</div>;
            }
            return renderNavItem(item);
          })}
        </div>

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
