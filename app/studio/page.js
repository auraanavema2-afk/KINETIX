"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function StudioPage() {
  return (
    <ProtectedRoute>
      <div style={{ minHeight: "100vh", background: "#000000", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "white" }}>Studio — Building this soon</div>
      </div>
    </ProtectedRoute>
  );
}
