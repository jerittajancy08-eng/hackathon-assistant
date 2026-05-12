import axios from 'axios';

export async function loadChatSession(sessionId, token) {
  const response = await axios.get(`/api/chat/session/${sessionId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}
