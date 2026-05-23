import { NextResponse } from "next/server"
import { getStripeServer } from "@/lib/stripe"
import { db } from "@/lib/firebase"
import { doc, updateDoc } from "firebase/firestore"

export const dynamic = "force-dynamic"

const PRICE_TO_PLAN = {
  [process.env.STRIPE_PRICE_BUILD_MONTHLY]:      "build",
  [process.env.STRIPE_PRICE_BUILD_ANNUAL]:       "build",
  [process.env.STRIPE_PRICE_PRO_MONTHLY]:        "pro",
  [process.env.STRIPE_PRICE_PRO_ANNUAL]:         "pro",
  [process.env.STRIPE_PRICE_MAX_MONTHLY]:        "max",
  [process.env.STRIPE_PRICE_MAX_ANNUAL]:         "max",
  [process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY]: "enterprise",
  [process.env.STRIPE_PRICE_ENTERPRISE_ANNUAL]:  "enterprise",
}

export async function POST(request) {
  const body = await request.text()
  const sig = request.headers.get("stripe-signature")
  const stripe = getStripeServer()

  let event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    return NextResponse.json({ error: "Webhook signature failed" }, { status: 400 })
  }

  const { type, data } = event

  try {
    if (type === "customer.subscription.created" || type === "customer.subscription.updated") {
      const subscription = data.object
      const userId = subscription.metadata?.userId
      if (!userId) return NextResponse.json({ received: true })

      const priceId = subscription.items.data[0].price.id
      const plan = PRICE_TO_PLAN[priceId] || "spark"

      await updateDoc(doc(db, "users", userId), {
        plan,
        stripeCustomerId: subscription.customer,
        stripeSubscriptionId: subscription.id,
        subscriptionStatus: subscription.status,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      })
    }

    if (type === "customer.subscription.deleted") {
      const subscription = data.object
      const userId = subscription.metadata?.userId
      if (!userId) return NextResponse.json({ received: true })

      await updateDoc(doc(db, "users", userId), {
        plan: "spark",
        stripeSubscriptionId: null,
        subscriptionStatus: "cancelled",
        currentPeriodEnd: null,
      })
    }

    if (type === "checkout.session.completed") {
      const session = data.object
      const userId = session.metadata?.userId
      if (!userId) return NextResponse.json({ received: true })

      if (session.customer) {
        await updateDoc(doc(db, "users", userId), {
          stripeCustomerId: session.customer,
        })
      }
    }
  } catch (err) {
    console.error("Webhook handler error:", err)
  }

  return NextResponse.json({ received: true })
}
