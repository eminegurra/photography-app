import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req, { params }) {
  try {
    const { id } = params;

    if (!id) {
      return new Response(JSON.stringify({ message: "Image ID is required" }), { status: 400 });
    }

    // ✅ Fetch image by ID
    const image = await prisma.image.findUnique({
      where: { id },
      include: { user: { select: { name: true } } }, // Include uploader's name
    });

    if (!image) {
      return new Response(JSON.stringify({ message: "Image not found" }), { status: 404 });
    }

    return new Response(JSON.stringify(image), { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching image:", error);
    return new Response(JSON.stringify({ message: "Error fetching image" }), { status: 500 });
  }
}
