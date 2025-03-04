// app/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext"; // Adjust path as needed

export default function Home() {
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user?.access_token) {
      router.push("/Login");
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    logout();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      {user ? (
        <>
          <h1 className="text-4xl font-bold text-blue-600">
            Welcome, {user.email}!
          </h1>
          <button
            type="submit"
            className="p-2 bg-blue-500 text-white rounded"
            onClick={handleSubmit}
          >
            Log out
          </button>
        </>
      ) : (
        <p className="text-lg">Redirecting to Login...</p>
      )}
    </div>
  );
}
function logout() {
  throw new Error("Function not implemented.");
}

