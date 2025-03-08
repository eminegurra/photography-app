"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { Bell } from "lucide-react"; // Notification bell icon

export default function Home() {
  const router = useRouter();
  const [images, setImages] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [user, setUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // ✅ Fetch all uploaded images
  const fetchImages = async () => {
    try {
      const res = await fetch("/api/images/all");
      if (!res.ok) throw new Error("Failed to fetch images");

      const data = await res.json();
      console.log("✅ API Response:", data); // Debugging

      // ✅ Ensure `url` exists in the response
      const formattedImages = data
        .filter((img) => img && img.url) // Remove undefined images
        .map((img) => ({
          ...img,
          url: img.url.startsWith("/") ? img.url : `/${img.url}`,
        }));

      console.log("✅ Formatted Images:", formattedImages);
      setImages(formattedImages);
    } catch (error) {
      console.error("❌ Error fetching images:", error);
    }
  };

  // ✅ Fetch user
  const fetchUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch("/api/auth/user", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) return;

      const userData = await res.json();
      setUser(userData);
    } catch (error) {
      console.error("❌ Error fetching user:", error);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchImages();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ✅ Navbar */}
      <nav className="bg-white shadow-md p-4 flex justify-between items-center">
        <h4 className="text-lg font-semibold text-gray-700">Photography App</h4>

        <div className="flex items-center space-x-4">
          {user ? (
            <>
              {/* ✅ Notification Bell */}
              <Link href="/notifications" className="relative">
                <Bell className="h-6 w-6 text-gray-700 cursor-pointer" />
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1">
                    {unreadCount}
                  </span>
                )}
              </Link>

              {/* ✅ Logout Button */}
              <button
                onClick={() => {
                  localStorage.removeItem("token");
                  setUser(null);
                  router.push("/login");
                }}
                className="px-4 py-2 bg-red-500 text-gray-100 rounded"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              {/* ✅ Show Register & Login when not logged in */}
              <Link href="/register" className="px-4 py-2 bg-blue-500 text-gray-100 rounded">
                Register
              </Link>
              <Link href="/login" className="px-4 py-2 bg-green-500 text-gray-100 rounded">
                Login
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* ✅ Main Content */}
      <main className="flex flex-col items-center justify-center py-8 text-gray-600">
        <h1 className="text-3xl font-bold text-gray-700 mb-4">Welcome to Photography App</h1>
        <p className="text-gray-500">Capture your moments with us.</p>

        {/* 📷 Image Slider */}
        <div className="w-full max-w-3xl mt-6">
          {images.length > 0 ? (
            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              spaceBetween={10}
              slidesPerView={1}
              loop={true}
              autoplay={{ delay: 3000, disableOnInteraction: false }}
              navigation
              pagination={{ clickable: true }}
              className="w-full"
            >
              {images.map((img) => (
                <SwiperSlide key={img.id} className="flex justify-center items-center">
                  <img
                    src={img.url}
                    alt="Uploaded"
                    className="w-full h-72 object-cover rounded-md"
                    onError={(e) => (e.target.style.display = "none")} // Hide broken images
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <p className="text-gray-500 text-center">No images uploaded yet.</p>
          )}
        </div>
      </main>
    </div>
  );
}
