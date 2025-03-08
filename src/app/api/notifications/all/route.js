import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // ✅ Fetch all notifications (latest first)
    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: "desc" },
    });

    return new Response(JSON.stringify(notifications), { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching notifications:", error);
    return new Response(JSON.stringify({ message: "Error fetching notifications" }), { status: 500 });
  }
}
