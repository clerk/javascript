/**
 * Generic in-memory key/value store backing the token cache.
 *
 * Pure storage: no timers, no BroadcastChannel, and no JWT knowledge. The cache
 * layers proactive-refresh scheduling and cross-tab synchronization on top.
 * Synchronous by design — the in-memory path never needs to be async — modelled
 * on auth0-spa-js's synchronous cache interface.
 */
export interface TokenStore<V> {
  get(key: string): V | undefined;
  set(key: string, value: V): void;
  delete(key: string): void;
  clear(): void;
  /**
   * Iterates over every stored entry. Used by the cache to release per-entry
   * timers before clearing.
   */
  forEach(callback: (value: V, key: string) => void): void;
  size(): number;
}

/**
 * Creates an empty in-memory {@link TokenStore} backed by a Map.
 */
export const createTokenStore = <V>(): TokenStore<V> => {
  const map = new Map<string, V>();

  return {
    get: key => map.get(key),
    set: (key, value) => {
      map.set(key, value);
    },
    delete: key => {
      map.delete(key);
    },
    clear: () => {
      map.clear();
    },
    forEach: callback => {
      // Wrap so the underlying Map reference is not leaked as a third argument.
      map.forEach((value, key) => callback(value, key));
    },
    size: () => map.size,
  };
};
