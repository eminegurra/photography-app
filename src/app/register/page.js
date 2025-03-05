export default function Register() {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <form className="p-6 bg-white shadow-md rounded-md">
          <h2 className="text-2xl font-bold mb-4">Register</h2>
          <input type="text" placeholder="Name" className="border p-2 w-full mb-2" />
          <input type="email" placeholder="Email" className="border p-2 w-full mb-2" />
          <input type="password" placeholder="Password" className="border p-2 w-full mb-2" />
          <button className="w-full bg-blue-500 text-white p-2 rounded">Register</button>
        </form>
      </div>
    );
  }
  