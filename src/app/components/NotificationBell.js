"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function NotificationBell() {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications/unread");
      if (!res.ok) throw new Error("Failed to fetch notifications");

      const data = await res.json();
      setNotifications(data);
    } catch (error) {
      console.error("❌ Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsReadAndRedirect = async (notification) => {
    await fetch("/api/notifications/mark-as-read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificationId: notification.id }),
    });

    router.push(`/images/${notification.userId}`);
  };

  return (
    <div className="relative">
      <span className="text-2xl cursor-pointer">🔔</span>
      {notifications.length > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
          {notifications.length}
        </span>
      )}

      {/* Notification List */}
      <div className="absolute right-0 mt-2 w-64 bg-white shadow-md rounded-md p-2">
        {notifications.map((notif) => (
          <p
            key={notif.id}
            className={`cursor-pointer text-sm p-2 ${
              notif.isRead ? "text-gray-500" : "text-black bg-yellow-200"
            }`}
            onClick={() => markAsReadAndRedirect(notif)}
          >
            {notif.message}
          </p>
        ))}
      </div>
    </div>
  );
}
