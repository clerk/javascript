import React from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  key = 'clerk:' + key;
  const [storedValue, setStoredValue] = React.useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = React.useCallback((value: ((stored: T) => T) | T) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  }, []);

  return [storedValue, setValue] as const;
}
