function LoadingSpinner() {
  return (
    <div className="flex items-center gap-2">
      <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 animate-pulse" />
      <span
        className="h-2.5 w-2.5 rounded-full bg-cyan-400 animate-pulse"
        style={{ animationDelay: '0.15s' }}
      />
      <span
        className="h-2.5 w-2.5 rounded-full bg-cyan-400 animate-pulse"
        style={{ animationDelay: '0.3s' }}
      />
    </div>
  );
}

export default LoadingSpinner;
