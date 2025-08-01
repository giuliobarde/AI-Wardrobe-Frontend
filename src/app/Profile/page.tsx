"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/app/context/AuthContext";
import { getAllUserItems } from "@/app/services/wardrobeServices";
import ItemCard from "../components/ItemCard";
import AddItem from "../components/AddItem";
import {
  Settings,
  PlusCircle,
  ChevronRight,
  Clock,
  User,
  CalendarDays,
  Heart,
} from "lucide-react";
import ErrorModal from "@/app/components/ErrorModal";
import OutfitCard from "../components/OutfitCard";
import { getSavedOutfits } from "../services/outfitServices";
import { motion, AnimatePresence } from "framer-motion";
import { useWeather } from "@/app/context/WeatherContext";
import { Cloud, CloudRain, CloudSnow, CloudSun, Sun, Wind, Moon, CloudMoon } from "lucide-react";

interface ClothingItem {
  id: string;
  added_date?: string;
  favorite?: boolean;
}

interface Outfit {
  id: string;
  added_date?: string;
}

export default function Profile() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { weatherData } = useWeather();

  // ITEMS state
  const [allItems, setAllItems] = useState<ClothingItem[]>([]);
  const [recentItems, setRecentItems] = useState<ClothingItem[]>([]);
  const [favoriteItems, setFavoriteItems] = useState<ClothingItem[]>([]);
  const [styleMatch, setStyleMatch] = useState(85);
  const [loadingItems, setLoadingItems] = useState(false);
  const [itemsError, setItemsError] = useState("");
  const [isItemsErrorModalOpen, setIsItemsErrorModalOpen] = useState(false);

  // OUTFITS state
  const [allOutfits, setAllOutfits] = useState<Outfit[]>([]);
  const [displayOutfits, setDisplayOutfits] = useState<Outfit[]>([]);
  const [loadingOutfits, setLoadingOutfits] = useState(false);
  const [outfitsError, setOutfitsError] = useState("");
  const [isOutfitsErrorModalOpen, setIsOutfitsErrorModalOpen] = useState(false);

  const [activeTab, setActiveTab] = useState<"recent" | "favorites">("recent");
  const [refreshOutfits, setRefreshOutfits] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [animatedStats, setAnimatedStats] = useState({
    items: 0,
    outfits: 0,
    favorites: 0,
    styleMatch: 0
  });

  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  // Animation effect for stats
  useEffect(() => {
    const duration = 2000; // 2 seconds
    const steps = 60; // 60
    const interval = duration / steps;
    
    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      
      setAnimatedStats({
        items: Math.floor(allItems.length * progress),
        outfits: Math.floor(allOutfits.length * progress),
        favorites: Math.floor(favoriteItems.length * progress),
        styleMatch: Math.floor(styleMatch * progress)
      });

      if (currentStep >= steps) {
        clearInterval(timer);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [allItems.length, allOutfits.length, favoriteItems.length]);

  // Redirect to home if not signed in
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/");
    }
  }, [isLoading, user, router]);

  // Load all items
  const loadItems = useCallback(async () => {
    if (!user) return;
    setLoadingItems(true);
    setItemsError("");
    setIsItemsErrorModalOpen(false);
    try {
      const itemsResponse = await getAllUserItems(user.access_token);
      const itemsData = itemsResponse.data as ClothingItem[];
      
      // Set all items
      setAllItems(itemsData);
      
      // Set recent items - get the 4 most recent
      setRecentItems(itemsData.slice(0, 4));
      
      // Filter favorites
      const favorites = itemsData.filter(item => item.favorite === true);
      setFavoriteItems(favorites);
    } catch (err: any) {
      console.error(err);
      setItemsError("Failed to load items.");
      setIsItemsErrorModalOpen(true);
    }
    setLoadingItems(false);
  }, [user]);

  // Load all outfits
  const loadOutfits = useCallback(async () => {
    if (!user) return;
    setLoadingOutfits(true);
    setOutfitsError("");
    setIsOutfitsErrorModalOpen(false);
    try {
      // getSavedOutfits already returns Outfit[]
      const outfitsData = await getSavedOutfits(user.access_token);
      setAllOutfits(outfitsData);
    } catch (err: any) {
      console.error(err);
      setOutfitsError("Failed to load outfits.");
      setIsOutfitsErrorModalOpen(true);
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

  // Function to get weather icon (from WeatherDisplay)
  const getWeatherIcon = (description: string | undefined, isDay: boolean = true) => {
    if (!description) {
      return isDay ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-blue-300" />;
    }
    const desc = description.toLowerCase();
    if (desc.includes('rain') || desc.includes('drizzle')) {
      return <CloudRain className="w-5 h-5 text-blue-400" />;
    } else if (desc.includes('snow')) {
      return <CloudSnow className="w-5 h-5 text-blue-300" />;
    } else if (desc.includes('mist') || desc.includes('fog')) {
      return <Cloud className="w-5 h-5 text-gray-300" />;
    } else if (desc.includes('cloud')) {
      return isDay ? <Cloud className="w-5 h-5 text-gray-400" /> : <CloudMoon className="w-5 h-5 text-gray-400" />;
    } else if (desc.includes('partly cloudy') || desc.includes('few clouds')) {
      return isDay ? <CloudSun className="w-5 h-5 text-blue-400" /> : <CloudMoon className="w-5 h-5 text-blue-400" />;
    } else if (desc.includes('wind')) {
      return <Wind className="w-5 h-5 text-gray-400 animate-wind" />;
    } else {
      return isDay ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-blue-300" />;
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-16 bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Error Modals */}
      <ErrorModal 
        isOpen={isItemsErrorModalOpen} 
        message={itemsError} 
        onClose={() => setIsItemsErrorModalOpen(false)} 
      />
      <ErrorModal 
        isOpen={isOutfitsErrorModalOpen} 
        message={outfitsError} 
        onClose={() => setIsOutfitsErrorModalOpen(false)} 
      />

      <div className="max-w-6xl mx-auto px-4">
        {/* Profile Header */}
        <div className="relative mb-8">
          <div className="h-40 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg" />
          <div className="bg-white rounded-xl shadow-xl p-6 mx-4 -mt-20 relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-center md:items-end">
              <div className="flex flex-col md:flex-row items-center mb-4 md:mb-0">
                {/* Profile Image or Initials */}
                {user?.profile_image_url && !imageError ? (
                  <>
                    <div
                      className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md mb-4 md:mb-0 md:mr-6 relative cursor-pointer"
                      onClick={() => setIsImageModalOpen(true)}
                    >
                      <Image 
                        src={user.profile_image_url} 
                        alt={`${user.first_name}'s profile`}
                        fill
                        className="object-cover"
                        onError={handleImageError}
                      />
                    </div>
                    <AnimatePresence>
                      {isImageModalOpen && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
                          onClick={() => setIsImageModalOpen(false)}
                        >
                          <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="relative max-w-full max-h-full p-4"
                            onClick={e => e.stopPropagation()}
                          >
                            <img
                              src={user.profile_image_url}
                              alt={`${user.first_name}'s profile full`}
                              className="max-h-[80vh] max-w-[90vw] rounded-lg shadow-lg"
                            />
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
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
              <div className="flex space-x-3 items-center w-full md:w-auto md:justify-end">
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
            {/* Weather Card (always below header, above stats) */}
            {weatherData && (
              <div className="flex justify-center mt-4">
                <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full px-4 py-1 shadow-sm">
                  <span>{getWeatherIcon(weatherData.description, true)}</span>
                  <span className="font-semibold text-gray-700">{Math.round(weatherData.temperature)}°C</span>
                  <span className="text-gray-500 text-sm capitalize">{weatherData.description}</span>
                  <span className="text-gray-400 text-xs">{weatherData.location}</span>
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 text-center">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-3xl font-bold text-blue-600">
                  {animatedStats.items}
                </p>
                <p className="text-gray-600">Items</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-3xl font-bold text-purple-600">
                  {animatedStats.outfits}
                </p>
                <p className="text-gray-600">Outfits</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-3xl font-bold text-green-600">{animatedStats.favorites}</p>
                <p className="text-gray-600">Favorites</p>
              </div>
              <div className="bg-amber-50 p-4 rounded-lg">
                <p className="text-3xl font-bold text-amber-600">{animatedStats.styleMatch}%</p>
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
              <Heart size={18} className="mr-2" />
              Favorites
            </button>
          </div>

          {loadingItems ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, idx) => (
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
          ) : activeTab === "favorites" && favoriteItems.length === 0 ? (
            <div className="flex flex-col items-center py-12">
              <div className="bg-purple-50 p-6 rounded-full mb-4">
                <Heart size={48} className="text-purple-500" />
              </div>
              <p className="text-xl font-medium text-gray-700 mb-2">
                No favorites yet
              </p>
              <p className="text-gray-500 mb-6 text-center max-w-md">
                Mark items as favorites to see them here
              </p>
              <Link
                href="/Wardrobe"
                className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full font-medium hover:opacity-90 transition transform hover:scale-105 shadow-md"
              >
                Go to Wardrobe
                <ChevronRight size={18} className="ml-1" />
              </Link>
            </div>
          ) : activeTab === "recent" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 mb-6">
              {recentItems.map((item) => (
                <ItemCard key={item.id} itemId={item.id} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 mb-6">
              {favoriteItems.map((item) => (
                <ItemCard key={item.id} itemId={item.id} favorite={true} />
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
          
          {activeTab === "favorites" && favoriteItems.length > 0 && (
            <div className="text-center mt-6">
              <Link
                href="/Wardrobe?filter=favorites"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-full font-medium hover:opacity-90 transition transform hover:scale-105 shadow-md"
              >
                View All Favorites
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
              <ChevronRight size={16} className="ml-1"/>
            </Link>
          </div>

          <div className="grid gap-6">
            <OutfitCard key={refreshOutfits} />
          </div>
        </div>
      </div>
    </div>
  );
}
