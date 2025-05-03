"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { generateChatOutfit } from "@/app/services/openAIServices";
import { addSavedOutfit } from "@/app/services/outfitServices";
import { useOutfit, OutfitProvider } from "../context/OutfitContext";
import CreateOutfit from "../components/CreateOutfit";
import OutfitCard from "../components/OutfitCard";
import ItemCard from "../components/ItemCard";
import {
  Loader2,
  Plus,
  Search,
  Star,
  Sparkles,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  Heart,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface OutfitItem {
  id: string;
  item_type?: string;
}

interface GeneratedOutfit {
  outfit_items: OutfitItem[];
  occasion: string;
  description: string;
}

function OutfitsPageContent() {
  const { user } = useAuth();
  const router = useRouter();
  const { fetchOutfits } = useOutfit();

  const [activeTab, setActiveTab] = useState<"generate" | "saved">("generate");
  const [occasion, setOccasion] = useState("");
  const [generated, setGenerated] = useState<GeneratedOutfit | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [animateGen, setAnimateGen] = useState(false);

  const suggestions = [
    "Beach day",
    "Date night",
    "Job interview",
    "Wedding guest",
    "Casual Friday",
    "Gym workout",
  ];

  // On mount, pick up URL hash
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash.replace("#", "");
      if (hash === "saved" || hash === "generate") {
        setActiveTab(hash as "generate" | "saved");
      }
    }
  }, []);

  // Animate the generate button
  useEffect(() => {
    if (!animateGen) return;
    const t = setTimeout(() => setAnimateGen(false), 2000);
    return () => clearTimeout(t);
  }, [animateGen]);

  const selectTab = (tab: "generate" | "saved") => {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      window.location.hash = tab;
    }
  };

  const dismissError = () => setError(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setAnimateGen(true);
    setLoading(true);

    if (!user?.access_token) {
      setError("Please log in again.");
      setLoading(false);
      return;
    }

    try {
      const { response } = await generateChatOutfit(
        user.access_token,
        occasion
      );
      setGenerated(response);
    } catch {
      setError("Failed to generate outfit.");
    } finally {
      setLoading(false);
    }
  };

  const saveGenerated = async () => {
    if (!generated?.outfit_items.length) {
      setError("No outfit to save.");
      return;
    }
    if (!user?.access_token) {
      setError("Please log in again.");
      return;
    }

    const items = generated.outfit_items.map((it) => ({
      id: it.id,
      type: it.item_type || "unknown",
    }));

    try {
      await addSavedOutfit(
        {
          user_id: user.user_id,
          items,
          occasion: generated.occasion,
          favorite: false,
        },
        user.access_token
      );
      // Refresh the saved outfits list
      await fetchOutfits();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      setError("Failed to save outfit.");
    }
  };

  const regenerate = async () => {
    if (!occasion) {
      setError("Please enter an occasion first.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const { response } = await generateChatOutfit(
        user?.access_token!,
        occasion
      );
      setGenerated(response);
    } catch {
      setError("Failed to regenerate outfit.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 max-w-6xl">
      {/* Tabs */}
      <div className="mb-8 border-b border-gray-200">
        <div className="flex space-x-8">
          <button
            onClick={() => selectTab("generate")}
            className={`py-4 px-1 font-medium text-lg relative ${
              activeTab === "generate"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            Generate Outfit
            {activeTab === "generate" && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
              />
            )}
          </button>
          <button
            onClick={() => selectTab("saved")}
            className={`py-4 px-1 font-medium text-lg relative ${
              activeTab === "saved"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            Saved Outfits
            {activeTab === "saved" && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
              />
            )}
          </button>
        </div>
      </div>

      {/* Generate Tab */}
      {activeTab === "generate" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          <div className="bg-white shadow-md rounded-lg p-6 border border-gray-100">
            <h1 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Outfit Recommendations
            </h1>
            <form onSubmit={handleGenerate} className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Enter occasion..."
                  value={occasion}
                  onChange={(e) => setOccasion(e.target.value)}
                  className="pl-10 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  required
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setOccasion(s)}
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition"
                  >
                    {s}
                  </button>
                ))}
              </div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 ${
                  animateGen
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
              </button>
            </form>
            {error && <p className="mt-4 text-red-600 text-center">{error}</p>}
          </div>

          <AnimatePresence>
            {generated && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="bg-white shadow-md rounded-lg p-6 border border-gray-100"
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm mr-2">
                      {generated.occasion}
                    </span>
                    Outfit
                  </h2>
                  <button
                    onClick={regenerate}
                    className="p-2 text-gray-500 hover:text-blue-600 transition"
                  >
                    <RefreshCw />
                  </button>
                </div>
                <p className="italic text-gray-700 mb-6">
                  {generated.description}
                </p>
                <div className="flex justify-between items-center mb-6">
                  <div className="flex space-x-2">
                    <button className="p-2 hover:bg-green-50 rounded-full">
                      <ThumbsUp />
                    </button>
                    <button className="p-2 hover:bg-red-50 rounded-full">
                      <ThumbsDown />
                    </button>
                  </div>
                  <button
                    onClick={saveGenerated}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    {saveSuccess ? "✔ Saved!" : "Save Outfit"}
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {generated.outfit_items.map((it) => (
                    <ItemCard key={it.id} itemId={it.id} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Saved Tab */}
      {activeTab === "saved" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <Heart className="mr-2 text-red-500" />
              Your Saved Outfits
            </h2>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Plus className="mr-2" /> Create New
            </button>
          </div>

          <OutfitCard />

          {!user && (
            <div className="text-center py-10">
              <Star className="mx-auto text-gray-300 w-12 h-12 mb-4" />
              <p className="text-gray-700 mb-2">Log in to view saved outfits</p>
              <button
                onClick={() => router.push("/login")}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Log In
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* Create Outfit Modal */}
      <CreateOutfit
        show={showCreate}
        onClose={() => setShowCreate(false)}
        onOutfitAdded={() => {
          setShowCreate(false);
          selectTab("saved");
          // only fetch when a new outfit is added
          fetchOutfits();
        }}
      />

      {saveSuccess && (
        <div className="fixed bottom-6 right-6 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg">
          Outfit saved successfully!
        </div>
      )}
    </div>
  );
}

export default function OutfitsPage() {
  return (
    <OutfitProvider>
      <OutfitsPageContent />
    </OutfitProvider>
  );
}
