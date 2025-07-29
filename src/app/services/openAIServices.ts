import { WeatherData } from "../models";
import API_ENDPOINTS from "../config/api";

export async function generateChatOutfit(
    accessToken: string,
    occasion: string,
    weatherData: WeatherData
  ) {
    const response = await fetch(API_ENDPOINTS.CHAT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        user_message: occasion,
        weather_data: weatherData
      }),
    });
  
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
  
    const data = await response.json();
    return data;
  }