import { auth } from "@/lib/firebase"

export async function authenticatedFetch(url, options = {}) {
  try {
    const user = auth.currentUser
    if (!user) throw new Error("Not authenticated")

    const token = await user.getIdToken()

    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      ...options.headers,
    }

    return await fetch(url, { ...options, headers })
  } catch (err) {
    console.error("Authenticated fetch failed:", err)
    throw err
  }
}
