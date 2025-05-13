"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import ItemCard from "../components/ItemCard";
import AddItem from "../components/AddItem";
import ErrorModal from "@/app/components/ErrorModal";
import { motion, AnimatePresence } from "framer-motion";
import { WardrobeProvider, useWardrobe } from "../context/WardrobeContext";

type Category = {
  id: string;
  label: string;
  icon: string;
};

function WardrobePage() {
  const [error, setError] = useState<string | null>(null);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { fetchItems } = useWardrobe();

  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !user?.access_token) {
      router.push("/");
    }
  }, [user, isLoading, router]);

  // Check for filter parameter in URL and set the active category accordingly
  useEffect(() => {
    const filterParam = searchParams.get('filter');
    if (filterParam) {
      setActiveCategory(filterParam);
    }
  }, [searchParams]);

  // Handle errors by opening the modal
  useEffect(() => {
    if (error) {
      setIsErrorModalOpen(true);
    }
  }, [error]);

  // When an item is added, re-fetch the entire list
  const handleItemAdded = async () => {
    try {
      await fetchItems();
    } catch (err: any) {
      setError(err.message || "Failed to refresh items");
    }
  };

  const dismissError = () => {
    setIsErrorModalOpen(false);
    setError(null);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const categories: Category[] = [
    { id: "all", label: "All Items", icon: "🧳" },
    { id: "favorites", label: "Favorites", icon: "⭐" },
    { id: "tops", label: "Tops", icon: "👕" },
    { id: "bottoms", label: "Bottoms", icon: "👖" },
    { id: "shoes", label: "Shoes", icon: "👟" },
    { id: "outerware", label: "Outerware", icon: "🧥" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  const pageTransition = {
    type: "tween" as const,
    ease: "easeInOut" as const,
    duration: 0.35,
  };

  const containerClass = "flex space-x-4 overflow-x-auto py-2";

  // Update URL when category changes
  const handleCategoryChange = (categoryId: string | null) => {
    if (categoryId === null) {
      // Reset to all items
      router.push('/Wardrobe');
    } else {
      // Update URL with the selected filter
      router.push(`/Wardrobe?filter=${categoryId}`);
    }
    setActiveCategory(categoryId);
  };

  const getCategoryContent = (categoryId: string | null) => {
    if (!categoryId || categoryId === "all") {
      return (
        <motion.div
          key="all-categories"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={pageTransition}
        >
          {categories
            .filter((cat) => cat.id !== "all" && cat.id !== "favorites")
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
                    onError={handleError}
                  />
                </div>
              </div>
            ))}
        </motion.div>
      );
    }
    
    if (categoryId === "favorites") {
      return (
        <motion.div
          key="favorites-categories"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={pageTransition}
        >
          {categories
            .filter((cat) => cat.id !== "all" && cat.id !== "favorites")
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
                    onError={handleError}
                    favorite={true}
                  />
                </div>
              </div>
            ))}
        </motion.div>
      );
    }

    const current = categories.find((c) => c.id === categoryId);
    return (
      <motion.div
        key={`category-${categoryId}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={pageTransition}
      >
        <h3 className="text-xl font-medium mb-4 flex items-center">
          <span className="mr-2">{current?.icon}</span>
          {current?.label}
        </h3>
        <div className={containerClass}>
          <ItemCard
            itemType={categoryId}
            limit={100}
            onError={handleError}
          />
        </div>
      </motion.div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-20 px-4 sm:px-6 lg:px-8"
    >
      <ErrorModal 
        isOpen={isErrorModalOpen}
        message={error || "An unknown error occurred"}
        onClose={dismissError}
      />

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
            Organize your fashion collection and create amazing outfits with ease.
          </p>
        </motion.div>

        {/* Categories & Add Item */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex items-center flex-wrap gap-3 mb-8"
        >
          {categories.map((category) => (
            <motion.button
              key={category.id}
              variants={itemVariants}
              whileHover={{ y: -3, boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}
              whileTap={{ y: 0 }}
              onClick={() =>
                handleCategoryChange(
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

          <motion.div variants={itemVariants} className="ml-auto">
            <AddItem onItemAdded={handleItemAdded} onError={handleError} />
          </motion.div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          layout
          className="bg-white rounded-xl shadow-md p-6 overflow-hidden"
        >
          <h2 className="text-2xl font-semibold mb-6">
            {activeCategory === "favorites" 
              ? "Favorite Items"
              : activeCategory
                ? categories.find((c) => c.id === activeCategory)?.label
                : "All Items"}
          </h2>

          <AnimatePresence mode="wait">
            {getCategoryContent(activeCategory)}
          </AnimatePresence>
        </motion.div>

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
    </motion.div>
  );
}

export default function Wardrobe() {
  return (
    <WardrobeProvider>
      <WardrobePage />
    </WardrobeProvider>
  );
}