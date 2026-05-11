export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ reply: 'Method not allowed' });
  }

  try {
    // Validate environment
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('[CRITICAL] GEMINI_API_KEY environment variable not set');
      return res.status(500).json({
        reply: 'Server Error: API key not configured',
        debug: 'GEMINI_API_KEY missing',
      });
    }

    // Parse request body
    const { messages } = req.body;

    // Validate messages
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      console.error('[ERROR] Invalid messages:', { messages, isArray: Array.isArray(messages), length: messages?.length });
      return res.status(400).json({
        reply: 'Invalid request: messages array required',
        debug: 'Empty or missing messages array',
      });
    }

    // Get latest user message
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || !lastMessage.content) {
      console.error('[ERROR] Invalid last message:', lastMessage);
      return res.status(400).json({
        reply: 'Invalid request: last message must have content',
        debug: 'Message content missing',
      });
    }

    const userPrompt = lastMessage.content;
    console.log('[INFO] User prompt:', userPrompt);

    // Build Gemini request
    const geminiPayload = {
      contents: [
        {
          parts: [
            {
              text: userPrompt,
            },
          ],
        },
      ],
    };

    console.log('[DEBUG] Sending to Gemini:', JSON.stringify(geminiPayload));

    // Call Gemini API
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(geminiPayload),
    });

    console.log('[INFO] Gemini HTTP Status:', geminiResponse.status);

    // Check HTTP status
    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('[ERROR] Gemini API error:', {
        status: geminiResponse.status,
        statusText: geminiResponse.statusText,
        body: errorText,
      });
      return res.status(geminiResponse.status).json({
        reply: `Gemini API Error ${geminiResponse.status}`,
        debug: errorText,
      });
    }

    // Parse JSON response
    const data = await response.json();

console.log("FULL GEMINI RESPONSE:", JSON.stringify(data, null, 2));

const reply =
  data?.candidates?.[0]?.content?.parts?.[0]?.text;

if (!reply) {
  return res.status(200).json({
    reply: "Gemini API returned no text",
    debug: data,
  });
}

return res.status(200).json({ reply });
  } catch (error) {
    console.error('[CRITICAL] Exception caught:', error);
    console.error('[CRITICAL] Error message:', error.message);
    console.error('[CRITICAL] Error stack:', error.stack);

    return res.status(500).json({
      reply: 'Server Error: Internal server error',
      debug: error.message,
    });
  }
}