import type { MosaicLocation } from './location';

export function createMemoryLocation(initialPath = ''): MosaicLocation {
  let current = initialPath;
  const listeners = new Set<() => void>();

  return {
    read: () => current,
    write: to => {
      current = to;
      for (const listener of listeners) {
        listener();
      }
      return Promise.resolve();
    },
    subscribe: listener => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
