const mongoose = require('mongoose');

const chatSessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, trim: true, default: 'Hackathon session' },
    messages: [
      {
        role: { type: String, required: true },
        content: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

const ChatSession = mongoose.model('ChatSession', chatSessionSchema);
module.exports = ChatSession;
