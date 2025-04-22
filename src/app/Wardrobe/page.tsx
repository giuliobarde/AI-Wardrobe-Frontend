// Wardrobe/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import ItemCard from "../components/ItemCard";
import AddItem from "../components/AddItem";
import ErrorModal from "@/app/components/ErrorModal";
import { motion } from "framer-motion";

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
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

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

  const categories = [
    { label: "Tops", path: "tops", icon: "👕" },
    { label: "Bottoms", path: "bottoms", icon: "👖" },
    { label: "Shoes", path: "shoes", icon: "👟" },
    { label: "Outerware", path: "outerware", icon: "🧥" },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-20 px-4"
    >
      {/* Error Modal */}
      {error && <ErrorModal error={error} onClose={dismissError} />}

      <motion.h1 
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="text-5xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600"
      >
        Your Wardrobe
      </motion.h1>
      
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center text-gray-600 mb-12 max-w-lg mx-auto"
      >
        Organize your fashion collection and create amazing outfits with ease.
      </motion.p>

      {/* Category Tabs */}
      <div className="flex justify-center mb-10 overflow-x-auto">
        <div className="flex space-x-4 p-2 bg-white rounded-lg shadow-md">
          {categories.map(({ label, path, icon }, index) => (
            <motion.button
              key={path}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveCategory(path)}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all ${
                activeCategory === path 
                  ? "bg-blue-500 text-white shadow-lg" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <span className="text-xl">{icon}</span>
              <span>{label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/** Section Template **/}
      {categories.map(({ label, path }, index) => (
        <motion.section 
          key={path} 
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 + (index * 0.1) }}
        >
          <div className="flex items-center justify-between mb-4">
            <Link href={`/${path}`} className="group">
              <h2 className="text-2xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors flex items-center">
                <span className="mr-2">{categories[index].icon}</span>
                {label}
                <motion.span 
                  className="inline-block ml-2 text-blue-500"
                  initial={{ rotate: 0 }}
                  whileHover={{ rotate: 90 }}
                >
                  →
                </motion.span>
              </h2>
            </Link>
            <Link 
              href={`/${path}`} 
              className="px-4 py-2 text-sm rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
            >
              View All
            </Link>
          </div>
          <div className="relative">
            <div className="flex flex-nowrap space-x-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-transparent">
              <AddItem onItemAdded={handleItemAdded} onError={setError} />
              <ItemCard
                itemType={path}
                limit={itemLimit}
                refresh={refreshKey}
                onError={setError}
              />
            </div>
            <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-gray-100 to-transparent pointer-events-none"></div>
          </div>
        </motion.section>
      ))}

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-12 text-center"
      >
        <p className="text-gray-500 text-sm">
          Need help organizing your wardrobe? 
          <Link href="/help" className="ml-1 text-blue-500 hover:underline">
            Check out our tips
          </Link>
        </p>
      </motion.div>
    </motion.div>
  );
}