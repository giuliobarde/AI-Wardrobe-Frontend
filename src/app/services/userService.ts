import axios from "axios";
import API_ENDPOINTS from "../config/api";

const API_BASE_URL = API_ENDPOINTS.USER;

export const updateProfile = async (
  token: string,
  firstName: string,
  lastName: string,
  username: string,
  gender: string
) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/update_profile/`,
      {
        first_name: firstName,
        last_name: lastName,
        username: username,
        gender: gender,
      },
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
      "Failed to update profile:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

// Add this new function to userService.ts
export const updateProfileImage = async (
  token: string,
  imageFile: File | null
) => {
  try {
    const formData = new FormData();
    
    if (imageFile) {
      formData.append("profile_image", imageFile);
    } else {
      // If null is passed, it means we want to remove the profile image
      formData.append("remove_image", "true");
    }
    
    const response = await axios.post(
      `${API_BASE_URL}/update_profile_image/`,
      formData,
      {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error(
      "Failed to update profile image:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};