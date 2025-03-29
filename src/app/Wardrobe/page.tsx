"use client";

import { useEffect, useState } from "react";
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
      if (width < 640) {
        setLimit(3);
      } else if (width < 768) {
        setLimit(4);
      } else if (width < 1024) {
        setLimit(5);
      } else if (width < 1280) {
        setLimit(6);
      } else {
        setLimit(7);
      }
    };

    updateLimit();
    window.addEventListener("resize", updateLimit);
    return () => window.removeEventListener("resize", updateLimit);
  }, []);

  return limit;
}

export default function Wardrobe() {
  const [error, setError] = useState<string | null>(null);
  const [itemsError, setItemsError] = useState("");
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const itemLimit = useItemLimit();

  // refreshKey is used to trigger re-fetching of items in ItemCard.
  const [refreshKey, setRefreshKey] = useState(0);

  // Only push to "/" if auth loading is complete and no user is available.
  useEffect(() => {
    if (!isLoading && !user?.access_token) {
      router.push("/");
    }
  }, [user, router, isLoading]);

  // Increment refreshKey when an item is added.
  const handleItemAdded = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-20 px-4">
      {/* Error Modal */}
      {(error || itemsError) && (
        <ErrorModal
          error={error || itemsError}
          onClose={() => {
            setError("");
            setItemsError("");
          }}
        />
      )}

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
        <div className="flex flex-nowrap space-x-4 overflow-x-auto">
          <AddItem onItemAdded={handleItemAdded} />
          <ItemCard
            itemType="tops"
            limit={itemLimit}
            refresh={refreshKey}
          />
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
        <div className="flex flex-nowrap space-x-4 overflow-x-auto">
          <AddItem onItemAdded={handleItemAdded} />
          <ItemCard
            itemType="bottoms"
            limit={itemLimit}
            refresh={refreshKey}
          />
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
        <div className="flex flex-nowrap space-x-4 overflow-x-auto">
          <AddItem onItemAdded={handleItemAdded} />
          <ItemCard
            itemType="shoes"
            limit={itemLimit}
            refresh={refreshKey}
          />
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
        <div className="flex flex-nowrap space-x-4 overflow-x-auto">
          <AddItem onItemAdded={handleItemAdded} />
          <ItemCard
            itemType="outerware"
            limit={itemLimit}
            refresh={refreshKey}
          />
        </div>
      </section>
    </div>
  );
}
