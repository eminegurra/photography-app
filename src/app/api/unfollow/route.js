import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { followerId, followingId } = await req.json();
    console.log("🔍 Unfollow Request:", { followerId, followingId });

    if (!followerId || !followingId) {
      return new Response(JSON.stringify({ message: "Both user IDs are required" }), { status: 400 });
    }

    // ✅ Check if the follow record exists
    const existingFollow = await prisma.follow.findFirst({
      where: { followerId, followingId },
    });

    if (!existingFollow) {
      console.log("⚠️ No follow record found!");
      return new Response(JSON.stringify({ message: "Not following this user" }), { status: 404 });
    }

    // ✅ Remove follow entry
    await prisma.follow.delete({
      where: { id: existingFollow.id },
    });

    console.log("✅ Unfollowed successfully!");
    return new Response(JSON.stringify({ message: "Unfollowed successfully" }), { status: 200 });

  } catch (error) {
    console.error("❌ Unfollow API Error:", error);
    return new Response(JSON.stringify({ message: "Error unfollowing user", error: error.message }), { status: 500 });
  }
}
