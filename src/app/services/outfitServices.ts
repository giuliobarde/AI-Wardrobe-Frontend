import axios from "axios";

const API_BASE_URL = "http://localhost:8000";

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
        console.error("Failed to retrieve all outfits:", error.response ? error.response.data : error.message);
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

export const favouriteUpdateSavedOutfit = async (outfit: any, token: string) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/edit_favourite_outfit/`,
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
        console.error("Failed to update favourite outfit:", error.response ? error.response.data : error.message);
        throw error;
    }
};