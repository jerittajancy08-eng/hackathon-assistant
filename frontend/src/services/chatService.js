import axios from 'axios';

export async function sendChatMessage(messages, sessionId, token) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await axios.post(
    'https://hackathon-assistant-9mlv-y837s1wbn.vercel.app/api/chat',
    { messages, sessionId },
    { headers }
  );
  console.log(response.data);
  return response.data;
}
