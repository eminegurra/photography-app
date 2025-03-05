"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [images, setImages] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch("/api/auth/user", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        router.push("/login");
        return;
      }

      const userData = await res.json();
      setUser(userData);
      fetchUserImages(userData.id);
    } catch (error) {
      console.error("Error fetching user:", error);
      router.push("/login");
    }
  };

  const fetchUserImages = async (userId) => {
    try {
      const res = await fetch(`/api/images/user?userId=${userId}`);
      if (!res.ok) throw new Error("Failed to fetch images");
      const data = await res.json();
  
      // Prepend `/` to file paths to load correctly
      setImages(data.map(img => ({ ...img, url: img.url.startsWith("/") ? img.url : `/${img.url}` })));
    } catch (error) {
      console.error("Error fetching images:", error);
    }
  };
  

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUploadClick = async () => {
    if (!selectedFile || !user || !user.id) {
      alert("❌ Please select an image and make sure you're logged in.");
      console.error("❌ Upload failed - Missing user or file:", { user, selectedFile });
      return;
    }
  
    setLoading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const imageUrl = reader.result;
  
      console.log("🔍 Sending Upload Request:", { userId: user.id, imageUrl });
  
      try {
        const res = await fetch("/api/images/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id, imageUrl }),
        });
  
        const data = await res.json();
        console.log("✅ Upload Response:", data);
  
        if (!res.ok) {
          throw new Error(data.message || "Upload failed");
        }
  
        fetchUserImages(user.id);
        setSelectedFile(null);
      } catch (error) {
        console.error("❌ Upload error:", error);
        alert(error.message);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(selectedFile);
  };
  
  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="p-6 bg-white shadow-md rounded-md w-96 text-gray-700">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Welcome, {user?.name}!
        </h2>
        <p className="text-gray-600">You're logged in as <strong>{user?.email}</strong></p>

        {/* Image Upload */}
        <div className="mt-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-600 border border-gray-300 rounded-md cursor-pointer bg-gray-50 p-2"
          />
          {selectedFile && (
            <button
              onClick={handleUploadClick}
              className="w-full bg-blue-500 text-white p-2 rounded mt-2"
            >
              Upload Image
            </button>
          )}
        </div>

        {loading && <p className="text-gray-500 text-sm mt-2">Uploading...</p>}

        {/* Image Gallery */}
        {images.length > 0 && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold text-gray-700">Your Images</h3>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {images.map((img) => (
                <img
                  key={img.id}
                  src={img.url}
                  alt="Uploaded"
                  className="w-32 h-32 object-cover rounded-md"
                />
              ))}
            </div>
          </div>
        )}

        {/* Logout Button */}
        <button onClick={handleLogout} className="w-full bg-red-500 text-white p-2 rounded mt-4">
          Logout
        </button>
      </div>
    </div>
  );
}
