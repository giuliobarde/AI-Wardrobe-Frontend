"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import Link from "next/link";
import ItemCard from "../components/ItemCard";
import AddItem from "../components/AddItem";
import { getAllUserItems } from "@/app/services/wardrobeService";

interface ClothingItem {
  id: string;
  added_date?: string;
}

export default function Profile() {
  const { user } = useAuth();
  const router = useRouter();
  const [recentItems, setRecentItems] = useState<ClothingItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [itemsError, setItemsError] = useState("");

  useEffect(() => {
    if (!user?.access_token) {
      router.push("/");
    }
  }, [user, router]);

  // Fetch the last few added items for the user using the service function.
  useEffect(() => {
    async function fetchRecentItems() {
      setLoadingItems(true);
      setItemsError("");
      try {
        const data = await getAllUserItems(user?.access_token as string);
        // Assuming the response is { data: [...] } sorted by added_date descending.
        setRecentItems(data.data.slice(0, 4));
      } catch (err: any) {
        console.error(err);
        setItemsError("Failed to load recent items.");
      }
      setLoadingItems(false);
    }
    if (user?.access_token) {
      fetchRecentItems();
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Profile Information */}
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

        {/* Recent Additions Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4 text-center">Recent Additions</h2>
          {loadingItems && <p className="text-center">Loading items...</p>}
          {itemsError && <p className="text-red-500 text-center">{itemsError}</p>}
          {!loadingItems && !itemsError && recentItems.length === 0 ? (
            <div className="flex flex-col items-center">
              <p className="text-center text-gray-600 mb-4">
                You haven't added any items yet. Click below to add your first item!
              </p>
              <AddItem />
            </div>
          ) : (
            <div className="flex gap-4 justify-center items-center">
              {recentItems.map((item) => (
                <ItemCard key={item.id} itemId={item.id} />
              ))}
            </div>
          )}
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
