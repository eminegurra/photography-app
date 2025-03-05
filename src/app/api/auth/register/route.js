import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken"; // Fix import
import "dotenv/config"; // Ensure env variables are loaded

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();

    // Validate input
    if (!name || !email || !password) {
      return new Response(JSON.stringify({ message: "All fields are required" }), { status: 400 });
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      return new Response(JSON.stringify({ message: "Invalid email format" }), { status: 400 });
    }

    if (password.length < 6) {
      return new Response(JSON.stringify({ message: "Password must be at least 6 characters long" }), { status: 400 });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      console.error("❌ Registration Error - User already exists:", email);
      return new Response(JSON.stringify({ message: "User already exists" }), { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    console.log("✅ New user registered:", newUser.email);

    // Ensure JWT_SECRET is set
    if (!process.env.JWT_SECRET) {
      console.error("❌ Missing JWT_SECRET in environment variables");
      return new Response(JSON.stringify({ message: "Server error: Missing secret key" }), { status: 500 });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: newUser.id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    return new Response(
      JSON.stringify({ message: "User created successfully", token, user: { id: newUser.id, name: newUser.name, email: newUser.email } }),
      {
        status: 201,
        headers: {
          "Set-Cookie": `token=${token}; Path=/; HttpOnly; Secure; SameSite=Strict`,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("❌ Registration Error:", error);
    return new Response(JSON.stringify({ message: "Internal server error", error: error.message }), { status: 500 });
  }
}
