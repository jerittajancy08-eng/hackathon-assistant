import axios from "axios";

const API_URL = "http://localhost:5000/api/chat";

export const sendMessage = async (message, mode = "AI") => {
  try {
    const response = await axios.post(API_URL, {
      message,
      mode,
    });

    console.log("FULL API RESPONSE:", response.data);

    const data = response.data;

    // SAFE RESPONSE EXTRACTION
    if (typeof data === "string") {
      return data;
    }

    if (data.reply) {
      return data.reply;
    }

    if (data.message) {
      return data.message;
    }

    if (data.content) {
      return data.content;
    }

    if (data.answer) {
      return data.answer;
    }

    if (data.result) {
      return data.result;
    }

    // LAST RESORT
    return JSON.stringify(data, null, 2);
  } catch (error) {
    console.error("CHAT SERVICE ERROR:", error);

    if (error.response) {
      console.error("Backend Error:", error.response.data);
    }

    return "Unable to receive a response. Please try again.";
  }
};
