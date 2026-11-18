'use client';

import { useContext, useEffect, useState } from 'react';

import { MosaicNowContext } from './now-context';

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
