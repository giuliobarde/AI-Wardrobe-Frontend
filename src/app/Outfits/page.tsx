"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useOutfit, OutfitProvider } from "../context/OutfitContext";
import GenerateOutfitTab from "../components/tabs/GenerateOutfitTab";
import SavedOutfitsTab from "../components/tabs/SavedOutfitsTab";

function OutfitsPageContent() {
  const router = useRouter();
  const { fetchOutfits } = useOutfit();
  const [activeTab, setActiveTab] = useState<"generate" | "saved">("generate");
  
  // On mount, pick up URL hash
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash.replace("#", "");
      if (hash === "saved" || hash === "generate") {
        setActiveTab(hash as "generate" | "saved");
      }
    }
  }, []);

  const selectTab = (tab: "generate" | "saved") => {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      window.location.hash = tab;
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

      {/* Tab Content */}
      {activeTab === "generate" && <GenerateOutfitTab />}
      {activeTab === "saved" && <SavedOutfitsTab onOutfitsUpdated={fetchOutfits} />}
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