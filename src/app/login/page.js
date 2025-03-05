"use client"; // Required for Next.js App Router (useRouter & useState)

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please enter both email and password.");
      return;
    }

    // Simulate authentication
    localStorage.setItem("token", "mock_token");
    localStorage.setItem("user", JSON.stringify({ name: "John Doe", email }));

    router.push("/dashboard"); // Redirect to user dashboard
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form className="p-6 bg-white shadow-md rounded-md w-80" onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Login</h2>
        
        <input
          type="email"
          placeholder="Email"
          className="border p-2 w-full mb-2 text-gray-600"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        
        <input
          type="password"
          placeholder="Password"
          className="border p-2 w-full mb-2 text-gray-600"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        
        <button className="w-full bg-green-500 text-white p-2 rounded">Login</button>

        <p className="text-gray-500 text-sm mt-4">
          Don't have an account? <Link href="/register" className="text-blue-500">Register here</Link>
        </p>
      </form>
    </div>
  );
}
