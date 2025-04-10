export async function generateChatOutfit(
    accessToken: string,
    occasion: string
  ) {
    const response = await fetch("http://localhost:8000/chat/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        user_message: occasion,
        temp: "20C"
      }),
    });
  
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
  
    const data = await response.json();
    return data;
  }
  