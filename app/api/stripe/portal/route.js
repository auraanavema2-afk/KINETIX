import { NextResponse } from "next/server"
import { getStripeServer } from "@/lib/stripe"
import { db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"

export const dynamic = "force-dynamic"

export async function POST(request) {
  try {
    const { userId } = await request.json()

    const userRef = doc(db, "users", userId)
    const userSnap = await getDoc(userRef)

    if (!userSnap.exists()) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const userData = userSnap.data()
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
