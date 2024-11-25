import type { TokenResource } from '@clerk/types';

interface TokenCacheKeyJSON {
  audience?: string;
  tokenId: string;
}

interface TokenCacheEntry extends TokenCacheKeyJSON {
  tokenResolver: Promise<TokenResource>;
}

type Seconds = number;

interface TokenCacheValue {
  entry: TokenCacheEntry;
  createdAt: Seconds;
  expiresIn?: Seconds;
}

interface TokenCache {
  set(entry: TokenCacheEntry): void;
  get(cacheKeyJSON: TokenCacheKeyJSON, leeway?: number): TokenCacheEntry | undefined;
  clear(): void;
  size(): number;
}

const KEY_PREFIX = 'clerk';
const DELIMITER = '::';
const LEEWAY = 10;
// This value should have the same value as the INTERVAL_IN_MS in SessionCookiePoller
const SYNC_LEEWAY = 5;

export class TokenCacheKey {
  static fromKey(key: string): TokenCacheKey {
    const [prefix, tokenId, audience = ''] = key.split(DELIMITER);
    return new TokenCacheKey(prefix, { audience, tokenId });
  }

  constructor(
    public prefix: string,
    public data: TokenCacheKeyJSON,
  ) {
    this.prefix = prefix;
    this.data = data;
  }

  toKey(): string {
    const { tokenId, audience } = this.data;
    return [this.prefix, tokenId, audience || ''].join(DELIMITER);
  }
}

const MemoryTokenCache = (prefix = KEY_PREFIX): TokenCache => {
  const cache = new Map<string, TokenCacheValue>();

  let timer: ReturnType<typeof setTimeout>;

  const size = () => {
    return cache.size;
  };

  const clear = () => {
    clearTimeout(timer);
    cache.clear();
  };

  const set = (entry: TokenCacheEntry) => {
    const cacheKey = new TokenCacheKey(prefix, {
      audience: entry.audience,
      tokenId: entry.tokenId,
    });

    const key = cacheKey.toKey();

    const createdAt = Math.floor(Date.now() / 1000);
    const value: TokenCacheValue = { entry, createdAt };

    const deleteKey = () => {
      if (cache.get(key) === value) {
        cache.delete(key);
      }
    };

    entry.tokenResolver
      .then(newToken => {
        if (!newToken.jwt) {
          return deleteKey();
        }

        const expiresAt = newToken.jwt.claims.exp;
        const issuedAt = newToken.jwt.claims.iat;
        const expiresIn: Seconds = expiresAt - issuedAt;

        // Mutate cached value and set expirations
        value.expiresIn = expiresIn;
        timer = setTimeout(deleteKey, expiresIn * 1000);

        // Teach ClerkJS not to block the exit of the event loop when used in Node environments.
        // More info at https://nodejs.org/api/timers.html#timeoutunref
        if (typeof timer.unref === 'function') {
          timer.unref();
        }
      })
      .catch(() => {
        deleteKey();
      });

    cache.set(key, value);
  };

  const get = (cacheKeyJSON: TokenCacheKeyJSON, leeway = LEEWAY): TokenCacheEntry | undefined => {
    const cacheKey = new TokenCacheKey(prefix, cacheKeyJSON);
    const value = cache.get(cacheKey.toKey());

    if (!value) {
      return;
    }

    const nowSeconds = Math.floor(Date.now() / 1000);
    const elapsedSeconds = nowSeconds - value.createdAt;
    // We will include the authentication poller interval as part of the leeway to ensure
    // that the cache value will be valid for more than the SYNC_LEEWAY or the leeway in the next poll.
    const expiresSoon = value.expiresIn! - elapsedSeconds < (leeway || 1) + SYNC_LEEWAY;

    if (expiresSoon) {
      cache.delete(cacheKey.toKey());
      return;
    }

    return value.entry;
  };

  return { get, set, clear, size };
};

export const SessionTokenCache = MemoryTokenCache();
