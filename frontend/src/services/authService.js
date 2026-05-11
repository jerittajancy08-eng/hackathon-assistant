import axios from 'axios';

export async function signup(payload) {
  const response = await axios.post('/api/auth/signup', payload);
  return response.data;
}

export async function login(payload) {
  const response = await axios.post('/api/auth/login', payload);
  return response.data;
}

export async function fetchProfile(token) {
  const response = await axios.get('/api/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function fetchSessions(token) {
  const response = await axios.get('/api/auth/sessions', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}
