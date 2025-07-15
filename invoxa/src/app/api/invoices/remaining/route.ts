import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Invoice from '@/models/Invoice';
import Client from '@/models/Client';
import { verifyJwt } from '@/lib/auth';
import mongoose from 'mongoose';

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
      clientName, company, email, address, phone, invoiceNumber: reqInvoiceNumber, invoiceDate, dueDate, paymentTerms, currency, items, discount, total, advanceAmount, remainingAmount, originalInvoiceId, advancePaid
    } = await req.json();

    if (!clientName || !email || !items || !items.length) {
      return NextResponse.json({ error: 'Missing required client or item fields.' }, { status: 400 });
    }

    // Lookup or create client
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

    // Ensure each item has a total
    const itemsWithTotals = items.map((item: any) => ({
      ...item,
      total: item.total || (item.unitPrice * item.quantity)
    }));

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
          subtotal: itemsWithTotals.reduce((sum: number, i: any) => sum + (i.unitPrice * i.quantity), 0),
          total: total,
          balance: remainingAmount,
          status: 'draft',
          dueDate: new Date(dueDate),
          issuedDate: new Date(invoiceDate),
          createdBy: new mongoose.Types.ObjectId(payload._id),
          userId: new mongoose.Types.ObjectId(payload._id),
          advanceAmount: advanceAmount || 0,
          paidAmount: 0,
          currency,
          paymentTerms,
          invoiceNumber: finalInvoiceNumber,
          // Optionally link to original invoice
          originalInvoiceId: originalInvoiceId || undefined,
          advancePaid: advancePaid || false
        });
        break; // Success
      } catch (err: any) {
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
      console.error('Error creating remaining invoice (duplicate invoiceNumber):', lastError);
      return NextResponse.json({ error: 'Failed to create remaining invoice: Could not generate a unique invoice number. Please try again.' }, { status: 500 });
    }

    const populatedInvoice = await Invoice.findById(invoice._id)
      .populate('client', 'name email company');

    return NextResponse.json({
      success: true,
      invoice: populatedInvoice,
      message: 'Remaining invoice created successfully'
    });
  } catch (error) {
    console.error('Error creating remaining invoice:', error);
    return NextResponse.json({ error: 'Failed to create remaining invoice' }, { status: 500 });
  }
} 