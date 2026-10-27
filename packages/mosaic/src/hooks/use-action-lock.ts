import { useRef, useState } from 'react';

export interface ActionLock {
  isPending: boolean;
  tryRun: <T>(action: () => T | Promise<T>) => Promise<T> | undefined;
}

export function useActionLock(): ActionLock {
  const running = useRef(false);
  const [isPending, setIsPending] = useState(false);

  const tryRun = <T>(action: () => T | Promise<T>): Promise<T> | undefined => {
    if (running.current) {
      return undefined;
    }
    running.current = true;
    setIsPending(true);
    return (async () => {
      try {
        return await action();
      } finally {
        running.current = false;
        setIsPending(false);
      }
    })();
  };

  return { isPending, tryRun };
}
