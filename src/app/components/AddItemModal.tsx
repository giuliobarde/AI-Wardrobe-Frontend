"use client";

import { useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { addClothingItem } from "../services/wardrobeService";
import { X } from "lucide-react";

type ItemModalProps = {
    modalOpen: boolean;
    setModalOpen: (open: boolean) => void;
};

export default function ItemModal({ modalOpen, setModalOpen }: ItemModalProps) {
    const [itemType, setItemType] = useState("");
    const [material, setMaterial] = useState("");
    const [color, setColor] = useState("");
    const [formality, setFormality] = useState("");
    const [pattern, setPattern] = useState("");
    const [fit, setFit] = useState("");
    const [suitableWeather, setSuitableWeather] = useState("");
    const [suitableOccasion, setSuitableOccasion] = useState("");
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!user?.access_token) {
            setError("User authentication failed. Please log in again.");
            return;
        }

        const itemData = {
            user_id: user.user_id,
            item_type: itemType,
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
            setItemType("");
            setMaterial("");
            setColor("");
            setFormality("");
            setPattern("");
            setFit("");
            setSuitableWeather("");
            setSuitableOccasion("");
            setModalOpen(false);
        } catch (err) {
            setError("Failed to add item");
            console.error(err);
        }
    };

    if (!modalOpen) return null;

    return (
        <div
            className="fixed inset-0 flex items-center justify-center bg-black z-50"
            style={{ backgroundColor: "rgba(17, 24, 39, 0.5)" }} // temporary till bg-opacity fix
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
                    <input
                        type="text"
                        placeholder="Item Type"
                        className="p-2 border rounded"
                        value={itemType}
                        onChange={(e) => setItemType(e.target.value)}
                        required
                    />
                    <input
                        type="text"
                        placeholder="Material"
                        className="p-2 border rounded"
                        value={material}
                        onChange={(e) => setMaterial(e.target.value)}
                        required
                    />
                    <input
                        type="text"
                        placeholder="Color"
                        className="p-2 border rounded"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        required
                    />
                    <input
                        type="text"
                        placeholder="Formality"
                        className="p-2 border rounded"
                        value={formality}
                        onChange={(e) => setFormality(e.target.value)}
                        required
                    />
                    <input
                        type="text"
                        placeholder="Pattern"
                        className="p-2 border rounded"
                        value={pattern}
                        onChange={(e) => setPattern(e.target.value)}
                        required
                    />
                    <input
                        type="text"
                        placeholder="Fit"
                        className="p-2 border rounded"
                        value={fit}
                        onChange={(e) => setFit(e.target.value)}
                        required
                    />
                    <input
                        type="text"
                        placeholder="Suitable for Weather"
                        className="p-2 border rounded"
                        value={suitableWeather}
                        onChange={(e) => setSuitableWeather(e.target.value)}
                        required
                    />
                    <input
                        type="text"
                        placeholder="Suitable for Occasion"
                        className="p-2 border rounded"
                        value={suitableOccasion}
                        onChange={(e) => setSuitableOccasion(e.target.value)}
                        required
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
