import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Invoice from '@/models/Invoice';
import { verifyJwt } from '@/lib/auth';
import mongoose from 'mongoose';

// GET - Fetch a single invoice by ID
export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    await dbConnect();
    // No user filter, show any invoice by ID
    const invoice = await Invoice.findOne({
      _id: context.params.id
    }).populate('client', 'name email company address phone');

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    return NextResponse.json({ invoice });
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete an invoice by ID
export async function DELETE(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    await dbConnect();
    const deleted = await Invoice.findByIdAndDelete(context.params.id);
    if (!deleted) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 