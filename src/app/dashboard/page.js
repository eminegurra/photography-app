"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [images, setImages] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]); // Instant Notifications
  const [showNotifications, setShowNotifications] = useState(false); // Toggle Notification Dropdown

  // ✅ Fetch user images function
  const fetchUserImages = async (userId) => {
    try {
      const res = await fetch(`/api/images/user?userId=${userId}`);
      if (!res.ok) throw new Error("Failed to fetch images");

      const data = await res.json();
      setImages(data.map(img => ({ ...img, url: img.url.startsWith("/") ? img.url : `/${img.url}` })));
    } catch (error) {
      console.error("Error fetching images:", error);
    }
  };

  // ✅ Fetch user function
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

  useEffect(() => {
    fetchUser();
  }, []);

  // ✅ Handle file input change
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  // ✅ Handle image upload (Instant Notification)
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

        fetchUserImages(user.id); // ✅ Update images immediately

        // ✅ Add instant notification
        setNotifications((prev) => [...prev, { message: data.notification }]);

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
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Navbar */}
      <div className="bg-blue-600 text-white py-4 px-6 flex justify-between items-center relative">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        
        {/* Notification Bell */}
        <div className="relative">
          <span 
            className="text-2xl cursor-pointer" 
            onClick={() => setShowNotifications(!showNotifications)}
          >
            🔔
          </span>

          {/* Notification Count */}
          {notifications.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {notifications.length}
            </span>
          )}

          {/* Notification Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-64 bg-white shadow-md rounded-md p-2 z-50">
              <h3 className="text-gray-800 text-sm font-semibold mb-2">Notifications</h3>
              
              {notifications.length > 0 ? (
                notifications.map((notif, index) => (
                  <p key={index} className="text-gray-700 text-sm border-b pb-2 mb-2">{notif.message}</p>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No new notifications</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Page Content */}
      <div className="container mx-auto px-6 py-8">
        <h2 className="text-3xl font-semibold text-gray-800 mb-6">
          Welcome, {user?.name}!
        </h2>

        {/* Image Upload Section */}
        <div className="bg-white p-6 shadow-md rounded-md mb-6">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Upload an Image</h3>
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
          {loading && <p className="text-gray-500 text-sm mt-2">Uploading...</p>}
        </div>

        {/* Image Gallery Section */}
        <div className="bg-white p-6 shadow-md rounded-md">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Your Uploaded Images</h3>
          {images.length > 0 ? (
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {images.map((img) => (
                <div key={img.id} className="rounded-md overflow-hidden shadow-md">
                  <img src={img.url} alt="Uploaded" className="w-full h-40 object-cover" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No images uploaded yet.</p>
          )}
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full bg-red-500 text-white p-3 rounded mt-6"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
