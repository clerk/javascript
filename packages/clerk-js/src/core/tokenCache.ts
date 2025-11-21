import type { TokenResource } from '@clerk/shared/types';

import { debugLogger } from '@/utils/debug';
import { TokenId } from '@/utils/tokenId';

import { Token } from './resources/internal';

/**
 * Identifies a cached token entry by tokenId and optional audience.
 */
interface TokenCacheKeyJSON {
  audience?: string;
  tokenId: string;
}

/**
 * Cache entry containing token metadata and resolver.
 * Extends TokenCacheKeyJSON with additional properties for expiration tracking and token retrieval.
 */
interface TokenCacheEntry extends TokenCacheKeyJSON {
  /**
   * Timestamp in seconds since UNIX epoch when the entry was created.
   * Used for expiration and cleanup scheduling.
   */
  createdAt?: Seconds;
  /**
   * Promise that resolves to the TokenResource.
   * May be pending and should be awaited before accessing token data.
   */
  tokenResolver: Promise<TokenResource>;
}

type Seconds = number;

/**
 * Internal cache value containing the entry, expiration metadata, and cleanup timer.
 */
interface TokenCacheValue {
  createdAt: Seconds;
  entry: TokenCacheEntry;
  expiresIn?: Seconds;
  timeoutId?: ReturnType<typeof setTimeout>;
}

export interface TokenCache {
  /**
   * Removes all cached entries and clears associated timeouts.
   * Side effects: Clears all scheduled expiration timers and empties the cache.
   */
  clear(): void;

  /**
   * Closes the BroadcastChannel connection and releases resources.
   * Side effects: Disconnects from multi-tab synchronization channel.
   */
  close(): void;

  /**
   * Retrieves a cached token entry if it exists and has not expired.
   *
   * @param cacheKeyJSON - Object containing tokenId and optional audience to identify the cached entry
   * @param leeway - Optional seconds before expiration to treat token as expired (default: 10s). Combined with 5s sync leeway.
   * @returns The cached TokenCacheEntry if found and valid, undefined otherwise
   */
  get(cacheKeyJSON: TokenCacheKeyJSON, leeway?: number): TokenCacheEntry | undefined;

  /**
   * Stores a token entry in the cache and broadcasts to other tabs when the token resolves.
   *
   * @param entry - TokenCacheEntry containing tokenId, tokenResolver, and optional audience
   * Side effects: Schedules automatic expiration cleanup, broadcasts to other tabs when token resolves
   */
  set(entry: TokenCacheEntry): void;

  /**
   * Returns the current number of cached entries.
   *
   * @returns The count of entries currently stored in the cache
   */
  size(): number;
}

const KEY_PREFIX = 'clerk';
const DELIMITER = '::';
const LEEWAY = 10;
// This value should have the same value as the INTERVAL_IN_MS in SessionCookiePoller
const SYNC_LEEWAY = 5;

const BROADCAST = { broadcast: true };
const NO_BROADCAST = { broadcast: false };

/**
 * Converts between cache key objects and string representations.
 * Format: `prefix::tokenId::audience`
 */
export class TokenCacheKey {
  /**
   * Parses a cache key string into a TokenCacheKey instance.
   */
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

  /**
   * Converts the key to its string representation for Map storage.
   */
  toKey(): string {
    const { tokenId, audience } = this.data;
    return [this.prefix, tokenId, audience || ''].join(DELIMITER);
  }
}

/**
 * Message format for BroadcastChannel token synchronization between tabs.
 */
interface SessionTokenEvent {
  organizationId?: string | null;
  sessionId: string;
  template?: string;
  tokenId: string;
  tokenRaw: string;
  traceId: string;
}

const generateTabId = (): string => {
  return Math.random().toString(36).slice(2);
};

/**
 * Creates an in-memory token cache with optional BroadcastChannel synchronization across tabs.
 * Automatically manages token expiration and cleanup via scheduled timeouts.
 * BroadcastChannel support is enabled only in the channel build variant.
 */
const MemoryTokenCache = (prefix = KEY_PREFIX): TokenCache => {
  const cache = new Map<string, TokenCacheValue>();
  const tabId = generateTabId();

  let broadcastChannel: BroadcastChannel | null = null;

  const ensureBroadcastChannel = (): BroadcastChannel | null => {
    if (!__BUILD_VARIANT_CHANNEL__) {
      return null;
    }

    if (broadcastChannel) {
      return broadcastChannel;
    }

    if (typeof BroadcastChannel !== 'undefined') {
      broadcastChannel = new BroadcastChannel('clerk:session_token');
      broadcastChannel.addEventListener('message', (e: MessageEvent<SessionTokenEvent>) => {
        void handleBroadcastMessage(e);
      });
    }

    return broadcastChannel;
  };

  ensureBroadcastChannel();

  const clear = () => {
    cache.forEach(value => {
      if (value.timeoutId !== undefined) {
        clearTimeout(value.timeoutId);
      }
    });
    cache.clear();
  };

  const get = (cacheKeyJSON: TokenCacheKeyJSON, leeway = LEEWAY): TokenCacheEntry | undefined => {
    ensureBroadcastChannel();

    const cacheKey = new TokenCacheKey(prefix, cacheKeyJSON);
    const value = cache.get(cacheKey.toKey());

    if (!value) {
      return;
    }

    const nowSeconds = Math.floor(Date.now() / 1000);
    const elapsed = nowSeconds - value.createdAt;

    // Include poller interval as part of the leeway to ensure the cache value
    // will be valid for more than the SYNC_LEEWAY or the leeway in the next poll.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const expiresSoon = value.expiresIn! - elapsed < (leeway || 1) + SYNC_LEEWAY;

    if (expiresSoon) {
      if (value.timeoutId !== undefined) {
        clearTimeout(value.timeoutId);
      }
      cache.delete(cacheKey.toKey());
      return;
    }

    return value.entry;
  };

  /**
   * Processes token updates from other tabs via BroadcastChannel.
   * Validates token ID, parses JWT, and updates cache if token is newer than existing entry.
   */
  const handleBroadcastMessage = async ({ data }: MessageEvent<SessionTokenEvent>) => {
    const expectedTokenId = TokenId.build(data.sessionId, data.template, data.organizationId);
    if (data.tokenId !== expectedTokenId) {
      debugLogger.warn(
        'Ignoring token broadcast with mismatched tokenId',
        {
          expectedTokenId,
          organizationId: data.organizationId,
          receivedTokenId: data.tokenId,
          tabId,
          template: data.template,
          traceId: data.traceId,
        },
        'tokenCache',
      );
      return;
    }

    let token: Token;
    try {
      token = new Token({ id: data.tokenId, jwt: data.tokenRaw, object: 'token' });
    } catch (error) {
      debugLogger.warn(
        'Failed to parse token from broadcast, skipping cache update',
        { error, tabId, tokenId: data.tokenId, traceId: data.traceId },
        'tokenCache',
      );
      return;
    }

    const iat = token.jwt?.claims?.iat;
    const exp = token.jwt?.claims?.exp;
    if (!iat || !exp) {
      debugLogger.warn(
        'Token missing iat/exp claim, skipping cache update',
        { tabId, tokenId: data.tokenId, traceId: data.traceId },
        'tokenCache',
      );
      return;
    }

    try {
      const existingEntry = get({ tokenId: data.tokenId });
      if (existingEntry) {
        const existingToken = await existingEntry.tokenResolver;
        const existingIat = existingToken.jwt?.claims?.iat;
        if (existingIat && existingIat >= iat) {
          debugLogger.debug(
            'Ignoring older token broadcast',
            { existingIat, incomingIat: iat, tabId, tokenId: data.tokenId, traceId: data.traceId },
            'tokenCache',
          );
          return;
        }
      }
    } catch (error) {
      debugLogger.warn(
        'Existing entry compare failed; proceeding with broadcast update',
        { error, tabId, tokenId: data.tokenId, traceId: data.traceId },
        'tokenCache',
      );
    }

    debugLogger.info(
      'Updating token cache from broadcast',
      {
        iat,
        organizationId: data.organizationId,
        tabId,
        template: data.template,
        tokenId: data.tokenId,
        traceId: data.traceId,
      },
      'tokenCache',
    );

    setInternal(
      {
        createdAt: iat,
        tokenId: data.tokenId,
        tokenResolver: Promise.resolve(token),
      },
      NO_BROADCAST,
    );
  };

  const set = (entry: TokenCacheEntry) => {
    ensureBroadcastChannel();

    setInternal(entry, BROADCAST);
  };

  /**
   * Internal cache setter that stores an entry and schedules expiration cleanup.
   * Resolves the token promise to extract expiration claims and set a deletion timeout.
   *
   * @param entry - The token cache entry to store
   * @param options - Configuration for cache behavior; broadcast controls whether to notify other tabs
   */
  const setInternal = (entry: TokenCacheEntry, options: { broadcast: boolean } = BROADCAST) => {
    const cacheKey = new TokenCacheKey(prefix, {
      audience: entry.audience,
      tokenId: entry.tokenId,
    });

    const key = cacheKey.toKey();

    const nowSeconds = Math.floor(Date.now() / 1000);
    const createdAt = entry.createdAt ?? nowSeconds;
    const value: TokenCacheValue = { createdAt, entry, expiresIn: undefined };

    const deleteKey = () => {
      const cachedValue = cache.get(key);
      if (cachedValue === value) {
        if (cachedValue.timeoutId !== undefined) {
          clearTimeout(cachedValue.timeoutId);
        }
        cache.delete(key);
      }
    };

    entry.tokenResolver
      .then(newToken => {
        const claims = newToken.jwt?.claims;
        if (!claims || typeof claims.exp !== 'number' || typeof claims.iat !== 'number') {
          return deleteKey();
        }

        const expiresAt = claims.exp;
        const issuedAt = claims.iat;
        const expiresIn: Seconds = expiresAt - issuedAt;

        value.expiresIn = expiresIn;

        const timeoutId = setTimeout(deleteKey, expiresIn * 1000);
        value.timeoutId = timeoutId;

        // Teach ClerkJS not to block the exit of the event loop when used in Node environments.
        // More info at https://nodejs.org/api/timers.html#timeoutunref
        if (typeof (timeoutId as any).unref === 'function') {
          (timeoutId as any).unref();
        }

        const channel = broadcastChannel;
        if (channel && options.broadcast) {
          const tokenRaw = newToken.getRawString();
          if (tokenRaw && claims.sid) {
            const sessionId = claims.sid;
            const organizationId = claims.org_id || (claims.o as any)?.id;
            const template = TokenId.extractTemplate(entry.tokenId, sessionId, organizationId);

            const expectedTokenId = TokenId.build(sessionId, template, organizationId);
            if (entry.tokenId === expectedTokenId) {
              const traceId = `bc_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

              debugLogger.info(
                'Broadcasting token update to other tabs',
                {
                  organizationId,
                  sessionId,
                  tabId,
                  template,
                  tokenId: entry.tokenId,
                  traceId,
                },
                'tokenCache',
              );

              const message: SessionTokenEvent = {
                organizationId,
                sessionId,
                template,
                tokenId: entry.tokenId,
                tokenRaw,
                traceId,
              };

              channel.postMessage(message);
            }
          }
        }
      })
      .catch(() => {
        deleteKey();
      });

    cache.set(key, value);
  };

  const close = () => {
    if (broadcastChannel) {
      broadcastChannel.close();
      broadcastChannel = null;
    }
  };

  const size = () => {
    return cache.size;
  };

  return { clear, close, get, set, size };
};

export const SessionTokenCache = MemoryTokenCache();
