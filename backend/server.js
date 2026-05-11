import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.get("/", (req, res) => {
  res.send("Backend running");
});

app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    const lastMessage = messages[messages.length - 1];

    res.json({
      reply: `You said: ${lastMessage.content}`
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      reply: 'Server error'
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});