import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 flex flex-col justify-center items-center">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-lg z-10">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Bank
          </h1>
          <p className="text-gray-600 mb-6">
            Your secure online banking solution
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/login"
            className="w-full block text-center bg-indigo-600 text-white py-3 rounded-md hover:bg-indigo-700 transition-colors"
          >
            Login
          </Link>

          <Link
            href="/register"
            className="w-full block text-center border border-indigo-600 text-indigo-600 py-3 rounded-md hover:bg-indigo-50 transition-colors"
          >
            Register
          </Link>
        </div>

        <div className="text-center text-sm text-gray-500 mt-4">
          <p>Secure. Simple. Smart Banking.</p>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-24 bg-white/30 backdrop-blur-sm"></div>
    </div>
  );
}
