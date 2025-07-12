import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { hashPassword, signJwt } from '@/lib/auth';

export async function POST(req: NextRequest) {
  await dbConnect();
  const { name, email, password } = await req.json();

  if (!name || !email || !password) {
    return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return NextResponse.json({ error: 'User already exists.' }, { status: 409 });
  }

  const hashed = await hashPassword(password);
  const userCount = await User.countDocuments();
  const role = userCount === 0 ? 'admin' : 'team';
  const user = await User.create({ name, email, password: hashed, role });
  const token = signJwt({ _id: user._id, email: user.email, role: user.role });

  // Optionally set cookie here
  return NextResponse.json({ token, user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
} 