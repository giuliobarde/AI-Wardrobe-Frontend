import axios from "axios";
import API_ENDPOINTS from "../config/api";

const API_BASE_URL = API_ENDPOINTS.OUTFIT;

export const addSavedOutfit = async (outfit: any, token: string) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/add_saved_outfit/`,
            outfit,
            {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );
        return response.data;
    } catch (error: any) {
        console.error("Failed to add outfit:", error.response ? error.response.data : error.message);
        throw error;
    }
};

export const getSavedOutfits = async (token: string) => {
    try {
        console.log("Fetching outfits from:", `${API_BASE_URL}/get_saved_outfits/`);
        const response = await axios.get(
          `${API_BASE_URL}/get_saved_outfits/`,
          {
            headers: {
              "Authorization": `Bearer ${token}`,
            },
          }
        );
        return response.data.data || [];
    } catch (error: any) {
        console.log("Error type:", error.name);
        console.log("Error message:", error.message);
        console.log("Has response:", !!error.response);
        console.log("Has request:", !!error.request);
        console.log("Full error object:", JSON.stringify(error, null, 2));
        
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error("Failed to retrieve outfits - Server Error:", {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                headers: error.response?.headers,
                url: `${API_BASE_URL}/get_saved_outfits/`,
                token: token ? "Token present" : "No token",
                config: {
                    url: error.config?.url,
                    method: error.config?.method,
                    headers: error.config?.headers
                }
            });
        } else if (error.request) {
            // The request was made but no response was received
            console.error("Failed to retrieve outfits - No Response:", {
                request: error.request,
                url: `${API_BASE_URL}/get_saved_outfits/`,
                token: token ? "Token present" : "No token"
            });
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error("Failed to retrieve outfits - Request Setup Error:", {
                message: error.message,
                url: `${API_BASE_URL}/get_saved_outfits/`,
                token: token ? "Token present" : "No token"
            });
        }
        throw new Error(error.response?.data?.message || error.message || "Failed to retrieve outfits");
    }
};

export const deleteSavedOutfit = async (outfit: any, token: string) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/delete_saved_outfit/`,
            outfit,
            {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );
        return response.data;
    } catch (error: any) {
        console.error("Failed to delete outfit:", error.response ? error.response.data : error.message);
        throw error;
    }
};

export const favoriteUpdateSavedOutfit = async (outfit: any, token: string) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/edit_favorite_outfit/`,
            outfit,
            {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );
        return response.data;
    } catch (error: any) {
        console.error("Failed to update favorite outfit:", error.response ? error.response.data : error.message);
        throw error;
    }
};