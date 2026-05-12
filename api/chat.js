import axios from "axios";

export async function sendChatMessage(messages) {
  try {
    const response = await axios.post(
      "/api/chat",
      { messages }
    );

    return response.data;
  } catch (error) {
    console.error(error);

    return {
      reply: "Something went wrong."
    };
  }
}