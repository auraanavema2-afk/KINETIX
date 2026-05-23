"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";

export default function MissionPage() {
  return (
    <ProtectedRoute>
      <AppLayout variant="mission">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", color: "white" }}>
          Mission Control — Building this soon
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
