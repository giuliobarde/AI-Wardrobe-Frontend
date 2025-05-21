// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
    WEATHER: {
        CURRENT: `${API_BASE_URL}/weather/current`,
        FORECAST: `${API_BASE_URL}/weather/forecast`,
    },
    CHAT: `${API_BASE_URL}/chat`,
    WARDROBE: `${API_BASE_URL}/wardrobe`,
    OUTFIT: `${API_BASE_URL}`,
    USER: `${API_BASE_URL}/user`,
} as const;

export default API_ENDPOINTS; 