"use client";

import { useState, useRef } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { addClothingItem } from "../services/wardrobeService";
import { X, Plus } from "lucide-react";
import SearchableDropdown from "./SearchableDropdown";
import { AnimatePresence, motion } from "motion/react";
import { useOutsideClick } from "../hooks/use-outside-click";

type AddItemProps = {};

const itemTypeOptions: Record<"tops" | "bottoms" | "shoes" | "outerware", string[]> = {
  tops: [
    "blouse",
    "button-down shirt",
    "button-up shirt",
    "cardigan",
    "crewneck sweater",
    "hoodie",
    "jersey",
    "long sleeve t-shirt",
    "polo shirt",
    "shirt",
    "sweatshirt",
    "sweater",
    "tank top",
    "t-shirt",
    "turtleneck",
    "tuxedo shirt",
  ].sort(),
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
  ].sort(),
  shoes: [
    "boots",
    "dress shoes",
    "heels",
    "loafers",
    "running shoes",
    "sandals",
    "sneakers",
  ].sort(),
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
  ].sort(),
};

const materialOptions: Record<"cold" | "hot" | "all" | "non_rain", string[]> = {
  cold: ["cashmere", "courderoy", "fleece", "flanel", "vicuña", "wool"].sort(),
  hot: ["linen"],
  all: ["cotton", "silk", "synthetic", "virgin wool"].sort(),
  non_rain: ["leather", "patent leather", "suede"].sort(),
};

const weatherOptions: Record<"cold" | "moderate" | "hot" | "rainy", string[]> = {
  cold: ["cold", "very cold"].sort(),
  moderate: ["all", "moderate", "no rain"].sort(),
  hot: ["hot", "very hot"].sort(),
  rainy: ["drizzly", "rainy"].sort(),
};

const fitOptions: Record<"very_formal" | "formal" | "somewhat_formal" | "not_formal", string[]> = {
  very_formal: ["tailored fit"],
  formal: ["fit", "slim"].sort(),
  somewhat_formal: ["regular"],
  not_formal: ["baggy", "skinny"].sort(),
};

const formalityOptions: Record<"formalities", string[]> = {
  formalities: ["formal", "not formal", "somewhat formal", "very formal"].sort(),
};

const patternsOptions: Record<"patterns", string[]> = {
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
  ].sort(),
};

export default function AddItem(props: AddItemProps) {
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  useOutsideClick(modalRef, () => setModalOpen(false));

  // Dropdown states
  const [itemType, setItemType] = useState("");
  const [subType, setSubType] = useState("");
  const [material, setMaterial] = useState("");
  const [suitableWeather, setSuitableWeather] = useState("");
  const [fit, setFit] = useState("");
  const [formality, setFormality] = useState("");

  // Other fields
  const [color, setColor] = useState("");
  const [pattern, setPattern] = useState("");
  const [suitableOccasion, setSuitableOccasion] = useState("");
  const [error, setError] = useState<string | null>(null);

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
    setSuitableWeather(option);
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

  const closeModal = () => {
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
  }

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
      closeModal()
      window.location.reload();
    } catch (err) {
      setError("Failed to add item");
      console.error(err);
    }
  };

  return (
    <>
      {/* Plus Icon Button */}
      <div
        onClick={() => setModalOpen(true)}
        className="min-w-[150px] h-40 flex items-center justify-center bg-white border border-gray-300 rounded-lg shadow-md cursor-pointer hover:bg-gray-100"
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
            className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
            onClick={() => {closeModal(), setError(null)}}
          >
            <motion.div
              ref={modalRef}
              className="relative bg-white rounded-xl shadow-xl max-w-lg w-full p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => {closeModal(), setError(null)}}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-200 transition"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
              <h1 className="text-2xl font-bold mb-4 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
                Add New Item
              </h1>
              <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-2">
                <div className="col-span-2">
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
                {error && (
                  <div className="col-span-2">
                    <p className="text-red-500 text-sm">{error}</p>
                  </div>
                )}
                <div className="col-span-2">
                  <button
                    type="submit"
                    className="w-full py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition transform hover:scale-105"
                  >
                    Add Item
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
