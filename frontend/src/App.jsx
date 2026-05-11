import { useEffect, useState } from 'react';
import ChatBot from './components/ChatBot';
import AuthPanel from './components/AuthPanel';
import SessionList from './components/SessionList';
import { defaultMessages } from './utils/constants';
import { fetchProfile, fetchSessions } from './services/authService';
import { loadChatSession } from './services/sessionService';

function App() {
  const [messages, setMessages] = useState(defaultMessages);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('hackathon_token') || '');
  const [sessions, setSessions] = useState([]);
  const [sessionId, setSessionId] = useState(localStorage.getItem('hackathon_sessionId') || '');

  useEffect(() => {
    document.body.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    if (!token) return;
    restoreSession(token);
  }, [token]);

  useEffect(() => {
    if (sessionId) {
      localStorage.setItem('hackathon_sessionId', sessionId);
    } else {
      localStorage.removeItem('hackathon_sessionId');
    }
  }, [sessionId]);

  async function restoreSession(authToken) {
    try {
      const profileData = await fetchProfile(authToken);
      setUser(profileData.user);
      await loadSavedSessions(authToken);
    } catch (error) {
      console.warn('Unable to restore session:', error.message);
      handleLogout();
    }
  }

  async function loadSavedSessions(authToken) {
    try {
      const sessionData = await fetchSessions(authToken);
      setSessions(sessionData.sessions);
    } catch (error) {
      console.warn('Unable to load saved sessions:', error.message);
    }
  }

  const handleAuthSuccess = async (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('hackathon_token', authToken);
    await loadSavedSessions(authToken);
  };

  function handleLogout() {
    setUser(null);
    setToken('');
    setSessions([]);
    setSessionId('');
    setMessages(defaultMessages);
    localStorage.removeItem('hackathon_token');
    localStorage.removeItem('hackathon_sessionId');
  }

  const handleSessionSelect = async (selectedSessionId) => {
    if (!token) return;
    try {
      const data = await loadChatSession(selectedSessionId, token);
      setMessages(data.session.messages);
      setSessionId(selectedSessionId);
    } catch (error) {
      console.error('Unable to load session:', error.message);
    }
  };

  const handleSaveSession = (newSessionId) => {
    setSessionId(newSessionId);
    if (!sessions.some((session) => session._id === newSessionId)) {
      loadSavedSessions(token);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 antialiased">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 flex flex-col gap-4 rounded-3xl border border-slate-700/60 bg-slate-900/80 px-5 py-4 shadow-glow backdrop-blur-lg sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-cyan-400/90">Hackathon Assistant</p>
            <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">
              Discover hackathons, build teams, and launch projects.
            </h1>
          </div>
          <button
            onClick={() => setIsDarkMode((prev) => !prev)}
            className="rounded-full border border-slate-700/60 bg-slate-800 px-4 py-2 text-sm text-slate-100 transition hover:border-cyan-400 hover:text-cyan-200"
          >
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </header>

        <main className="flex-1 space-y-6 rounded-[2rem] border border-slate-700/60 bg-slate-900/70 p-4 shadow-glow backdrop-blur-xl sm:p-6">
          <AuthPanel onAuthSuccess={handleAuthSuccess} onLogout={handleLogout} user={user} />

          {user && (
            <SessionList sessions={sessions} onSelect={handleSessionSelect} selectedSessionId={sessionId} />
          )}

          <div className="rounded-[2rem] border border-slate-700/60 bg-slate-950/90 p-4 shadow-xl shadow-slate-900/30 sm:p-6">
            <ChatBot
              messages={messages}
              setMessages={setMessages}
              authToken={token}
              sessionId={sessionId}
              onSaveSession={handleSaveSession}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
