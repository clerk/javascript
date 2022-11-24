import type { TokenResource } from '@clerk/types';

import { clerkCoreErrorExpiredToken } from './errors';

interface TokenCacheKeyJSON {
  audience?: string;
  tokenId: string;
}

interface TokenCacheEntry extends TokenCacheKeyJSON {
  tokenResolver: Promise<TokenResource>;
}

interface TokenCacheValue {
  entry: TokenCacheEntry;
  expiresAt?: number;
  expiresIn?: number;
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

export class TokenCacheKey {
  static fromKey(key: string): TokenCacheKey {
    const [prefix, tokenId, audience = ''] = key.split(DELIMITER);
    return new TokenCacheKey(prefix, { audience, tokenId });
  }

  constructor(public prefix: string, public data: TokenCacheKeyJSON) {
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

  const size = () => {
    return cache.size;
  };

  const clear = () => {
    cache.clear();
  };

  const set = (entry: TokenCacheEntry) => {
    const cacheKey = new TokenCacheKey(prefix, {
      audience: entry.audience,
      tokenId: entry.tokenId,
    });

    const key = cacheKey.toKey();
    const value: TokenCacheValue = { entry };

    const deleteKey = () => {
      if (cache.get(key) === value) {
        cache.delete(key);
      }
    };

    entry.tokenResolver
      .then(newToken => {
        const nowSeconds = Math.floor(Date.now() / 1000);
        const expiresAt = newToken.jwt.claims.exp;
        const expiresIn = expiresAt - nowSeconds;

        if (expiresIn <= 0) {
          clerkCoreErrorExpiredToken(expiresAt);
        }

        // Mutate cached value and set expirations
        value.expiresAt = expiresAt;
        value.expiresIn = expiresIn;
        setTimeout(deleteKey, expiresIn * 1000);
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
    const willExpireSoon = value.expiresAt && value.expiresAt - leeway < nowSeconds;

    if (willExpireSoon) {
      cache.delete(cacheKey.toKey());
      return;
    }

    return value.entry;
  };

  return { get, set, clear, size };
};

export const SessionTokenCache = MemoryTokenCache();
