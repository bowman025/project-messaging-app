import { useState, useEffect } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? '';

export default function ServerWakeUp({ children }) {
  const [status, setStatus] = useState('checking'); // checking | awake | error
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 30; // 60 seconds max
    let timer;

    const ping = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/health`);
        if (res.ok) {
          setStatus('awake');
          return;
        }
      } catch (_err) {
        // server not ready yet
      }

      attempts++;
      if (attempts >= maxAttempts) {
        setStatus('error');
        return;
      }

      timer = setTimeout(ping, 2000);
    };

    ping();

    const elapsedTimer = setInterval(() => {
      setElapsed((e) => e + 1);
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(elapsedTimer);
    };
  }, []);

  if (status === 'awake') return children;

  const titleText = 'Blabber';

  if (status === 'error') {
    return (
      <div className="server-wakeup">
        <h1 className="server-wakeup-title">{titleText}</h1>
        <div className="server-wakeup-card">
          <h2>Unable to connect</h2>
          <p>The server could not be reached. Please try refreshing the page.</p>
          <button className="btn-primary" onClick={() => window.location.reload()}>
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
          The server is waking up from sleep. This usually takes 30–50 seconds on the free tier.
        </p>
        <p className="server-wakeup-elapsed">{elapsed}s</p>
      </div>
    </div>
  );
}
