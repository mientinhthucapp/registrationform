import { z } from 'zod';
import { createEndpoint } from 'zite-integrations-backend-sdk';
import Stripe from 'stripe';

export default createEndpoint({
  description: 'Create a Stripe PaymentIntent for retreat registration',
  inputSchema: z.object({
    email: z.string().email(),
    amount: z.number().min(1),
  }),
  outputSchema: z.object({ clientSecret: z.string() }),
  execute: async ({ input }) => {
    const stripe = new Stripe(process.env.ZITE_STRIPE_ACCESS_TOKEN!, {
      httpClient: Stripe.createFetchHttpClient(),
    });

    const existing = await stripe.customers.list({ email: input.email, limit: 1 });
    const customer = existing.data[0] ?? await stripe.customers.create({ email: input.email });

    const pi = await stripe.paymentIntents.create({
      customer: customer.id,
      amount: input.amount,
      currency: 'aud',
      metadata: { email: input.email },
    });

    return { clientSecret: pi.client_secret! };
  },
});
