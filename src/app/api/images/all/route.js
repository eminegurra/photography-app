import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const images = await prisma.image.findMany({
      include: { user: { select: { name: true } } }, // ✅ Include User Name
      orderBy: { createdAt: "desc" }, // ✅ Show latest first
    });

    console.log("✅ API Images:", images); // Debugging

    return new Response(JSON.stringify(images), { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching images:", error);
    return new Response(JSON.stringify({ message: "Error fetching images" }), { status: 500 });
  }
}
