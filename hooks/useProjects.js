"use client";

import { useState, useEffect, useCallback } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { createDoc, updateDocById, deleteDocById } from "@/lib/firestore";

export function useProjects(userId) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setProjects([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "projects"),
      where("userId", "==", userId),
      orderBy("updatedAt", "desc")
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        setProjects(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return unsub;
  }, [userId]);

  const createProject = useCallback(
    async (data) => {
      if (!userId) throw new Error("Not authenticated");
      return createDoc("projects", { ...data, userId });
    },
    [userId]
  );

  const updateProject = useCallback(async (projectId, data) => {
    await updateDocById("projects", projectId, data);
  }, []);

  const deleteProject = useCallback(async (projectId) => {
    await deleteDocById("projects", projectId);
  }, []);

  return { projects, loading, error, createProject, updateProject, deleteProject };
}

export default useProjects;
