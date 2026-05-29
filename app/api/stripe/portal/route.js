import { NextResponse } from "next/server"
import { getStripeServer } from "@/lib/stripe"
import { getAdminDb } from "@/lib/firebaseAdmin"
import { verifyAuth } from "@/lib/authMiddleware"

export const dynamic = "force-dynamic"

export async function POST(request) {
  const authResult = await verifyAuth(request)
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }
  const verifiedUid = authResult.uid

  try {
    const adminDb = getAdminDb()
    const userDoc = await adminDb.collection("users").doc(verifiedUid).get()

    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const userData = userDoc.data()
    const customerId = userData.stripeCustomerId

    if (!customerId) {
      return NextResponse.json({ error: "No subscription found" }, { status: 400 })
    }

    const stripe = getStripeServer()
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error("Portal error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
