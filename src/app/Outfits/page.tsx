"use client";

import { useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { addSavedOutfit } from "@/app/services/outfitServices";
import { useRouter } from "next/navigation";
import CreateOutfit from "../components/CreateOutfit";
import { generateChatOutfit } from "../services/openAIServices";
import OutfitCard from "../components/OutfitCard";
import ItemCard from "../components/ItemCard";
import { Loader2 } from "lucide-react";

export default function OutfitsPage() {
  const [occasion, setOccasion] = useState("");
  const [outfit, setOutfit] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCreateOutfitModal, setShowCreateOutfitModal] = useState(false);
  // Use a refresh counter to force re-fetching saved outfits in OutfitCard
  const [refreshOutfits, setRefreshOutfits] = useState(0);
  const { user } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setOutfit(null);
    setError("");

    if (!user?.access_token) {
      setError("Access token not found. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      const data = await generateChatOutfit(user.access_token, occasion);
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

    // Prepare the outfit items based on the response structure
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
        // Trigger a refresh for the saved outfits display
        setRefreshOutfits((prev) => prev + 1);
      }
    } catch (err) {
      console.error("Failed to save generated outfit:", err);
      setError("Failed to save outfit.");
    }
  };

  // Called when a new outfit is added via the CreateOutfit modal
  const handleOutfitAdded = () => {
    setRefreshOutfits((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4">
      {/* Outfit Generation Section */}
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
              {loading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating...
                </span>
              ) : "Generate Outfit"}
            </button>
          </form>
          {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
        </div>
      </div>

      {/* Generated Outfit Display */}
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

      {/* Saved Outfits Section Using the OutfitCard Component */}
      <div className="w-full max-w-3xl mt-10">
        <h2 className="text-2xl font-bold mb-4 text-center">Your Saved Outfits</h2>
        <OutfitCard refresh={refreshOutfits} />
      </div>

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
