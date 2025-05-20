// Weather related models
export interface WeatherData {
  temperature: number;
  description: string;
  feels_like: number;
  humidity: number;
  wind_speed: number;
  location: string;
  timestamp: string;
  visibility?: string;
  forecast?: {
    high: number;
    low: number;
    description: string;
  };
}

export interface HourlyForecast {
  time: string;
  temperature: number;
  description: string;
  feels_like: number;
  humidity: number;
  wind_speed: number;
  chance_of_rain: number;
  is_day: boolean;
}

export interface ForecastDay {
  date: string;
  max_temp: number;
  min_temp: number;
  description: string;
  chance_of_rain: number;
  humidity: number;
  wind_speed: number;
  hourly_forecast: HourlyForecast[];
  is_day: boolean;
}

export interface ForecastData {
  location: string;
  forecast_days: ForecastDay[];
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