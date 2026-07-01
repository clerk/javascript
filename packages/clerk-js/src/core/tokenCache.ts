import type { TokenResource } from '@clerk/shared/types';

import { debugLogger } from '@/utils/debug';
import { TokenId } from '@/utils/tokenId';

import { POLLER_INTERVAL_IN_MS } from './auth/SessionCookiePoller';
import { createKeyResolver, type TokenCacheKeyJSON } from './keyResolver';
import { type Clock, createRefreshScheduler, systemClock } from './refreshScheduler';
import { Token } from './resources/internal';
import { pickFreshestJwt } from './tokenFreshness';
import { createTokenStore } from './tokenStore';

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
 * Internal cache value containing the entry and expiration metadata. Timers are
 * owned by the {@link RefreshScheduler}, keyed by the same cache key.
 */
interface TokenCacheValue {
  createdAt: Seconds;
  entry: TokenCacheEntry;
  expiresIn?: Seconds;
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

const BROADCAST = { broadcast: true };
const NO_BROADCAST = { broadcast: false };

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
const MemoryTokenCache = (prefix?: string, clock: Clock = systemClock): TokenCache => {
  const store = createTokenStore<TokenCacheValue>();
  const keyResolver = createKeyResolver(prefix);
  const scheduler = createRefreshScheduler(clock);
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
    scheduler.cancelAll();
    store.clear();
  };

  const get = (cacheKeyJSON: TokenCacheKeyJSON): TokenCacheGetResult | undefined => {
    ensureBroadcastChannel();

    const key = keyResolver.toKey(cacheKeyJSON);
    const value = store.get(key);

    if (!value) {
      return;
    }

    const nowSeconds = Math.floor(clock.now());
    const elapsed = nowSeconds - value.createdAt;
    const remainingTtl = (value.expiresIn ?? Infinity) - elapsed;

    // Token expired or dangerously close to expiration - force synchronous refresh
    // Uses poller interval as threshold since the poller might not get to it in time
    if (remainingTtl <= POLLER_INTERVAL_IN_MS / 1000) {
      scheduler.cancel(key);
      store.delete(key);
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
        if (pickFreshestJwt(existingToken, token) === existingToken) {
          debugLogger.debug(
            'Ignoring staler token broadcast',
            { tokenId: data.tokenId, traceId: data.traceId },
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
    const key = keyResolver.toKey({
      audience: entry.audience,
      tokenId: entry.tokenId,
    });

    // Cancel timers from any existing entry for this key to prevent orphaned
    // refresh timers from accumulating across set() calls (e.g., from
    // #hydrateCache during _updateClient AND #refreshTokenInBackground).
    scheduler.cancel(key);

    const nowSeconds = Math.floor(clock.now());
    const createdAt = entry.createdAt ?? nowSeconds;
    const value: TokenCacheValue = { createdAt, entry, expiresIn: undefined };

    // Cancel inside the identity guard: deleteKey is also the resolver chain's
    // .catch handler, so a stale rejected resolver must not cancel a newer
    // entry's live timers.
    const deleteKey = () => {
      if (store.get(key) === value) {
        scheduler.cancel(key);
        store.delete(key);
      }
    };

    store.set(key, value);

    entry.tokenResolver
      .then(newToken => {
        // If this entry was overwritten by a newer set() call while our promise
        // was pending, bail out to avoid installing orphaned timers. Monotonic
        // replacement is enforced at the read sites (cookie + broadcast + Session)
        // where the user-visible state lives.
        if (store.get(key) !== value) {
          return;
        }

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

        // Arm the expiration-cleanup and proactive-refresh timers. Fire points are
        // recomputed against the wall clock from the absolute expiry, so a token
        // issued before this tab loaded refreshes at its true expiry rather than
        // a full TTL from now.
        scheduler.schedule(key, { expiresAt, onExpire: deleteKey, onRefresh: entry.onRefresh });

        const channel = broadcastChannel;
        if (channel && options.broadcast) {
          // Best-effort side effect: a broadcast failure (e.g. postMessage racing a
          // channel close) must not reach the outer catch and evict the cached token (SDK-119).
          try {
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
          } catch (error) {
            debugLogger.warn(
              'Failed to broadcast token update to other tabs',
              { error, tabId, tokenId: entry.tokenId },
              'tokenCache',
            );
          }
        }
      })
      .catch(() => {
        deleteKey();
      });
  };

  const close = () => {
    if (broadcastChannel) {
      broadcastChannel.close();
      broadcastChannel = null;
    }
  };

  const size = () => {
    return store.size();
  };

  return { clear, close, get, set, size };
};

export const SessionTokenCache = MemoryTokenCache();
