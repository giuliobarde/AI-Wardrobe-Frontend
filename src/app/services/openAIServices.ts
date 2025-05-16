import { WeatherData } from "../models";

export async function generateChatOutfit(
    accessToken: string,
    occasion: string,
    weatherData: WeatherData
  ) {
    const response = await fetch("http://localhost:8000/chat/", {
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
  