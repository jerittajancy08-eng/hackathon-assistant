function HackathonCard({ hackathon }) {
    if (!hackathon) return null;
  return (
    <div className="group rounded-[1.75rem] border border-white/10 bg-slate-900/80 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.65)] transition duration-300 hover:-translate-y-1 hover:border-cyan-500/30 hover:bg-slate-900/95">
      <div className="flex flex-col gap-4">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300/80">{hackathon.domain?.toUpperCase() || "GENERAL"}</span>
            {String(hackathon.beginnerFriendly || '').toLowerCase() === 'yes' && (
              <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-cyan-200">
                Beginner-friendly
              </span>
            )}
          </div>
          <h3 className="text-lg font-semibold text-slate-50 transition-colors duration-300 group-hover:text-cyan-100">
            {hackathon.title}
          </h3>
        </div>

        <div className="grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
          <div className="rounded-3xl border border-slate-800/80 bg-slate-950/60 p-3">
            <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Location</p>
            <p className="mt-1 font-medium text-slate-100">{hackathon.location || "Unknown"}</p>
          </div>
          <div className="rounded-3xl border border-slate-800/80 bg-slate-950/60 p-3">
            <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Start Date</p>
            <p className="mt-1 font-medium text-slate-100">{hackathon.date || "TBD"}</p>
          </div>
        </div>

        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-300">
            <span className="font-semibold text-slate-100">Mode:</span> {String(hackathon.location || '').toLowerCase().includes('online')
  ? 'Online'
  : 'Offline'}
          </div>
          {hackathon.url ? (
            <a
              href={hackathon.url || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 hover:text-slate-950"
            >
              Visit
            </a>
          ) : (
            <button className="inline-flex cursor-not-allowed items-center justify-center rounded-full border border-slate-700/70 bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-500" disabled>
              No link
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default HackathonCard;
