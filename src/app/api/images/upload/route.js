import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    console.log("📢 Upload API Called"); // ✅ Debug log

    const { userId, imageUrl } = await req.json();
    console.log("📝 Received Data:", { userId, imageUrl });

    if (!userId || !imageUrl) {
      return new Response(JSON.stringify({ message: "User ID and Image URL are required" }), { status: 400 });
    }

    // ✅ Fetch user name
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });

    if (!user) {
      console.error("❌ User not found:", userId);
      return new Response(JSON.stringify({ message: "User not found" }), { status: 404 });
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
    console.log("✅ Image saved:", filePath);

    // ✅ Save image in database
    const savedImage = await prisma.image.create({
      data: {
        url: `/uploads/${fileName}`,
        userId: userId,
      },
    });

    console.log("✅ Image uploaded successfully!", savedImage);

    // ✅ Save notification in database (Unread by default)
    const savedNotification = await prisma.notification.create({
      data: {
        message: `📢 New image uploaded by ${user.name}!`,
        userId: userId, // ✅ Store directly
        imageId: savedImage.id, // ✅ Store image ID
        isRead: false, // ✅ Mark as unread
      },
    });
    


    console.log("✅ Notification saved successfully!", savedNotification);

    return new Response(JSON.stringify({ 
      message: "Image uploaded successfully!", 
      image: savedImage,
      notification: `📢 New image uploaded by ${user.name}!`
    }), { status: 201 });

  } catch (error) {
    console.error("❌ Image Upload Error:", error);
    return new Response(JSON.stringify({ message: "Error uploading image", error: error.message }), { status: 500 });
  }
}
