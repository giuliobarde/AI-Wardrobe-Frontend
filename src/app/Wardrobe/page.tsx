// Wardrobe/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import ItemCard from "../components/ItemCard";
import AddItem from "../components/AddItem";
import ErrorModal from "@/app/components/ErrorModal";

// Custom hook to calculate the number of items that can be shown based on screen width.
function useItemLimit() {
  const [limit, setLimit] = useState(5);

  useEffect(() => {
    const updateLimit = () => {
      const width = window.innerWidth;
      if (width < 640) setLimit(3);
      else if (width < 768) setLimit(4);
      else if (width < 1024) setLimit(5);
      else if (width < 1280) setLimit(6);
      else setLimit(7);
    };

    updateLimit();
    window.addEventListener("resize", updateLimit);
    return () => window.removeEventListener("resize", updateLimit);
  }, []);

  return limit;
}

export default function Wardrobe() {
  const [error, setError] = useState<string | null>(null);
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const itemLimit = useItemLimit();
  const [refreshKey, setRefreshKey] = useState(0);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !user?.access_token) {
      router.push("/");
    }
  }, [user, isLoading, router]);

  const handleItemAdded = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const dismissError = () => setError(null);

  return (
    <div className="min-h-screen bg-gray-50 py-20 px-4">
      {/* Error Modal */}
      {error && <ErrorModal error={error} onClose={dismissError} />}

      <h1 className="text-4xl font-bold mb-12 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
        Your Wardrobe
      </h1>

      {/** Section Template **/}
      {[
        { label: "Tops", path: "tops" },
        { label: "Bottoms", path: "bottoms" },
        { label: "Shoes", path: "shoes" },
        { label: "Outerware", path: "outerware" },
      ].map(({ label, path }) => (
        <section key={path} className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <Link href={`/${label}`} className="text-2xl font-bold hover:underline">
              {label}
            </Link>
            <Link href={`/${label}`} className="text-sm text-blue-500 hover:underline">
              View All
            </Link>
          </div>
          <div className="flex flex-nowrap space-x-4 overflow-x-auto">
            <AddItem onItemAdded={handleItemAdded} onError={setError} />
            <ItemCard
              itemType={path}
              limit={itemLimit}
              refresh={refreshKey}
              onError={setError}
            />
          </div>
        </section>
      ))}
    </div>
  );
}
