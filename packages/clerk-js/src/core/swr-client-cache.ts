import type { ClientJSONSnapshot } from '@clerk/shared/types';

import { decode } from '../utils/jwt';
import { SafeLocalStorage } from '../utils/localStorage';

const CACHE_KEY_PREFIX = 'swr_client_';
const CACHE_TTL_MS = 24 * 60 * 60 * 1_000; // 24 hours
const CACHE_VERSION = 1;

interface CacheEnvelope {
  v: number;
  data: ClientJSONSnapshot;
}

function cacheKey(publishableKey: string): string {
  // Use last 8 chars of publishable key for scoping
  const suffix = publishableKey.slice(-8);
  return `${CACHE_KEY_PREFIX}${suffix}`;
}

/**
 * Strip sensitive and ephemeral data from a client snapshot before caching.
 * - lastActiveToken (JWT): expired quickly, looks like a credential, not needed for cache
 * - signIn/signUp: ephemeral auth flow state, dangerous when stale
 */
function sanitizeSnapshot(snapshot: ClientJSONSnapshot): ClientJSONSnapshot {
  return {
    ...snapshot,
    sign_in: null as any,
    sign_up: null as any,
    sessions: snapshot.sessions.map((session: ClientJSONSnapshot['sessions'][number]) => ({
      ...session,
      last_active_token: null,
    })),
  };
}

const TOKEN_SAFETY_MARGIN_S = 5; // match SessionCookiePoller interval

/**
 * Check if a raw JWT string is expiring within the safety margin.
 * Parses the payload without verification (we only need the exp claim).
 * Returns true if expired or expiring soon, false if still valid.
 */
export function isTokenExpiringSoon(jwt: string): boolean {
  try {
    const { claims } = decode(jwt);
    const remainingSeconds = (claims.exp as number) - Math.floor(Date.now() / 1000);
    return remainingSeconds <= TOKEN_SAFETY_MARGIN_S;
  } catch {
    return true; // unparseable = treat as expired
  }
}

export const SWRClientCache = {
  save(snapshot: ClientJSONSnapshot, publishableKey: string): void {
    // Don't cache synthetic JWT-derived clients
    if (snapshot.id === 'client_init') {
      return;
    }
    // Don't cache empty clients (signed out)
    if (!snapshot.sessions?.length) {
      return;
    }
    const sanitized = sanitizeSnapshot(snapshot);
    SafeLocalStorage.setItem(
      cacheKey(publishableKey),
      { v: CACHE_VERSION, data: sanitized } satisfies CacheEnvelope,
      CACHE_TTL_MS,
    );
  },

  read(publishableKey: string): ClientJSONSnapshot | null {
    const entry = SafeLocalStorage.getItem<CacheEnvelope | null>(cacheKey(publishableKey), null);
    if (!entry || entry.v !== CACHE_VERSION) return null;
    return entry.data;
  },

  clear(publishableKey: string): void {
    SafeLocalStorage.removeItem(cacheKey(publishableKey));
  },
};
