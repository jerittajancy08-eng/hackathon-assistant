const axios = require('axios');

async function createAiResponse(messages) {
  try {
    const lastMessage =
      messages[messages.length - 1]?.content || '';

    const response = await axios.post(
      'http://127.0.0.1:11434/api/generate',
      {
        model: 'tinyllama',
        prompt: `
You are Hackathon Assistant.

You ONLY help with:
- hackathons
- coding
- AI
- startups
- web development
- projects
- programming
- technology

User message:
${lastMessage}

Reply shortly and clearly.
`,
        stream: false,
      }
    );

    return response.data.response;
  } catch (error) {
    console.log('Ollama Error:', error.message);

    return 'AI is currently unavailable.';
  }
}

module.exports = {
  createAiResponse,
};