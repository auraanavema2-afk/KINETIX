"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import AuthCard from "@/components/auth/AuthCard";
import FloatingInput from "@/components/auth/FloatingInput";
import GoogleButton from "@/components/auth/GoogleButton";
import SubmitButton from "@/components/auth/SubmitButton";
import OrDivider from "@/components/auth/OrDivider";
import { signInWithEmail, signUpWithEmail, signInWithGoogle } from "@/lib/auth";

const FIREBASE_ERRORS = {
  "auth/user-not-found": "No account found with this email.",
  "auth/wrong-password": "Incorrect password.",
  "auth/invalid-credential": "Incorrect email or password.",
  "auth/email-already-in-use": "An account with this email already exists.",
  "auth/weak-password": "Password must be at least 6 characters.",
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/too-many-requests": "Too many attempts. Please try again later.",
  "auth/popup-closed-by-user": "Sign-in popup was closed. Please try again.",
  "auth/network-request-failed": "Network error. Check your connection.",
};

function friendlyError(code) {
  return FIREBASE_ERRORS[code] || "Something went wrong. Please try again.";
}

async function getRedirectPath(uid) {
  if (!db) return "/soul";
  try {
    const snap = await getDoc(doc(db, "users", uid));
    if (snap.exists() && snap.data().hasCompletedSoulSetup) return "/soul";
  } catch (_) {}
  return "/soul-setup";
}

export default function AuthPageClient() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSignIn, setIsSignIn] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function switchMode(toSignIn) {
    setIsSignIn(toSignIn);
    setError("");
    setPassword("");
    setConfirmPassword("");
  }

  async function handleGoogle() {
    setError("");
    setLoading(true);
    try {
      const user = await signInWithGoogle();
      const path = await getRedirectPath(user.uid);
      router.push(path);
    } catch (err) {
      setError(friendlyError(err.code));
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!isSignIn && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      let user;
      if (isSignIn) {
        user = await signInWithEmail(email, password);
      } else {
        user = await signUpWithEmail(email, password);
      }
      const path = await getRedirectPath(user.uid);
      router.push(path);
    } catch (err) {
      setError(friendlyError(err.code));
      setLoading(false);
    }
  }

  return (
    <AuthCard>
      {/* Mode tabs */}
      <div
        style={{
          display: "flex",
          marginBottom: "24px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <button
          onClick={() => switchMode(true)}
          style={{
            flex: 1,
            padding: "12px",
            background: "none",
            border: "none",
            borderBottom: isSignIn ? "2px solid #7c3aed" : "2px solid transparent",
            color: isSignIn ? "white" : "#52525b",
            cursor: "pointer",
            fontSize: "14px",
            transition: "all 0.2s ease",
          }}
        >
          Sign In
        </button>
        <button
          onClick={() => switchMode(false)}
          style={{
            flex: 1,
            padding: "12px",
            background: "none",
            border: "none",
            borderBottom: !isSignIn ? "2px solid #7c3aed" : "2px solid transparent",
            color: !isSignIn ? "white" : "#52525b",
            cursor: "pointer",
            fontSize: "14px",
            transition: "all 0.2s ease",
          }}
        >
          Create Account
        </button>
      </div>

      <GoogleButton onClick={handleGoogle} loading={loading} />

      <OrDivider />

      <form onSubmit={handleSubmit}>
        <FloatingInput
          id="email"
          label="Email address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <FloatingInput
          id="password"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {!isSignIn && (
          <FloatingInput
            id="confirmPassword"
            label="Confirm password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        )}
        {error && (
          <div
            style={{
              color: "#ef4444",
              fontSize: "13px",
              textAlign: "center",
              marginBottom: "12px",
              padding: "10px 12px",
              background: "rgba(239,68,68,0.1)",
              borderRadius: "8px",
            }}
          >
            {error}
          </div>
        )}
        <SubmitButton loading={loading}>
          {isSignIn ? "Sign In" : "Create Account"}
        </SubmitButton>
      </form>

      {/* Switch mode link */}
      <div
        style={{
          textAlign: "center",
          marginTop: "20px",
          fontSize: "13px",
          color: "#52525b",
        }}
      >
        {isSignIn ? (
          <>
            Don&apos;t have an account?{" "}
            <button
              onClick={() => switchMode(false)}
              style={{
                background: "none",
                border: "none",
                color: "#a78bfa",
                cursor: "pointer",
                fontSize: "13px",
              }}
            >
              Create one
            </button>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <button
              onClick={() => switchMode(true)}
              style={{
                background: "none",
                border: "none",
                color: "#a78bfa",
                cursor: "pointer",
                fontSize: "13px",
              }}
            >
              Sign in
            </button>
          </>
        )}
      </div>
    </AuthCard>
  );
}
