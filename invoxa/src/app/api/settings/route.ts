import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { verifyJwt, hashPassword, comparePassword } from '@/lib/auth';

export async function GET(req: NextRequest) {
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
  const user = await User.findOne({ email: payload.email }).select('-password');
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  return NextResponse.json({ user });
}

export async function PUT(req: NextRequest) {
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

  const { name, email, currentPassword, newPassword, profileImage } = await req.json();
  console.log('Settings update request:', { 
    hasName: !!name, 
    hasEmail: !!email, 
    hasCurrentPassword: !!currentPassword, 
    hasNewPassword: !!newPassword, 
    hasProfileImage: !!profileImage 
  });

  const user = await User.findOne({ email: payload.email });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const updates: any = {};

  // Update name if provided
  if (name && name !== user.name) {
    updates.name = name;
  }

  // Update email if provided
  if (email && email !== user.email) {
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser._id.toString() !== user._id.toString()) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
    }
    updates.email = email;
  }

  // Update password if provided
  if (currentPassword && newPassword) {
    const isMatch = await comparePassword(currentPassword, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
    }
    updates.password = await hashPassword(newPassword);
  }

  // Update profile image if provided
  if (profileImage) {
    console.log('Updating profile image for user:', user._id);
    updates.profileImage = profileImage;
  }

  console.log('Updates to apply:', Object.keys(updates));

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No changes provided' }, { status: 400 });
  }

  const updatedUser = await User.findByIdAndUpdate(
    user._id,
    updates,
    { new: true }
  ).select('-password');

  console.log('User updated successfully:', updatedUser._id);

  return NextResponse.json({ 
    user: updatedUser,
    message: 'Settings updated successfully' 
  });
} 