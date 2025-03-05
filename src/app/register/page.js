import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Register() {
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate user registration
    router.push("/login"); // Redirect to login page
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form className="p-6 bg-white shadow-md rounded-md w-80" onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Register</h2>
        <input type="text" placeholder="Name" className="border p-2 w-full mb-2 text-gray-600" />
        <input type="email" placeholder="Email" className="border p-2 w-full mb-2 text-gray-600" />
        <input type="password" placeholder="Password" className="border p-2 w-full mb-2 text-gray-600" />
        <button className="w-full bg-blue-500 text-white p-2 rounded">Register</button>
        <p className="text-gray-500 text-sm mt-4">
          Already have an account? <Link href="/login" className="text-blue-500">Login here</Link>
        </p>
      </form>
    </div>
  );
}
