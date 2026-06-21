import axios from "axios";
import { cleanupResponse } from "../utils/responseFormatter";

const API_URL = "https://hackathon-assistant.onrender.com/api/chat";

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
      return cleanupResponse(data);
    }

    if (data.reply) {
      return cleanupResponse(data.reply);
    }

    if (data.message) {
      return cleanupResponse(data.message);
    }

    if (data.content) {
      return cleanupResponse(data.content);
    }

    if (data.answer) {
      return cleanupResponse(data.answer);
    }

    if (data.result) {
      return cleanupResponse(data.result);
    }

    // LAST RESORT
    return cleanupResponse(data);
  } catch (error) {
    console.error("CHAT SERVICE ERROR:", error);

    if (error.response) {
      console.error("Backend Error:", error.response.data);
    }

    return "Unable to receive a response. Please try again.";
  }
};

export const sendChatMessage = async (messages, sessionId, authToken) => {
  try {
    const response = await axios.post(
      API_URL,
      {
        messages,
        sessionId,
      },
      {
        headers: authToken
          ? {
              Authorization: `Bearer ${authToken}`,
            }
          : {},
      }
    );

    return {
      reply: cleanupResponse(response.data?.answer || response.data?.reply || response.data),
      sources: response.data?.sources || [],
    };
  } catch (error) {
    console.error("CHAT SERVICE ERROR:", error);

    return {
      reply: "Unable to receive a response. Please try again.",
      sources: [],
    };
  }
};
