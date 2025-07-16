import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Invoice from '@/models/Invoice';

export async function POST(req: NextRequest) {
  await dbConnect();
  const { status } = await req.json();
  const segments = req.nextUrl.pathname.split('/');
  const id = segments[segments.length - 2];
  const invoice = await Invoice.findById(id);
  if (!invoice) {
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
  }
  invoice.status = status;
  await invoice.save();
  return NextResponse.json({ success: true });
} 