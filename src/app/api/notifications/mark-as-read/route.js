import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { notificationId } = await req.json();

    if (!notificationId) {
      return new Response(JSON.stringify({ message: "Notification ID is required" }), { status: 400 });
    }

    await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    return new Response(JSON.stringify({ message: "Notification marked as read" }), { status: 200 });
  } catch (error) {
    console.error("❌ Error updating notification:", error);
    return new Response(
      JSON.stringify({ message: "Error updating notification", error: error.message }),
      { status: 500 }
    );
  }
}
