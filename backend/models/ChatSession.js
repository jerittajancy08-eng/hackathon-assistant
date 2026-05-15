import mongoose from "mongoose";

const chatSessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  name: {
    type: String,
    default: "Chat Session",
  },

  messages: [
    {
      role: String,
      content: String,
    },
  ],
});

const ChatSession = mongoose.model("ChatSession", chatSessionSchema);

export default ChatSession;
