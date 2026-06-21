import axios from "axios";
import { similaritySearch } from "./vectorStore.js";

const GROQ_CHAT_COMPLETIONS_URL = "https://api.groq.com/openai/v1/chat/completions";

function buildContextBlock(matches = []) {
  return matches
    .map((match, index) => {
      const source = match.metadata.source ? `\nSource: ${match.metadata.source}` : "";
      return [
        `[Context ${index + 1}]`,
        `Title: ${match.metadata.title}`,
        `Category: ${match.metadata.category}${source}`,
        match.pageContent,
      ].join("\n");
    })
    .join("\n\n---\n\n");
}

function buildSystemPrompt(hasContext) {
  return `You are HackBot.

Answer hackathon, team, project, judging, pitch, and tech stack questions as a concise professional hackathon mentor.

Use the provided context whenever possible.

If context exists:
- prioritize the context
- cite platform names when relevant
- provide practical guidance

If context is insufficient:
- use general knowledge
- clearly indicate it is general guidance

Response format:
- Title
- Short explanation
- Bullet points
- Official links only when relevant

Avoid giant paragraphs, unnecessary links, repeated content, and fabricated URLs.

Context status: ${hasContext ? "retrieved context is available" : "no retrieved context was found"}.`;
}

function buildUserPrompt(question, context) {
  if (!context) {
    return `Question: ${question}`;
  }

  return `Retrieved context:

${context}

Question: ${question}`;
}

async function generateRagAnswer(question, history = []) {
  const matches = await similaritySearch(question, 5);
  const context = buildContextBlock(matches);

  const response = await axios.post(
    GROQ_CHAT_COMPLETIONS_URL,
    {
      model: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: buildSystemPrompt(Boolean(context)) },
        ...history.slice(-6),
        { role: "user", content: buildUserPrompt(question, context) },
      ],
      temperature: Number(process.env.GROQ_TEMPERATURE || 0.4),
      max_tokens: Number(process.env.GROQ_MAX_TOKENS || 500),
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  return {
    answer: response.data?.choices?.[0]?.message?.content || "No response generated.",
    sources: matches.map((match) => ({
      title: match.metadata.title,
      category: match.metadata.category,
      source: match.metadata.source,
      score: Number(match.score.toFixed(4)),
    })),
  };
}

export { generateRagAnswer };
