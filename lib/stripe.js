import Stripe from "stripe"

let _stripe = null

export function getStripeServer() {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
    })
  }
  return _stripe
}

export default getStripeServer
