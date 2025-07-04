import { createStripeLink } from '@/lib/payments';

// Placeholder for Stripe payment link API
export async function POST(request: Request) {
  try {
    const invoice = await request.json();
    const link = await createStripeLink(invoice);
    return Response.json({ url: link });
  } catch (err) {
    return Response.json({ error: 'Failed to create Stripe link' }, { status: 500 });
  }
} 