"use client";

import { useState } from "react";
import { useAuth } from "@/app/context/AuthContext";

export default function OutfitsPage() {
  const [occasion, setOccasion] = useState("");
  const [outfit, setOutfit] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setOutfit("");
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
      setOutfit(data.response);
    } catch (err: any) {
      console.error(err);
      setError("Failed to generate outfit.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
        Outfit Recommendations
      </h1>
      <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-6">
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
      {outfit && (
        <div className="mt-8 w-full max-w-md bg-white shadow-lg rounded-xl p-6">
          <h2 className="text-2xl font-bold mb-4">Outfit Recommendation</h2>
          <p className="whitespace-pre-wrap text-gray-800">{outfit}</p>
        </div>
      )}
    </div>
  );
}
