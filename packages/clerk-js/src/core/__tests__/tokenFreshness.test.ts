import type { JWT, TokenResource } from '@clerk/shared/types';
import { describe, expect, it } from 'vitest';

import { shouldRejectToken } from '../tokenFreshness';

function makeToken(opts: { oiat?: number; iat?: number } = {}): TokenResource {
  return {
    jwt: {
      header: { alg: 'RS256', kid: 'kid_1', ...(opts.oiat != null ? { oiat: opts.oiat } : {}) },
      claims: { ...(opts.iat != null ? { iat: opts.iat } : {}) },
    },
    getRawString: () => 'mock-jwt',
  } as unknown as TokenResource;
}

function makeJwt(opts: { oiat?: number; iat?: number } = {}): JWT {
  return {
    header: { alg: 'RS256', kid: 'kid_1', ...(opts.oiat != null ? { oiat: opts.oiat } : {}) },
    claims: { ...(opts.iat != null ? { iat: opts.iat } : {}) },
  } as unknown as JWT;
}

describe('shouldRejectToken', () => {
  describe('both have oiat (the only reachable path post-rollout)', () => {
    it('rejects when existing oiat > incoming oiat', () => {
      expect(shouldRejectToken(makeToken({ oiat: 100 }), makeToken({ oiat: 90 }))).toBe(true);
    });

    it('accepts when existing oiat < incoming oiat', () => {
      expect(shouldRejectToken(makeToken({ oiat: 90 }), makeToken({ oiat: 100 }))).toBe(false);
    });

    it('rejects when oiat equal and existing iat > incoming iat', () => {
      expect(shouldRejectToken(makeToken({ oiat: 100, iat: 200 }), makeToken({ oiat: 100, iat: 150 }))).toBe(true);
    });

    it('accepts when oiat equal and existing iat < incoming iat', () => {
      expect(shouldRejectToken(makeToken({ oiat: 100, iat: 150 }), makeToken({ oiat: 100, iat: 200 }))).toBe(false);
    });

    it('rejects when oiat equal and iat equal (identical, keep existing)', () => {
      expect(shouldRejectToken(makeToken({ oiat: 100, iat: 150 }), makeToken({ oiat: 100, iat: 150 }))).toBe(true);
    });

    it('rejects when oiat equal and incoming iat missing (treats missing as 0, older)', () => {
      expect(shouldRejectToken(makeToken({ oiat: 100, iat: 150 }), makeToken({ oiat: 100 }))).toBe(true);
    });
  });

  describe('legacy (missing oiat) safety net', () => {
    // Origin emits oiat for all mints post-rollout. These cases protect against
    // a stale pre-rollout token lingering in a cookie or cache after upgrade.
    it('rejects an incoming legacy token (no oiat) when existing has oiat', () => {
      expect(shouldRejectToken(makeToken({ oiat: 100 }), makeToken({ iat: 9999 }))).toBe(true);
    });

    it('accepts an incoming oiat-bearing token when existing is legacy (no oiat)', () => {
      expect(shouldRejectToken(makeToken({ iat: 9999 }), makeToken({ oiat: 100 }))).toBe(false);
    });

    it('accepts incoming when both sides are legacy (cannot rank, safe default)', () => {
      expect(shouldRejectToken(makeToken({ iat: 200 }), makeToken({ iat: 100 }))).toBe(false);
    });
  });

  describe('JWT input (cookie path)', () => {
    it('accepts raw decoded JWT for both arguments', () => {
      expect(shouldRejectToken(makeJwt({ oiat: 100 }), makeJwt({ oiat: 200 }))).toBe(false);
      expect(shouldRejectToken(makeJwt({ oiat: 200 }), makeJwt({ oiat: 100 }))).toBe(true);
    });

    it('mixes TokenResource and raw JWT inputs', () => {
      expect(shouldRejectToken(makeToken({ oiat: 100 }), makeJwt({ oiat: 200 }))).toBe(false);
      expect(shouldRejectToken(makeJwt({ oiat: 200 }), makeToken({ oiat: 100 }))).toBe(true);
    });

    it('tie-breaks by iat on equal oiat for raw JWT inputs', () => {
      expect(shouldRejectToken(makeJwt({ oiat: 100, iat: 150 }), makeJwt({ oiat: 100, iat: 200 }))).toBe(false);
      expect(shouldRejectToken(makeJwt({ oiat: 100, iat: 200 }), makeJwt({ oiat: 100, iat: 150 }))).toBe(true);
    });
  });
});
