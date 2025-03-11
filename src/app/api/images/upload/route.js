import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import pusher from "../../../../lib/pusher"; 




const prisma = new PrismaClient();

export async function POST(req) {
  try {
    console.log("📢 Upload API Called");

    const { userId, imageUrl } = await req.json();
    console.log("📝 Received Data:", { userId, imageUrl });

    if (!userId || !imageUrl) {
      return new Response(JSON.stringify({ message: "User ID and Image URL are required" }), { status: 400 });
    }

    // ✅ Fetch user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });

    if (!user) {
      console.error("❌ User not found:", userId);
      return new Response(JSON.stringify({ message: "User not found" }), { status: 404 });
    }

    // ✅ Try fetching followers (Handle errors)
    let followers = [];
    try {
      followers = await prisma.follow.findMany({
        where: { followingId: userId },
        select: { followerId: true },
      });
    } catch (error) {
      console.error("❌ Error fetching followers:", error);
      return new Response(JSON.stringify({ message: "Database error fetching followers" }), { status: 500 });
    }

    console.log("👥 Followers:", followers);

    // Convert Base64 to Buffer
    const base64Data = imageUrl.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    // Save image to server
    const fileName = `${Date.now()}-${userId}.jpg`;
    const filePath = path.join(process.cwd(), "public/uploads", fileName);

    if (!fs.existsSync(path.dirname(filePath))) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
    }
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

    // ✅ Create notifications for followers
    if (followers.length > 0) {
      await prisma.notification.createMany({
        data: followers.map((follower) => ({
          message: `📢 New image uploaded by ${user.name}!`,
          userId: follower.followerId,
          imageId: savedImage.id,
          isRead: false,
        })),
      });

      // ✅ Trigger Pusher Event for Real-time Notification
      followers.forEach(async (follower) => {
        const notificationData = {
          message: `📢 New image uploaded by ${user.name}!`,
          imageId: savedImage.id,
          createdAt: new Date(),
        };

        try {
          await pusher.trigger(`notifications-${follower.followerId}`, "new-notification", notificationData);
          console.log(`✅ Pusher Notification Sent to ${follower.followerId}`);
        } catch (error) {
          console.error("❌ Pusher Error:", error);
        }
      });


      console.log("✅ Notifications sent to followers via Pusher!");
    } else {
      console.log("ℹ No followers to notify.");
    }


    return new Response(
      JSON.stringify({
        message: "Image uploaded successfully!",
        image: savedImage,
        notification: `📢 New image uploaded by ${user.name}!`,
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Image Upload Error:", error);
    return new Response(
      JSON.stringify({ message: "Error uploading image", error: error.message }),
      { status: 500 }
    );
  }
}
