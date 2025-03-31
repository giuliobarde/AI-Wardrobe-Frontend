"use client";

import { useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import ItemCard from "../components/ItemCard";

export default function OutfitsPage() {
  const [occasion, setOccasion] = useState("");
  const [outfit, setOutfit] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setOutfit(null);
    setError("");

    try {
      const response = await fetch("http://localhost:8000/chat/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user?.access_token}`,
        },
        body: JSON.stringify({ user_message: occasion, temp: "20C" }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      // Assuming the backend returns an object with keys: occasion, outfit_items, description.
      setOutfit(data.response);
    } catch (err: any) {
      console.error(err);
      setError("Failed to generate outfit.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4">
      <div className="w-full max-w-md mt-20">
        <div className="bg-white shadow-lg rounded-xl p-6">
          <h1 className="text-4xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
            Outfit Recommendations
          </h1>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Enter occasion..."
              value={occasion}
              onChange={(e) => setOccasion(e.target.value)}
              className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition transform hover:scale-105"
            >
              {loading ? "Generating..." : "Generate Outfit"}
            </button>
          </form>
          {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
        </div>
      </div>

      {outfit && (
        <div className="w-full max-w-3xl mt-10">
          <div className="bg-white shadow-lg rounded-xl p-8">
            <h2 className="text-2xl font-bold mb-4 text-center">
              Your Outfit Recommendation
            </h2>
            <div className="mb-6 text-gray-800 space-y-3">
              <p>
                <span className="font-semibold">Occasion:</span> {outfit.occasion}
              </p>
              <p>
                <span className="font-semibold">Description:</span>{" "}
                {outfit.description}
              </p>
              {outfit.outfit_items && (
                <div>
                  <h3 className="text-xl font-semibold mb-2">Selected Items:</h3>
                  <ul className="space-y-1">
                    {outfit.outfit_items.map((item: any, index: number) => (
                      <li key={index} className="text-gray-700">
                        <span className="font-medium">{item.sub_type}</span>{" "}
                        - {item.color}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {outfit.outfit_items && outfit.outfit_items.length > 0 && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-4 text-center">
                Outfit Items
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {outfit.outfit_items.map((item: any) => (
                  <ItemCard key={item.id} itemId={item.id} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
