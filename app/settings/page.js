"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <AppLayout variant="default">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", color: "white" }}>
          Settings — Building this soon
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
