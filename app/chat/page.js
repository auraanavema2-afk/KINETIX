"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { createConversation } from "@/lib/firestore";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import LoadingScreen from "@/components/ui/LoadingScreen";

function ChatRedirect() {
  const { user } = useAuth();
  const router = useRouter();
  const creating = useRef(false);

  useEffect(() => {
    if (!user || creating.current) return;
    creating.current = true;
    createConversation(user.uid)
      .then((id) => {
        router.replace(`/chat/${id}`);
      })
      .catch((err) => {
        console.error("Failed to create conversation:", err);
        creating.current = false;
      });
  }, [user, router]);

  return <LoadingScreen fadeOut={false} />;
}

export default function ChatPage() {
  return (
    <ProtectedRoute>
      <ChatRedirect />
    </ProtectedRoute>
  );
}
