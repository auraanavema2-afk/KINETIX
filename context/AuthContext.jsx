"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { onAuthChange } from "@/lib/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userDoc, setUserDoc] = useState(null);
  const docUnsubRef = useRef(null);

  useEffect(() => {
    const authUnsub = onAuthChange(async (firebaseUser) => {
      if (docUnsubRef.current) {
        docUnsubRef.current();
        docUnsubRef.current = null;
      }

      try {
        if (firebaseUser) {
          try {
            await firebaseUser.getIdToken(true)
          } catch (tokenError) {
            console.error("Token expired:", tokenError)
            setUser(null)
            setUserDoc(null)
            setLoading(false)
            return
          }
          setUser(firebaseUser)
          if (db) {
            try {
              const docRef = doc(db, "users", firebaseUser.uid)
              const docSnap = await getDoc(docRef)
              if (docSnap.exists()) setUserDoc(docSnap.data())
            } catch (firestoreError) {
              console.error("Failed to fetch user doc:", firestoreError)
            }
          }
          setLoading(false)
        } else {
          setUser(null)
          setUserDoc(null)
          setLoading(false)
        }
      } catch (err) {
        console.error("Auth state error:", err)
        setUser(null)
        setUserDoc(null)
        setLoading(false)
      }
    });

    return () => {
      authUnsub();
      if (docUnsubRef.current) docUnsubRef.current();
    };
  }, []);

  useEffect(() => {
    if (!user) return
    const interval = setInterval(async () => {
      try {
        await user.getIdToken(true)
      } catch (err) {
        console.error("Token refresh failed:", err)
        setUser(null)
        setUserDoc(null)
      }
    }, 50 * 60 * 1000)
    return () => clearInterval(interval)
  }, [user])

  return (
    <AuthContext.Provider value={{ user, userDoc, loading, setUserDoc }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
