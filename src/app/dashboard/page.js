"use client"; // Enables client-side React hooks like useRouter

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/login"); // Redirect to login if not authenticated
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login"); // Redirect to login after logout
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="p-6 bg-white shadow-md rounded-md w-80 text-gray-700">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Welcome, {user?.name}!
        </h2>
        <p className="text-gray-600">You're logged in as <strong>{user?.email}</strong></p>
        <button onClick={handleLogout} className="w-full bg-red-500 text-white p-2 rounded mt-4">
          Logout
        </button>
      </div>
    </div>
  );
}
