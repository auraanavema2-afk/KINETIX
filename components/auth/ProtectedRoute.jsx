"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import LoadingScreen from "@/components/ui/LoadingScreen";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user === null) {
      router.push("/auth");
    }
  }, [user, loading, router]);

  if (loading) return <LoadingScreen fadeOut={false} />;
  if (user === null) return null;
  return <>{children}</>;
}
