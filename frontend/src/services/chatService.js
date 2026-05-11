import axios from 'axios';

export async function sendChatMessage(messages, sessionId, token) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await axios.post(
    'https://hackathon-assistant-tlra.vercel.app/api/chat',
    { messages, sessionId },
    { headers }
  );
  return response.data;
}
