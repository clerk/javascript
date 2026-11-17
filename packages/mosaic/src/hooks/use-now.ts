import { createContext, useContext, useEffect, useState } from 'react';

const MosaicNowContext = createContext<Date | null>(null);

export const MosaicNowProvider = MosaicNowContext.Provider;

export function useNow({ updateInterval, until }: { updateInterval?: number; until?: number } = {}): Date {
  const providerNow = useContext(MosaicNowContext);
  const [now, setNow] = useState(() => providerNow ?? new Date());
  const reachedUntil = until !== undefined && now.getTime() >= until;

  useEffect(() => {
    if (updateInterval === undefined || reachedUntil) {
      return;
    }
    const id = window.setInterval(() => setNow(new Date()), updateInterval);
    return () => window.clearInterval(id);
  }, [updateInterval, reachedUntil, until]);

  return now;
}
