"use client"

import { useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter, usePathname } from "next/navigation"

// Routes that REQUIRE authentication. Anything not listed here (including
// genuine 404 URLs) is left alone so Next.js can render not-found.js instead
// of bouncing the visitor to /auth.
const PROTECTED_PREFIXES = [
  "/pulse",
  "/chat",
  "/mission",
  "/studio",
  "/arena",
  "/kines",
  "/thinking",
  "/soul",
  "/soul-setup",
  "/settings",
  "/projects",
  "/universe",
]

export default function AuthErrorBoundary({ children }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (loading) return

    // /legacy/<slug> is a public profile; /legacy on its own is protected settings
    const isLegacySettings = pathname === "/legacy"

    const isProtected =
      isLegacySettings ||
      PROTECTED_PREFIXES.some(prefix =>
        pathname === prefix || pathname.startsWith(prefix + "/")
      )

    if (!user && isProtected) {
      router.push("/auth")
    }
  }, [user, loading, pathname, router])

  return children
}

