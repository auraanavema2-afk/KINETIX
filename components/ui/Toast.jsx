"use client"

import { useState, useEffect, createContext, useContext, useCallback } from "react"
import styles from "./Toast.module.css"

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = "info", duration = 3500) => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, duration)
  }, [])

  const success = useCallback((msg) => addToast(msg, "success"), [addToast])
  const error = useCallback((msg) => addToast(msg, "error"), [addToast])
  const info = useCallback((msg) => addToast(msg, "info"), [addToast])

  return (
    <ToastContext.Provider value={{ success, error, info }}>
      {children}
      <div className={styles.container}>
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`${styles.toast} ${styles[toast.type]}`}
          >
            <span className={styles.icon}>
              {toast.type === "success" ? "✓" :
               toast.type === "error" ? "✕" : "ℹ"}
            </span>
            <span className={styles.message}>{toast.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error("useToast must be used within ToastProvider")
  return context
}
