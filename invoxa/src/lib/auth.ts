import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { IUser } from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET as string;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET not set in environment variables');
}

// Hash password
export async function hashPassword(password: string) {
  return await bcrypt.hash(password, 10);
}

// Compare password
export async function comparePassword(password: string, hash: string) {
  return await bcrypt.compare(password, hash);
}

// Sign JWT
export function signJwt(user: Pick<IUser, '_id' | 'email' | 'role'>) {
  return jwt.sign(
    { _id: user._id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '100y' }
  );
}

// Verify JWT
export function verifyJwt(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

// Role check helper
export function isAdmin(user: IUser) {
  return user.role === 'admin';
} 