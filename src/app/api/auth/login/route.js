import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken"; // Fix import
import "dotenv/config"; // Ensure env variables are loaded

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    // Check if user exists
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.error("❌ Invalid credentials - User not found:", email);
      return new Response(JSON.stringify({ message: "Invalid credentials" }), { status: 400 });
    }

    // Check password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      console.error("❌ Invalid credentials - Incorrect password for:", email);
      return new Response(JSON.stringify({ message: "Invalid credentials" }), { status: 400 });
    }

    // Ensure JWT_SECRET is set
    if (!process.env.JWT_SECRET) {
      console.error("❌ Missing JWT_SECRET in environment variables");
      return new Response(JSON.stringify({ message: "Server error: Missing secret key" }), { status: 500 });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    console.log("✅ User logged in:", user.email);

    return new Response(
      JSON.stringify({ token, user: { id: user.id, name: user.name, email: user.email } }),
      {
        status: 200,
        headers: {
          "Set-Cookie": `token=${token}; Path=/; HttpOnly; Secure; SameSite=Strict`,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("❌ Login Error:", error);
    return new Response(JSON.stringify({ message: "Error logging in", error: error.message }), { status: 500 });
  }
}
