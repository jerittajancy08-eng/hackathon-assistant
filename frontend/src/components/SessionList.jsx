function SessionList({ sessions, onSelect, selectedSessionId }) {
  if (!sessions.length) {
    return (
      <div className="rounded-3xl border border-slate-700/70 bg-slate-900/80 p-4 text-sm text-slate-400">
        No saved sessions yet. Log in and start chatting to save conversations.
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-700/70 bg-slate-900/80 p-4 text-sm text-slate-100">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm uppercase tracking-[0.35em] text-cyan-400/90">Saved sessions</span>
        <span className="text-xs text-slate-500">Select to resume</span>
      </div>
      <ul className="space-y-3">
        {sessions.map((session) => (
          <li key={session._id}>
            <button
              type="button"
              onClick={() => onSelect(session._id)}
              className={`w-full rounded-3xl border px-4 py-3 text-left transition ${
                selectedSessionId === session._id
                  ? 'border-cyan-500/80 bg-cyan-500/10 text-cyan-100'
                  : 'border-slate-700/70 bg-slate-950/80 text-slate-200 hover:border-cyan-400/70 hover:bg-slate-900/90'
              }`}
            >
              <div className="font-medium">{session.name || 'Hackathon Assistant Chat'}</div>
              <div className="mt-1 text-xs text-slate-500">Updated {new Date(session.updatedAt).toLocaleString()}</div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SessionList;
