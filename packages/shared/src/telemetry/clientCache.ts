import type { TelemetryEventRaw } from './types';

type TtlInMilliseconds = number;

const DEFAULT_CACHE_TTL_MS = 86400000; // 24 hours
/**
 * Manages caching for telemetry events using the browser's localStorage to
 * mitigate event flooding in frequently executed code paths.
 */
export class TelemetryClientCache {
  #storageKey = 'clerk_telemetry';
  #cacheTtl = DEFAULT_CACHE_TTL_MS;

  cacheAndRetrieve(event: TelemetryEventRaw): boolean {
    const now = Date.now();
    const key = this.#generateKey(event);
    const entry = this.#cache?.[key];

    if (!entry) {
      const updatedCache = {
        ...this.#cache,
        [key]: now,
      };

      localStorage.setItem(this.#storageKey, JSON.stringify(updatedCache));
    }

    const shouldInvalidateCache = entry && now - entry > this.#cacheTtl;
    if (shouldInvalidateCache) {
      const updatedCache = this.#cache;
      delete updatedCache[key];

      localStorage.setItem(this.#storageKey, JSON.stringify(updatedCache));
    }

    return !!entry;
  }

  #generateKey({ event, payload }: TelemetryEventRaw): string {
    const payloadUniqueKey = JSON.stringify(
      Object.keys(payload)
        .sort()
        .map(key => payload[key]),
    );

    return `${event}:${payloadUniqueKey}`;
  }

  get #cache(): Record<string, TtlInMilliseconds> | undefined {
    const cacheString = localStorage.getItem(this.#storageKey);

    if (!cacheString) {
      return {};
    }

    return JSON.parse(cacheString);
  }

  /**
   * Checks if the browser's localStorage is supported and writable.
   *
   * If any of these operations fail, it indicates that localStorage is either
   * not supported or not writable (e.g., in cases where the storage is full or
   * the browser is in a privacy mode that restricts localStorage usage).
   */
  get isStorageSupported(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }

    const storage = window['localStorage'];

    if (!storage) {
      return false;
    }

    try {
      const testKey = 'test';
      storage.setItem(testKey, testKey);
      storage.removeItem(testKey);

      return true;
    } catch (err: unknown) {
      const isQuotaExceededError =
        err instanceof DOMException &&
        // Check error names for different browsers
        (err.name === 'QuotaExceededError' || err.name === 'NS_ERROR_DOM_QUOTA_REACHED');

      if (isQuotaExceededError && storage.length > 0) {
        storage.removeItem(this.#storageKey);
      }

      return false;
    }
  }
}
