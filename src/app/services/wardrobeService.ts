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
    console.error("Failed to display clothing items:", error.response ? error.response.data : error.message);
    throw error;
  }
};

export const displayClothingItemById = async (token: string, itemId: string) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/clothing_items/?id=${encodeURIComponent(itemId)}`,
      {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("Failed to display clothing item by id:", error.response ? error.response.data : error.message);
    throw error;
  }
};

export const getAllUserItems = async (token: string) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/clothing_items/all/`,
      {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("Failed to retrieve all clothing items:", error.response ? error.response.data : error.message);
    throw error;
  }
};

export const deleteClothingItem = async (
  token: string,
  itemId: string,
  deleteOutfits = false
) => {
  try {
    // add query param if we need to cascade-delete outfits
    const url = `${API_BASE_URL}/delete_clothing_item/${
      deleteOutfits ? "?delete_outfits=true" : ""
    }`;

    const response = await axios.post(
      url,
      { id: itemId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error(
      "Failed to delete clothing item:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

export const checkItemInOutfits = async (token: string, itemId: string) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/check_item_in_outfits/?item_id=${encodeURIComponent(itemId)}`,
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
      "Failed to check item in outfits:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

export const favoriteUpdateSavedItem = async (item: any, token: string) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/edit_favorite_item/`,
      item,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error: any) {
      console.error("Failed to update favorite item:", error.response ? error.response.data : error.message);
      throw error;
  }
};