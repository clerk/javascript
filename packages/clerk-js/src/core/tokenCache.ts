import type { TokenResource } from '@clerk/shared/types';

import { debugLogger } from '@/utils/debug';
import { TokenId } from '@/utils/tokenId';

import { POLLER_INTERVAL_IN_MS } from './auth/SessionCookiePoller';
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
   * Seconds before token expiration when background refresh should be triggered.
   * Defaults to BACKGROUND_REFRESH_THRESHOLD_IN_SECONDS if not provided.
   */
  leewayInSeconds?: Seconds;
  /**
   * Callback to refresh this token before it expires.
   * Called by the proactive refresh timer to trigger background refresh.
   * If not provided, no refresh timer will be scheduled (e.g., for broadcast-received tokens).
   */
  onRefresh?: () => void;
  /**
   * The resolved token value for synchronous reads.
   * Populated after tokenResolver resolves. Check this first to avoid microtask overhead.
   */
  resolvedToken?: TokenResource;
  /**
   * Promise that resolves to the TokenResource.
   * May be pending and should be awaited before accessing token data.
   */
  tokenResolver: Promise<TokenResource>;
}

type Seconds = number;

/**
 * Internal cache value containing the entry, expiration metadata, and timers.
 */
interface TokenCacheValue {
  createdAt: Seconds;
  entry: TokenCacheEntry;
  expiresIn?: Seconds;
  /** Timer for automatic cache cleanup when token expires */
  timeoutId?: ReturnType<typeof setTimeout>;
  /** Timer for proactive refresh before token enters leeway period */
  refreshTimeoutId?: ReturnType<typeof setTimeout>;
}

/**
 * Result from cache lookup containing the entry.
 */
export interface TokenCacheGetResult {
  entry: TokenCacheEntry;
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
   * Retrieves a cached token entry if it exists and is safe to use.
   * Forces synchronous refresh if token has less than one poller interval remaining.
   * Proactive refresh is handled by timers scheduled when tokens are cached.
   *
   * @param cacheKeyJSON - Object containing tokenId and optional audience to identify the cached entry
   * @returns Result with entry, or undefined if token is missing/expired/too close to expiration
   */
  get(cacheKeyJSON: TokenCacheKeyJSON): TokenCacheGetResult | undefined;

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

/**
 * Default seconds before token expiration to trigger background refresh.
 * This threshold accounts for timer jitter, SafeLock contention (~5s), network latency,
 * and tolerance for missed poller ticks.
 *
 * Users can customize this value:
 * - Lower values (min: 5s) delay background refresh until closer to expiration
 * - Higher values trigger earlier background refresh but may cause more frequent requests
 */
const BACKGROUND_REFRESH_THRESHOLD_IN_SECONDS = 15;

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
 * BroadcastChannel support is enabled whenever the environment provides it.
 */
const MemoryTokenCache = (prefix = KEY_PREFIX): TokenCache => {
  const cache = new Map<string, TokenCacheValue>();
  const tabId = generateTabId();

  let broadcastChannel: BroadcastChannel | null = null;

  const ensureBroadcastChannel = (): BroadcastChannel | null => {
    if (broadcastChannel) {
      return broadcastChannel;
    }

    if (typeof BroadcastChannel === 'undefined') {
      return null;
    }

    broadcastChannel = new BroadcastChannel('clerk:session_token');
    broadcastChannel.addEventListener('message', (e: MessageEvent<SessionTokenEvent>) => {
      void handleBroadcastMessage(e);
    });

    return broadcastChannel;
  };

  ensureBroadcastChannel();

  const clear = () => {
    cache.forEach(value => {
      if (value.timeoutId !== undefined) {
        clearTimeout(value.timeoutId);
      }
      if (value.refreshTimeoutId !== undefined) {
        clearTimeout(value.refreshTimeoutId);
      }
    });
    cache.clear();
  };

  const get = (cacheKeyJSON: TokenCacheKeyJSON): TokenCacheGetResult | undefined => {
    ensureBroadcastChannel();

    const cacheKey = new TokenCacheKey(prefix, cacheKeyJSON);
    const value = cache.get(cacheKey.toKey());

    if (!value) {
      return;
    }

    const nowSeconds = Math.floor(Date.now() / 1000);
    const elapsed = nowSeconds - value.createdAt;
    const remainingTtl = (value.expiresIn ?? Infinity) - elapsed;

    // Token expired or dangerously close to expiration - force synchronous refresh
    // Uses poller interval as threshold since the poller might not get to it in time
    if (remainingTtl <= POLLER_INTERVAL_IN_MS / 1000) {
      if (value.timeoutId !== undefined) {
        clearTimeout(value.timeoutId);
      }
      if (value.refreshTimeoutId !== undefined) {
        clearTimeout(value.refreshTimeoutId);
      }
      cache.delete(cacheKey.toKey());
      return;
    }

    // Proactive refresh is handled by timers scheduled in setInternal()
    return { entry: value.entry };
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
      const result = get({ tokenId: data.tokenId });
      if (result) {
        const existingToken = await result.entry.tokenResolver;
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
        if (cachedValue.refreshTimeoutId !== undefined) {
          clearTimeout(cachedValue.refreshTimeoutId);
        }
        cache.delete(key);
      }
    };

    entry.tokenResolver
      .then(newToken => {
        // Store resolved token for synchronous reads
        entry.resolvedToken = newToken;

        const claims = newToken.jwt?.claims;
        if (!claims || typeof claims.exp !== 'number' || typeof claims.iat !== 'number') {
          return deleteKey();
        }

        const expiresAt = claims.exp;
        const issuedAt = claims.iat;
        const expiresIn: Seconds = expiresAt - issuedAt;

        value.createdAt = issuedAt;
        value.expiresIn = expiresIn;

        const timeoutId = setTimeout(deleteKey, expiresIn * 1000);
        value.timeoutId = timeoutId;

        // Teach ClerkJS not to block the exit of the event loop when used in Node environments.
        // More info at https://nodejs.org/api/timers.html#timeoutunref
        if (typeof (timeoutId as any).unref === 'function') {
          (timeoutId as any).unref();
        }

        // Schedule proactive refresh timer to fire before token enters leeway period
        // This ensures new tokens are ready before the old one expires
        const refreshLeadTime = 2; // Fire 2s before leeway starts
        const minLeeway = POLLER_INTERVAL_IN_MS / 1000; // Minimum is poller interval (5s)
        const leeway = Math.max(entry.leewayInSeconds ?? BACKGROUND_REFRESH_THRESHOLD_IN_SECONDS, minLeeway);
        const refreshFireTime = expiresIn - leeway - refreshLeadTime;

        if (refreshFireTime > 0 && entry.onRefresh) {
          const refreshTimeoutId = setTimeout(() => {
            entry.onRefresh?.();
          }, refreshFireTime * 1000);

          value.refreshTimeoutId = refreshTimeoutId;

          if (typeof (refreshTimeoutId as any).unref === 'function') {
            (refreshTimeoutId as any).unref();
          }
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
