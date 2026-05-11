import axios from 'axios';

export async function loadChatSession(sessionId, token) {
  const response = await axios.get(`https://hackathon-assistant-tlra.vercel.app/api/chat/session/${sessionId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}
