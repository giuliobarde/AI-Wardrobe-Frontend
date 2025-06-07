"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useWardrobe } from "../context/WardrobeContext";
import { X, Loader2 } from "lucide-react";
import SearchableDropdown from "./SearchableDropdown";
import { AnimatePresence, motion } from "motion/react";
import { useOutsideClick } from "../hooks/use-outside-click";
import ErrorModal from "./ErrorModal";

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
  "Burnt Orange", "Forest Green", "Slate Gray",
  // ——— Jeans washes ———
  "Light Wash", "Medium Wash", "Dark Wash", "Acid Wash",
  "Black Denim", "White Denim"
];

const allowedColorSet = new Set(commonColors.map(c => c.toLowerCase()));

// ——— Other grouped options ———
const itemTypeOptions = {
  tops: [
    "blouse", "bodysuit", "button-down shirt", "button-up shirt",
    "camisole", "cardigan", "crop top", "crewneck sweater", "dress shirt",
    "halter top", "henley", "hoodie", "jersey", "kimono top",
    "long sleeve t-shirt", "muscle tee", "peplum top", "polo shirt",
    "shirt", "sleeveless top", "sweater", "sweatshirt", "tank top",
    "thermal shirt", "tube top", "t-shirt", "tunic", "turtleneck",
    "tuxedo shirt", "vest", "wrap top"
  ].sort(),
  bottoms: [
    "bermuda shorts", "biker shorts", "capris", "cargo pants", "chinos",
    "corduroys", "culottes", "denim shorts", "dress pants", "flare pants",
    "gaucho pants", "harem pants", "hot pants", "jeggings", "jeans",
    "joggers", "khakis", "leggings", "linen pants", "overalls",
    "palazzo pants", "parachute pants", "pleated skirt", "shorts",
    "skirt", "skort", "slacks", "sweatpants", "tuxedo pants", "trousers", 
    "wrap skirt"
  ].sort(),
  shoes: [
    "ankle boots", "athletic shoes", "ballet flats", "block heels",
    "boat shoes", "brogues", "canvas shoes", "cap toe derbies", "cap toe oxfords",
    "chelsea boots", "chukka boots", "clogs", "combat boots", "cowboy boots",
    "crocs", "derbies", "dress boots", "espadrilles", "flat sandals", 
    "flip flops", "harness boots", "heel boots", "hiking boots", "kiltie loafers",
    "knee-high boots", "kitten heels", "loafers", "mary janes", "moccasins",
    "monk strap", "mules", "opera pumps", "oxfords", "penny loafers", 
    "platforms", "plain toe derbies", "plain toe oxfords", "ribbon pumps",
    "riding boots", "saddle shoes", "sandals", "slingbacks", "sneakers",
    "stilettos", "thigh-high boots", "triple monk strap", "wedges",
    "wingtip boots", "wingtip derbies", "wingtip oxfords", "work boots"
  ].sort(),
  outerware: [
    "anorak", "biker jacket", "blazer", "bomber jacket", "cape", 
    "car coat", "coat", "denim jacket", "duffle coat", "field jacket",
    "fleece jacket", "fur coat", "leather jacket", "overcoat", 
    "parka", "pea coat", "poncho", "puffer jacket", "quilted jacket", 
    "raincoat", "shearling jacket", "suit jacket", "trench coat",
    "tuxedo blazer", "windbreaker", "wrap coat"
  ].sort(),
};

const materialOptions = {
  cold: ["Alpaca", "Cashmere", "Corduroy", "Fleece", "Flannel", "Sherpa", "Tweed", "Vicuña", "Wool"].sort(),
  hot: ["Bamboo", "Chambray", "Linen", "Rayon", "Seersucker"].sort(),
  all: ["Cotton", "Denim", "Jersey", "Lycra", "Modal", "Nylon", "Polyester", "Silk", "Spandex", "Tencel", "Viscose", "Velvet", "Virgin Wool"].sort(),
  non_rain: ["Faux Leather", "Leather", "Patent Leather", "Suede"].sort(),
  rain: ["PVC", "Rubber", "Vinyl"].sort(),
};

const weatherOptions = {
  cold: ["Cold", "Very Cold", "Snowy", "Windy"].sort(),
  moderate: ["All", "Cool", "Mild", "Moderate", "No Rain", "Warm"].sort(),
  hot: ["Hot", "Very Hot", "Humid", "Dry Heat"].sort(),
  rainy: ["Drizzly", "Rainy", "Thunderstorms", "Monsoon"].sort(),
};

const fitOptions = {
  very_formal: ["Tailored Fit", "Slim Tailored"],
  formal: ["Fit", "Slim", "Modern Fit"],
  somewhat_formal: ["Regular", "Classic Fit", "Standard"],
  not_formal: ["Baggy", "Relaxed", "Skinny", "Oversized", "Loose"]
};

const formalityOptions = {
  formalities: ["Very Low", "Low", "Somewhat Low", "Medium", "Somewhat High", "High", "Very High", "Business Casual", "Smart Casual", "Casual", "Business Formal", "Cocktail", "Black Tie", "White Tie"].sort(),
};

const patternsOptions = {
  patterns: [
    "Abstract", "Animal Print", "Argyle", "Baroque", "Camouflage", 
    "Checkered", "Chevron", "Color Block", "Damask", "Floral", 
    "Geometric", "Gingham", "Gradient", "Graphic", "Grid", 
    "Herringbone", "Houndstooth", "Leopard", "Microprint", 
    "Ombre", "Paisley", "Pinstripe", "Plaid", "Polka Dot", 
    "Solid", "Striped", "Tartan", "Tie-Dye", "Tropical", 
    "Windowpane", "Zebra Print"
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
  const { addItem } = useWardrobe(); // Use the addItem function from context
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
  
  // Error handling state
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);

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
    setPattern(""); setErrorMessage(null);
    setModalOpen(false);
  }, []);

  const handleError = useCallback((msg: string) => {
    setErrorMessage(msg);
    setShowErrorModal(true);
    if (onError) onError(msg);
  }, [onError]);

  const closeErrorModal = useCallback(() => {
    setShowErrorModal(false);
    setErrorMessage(null);
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
    setErrorMessage(null);
    
    if (!itemType || !subType) {
      handleError("Please select an item type.");
      return;
    }
    
    if (!color) {
      handleError("Please select a color.");
      return;
    }
    
    if (!allowedColorSet.has(color.toLowerCase())) {
      handleError("Please select a valid color from the list.");
      return;
    }
    
    if (!pattern) {
      setPattern("solid");
    }
    
    if (!user?.access_token) {
      handleError("Please log in again.");
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
      // Use addItem from WardrobeContext instead of direct API call
      const newItem = await addItem(payload);
      if (newItem) {
        closeModal();
        onItemAdded();
      } else {
        handleError("Failed to add item. Please try again.");
      }
    } catch (error: any) {
      console.error("Add item error:", error);
      handleError(error.message || "Failed to add item. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>  
      {/* Add Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setModalOpen(true)}
        className="flex items-center bg-blue-600 text-white px-6 py-3 rounded-full shadow-md hover:bg-blue-700 transition-colors"
      >
        <span className="mr-2">+</span>
        Add Item
      </motion.button>

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

      {/* Error Modal */}
      <ErrorModal 
        isOpen={showErrorModal}
        message={errorMessage || ""}
        onClose={closeErrorModal}
      />
    </>
  );
}