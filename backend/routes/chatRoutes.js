import express from "express";
import Groq from "groq-sdk";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    const { messages } = req.body;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages,
    });

    const reply =
      completion.choices[0]?.message?.content || "No response";

    res.json({ reply });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "AI request failed",
    });
  }
});

export default router;