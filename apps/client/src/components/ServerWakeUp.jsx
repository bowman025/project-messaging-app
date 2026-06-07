import { useState, useEffect } from 'react';
import ServerWakeUpUI from './ServerWakeUpUI.jsx';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? '';

export default function ServerWakeUp({ children }) {
  const [status, setStatus] = useState('checking'); // checking | awake | error
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 30;
    let timer;

    const ping = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/health`);
        if (res.ok) {
          setStatus('awake');
          return;
        }
      } catch (_err) {
        //server not ready yet
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

  return (
    <ServerWakeUpUI
      elapsed={elapsed}
      isError={status === 'error'}
      onRefresh={() => window.location.reload()}
    />
  );
}
