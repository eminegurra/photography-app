import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId"); // ✅ Get the logged-in user ID
    console.log("🔍 Fetching notifications for user:", userId);

    if (!userId) {
      return new Response(JSON.stringify({ message: "User ID is required" }), { status: 400 });
    }

    // ✅ Step 1: Get users that the logged-in user follows
    const following = await prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });

    const followedUserIds = following.map((f) => f.followingId);
    console.log("✅ Followed Users:", followedUserIds);

    // ✅ Step 2: Fetch notifications meant for the user OR from followed users
    const notifications = await prisma.notification.findMany({
      where: {
        userId: userId , // ✅ Notifications from followed users
      },
      orderBy: { createdAt: "desc" },
    });

    console.log("✅ Notifications found:", notifications);

    return new Response(JSON.stringify(notifications), { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching notifications:", error);
    return new Response(
      JSON.stringify({ message: "Error fetching notifications", error: error.message }),
      { status: 500 }
    );
  }
}
