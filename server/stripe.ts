import Stripe from "stripe";
import { storage } from "./storage";

// Plans config — price IDs from Stripe dashboard
export const PLANS = {
  starter: {
    name: "Starter",
    priceId: process.env.STRIPE_PRICE_STARTER ?? "price_1TlYSS00j6hMBDdf1WFfC0qh",
    price: 29,
    features: ["Bis zu 50 Leads/Monat", "KI-Qualifizierung", "E-Mail-Benachrichtigungen", "CRM Dashboard"],
  },
  professional: {
    name: "Professional",
    priceId: process.env.STRIPE_PRICE_PROFESSIONAL ?? "price_1TlYSp00j6hMBDdf4j3Re1OP",
    price: 59,
    features: ["Bis zu 200 Leads/Monat", "KI-Qualifizierung + Scoring", "Follow-up Automatisierung", "CRM Dashboard", "Täglicher Digest", "Prioritäts-Support"],
  },
  team: {
    name: "Team",
    priceId: process.env.STRIPE_PRICE_TEAM ?? "price_1TlYT300j6hMBDdfh4z65PWc",
    price: 99,
    features: ["Unbegrenzte Leads", "Alles aus Professional", "Team-Zugänge (5 Nutzer)", "API-Zugang", "Dedicated Account Manager"],
  },
} as const;

export type PlanKey = keyof typeof PLANS;

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY missing");
  return new Stripe(key, { apiVersion: "2024-06-20" });
}

// Create a Stripe Checkout session for a given plan
export async function createCheckoutSession(
  plan: PlanKey,
  customerEmail: string,
  successUrl: string,
  cancelUrl: string
): Promise<string> {
  const stripe = getStripe();
  const planConfig = PLANS[plan];

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    customer_email: customerEmail,
    line_items: [{ price: planConfig.priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { plan },
    subscription_data: {
      trial_period_days: 14,
      metadata: { plan },
    },
    locale: "de",
  });

  return session.url!;
}

// Handle Stripe webhook events
export async function handleStripeWebhook(
  payload: Buffer,
  signature: string,
  webhookSecret: string
): Promise<{ received: boolean }> {
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err: any) {
    throw new Error(`Webhook signature verification failed: ${err.message}`);
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const email = session.customer_email ?? session.customer_details?.email;
      const plan = (session.metadata?.plan ?? "starter") as PlanKey;
      const customerId = session.customer as string;
      const subscriptionId = session.subscription as string;

      if (email) {
        storage.upsertSubscription(email, {
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId,
          plan,
          status: "active",
        });
      }
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = sub.customer as string;
      const existing = storage.getSubscriptionByCustomerId(customerId);
      if (existing) {
        storage.upsertSubscription(existing.email, {
          status: sub.status as any,
          currentPeriodEnd: new Date(sub.current_period_end * 1000).toISOString(),
          plan: (sub.metadata?.plan ?? existing.plan) as PlanKey,
        });
      }
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = sub.customer as string;
      const existing = storage.getSubscriptionByCustomerId(customerId);
      if (existing) {
        storage.upsertSubscription(existing.email, { status: "canceled" });
      }
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;
      const existing = storage.getSubscriptionByCustomerId(customerId);
      if (existing) {
        storage.upsertSubscription(existing.email, { status: "past_due" });
      }
      break;
    }
  }

  return { received: true };
}
