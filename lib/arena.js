import {
  ref,
  set,
  onValue,
  onDisconnect,
  remove,
  serverTimestamp,
} from "firebase/database"
import { rtdb } from "@/lib/firebase"

export const joinArenaPresence = async (arenaId, userId, userName) => {
  const presenceRef = ref(rtdb, `arenas/${arenaId}/presence/${userId}`)

  await set(presenceRef, {
    userId,
    userName,
    joinedAt: Date.now(),
    lastSeen: Date.now(),
  })

  onDisconnect(presenceRef).remove()

  return () => remove(presenceRef)
}

export const watchPresence = (arenaId, callback) => {
  const presenceRef = ref(rtdb, `arenas/${arenaId}/presence`)

  const unsub = onValue(presenceRef, (snapshot) => {
    const data = snapshot.val()
    if (!data) {
      callback([])
      return
    }
    const members = Object.values(data)
    callback(members)
  })

  return () => unsub()
}

export const updateTyping = async (arenaId, userId, isTyping) => {
  const typingRef = ref(rtdb, `arenas/${arenaId}/typing/${userId}`)
  if (isTyping) {
    await set(typingRef, true)
  } else {
    await remove(typingRef)
  }
}

export const watchTyping = (arenaId, currentUserId, callback) => {
  const typingRef = ref(rtdb, `arenas/${arenaId}/typing`)

  const unsub = onValue(typingRef, (snapshot) => {
    const data = snapshot.val()
    if (!data) { callback([]); return }
    const typingUsers = Object.keys(data).filter(uid => uid !== currentUserId)
    callback(typingUsers)
  })

  return () => unsub()
}
