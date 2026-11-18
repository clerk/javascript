import type { TokenResource } from '@clerk/shared/types';

import { debugLogger } from '@/utils/debug';
import { TokenId } from '@/utils/tokenId';

import { POLLER_INTERVAL_IN_MS } from './auth/SessionCookiePoller';
import { createKeyResolver, type TokenCacheKeyJSON } from './keyResolver';
import { Token } from './resources/internal';
import { pickFreshestJwt } from './tokenFreshness';
import { createTokenStore } from './tokenStore';

/**
 * Parameters for set(): the cache key, the token resolver, and an optional refresh callback.
 */
interface TokenCacheSetParams extends TokenCacheKeyJSON {
  /**
   * Callback to refresh this token before it expires.
   * Called by the proactive refresh timer to trigger background refresh.
   * If not provided, no refresh timer will be scheduled (e.g., for broadcast-received tokens).
   */
  onRefresh?: () => void;
  /**
   * Promise that resolves to the TokenResource.
   * May be pending and should be awaited before accessing token data.
   */
  tokenResolver: Promise<TokenResource>;
}

type Seconds = number;

interface TokenWithExpiry {
  expiresAt: Seconds;
  token: TokenResource;
}

/**
 * Internal per-key cache entry containing the latest set() params, the freshest known token, and timers.
 */
interface TokenCacheEntry {
  /**
   * Freshest claims-valid token observed for this key, with its expiry fixed when
   * the cache first saw it for as long as the cache holds it, chained across set()
   * calls and updated by every resolver settle, including resolvers replaced by a
   * newer set() while still pending. Readers only see it once the entry stops being
   * pending, so a pending entry still reads as pending and callers await its
   * resolver. Comparing the entry's own resolve against it is what keeps a staler
   * resolve from overwriting a fresher token.
   */
  freshestKnown?: TokenWithExpiry;
  createdAt: Seconds;
  isPending: boolean;
  params: TokenCacheSetParams;
  /** Timer for automatic cache cleanup when token expires */
  timeoutId?: ReturnType<typeof setTimeout>;
  /** Timer for proactive refresh before token enters leeway period */
  refreshTimeoutId?: ReturnType<typeof setTimeout>;
}

/**
 * Result from cache lookup containing the token, or its resolver while the entry is pending.
 */
export interface TokenCacheHit {
  /**
   * The resolved token value for synchronous reads.
   * Populated after tokenResolver resolves. Check this first to avoid microtask overhead.
   */
  token?: TokenResource;
  /**
   * Promise that resolves to the TokenResource.
   * May be pending and should be awaited when token is not populated.
   */
  tokenResolver: Promise<TokenResource>;
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
   * @returns Result with the token or its resolver, or undefined if token is missing/expired/too close to expiration
   */
  get(cacheKeyJSON: TokenCacheKeyJSON): TokenCacheHit | undefined;

  /**
   * Stores a token entry in the cache and broadcasts to other tabs when the token resolves.
   *
   * @param params - TokenCacheSetParams containing tokenId, tokenResolver, and optional audience
   * Side effects: Schedules automatic expiration cleanup, broadcasts to other tabs when token resolves
   */
  set(params: TokenCacheSetParams): void;

  /**
   * Returns the current number of cached entries.
   *
   * @returns The count of entries currently stored in the cache
   */
  size(): number;
}

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

const pickFreshest = (existing: TokenWithExpiry | undefined, incoming: TokenWithExpiry): TokenWithExpiry => {
  if (!existing) {
    return incoming;
  }
  if (existing.token.getRawString() === incoming.token.getRawString()) {
    return existing.expiresAt <= incoming.expiresAt ? existing : incoming;
  }
  return pickFreshestJwt(existing.token, incoming.token) === existing.token ? existing : incoming;
};

/**
 * Creates an in-memory token cache with optional BroadcastChannel synchronization across tabs.
 * Automatically manages token expiration and cleanup via scheduled timeouts.
 * BroadcastChannel support is enabled whenever the environment provides it.
 */
const MemoryTokenCache = (prefix?: string): TokenCache => {
  const store = createTokenStore<TokenCacheEntry>();
  const keyResolver = createKeyResolver(prefix);
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
    store.forEach(entry => {
      if (entry.timeoutId !== undefined) {
        clearTimeout(entry.timeoutId);
      }
      if (entry.refreshTimeoutId !== undefined) {
        clearTimeout(entry.refreshTimeoutId);
      }
    });
    store.clear();
  };

  const get = (cacheKeyJSON: TokenCacheKeyJSON): TokenCacheHit | undefined => {
    ensureBroadcastChannel();

    const key = keyResolver.toKey(cacheKeyJSON);
    const entry = store.get(key);

    if (!entry) {
      return;
    }

    const served = entry.isPending ? undefined : entry.freshestKnown;
    const remainingTtl = (served?.expiresAt ?? Infinity) - Math.floor(Date.now() / 1000);

    // Token expired or dangerously close to expiration - force synchronous refresh
    // Uses poller interval as threshold since the poller might not get to it in time
    if (remainingTtl <= POLLER_INTERVAL_IN_MS / 1000) {
      if (entry.timeoutId !== undefined) {
        clearTimeout(entry.timeoutId);
      }
      if (entry.refreshTimeoutId !== undefined) {
        clearTimeout(entry.refreshTimeoutId);
      }
      store.delete(key);
      return;
    }

    // Proactive refresh is handled by timers scheduled in setInternal()
    return { token: served?.token, tokenResolver: entry.params.tokenResolver };
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
        const existingToken = result.token ?? (await result.tokenResolver);
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
        tokenId: data.tokenId,
        tokenResolver: Promise.resolve(token),
      },
      NO_BROADCAST,
    );
  };

  const set = (params: TokenCacheSetParams) => {
    ensureBroadcastChannel();

    setInternal(params, BROADCAST);
  };

  /**
   * Internal cache setter that stores an entry and schedules expiration cleanup.
   * Resolves the token promise to extract expiration claims and set a deletion timeout.
   *
   * @param params - The set() params to store
   * @param options - Configuration for cache behavior; broadcast controls whether to notify other tabs
   */
  const setInternal = (params: TokenCacheSetParams, options: { broadcast: boolean } = BROADCAST) => {
    const key = keyResolver.toKey({
      audience: params.audience,
      tokenId: params.tokenId,
    });

    // Clear timers from any existing entry for this key to prevent orphaned
    // refresh timers from accumulating across set() calls (e.g., from
    // #hydrateCache during _updateClient AND #refreshTokenInBackground).
    const previousEntry = store.get(key);
    clearTimeout(previousEntry?.timeoutId);
    clearTimeout(previousEntry?.refreshTimeoutId);

    const ownEntry: TokenCacheEntry = { createdAt: Math.floor(Date.now() / 1000), isPending: true, params };

    // Chain the freshest known token across replacements. The new entry still
    // starts pending: a pending entry reads as pending and callers await.
    ownEntry.freshestKnown = previousEntry?.freshestKnown;

    // Clears both timers and drops `target`, but only if the key still holds it
    // (a newer set() may have replaced it while a promise/timer was pending).
    const dropIfCurrent = (target: TokenCacheEntry) => {
      if (store.get(key) !== target) {
        return;
      }
      clearTimeout(target.timeoutId);
      clearTimeout(target.refreshTimeoutId);
      store.delete(key);
    };

    store.set(key, ownEntry);

    params.tokenResolver
      .then(newToken => {
        const liveEntry = store.get(key);
        if (!liveEntry) {
          // Cleared while pending; do not resurrect.
          return;
        }

        const claims = newToken.jwt?.claims;
        const isValid = !!claims && typeof claims.exp === 'number' && typeof claims.iat === 'number';
        const isOwn = liveEntry === ownEntry;

        if (isOwn && !isValid) {
          // The live entry's own fetch resolved unusable: drop the entry so the next
          // read refetches. Keeping the freshest token alive here would hide a broken
          // token endpoint behind cache hits.
          dropIfCurrent(liveEntry);
          return;
        }
        if (!isValid) {
          return;
        }

        // `exp` is server time, so reading it on the device clock is late by the
        // device's lag. A full lifetime from cache insert is late by the token's age
        // on arrival. The earlier of the two is late only by the smaller error.
        const candidate: TokenWithExpiry = {
          expiresAt: Math.min(claims.exp, ownEntry.createdAt + claims.exp - claims.iat),
          token: newToken,
        };

        // Track the freshest token seen for this key, even when this resolver was
        // replaced by a newer set() while it was pending.
        const previous = liveEntry.freshestKnown;
        const winner = pickFreshest(previous, candidate);
        liveEntry.freshestKnown = winner;

        // The token is only served once the live entry itself resolves. While
        // the live entry is pending, readers must keep awaiting its resolver, so a
        // replaced resolver may only advance the freshest token above.
        if (!isOwn && liveEntry.isPending) {
          return;
        }

        if (!liveEntry.isPending && winner === previous) {
          // Nothing advanced; the installed timers already match the winner.
          return;
        }
        liveEntry.isPending = false;

        clearTimeout(liveEntry.timeoutId);
        clearTimeout(liveEntry.refreshTimeoutId);

        const remainingTtl: Seconds = winner.expiresAt - Math.floor(Date.now() / 1000);

        if (remainingTtl <= 0) {
          dropIfCurrent(liveEntry);
          return;
        }

        const timeoutId = setTimeout(() => dropIfCurrent(liveEntry), remainingTtl * 1000);
        liveEntry.timeoutId = timeoutId;

        // Teach ClerkJS not to block the exit of the event loop when used in Node environments.
        // More info at https://nodejs.org/api/timers.html#timeoutunref
        if (typeof (timeoutId as any).unref === 'function') {
          (timeoutId as any).unref();
        }

        // Schedule proactive refresh timer to fire before token enters leeway period
        // This ensures new tokens are ready before the old one expires
        // refreshLeadTime: 2s buffer before leeway starts. Token fetches typically complete in ~100ms,
        // so 2s provides ample margin for the refresh to complete before the token enters the leeway period.
        const refreshLeadTime = 2;
        const minLeeway = POLLER_INTERVAL_IN_MS / 1000; // Minimum is poller interval (5s)
        const leeway = Math.max(BACKGROUND_REFRESH_THRESHOLD_IN_SECONDS, minLeeway);
        const refreshFireTime = remainingTtl - leeway - refreshLeadTime;

        if (refreshFireTime > 0 && liveEntry.params.onRefresh) {
          const refreshTimeoutId = setTimeout(() => {
            liveEntry.params.onRefresh?.();
          }, refreshFireTime * 1000);

          liveEntry.refreshTimeoutId = refreshTimeoutId;

          if (typeof (refreshTimeoutId as any).unref === 'function') {
            (refreshTimeoutId as any).unref();
          }
        }

        const channel = broadcastChannel;
        if (channel && options.broadcast) {
          // Best-effort side effect: a broadcast failure (e.g. postMessage racing a
          // channel close) must not reach the outer catch and evict the cached token (SDK-119).
          try {
            const tokenRaw = winner.token.getRawString();
            const winnerClaims = winner.token.jwt?.claims;
            if (tokenRaw && winnerClaims?.sid) {
              const sessionId = winnerClaims.sid;
              const organizationId = winnerClaims.org_id || (winnerClaims.o as any)?.id;
              const template = TokenId.extractTemplate(params.tokenId, sessionId, organizationId);

              const expectedTokenId = TokenId.build(sessionId, template, organizationId);
              if (params.tokenId === expectedTokenId) {
                const traceId = `bc_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

                debugLogger.info(
                  'Broadcasting token update to other tabs',
                  {
                    organizationId,
                    sessionId,
                    tabId,
                    template,
                    tokenId: params.tokenId,
                    traceId,
                  },
                  'tokenCache',
                );

                const message: SessionTokenEvent = {
                  organizationId,
                  sessionId,
                  template,
                  tokenId: params.tokenId,
                  tokenRaw,
                  traceId,
                };

                channel.postMessage(message);
              }
            }
          } catch (error) {
            debugLogger.warn(
              'Failed to broadcast token update to other tabs',
              { error, tabId, tokenId: params.tokenId },
              'tokenCache',
            );
          }
        }
      })
      .catch(() => {
        dropIfCurrent(ownEntry);
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
