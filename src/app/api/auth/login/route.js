import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { sign } from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    // Check if user exists
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return new Response(JSON.stringify({ message: "Invalid credentials" }), { status: 400 });
    }

    // Check password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return new Response(JSON.stringify({ message: "Invalid credentials" }), { status: 400 });
    }

    // Generate JWT token
    const token = sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    return new Response(JSON.stringify({ token, user }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: "Error logging in", error }), { status: 500 });
  }
}
