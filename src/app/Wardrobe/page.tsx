"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { addClothingItem } from "../services/wardrobeService";

export default function Wardrobe() {
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
  const router = useRouter();

  useEffect(() => {
    if (!user?.access_token) {
      router.push("/Login");
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // <-- Make sure to call preventDefault()
    setError(null);

    if (!user?.access_token) {
      setError("User authentication failed. Please log in again.");
      return;
    }

    // Build an item payload that includes the current user's ID.
    const itemData = {
      user_id: user.user_id,  // Ensure you send the user ID
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
      // Reset form fields after successful submission
      setItemType("");
      setMaterial("");
      setColor("");
      setFormality("");
      setPattern("");
      setFit("");
      setSuitableWeather("");
      setSuitableOccasion("");
    } catch (err) {
      setError("Failed to add item");
      console.error(err);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      {user ? (
        <div className="py-30">
          <div className="max-w-md mx-auto p-4 border rounded shadow">
            <form onSubmit={handleSubmit} className="flex flex-col gap-2">
              <h1 className="text-2xl font-bold">Add Item</h1>
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
      ) : (
        <p className="text-lg">Redirecting to Login...</p>
      )}
    </div>
  );
}
