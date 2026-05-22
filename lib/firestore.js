import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  increment,
  arrayUnion,
} from "firebase/firestore";

// ─── CONVERSATIONS ─────────────────────────────────────────────────────────

export async function createConversation(userId, kineId) {
  const ref = await addDoc(collection(db, "conversations"), {
    userId,
    title: "New Conversation",
    kineId: kineId || null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    messageCount: 0,
  });
  return ref.id;
}

export function getUserConversations(userId, callback) {
  const q = query(
    collection(db, "conversations"),
    where("userId", "==", userId),
    orderBy("updatedAt", "desc"),
    limit(50)
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

export async function updateConversationTitle(conversationId, title) {
  await updateDoc(doc(db, "conversations", conversationId), {
    title,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteConversation(conversationId) {
  await deleteDoc(doc(db, "conversations", conversationId));
}

// ─── MESSAGES ──────────────────────────────────────────────────────────────

export async function addMessage(conversationId, role, content, imageUrls = []) {
  const ref = await addDoc(collection(db, "messages"), {
    conversationId,
    role,
    content,
    imageUrls,
    createdAt: serverTimestamp(),
  });

  await updateDoc(doc(db, "conversations", conversationId), {
    updatedAt: serverTimestamp(),
    messageCount: increment(1),
  });

  return ref.id;
}

export async function getMessages(conversationId) {
  const q = query(
    collection(db, "messages"),
    where("conversationId", "==", conversationId),
    orderBy("createdAt", "asc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ─── SOUL MEMORY ───────────────────────────────────────────────────────────

export async function addSoulMemory(userId, memory) {
  await updateDoc(doc(db, "users", userId), {
    soulMemory: arrayUnion(memory),
  });
}

export async function getSoulData(userId) {
  const snap = await getDoc(doc(db, "users", userId));
  if (!snap.exists()) return null;
  const data = snap.data();
  return { soul: data.soul, soulMemory: data.soulMemory };
}
