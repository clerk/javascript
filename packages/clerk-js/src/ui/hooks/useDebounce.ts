import { useEffect, useState } from 'react';

export function useDebounce<T>(value: T, delayInMs?: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedValue(value);
    }, delayInMs || 500);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [JSON.stringify(value), delayInMs]);

  return debouncedValue;
}
