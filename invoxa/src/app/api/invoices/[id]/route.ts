import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Invoice from '@/models/Invoice';
import Client from '@/models/Client';
import { verifyJwt } from '@/lib/auth';
import mongoose from 'mongoose';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// GET - Fetch a single invoice by ID
export async function GET(req: NextRequest) {
  await dbConnect();
  const id = req.nextUrl.pathname.split('/').pop();
  if (!id) {
    return NextResponse.json({ error: 'Invoice ID is required' }, { status: 400 });
  }
  const invoice = await Invoice.findOne({
    _id: id
  }).populate('client', 'name email company address phone');

  if (!invoice) {
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
  }
  return NextResponse.json({ invoice });
}

// DELETE - Delete an invoice by ID
export async function DELETE(req: NextRequest) {
  try {
    await dbConnect();
    const id = req.nextUrl.pathname.split('/').pop();
    if (!id) {
      return NextResponse.json({ error: 'Invoice ID is required' }, { status: 400 });
    }
    const deleted = await Invoice.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  await dbConnect();
  const { type, amount } = await req.json(); // type: 'advance' | 'full'
  const id = req.nextUrl.pathname.split('/').pop();
  const invoice = await Invoice.findById(id);
  if (!invoice) {
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
  }
  let payAmount = 0;
  if (type === 'advance') {
    const minAdvance = Math.ceil(invoice.total * 0.2);
    payAmount = amount && amount >= minAdvance ? amount : minAdvance;
    invoice.advanceAmount = payAmount;
  } else {
    payAmount = invoice.total - (invoice.paidAmount || 0);
  }
  // Razorpay expects amount in paise
  const order = await razorpay.orders.create({
    amount: Math.round(payAmount * 100),
    currency: invoice.currency || 'INR',
    receipt: `invoice_${invoice._id}_${type}`,
    notes: {
      invoiceNumber: invoice.invoiceNumber,
      clientName: invoice.client?.name,
      clientEmail: invoice.client?.email,
      type,
    },
  });
  invoice.paymentLink = order.id;
  await invoice.save();
  return NextResponse.json({ paymentLink: order.id, amount: payAmount });
} 