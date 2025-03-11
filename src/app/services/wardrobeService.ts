import axios from "axios";

const API_BASE_URL = "http://localhost:8000";

export const addClothingItem = async (item: any, token: string) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/add_clothing_item/`,
            item,
            {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );
        return response.data;
    } catch (error: any) {
        console.error("Failed to add clothing item:", error.response ? error.response.data : error.message);
        throw error;
    }
};

export const displayClothingItem = async (token: string, itemType: string) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/clothing_items/?item_type=${encodeURIComponent(itemType)}`,
            {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );
        return response.data;
    } catch (error: any) {
        console.error(
          "Failed to display clothing items:",
          error.response ? error.response.data : error.message
        );
        throw error;
    }
};