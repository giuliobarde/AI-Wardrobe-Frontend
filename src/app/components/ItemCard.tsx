"use client";

import React, { useEffect, useRef, useState, useId } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { deleteClothingItem, displayClothingItem, displayClothingItemById } from "../services/wardrobeService";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useOutsideClick } from "../hooks/use-outside-click";
import { X } from "lucide-react";
import { usePathname } from "next/navigation";

interface Item {
  id: string;
  user_id: string;
  item_type: string;
  material: string;
  color: string;
  formality: string;
  pattern: string;
  fit: string;
  suitable_for_weather: string;
  suitable_for_occasion: string;
  sub_type: string;
  image_link?: string;
}

interface ItemCardProps {
  itemType?: string; // optional if itemId is provided
  itemId?: string;   // optional prop to display a specific item
  limit?: number;    // optional prop to limit number of displayed items
  refresh?: number;  // triggers re-fetch when updated
}

const ItemCard: React.FC<ItemCardProps> = ({ itemType, itemId, limit, refresh }) => {
  const { user, isLoading } = useAuth(); // now using isLoading
  const [items, setItems] = useState<Item[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeItem, setActiveItem] = useState<Item | null>(null);
  const layoutId = useId(); // used for motion layout
  const modalRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const normalizedPath = pathname !== "/" && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;

  useEffect(() => {
    const fetchItems = async () => {
      // If auth state is still loading, do nothing.
      if (isLoading) return;

      // If there is no authenticated user, then set error.
      if (!user?.access_token) {
        setError("User authentication failed. Please log in again.");
        return;
      }
      try {
        let fetchedItems: Item[] = [];
        if (itemId) {
          // Fetch the item by id; no itemType required.
          const response = await displayClothingItemById(user.access_token, itemId);
          if (response?.data) {
            fetchedItems = Array.isArray(response.data) ? response.data : [response.data];
          }
        } else if (itemType) {
          const response = await displayClothingItem(user.access_token, itemType);
          if (response?.data && Array.isArray(response.data)) {
            fetchedItems = response.data;
          }
        } else {
          setError("No item id or item type provided.");
          return;
        }
        // If a limit is provided, slice the fetched items.
        const limitedItems = limit ? fetchedItems.slice(0, limit) : fetchedItems;
        setItems(limitedItems);
        setError(null);
      } catch (err) {
        setError("Failed to fetch items");
        console.error(err);
      }
    };
    fetchItems();
  }, [user, itemType, itemId, limit, refresh, isLoading]);

  // Close the modal if clicking outside its content.
  useOutsideClick(modalRef, () => setActiveItem(null));

  const handleDelete = async (itemId: string) => {
    setError(null);
    if (!user?.access_token) {
      setError("User authentication failed. Please log in again.");
      return;
    }
    try {
      await deleteClothingItem(user.access_token, itemId);
      // Remove the deleted item from the items state.
      setItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
      setActiveItem(null);
    } catch (err) {
      setError("Failed to delete item");
      console.error(err);
    }
  };

  return (
    <div className="relative">
      {error && <p className="text-red-500">{error}</p>}
      <div className="flex flex-wrap gap-4 justify-center">
        {items.map((item) => (
          <motion.div
            key={item.id}
            onClick={() => setActiveItem(item)}
            className="min-w-[150px] h-40 flex items-center justify-center bg-white border border-gray-300 rounded-lg shadow-md cursor-pointer hover:bg-gray-100"
          >
            {item.image_link ? (
              <Image
                src={item.image_link}
                alt={item.sub_type}
                width={150}
                height={150}
                className="object-cover rounded-lg"
              />
            ) : (
              <div className="text-center">
                <p className="font-bold">{item.sub_type}</p>
                <p>{item.color}</p>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Expanded Modal */}
      <AnimatePresence>
        {activeItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
          >
            <motion.div
              ref={modalRef}
              layoutId={`item-${activeItem.id}-${layoutId}`}
              className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-4"
            >
              <motion.button
                onClick={() => setActiveItem(null)}
                className="absolute top-2 right-2 p-2 text-gray-400 hover:text-gray-900"
              >
                <X className="w-6 h-6" />
              </motion.button>
              {activeItem.image_link ? (
                <Image
                  src={activeItem.image_link}
                  alt={activeItem.sub_type}
                  width={300}
                  height={300}
                  className="object-cover rounded-lg mx-auto"
                />
              ) : null}
              <div className="mt-4">
                <p className="font-bold">Item:</p>
                <p>
                  <span className="font-semibold">Sub Type:</span> {activeItem.sub_type}
                </p>
                <p>
                  <span className="font-semibold">Color:</span> {activeItem.color}
                </p>
                <p>
                  <span className="font-semibold">Material:</span> {activeItem.material}
                </p>
                <p>
                  <span className="font-semibold">Fit:</span> {activeItem.fit}
                </p>
                <p>
                  <span className="font-semibold">Pattern:</span> {activeItem.pattern}
                </p>
                <p>
                  <span className="font-semibold">Formality:</span> {activeItem.formality}
                </p>
                <p>
                  <span className="font-semibold">Suitable for Weather:</span> {activeItem.suitable_for_weather}
                </p>
              </div>
              {pathname !== "/Outfits" && (
                <button
                  onClick={() => handleDelete(activeItem.id)}
                  className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
                >
                  Delete item
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ItemCard;
