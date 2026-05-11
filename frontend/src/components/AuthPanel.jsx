import { useState } from 'react';

function AuthPanel({ onAuthSuccess, onLogout, user }) {
  const [mode, setMode] = useState('login');
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const submitForm = async (event) => {
    event.preventDefault();
    setError('');

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/signup';
      const payload = { email: formData.email, password: formData.password };
      if (mode === 'signup') payload.name = formData.name;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      onAuthSuccess(data.user, data.token);
      setFormData({ name: '', email: '', password: '' });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className="mb-4 rounded-3xl border border-slate-700/70 bg-slate-900/80 p-4 shadow-xl shadow-slate-950/40">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-400/90">Member access</p>
          <h3 className="mt-2 text-lg font-semibold text-white">{user ? `Welcome back, ${user.name}` : 'Sign in to save chats'}</h3>
        </div>
        {user ? (
          <button onClick={onLogout} className="rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-red-400">
            Logout
          </button>
        ) : (
          <div className="flex gap-2 rounded-full bg-slate-800/80 px-3 py-2 text-xs text-slate-300">
            <button type="button" onClick={() => setMode('login')} className={mode === 'login' ? 'font-semibold text-white' : 'text-slate-400'}>
              Login
            </button>
            <button type="button" onClick={() => setMode('signup')} className={mode === 'signup' ? 'font-semibold text-white' : 'text-slate-400'}>
              Signup
            </button>
          </div>
        )}
      </div>

      {!user && (
        <form onSubmit={submitForm} className="mt-4 grid gap-4">
          {mode === 'signup' && (
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Full name"
              className="rounded-3xl border border-slate-700/80 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
            />
          )}
          <input
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email address"
            type="email"
            className="rounded-3xl border border-slate-700/80 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
          />
          <input
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            type="password"
            className="rounded-3xl border border-slate-700/80 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
          />
          {error && <p className="text-sm text-red-300">{error}</p>}
          <button type="submit" className="rounded-full bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">
            {mode === 'login' ? 'Login' : 'Create account'}
          </button>
        </form>
      )}
    </section>
  );
}

export default AuthPanel;
