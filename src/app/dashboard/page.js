"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bell } from "lucide-react";
import Pusher from "pusher-js";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [images, setImages] = useState([]); 
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // ✅ Fetch user images function
  const fetchUserImages = async (userId) => {
    try {
      const res = await fetch(`/api/images/user?userId=${userId}`);
      if (!res.ok) throw new Error("Failed to fetch images");

      const data = await res.json();
      setImages(data.map((img) => ({
        ...img,
        url: img.url.startsWith("/") ? img.url : `/${img.url}`,
      })));
    } catch (error) {
      console.error("Error fetching images:", error);
    }
  };

  // ✅ Fetch unread notifications count
  const fetchUnreadNotifications = async () => {
    if (!user) return;

    try {
      const res = await fetch(`/api/notifications/unread?userId=${user.id}`);
      if (!res.ok) throw new Error("Failed to fetch unread notifications");

      const data = await res.json();
      setUnreadCount(data.length);
    } catch (error) {
      console.error("❌ Error fetching unread notifications:", error);
    }
  };

  // ✅ Initialize Pusher for Real-time Notification Updates
  useEffect(() => {
    if (!user) return;

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    });

    const channel = pusher.subscribe(`notifications-${user.id}`);

    channel.bind("new-notification", async (data) => {
      console.log("🔔 New Notification Received:", data);

      setNotifications((prev) => [data, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [user]);

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
      fetchUnreadNotifications();
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

  // ✅ Handle image upload
  const handleUploadClick = async () => {
    if (!selectedFile || !user || !user.id) {
      alert("❌ Please select an image and make sure you're logged in.");
      return;
    }

    setLoading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const imageUrl = reader.result;

      try {
        const res = await fetch("/api/images/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id, imageUrl }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "Upload failed");
        }

        fetchUserImages(user.id);
        fetchUnreadNotifications();
        setSelectedFile(null);
      } catch (error) {
        console.error("❌ Upload error:", error);
        alert(`Upload error: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(selectedFile);
  };

  // ✅ Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Navbar */}
      <div className="bg-blue-600 text-white py-4 px-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>

        {/* ✅ Notification Bell with unread count */}
        <Link href="/notifications" className="relative">
          <Bell className="h-7 w-7 text-white cursor-pointer" />
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {unreadCount}
            </span>
          )}
        </Link>

        <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded">
          Logout
        </button>
      </div>

      {/* Page Content */}
      <div className="container mx-auto px-6 py-8">
        <h2 className="text-3xl font-semibold text-gray-800 mb-6">Welcome, {user?.name}!</h2>

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
            <button onClick={handleUploadClick} className="w-full bg-blue-500 text-white p-2 rounded mt-2">
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
      </div>
    </div>
  );
}
