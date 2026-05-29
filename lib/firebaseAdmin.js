import admin from "firebase-admin"

let adminInstance = null
let adminAuthInstance = null
let adminDbInstance = null

function getAdminApp() {
  if (adminInstance) return adminInstance

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n')

  if (!projectId || !clientEmail || !privateKey || privateKey === "your-private-key") {
    return null
  }

  try {
    if (admin.apps.length) {
      adminInstance = admin.apps[0]
    } else {
      adminInstance = admin.initializeApp({
        credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
      })
    }
    return adminInstance
  } catch (err) {
    console.error("Firebase Admin initialization failed:", err)
    return null
  }
}

export function getAdminAuth() {
  if (adminAuthInstance) return adminAuthInstance
  const app = getAdminApp()
  if (!app) return null
  adminAuthInstance = admin.auth(app)
  return adminAuthInstance
}

export function getAdminDb() {
  if (adminDbInstance) return adminDbInstance
  const app = getAdminApp()
  if (!app) return null
  adminDbInstance = admin.firestore(app)
  return adminDbInstance
}

export default admin
