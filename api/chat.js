import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
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

    const { message } = req.body;

const lastMessage = message || "Hello";

   const completion =
  await client.chat.completions.create({
    model: "llama3-70b-8192",
    messages: [
      {
        role: "system",
        content:
          "You are a Hackathon Assistant AI.",
      },
      {
        role: "user",
        content: lastMessage,
      },
    ],
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