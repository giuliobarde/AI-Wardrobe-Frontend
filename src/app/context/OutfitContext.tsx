"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { 
  getSavedOutfits, 
  addSavedOutfit, 
  deleteSavedOutfit, 
  favoriteUpdateSavedOutfit 
} from "../services/outfitServices";

// Define outfit item interface
export interface OutfitItem {
  item_id?: string;
  id?: string;
  type: string;
}

// Define outfit interface
export interface Outfit {
  id: string;
  user_id: string;
  items: OutfitItem[];
  occasion: string;
  favorite: boolean;
  created_at?: string;
}

// Context interface
interface OutfitContextType {
  outfits: Outfit[];
  isLoading: boolean;
  error: string | null;
  fetchOutfits: () => Promise<void>;
  getOutfitById: (id: string) => Outfit | undefined;
  getOutfitsByOccasion: (occasion: string) => Outfit[];
  addOutfit: (outfit: any) => Promise<Outfit>;
  deleteOutfit: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  clearCache: () => void;
}

const OutfitContext = createContext<OutfitContextType | undefined>(undefined);

export function useOutfit() {
  const context = useContext(OutfitContext);
  if (context === undefined) {
    throw new Error("useOutfit must be used within an OutfitProvider");
  }
  return context;
}

export function OutfitProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<number>(0);
  
  // Cache duration in milliseconds (e.g., 5 minutes)
  const CACHE_DURATION = 5 * 60 * 1000;
  const STORAGE_KEY = 'outfit_items_cache';

  // Load from localStorage on initial mount
  useEffect(() => {
    if (!user?.access_token) return;
    
    try {
      const cachedData = localStorage.getItem(STORAGE_KEY);
      if (cachedData) {
        const { outfits: cachedOutfits, timestamp } = JSON.parse(cachedData);
        const now = Date.now();
        
        if (now - timestamp < CACHE_DURATION) {
          setOutfits(cachedOutfits);
          setLastFetched(timestamp);
          setIsLoading(false);
          return;
        }
      }
      
      // If no valid cache, fetch from API
      fetchOutfits();
    } catch (err) {
      console.error("Error loading from cache:", err);
      fetchOutfits();
    }
  }, [user?.access_token]);

  // Add event listener for outfit refresh
  useEffect(() => {
    // Listen for refresh-outfits events (e.g., when items are deleted)
    const handleRefreshOutfits = () => {
      console.log("Refreshing outfits due to item changes");
      fetchOutfits();
    };
    
    window.addEventListener('refresh-outfits', handleRefreshOutfits);
    
    // Clean up event listener on unmount
    return () => {
      window.removeEventListener('refresh-outfits', handleRefreshOutfits);
    };
  }, []);

  // Save to localStorage whenever outfits change
  useEffect(() => {
    if (outfits.length > 0 && lastFetched > 0) {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            outfits,
            timestamp: lastFetched
          })
        );
      } catch (err) {
        console.error("Error saving to cache:", err);
      }
    }
  }, [outfits, lastFetched]);

  // Fetch all outfits from API
  const fetchOutfits = async () => {
    if (!user?.access_token) {
      setError("User not authenticated");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const fetchedOutfits = await getSavedOutfits(user.access_token);
      setOutfits(fetchedOutfits);
      setLastFetched(Date.now());
      setIsLoading(false);


    } catch (err: any) {
      setError(err.message || "Failed to fetch outfits");
      setIsLoading(false);
    }
  };

  // Get a single outfit by ID
  const getOutfitById = (id: string) => {
    return outfits.find(outfit => outfit.id === id);
  };

  // Get outfits filtered by occasion
  const getOutfitsByOccasion = (occasion: string) => {
    return outfits.filter(outfit => outfit.occasion.toLowerCase() === occasion.toLowerCase());
  };

  // Add a new outfit
  const addOutfit = async (newOutfitData: any) => {
    if (!user?.access_token) {
      throw new Error("User not authenticated");
    }

    try {
      const response = await addSavedOutfit(newOutfitData, user.access_token);
      const newOutfit = response.data || response;
      
      // Update local state with the new outfit
      setOutfits(prevOutfits => [...prevOutfits, newOutfit]);
      setLastFetched(Date.now());

      await fetchOutfits();

      return newOutfit;
    } catch (err: any) {
      throw new Error(err.message || "Failed to add outfit");
    }
  };

  // Delete an outfit
  const deleteOutfit = async (id: string) => {
    if (!user?.access_token) {
      throw new Error("User not authenticated");
    }

    try {
      // Optimistically update UI first
      setOutfits(prevOutfits => prevOutfits.filter(outfit => outfit.id !== id));
      
      // Then perform the actual API call
      await deleteSavedOutfit({ id }, user.access_token);

      await fetchOutfits();
    } catch (err: any) {
      // Revert the optimistic update if the API call fails
      await fetchOutfits();
      throw new Error(err.message || "Failed to delete outfit");
    }
  };

  // Toggle favorite status
  const toggleFavorite = async (id: string) => {
    if (!user?.access_token) {
      throw new Error("User not authenticated");
    }

    try {
      // Optimistically update UI
      setOutfits(prevOutfits => 
        prevOutfits.map(outfit => 
          outfit.id === id ? { ...outfit, favorite: !outfit.favorite } : outfit
        )
      );
      
      // Make API call
      await favoriteUpdateSavedOutfit({ id }, user.access_token);
    } catch (err: any) {
      // Revert on failure
      await fetchOutfits();
      throw new Error(err.message || "Failed to update favorite status");
    }
  };

  // Clear the cache (useful for logout, etc.)
  const clearCache = () => {
    localStorage.removeItem(STORAGE_KEY);
    setOutfits([]);
    setLastFetched(0);
  };

  const value = {
    outfits,
    isLoading,
    error,
    fetchOutfits,
    getOutfitById,
    getOutfitsByOccasion,
    addOutfit,
    deleteOutfit,
    toggleFavorite,
    clearCache
  };

  return (
    <OutfitContext.Provider value={value}>
      {children}
    </OutfitContext.Provider>
  );
}