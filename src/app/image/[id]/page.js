"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ImagePage() {
  const router = useRouter();
  const params = useParams(); // ✅ Correct way to get dynamic route params
  const id = params?.id; // Ensure id is properly retrieved
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch Image by ID
  const fetchImage = async () => {
    if (!id) {
      console.error("❌ Error: Image ID is missing");
      return;
    }

    try {
      console.log(`🔍 Fetching image: /api/images/${id}`); // Debugging log
      const res = await fetch(`/api/images/${id}`);
      if (!res.ok) throw new Error("Failed to fetch image");

      const data = await res.json();
      console.log("✅ Image fetched:", data);
      setImage(data);
    } catch (error) {
      console.error("❌ Error fetching image:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchImage();
    }
  }, [id]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center">
      {/* ✅ Navbar */}
      <div className="bg-blue-600 text-white py-4 px-6 flex justify-between items-center w-full">
        <h1 className="text-2xl font-bold">Image Viewer</h1>
        <button
          onClick={() => router.push("/notifications")}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded"
        >
          Back to Notifications
        </button>
      </div>

      {/* ✅ Image Display */}
      <div className="container mx-auto px-6 py-8 text-center">
        {loading ? (
          <p className="text-gray-600">Loading image...</p>
        ) : image ? (
          <div className="bg-white p-6 shadow-md rounded-md">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Uploaded by {image.user?.name}
            </h2>
            <img
              src={image.url}
              alt="Uploaded"
              className="w-full max-w-3xl object-cover rounded-md shadow-md"
            />
            <p className="text-gray-500 mt-4">
              Uploaded {new Date(image.createdAt).toLocaleString()}
            </p>
          </div>
        ) : (
          <p className="text-gray-500">Image not found</p>
        )}
      </div>
    </div>
  );
}
