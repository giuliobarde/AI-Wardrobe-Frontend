"use client";

import React, { useEffect, useRef, useState, useId } from "react";
import { useAuth } from "@/app/context/AuthContext";
import {
  deleteClothingItem,
  displayClothingItem,
  displayClothingItemById,
  checkItemInOutfits,
} from "../services/wardrobeService";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useOutsideClick } from "../hooks/use-outside-click";
import { X } from "lucide-react";
import { usePathname } from "next/navigation";
import DeleteConfirmationModal from "./DeleteConfirmationModal";

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
  itemType?: string;
  itemId?: string;
  limit?: number;
  refresh?: number;
  thumbnail?: boolean;
  onError?: (msg: string) => void;
}

const ItemCard: React.FC<ItemCardProps> = ({
  itemType,
  itemId,
  limit,
  refresh,
  thumbnail,
  onError,
}) => {
  const { user, isLoading } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [activeItem, setActiveItem] = useState<Item | null>(null);
  const layoutId = useId();
  const modalRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Delete flow state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [outfitsCount, setOutfitsCount] = useState(0);

  useOutsideClick(modalRef, () => setActiveItem(null));

  useEffect(() => {
    const fetchItems = async () => {
      if (isLoading) return;
      if (!user?.access_token) {
        onError?.("User authentication failed. Please log in again.");
        return;
      }
      try {
        let fetched: Item[] = [];
        if (itemId) {
          const res = await displayClothingItemById(user.access_token, itemId);
          fetched = res.data
            ? Array.isArray(res.data)
              ? res.data
              : [res.data]
            : [];
        } else if (itemType) {
          const res = await displayClothingItem(user.access_token, itemType);
          fetched = res.data ?? [];
        } else {
          onError?.("No item id or item type provided.");
          return;
        }
        setItems(limit ? fetched.slice(0, limit) : fetched);
      } catch (err: any) {
        onError?.("Failed to fetch items.");
      }
    };
    fetchItems();
  }, [user, itemType, itemId, limit, refresh, isLoading, onError]);

  const checkItemOutfits = async (id: string): Promise<number> => {
    if (!user?.access_token) throw new Error("User auth failed.");
    const resp = await checkItemInOutfits(user.access_token, id);
    return resp.data.length;
  };

  const initiateDelete = async (id: string) => {
    if (!user?.access_token) {
      onError?.("User authentication failed. Please log in again.");
      return;
    }
    try {
      const cnt = await checkItemOutfits(id);
      if (cnt > 0) {
        setOutfitsCount(cnt);
        setItemToDelete(id);
        setShowDeleteModal(true);
      } else {
        performDelete(id);
      }
    } catch {
      onError?.("Could not verify whether this item is in any outfits.");
    }
  };

  const performDelete = async (id: string, deleteOutfits = false) => {
    if (!user?.access_token) {
      onError?.("User authentication failed. Please log in again.");
      return;
    }
    try {
      await deleteClothingItem(user.access_token, id, deleteOutfits);
      setItems((prev) => prev.filter((i) => i.id !== id));
      setActiveItem(null);
    } catch {
      onError?.("Failed to delete item.");
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

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-4 justify-center">
        {items.map((item) => (
          <motion.div
            key={item.id}
            onClick={() => setActiveItem(item)}
            className={`min-w-[150px] h-40 flex items-center justify-center bg-white border border-gray-300 rounded-lg shadow-md cursor-pointer ${
              !thumbnail ? "hover:bg-gray-100" : ""
            }`}
          >
            {item.image_link ? (
              <Image
                src={item.image_link}
                alt={item.sub_type}
                width={thumbnail ? 50 : 150}
                height={thumbnail ? 50 : 150}
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

      <AnimatePresence>
        {activeItem && !thumbnail && (
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
              <button
                onClick={() => setActiveItem(null)}
                className="absolute top-2 right-2 p-2 text-gray-400 hover:text-gray-900"
              >
                <X className="w-6 h-6" />
              </button>

              {activeItem.image_link && (
                <Image
                  src={activeItem.image_link}
                  alt={activeItem.sub_type}
                  width={300}
                  height={300}
                  className="object-cover rounded-lg mx-auto"
                />
              )}

              <div className="mt-4 space-y-1">
                {[
                  ["Sub Type", activeItem.sub_type],
                  ["Color", activeItem.color],
                  ["Material", activeItem.material],
                  ["Fit", activeItem.fit],
                  ["Pattern", activeItem.pattern],
                  ["Formality", activeItem.formality],
                  ["Weather", activeItem.suitable_for_weather],
                ].map(([label, val]) => (
                  <p key={label}>
                    <span className="font-semibold">{label}:</span> {val}
                  </p>
                ))}
              </div>

              {pathname !== "/Outfits" && (
                <button
                  onClick={() => initiateDelete(activeItem.id)}
                  className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Delete item
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
