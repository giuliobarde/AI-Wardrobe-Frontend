"use client";

import React, { createContext, ReactNode, useState, useContext, useEffect } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";
import { WeatherData, ForecastData } from "../models";
import API_ENDPOINTS from "../config/api";

interface WeatherContextType {
  weatherData: WeatherData | null;
  forecastData: ForecastData | null;
  loading: boolean;
  error: string | null;
  location: { lat: number; lon: number } | null;
  refreshWeather: () => Promise<void>;
  updateLocation: (lat: number, lon: number) => void;
}

const WeatherContext = createContext<WeatherContextType | undefined>(undefined);

interface WeatherProviderProps {
  children: ReactNode;
}

export const WeatherProvider = ({ children }: WeatherProviderProps) => {
  const { user } = useAuth();
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [forecastData, setForecastData] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);

  // Function to get user's current location
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          setError("Failed to get your location. Please enable location services.");
        }
      );
    } else {
      setError("Geolocation is not supported by your browser");
    }
  };

  // Function to update location manually
  const updateLocation = (lat: number, lon: number) => {
    setLocation({ lat, lon });
  };

  // Function to refresh weather data
  const refreshWeather = async () => {
    if (!user || !location) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Fetch current weather
      const response = await fetch(
        `${API_ENDPOINTS.WEATHER.CURRENT}?lat=${location.lat}&lon=${location.lon}`,
        {
          headers: {
            Authorization: `Bearer ${user.access_token}`,
          },
        }
      );
      
      // Fetch forecast
      console.log("Fetching forecast data...");
      const forecastResponse = await fetch(
        `${API_ENDPOINTS.WEATHER.FORECAST}?lat=${location.lat}&lon=${location.lon}`,
        {
          headers: {
            Authorization: `Bearer ${user.access_token}`,
          },
        }
      );
      
      const newWeatherData = await response.json();
      const newForecastData = await forecastResponse.json();
      
      console.log("Received forecast data:", newForecastData);
      
      // Update context state
      setWeatherData(newWeatherData);
      setForecastData(newForecastData);
      
      // Update localStorage
      localStorage.setItem("weatherData", JSON.stringify(newWeatherData));
      localStorage.setItem("forecastData", JSON.stringify(newForecastData));
      
      // Also update the user object to keep them in sync
      const updatedUser = { 
        ...user, 
        weather: newWeatherData,
        forecast: newForecastData 
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      setLoading(false);
    } catch (err) {
      console.error("Weather refresh error:", err);
      setError("Failed to fetch weather data");
      setLoading(false);
    }
  };

  // Get user's location on initial render
  useEffect(() => {
    getUserLocation();
  }, []);

  // Load weather data from localStorage on initial render
  useEffect(() => {
    const storedWeather = localStorage.getItem("weatherData");
    const storedForecast = localStorage.getItem("forecastData");
    
    if (storedWeather) {
      const parsedWeather = JSON.parse(storedWeather);
      setWeatherData(parsedWeather);
    }
    
    if (storedForecast) {
      const parsedForecast = JSON.parse(storedForecast);
      setForecastData(parsedForecast);
    }
    
    setLoading(false);
  }, []);

  // Refresh weather data when location changes
  useEffect(() => {
    if (location) {
      refreshWeather();
    }
  }, [location]);

  // Refresh weather data when the user changes (e.g., on login)
  useEffect(() => {
    if (user) {
      refreshWeather();
    }
  }, [user?.user_id]);

  // Refresh weather data periodically (every 30 minutes)
  useEffect(() => {
    if (!user || !location) return;
    
    const interval = setInterval(refreshWeather, 30 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [user, location]);

  return (
    <WeatherContext.Provider
      value={{
        weatherData,
        forecastData,
        loading,
        error,
        location,
        refreshWeather,
        updateLocation,
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