import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      console.error("🚨 Missing userId in request");
      return new Response(
        JSON.stringify({ message: "User ID is required" }),
        { status: 400 }
      );
    }

    console.log(`🔍 Fetching notifications for: ${userId}`);

    const unreadNotifications = await prisma.notification.findMany({
      where: {
        userId: userId , // ✅ Notifications from followed users
        isRead: false, // ✅ Only unread notifications
      },
      orderBy: { createdAt: "desc" },
    });

    console.log("✅ Unread Notifications Found:", unreadNotifications);

    return new Response(JSON.stringify(unreadNotifications), { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching unread notifications:", error);
    return new Response(
      JSON.stringify({ message: "Error fetching unread notifications", error: error.message }),
      { status: 500 }
    );
  }
}
