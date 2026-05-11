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
    const data = await geminiResponse.json();
    console.log('[DEBUG] Gemini response:', JSON.stringify(data, null, 2));

    // Check for API error in response body
    if (data.error) {
      console.error('[ERROR] Gemini error in response:', data.error);
      return res.status(400).json({
        reply: `Gemini Error: ${data.error.message || 'Unknown error'}`,
        debug: data.error,
      });
    }

    // Validate response structure
    if (!data.candidates) {
      console.error('[ERROR] No candidates in Gemini response');
      return res.status(500).json({
        reply: 'Gemini API Error: No candidates in response',
        debug: 'Response structure invalid',
        raw: data,
      });
    }

    if (data.candidates.length === 0) {
      console.error('[ERROR] Candidates array is empty');
      return res.status(500).json({
        reply: 'Gemini API Error: Empty candidates array',
        debug: 'No response from Gemini',
        raw: data,
      });
    }

    // Extract text from first candidate
    const candidate = data.candidates[0];
    console.log('[DEBUG] First candidate:', JSON.stringify(candidate, null, 2));

    if (!candidate.content) {
      console.error('[ERROR] No content in candidate');
      return res.status(500).json({
        reply: 'Gemini API Error: No content in candidate',
        debug: 'Content missing',
        candidate,
      });
    }

    if (!candidate.content.parts || candidate.content.parts.length === 0) {
      console.error('[ERROR] No parts in content');
      return res.status(500).json({
        reply: 'Gemini API Error: No parts in content',
        debug: 'Parts array empty',
        content: candidate.content,
      });
    }

    const textPart = candidate.content.parts[0];
    if (!textPart.text) {
      console.error('[ERROR] No text in part');
      return res.status(500).json({
        reply: 'Gemini API Error: No text in response part',
        debug: 'Text field missing',
        part: textPart,
      });
    }

    const reply = textPart.text;
    console.log('[INFO] Successfully extracted reply');

    // Return success
    return res.status(200).json({
      reply,
      sessionId: req.body.sessionId || null,
    });

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