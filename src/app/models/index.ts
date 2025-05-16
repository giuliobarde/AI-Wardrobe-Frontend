// Weather related models
export interface WeatherData {
  temperature: number;
  description: string;
  feels_like: number;
  humidity: number;
  wind_speed: number;
  location: string;
  timestamp: string;
}

// Auth related models
export interface UserData {
  email: string;
  user_id: string;
  access_token: string;
  message: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  member_since?: string;
  gender?: string;
  profile_image_url?: string | null;
  weather?: WeatherData | null;
}

// Outfit related models
export interface OutfitItem {
  item_id?: string;
  id?: string;
  type: string;
}

export interface Outfit {
  id: string;
  user_id: string;
  items: OutfitItem[];
  occasion: string;
  favorite: boolean;
  created_at?: string;
}

// Wardrobe related models
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