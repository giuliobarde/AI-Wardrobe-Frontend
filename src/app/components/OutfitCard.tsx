"use client";

import React, { useEffect, useRef, useState, useId } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { getSavedOutfits } from "../services/outfitServices";
import { AnimatePresence, motion } from "motion/react";
import { useOutsideClick } from "../hooks/use-outside-click";
import { X, Heart } from "lucide-react";
import ItemCard from "./ItemCard";

interface OutfitItem {
  id: string;
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
  limit?: number;    // optional prop to limit number of displayed outfits
  refresh?: number;  // triggers re-fetch when updated
}

const OutfitCard: React.FC<OutfitCardProps> = ({ limit, refresh }) => {
  const { user, isLoading } = useAuth();
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeOutfit, setActiveOutfit] = useState<Outfit | null>(null);
  const layoutId = useId(); // used for motion layout
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchOutfits = async () => {
      // If auth state is still loading, do nothing.
      if (isLoading) return;

      // If there is no authenticated user, then set error.
      if (!user?.access_token) {
        setError("User authentication failed. Please log in again.");
        return;
      }
      try {
        // Using the correct endpoint from the service
        const response = await getSavedOutfits(user.access_token);
        if (response?.data && Array.isArray(response.data)) {
          // If a limit is provided, slice the fetched outfits.
          const limitedOutfits = limit ? response.data.slice(0, limit) : response.data;
          setOutfits(limitedOutfits);
        } else {
          setOutfits([]);
        }
        setError(null);
      } catch (err) {
        setError("Failed to fetch outfits");
        console.error(err);
      }
    };
    fetchOutfits();
  }, [user, limit, refresh, isLoading]);

  // Close the modal if clicking outside its content.
  useOutsideClick(modalRef, () => setActiveOutfit(null));

  // Format occasion text for display
  const formatOccasion = (occasion: string) => {
    if (!occasion) return "General";
    return occasion
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
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
            className="bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden cursor-pointer"
          >
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-800">
                  {formatOccasion(outfit.occasion)}
                </h3>
                {outfit.favourite && (
                  <Heart className="h-5 w-5 text-red-500 fill-red-500" />
                )}
              </div>
              
              <p className="text-sm text-gray-600 mb-3">
                {outfit.items.length} items in this outfit
              </p>
              
              <div className="flex flex-wrap gap-2">
                {/* Show up to 4 item thumbnails */}
                {outfit.items.slice(0, 4).map((item, index) => (
                  <div key={index} className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
                    <div className="transform scale-50">
                      <ItemCard 
                        itemId={item.id} 
                        limit={1} 
                      />
                    </div>
                  </div>
                ))}
                
                {/* Indicator for additional items */}
                {outfit.items.length > 4 && (
                  <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center">
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
                  {activeOutfit.favourite && (
                    <Heart className="h-6 w-6 text-red-500 fill-red-500" />
                  )}
                </div>
                
                {activeOutfit.created_at && (
                  <p className="text-sm text-gray-500 mb-6">
                    Created: {new Date(activeOutfit.created_at).toLocaleDateString()}
                  </p>
                )}
                
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-4 text-gray-700">Items in this outfit:</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {activeOutfit.items.map((item, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-2">
                        <ItemCard 
                          itemId={item.id} 
                          limit={1} 
                        />
                      </div>
                    ))}
                  </div>
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