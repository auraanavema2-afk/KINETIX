"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function CreateAgentPage() {
  return (
    <ProtectedRoute>
      <div style={{ minHeight: "100vh", background: "#000000", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: "14px", textAlign: "center", padding: "40px" }}>
          <div style={{ fontSize: "40px", opacity: 0.3 }}>🔨</div>
          <h2 style={{ color: "white", fontSize: "20px", margin: 0 }}>Create Agent</h2>
          <p style={{ color: "#505050", fontSize: "14px", maxWidth: "300px", lineHeight: 1.6, margin: 0 }}>
            Agent creation is being built. Check back soon.
          </p>
        </div>
      </div>
    </ProtectedRoute>
  );
}
