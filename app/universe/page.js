"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";

export default function UniversePage() {
  return (
    <ProtectedRoute>
      <AppLayout variant="universe">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", color: "white" }}>
          Universe — Building this soon
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
