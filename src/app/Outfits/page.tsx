"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import ItemCard from "../components/ItemCard";
import { addSavedOutfit, getSavedOutfits } from "@/app/services/outfitServices";
import { useRouter } from "next/navigation";
import CreateOutfit from "../components/CreateOutfit";


export default function OutfitsPage() {
  const [occasion, setOccasion] = useState("");
  const [outfit, setOutfit] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCreateOutfitModal, setShowCreateOutfitModal] = useState(false);
  const [savedOutfits, setSavedOutfits] = useState<any[]>([]);
  const { user } = useAuth();
  const router = useRouter();

  // Function to fetch saved outfits
  const fetchSavedOutfits = async () => {
    if (user?.access_token) {
      try {
        const outfits = await getSavedOutfits(user.access_token);
        setSavedOutfits(outfits);
      } catch (err) {
        console.error("Failed to fetch saved outfits:", err);
      }
    }
  };

  useEffect(() => {
    // Fetch saved outfits when the component mounts
    fetchSavedOutfits();
  }, [user]);

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
      setOutfit(data.response);
    } catch (err: any) {
      console.error(err);
      setError("Failed to generate outfit.");
    }
    setLoading(false);
  };

  const saveGeneratedOutfit = async () => {
    if (!outfit || !outfit.outfit_items || outfit.outfit_items.length === 0) {
      setError("No outfit to save");
      return;
    }

    const outfitItems = outfit.outfit_items.map((item: any) => ({
      id: item.id,
      type: item.item_type || "unknown"
    }));
    
    const outfitData = {
      user_id: user?.user_id,
      items: outfitItems,
      occasion: outfit.occasion || "General",
      favourite: false
    };
    
    try {
      if (user?.access_token) {
        await addSavedOutfit(outfitData, user.access_token);
        // Refresh saved outfits list after saving
        fetchSavedOutfits();
      }
    } catch (err) {
      console.error("Failed to save generated outfit:", err);
      setError("Failed to save outfit.");
    }
  };

  const handleOutfitAdded = () => {
    // Refresh the saved outfits list when a new outfit is added
    fetchSavedOutfits();
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
                <span className="font-semibold">Description:</span> {outfit.description}
              </p>
              {outfit.outfit_items && (
                <div>
                  <h3 className="text-xl font-semibold mb-2">Selected Items:</h3>
                  <ul className="space-y-1">
                    {outfit.outfit_items.map((item: any, index: number) => (
                      <li key={index} className="text-gray-700">
                        <span className="font-medium">{item.sub_type}</span> - {item.color}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <div className="flex justify-center mt-4">
              <button
                onClick={saveGeneratedOutfit}
                className="px-6 py-2 bg-green-600 text-white rounded-full font-semibold hover:bg-green-700 transition"
              >
                Save This Outfit
              </button>
            </div>
          </div>

          {outfit.outfit_items && outfit.outfit_items.length > 0 && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-4 text-center">Outfit Items</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {outfit.outfit_items.map((item: any) => (
                  <ItemCard key={item.id} itemId={item.id} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Saved Outfits Section */}
      {savedOutfits.length > 0 && (
        <div className="w-full max-w-3xl mt-10">
          <h2 className="text-2xl font-bold mb-4 text-center">Your Saved Outfits</h2>
          <div className="grid grid-cols-1 gap-4">
            {savedOutfits.map((savedOutfit, index) => (
              <div key={index} className="bg-white shadow-md rounded-lg p-4">
                <h3 className="text-xl font-semibold">{savedOutfit.occasion}</h3>
                <div className="mt-2">
                  <p className="text-gray-700">
                    {savedOutfit.items.length} items • {savedOutfit.favourite ? "★ Favorite" : "Not favorite"}
                  </p>
                </div>
                {/* You could add a button to view full outfit details here */}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Button to open the "Create New Outfit" modal */}
      <div className="mt-10 mb-10">
        <button
          onClick={() => setShowCreateOutfitModal(true)}
          className="px-6 py-3 bg-green-600 text-white rounded-full font-semibold hover:bg-green-700 transition transform hover:scale-105"
        >
          Create New Outfit
        </button>
      </div>

      {/* Render the CreateOutfit Modal */}
      <CreateOutfit 
        show={showCreateOutfitModal} 
        onClose={() => setShowCreateOutfitModal(false)} 
        onOutfitAdded={handleOutfitAdded}
      />
    </div>
  );
}