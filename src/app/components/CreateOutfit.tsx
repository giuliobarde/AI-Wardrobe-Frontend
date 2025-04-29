"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { addSavedOutfit } from "@/app/services/outfitServices";
import { displayClothingItem } from "@/app/services/wardrobeServices";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useOutsideClick } from "@/app/hooks/use-outside-click";

interface ClothingItem {
  id: string;
  added_date?: string;
  sub_type?: string;
  color?: string;
}

type CreateOutfitProps = {
  show: boolean;
  onClose: () => void;
  onOutfitAdded: () => void;
};

export default function CreateOutfit({ show, onClose, onOutfitAdded }: CreateOutfitProps) {
  const { user } = useAuth();
  const modalRef = useRef<HTMLDivElement>(null);
  useOutsideClick(modalRef, () => onClose());

  const [tops, setTops] = useState<ClothingItem[]>([]);
  const [bottoms, setBottoms] = useState<ClothingItem[]>([]);
  const [shoes, setShoes] = useState<ClothingItem[]>([]);
  const [outerware, setOuterware] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTop, setSelectedTop] = useState("");
  const [selectedBottom, setSelectedBottom] = useState("");
  const [selectedShoes, setSelectedShoes] = useState("");
  const [selectedOuterware, setSelectedOuterware] = useState("");
  const [occasion, setOccasion] = useState("");
  const [error, setError] = useState("");

  // Disable body scrolling when modal is open
  useEffect(() => {
    if (show) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [show]);

  useEffect(() => {
    async function fetchCategoryItems(category: string, setter: (items: ClothingItem[]) => void) {
      if (user?.access_token) {
        setLoading(true);
        try {
          const response = await displayClothingItem(user.access_token, category);
          setter(response.data || []);
        } catch (err) {
          console.error(`Failed to fetch ${category} items:`, err);
        }
      }
    }
    
    if (show) {
      fetchCategoryItems("tops", setTops);
      fetchCategoryItems("bottoms", setBottoms);
      fetchCategoryItems("shoes", setShoes);
      fetchCategoryItems("outerware", setOuterware);
      setLoading(false);
    }
  }, [user, show]);

  const handleSave = async () => {
    if (!selectedTop && !selectedBottom && !selectedShoes) {
      setError("Please select at least one clothing item.");
      return;
    }
    
    if (!occasion) {
      setError("Please provide an occasion for this outfit.");
      return;
    }
    
    // Create items array with only selected items
    const items = [];
    if (selectedTop) items.push({ id: selectedTop, type: "top" });
    if (selectedBottom) items.push({ id: selectedBottom, type: "bottom" });
    if (selectedShoes) items.push({ id: selectedShoes, type: "shoes" });
    if (selectedOuterware) items.push({ id: selectedOuterware, type: "outerware" });
    
    // Restructure the data to match the OutfitData model
    const outfitData = {
      user_id: user?.user_id,
      items: items,
      occasion: occasion,
      favourite: false
    };
    
    try {
      if (user?.access_token) {
        await addSavedOutfit(outfitData, user.access_token);
        onOutfitAdded();
        onClose();
      }
    } catch (err) {
      console.error("Failed to save outfit:", err);
      setError("Failed to save outfit.");
    }
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed top-0 left-0 w-screen h-screen flex items-center justify-center bg-black/50 z-50"
      >
        <motion.div
          ref={modalRef}
          className="bg-white p-6 rounded-xl shadow-lg max-w-md w-full"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.9 }}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
              Create New Outfit
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-200 transition"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block font-semibold mb-1">Select Top (Optional)</label>
                <select
                  value={selectedTop}
                  onChange={(e) => setSelectedTop(e.target.value)}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Select Top --</option>
                  {tops.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.sub_type} - {item.color}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block font-semibold mb-1">Select Bottom (Optional)</label>
                <select
                  value={selectedBottom}
                  onChange={(e) => setSelectedBottom(e.target.value)}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Select Bottom --</option>
                  {bottoms.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.sub_type} - {item.color}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block font-semibold mb-1">Select Shoes (Optional)</label>
                <select
                  value={selectedShoes}
                  onChange={(e) => setSelectedShoes(e.target.value)}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Select Shoes --</option>
                  {shoes.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.sub_type} - {item.color}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block font-semibold mb-1">Select Outerwear (Optional)</label>
                <select
                  value={selectedOuterware}
                  onChange={(e) => setSelectedOuterware(e.target.value)}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Select Outerwear --</option>
                  {outerware.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.sub_type} - {item.color}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block font-semibold mb-1">Occasion</label>
                <input
                  type="text"
                  value={occasion}
                  onChange={(e) => setOccasion(e.target.value)}
                  placeholder="Enter occasion (e.g., Casual, Work, Party)"
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              {error && <p className="text-red-500 text-center">{error}</p>}
              
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                  Save Outfit
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}