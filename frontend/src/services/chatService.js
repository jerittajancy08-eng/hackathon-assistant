import axios from 'axios';

export async function sendChatMessage(messages, sessionId, token) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await axios.post(
  '/api/chat',
  { messages, sessionId },
  { headers }
);
  console.log(response.data);
  return response.data;
}
