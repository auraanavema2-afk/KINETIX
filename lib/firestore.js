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

// ─── LEGACY PROFILE ────────────────────────────────────────────────────────

export async function getUserPublicProfile(userIdOrSlug) {
  if (!db) return null;

  // Try slug lookup first
  const slugSnap = await getDocs(
    query(collection(db, "users"), where("slug", "==", userIdOrSlug))
  );
  const userSnap = slugSnap.empty
    ? await getDoc(doc(db, "users", userIdOrSlug))
    : slugSnap.docs[0];

  if (!userSnap.exists()) return null;

  const data = userSnap.data();
  const uid = slugSnap.empty ? userIdOrSlug : userSnap.id;

  if (!data.isLegacyPublic) return null;

  // Fetch public kines
  const kinesSnap = await getDocs(
    query(
      collection(db, "kines"),
      where("userId", "==", uid),
      where("isPublic", "==", true),
      orderBy("usageCount", "desc"),
      limit(6)
    )
  );
  const recentKines = kinesSnap.docs.map((d) => ({
    id: d.id,
    name: d.data().name,
    emoji: d.data().emoji,
    category: d.data().category,
    shortDescription: d.data().shortDescription,
    usageCount: d.data().usageCount,
  }));

  // Total kine count (public + private)
  const allKinesSnap = await getDocs(
    query(collection(db, "kines"), where("userId", "==", uid))
  );

  return {
    uid,
    slug: data.slug || uid,
    name: data.soul?.name || data.name || "Builder",
    avatar: data.avatar || null,
    joinedDate: data.createdAt || null,
    plan: data.plan || "spark",
    bigGoal: data.soul?.bigGoal || null,
    publicBio: data.bioPublic || null,
    isLegacyPublic: data.isLegacyPublic || false,
    kineCount: allKinesSnap.size,
    conversationCount: data.messageCount || 0,
    memoryCount: data.soulMemory?.length || 0,
    streakDays: data.streakDays || 0,
    currentPhase: data.currentPhase || null,
    recentKines,
  };
}

export async function generateUserSlug(userId, name) {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 40);

  // Check if slug is already taken
  const existing = await getDocs(
    query(collection(db, "users"), where("slug", "==", base))
  );

  let finalSlug = base;
  if (!existing.empty && existing.docs[0].id !== userId) {
    const suffix = Math.random().toString(36).slice(2, 6);
    finalSlug = `${base}-${suffix}`;
  }

  await updateDoc(doc(db, "users", userId), { slug: finalSlug });
  return finalSlug;
}

export async function toggleLegacyPublic(userId, isPublic) {
  await updateDoc(doc(db, "users", userId), { isLegacyPublic: isPublic });
}

export async function updatePublicBio(userId, bio) {
  await updateDoc(doc(db, "users", userId), {
    bioPublic: bio.slice(0, 280),
  });
}

export async function incrementLegacyView(userId) {
  await updateDoc(doc(db, "users", userId), {
    legacyViews: increment(1),
  });
}

// ─── ARENAS ────────────────────────────────────────────────────────────────

export async function createArena(userId, name) {
  const ref = await addDoc(collection(db, "arenas"), {
    name: name || "Untitled Arena",
    creatorId: userId,
    members: [userId],
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    messageCount: 0,
  });
  return ref.id;
}

export async function getArena(arenaId) {
  const snap = await getDoc(doc(db, "arenas", arenaId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export function getUserArenas(userId, callback) {
  const q = query(
    collection(db, "arenas"),
    where("members", "array-contains", userId),
    orderBy("updatedAt", "desc"),
    limit(20)
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

export async function joinArena(arenaId, userId) {
  await updateDoc(doc(db, "arenas", arenaId), {
    members: arrayUnion(userId),
  });
}

export async function addArenaMessage(arenaId, userId, userName, content) {
  const ref = await addDoc(collection(db, "arenaMessages"), {
    arenaId,
    userId,
    userName,
    content,
    isAI: false,
    createdAt: serverTimestamp(),
  });
  await updateDoc(doc(db, "arenas", arenaId), {
    updatedAt: serverTimestamp(),
    messageCount: increment(1),
  });
  return ref.id;
}

export function getArenaMessages(arenaId, callback) {
  const q = query(
    collection(db, "arenaMessages"),
    where("arenaId", "==", arenaId),
    orderBy("createdAt", "asc"),
    limit(100)
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}
