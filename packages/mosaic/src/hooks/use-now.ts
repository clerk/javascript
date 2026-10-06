import { useEffect, useState } from 'react';

export function useNow({ updateInterval }: { updateInterval?: number } = {}): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (updateInterval === undefined) {
      return;
    }
    const id = window.setInterval(() => setNow(new Date()), updateInterval);
    return () => window.clearInterval(id);
  }, [updateInterval]);

  return now;
}
