"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useWeather } from "@/app/context/WeatherContext";
import { generateChatOutfit } from "@/app/services/openAIServices";
import { addSavedOutfit } from "@/app/services/outfitServices";
import { useOutfit } from "../../context/OutfitContext";
import ItemCard from "../ItemCard";
import ErrorModal from "../ErrorModal";
import {
  Loader2,
  Search,
  Sparkles,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
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

const GenerateOutfitTab = () => {
  const { user } = useAuth();
  const { weatherData } = useWeather();
  const { fetchOutfits } = useOutfit();

  const [occasion, setOccasion] = useState("");
  const [generated, setGenerated] = useState<GeneratedOutfit | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [animateGen, setAnimateGen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorModalMessage, setErrorModalMessage] = useState("");

  const suggestions = [
    "Beach day",
    "Date night",
    "Job interview",
    "Wedding guest",
    "Casual Friday",
    "Gym workout",
  ];

  // Animate the generate button
  useEffect(() => {
    if (!animateGen) return;
    const t = setTimeout(() => setAnimateGen(false), 2000);
    return () => clearTimeout(t);
  }, [animateGen]);

  const showErrorModal = (message: string) => {
    setErrorModalMessage(message);
    setIsErrorModalOpen(true);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setAnimateGen(true);
    setLoading(true);

    if (!user?.access_token) {
      showErrorModal("Please log in again.");
      setLoading(false);
      return;
    }

    if (!weatherData) {
      showErrorModal("Weather data is not available. Please try again in a moment.");
      setLoading(false);
      return;
    }

    try {
      const { response } = await generateChatOutfit(
        user.access_token,
        occasion,
        weatherData
      );
      setGenerated(response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to generate outfit.";
      showErrorModal(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const saveGenerated = async () => {
    if (!generated?.outfit_items.length) {
      showErrorModal("No outfit to save.");
      return;
    }
    if (!user?.access_token) {
      showErrorModal("Please log in again.");
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
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to save outfit.";
      showErrorModal(errorMessage);
    }
  };

  const regenerate = async () => {
    if (!occasion) {
      showErrorModal("Please enter an occasion first.");
      return;
    }
    if (!weatherData) {
      showErrorModal("Weather data is not available. Please try again in a moment.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const { response } = await generateChatOutfit(
        user?.access_token!,
        occasion,
        weatherData
      );
      setGenerated(response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to regenerate outfit.";
      showErrorModal(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderWeatherInfo = () => {
    if (!weatherData) return null;

    const hasForecast = weatherData.forecast && 
                       typeof weatherData.forecast.high === 'number' && 
                       typeof weatherData.forecast.low === 'number';

    const tempRange = hasForecast && weatherData.forecast
      ? `${weatherData.forecast.low}°F - ${weatherData.forecast.high}°F`
      : `${weatherData.temperature}°F`;

    return (
      <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
        <h3 className="text-sm font-semibold text-blue-800 mb-2">Current Weather</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Temperature</p>
            <p className="text-lg font-semibold">{weatherData.temperature}°F</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Feels Like</p>
            <p className="text-lg font-semibold">{weatherData.feels_like}°F</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Conditions</p>
            <p className="text-lg font-semibold capitalize">{weatherData.description}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Humidity</p>
            <p className="text-lg font-semibold">{weatherData.humidity}%</p>
          </div>
        </div>
        {hasForecast && weatherData.forecast && (
          <div className="mt-3 pt-3 border-t border-blue-200">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">Today's Forecast</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Temperature Range</p>
                <p className="text-lg font-semibold">{tempRange}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Forecast</p>
                <p className="text-lg font-semibold capitalize">
                  {weatherData.forecast.description || weatherData.description}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
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
        {renderWeatherInfo()}
        <form onSubmit={handleGenerate} className="space-y-4 mt-6">
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

      {saveSuccess && (
        <div className="fixed bottom-6 right-6 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg">
          Outfit saved successfully!
        </div>
      )}

      {/* Error Modal */}
      <ErrorModal
        isOpen={isErrorModalOpen}
        message={errorModalMessage}
        onClose={() => setIsErrorModalOpen(false)}
      />
    </motion.div>
  );
};

export default GenerateOutfitTab;