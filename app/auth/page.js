"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { signIn, signUp, googleSignIn } from "@/lib/auth"
import LoadingScreen from "@/components/ui/LoadingScreen"
import ImageBackground from "@/components/ui/ImageBackground"
import styles from "./Auth.module.css"

export default function AuthPage() {
  const { user, userDoc, loading } = useAuth()
  const router = useRouter()
  const [mode, setMode] = useState("signin")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!loading && user) {
      if (userDoc && !userDoc.hasCompletedSoulSetup) {
        router.push("/soul-setup")
      } else if (userDoc && userDoc.hasCompletedSoulSetup) {
        router.push("/pulse")
      }
    }
  }, [user, userDoc, loading, router])

  if (loading) return <LoadingScreen />
  if (user) return <LoadingScreen />

  const getErrorMessage = (errorCode) => {
    if (!errorCode) return "Something went wrong. Please try again."
    if (errorCode.includes("invalid-credential")) return "Incorrect email or password."
    if (errorCode.includes("email-already-in-use")) return "An account with this email already exists."
    if (errorCode.includes("weak-password")) return "Password must be at least 6 characters."
    if (errorCode.includes("invalid-email")) return "Please enter a valid email address."
    if (errorCode.includes("user-not-found")) return "No account found with this email."
    if (errorCode.includes("wrong-password")) return "Incorrect password."
    if (errorCode.includes("too-many-requests")) return "Too many attempts. Please wait and try again."
    if (errorCode.includes("network-request-failed")) return "No internet connection. Please check your network."
    if (errorCode.includes("popup-closed-by-user")) return "Sign in was cancelled."
    if (errorCode.includes("unauthorized-domain")) return "Domain not authorized. Contact support."
    return "Something went wrong. Please try again."
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSubmitting(true)

    try {
      if (mode === "signup") {
        if (!name.trim()) {
          setError("Please enter your name.")
          setSubmitting(false)
          return
        }
        if (password.length < 6) {
          setError("Password must be at least 6 characters.")
          setSubmitting(false)
          return
        }
        const result = await signUp(email, password, name)
        if (result.error) {
          setError(getErrorMessage(result.error))
          setSubmitting(false)
          return
        }
      } else {
        const result = await signIn(email, password)
        if (result.error) {
          setError(getErrorMessage(result.error))
          setSubmitting(false)
          return
        }
      }
    } catch (err) {
      console.error("Auth error:", err)
      setError("Something went wrong. Please try again.")
      setSubmitting(false)
    }
  }

  const handleGoogle = async () => {
    setError("")
    setSubmitting(true)
    try {
      const result = await googleSignIn()
      if (result.error) {
        setError(getErrorMessage(result.error))
        setSubmitting(false)
      }
    } catch (err) {
      console.error("Google sign in error:", err)
      setError("Google sign in failed. Please try again.")
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.page}>
      <ImageBackground
        src="/images/backgrounds/auth-bg.jpg"
        opacity={0.72}
      />

      <div className={styles.card}>
        <div className={styles.logoWrap}>
          <img
            src="/images/kaizen-icon.png"
            alt="The Kaizen"
            width={64}
            height={64}
            className={styles.logoImg}
          />
        </div>

        <h1 className={styles.title}>
          {mode === "signup" ? "Create account" : "Welcome back"}
        </h1>
        <p className={styles.subtitle}>
          {mode === "signup"
            ? "Start your continuous improvement journey"
            : "Sign in to The Kaizen"}
        </p>

        <div className={styles.modeTabs}>
          <button
            className={`${styles.modeTab} ${mode === "signin" ? styles.modeActive : ""}`}
            onClick={() => { setMode("signin"); setError("") }}
            type="button"
          >
            Sign In
          </button>
          <button
            className={`${styles.modeTab} ${mode === "signup" ? styles.modeActive : ""}`}
            onClick={() => { setMode("signup"); setError("") }}
            type="button"
          >
            Create Account
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {mode === "signup" && (
            <div className={styles.field}>
              <label className={styles.label}>Your name</label>
              <input
                type="text"
                className={styles.input}
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="What should Kaizen 4 call you?"
                required
                autoComplete="name"
              />
            </div>
          )}

          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input
              type="email"
              className={styles.input}
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <input
              type="password"
              className={styles.input}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={mode === "signup" ? "At least 6 characters" : "Your password"}
              required
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
            />
          </div>

          {error && (
            <div className={styles.error}>
              <span>⚠</span>
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={submitting}
          >
            {submitting ? (
              <span className={styles.btnLoading}>
                <span></span>
                <span></span>
                <span></span>
              </span>
            ) : (
              mode === "signup" ? "Create Account →" : "Sign In →"
            )}
          </button>
        </form>

        <div className={styles.divider}>
          <span>or</span>
        </div>

        <button
          className={styles.googleBtn}
          onClick={handleGoogle}
          disabled={submitting}
          type="button"
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <p className={styles.legal}>
          By continuing you agree to our{" "}
          <a href="/terms">Terms</a> and{" "}
          <a href="/privacy">Privacy Policy</a>
        </p>
      </div>
    </div>
  )
}
