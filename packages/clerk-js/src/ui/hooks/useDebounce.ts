import { useEffect, useState } from 'react';

export function useDebounce<T>(value: T, delayInMs?: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const [timeoutState, setTimeoutState] = useState<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const handleDebounce = () => {
      if (timeoutState) {
        clearTimeout(timeoutState);
        setTimeoutState(undefined);
      }

      setTimeoutState(
        setTimeout(() => {
          setDebouncedValue(value);
          setTimeoutState(undefined);
        }, delayInMs || 500),
      );
    };

    handleDebounce();
    return () => {
      if (timeoutState) {
        clearTimeout(timeoutState);
        setTimeoutState(undefined);
      }
    };
  }, [JSON.stringify(value), delayInMs]);

  return debouncedValue;
}
