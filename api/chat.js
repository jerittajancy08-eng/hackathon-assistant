import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export default async function handler(req, res) {

  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {

    const { messages } = req.body;

    const lastMessage =
      messages?.[messages.length - 1]?.text || "Hello";

    const completion =
      await client.chat.completions.create({
        model: "llama3-8b-8192",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful Hackathon Assistant chatbot.",
          },
          {
            role: "user",
            content: lastMessage,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

    const reply =
      completion.choices?.[0]?.message?.content;

    return res.status(200).json({
      reply,
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      reply: "Groq API Error",
      error: error.message,
    });
  }
}