import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Client from '@/models/Client';
import { verifyJwt } from '@/lib/auth';

export async function DELETE(req: NextRequest) {
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
    // Extract id from the URL
    const id = req.nextUrl.pathname.split('/').pop();
    if (!id) {
      return NextResponse.json({ error: 'Client ID is required' }, { status: 400 });
    }
    const deleted = await Client.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting client:', error);
    return NextResponse.json({ error: 'Failed to delete client' }, { status: 500 });
  }
} 