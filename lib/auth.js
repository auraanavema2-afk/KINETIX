import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export async function signInWithGoogle() {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    await createUserDocument(user);
    return user;
  } catch (error) {
    throw error;
  }
}

export async function signInWithEmail(email, password) {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    throw error;
  }
}

export async function signUpWithEmail(email, password) {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const user = result.user;
    await createUserDocument(user);
    return user;
  } catch (error) {
    throw error;
  }
}

export async function signOutUser() {
  try {
    await signOut(auth);
  } catch (error) {
    throw error;
  }
}

export async function createUserDocument(user) {
  try {
    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);

    if (!snap.exists()) {
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      nextMonth.setDate(1);
      nextMonth.setHours(0, 0, 0, 0);

      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        name: user.displayName || "",
        photoURL: user.photoURL || null,
        plan: "spark",
        messageCount: 0,
        messageCountResetDate: nextMonth,
        soul: null,
        soulMemory: [],
        hasCompletedSoulSetup: false,
        createdAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error("createUserDocument error:", error);
  }
}

export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}
