import { useEffect, useState } from 'react';

export function useSetTimeout<T>(value: T, delayInMs?: number): T {
  const [timer, setTimer] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setTimer(value), delayInMs || 500);

    return () => {
      clearTimeout(timer);
    };
  }, [JSON.stringify(value), delayInMs]);

  return timer;
}
