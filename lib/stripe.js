import { loadStripe } from "@stripe/stripe-js";

let stripePromise = null;

export function getStripe() {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
}

export async function redirectToCheckout(priceId, userId) {
  const res = await fetch("/api/stripe/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ priceId, userId }),
  });

  if (!res.ok) {
    const { error } = await res.json();
    throw new Error(error || "Failed to create checkout session");
  }

  const { sessionId } = await res.json();
  const stripe = await getStripe();
  const { error } = await stripe.redirectToCheckout({ sessionId });

  if (error) throw new Error(error.message);
}

export async function redirectToPortal(userId) {
  const res = await fetch("/api/stripe/portal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });

  if (!res.ok) {
    const { error } = await res.json();
    throw new Error(error || "Failed to create portal session");
  }

  const { url } = await res.json();
  window.location.href = url;
}
