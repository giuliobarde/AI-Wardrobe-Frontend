// app/profile/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/app/context/AuthContext";
import { getAllUserItems } from "@/app/services/wardrobeService";
import ItemCard from "../components/ItemCard";
import AddItem from "../components/AddItem";
import {
  Settings,
  PlusCircle,
  ChevronRight,
  Clock,
  User,
  CalendarDays,
} from "lucide-react";
import ErrorModal from "@/app/components/ErrorModal";
import OutfitCard from "../components/OutfitCard";
import { getSavedOutfits } from "../services/outfitServices";

interface ClothingItem {
  id: string;
  added_date?: string;
}

interface Outfit {
  id: string;
  added_date?: string;
}

export default function Profile() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // ITEMS state
  const [allItems, setAllItems] = useState<ClothingItem[]>([]);
  const [recentItems, setRecentItems] = useState<ClothingItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [itemsError, setItemsError] = useState("");

  // OUTFITS state
  const [allOutfits, setAllOutfits] = useState<Outfit[]>([]);
  const [loadingOutfits, setLoadingOutfits] = useState(false);
  const [outfitsError, setOutfitsError] = useState("");

  const [activeTab, setActiveTab] = useState<"recent" | "favorites">("recent");
  const [refreshOutfits, setRefreshOutfits] = useState(0);
  const [imageError, setImageError] = useState(false);

  // Redirect to home if not signed in
  useEffect(() => {
    if (!isLoading && !user?.access_token) {
      router.push("/");
    }
  }, [isLoading, user, router]);

  // Load all items
  const loadItems = useCallback(async () => {
    if (!user?.access_token) return;
    setLoadingItems(true);
    setItemsError("");
    try {
      const itemsResponse = await getAllUserItems(user.access_token);
      const itemsData = itemsResponse.data as ClothingItem[];
      setAllItems(itemsData);
      setRecentItems(itemsData.slice(0, 8));
    } catch (err: any) {
      console.error(err);
      setItemsError("Failed to load items.");
    }
    setLoadingItems(false);
  }, [user]);

  // Load all outfits
  const loadOutfits = useCallback(async () => {
    if (!user?.access_token) return;
    setLoadingOutfits(true);
    setOutfitsError("");
    try {
      // getSavedOutfits already returns Outfit[]
      const outfitsData = await getSavedOutfits(user.access_token);
      setAllOutfits(outfitsData);
    } catch (err: any) {
      console.error(err);
      setOutfitsError("Failed to load outfits.");
    }
    setLoadingOutfits(false);
  }, [user]);

  // Reset image error state when user changes
  useEffect(() => {
    setImageError(false);
  }, [user?.profile_image_url]);

  // Initial load for items
  useEffect(() => {
    loadItems();
  }, [loadItems]);

  // Initial load & refresh for outfits
  useEffect(() => {
    loadOutfits();
  }, [loadOutfits, refreshOutfits]);

  const ItemSkeleton = () => (
    <div className="bg-gray-100 rounded-lg animate-pulse h-44"></div>
  );

  // Function to handle image loading errors
  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className="min-h-screen pt-20 pb-16 bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Errors */}
      {itemsError && (
        <ErrorModal error={itemsError} onClose={() => setItemsError("")} />
      )}
      {outfitsError && (
        <ErrorModal error={outfitsError} onClose={() => setOutfitsError("")} />
      )}

      <div className="max-w-6xl mx-auto px-4">
        {/* Profile Header */}
        <div className="relative mb-8">
          <div className="h-40 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg" />
          <div className="bg-white rounded-xl shadow-xl p-6 mx-4 -mt-20 relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-center md:items-end">
              <div className="flex flex-col md:flex-row items-center mb-4 md:mb-0">
                {/* Profile Image or Initials */}
                {user?.profile_image_url && !imageError ? (
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md mb-4 md:mb-0 md:mr-6 relative">
                    <Image 
                      src={user.profile_image_url} 
                      alt={`${user.first_name}'s profile`}
                      fill
                      className="object-cover"
                      onError={handleImageError}
                    />
                  </div>
                ) : (
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4 md:mb-0 md:mr-6 border-4 border-white shadow-md">
                    {user?.first_name?.[0]}
                    {user?.last_name?.[0]}
                  </div>
                )}
                <div className="text-center md:text-left">
                  <h1 className="text-3xl font-bold text-gray-800">
                    {user?.first_name} {user?.last_name}
                  </h1>
                  <p className="text-gray-500 flex items-center justify-center md:justify-start mt-1">
                    <User size={16} className="mr-1" />
                    @{user?.username}
                  </p>
                  <p className="text-gray-500 flex items-center justify-center md:justify-start mt-1">
                    <CalendarDays size={16} className="mr-1" />
                    Member since {user?.member_since}
                  </p>
                </div>
              </div>
              <div className="flex space-x-3">
                <Link
                  href="/Settings"
                  className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition transform hover:scale-105"
                >
                  <Settings size={18} className="mr-2" />
                  <span>Settings</span>
                </Link>
                <AddItem onItemAdded={loadItems} />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 text-center">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-3xl font-bold text-blue-600">
                  {allItems.length}
                </p>
                <p className="text-gray-600">Items</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-3xl font-bold text-purple-600">
                  {allOutfits.length}
                </p>
                <p className="text-gray-600">Outfits</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-3xl font-bold text-green-600">5</p>
                <p className="text-gray-600">Favorites</p>
              </div>
              <div className="bg-amber-50 p-4 rounded-lg">
                <p className="text-3xl font-bold text-amber-600">85%</p>
                <p className="text-gray-600">Style Match</p>
              </div>
            </div>
          </div>
        </div>

        {/* Wardrobe Items Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex border-b mb-6">
            <button
              onClick={() => setActiveTab("recent")}
              className={`pb-3 px-4 font-medium text-lg flex items-center ${
                activeTab === "recent"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Clock size={18} className="mr-2" />
              Recent Items
            </button>
            <button
              onClick={() => setActiveTab("favorites")}
              className={`pb-3 px-4 font-medium text-lg flex items-center ${
                activeTab === "favorites"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {/* heart icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2"
              >
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
              Favorites
            </button>
          </div>

          {loadingItems ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {[...Array(8)].map((_, idx) => (
                <ItemSkeleton key={idx} />
              ))}
            </div>
          ) : activeTab === "recent" && recentItems.length === 0 ? (
            <div className="flex flex-col items-center py-12">
              <div className="bg-blue-50 p-6 rounded-full mb-4">
                <PlusCircle size={48} className="text-blue-500" />
              </div>
              <p className="text-xl font-medium text-gray-700 mb-2">
                Your wardrobe is empty
              </p>
              <p className="text-gray-500 mb-6 text-center max-w-md">
                Start building your digital wardrobe by adding your first item
              </p>
              <AddItem onItemAdded={loadItems} />
            </div>
          ) : activeTab === "favorites" ? (
            <div className="flex flex-col items-center py-12">
              <div className="bg-purple-50 p-6 rounded-full mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-purple-500"
                >
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                </svg>
              </div>
              <p className="text-xl font-medium text-gray-700 mb-2">
                No favorites yet
              </p>
              <p className="text-gray-500 mb-6 text-center max-w-md">
                Mark items as favorites to see them here
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 mb-6">
              {recentItems.map((item) => (
                <ItemCard key={item.id} itemId={item.id} />
              ))}
            </div>
          )}

          {activeTab === "recent" && recentItems.length > 0 && (
            <div className="text-center mt-6">
              <Link
                href="/Wardrobe"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full font-medium hover:opacity-90 transition transform hover:scale-105 shadow-md"
              >
                View All Items
                <ChevronRight size={18} className="ml-1" />
              </Link>
            </div>
          )}
        </div>

        {/* Recent Outfits Preview */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Favorite Outfits</h2>
            <Link
              href="/Outfits#saved"
              className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
            >
              View All
              <ChevronRight size={16} className="ml-1" />
            </Link>
          </div>

          <div className="grid gap-6">
            {/* you can swap this out for mapping your recent outfits if desired */}
            <OutfitCard key={refreshOutfits} />
          </div>
        </div>
      </div>
    </div>
  );
}
