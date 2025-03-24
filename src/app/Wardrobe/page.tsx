"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import Link from "next/link";
import ItemCard from "../components/ItemCard";
import AddItem from "../components/AddItem";

export default function Wardrobe() {
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user?.access_token) {
      router.push("/");
    }
  }, [user, router]);

  return (
    <div className="min-h-screen bg-gray-50 py-20 px-4">
      <h1 className="text-4xl font-bold mb-12 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
        Your Wardrobe
      </h1>

      {/* Tops Section */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <Link href="/Tops" className="text-2xl font-bold hover:underline">
            Tops
          </Link>
          <Link href="/Tops" className="text-sm text-blue-500 hover:underline">
            View All
          </Link>
        </div>
        <div className="flex space-x-4 overflow-x-auto">
          <AddItem />
          <ItemCard itemType="tops" />
        </div>
      </section>

      {/* Bottoms Section */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <Link href="/Bottoms" className="text-2xl font-bold hover:underline">
            Bottoms
          </Link>
          <Link href="/Bottoms" className="text-sm text-blue-500 hover:underline">
            View All
          </Link>
        </div>
        <div className="flex space-x-4 overflow-x-auto">
          <AddItem />
          <ItemCard itemType="bottoms" />
        </div>
      </section>

      {/* Shoes Section */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <Link href="/Shoes" className="text-2xl font-bold hover:underline">
            Shoes
          </Link>
          <Link href="/Shoes" className="text-sm text-blue-500 hover:underline">
            View All
          </Link>
        </div>
        <div className="flex space-x-4 overflow-x-auto">
          <AddItem />
          <ItemCard itemType="shoes" />
        </div>
      </section>

      {/* Outerware Section */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <Link href="/Outerware" className="text-2xl font-bold hover:underline">
            Outerware
          </Link>
          <Link href="/Outerware" className="text-sm text-blue-500 hover:underline">
            View All
          </Link>
        </div>
        <div className="flex space-x-4 overflow-x-auto">
          <AddItem />
          <ItemCard itemType="outerware" />
        </div>
      </section>
    </div>
  );
}
