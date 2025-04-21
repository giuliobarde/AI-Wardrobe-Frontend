"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { addClothingItem } from "../services/wardrobeService";
import { X, Plus, Loader2 } from "lucide-react";
import SearchableDropdown from "./SearchableDropdown";
import { AnimatePresence, motion } from "motion/react";
import { useOutsideClick } from "../hooks/use-outside-click";

type AddItemProps = {
  onItemAdded: () => void;
  onError?: (msg: string) => void;
};

// ——— Color palette & mapping ———
export const commonColors = [
  "Black", "White", "Navy", "Gray", "Beige", "Red", "Blue",
  "Green", "Yellow", "Purple", "Pink", "Orange", "Brown", "Khaki",
  "Olive", "Burgundy", "Teal", "Turquoise", "Gold", "Silver", "Cream",
  "Baby Blue", "Baby Pink", "Lavender", "Coral", "Mint Green", "Peach",
  "Mauve", "Sky Blue", "Charcoal", "Mustard", "Blush", "Emerald",
  "Rose Gold", "Champagne", "Chocolate", "Lilac", "Seafoam",
  "Burnt Orange", "Forest Green", "Slate Gray"
];

// ——— Other grouped options ———
const itemTypeOptions = {
  tops: [
    "blouse", "button-down shirt", "button-up shirt", "cardigan", 
    "crewneck sweater", "hoodie", "jersey", "long sleeve t-shirt", 
    "polo shirt", "shirt", "sweatshirt", "sweater", "tank top", 
    "t-shirt", "turtleneck", "tuxedo shirt"
  ].sort(),
  bottoms: [
    "chinos", "corduroys", "dress pants", "jeans", "leggings", 
    "shorts", "skirt", "sweatpants", "tuxedo pants"
  ].sort(),
  shoes: [
    "rain boots", "combat boots", "chelsea boots", "dress boots", 
    "work boots", "thigh-high boots", "knee-high boots", "logger boots", 
    "harness boots", "heel boots", "cowboy boots", "chukka boots", 
    "hiking boots", "wingtip boots", "whole cut oxfords", "plain toe oxfords", 
    "cap toe oxfords", "wing tip oxfords", "plain toe derbies", 
    "cap toe derbies", "wing tip derbies", "single monk strap", 
    "double monk strap", "triple monk strap", "kitten heels", 
    "stiletto heels", "wedges", "platforms", "pennie loafers", 
    "bit loafers", "tassle loafers", "kiltie loafers", "running shoes", 
    "opera pumps", "ribbon pumps", "sandals", "sneakers"
  ].sort(),
  outerware: [
    "bomber jacket", "denim jacket", "leather jacket", "overcoat", 
    "puffer jacket", "raincoat", "suit jacket", "trench coat", "tuxedo jacket"
  ].sort(),
};

const materialOptions = {
  cold: ["Cashmere","Corduroy","Fleece","Flannel","Vicuña","Wool"].sort(),
  hot: ["Linen"],
  all: ["Cotton","Silk","Synthetic","Virgin Wool","Velvet"].sort(),
  non_rain: ["Leather","Patent Leather","Suede"].sort(),
  rain: ["Rubber"].sort(),
};

const weatherOptions = {
  cold: ["Cold","Very Cold"].sort(),
  moderate: ["All","Moderate","No Rain","Warm"].sort(),
  hot: ["Hot","Very Hot"].sort(),
  rainy: ["Drizzly","Rainy"].sort(),
};

const fitOptions = {
  very_formal: ["Tailored Fit"],
  formal: ["Fit","Slim"].sort(),
  somewhat_formal: ["Regular"],
  not_formal: ["Baggy","Skinny"].sort(),
};

const formalityOptions = {
  formalities: ["High","Low","Very Low","Very High","Medium","Somewhat High"].sort(),
};

const patternsOptions = {
  patterns: [
    "Abstract","Animal Print","Argyle","Checkered","Floral",
    "Geometric","Gingham","Herringbone","Houndstooth","Paisley",
    "Pinstripe","Plaid","Polka Dot","Solid","Striped",
    "Tie-Dye","Windowpane"
  ].sort(),
};

// ——— Quality presets ———
interface QualitySettings {
  material?: string;
  suitableWeather?: string;
  color?: string;
  formality?: string;
  fit?: string;
  pattern?: string;
}
const qualitySettingsMap: Record<string, QualitySettings> = {
  "tuxedo shirt": {
    material: "cotton",
    formality: "very high",
    pattern: "solid",
    fit: "tailored fit"
  },
  jeans: {
    material: "cotton",
    formality: "low",
    fit: "regular",
    suitableWeather: "all"
  }
  // … add more presets …
};

export default function AddItem({ onItemAdded, onError }: AddItemProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showGeneratingNotice, setShowGeneratingNotice] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Form state
  const [itemType, setItemType] = useState("");
  const [subType, setSubType] = useState("");
  const [material, setMaterial] = useState("");
  const [suitableWeather, setSuitableWeather] = useState("");
  const [color, setColor] = useState("");
  const [fit, setFit] = useState("");
  const [formality, setFormality] = useState("");
  const [pattern, setPattern] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  useOutsideClick(modalRef, () => setModalOpen(false));

  useEffect(() => {
    document.body.style.overflow = modalOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [modalOpen]);

  useEffect(() => {
    let t: NodeJS.Timeout;
    if (isSubmitting) t = setTimeout(() => setShowGeneratingNotice(true), 2000);
    else setShowGeneratingNotice(false);
    return () => clearTimeout(t);
  }, [isSubmitting]);

  const closeModal = useCallback(() => {
    setItemType(""); setSubType(""); setMaterial("");
    setColor(""); setFit(""); setFormality("");
    setPattern(""); setLocalError(null);
    setModalOpen(false);
  }, []);

  // Dropdown handlers
  const handleItemTypeSelect = (group: string, option: string) => {
    setItemType(group);
    setSubType(option);
    const preset = qualitySettingsMap[option.toLowerCase()];
    if (preset) {
      if (preset.material) setMaterial(preset.material);
      if (preset.suitableWeather) setSuitableWeather(preset.suitableWeather);
      if (preset.color) setColor(preset.color);
      if (preset.formality) setFormality(preset.formality);
      if (preset.fit) setFit(preset.fit);
      if (preset.pattern) setPattern(preset.pattern);
    }
  };
  const handleMaterialSelect = (_: string, option: string) => setMaterial(option);
  const handleWeatherSelect = (_: string, option: string) => setSuitableWeather(option);
  const handleColorSelect = (_: string, option: string) => setColor(option);
  const handleFitSelect = (_: string, option: string) => setFit(option);
  const handleFormalitySelect = (_: string, option: string) => setFormality(option);
  const handlePatternSelect = (_: string, option: string) => setPattern(option);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!itemType || !subType) {
      const msg = "Please select an item type.";
      setLocalError(msg);
      onError?.(msg);
      return;
    }
    if (!user?.access_token) {
      const msg = "Please log in again.";
      onError?.(msg);
      return;
    }

    const payload = {
      user_id: user.user_id,
      item_type: itemType.toLowerCase(),
      sub_type: subType.toLowerCase(),
      material: material.toLowerCase(),
      color: color.toLowerCase(),
      formality: formality.toLowerCase(),
      pattern: pattern.toLowerCase(),
      fit: fit.toLowerCase(),
      suitable_for_weather: suitableWeather.toLowerCase(),
      suitable_for_occasion: "",
    };

    try {
      setIsSubmitting(true);
      await addClothingItem(payload, user.access_token);
      closeModal();
      onItemAdded();
    } catch {
      const msg = "Failed to add item. Please try again.";
      setLocalError(msg);
      onError?.(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>  
      {/* Add Button */}
      <div
        onClick={() => setModalOpen(true)}
        className="min-w-[150px] h-40 flex items-center justify-center bg-white border border-gray-300 rounded-lg shadow-md cursor-pointer hover:bg-gray-100 transition"
        aria-label="Add new clothing item"
      >
        <Plus className="w-8 h-8 text-blue-600" />
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          >
            <motion.div
              ref={modalRef}
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white rounded-xl shadow-xl max-w-lg w-full p-6"
              onClick={e => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full"
                aria-label="Close modal"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>

              <h2 className="text-2xl font-bold text-center mb-6">
                Add New Item
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Item Type */}
                <div>
                  <label className="block mb-1 font-medium">
                    Item Type <span className="text-red-500">*</span>
                  </label>
                  <SearchableDropdown
                    options={itemTypeOptions}
                    value={subType}
                    onSelect={handleItemTypeSelect}
                  />
                </div>

                {/* Grid of other fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Material */}
                  <div>
                    <label className="block mb-1 font-medium">Material</label>
                    <SearchableDropdown
                      options={materialOptions}
                      value={material}
                      onSelect={handleMaterialSelect}
                    />
                  </div>

                  {/* Color */}
                  <div>
                    <label className="block mb-1 font-medium">
                      Color <span className="text-red-500">*</span>
                    </label>
                    <SearchableDropdown
                      options={{ colors: commonColors }}
                      value={color}
                      onSelect={handleColorSelect}
                    />
                  </div>

                  {/* Weather */}
                  <div>
                    <label className="block mb-1 font-medium">Suitable Weather</label>
                    <SearchableDropdown
                      options={weatherOptions}
                      value={suitableWeather}
                      onSelect={handleWeatherSelect}
                    />
                  </div>

                  {/* Fit */}
                  <div>
                    <label className="block mb-1 font-medium">Fit</label>
                    <SearchableDropdown
                      options={fitOptions}
                      value={fit}
                      onSelect={handleFitSelect}
                    />
                  </div>

                  {/* Formality */}
                  <div>
                    <label className="block mb-1 font-medium">Formality</label>
                    <SearchableDropdown
                      options={formalityOptions}
                      value={formality}
                      onSelect={handleFormalitySelect}
                    />
                  </div>

                  {/* Pattern */}
                  <div>
                    <label className="block mb-1 font-medium">Pattern</label>
                    <SearchableDropdown
                      options={patternsOptions}
                      value={pattern}
                      onSelect={handlePatternSelect}
                    />
                  </div>
                </div>

                {localError && (
                  <div className="bg-red-50 p-3 rounded-md">
                    <p className="text-red-600 text-sm">{localError}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full font-semibold hover:from-blue-600 hover:to-purple-700 transition disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />Adding...
                    </span>
                  ) : (
                    "Add Item"
                  )}
                </button>
              </form>

              <AnimatePresence>
                {showGeneratingNotice && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-white px-4 py-3 rounded-lg shadow-lg border border-blue-100 flex items-center"
                  >
                    <Loader2 className="w-5 h-5 text-blue-500 mr-3 animate-spin" />
                    <p className="text-sm">Generating your item image… 😄</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}