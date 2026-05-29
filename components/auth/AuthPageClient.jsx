"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { signInWithGoogle, signInWithEmail, signUpWithEmail } from "@/lib/auth";
import AuthCard from "@/components/auth/AuthCard";
import FloatingInput from "@/components/auth/FloatingInput";
import GoogleButton from "@/components/auth/GoogleButton";
import SubmitButton from "@/components/auth/SubmitButton";
import OrDivider from "@/components/auth/OrDivider";
import LoadingScreen from "@/components/ui/LoadingScreen";
import styles from "./AuthPageClient.module.css";

export default function AuthPageClient() {
  const router = useRouter();
  const { user, userDoc, loading: authLoading } = useAuth();

  if (authLoading) return <LoadingScreen />;
  if (user) return <LoadingScreen />;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSignIn, setIsSignIn] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user && userDoc) {
      if (userDoc.hasCompletedSoulSetup) {
        router.push("/pulse");
      } else {
        router.push("/soul-setup");
      }
    }
  }, [user, userDoc, router]);

  function switchMode(toSignIn) {
    setIsSignIn(toSignIn);
    setError("");
    setPassword("");
    setConfirmPassword("");
  }

  const handleGoogle = async () => {
    setLoading(true);
    setError("");
    try {
      await signInWithGoogle();
      // redirect handled by useEffect watching user
    } catch (err) {
      setError(err.message || "Failed to sign in with Google");
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!isSignIn && password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      if (isSignIn) {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password);
      }
      // redirect handled by useEffect watching user
    } catch (err) {
      const errorMessages = {
        "auth/invalid-credential": "Invalid email or password",
        "auth/user-not-found": "No account found with this email",
        "auth/wrong-password": "Incorrect password",
        "auth/email-already-in-use": "An account with this email already exists",
        "auth/invalid-email": "Please enter a valid email address",
        "auth/too-many-requests": "Too many attempts. Please try again later",
      };
      setError(errorMessages[err.code] || err.message || "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <AuthCard>
      {/* Mode tabs */}
      <div className={styles.tabs}>
        <button
          onClick={() => switchMode(true)}
          className={`${styles.tab}${isSignIn ? ` ${styles.tabActive}` : ""}`}
        >
          Sign In
        </button>
        <button
          onClick={() => switchMode(false)}
          className={`${styles.tab}${!isSignIn ? ` ${styles.tabActive}` : ""}`}
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
          <div className={styles.error}>{error}</div>
        )}
        <SubmitButton loading={loading}>
          {isSignIn ? "Sign In" : "Create Account"}
        </SubmitButton>
      </form>

      {/* Switch mode link */}
      <div className={styles.switchRow}>
        {isSignIn ? (
          <>
            Don&apos;t have an account?{" "}
            <button
              onClick={() => switchMode(false)}
              className={styles.switchBtn}
            >
              Create one
            </button>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <button
              onClick={() => switchMode(true)}
              className={styles.switchBtn}
            >
              Sign in
            </button>
          </>
        )}
      </div>
    </AuthCard>
  );
}
