import type { TelemetryEvent } from '@clerk/types';

type TtlInMilliseconds = number;

const DEFAULT_CACHE_TTL_MS = 86400000; // 24 hours

/**
 * Manages throttling for telemetry events using the browser's localStorage to
 * mitigate event flooding in frequently executed code paths.
 */
export class TelemetryEventThrottler {
  #storageKey = 'clerk_telemetry_throttler';
  #cacheTtl = DEFAULT_CACHE_TTL_MS;

  isEventThrottled(payload: TelemetryEvent): boolean {
    if (!this.#isValidBrowser) {
      return false;
    }

    const now = Date.now();
    const key = this.#generateKey(payload);
    const entry = this.#cache?.[key];

    if (!entry) {
      const updatedCache = {
        ...this.#cache,
        [key]: now,
      };

      localStorage.setItem(this.#storageKey, JSON.stringify(updatedCache));
    }

    const shouldInvalidate = entry && now - entry > this.#cacheTtl;
    if (shouldInvalidate) {
      const updatedCache = this.#cache;
      delete updatedCache[key];

      localStorage.setItem(this.#storageKey, JSON.stringify(updatedCache));
    }

    return !!entry;
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
  get #isValidBrowser(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }

    const storage = window.localStorage;
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
