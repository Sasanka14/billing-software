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

    // In the GET handler for fetching invoices, after fetching, check if dueDate < today and status is not 'paid', set status to 'overdue' and save.
    const today = new Date();
    for (const invoice of invoices) {
      if (invoice.dueDate < today && invoice.status !== 'paid') {
        invoice.status = 'overdue';
        await invoice.save();
      }
    }

    return NextResponse.json({ invoices });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create a new invoice
export async function POST(req: NextRequest) {
  function generateInvoiceNumber() {
    const date = new Date();
    const ymd = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `INV-${ymd}-${rand}`;
  }
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
      invoiceNumber: reqInvoiceNumber,
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
    } else {
      // Update client details if changed
      let updated = false;
      if (client.name !== clientName) { client.name = clientName; updated = true; }
      if (client.company !== company) { client.company = company; updated = true; }
      if (client.address !== address) { client.address = address; updated = true; }
      if (client.phone !== phone) { client.phone = phone; updated = true; }
      if (updated) await client.save();
    }

    // Calculate totals from items
    let calculatedSubtotal = 0;
    let calculatedTotal = 0;
    const itemsWithTotals = items.map((item: any) => {
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

    // Unique invoice number logic with retry
    let invoice = null;
    let finalInvoiceNumber = reqInvoiceNumber || generateInvoiceNumber();
    let attempt = 0;
    let lastError = null;
    while (attempt < 5) {
      try {
        invoice = await Invoice.create({
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
          advanceAmount: advanceAmount || 0,
          advancePaid: advancePaid || false,
          currency,
          paymentTerms,
          invoiceNumber: finalInvoiceNumber
        });
        break; // Success
      } catch (err: any) {
        // Duplicate key error code for MongoDB
        if (err.code === 11000 && err.keyPattern && err.keyPattern.invoiceNumber) {
          attempt++;
          finalInvoiceNumber = generateInvoiceNumber();
          lastError = err;
        } else {
          throw err;
        }
      }
    }
    if (!invoice) {
      console.error('Error creating invoice (duplicate invoiceNumber):', lastError);
      return NextResponse.json({ error: 'Failed to create invoice: Could not generate a unique invoice number. Please try again.' }, { status: 500 });
    }

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