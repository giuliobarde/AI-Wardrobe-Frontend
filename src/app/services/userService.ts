import axios from "axios";

const API_BASE_URL = "http://localhost:8000";

export const updateProfile = async (
  token: string,
  firstName: string,
  lastName: string,
  username: string
) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/update_profile/`,
      {
        first_name: firstName,
        last_name: lastName,
        username: username,
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
