import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";
import { db } from "./firebase";

export async function getSoulProfile(userId) {
  const snap = await getDoc(doc(db, "souls", userId));
  return snap.exists() ? snap.data() : null;
}

export async function updateSoulProfile(userId, data) {
  await setDoc(
    doc(db, "souls", userId),
    { ...data, updatedAt: serverTimestamp() },
    { merge: true }
  );
}

export async function addMemory(userId, memory) {
  const ref = collection(db, "souls", userId, "memories");
  const docRef = await addDoc(ref, {
    ...memory,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getMemories(userId, count = 50) {
  const ref = collection(db, "souls", userId, "memories");
  const q = query(ref, orderBy("createdAt", "desc"), limit(count));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function updateMemory(userId, memoryId, data) {
  await updateDoc(doc(db, "souls", userId, "memories", memoryId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteMemory(userId, memoryId) {
  await deleteDoc(doc(db, "souls", userId, "memories", memoryId));
}

export function subscribeToSoulProfile(userId, callback) {
  return onSnapshot(doc(db, "souls", userId), (snap) => {
    callback(snap.exists() ? snap.data() : null);
  });
}

export function subscribeToMemories(userId, callback, count = 50) {
  const ref = collection(db, "souls", userId, "memories");
  const q = query(ref, orderBy("createdAt", "desc"), limit(count));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}
