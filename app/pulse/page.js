"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";

export default function PulsePage() {
  return (
    <ProtectedRoute>
      <AppLayout variant="default">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", color: "white" }}>
          Pulse — Building this soon
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
