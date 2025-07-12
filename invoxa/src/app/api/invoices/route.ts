import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Invoice from '@/models/Invoice';
import Client from '@/models/Client';
import { verifyJwt } from '@/lib/auth';
import mongoose from 'mongoose';

// GET - Fetch all invoices for the current user
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    // Remove user filter to show all invoices
    const invoices = await Invoice.find({})
      .populate('client', 'name email company')
      .sort({ createdAt: -1 });
    return NextResponse.json({ invoices });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create a new invoice
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.replace('Bearer ', '');
    const payload = verifyJwt(token);
    if (!payload || typeof payload !== 'object' || !('email' in payload)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      clientName,
      company,
      email,
      address,
      phone,
      invoiceNumber,
      invoiceDate,
      dueDate,
      paymentTerms,
      currency,
      items,
      advanceAmount,
      advancePaid,
      total
    } = await req.json();

    // Create or find client
    let client = await Client.findOne({ email });
    
    if (!client) {
      client = await Client.create({
        name: clientName,
        email,
        company,
        address,
        phone,
        createdBy: new mongoose.Types.ObjectId(payload._id)
      });
    }

    // Calculate totals from items
    let calculatedSubtotal = 0;
    let calculatedTotal = 0;
    const itemsWithTotals = items.map(item => {
      const subtotal = item.unitPrice * item.quantity;
      const discount = subtotal * (item.discount / 100);
      const total = subtotal - discount;
      calculatedSubtotal += subtotal;
      calculatedTotal += total;
      return {
        ...item,
        total: total
      };
    });

    // Create invoice
    const invoice = await Invoice.create({
      client: client._id,
      items: itemsWithTotals,
      subtotal: calculatedSubtotal,
      total: calculatedTotal,
      balance: calculatedTotal - (advanceAmount || 0),
      status: 'draft',
      dueDate: new Date(dueDate),
      issuedDate: new Date(invoiceDate),
      createdBy: new mongoose.Types.ObjectId(payload._id),
      userId: new mongoose.Types.ObjectId(payload._id),
      // Additional fields for advance payment
      advanceAmount: advanceAmount || 0,
      advancePaid: advancePaid || false,
      currency,
      paymentTerms,
      invoiceNumber
    });

    const populatedInvoice = await Invoice.findById(invoice._id)
      .populate('client', 'name email company');

    return NextResponse.json({ 
      success: true, 
      invoice: populatedInvoice,
      message: 'Invoice created successfully' 
    });
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 });
  }
} 