import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Invoice from '@/models/Invoice';

export async function POST(req: NextRequest) {
  await dbConnect();
  const body = await req.json();
  // Razorpay sends event type and payload
  const event = body.event;
  const payload = body.payload?.payment?.entity || {};
  const orderId = payload.order_id;
  const amount = payload.amount ? payload.amount / 100 : 0; // convert paise to INR
  const status = payload.status;
  const method = payload.method || 'razorpay';
  const transactionId = payload.id;

  // Find invoice by paymentLink (orderId)
  const invoice = await Invoice.findOne({ paymentLink: orderId });
  if (!invoice) {
    return NextResponse.json({ error: 'Invoice not found for payment' }, { status: 404 });
  }

  // Only process successful payments
  if (event === 'payment.captured' && status === 'captured') {
    // Determine if this is advance or full payment
    let paymentType: 'advance' | 'full' = 'full';
    if (amount < invoice.total) {
      paymentType = 'advance';
    }
    invoice.paidAmount = (invoice.paidAmount || 0) + amount;
    invoice.paymentHistory.push({
      amount,
      method,
      date: new Date(),
      status: paymentType,
      transactionId,
    });
    if (paymentType === 'advance') {
      invoice.status = 'advance_paid';
    }
    if (invoice.paidAmount >= invoice.total) {
      invoice.status = 'paid';
      invoice.paidDate = new Date();
    }
    await invoice.save();
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ received: true });
} 