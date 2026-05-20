"use client";

import { useState } from "react";
import AuthCard from "@/components/auth/AuthCard";
import FloatingInput from "@/components/auth/FloatingInput";
import GoogleButton from "@/components/auth/GoogleButton";
import SubmitButton from "@/components/auth/SubmitButton";
import OrDivider from "@/components/auth/OrDivider";

export default function AuthPageClient() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSignIn, setIsSignIn] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleGoogle() {
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setError("Firebase will be connected on Day 3");
    }, 1500);
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
          onClick={() => setIsSignIn(true)}
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
          onClick={() => setIsSignIn(false)}
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
              onClick={() => setIsSignIn(false)}
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
              onClick={() => setIsSignIn(true)}
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
