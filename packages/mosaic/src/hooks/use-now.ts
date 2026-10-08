import { createContext, useContext, useEffect, useState } from 'react';

const MosaicNowContext = createContext<Date | null>(null);

export const MosaicNowProvider = MosaicNowContext.Provider;

export function useNow({ updateInterval }: { updateInterval?: number } = {}): Date {
  const providerNow = useContext(MosaicNowContext);
  const [now, setNow] = useState(() => providerNow ?? new Date());

  useEffect(() => {
    if (updateInterval === undefined) {
      return;
    }
    const id = window.setInterval(() => setNow(new Date()), updateInterval);
    return () => window.clearInterval(id);
  }, [updateInterval]);

  return now;
}
