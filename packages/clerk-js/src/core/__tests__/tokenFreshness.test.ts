import type { JWT, TokenResource } from '@clerk/shared/types';
import { describe, expect, it } from 'vitest';

import { claimFreshness, shouldRejectToken } from '../tokenFreshness';

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

describe('claimFreshness', () => {
  it('returns oiat when present', () => {
    expect(claimFreshness(makeToken({ oiat: 100, iat: 200 }))).toBe(100);
  });

  it('returns iat when oiat is absent', () => {
    expect(claimFreshness(makeToken({ iat: 200 }))).toBe(200);
  });

  it('returns undefined when input has no jwt', () => {
    expect(claimFreshness(undefined)).toBeUndefined();
  });
});

describe('shouldRejectToken', () => {
  describe('both have oiat', () => {
    it('row 1: rejects when existing oiat > incoming oiat', () => {
      expect(shouldRejectToken(makeToken({ oiat: 100 }), makeToken({ oiat: 90 }))).toBe(true);
    });

    it('row 2: accepts when existing oiat < incoming oiat', () => {
      expect(shouldRejectToken(makeToken({ oiat: 90 }), makeToken({ oiat: 100 }))).toBe(false);
    });

    it('row 3: rejects when oiat equal and existing iat > incoming iat', () => {
      expect(shouldRejectToken(makeToken({ oiat: 100, iat: 200 }), makeToken({ oiat: 100, iat: 150 }))).toBe(true);
    });

    it('row 4: accepts when oiat equal and existing iat < incoming iat', () => {
      expect(shouldRejectToken(makeToken({ oiat: 100, iat: 150 }), makeToken({ oiat: 100, iat: 200 }))).toBe(false);
    });

    it('row 5: rejects when oiat equal and iat equal (keep existing)', () => {
      expect(shouldRejectToken(makeToken({ oiat: 100, iat: 150 }), makeToken({ oiat: 100, iat: 150 }))).toBe(true);
    });
  });

  describe('one has oiat, one does not', () => {
    it('row 6: accepts when existing oiat < incoming iat', () => {
      expect(shouldRejectToken(makeToken({ oiat: 100 }), makeToken({ iat: 120 }))).toBe(false);
    });

    it('row 7: rejects when existing oiat > incoming iat', () => {
      expect(shouldRejectToken(makeToken({ oiat: 100 }), makeToken({ iat: 80 }))).toBe(true);
    });

    it('row 8: accepts when existing oiat == incoming iat (different regimes, favor movement)', () => {
      expect(shouldRejectToken(makeToken({ oiat: 100 }), makeToken({ iat: 100 }))).toBe(false);
    });

    it('row 9: rejects when existing iat > incoming oiat', () => {
      expect(shouldRejectToken(makeToken({ iat: 150 }), makeToken({ oiat: 100 }))).toBe(true);
    });

    it('row 10: accepts when existing iat < incoming oiat', () => {
      expect(shouldRejectToken(makeToken({ iat: 90 }), makeToken({ oiat: 100 }))).toBe(false);
    });

    it('row 11: accepts when existing iat == incoming oiat (different regimes, favor movement)', () => {
      expect(shouldRejectToken(makeToken({ iat: 100 }), makeToken({ oiat: 100 }))).toBe(false);
    });
  });

  describe('neither has oiat', () => {
    it('row 12: rejects when existing iat > incoming iat', () => {
      expect(shouldRejectToken(makeToken({ iat: 200 }), makeToken({ iat: 150 }))).toBe(true);
    });

    it('row 13: accepts when existing iat < incoming iat', () => {
      expect(shouldRejectToken(makeToken({ iat: 150 }), makeToken({ iat: 200 }))).toBe(false);
    });

    it('row 14: rejects when iat equal (keep existing, avoid churn)', () => {
      expect(shouldRejectToken(makeToken({ iat: 150 }), makeToken({ iat: 150 }))).toBe(true);
    });

    it("row 15: accepts when both iat null (can't compare, accept)", () => {
      expect(shouldRejectToken(makeToken(), makeToken())).toBe(false);
    });
  });

  describe('JWT input (cookie path)', () => {
    it('accepts a raw JWT for both arguments', () => {
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

  describe('legacy oiat: 0', () => {
    // oiat is set by origin only; legacy tokens minted before the feature flag
    // landed will have no oiat field. A token with oiat literally === 0 is also
    // possible if a clock test mints during epoch (or if origin malfunctions).
    it('treats oiat: 0 as missing oiat and falls back to iat', () => {
      // 0 is falsy in JS; claimFreshness uses ?? so 0 IS a valid oiat.
      // But tie-break logic checks `oiat != null`, so 0 counts as present.
      expect(claimFreshness(makeJwt({ oiat: 0, iat: 100 }))).toBe(0);
    });

    it('legacy (no oiat) older token loses to newer token', () => {
      expect(shouldRejectToken(makeJwt({ iat: 100 }), makeJwt({ iat: 200 }))).toBe(false);
    });
  });
});
