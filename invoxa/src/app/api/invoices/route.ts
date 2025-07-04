// Placeholder for invoices CRUD API
// GET: List invoices
// POST: Create invoice
// PUT: Update invoice
// DELETE: Delete invoice

import clientPromise from '@/lib/db';
import { ObjectId } from 'mongodb';

const DB_NAME = 'invoxa';
const COLLECTION = 'invoices';

export async function GET(request: Request) {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const invoices = await db.collection(COLLECTION).find({}).toArray();
    return Response.json(invoices);
  } catch (err) {
    return Response.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    // Ensure total is present or calculate it (amount - (amount * discount / 100))
    let { amount, discount, total } = data;
    amount = parseFloat(amount);
    discount = parseFloat(discount);
    if (typeof total === 'undefined') {
      total = Math.max(0, amount - (amount * (discount / 100)));
    }
    const invoiceData = { ...data, amount, discount, total };
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const result = await db.collection(COLLECTION).insertOne(invoiceData);
    return Response.json({ _id: result.insertedId, ...invoiceData });
  } catch (err) {
    return Response.json({ error: 'Failed to create invoice' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    if (!data._id) return Response.json({ error: 'Missing _id' }, { status: 400 });
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const { _id, ...update } = data;
    await db.collection(COLLECTION).updateOne({ _id: new ObjectId(_id) }, { $set: update });
    return Response.json({ _id, ...update });
  } catch (err) {
    return Response.json({ error: 'Failed to update invoice' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { _id } = await request.json();
    if (!_id) return Response.json({ error: 'Missing _id' }, { status: 400 });
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    await db.collection(COLLECTION).deleteOne({ _id: new ObjectId(_id) });
    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: 'Failed to delete invoice' }, { status: 500 });
  }
} 