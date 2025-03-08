"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

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
    <div className="flex min-h-screen items-center justify-center">
      {user ? (
        <>
          <h1 className="text-4xl font-bold text-blue-600">
            Welcome to your wardrobe, {user.email}!
          </h1>
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

