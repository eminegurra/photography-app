"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch notifications
  // ✅ Fetch notifications (Fixed)
  const fetchNotifications = async () => {
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
      console.log("✅ Logged-in user:", userData);

      const notificationsRes = await fetch(`/api/notifications/all?userId=${userData.id}`);
      if (!notificationsRes.ok) throw new Error("Failed to fetch notifications");

      const data = await notificationsRes.json();
      setNotifications(data);
    } catch (error) {
      console.error("❌ Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };


  // ✅ Mark Notification as Read & Redirect to Image
  const markAsRead = async (notificationId, imageId) => {
    try {
      await fetch("/api/notifications/mark-as-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId }),
      });

      // ✅ Refetch notifications to update UI
      fetchNotifications();

      // ✅ Redirect to the image page
      router.push(`/image/${imageId}`);
    } catch (error) {
      console.error("❌ Error marking notification as read:", error);
    }
  };


  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ✅ Navbar */}
      <div className="bg-blue-600 text-white py-4 px-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <button
          onClick={() => {
            localStorage.removeItem("token");
            router.push("/login");
          }}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>

      {/* ✅ Notification List */}
      <div className="container mx-auto px-6 py-8">
        <h2 className="text-3xl font-semibold text-gray-800 mb-6">
          🔔 Notifications
        </h2>

        {loading ? (
          <p>Loading notifications...</p>
        ) : notifications.length > 0 ? (
          <ul className="bg-white p-4 shadow-md rounded-md">
            {notifications.map((notif) => (
              <li
                key={notif.id}
                className={`p-2 border-b cursor-pointer flex justify-between ${
                  notif.isRead
                    ? "text-gray-500" // Read - Normal text
                    : "bg-yellow-100 text-black font-bold" // Unread - Highlighted
                }`}
                onClick={() => markAsRead(notif.id, notif.imageId)}
              >
                <span>{notif.message}</span>
                <span className="text-sm text-gray-500">
                  {formatDistanceToNow(new Date(notif.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No new notifications</p>
        )}
      </div>
    </div>
  );
}
