"use client";

import React, { createContext, ReactNode, useState, useContext, useEffect } from "react";
import axios from "axios";
import { useAuth, WeatherData } from "./AuthContext";

interface WeatherContextType {
  weatherData: WeatherData | null;
  loading: boolean;
  error: string | null;
  refreshWeather: () => Promise<void>;
}

const WeatherContext = createContext<WeatherContextType | undefined>(undefined);

interface WeatherProviderProps {
  children: ReactNode;
}

export const WeatherProvider = ({ children }: WeatherProviderProps) => {
  const { user } = useAuth();
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to refresh weather data
  const refreshWeather = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Call the weather endpoint for New York (hardcoded in backend)
      const response = await axios.get(
        `http://localhost:8000/weather/current`,
        {
          headers: {
            Authorization: `Bearer ${user.access_token}`,
          },
        }
      );
      
      const newWeatherData = response.data;      
      // Update context state
      setWeatherData(newWeatherData);
      
      // Update localStorage
      localStorage.setItem("weatherData", JSON.stringify(newWeatherData));
      
      // Also update the user object to keep them in sync
      const updatedUser = { ...user, weather: newWeatherData };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      setLoading(false);
    } catch (err) {
      console.error("Weather refresh error:", err);
      
      // DEBUG: Log error to console for testing - remove after testing
      console.log("%c------ WEATHER API TEST ------", "color: #F44336; font-weight: bold; font-size: 14px;");
      console.log("❌ Error fetching weather data:", err);
      console.log("%c-----------------------------", "color: #F44336; font-weight: bold; font-size: 14px;");
      
      setError("Failed to fetch weather data");
      setLoading(false);
    }
  };

  // Load weather data from localStorage on initial render
  useEffect(() => {
    const storedWeather = localStorage.getItem("weatherData");
    
    if (storedWeather) {
      const parsedWeather = JSON.parse(storedWeather);
      setWeatherData(parsedWeather);
      
      // DEBUG: Log stored weather data to console for testing - remove after testing
      console.log("%c------ STORED WEATHER DATA ------", "color: #2196F3; font-weight: bold; font-size: 14px;");
      console.log("📍 Location:", parsedWeather.location);
      console.log("🌡️ Temperature:", parsedWeather.temperature, "°C");
      console.log("☁️ Description:", parsedWeather.description);
      console.log("%c--------------------------------", "color: #2196F3; font-weight: bold; font-size: 14px;");
    } else if (user?.weather) {
      setWeatherData(user.weather);
      localStorage.setItem("weatherData", JSON.stringify(user.weather));
      
      // DEBUG: Log user weather data to console for testing - remove after testing
      console.log("%c------ USER WEATHER DATA ------", "color: #FF9800; font-weight: bold; font-size: 14px;");
      console.log("📍 Location:", user.weather.location);
      console.log("🌡️ Temperature:", user.weather.temperature, "°C");
      console.log("☁️ Description:", user.weather.description);
      console.log("%c------------------------------", "color: #FF9800; font-weight: bold; font-size: 14px;");
    }
    
    setLoading(false);
  }, []);

  // Refresh weather data when the user changes (e.g., on login)
  useEffect(() => {
    if (user) {
      refreshWeather();
    }
  }, [user?.user_id]);

  // Refresh weather data periodically (every 30 minutes)
  useEffect(() => {
    if (!user) return;
    
    const interval = setInterval(refreshWeather, 30 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [user]);

  return (
    <WeatherContext.Provider
      value={{
        weatherData,
        loading,
        error,
        refreshWeather,
      }}
    >
      {children}
    </WeatherContext.Provider>
  );
};

export const useWeather = (): WeatherContextType => {
  const context = useContext(WeatherContext);
  if (!context) {
    throw new Error("useWeather must be used within a WeatherProvider");
  }
  return context;
};

export default WeatherContext; 