import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  setDoc,
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

// ─── PROJECTS ──────────────────────────────────────────────────────────────

export async function createProject(userId, name) {
  const ref = await addDoc(collection(db, "projects"), {
    userId,
    name,
    pinned: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    conversationIds: [],
  });
  return ref.id;
}

export function getUserProjects(userId, callback) {
  const q = query(
    collection(db, "projects"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snap) => {
    const projects = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    projects.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
    callback(projects);
  });
}

export async function updateProject(projectId, data) {
  await updateDoc(doc(db, "projects", projectId), data);
}

export async function deleteProject(projectId) {
  await deleteDoc(doc(db, "projects", projectId));
}

export async function addConversationToProject(projectId, conversationId) {
  await updateDoc(doc(db, "conversations", conversationId), { projectId });
  await updateDoc(doc(db, "projects", projectId), {
    conversationIds: arrayUnion(conversationId),
  });
}

// ─── KINES ─────────────────────────────────────────────────────────────────

export async function createKine(userId, kineData) {
  const ref = await addDoc(collection(db, "kines"), {
    userId,
    name: kineData.name,
    emoji: kineData.emoji,
    category: kineData.category,
    shortDescription: kineData.shortDescription,
    persona: kineData.persona,
    isPublic: kineData.isPublic || false,
    creatorName: kineData.creatorName,
    usageCount: 0,
    rating: 0,
    ratingCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export function getPublicKines(callback, category) {
  if (!db) { callback([]); return () => {}; }
  const constraints = [
    collection(db, "kines"),
    where("isPublic", "==", true),
  ];
  if (category) constraints.push(where("category", "==", category));
  constraints.push(orderBy("usageCount", "desc"));
  constraints.push(limit(100));

  const q = query(...constraints);
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

export function getUserKines(userId, callback) {
  if (!db) { callback([]); return () => {}; }
  const q = query(
    collection(db, "kines"),
    where("userId", "==", userId)
  );
  return onSnapshot(q, (snap) => {
    const kines = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    callback(kines);
  });
}

export async function getKineById(kineId) {
  const snap = await getDoc(doc(db, "kines", kineId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function updateKine(kineId, data) {
  await updateDoc(doc(db, "kines", kineId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteKine(kineId) {
  await deleteDoc(doc(db, "kines", kineId));
}

export async function incrementKineUsage(kineId) {
  await updateDoc(doc(db, "kines", kineId), {
    usageCount: increment(1),
  });
}

export async function rateKine(kineId, userId, rating) {
  await setDoc(doc(db, "kineRatings", `${kineId}_${userId}`), {
    kineId,
    userId,
    rating,
    createdAt: serverTimestamp(),
  });

  const ratingsSnap = await getDocs(
    query(collection(db, "kineRatings"), where("kineId", "==", kineId))
  );
  const ratings = ratingsSnap.docs.map((d) => d.data().rating);
  const ratingCount = ratings.length;
  const average = ratingCount > 0
    ? ratings.reduce((sum, r) => sum + r, 0) / ratingCount
    : 0;

  await updateDoc(doc(db, "kines", kineId), {
    rating: Math.round(average * 10) / 10,
    ratingCount,
  });
}
