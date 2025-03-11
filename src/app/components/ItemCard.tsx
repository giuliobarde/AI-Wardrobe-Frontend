"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { displayClothingItem } from "../services/wardrobeService";

interface Item {
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
}

interface ItemCardProps {
  itemType: string;
}

const ItemCard: React.FC<ItemCardProps> = ({ itemType }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      if (!user?.access_token) {
        setError("User authentication failed. Please log in again.");
        return;
      }
      try {
        const response = await displayClothingItem(user.access_token, itemType);
        if (response?.data && Array.isArray(response.data)) {
          setItems(response.data);
        } else {
          setItems([]);
        }
      } catch (err) {
        setError("Failed to fetch items");
        console.error(err);
      }
    };
    fetchItems();
  }, [user, itemType]);

  if (error) return <p className="text-red-500">{error}</p>;
  //if (items.length === 0) return <p>No items found for {itemType}.</p>;

  return (
    <div className="flex flex-wrap gap-4 justify-center">
      {items.map((item) => (
        <div
          key={item.id}
          className="min-w-[150px] h-40 flex items-center justify-center bg-white border border-gray-300 rounded-lg shadow-md cursor-pointer hover:bg-gray-100"
        >
          <h1 className="text-2xl font-bold">{item.material + "\n" + item.sub_type}</h1>
        </div>
      ))}
    </div>
  );
};

export default ItemCard;
