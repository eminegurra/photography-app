import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-white shadow-md p-4 flex justify-between items-center">
        <h4 className="text-lg font-semibold text-gray-700">Photography App</h4>
        <div className="space-x-4">
          <Link href="/register" className="px-4 py-2 bg-blue-500 text-gray-100 rounded">Register</Link>
          <Link href="/login" className="px-4 py-2 bg-green-500 text-gray-100 rounded">Login</Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center h-[80vh] text-gray-600">
        <h1 className="text-3xl font-bold text-gray-700 mb-4">Welcome to Photography App</h1>
        <p className="text-gray-500">Capture your moments with us.</p>
      </main>
    </div>
  );
}
