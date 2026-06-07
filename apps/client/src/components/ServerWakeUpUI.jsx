export default function ServerWakeUpUI({ elapsed, isError, onRefresh }) {
  const titleText = 'Blabber';

  if (isError) {
    return (
      <div className="server-wakeup">
        <h1 className="server-wakeup-title">{titleText}</h1>
        <div className="server-wakeup-card">
          <h2>Unable to connect</h2>
          <p>The server could not be reached. Please try refreshing the page.</p>
          <button className="btn-primary" onClick={onRefresh || (() => window.location.reload())}>
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="server-wakeup">
      <h1 className="server-wakeup-title animated">
        {titleText.split('').map((letter, i) => (
          <span key={i} style={{ animationDelay: `${i * 0.1}s` }}>
            {letter}
          </span>
        ))}
      </h1>
      <div className="server-wakeup-card">
        <div className="loading-spinner" />
        <h2>Starting up...</h2>
        <p>
          {elapsed !== undefined
            ? "The server is waking up from sleep. This usually takes 30–50 seconds on the free tier."
            : "Loading your content..."}
        </p>
        {elapsed !== undefined && <p className="server-wakeup-elapsed">{elapsed}s</p>}
      </div>
    </div>
  );
}
