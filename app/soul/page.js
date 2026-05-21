"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function SoulPage() {
  return (
    <ProtectedRoute>
      <div style={{ minHeight: "100vh", background: "#000000", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "white" }}>Soul Profile — Building this soon</div>
      </div>
    </ProtectedRoute>
  );
}
