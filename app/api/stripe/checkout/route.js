import { NextResponse } from "next/server"
import { getStripeServer } from "@/lib/stripe"
import { verifyAuth } from "@/lib/authMiddleware"

export const dynamic = "force-dynamic"

export async function POST(request) {
  const authResult = await verifyAuth(request)
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }
  const verifiedUid = authResult.uid

  try {
    const { priceId, userEmail, promoCode } = await request.json()

    if (!priceId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const stripe = getStripeServer()

    const sessionConfig = {
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/pulse?subscription=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      customer_email: userEmail,
      metadata: { userId: verifiedUid },
      allow_promotion_codes: !promoCode,
    }

    if (promoCode) {
      const promotionCodes = await stripe.promotionCodes.list({ code: promoCode, active: true })
      if (promotionCodes.data.length > 0) {
        sessionConfig.discounts = [{ promotion_code: promotionCodes.data[0].id }]
      }
    }

    const session = await stripe.checkout.sessions.create(sessionConfig)
    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error("Checkout error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
