"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";

export default function StudioPage() {
  return (
    <ProtectedRoute>
      <AppLayout variant="studio">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", color: "white" }}>
          Studio — Building this soon
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
