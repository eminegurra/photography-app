import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return new Response(JSON.stringify({ message: 'User already exists' }), { status: 400 });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    return new Response(JSON.stringify({ message: 'User created', user: newUser }), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Error creating user' }), { status: 500 });
  }
}
