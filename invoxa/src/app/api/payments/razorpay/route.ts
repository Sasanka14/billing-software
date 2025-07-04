import { createRazorpayLink } from '@/lib/payments';

export async function POST(request: Request) {
  try {
    const invoice = await request.json();
    const link = await createRazorpayLink(invoice);
    return Response.json({ url: link });
  } catch (err) {
    return Response.json({ error: 'Failed to create Razorpay link' }, { status: 500 });
  }
} 