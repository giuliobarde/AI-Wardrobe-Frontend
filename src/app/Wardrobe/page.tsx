"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import ItemCard from "../components/ItemCard";
import AddItem from "../components/AddItem";
import ErrorModal from "@/app/components/ErrorModal";
import { motion } from "framer-motion";

type Category = {
  id: string;
  label: string;
  icon: string;
};

export default function Wardrobe() {
  const [error, setError] = useState<string | null>(null);
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !user?.access_token) {
      router.push("/");
    }
  }, [user, isLoading, router]);

  const handleItemAdded = () => {
    setRefreshKey((prev) => prev + 1);
    setIsAddModalOpen(false);
  };

  const dismissError = () => setError(null);

  const categories: Category[] = [
    { id: "all", label: "All Items", icon: "🧳" },
    { id: "tops", label: "Tops", icon: "👕" },
    { id: "bottoms", label: "Bottoms", icon: "👖" },
    { id: "shoes", label: "Shoes", icon: "👟" },
    { id: "outerware", label: "Outerware", icon: "🧥" },
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  // Renders either a vertical list (grid-view selected) or a horizontal scroll (list-view selected)
  const getCategoryContent = (categoryId: string | null) => {
    // class: when viewMode==="grid" → vertical list; when "list" → horizontal scroll
    const containerClass =
      viewMode === "grid"
        ? "space-y-3"
        : "flex space-x-4 overflow-x-auto py-2";

    if (categoryId === null || categoryId === "all") {
      return (
        <>
          {categories
            .filter((cat) => cat.id !== "all")
            .map((category) => (
              <div key={category.id} className="mb-8 last:mb-0">
                <h3 className="text-xl font-medium mb-4 flex items-center">
                  <span className="mr-2">{category.icon}</span>
                  {category.label}
                </h3>
                <div className={containerClass}>
                  <ItemCard
                    itemType={category.id}
                    limit={100}
                    refresh={refreshKey}
                    onError={setError}
                  />
                </div>
              </div>
            ))}
        </>
      );
    }

    // Specific category
    return (
      <div className={containerClass}>
        <ItemCard
          itemType={categoryId}
          limit={100}
          refresh={refreshKey}
          onError={setError}
        />
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8"
    >
      {error && <ErrorModal error={error} onClose={dismissError} />}

      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-xl shadow-md p-6 mb-8"
        >
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            Your Wardrobe
          </h1>
          <p className="text-gray-600 mt-2">
            Organize your fashion collection and create amazing outfits with
            ease.
          </p>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4"
        >
          <div className="flex space-x-3 w-full sm:w-auto justify-between">
            {/* View toggle */}
            <div className="bg-white rounded-full shadow-sm flex p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-4 py-2 rounded-full transition ${
                  viewMode === "grid"
                    ? "bg-blue-100 text-blue-600"
                    : "text-gray-500"
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-4 py-2 rounded-full transition ${
                  viewMode === "list"
                    ? "bg-blue-100 text-blue-600"
                    : "text-gray-500"
                }`}
              >
                List
              </button>
            </div>

            {/* Add new item */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center bg-blue-600 text-white px-6 py-3 rounded-full shadow-md hover:bg-blue-700 transition-colors"
            >
              <span className="mr-2">+</span>
              Add Item
            </motion.button>
          </div>
        </motion.div>

        {/* Categories */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-wrap gap-3 mb-8"
        >
          {categories.map((category) => (
            <motion.button
              key={category.id}
              variants={itemVariants}
              whileHover={{ y: -3, boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}
              whileTap={{ y: 0 }}
              onClick={() =>
                setActiveCategory(
                  category.id === "all" ? null : category.id
                )
              }
              className={`px-5 py-3 rounded-full flex items-center gap-2 ${
                (category.id === "all" && activeCategory === null) ||
                category.id === activeCategory
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span>{category.icon}</span>
              <span>{category.label}</span>
            </motion.button>
          ))}
        </motion.div>

        {/* Main Content */}
        <motion.div
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-md p-6"
        >
          <h2 className="text-2xl font-semibold mb-6">
            {activeCategory
              ? `${
                  categories.find((c) => c.id === activeCategory)?.label ||
                  activeCategory
                }`
              : "All Items"}
          </h2>

          {getCategoryContent(activeCategory)}
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-center"
        >
          <p className="text-gray-500">
            Need help organizing your wardrobe?{" "}
            <Link href="/help" className="text-blue-500 hover:underline">
              Check out our tips
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Add Item Modal */}
      {isAddModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl shadow-xl p-6 max-w-lg w-full"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Add New Item</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ×
              </button>
            </div>
            <AddItem onItemAdded={handleItemAdded} onError={setError} />
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}