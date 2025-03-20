"use client";

import { useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { addClothingItem } from "../services/wardrobeService";
import { X } from "lucide-react";
import SearchableDropdown from "./SearchableDropdown";
import { AnimatePresence, motion } from "motion/react";

type ItemProps = {
  modalOpen: boolean;
  setModalOpen: (open: boolean) => void;
};

const itemTypeOptions = {
  tops: [
    "blouse",
    "button-down shirt",
    "button-up shirt",
    "cardigan",
    "crewneck sweater",
    "jersey",
    "hoodie",
    "long sleeve t-shirt",
    "polo shirt",
    "shirt",
    "sweater",
    "sweatshirt",
    "tank top",
    "t-shirt",
    "turtleneck",
    "tuxido shirt",
  ],
  bottoms: [
    "chinos",
    "corduroys",
    "dress pants",
    "jeans",
    "leggings",
    "shorts",
    "skirt",
    "sweatpants",
    "tuxedo pants",
  ],
  shoes: [
    "boots",
    "dress shoes",
    "heels",
    "loafers",
    "running shoes",
    "sandals",
    "sneakers",
  ],
  outerware: [
    "bomber jacket",
    "denim jacket",
    "leather jacket",
    "overcoat",
    "puffer jacket",
    "raincoat",
    "suit jacket",
    "trench coat",
    "tuxedo jacket",
  ],
};

const materialOptions = {
  cold: ["cashmere", "courderoy", "flanel", "fleece", "vicuña", "wool"],
  hot: ["linen"],
  all: ["cotton", "silk", "synthetic", "virgin wool"],
  non_rain: ["leather", "patent leather", "suede"],
};

const weatherOptions = {
  cold: ["cold", "very cold"],
  moderate: ["moderate", "all", "no rain"],
  hot: ["hot", "very hot"],
  rainy: ["rainy", "drizzly"],
};

const fitOptions = {
  very_formal: ["tailord fit"],
  formal: ["slim", "fit"],
  somewhat_formal: ["regular"],
  not_formal: ["baggy", "skinny"],
};

const formalityOptions = {
  formalities: ["very formal", "formal", "somewhat formal", "not formal"],
};

const patternsOptions = {
  patterns: [
    "abstract",
    "animal print",
    "argyle",
    "checkered",
    "floral",
    "geometric",
    "gingham",
    "herringbone",
    "houndstooth",
    "paisley",
    "pinstripe",
    "plaid",
    "polka dot",
    "solid",
    "striped",
    "tie-dye",
    "windowpane",
  ],
};

export default function AddItem({ modalOpen, setModalOpen }: ItemProps) {
  // States for dropdown selections
  const [itemType, setItemType] = useState("");
  const [subType, setSubType] = useState("");
  const [material, setMaterial] = useState("");
  const [suitableWeather, setSuitableWeather] = useState("");
  const [fit, setFit] = useState("");
  const [formality, setFormality] = useState("");

  // Other text fields
  const [color, setColor] = useState("");
  const [pattern, setPattern] = useState("");
  const [suitableOccasion, setSuitableOccasion] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Handlers for dropdown selections.
  const handleItemTypeSelect = (group: string, option: string) => {
    setItemType(group);
    setSubType(option);
  };

  const handleMaterialSelect = (group: string, option: string) => {
    setMaterial(option);
    setSuitableWeather(group === "non_rain" ? "no rain" : group);
  };

  const handleWeatherSelect = (group: string, option: string) => {
    setSuitableWeather(group);
  };

  const handleFitSelect = (group: string, option: string) => {
    setFit(option);
    if (group === "very_formal") {
      setFormality("very formal");
    } else if (group === "somewhat_formal") {
      setFormality("somewhat formal");
    } else if (group === "not_formal") {
      setFormality("not formal");
    } else {
      setFormality(group);
    }
  };

  const handleFormalitySelect = (group: string, option: string) => {
    setFormality(option);
  };

  const handlePatternSelect = (group: string, option: string) => {
    setPattern(option);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!itemType) {
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
      await addClothingItem(itemData, user.access_token);
      // Reset form fields after successful submission
      setItemType("");
      setSubType("");
      setMaterial("");
      setColor("");
      setFormality("");
      setPattern("");
      setFit("");
      setSuitableWeather("");
      setSuitableOccasion("");
      setModalOpen(false);
      window.location.reload();
    } catch (err) {
      setError("Failed to add item");
      console.error(err);
    }
  };

  return (
    <AnimatePresence>
      {modalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center bg-black z-50"
          style={{ backgroundColor: "rgba(17, 24, 39, 0.5)" }}
          onClick={() => setModalOpen(false)}
        >
          <motion.div
            className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-200 transition"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
              Add New Item
            </h1>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-semibold mb-1">Item Type</label>
                <SearchableDropdown onSelect={handleItemTypeSelect} options={itemTypeOptions} />
              </div>
              <div>
                <label className="block font-semibold mb-1">Material</label>
                <SearchableDropdown onSelect={handleMaterialSelect} options={materialOptions} />
              </div>
              <div>
                <label className="block font-semibold mb-1">Color</label>
                <input
                  type="text"
                  placeholder="Enter color"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Suitable for Weather</label>
                <SearchableDropdown onSelect={handleWeatherSelect} options={weatherOptions} value={suitableWeather} />
              </div>
              <div>
                <label className="block font-semibold mb-1">Fit</label>
                <SearchableDropdown onSelect={handleFitSelect} options={fitOptions} />
              </div>
              <div>
                <label className="block font-semibold mb-1">Formality</label>
                <SearchableDropdown onSelect={handleFormalitySelect} options={formalityOptions} value={formality} />
              </div>
              <div>
                <label className="block font-semibold mb-1">Pattern</label>
                <SearchableDropdown onSelect={handlePatternSelect} options={patternsOptions} />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button
                type="submit"
                className="w-full py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition transform hover:scale-105"
              >
                Add Item
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
