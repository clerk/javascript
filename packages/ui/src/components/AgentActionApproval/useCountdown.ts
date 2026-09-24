import { useEffect, useState } from 'react';

export function useCountdown(expiresAt: number, paused = false) {
  const [now, setNow] = useState(Date.now);

  useEffect(() => {
    if (paused) {
      return;
    }

    const interval = window.setInterval(() => setNow(Date.now()), 1_000);
    return () => window.clearInterval(interval);
  }, [expiresAt, paused]);

  const remaining = Math.max(0, expiresAt - now);
  return { remaining, isExpired: remaining === 0 };
}

export function formatRemainingTime(milliseconds: number): string {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1_000));
  const hours = Math.floor(totalSeconds / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}
