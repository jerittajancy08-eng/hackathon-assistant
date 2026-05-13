import axios from "axios";

export async function sendMessage(message) {
  const response = await axios.post(
    "https://hackathon-assistant.onrender.com/api/chat",
    {
      messages: [
        {
          role: "user",
          content: message,
        },
      ],
    }
  );

  return response.data;
}
