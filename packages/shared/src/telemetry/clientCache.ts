import type { TelemetryClientCacheOptions } from './types';

type TtlInMilliseconds = number;

const DEFAULT_CACHE_TTL_MS = 86400000; // 24 hours

export class TelemetryClientCache {
  #key: TelemetryClientCacheOptions['key'];
  #cacheTtl: NonNullable<TelemetryClientCacheOptions['cacheTtl']>;

  constructor(options: TelemetryClientCacheOptions) {
    this.#key = options.key;
    this.#cacheTtl = options.cacheTtl ?? DEFAULT_CACHE_TTL_MS;
  }

  cacheAndRetrieve() {
    const now = Date.now();
    const item = this.#getItem();

    if (!item) {
      localStorage.setItem(this.#key, now.toString());
    }

    const isExpired = item && now - item > this.#cacheTtl;
    if (isExpired) {
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
}
