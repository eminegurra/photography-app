import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return new Response(JSON.stringify({ message: "User ID is required" }), { status: 400 });
    }

    const images = await prisma.image.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return new Response(JSON.stringify(images), { status: 200 });
  } catch (error) {
    console.error("Error fetching images:", error);
    return new Response(JSON.stringify({ message: "Error fetching images" }), { status: 500 });
  }
}
