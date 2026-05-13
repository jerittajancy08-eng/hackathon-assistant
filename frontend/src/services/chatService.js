import axios from "axios";

export async function sendMessage(message) {
  const response = await axios.post(
    "http://localhost:5000/api/chat",
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
