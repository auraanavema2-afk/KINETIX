"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react"
import { doc, getDoc, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { onAuthChange } from "@/lib/auth"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [userDoc, setUserDoc] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let unsubscribeDoc = null

    const unsubscribeAuth = onAuthChange(async (firebaseUser) => {
      if (unsubscribeDoc) {
        unsubscribeDoc()
        unsubscribeDoc = null
      }

      if (firebaseUser) {
        setUser(firebaseUser)

        try {
          const userRef = doc(db, "users", firebaseUser.uid)

          unsubscribeDoc = onSnapshot(
            userRef,
            (snap) => {
              if (snap.exists()) {
                setUserDoc({ id: snap.id, ...snap.data() })
              } else {
                setUserDoc(null)
              }
              setLoading(false)
            },
            (error) => {
              console.error("Firestore snapshot error:", error)
              setLoading(false)
            }
          )
        } catch (error) {
          console.error("Auth context error:", error)
          setLoading(false)
        }
      } else {
        setUser(null)
        setUserDoc(null)
        setLoading(false)
      }
    })

    return () => {
      unsubscribeAuth()
      if (unsubscribeDoc) unsubscribeDoc()
    }
  }, [])

  const refreshUserDoc = useCallback(async () => {
    if (!user) return
    try {
      const snap = await getDoc(doc(db, "users", user.uid))
      if (snap.exists()) {
        setUserDoc({ id: snap.id, ...snap.data() })
      }
    } catch (error) {
      console.error("Failed to refresh user doc:", error)
    }
  }, [user])

  const value = {
    user,
    userDoc,
    setUserDoc,
    loading,
    refreshUserDoc,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}

export default AuthProvider
