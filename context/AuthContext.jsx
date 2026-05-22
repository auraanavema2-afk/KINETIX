"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { onAuthChange } from "@/lib/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userDoc, setUserDoc] = useState(null);
  const docUnsubRef = useRef(null);

  useEffect(() => {
    const authUnsub = onAuthChange((firebaseUser) => {
      if (docUnsubRef.current) {
        docUnsubRef.current();
        docUnsubRef.current = null;
      }

      if (firebaseUser) {
        setUser(firebaseUser);
        if (db) {
          docUnsubRef.current = onSnapshot(
            doc(db, "users", firebaseUser.uid),
            (snap) => {
              setUserDoc(snap.exists() ? snap.data() : null);
              setLoading(false);
            }
          );
        } else {
          setLoading(false);
        }
      } else {
        setUser(null);
        setUserDoc(null);
        setLoading(false);
      }
    });

    return () => {
      authUnsub();
      if (docUnsubRef.current) docUnsubRef.current();
    };
  }, []);

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
