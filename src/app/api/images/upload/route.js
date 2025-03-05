import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { userId, imageUrl } = await req.json();

    if (!userId || !imageUrl) {
      return new Response(JSON.stringify({ message: "User ID and Image URL are required" }), { status: 400 });
    }

    // Convert Base64 to Buffer
    const base64Data = imageUrl.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    // Generate unique file name
    const fileName = `${Date.now()}-${userId}.jpg`;
    const filePath = path.join(process.cwd(), "public/uploads", fileName);

    // Ensure uploads folder exists
    const uploadsDir = path.join(process.cwd(), "public/uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Save file
    fs.writeFileSync(filePath, buffer);

    // Save only the file path in the database
    const savedImage = await prisma.image.create({
      data: {
        url: `/uploads/${fileName}`, // Store file path instead of Base64
        userId: userId,
      },
    });

    return new Response(JSON.stringify({ message: "Image uploaded", image: savedImage }), { status: 201 });
  } catch (error) {
    console.error("❌ Image Upload Error:", error);
    return new Response(JSON.stringify({ message: "Error uploading image", error: error.message }), { status: 500 });
  }
}
