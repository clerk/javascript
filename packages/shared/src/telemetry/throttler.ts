import type { TelemetryEvent } from '../types';

type TtlInMilliseconds = number;

const DEFAULT_CACHE_TTL_MS = 86400000; // 24 hours

/**
 * Interface for cache storage used by the telemetry throttler.
 * Implementations can use localStorage, in-memory storage, or any other storage mechanism.
 */
export interface ThrottlerCache {
  getItem(key: string): TtlInMilliseconds | undefined;
  setItem(key: string, value: TtlInMilliseconds): void;
  removeItem(key: string): void;
}

/**
 * Manages throttling for telemetry events using a configurable cache implementation
 * to mitigate event flooding in frequently executed code paths.
 */
export class TelemetryEventThrottler {
  #cache: ThrottlerCache;
  #cacheTtl = DEFAULT_CACHE_TTL_MS;

  constructor(cache: ThrottlerCache) {
    this.#cache = cache;
  }

  isEventThrottled(payload: TelemetryEvent): boolean {
    const now = Date.now();
    const key = this.#generateKey(payload);
    const entry = this.#cache.getItem(key);

    if (!entry) {
      this.#cache.setItem(key, now);
      return false;
    }

    const shouldInvalidate = now - entry > this.#cacheTtl;
    if (shouldInvalidate) {
      this.#cache.setItem(key, now);
      return false;
    }

    return true;
  }

  /**
   * Generates a consistent unique key for telemetry events by sorting payload properties.
   * This ensures that payloads with identical content in different orders produce the same key.
   */
  #generateKey(event: TelemetryEvent): string {
    const { sk: _sk, pk: _pk, payload, ...rest } = event;

    const sanitizedEvent: Omit<TelemetryEvent, 'sk' | 'pk' | 'payload'> & TelemetryEvent['payload'] = {
      ...payload,
      ...rest,
    };

    return JSON.stringify(
      Object.keys({
        ...payload,
        ...rest,
      })
        .sort()
        .map(key => sanitizedEvent[key]),
    );
  }
}

/**
 * LocalStorage-based cache implementation for browser environments.
 */
export class LocalStorageThrottlerCache implements ThrottlerCache {
  #storageKey = 'clerk_telemetry_throttler';

  getItem(key: string): TtlInMilliseconds | undefined {
    return this.#getCache()[key];
  }

  setItem(key: string, value: TtlInMilliseconds): void {
    try {
      const cache = this.#getCache();
      cache[key] = value;
      localStorage.setItem(this.#storageKey, JSON.stringify(cache));
    } catch (err: unknown) {
      const isQuotaExceededError =
        err instanceof DOMException &&
        // Check error names for different browsers
        (err.name === 'QuotaExceededError' || err.name === 'NS_ERROR_DOM_QUOTA_REACHED');

      if (isQuotaExceededError && localStorage.length > 0) {
        // Clear our cache if quota exceeded
        localStorage.removeItem(this.#storageKey);
      }
    }
  }

  removeItem(key: string): void {
    try {
      const cache = this.#getCache();
      delete cache[key];
      localStorage.setItem(this.#storageKey, JSON.stringify(cache));
    } catch {
      // Silently fail if we can't remove
    }
  }

  #getCache(): Record<string, TtlInMilliseconds> {
    try {
      const cacheString = localStorage.getItem(this.#storageKey);
      if (!cacheString) {
        return {};
      }
      return JSON.parse(cacheString);
    } catch {
      return {};
    }
  }

  static isSupported(): boolean {
    return typeof window !== 'undefined' && !!window.localStorage;
  }
}

/**
 * In-memory cache implementation for non-browser environments (e.g., React Native).
 */
export class InMemoryThrottlerCache implements ThrottlerCache {
  #cache: Map<string, TtlInMilliseconds> = new Map();
  #maxSize = 10000; // Defensive limit to prevent memory issues

  getItem(key: string): TtlInMilliseconds | undefined {
    // Defensive: clear cache if it gets too large
    if (this.#cache.size > this.#maxSize) {
      this.#cache.clear();
      return undefined;
    }

    return this.#cache.get(key);
  }

  setItem(key: string, value: TtlInMilliseconds): void {
    this.#cache.set(key, value);
  }

  removeItem(key: string): void {
    this.#cache.delete(key);
  }
}
