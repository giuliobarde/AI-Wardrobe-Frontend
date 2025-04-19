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
  tops: [ /* … as before … */ ].sort(),
  bottoms: [ /* … */ ].sort(),
  shoes: [ /* … */ ].sort(),
  outerware: [ /* … */ ].sort(),
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

export default function AddItem({ onItemAdded }: AddItemProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showGeneratingNotice, setShowGeneratingNotice] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // form state
  const [itemType, setItemType] = useState("");
  const [subType, setSubType] = useState("");
  const [material, setMaterial] = useState("");
  const [suitableWeather, setSuitableWeather] = useState("");
  const [color, setColor] = useState("");
  const [fit, setFit] = useState("");
  const [formality, setFormality] = useState("");
  const [pattern, setPattern] = useState("");
  const [suitableOccasion, setSuitableOccasion] = useState("");
  const [error, setError] = useState<string | null>(null);

  // close modal on outside click
  useOutsideClick(modalRef, () => setModalOpen(false));

  // disable scroll when modal open
  useEffect(() => {
    document.body.style.overflow = modalOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [modalOpen]);

  // show “generating” notice after delay
  useEffect(() => {
    let t: NodeJS.Timeout;
    if (isSubmitting) t = setTimeout(() => setShowGeneratingNotice(true), 2000);
    else setShowGeneratingNotice(false);
    return () => clearTimeout(t);
  }, [isSubmitting]);

  const closeModal = useCallback(() => {
    setItemType(""); setSubType(""); setMaterial("");
    setColor(""); setFit(""); setFormality("");
    setPattern(""); setSuitableWeather("");
    setSuitableOccasion(""); setError(null);
    setModalOpen(false);
  }, []);

  // handlers for each dropdown
  const handleItemTypeSelect = (g: string, o: string) => {
    setItemType(g);
    setSubType(o);
    const s = qualitySettingsMap[o.toLowerCase()];
    if (s) {
      if (s.material) setMaterial(s.material);
      if (s.suitableWeather) setSuitableWeather(s.suitableWeather);
      if (s.color) setColor(s.color);
      if (s.formality) setFormality(s.formality);
      if (s.fit) setFit(s.fit);
      if (s.pattern) setPattern(s.pattern);
    }
  };
  const handleMaterialSelect = (_: string, o: string) => {
    setMaterial(o);
    if (!suitableWeather) setSuitableWeather("all");
  };
  const handleWeatherSelect = (_: string, o: string) => setSuitableWeather(o);
  const handleFitSelect = (g: string, o: string) => {
    setFit(o);
    if (!formality) {
      setFormality(
        g === "very_formal" ? "very high" :
        g === "formal"      ? "high" :
        g === "somewhat_formal" ? "somewhat high" :
        "low"
      );
    }
  };
  const handleFormalitySelect = (_: string, o: string) => setFormality(o);
  const handlePatternSelect = (_: string, o: string) => setPattern(o);
  const handleColorSelect = (_: string, o: string) => setColor(o);

  // submit (lowercase all except user_id)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!itemType || !subType) return setError("Please select an item type.");
    if (!user?.access_token) return setError("Please log in again.");

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
      suitable_for_occasion: suitableOccasion.toLowerCase(),
    };

    try {
      setIsSubmitting(true);
      await addClothingItem(payload, user.access_token);
      closeModal();
      onItemAdded();
    } catch {
      setError("Failed to add item. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Add button */}
      <div
        onClick={() => setModalOpen(true)}
        className="min-w-[150px] h-40 flex items-center justify-center bg-white border border-gray-300 rounded-lg shadow-md cursor-pointer hover:bg-gray-100 transition"
        aria-label="Add new clothing item"
      >
        <Plus className="w-8 h-8 text-blue-600" />
      </div>

      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          >
            <motion.div
              ref={modalRef}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white rounded-xl shadow-xl max-w-lg w-full p-6"
              onClick={e => e.stopPropagation()}
            >
              {/* close */}
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full"
                aria-label="Close modal"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>

              {/* title */}
              <h1 className="text-2xl font-bold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">
                Add New Item
              </h1>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Item Type */}
                <div>
                  <label className="block mb-1 font-medium">Item Type<span className="text-red-500">*</span></label>
                  <SearchableDropdown
                    onSelect={handleItemTypeSelect}
                    options={itemTypeOptions}
                    value={subType}
                  />
                </div>

                {/* 2‑col grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Material */}
                  <div>
                    <label className="block mb-1 font-medium">Material</label>
                    <SearchableDropdown
                      onSelect={handleMaterialSelect}
                      options={materialOptions}
                      value={material}
                    />
                  </div>

                  {/* Color */}
                  <div>
                    <label className="block mb-1 font-medium">Color<span className="text-red-500">*</span></label>
                    <SearchableDropdown
                      onSelect={handleColorSelect}
                      options={{ colors: commonColors }}
                      value={color}
                    />
                  </div>

                  {/* Weather */}
                  <div>
                    <label className="block mb-1 font-medium">Suitable Weather</label>
                    <SearchableDropdown
                      onSelect={handleWeatherSelect}
                      options={weatherOptions}
                      value={suitableWeather}
                    />
                  </div>

                  {/* Fit */}
                  <div>
                    <label className="block mb-1 font-medium">Fit</label>
                    <SearchableDropdown
                      onSelect={handleFitSelect}
                      options={fitOptions}
                      value={fit}
                    />
                  </div>

                  {/* Formality */}
                  <div>
                    <label className="block mb-1 font-medium">Formality</label>
                    <SearchableDropdown
                      onSelect={handleFormalitySelect}
                      options={formalityOptions}
                      value={formality}
                    />
                  </div>

                  {/* Pattern */}
                  <div>
                    <label className="block mb-1 font-medium">Pattern</label>
                    <SearchableDropdown
                      onSelect={handlePatternSelect}
                      options={patternsOptions}
                      value={pattern}
                    />
                  </div>
                </div>

                {/* error */}
                {error && (
                  <div className="bg-red-50 p-3 rounded-md">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                {/* submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full font-semibold
                             hover:from-blue-600 hover:to-purple-700 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70"
                >
                  {isSubmitting
                    ? <span className="flex items-center justify-center">
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />Adding...
                      </span>
                    : "Add Item"
                  }
                </button>
              </form>

              {/* generating notice */}
              <AnimatePresence>
                {showGeneratingNotice && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-white px-4 py-3 rounded-lg shadow-lg border border-blue-100 flex items-center"
                  >
                    <Loader2 className="w-5 h-5 text-blue-500 mr-3 animate-spin" />
                    <p className="text-sm">
                      Generating your item image… 😄
                    </p>
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
