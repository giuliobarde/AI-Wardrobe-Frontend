"use client";

import React, { useEffect, useRef, useState, useId } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { getSavedOutfits, deleteSavedOutfit, favoriteUpdateSavedOutfit } from "../services/outfitServices";
import { AnimatePresence, motion } from "framer-motion";
import { useOutsideClick } from "../hooks/use-outside-click";
import { X, Star, Trash2, Calendar, Clock } from "lucide-react";
import ItemCard from "./ItemCard";

interface OutfitItem {
  item_id?: string;
  id?: string;
  type: string;
}

interface Outfit {
  id: string;
  user_id: string;
  items: OutfitItem[];
  occasion: string;
  favorite: boolean;
  created_at?: string;
}

interface OutfitCardProps {
  limit?: number;
  refresh?: number;
}

const OutfitCard: React.FC<OutfitCardProps> = ({ limit, refresh }) => {
  const { user, isLoading } = useAuth();
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeOutfit, setActiveOutfit] = useState<Outfit | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [favoriteAnimation, setFavoriteAnimation] = useState<string | null>(null);
  const layoutId = useId();
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchOutfits = async () => {
      if (isLoading) return;
      if (!user?.access_token) {
        setError("User authentication failed. Please log in again.");
        return;
      }
      try {
        const response = await getSavedOutfits(user.access_token);
        let outfitsData: Outfit[] = [];
        if (Array.isArray(response)) {
          outfitsData = response;
        } else if (response?.data && Array.isArray(response.data)) {
          outfitsData = response.data;
        }
        if (limit) {
          outfitsData = outfitsData.slice(0, limit);
        }
        setOutfits(outfitsData);
        setError(null);
      } catch (err) {
        setError("Failed to fetch outfits");
        console.error(err);
      }
    };
    fetchOutfits();
  }, [user, limit, refresh, isLoading]);

  useOutsideClick(modalRef, () => setActiveOutfit(null));

  const formatOccasion = (occasion: string) => {
    if (!occasion) return "General";
    return occasion
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Helper to return a valid ID from an outfit item.
  const getItemId = (item: OutfitItem) => {
    return item.item_id || item.id || "";
  };

  // Function to toggle the favorite status.
  const handleToggleFavorite = async (outfitId: string) => {
    if (!user?.access_token) {
      setError("User authentication failed. Please log in again.");
      return;
    }
    try {
      await favoriteUpdateSavedOutfit({ id: outfitId }, user.access_token);
      setFavoriteAnimation(outfitId);
      setTimeout(() => setFavoriteAnimation(null), 1000);
      
      setOutfits((prevOutfits) =>
        prevOutfits.map((o) =>
          o.id === outfitId ? { ...o, favorite: !o.favorite } : o
        )
      );
      if (activeOutfit && activeOutfit.id === outfitId) {
        setActiveOutfit({ ...activeOutfit, favorite: !activeOutfit.favorite });
      }
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
      setError("Failed to update favorite status.");
    }
  };

  // Function to delete the currently active outfit.
  const handleDeleteOutfit = async (outfitId: string) => {
    if (!user?.access_token) {
      setError("User authentication failed. Please log in again.");
      return;
    }
    try {
      await deleteSavedOutfit({ id: outfitId }, user.access_token);
      setOutfits((prevOutfits) =>
        prevOutfits.filter((outfit) => outfit.id !== outfitId)
      );
      setActiveOutfit(null);
      setDeleteConfirm(null);
    } catch (err) {
      console.error("Failed to delete outfit:", err);
      setError("Failed to delete outfit.");
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-gray-200 h-12 w-12"></div>
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r"
        >
          <p className="text-red-500 font-medium">{error}</p>
        </motion.div>
      )}

      {outfits.length === 0 && !error && !isLoading && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-blue-50 text-blue-800 rounded-lg p-8 text-center my-8"
        >
          <div className="inline-block p-4 bg-blue-100 rounded-full mb-4">
            <Star className="h-8 w-8 text-blue-600" />
          </div>
          <p className="text-lg font-medium">No saved outfits found.</p>
          <p className="text-sm mt-2">Create your first outfit to see it here!</p>
        </motion.div>
      )}

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {outfits.map((outfit) => (
          <motion.div
            key={outfit.id}
            layoutId={`outfit-card-${outfit.id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
            onClick={() => setActiveOutfit(outfit)}
            className="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden cursor-pointer relative"
          >
            <div className="p-4">
              <div className="flex justify-between items-center mb-3">
                <motion.div
                  className="bg-blue-50 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                  whileHover={{ scale: 1.05 }}
                >
                  {formatOccasion(outfit.occasion)}
                </motion.div>
                {/* Clickable Star Icon */}
                <motion.button
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.8 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleFavorite(outfit.id);
                  }}
                  className="p-1 rounded-full hover:bg-gray-100"
                >
                  <motion.div
                    animate={
                      favoriteAnimation === outfit.id
                        ? { scale: [1, 1.3, 1] }
                        : {}
                    }
                    transition={{ duration: 0.5 }}
                  >
                    {outfit.favorite ? (
                      <Star fill="currentColor" className="h-5 w-5 text-yellow-500" />
                    ) : (
                      <Star className="h-5 w-5 text-gray-400 hover:text-yellow-500" />
                    )}
                  </motion.div>
                </motion.button>
              </div>

              {outfit.created_at && (
                <div className="flex items-center text-xs text-gray-500 mb-3">
                  <Calendar className="h-3 w-3 mr-1" />
                  {formatDate(outfit.created_at)}
                </div>
              )}

              <p className="text-sm text-gray-600 mb-4 font-medium">
                {outfit.items.length} {outfit.items.length === 1 ? "item" : "items"} in this outfit
              </p>

              <div className="grid grid-cols-4 gap-2">
                {outfit.items.slice(0, 4).map((item, index) => {
                  const validItemId = getItemId(item);
                  return (
                    <motion.div
                      key={index}
                      className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden"
                    >
                      {validItemId ? (
                        <ItemCard
                          itemId={validItemId}
                          limit={1}
                          thumbnail={true}
                        />
                      ) : (
                        <span className="text-xs text-red-500">N/A</span>
                      )}
                    </motion.div>
                  );
                })}

                {outfit.items.length > 4 && (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="aspect-square bg-blue-50 rounded-md flex items-center justify-center border border-blue-100"
                  >
                    <span className="text-sm font-medium text-blue-600">
                      +{outfit.items.length - 4}
                    </span>
                  </motion.div>
                )}
              </div>
            </div>
            
            <motion.div 
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center p-4 pointer-events-none"
            >
              <p className="text-white font-medium text-center">Click to view details</p>
            </motion.div>
          </motion.div>
        ))}
      </motion.div>

      {/* Expanded Modal for Outfit Details */}
      <AnimatePresence>
        {activeOutfit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, pointerEvents: "auto" }}
            exit={{ opacity: 0, pointerEvents: "none" }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
          >   
            <motion.div
              ref={modalRef}
              layoutId={`outfit-${activeOutfit.id}-${layoutId}`}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="relative bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header with Close Button */}
              <div className="sticky top-0 z-10 bg-white border-b border-gray-100 rounded-t-xl px-6 py-4 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm mr-2">
                    {formatOccasion(activeOutfit.occasion)}
                  </span> 
                  Outfit
                </h2>
                
                <div className="flex items-center space-x-2">
                  {/* Star Icon in Modal */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleFavorite(activeOutfit.id);
                    }}
                    className="p-2 rounded-full hover:bg-gray-100"
                  >
                    {activeOutfit.favorite ? (
                      <Star fill="currentColor" className="h-6 w-6 text-yellow-500" />
                    ) : (
                      <Star className="h-6 w-6 text-gray-400 hover:text-yellow-500" />
                    )}
                  </motion.button>
                  
                  {/* Close button */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setActiveOutfit(null)}
                    className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full"
                  >
                    <X className="w-6 h-6" />
                  </motion.button>
                </div>
              </div>

              <div className="p-6">
                {activeOutfit.created_at && (
                  <div className="flex items-center text-sm text-gray-500 mb-6">
                    <Clock className="h-4 w-4 mr-2" />
                    Created: {formatDate(activeOutfit.created_at)}
                  </div>
                )}

                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-4 text-gray-700 flex items-center">
                    <span className="bg-gray-100 p-1 rounded-full mr-2">
                      <Star className="h-4 w-4 text-blue-600" />
                    </span>
                    Items in this outfit:
                  </h3>
                  
                  {/* Items grid for larger screens */}
                  <div className="hidden md:grid md:grid-cols-3 gap-4 mb-6">
                    {activeOutfit.items.map((item, index) => {
                      const validItemId = getItemId(item);
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-gray-50 rounded-lg p-3 border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all"
                        >
                          {validItemId ? (
                            <ItemCard itemId={validItemId} limit={1} />
                          ) : (
                            <div className="h-40 flex items-center justify-center">
                              <span className="text-xs text-red-500">Item not available</span>
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                  
                  {/* Items carousel for mobile */}
                  <div className="md:hidden flex gap-4 overflow-x-auto pb-4 snap-x scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-gray-100">
                    {activeOutfit.items.map((item, index) => {
                      const validItemId = getItemId(item);
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-gray-50 rounded-lg p-2 min-w-[150px] flex-shrink-0 snap-start border border-gray-100"
                        >
                          {validItemId ? (
                            <ItemCard itemId={validItemId} limit={1} />
                          ) : (
                            <span className="text-xs text-red-500">N/A</span>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* Delete Outfit Button */}
                <div className="mt-8 pt-4 border-t border-gray-100">
                  {deleteConfirm === activeOutfit.id ? (
                    <div className="flex items-center justify-end space-x-2">
                      <p className="text-sm text-gray-600 mr-2">Confirm deletion?</p>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        onClick={() => setDeleteConfirm(null)}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        onClick={() => handleDeleteOutfit(activeOutfit.id)}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition flex items-center"
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> Delete
                      </motion.button>
                    </div>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      onClick={() => setDeleteConfirm(activeOutfit.id)}
                      className="px-4 py-2 bg-white text-red-500 border border-red-200 rounded hover:bg-red-50 transition flex items-center ml-auto"
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Delete Outfit
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OutfitCard;