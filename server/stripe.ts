import Stripe from 'stripe';
import { Service } from '@shared/schema';
import { storage } from './storage';
import type { Request } from 'express';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-01-27.acacia",
  typescript: true,
});

// Initialize or fetch products in Stripe
export async function syncStripeCatalog(services: Service[]) {
  console.log('Starting Stripe catalog sync...');

  try {
    for (const service of services) {
      console.log(`Processing service: ${service.name}`);

      // Check if product already exists
      const products = await stripe.products.list({
        ids: [service.id.toString()]
      });

      if (products.data.length === 0) {
        // Create new product if it doesn't exist
        console.log(`Creating new product for ${service.name}`);
        const product = await stripe.products.create({
          id: service.id.toString(),
          name: service.name,
          description: service.description || undefined,
          metadata: {
            serviceId: service.id.toString()
          }
        });

        // Create price for the product
        console.log(`Creating price for ${service.name}`);
        await stripe.prices.create({
          product: product.id,
          currency: 'usd',
          unit_amount: service.basePrice,
          metadata: {
            serviceId: service.id.toString()
          }
        });
      } else {
        console.log(`Product already exists for ${service.name}`);

        // Update existing product if needed
        const existingProduct = products.data[0];
        if (existingProduct.name !== service.name || existingProduct.description !== service.description) {
          await stripe.products.update(existingProduct.id, {
            name: service.name,
            description: service.description || undefined,
          });
          console.log(`Updated product details for ${service.name}`);
        }
      }
    }
    console.log('Stripe catalog sync completed successfully');
  } catch (error) {
    console.error('Error during Stripe catalog sync:', error);
    throw error;
  }
}

// Create a payment intent for the order
export async function createPaymentIntent(amount: number, items: any[], req: Request) {
  try {
    console.log('Creating payment intent for amount:', amount);
    console.log('User ID:', req.user?.id);
    console.log('Items:', items);

    if (!req.user?.id) {
      throw new Error('User not authenticated');
    }

    // Create the order first using storage interface
    const order = await storage.createOrder({
      userId: req.user.id,
      serviceId: items[0].id,
      status: 'pending',
      totalPrice: amount,
      requirements: JSON.stringify({}) // Convert empty object to string
    });

    console.log('Order created successfully:', order);

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      metadata: {
        orderId: order.id.toString(),
        items: JSON.stringify(items.map(item => ({
          id: item.id,
          name: item.name
        })))
      }
    });

    console.log('Payment intent created:', paymentIntent.id);
    return {
      clientSecret: paymentIntent.client_secret,
      orderId: order.id
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error instanceof Error ? error : new Error('Failed to create payment intent');
  }
}

// Handle Stripe webhook events
export async function handleStripeWebhook(event: Stripe.Event) {
  console.log('Processing Stripe webhook event:', event.type);

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('Payment succeeded:', paymentIntent.id);

        if (paymentIntent.metadata.orderId) {
          try {
            const orderId = parseInt(paymentIntent.metadata.orderId);
            console.log('Updating order status to paid:', orderId);

            const order = await storage.updateOrder(orderId, {
              status: 'paid'
            });

            console.log('Order status updated successfully:', order);
          } catch (error) {
            console.error('Error updating order status:', error);
            throw error;
          }
        }
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        console.log('Payment failed:', failedPayment.id);

        if (failedPayment.metadata.orderId) {
          try {
            const orderId = parseInt(failedPayment.metadata.orderId);
            console.log('Updating order status to failed:', orderId);

            const order = await storage.updateOrder(orderId, {
              status: 'failed'
            });

            console.log('Order status updated successfully:', order);
          } catch (error) {
            console.error('Error updating order status:', error);
            throw error;
          }
        }
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    console.error('Error processing webhook event:', error);
    throw error;
  }
}