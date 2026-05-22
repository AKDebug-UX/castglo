import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

/**
 * Singleton function to get or initialize the Stripe instance.
 * It uses the VITE_STRIPE_PUBLISHABLE_KEY environment variable.
 */
export const getStripe = () => {
  if (!stripePromise) {
    const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    
    if (!publishableKey) {
      console.warn('VITE_STRIPE_PUBLISHABLE_KEY is not defined in your environment variables.');
    }
    
    stripePromise = loadStripe(publishableKey || '');
  }
  return stripePromise;
};
