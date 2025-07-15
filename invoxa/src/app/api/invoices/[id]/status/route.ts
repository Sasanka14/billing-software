import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Invoice from '@/models/Invoice';

const VALID_STATUSES = ['draft', 'sent', 'advance_paid', 'paid', 'overdue'];

export async function POST(req: NextRequest, context: { params: { id: string } }) {
  await dbConnect();
  const { status } = await req.json();
  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Invalid status value.' }, { status: 400 });
  }
  const params = await context.params;
  const invoice = await Invoice.findById(params.id);
  if (!invoice) {
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
  }
  invoice.status = status;
  await invoice.save();
  return NextResponse.json({ success: true });
} 