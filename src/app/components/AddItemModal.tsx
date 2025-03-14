"use client";

import { useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { addClothingItem } from "../services/wardrobeService";
import { X } from "lucide-react";
import SearchableDropdown from "./SearchableDropdown";

type ItemModalProps = {
  modalOpen: boolean;
  setModalOpen: (open: boolean) => void;
};

const itemTypeOptions = {
    tops: [
        "blouse",
        "cardigan",
        "cut off shirt",
        "jersey",
        "long sleeve t-shirt",
        "polo shirt",
        "shirt",
        "short sleeve t-shirt",
        "sweater",
        "sweatshirt",
        "tank top",
    ],
    bottoms: [
        "chinos",
        "courderoys",
        "jeans",
        "pants",
        "shorts",
        "suit pants",
        "sweatpants",
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
        "bomber",
        "overcoat",
        "puffer jacket",
        "trenchcoat",
        "suit jacket",
    ],
  };
  
  const materialOptions = {
    cold: [
        "cashmere",
        "courderoy",
        "flanel",
        "fleece",
        "vicuña",
        "wool",
    ],
    hot: [
        "linen",
    ],
    all: [
        "cotton",
        "silk",
        "synthetic",
    ],
    non_rain: [
        "leather",
        "suede",
    ],
  };

const weatherOptions = {
    cold: ["cold", "very cold"],
    moderate: ["moderate", "all", "no rain"],
    hot: ["hot", "very hot"],
    rainy: ["rainy", "drizzly"],
};

export default function AddItemModal({ modalOpen, setModalOpen }: ItemModalProps) {
    // States for dropdown selections
    const [itemType, setItemType] = useState("");
    const [subType, setSubType] = useState("");
    const [material, setMaterial] = useState("");
    const [suitableWeather, setSuitableWeather] = useState("");

    // Other text fields
    const [color, setColor] = useState("");
    const [formality, setFormality] = useState("");
    const [pattern, setPattern] = useState("");
    const [fit, setFit] = useState("");
    const [suitableOccasion, setSuitableOccasion] = useState("");
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    // Handler for item type dropdown
    const handleItemTypeSelect = (group: string, option: string) => {
        setItemType(group);
        setSubType(option);
    };

    // Handler for material dropdown.
    const handleMaterialSelect = (group: string, option: string) => {
        setMaterial(option);
        setSuitableWeather(group)
    };

    // Handler for weather dropdown.
    const handleWeatherSelect = (group: string, option: string) => {
        setSuitableWeather(option);
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

    if (!modalOpen) return null;

    return (
        <div
            className="fixed inset-0 flex items-center justify-center bg-black z-50"
            style={{ backgroundColor: "rgba(17, 24, 39, 0.5)" }}
            onClick={() => setModalOpen(false)}
        >
            <div
                className="relative bg-white p-6 rounded shadow-lg max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={() => setModalOpen(false)}
                    className="absolute top-2 right-2 p-1 rounded hover:bg-gray-200"
                >
                    <X className="w-5 h-5 text-gray-600" />
                </button>
                <h1 className="text-2xl font-bold mb-4">Add Item</h1>
                <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                    {/* Dropdown for item type */}
                    <div>
                        <label className="block font-bold mb-1">Item Type</label>
                        <SearchableDropdown onSelect={handleItemTypeSelect} options={itemTypeOptions} />
                    </div>
                    {/* Dropdown for material */}
                    <div>
                        <label className="block font-bold mb-1">Material</label>
                        <SearchableDropdown onSelect={handleMaterialSelect} options={materialOptions} />
                    </div>
                    {/* Dropdown for weather type, controlled by suitableWeather state */}
                    <div>
                        <label className="block font-bold mb-1">Suitable for Weather</label>
                        <SearchableDropdown onSelect={handleWeatherSelect} options={weatherOptions} value={suitableWeather} />
                    </div>
                    {/* Other fields */}
                    <input
                        type="text"
                        placeholder="Color"
                        className="p-2 border rounded"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Formality"
                        className="p-2 border rounded"
                        value={formality}
                        onChange={(e) => setFormality(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Pattern"
                        className="p-2 border rounded"
                        value={pattern}
                        onChange={(e) => setPattern(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Fit"
                        className="p-2 border rounded"
                        value={fit}
                        onChange={(e) => setFit(e.target.value)}
                    />
                    {error && <p className="text-red-500">{error}</p>}
                    <button type="submit" className="p-2 bg-blue-500 text-white rounded">
                        Add item
                    </button>
                </form>
            </div>
        </div>
    );
}
