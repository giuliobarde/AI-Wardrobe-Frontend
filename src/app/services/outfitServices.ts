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