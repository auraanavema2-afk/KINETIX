import { getAdminAuth } from "@/lib/firebaseAdmin"

export async function verifyAuth(request) {
  try {
    const authHeader = request.headers.get("Authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { error: "No auth token provided", status: 401 }
    }

    const adminAuth = getAdminAuth()
    if (!adminAuth) {
      return { error: "Auth service unavailable", status: 503 }
    }

    const token = authHeader.split("Bearer ")[1]
    const decodedToken = await adminAuth.verifyIdToken(token)

    return { uid: decodedToken.uid, email: decodedToken.email }
  } catch (err) {
    console.error("Auth verification failed:", err)
    return { error: "Invalid or expired token", status: 401 }
  }
}
