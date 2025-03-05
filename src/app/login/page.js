export default function Login() {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <form className="p-6 bg-white shadow-md rounded-md">
          <h2 className="text-2xl font-bold mb-4">Login</h2>
          <input type="email" placeholder="Email" className="border p-2 w-full mb-2" />
          <input type="password" placeholder="Password" className="border p-2 w-full mb-2" />
          <button className="w-full bg-green-500 text-white p-2 rounded">Login</button>
        </form>
      </div>
    );
  }
  