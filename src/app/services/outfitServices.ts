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
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error("Failed to retrieve outfits:", {
                status: error.response.status,
                data: error.response.data,
                headers: error.response.headers
            });
        } else if (error.request) {
            // The request was made but no response was received
            console.error("No response received:", error.request);
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error("Error setting up request:", error.message);
        }
        throw error;
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