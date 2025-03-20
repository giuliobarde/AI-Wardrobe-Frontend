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
    <div className="container mx-auto py-20 px-4">
      <h1 className="text-3xl font-bold mb-8">User Profile</h1>
      <div className="bg-white shadow-md rounded-lg p-6">
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
      <div className="mt-8">
        <Link href="/Wardrobe" className="text-blue-500 hover:underline">
          Back to Wardrobe
        </Link>
      </div>
    </div>
  );
}
