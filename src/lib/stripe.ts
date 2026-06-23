import Stripe from 'stripe';
import { env } from '@/lib/env';

function getStripeClient(): Stripe | null {
  if (!env.STRIPE_SECRET_KEY) return null;
  return new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: '2026-05-27.dahlia',
  });
}

export const stripe = getStripeClient();

export function requireStripe(): Stripe {
  if (!stripe) {
    throw new Error('Stripe is not configured. Set STRIPE_SECRET_KEY in your environment.');
  }
  return stripe;
}

export const PLANS = {
  FOUNDER: {
    priceId: env.STRIPE_FOUNDER_PRICE_ID,
    name: 'Fondateur',
    price: 19,
  },
  STANDARD: {
    priceId: env.STRIPE_STANDARD_PRICE_ID,
    name: 'Standard',
    price: 29,
  },
} as const;
