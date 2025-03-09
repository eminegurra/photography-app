import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const followerId = searchParams.get("followerId"); // ✅ The logged-in user
    const followingId = searchParams.get("followingId"); // ✅ The user being checked

    if (!followerId || !followingId) {
      return new Response(JSON.stringify({ message: "Both followerId and followingId are required" }), { status: 400 });
    }

    // ✅ Check if the user follows another user
    const follow = await prisma.follow.findFirst({
      where: { followerId, followingId }, // ✅ Check if this relation exists
    });

    return new Response(JSON.stringify({ isFollowing: !!follow }), { status: 200 });

  } catch (error) {
    console.error("❌ Error fetching follow status:", error);
    return new Response(JSON.stringify({ message: "Error fetching follow status", error: error.message }), { status: 500 });
  }
}
