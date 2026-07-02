import type { TokenResource } from '@clerk/shared/types';

import { debugLogger } from '@/utils/debug';
import { TokenId } from '@/utils/tokenId';

import { POLLER_INTERVAL_IN_MS } from './auth/SessionCookiePoller';
import { createKeyResolver, type TokenCacheKeyJSON } from './keyResolver';
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
 * Internal cache value containing the entry, expiration metadata, and timers.
 */
interface TokenCacheValue {
  /**
   * Freshest claims-valid token observed for this key, chained across set() calls
   * and updated by every resolver settle, including resolvers replaced by a newer
   * set() while still pending. Internal bookkeeping only: readers only ever see
   * entry.resolvedToken, so a pending entry still reads as pending and callers
   * await its resolver. Folded into resolvedToken when the live entry resolves,
   * which is what keeps a staler resolve from overwriting a fresher token.
   */
  baseline?: TokenResource;
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

/**
 * Creates an in-memory token cache with optional BroadcastChannel synchronization across tabs.
 * Automatically manages token expiration and cleanup via scheduled timeouts.
 * BroadcastChannel support is enabled whenever the environment provides it.
 */
const MemoryTokenCache = (prefix?: string): TokenCache => {
  const store = createTokenStore<TokenCacheValue>();
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
    store.forEach(value => {
      if (value.timeoutId !== undefined) {
        clearTimeout(value.timeoutId);
      }
      if (value.refreshTimeoutId !== undefined) {
        clearTimeout(value.refreshTimeoutId);
      }
    });
    store.clear();
  };

  const get = (cacheKeyJSON: TokenCacheKeyJSON): TokenCacheGetResult | undefined => {
    ensureBroadcastChannel();

    const key = keyResolver.toKey(cacheKeyJSON);
    const value = store.get(key);

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
        const existingToken = result.entry.resolvedToken ?? (await result.entry.tokenResolver);
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

    // Clear timers from any existing entry for this key to prevent orphaned
    // refresh timers from accumulating across set() calls (e.g., from
    // #hydrateCache during _updateClient AND #refreshTokenInBackground).
    const existing = store.get(key);
    clearTimeout(existing?.timeoutId);
    clearTimeout(existing?.refreshTimeoutId);

    const nowSeconds = Math.floor(Date.now() / 1000);
    const createdAt = entry.createdAt ?? nowSeconds;
    const value: TokenCacheValue = { createdAt, entry, expiresIn: undefined };

    // Chain the freshest known token across replacements. This never touches
    // entry.resolvedToken: a pending entry reads as pending and callers await.
    const prior = existing?.entry.resolvedToken;
    value.baseline = prior ? pickFreshestJwt(existing?.baseline, prior) : existing?.baseline;

    // Clears both timers and drops the slot, but only if it still holds `target`
    // (a newer set() may have replaced it while a promise/timer was pending).
    const dropIfCurrent = (target: TokenCacheValue) => {
      if (store.get(key) !== target) {
        return;
      }
      clearTimeout(target.timeoutId);
      clearTimeout(target.refreshTimeoutId);
      store.delete(key);
    };

    store.set(key, value);

    entry.tokenResolver
      .then(newToken => {
        const live = store.get(key);
        if (!live) {
          // Cleared while pending; do not resurrect.
          return;
        }

        const claims = newToken.jwt?.claims;
        const isValid = !!claims && typeof claims.exp === 'number' && typeof claims.iat === 'number';
        const isOwn = live === value;

        if (isOwn && !isValid) {
          // The live slot's own fetch resolved unusable: drop the slot so the next
          // read refetches. Keeping the baseline alive here would hide a broken
          // token endpoint behind cache hits.
          dropIfCurrent(live);
          return;
        }
        if (!isValid) {
          return;
        }

        // Track the freshest token seen for this key, even when this resolver was
        // replaced by a newer set() while it was pending.
        const baseline = pickFreshestJwt(live.baseline, newToken);
        live.baseline = baseline;

        // resolvedToken is only written once the live slot itself resolves. While
        // the live slot is pending, readers must keep awaiting its resolver, so a
        // replaced resolver may only advance the baseline above.
        if (!isOwn && live.entry.resolvedToken === undefined) {
          return;
        }

        const winner = pickFreshestJwt(live.entry.resolvedToken, baseline);
        if (winner === live.entry.resolvedToken) {
          // Nothing advanced; the installed timers already match the winner.
          return;
        }
        live.entry.resolvedToken = winner;

        const winnerClaims = winner.jwt?.claims;
        if (!winnerClaims || typeof winnerClaims.exp !== 'number' || typeof winnerClaims.iat !== 'number') {
          dropIfCurrent(live);
          return;
        }

        clearTimeout(live.timeoutId);
        clearTimeout(live.refreshTimeoutId);

        const expiresAt = winnerClaims.exp;
        const issuedAt = winnerClaims.iat;
        const expiresIn: Seconds = expiresAt - issuedAt;

        live.createdAt = issuedAt;
        live.expiresIn = expiresIn;

        const timeoutId = setTimeout(() => dropIfCurrent(live), expiresIn * 1000);
        live.timeoutId = timeoutId;

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
        const refreshFireTime = expiresIn - leeway - refreshLeadTime;

        if (refreshFireTime > 0 && live.entry.onRefresh) {
          const refreshTimeoutId = setTimeout(() => {
            live.entry.onRefresh?.();
          }, refreshFireTime * 1000);

          live.refreshTimeoutId = refreshTimeoutId;

          if (typeof (refreshTimeoutId as any).unref === 'function') {
            (refreshTimeoutId as any).unref();
          }
        }

        const channel = broadcastChannel;
        if (channel && options.broadcast) {
          // Best-effort side effect: a broadcast failure (e.g. postMessage racing a
          // channel close) must not reach the outer catch and evict the cached token (SDK-119).
          try {
            const tokenRaw = winner.getRawString();
            if (tokenRaw && winnerClaims.sid) {
              const sessionId = winnerClaims.sid;
              const organizationId = winnerClaims.org_id || (winnerClaims.o as any)?.id;
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
        dropIfCurrent(value);
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
