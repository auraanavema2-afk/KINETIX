"use client";

import { useState, useEffect, useCallback } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { createDoc, updateDocById, deleteDocById } from "@/lib/firestore";

export function useConversations(userId, count = 50) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setConversations([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "conversations"),
      where("userId", "==", userId),
      orderBy("updatedAt", "desc"),
      limit(count)
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        setConversations(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return unsub;
  }, [userId, count]);

  const createConversation = useCallback(
    async (data) => {
      if (!userId) throw new Error("Not authenticated");
      return createDoc("conversations", { ...data, userId, messages: [] });
    },
    [userId]
  );

  const updateConversation = useCallback(async (conversationId, data) => {
    await updateDocById("conversations", conversationId, data);
  }, []);

  const deleteConversation = useCallback(async (conversationId) => {
    await deleteDocById("conversations", conversationId);
  }, []);

  return {
    conversations,
    loading,
    error,
    createConversation,
    updateConversation,
    deleteConversation,
  };
}

export default useConversations;
