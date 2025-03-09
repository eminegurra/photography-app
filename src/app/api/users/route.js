import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req) {
  try {
    // ✅ Get the logged-in user ID from query (passed from frontend)
    const url = new URL(req.url);
    const excludeUserId = url.searchParams.get("exclude");

    // ✅ Fetch all users except the logged-in user
    const users = await prisma.user.findMany({
      where: excludeUserId ? { id: { not: excludeUserId } } : {}, // Exclude the logged-in user
      select: { id: true, name: true }, // Only return necessary data
      orderBy: { name: "asc" }, // Alphabetical order
    });

    return new Response(JSON.stringify(users), { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    return new Response(JSON.stringify({ message: "Error fetching users" }), { status: 500 });
  }
}
