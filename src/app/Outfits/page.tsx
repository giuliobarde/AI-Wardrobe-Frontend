"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { addSavedOutfit } from "@/app/services/outfitServices";
import { useRouter } from "next/navigation";
import CreateOutfit from "../components/CreateOutfit";
import { generateChatOutfit } from "../services/openAIServices";
import OutfitCard from "../components/OutfitCard";
import ItemCard from "../components/ItemCard";
import { 
  Loader2, Plus, Save, Search, Star, 
  Sparkles, ThumbsUp, ThumbsDown, RefreshCw, 
  Heart, Share2, Filter, Sliders
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Define interfaces for type safety
interface OutfitItem {
  id: string;
  item_type?: string;
}

interface Outfit {
  outfit_items: OutfitItem[];
  occasion: string;
  description: string;
}

// SVG component types
interface IconProps {
  className?: string;
}

const Check: React.FC<IconProps> = ({ className }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  );
};

const CheckCircle: React.FC<IconProps> = ({ className }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  );
};

export default function OutfitsPage() {
  const [occasion, setOccasion] = useState<string>("");
  const [outfit, setOutfit] = useState<Outfit | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [showCreateOutfitModal, setShowCreateOutfitModal] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("generate");
  const [refreshOutfits, setRefreshOutfits] = useState<number>(0);
  const [suggestions, setSuggestions] = useState<string[]>([
    "Beach day", "Date night", "Job interview", "Wedding guest", "Casual Friday", "Gym workout"
  ]);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [animateGenerate, setAnimateGenerate] = useState<boolean>(false);
  const { user } = useAuth();
  const router = useRouter();

  const handleSuggestionClick = (suggestion: string) => {
    setOccasion(suggestion);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setOutfit(null);
    setError("");
    setAnimateGenerate(true);

    if (!user?.access_token) {
      setError("Access token not found. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      // Simulate a slight delay to make the loading effect more noticeable
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
    const outfitItems = outfit.outfit_items.map((item: OutfitItem) => ({
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
        setRefreshOutfits((prev) => prev + 1);
        setError("");
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Failed to save generated outfit:", err);
      setError("Failed to save outfit.");
    }
  };

  const handleOutfitAdded = () => {
    setRefreshOutfits((prev) => prev + 1);
    setActiveTab("saved");
  };

  const regenerateOutfit = async () => {
    if (!occasion) {
      setError("Please enter an occasion first");
      return;
    }
    setLoading(true);
    setOutfit(null);
    setError("");

    try {
      const data = await generateChatOutfit(user?.access_token || "", occasion);
      setOutfit(data.response);
    } catch (err) {
      console.error(err);
      setError("Failed to regenerate outfit.");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (animateGenerate) {
      const timer = setTimeout(() => {
        setAnimateGenerate(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [animateGenerate]);

  return (
    <div className="container mx-auto px-4 py-16 max-w-6xl">
      {/* Page Tabs */}
      <div className="mb-8 border-b border-gray-200">
        <div className="flex space-x-8">
          <button
            className={`py-4 px-1 font-medium text-lg transition-colors relative ${
              activeTab === "generate"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-800"
            }`}
            onClick={() => setActiveTab("generate")}
          >
            Generate Outfit
            {activeTab === "generate" && (
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                layoutId="activeTab"
              />
            )}
          </button>
          <button
            className={`py-4 px-1 font-medium text-lg transition-colors relative ${
              activeTab === "saved"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-800"
            }`}
            onClick={() => setActiveTab("saved")}
          >
            Saved Outfits
            {activeTab === "saved" && (
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                layoutId="activeTab"
              />
            )}
          </button>
        </div>
      </div>

      {/* Generate Outfit Tab */}
      {activeTab === "generate" && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Generator Form */}
          <div className="bg-white shadow-md rounded-lg p-6 border border-gray-100 overflow-hidden">
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent relative">
                Outfit Recommendations
                <motion.div
                  className="absolute -right-4 -top-4"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="h-6 w-6 text-yellow-400" />
                </motion.div>
              </h1>
            </motion.div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Enter occasion (e.g., wedding, beach day, work meeting)..."
                  value={occasion}
                  onChange={(e) => setOccasion(e.target.value)}
                  className="pl-10 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required
                />
              </div>
              
              {/* Quick suggestions */}
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSuggestionClick(suggestion)}
                    type="button"
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full transition"
                  >
                    {suggestion}
                  </motion.button>
                ))}
              </div>
              
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-3 ${
                  animateGenerate 
                    ? "bg-gradient-to-r from-purple-500 to-pink-500" 
                    : "bg-gradient-to-r from-blue-500 to-blue-700"
                } text-white rounded-lg font-semibold hover:shadow-lg disabled:opacity-70 transition`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Creating your perfect outfit...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generate Outfit
                  </span>
                )}
              </motion.button>
            </form>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md"
              >
                {error}
              </motion.div>
            )}
          </div>

          {/* Generated Outfit Display */}
          <AnimatePresence>
            {outfit && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-100"
              >
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                      Your <span className="mx-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">{outfit.occasion}</span> Outfit
                    </h2>
                    <div className="flex space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={regenerateOutfit}
                        className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-blue-50 transition"
                        title="Generate another outfit"
                      >
                        <RefreshCw className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-lg mb-6 border-l-4 border-blue-400">
                    <p className="text-gray-700 italic">{outfit.description}</p>
                  </div>
                  
                  {/* Save button and feedback */}
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 text-gray-500 hover:text-green-600 rounded-full hover:bg-green-50 transition"
                      >
                        <ThumbsUp className="w-5 h-5" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-50 transition"
                      >
                        <ThumbsDown className="w-5 h-5" />
                      </motion.button>
                    </div>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={saveGeneratedOutfit}
                      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-sm"
                    >
                      {saveSuccess ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Saved!
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Outfit
                        </>
                      )}
                    </motion.button>
                  </div>

                  {/* Items grid */}
                  {outfit.outfit_items && outfit.outfit_items.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3 text-gray-700 flex items-center">
                        <Sliders className="w-4 h-4 mr-2" />
                        Items in this outfit:
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {outfit.outfit_items.map((item: OutfitItem, index: number) => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                          >
                            <ItemCard itemId={item.id} />
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Loading state */}
          <AnimatePresence>
            {loading && !outfit && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center py-12"
              >
                <div className="relative">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full"
                  />
                  <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-blue-600" />
                </div>
                <p className="mt-4 text-gray-600 animate-pulse">Crafting the perfect outfit for you...</p>
                <div className="mt-2 max-w-md text-center">
                  <p className="text-sm text-gray-500">Our AI is considering your occasion, current trends, and styling best practices.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Saved Outfits Tab */}
      {activeTab === "saved" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <Heart className="w-5 h-5 mr-2 text-red-500" />
              Your Saved Outfits
            </h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateOutfitModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Outfit
            </motion.button>
          </div>
          
          {/* Filter options */}
          <div className="flex flex-wrap gap-2 items-center p-4 bg-gray-50 rounded-lg">
            <Filter className="w-4 h-4 text-gray-500 mr-2" />
            <span className="text-sm font-medium text-gray-700">Filter by:</span>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-3 py-1 text-sm bg-white border border-gray-200 hover:bg-gray-100 text-gray-800 rounded-full transition"
            >
              All
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-3 py-1 text-sm bg-white border border-gray-200 hover:bg-gray-100 text-gray-800 rounded-full transition"
            >
              Favorites
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-3 py-1 text-sm bg-white border border-gray-200 hover:bg-gray-100 text-gray-800 rounded-full transition"
            >
              Recent
            </motion.button>
          </div>
          
          {/* Outfit cards with animation */}
          <OutfitCard refresh={refreshOutfits} />
          
          {/* Empty state */}
          {!user && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center py-10"
            >
              <motion.div 
                className="mb-4"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
              >
                <Star className="w-12 h-12 mx-auto text-gray-300" />
              </motion.div>
              <h3 className="text-xl font-medium text-gray-700 mb-2">Log in to view your saved outfits</h3>
              <p className="text-gray-500">Your outfit collection will appear here.</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/login")}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm"
              >
                Log In
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Create Outfit Modal */}
      <CreateOutfit 
        show={showCreateOutfitModal} 
        onClose={() => setShowCreateOutfitModal(false)} 
        onOutfitAdded={handleOutfitAdded}
      />
      
      {/* Toast notification for success */}
      <AnimatePresence>
        {saveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-6 right-6 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2"
          >
            <CheckCircle className="w-5 h-5" />
            <span>Outfit saved successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}