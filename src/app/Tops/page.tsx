"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import Link from "next/link";
import ItemCard from "../components/ItemCard";

export default function Wardrobe() {
  const modalRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user?.access_token) {
      router.push("/");
    }
  }, [user, router]);

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/Wardrobe" className="text-lg font-bold text-blue-600 hover:underline">
            ← Back to Wardrobe
          </Link>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
            Tops
          </h1>
        </div>
        <ItemCard itemType="tops" />
      </div>
    </div>

  );
}
