"use client";

import { useState } from "react";

export default function OutfitsPage() {
  const [occasion, setOccasion] = useState("");
  const [outfit, setOutfit] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setOutfit("");
    setError("");

    try {
      const response = await fetch("http://localhost:8000/chat/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Send the occasion and fixed temperature (20C)
        body: JSON.stringify({ user_message: occasion, temp: "20C" }),
      });

      if (!response.ok || !response.body) {
        throw new Error("Network response was not ok");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let done = false;
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunk = decoder.decode(value, { stream: !done });
          setOutfit((prev) => prev + chunk);
        }
      }
    } catch (err) {
      console.error(err);
      setError("Failed to generate outfit.");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-4">Outfit Recommendations</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-md flex flex-col gap-4">
        <input
          type="text"
          placeholder="Enter occasion..."
          value={occasion}
          onChange={(e) => setOccasion(e.target.value)}
          className="p-2 border border-gray-300 rounded"
          required
        />
        <button
          type="submit"
          className="bg-blue-500 text-white py-2 rounded"
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate Outfit"}
        </button>
      </form>
      {error && <p className="text-red-500 mt-4">{error}</p>}
      <div className="mt-6 p-4 bg-white border border-gray-200 rounded shadow w-full max-w-md">
        <h2 className="text-xl font-bold mb-2">Outfit Recommendation:</h2>
        <p className="whitespace-pre-wrap">{outfit}</p>
      </div>
    </div>
  );
}
