import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return new Response(JSON.stringify({ message: "User ID is required" }), { status: 400 });
    }

    // ✅ Fetch unread notifications
    const unreadNotifications = await prisma.notification.findMany({
      where: { 
        // userId: userId,
        isRead: false },
      orderBy: { createdAt: "desc" },
    });

    return new Response(JSON.stringify(unreadNotifications), { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching unread notifications:", error);
    return new Response(JSON.stringify({ message: "Error fetching notifications", error: error.message }), { status: 500 });
  }
}
