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

// Define type for quality settings
interface QualitySettings {
  material?: string;
  suitableWeather?: string;
  color?: string;
  formality?: string;
  fit?: string;
  pattern?: string;
}

// Common clothing colors
const commonColors = [
  "Black", "White", "Navy", "Gray", "Beige", "Red", "Blue", 
  "Green", "Yellow", "Purple", "Pink", "Orange", "Brown", "Khaki", 
  "Olive", "Burgundy", "Teal", "Turquoise", "Gold", "Silver", "Cream"
];

// Clothing options categorized by type
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

// Material options by weather suitability
const materialOptions = {
  cold: ["cashmere", "corduroy", "fleece", "flannel", "vicuña", "wool"].sort(),
  hot: ["linen"],
  all: ["cotton", "silk", "synthetic", "virgin wool", "velvet"].sort(),
  non_rain: ["leather", "patent leather", "suede"].sort(),
  rain: ["rubber"].sort(),
};

// Weather categories
const weatherOptions = {
  cold: ["cold", "very cold"].sort(),
  moderate: ["all", "moderate", "no rain", "warm"].sort(),
  hot: ["hot", "very hot"].sort(),
  rainy: ["drizzly", "rainy"].sort(),
};

// Fit options by formality
const fitOptions = {
  very_formal: ["tailored fit"],
  formal: ["fit", "slim"].sort(),
  somewhat_formal: ["regular"],
  not_formal: ["baggy", "skinny"].sort(),
};

// Formality levels
const formalityOptions = {
  formalities: ["high", "low", "very low", "very high", "medium", "somewhat high"].sort(),
};

// Pattern options
const patternsOptions = {
  patterns: [
    "abstract", "animal print", "argyle", "checkered", "floral", 
    "geometric", "gingham", "herringbone", "houndstooth", "paisley", 
    "pinstripe", "plaid", "polka dot", "solid", "striped", 
    "tie-dye", "windowpane"
  ].sort(),
};

// Common quality settings for specific item types
const qualitySettingsMap: Record<string, QualitySettings> = {
  // You could add preset mappings here, for example:
  "tuxedo shirt": {
    material: "cotton",
    formality: "very high",
    pattern: "solid",
    fit: "tailored fit"
  },
  "jeans": {
    material: "cotton",
    formality: "low",
    fit: "regular",
    suitableWeather: "all"
  }
  // Add more preset mappings as needed
};

export default function AddItem({ onItemAdded }: AddItemProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showGeneratingNotice, setShowGeneratingNotice] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);
  const colorPickerRef = useRef<HTMLDivElement>(null);
  
  // Form field states
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

  // Close modal when clicking outside
  useOutsideClick(modalRef, () => closeModal());
  
  // Close color picker when clicking outside
  useOutsideClick(colorPickerRef, () => setColorPickerOpen(false));

  // Lock body scroll when modal is open
  useEffect(() => {
    if (modalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [modalOpen]);

  // Show generating notice if submission takes more than 1 second
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isSubmitting) {
      timer = setTimeout(() => {
        setShowGeneratingNotice(true);
      }, 1000);
    } else {
      setShowGeneratingNotice(false);
    }
    
    return () => {
      clearTimeout(timer);
    };
  }, [isSubmitting]);

  // Reset form fields when closing modal
  const closeModal = useCallback(() => {
    setItemType("");
    setSubType("");
    setMaterial("");
    setColor("");
    setFormality("");
    setPattern("");
    setFit("");
    setSuitableWeather("");
    setSuitableOccasion("");
    setError(null);
    setModalOpen(false);
  }, []);

  // Auto-fill related fields based on item type selection
  const handleItemTypeSelect = (group: string, option: string) => {
    setItemType(group);
    setSubType(option);

    const settings = qualitySettingsMap[option];
    if (settings) {
      if (settings.material) setMaterial(settings.material);
      if (settings.suitableWeather) setSuitableWeather(settings.suitableWeather);
      if (settings.color) setColor(settings.color || "");
      if (settings.formality) setFormality(settings.formality);
      if (settings.fit) setFit(settings.fit);
      if (settings.pattern) setPattern(settings.pattern);
    }
  };

  // Set material and suggest weather suitability
  const handleMaterialSelect = (group: string, option: string) => {
    setMaterial(option);
    // Only update weather if not already set or if changing from non-rain to rain material
    if (!suitableWeather || (group === "rain" && suitableWeather === "no rain")) {
      setSuitableWeather(group === "non_rain" ? "no rain" : 
                         group === "rain" ? "rainy" : 
                         group === "cold" ? "cold" : 
                         group === "hot" ? "hot" : 
                         suitableWeather);
    }
  };

  const handleWeatherSelect = (_: string, option: string) => {
    setSuitableWeather(option);
  };

  // Update fit and suggest formality level
  const handleFitSelect = (group: string, option: string) => {
    setFit(option);
    if (!formality) {
      setFormality(
        group === "very_formal" ? "very high" :
        group === "formal" ? "high" :
        group === "somewhat_formal" ? "somewhat high" :
        group === "not_formal" ? "low" : 
        ""
      );
    }
  };

  const handleFormalitySelect = (_: string, option: string) => {
    setFormality(option);
  };

  const handlePatternSelect = (_: string, option: string) => {
    setPattern(option);
  };

  const handleColorSelect = (selectedColor: string) => {
    setColor(selectedColor);
    setColorPickerOpen(false);
    // Focus back on the input
    if (colorInputRef.current) {
      colorInputRef.current.focus();
    }
  };

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate required fields
    if (!itemType || !subType) {
      setError("Please select an item type.");
      return;
    }

    if (!user?.access_token) {
      setError("User authentication failed. Please log in again.");
      return;
    }

    const itemData = {
      user_id: user.user_id,
      item_type: itemType,
      sub_type: subType,
      material,
      color,
      formality,
      pattern,
      fit,
      suitable_for_weather: suitableWeather,
      suitable_for_occasion: suitableOccasion,
    };

    try {
      setIsSubmitting(true);
      await addClothingItem(itemData, user.access_token);
      closeModal();
      onItemAdded();
    } catch (err) {
      setError("Failed to add item. Please try again.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Add Item Button */}
      <div
        onClick={() => setModalOpen(true)}
        className="min-w-[150px] h-40 flex items-center justify-center bg-white border border-gray-300 rounded-lg shadow-md cursor-pointer hover:bg-gray-100 transition-colors duration-200"
        aria-label="Add new clothing item"
      >
        <Plus className="w-8 h-8 text-blue-600" />
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          >
            <motion.div
              ref={modalRef}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="relative bg-white rounded-xl shadow-xl max-w-lg w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>

              {/* Title */}
              <h1 className="text-2xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">
                Add New Item
              </h1>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Item Type */}
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Item Type<span className="text-red-500">*</span></label>
                  <SearchableDropdown 
                    onSelect={handleItemTypeSelect} 
                    options={itemTypeOptions} 
                    value={subType}
                  />
                </div>

                {/* Two-column layout for remaining fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Material */}
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">Material</label>
                    <SearchableDropdown 
                      onSelect={handleMaterialSelect} 
                      options={materialOptions} 
                      value={material} 
                    />
                  </div>

                  {/* Color with Picker */}
                  <div className="relative">
                    <label className="block font-medium text-gray-700 mb-1">Color<span className="text-red-500">*</span></label>
                    <div className="relative">
                      <input
                        ref={colorInputRef}
                        type="text"
                        placeholder="Enter or select color"
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        onFocus={() => setColorPickerOpen(true)}
                      />
                      {color && (
                        <div 
                          className="absolute right-2 top-2 h-6 w-6 rounded-full border border-gray-300"
                          style={{ backgroundColor: color }}
                        />
                      )}
                    </div>
                    
                    {/* Color picker dropdown */}
                    {colorPickerOpen && (
                      <div 
                        ref={colorPickerRef}
                        className="absolute z-20 mt-1 p-2 bg-white rounded-md shadow-lg border border-gray-200 w-full"
                      >
                        <div className="grid grid-cols-4 gap-1">
                          {commonColors.map((clr) => (
                            <button
                              key={clr}
                              type="button"
                              onClick={() => handleColorSelect(clr)}
                              className="flex flex-col items-center p-2 hover:bg-gray-100 rounded transition-colors"
                            >
                              <div 
                                className="h-6 w-6 rounded-full border border-gray-300 mb-1" 
                                style={{ backgroundColor: clr }}
                              />
                              <span className="text-xs">{clr}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Weather */}
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">Suitable Weather</label>
                    <SearchableDropdown 
                      onSelect={handleWeatherSelect} 
                      options={weatherOptions} 
                      value={suitableWeather} 
                    />
                  </div>

                  {/* Fit */}
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">Fit</label>
                    <SearchableDropdown 
                      onSelect={handleFitSelect} 
                      options={fitOptions} 
                      value={fit} 
                    />
                  </div>

                  {/* Formality */}
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">Formality</label>
                    <SearchableDropdown 
                      onSelect={handleFormalitySelect} 
                      options={formalityOptions} 
                      value={formality} 
                    />
                  </div>

                  {/* Pattern */}
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">Pattern</label>
                    <SearchableDropdown 
                      onSelect={handlePatternSelect} 
                      options={patternsOptions} 
                      value={pattern} 
                    />
                  </div>
                </div>

                {/* Error message */}
                {error && (
                  <div className="rounded-md bg-red-50 p-3">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full font-semibold 
                  hover:from-blue-600 hover:to-purple-700 transition transform hover:scale-[1.02] 
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Adding...
                    </span>
                  ) : (
                    "Add Item"
                  )}
                </button>
              </form>

              {/* Generating notification */}
              <AnimatePresence>
                {showGeneratingNotice && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-white px-4 py-3 rounded-lg shadow-lg border border-blue-100 z-50 flex items-center"
                  >
                    <Loader2 className="w-5 h-5 text-blue-500 mr-3 animate-spin" />
                    <p className="text-sm">
                      We currently don't have an image about your item, we are generating it right now 😄
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