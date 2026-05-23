"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import AppLayout from "@/components/layout/AppLayout"

function SubscriptionToast() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [showToast, setShowToast] = useState(false)

  useEffect(() => {
    const success = searchParams.get("subscription")
    if (success === "success") {
      setShowToast(true)
      setTimeout(() => setShowToast(false), 4000)
      router.replace("/pulse")
    }
  }, [])

  if (!showToast) return null

  return (
    <div style={{
      position: "fixed",
      top: "20px",
      right: "20px",
      background: "rgba(0,212,255,0.1)",
      border: "1px solid rgba(0,212,255,0.25)",
      borderRadius: "12px",
      padding: "14px 20px",
      color: "#00d4ff",
      fontSize: "14px",
      fontWeight: "500",
      zIndex: 9999,
      backdropFilter: "blur(12px)",
      animation: "slideInRight 0.4s ease forwards",
      boxShadow: "0 0 20px rgba(0,212,255,0.15)",
    }}>
      ✓ Plan upgraded successfully
    </div>
  )
}

export default function PulsePage() {
  return (
    <ProtectedRoute>
      <Suspense>
        <SubscriptionToast />
      </Suspense>
      <AppLayout variant="default">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", color: "white" }}>
          Pulse — Building this soon
        </div>
      </AppLayout>
    </ProtectedRoute>
  )
}
