import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth"
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"

export const signUp = async (email, password, name) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    const user = result.user

    await updateProfile(user, { displayName: name })

    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: user.email,
      name: name || "",
      plan: "spark",
      hasCompletedSoulSetup: false,
      messageCount: 0,
      streakDays: 0,
      mintBuilds: 0,
      legacyViews: 0,
      isLegacyPublic: false,
      soulMemory: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    return { user, error: null }
  } catch (error) {
    return { user: null, error: error.message }
  }
}

export const signIn = async (email, password) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password)
    return { user: result.user, error: null }
  } catch (error) {
    return { user: null, error: error.message }
  }
}

export const googleSignIn = async () => {
  try {
    const provider = new GoogleAuthProvider()
    provider.setCustomParameters({ prompt: "select_account" })

    const result = await signInWithPopup(auth, provider)
    const user = result.user

    const userRef = doc(db, "users", user.uid)
    const userSnap = await getDoc(userRef)

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        name: user.displayName || "",
        plan: "spark",
        hasCompletedSoulSetup: false,
        messageCount: 0,
        streakDays: 0,
        mintBuilds: 0,
        legacyViews: 0,
        isLegacyPublic: false,
        soulMemory: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    }

    return { user, error: null }
  } catch (error) {
    return { user: null, error: error.message }
  }
}

export const signOutUser = async () => {
  try {
    await signOut(auth)
    return { error: null }
  } catch (error) {
    return { error: error.message }
  }
}

export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback)
}
