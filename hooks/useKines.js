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

// Kines are knowledge items — atomic units of insight captured in the second brain
export function useKines(userId, count = 100) {
  const [kines, setKines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setKines([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "kines"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(count)
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        setKines(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return unsub;
  }, [userId, count]);

  const createKine = useCallback(
    async (data) => {
      if (!userId) throw new Error("Not authenticated");
      return createDoc("kines", { ...data, userId });
    },
    [userId]
  );

  const updateKine = useCallback(async (kineId, data) => {
    await updateDocById("kines", kineId, data);
  }, []);

  const deleteKine = useCallback(async (kineId) => {
    await deleteDocById("kines", kineId);
  }, []);

  return { kines, loading, error, createKine, updateKine, deleteKine };
}

export default useKines;
