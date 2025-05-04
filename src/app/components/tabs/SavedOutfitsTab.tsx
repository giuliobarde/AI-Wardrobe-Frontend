"use client";

import React, { useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Heart, Plus, Star } from "lucide-react";
import CreateOutfit from "../CreateOutfit";
import OutfitCard from "../OutfitCard";

interface SavedOutfitsTabProps {
  onOutfitsUpdated: () => void;
}

const SavedOutfitsTab = ({ onOutfitsUpdated }: SavedOutfitsTabProps) => {
  const { user } = useAuth();
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);

  return (
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

      {/* Create Outfit Modal */}
      <CreateOutfit
        show={showCreate}
        onClose={() => setShowCreate(false)}
        onOutfitAdded={() => {
          setShowCreate(false);
          onOutfitsUpdated();
        }}
      />
    </motion.div>
  );
};

export default SavedOutfitsTab;