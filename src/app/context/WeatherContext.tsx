"use client";

import React, { createContext, ReactNode, useState, useContext, useEffect } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";
import { WeatherData, ForecastData } from "../models";

interface WeatherContextType {
  weatherData: WeatherData | null;
  forecastData: ForecastData | null;
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
  const [forecastData, setForecastData] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to refresh weather data
  const refreshWeather = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Fetch current weather
      const currentResponse = await axios.get(
        `http://localhost:8000/weather/current`,
        {
          headers: {
            Authorization: `Bearer ${user.access_token}`,
          },
        }
      );
      
      // Fetch forecast
      console.log("Fetching forecast data...");
      const forecastResponse = await axios.get(
        `http://localhost:8000/weather/forecast`,
        {
          headers: {
            Authorization: `Bearer ${user.access_token}`,
          },
        }
      );
      
      const newWeatherData = currentResponse.data;
      const newForecastData = forecastResponse.data;
      
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
        forecastData,
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