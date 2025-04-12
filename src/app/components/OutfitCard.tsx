"use client";

import React, { useEffect, useRef, useState, useId } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { getSavedOutfits, deleteSavedOutfit, favouriteUpdateSavedOutfit } from "../services/outfitServices";
import { AnimatePresence, motion } from "motion/react";
import { useOutsideClick } from "../hooks/use-outside-click";
import { X, Star } from "lucide-react";
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
  favourite: boolean;
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

  // Function to toggle the favourite status.
  const handleToggleFavourite = async (outfitId: string) => {
    if (!user?.access_token) {
      setError("User authentication failed. Please log in again.");
      return;
    }
    try {
      await favouriteUpdateSavedOutfit({ id: outfitId }, user.access_token);
      setOutfits((prevOutfits) =>
        prevOutfits.map((o) =>
          o.id === outfitId ? { ...o, favourite: !o.favourite } : o
        )
      );
      if (activeOutfit && activeOutfit.id === outfitId) {
        setActiveOutfit({ ...activeOutfit, favourite: !activeOutfit.favourite });
      }
    } catch (err) {
      console.error("Failed to toggle favourite:", err);
      setError("Failed to update favourite status.");
    }
  };

  // Function to delete the currently active outfit.
  const handleDeleteOutfit = async () => {
    if (!activeOutfit) return;
    if (!user?.access_token) {
      setError("User authentication failed. Please log in again.");
      return;
    }
    try {
      await deleteSavedOutfit({ id: activeOutfit.id }, user.access_token);
      setOutfits((prevOutfits) =>
        prevOutfits.filter((outfit) => outfit.id !== activeOutfit.id)
      );
      setActiveOutfit(null);
    } catch (err) {
      console.error("Failed to delete outfit:", err);
      setError("Failed to delete outfit.");
    }
  };

  return (
    <div className="relative">
      {error && <p className="text-red-500">{error}</p>}

      {outfits.length === 0 && !error && !isLoading && (
        <p className="text-gray-500 text-center py-4">No saved outfits found.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {outfits.map((outfit) => (
          <motion.div
            key={outfit.id}
            onClick={() => setActiveOutfit(outfit)}
            className="bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden cursor-pointer relative"
          >
            <div className="p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-gray-800">
                  {formatOccasion(outfit.occasion)}
                </h3>
                {/* Clickable Star Icon */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleFavourite(outfit.id);
                  }}
                >
                  {outfit.favourite ? (
                    <Star className="h-5 w-5 text-yellow-500" />
                  ) : (
                    <Star className="h-5 w-5 text-gray-300" />
                  )}
                </button>
              </div>

              <p className="text-sm text-gray-600 mb-3">
                {outfit.items.length} items in this outfit
              </p>

              <div className="flex flex-wrap gap-2">
                {outfit.items.slice(0, 4).map((item, index) => {
                  const validItemId = getItemId(item);
                  return (
                    <div
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
                    </div>
                  );
                })}

                {outfit.items.length > 4 && (
                  <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-600">
                      +{outfit.items.length - 4}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Expanded Modal for Outfit Details */}
      <AnimatePresence>
        {activeOutfit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              ref={modalRef}
              layoutId={`outfit-${activeOutfit.id}-${layoutId}`}
              className="relative bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setActiveOutfit(null)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-900 z-10"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="p-6">
                <div className="mb-4 flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {formatOccasion(activeOutfit.occasion)} Outfit
                  </h2>
                  {/* Star Icon in Modal */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleFavourite(activeOutfit.id);
                    }}
                  >
                    {activeOutfit.favourite ? (
                      <Star className="h-6 w-6 text-yellow-500" />
                    ) : (
                      <Star className="h-6 w-6 text-gray-300" />
                    )}
                  </button>
                </div>

                {activeOutfit.created_at && (
                  <p className="text-sm text-gray-500 mb-6">
                    Created:{" "}
                    {new Date(activeOutfit.created_at).toLocaleDateString()}
                  </p>
                )}

                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-4 text-gray-700">
                    Items in this outfit:
                  </h3>
                  <div className="flex gap-4 overflow-x-auto pb-4">
                    {activeOutfit.items.map((item, index) => {
                      const validItemId = getItemId(item);
                      return (
                        <div
                          key={index}
                          className="bg-gray-50 rounded-lg p-2 min-w-[150px] flex-shrink-0"
                        >
                          {validItemId ? (
                            <ItemCard itemId={validItemId} limit={1} />
                          ) : (
                            <span className="text-xs text-red-500">N/A</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Delete Outfit Button */}
                <div className="flex justify-end mt-4">
                  <button
                    onClick={handleDeleteOutfit}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                  >
                    Delete Outfit
                  </button>
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
