import type { TelemetryClientCacheOptions } from './types';

type TtlInMilliseconds = number;

const DEFAULT_CACHE_TTL_MS = 86400000; // 24 hours

/**
 * Manages caching for telemetry events using the browser's localStorage to
 * mitigate event flooding in frequently executed code paths.
 */
export class TelemetryClientCache {
  #key: TelemetryClientCacheOptions['key'];
  #cacheTtl: NonNullable<TelemetryClientCacheOptions['cacheTtl']>;

  constructor(options: TelemetryClientCacheOptions) {
    this.#key = options.key;
    this.#cacheTtl = options.cacheTtl ?? DEFAULT_CACHE_TTL_MS;
  }

  cacheAndRetrieve(): boolean {
    const now = Date.now();
    const item = this.#getItem();

    if (!item) {
      localStorage.setItem(this.#key, now.toString());
    }

    const hasExpired = item && now - item > this.#cacheTtl;
    if (hasExpired) {
      localStorage.removeItem(this.#key);
    }

    return !!item;
  }

  #getItem(): TtlInMilliseconds | undefined {
    const cacheString = localStorage.getItem(this.#key);

    if (!cacheString) {
      return;
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
    const storage = window['localStorage'];

    if (!storage) {
      return false;
    }

    try {
      const testKey = `__storage_test__`;
      storage.setItem(testKey, testKey);
      storage.removeItem(testKey);

      return true;
    } catch (err) {
      return false;
    }
  }
}
