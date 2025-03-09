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
  const [users, setUsers] = useState([]); // ✅ Store users
  const [notifications, setNotifications] = useState([]);
  const [user, setUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [following, setFollowing] = useState(new Set()); // ✅ Store followed users

  // ✅ Fetch images
  const fetchImages = async () => {
    try {
      const res = await fetch("/api/images/all");
      if (!res.ok) throw new Error("Failed to fetch images");

      const data = await res.json();
      setImages(data);
    } catch (error) {
      console.error("❌ Error fetching images:", error);
    }
  };

  // ✅ Fetch users excluding the logged-in user
  const fetchUsers = async () => {
    if (!user) return; // Ensure user is logged in
  
    try {
      const res = await fetch(`/api/users?exclude=${user.id}`); // Fetch users except the logged-in user
      if (!res.ok) throw new Error("Failed to fetch users");
  
      const data = await res.json();
      console.log("✅ Users Fetched:", data); // Debugging
      setUsers(data);
    } catch (error) {
      console.error("❌ Error fetching users:", error);
    }
  };
  const fetchUnreadNotifications = async () => {
    if (!user) return;

    try {
      const res = await fetch(`/api/notifications/unread?userId=${user.id}`);
      if (!res.ok) throw new Error("Failed to fetch unread notifications");

      const data = await res.json();
      setUnreadCount(data.length); // ✅ Fix: Correctly set unread count
    } catch (error) {
      console.error("❌ Error fetching unread notifications:", error);
    }
  };

  // ✅ Fetch follow status
  const fetchFollowStatus = async (userId, profileId) => {
    try {
      const res = await fetch(`/api/following?followerId=${userId}&followingId=${profileId}`);
      if (!res.ok) throw new Error("Failed to fetch following status");
  
      const data = await res.json();
      return data.isFollowing; // ✅ True if following, false otherwise
    } catch (error) {
      console.error("❌ Error fetching following status:", error);
      return false; // Default to false if there's an error
    }
  };
  

  // ✅ Fetch logged-in user
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
  }, []);

  useEffect(() => {
    fetchImages();
    fetchUsers();
    fetchUnreadNotifications();
  }, [user]);

  useEffect(() => {
    if (user && users.length > 0) {
      const fetchStatuses = async () => {
        const followStatuses = new Set();
        for (const profileUser of users) {
          const isFollowing = await fetchFollowStatus(user.id, profileUser.id);
          if (isFollowing) {
            followStatuses.add(profileUser.id);
          }
        }
        setFollowing(followStatuses);
      };
      fetchStatuses();
    }
  }, [user, users]); // ✅ Dependency array now includes `users`
  
  
  

  // ✅ Handle Follow
  const handleFollow = async (targetUserId) => {
    try {
      const res = await fetch("/api/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followerId: user.id, followingId: targetUserId }),
      });

      if (!res.ok) throw new Error("Failed to follow user");
      setFollowing((prev) => new Set([...prev, targetUserId])); // ✅ Add to followed users
    } catch (error) {
      console.error("❌ Follow error:", error);
    }
  };

  // ✅ Handle Unfollow
  const handleUnfollow = async (targetUserId) => {
    try {
      const res = await fetch("/api/unfollow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followerId: user.id, followingId: targetUserId }),
      });

      if (!res.ok) throw new Error("Failed to unfollow user");
      setFollowing((prev) => {
        const updated = new Set(prev);
        updated.delete(targetUserId);
        return updated;
      });
    } catch (error) {
      console.error("❌ Unfollow error:", error);
    }
  };

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
        <p className="text-gray-500">Follow users to see their updates.</p>

        {/* 🧑‍🤝‍🧑 Users List */}
        {user && (
          <div className="w-full max-w-2xl bg-white shadow-md p-4 rounded-md mt-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Suggested Users</h2>
            {users.length > 0 ? (
              <ul>
                {users.map((u) => (
                  <li key={u.id} className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-700">{u.name}</span>
                    {following.has(u.id) ? (
                      <button onClick={() => handleUnfollow(u.id)} className="px-3 py-1 bg-red-500 text-white rounded">
                        Unfollow
                      </button>
                    ) : (
                      <button onClick={() => handleFollow(u.id)} className="px-3 py-1 bg-blue-500 text-white rounded">
                        Follow
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No users available.</p>
            )}
          </div>
        )}

        {/* 📷 Image Slider */}
        <div className="w-full max-w-3xl mt-6">
          {images.length > 0 ? (
            <Swiper modules={[Navigation, Pagination, Autoplay]} spaceBetween={10} slidesPerView={1} loop autoplay={{ delay: 3000 }}>
              {images.map((img) => (
                <SwiperSlide key={img.id}>
                  <img src={img.url} alt="Uploaded" className="w-full h-72 object-cover rounded-md" />
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
