import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {

    const { messages } = req.body;
const message = messages[messages.length - 1]?.content || "";
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
            content: message,
          },
        ],
      });

    return res.status(200).json({
      reply:
        completion.choices[0].message.content,
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      error: error.message,
    });
  }
}