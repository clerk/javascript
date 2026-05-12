import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MachineTokenVerificationError, MachineTokenVerificationErrorCode } from '../../errors';
import {
  isOAuthTokenCachedAsInvalid,
  makeCachedInvalidOAuthTokenError,
  maybeCacheOAuthTokenAsInvalid,
  resetOAuthNegativeCache,
} from '../oauthNegativeCache';

const TOKEN = 'oat_abc123';
const ANOTHER_TOKEN = 'oat_xyz789';

function makeTokenInvalidError() {
  return new MachineTokenVerificationError({
    message: 'OAuth token not found',
    code: MachineTokenVerificationErrorCode.TokenInvalid,
    status: 404,
  });
}

function makeOtherError() {
  return new MachineTokenVerificationError({
    message: 'Invalid secret key',
    code: MachineTokenVerificationErrorCode.InvalidSecretKey,
    status: 401,
  });
}

describe('oauthNegativeCache', () => {
  beforeEach(() => {
    resetOAuthNegativeCache();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('isOAuthTokenCachedAsInvalid', () => {
    it('returns false for a token that has never been cached', () => {
      expect(isOAuthTokenCachedAsInvalid(TOKEN)).toBe(false);
    });

    it('returns true for a token cached as invalid', () => {
      maybeCacheOAuthTokenAsInvalid(makeTokenInvalidError(), TOKEN);
      expect(isOAuthTokenCachedAsInvalid(TOKEN)).toBe(true);
    });

    it('returns false for a different token not in the cache', () => {
      maybeCacheOAuthTokenAsInvalid(makeTokenInvalidError(), TOKEN);
      expect(isOAuthTokenCachedAsInvalid(ANOTHER_TOKEN)).toBe(false);
    });

    it('returns false and evicts the entry after TTL expires', () => {
      maybeCacheOAuthTokenAsInvalid(makeTokenInvalidError(), TOKEN);
      expect(isOAuthTokenCachedAsInvalid(TOKEN)).toBe(true);

      vi.advanceTimersByTime(30_001);

      expect(isOAuthTokenCachedAsInvalid(TOKEN)).toBe(false);
    });

    it('returns true just before TTL expires', () => {
      maybeCacheOAuthTokenAsInvalid(makeTokenInvalidError(), TOKEN);
      vi.advanceTimersByTime(29_999);
      expect(isOAuthTokenCachedAsInvalid(TOKEN)).toBe(true);
    });
  });

  describe('maybeCacheOAuthTokenAsInvalid', () => {
    it('caches when error is TokenInvalid', () => {
      maybeCacheOAuthTokenAsInvalid(makeTokenInvalidError(), TOKEN);
      expect(isOAuthTokenCachedAsInvalid(TOKEN)).toBe(true);
    });

    it('does not cache when error is a different MachineTokenVerificationError code', () => {
      maybeCacheOAuthTokenAsInvalid(makeOtherError(), TOKEN);
      expect(isOAuthTokenCachedAsInvalid(TOKEN)).toBe(false);
    });

    it('does not cache when error is not a MachineTokenVerificationError', () => {
      maybeCacheOAuthTokenAsInvalid(new Error('network failure'), TOKEN);
      expect(isOAuthTokenCachedAsInvalid(TOKEN)).toBe(false);
    });

    it('does not cache when error is null', () => {
      maybeCacheOAuthTokenAsInvalid(null, TOKEN);
      expect(isOAuthTokenCachedAsInvalid(TOKEN)).toBe(false);
    });

    it('updates the expiry when caching the same token again', () => {
      maybeCacheOAuthTokenAsInvalid(makeTokenInvalidError(), TOKEN);

      vi.advanceTimersByTime(20_000);
      maybeCacheOAuthTokenAsInvalid(makeTokenInvalidError(), TOKEN);

      vi.advanceTimersByTime(20_000);
      // 40s total since first cache, but only 20s since re-cache; should still be valid
      expect(isOAuthTokenCachedAsInvalid(TOKEN)).toBe(true);

      vi.advanceTimersByTime(10_001);
      // 30s since re-cache; should now expire
      expect(isOAuthTokenCachedAsInvalid(TOKEN)).toBe(false);
    });
  });

  describe('makeCachedInvalidOAuthTokenError', () => {
    it('returns a MachineTokenVerificationError with TokenInvalid code', () => {
      const err = makeCachedInvalidOAuthTokenError();
      expect(err).toBeInstanceOf(MachineTokenVerificationError);
      expect(err.code).toBe(MachineTokenVerificationErrorCode.TokenInvalid);
    });

    it('returns an error with status 404', () => {
      const err = makeCachedInvalidOAuthTokenError();
      expect(err.status).toBe(404);
    });
  });

  describe('resetOAuthNegativeCache', () => {
    it('clears all cached entries', () => {
      maybeCacheOAuthTokenAsInvalid(makeTokenInvalidError(), TOKEN);
      maybeCacheOAuthTokenAsInvalid(makeTokenInvalidError(), ANOTHER_TOKEN);
      resetOAuthNegativeCache();
      expect(isOAuthTokenCachedAsInvalid(TOKEN)).toBe(false);
      expect(isOAuthTokenCachedAsInvalid(ANOTHER_TOKEN)).toBe(false);
    });
  });

  describe('capacity eviction', () => {
    it('evicts the oldest entry when the cache reaches MAX_ENTRIES (10,000)', () => {
      // Fill the cache to max capacity
      for (let i = 0; i < 10_000; i++) {
        maybeCacheOAuthTokenAsInvalid(makeTokenInvalidError(), `oat_token_${i}`);
      }

      expect(isOAuthTokenCachedAsInvalid('oat_token_0')).toBe(true);

      // Adding one more should evict oat_token_0 (the oldest)
      maybeCacheOAuthTokenAsInvalid(makeTokenInvalidError(), 'oat_overflow');

      expect(isOAuthTokenCachedAsInvalid('oat_token_0')).toBe(false);
      expect(isOAuthTokenCachedAsInvalid('oat_overflow')).toBe(true);
    });
  });
});
