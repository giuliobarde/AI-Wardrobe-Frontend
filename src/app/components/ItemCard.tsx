"use client";

import React, { useId, useRef, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { checkItemInOutfits } from "../services/wardrobeServices";
import { useWardrobe, WardrobeItem } from "../context/WardrobeContext";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useOutsideClick } from "../hooks/use-outside-click";
import { X, Heart, Trash2, Tag, Thermometer, Calendar, Download, Share2 } from "lucide-react";
import { usePathname } from "next/navigation";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import ErrorModal from "./ErrorModal";

interface ItemCardProps {
  itemType?: string;
  itemId?: string;
  limit?: number;
  refresh?: number;
  thumbnail?: boolean;
  onError?: (msg: string) => void;
  // Add a parent context identifier
  parentContext?: string;
  // Add a way to prevent modal from opening
  disableModal?: boolean;
}

const ItemCard: React.FC<ItemCardProps> = ({
  itemType,
  itemId,
  limit,
  refresh,
  thumbnail,
  onError,
  parentContext,
  disableModal = false,
}) => {
  const { user } = useAuth();
  const { 
    isLoading: contextLoading, 
    getItemsByType, 
    getItemById, 
    toggleFavorite,
    deleteItem 
  } = useWardrobe();
  
  const [activeItem, setActiveItem] = useState<WardrobeItem | null>(null);
  const [favoriteAnimation, setFavoriteAnimation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const uniqueId = useId();
  const modalRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Delete flow state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [outfitsCount, setOutfitsCount] = useState(0);
  
  // Error modal state
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useOutsideClick(modalRef, () => setActiveItem(null));
  
  // Get items from context based on props
  const items = React.useMemo(() => {
    if (itemId) {
      const item = getItemById(itemId);
      return item ? [item] : [];
    } else if (itemType) {
      const filteredItems = getItemsByType(itemType);
      return limit ? filteredItems.slice(0, limit) : filteredItems;
    }
    return [];
  }, [itemType, itemId, getItemsByType, getItemById, limit, refresh]);

  // Generate a unique layoutId for each item
  const getLayoutId = (id: string) => {
    // Include parent context in the layoutId if provided
    const contextPrefix = parentContext ? `${parentContext}-` : '';
    return `item-card-${contextPrefix}${id}-${uniqueId}`;
  };

  // Handle error display
  const handleError = (message: string) => {
    setErrorMessage(message);
    setErrorModalOpen(true);
    
    // Also call the onError prop if provided
    if (onError) {
      onError(message);
    }
  };

  // Handle favorite toggling
  const handleToggleFavorite = async (itemId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!user?.access_token) {
      handleError("Please log in.");
      return;
    }
    
    try {
      await toggleFavorite(itemId);
      // No need to update local state as it's handled by the context
    } catch (err) {
      handleError("Failed to update favorite.");
    }
  };

  const checkItemOutfits = async (id: string): Promise<number> => {
    if (!user?.access_token) throw new Error("User auth failed.");
    const resp = await checkItemInOutfits(user.access_token, id);
    return resp.data.length;
  };

  const initiateDelete = async (id: string) => {
    if (!user?.access_token) {
      handleError("User authentication failed. Please log in again.");
      return;
    }
    
    try {
      setLoading(true);
      const cnt = await checkItemOutfits(id);
      setLoading(false);
      
      if (cnt > 0) {
        setOutfitsCount(cnt);
        setItemToDelete(id);
        setShowDeleteModal(true);
      } else {
        performDelete(id);
      }
    } catch {
      setLoading(false);
      handleError("Could not verify whether this item is in any outfits.");
    }
  };

  const performDelete = async (id: string, deleteOutfits = false) => {
    if (!user?.access_token) {
      handleError("User authentication failed. Please log in again.");
      return;
    }
    
    try {
      await deleteItem(id, deleteOutfits);
      setActiveItem(null);
    } catch {
      handleError("Failed to delete item.");
    }
  };

  const handleConfirmDelete = (id: string) => {
    performDelete(id, true);
    setShowDeleteModal(false);
    setItemToDelete(null);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setItemToDelete(null);
  };
  
  const getFormattedCategory = (type: string): string => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getColorClass = (color: string): string => {
    const colorMap: Record<string, string> = {
      "red": "bg-red-100 text-red-800",
      "blue": "bg-blue-100 text-blue-800",
      "green": "bg-green-100 text-green-800",
      "yellow": "bg-yellow-100 text-yellow-800",
      "purple": "bg-purple-100 text-purple-800",
      "pink": "bg-pink-100 text-pink-800",
      "gray": "bg-gray-100 text-gray-800",
      "black": "bg-gray-800 text-white",
      "white": "bg-gray-100 text-gray-800 border border-gray-200",
      "brown": "bg-amber-100 text-amber-800",
      "orange": "bg-orange-100 text-orange-800"
    };
    
    const colorLower = color.toLowerCase();
    for (const [key, value] of Object.entries(colorMap)) {
      if (colorLower.includes(key)) {
        return value;
      }
    }
    
    return "bg-gray-100 text-gray-800";
  };

  if (contextLoading || loading) {
    return (
      <div className="flex justify-center items-center py-4">
        <div className="animate-pulse flex space-x-2">
          <div className="rounded-md bg-gray-200 h-40 w-40"></div>
        </div>
      </div>
    );
  }

  // Handle case where no items are found
  if (items.length === 0) {
    return (
      <div className="flex justify-center items-center">
        <div className="text-gray-400 text-sm">
          Item not found
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-4 justify-center">
        {items.map((item) => (
          <motion.div
            key={item.id}
            layoutId={thumbnail ? undefined : getLayoutId(item.id)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            whileHover={thumbnail ? {} : { y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
            onClick={() => !thumbnail && !disableModal && setActiveItem(item)}
            className={`relative group overflow-hidden ${
              thumbnail 
                ? "min-w-[40px] h-[40px] rounded-md" 
                : "min-w-[150px] h-48 flex flex-col border border-gray-200 rounded-lg shadow-sm cursor-pointer"
            }`}
          >
            {/* Item image or fallback */}
            <div className={`${thumbnail ? "w-full h-full" : "h-28 w-full relative"}`}>
              {item.image_link ? (
                <Image
                  src={item.image_link}
                  alt={item.sub_type}
                  width={thumbnail ? 50 : 150}
                  height={thumbnail ? 50 : 150}
                  className={`object-cover ${thumbnail ? "w-full h-full" : "w-full h-28"}`}
                  priority={true} // Add priority for faster loading
                />
              ) : (
                <div className={`bg-gray-50 flex items-center justify-center ${thumbnail ? "w-full h-full" : "w-full h-28"}`}>
                  <div className="text-center p-2">
                    <p className="font-medium text-gray-700 text-sm">
                      {item.sub_type}
                    </p>
                  </div>
                </div>
              )}
              
              {/* Favorite button */}
              {!thumbnail && (
                <motion.button
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.8 }}
                  onClick={(e) => handleToggleFavorite(item.id, e)}
                  className="absolute top-2 right-2 p-1 bg-white/80 rounded-full shadow-sm z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {item.favorite ? (
                    <Heart fill="currentColor" className="h-5 w-5 text-red-500" />
                  ) : (
                    <Heart className="h-5 w-5 text-gray-400 hover:text-red-500" />
                  )}
                </motion.button>
              )}
            </div>
            
            {/* Item details */}
            {!thumbnail && (
              <div className="p-3 flex flex-col flex-grow">
                <h3 className="font-semibold text-gray-800 truncate mt-1">
                  {item.sub_type}
                </h3>
                <div className="mt-auto flex items-center space-x-1">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${getColorClass(item.color)}`}>
                    {item.color}
                  </span>
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs">
                    {item.material}
                  </span>
                </div>
              </div>
            )}
            
            {/* Hover overlay for non-thumbnail */}
            {!thumbnail && !disableModal && (
              <motion.div 
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center p-4 pointer-events-none"
              >
                <p className="text-white font-medium text-sm text-center">View details</p>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Detailed Item Modal - Only render when not in thumbnail mode and modal is not disabled */}
      <AnimatePresence>
        {activeItem && !thumbnail && !disableModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              ref={modalRef}
              layoutId={getLayoutId(activeItem.id)}
              className="relative bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center bg-gray-50 border-b border-gray-100 px-4 py-3">
                <h3 className="font-bold text-gray-800">
                  {activeItem.sub_type}
                </h3>
                <div className="flex space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => handleToggleFavorite(activeItem.id, e)}
                    className="p-2 rounded-full hover:bg-gray-100"
                  >
                    {activeItem.favorite ? (
                      <Heart fill="currentColor" className="h-5 w-5 text-red-500" />
                    ) : (
                      <Heart className="h-5 w-5 text-gray-400 hover:text-red-500" />
                    )}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setActiveItem(null)}
                    className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>

              {/* Image Section */}
              <div className="relative bg-gray-50 border-b border-gray-100">
                {activeItem.image_link ? (
                  <Image
                    src={activeItem.image_link}
                    alt={activeItem.sub_type}
                    width={400}
                    height={400}
                    className="object-contain mx-auto h-56 w-full"
                    priority={true} // Add priority for faster loading
                  />
                ) : (
                  <div className="h-56 flex items-center justify-center p-4 bg-gray-50">
                    <div className="text-center">
                      <div className="p-3 bg-gray-100 rounded-full inline-block mb-3">
                        <Tag className="w-8 h-8 text-gray-500" />
                      </div>
                      <p className="text-lg font-bold text-gray-700">{activeItem.sub_type}</p>
                      <p className="text-sm text-gray-500">No image available</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Item Details */}
              <div className="p-4">
                {/* Item Type and Color */}
                <div className="flex items-center justify-between mb-4">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    {getFormattedCategory(activeItem.item_type)}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm ${getColorClass(activeItem.color)}`}>
                    {activeItem.color}
                  </span>
                </div>
                
                {/* Item Properties */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <span className="text-xs text-gray-500 block mb-1">Material</span>
                    <span className="font-medium">{activeItem.material}</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <span className="text-xs text-gray-500 block mb-1">Fit</span>
                    <span className="font-medium">{activeItem.fit}</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <span className="text-xs text-gray-500 block mb-1">Pattern</span>
                    <span className="font-medium">{activeItem.pattern}</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <span className="text-xs text-gray-500 block mb-1">Formality</span>
                    <span className="font-medium">{activeItem.formality}</span>
                  </div>
                </div>

                {/* Weather and Occasion */}
                <div className="mb-4">
                  <div className="flex items-center mb-2">
                    <Thermometer className="h-4 w-4 mr-2 text-blue-500" />
                    <span className="text-sm font-medium">Suitable for {activeItem.suitable_for_weather} weather</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-green-500" />
                    <span className="text-sm font-medium">Perfect for {activeItem.suitable_for_occasion}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between pt-3 border-t border-gray-100">
                  <div className="flex space-x-2">
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg flex items-center"
                    >
                      <Share2 className="h-4 w-4 mr-1" />
                      <span className="text-sm">Share</span>
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg flex items-center"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      <span className="text-sm">Save</span>
                    </motion.button>
                  </div>
                  
                  {pathname === "/Wardrobe" && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      onClick={() => initiateDelete(activeItem.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg flex items-center"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      <span className="text-sm">Delete</span>
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Modal */}
      <ErrorModal
        isOpen={errorModalOpen}
        message={errorMessage}
        onClose={() => setErrorModalOpen(false)}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        itemId={itemToDelete || ""}
        outfitCount={outfitsCount}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
};

export default ItemCard;