import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Invoice from '@/models/Invoice';

export async function POST(req: NextRequest, context: { params: { id: string } }) {
  await dbConnect();
  const { status } = await req.json();
  const invoice = await Invoice.findById(context.params.id);
  if (!invoice) {
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
  }
  invoice.status = status;
  await invoice.save();
  return NextResponse.json({ success: true });
} 