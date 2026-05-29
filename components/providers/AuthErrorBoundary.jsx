"use client"

import { useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter, usePathname } from "next/navigation"

const PUBLIC_ROUTES = [
  "/auth",
  "/pricing",
  "/terms",
  "/privacy",
  "/refund",
]

export default function AuthErrorBoundary({ children }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (loading) return

    const isPublicRoute = PUBLIC_ROUTES.some(route =>
      pathname.startsWith(route)
    )

    const isLegacyPublic =
      pathname.startsWith("/legacy/") &&
      !pathname.endsWith("/legacy")

    if (!user && !isPublicRoute && !isLegacyPublic) {
      router.push("/auth")
    }
  }, [user, loading, pathname, router])

  return children
}
