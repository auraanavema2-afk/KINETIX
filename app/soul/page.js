"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";

export default function SoulPage() {
  return (
    <ProtectedRoute>
      <AppLayout variant="soul">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", color: "white" }}>
          Soul Profile — Building this soon
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
