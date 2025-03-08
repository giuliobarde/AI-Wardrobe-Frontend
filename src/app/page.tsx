"use client";

import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
      {/* Main Content */}
      <main className="flex flex-col items-center justify-center px-4 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Welcome to AI Wardrobe
        </h1>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl">
          Organize, style, and elevate your wardrobe with personalized outfit
          recommendations powered by AI.
        </p>
        <div className="flex space-x-4">
          <Link
            href="/Login"
            className="px-6 py-3 bg-blue-600 text-white rounded-full font-medium shadow hover:bg-blue-700 transition"
          >
            Get Started
          </Link>
          <Link
            href="/Explore"
            className="px-6 py-3 border border-blue-600 text-blue-600 rounded-full font-medium hover:bg-blue-50 transition"
          >
            Explore
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 p-4 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} AI Wardrobe. All rights reserved.
      </footer>
    </div>
  );
}
