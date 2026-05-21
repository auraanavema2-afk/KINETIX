"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import LoadingScreen from "@/components/ui/LoadingScreen";

export default function Home() {
  const { user, userDoc, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (user === null) {
      router.push("/auth");
      return;
    }
    if (user && userDoc) {
      if (userDoc.hasCompletedSoulSetup) {
        router.push("/pulse");
      } else {
        router.push("/soul-setup");
      }
    }
  }, [user, userDoc, loading]);

  return <LoadingScreen fadeOut={false} />;
}
