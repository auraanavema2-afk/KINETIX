"use client"

import { AuthProvider } from "@/context/AuthContext"
import AuthErrorBoundary from "./AuthErrorBoundary"
import { ToastProvider } from "@/components/ui/Toast"

export default function Providers({ children }) {
  return (
    <AuthProvider>
      <AuthErrorBoundary>
        <ToastProvider>
          {children}
        </ToastProvider>
      </AuthErrorBoundary>
    </AuthProvider>
  )
}
