import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with publishable key from API
async function initializeStripe() {
  try {
    const response = await fetch('/api/config/stripe', {
      credentials: 'include' // Include credentials in the request
    });
    if (!response.ok) {
      throw new Error('Failed to fetch Stripe configuration');
    }
    const { publishableKey } = await response.json();
    console.log('Stripe initialization - Key received from API');
    return loadStripe(publishableKey);
  } catch (error) {
    console.error('Stripe initialization error:', error);
    return null;
  }
}

export const stripePromise = initializeStripe();

// Create a payment intent
export async function createPaymentIntent(amount: number, items: any[]) {
  const stripe = await stripePromise;
  if (!stripe) {
    throw new Error('Stripe is not configured. Please contact support.');
  }

  try {
    console.log('Creating payment intent:', { amount, items });
    const response = await fetch('/api/payments/create-intent', {
      method: 'POST',
      credentials: 'include', // Include credentials in the request
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        items: items.map(item => ({
          id: item.id.toString(),
          name: item.name,
          price: item.basePrice,
          description: item.description || item.name,
        }))
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Payment intent creation failed:', error);
      throw new Error(error.message || 'Failed to create payment intent');
    }

    const result = await response.json();
    console.log('Payment intent created successfully');
    return result;
  } catch (error) {
    console.error('Payment intent creation error:', error);
    throw error instanceof Error ? error : new Error('Failed to create payment intent');
  }
}

// Confirm card payment
export async function confirmCardPayment(clientSecret: string, paymentMethod: any) {
  const stripe = await stripePromise;
  if (!stripe) {
    throw new Error('Stripe not initialized');
  }

  try {
    console.log('Confirming card payment...');
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: paymentMethod,
    });

    if (error) {
      console.error('Card payment confirmation error:', error);
      throw new Error(error.message);
    }

    console.log('Card payment confirmed successfully');
    return paymentIntent;
  } catch (error) {
    console.error('Card payment confirmation error:', error);
    throw error instanceof Error ? error : new Error('Failed to confirm card payment');
  }
}