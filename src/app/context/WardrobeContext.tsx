"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { 
  getAllUserItems, 
  addClothingItem, 
  deleteClothingItem, 
  favoriteUpdateSavedItem 
} from "../services/wardrobeServices";

// Define item interface
export interface WardrobeItem {
  id: string;
  user_id: string;
  item_type: string;
  material: string;
  color: string;
  formality: string;
  pattern: string;
  fit: string;
  suitable_for_weather: string;
  suitable_for_occasion: string;
  sub_type: string;
  image_link?: string;
  favorite: boolean;
}

// Context interface
interface WardrobeContextType {
  items: WardrobeItem[];
  isLoading: boolean;
  error: string | null;
  fetchItems: () => Promise<void>;
  getItemsByType: (type: string) => WardrobeItem[];
  getItemById: (id: string) => WardrobeItem | undefined;
  addItem: (item: any) => Promise<WardrobeItem>;
  deleteItem: (id: string, deleteOutfits?: boolean) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  clearCache: () => void;
  // New callback for outfit refresh
  onItemsChanged: () => void;
  registerOutfitRefreshCallback: (callback: () => void) => void;
  unregisterOutfitRefreshCallback: (callback: () => void) => void;
}

const WardrobeContext = createContext<WardrobeContextType | undefined>(undefined);

export function useWardrobe() {
  const context = useContext(WardrobeContext);
  if (context === undefined) {
    throw new Error("useWardrobe must be used within a WardrobeProvider");
  }
  return context;
}

export function WardrobeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<number>(0);
  // Array to store outfit refresh callbacks
  const [outfitRefreshCallbacks, setOutfitRefreshCallbacks] = useState<(() => void)[]>([]);
  
  // Cache duration in milliseconds (e.g., 5 minutes)
  const CACHE_DURATION = 5 * 60 * 1000;
  const STORAGE_KEY = 'wardrobe_items_cache';

  // Register a callback to be called when items change
  const registerOutfitRefreshCallback = (callback: () => void) => {
    setOutfitRefreshCallbacks(prev => [...prev, callback]);
  };

  // Unregister a callback
  const unregisterOutfitRefreshCallback = (callback: () => void) => {
    setOutfitRefreshCallbacks(prev => prev.filter(cb => cb !== callback));
  };

  // Function to trigger all registered outfit refresh callbacks
  const onItemsChanged = () => {
    outfitRefreshCallbacks.forEach(callback => callback());
  };

  // Load from localStorage on initial mount
  useEffect(() => {
    if (!user?.access_token) return;
    
    try {
      const cachedData = localStorage.getItem(STORAGE_KEY);
      if (cachedData) {
        const { items: cachedItems, timestamp } = JSON.parse(cachedData);
        const now = Date.now();
        
        if (now - timestamp < CACHE_DURATION) {
          setItems(cachedItems);
          setLastFetched(timestamp);
          setIsLoading(false);
          return;
        }
      }
      
      // If no valid cache, fetch from API
      fetchItems();
    } catch (err) {
      console.error("Error loading from cache:", err);
      fetchItems();
    }
  }, [user?.access_token]);

  // Save to localStorage whenever items change
  useEffect(() => {
    if (items.length > 0 && lastFetched > 0) {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            items,
            timestamp: lastFetched
          })
        );
      } catch (err) {
        console.error("Error saving to cache:", err);
      }
    }
  }, [items, lastFetched]);

  // Fetch all items from API
  const fetchItems = async () => {
    if (!user?.access_token) {
      setError("User not authenticated");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await getAllUserItems(user.access_token);
      const fetchedItems = response.data || [];
      setItems(fetchedItems);
      setLastFetched(Date.now());
      setIsLoading(false);
      
      // Notify outfit components about the change
      onItemsChanged();
    } catch (err: any) {
      setError(err.message || "Failed to fetch wardrobe items");
      setIsLoading(false);
    }
  };

  // Get items filtered by type
  const getItemsByType = (type: string) => {
    const desired = type.toLowerCase();
    return items.filter(item =>
      // only compare if item_type exists
      typeof item.item_type === "string" &&
      item.item_type.toLowerCase() === desired
    );
  };

  // Get a single item by ID
  const getItemById = (id: string) => {
    return items.find(item => item.id === id);
  };

  // Add a new item
  const addItem = async (newItemData: any) => {
    if (!user?.access_token) {
      throw new Error("User not authenticated");
    }

    try {
      const response = await addClothingItem(newItemData, user.access_token);
      const newItem = response.data;
      
      // Update local state with the new item
      setItems(prevItems => [...prevItems, newItem]);
      
      // Notify outfit components about the change
      onItemsChanged();
      
      return newItem;
    } catch (err: any) {
      throw new Error(err.message || "Failed to add item");
    }
  };

  // Delete an item
  const deleteItem = async (id: string, deleteOutfits = false) => {
    if (!user?.access_token) {
      throw new Error("User not authenticated");
    }

    try {
      // Optimistically update UI first
      setItems(prevItems => prevItems.filter(item => item.id !== id));
      
      // Then perform the actual API call
      await deleteClothingItem(user.access_token, id, deleteOutfits);
      
      // Notify outfit components about the change
      onItemsChanged();
      
      // Force refresh the outfits context if available
      try {
        // Use window to access global event system
        window.dispatchEvent(new CustomEvent('refresh-outfits'));
      } catch (err) {
        console.error("Failed to refresh outfits:", err);
      }
    } catch (err: any) {
      // Revert the optimistic update if the API call fails
      await fetchItems();
      throw new Error(err.message || "Failed to delete item");
    }
  };

  // Toggle favorite status
  const toggleFavorite = async (id: string) => {
    if (!user?.access_token) {
      throw new Error("User not authenticated");
    }

    try {
      // Optimistically update UI
      setItems(prevItems => 
        prevItems.map(item => 
          item.id === id ? { ...item, favorite: !item.favorite } : item
        )
      );
      
      // Make API call
      await favoriteUpdateSavedItem({ id }, user.access_token);
      
      // Notify outfit components about the change if needed
      // Uncomment if outfit components need to react to favorite changes
      // onItemsChanged();
    } catch (err: any) {
      // Revert on failure
      await fetchItems();
      throw new Error(err.message || "Failed to update favorite status");
    }
  };

  // Clear the cache (useful for logout, etc.)
  const clearCache = () => {
    localStorage.removeItem(STORAGE_KEY);
    setItems([]);
    setLastFetched(0);
  };

  const value = {
    items,
    isLoading,
    error,
    fetchItems,
    getItemsByType,
    getItemById,
    addItem,
    deleteItem,
    toggleFavorite,
    clearCache,
    onItemsChanged,
    registerOutfitRefreshCallback,
    unregisterOutfitRefreshCallback
  };

  return (
    <WardrobeContext.Provider value={value}>
      {children}
    </WardrobeContext.Provider>
  );
}