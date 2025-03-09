import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { followerId, followingId } = await req.json();

    if (!followerId || !followingId) {
      return new Response(JSON.stringify({ message: "Both user IDs are required" }), { status: 400 });
    }

    // ✅ Check if already following
    const existingFollow = await prisma.follow.findFirst({
      where: { followerId, followingId },
    });

    if (existingFollow) {
      return new Response(JSON.stringify({ message: "Already following" }), { status: 400 });
    }

    // ✅ Create new follow entry
    await prisma.follow.create({
      data: { followerId, followingId },
    });

    return new Response(JSON.stringify({ message: "Followed successfully" }), { status: 201 });
  } catch (error) {
    console.error("❌ Follow API Error:", error);
    return new Response(JSON.stringify({ message: "Error following user", error: error.message }), { status: 500 });
  }
}
