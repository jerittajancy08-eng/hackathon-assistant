import ChatSession from "../models/ChatSession.js";
import Hackathon from "../models/Hackathon.js";
import { generateRagAnswer } from "../services/ragService.js";

const KEYWORD_PATTERNS = {
  greeting: /^(?:hi|hello|hey|good morning|good afternoon|good evening)\b/i,
  chatHistory: /(?:chat history|history management|saved chats|conversation history|history feature)/i,
  deleteHistory: /(?:delete history|clear history|clear chats|delete chats|remove chat history|clear conversation)/i,
};

function formatBulletList(items) {
  return items.map((item) => `- ${item}`).join("\n");
}

function isGreetingPrompt(prompt) {
  return KEYWORD_PATTERNS.greeting.test(prompt);
}

function isChatHistoryPrompt(prompt) {
  return KEYWORD_PATTERNS.chatHistory.test(prompt);
}

function isDeleteHistoryPrompt(prompt) {
  return KEYWORD_PATTERNS.deleteHistory.test(prompt);
}

function normalizeHistory(messages = []) {
  return messages
    .filter((message) => ["user", "assistant"].includes(message.role) && message.content)
    .map((message) => ({
      role: message.role,
      content: String(message.content).slice(0, 1600),
    }));
}

async function handleChat(req, res) {
  try {
    const { messages = [], message } = req.body;
    const lastUserMessage =
      messages?.filter((msg) => msg.role === "user").slice(-1)[0]?.content || message || "";

    const prompt = lastUserMessage.trim();
    if (!prompt) {
      return res.status(400).json({ answer: "Please ask a question." });
    }

    if (isGreetingPrompt(prompt)) {
      return res.status(200).json({
        answer: "HackBot\n\nHello. Ask me about hackathons, team formation, project ideas, judging, pitches, or tech stacks.",
      });
    }

    if (isDeleteHistoryPrompt(prompt)) {
      return res.status(200).json({
        answer: "Chat History\n\nUse the delete or clear chat option to remove saved conversation history.",
      });
    }

    if (isChatHistoryPrompt(prompt)) {
      return res.status(200).json({
        answer: `Chat History\n\n${formatBulletList([
          "Saved chat sessions appear in the history panel.",
          "Use delete or clear chat to remove saved conversation history.",
        ])}`,
      });
    }

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({
        answer: "HackBot is missing GROQ_API_KEY on the backend.",
      });
    }

    const result = await generateRagAnswer(prompt, normalizeHistory(messages));

    return res.status(200).json({
      answer: result.answer,
      sources: result.sources,
      mode: "rag",
    });
  } catch (error) {
    console.error("RAG CHAT ERROR:", error.response?.data || error.message);

    return res.status(500).json({
      answer: "HackBot could not generate a RAG response right now.",
    });
  }
}

async function loadSession(req, res, next) {
  try {
    const { sessionId } = req.params;
    const session = await ChatSession.findOne({ _id: sessionId, user: req.user._id });
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    return res.status(200).json({ session });
  } catch (error) {
    next(error);
  }
}

async function searchHackathonsByPrompt() {
  return Hackathon.find({})
    .sort({ startDate: 1 })
    .limit(6)
    .lean();
}

export { handleChat, loadSession, searchHackathonsByPrompt };
