"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import Link from "next/link";

export default function Profile() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user?.access_token) {
      router.push("/");
    }
  }, [user, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
          User Profile
        </h1>
        <div className="bg-white shadow-lg rounded-xl p-6">
          <h2 className="text-2xl font-semibold mb-4">
            {user?.first_name} {user?.last_name}
          </h2>
          <p className="text-gray-700 mb-2">
            <strong>Username:</strong> {user?.username}
          </p>
          <p className="text-gray-700 mb-2">
            <strong>Email:</strong> {user?.email}
          </p>
          <p className="text-gray-700 mb-2">
            <strong>Gender:</strong> {user?.gender}
          </p>
          <p className="text-gray-700 mb-2">
            <strong>Member Since:</strong> {user?.member_since}
          </p>
        </div>
        <div className="mt-8 text-center">
          <Link
            href="/Wardrobe"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition transform hover:scale-105"
          >
            Back to Wardrobe
          </Link>
        </div>
      </div>
    </div>
  );
}
