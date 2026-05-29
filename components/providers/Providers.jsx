"use client"

import { AuthProvider } from "@/context/AuthContext"
import AuthErrorBoundary from "./AuthErrorBoundary"

export default function Providers({ children }) {
  return (
    <AuthProvider>
      <AuthErrorBoundary>
        {children}
      </AuthErrorBoundary>
    </AuthProvider>
  )
}
